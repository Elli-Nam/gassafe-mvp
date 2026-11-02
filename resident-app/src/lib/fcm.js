// FCM high-priority push — PLACEHOLDER wiring for the MVP pitch.
// The demo runs fully offline (localStorage twin + service-worker message
// passthrough). To go live: drop in firebaseConfig, register the token with
// the backend, and every alert below arrives as high-priority push even when
// the app is closed.
//
// Covered alert kinds: LEAK, SMOKE, FLAME, COOKER_LEFT_ON, FOOD_BURNING,
// LOW_GAS (20%), GAS_CRITICAL (5%), REFILL_STATUS.

export const FCM_ALERT_TOPICS = [
  'LEAK',
  'SMOKE',
  'FLAME',
  'COOKER_LEFT_ON',
  'FOOD_BURNING',
  'LOW_GAS',
  'GAS_CRITICAL',
  'REFILL_STATUS',
];

const outbox = [];

export function fcmPlaceholder() {
  return {
    configured: false,
    // TODO(pitch): paste firebaseConfig here; call requestPermission() +
    // getToken() and POST the token to /api/devices/register.
  };
}

// Records the push that WOULD be sent; the service worker renders it when a
// native shell forwards it (see public/sw.js PUSH_ALERT handler).
export function queuePush({ title, body, tag }) {
  const msg = { title, body, tag, at: new Date().toISOString(), simulated: !fcmPlaceholder().configured };
  outbox.push(msg);
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'PUSH_ALERT', title, body, tag });
  }
  try {
    const log = JSON.parse(localStorage.getItem('gassafe.pushlog.v1') || '[]');
    log.unshift(msg);
    localStorage.setItem('gassafe.pushlog.v1', JSON.stringify(log.slice(0, 50)));
  } catch {
    /* private mode */
  }
  return msg;
}

export function pushLog() {
  try {
    return JSON.parse(localStorage.getItem('gassafe.pushlog.v1') || '[]');
  } catch {
    return [...outbox];
  }
}
