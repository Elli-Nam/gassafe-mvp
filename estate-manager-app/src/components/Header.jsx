import React from "react";
import { ESTATE, GATEWAY } from "../data/seed.js";

function ConnPill({ label, value, tone }) {
  return (
    <span className={"conn conn-" + tone}>
      {label} <strong>{value}</strong>
    </span>
  );
}

export default function Header(props) {
  const { tab, setTab, role, setRole, houseCount, activeFilter, onClearFilter } = props;
  return (
    <header className="topbar">
      <div className="topbar-main">
        <div>
          <h1>{ESTATE.name}</h1>
          <p className="estate-sub">
            {ESTATE.code} | {ESTATE.lat}, {ESTATE.lng} | {ESTATE.totalHouses} houses •{" "}
            {ESTATE.totalCylinders} cyls
          </p>
        </div>
        <div className="rolebox">
          <label htmlFor="role">Role</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="manager">Estate Manager</option>
            <option value="guard">Security Guard</option>
            <option value="commercial">Hotel / Restaurant / School Mgr</option>
          </select>
        </div>
      </div>

      <div className="connrow" aria-label="Connectivity">
        <ConnPill label="Floor last seen" value="live" tone="ok" />
        <ConnPill label="Floor LoRa RSSI" value="live" tone="ok" />
        <ConnPill label="Ceiling heartbeat" value="live" tone="ok" />
        <ConnPill label="WiFi" value={GATEWAY.wifi} tone="ok" />
        <ConnPill label="Cellular MTN/Telecel" value={GATEWAY.cellular} tone="ok" />
        <ConnPill label="LoRa" value={GATEWAY.lora} tone="ok" />
      </div>

      <nav className="tabs" aria-label="Dashboard tabs">
        <button
          className={tab === "houses" ? "tab active" : "tab"}
          onClick={() => setTab("houses")}
        >
          Houses &amp; Cylinders <span className="tabcount">{houseCount}</span>
          <kbd title="Press 2">2</kbd>
        </button>
        <button
          className={tab === "analytics" ? "tab active" : "tab"}
          onClick={() => setTab("analytics")}
        >
          Analytics <kbd title="Press 3">3</kbd>
        </button>
        {activeFilter && activeFilter !== "ALL" ? (
          <button className="activechip" onClick={onClearFilter} title="Clear filter">
            × Active: {activeFilter.toLowerCase()}
          </button>
        ) : null}
      </nav>
    </header>
  );
}
