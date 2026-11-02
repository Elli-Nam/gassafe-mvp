"""SQLAlchemy models for the GasSafe Ghana MVP."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Cylinder(Base):
    """One physical cylinder.

    ``serial`` is the single identity shared by the foot-ring stamp and
    the QR plate (e.g. ``NPA-CRM-GH-00001`` or legacy ``GC-12345``).
    ``serial_match`` is True only when foot_ring_serial == qr_serial;
    ``fraud_flag`` is its inverse and drives the RED badge.
    """

    __tablename__ = "cylinders"

    serial: Mapped[str] = mapped_column(String(32), primary_key=True)
    foot_ring_serial: Mapped[str] = mapped_column(String(32), nullable=False)
    qr_serial: Mapped[str] = mapped_column(String(32), nullable=False)
    type: Mapped[str] = mapped_column(String(16), default="HOME")  # HOME/COMMERCIAL
    status: Mapped[str] = mapped_column(String(16), default="EMPTY")  # FILLED/EMPTY
    serial_match: Mapped[bool] = mapped_column(Boolean, default=True)
    fraud_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Exchange(Base):
    """One bottle-for-bottle swap logged by a retailer/rider."""

    __tablename__ = "exchanges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    old_cylinder_serial: Mapped[str] = mapped_column(String(32), nullable=False)
    new_cylinder_serial: Mapped[str] = mapped_column(String(32), nullable=False)
    # Identity evidence captured at the swap: MUST be equal.
    foot_ring_serial: Mapped[str] = mapped_column(String(32), nullable=False)
    qr_serial: Mapped[str] = mapped_column(String(32), nullable=False)
    serial_match: Mapped[bool] = mapped_column(Boolean, default=True)
    fraud_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    ghana_digital_address: Mapped[str] = mapped_column(String(32), default="")
    lat: Mapped[float] = mapped_column(Float, nullable=True)
    lng: Mapped[float] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str] = mapped_column(String(512), default="")
    old_weight_kg: Mapped[float] = mapped_column(Float, nullable=True)
    new_weight_kg: Mapped[float] = mapped_column(Float, nullable=True)
    verified_by: Mapped[str] = mapped_column(String(64), default="")
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SensorReading(Base):
    """One LoRa gas-sensor uplink from a Floor Unit."""

    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[str] = mapped_column(String(64), nullable=False)
    gas_ppm: Mapped[float] = mapped_column(Float, nullable=True)
    smoke_ppm: Mapped[float] = mapped_column(Float, nullable=True)
    temp_c: Mapped[float] = mapped_column(Float, nullable=True)
    flame: Mapped[bool] = mapped_column(Boolean, default=False)
    gross_kg: Mapped[float] = mapped_column(Float, nullable=True)
    alert: Mapped[bool] = mapped_column(Boolean, default=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
