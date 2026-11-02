"""Pydantic request/response schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class CylinderRegister(BaseModel):
    serial: str = Field(examples=["NPA-CRM-GH-00001"])
    foot_ring_serial: str = Field(examples=["NPA-CRM-GH-00001"])
    qr_serial: str = Field(examples=["NPA-CRM-GH-00001"])
    type: Literal["HOME", "COMMERCIAL"] = "HOME"
    status: Literal["FILLED", "EMPTY"] = "EMPTY"


class CylinderOut(BaseModel):
    serial: str
    foot_ring_serial: str
    qr_serial: str
    type: str
    status: str
    serial_match: bool
    fraud_flag: bool
    qr_url: str


class ExchangeLog(BaseModel):
    old_cylinder_serial: str
    new_cylinder_serial: str
    foot_ring_serial: str = Field(
        description="Foot-ring stamp read off the NEW cylinder at swap time"
    )
    qr_serial: str = Field(description="Serial decoded from the NEW cylinder QR plate")
    ghana_digital_address: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    photo_url: str = ""
    old_weight_kg: Optional[float] = None
    new_weight_kg: Optional[float] = None
    verified_by: str = ""


class ExchangeOut(BaseModel):
    id: int
    old_cylinder_serial: str
    new_cylinder_serial: str
    foot_ring_serial: str
    qr_serial: str
    serial_match: bool
    fraud_flag: bool
    badge: str
    ghana_digital_address: str
    lat: Optional[float]
    lng: Optional[float]
    photo_url: str
    old_weight_kg: Optional[float]
    new_weight_kg: Optional[float]
    verified_by: str
    timestamp: datetime


class LoRaGas(BaseModel):
    device_id: str
    gas_ppm: Optional[float] = None
    smoke_ppm: Optional[float] = None
    temp_c: Optional[float] = None
    flame: bool = False
    gross_kg: Optional[float] = None


class LoRaGasOut(BaseModel):
    id: int
    device_id: str
    alert: bool
    alert_reason: str
    timestamp: datetime
