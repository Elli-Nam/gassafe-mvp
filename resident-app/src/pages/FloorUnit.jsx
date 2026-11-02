import React, { useState } from 'react';
import { useGas } from '../lib/store.jsx';
import { KV, LevelBar, Pill, fmtTime, rssiLabel, rssiTone, timeAgo } from '../components/ui.jsx';

export default function FloorUnit() {
  const { floor, level, tareReset, setFlame, simulate } = useGas();
  const [confirming, setConfirming] = useState(false);
  const days = Number.isFinite(level.daysLeft) ? level.daysLeft.toFixed(1) : '—';

  return (
    <div>
      <h1 className="page-title">Floor Unit</h1>
      <p className="page-sub">Load cell under the cylinder · gross − tare = gas left.</p>

      <div className="grid two">
        <div className="card">
          <h3>Weight</h3>
          <p className="hint">kg left = gross_kg − tare_kg</p>
          <div className="big-reading">{level.kgLeft.toFixed(2)} <small>kg left</small></div>
          <div style={{ margin: '10px 0' }}><LevelBar pct={level.pct} /></div>
          <KV k="Remaining" v={`${Math.round(level.pct)}% of a full cylinder`} />
          <KV k="Gross (load cell)" v={<span>{floor.grossKg.toFixed(2)} <small>kg</small></span>} />
          <KV k="Tare (empty cylinder)" v={<span>{floor.tareKg.toFixed(2)} <small>kg</small></span>} />
          <KV k="Avg daily usage" v={<span>{floor.avgDailyUsageKg.toFixed(2)} <small>kg / day</small></span>} />
          <KV k="Estimated days left" v={<span>{days} <small>days</small></span>} />
          {!confirming ? (
            <div className="btn-row">
              <button className="btn" onClick={() => setConfirming(true)}>Tare reset</button>
            </div>
          ) : (
            <div className="btn-row">
              <span style={{ fontSize: 13 }}>Set tare to current gross ({floor.grossKg.toFixed(2)} kg)? Do this with the empty cylinder on the scale.</span>
              <button className="btn primary" onClick={() => { tareReset(); setConfirming(false); }}>Confirm tare</button>
              <button className="btn ghost" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Safety sensors</h3>
          <p className="hint">Combustion + environment at floor level</p>
          <KV k="Flame" v={floor.flameOn ? <Pill tone="amber">ON</Pill> : <Pill tone="grey">OFF</Pill>} />
          <KV k="Gas (ppm)" v={floor.gasPpm > 1000 ? <Pill tone="red">LEAK · {floor.gasPpm} ppm</Pill> : `${floor.gasPpm} ppm`} />
          <KV k="Cylinder temperature" v={`${floor.cylinderTempC.toFixed(1)} °C`} />
          <KV k="Calibration" v={floor.calibrated ? <Pill tone="green">CALIBRATED</Pill> : <Pill tone="red">NOT CALIBRATED</Pill>} />
          <KV k="Battery" v={<span>{floor.batteryPct}% <small>· {floor.batteryVoltage.toFixed(2)} V</small></span>} />
          <KV k="LoRa RSSI" v={<Pill tone={rssiTone(floor.loraRssi)}>{rssiLabel(floor.loraRssi)}</Pill>} />
          <KV k="Last seen" v={`${fmtTime(floor.lastSeen)} (${timeAgo(floor.lastSeen)})`} />
          <div className="btn-row">
            <button className="btn" onClick={() => setFlame(!floor.flameOn)}>{floor.flameOn ? 'Simulate flame OFF' : 'Simulate flame ON'}</button>
            <button className="btn ghost" onClick={() => simulate({ floor: { grossKg: Math.max(0, floor.grossKg - 0.5) } })}>−0.5 kg demo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
