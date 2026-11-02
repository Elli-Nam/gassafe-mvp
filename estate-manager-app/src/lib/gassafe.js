/* GasSafe shared logic — mirrors the backend contract in app/rules.py.
 * One file on purpose: rules, load-cell catalog, floor math, safety engine,
 * refill flow, API client with offline twin fallback, FCM placeholder. */

// ---------------------------------------------------------------- NPA rule
// CORE LOCKED RULE: foot_ring_serial, qr_serial and serial must ALL be
// identical. Bottom ring != QR -> suspected fraud, not registered.

export function normalize(serial) {
  return String(serial || "").trim().toUpperCase();
}

const NPA_RE = /^NPA-CRM-GH-\d{5}$/;
const LEGACY_RE = /^GC-\d{5}$/;

export function serialKind(serial) {
  const s = normalize(serial);
  if (NPA_RE.test(s)) return "npa";
  if (LEGACY_RE.test(s)) return "legacy";
  return "unknown";
}

export function isValidSerial(serial) {
  const k = serialKind(serial);
  return k === "npa" || k === "legacy";
}

export function serialsMatch(footRingSerial, qrSerial) {
  return normalize(footRingSerial) === normalize(qrSerial);
}

// Triple check used at registration: all three must be identical.
export function tripleMatch(serial, footRingSerial, qrSerial) {
  const s = normalize(serial);
  return s === normalize(footRingSerial) && s === normalize(qrSerial);
}

// NPA dashboard badge colour: GREEN = match, RED = suspected fraud.
export function matchBadge(serialMatch) {
  return serialMatch ? "GREEN" : "RED";
}

// Human-readable verdict for the validation panel.
export function validationVerdict(cyl) {
  const match = serialsMatch(cyl.footRingSerial, cyl.qrSerial);
  const triple = tripleMatch(cyl.serial, cyl.footRingSerial, cyl.qrSerial);
  return {
    match,
    triple,
    badge: matchBadge(match),
    fraudFlag: !match,
    label: match ? "MATCH" : "FRAUD",
  };
}

// ---------------------------------------------------------------- Load cells
// Same PCB, different load cell.
//   HOME: 50 kg cell.  COMMERCIAL: 150 kg cell (needs trolley + 2 officers).
// 19.5 kg moved from HOME to COMMERCIAL category.

export const HOME_CELL = "50kg";
export const COMMERCIAL_CELL = "150kg";

export const CYLINDER_CATALOG = {
  // gasKg: { gas, tare, gross, cell, category }
  3: { gas: 3, tare: 3.4, gross: 6.4, cell: HOME_CELL, category: "HOME" },
  5: { gas: 5, tare: 5.3, gross: 10.3, cell: HOME_CELL, category: "HOME" },
  6: { gas: 6, tare: 6.5, gross: 12.5, cell: HOME_CELL, category: "HOME" },
  12.5: { gas: 12.5, tare: 11.5, gross: 24.0, cell: HOME_CELL, category: "HOME" },
  14.5: { gas: 14.5, tare: 12.0, gross: 26.5, cell: HOME_CELL, category: "HOME" },
  15: { gas: 15, tare: 12.5, gross: 27.5, cell: HOME_CELL, category: "HOME" },
  19: { gas: 19, tare: 12.5, gross: 31.5, cell: COMMERCIAL_CELL, category: "COMMERCIAL" },
  19.5: { gas: 19.5, tare: 13.0, gross: 32.5, cell: COMMERCIAL_CELL, category: "COMMERCIAL" },
  35: { gas: 35, tare: 25.0, gross: 60.0, cell: COMMERCIAL_CELL, category: "COMMERCIAL" },
  45: { gas: 45, tare: 30.0, gross: 75.0, cell: COMMERCIAL_CELL, category: "COMMERCIAL" },
  50: { gas: 50, tare: 32.0, gross: 82.0, cell: COMMERCIAL_CELL, category: "COMMERCIAL" },
  52: { gas: 52, tare: 35.0, gross: 87.0, cell: COMMERCIAL_CELL, category: "COMMERCIAL" },
};

export const HOME_SIZES = [3, 5, 6, 12.5, 14.5, 15];
export const COMMERCIAL_SIZES = [19, 19.5, 35, 45, 50, 52];

export function catalogFor(sizeKg) {
  return CYLINDER_CATALOG[sizeKg] || null;
}

// ---------------------------------------------------------------- Floor math
export function kgLeft(grossKg, tareKg) {
  return Math.max(0, round1(grossKg - tareKg));
}

