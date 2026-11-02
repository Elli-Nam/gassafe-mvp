import { kgLeft, remainingPct, daysLeft, refillSignal, validationVerdict } from "../lib/gassafe.js";
import { ANALYTICS } from "../data/seed.js";

export function AnalyticsPanel({ rows }) {
  const home = rows.filter((r) => r.category === "HOME").length;
  const com = rows.filter((r) => r.category === "COMMERCIAL").length;
  const total = Math.max(1, home + com);
  return (
    <div className="panel">
      <div className="panel-h"><h2>Analytics</h2><span className="hint">Gated estate registry + live slice</span></div>
      <div className="list">
        <div className="list-row"><span>TOTAL HOUSES <strong>{ANALYTICS.totalHouses}</strong></span><span className="badge dark">registry</span></div>
        <div className="list-row"><span>TOTAL CYLINDERS <strong>{ANALYTICS.activeCylinders}/{ANALYTICS.totalCylinders}</strong> Active</span><span className="badge grey">pool</span></div>
        <div className="list-row"><span>ACTIVE LEAKS <strong>{ANALYTICS.activeLeaks}</strong></span><span className="badge red">Needs GNFS dispatch</span></div>
        <div className="list-row"><span>COMMERCIAL COUNT <strong>{ANALYTICS.commercialCount}</strong></span><span className="badge red">trolley + 2 officers</span></div>
        <div style={{ marginTop: 8 }}>
          <strong>HOME vs COMMERCIAL Scale Distribution</strong>
          <div style={{ fontSize: 12, marginTop: 4 }}>HOME 50kg cell — bar {ANALYTICS.homeCount}</div>
          <div className="bar"><i style={{ width: `${(ANALYTICS.homeCount / 7) * 100}%` }} /></div>
          <div style={{ fontSize: 12, marginTop: 6 }}>COMMERCIAL 150kg cell — bar {ANALYTICS.commercialCount}</div>
          <div className="bar"><i className="com" style={{ width: `${(ANALYTICS.commercialCount / 7) * 100}%` }} /></div>
          <div className="footer-note">Live slice in view: HOME {home} · COMMERCIAL {com} of {total} rows.</div>
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>At-Risk Houses</strong>
          {ANALYTICS.atRisk.map((r) => (
            <div className="list-row" key={r.unit}><span>{r.unit} · {r.kind} · {r.addr}</span><span className="badge red">{r.kind}</span></div>
          ))}
        </div>
        <div style={{ marginTop: 8 }}>
          <strong>Battery Low &lt;85%</strong>
          {ANALYTICS.batteryLow.map((b) => (
            <div className="list-row" key={b.unit}><span>{b.unit} · {b.code}</span><span className="badge amber">{b.pct}%</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function csv(rows) {
  const head = "unit,household,digital_address,npa_code,serial,foot_ring_serial,qr_serial,fraud_flag,district,region,sensor,reading\n";
  const body = rows
    .map((r) => [r.unit, `"${r.household}"`, r.digitalAddress, r.npaCode, r.serial, r.footRingSerial, r.qrSerial, "True", r.district, r.region, r.sensor, `"${r.reading}"`].join(","))
    .join("\n");
  return head + body;
}

export function FraudPanel({ rows, canExport }) {
  const frauds = rows.filter((r) => validationVerdict(r).fraudFlag);
  const download = () => {
    const blob = new Blob([csv(frauds.length ? frauds : rows.filter(() => false))], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "npa-fraud-report-national.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="panel">
      <div className="panel-h">
        <h2>Fraud &amp; NPA</h2>
        <span className="hint">foot_ring ≠ QR kept visible · never silently dropped</span>
        <span style={{ flex: 1 }} />
        {canExport && <button className="export-btn" onClick={download}>Export NPA report (national CSV)</button>}
      </div>
      <div className="table-scroll">
        <table className="fraud-table">
          <thead><tr><th>Unit</th><th>Serials</th><th>Verdict</th><th>Proof</th></tr></thead>
          <tbody>
            {frauds.length === 0 && <tr><td colSpan={4}>No fraud in current filter — badges stay GREEN.</td></tr>}
            {frauds.map((r) => {
              const v = validationVerdict(r);
              return (
                <tr key={r.id}>
                  <td><strong>{r.unit}</strong><br /><span className="mono">{r.digitalAddress} · {r.district}</span></td>
                  <td className="mono">foot {r.footRingSerial}<br />QR&nbsp;&nbsp;&nbsp; {r.qrSerial}<br />file&nbsp; {r.serial}</td>
                  <td><span className="badge red">RED FRAUD</span><br /><span className="mono">fraud_flag=True</span><span style={{ display: "none" }}>{v.badge}</span></td>
                  <td style={{ fontSize: 12 }}>combined photo {r.photoProof}<br />{r.category} · rider stamp · {r.household}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RefillPanel({ rows }) {
  const items = rows.slice(0, 8).map((r) => {
    const left = kgLeft(r.gross, r.tare);
    const gasKg = r.sizeKg;
    const pct = remainingPct(left, gasKg);
    return { r, left, pct, days: daysLeft(left, r.avgDaily), sig: refillSignal(pct) };
  });
  return (
    <div className="panel">
      <div className="panel-h"><h2>Refill &amp; level</h2><span className="hint">kg_left = gross − tare · &lt;20% reminder · &lt;5% urgent · ≤0 dispatch</span></div>
      <div className="list">
        {items.map(({ r, left, pct, days, sig }) => (
          <div className="list-row" key={r.id}>
            <span><strong>{r.unit}</strong> · {r.sizeKg}kg {r.category} · left {left}kg ({pct}%){days != null && ` · ~${days}d`} <br /><span style={{ color: "#5b6b82" }}>{sig.title}{sig.body ? ` — ${sig.body}` : ""}</span></span>
            <span className={`badge ${sig.level === "ok" ? "green" : sig.level === "reminder" ? "amber" : "red"}`}>{sig.level.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConnectivityPanel({ rows }) {
  return (
    <div className="panel">
      <div className="panel-h"><h2>Connectivity</h2><span className="hint">Floor last-seen · LoRa RSSI · ceiling heartbeat · gateway twin fallback</span></div>
      <div className="list">
        {rows.slice(0, 8).map((r) => (
          <div className="list-row" key={r.id}>
            <span><strong>{r.unit}</strong> · floor {r.lastSeenMinAgo}m ago · LoRa {r.floorRssi} dBm<br />
              <span style={{ color: "#5b6b82" }}>Ceiling ♥ {r.heartbeatMinAgo}m · WiFi {r.wifiRssi} dBm {r.gateway.wifi} · Cell {r.gateway.sim} {r.gateway.cellular} · LoRa {r.gateway.lora} · twin {r.gateway.twin}</span>
            </span>
            <span className={`badge ${r.gateway.lora === "LINKED" ? "green" : "amber"}`}>{r.gateway.lora === "LINKED" ? "ONLINE" : "TWIN-STORE"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
