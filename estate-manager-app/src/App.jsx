import React from "react";
import Header from "./components/Header.jsx";
import HouseTable, { Filters, applyHouseFilter } from "./components/Houses.jsx";
import Analytics from "./components/Analytics.jsx";
import { AlarmOverlay, GuardPanel, SafetyDrills, escalateAlarm } from "./components/Safety.jsx";
import { GATEWAY } from "./data/seed.js";
import { SEED_HOUSES } from "./data/seed.js";
import {
  ESCALATION_MIN,
  fetchNpaDashboard,
  isCookerLeftOn,
  isFoodBurning,
} from "./lib/gassafe.js";

function clone(seed) {
  return JSON.parse(JSON.stringify(seed));
}

function now() {
  return new Date().toLocaleString();
}

let alarmSeq = 1;

export default function App() {
  const [houses, setHouses] = React.useState(() => clone(SEED_HOUSES));
  const [tab, setTab] = React.useState("houses");
  const [filter, setFilter] = React.useState("ALL");
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState("manager");
  const [expandedId, setExpandedId] = React.useState("A12-C1");
  const [alarms, setAlarms] = React.useState([]);
  const [gateLog, setGateLog] = React.useState([]);
  const [backend, setBackend] = React.useState("checking");
  const timers = React.useRef({});

  const effectiveFilter = role === "commercial" ? "COMMERCIAL" : filter;
  const visible = applyHouseFilter(houses, effectiveFilter, query);

  // ---- keyboard tabs: tap 2 / 3
  React.useEffect(() => {
    function onKey(e) {
      const tag = String(e.target && e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.key === "2") setTab("houses");
      if (e.key === "3") setTab("analytics");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- backend handshake (offline twin fallback)
  React.useEffect(() => {
    let live = true;
    fetchNpaDashboard(5)
      .then(() => { if (live) setBackend("connected"); })
      .catch(() => { if (live) setBackend("offline"); });
    return () => { live = false; };
  }, []);

  // ---- live telemetry tick (floor scale + last seen)
  React.useEffect(() => {
    const t = setInterval(() => {
      setHouses((prev) =>
        prev.map((h) => ({
          ...h,
          cylinders: h.cylinders.map((c) => {
            const cooking = c.flameOn && c.status === "IN_USE";
            const gross = cooking ? Math.max(c.tareKg, Math.round((c.grossKg - 0.01) * 10) / 10) : c.grossKg;
            return { ...c, grossKg: gross, lastSeenSec: 4 + Math.floor(Math.random() * 9) };
          }),
        }))
      );
    }, 10000);
    return () => clearInterval(t);
  }, []);

  function raiseAlarm(key, alarm) {
    setAlarms((prev) => {
      if (prev.some((a) => a.key === key && !a.acknowledged)) return prev;
      const item = {
        id: alarmSeq++,
        key,
        acknowledged: false,
        escalated: false,
        raisedAt: now(),
        ...alarm,
      };
      timers.current[item.id] = setTimeout(() => escalate(item.id), ESCALATION_MIN * 60 * 1000);
      return [...prev, item];
    });
  }

  function escalate(id) {
    setAlarms((prev) => {
      const item = prev.find((a) => a.id === id);
      if (!item || item.acknowledged || item.escalated) return prev;
      escalateAlarm(item);
      return prev.map((a) => (a.id === id ? { ...a, escalated: true } : a));
    });
  }

  function acknowledge(id) {
    if (timers.current[id]) clearTimeout(timers.current[id]);
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }

  // ---- alarm engine: gas events, cooker left on, food burning
  React.useEffect(() => {
    houses.forEach((h) => {
      h.cylinders.forEach((c) => {
        if (c.status === "LEAK" || c.status === "BURST" || c.status === "SMOKE" || c.status === "FLAME") {
          raiseAlarm(`gas-${c.id}`, {
            type: "gas",
            houseUnit: h.unit,
            title: c.status === "BURST" ? "Burst pipe suspected — dispatch GNFS" : "Gas leak detected",
            body: `${h.unit} ${h.resident}: ${c.kind} ${c.sizeKg}kg ${c.serial} reads ${c.gasPpm} ppm (${c.status}). ${h.digitalAddress}.`,
          });
        }
        const ceil = h.ceiling;
        if (
          ceil &&
          isCookerLeftOn({
            flameOn: c.flameOn,
            flameOnMinutes: c.flameOnMinutes,
            pirMotionMinutesAgo: ceil.lastMotionMinAgo,
            weightChangedRecently: c.weightChangedRecently,
          })
        ) {
          raiseAlarm(`cooker-${c.id}`, {
            type: "cooker",
            houseUnit: h.unit,
            title: "Cooker left on? Check kitchen 30 min",
            body: `${h.unit}: flame ON for ${c.flameOnMinutes} min with no PIR motion and no weight change. Loud alarm until acknowledged.`,
          });
        }
        if (ceil && isFoodBurning(ceil.smokePpm > 500, c.flameOn || ceil.flameIR)) {
          raiseAlarm(`burning-${h.unit}`, {
            type: "burning",
            houseUnit: h.unit,
            title: "Food burning! Check cooker!",
            body: `${h.unit}: smoke rising (${ceil.smokePpm} ppm) with flame ON. Check the cooker now.`,
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houses]);

  function drill(kind) {
    setHouses((prev) =>
      prev.map((h) => {
        if (kind === "cooker" && h.unit === "A14") {
          return {
            ...h,
            ceiling: { ...h.ceiling, pirMotion: false, lastMotionMinAgo: 45 },
            cylinders: h.cylinders.map((c) =>
              c.id === "A14-C1"
                ? { ...c, flameOn: true, flameOnMinutes: 35, weightChangedRecently: false }
                : c
            ),
          };
        }
        if (kind === "burning" && h.unit === "B02") {
          return {
            ...h,
            ceiling: { ...h.ceiling, smokePpm: 650, flameIR: true, pirMotion: true, lastMotionMinAgo: 0 },
            cylinders: h.cylinders.map((c) =>
              c.id === "B02-C2" ? { ...c, flameOn: true, flameOnMinutes: 6 } : c
            ),
          };
        }
        if (kind === "leak" && h.unit === "D04") {
          return {
            ...h,
            cylinders: h.cylinders.map((c) =>
              c.id === "D04-C1" ? { ...c, gasPpm: 1800, status: "LEAK", flameOn: false } : c
            ),
          };
        }
        return h;
      })
    );
    setTab("houses");
  }

  function requestRefill(houseUnit, cylId) {
    setHouses((prev) =>
      prev.map((h) =>
        h.unit !== houseUnit
          ? h
          : {
              ...h,
              cylinders: h.cylinders.map((c) =>
                c.id !== cylId ? c : { ...c, refill: { state: "requested" } }
              ),
            }
      )
    );
  }

  const RIDER_ORDER = ["requested", "rider_en_route", "picked_up", "at_filling_plant", "returning", "delivered"];

  function advanceRider(houseUnit, cylId) {
    setHouses((prev) =>
      prev.map((h) =>
        h.unit !== houseUnit
          ? h
          : {
              ...h,
              cylinders: h.cylinders.map((c) => {
                if (c.id !== cylId) return c;
                const i = RIDER_ORDER.indexOf(c.refill && c.refill.state);
                const next = RIDER_ORDER[Math.min(i + 1, RIDER_ORDER.length - 1)];
                return { ...c, refill: { state: next } };
              }),
            }
      )
    );
  }

  function gateScan(serial, ok) {
    setGateLog((prev) => [{ at: now(), serial, ok }, ...prev].slice(0, 20));
  }

  const notices = alarms.filter((a) => a.acknowledged || a.escalated).slice(-5).reverse();

  return (
    <div className="app">
      <Header
        tab={tab}
        setTab={setTab}
        role={role}
        setRole={setRole}
        houseCount={visible.length}
        activeFilter={effectiveFilter}
        onClearFilter={() => setFilter("ALL")}
      />

      <main className="main">
        <p className={backend === "connected" ? "okline" : "muted"}>
          {backend === "connected"
            ? "Backend connected — NPA feed live."
            : backend === "offline"
            ? "Backend unreachable — showing on-device twin (gateway store-and-forward when offline)."
            : "Checking backend…"}
        </p>
        <p className="muted gateway-line">
          Gateway {GATEWAY.deviceId} ({GATEWAY.corner}): {GATEWAY.uplink}. SIM {GATEWAY.simPrimary} primary,
          {GATEWAY.simFallback} fallback.
        </p>

        {role === "commercial" ? (
          <p className="warn">Commercial estate view — cylinder moves need trolley + 2 officers per GNFS SOP.</p>
        ) : null}

        {tab === "houses" ? (
          <React.Fragment>
            {role === "manager" ? (
              <Filters filter={effectiveFilter} setFilter={setFilter} query={query} setQuery={setQuery} />
            ) : null}
            <HouseTable
              houses={visible}
              expandedId={expandedId}
              onToggleExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              onRequestRefill={requestRefill}
              onAdvanceRider={advanceRider}
            />
            {role === "guard" ? <GuardPanel houses={houses} gateLog={gateLog} onGateScan={gateScan} /> : null}
            {role === "manager" ? <SafetyDrills onDrill={drill} /> : null}
            {notices.length > 0 ? (
              <div className="panel">
                <h4>Recent alarm activity</h4>
                <ul className="risklist">
                  {notices.map((a) => (
                    <li key={a.id}>
                      <strong>{a.title}</strong> <span className="muted">{a.houseUnit} · {a.raisedAt}</span>{" "}
                      {a.escalated ? <span className="urgent">escalated to Family Circle + Estate Manager</span> : <span className="muted">acknowledged</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </React.Fragment>
        ) : (
          <Analytics houses={visible} />
        )}
      </main>

      <AlarmOverlay alarms={alarms} onAcknowledge={acknowledge} onEscalateNow={escalate} />
    </div>
  );
}
