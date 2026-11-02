import React from 'react';
import { useGas } from '../lib/store.jsx';

// Full-screen critical alarm. Stays mounted (with siren + vibration looping)
// until the user explicitly acknowledges it.
export default function AlarmOverlay() {
  const { critical, acknowledgeCritical } = useGas();
  if (!critical) return null;
  return (
    <div className="alarm-overlay" role="alertdialog" aria-modal="true" aria-label={critical.title}>
      <div className="alarm-card">
        <div className="mono" style={{ opacity: 0.85, marginBottom: 8 }}>
          GASAFE CRITICAL · {critical.kind.replace(/_/g, ' ')}
        </div>
        <h1>{critical.title}</h1>
        <p>{critical.body}</p>
        <p style={{ fontSize: 13, opacity: 0.85 }}>
          Siren + vibration keep going until you acknowledge — even if the phone is silent, the overlay stays on screen.
        </p>
        <button className="btn primary" onClick={acknowledgeCritical} autoFocus>
          I&apos;ve checked — silence alarm
        </button>
      </div>
    </div>
  );
}
