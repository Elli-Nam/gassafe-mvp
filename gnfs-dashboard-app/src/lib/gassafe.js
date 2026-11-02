/* GasSafe shared logic — mirrors backend app/rules.py.
 * CORE LOCKED RULE: foot_ring_serial, qr_serial and serial must ALL match.
 * Same PCB, different load cell: HOME 50kg / COMMERCIAL 150kg. */

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

export function tripleMatch(serial, footRingSerial, qrSerial) {
  const s = normalize(serial);
  return s !== "" && s === normalize(footRingSerial) && s === normalize(qrSerial);
}

export function matchBadge(serialMatch) {
  return serialMatch ? "GREEN" : "RED";
}

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

// ---------------- Load cells: same PCB, different cell ----------------
// HOME 50kg: 3, 5, 6 (=12.5 gross), 12.5, 14.5 (=26.5 gross), 15
// COMMERCIAL 150kg: 19, 19.5 (=32.5 gross), 35, 45, 50, 52 (=87 gross)
// 19.5 moved HOME -> COMMERCIAL. Commercial needs trolley + 2 officers.
export const HOME_CELL = "50kg";
export const COMMERCIAL_CELL = "150kg";

export const CYLINDER_CATALOG = {
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

// ---------------- Floor math ----------------
export function kgLeft(grossKg, tareKg) {
  return Math.max(0, Math.round((grossKg - tareKg) * 10) / 10);
}
export function remainingPct(kgLeftKg, gasKg) {
  if (!gasKg || gasKg <= 0) return 0;
  return Math.min(100, Math.round((kgLeftKg / gasKg) * 100));
}
export function daysLeft(kgLeftKg, avgDailyKg) {
  if (!avgDailyKg || avgDailyKg <= 0) return null;
  return Math.round((kgLeftKg / avgDailyKg) * 10) / 10;
}

// ---------------- Safety engine (POST /api/lora-gas/webhook -> GET /api/alerts) ---
export const GAS_PPM_ALERT = 1000;
export const SMOKE_PPM_ALERT = 250;
export const TEMP_C_ALERT = 70;
export const COOKER_LEFT_ON_MIN = 30;
export const ESCALATION_MIN = 2;

export function evaluateSensor(r) {
  if (r.burst) return "BURST";
  if (r.flame && (r.gasPpm || 0) >= GAS_PPM_ALERT) return "FIRE";
  if (r.flame) return "FIRE";
  if ((r.smokePpm || 0) >= SMOKE_PPM_ALERT) return "SMOKE";
  if ((r.gasPpm || 0) >= GAS_PPM_ALERT) return "LEAK";
  if ((r.tempC || 0) >= TEMP_C_ALERT) return "HEAT";
  if (r.flameOn) return "COOK";
  return r.sensor || "COOK";
}

export function isCookerLeftOn({ flameOn, flameOnMinutes, pirMotionMinutesAgo, weightChangedRecently }) {
  const stale = pirMotionMinutesAgo == null || pirMotionMinutesAgo > COOKER_LEFT_ON_MIN;
  return flameOn === true && (flameOnMinutes || 0) > COOKER_LEFT_ON_MIN && stale && weightChangedRecently === false;
}

export function isFoodBurning(smokeRising, flameOn) {
  return smokeRising === true && flameOn === true;
}

// ---------------- Refill ----------------
export const RIDER_STATES = ["requested", "rider_en_route", "picked_up", "at_filling_plant", "returning", "delivered"];
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
    return { level: "empty", title: "Cylinder empty", body: "Dispatch rider: take cylinder for refill and return.", dispatch: true };
  if (remaining < 5)
    return { level: "urgent", title: "Almost empty — ~1 day left", body: "Almost empty ~1 day left. Tap to request pickup.", dispatch: false };
  if (remaining < 20)
    return { level: "reminder", title: "Running low", body: "Gas will run out in ~2-3 days at current usage. Plan a refill?", dispatch: false };
  return { level: "ok", title: "Level OK", body: "", dispatch: false };
}

// ---------------- FCM placeholder ----------------
export async function sendHighPriorityPush(payload) {
  if (typeof console !== "undefined") console.warn("[FCM placeholder] high-priority push:", payload);
  return { queued: false, reason: "FCM not configured (placeholder)" };
}

export const API_BASE = "http://127.0.0.1:8000";
