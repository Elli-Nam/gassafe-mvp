import React, { useState } from 'react';
import { useGas } from '../lib/store.jsx';
import { fmtTime, timeAgo } from '../components/ui.jsx';
import { THRESHOLDS } from '../lib/api.js';
import { pushLog } from '../lib/fcm.js';

export default function AlertsPage() {
  const { alerts, ingest } = useGas();
  const [pushes] = useState(() => pushLog());
  const [sending, setSending] = useState(false);

  const fireWebhook = async (payload) => {
    setSending(true);
    await ingest(payload); // POST /api/lora-gas/webhook
    setSending(false);
  };

  return (
    <div>
      <h1 className="page-title">Alerts</h1>
      <p className="page-sub">
        Live from GET /api/alerts · rules: gas_ppm &gt; {THRESHOLDS.gasLeakPpm} → LEAK (RED) · smoke &gt; {THRESHOLDS.smokePpm} ppm → SMOKE · flame → FLAME.
      </p>

      <div className="demo-bar">
        <strong>Trigger via webhook</strong>
        <button className="btn" disabled={sending} onClick={() => fireWebhook({ gas_ppm: 2400, flame_on: false, smoke_ppm: 40 })}>POST leak payload</button>
        <button className="btn" disabled={sending} onClick={() => fireWebhook({ gas_ppm: 150, smoke_ppm: 520, flame_ir: false })}>POST smoke payload</button>
        <button className="btn" disabled={sending} onClick={() => fireWebhook({ gas_ppm: 200, flame_on: true, flame_ir: true })}>POST flame payload</button>
      </div>

      {alerts.length === 0 && (
        <div className="card"><p className="hint">No alerts yet. Sensors quiet — trigger a webhook payload above to rehearse the pitch.</p></div>
      )}
      {alerts.map((a) => (
        <div key={a.id} className={`alert-banner ${a.kind.toLowerCase().split('_')[0]}`}>
          <h4>{a.kind} · {a.severity}</h4>
          <p>{a.message}</p>
          <time>{fmtTime(a.at)} ({timeAgo(a.at)})</time>
        </div>
      ))}

      <div className="card" style={{ marginTop: 12 }}>
        <h3>FCM high-priority push — placeholder log</h3>
        <p className="hint">Every alert above queues a push (LEAK, SMOKE, FLAME, cooker-left-on, food-burning, low gas). Live FCM needs firebaseConfig + a registered token; until then pushes render via the service worker when the app is open.</p>
        {pushes.length === 0 && <p className="hint">No pushes queued yet.</p>}
        {pushes.slice(0, 8).map((p, i) => (
          <div className="kv" key={i}>
            <span className="k">{p.title}</span>
            <span className="v"><small>{p.simulated ? 'simulated' : 'sent'} · {timeAgo(p.at)}</small></span>
          </div>
        ))}
      </div>
    </div>
  );
}
