# GasSafe GNFS Dashboard PWA

Professional pitching-grade ops console — dark header, white table, red DISPATCH buttons.

## Run

```bash
cd gnfs-dashboard-app
npm install
npm run dev
```

Open the printed local URL in a browser (dev server defaults to `http://localhost:5183`).

Production build: `npm run build` → `npm run preview`.

## What is inside

- Header: `GasSafe GNFS — FIRE SMOKE HEAT Filters Added`, Live badge, role switcher (GNFS HQ / Regional Commander / District Officer / Field Officer), tabs Live PENDING 20 / History & Regional 90 / Fraud & NPA.
- Filters: District dropdown (district-only view) · Regional dropdown (all 16 regions → all its districts) · National fixed to Ghana · sensor chips ALL / FIRE / SMOKE / LEAK / BURST / HEAT / COOK / HOME / COMMERCIAL · top + bottom search by digital address or NPA code.
- Table columns: TIME/PRIORITY · SENSOR TYPE & READINGS · UNIT & ADDRESS · CYLINDER/SCALE & PRIORITY · STATUS · ACTION (DISPATCH TEAM NOW / DISPATCH NOW / Call). Expand any row for floor unit, ceiling unit, gateway, NPA proof and refill math.
- Locked NPA rule everywhere: `serial == footRingSerial == qrSerial`. New `NPA-CRM-GH-00001`: manufacturer stamps foot ring = QR. Legacy `GC-12345`: QR copies the existing ring, never invents. Mismatch → RED FRAUD, `fraud_flag=True`, kept visible with export.
- Load cells: same PCB, HOME 50kg vs COMMERCIAL 150kg (19.5kg moved HOME → COMMERCIAL; COMMERCIAL needs trolley + 2 officers).
- Floor/ceiling telemetry, refill signals (&lt;20% plan · &lt;5% urgent · ≤0 dispatch), cooker-left-on + food-burning alarms, full-screen loud alarm with Acknowledge / Escalate (drill), dispatch drawer with officer tracking + photo proof + offline queue, analytics (400 houses · 7/620 cylinders · 3 leaks · 3 commercial · HOME/COMMERCIAL bars · at-risk · battery-low), connectivity twin fallback, FCM placeholder.
- PWA: `manifest.webmanifest` + offline service worker (`sw.js`, production only).
