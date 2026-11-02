// NPA cylinder-identity rule — mirrors app/rules.py on the backend.
// CRITICAL: NPA issues the serial (NPA-CRM-GH-00001). GCMC Tema stamps the
// SAME number on the foot ring and the QR plate. Legacy cylinders keep their
// existing foot-ring stamp (GC-12345); the QR plate must COPY that stamp,
// never invent a new number. foot_ring_serial !== qr_serial => fraud.

export const NPA_SERIAL_RE = /^NPA-CRM-GH-\d{5}$/;
export const LEGACY_SERIAL_RE = /^GC-\d{5}$/;

export function normalize(serial) {
  return String(serial || '').trim().toUpperCase();
}

export function serialKind(serial) {
  const s = normalize(serial);
  if (NPA_SERIAL_RE.test(s)) return 'npa';
  if (LEGACY_SERIAL_RE.test(s)) return 'legacy';
  return 'unknown';
}

export function isValidSerial(serial) {
  return serialKind(serial) !== 'unknown';
}

export function serialsMatch(footRingSerial, qrSerial) {
  return normalize(footRingSerial) === normalize(qrSerial);
}

// Returns { match, fraudFlag, badge, reasons[] } for the History page.
export function validateCylinderIdentity({ footRingSerial, qrSerial }) {
  const foot = normalize(footRingSerial);
  const qr = normalize(qrSerial);
  const reasons = [];
  if (!foot) reasons.push('Foot-ring serial missing — read the bottom ring stamp.');
  if (!qr) reasons.push('QR serial missing — scan the metal QR plate.');
  if (foot && serialKind(foot) === 'unknown') {
    reasons.push(`Foot-ring "${foot}" is neither NPA (NPA-CRM-GH-00001…) nor legacy (GC-12345…) format.`);
  }
  if (qr && serialKind(qr) === 'unknown') {
    reasons.push(`QR "${qr}" is neither NPA nor legacy format — plate may be forged.`);
  }
  const match = Boolean(foot && qr) && foot === qr;
  if (foot && qr && !match) {
    reasons.push(
      'MISMATCH: QR plate must copy the existing foot-ring stamp exactly. ' +
        'A different QR number means the plate was invented — suspected fraud.',
    );
  }
  if (match) reasons.push('Foot-ring stamp and QR plate agree.');
  return { match, fraudFlag: !match, badge: match ? 'GREEN' : 'RED', reasons };
}
