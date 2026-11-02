import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ESCALATION_MIN,
  isCookerLeftOn,
  isFoodBurning,
  kgLeft,
  remainingPct,
  daysLeft,
  normalize,
  postAlertResolve,
  refillSignal,
  sendHighPriorityPush,
  serialsMatch,
  tripleMatch,
  validationVerdict,
} from "./lib/gassafe.js";
import { ASSIGNMENTS, DISTRICTS, NATIONAL, OFFICER, REGIONS, mapsUrl, timeAgo } from "./data/seed.js";
import AlarmOverlay, { escalateAlarm } from "./components/AlarmOverlay.jsx";

const LS_KEY = "gnfs-field-v1";
const SENSORS = ["ALL", "FIRE", "SMOKE", "LEAK", "BURST", "HEAT", "COOK"];
const CATS = ["ALL", "HOME", "COMMERCIAL"];
const FLOW = ["PENDING", "EN_ROUTE", "ON_SCENE", "RESOLVED"];
const FLOW_LABEL = { PENDING: "Pending", EN_ROUTE: "En route", ON_SCENE: "On scene", RESOLVED: "Resolved" };

const RESOLVE_ACTION = {
  LEAK: "LEAK resolved — valve closed, area ventilated (photo of closed valve)",
  BURST: "BURST resolved — cylinder removed to safe point (photo)",
  FIRE: "FIRE resolved — fire out, overhaul done (photo)",
  SMOKE: "SMOKE resolved — source cleared, smoke dissipated (photo)",
  HEAT: "HEAT resolved — cylinder cooled below 70C, relocated to shade (photo)",
  COOK: "COOK resolved — cooker off, occupant briefed (photo)",
};

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function VerdictBadge({ verdict, big }) {
  return (
    <span className={verdict.match ? "badge green" + (big ? " big" : "") : "badge red" + (big ? " big" : "")}>
      {verdict.match ? "GREEN MATCH" : "RED FRAUD"}
    </span>
  );
}

function ConnStrip({ a }) {
  const g = a.gateway || {};
  return (
    <div className="conn-strip">
      <span>Floor last seen {timeAgo(a.lastSeenMinAgo)} · LoRa {a.floorRssi}dBm · Batt {a.floorBattery}%</span>
      <span>Ceiling heartbeat {timeAgo(a.heartbeatMinAgo)} · WiFi {g.wifi || "—"} · Cellular {g.cellular || "—"} {g.sim ? `(${g.sim})` : ""} · LoRa {g.lora || "—"}</span>
    </div>
  );
}

