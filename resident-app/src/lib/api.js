// API layer: talks to the real backend when present, falls back to a
// localStorage-backed demo twin so the pitch never depends on hardware.
//
// Real endpoints (when the gateway is reachable):
//   POST /api/lora-gas/webhook   device telemetry ingress
//   GET  /api/alerts             active alerts list
//   POST /api/refill/request     rider pickup + return flow

const API_BASE = '';

async function tryFetch(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const THRESHOLDS = {
  gasLeakPpm: 1000, // gas_ppm above this => LEAK (RED)
  smokePpm: 300, // MQ-2 smoke above this => SMOKE
  cookerLeftOnMinutes: 30, // flame ON with no motion/weight change
  refillWarnPct: 20,
  refillUrgentPct: 5,
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode — demo still runs in memory */
  }
}

// Demo twin: one household, one floor unit + one ceiling unit.
export function seedDemo() {
  const seeded = load('gassafe.seed.v1', null);
  if (seeded) return seeded;
  const now = Date.now();
  const demo = {
    floor: {
      grossKg: 18.4,
      tareKg: 6.1,
      avgDailyUsageKg: 0.42,
      batteryPct: 87,
      batteryVoltage: 4.02,
      loraRssi: -71,
      calibrated: true,
      cylinderTempC: 27.4,
      flameOn: false,
      gasPpm: 120,
      lastSeen: new Date(now - 42 * 1000).toISOString(),
    },
    ceiling: {
      deviceId: 'GS-CEIL-01A4',
      smokePpm: 18,
      flameIr: false,
      gasPpmMq5: 96,
      kitchenTempC: 29.1,
      pirMotion: false,
      lastMotion: new Date(now - 34 * 60 * 1000).toISOString(),
      wifiRssi: -58,
      wifiConnected: true,
      loraLinked: true,
      lastHeartbeat: new Date(now - 25 * 1000).toISOString(),
      buzzer: 'idle',
      backupBatteryPct: 96,
    },
    flameOnSince: null,
    lastWeightKg: 12.3,
    refill: { status: 'none', updatedAt: null, timeline: [] },
    family: [
      { name: 'Ama Mensah', phone: '+233 24 000 0001', role: 'owner' },
      { name: 'Kwame Mensah', phone: '+233 24 000 0002', role: 'member' },
    ],
    deliveries: [
      {
        id: 'del-2026-1017',
        footRingSerial: 'NPA-CRM-GH-00001',
        qrSerial: 'NPA-CRM-GH-00001',
        fraudFlag: false,
        photoProof: null,
        address: '14 Osu Badu St, Accra',
        lat: 5.5557,
        lng: -0.1963,
        at: new Date(now - 12 * 86400000).toISOString(),
      },
      {
        id: 'del-2026-0902',
        footRingSerial: 'GC-12345',
        qrSerial: 'GC-99999',
        fraudFlag: true,
        photoProof: null,
        address: '14 Osu Badu St, Accra',
        lat: 5.5557,
        lng: -0.1963,
        at: new Date(now - 57 * 86400000).toISOString(),
      },
    ],
  };
  save('gassafe.seed.v1', demo);
  return demo;
}

export async function getAlerts() {
  try {
    return await tryFetch('/api/alerts');
  } catch {
    return load('gassafe.alerts.v1', []);
  }
}

export async function postTelemetry(payload) {
  // POST /api/lora-gas/webhook — hardware path. Demo path persists locally.
  try {
    return await tryFetch('/api/lora-gas/webhook', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    const alerts = load('gassafe.alerts.v1', []);
    const derived = deriveAlerts(payload);
    const merged = [
      ...derived.map((d) => ({ id: `al-${Date.now()}-${d.kind}`, at: new Date().toISOString(), ...d })),
      ...alerts,
    ].slice(0, 50);
    save('gassafe.alerts.v1', merged);
    return { ok: true, demo: true, alerts: derived };
  }
}

// Same rule set the backend applies to POST /api/lora-gas/webhook payloads.
export function deriveAlerts(payload = {}) {
  const out = [];
  const gas = Number(payload.gas_ppm ?? payload.gasPpmMq5 ?? 0);
  const smoke = Number(payload.smoke_ppm ?? 0);
  const flame = Boolean(payload.flame_on ?? payload.flame_ir ?? payload.flameOn);
  if (gas > THRESHOLDS.gasLeakPpm) {
    out.push({ kind: 'LEAK', severity: 'RED', message: `Gas ${gas} ppm over ${THRESHOLDS.gasLeakPpm} ppm threshold.` });
  }
  if (smoke > THRESHOLDS.smokePpm) {
    out.push({ kind: 'SMOKE', severity: 'AMBER', message: `Smoke ${smoke} ppm (MQ-2) over ${THRESHOLDS.smokePpm} ppm.` });
  }
  if (flame) {
    out.push({ kind: 'FLAME', severity: 'AMBER', message: 'Flame signature detected.' });
  }
  return out;
}

export const store = { load, save };
