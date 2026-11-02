# GasSafe Ghana — MVP backend

FastAPI + SQLite + SQLAlchemy. Keeps the original simple shape, with one
non-negotiable rule enforced on every write path.

## Critical business rule

- NPA issues the cylinder serial: `NPA-CRM-GH-00001`.
- GCMC Tema stamps that SAME number on the foot (bottom) ring **and**
  on the anodized-aluminum QR plate. Same number, always.
- Legacy cylinders keep their `GC-12345` foot-ring stamp; the QR plate
  must COPY it, never invent a new number.
- Foot ring != QR → `fraud_flag=True`, RED badge on the NPA dashboard.

`POST /api/cylinders/register` **rejects** mismatches (HTTP 422) so a bad
plate can never enter the pool quietly. `POST /api/exchange/log` **logs**
the swap anyway with `fraud_flag=True` + RED badge, so NPA keeps a visible
audit trail (photo + Ghana digital address + GPS) instead of losing the
evidence.

## Setup (project-local env)

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Or with uv: `uv venv; uv pip install -r requirements.txt`.

## Run

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Docs: <http://127.0.0.1:8000/docs>

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/cylinders/register` | Register cylinder; rejects foot≠QR (422) |
| GET | `/api/cylinders/{serial}` | Cylinder + QR URL + badge |
| POST | `/api/exchange/log` | Log swap; mismatch → fraud_flag + RED |
| GET | `/api/npa/dashboard` | Exchanges with match badge, photo, location (`?fraud_only=true`) |
| GET | `/api/npa/pricing` | NPA retail price list (MVP sample values) |
| POST | `/webhook/lora-gas` | Floor-Unit uplink; alerts on gas/smoke/heat/flame |
| GET | `/c/{serial}?k=` | QR landing target with checksum check |

## Metal QR plate (MVP spec)

Anodized aluminum 30×50×0.5 mm, matte silver, ~GH¢2. Laser-etched QR +
SAME serial as the bottom ring + GasSafe logo, fixed with 2 rivets.
QR encodes `https://gassafe.app/c/{SERIAL}?k={checksum}` (see `app/rules.py`).

## Floor / Ceiling Units (MVP spec)

- Floor Unit (bathroom-scale style): 30 cm round 3 mm steel plate, 4 rubber
  feet, 50/150 kg Zemic load cell, ABS box 10×8×3 cm IP54,
  ESP32-S3 + SX1276 LoRa 868 MHz + BLE 5.0 + HX711, MP-6 gas sensor,
  880 Hz buzzer, 2×18650 + USB-C. Uplinks to `POST /webhook/lora-gas`.
- Ceiling Unit: 8 cm white ABS, smoke + flame + heat, BLE, CR2032.

No RFID bulk-scan in the MVP — identity is foot-ring = QR only.

## Tests

```powershell
pytest -q
```