export default function App() {
  const [store, setStore] = useState(loadStore);
  const [tab, setTab] = useState("assign");
  const [fSensor, setFSensor] = useState("ALL");
  const [fCat, setFCat] = useState("ALL");
  const [fRegion, setFRegion] = useState("ALL");
  const [fDistrict, setFDistrict] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("FO-001");
  const [alarm, setAlarm] = useState(null);
  const [pushOn, setPushOn] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(store)); } catch { /* full — keep running */ }
  }, [store]);

  const merged = useMemo(
    () => ASSIGNMENTS.map((a) => ({ ...a, ...(store[a.id] || {}) })),
    [store]
  );
  const byId = useMemo(() => Object.fromEntries(merged.map((a) => [a.id, a])), [merged]);
  const selected = byId[selectedId] || merged[0];

  const say = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }, []);

  const patch = useCallback((id, p) => {
    setStore((s) => ({ ...s, [id]: { ...(s[id] || {}), ...p } }));
  }, []);

  const log = useCallback((id, text) => {
    setStore((s) => {
      const prev = s[id] || {};
      const trail = [...(prev.trail || []), `${new Date().toLocaleTimeString()} ${text}`];
      return { ...s, [id]: { ...prev, trail } };
    });
  }, []);

  const districtsFor = fRegion === "ALL" ? Object.values(DISTRICTS).flat() : DISTRICTS[fRegion] || [];

  const filtered = useMemo(() => {
    const q = normalize(query).replace(/[\s-]/g, "");
    return merged.filter((a) => {
      if (a.status === "RESOLVED") return false;
      if (fSensor !== "ALL" && a.sensor !== fSensor) return false;
      if (fCat !== "ALL" && a.category !== fCat) return false;
      if (fRegion !== "ALL" && a.region !== fRegion) return false;
      if (fDistrict !== "ALL" && a.district !== fDistrict) return false;
      if (q) {
        const hay = [a.digitalAddress, a.npaCode, a.serial, a.footRingSerial, a.qrSerial]
          .map((s) => normalize(s).replace(/[\s-]/g, "")).join(" ");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [merged, fSensor, fCat, fRegion, fDistrict, query]);

  const history = useMemo(() => merged.filter((a) => a.status === "RESOLVED"), [merged]);
  const outboxCount = useMemo(
    () => merged.filter((a) => a.resolution && a.resolution.synced === false).length,
    [merged]
  );

  const setStatus = useCallback((id, status) => {
    patch(id, { status, dispatch: status === "PENDING" ? null : { by: OFFICER.id, at: new Date().toISOString() } });
    log(id, `status -> ${FLOW_LABEL[status]}`);
  }, [patch, log]);

  const soundAlarm = useCallback((a, override) => {
    const cooking = isCookerLeftOn({ flameOn: a.flameOn, flameOnMinutes: a.flameMin || 0, pirMotionMinutesAgo: a.pirMinAgo, weightChangedRecently: false });
    const burning = isFoodBurning(a.smokePpm >= 250 && a.flameOn, a.flameOn) || (a.sensor === "SMOKE" && a.flameOn);
    const kind = override || (burning ? "FOOD BURNING" : cooking ? "COOKER LEFT ON" : a.sensor);
    const title = kind === "FOOD BURNING" ? "Food burning! Check cooker!"
      : kind === "COOKER LEFT ON" ? "Cooker left on? Check kitchen 30 min"
      : `${a.sensor} — ${a.unit} ${a.digitalAddress}`;
    setAlarm({
      key: `${a.id}-${Date.now()}`,
      assignmentId: a.id,
      kind, title,
      body: kind === "FOOD BURNING" ? "Smoke rising + flame ON. Loud alarm loops with vibration until acknowledged."
        : kind === "COOKER LEFT ON" ? `Flame ON > 30 min without PIR motion or weight change (${a.flameMin || ">30"} min). Loud alarm loops with vibration until acknowledged.`
        : `${a.reading}. Loud alarm loops with vibration until acknowledged.`,
      unit: a.unit, addr: a.digitalAddress, reading: a.reading,
      district: a.district, region: a.region, national: a.national,
      acked: false, drill: false,
    });
    sendHighPriorityPush({ title, body: `${a.unit} ${a.digitalAddress}`, data: { assignmentId: a.id } });
  }, []);

  const ackAlarm = useCallback(() => {
    setAlarm((al) => (al ? { ...al, acked: true } : al));
    if (alarm) log(alarm.assignmentId, "alarm acknowledged — officer checking");
  }, [alarm, log]);

  const escAlarm = useCallback(async ({ auto, drill }) => {
    if (!alarm) return;
    const a = byId[alarm.assignmentId];
    if (a) {
      const rec = await escalateAlarm(a, { auto, drill });
      log(a.id, `ESCALATED to HQ + Family Circle + Estate security${drill ? " (drill)" : ""}${auto ? ` after ${ESCALATION_MIN} min no-response` : ""}`);
      say(`Escalated ${a.unit} — HQ + Family Circle + Estate security${drill ? " (drill)" : ""}`);
      void rec;
    }
    setAlarm(null);
  }, [alarm, byId, log, say]);

  function inspectionOf(a) {
    return {
      qrInput: a.qrSerial, footInput: a.footRingSerial, photo: false,
      floorOk: false, ceilingOk: false, buzzerTest: false,
      sopTrolley: false, sopOfficers: false,
      confirmHazard: false, confirmCooker: false, confirmFood: false,
      notes: "", validated: null, fraudKept: false,
      ...(a.inspection || {}),
    };
  }
  const setInspection = (id, p) => {
    const cur = inspectionOf(byId[id]);
    patch(id, { inspection: { ...cur, ...p } });
  };

  function validateSerials(id) {
    const a = byId[id];
    const insp = inspectionOf(a);
    const match = serialsMatch(insp.footInput, insp.qrInput);
    const triple = tripleMatch(a.serial, insp.footInput, insp.qrInput);
    const verdict = { match, triple, fraudFlag: !match };
    setInspection(id, { validated: verdict, fraudKept: !match });
    log(id, match ? "serials validated GREEN MATCH (foot-ring = QR)" : "serials RED FRAUD — foot-ring != QR, fraud_flag=True kept visible for NPA/GNFS");
  }

  async function resolveAssignment(id) {
    const a = byId[id];
    const insp = inspectionOf(a);
    const res = a.resolution || {};
    const payload = {
      alert_id: a.id, sensor: a.sensor, unit: a.unit,
      action: res.action || RESOLVE_ACTION[a.sensor],
      photo: res.photoName || insp.photoName || "photo-proof-attached",
      notes: res.notes || insp.notes || "",
      serial: a.serial, foot_ring_serial: insp.footInput, qr_serial: insp.qrInput,
      fraud_flag: !serialsMatch(insp.footInput, insp.qrInput),
      officer: OFFICER.id, ts: new Date().toISOString(),
    };
    let synced = true;
    try {
      await postAlertResolve(payload);
    } catch {
      synced = false; // gateway offline — on-device twin keeps it, syncs when back
    }
    patch(id, { status: "RESOLVED", resolution: { ...res, ...payload, synced, syncedAt: synced ? payload.ts : null } });
    log(id, synced ? "resolved + POST /api/alerts/resolve synced" : "resolved OFFLINE — queued in on-device twin, will sync when back");
    say(synced ? "Resolved and synced." : "Resolved offline — queued to sync.");
  }

  async function retrySync() {
    for (const a of merged) {
      if (a.resolution && a.resolution.synced === false) {
        try {
          const { synced, syncedAt, ...payload } = a.resolution;
          void synced; void syncedAt;
          await postAlertResolve(payload);
          patch(a.id, { resolution: { ...a.resolution, synced: true, syncedAt: new Date().toISOString() } });
          log(a.id, "offline queue synced — POST /api/alerts/resolve ok");
        } catch { /* still offline — stays queued */ }
      }
    }
    say("Sync retry done.");
  }

  function exportFraud() {
    const rows = merged
      .filter((a) => {
        const insp = a.inspection;
        if (insp && insp.validated) return insp.validated.fraudFlag;
        return !serialsMatch(a.footRingSerial, a.qrSerial);
      })
      .map((a) => {
        const insp = inspectionOf(a);
        return {
          assignment_id: a.id, unit: a.unit, household: a.household,
          serial: a.serial, foot_ring_serial: insp.footInput, qr_serial: insp.qrInput,
          fraud_flag: true, validation: "RED FRAUD",
          digital_address: a.digitalAddress, district: a.district, region: a.region, national: a.national,
          status: a.status, officer: OFFICER.id,
        };
      });
    const blob = new Blob([JSON.stringify({ exported_by: OFFICER.id, count: rows.length, rows }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "npa-fraud-export.json";
    el.click();
    URL.revokeObjectURL(url);
  }

  function renderCard(a) {
    const insp = inspectionOf(a);
    const verdict = insp.validated || validationVerdict({ serial: a.serial, footRingSerial: insp.footInput, qrSerial: insp.qrInput });
    const left = kgLeft(a.gross, a.tare);
    const cooking = isCookerLeftOn({ flameOn: a.flameOn, flameOnMinutes: a.flameMin || 0, pirMotionMinutesAgo: a.pirMinAgo, weightChangedRecently: false });
    const burning = a.sensor === "SMOKE" && a.flameOn;
    return (
      <article key={a.id} className={`acard p${a.priority}`}>
        <div className="arow">
          <div>
            <span className="time">{timeAgo(a.minutesAgo)}</span>
            <span className={`prio ${a.priority}`}>{a.priority}</span>
            <span className={`badge ${a.status === "PENDING" ? "amber" : "dark"}`}>{FLOW_LABEL[a.status]}</span>
          </div>
          <VerdictBadge verdict={verdict} />
        </div>
        <h3>{a.sensor} <small>{a.reading}</small></h3>
        <p className="who">UNIT {a.unit} · {a.household} · {a.category} {a.sizeKg}kg ({a.cell} cell)</p>
        <p className="addr">{a.digitalAddress} <small>{a.district} · {a.region} · {a.national} · {a.npaCode} · {left}kg left</small></p>
        {(cooking || burning) && (
          <button className="alarm-btn" onClick={() => soundAlarm(a)}>
            {burning ? "Food burning! Check cooker! — Sound alarm" : "Cooker left on? Check kitchen — Sound alarm"}
          </button>
        )}
        <div className="abtns">
          {a.status === "PENDING" && (
            <button className="accept" onClick={() => { setStatus(a.id, "EN_ROUTE"); say(`Accepted ${a.unit} — en route.`); }}>
              Accept
            </button>
          )}
          {a.status === "EN_ROUTE" && (
            <button className="accept" onClick={() => { setStatus(a.id, "ON_SCENE"); setSelectedId(a.id); setTab("inspect"); }}>
              Arrived — On scene
            </button>
          )}
          <button className="ghost" onClick={() => { setSelectedId(a.id); setTab("inspect"); }}>Inspect</button>
          <button className="ghost" onClick={() => soundAlarm(a)}>Alarm</button>
        </div>
      </article>
    );
  }

  function renderAssign() {
    return (
      <section>
        <div className="searchbar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by digital address or NPA code"
            aria-label="Search by digital address or NPA code"
          />
        </div>
        <div className="chips">
          {SENSORS.map((s) => (
            <button key={s} className={`chip ${s.toLowerCase()}${fSensor === s ? " active" : ""}`} onClick={() => setFSensor(s)}>{s}</button>
          ))}
        </div>
        <div className="chips">
          {CATS.map((c) => (
            <button key={c} className={`chip${fCat === c ? " active" : ""}`} onClick={() => setFCat(c)}>{c}</button>
          ))}
          <span className="natlock">National: {NATIONAL}</span>
        </div>
        <div className="geo-row">
          <label>Regional
            <select value={fRegion} onChange={(e) => { setFRegion(e.target.value); setFDistrict("ALL"); }}>
              <option value="ALL">All 16 regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>District
            <select value={fDistrict} onChange={(e) => setFDistrict(e.target.value)}>
              <option value="ALL">All districts</option>
              {districtsFor.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>
        <p className="count">{filtered.length} active dispatch{filtered.length === 1 ? "" : "es"}</p>
        {filtered.map(renderCard)}
      </section>
    );
  }

  function renderMap() {
    return (
      <section>
        <div className="searchbar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by digital address or NPA code"
            aria-label="Search by digital address or NPA code"
          />
        </div>
        {filtered.map((a) => (
          <article key={a.id} className="acard">
            <div className="arow">
              <strong>{a.unit} · {a.sensor}</strong>
              <span className={`prio ${a.priority}`}>{a.priority}</span>
            </div>
            <p className="addr">{a.digitalAddress} <small>{a.district} · {a.region} · {a.national}</small></p>
            <p className="mono">{a.lat.toFixed(3)}, {a.lng.toFixed(3)} · {a.household}</p>
            <div className="abtns">
              <a className="accept link" href={mapsUrl(a)} target="_blank" rel="noreferrer">Navigate — Maps</a>
              <button className="ghost" onClick={() => { setSelectedId(a.id); setTab("inspect"); }}>Inspect</button>
            </div>
          </article>
        ))}
      </section>
    );
  }

  function renderInspect() {
    const a = selected;
    const insp = inspectionOf(a);
    const verdict = insp.validated || validationVerdict({ serial: a.serial, footRingSerial: insp.footInput, qrSerial: insp.qrInput });
    const left = kgLeft(a.gross, a.tare);
    const pct = remainingPct(left, a.sizeKg);
    const dl = daysLeft(left, a.avgDaily);
    const refill = refillSignal(pct);
    const cooking = isCookerLeftOn({ flameOn: a.flameOn, flameOnMinutes: a.flameMin || 0, pirMotionMinutesAgo: a.pirMinAgo, weightChangedRecently: false });
    const burning = a.sensor === "SMOKE" && a.flameOn;
    const idx = FLOW.indexOf(a.status);
    return (
      <section>
        <label className="pick">Dispatch
          <select value={a.id} onChange={(e) => setSelectedId(e.target.value)}>
            {merged.filter((m) => m.status !== "RESOLVED").map((m) => (
              <option key={m.id} value={m.id}>{m.unit} · {m.sensor} · {m.digitalAddress}</option>
            ))}
          </select>
        </label>
        <div className="steps">
          {FLOW.map((s, i) => (
            <span key={s} className={`step${i <= idx ? " on" : ""}`}>{FLOW_LABEL[s]}</span>
          ))}
        </div>
        <article className="acard">
          <div className="arow">
            <strong>{a.unit} · {a.household}</strong>
            <VerdictBadge verdict={verdict} big />
          </div>
          <p className="addr">{a.digitalAddress} <small>{a.district} · {a.region} · {a.national} · lat {a.lat.toFixed(3)} lng {a.lng.toFixed(3)}</small></p>
          <p className="who">{a.category} {a.sizeKg}kg ({a.cell} cell) · floor {a.gross}kg gross / {a.tare}kg tare · {left}kg left ({pct}%){dl == null ? "" : ` · ~${dl} days left`} · batt {a.floorBattery}% · LoRa {a.floorRssi}dBm · cal {a.calibr}</p>
          {refill.level !== "ok" && <p className={`refill ${refill.level}`}>{refill.title} — {refill.body}</p>}
          {a.category === "COMMERCIAL" && (
            <div className="sop">
              <h4>GNFS SOP — COMMERCIAL {a.sizeKg}kg ({a.cell} cell)</h4>
              <label><input type="checkbox" checked={insp.sopTrolley} onChange={(e) => setInspection(a.id, { sopTrolley: e.target.checked })} /> Trolley present on scene</label>
              <label><input type="checkbox" checked={insp.sopOfficers} onChange={(e) => setInspection(a.id, { sopOfficers: e.target.checked })} /> 2 officers present</label>
            </div>
          )}
        </article>

        <article className="acard">
          <h4>Serial check — foot-ring MUST equal QR (new: same number · legacy: QR copies bottom ring)</h4>
          <label>QR plate — scan camera
            <input value={insp.qrInput} onChange={(e) => setInspection(a.id, { qrInput: e.target.value, validated: null })} className="mono" />
          </label>
          <label className="filebtn">Scan QR with camera
            <input type="file" accept="image/*" capture="environment" onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) { setInspection(a.id, { qrPhotoName: f.name }); say(`QR frame captured: ${f.name} — confirm the decoded value above.`); }
            }} />
          </label>
          <label>Foot-ring stamp — manual entry
            <input value={insp.footInput} onChange={(e) => setInspection(a.id, { footInput: e.target.value, validated: null })} className="mono" />
          </label>
          <label className="filebtn">Combined photo proof — foot-ring stamp + QR plate, same frame (required)
            <input type="file" accept="image/*" capture="environment" onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) { setInspection(a.id, { photo: true, photoName: f.name }); log(a.id, `combined photo proof attached: ${f.name}`); }
            }} />
          </label>
          {insp.photoName && <p className="okline">Combined proof: {insp.photoName}</p>}
          <div className="abtns">
            <button className="accept" onClick={() => validateSerials(a.id)}>Validate foot-ring == QR</button>
          </div>
          {insp.validated && (
            <p className={verdict.match ? "okline" : "fraudline"}>
              {verdict.match ? `GREEN MATCH — serial = foot-ring = QR (${a.serial}).` : `RED FRAUD — bottom ring != QR. fraud_flag=True kept visible for NPA/GNFS export, never silently dropped. Triple (${a.serial}): ${verdict.triple ? "MATCH" : "MISMATCH"}.`}
            </p>
          )}
          {insp.validated && !verdict.match && (
            <button className="alarm-btn" onClick={() => { log(a.id, "fraud report filed — RED FRAUD kept visible for NPA export"); say("Fraud report filed — RED FRAUD visible for NPA."); }}>File fraud report</button>
          )}
        </article>

        <article className="acard">
          <h4>Floor + Ceiling check</h4>
          <div className="readgrid">
            <span>Gross {a.gross}kg · tare {a.tare}kg · left {left}kg ({pct}%)</span>
            <span>Avg daily {a.avgDaily}kg · days left {dl == null ? "—" : `~${dl}`}</span>
            <span>Battery {a.floorBattery}% · LoRa RSSI {a.floorRssi}dBm</span>
            <span>Calibration {a.calibr} · cyl temp {a.floorTemp}C · flame {a.flameOn ? "ON" : "OFF"} · gas {a.gasPpm}ppm</span>
            <span>Ceiling {a.id}: smoke {a.ceilingSmoke}ppm MQ-2 · flame IR {a.flame ? "ACTIVE" : "clear"} · gas {a.ceilingGas}ppm MQ-5</span>
            <span>Kitchen {a.kitchenTemp}C DHT22 (HEAT ≥ {a.heatThreshold}C) · PIR {a.pir} ({timeAgo(a.pirMinAgo)})</span>
            <span>WiFi {a.wifiRssi}dBm · LoRa link · heartbeat {timeAgo(a.heartbeatMinAgo)} · buzzer {a.buzzer} · backup {a.backupBatt}%</span>
          </div>
          <label><input type="checkbox" checked={insp.floorOk} onChange={(e) => setInspection(a.id, { floorOk: e.target.checked })} /> Floor readings recorded</label>
          <label><input type="checkbox" checked={insp.ceilingOk} onChange={(e) => setInspection(a.id, { ceilingOk: e.target.checked })} /> Ceiling readings recorded</label>
          <label><input type="checkbox" checked={insp.buzzerTest} onChange={(e) => setInspection(a.id, { buzzerTest: e.target.checked })} /> Buzzer test sounded</label>
        </article>

        <article className="acard">
          <h4>Safety check — confirm on scene</h4>
          <label><input type="checkbox" checked={insp.confirmHazard} onChange={(e) => setInspection(a.id, { confirmHazard: e.target.checked })} /> Confirm {a.sensor}: {a.reading}</label>
          {(a.sensor === "COOK" || cooking) && (
            <label><input type="checkbox" checked={insp.confirmCooker} onChange={(e) => setInspection(a.id, { confirmCooker: e.target.checked })} /> Cooker left on confirmed — flame ON &gt; 30 min, no PIR motion, no weight change</label>
          )}
          {(burning || a.sensor === "SMOKE") && (
            <label><input type="checkbox" checked={insp.confirmFood} onChange={(e) => setInspection(a.id, { confirmFood: e.target.checked })} /> Food burning confirmed — smoke rising + flame ON</label>
          )}
          <label>Scene photo + notes
            <input value={insp.notes} onChange={(e) => setInspection(a.id, { notes: e.target.value })} placeholder="Valve state, occupants, access…" />
          </label>
          <div className="abtns">
            <button className="accept" onClick={() => { log(a.id, "officer on scene — checking"); say("Logged: officer checking."); }}>Acknowledge — I am checking</button>
            <button className="ghost" onClick={() => soundAlarm(a)}>Sound alarm</button>
            <button className="ghost" onClick={() => {
              setAlarm({
                key: `${a.id}-drill-${Date.now()}`, assignmentId: a.id, kind: "DRILL ESCALATION",
                title: "Drill — escalate to HQ + Family Circle + Estate security",
                body: `Training escalation for ${a.unit} ${a.digitalAddress}. Trolley + 2 officers required for COMMERCIAL.`,
                unit: a.unit, addr: a.digitalAddress, reading: a.reading,
                district: a.district, region: a.region, national: a.national,
                acked: true, drill: true,
              });
            }}>Escalate now (drill)</button>
          </div>
        </article>
        <ConnStrip a={a} />
        {(a.trail || []).length > 0 && (
          <article className="acard">
            <h4>Officer trail</h4>
            {a.trail.map((t, i) => <p key={i} className="mono">{t}</p>)}
          </article>
        )}
      </section>
    );
  }

  function renderResolve() {
    const a = selected;
    if (!a || a.status === "RESOLVED") {
      return (
        <section>
          <p className="count">Select an active dispatch in Inspect, then resolve it here.</p>
          <div className="abtns"><button className="ghost" onClick={() => setTab("inspect")}>Go to Inspect</button></div>
          {outboxCount > 0 && (
            <article className="acard">
              <h4>Offline queue ({outboxCount})</h4>
              <p>Gateway offline — resolutions stored in the on-device twin. They sync when the link is back.</p>
              <button className="accept" onClick={retrySync}>Retry sync now</button>
            </article>
          )}
        </section>
      );
    }
    const insp = inspectionOf(a);
    const verdict = insp.validated || validationVerdict({ serial: a.serial, footRingSerial: insp.footInput, qrSerial: insp.qrInput });
    const res = a.resolution || {};
    return (
      <section>
        <article className="acard">
          <div className="arow">
            <strong>{a.unit} · {a.sensor} · {a.digitalAddress}</strong>
            <VerdictBadge verdict={verdict} />
          </div>
          <p className="who">{a.household} · {a.district}, {a.region}, {a.national}</p>
          <label>Resolution
            <input
              value={res.action || RESOLVE_ACTION[a.sensor]}
              onChange={(e) => patch(a.id, { resolution: { ...res, action: e.target.value } })}
            />
          </label>
          <label className="filebtn">Resolution photo proof (required)
            <input type="file" accept="image/*" capture="environment" onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) patch(a.id, { resolution: { ...res, photoName: f.name } });
            }} />
          </label>
          {res.photoName && <p className="okline">Proof: {res.photoName}</p>}
          <label>Notes
            <input
              value={res.notes || ""}
              onChange={(e) => patch(a.id, { resolution: { ...res, notes: e.target.value } })}
              placeholder="Closed valve / cylinder removed / occupant briefed…"
            />
          </label>
          <div className="abtns">
            <button className="accept" onClick={() => resolveAssignment(a.id)}>
              Mark {a.sensor} resolved — POST /api/alerts/resolve
            </button>
          </div>
          <p className="hint">Offline? The resolve is stored in the on-device twin and syncs when the gateway is back.</p>
        </article>
        {outboxCount > 0 && (
          <article className="acard">
            <h4>Offline queue ({outboxCount})</h4>
            <button className="accept" onClick={retrySync}>Retry sync now</button>
          </article>
        )}
      </section>
    );
  }

  function renderHistory() {
    return (
      <section>
        <div className="abtns">
          <button className="ghost" onClick={exportFraud}>Export fraud list (NPA)</button>
          {outboxCount > 0 && <button className="ghost" onClick={retrySync}>Retry sync ({outboxCount})</button>}
        </div>
        <p className="count">{history.length} resolved dispatch{history.length === 1 ? "" : "es"}</p>
        {history.map((a) => {
          const insp = inspectionOf(a);
          const verdict = insp.validated || validationVerdict({ serial: a.serial, footRingSerial: insp.footInput, qrSerial: insp.qrInput });
          return (
            <article key={a.id} className="acard">
              <div className="arow">
                <strong>{a.unit} · {a.sensor} · {a.digitalAddress}</strong>
                <VerdictBadge verdict={verdict} />
              </div>
              <p className="who">{a.household} · {a.category} {a.sizeKg}kg · {a.npaCode}</p>
              <p className="addr">{a.district} · {a.region} · {a.national}</p>
              <p className="mono">foot-ring {insp.footInput} · QR {insp.qrInput}{verdict.fraudFlag !== false && !verdict.match ? " · fraud_flag=True" : ""}</p>
              {a.resolution && <p>{a.resolution.action}</p>}
              {a.resolution && <p className="mono">{a.resolution.synced ? `synced ${a.resolution.syncedAt || ""}` : "OFFLINE — queued in on-device twin"}{a.resolution.photoName ? ` · proof ${a.resolution.photoName}` : ""}</p>}
            </article>
          );
        })}
      </section>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <span className="brand-mark">G</span>
            <h1>GNFS Field Officer <span className="sub">LEAK · BURST · FIRE · SMOKE · HEAT</span></h1>
          </div>
          <span className="live-dot"><i />FIELD</span>
          <div className="topbar-spacer" />
          <span className="officer">{OFFICER.id} · {OFFICER.name}</span>
        </div>
        <div className="topbar-row sub">
          <span className="pushrow">
            Push
            <button
              className={`toggle${pushOn ? " on" : ""}`}
              aria-pressed={pushOn}
              onClick={() => {
                setPushOn((v) => !v);
                sendHighPriorityPush({ title: "Field push test", body: `${OFFICER.id} registered (placeholder)`, data: { officer: OFFICER.id } });
                say(pushOn ? "High-priority push off (placeholder)." : "High-priority push on — FCM placeholder, loud alarm + vibration until tapped.");
              }}
            >{pushOn ? "ON" : "OFF"}</button>
          </span>
          {outboxCount > 0 && <span className="badge amber">offline queue {outboxCount}</span>}
        </div>
      </header>

      <main className="wrap">
        {tab === "assign" && renderAssign()}
        {tab === "map" && renderMap()}
        {tab === "inspect" && renderInspect()}
        {tab === "resolve" && renderResolve()}
        {tab === "history" && renderHistory()}
      </main>

      <nav className="tabbar" aria-label="Primary">
        {[
          ["assign", "Assign"],
          ["map", "Map"],
          ["inspect", "Inspect"],
          ["resolve", "Resolve"],
          ["history", "History"],
        ].map(([key, label]) => (
          <button key={key} className={`ttab${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>
            {label}
            {key === "assign" && <span className="count">{filtered.length}</span>}
          </button>
        ))}
      </nav>

      {toast && <div className="toast" role="status">{toast}</div>}
      <AlarmOverlay alarm={alarm} onAcknowledge={ackAlarm} onEscalate={escAlarm} />
    </div>
  );
}
