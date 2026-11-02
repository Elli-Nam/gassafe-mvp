/** Serial-number rules shared with the backend (see app/rules.py).
 *
 * NPA rule (enforced in this UI and on the server):
 * - NPA issues the cylinder serial: NPA-CRM-GH-00001
 * - The manufacturer must stamp the SAME number on the foot (bottom)
 *   ring and on the metal QR plate. Same number, always.
 * - Legacy cylinders keep their existing foot-ring stamp (GC-12345);
 *   the QR plate must COPY that stamp, never invent a new number.
 * - foot_ring_serial != qr_serial  =>  fraud_flag = True (RED badge).
 */

export const NPA_RE = /^NPA-CRM-GH-\d{5}$/;
export const LEGACY_RE = /^GC-\d{5}$/;
export const GA_ADDRESS_RE = /^GA-\d{3}-\d{4}$/;
export const QR_BASE_URL = "https://gassafe.app/c";

export function normalize(serial) {
  return String(serial ?? "").trim().toUpperCase();
}

/** 'npa' | 'legacy' | 'unknown' */
export function serialKind(serial) {
  const s = normalize(serial);
  if (NPA_RE.test(s)) return "npa";
  if (LEGACY_RE.test(s)) return "legacy";
  return "unknown";
}

export function isValidSerial(serial) {
  const k = serialKind(serial);
  return k === "npa" || k === "legacy";
}

export function serialsMatch(footRingSerial, qrSerial) {
  return normalize(footRingSerial) === normalize(qrSerial);
}

/**
 * Extract a cylinder serial from raw QR text.
 * Accepts:
 *  - a bare serial: "NPA-CRM-GH-00001" or "GC-12345" (any case/whitespace)
 *  - the etched QR URL: "https://gassafe.app/c/NPA-CRM-GH-00001?k=abc123"
 *  - any text containing one of those patterns (first hit wins)
 * Returns the normalized serial, or "" when nothing recognisable is found.
 */
export function parseQrPayload(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return "";
  // Try URL form first.
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      const m = u.pathname.match(/\/c\/([^/?#]+)/i);
      if (m) {
        const s = normalize(decodeURIComponent(m[1]));
        if (s) return s;
      }
    }
  } catch {
    // Not a parseable URL — fall through to pattern search.
  }
  const upper = raw.toUpperCase();
  const hit = upper.match(NPA_RE) || upper.match(LEGACY_RE);
  if (hit) return hit[0];
  return normalize(raw);
}

export function kindLabel(kind) {
  if (kind === "npa") return "NPA-issued";
  if (kind === "legacy") return "Legacy";
  return "Unknown format";
}
