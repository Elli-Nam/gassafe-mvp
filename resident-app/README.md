# GasSafe — Resident App (MVP PWA)

React PWA for household LPG safety. Pitching grade: works with zero hardware via an on-device demo twin, and talks to the real gateway when it is reachable.

## Run it

```bash
cd resident-app
npm install
npm run dev
```

Open the printed URL in a browser (Vite default `http://localhost:5173`).

Production preview:

```bash
npm run build
npm run preview   # serves http://localhost:4173
```

The dev server proxies `/api/*` to `http://localhost:8000` (see `vite.config.js`).

## What is inside

- **Home** — cylinder level, kitchen air, latest alerts, connectivity; one-tap pitch scenarios (leak, cooker-left-on, low gas).
- **Floor Unit** — gross_kg, tare_kg, kg left = gross − tare, remaining % bar, avg daily usage, days left = kg_left / avg, battery % + volts, LoRa RSSI, calibration status, cylinder temperature, flame ON/OFF, gas_ppm, last seen, tare reset (with confirm).
- **Ceiling Unit** — device ID, smoke ppm (MQ-2), flame IR true/false, gas ppm (MQ-5), kitchen temp (DHT22), PIR motion + last motion, Wi-Fi RSSI + connected, LoRa link + heartbeat, buzzer idle/alarming/test + test button, backup battery %.
- **Alerts** — rules from `POST /api/lora-gas/webhook` → `GET /api/alerts`: gas_ppm > 1000 → LEAK (RED), smoke > 300 → SMOKE, flame → FLAME. Buttons POST demo payloads through the same path.
- **Critical alarms** — cooker-left-on (flame ON > 30 min, no PIR motion, no weight change) and food-burning (smoke rising + flame ON) raise a full-screen overlay with siren loop + vibration until acknowledged. Web audio cannot bypass the iOS silent switch; installed builds should add FCM high-priority push (placeholder in `src/lib/fcm.js`) for the phone-silent case.
- **Refill** — <20% plan reminder (no rider dispatched), <5% urgent (~1 day left, tap to request), ≤0%/manual request → rider flow: requested → rider_en_route → picked_up → at_filling_plant → returning → delivered, with tracking timeline + push per step.
- **Family Circle** — add by name + phone, owner/member roles, alerts shared with all.
- **History** — photo proof upload, foot_ring_serial vs qr_serial check. NPA rule enforced (mirrors `app/rules.py`): NPA serials `NPA-CRM-GH-00001`, legacy keeps `GC-12345`, QR must copy the foot ring. GREEN MATCH vs RED FRAUD (`fraud_flag=True`) rows stay visible with timestamp, GA address, lat/lng for NPA follow-up.

## PWA

`public/manifest.webmanifest` + `public/sw.js` (cache-first app shell, API never cached, `PUSH_ALERT` handler). Installable from the production build.
