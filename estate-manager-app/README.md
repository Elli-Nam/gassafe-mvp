# Estate Manager App — East Legon Hills Gate (React PWA)

GasSafe estate dashboard PWA. Matches the old professional dashboard:
dark header, white tables, Maps buttons.

Estate: East Legon Hills Gate `GE-321-0000` | `5.85, -0.196` | 400 houses • 620 cyls.

## Run

```powershell
cd estate-manager-app
npm install
npm run dev
```

Open http://127.0.0.1:5173/ in a browser.

Production preview:

```powershell
npm run build
npm run preview
```

## Tabs

- **Houses & Cylinders** (press `2`) — filterable house/cylinder table.
- **Analytics** (press `3`) — totals, scale distribution, at-risk, low battery.

Filters: ALL · LEAK · BURST · HOME · COMMERCIAL, plus search over
unit, resident, GE- address and serial (`NPA-CRM-GH-…`).

## Locked rules enforced in-app (`src/lib/gassafe.js`)

- **NPA serial rule:** `foot_ring_serial`, `qr_serial` and `serial` must ALL be
  identical. Mismatch → RED FRAUD, `fraud_flag=True`, kept visible for NPA/GNFS.
  New `NPA-CRM-GH-00001` cylinders: foot ring = QR. Legacy `GC-12345`: QR copies
  the existing foot-ring stamp, never invents a new number.
- **Same PCB, different load cell:** HOME 50 kg cell
  (3 / 5 / 6 / 12.5 / 14.5 / 15 kg; 6 kg = 12.5 kg gross, 14.5 kg = 26.5 kg gross),
  COMMERCIAL 150 kg cell (19 / 19.5 / 35 / 45 / 50 / 52 kg;
  19.5 kg = 32.5 kg gross, 52 kg = 87 kg gross).
  19.5 kg is COMMERCIAL. Commercial moves need trolley + 2 officers (GNFS SOP).

## Safety

Statuses LEAK / SMOKE / FLAME / BURST / IN_USE. Cooker-left-on
(flame ON > 30 min, no PIR motion, no weight change) and food-burning
(smoke rising + flame ON) raise a full-screen siren + vibration overlay until
acknowledged; 2 min without response escalates to the Family Circle and the
Estate Manager (FCM high-priority push placeholder in `sendHighPriorityPush`).

## Refill

- `<20%` → “Gas will run out in ~2-3 days. Plan a refill?” (no rider)
- `<5%` → “Almost empty ~1 day left. Tap to request pickup”
- `<=0%` or manual Request Refill → rider flow:
  requested → rider_en_route → picked_up → at_filling_plant → returning → delivered.

## Roles

Header role switch: Estate Manager (full + drills), Security Guard
(gate-pass QR scan enforces foot-ring = QR), Hotel/Restaurant/School manager
(commercial-only view).

## Backend / offline

The app tries `GET http://127.0.0.1:8000/api/npa/dashboard` (FastAPI backend
in the repo root). When unreachable it keeps running on the on-device twin
seed cache — the same store-and-forward idea as the gateway
(WiFi primary + MTN/Telecel cellular fallback).
