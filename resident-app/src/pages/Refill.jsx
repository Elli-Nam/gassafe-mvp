import React from 'react';
import { Link } from 'react-router-dom';
import { useGas } from '../lib/store.jsx';
import { KV, LevelBar, Pill, fmtTime } from '../components/ui.jsx';
import { THRESHOLDS } from '../lib/api.js';

const FLOW_LABEL = {
  none: 'No active request',
  requested: 'Requested — waiting for rider assignment',
  rider_en_route: 'Rider en route to you',
  picked_up: 'Picked up — empty cylinder with rider',
  at_filling_plant: 'At filling plant',
  returning: 'Returning with full cylinder',
  delivered: 'Delivered',
};

export default function Refill() {
  const { level, demo, requestRefill, advanceRefill } = useGas();
  const refill = demo.refill;
  const warn = level.pct < THRESHOLDS.refillWarnPct;
  const urgent = level.pct < THRESHOLDS.refillUrgentPct;
  const empty = level.kgLeft <= 0;

  return (
    <div>
      <h1 className="page-title">Refill</h1>
      <p className="page-sub">Reminders nudge — only you dispatch a rider.</p>

      <div className="card">
        <h3>Cylinder level</h3>
        <div className="big-reading">{level.kgLeft.toFixed(1)} <small>kg · {Math.round(level.pct)}%</small></div>
        <div style={{ margin: '10px 0' }}><LevelBar pct={level.pct} /></div>
        {urgent || empty ? (
          <div className="alert-banner leak">
            <h4>Almost empty — about 1 day left</h4>
            <p>Tap to request pickup. A rider collects the empty cylinder and returns a full, verified one.</p>
          </div>
        ) : warn ? (
          <div className="alert-banner smoke">
            <h4>Gas will run out in ~2–3 days at current usage. Plan a refill?</h4>
            <p>Reminder only — no rider is dispatched until you tap “Request refill”.</p>
          </div>
        ) : (
          <p className="hint">Level healthy. Reminders appear under {THRESHOLDS.refillWarnPct}% (plan) and {THRESHOLDS.refillUrgentPct}% (urgent).</p>
        )}
        <div className="btn-row">
          {refill.status === 'none' || refill.status === 'delivered' ? (
            <button className="btn primary" onClick={requestRefill}>Request refill — dispatch rider pickup</button>
          ) : (
            <button className="btn" onClick={advanceRefill}>Advance status (demo): next step</button>
          )}
          <Link className="btn ghost" to="/history">Verify past deliveries</Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Pickup + return tracking</h3>
        <p className="hint">{FLOW_LABEL[refill.status]}{refill.updatedAt ? ` · updated ${fmtTime(refill.updatedAt)}` : ''}</p>
        {refill.timeline.length === 0 && <p className="hint">No active refill. Statuses run: requested → rider_en_route → picked_up → at_filling_plant → returning → delivered.</p>}
        <ul className="timeline">
          {refill.timeline.map((t, i) => (
            <li key={i} className={i === refill.timeline.length - 1 ? 'now' : 'done'}>
              <span className="dot" />
              <div><strong>{t.status.replace(/_/g, ' ')}</strong><time>{fmtTime(t.at)}</time></div>
            </li>
          ))}
        </ul>
        <KV k="FCM push" v={<span><small>status change → high-priority push (placeholder)</small></span>} />
      </div>
    </div>
  );
}
