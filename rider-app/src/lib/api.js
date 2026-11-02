/** Minimal client for the GasSafe FastAPI backend.
 *
 * MVP spec: POST exchanges to http://127.0.0.1:8000/api/exchange/log
 * and read the oversight feed from /api/npa/dashboard.
 */

const DEFAULT_BASE = "http://127.0.0.1:8000";
const LS_KEY = "gassafe.apiBase";

export function getApiBase() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
  } catch {
    /* storage unavailable — use default */
  }
  const envBase =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE;
  if (envBase && String(envBase).trim()) {
    return String(envBase).trim().replace(/\/+$/, "");
  }
  return DEFAULT_BASE;
}

export function setApiBase(base) {
  try {
    localStorage.setItem(LS_KEY, String(base ?? "").trim());
  } catch {
    /* ignore */
  }
}

async function asJson(res) {
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { detail: text };
  }
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || `HTTP ${res.status}`;
    throw new Error(Array.isArray(detail) ? detail.join("; ") : String(detail));
  }
  return data;
}

/**
 * Log one bottle-for-bottle exchange.
 * The server compares foot_ring_serial vs qr_serial and returns
 * serial_match / fraud_flag / badge ("GREEN" | "RED").
 */
export async function logExchange(payload) {
  const res = await fetch(`${getApiBase()}/api/exchange/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return asJson(res);
}

/** NPA oversight feed: exchanges with photo, match badge, location. */
export async function fetchDashboard({ fraudOnly = false, limit = 50 } = {}) {
  const q = new URLSearchParams({
    limit: String(limit),
    fraud_only: fraudOnly ? "true" : "false",
  });
  const res = await fetch(`${getApiBase()}/api/npa/dashboard?${q}`);
  return asJson(res);
}
