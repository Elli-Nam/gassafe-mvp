import { useCallback, useEffect, useState } from "react";
import { fetchDashboard } from "../lib/api.js";

/** NPA oversight feed: every exchange with proof photo, match badge, location. */
export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [fraudCount, setFraudCount] = useState(0);
  const [fraudOnly, setFraudOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDashboard({ fraudOnly, limit: 50 });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setFraudCount(data.fraud_count || 0);
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [fraudOnly]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="card">
        <h2>NPA Dashboard</h2>
        <p className="hint">
          {total} exchange(s) · {fraudCount} flagged fraud. RED rows need
          field follow-up with the proof photo and location.
        </p>
        <div className="row">
          <button type="button" className="btn secondary" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <label className="check inline">
            <input
              type="checkbox"
              checked={fraudOnly}
              onChange={(e) => setFraudOnly(e.target.checked)}
            />
            Fraud only
          </label>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {items.length === 0 && !loading && !error && (
        <p className="hint">No exchanges yet — log one from the Rider page.</p>
      )}

      {items.map((x) => (
        <article key={x.id} className={`card exchange ${x.fraud_flag ? "fraud" : ""}`}>
          <div className="ex-head">
            <strong>#{x.id}</strong>
            <span className={`badge ${x.fraud_flag ? "red" : "green"}`}>
              {x.fraud_flag ? `RED · FRAUD (${x.badge})` : `GREEN · MATCH (${x.badge})`}
            </span>
          </div>
          <div className="ex-grid">
            {x.photo_url ? (
              <img src={x.photo_url} alt={`Proof #${x.id}`} className="thumb" />
            ) : (
              <p className="warn">No photo</p>
            )}
            <dl>
              <dt>Foot ring</dt>
              <dd>{x.foot_ring_serial}</dd>
              <dt>QR serial</dt>
              <dd>{x.qr_serial}</dd>
              <dt>Old → New</dt>
              <dd>
                {x.old_cylinder_serial} → {x.new_cylinder_serial}
              </dd>
              <dt>Weights</dt>
              <dd>
                {x.old_weight_kg ?? "—"} kg → {x.new_weight_kg ?? "—"} kg
              </dd>
              <dt>Location</dt>
              <dd>
                {x.ghana_digital_address || "—"}
                {x.lat != null && x.lng != null && (
                  <>
                    {" "}
                    · {x.lat}, {x.lng}
                  </>
                )}
              </dd>
              <dt>Logged</dt>
              <dd>
                {x.timestamp}
                {x.verified_by ? ` · by ${x.verified_by}` : ""}
              </dd>
            </dl>
          </div>
        </article>
      ))}
    </div>
  );
}
