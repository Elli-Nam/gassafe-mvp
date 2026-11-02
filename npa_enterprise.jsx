import React, { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("exchange");
  const [region, setRegion] = useState("ALL");
  const [district, setDistrict] = useState("ALL");
  const [search, setSearch] = useState("");

  const regions = ["ALL","Greater Accra","Ashanti","Western","Central","Eastern","Northern","Upper East","Upper West","Volta","Bono","Bono East","Ahafo","Savannah","North East","Oti","Western North"];
  const districts = ["ALL","Ga East","Tema Metro","Ga West","Accra Metro","Adenta","Ledzokuku","Ashaiman","La Nkwantanang","Kpone Katamanso","Ga South","Korle Klottey","Ga Central","Ga North","Ayawaso West"];

  const exchangeLogs = [
    {
      time: "05:40 PM 10/31/2024",
      house: "HOUSE-GE-321-1234",
      address: "GE-321-1234",
      badge: "HOME",
      scaleGross: "26.5kg gross",
      scaleTare: "14.5 tare",
      scaleGas: "+12 gas",
      status: "PASS",
      oldSerial: "GH-H-OLD-88321",
      newSerial: "GH-H-NEW-45218",
      crm: "Sale PCB-GS-V2",
      rider: "RIDER-006",
      verified: "GhanaPost GPS + Google Maps",
      depot: "Depot Filling Plant",
      maps: "5.6037 -0.1870"
    },
    {
      time: "04:34 PM 10/31/2024",
      house: "HOUSE-GE-321-3345",
      address: "GE-321-3345",
      badge: "COMM",
      scaleGross: "87kg gross",
      scaleTare: "52 tare",
      scaleGas: "+35 gas",
      status: "PASS",
      oldSerial: "GH-C-OLD-77201",
      newSerial: "GH-C-NEW-99382",
      crm: "Sale PCB-GS-V2",
      rider: "RIDER-012",
      verified: "GhanaPost GPS + Google Maps",
      depot: "Depot Filling Plant",
      maps: "5.6781 -0.2054"
    },
    {
      time: "03:38 PM 10/31/2024",
      house: "HOUSE-GE-321-3345",
      address: "GE-321-3345",
      badge: "COMM",
      scaleGross: "32.5kg gross",
      scaleTare: "19.5 tare",
      scaleGas: "+13 gas",
      status: "PASS",
      oldSerial: "GH-C-OLD-77299",
      newSerial: "GH-C-NEW-99401",
      crm: "Sale PCB-GS-V2",
      rider: "RIDER-012",
      verified: "GhanaPost GPS + Google Maps",
      depot: "Depot Filling Plant",
      maps: "5.6781 -0.2054"
    }
  ];

  const fraudLogs = [
    { time: "05:42 PM 10/31/2024", serial: "GH-H-NEW-45218", issue: "weight anomaly diff >0.5kg", detail: "Expected 26.5kg gross, read 25.8kg on re-check", severity: "FAIL", action: "Quarantine & Re-weigh" },
    { time: "04:36 PM 10/31/2024", serial: "GH-C-NEW-99382", issue: "duplicate serial", detail: "Serial already exists in CRM 02/15/2024 Tema Depot", severity: "HIGH", action: "Block & Investigate" },
    { time: "04:10 PM 10/31/2024", serial: "GH-C-NEW-88101", issue: "outside district", detail: "GE-321-3345 scanned outside Tema Metro zone", severity: "MEDIUM", action: "Flag Rider RIDER-012" },
    { time: "03:45 PM 10/31/2024", serial: "GH-C-OLD-77299", issue: "LEAK BURST isolated per GNFS SOP", detail: "Valve leak detected at exchange, cylinder isolated GNFS protocol", severity: "CRITICAL", action: "Isolate & GNFS Notify" },
    { time: "03:40 PM 10/31/2024", serial: "GH-C-NEW-99401", issue: "trolley non-compliance for 52kg 87kg gross", detail: "Rider without trolley for COMM 87kg gross load", severity: "HIGH", action: "Re-train & Penalty" }
  ];

  const filteredLogs = exchangeLogs.filter(log => {
    if (search === "") return true;
    const q = search.toLowerCase();
    return log.house.toLowerCase().includes(q) || log.address.toLowerCase().includes(q) || log.oldSerial.toLowerCase().includes(q) || log.newSerial.toLowerCase().includes(q) || log.rider.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 font-sans">
      <header className="bg-[#111827] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-white text-sm">GS</div>
              <h1 className="text-white font-bold text-[14px] lg:text-[15px] tracking-tight">GasSafe NPA Enterprise - PCB-GS-V2 Same PCB Different Load Cell - <span className="text-emerald-400">PWA READY</span></h1>
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold tracking-widest">Tema Filling Plant GE-321-1234</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1 tracking-wide">National Petroleum Authority • Ghana Digital Address Integrated • CRM npaplus/dashboard</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-[#0b0f1a] border border-slate-800 rounded-lg px-3 py-2">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 tracking-widest font-bold">FULL</div>
                <div className="text-emerald-400 font-bold text-sm">50</div>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 tracking-widest font-bold">EMPTY</div>
                <div className="text-amber-400 font-bold text-sm">50</div>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 tracking-widest font-bold">HOME</div>
                <div className="text-cyan-400 font-bold text-sm">2</div>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 tracking-widest font-bold">COMM</div>
                <div className="text-violet-400 font-bold text-sm">1</div>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 tracking-widest font-bold">READY</div>
                <div className="text-white font-bold text-sm">120</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-slate-400">Online</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold">PCB-GS-V2</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-[11px] tracking-widest text-slate-400 font-bold">TOTAL_EXCHANGES</div>
            <div className="text-[10px] text-slate-500">All regions</div>
            <div className="text-3xl font-bold text-white mt-1">1,284</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">↗ +12.4% vs last month</div>
          </div>
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-[11px] tracking-widest text-slate-400 font-bold">TOTAL_TODAY</div>
            <div className="text-[10px] text-slate-500">Today</div>
            <div className="text-3xl font-bold text-white mt-1">3</div>
            <div className="text-[11px] text-emerald-400">● Live from Tema Depot</div>
          </div>
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-[11px] tracking-widest text-slate-400 font-bold">HOME</div>
            <div className="text-[10px] text-slate-500">HOME cell 50kg</div>
            <div className="text-3xl font-bold text-cyan-400 mt-1">2</div>
            <div className="text-[11px] text-slate-400">6kg & 14.5kg tare configs</div>
          </div>
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-[11px] tracking-widest text-slate-400 font-bold">COMM</div>
            <div className="text-[10px] text-slate-500">COMM cell 150kg</div>
            <div className="text-3xl font-bold text-violet-400 mt-1">1</div>
            <div className="text-[11px] text-slate-400">19.5kg & 52kg tare • trolley req</div>
          </div>
        </div>

        <div className="mt-4 bg-[#111827] border border-slate-800 rounded-xl p-3 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 tracking-widest">Region</span>
              <select value={region} onChange={e=>setRegion(e.target.value)} className="bg-[#0b0f1a] border border-slate-700 text-white text-xs rounded-lg px-3 py-2 min-w-[160px] focus:outline-none focus:border-emerald-500">
                {regions.map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 tracking-widest">District</span>
              <select value={district} onChange={e=>setDistrict(e.target.value)} className="bg-[#0b0f1a] border border-slate-700 text-white text-xs rounded-lg px-3 py-2 min-w-[160px] focus:outline-none focus:border-emerald-500">
                {districts.map(d=> <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 lg:w-[320px]">
              <span className="text-[11px] font-bold text-slate-400 tracking-widest">Search</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="GE / serial / ORD" className="flex-1 bg-[#0b0f1a] border border-slate-700 text-white text-xs rounded-lg px-3 py-2 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredLogs.length} logs</span> last 90 from <span className="text-emerald-400">npaplus/dashboard</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button onClick={()=>setActiveTab("exchange")} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border tracking-wide ${activeTab==="exchange" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-[#111827] border-slate-800 text-slate-400 hover:text-white"}`}>Exchange Log</button>
          <button onClick={()=>setActiveTab("fraud")} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border tracking-wide flex items-center gap-2 ${activeTab==="fraud" ? "bg-red-600 border-red-600 text-white" : "bg-[#111827] border-slate-800 text-slate-400 hover:text-white"}`}>Fraud & Safety <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">5</span></button>
          <button onClick={()=>setActiveTab("depots")} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border tracking-wide ${activeTab==="depots" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-[#111827] border-slate-800 text-slate-400 hover:text-white"}`}>Depots & Plants</button>
          <button onClick={()=>setActiveTab("analytics")} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border tracking-wide ${activeTab==="analytics" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-[#111827] border-slate-800 text-slate-400 hover:text-white"}`}>Analytics National</button>
        </div>

        {activeTab==="exchange" && (
          <div className="mt-3 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-[#0b0f1a] border-b border-slate-800 text-[10px] tracking-widest font-bold text-slate-400">
                    <th className="px-4 py-3">TIME</th>
                    <th className="px-4 py-3">HOUSE + Ghana Digital Address</th>
                    <th className="px-4 py-3">SCALE CHECK</th>
                    <th className="px-4 py-3">OLD -&gt; NEW SERIAL CRM</th>
                    <th className="px-4 py-3">RIDER</th>
                    <th className="px-4 py-3">VERIFIED</th>
                    <th className="px-4 py-3">MAPS</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredLogs.map((row, idx)=>(
                    <tr key={idx} className="border-b border-slate-800/60 hover:bg-[#0b0f1a] transition">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-white">{row.time.split(" ")[0]} {row.time.split(" ")[1]}</div>
                        <div className="text-slate-500 text-[11px]">{row.time.split(" ")[2]}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-white flex items-center gap-2">{row.house} <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${row.badge==="HOME" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-violet-500/20 text-violet-400 border border-violet-500/30"}`}>{row.badge}</span></div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">📍 {row.address} • {row.badge} badge</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-white font-medium">{row.scaleGross} <span className="text-slate-400">{row.scaleTare}</span> <span className="text-emerald-400">{row.scaleGas}</span></div>
                        <div className="mt-1 inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded">✓ {row.status}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-mono text-white text-[12px]">{row.oldSerial} -&gt; {row.newSerial}</div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">{row.crm}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded inline-block">{row.rider}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-emerald-400 text-[11px] font-bold">✓ {row.verified}</div>
                        <div className="text-slate-500 text-[11px]">{row.depot}</div>
                      </td>
                      <td className="px-4 py-4">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${row.maps}`} target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-2 rounded-lg inline-flex items-center gap-1">Maps {row.maps} ↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-[#0b0f1a] border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
              <span>Last sync with CRM • Tema Filling Plant GE-321-1234 • PCB-GS-V2 Same PCB Different Load Cell</span>
              <span className="text-slate-400">{filteredLogs.length} records</span>
            </div>
          </div>
        )}

        {activeTab==="fraud" && (
          <div className="mt-3 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-red-950/40 border-b border-red-900/50 px-4 py-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-red-400 text-xs font-bold tracking-widest">FRAUD & SAFETY ALERTS — Requires Immediate Review</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#0b0f1a] border-b border-slate-800 text-[10px] tracking-widest font-bold text-slate-400">
                    <th className="px-4 py-3">TIME</th>
                    <th className="px-4 py-3">SERIAL</th>
                    <th className="px-4 py-3">ISSUE</th>
                    <th className="px-4 py-3">DETAIL</th>
                    <th className="px-4 py-3">SEVERITY</th>
                    <th className="px-4 py-3">ACTION</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {fraudLogs.map((f,i)=>(
                    <tr key={i} className="border-b border-slate-800/60 hover:bg-[#0b0f1a] transition">
                      <td className="px-4 py-4 text-white font-medium whitespace-nowrap">{f.time}</td>
                      <td className="px-4 py-4 font-mono text-white">{f.serial}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded border ${
                          f.issue.includes("weight anomaly") ? "bg-red-600 text-white border-red-500" :
                          f.issue.includes("duplicate") ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          f.issue.includes("outside") ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                          f.issue.includes("LEAK") ? "bg-red-600 text-white border-red-600" :
                          "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }`}>{f.issue}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-400 max-w-[320px]">{f.detail}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          f.severity==="FAIL" ? "bg-red-600 text-white border-red-600" :
                          f.severity==="CRITICAL" ? "bg-red-600 text-white border-red-600" :
                          f.severity==="HIGH" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }`}>{f.severity}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-slate-800 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg">{f.action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab==="depots" && (
          <div className="mt-3 bg-[#111827] border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#0b0f1a] border-b border-slate-800 text-[10px] tracking-widest font-bold text-slate-400">
                    <th className="px-4 py-3">PLANT NAME</th>
                    <th className="px-4 py-3">LOCATION GE- code</th>
                    <th className="px-4 py-3">REGION</th>
                    <th className="px-4 py-3">DISTRICT</th>
                    <th className="px-4 py-3">FULL</th>
                    <th className="px-4 py-3">EMPTY</th>
                    <th className="px-4 py-3">READY</th>
                    <th className="px-4 py-3">LEAK</th>
                    <th className="px-4 py-3">LAST SYNC</th>
                    <th className="px-4 py-3">ACTION MAPS</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b border-slate-800/60 hover:bg-[#0b0f1a]">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white">Tema Filling Plant</div>
                      <div className="text-emerald-400 text-[11px]">● Active • PCB-GS-V2</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-white">GE-321-1234</td>
                    <td className="px-4 py-4 text-white">Greater Accra</td>
                    <td className="px-4 py-4 text-white">Tema Metro</td>
                    <td className="px-4 py-4"><span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full">50</span></td>
                    <td className="px-4 py-4"><span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-full">50</span></td>
                    <td className="px-4 py-4"><span className="bg-slate-800 text-white border border-slate-700 font-bold px-3 py-1 rounded-full">120</span></td>
                    <td className="px-4 py-4"><span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full">0</span></td>
                    <td className="px-4 py-4 text-white font-medium">05:40 PM</td>
                    <td className="px-4 py-4"><a href="https://www.google.com/maps/search/?api=1&query=5.6037,-0.1870" target="_blank" rel="noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-2 rounded-lg inline-flex items-center gap-1">Maps 5.6037 -0.1870 ↗</a></td>
                  </tr>
                  <tr className="border-b border-slate-800/60 hover:bg-[#0b0f1a]">
                    <td className="px-4 py-4">
                      <div className="font-bold text-white">Accra Central Depot</div>
                      <div className="text-slate-500 text-[11px]">● Standby</div>
                    </td>
                    <td className="px-4 py-4 font-mono text-white">GE-365-8821</td>
                    <td className="px-4 py-4 text-white">Greater Accra</td>
                    <td className="px-4 py-4 text-white">Accra Metro</td>
                    <td className="px-4 py-4"><span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full">34</span></td>
                    <td className="px-4 py-4"><span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-full">28</span></td>
                    <td className="px-4 py-4"><span className="bg-slate-800 text-white border border-slate-700 font-bold px-3 py-1 rounded-full">62</span></td>
                    <td className="px-4 py-4"><span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-3 py-1 rounded-full">0</span></td>
                    <td className="px-4 py-4 text-white font-medium">04:30 PM</td>
                    <td className="px-4 py-4"><a href="https://www.google.com/maps/search/?api=1&query=5.6037,-0.1870" target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg inline-flex items-center gap-1">Maps 5.5911 -0.2034 ↗</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab==="analytics" && (
          <div className="mt-3 space-y-4">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm">⚙</span>
                <h3 className="text-white font-bold text-sm">Cylinder Specs <span className="text-slate-500 font-normal text-xs">Same PCB Commercial needs trolley 2 persons</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                <div className="bg-[#0b0f1a] border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">HOME</div>
                  <div className="text-[11px] tracking-widest font-bold text-slate-400">HOME 50kg cell</div>
                  <div className="text-[11px] text-slate-500">6 tare +6.5 gas =12.5 gross</div>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-bold text-white">12.5</span><span className="text-slate-400 text-xs">kg gross</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Tare 6kg • Gas 6.5kg</div>
                  <div className="mt-3 text-[11px] text-cyan-400 font-bold">● HOME badge • Lightweight</div>
                </div>
                <div className="bg-[#0b0f1a] border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">HOME</div>
                  <div className="text-[11px] tracking-widest font-bold text-slate-400">HOME 50kg cell</div>
                  <div className="text-[11px] text-slate-500">14.5 tare +12 gas =26.5 gross</div>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-bold text-white">26.5</span><span className="text-slate-400 text-xs">kg gross</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Tare 14.5kg • Gas 12kg</div>
                  <div className="mt-3 text-[11px] text-cyan-400 font-bold">● HOME badge • Standard HOME</div>
                </div>
                <div className="bg-[#0b0f1a] border border-violet-500/30 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-3 right-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">COMM</div>
                  <div className="text-[11px] tracking-widest font-bold text-slate-400">COMMERCIAL 150kg cell</div>
                  <div className="text-[11px] text-slate-500">19.9 tare +13 gas =32.5 gross</div>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-bold text-white">32.5</span><span className="text-slate-400 text-xs">kg gross</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Tare 19.9kg • Gas 13kg</div>
                  <div className="mt-3 text-[11px] text-violet-400 font-bold">● COMM badge • Trolley required</div>
                </div>
                <div className="bg-[#0b0f1a] border border-violet-500/30 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-3 right-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">COMM</div>
                  <div className="text-[11px] tracking-widest font-bold text-slate-400">COMMERCIAL 150kg cell</div>
                  <div className="text-[11px] text-slate-500">52 tare +35 gas =87 gross</div>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-bold text-white">87</span><span className="text-slate-400 text-xs">kg gross</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Tare 52kg • Gas 35kg</div>
                  <div className="mt-3 text-[11px] text-violet-400 font-bold">● COMM badge • Heavy commercial</div>
                </div>
              </div>
              <div className="mt-4 bg-amber-950/30 border border-amber-800/30 rounded-lg px-4 py-3 flex items-start gap-2">
                <span className="text-amber-400 text-xs">⚠</span>
                <p className="text-[11px] text-amber-200/80 leading-relaxed"><span className="font-bold text-amber-400">Note</span> Commercial 19.5kg & 52kg tare needs trolley +2 persons per spec 19.5kg moved to commercial per spec. Same PCB-GS-V2 board, different load cell calibration.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] tracking-widest font-bold text-slate-400">HOME vs COMM Distribution</div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] mb-1"><span className="text-cyan-400 font-bold">HOME</span><span className="text-white font-bold">66%</span></div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 w-[66%]"></div></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] mb-1"><span className="text-violet-400 font-bold">COMM</span><span className="text-white font-bold">34%</span></div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-violet-500 w-[34%]"></div></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] tracking-widest font-bold text-slate-400">Load Cell Calibration</div>
                <div className="mt-3 space-y-2 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-500">PCB Model</span><span className="text-white font-mono font-bold">PCB-GS-V2</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">HOME Cell</span><span className="text-cyan-400 font-bold">50kg</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">COMM Cell</span><span className="text-violet-400 font-bold">150kg</span></div>
                </div>
              </div>
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] tracking-widest font-bold text-slate-400">Safety Compliance</div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-emerald-400">98.2%</div>
                  <div className="text-[11px] text-slate-500">SCALE CHECK PASS rate • Last 90 days</div>
                  <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[98%]"></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-[11px] text-slate-600 pb-6">
          GasSafe NPA Enterprise National Dashboard • PWA Ready • npaplus/dashboard • Ghana Digital Address Verified
        </div>
      </div>
    </div>
  );
}
// Tailwind CSS required: dark theme bg-[#0b0f1a] bg-[#111827] emerald/cyan/violet accents
