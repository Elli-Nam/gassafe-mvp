import { useMemo, useState } from "react";
import QrScanner from "../components/QrScanner.jsx";
import PhotoProof from "../components/PhotoProof.jsx";
import { getApiBase, setApiBase, logExchange } from "../lib/api.js";
import {
  GA_ADDRESS_RE,
  isValidSerial,
  kindLabel,
  normalize,
  serialKind,
  serialsMatch,
} from "../lib/serials.js";

/**
 * Rider exchange screen.
 * - QR serial from camera scan; foot-ring serial typed from the stamp.
 * - Live GREEN MATCH / RED FRAUD badge; mismatch posts fraud_flag=True.
 * - Requires the combined foot-ring + QR proof photo before posting.
 */
export default function RiderPage() {
  const [qrSerial, setQrSerial] = useState("");
  const [footRing, setFootRing] = useState("");
  const [oldSerial, setOldSerial] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [oldWeight, setOldWeight] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [rider, setRider] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [apiBase, setApiBaseState] = useState(getApiBase());
  const [locStatus, setLocStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");

  const foot = normalize(footRing);
  const qr = normalize(qrSerial);
  const bothPresent = foot.length > 0 && qr.length > 0;
  const match = bothPresent && serialsMatch(foot, qr);
  const fraud = bothPresent && !match;

  const qrKind = qr ? serialKind(qr) : null;
  const footKind = foot ? serialKind(foot) : null;
  const addressOk = GA_ADDRESS_RE.test(address.trim());
  const photoOk = photo.length > 0 && photoConfirmed;

  const newCylinder = normalize(newSerial) || qr;
  const problems = useMemo(() => {
    const list = [];
    if (!qr) list.push("Scan or enter the QR serial.");
    else if (!isValidSerial(qr))
      list.push("QR serial format unknown — expected NPA-CRM-GH-00001 or GC-12345.");
    if (!foot) list.push("Enter the foot-ring stamp exactly as stamped.");
    else if (!isValidSerial(foot))
      list.push("Foot-ring format unknown — expected NPA-CRM-GH-00001 or GC-12345.");
    if (!normalize(oldSerial)) list.push("Enter the OLD (collected) cylinder serial.");
    if (!newCylinder) list.push("Enter the NEW (delivered) cylinder serial or scan its QR.");
    if (!photoOk) list.push("Capture the combined foot-ring + QR photo and confirm it.");
    if (address.trim() && !addressOk)
      list.push("Ghana digital address must look like GA-123-4567.");
    return list;
  }, [qr, foot, oldSerial, newCylinder, photoOk, address, addressOk]);

  function captureLocation() {
    setLocStatus("Locating…");
    if (!("geolocation" in navigator)) {
      setLocStatus("Geolocation not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude.toFixed(6)));
        setLng(String(pos.coords.longitude.toFixed(6)));
        setLocStatus("Location captured.");
      },
      (err) => setLocStatus("Location failed: " + (err && err.message ? err.message : err)),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function numOrNull(v) {
    if (String(v).trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  async function submit() {
    setSubmitError("");
    setResult(null);
    if (problems.length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        old_cylinder_serial: normalize(oldSerial),
        new_cylinder_serial: newCylinder,
        foot_ring_serial: foot,
        qr_serial: qr,
        ghana_digital_address: address.trim(),
        lat: numOrNull(lat),
        lng: numOrNull(lng),
        photo_url: photo,
        old_weight_kg: numOrNull(oldWeight),
        new_weight_kg: numOrNull(newWeight),
        verified_by: rider.trim(),
      };
      const saved = await logExchange(payload);
      setResult(saved);
    } catch (e) {
      setSubmitError(
        (e && e.message ? e.message : String(e)) +
          " — is the backend running at " +
          getApiBase() +
          "?"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <QrScanner value={qrSerial} onChange={(s) => setQrSerial(normalize(s))} />

      <div className="card">
        <h2>2. Foot-ring stamp</h2>
        <p className="hint">
          Read the number physically stamped on the bottom (foot) ring and type
          it exactly. NPA rule: it must equal the QR serial. For legacy
          cylinders the QR must copy the existing ring (GC-12345) — never
          invent a new number.
        </p>
        <label className="field">
          <span>Foot-ring serial (manual entry)</span>
          <input
            value={footRing}
            onChange={(e) => setFootRing(e.target.value.toUpperCase())}
            placeholder="NPA-CRM-GH-00001"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {foot && (
          <p className="serial-line">
            Foot ring: <strong>{foot}</strong>{" "}
            <span className={`pill ${footKind}`}>{kindLabel(footKind)}</span>
          </p>
        )}
        {bothPresent &&
          (match ? (
            <p className="badge green">MATCH — foot ring equals QR</p>
          ) : (
            <p className="badge red">
              FRAUD — foot ring differs from QR (fraud_flag=True will be logged)
            </p>
          ))}
      </div>

      <PhotoProof
        value={photo}
        confirmed={photoConfirmed}
        onChange={setPhoto}
        onConfirm={setPhotoConfirmed}
      />

      <div className="card">
        <h2>4. Exchange details</h2>
        <div className="grid2">
          <label className="field">
            <span>Old cylinder (collected)</span>
            <input
              value={oldSerial}
              onChange={(e) => setOldSerial(e.target.value.toUpperCase())}
              placeholder="GC-12345"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="field">
            <span>New cylinder (delivered, defaults to QR)</span>
            <input
              value={newSerial}
              onChange={(e) => setNewSerial(e.target.value.toUpperCase())}
              placeholder={qr || "NPA-CRM-GH-00001"}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="field">
            <span>Old weight (kg)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={oldWeight}
              onChange={(e) => setOldWeight(e.target.value)}
              placeholder="e.g. 12.5"
            />
          </label>
          <label className="field">
            <span>New weight (kg)</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="e.g. 15.0"
            />
          </label>
        </div>
        <label className="field">
          <span>Ghana digital address (GA-123-4567)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value.toUpperCase())}
            placeholder="GA-123-4567"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {address.trim() && !addressOk && (
          <p className="error">Address must match GA-123-4567.</p>
        )}
        <div className="grid2">
          <label className="field">
            <span>Latitude (auto)</span>
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="5.603700"
              inputMode="decimal"
            />
          </label>
          <label className="field">
            <span>Longitude (auto)</span>
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-0.187000"
              inputMode="decimal"
            />
          </label>
        </div>
        <div className="row">
          <button type="button" className="btn secondary" onClick={captureLocation}>
            Capture GPS
          </button>
          {locStatus && <span className="hint">{locStatus}</span>}
        </div>
        <label className="field">
          <span>Rider name / ID</span>
          <input
            value={rider}
            onChange={(e) => setRider(e.target.value)}
            placeholder="e.g. Kofi M."
            autoComplete="off"
          />
        </label>
      </div>

      <div className="card">
        <h2>5. Log exchange</h2>
        <label className="field">
          <span>API base (backend)</span>
          <input
            value={apiBase}
            onChange={(e) => {
              setApiBaseState(e.target.value);
              setApiBase(e.target.value);
            }}
            placeholder="http://127.0.0.1:8000"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {fraud && (
          <p className="warn">
            Mismatch — this will be logged with fraud_flag=True and a RED badge
            for NPA follow-up.
          </p>
        )}
        {problems.length > 0 && (
          <ul className="problems">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="btn primary"
          disabled={submitting || problems.length > 0}
          onClick={submit}
        >
          {submitting ? "Logging…" : "Log Exchange"}
        </button>
        {submitError && <p className="error">{submitError}</p>}
        {result && (
          <div className={`result ${result.fraud_flag ? "fraud" : "ok"}`}>
            <p className={`badge ${result.fraud_flag ? "red" : "green"}`}>
              {result.fraud_flag ? "FRAUD logged" : "MATCH logged"} — #{result.id}
            </p>
            <p className="hint">
              Foot {result.foot_ring_serial} vs QR {result.qr_serial} ·{" "}
              {result.timestamp}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