export function remainingPct(kgLeftKg, gasKg) {
  if (!gasKg || gasKg <= 0) return 0;
  return Math.min(100, Math.round((kgLeftKg / gasKg) * 100));
}

export function daysLeft(kgLeftKg, avgDailyKg) {
  if (!avgDailyKg || avgDailyKg <= 0) return null;
  return round1(kgLeftKg / avgDailyKg);
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

// ---------------------------------------------------------------- Safety
// gas_ppm > threshold -> LEAK (RED). Smoke -> SMOKE. Flame -> FLAME.
// BURST and IN_USE complete the status set from the old dashboard.

export const GAS_PPM_ALERT = 1000;
export const SMOKE_PPM_ALERT = 500;
export const TEMP_C_ALERT = 60;
export const COOKER_LEFT_ON_MIN = 30;
export const ESCALATION_MIN = 2;

export function evaluateFloorStatus(reading) {
  if (reading.burst) return "BURST";
  if (reading.flame) return "FLAME";
  if ((reading.smokePpm || 0) >= SMOKE_PPM_ALERT) return "SMOKE";
  if ((reading.gasPpm || 0) >= GAS_PPM_ALERT) return "LEAK";
  if (reading.flameOn) return "IN_USE";
  return reading.status || "IN_USE";
}

// Cooker left on: flame ON > 30 min with no PIR motion AND no weight change.
export function isCookerLeftOn(args) {
  const flameMin = args.flameOnMinutes || 0;
  const motionMinAgo = args.pirMotionMinutesAgo;
  const motionStale = motionMinAgo == null || motionMinAgo > COOKER_LEFT_ON_MIN;
  return (
    args.flameOn === true &&
    flameMin > COOKER_LEFT_ON_MIN &&
    motionStale &&
    args.weightChangedRecently === false
  );
}

// Food burning: smoke rising while flame is ON.
export function isFoodBurning(smokeRising, flameOn) {
  return smokeRising === true && flameOn === true;
}

// ---------------------------------------------------------------- Refill
// kg left < 20% -> plan-a-refill reminder (no rider).
// kg left < 5%  -> urgent pickup prompt.
// kg left <= 0% or manual Request Refill -> rider dispatch flow.

export const RIDER_STATES = [
  "requested",
  "rider_en_route",
  "picked_up",
  "at_filling_plant",
  "returning",
  "delivered",
];

export const RIDER_LABELS = {
  requested: "Requested",
  rider_en_route: "Rider en route",
  picked_up: "Picked up",
  at_filling_plant: "At filling plant",
  returning: "Returning",
  delivered: "Delivered",
};

export function refillSignal(remaining) {
  if (remaining <= 0)
    return {
      level: "empty",
      title: "Cylinder empty",
      body: "Dispatching a rider to take the cylinder for refill and return.",
      dispatch: true,
    };
  if (remaining < 5)
    return {
      level: "urgent",
      title: "Almost empty — ~1 day left",
      body: "Almost empty ~1 day left. Tap to request pickup.",
      dispatch: false,
    };
  if (remaining < 20)
    return {
      level: "reminder",
      title: "Running low",
      body: "Gas will run out in ~2-3 days. Plan a refill?",
      dispatch: false,
    };
  return { level: "ok", title: "Level OK", body: "", dispatch: false };
}

export function nextRiderState(state) {
  const i = RIDER_STATES.indexOf(state);
  if (i < 0) return "requested";
  return RIDER_STATES[Math.min(i + 1, RIDER_STATES.length - 1)];
}

// ---------------------------------------------------------------- API client
// Talks to the FastAPI backend when reachable; otherwise the caller keeps
// using the on-device twin (seed cache) so the estate view never goes blank.

export const API_BASE = "http://127.0.0.1:8000";

export async function fetchNpaDashboard(limit = 50, fraudOnly = false) {
  const q = new URLSearchParams({ limit: String(limit) });
  if (fraudOnly) q.set("fraud_only", "true");
  const res = await fetch(`${API_BASE}/api/npa/dashboard?${q.toString()}`);
  if (!res.ok) throw new Error(`backend ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------- FCM push
// Placeholder for Firebase Cloud Messaging high-priority push. Wire
// VAPID key + service-worker push handler here for production; alarm
// escalation calls this first, local siren second.
export async function sendHighPriorityPush(payload) {
  // TODO: integrate FCM (firebase-admin server side, firebase/messaging here).
  if (typeof console !== "undefined") {
    console.warn("[FCM placeholder] high-priority push not configured:", payload);
  }
  return { queued: false, reason: "FCM not configured (placeholder)" };
}
