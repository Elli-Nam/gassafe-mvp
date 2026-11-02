import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGas } from '../lib/store.jsx';

export function Layout({ children }) {
  const { alerts, critical } = useGas();
  const active = alerts.length > 0;
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">G</span>
          <span>
            <div className="brand-name">GasSafe</div>
            <div className="brand-sub">Resident App · MVP</div>
          </span>
        </NavLink>
        <div className="topbar-status">
          <span className={`safety-dot ${active || critical ? 'bad' : ''}`} />
          {critical ? 'CRITICAL ALARM' : active ? `${alerts.length} alert${alerts.length > 1 ? 's' : ''}` : 'All safe'}
        </div>
      </header>
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
        <NavLink to="/floor" className={({ isActive }) => (isActive ? 'active' : '')}>Floor Unit</NavLink>
        <NavLink to="/ceiling" className={({ isActive }) => (isActive ? 'active' : '')}>Ceiling Unit</NavLink>
        <NavLink to="/alerts" className={({ isActive }) => (isActive ? 'active' : '')}>
          Alerts{alerts.length > 0 && <span className="count">{alerts.length}</span>}
        </NavLink>
        <NavLink to="/refill" className={({ isActive }) => (isActive ? 'active' : '')}>Refill</NavLink>
        <NavLink to="/family" className={({ isActive }) => (isActive ? 'active' : '')}>Family</NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>History</NavLink>
      </nav>
      <main className="main">{children}</main>
      <footer className="footer">GasSafe MVP demo · telemetry falls back to an on-device twin when the gateway is offline</footer>
    </div>
  );
}

export function Pill({ tone = 'grey', children }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function LevelBar({ pct }) {
  const cls = pct < 5 ? 'bar danger' : pct < 20 ? 'bar warn' : 'bar';
  return (
    <div className={cls} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function KV({ k, v }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

export function timeAgo(iso) {
  if (!iso) return '—';
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function fmtTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function rssiTone(rssi) {
  if (rssi == null) return 'grey';
  if (rssi >= -70) return 'green';
  if (rssi >= -85) return 'amber';
  return 'red';
}

export function rssiLabel(rssi) {
  if (rssi == null) return '—';
  const q = rssi >= -70 ? 'good' : rssi >= -85 ? 'fair' : 'weak';
  return `${rssi} dBm (${q})`;
}
