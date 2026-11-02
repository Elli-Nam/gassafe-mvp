import React from "react";
import { normalize, serialsMatch, sendHighPriorityPush } from "../lib/gassafe.js";

// ---------------------------------------------------------------- Siren
// WebAudio two-tone siren loop. Runs until the alarm is acknowledged.
// Note: a phone silent switch can still mute WebAudio — FCM high-priority
// push (sendHighPriorityPush) covers real deployments.

function startSiren() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return () => {};
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 660;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  let high = true;
  const timer = setInterval(() => {
    high = !high;
    osc.frequency.setValueAtTime(high ? 660 : 880, ctx.currentTime);
  }, 450);
  return () => {
    clearInterval(timer);
    try { osc.stop(); } catch (e) { /* already stopped */ }
    ctx.close();
  };
}

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) { /* vibration unsupported */ }
}

export function AlarmOverlay({ alarms, onAcknowledge, onEscalateNow }) {
  const active = alarms.filter((a) => !a.acknowledged);
  const shown = active[0];

  React.useEffect(() => {
    if (!shown) return undefined;
    const stop = startSiren();
    buzz([400, 200, 400, 200, 800]);
    const rep = setInterval(() => buzz([400, 200, 400, 200, 800]), 3000);
    return () => {
      clearInterval(rep);
      stop();
    };
  }, [shown ? shown.id : null]);

  if (!shown) return null;
  return (
    <div className="overlay" role="alertdialog" aria-live="assertive">
      <div className="alarmcard">
        <h2>{shown.title}</h2>
        <p>{shown.body}</p>
        <p className="muted">
          {shown.houseUnit} · raised {shown.raisedAt}
          {shown.escalated ? " · escalated to Family Circle + Estate Manager" : ""}
        </p>
        <div className="alarmbtns">
          <button className="btn danger" onClick={() => onAcknowledge(shown.id)}>
            Acknowledge — I am checking
          </button>
          {!shown.escalated ? (
            <button className="btn small" onClick={() => onEscalateNow(shown.id)}>
              Escalate now (drill)
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Drills
export function SafetyDrills({ onDrill }) {
  return (
    <div className="panel">
      <h4>Safety drills (demo)</h4>
      <p className="muted">
        Trigger a live alarm path to rehearse the estate response. No response within 2 min
        escalates to the Family Circle and the Estate Manager.
      </p>
      <div className="drillbtns">
        <button className="btn small" onClick={() => onDrill("cooker")}>
          Simulate cooker left on
        </button>
        <button className="btn small" onClick={() => onDrill("burning")}>
          Simulate food burning
        </button>
        <button className="btn small" onClick={() => onDrill("leak")}>
          Simulate gas leak
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Gate pass
export function GuardPanel({ houses, gateLog, onGateScan }) {
  const [value, setValue] = React.useState("");
  const [result, setResult] = React.useState(null);

  function scan() {
    const serial = normalize(value);
    let found = null;
    houses.forEach((h) =>
      h.cylinders.forEach((c) => {
        if (normalize(c.serial) === serial) found = { house: h, cyl: c };
      })
    );
    if (!found) {
      setResult({ ok: false, text: `Unknown serial ${serial || "(empty)"} — hold at gate.` });
      onGateScan(serial, false);
      return;
    }
    const ok = serialsMatch(found.cyl.footRingSerial, found.cyl.qrSerial);
    setResult({
      ok,
      text: ok
        ? `GREEN MATCH — ${found.house.unit} ${found.house.resident}. Open gate pass.`
        : `RED FRAUD — foot ${found.cyl.footRingSerial} != QR ${found.cyl.qrSerial}. Hold cylinder, call NPA/GNFS.`,
    });
    onGateScan(serial, ok);
  }

  return (
    <div className="panel">
      <h4>Gate pass scan (Security Guard)</h4>
      <p className="muted">Scan the cylinder QR at the gate. Bottom ring must equal the QR serial.</p>
      <div className="gaterow">
        <input
          className="search"
          placeholder="Scan or type serial e.g. NPA-CRM-GH-001"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") scan(); }}
          aria-label="Gate scan serial"
        />
        <button className="btn" onClick={scan}>Validate</button>
      </div>
      {result ? <p className={result.ok ? "okline" : "urgent"}>{result.text}</p> : null}
      {gateLog.length > 0 ? (
        <ul className="risklist">
          {gateLog.map((g, i) => (
            <li key={i}>
              <span className="muted">{g.at}</span> <code>{g.serial}</code>{" "}
              {g.ok ? "PASS" : "HOLD"}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export async function escalateAlarm(alarm) {
  await sendHighPriorityPush({
    title: alarm.title,
    body: `${alarm.houseUnit}: no response in 2 min. Notifying Family Circle + Estate Manager.`,
  });
}
