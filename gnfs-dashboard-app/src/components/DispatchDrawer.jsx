import { useState } from "react";
import { OFFICERS } from "../data/seed.js";

const FLOW = ["PENDING", "DISPATCHED", "EN_ROUTE", "ON_SCENE", "RESOLVED"];

// Assign GNFS field officers to LEAK/BURST. Photo proof required to resolve.
// Works offline: writes keep a queued flag and sync when the gateway is back.
export default function DispatchDrawer({ alert, onClose, onUpdate }) {
  const [officers, setOfficers] = useState(alert?.dispatch?.officers || []);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(alert?.dispatch?.photo || "");
  const [msg, setMsg] = useState("");

  if (!alert) return null;
  const stage = alert.dispatch?.stage || alert.status || "PENDING";
  const commercial = alert.category === "COMMERCIAL";

  const toggle = (id) => {
    setOfficers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const save = (nextStage) => {
    if ((nextStage === "DISPATCHED" || nextStage === "EN_ROUTE") && officers.length === 0) {
      setMsg("Assign at least one GNFS field officer first.");
      return;
    }
    if (commercial && (nextStage === "DISPATCHED" || nextStage === "EN_ROUTE") && officers.length < 2) {
      setMsg("COMMERCIAL needs trolley + 2 officers per GNFS SOP.");
      return;
    }
    if (nextStage === "RESOLVED" && !photo.trim()) {
      setMsg("Photo proof of resolution is required before RESOLVED.");
      return;
    }
    const offline = alert.gateway && (alert.gateway.lora !== "LINKED" || alert.gateway.twin === "OFFLINE-STORE");
    onUpdate(alert.id, {
      stage: nextStage,
      officers,
      note,
      photo,
      at: new Date().toISOString(),
      queued: Boolean(offline),
    });
    setMsg(offline ? "Gateway offline — saved to on-device twin, will sync when back." : "Dispatch updated.");
  };

  return (
    <div className="drawer" role="dialog" aria-label={`Dispatch ${alert.unit}`}>
      <div className="drawer-h">
        <h3>Dispatch — {alert.unit} · {alert.sensor} · {alert.digitalAddress}</h3>
        <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>
          {alert.household} · {alert.district}, {alert.region} · {alert.sizeKg}kg {alert.category} ({alert.cell} cell)
          {commercial && " · needs trolley + 2 officers"}
        </div>
        <div className="steps" style={{ marginTop: 8 }}>
          {FLOW.map((s) => (
            <span key={s} className={`step${FLOW.indexOf(stage) >= FLOW.indexOf(s) ? " on" : ""}`}>{s.replace("_", " ")}</span>
          ))}
        </div>
      </div>
      <div className="drawer-b">
        <label>GNFS field officers (tracked live)</label>
        {OFFICERS.filter((o) => alert.region === "Greater Accra" || o.station).slice(0, 6).map((o) => (
          <label key={o.id} style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 500, color: "#0f172a", margin: "6px 0" }}>
            <input type="checkbox" checked={officers.includes(o.id)} onChange={() => toggle(o.id)} />
            <span>{o.id} · {o.name} · {o.rank} · {o.station} · {o.phone}</span>
          </label>
        ))}
        <label htmlFor="dsp-note">Officer note / location ping</label>
        <input id="dsp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. En route from East Legon Hills post" />
        <label htmlFor="dsp-photo">Photo proof of resolution (required for RESOLVED)</label>
        <input id="dsp-photo" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="photo://resolution-frame-id or file ref" />
        {msg && <p style={{ color: "#b45309", fontWeight: 700 }}>{msg}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button className="dispatch-btn" style={{ width: "auto", flex: 1 }} onClick={() => save("DISPATCHED")}>DISPATCH TEAM NOW</button>
          <button className="ghost-btn" style={{ width: "auto", flex: 1 }} onClick={() => save("EN_ROUTE")}>En route</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button className="ghost-btn" style={{ width: "auto", flex: 1 }} onClick={() => save("ON_SCENE")}>On scene</button>
          <button className="ghost-btn" style={{ width: "auto", flex: 1 }} onClick={() => save("RESOLVED")}>Resolved + photo</button>
        </div>
        <button className="ghost-btn" onClick={onClose}>Close</button>
        <p className="footer-note">LEAK / BURST auto-require dispatch. COMMERCIAL requires trolley + 2 officers. Offline edits queue on the device twin and sync when the gateway link returns.</p>
      </div>
    </div>
  );
}
