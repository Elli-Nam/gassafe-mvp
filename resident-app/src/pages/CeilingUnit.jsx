import React, { useState } from 'react';
import { useGas } from '../lib/store.jsx';
import { KV, Pill, fmtTime, rssiLabel, rssiTone, timeAgo } from '../components/ui.jsx';
import { testBuzzer } from '../lib/sound.js';

export default function CeilingUnit() {
  const { ceiling, testBuzzer: buzz } = useGas();
  const [heard, setHeard] = useState(false);

  const onTest = () => {
    buzz();
    testBuzzer(2); // local audible check on this phone
    setHeard(true);
    setTimeout(() => setHeard(false), 4000);
  };

  return (
    <div>
      <h1 className="page-title">Ceiling Unit</h1>
      <p className="page-sub mono">Device ID: {ceiling.deviceId} · kitchen air + motion + alarm</p>

      <div className="grid two">
        <div className="card">
          <h3>Air sensors</h3>
          <p className="hint">Smoke, gas, heat</p>
          <KV k="Smoke (MQ-2)" v={ceiling.smokePpm > 300 ? <Pill tone="red">SMOKE · {ceiling.smokePpm} ppm</Pill> : `${ceiling.smokePpm} ppm`} />
          <KV k="Gas (MQ-5)" v={ceiling.gasPpmMq5 > 1000 ? <Pill tone="red">LEAK · {ceiling.gasPpmMq5} ppm</Pill> : `${ceiling.gasPpmMq5} ppm`} />
          <KV k="Flame (IR)" v={ceiling.flameIr ? <Pill tone="amber">TRUE — flame seen</Pill> : <Pill tone="grey">FALSE</Pill>} />
          <KV k="Kitchen temp (DHT22)" v={`${ceiling.kitchenTempC.toFixed(1)} °C`} />
        </div>

        <div className="card">
          <h3>Presence + links</h3>
          <p className="hint">PIR motion, Wi-Fi, LoRa</p>
          <KV k="PIR motion" v={ceiling.pirMotion ? <Pill tone="blue">MOTION</Pill> : <Pill tone="grey">NO MOTION</Pill>} />
          <KV k="Last motion" v={`${fmtTime(ceiling.lastMotion)} (${timeAgo(ceiling.lastMotion)})`} />
          <KV k="Wi-Fi" v={ceiling.wifiConnected ? <Pill tone="green">CONNECTED</Pill> : <Pill tone="red">DISCONNECTED</Pill>} />
          <KV k="Wi-Fi RSSI" v={<Pill tone={rssiTone(ceiling.wifiRssi)}>{rssiLabel(ceiling.wifiRssi)}</Pill>} />
          <KV k="LoRa link" v={ceiling.loraLinked ? <Pill tone="green">LINKED</Pill> : <Pill tone="red">DISCONNECTED</Pill>} />
          <KV k="Last heartbeat" v={`${fmtTime(ceiling.lastHeartbeat)} (${timeAgo(ceiling.lastHeartbeat)})`} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Buzzer + backup power</h3>
        <p className="hint">On-device alarm you can hear in the kitchen</p>
        <KV k="Buzzer" v={ceiling.buzzer === 'idle' ? <Pill tone="grey">IDLE</Pill> : ceiling.buzzer === 'test' ? <Pill tone="blue">TEST</Pill> : <Pill tone="red">ALARMING</Pill>} />
        <KV k="Backup battery" v={`${ceiling.backupBatteryPct}%`} />
        <div className="btn-row">
          <button className="btn primary" onClick={onTest}>Test buzzer</button>
          {heard && <span style={{ fontSize: 13, color: 'var(--ink-dim)' }}>Test signal sent — the ceiling unit should sound for ~2 s.</span>}
        </div>
      </div>
    </div>
  );
}
