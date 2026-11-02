# GasSafe GNFS Field Officer App

Mobile-first React PWA for GNFS field officers responding to **LEAK · BURST · FIRE · SMOKE · HEAT**,
plus **cooker left on** and **food burning** events. Built with React 18 + Vite 5.
No pricing anywhere in the app.

## Start

```powershell
cd gnfs-field-officer-app
npm run preview   # serves the production build at http://localhost:5184/
```

`npm run dev` starts the dev server on the same port. Install dependencies with
`npm install` (or reuse the sibling `gnfs-dashboard-app` install — same stack).

## Tabs (bottom bar)

- **Assign** — My Assignments: every active dispatch sent from the GNFS Dashboard.
- **Map** — Navigate to any dispatch: digital address, lat/lng, and a Maps button.
- **Inspect** — On-scene inspection of the selected dispatch.
- **Resolve** — Mark the selected hazard resolved with photo proof.
- **History** — My resolved dispatches, fraud export, offline-queue retry.

## Assignments: filters, search, cards

The Assign tab opens with all active dispatches. Narrow them with:

- **Sensor chips** — ALL, FIRE, SMOKE, LEAK, BURST, HEAT, COOK.
- **Category chips** — ALL, HOME, COMMERCIAL.
- **Regional select** — all 16 regions
  (Greater Accra, Ashanti, Western, Eastern, Central, Northern, Upper East,
  Upper West, Volta, Bono, Bono East, Ahafo, Savannah, North East, Oti, Western North).
- **District select** — follows the region.
  Geography is District ⊂ Region ⊂ National; National is always Ghana.
- **Search bar** — "Search by digital address or NPA code".
  Type `GE-321-1234`, `GA-123-4567`, `NPA-CRM-GH-001`, or `GC-12345`
  to find a house instantly.

Each card shows TIME / PRIORITY (e.g. 20 mins ago, P1), sensor type and live
readings — FIRE confirmed, LEAK `gas_ppm=1450`, SMOKE `smoke_ppm=300`,
HEAT `78C`, BURST pipe continuous leak needs trolley + 2 officers — plus unit,
household, HOME/COMMERCIAL size and cell, digital address with district, region,
national, NPA code, and the GREEN/RED serial badge.

## Status flow

`PENDING → Accept → EN_ROUTE → Arrived → ON_SCENE → RESOLVED`.
Accept from the card, mark on-scene from the card or Inspect tab,
resolve from the Resolve tab.

## Inspect: serial check, floor/ceiling, safety

- **Serial check (locked NPA rule).** `foot_ring_serial`, `qr_serial` and
  `serial` must ALL be identical: new `NPA-CRM-GH-00001` cylinders leave the
  manufacturer with foot ring = QR, legacy `GC-12345` cylinders keep the QR
  copied from the existing bottom ring — never invent a new number.
  Scan the QR plate with the camera, type the foot-ring stamp manually, then
  Validate: **GREEN MATCH** or **RED FRAUD** with `fraud_flag=True` kept
  visible for NPA/GNFS export, never silently dropped. A combined photo —
  foot-ring stamp + QR plate in the same frame — is required.
- **Cylinder/scale.** HOME 50 kg cell vs COMMERCIAL 150 kg cell: same PCB,
  different load cell. `19.5kg=32.5kg` and `52kg=87kg` are COMMERCIAL and show
  the GNFS SOP checklist (trolley present, 2 officers present).
- **Floor.** Gross kg, tare kg, kg left, remaining %, avg daily usage, days
  left, battery %, LoRa RSSI, calibration, cylinder temp, flame ON/OFF, gas_ppm.
- **Ceiling.** Device ID, smoke ppm (MQ-2), flame IR, gas ppm (MQ-5), kitchen
  temp (DHT22, HEAT at 70C), PIR motion / last motion, WiFi RSSI, LoRa link,
  heartbeat, buzzer, backup battery %. Small gateway with MTN/Telecel SIM in
  the corner: dual WiFi primary + Cellular fallback, on-device twin fallback
  when offline.
- **Safety check.** Confirm LEAK / SMOKE / FIRE / HEAT / BURST on scene, confirm
  cooker-left-on and food-burning where they apply, photo proof and notes,
  "Acknowledge — I am checking", and "Escalate now (drill)".

## Alarms

- **Cooker left on** — flame ON > 30 min without PIR motion or weight change:
  full-screen "Cooker left on? Check kitchen 30 min" with loud alarm sound loop
  and vibration until acknowledged, even if the phone is silent.
- **Food burning** — smoke rising + flame ON: "Food burning! Check cooker!".
- No response in 2 min escalates to HQ + Family Circle + Estate security.
  FCM high-priority push is a wired placeholder (`sendHighPriorityPush`).

## Refill

kg left < 20 % reminds "Gas will run out in ~2-3 days. Plan a refill?",
< 5 % is urgent, ≤ 0 % (or manual request) dispatches a rider through the
pickup-and-return flow: requested → rider_en_route → picked_up →
at_filling_plant → returning → delivered.

## Map, Resolve, History, connectivity, push

- **Map** — every dispatch with `GE-321-1234`-style address, lat/lng
  (e.g. 5.85, -0.196), and a Navigate button opening Google Maps.
- **Resolve** — per-sensor action (LEAK: closed valve photo, BURST: cylinder
  removed), photo proof, notes, `POST /api/alerts/resolve`. Gateway offline?
  The resolve is stored in the on-device twin and synced when the link returns.
- **History** — resolved dispatches with photo proof and GREEN/RED validation,
  fraud-list export for NPA, offline-queue retry.
- **Connectivity strip** — floor last seen, LoRa RSSI, ceiling heartbeat, WiFi
  CONNECTED, Cellular MTN/Telecel CONNECTED, LoRa LINKED.
- **Push toggle** — header switch arms high-priority assignment pushes with
  loud alarm + vibration until tapped.
