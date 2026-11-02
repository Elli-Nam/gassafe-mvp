import React from 'react';
import { Link } from 'react-router-dom';
import { useGas } from '../lib/store.jsx';
import { KV, LevelBar, Pill, fmtTime, rssiLabel, rssiTone, timeAgo } from '../components/ui.jsx';

export default function Dashboard() {
  const { floor, ceiling, level, alerts, simulate, tick } = useGas();
  const leak = alerts.some((a) => a.kind === 'LEAK');
  const days = Number.isFinite(level.daysLeft) ? `${level.daysLeft.toFixed(1)} days` : '—';

  return (
    <div>
      <h1 className="page-title">Good evening, Ama</h1>
      <p className="page-sub">14 Osu Badu St, Accra · one cylinder, two sensors, watched continuously.</p>

      <div className="demo-bar">
        <strong>Pitch demo</strong>
        <span>Fire scenarios without hardware:</span>
        <button className="btn" onClick={() => simulate({ floor: { gasPpm: 2400 }, ceiling: { smokePpm: 420 } })}>Gas leak</button>
        <button className="btn" onClick={() => simulate({ floor: { flameOn: true }, ceiling: { flameIr: true, smokePpm: 380 }, root: { flameOnSince: new Date(Date.now() - 31 * 60000).toISOString() } })}>Cooker left on</button>
        <button className="btn" onClick={() => simulate({ floor: { grossKg: 6.6 } })}>Low gas</button>
        <button className="btn ghost" onClick={tick}>Refresh sensors</button>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Cylinder level</h3>
          <p className="hint">Floor Unit · load cell</p>
          <div className="big-reading">{level.kgLeft.toFixed(1)} <small>kg left · {Math.round(level.pct)}%</small></div>
          <div style={{ margin: '10px 0' }}><LevelBar pct={level.pct} /></div>
          <KV k="Estimated days left" v={days} />
          <KV k="Flame" v={floor.flameOn ? <Pill tone="amber">ON</Pill> : <Pill tone="grey">OFF</Pill>} />
          <KV k="Gas" v={leak ? <Pill tone="red">LEAK</Pill> : `${floor.gasPpm} ppm`} />
          <div className="btn-row"><Link className="btn" to="/floor">Floor Unit detail</Link></div>
        </div>

        <div className="card">
          <h3>Kitchen air</h3>
          <p className="hint">Ceiling Unit · {ceiling.deviceId}</p>
          <KV k="Smoke (MQ-2)" v={`${ceiling.smokePpm} ppm`} />
          <KV k="Gas (MQ-5)" v={`${ceiling.gasPpmMq5} ppm`} />
          <KV k="Kitchen temp (DHT22)" v={`${ceiling.kitchenTempC.toFixed(1)} °C`} />
          <KV k="Motion (PIR)" v={ceiling.pirMotion ? <Pill tone="blue">MOTION</Pill> : <Pill tone="grey">NO MOTION</Pill>} />
          <KV k="LoRa link" v={ceiling.loraLinked ? <Pill tone="green">LINKED</Pill> : <Pill tone="red">DISCONNECTED</Pill>} />
          <div className="btn-row"><Link className="btn" to="/ceiling">Ceiling Unit detail</Link></div>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 12 }}>
        <div className="card">
          <h3>Latest alerts</h3>
          <p className="hint">From POST /api/lora-gas/webhook → GET /api/alerts</p>
          {alerts.length === 0 && <p className="hint">No alerts. Sensors quiet.</p>}
          {alerts.slice(0, 3).map((a) => (
            <div key={a.id} className={`alert-banner ${a.kind.toLowerCase()}`}>
              <h4>{a.kind} · {a.severity}</h4>
              <p>{a.message}</p>
              <time>{fmtTime(a.at)} ({timeAgo(a.at)})</time>
            </div>
          ))}
          <div className="btn-row"><Link className="btn" to="/alerts">All alerts</Link></div>
        </div>
        <div className="card">
          <h3>Connectivity</h3>
          <p className="hint">Last contact</p>
          <KV k="Floor last seen" v={`${timeAgo(floor.lastSeen)}`} />
          <KV k="Floor LoRa RSSI" v={<Pill tone={rssiTone(floor.loraRssi)}>{rssiLabel(floor.loraRssi)}</Pill>} />
          <KV k="Ceiling heartbeat" v={`${timeAgo(ceiling.lastHeartbeat)}`} />
          <KV k="Wi-Fi" v={ceiling.wifiConnected ? <Pill tone="green">CONNECTED</Pill> : <Pill tone="red">OFFLINE</Pill>} />
        </div>
      </div>
    </div>
  );
}
