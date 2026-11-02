import React from "react";
import { ESTATE } from "../data/seed.js";
import { StatusPill } from "./Houses.jsx";

function isAlertStatus(s) {
  return s === "LEAK" || s === "BURST" || s === "SMOKE" || s === "FLAME";
}

export function estateStats(houses) {
  const cyls = houses.flatMap((h) => h.cylinders.map((c) => ({ house: h, cyl: c })));
  const home = cyls.filter((x) => x.cyl.kind === "HOME");
  const comm = cyls.filter((x) => x.cyl.kind === "COMMERCIAL");
  const alerts = cyls.filter((x) => isAlertStatus(x.cyl.status));
  const lowBatt = cyls.filter((x) => x.cyl.batteryPct < 85);
  return { cyls, home, comm, alerts, lowBatt };
}

export default function Analytics({ houses }) {
  const { cyls, home, comm, alerts, lowBatt } = estateStats(houses);
  const total = Math.max(cyls.length, 1);
  const homePct = Math.round((home.length / total) * 100);
  const commPct = Math.round((comm.length / total) * 100);

  return (
    <div className="analytics">
      <div className="statgrid">
        <div className="stat">
          <span className="stat-n">{ESTATE.totalHouses}</span>
          <span className="stat-l">TOTAL HOUSES</span>
          <span className="muted">Gated estate registry</span>
        </div>
        <div className="stat">
          <span className="stat-n">{cyls.length}/{ESTATE.totalCylinders}</span>
          <span className="stat-l">TOTAL CYLINDERS</span>
          <span className="muted">Active in this view</span>
        </div>
        <div className="stat alert">
          <span className="stat-n">{alerts.length}</span>
          <span className="stat-l">ACTIVE LEAKS</span>
          <span className="muted">Needs GNFS dispatch</span>
        </div>
        <div className="stat">
          <span className="stat-n">{comm.length}</span>
          <span className="stat-l">COMMERCIAL COUNT</span>
          <span className="muted">Needs trolley + 2 officers</span>
        </div>
      </div>

      <div className="panel">
        <h4>HOME vs COMMERCIAL — Scale Distribution</h4>
        <p className="muted">Same PCB, different load cell.</p>
        <div className="dist">
          <div className="dist-row">
            <span className="dist-l">HOME 50kg cell (6kg=12.5kg, 14.5kg=26.5kg)</span>
            <div className="dist-bar"><div className="dist-fill home" style={{ width: `${homePct}%` }} /></div>
            <strong>{home.length}</strong>
          </div>
          <div className="dist-row">
            <span className="dist-l">COMMERCIAL 150kg cell (19.5=32.5kg, 52=87kg)</span>
            <div className="dist-bar"><div className="dist-fill comm" style={{ width: `${commPct}%` }} /></div>
            <strong>{comm.length}</strong>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="panel">
          <h4>At-Risk Houses</h4>
          {alerts.length === 0 ? <p className="muted">No at-risk houses.</p> : null}
          <ul className="risklist">
            {alerts.map(({ house, cyl }) => (
              <li key={cyl.id}>
                <strong>{house.unit}</strong> <StatusPill status={cyl.status} />{" "}
                <span className="muted">{house.digitalAddress}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h4>Battery Low (&lt;85%)</h4>
          {lowBatt.length === 0 ? <p className="muted">All batteries healthy.</p> : null}
          <ul className="risklist">
            {lowBatt.map(({ house, cyl }) => (
              <li key={cyl.id}>
                <strong>{house.unit}</strong> <span className="muted">{cyl.serial}</span>{" "}
                <span className="battlow">{cyl.batteryPct}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
