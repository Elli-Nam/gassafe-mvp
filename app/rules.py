"""Serial-number business rules for GasSafe Ghana MVP.

CRITICAL RULE (enforced everywhere a cylinder identity is written):
- NPA issues the cylinder serial, format ``NPA-CRM-GH-00001``.
- GCMC Tema (manufacturer) stamps the SAME number on the bottom
  (foot) ring and on the metal QR plate. Same number, always.
- Legacy cylinders keep their existing foot-ring stamp (``GC-12345``);
  the QR plate must COPY that stamp, never invent a new number.
- If foot_ring_serial != qr_serial -> fraud_flag=True.
"""

from __future__ import annotations

import hashlib
import re

# NPA-issued serials for the CRM exchange pool.
NPA_SERIAL_RE = re.compile(r"^NPA-CRM-GH-\d{5}$")
# Pre-existing foot-ring stamps on legacy cylinders.
LEGACY_SERIAL_RE = re.compile(r"^GC-\d{5}$")

QR_BASE_URL = "https://gassafe.app/c"
# MVP demo secret used to mint/verify the ``?k=`` QR checksum.
# Production must load this from env, not ship it in code.
QR_CHECKSUM_SECRET = "gassafe-mvp-demo-secret"


def normalize(serial: str) -> str:
    """Canonical form for comparing stamped vs encoded serials."""
    return serial.strip().upper()


def serial_kind(serial: str) -> str:
    """Return 'npa', 'legacy', or 'unknown' for a serial number."""
    s = normalize(serial)
    if NPA_SERIAL_RE.match(s):
        return "npa"
    if LEGACY_SERIAL_RE.match(s):
        return "legacy"
    return "unknown"


def is_valid_serial(serial: str) -> bool:
    """A serial is usable only if it is NPA-issued or a legacy stamp."""
    return serial_kind(serial) in ("npa", "legacy")


def serials_match(foot_ring_serial: str, qr_serial: str) -> bool:
    """True only when the foot-ring stamp and QR payload are identical."""
    return normalize(foot_ring_serial) == normalize(qr_serial)


def checksum(serial: str, secret: str = QR_CHECKSUM_SECRET) -> str:
    """6-hex-char checksum binding a QR URL to its serial."""
    digest = hashlib.sha256(f"{normalize(serial)}|{secret}".encode()).hexdigest()
    return digest[:6]


def qr_url(serial: str, secret: str = QR_CHECKSUM_SECRET) -> str:
    """Public URL laser-etched (as QR) onto the metal plate."""
    s = normalize(serial)
    return f"{QR_BASE_URL}/{s}?k={checksum(s, secret)}"


def verify_checksum(serial: str, k: str, secret: str = QR_CHECKSUM_SECRET) -> bool:
    """Check the ``?k=`` token on a scanned QR URL."""
    return normalize(k or "") == checksum(serial, secret)


def match_badge(serial_match: bool) -> str:
    """NPA dashboard badge colour: GREEN = match, RED = suspected fraud."""
    return "GREEN" if serial_match else "RED"
