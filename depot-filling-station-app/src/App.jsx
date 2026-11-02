
import React, { useState, useMemo, useEffect } from "react";

// GasSafe Depot / Filling Station - PWA
// PWA Setup: vite-plugin-pwa + manifest.json { name: "GasSafe Depot", display: "standalone", background_color: "#080B12" }

const REGIONS = ["Ahafo","Ashanti","Bono","Bono East","Central","Eastern","Greater Accra","North East","Northern","Oti","Savannah","Upper East","Upper West","Volta","Western","Western North"];
const DISTRICTS_MAP = {
  "Greater Accra": ["Ga Central - GE-321", "Ga East - GA-123", "Ablekuma", "Tema Metro"],
  "Ashanti": ["Kumasi Metro", "Obuasi", "Ejisu"],
  "Northern": ["Tamale Metro", "Savelugu"],
  "Western": ["Sekondi-Takoradi", "Tarkwa"],
  "Default": ["District-A", "District-B", "District-C"]
};

const MOCK_CYLINDERS = [
  { id:1, serial:"GH-H-NEW-45210", scale:"HOME", status:"FULL", gross:"26.5kg", tare:"12kg", capacity:"14.5kg", location:"Depot-A", pcb:"PCB-GS-V2", q:"Filling-Q-1", ge:"GE-321-1234", npa:"NPA-CRM-GH-001", region:"Greater Accra", district:"Ga Central - GE-321", fraud:false, lat:5.6037, lng:-0.1870 },
  { id:2, serial:"GH-H-OLD-88321", scale:"HOME", status:"EMPTY", gross:"12.8kg", tare:"12kg", capacity:"6kg", location:"Depot-A", pcb:"PCB-GS-V2", q:"Filling-Q-1", ge:"GA-123-4567", npa:"NPA-CRM-GH-002", region:"Greater Accra", district:"Ga East - GA-123", fraud:false, lat:5.6142, lng:-0.2056 },
  { id:3, serial:"GH-C-001-9921", scale:"COMM", status:"FULL", gross:"32.5kg", tare:"13kg", capacity:"19.5kg", location:"Depot-B", pcb:"PCB-GS-V2", q:"Filling-Q-2", ge:"GC-12345", npa:"NPA-CRM-GH-003", region:"Ashanti", district:"Kumasi Metro", fraud:false, lat:6.6885, lng:-1.6244 },
  { id:4, serial:"GH-C-002-7710", scale:"COMM", status:"QUEUED", gross:"87.0kg", tare:"35kg", capacity:"52kg", location:"Filling-Q", pcb:"PCB-GS-V2", q:"QUEUED", ge:"GE-321-1234", npa:"NPA-CRM-GH-004", region:"Western", district:"Sekondi-Takoradi", fraud:false, lat:4.9343, lng:-1.7137 },
  { id:5, serial:"GH-H-331-1290", scale:"HOME", status:"FULL", gross:"27.0kg", tare:"12kg", capacity:"15kg", location:"Depot-A", pcb:"PCB-GS-V2", q:"READY", ge:"GE-321-1234", npa:"NPA-CRM-GH-005", region:"Greater Accra", district:"Ga Central - GE-321", fraud:false, lat:5.6037, lng:-0.1870 },
  { id:6, serial:"GH-C-003-4401", scale:"COMM", status:"LEAK", gross:"45.2kg", tare:"13kg", capacity:"35kg", location:"Depot-B", pcb:"PCB-GS-V2", q:"ISOLATED", ge:"GA-123-4567", npa:"NPA-CRM-GH-006", region:"Northern", district:"Tamale Metro", fraud:true, lat:9.4075, lng:-0.8534 },
  { id:7, serial:"GH-H-009-1182", scale:"HOME", status:"BURST", gross:"13.1kg", tare:"12kg", capacity:"6kg", location:"Depot-A", pcb:"PCB-GS-V2", q:"ISOLATED", ge:"GC-12345", npa:"NPA-CRM-GH-007", region:"Central", district:"District-A", fraud:true, lat:5.1053, lng:-1.2466 },
  { id:8, serial:"GH-C-004-5520", scale:"COMM", status:"EMPTY", gross:"26.0kg", tare:"13kg", capacity:"45kg", location:"Depot-B", pcb:"PCB-GS-V2", q:"Filling-Q-2", ge:"GE-321-1234", npa:"NPA-CRM-GH-008", region:"Greater Accra", district:"Tema Metro", fraud:false, lat:5.6696, lng:0.0166 },
];

