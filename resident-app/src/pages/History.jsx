import React, { useState } from 'react';
import { useGas } from '../lib/store.jsx';
import { Pill, fmtTime } from '../components/ui.jsx';
import { normalize, validateCylinderIdentity } from '../lib/npa.js';

export default function History() {
  const { demo, addDelivery } = useGas();
  const [foot, setFoot] = useState('NPA-CRM-GH-00001');
  const [qr, setQr] = useState('NPA-CRM-GH-00001');
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');

  const preview = validateCylinderIdentity({ footRingSerial: foot, qrSerial: qr });

  const onPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const logCheck = () => {
    const v = validateCylinderIdentity({ footRingSerial: foot, qrSerial: qr });
    addDelivery({
      id: `del-${Date.now().toString(36)}`,
      footRingSerial: normalize(foot),
      qrSerial: normalize(qr),
      fraudFlag: v.fraudFlag,
      photoProof: photo,
      address: '14 Osu Badu St, Accra',
      lat: 5.5557,
      lng: -0.1963,
      at: new Date().toISOString(),
    });
  };

  return (
    <div>
      <h1 className="page-title">History + cylinder check</h1>
      <p className="page-sub">
        NPA critical rule: the foot-ring stamp must equal the QR serial. NPA cylinders look like{' '}
        <span className="mono">NPA-CRM-GH-00001</span>; legacy cylinders keep their stamp (<span className="mono">GC-12345</span>) and the QR must copy it — never invent a new number.
      </p>

      <div className="card">
        <h3>Verify a delivery</h3>
        <p className="hint">Type (or scan) both numbers. Mismatches stay on record for the NPA — they are never silently dropped.</p>
        <div className="grid two">
          <label className="field">Foot-ring serial (bottom ring stamp)<input className="input mono" value={foot} onChange={(e) => setFoot(e.target.value)} placeholder="NPA-CRM-GH-00001 or GC-12345" /></label>
          <label className="field">QR serial (metal plate scan)<input className="input mono" value={qr} onChange={(e) => setQr(e.target.value)} placeholder="must copy the foot ring" /></label>
        </div>
        <div style={{ margin: '10px 0' }}>
          {preview.match ? <Pill tone="green">GREEN · MATCH</Pill> : <Pill tone="red">RED · FRAUD — foot ring ≠ QR</Pill>}
        </div>
        <ul style={{ fontSize: 13, color: 'var(--ink-dim)', margin: '0 0 10px', paddingLeft: 18 }}>
          {preview.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
        <label className="field">Photo proof (cylinder + plate)
          <input className="input" type="file" accept="image/*" capture="environment" onChange={onPhoto} />
        </label>
        {photo && <img className="photo-proof" style={{ marginTop: 8, maxWidth: 320 }} src={photo} alt={`Photo proof ${photoName}`} />}
        <div className="btn-row"><button className="btn primary" onClick={logCheck}>Log this check to history</button></div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Delivery history ({demo.deliveries.length})</h3>
        <p className="hint">Fraud-flagged rows stay visible with timestamp + location for NPA follow-up.</p>
        <table className="table">
          <thead><tr><th>When / where</th><th>Foot ring vs QR</th><th>Verdict</th></tr></thead>
          <tbody>
            {demo.deliveries.map((d) => (
              <tr key={d.id}>
                <td>
                  <strong>{fmtTime(d.at)}</strong>
                  <br /><span style={{ color: 'var(--ink-dim)' }}>{d.address}</span>
                  <br /><span className="mono" style={{ color: 'var(--ink-faint)' }}>{d.lat}, {d.lng}</span>
                  {d.photoProof && <><br /><img className="photo-proof" style={{ marginTop: 6, maxWidth: 220 }} src={d.photoProof} alt={`Photo proof for ${d.id}`} /></>}
                </td>
                <td className="mono">foot: {d.footRingSerial}<br />qr: {d.qrSerial}</td>
                <td>{d.fraudFlag ? <Pill tone="red">RED · FRAUD</Pill> : <Pill tone="green">GREEN · MATCH</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
