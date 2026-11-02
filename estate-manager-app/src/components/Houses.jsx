import React from "react";
import {
  COMMERCIAL_CELL,
  HOME_CELL,
  RIDER_LABELS,
  RIDER_STATES,
  daysLeft,
  kgLeft,
  matchBadge,
  refillSignal,
  remainingPct,
  validationVerdict,
} from "../lib/gassafe.js";

export function StatusPill({ status }) {
  const cls = "pill pill-" + String(status || "").toLowerCase().replace("_", "");
  return <span className={cls}>{status}</span>;
}

export function Badge({ badge }) {
  return (
    <span className={badge === "GREEN" ? "badge-green" : "badge-red"}>
      {badge === "GREEN" ? "GREEN MATCH" : "RED FRAUD"}
    </span>
  );
}

function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

const FILTERS = ["ALL", "LEAK", "BURST", "HOME", "COMMERCIAL"];

function houseMatchesFilter(house, filter) {
  if (filter === "ALL") return true;
  return house.cylinders.some((c) => {
    if (filter === "HOME") return c.kind === "HOME";
    if (filter === "COMMERCIAL") return c.kind === "COMMERCIAL";
    if (filter === "BURST") return c.status === "BURST";
    if (filter === "LEAK") return c.status === "LEAK" || c.status === "SMOKE" || c.status === "FLAME";
    return true;
  });
}

export function applyHouseFilter(houses, filter, query) {
  const q = String(query || "").trim().toUpperCase();
  return houses.filter((h) => {
    if (!houseMatchesFilter(h, filter)) return false;
    if (!q) return true;
    const hay = [h.unit, h.resident, h.address, h.digitalAddress]
      .concat(h.cylinders.map((c) => c.serial))
      .join(" ")
      .toUpperCase();
    return hay.includes(q);
  });
}

export function Filters({ filter, setFilter, query, setQuery }) {
  return (
    <div className="filters">
      <div className="filterbtns" role="group" aria-label="Status filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={filter === f ? "fbtn active" : "fbtn"}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <input
        className="search"
        type="search"
        placeholder="Search unit, resident, GE- address, serial NPA-CRM-GH"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search houses and cylinders"
      />
    </div>
  );
}

function FloorGrid({ cyl }) {
  const left = kgLeft(cyl.grossKg, cyl.tareKg);
  const pct = remainingPct(left, cyl.sizeKg);
  const days = daysLeft(left, cyl.avgDailyKg);
  const rows = [
    ["Gross", `${cyl.grossKg} kg`],
    ["Tare", `${cyl.tareKg} kg`],
    ["Gas left", `${left} kg (${pct}%)`],
    ["Avg daily use", `${cyl.avgDailyKg} kg/day`],
    ["Days left", days == null ? "—" : `~${days} days`],
    ["Battery", `Batt ${cyl.batteryPct}%`],
    ["LoRa RSSI", `${cyl.loraRssiDbm} dBm`],
    ["Calibration", cyl.calibration],
    ["Cylinder temp", `${cyl.cylinderTempC} °C`],
    ["Flame", cyl.flameOn ? `ON (${cyl.flameOnMinutes} min)` : "OFF"],
    ["Gas", `${cyl.gasPpm} ppm`],
    ["Last seen", `${cyl.lastSeenSec}s ago`],
  ];
  return (
    <div className="telegrid">
      {rows.map(([k, v]) => (
        <div className="tele" key={k}>
          <span className="tele-k">{k}</span>
          <span className="tele-v">{v}</span>
        </div>
      ))}
    </div>
  );
}

