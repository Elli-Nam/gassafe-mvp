// Loud critical alarm: WebAudio siren loop + navigator.vibrate pattern.
// Browsers (especially iOS) cannot bypass the hardware silent switch for web
// audio; we maximise audibility with full-volume oscillator siren, repeated
// vibration, wake-lock attempt, and a full-screen overlay that persists until
// acknowledged. Native FCM high-priority push (see fcm.js) covers the
// phone-silent case on installed builds.

let ctx = null;
let sirenNodes = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function startSiren() {
  const ac = ensureCtx();
  if (!ac) return;
  stopSiren();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'square';
  osc.frequency.value = 880;
  gain.gain.value = 0.22;
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 2.2; // wail ~2 Hz
  lfoGain.gain.value = 320;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  lfo.start();
  sirenNodes = { osc, gain, lfo };
}

function stopSiren() {
  if (!sirenNodes) return;
  try {
    sirenNodes.osc.stop();
    sirenNodes.lfo.stop();
  } catch {
    /* already stopped */
  }
  sirenNodes = null;
}

let vibrateTimer = null;

function startVibration() {
  if (!('vibrate' in navigator)) return;
  const pattern = [400, 200, 400, 200, 800, 200];
  try {
    navigator.vibrate(pattern);
  } catch {
    return;
  }
  vibrateTimer = setInterval(() => {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* unsupported */
    }
  }, 2500);
}

function stopVibration() {
  if (vibrateTimer) clearInterval(vibrateTimer);
  vibrateTimer = null;
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {
      /* noop */
    }
  }
}

export function startCriticalAlarm() {
  startSiren();
  startVibration();
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').catch(() => {});
  }
}

export function stopCriticalAlarm() {
  stopSiren();
  stopVibration();
}

export function testBuzzer(seconds = 2) {
  const ac = ensureCtx();
  if (!ac) return false;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'square';
  osc.frequency.value = 660;
  gain.gain.value = 0.18;
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  setTimeout(() => {
    try {
      osc.stop();
    } catch {
      /* noop */
    }
  }, seconds * 1000);
  return true;
}
