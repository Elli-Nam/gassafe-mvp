# GasSafe Rider App (MVP)

React PWA used by riders/retailers to log bottle-for-bottle cylinder exchanges
with photo proof, and by NPA to review them.

## NPA rule (enforced)

- NPA issues the serial: `NPA-CRM-GH-00001`. The manufacturer stamps the SAME
  number on the foot (bottom) ring and on the metal QR plate.
- Legacy cylinders keep their existing ring stamp (`GC-12345`); the QR plate
  must COPY it, never invent a new number.
- `foot_ring_serial != qr_serial` → `fraud_flag=True` + RED badge (server
  computes this in `POST /api/exchange/log`; the app previews it live).

## Run

Backend first (from repo root):

```sh
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Rider app (from this folder):

```sh
npm install
npm run dev
```

Then open http://localhost:5173/ in a browser.

`npm run build` outputs static `dist/` (`npm run preview` serves it).

## Use

1. **Rider page** — Start camera scan on the QR plate (auto-reads `GC-12345`
   or `NPA-CRM-GH-00001`; type/paste/upload or the demo buttons work too).
2. Type the foot-ring stamp manually → GREEN MATCH badge if equal, RED FRAUD
   if different.
3. Capture the combined photo (foot ring + QR plate in ONE frame) and tick
   the confirmation — Log Exchange stays disabled without it.
4. Fill weights, Ghana digital address (`GA-123-4567`), Capture GPS, rider
   name → **Log Exchange** POSTs to `http://127.0.0.1:8000/api/exchange/log`.
5. **NPA Dashboard page** — lists exchanges with photo, foot-ring vs QR
   status, location, and timestamp; toggle Fraud only.

The API base is editable in the app (saved to localStorage, or set
`VITE_API_BASE` at build time). Browsers enforce CORS, so the dev server
proxies `/api` and `/c` to `http://127.0.0.1:8000`; if you serve `dist/`
elsewhere, serve the API behind the same origin or enable CORS on it.