const RIDERS = [
  { name:"Kwame Asare", id:"RIDER-006", trips:142, status:"ACTIVE TODAY", phone:"+233 24 000 0006" },
  { name:"Abena Mensah", id:"RIDER-007", trips:98, status:"ACTIVE TODAY", phone:"+233 24 000 0007" },
  { name:"Kojo Owusu", id:"RIDER-008", trips:76, status:"ACTIVE TODAY", phone:"+233 24 000 0008" },
];

export default function App() {
  // Header / KPI State
  const [inventoryTab, setInventoryTab] = useState("ALL"); // FULL vs EMPTY
  const [typeFilter, setTypeFilter] = useState(""); // HOME/COMM
  const [fraudFilter, setFraudFilter] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [nationalView] = useState(true);

  // Table data
  const [cylinders, setCylinders] = useState(MOCK_CYLINDERS);
  
  // Form
  const [form, setForm] = useState({
    ORDER_ID:"ORD-789",
    RIDER_ID:"RIDER-006",
    OLD_SERIAL:"GH-H-OLD-88321",
    NEW_SERIAL:"GH-H-NEW-45210",
    GE_CODE:"GE-321-1234",
    LAT:"5.6037",
    LNG:"-0.1870"
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Analytics collapsible
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Gate Pass QR
  const [gatePass, setGatePass] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{
    const i=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(i);
  },[]);

  const filtered = useMemo(()=>{
    return cylinders.filter(c=>{
      if(inventoryTab==="FULL" && c.status!=="FULL") return false;
      if(inventoryTab==="EMPTY" && c.status!=="EMPTY") return false;
      if(typeFilter && c.scale!==typeFilter) return false;
      if(fraudFilter && !c.fraud) return false;
      if(region && c.region!==region) return false;
      if(district && c.district!==district) return false;
      if(search){
        const s=search.toLowerCase();
        const hay=[c.serial,c.ge,c.npa,c.location,c.pcb].join(" ").toLowerCase();
        if(!hay.includes(s)) return false;
      }
      return true;
    });
  },[cylinders, inventoryTab, typeFilter, fraudFilter, region, district, search]);

  const handleExchange = async (e)=>{
    e.preventDefault();
    setSubmitting(true);
    // API POST /api/exchange/log
    const payload = {
      ORDER_ID: form.ORDER_ID,
      RIDER_ID: form.RIDER_ID,
      OLD_SERIAL: form.OLD_SERIAL,
      NEW_SERIAL: form.NEW_SERIAL,
      GE_CODE: form.GE_CODE,
      LAT: parseFloat(form.LAT),
      LNG: parseFloat(form.LNG),
      timestamp: new Date().toISOString()
    };
    try{
      await fetch("/api/exchange/log",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      }).catch(()=>{}); // mock - will fail in demo but we proceed
      console.log("POST /api/exchange/log", payload);
      
      // simulate adding to inventory as FULL
      setCylinders(prev=>[
        { serial: payload.NEW_SERIAL, scale:"HOME", status:"FULL", gross:"26.5kg", tare:"12kg", capacity:"14.5kg", location:"Depot-A", pcb:"PCB-GS-V2", q:"Filling-Q-1", ge:payload.GE_CODE, npa:"NPA-CRM-GH-001", region: region || "Greater Accra", district: district || "Ga Central - GE-321", fraud:false, lat:payload.LAT, lng:payload.LNG, id: Date.now() },
        ...prev
      ]);

      // Generate Gate Pass QR valid 2 hours
      const expiresAt = Date.now() + 2*60*60*1000;
      setGatePass({
        orderId: payload.ORDER_ID,
        riderId: payload.RIDER_ID,
        newSerial: payload.NEW_SERIAL,
        ge: payload.GE_CODE,
        expiresAt,
        qrData: `GAS-GATE:${payload.ORDER_ID}:${payload.NEW_SERIAL}:${expiresAt}`
      });
      setToast({ type:"success", msg:`Exchange logged: ${payload.OLD_SERIAL} → ${payload.NEW_SERIAL}`});
      setTimeout(()=>setToast(null),3500);
    } finally{
      setSubmitting(false);
    }
  };

  const districts = region ? (DISTRICTS_MAP[region] || DISTRICTS_MAP.Default) : [];

  return (
    <div className="min-h-screen bg-[#080B12] text-slate-100 selection:bg-amber-500/30 font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap'); *{font-family: Inter, system-ui, sans-serif} .mono{font-family: "JetBrains Mono", monospace}`}</style>

      {/* HEADER - Kept Visible */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F1A]/90 border-b border-slate-800">
        {/* Top Bar */}
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black">GS</div>
            <div>
              <h1 className="font-extrabold leading-none tracking-tight">GasSafe Depot <span className="text-slate-500 font-semibold">/ Filling Station</span></h1>
              <p className="text-[11px] tracking-widest text-slate-400 font-semibold">PCB-GS-V2 • Same PCB • Different Load Cell • GNFS SOP</p>
            </div>
            <span className="hidden md:inline-flex ml-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">● PWA READY</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 font-bold">NATIONAL</span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-black font-extrabold">DEPOT-A</span>
            <button className="hidden sm:block px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">⛶ Install</button>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="max-w-[1440px] mx-auto px-4 py-3 bg-[#0F1420] border-y border-slate-800 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold tracking-widest text-slate-400">INVENTORY</span>
            <div className="flex bg-black rounded-full p-1 border border-slate-800">
              {["ALL","FULL","EMPTY"].map(t=>(
                <button key={t} onClick={()=>setInventoryTab(t)} className={`px-4 py-1 rounded-full text-xs font-extrabold transition ${inventoryTab===t ? "bg-white text-black" : "text-slate-400 hover:text-white"}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          <div className="flex flex-wrap items-center gap-2 mono text-xs font-bold">
            <span className="px-3 py-1.5 rounded-full bg-white text-black">EMPTY <b className="ml-1">50</b></span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-black">READY <b className="ml-1">120</b></span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500 text-black">In-Filling <b className="ml-1">20</b></span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200">QUEUED <b className="ml-1">18</b></span>
            <span className="hidden lg:inline text-slate-500 font-sans font-medium ml-2">7 / 620 Active • Demo view {filtered.length} rows</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* HOME COMM FRAUD kept visible - NO FIRE/SMOKE/HEAT */}
            <button onClick={()=>setTypeFilter(v=>v==="HOME" ? "" : "HOME")} className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition ${typeFilter==="HOME" ? "bg-sky-500 text-black border-sky-400" : "bg-slate-900 border-slate-700 text-slate-300"}`}>HOME</button>
            <button onClick={()=>setTypeFilter(v=>v==="COMM" ? "" : "COMM")} className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition ${typeFilter==="COMM" ? "bg-violet-500 text-white border-violet-400" : "bg-slate-900 border-slate-700 text-slate-300"}`}>COMM</button>
            <button onClick={()=>setFraudFilter(v=>!v)} className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition ${fraudFilter ? "bg-amber-500 text-black border-amber-400" : "bg-slate-900 border-amber-500/30 text-amber-400"}`}>⚑ FRAUD</button>
          </div>
        </div>
      </header>

      {/* SPECS BANNER */}
      <div className="max-w-[1440px] mx-auto px-4 mt-4">
        <div className="rounded-2xl bg-gradient-to-r from-[#121826] to-[#0E1424] border border-slate-800 p-4 flex flex-wrap gap-6 items-start">
          <div className="flex-1 min-w-[280px]">
            <div className="text-[11px] tracking-widest font-extrabold text-amber-400">HARDWARE SPEC • PCB-GS-V2</div>
            <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">4 FULL</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">2 EMPTY</span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400">4 HOME</span>
              <span className="px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400">4 COMM</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400">Same PCB, Different Load Cell</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-black/40 border border-slate-800 p-3">
                <div className="font-extrabold text-sky-400">HOME • 50kg Cell</div>
                <div className="mono mt-1 text-slate-300">6kg → <b className="text-white">12.5kg gross</b></div>
                <div className="mono text-slate-300">14.5kg → <b className="text-white">26.5kg</b> • 15kg</div>
              </div>
              <div className="rounded-xl bg-black/40 border border-slate-800 p-3">
                <div className="font-extrabold text-violet-400">COMM • 150kg Cell</div>
                <div className="mono mt-1 text-slate-300">19.5kg → <b className="text-white">32.5kg</b> • 35kg • 45kg • 50kg</div>
                <div className="mono text-slate-300">52kg → <b className="text-white">87kg</b></div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[360px] rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
            <div className="text-xs font-extrabold text-amber-400">⚠ GNFS SOP • SAFETY</div>
            <p className="text-xs leading-5 text-slate-300 mt-1"><b className="text-white">19.5kg moved HOME → COMM</b> • Commercial only.<br/>Trolley + 2 officers required per handling. LEAK/BURST isolated, red badge only in table.</p>
            <div className="mt-2 flex gap-2">
              <span className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 font-bold">LEAK/BURST = RED BADGE</span>
              <span className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800">No header filters</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <main className="max-w-[1440px] mx-auto px-4 py-4 grid grid-cols-12 gap-4">
        {/* LEFT - Inventory */}
        <section className="col-span-12 lg:col-span-8">
          {/* Filters */}
          <div className="rounded-2xl bg-[#0F1420] border border-slate-800 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-extrabold tracking-widest text-slate-400">
                <span className={nationalView ? "text-white" : ""}>NATIONAL</span> <span>›</span>
                <span className={region ? "text-amber-400" : ""}>REGION</span> <span>›</span>
                <span className={district ? "text-amber-400" : ""}>DISTRICT</span>
                <span className="ml-2 px-2 py-1 rounded bg-black border border-slate-800 mono text-[11px]">16 REGIONS</span>
              </div>
              <button onClick={()=>alert("Maps: Opening depot geospatial view")} className="ml-auto px-3 py-1.5 rounded-full bg-white text-black text-xs font-extrabold">🗺 Maps</button>
            </div>

            <div className="mt-3 grid grid-cols-12 gap-2">
              <div className="col-span-12 md:col-span-5 relative">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search GE-321-1234, GA-123-4567, NPA-CRM-GH-001, GC-12345, GH-H-*" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black border border-slate-800 text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50" />
                <span className="absolute left-3 top-3 text-slate-500">⌕</span>
                {search && <button onClick={()=>setSearch("")} className="absolute right-2 top-2 px-2 py-1 rounded-lg bg-slate-800 text-xs">✕</button>}
              </div>
              <select value={region} onChange={e=>{setRegion(e.target.value); setDistrict("")}} className="col-span-6 md:col-span-3 px-3 py-2.5 rounded-xl bg-black border border-slate-800 text-sm">
                <option value="">All Regions (16)</option>
                {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
              <select value={district} onChange={e=>setDistrict(e.target.value)} className="col-span-6 md:col-span-4 px-3 py-2.5 rounded-xl bg-black border border-slate-800 text-sm">
                <option value="">All Districts</option>
                {districts.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">Examples: <span className="mono text-slate-300">GE-321-1234</span> • <span className="mono text-slate-300">GA-123-4567</span> • <span className="mono text-slate-300">NPA-CRM-GH-001</span> • <span className="mono text-slate-300">GC-12345</span></div>
          </div>

          {/* Inventory Table */}
          <div className="mt-4 rounded-2xl bg-[#0F1420] border border-slate-800 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <h2 className="font-extrabold tracking-tight">Depot Inventory <span className="text-slate-500 font-semibold">• {filtered.length} rows</span></h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-black border border-slate-800 mono">PCB-GS-V2</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/40 text-[11px] tracking-widest font-extrabold text-slate-400">
                  <tr>
                    <th className="text-left px-4 py-3">Serial</th>
                    <th className="text-left px-3 py-3">Scale</th>
                    <th className="text-left px-3 py-3">Status</th>
                    <th className="text-left px-3 py-3">Gross</th>
                    <th className="text-left px-3 py-3">Location</th>
                    <th className="text-left px-3 py-3">PCB</th>
                    <th className="text-left px-3 py-3">Filling-Q</th>
                    <th className="text-right px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map(row=>(
                    <tr key={row.id} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3 mono font-bold text-white">{row.serial} {row.fraud && <span className="ml-1 text-amber-400">⚑</span>}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${row.scale==="HOME" ? "bg-sky-500/15 text-sky-400 border-sky-500/20" : "bg-violet-500/15 text-violet-300 border-violet-500/20"}`}>{row.scale}</span>
                      </td>
                      <td className="px-3 py-3">
                        {row.status==="FULL" && <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-xs font-extrabold">FULL</span>}
                        {row.status==="EMPTY" && <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-extrabold">EMPTY</span>}
                        {row.status==="QUEUED" && <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-xs font-extrabold">QUEUED</span>}
                        {row.status==="LEAK" && <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold animate-pulse">LEAK</span>}
                        {row.status==="BURST" && <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-extrabold">BURST</span>}
                      </td>
                      <td className="px-3 py-3 mono font-bold">{row.gross} <span className="text-slate-500 font-normal">({row.capacity})</span></td>
                      <td className="px-3 py-3 text-slate-300">{row.location}</td>
                      <td className="px-3 py-3 mono text-xs text-slate-400">{row.pcb}</td>
                      <td className="px-3 py-3 text-slate-400">{row.q}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={()=>window.open(`https://www.google.com/maps?q=${row.lat},${row.lng}`,"_blank")} className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-extrabold hover:bg-slate-100">Maps ↗</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-black/30 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
              <span>Example row: <b className="text-slate-300 mono">GH-H-NEW-45210 • HOME • FULL • 26.5kg • Depot-A • PCB-GS-V2 • Filling-Q</b></span>
              <span className="hidden md:inline">Gate Pass QR valid 2h after exchange</span>
            </div>
          </div>
        </section>

        {/* RIGHT - Riders + Form + Analytics */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          {/* Rider List */}
          <div className="rounded-2xl bg-[#0F1420] border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold">Rider List</h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-xs font-extrabold">ACTIVE TODAY</span>
            </div>
            <div className="mt-3 space-y-2">
              {RIDERS.map(r=>(
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-black border border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm">{r.name.split(" ").map(s=>s[0]).join("")}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold leading-none">{r.name} <span className="mono text-xs text-slate-400">{r.id}</span></div>
                    <div className="text-xs text-slate-500">{r.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="mono text-sm font-extrabold text-white">{r.trips}</div>
                    <div className="text-[11px] tracking-widest font-bold text-slate-500">TRIPS</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-500">RIDER-006 is default for Log Exchange (Kwame Asare - 142 trips)</div>
          </div>

          {/* Log Exchange Depot Form */}
          <div className="rounded-2xl bg-[#0F1420] border border-slate-800 p-4">
            <h3 className="font-extrabold">Log Exchange — Depot Form</h3>
            <p className="text-xs text-slate-500 mt-1">API: <span className="mono text-amber-400">POST /api/exchange/log</span> • Creates Filling-Q entry + Gate Pass (2h)</p>

            <form onSubmit={handleExchange} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-bold text-slate-400">ORDER_ID
                  <input value={form.ORDER_ID} onChange={e=>setForm({...form, ORDER_ID:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-slate-800 mono text-sm" placeholder="ORD-789" />
                </label>
                <label className="text-xs font-bold text-slate-400">RIDER_ID
                  <input value={form.RIDER_ID} onChange={e=>setForm({...form, RIDER_ID:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-slate-800 mono text-sm" placeholder="RIDER-006" />
                </label>
              </div>
              <label className="text-xs font-bold text-slate-400">OLD Serial (returned EMPTY)
                <input value={form.OLD_SERIAL} onChange={e=>setForm({...form, OLD_SERIAL:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-slate-800 mono text-sm" placeholder="GH-H-OLD-88321" />
              </label>
              <label className="text-xs font-bold text-slate-400">NEW Serial (issued FULL)
                <input value={form.NEW_SERIAL} onChange={e=>setForm({...form, NEW_SERIAL:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-amber-500/30 mono text-sm text-amber-300" placeholder="GH-H-NEW-45210" />
              </label>
              <label className="text-xs font-bold text-slate-400">Digital Address (GE)
                <input value={form.GE_CODE} onChange={e=>setForm({...form, GE_CODE:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-slate-800 mono text-sm" placeholder="GE-321-1234" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-bold text-slate-400">LAT
                  <input value={form.LAT} onChange={e=>setForm({...form, LAT:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-slate-800 mono text-sm" placeholder="5.6037" />
                </label>
                <label className="text-xs font-bold text-slate-400">LNG
                  <input value={form.LNG} onChange={e=>setForm({...form, LNG:e.target.value})} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-black border border-slate-800 mono text-sm" placeholder="-0.1870" />
                </label>
              </div>

              <button disabled={submitting} className="w-full py-3 rounded-xl bg-amber-500 text-black font-extrabold hover:bg-amber-400 disabled:opacity-50">
                {submitting ? "Logging..." : "Log Exchange → Generate Gate Pass"}
              </button>
              <div className="text-[11px] text-slate-500 text-center">Will POST: ORDER_ID, RIDER_ID, OLD, NEW, GE, LAT, LNG</div>
            </form>
          </div>

          {/* Collapsible Analytics */}
          <div className="rounded-2xl bg-[#0F1420] border border-slate-800 overflow-hidden">
            <button onClick={()=>setShowAnalytics(v=>!v)} className="w-full px-4 py-3 flex items-center justify-between">
              <h3 className="font-extrabold">Analytics</h3>
              <span className="px-2.5 py-1 rounded-full bg-black border border-slate-800 text-xs font-bold">{showAnalytics ? "Hide ▲" : "Show ▼"}</span>
            </button>
            {showAnalytics && (
              <div className="px-4 pb-4">
                <div className="rounded-xl bg-black border border-slate-800 p-4">
                  <div className="text-xs tracking-widest font-extrabold text-slate-500">TOTAL CYLINDERS</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black">7</span>
                    <span className="text-slate-500 font-bold">/ 620</span>
                    <span className="ml-2 px-2.5 py-1 rounded-full bg-emerald-500 text-black text-xs font-extrabold">Active</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{width:`${(7/620)*100}%`}} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs mono text-slate-500">
                    <span>Demo 7 shown</span><span>620 National Fleet</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-900 border border-slate-800 py-2"><div className="font-black">4</div><div className="text-[11px] text-slate-500 font-bold">HOME</div></div>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 py-2"><div className="font-black">4</div><div className="text-[11px] text-slate-500 font-bold">COMM</div></div>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 py-2"><div className="font-black">18</div><div className="text-[11px] text-slate-500 font-bold">QUEUED</div></div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">Collapsible by design for pitching — keeps inventory focus.</div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl bg-white text-black font-bold shadow-xl border border-black/10">
          ✓ {toast.msg}
        </div>
      )}

      {/* Gate Pass QR Modal - 2 hours */}
      {gatePass && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white text-black overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black">
              <div className="text-xs font-extrabold tracking-widest">GATE PASS • VALID 2 HOURS</div>
              <div className="font-black text-lg leading-none mt-1">{gatePass.orderId} → {gatePass.newSerial}</div>
              <div className="mono text-xs mt-1">Rider {gatePass.riderId} • {gatePass.ge}</div>
            </div>
            <div className="p-5 text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(gatePass.qrData)}`}
                alt="QR"
                className="mx-auto w-56 h-56 border border-slate-200 rounded-xl"
              />
              <div className="mt-3 mono text-xs font-bold">
                Expires: {new Date(gatePass.expiresAt).toLocaleString()} 
                <span className="ml-2 px-2 py-1 rounded-full bg-black text-white">{Math.max(0, Math.floor((gatePass.expiresAt - now)/1000/60))}m {Math.max(0, Math.floor((gatePass.expiresAt - now)/1000)%60)}s left</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Present at Depot-A gate • Trolley + 2 officers</div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={()=>window.print()} className="py-2.5 rounded-xl bg-black text-white font-extrabold">Print Pass</button>
                <button onClick={()=>setGatePass(null)} className="py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-extrabold">Close</button>
              </div>
              <button onClick={()=>window.open(`https://www.google.com/maps?q=${form.LAT},${form.LNG}`,"_blank")} className="mt-2 w-full py-2 rounded-xl bg-amber-500 font-extrabold">Open Maps ↗</button>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-[1440px] mx-auto px-4 pb-8 pt-2 text-xs text-slate-500">
        GasSafe Depot PWA • Offline-ready • Standalone • LEAK/BURST never clutters header • HOME 50kg vs COMM 150kg calibrated.
      </footer>
    </div>
  );
}
