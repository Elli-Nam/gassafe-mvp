import { useEffect, useRef, useState } from "react";
import { parseQrPayload, serialKind, kindLabel } from "../lib/serials.js";

/**
 * QR scanner for the cylinder plate.
 * - Live camera decode via the built-in BarcodeDetector (Chrome/Android).
 * - Paste/type a serial or full QR URL as fallback.
 * - Upload a photo of the QR as a second fallback.
 * - Demo buttons fill GC-12345 / NPA-CRM-GH-00001 for desktop testing.
 */
export default function QrScanner({ value, onChange }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [supported] = useState(
    () => typeof window !== "undefined" && "BarcodeDetector" in window
  );
  const [draft, setDraft] = useState(value || "");

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  useEffect(() => stopCamera, []);

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  async function startCamera() {
    setError("");
    if (!supported) {
      setError("Live barcode detection is not available in this browser. Type, paste, or upload the QR instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes && codes.length > 0) {
            const serial = parseQrPayload(codes[0].rawValue);
            if (serial) {
              onChange(serial);
              stopCamera();
              return;
            }
          }
        } catch {
          /* keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      setError("Camera unavailable: " + (e && e.message ? e.message : e));
      stopCamera();
    }
  }

  async function decodeFile(file) {
    setError("");
    if (!file) return;
    if (!supported) {
      setError("Image decode needs BarcodeDetector (Chrome/Edge). Read the plate and type the serial instead.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const codes = await detector.detect(bitmap);
      if (codes && codes.length > 0) {
        onChange(parseQrPayload(codes[0].rawValue));
      } else {
        setError("No QR code found in that image. Try again closer to the plate.");
      }
    } catch (e) {
      setError("Could not read that image: " + (e && e.message ? e.message : e));
    }
  }

  function commitDraft() {
    const serial = parseQrPayload(draft);
    if (!serial) {
      setError("Enter a serial such as GC-12345 or NPA-CRM-GH-00001, or paste the full QR URL.");
      return;
    }
    setError("");
    onChange(serial);
  }

  const kind = value ? serialKind(value) : null;

  return (
    <div className="card">
      <h2>1. Scan QR plate</h2>
      <p className="hint">
        Point the camera at the metal QR plate. The serial reads automatically
        (GC-12345 or NPA-CRM-GH-00001).
      </p>

      <div className="row">
        {!scanning ? (
          <button type="button" className="btn" onClick={startCamera}>
            Start camera scan
          </button>
        ) : (
          <button type="button" className="btn danger" onClick={stopCamera}>
            Stop camera
          </button>
        )}
        <label className="btn secondary file-btn">
          Upload QR photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => decodeFile(e.target.files && e.target.files[0])}
          />
        </label>
      </div>

      {scanning && (
        <video ref={videoRef} className="preview" playsInline muted />
      )}
      {!scanning && <video ref={videoRef} className="hidden" playsInline muted />}

      <label className="field">
        <span>QR serial (auto-filled by scan, editable)</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          placeholder="NPA-CRM-GH-00001"
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <div className="row">
        <button type="button" className="btn secondary" onClick={commitDraft}>
          Use typed value
        </button>
        <button
          type="button"
          className="btn link"
          onClick={() => onChange("GC-12345")}
        >
          Demo: GC-12345
        </button>
        <button
          type="button"
          className="btn link"
          onClick={() => onChange("NPA-CRM-GH-00001")}
        >
          Demo: NPA-CRM-GH-00001
        </button>
      </div>

      {value && (
        <p className="serial-line">
          QR serial: <strong>{value}</strong>{" "}
          <span className={`pill ${kind}`}>{kindLabel(kind)}</span>
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
