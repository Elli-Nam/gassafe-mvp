import React, { useState } from 'react';
import { useGas } from '../lib/store.jsx';
import { Pill } from '../components/ui.jsx';

export default function Family() {
  const { demo, addFamily, alerts } = useGas();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Name and phone are both required.');
      return;
    }
    if (demo.family.some((m) => m.phone === phone.trim())) {
      setError('That phone number is already in the circle.');
      return;
    }
    addFamily({ name: name.trim(), phone: phone.trim(), role });
    setName('');
    setPhone('');
    setRole('member');
    setError('');
  };

  return (
    <div>
      <h1 className="page-title">Family Circle</h1>
      <p className="page-sub">Everyone here gets the same LEAK / SMOKE / FLAME + low-gas pushes. The owner manages the circle; members receive alerts.</p>

      <div className="card">
        <h3>Members ({demo.family.length})</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Alerts</th></tr></thead>
          <tbody>
            {demo.family.map((m) => (
              <tr key={m.phone}>
                <td><strong>{m.name}</strong></td>
                <td className="mono">{m.phone}</td>
                <td>{m.role === 'owner' ? <Pill tone="amber">OWNER</Pill> : <Pill tone="grey">MEMBER</Pill>}</td>
                <td><Pill tone="green">SHARED</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Add family by phone</h3>
        <p className="hint">They join by phone number — no account needed for the MVP demo. Latest alert ({alerts.length ? alerts[0].kind : 'none'}) would reach all {demo.family.length} members.</p>
        <form onSubmit={submit} className="grid" style={{ gap: 10 }}>
          <label className="field">Name<input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Efua Mensah" /></label>
          <label className="field">Phone<input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0003" inputMode="tel" /></label>
          <label className="field">Role
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member — receives alerts</option>
              <option value="owner">Owner — manages circle</option>
            </select>
          </label>
          {error && <Pill tone="red">{error}</Pill>}
          <div className="btn-row"><button className="btn primary" type="submit">Add + share alerts</button></div>
        </form>
      </div>
    </div>
  );
}
