import { Fragment, useEffect, useMemo, useState } from "react";
import { ALL_DISTRICTS, DISTRICTS, HISTORY_ALERTS, LIVE_ALERTS, NATIONAL, OFFICERS, REGIONS, timeAgo } from "./data/seed.js";
import { daysLeft, kgLeft, remainingPct, tripleMatch, validationVerdict } from "./lib/gassafe.js";
import AlertOverlay from "./components/AlertOverlay.jsx";
import DispatchDrawer from "./components/DispatchDrawer.jsx";
import { AnalyticsPanel, ConnectivityPanel, FraudPanel, RefillPanel } from "./components/SidePanels.jsx";

const SENSOR_FILTERS = ["ALL", "FIRE", "SMOKE", "LEAK", "BURST", "HEAT", "COOK", "HOME", "COMMERCIAL"];
const ROLES = ["GNFS HQ", "Regional Commander", "District Officer", "Field Officer"];

function verdictBadges(r) {
  const v = validationVerdict({ serial: r.serial, footRingSerial: r.footRingSerial, qrSerial: r.qrSerial });
  const triple = tripleMatch(r.serial, r.footRingSerial, r.qrSerial);
  return { ...v, triple };
}

export default function App() {
  const [tab, setTab] = useState("live");
  const [sensor, setSensor] = useState("ALL");
  const [district, setDistrict] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("GNFS HQ");
  const [roleRegion, setRoleRegion] = useState("Greater Accra");
  const [roleDistrict, setRoleDistrict] = useState("East Legon Hills");
  const [expanded, setExpanded] = useState({});
  const [dispatchFor, setDispatchFor] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [alarm, setAlarm] = useState(null);
  const [drill, setDrill] = useState(true);
  const [log, setLog] = useState(["FCM placeholder armed · twin fallback ready · gateway MTN/Telecel auto-failover on."]);

  const base = useMemo(() => {
    const src = tab === "live" ? LIVE_ALERTS : HISTORY_ALERTS;
    return src.map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id].stage || r.status, dispatch: { ...(r.dispatch || {}), ...overrides[r.id] } } : r));
  }, [tab, overrides]);

  // Role scoping: HQ sees all; commander pinned to a region; officer to a district; field sees live P1/P2 only.
  const roleScoped = useMemo(() => {
    if (role === "Regional Commander") return base.filter((r) => r.region === roleRegion);
    if (role === "District Officer") return base.filter((r) => r.district === roleDistrict);
    if (role === "Field Officer") return base.filter((r) => r.priority !== "P3");
    return base;
  }, [base, role, roleRegion, roleDistrict]);

  const districtsForRegion = region === "ALL" ? ALL_DISTRICTS.map((d) => d.district) : DISTRICTS[region] || [];

  const rows = useMemo(() => {
    const q = query.trim().toUpperCase();
    return roleScoped.filter((r) => {
      if (region !== "ALL" && r.region !== region) return false;
      if (district !== "ALL" && r.district !== district) return false;
      if (sensor === "HOME" || sensor === "COMMERCIAL") {
        if (r.category !== sensor) return false;
      } else if (sensor !== "ALL" && r.sensor !== sensor) return false;
      if (q && !(r.digitalAddress.toUpperCase().includes(q) || r.npaCode.toUpperCase().includes(q) || r.serial.toUpperCase().includes(q))) return false;
      return true;
    });
  }, [roleScoped, region, district, sensor, query]);

  // Loud-alarm trigger: newest unacknowledged P1 LEAK/BURST/FIRE raises overlay (drill default ON for pitching).
  useEffect(() => {
    if (tab !== "live" || alarm) return;
    const hot = [...LIVE_ALERTS]
      .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id].stage } : r))
      .find((r) => (r.sensor === "LEAK" || r.sensor === "BURST" || r.sensor === "FIRE") && (r.status === "PENDING" || !r.status));
    if (hot && !sessionStorage.getItem(`acked-${hot.id}`)) {
      const t = setTimeout(() => setAlarm({ ...hot, raisedLabel: timeAgo(hot.minutesAgo) }), 1200);
      return () => clearTimeout(t);
    }
  }, [tab, alarm, overrides]);

  const pushLog = (m) => setLog((l) => [`${new Date().toLocaleTimeString()} — ${m}`, ...l].slice(0, 8));

  const acknowledge = () => {
    if (!alarm) return;
    sessionStorage.setItem(`acked-${alarm.id}`, "1");
    pushLog(`Acknowledged ${alarm.unit} — operator checking kitchen.`);
    setAlarm(null);
  };
  const escalate = () => {
    if (!alarm) return;
    pushLog(`ESCALATED ${alarm.unit} to GNFS field officers + Family Circle + estate security${drill ? " (drill)" : ""}.`);
    setOverrides((o) => ({ ...o, [alarm.id]: { ...(o[alarm.id] || {}), stage: "DISPATCHED", officers: ["GNFS-014", "GNFS-022"], at: new Date().toISOString() } }));
    sessionStorage.setItem(`acked-${alarm.id}`, "1");
    setAlarm(null);
  };

  const updateDispatch = (id, d) => {
    setOverrides((o) => ({ ...o, [id]: { ...(o[id] || {}), ...d } }));
    const off = OFFICERS.filter((x) => d.officers?.includes(x.id)).map((x) => x.id).join("+") || "team";
    pushLog(`${id} → ${d.stage} (${off})${d.queued ? " · queued offline, will sync" : ""}. Photo proof ${d.photo ? "attached" : "pending"}.`);
  };

  const resetFilters = () => { setSensor("ALL"); setDistrict("ALL"); setRegion("ALL"); setQuery(""); };

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <div className="brand-mark" aria-hidden>🔥</div>
            <h1>GasSafe GNFS — FIRE SMOKE HEAT Filters Added<span className="sub">District ⊂ Region ⊂ National · NPA triple-match enforced</span></h1>
          </div>
          <span className="live-dot"><i />Live</span>
          <div className="topbar-spacer" />
          <label className="rolebox">Role
            <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          {role === "Regional Commander" && (
            <label className="rolebox">Command
              <select value={roleRegion} onChange={(e) => setRoleRegion(e.target.value)}>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select>
            </label>
          )}
          {role === "District Officer" && (
            <label className="rolebox">District post
              <select value={roleDistrict} onChange={(e) => setRoleDistrict(e.target.value)}>{ALL_DISTRICTS.map((d) => <option key={d.district} value={d.district}>{d.district} ({d.region})</option>)}</select>
            </label>
          )}
          <span className="connbox">Gateway 4G MTN/Telecel · WiFi primary + Cellular fallback · twin on-device</span>
        </div>
        <nav className="tabs" aria-label="Alert streams">
          <button className={`tab${tab === "live" ? " active" : ""}`} onClick={() => setTab("live")}>Live <span>PENDING</span><span className="count">{LIVE_ALERTS.length}</span></button>
          <button className={`tab${tab === "hist" ? " active" : ""}`} onClick={() => setTab("hist")}>History &amp; Regional <span className="count grey">{HISTORY_ALERTS.length}</span></button>
          <button className={`tab${tab === "fraud" ? " active" : ""}`} onClick={() => setTab("fraud")}>Fraud &amp; NPA <span className="hint">kept visible</span></button>
        </nav>
      </header>

      <div className="filterbar" role="search">
        <div className="field">
          <label htmlFor="f-district">District (shows only that district)</label>
          <select id="f-district" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="ALL">All districts</option>
            {districtsForRegion.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-region">Regional (16 regions → all its districts)</label>
          <select id="f-region" value={region} onChange={(e) => { setRegion(e.target.value); setDistrict("ALL"); }}>
            <option value="ALL">All regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-national">National</label>
          <select id="f-national" value={NATIONAL} disabled aria-label="National fixed to Ghana"><option>{NATIONAL} — all 16 regions</option></select>
        </div>
        <div className="field">
          <label>Sensor filter</label>
          <div className="chips">
            {SENSOR_FILTERS.map((s) => (
              <button key={s} className={`chip ${s.toLowerCase()}${sensor === s ? " active" : ""}`} onClick={() => setSensor(s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="field search">
          <label htmlFor="f-search">Search by digital address or NPA code</label>
          <input id="f-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="GE-321-1234 · GA-123-4567 · NPA-CRM-GH-00001 · GC-12345" />
        </div>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
        <label style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={drill} onChange={(e) => setDrill(e.target.checked)} /> Drill mode (training)
        </label>
      </div>

      <main className="wrap">
        <section className="cards" aria-label="Key figures">
          <div className="card"><div className="k">TOTAL HOUSES</div><div className="v">400</div><div className="s">Gated estate registry</div></div>
          <div className="card"><div className="k">TOTAL CYLINDERS</div><div className="v">7/620</div><div className="s">Active in live slice / pool</div></div>
          <div className="card danger"><div className="k">ACTIVE LEAKS</div><div className="v">3</div><div className="s">Needs GNFS dispatch</div></div>
          <div className="card danger"><div className="k">COMMERCIAL COUNT</div><div className="v">3</div><div className="s">Trolley + 2 officers</div></div>
          <div className="card"><div className="k">IN VIEW</div><div className="v">{rows.length}</div><div className="s">{tab === "live" ? "Live PENDING" : tab === "hist" ? "History & Regional" : "Fraud pool"} · {role}</div></div>
          <div className="card"><div className="k">OPS LOG</div><div className="s" style={{ maxHeight: 54, overflow: "auto" }}>{log.map((l, i) => <div key={i}>{l}</div>)}</div></div>
        </section>

        {tab !== "fraud" ? (
          <div className="grid2">
            <div className="panel">
              <div className="panel-h">
                <h2>{tab === "live" ? `Live alerts — PENDING (${rows.length})` : `History & Regional (${rows.length})`}</h2>
                <span className="hint">TIME / PRIORITY · SENSOR &amp; READINGS · UNIT &amp; ADDRESS · CYLINDER / SCALE · STATUS · ACTION</span>
              </div>
              <div className="table-scroll">
                <table className="ops">
                  <thead><tr><th>TIME / PRIORITY</th><th>SENSOR TYPE &amp; READINGS</th><th>UNIT &amp; ADDRESS</th><th>CYLINDER / SCALE &amp; PRIORITY</th><th>STATUS</th><th>ACTION</th></tr></thead>
                  <tbody>
                    {rows.length === 0 && <tr><td colSpan={6}>No rows match — loosen District / Regional / sensor / search.</td></tr>}
                    {rows.map((r) => {
                      const v = verdictBadges(r);
                      const left = kgLeft(r.gross, r.tare);
                      const pct = remainingPct(left, r.sizeKg);
                      const open = expanded[r.id];
                      return (
                        <Fragment key={r.id}>
                          <tr className={r.priority === "P1" ? "p1" : ""}>
                            <td><div className="timecell">{timeAgo(r.minutesAgo)}</div><span className={`prio ${r.priority}`}>{r.priority}</span></td>
                            <td><span className="sensor">{r.sensor}<small>{r.reading}</small></span>
                              <div style={{ marginTop: 4 }}><span className={`badge ${v.fraudFlag ? "red" : "green"}`}>{v.fraudFlag ? "RED FRAUD" : "GREEN MATCH"}</span></div>
                            </td>
                            <td><span className="addr">{r.unit} · {r.household}<small>{r.digitalAddress} · {r.district}, {r.region}, {r.national}</small><small className="mono">lat {r.lat} lng {r.lng} · {r.npaCode}</small></span></td>
                            <td><strong>{r.sizeKg}kg {r.category}</strong><br /><span style={{ fontSize: 11.5 }}>{r.cell} cell · tare {r.tare}kg · gross {r.gross}kg · left {left}kg ({pct}%)</span>{r.category === "COMMERCIAL" && <><br /><span className="badge red">trolley + 2 officers</span></>}</td>
                            <td><span className={`badge ${r.status === "PENDING" ? "red" : r.status === "RESOLVED" ? "green" : "amber"}`}>{r.dispatch?.stage || r.status}</span>{r.dispatch?.queued && <><br /><span className="badge grey">queued offline</span></>}<br /><button className="ghost-btn" onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}>{open ? "Hide units" : "Floor / ceiling"}</button></td>
                            <td style={{ minWidth: 150 }}>
                              <button className="dispatch-btn" onClick={() => setDispatchFor(r)} disabled={role === "Field Officer" && r.status === "RESOLVED"}>
                                {r.status === "PENDING" || !r.dispatch ? "DISPATCH TEAM NOW" : "DISPATCH NOW"}
                              </button>
                              <button className="ghost-btn" onClick={() => { setAlarm({ ...r, raisedLabel: timeAgo(r.minutesAgo) }); }}>Test alarm</button>
                              <a className="ghost-btn" style={{ display: "block", textAlign: "center", textDecoration: "none" }} href={`tel:${OFFICERS[0].phone.replace(/\s/g, "")}`}>Call</a>
                            </td>
                          </tr>
                          {open && (
                            <tr key={`${r.id}-x`} className="expanded"><td colSpan={6}>
                              <div className="detail">
                                <div><h4>NPA IDENTITY (locked rule)</h4>serial <span className="mono">{r.serial}</span><br />foot-ring <span className="mono">{r.footRingSerial}</span><br />QR plate <span className="mono">{r.qrSerial}</span><br /><span className={`badge ${v.fraudFlag ? "red" : "green"}`}>{v.fraudFlag ? "RED FRAUD · fraud_flag=True — kept visible for NPA/GNFS" : "GREEN MATCH · triple identical"}</span>{r.oldSerial && <><br />legacy stamp {r.oldSerial} — QR copied ring, never invented</>}</div>
                                <div><h4>FLOOR UNIT (load cell)</h4>gross {r.gross}kg · tare {r.tare}kg · left {left}kg ({pct}%) · ~{daysLeft(left, r.avgDaily) ?? "—"}d<br />batt {r.floorBattery}% · {r.floorVolt}V · LoRa {r.floorRssi} dBm · calib {r.calibr}<br />cyl temp {r.floorTemp}°C · flame {r.flame ? "ON" : "OFF"} · gas {r.gasPpm}ppm · seen {r.lastSeenMinAgo}m ago</div>
                                <div><h4>CEILING UNIT + GATEWAY</h4>smoke {r.ceilingSmoke}ppm MQ-2 · gas {r.ceilingGas}ppm MQ-5 · kitchen {r.kitchenTemp}°C (HEAT ≥ {r.heatThreshold}°C)<br />PIR {r.pir} · last motion {r.pirMinAgo}m ago · WiFi {r.wifiRssi} dBm {r.gateway.wifi}<br />cell {r.gateway.sim} {r.gateway.cellular} · LoRa {r.gateway.lora} · twin {r.gateway.twin} · buzzer {r.buzzer} · backup {r.backupBatt}%</div>
                                <div><h4>PROOF &amp; REFILL</h4>combined photo: {r.photoProof} (foot-ring stamp + QR plate, same frame)<br />GA address {r.digitalAddress} · {r.lat},{r.lng}{r.oldSerial ? ` · old ${r.oldSerial} → new ${r.serial}` : ""}<br />dispatch: {r.dispatch ? `${r.dispatch.stage} · ${(r.dispatch.officers || []).join("+") || "—"}${r.dispatch.photo ? " · photo ✓" : ""}` : "not yet dispatched"}</div>
                              </div>
                            </td></tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="footer-note" style={{ padding: "8px 14px" }}>New NPA cylinders: manufacturer stamps foot ring = QR ({`NPA-CRM-GH-00001`}). Legacy: QR copies the existing bottom-ring stamp ({`GC-12345`}) — never invent a new number. Mismatch = suspected fraud, RED badge, fraud_flag=True.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <AnalyticsPanel rows={rows} />
              <RefillPanel rows={rows} />
              <ConnectivityPanel rows={rows} />
            </div>
          </div>
        ) : (
          <FraudPanel
            rows={[...LIVE_ALERTS, ...HISTORY_ALERTS]
              .map((r) => (overrides[r.id] ? { ...r, status: overrides[r.id].stage || r.status } : r))
              .filter((r) => {
                if (role === "Regional Commander" && r.region !== roleRegion) return false;
                if (role === "District Officer" && r.district !== roleDistrict) return false;
                if (region !== "ALL" && r.region !== region) return false;
                if (district !== "ALL" && r.district !== district) return false;
                const q = query.trim().toUpperCase();
                if (q && !(r.digitalAddress.toUpperCase().includes(q) || r.npaCode.toUpperCase().includes(q) || r.serial.toUpperCase().includes(q))) return false;
                return true;
              })}
            canExport={role !== "Field Officer"}
          />
        )}
        <p className="footer-note">Same PCB, different load cell — HOME 50kg (3 / 5 / 6=12.5 gross / 12.5 / 14.5=26.5 gross / 15) · COMMERCIAL 150kg (19 / 19.5=32.5 gross / 35 / 45 / 50 / 52=87 gross). 19.5kg moved HOME → COMMERCIAL. COMMERCIAL needs trolley + 2 officers per GNFS SOP. Webhook: POST /api/lora-gas/webhook → GET /api/alerts (smoke_ppm &gt; threshold · temp &gt; 70 · flame). Cooker left on: flame ON &gt; 30 min + no PIR + no weight change → full-screen alarm, loops even if phone silent; 2 min no-response escalates to Family Circle / Estate Manager / GNFS. FCM high-priority push placeholder armed.</p>
      </main>

      <div className="bottombar">
        <label className="sr-only" htmlFor="f-search-bottom">Search by digital address or NPA code</label>
        <input id="f-search-bottom" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by digital address or NPA code — GE-321-1234 · GA-123-4567 · NPA-CRM-GH-00001 · GC-12345" />
        <span className="note">{rows.length} shown · District ⊂ Region ⊂ National · {role}</span>
      </div>

      {dispatchFor && <DispatchDrawer alert={dispatchFor} onClose={() => setDispatchFor(null)} onUpdate={(id, d) => { updateDispatch(id, d); }} />}
      <AlertOverlay alert={alarm} drill={drill} onAck={acknowledge} onEscalate={escalate} />
    </>
  );
}