function CeilingGrid({ ceiling }) {
  if (!ceiling) return <p className="muted">No ceiling unit paired.</p>;
  const rows = [
    ["Device", ceiling.deviceId],
    ["Smoke (MQ-2)", `${ceiling.smokePpm} ppm`],
    ["Flame (IR)", ceiling.flameIR ? "DETECTED" : "clear"],
    ["Gas (MQ-5)", `${ceiling.gasPpm} ppm`],
    ["Kitchen temp (DHT22)", `${ceiling.kitchenTempC} °C`],
    ["PIR motion", ceiling.pirMotion ? "MOTION" : `still (${ceiling.lastMotionMinAgo} min ago)`],
    ["Last motion", `${ceiling.lastMotionMinAgo} min ago`],
    ["WiFi RSSI", `${ceiling.wifiRssiDbm} dBm`],
    ["LoRa link", ceiling.loraLink],
    ["Heartbeat", `${ceiling.heartbeatSec}s`],
    ["Buzzer", ceiling.buzzer],
    ["Backup battery", `${ceiling.backupBatteryPct}%`],
  ];
  return (
    <div className="telegrid">
      {rows.map(([k, v]) => (
        <div className="tele" key={k}>
          <span className="tele-k">{k}</span>
          <span className="tele-v">{v}</span>
        </div>
      ))}
    </div>
  );
}

function RefillPanel({ cyl, houseUnit, onRequestRefill, onAdvanceRider }) {
  const left = kgLeft(cyl.grossKg, cyl.tareKg);
  const pct = remainingPct(left, cyl.sizeKg);
  const sig = refillSignal(pct);
  const rider = cyl.refill && cyl.refill.state;
  return (
    <div className="panel">
      <h4>Refill</h4>
      <div className="meter">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="muted">
        {left} kg left · {pct}% · {sig.title}
      </p>
      {sig.level === "reminder" ? <p className="warn">{sig.body}</p> : null}
      {sig.level === "urgent" || sig.level === "empty" ? (
        <p className="urgent">{sig.body}</p>
      ) : null}
      {!rider ? (
        <button className="btn" onClick={() => onRequestRefill(houseUnit, cyl.id)}>
          Request Refill
        </button>
      ) : (
        <div className="rider">
          <ol className="rider-steps">
            {RIDER_STATES.map((s) => (
              <li
                key={s}
                className={
                  s === rider ? "current" : RIDER_STATES.indexOf(s) < RIDER_STATES.indexOf(rider) ? "done" : ""
                }
              >
                {RIDER_LABELS[s]}
              </li>
            ))}
          </ol>
          {rider !== "delivered" ? (
            <button className="btn small" onClick={() => onAdvanceRider(houseUnit, cyl.id)}>
              Advance rider (demo)
            </button>
          ) : (
            <span className="muted">Cylinder refilled and returned.</span>
          )}
        </div>
      )}
    </div>
  );
}

function ValidationPanel({ cyl, house }) {
  const v = validationVerdict(cyl);
  return (
    <div className="panel">
      <h4>
        NPA validation <Badge badge={v.badge} />
      </h4>
      <p className="muted">
        foot_ring_serial, qr_serial and serial must ALL be identical. Bottom ring != QR →
        suspected fraud, not registered.
      </p>
      <div className="serialrow">
        <span>Serial: <code>{cyl.serial}</code></span>
        <span>Foot ring: <code>{cyl.footRingSerial}</code></span>
        <span>QR plate: <code>{cyl.qrSerial}</code></span>
      </div>
      {v.fraudFlag ? (
        <p className="urgent">fraud_flag=True — kept visible for NPA/GNFS, not silently dropped.</p>
      ) : null}
      <div className="photoproof" aria-label="Combined photo proof">
        <div className="photoframe">
          <span>Photo proof — foot-ring stamp + QR plate, same frame</span>
          <strong>
            {cyl.photoProof.footStamp} = {cyl.photoProof.qrPlate}
          </strong>
          <em>{cyl.photoProof.note}</em>
        </div>
      </div>
      <div className="telegrid">
        <div className="tele"><span className="tele-k">GA address</span><span className="tele-v">{house.digitalAddress}</span></div>
        <div className="tele"><span className="tele-k">Lat / Lng</span><span className="tele-v">{house.lat}, {house.lng}</span></div>
        <div className="tele"><span className="tele-k">Gross / Tare</span><span className="tele-v">{cyl.grossKg} / {cyl.tareKg} kg</span></div>
        <div className="tele"><span className="tele-k">Load cell</span><span className="tele-v">{cyl.kind === "HOME" ? `HOME ${HOME_CELL} cell` : `COMMERCIAL ${COMMERCIAL_CELL} cell`}</span></div>
      </div>
    </div>
  );
}

