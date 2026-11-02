import { useEffect, useRef, useState } from "react";

/**
 * Combined proof photo: the foot (bottom) ring stamp AND the QR plate
 * must appear in the SAME frame. The rider confirms this explicitly;
 * Log Exchange stays disabled until photo + confirmation exist.
 * The compressed JPEG data URL is sent as photo_url.
 */
export default function PhotoProof({ value, confirmed, onChange, onConfirm }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }

  async function startCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
    } catch (e) {
      setError("Camera unavailable: " + (e && e.message ? e.message : e));
    }
  }

  function compressToDataUrl(source, maxSide = 1024) {
    const w = source.naturalWidth || source.videoWidth;
    const h = source.naturalHeight || source.videoHeight;
    if (!w || !h) throw new Error("empty image");
    const scale = Math.min(1, maxSide / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.72);
  }

  function snapshotFromCamera() {
    setError("");
    try {
      const dataUrl = compressToDataUrl(videoRef.current);
      onChange(dataUrl);
      stopCamera();
    } catch (e) {
      setError("Snapshot failed: " + (e && e.message ? e.message : e));
    }
  }

  async function fileToProof(file) {
    setError("");
    if (!file) return;
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("unreadable image"));
          img.src = url;
        });
        onChange(compressToDataUrl(img));
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError("Could not use that photo: " + (e && e.message ? e.message : e));
    }
  }

  return (
    <div className="card">
      <h2>3. Proof photo (required)</h2>
      <p className="hint">
        Capture the foot-ring stamp <strong>and</strong> the QR plate together
        in <strong>one frame</strong>. Exchanges without this combined photo
        are rejected by the NPA rule.
      </p>

      <div className="row">
        {!cameraOn ? (
          <button type="button" className="btn" onClick={startCamera}>
            Open camera
          </button>
        ) : (
          <>
            <button type="button" className="btn" onClick={snapshotFromCamera}>
              Capture frame
            </button>
            <button type="button" className="btn danger" onClick={stopCamera}>
              Close camera
            </button>
          </>
        )}
        <label className="btn secondary file-btn">
          Upload photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => fileToProof(e.target.files && e.target.files[0])}
          />
        </label>
      </div>

      {cameraOn && <video ref={videoRef} className="preview" playsInline muted />}
      {!cameraOn && <video ref={videoRef} className="hidden" playsInline muted />}

      {value ? (
        <img src={value} alt="Foot ring + QR plate proof" className="preview" />
      ) : (
        <p className="warn">No proof photo yet — Log Exchange stays disabled.</p>
      )}

      <label className="check">
        <input
          type="checkbox"
          checked={!!confirmed}
          onChange={(e) => onConfirm(e.target.checked)}
        />
        I confirm this photo shows the foot ring AND the QR plate in the same
        frame.
      </label>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
