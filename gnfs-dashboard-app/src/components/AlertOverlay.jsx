import { useEffect, useRef } from "react";
import { sendHighPriorityPush } from "../lib/gassafe.js";

// Full-screen loud alarm. Sound loop + vibration until acknowledged.
// Escalate = alert GNFS field officers + Family Circle + estate security.
export default function AlertOverlay({ alert, drill, onAck, onEscalate }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!alert) return;
    sendHighPriorityPush({
      title: `Gas ${alert.sensor} — ${alert.unit}`,
      body: `${alert.reading} @ ${alert.digitalAddress}`,
      tag: alert.id,
    }).catch(() => {});
    // Vibrate pattern (mobile) until acknowledged.
    try {
      if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 800]);
    } catch { /* noop */ }
    // WebAudio siren loop — stops on unmount / acknowledge.
    let ctx = null;
    let timer = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        const beep = (f, t, d) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "square";
          o.frequency.value = f;
          g.gain.value = 0.06;
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + d);
        };
        const loop = () => {
          if (!ctx) return;
          const t = ctx.currentTime;
          beep(880, t, 0.22);
          beep(660, t + 0.28, 0.22);
          beep(880, t + 0.56, 0.22);
        };
        loop();
        timer = setInterval(loop, 1200);
      }
    } catch { /* audio unavailable — visual alarm still shows */ }
    return () => {
      if (timer) clearInterval(timer);
      if (ctx) ctx.close().catch(() => {});
      try {
        if (navigator.vibrate) navigator.vibrate(0);
      } catch { /* noop */ }
    };
  }, [alert]);

  if (!alert) return null;
  const headline =
    alert.sensor === "LEAK" ? `Gas leak detected — ${alert.unit} ${alert.household}`
    : alert.sensor === "COOK" ? `Cooker left on? Check kitchen — ${alert.unit}`
    : alert.sensor === "SMOKE" ? `Food burning! Check cooker — ${alert.unit}`
    : `Gas ${alert.sensor} alert — ${alert.unit} ${alert.household}`;

  return (
    <div className="overlay" role="alertdialog" aria-modal="true" aria-label="Gas safety alarm">
      <div className="alarm-box">
        <span className="badge red">LOUD ALARM · {alert.sensor} · {drill ? "DRILL — TRAINING MODE" : "LIVE"}</span>
        <h2>{headline}</h2>
        <p>
          <strong>{alert.reading}</strong>
          <br />
          {alert.category} {alert.sizeKg}kg · {alert.npaCode} · {alert.digitalAddress} · {alert.district}, {alert.region}
          <br />
          Raised {alert.raisedLabel} · gas {alert.gasPpm} ppm · smoke {alert.smokePpm} ppm · temp {alert.tempC}°C
        </p>
        {alert.sensor === "COOK" && <p><strong>Cooker left on? Check kitchen 30+ min</strong> — flame ON with no PIR motion or weight change. Alarm loops even if the phone is silent until acknowledged.</p>}
        {alert.sensor === "SMOKE" && alert.flameOn && <p><strong>Food burning! Check cooker!</strong> — smoke rising while flame is ON.</p>}
        {drill && <p><span className="badge amber">DRILL</span> Escalate now immediately alerts GNFS field officers, Family Circle and estate security. Logged as training — trolley + 2 officers for COMMERCIAL.</p>}
        <div className="alarm-actions">
          <button className="btn-ack" onClick={onAck} autoFocus>Acknowledge — I am checking</button>
          <button className="btn-esc" onClick={onEscalate}>Escalate now{drill ? " (drill)" : ""}</button>
        </div>
      </div>
      <audio ref={audioRef} hidden />
    </div>
  );
}