function HistoryList({ cyl }) {
  if (!cyl.history || cyl.history.length === 0)
    return <p className="muted">No swaps logged yet for this cylinder.</p>;
  return (
    <ul className="history">
      {cyl.history.map((h, i) => (
        <li key={i} className={h.fraudFlag ? "fraud" : ""}>
          <div className="hist-head">
            <strong>{h.event}</strong> <Badge badge={h.badge || matchBadge(h.serialMatch)} />
          </div>
          <div className="muted">{h.at} · {h.address}</div>
          <div>
            old <code>{h.oldSerial}</code> → new <code>{h.newSerial}</code>
          </div>
          <div>
            foot <code>{h.footRingSerial}</code> vs QR <code>{h.qrSerial}</code>
            {h.fraudFlag ? <span className="urgent"> fraud_flag=True — kept visible</span> : null}
          </div>
          <div className="muted">
            weights: {h.oldWeightKg ?? "—"} → {h.newWeightKg ?? "—"} kg
          </div>
        </li>
      ))}
    </ul>
  );
}

function CylinderDetail({ cyl, house, onRequestRefill, onAdvanceRider }) {
  return (
    <div className="detail">
      <div className="detail-grid">
        <div className="panel">
          <h4>Floor Unit — {cyl.serial}</h4>
          <p className="muted">
            {cyl.kind} {cyl.sizeKg}kg · {cyl.kind === "HOME" ? `50kg cell` : `150kg cell`} ·{" "}
            <StatusPill status={cyl.status} />
          </p>
          <FloorGrid cyl={cyl} />
        </div>
        <div className="panel">
          <h4>Ceiling Unit — {house.ceiling ? house.ceiling.deviceId : "—"}</h4>
          <CeilingGrid ceiling={house.ceiling} />
        </div>
      </div>
      <div className="detail-grid">
        <RefillPanel
          cyl={cyl}
          houseUnit={house.unit}
          onRequestRefill={onRequestRefill}
          onAdvanceRider={onAdvanceRider}
        />
        <ValidationPanel cyl={cyl} house={house} />
      </div>
      <div className="panel">
        <h4>History</h4>
        <HistoryList cyl={cyl} />
      </div>
    </div>
  );
}

function CylinderSummary({ cyl, expanded, onToggle }) {
  const left = kgLeft(cyl.grossKg, cyl.tareKg);
  return (
    <div className="cylsum">
      <button className="cylbtn" onClick={onToggle} aria-expanded={expanded}>
        <strong>
          {cyl.kind} {cyl.sizeKg}kg
        </strong>{" "}
        {cyl.grossKg}kg gross <StatusPill status={cyl.status} />{" "}
        <span className="muted">Batt {cyl.batteryPct}%</span>{" "}
        <span className="muted">{cyl.serial}</span>
        <span className="muted"> · {left}kg left</span>
      </button>
    </div>
  );
}

export default function HouseTable(props) {
  const { houses, expandedId, onToggleExpand, onRequestRefill, onAdvanceRider } = props;
  return (
    <div className="tablewrap">
      <table className="htable">
        <thead>
          <tr>
            <th>UNIT</th>
            <th>RESIDENT</th>
            <th>ADDRESS</th>
            <th>CYLINDERS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((h) => (
            <React.Fragment key={h.unit}>
              <tr>
                <td><strong>{h.unit}</strong></td>
                <td>{h.resident}</td>
                <td>
                  {h.address} {h.digitalAddress}
                </td>
                <td>
                  {h.cylinders.map((c) => (
                    <CylinderSummary
                      key={c.id}
                      cyl={c}
                      expanded={expandedId === c.id}
                      onToggle={() => onToggleExpand(c.id)}
                    />
                  ))}
                </td>
                <td>
                  <a
                    className="btn maps"
                    href={mapsUrl(h.lat, h.lng)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Maps
                  </a>
                </td>
              </tr>
              {h.cylinders
                .filter((c) => c.id === expandedId)
                .map((c) => (
                  <tr key={c.id + "-detail"} className="detailrow">
                    <td colSpan={5}>
                      <CylinderDetail
                        cyl={c}
                        house={h}
                        onRequestRefill={onRequestRefill}
                        onAdvanceRider={onAdvanceRider}
                      />
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {houses.length === 0 ? <p className="muted pad">No houses match this filter.</p> : null}
    </div>
  );
}
