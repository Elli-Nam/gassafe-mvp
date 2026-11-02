import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { seedDemo, store, THRESHOLDS, postTelemetry } from './api.js';
import { queuePush } from './fcm.js';
import { startCriticalAlarm, stopCriticalAlarm } from './sound.js';

const Ctx = createContext(null);
export const useGas = () => useContext(Ctx);

const CYLINDER_FULL_KG = 14.5; // 12.5kg gas + margin reference for % bar

export function levelOf(floor) {
  const kgLeft = Math.max(0, round2(floor.grossKg - floor.tareKg));
  const pct = Math.min(100, Math.max(0, (kgLeft / CYLINDER_FULL_KG) * 100));
  const daysLeft = floor.avgDailyUsageKg > 0 ? kgLeft / floor.avgDailyUsageKg : Infinity;
  return { kgLeft, pct, daysLeft };
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
}

export function GasProvider({ children }) {
  const [demo, setDemo] = useState(() => seedDemo());
  const [alerts, setAlerts] = useState(() => store.load('gassafe.alerts.v1', []));
  const [critical, setCritical] = useState(null); // { kind, title, body, at }
  const smokeHist = useRef([]);

  // Persist demo twin.
  useEffect(() => {
    store.save('gassafe.seed.v1', demo);
  }, [demo]);

  const pushAlert = useCallback((kind, severity, message) => {
    const alert = { id: uid('al'), kind, severity, message, at: new Date().toISOString() };
    setAlerts((prev) => {
      const next = [alert, ...prev].slice(0, 50);
      store.save('gassafe.alerts.v1', next);
      return next;
    });
    queuePush({ title: `GasSafe: ${kind}`, body: message, tag: `gassafe-${kind.toLowerCase()}` });
    return alert;
  }, []);

  const raiseCritical = useCallback((kind, title, body) => {
    setCritical((prev) => prev || { kind, title, body, at: new Date().toISOString() });
    queuePush({ title: `GasSafe CRITICAL: ${title}`, body, tag: `gassafe-${kind.toLowerCase()}` });
    startCriticalAlarm();
  }, []);

  const acknowledgeCritical = useCallback(() => {
    stopCriticalAlarm();
    setCritical(null);
  }, []);

  // ---- detection engine: runs on every telemetry tick ----
  const evaluate = useCallback(
    (floor, ceiling) => {
      // 1) threshold alerts
      if (floor.gasPpm > THRESHOLDS.gasLeakPpm) {
        pushAlert('LEAK', 'RED', `Gas ${floor.gasPpm} ppm over ${THRESHOLDS.gasLeakPpm} ppm threshold.`);
      }
      if (ceiling.smokePpm > THRESHOLDS.smokePpm) {
        pushAlert('SMOKE', 'AMBER', `Smoke ${ceiling.smokePpm} ppm (MQ-2) over threshold.`);
      }
      if (floor.flameOn || ceiling.flameIr) {
        pushAlert('FLAME', 'AMBER', 'Flame signature detected.');
      }
      // 2) food burning: smoke rising + flame ON
      const hist = smokeHist.current;
      hist.push(ceiling.smokePpm);
      if (hist.length > 6) hist.shift();
      const rising =
        hist.length >= 3 && hist[hist.length - 1] > hist[0] + 60 && ceiling.smokePpm > THRESHOLDS.smokePpm;
      if (rising && (floor.flameOn || ceiling.flameIr)) {
        raiseCritical('FOOD_BURNING', 'Food burning! Check cooker!', 'Smoke rising fast with flame on. Tap to acknowledge — alarm keeps sounding until you do.');
      }
      // 3) cooker left on: flame ON > 30 min without PIR motion or weight change
      if (floor.flameOn) {
        const since = demo.flameOnSince ? new Date(demo.flameOnSince).getTime() : Date.now();
        const mins = (Date.now() - since) / 60000;
        const weightChanged = Math.abs(floor.grossKg - demo.lastWeightKg) > 0.05;
        const recentMotion =
          ceiling.pirMotion || Date.now() - new Date(ceiling.lastMotion).getTime() < 30 * 60000;
        if (mins > THRESHOLDS.cookerLeftOnMinutes && !recentMotion && !weightChanged) {
          raiseCritical(
            'COOKER_LEFT_ON',
            'Cooker left on? Check kitchen — 30 min',
            'Flame has been on over 30 minutes with no motion or weight change. Tap to acknowledge.',
          );
        }
      }
      // 4) refill reminders (FCM placeholder — never auto-dispatches a rider)
      const { kgLeft, pct } = levelOf(floor);
      if (pct < THRESHOLDS.refillUrgentPct && demo.refill.status === 'none') {
        pushAlert('GAS_CRITICAL', 'RED', `Almost empty — ${kgLeft} kg left (~1 day). Tap Refill to request pickup.`);
        queuePush({ title: 'GasSafe: almost empty', body: 'About 1 day left. Tap to request pickup.', tag: 'gassafe-low-gas' });
      } else if (pct < THRESHOLDS.refillWarnPct && demo.refill.status === 'none') {
        setAlerts((prev) => {
          if (prev.some((a) => a.kind === 'LOW_GAS')) return prev;
          const next = [
            { id: uid('al'), kind: 'LOW_GAS', severity: 'AMBER', message: `Gas will run out in ~2–3 days at current usage. Plan a refill?`, at: new Date().toISOString() },
            ...prev,
          ].slice(0, 50);
          store.save('gassafe.alerts.v1', next);
          return next;
        });
      }
    },
    [demo.flameOnSince, demo.lastWeightKg, demo.refill.status, pushAlert, raiseCritical],
  );

  // ---- actions ----
  const ingest = useCallback(
    async (payload) => {
      await postTelemetry(payload); // POST /api/lora-gas/webhook (or demo twin)
      setDemo((prev) => {
        const floor = { ...prev.floor };
        const ceiling = { ...prev.ceiling };
        if (payload.gross_kg != null) floor.grossKg = payload.gross_kg;
        if (payload.gas_ppm != null) floor.gasPpm = payload.gas_ppm;
        if (payload.flame_on != null) floor.flameOn = payload.flame_on;
        if (payload.smoke_ppm != null) ceiling.smokePpm = payload.smoke_ppm;
        if (payload.flame_ir != null) ceiling.flameIr = payload.flame_ir;
        floor.lastSeen = new Date().toISOString();
        ceiling.lastHeartbeat = new Date().toISOString();
        const next = { ...prev, floor, ceiling };
        if (payload.flame_on && !prev.flameOnSince) next.flameOnSince = new Date().toISOString();
        if (!payload.flame_on && payload.flame_on != null) next.flameOnSince = null;
        return next;
      });
    },
    [],
  );

  const tick = useCallback(() => {
    setDemo((prev) => {
      const floor = { ...prev.floor, lastSeen: new Date().toISOString() };
      const ceiling = { ...prev.ceiling, lastHeartbeat: new Date().toISOString() };
      return { ...prev, floor, ceiling };
    });
  }, []);

  // Evaluate after each demo change (debounced by change itself).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    evaluate(demo.floor, demo.ceiling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.floor.gasPpm, demo.floor.flameOn, demo.ceiling.smokePpm, demo.ceiling.flameIr]);

  const tareReset = useCallback(() => {
    setDemo((prev) => ({ ...prev, floor: { ...prev.floor, tareKg: round2(prev.floor.grossKg) } }));
  }, []);

  const setFlame = useCallback((on) => {
    setDemo((prev) => ({
      ...prev,
      floor: { ...prev.floor, flameOn: on },
      flameOnSince: on ? prev.flameOnSince || new Date().toISOString() : null,
    }));
  }, []);

  const simulate = useCallback((patch) => {
    setDemo((prev) => ({
      ...prev,
      floor: { ...prev.floor, ...(patch.floor || {}) },
      ceiling: { ...prev.ceiling, ...(patch.ceiling || {}) },
      ...(patch.root || {}),
    }));
  }, []);

  const testBuzzer = useCallback(() => {
    setDemo((prev) => ({ ...prev, ceiling: { ...prev.ceiling, buzzer: 'test' } }));
    queuePush({ title: 'GasSafe: buzzer test', body: 'Ceiling buzzer test triggered.', tag: 'gassafe-buzzer' });
    setTimeout(() => {
      setDemo((prev) => ({ ...prev, ceiling: { ...prev.ceiling, buzzer: 'idle' } }));
    }, 3000);
  }, []);

  const REFILL_FLOW = ['requested', 'rider_en_route', 'picked_up', 'at_filling_plant', 'returning', 'delivered'];

  const requestRefill = useCallback(() => {
    setDemo((prev) => ({
      ...prev,
      refill: {
        status: 'requested',
        updatedAt: new Date().toISOString(),
        timeline: [{ status: 'requested', at: new Date().toISOString() }],
      },
    }));
    queuePush({ title: 'GasSafe: rider requested', body: 'Pickup requested — rider will be assigned.', tag: 'gassafe-refill' });
  }, []);

  const advanceRefill = useCallback(() => {
    setDemo((prev) => {
      const idx = REFILL_FLOW.indexOf(prev.refill.status);
      if (idx < 0 || idx >= REFILL_FLOW.length - 1) return prev;
      const next = REFILL_FLOW[idx + 1];
      const entry = { status: next, at: new Date().toISOString() };
      queuePush({ title: `GasSafe refill: ${next.replace(/_/g, ' ')}`, body: `Cylinder is now: ${next.replace(/_/g, ' ')}.`, tag: 'gassafe-refill' });
      return { ...prev, refill: { status: next, updatedAt: entry.at, timeline: [...prev.refill.timeline, entry] } };
    });
  }, []);

  const addFamily = useCallback((member) => {
    setDemo((prev) => ({ ...prev, family: [...prev.family, member] }));
  }, []);

  const addDelivery = useCallback((delivery) => {
    setDemo((prev) => ({ ...prev, deliveries: [delivery, ...prev.deliveries] }));
  }, []);

  const value = useMemo(
    () => ({
      demo,
      floor: demo.floor,
      ceiling: demo.ceiling,
      level: levelOf(demo.floor),
      alerts,
      unread: alerts.length,
      critical,
      acknowledgeCritical,
      ingest,
      tick,
      tareReset,
      setFlame,
      simulate,
      testBuzzer,
      requestRefill,
      advanceRefill,
      addFamily,
      addDelivery,
      REFILL_FLOW,
    }),
    [demo, alerts, critical, acknowledgeCritical, ingest, tick, tareReset, setFlame, simulate, testBuzzer, requestRefill, advanceRefill, addFamily, addDelivery],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
