import { useEffect, useRef, useState } from "react";
import { ESCALATION_MIN, sendHighPriorityPush } from "../lib/gassafe.js";

/* Full-screen loud alarm: WebAudio siren loop + vibration until acknowledged.
 * Works even if the phone is silent (audio plays through media channel).
 * Escalates to HQ + Family Circle + Estate security after ESCALATION_MIN
 * without acknowledgement. Respects prefers-reduced-motion. */

function useSiren(active) {
  const ctxRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let osc = null;
    let timer = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      ctxRef.current = ctx;
      osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      gain.gain.value = 0.12;
      osc.start();
      let hi = false;
      timer = setInterval(() => {
        if (stopped) return;
        hi = !hi;
        osc.frequency.setValueAtTime(hi ? 880 : 620, ctx.currentTime);
      }, 450);
    } catch {
      /* audio unavailable — visual + vibration still fire */
    }
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      try { osc && osc.stop(); } catch { /* noop */ }
      try { ctxRef.current && ctxRef.current.close(); } catch { /* noop */ }
    };
  }, [active]);
}

function useVibrate(active) {
  useEffect(() => {
    if (!active || !("vibrate" in navigator)) return;
    const timer = setInterval(() => {
      try { navigator.vibrate([400, 200, 400, 200, 800]); } catch { /* noop */ }
    }, 2200);
    try { navigator.vibrate([400, 200, 400, 200, 800]); } catch { /* noop */ }
    return () => clearInterval(timer);
  }, [active]);
}

export default function AlarmOverlay({ alarm, onAcknowledge, onEscalate }) {
  const [secsLeft, setSecsLeft] = useState(ESCALATION_MIN * 60);
  const sounding = !!alarm && !alarm.acked;
  useSiren(sounding);
  useVibrate(sounding);

  useEffect(() => {
    if (!alarm) return;
    setSecsLeft(ESCALATION_MIN * 60);
  }, [alarm ? alarm.key : null]);

  useEffect(() => {
    if (!sounding) return;
    if (secsLeft <= 0) {
      onEscalate({ auto: true });
      return;
    }
    const t = setTimeout(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sounding, secsLeft, onEscalate]);

  if (!alarm) return null;
  const mm = Math.floor(Math.max(0, secsLeft) / 60);
  const ss = String(Math.max(0, secsLeft) % 60).padStart(2, "0");

  return (
    <div className="overlay" role="alertdialog" aria-label={alarm.title}>
      <div className="alarm-box">
        <div className="alarm-tag">{alarm.kind} ALARM · {alarm.unit} · {alarm.addr}</div>
        <h2>{alarm.title}</h2>
        <p>{alarm.body}</p>
        <p className="mono">
          {alarm.reading} · {alarm.district}, {alarm.region}, {alarm.national}
        </p>
        {!alarm.acked ? (
          <p className="esc-count">Auto-escalates to HQ + Family Circle + Estate security in {mm}:{ss}</p>
        ) : (
          <p className="esc-count done">Acknowledged — officer checking. Escalation timer stopped.</p>
        )}
        <div className="alarm-actions">
          {!alarm.acked && (
            <button className="btn-ack" onClick={() => onAcknowledge()}>
              Acknowledge — I am checking
            </button>
          )}
          <button className="btn-esc" onClick={() => onEscalate({ auto: false, drill: alarm.drill })}>
            {alarm.drill ? "Escalate now (drill)" : "Escalate now"}
          </button>
        </div>
      </div>
    </div>
  );
}

export async function escalateAlarm(entry, { auto, drill }) {
  const payload = {
    assignmentId: entry.id,
    unit: entry.unit,
    sensor: entry.sensor,
    reading: entry.reading,
    digitalAddress: entry.digitalAddress,
    district: entry.district,
    region: entry.region,
    national: entry.national,
    auto,
    drill: !!drill,
    ts: new Date().toISOString(),
  };
  await sendHighPriorityPush({
    title: `ESCALATED ${entry.sensor} ${entry.unit}`,
    body: `${entry.digitalAddress} · ${entry.district}, ${entry.region}`,
    data: payload,
  });
  return payload;
}
