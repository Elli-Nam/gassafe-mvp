"""GasSafe Ghana MVP backend.

Critical rule enforced on every write path:
foot_ring_serial == qr_serial, else fraud_flag=True.
"""

from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlalchemy.orm import Session

from . import models, rules, schemas
from .database import Base, engine, get_db
from .schemas import (
    CylinderOut,
    CylinderRegister,
    ExchangeLog,
    ExchangeOut,
    LoRaGas,
    LoRaGasOut,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GasSafe Ghana MVP", version="0.1.0")

# --- MVP sample NPA retail price list (GHc, incl. exchange fee) ---
NPA_PRICING = {
    "currency": "GHS",
    "note": "MVP sample prices - NPA to confirm",
    "home_6kg_refill": 95.00,
    "home_12_5kg_refill": 185.00,
    "home_15kg_refill": 220.00,
    "commercial_19kg_refill": 280.00,
    "commercial_38kg_refill": 555.00,
    "new_connection_home_6kg": 450.00,
    "cylinder_deposit_home": 150.00,
    "metal_qr_plate_ghs": 2.00,
}

# LoRa Floor-Unit alert thresholds (MVP defaults).
GAS_PPM_ALERT = 1000.0
SMOKE_PPM_ALERT = 500.0
TEMP_C_ALERT = 60.0


def _cylinder_out(c: models.Cylinder) -> CylinderOut:
    return CylinderOut(
        serial=c.serial,
        foot_ring_serial=c.foot_ring_serial,
        qr_serial=c.qr_serial,
        type=c.type,
        status=c.status,
        serial_match=c.serial_match,
        fraud_flag=c.fraud_flag,
        qr_url=rules.qr_url(c.serial),
    )


def _exchange_out(e: models.Exchange) -> ExchangeOut:
    return ExchangeOut(
        id=e.id,
        old_cylinder_serial=e.old_cylinder_serial,
        new_cylinder_serial=e.new_cylinder_serial,
        foot_ring_serial=e.foot_ring_serial,
        qr_serial=e.qr_serial,
        serial_match=e.serial_match,
        fraud_flag=e.fraud_flag,
        badge=rules.match_badge(e.serial_match),
        ghana_digital_address=e.ghana_digital_address,
        lat=e.lat,
        lng=e.lng,
        photo_url=e.photo_url,
        old_weight_kg=e.old_weight_kg,
        new_weight_kg=e.new_weight_kg,
        verified_by=e.verified_by,
        timestamp=e.timestamp,
    )


@app.get("/health")
def health():
    return {"ok": True, "service": "gassafe-mvp"}


# ---------------------------------------------------------------- cylinders
@app.post("/api/cylinders/register", response_model=CylinderOut, status_code=201)
def register_cylinder(body: CylinderRegister, db: Session = Depends(get_db)):
    """Register a cylinder (NPA issuance / GCMC Tema production).

    Rejects the write unless foot_ring_serial == qr_serial == serial,
    so a mismatched plate can never enter the pool quietly.
    """
    serial = rules.normalize(body.serial)
    foot = rules.normalize(body.foot_ring_serial)
    qr = rules.normalize(body.qr_serial)

    if not rules.is_valid_serial(serial):
        raise HTTPException(
            status_code=422,
            detail=f"serial {serial!r} is not NPA (NPA-CRM-GH-00001) or legacy (GC-12345) format",
        )
    if not (foot == qr == serial):
        # Manufacturer rule: the SAME number on ring and plate, and it
        # must equal the NPA-issued serial. Anything else is rejected.
        raise HTTPException(
            status_code=422,
            detail=(
                "foot_ring_serial, qr_serial and serial must ALL be identical "
                f"(got foot={foot!r} qr={qr!r} serial={serial!r}). "
                "Bottom ring != QR -> suspected fraud, not registered."
            ),
        )
    if db.get(models.Cylinder, serial) is not None:
        raise HTTPException(status_code=409, detail=f"cylinder {serial} already registered")

    c = models.Cylinder(
        serial=serial,
        foot_ring_serial=foot,
        qr_serial=qr,
        type=body.type,
        status=body.status,
        serial_match=True,
        fraud_flag=False,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _cylinder_out(c)


@app.get("/api/cylinders/{serial}", response_model=CylinderOut)
def get_cylinder(serial: str, db: Session = Depends(get_db)):
    c = db.get(models.Cylinder, rules.normalize(serial))
    if c is None:
        raise HTTPException(status_code=404, detail="cylinder not found")
    return _cylinder_out(c)


# ---------------------------------------------------------------- exchange
@app.post("/api/exchange/log", response_model=ExchangeOut, status_code=201)
def log_exchange(body: ExchangeLog, db: Session = Depends(get_db)):
    """Log a bottle-for-bottle swap.

    CRITICAL RULE: compares the foot-ring stamp read off the NEW cylinder
    against the serial decoded from its QR plate. A mismatch is logged
    with fraud_flag=True and a RED badge (kept visible for NPA instead
    of being silently dropped).
    """
    foot = rules.normalize(body.foot_ring_serial)
    qr = rules.normalize(body.qr_serial)
    match = rules.serials_match(foot, qr)

    e = models.Exchange(
        old_cylinder_serial=rules.normalize(body.old_cylinder_serial),
        new_cylinder_serial=rules.normalize(body.new_cylinder_serial),
        foot_ring_serial=foot,
        qr_serial=qr,
        serial_match=match,
        fraud_flag=not match,
        ghana_digital_address=body.ghana_digital_address,
        lat=body.lat,
        lng=body.lng,
        photo_url=body.photo_url,
        old_weight_kg=body.old_weight_kg,
        new_weight_kg=body.new_weight_kg,
        verified_by=body.verified_by,
    )
    db.add(e)

    # Keep the cylinder pool in sync: upsert the NEW cylinder with the
    # same match/fraud verdict so later lookups show the RED flag too.
    new_serial = rules.normalize(body.new_cylinder_serial)
    c = db.get(models.Cylinder, new_serial)
    if c is None:
        c = models.Cylinder(
            serial=new_serial,
            foot_ring_serial=foot,
            qr_serial=qr,
            serial_match=match,
            fraud_flag=not match,
        )
        db.add(c)
    else:
        c.foot_ring_serial = foot
        c.qr_serial = qr
        c.serial_match = match
        c.fraud_flag = not match

    db.commit()
    db.refresh(e)
    return _exchange_out(e)


# ---------------------------------------------------------------- NPA
@app.get("/api/npa/dashboard")
def npa_dashboard(
    limit: int = Query(50, ge=1, le=200),
    fraud_only: bool = False,
    db: Session = Depends(get_db),
):
    """NPA oversight feed: exchanges with foot-ring vs QR match badge.

    Each row carries the photo + Ghana-digital-address location so a RED
    (mismatch) row can be followed up in the field.
    """
    q = db.query(models.Exchange).order_by(models.Exchange.id.desc())
    if fraud_only:
        q = q.filter(models.Exchange.fraud_flag.is_(True))
    rows = q.limit(limit).all()
    items = [_exchange_out(e).model_dump(mode="json") for e in rows]
    return {
        "total": len(items),
        "fraud_count": sum(1 for e in rows if e.fraud_flag),
        "items": items,
    }


@app.get("/api/npa/pricing")
def npa_pricing():
    """Current NPA-approved retail price list (MVP sample values)."""
    return NPA_PRICING


# ---------------------------------------------------------------- LoRa webhook
@app.post("/webhook/lora-gas", response_model=LoRaGasOut, status_code=201)
def lora_gas(body: LoRaGas, db: Session = Depends(get_db)):
    """Ingest one uplink from a Floor Unit (ESP32-S3 + SX1276)."""
    reasons: list[str] = []
    if body.gas_ppm is not None and body.gas_ppm >= GAS_PPM_ALERT:
        reasons.append(f"gas_ppm {body.gas_ppm} >= {GAS_PPM_ALERT}")
    if body.smoke_ppm is not None and body.smoke_ppm >= SMOKE_PPM_ALERT:
        reasons.append(f"smoke_ppm {body.smoke_ppm} >= {SMOKE_PPM_ALERT}")
    if body.temp_c is not None and body.temp_c >= TEMP_C_ALERT:
        reasons.append(f"temp_c {body.temp_c} >= {TEMP_C_ALERT}")
    if body.flame:
        reasons.append("flame detected")

    r = models.SensorReading(
        device_id=body.device_id,
        gas_ppm=body.gas_ppm,
        smoke_ppm=body.smoke_ppm,
        temp_c=body.temp_c,
        flame=body.flame,
        gross_kg=body.gross_kg,
        alert=bool(reasons),
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return LoRaGasOut(
        id=r.id,
        device_id=r.device_id,
        alert=r.alert,
        alert_reason="; ".join(reasons),
        timestamp=r.timestamp,
    )


# ---------------------------------------------------------------- QR lookup
@app.get("/c/{serial}")
def qr_lookup(
    serial: str, k: str = Query(""), db: Session = Depends(get_db)
):
    """Public landing target for the etched QR: /c/{SERIAL}?k=checksum."""
    s = rules.normalize(serial)
    c = db.get(models.Cylinder, s)
    if c is None:
        raise HTTPException(status_code=404, detail="cylinder not found")
    return {
        "serial": c.serial,
        "type": c.type,
        "status": c.status,
        "serial_match": c.serial_match,
        "fraud_flag": c.fraud_flag,
        "badge": rules.match_badge(c.serial_match),
        "checksum_valid": rules.verify_checksum(s, k),
        "qr_url": rules.qr_url(s),
    }
