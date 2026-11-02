import React, { useState } from 'react';

export default function App() {
  const [checks, setChecks] = useState({
    valve: false,
    leak: false,
    visual: false,
  });

  const allChecksPass = checks.valve && checks.leak && checks.visual;

  const [cylinders, setCylinders] = useState([
    { id: 1, serial: 'GH-H-OLD-88321', type: 'HOME', location: 'Depot-B', pcb: 'PCB-GS-V2', target: 12.5, actual: '12.5', status: 'synced' },
    { id: 2, serial: 'GH-C-OLD-77201', type: 'COMMERCIAL', location: 'Depot-B', pcb: 'PCB-GS-V2', target: 87, actual: '87', status: 'idle' },
    { id: 3, serial: 'GH-H-OLD-88322', type: 'HOME', location: 'Filling-Q', pcb: 'PCB-GS-V2', target: 26.5, actual: '', status: 'idle' },
    { id: 4, serial: 'GH-C-OLD-77203', type: 'COMMERCIAL', location: 'Filling-Q', pcb: 'PCB-GS-V2', target: 32.5, actual: '', status: 'idle' },
  ]);

  const getVerificationResult = (target, actual) => {
    if (actual === '' || actual === null || isNaN(parseFloat(actual))) return { label: 'PENDING', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    const diff = Math.abs(parseFloat(actual) - target);
    if (diff <= 0.2) return { label: 'PASS', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (diff <= 0.5) return { label: 'ADJUST', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'FAIL', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const handleActualChange = (id, value) => {
    setCylinders(prev => prev.map(c => c.id === id ? { ...c, actual: value } : c));
  };

  const handleConfirm = (id) => {
    setCylinders(prev => prev.map(c => c.id === id ? { ...c, status: 'synced' } : c));
  };

  const toggleCheck = (key) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const queuedCount = cylinders.filter(c => c.status !== 'synced').length;

  return (
    <div className="min-h-screen bg-[#0B1016] text-slate-200 font-sans selection:bg-cyan-500/30">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap'); *{font-family: 'Inter', sans-serif} .mono{font-family: 'JetBrains Mono', monospace}`}</style>

      <header className="sticky top-0 z-50 bg-[#0B1016]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5a4.5 4.5 0 1 1-7.5 4.5Z" /><path d="M12 21a2 2 0 0 0 2-2c0-1.5-.5-2-1-3" /></svg>
              </div>
              <div>
                <h1 className="text-[18px] md:text-[20px] font-extrabold tracking-tight leading-none text-white flex flex-wrap items-center gap-2">
                  GasSafe Filling Plant
                  <span className="text-slate-500 font-semibold text-[13px] hidden sm:inline">—</span>
                  <span className="text-cyan-400 font-bold text-[13px] md:text-[14px] tracking-wide">PCB-GS-V2 Same PCB Different Load Cell</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">GNFS SOP</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> PWA READY
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 text-[11px] font-bold mono">v2.4.1 • Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#141C24] border border-slate-700/70 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase leading-none">Plant Location</div>
                  <div className="text-[13px] font-bold text-white leading-tight mt-1">Tema Filling Plant - GE-321-1234</div>
                  <div className="text-[12px] text-slate-400 leading-tight">Tema Metro, Greater Accra</div>
                </div>
                <div className="hidden md:flex w-8 h-8 rounded-lg bg-slate-800 items-center justify-center border border-slate-700 ml-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-slate-500">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
            <h2 className="text-[14px] font-extrabold tracking-widest text-white uppercase">Cylinder Specs - Same PCB</h2>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 mono">PCB-GS-V2</span>
            <span className="hidden md:inline text-[12px] text-slate-500">4 certified configurations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-[#121A23] border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-extrabold tracking-widest">HOME</span>
                <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 mono">50kg cell</span>
              </div>
              <div className="space-y-1 mono text-[13px] leading-5">
                <div className="flex justify-between"><span className="text-slate-500">HOME 6 tare</span><span className="text-white font-bold">6.0 kg</span></div>
                <div className="flex justify-between"><span className="text-slate-500">6.5 gas</span><span className="text-white font-bold">6.5 kg</span></div>
                <div className="h-px bg-slate-800 my-2"></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-sans font-bold text-[11px] tracking-widest uppercase">12.5 gross kg</span><span className="text-cyan-400 font-extrabold text-[16px]">12.5</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> HOME badge
              </div>
            </div>

            <div className="bg-[#121A23] border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-white text-[10px] font-extrabold tracking-widest">HOME</span>
                <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 mono">50kg cell</span>
              </div>
              <div className="space-y-1 mono text-[13px] leading-5">
                <div className="flex justify-between"><span className="text-slate-500">HOME 14.5 tare</span><span className="text-white font-bold">14.5 kg</span></div>
                <div className="flex justify-between"><span className="text-slate-500">12 gas</span><span className="text-white font-bold">12.0 kg</span></div>
                <div className="h-px bg-slate-800 my-2"></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-sans font-bold text-[11px] tracking-widest uppercase">26.5 gross kg</span><span className="text-cyan-400 font-extrabold text-[16px]">26.5</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> HOME badge
              </div>
            </div>

            <div className="bg-[#121A23] border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-extrabold tracking-widest">COMMERCIAL</span>
                <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400 mono">150kg cell</span>
              </div>
              <div className="space-y-1 mono text-[13px] leading-5">
                <div className="flex justify-between"><span className="text-slate-500">COMM 19.5 tare</span><span className="text-white font-bold">19.5 kg</span></div>
                <div className="flex justify-between"><span className="text-slate-500">13 gas</span><span className="text-white font-bold">13.0 kg</span></div>
                <div className="h-px bg-slate-800 my-2"></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-sans font-bold text-[11px] tracking-widest uppercase">32.5 gross kg</span><span className="text-amber-400 font-extrabold text-[16px]">32.5</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-amber-400/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg> COMM badge • Trolley required
              </div>
            </div>

            <div className="bg-[#121A23] border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-extrabold tracking-widest">COMMERCIAL</span>
                <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400 mono">150kg cell</span>
              </div>
              <div className="space-y-1 mono text-[13px] leading-5">
                <div className="flex justify-between"><span className="text-slate-500">COMM 52 tare</span><span className="text-white font-bold">52.0 kg</span></div>
                <div className="flex justify-between"><span className="text-slate-500">35 gas</span><span className="text-white font-bold">35.0 kg</span></div>
                <div className="h-px bg-slate-800 my-2"></div>
                <div className="flex justify-between items-center"><span className="text-slate-400 font-sans font-bold text-[11px] tracking-widest uppercase">87 gross kg</span><span className="text-amber-400 font-extrabold text-[16px]">87.0</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-amber-400/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg> COMM badge • Trolley + 2 persons
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            </div>
            <div className="text-[13px] leading-5">
              <span className="font-extrabold text-amber-400">Handling Spec:</span>
              <span className="text-amber-200/90 font-medium"> Commercial 19.5kg & 52kg tare needs </span>
              <span className="font-extrabold text-white underline decoration-amber-500/50 underline-offset-4">trolley + 2 persons</span>
              <span className="text-amber-200/90 font-medium"> per spec. </span>
              <span className="font-bold text-amber-400">19.5kg moved to commercial per spec.</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-[#121A23] border border-slate-800 rounded-2xl overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0F1720]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M9 12l2 2 4-4" /><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z" /></svg>
                  </div>
                  <h3 className="text-[13px] font-extrabold tracking-widest text-white uppercase">Safety Checklist - Valve / Leak / Visual</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-widest mono border ${allChecksPass ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-red-500/15 text-red-400 border-red-500/20'}`}>
                  {allChecksPass ? 'ALL PASS ✓' : 'REQUIRED'}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${checks.valve ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0B1016] border-slate-800 hover:border-slate-700'}`}>
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={checks.valve} onChange={() => toggleCheck('valve')} className="peer sr-only" />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.valve ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-600 peer-hover:border-slate-500'}`}>
                      {checks.valve && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5l10 -10" /></svg>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-extrabold mono text-slate-400">1</span>
                      Valve integrity no crack thread OK
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1 ml-8">Check valve threads for cracks, corrosion, proper engagement</div>
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full border ${checks.valve ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{checks.valve ? 'PASS' : 'CHECK'}</span>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${checks.leak ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0B1016] border-slate-800 hover:border-slate-700'}`}>
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={checks.leak} onChange={() => toggleCheck('leak')} className="peer sr-only" />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.leak ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-600 peer-hover:border-slate-500'}`}>
                      {checks.leak && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5l10 -10" /></svg>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-extrabold mono text-slate-400">2</span>
                      Leak test soap/detector PASS
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1 ml-8">Apply soap solution or electronic detector, no bubbles / alarm</div>
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full border ${checks.leak ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{checks.leak ? 'PASS' : 'CHECK'}</span>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${checks.visual ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#0B1016] border-slate-800 hover:border-slate-700'}`}>
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={checks.visual} onChange={() => toggleCheck('visual')} className="peer sr-only" />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checks.visual ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent border-slate-600 peer-hover:border-slate-500'}`}>
                      {checks.visual && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5l10 -10" /></svg>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-extrabold mono text-slate-400">3</span>
                      Visual no rust foot ring handle OK
                    </div>
                    <div className="text-[12px] text-slate-500 mt-1 ml-8">Inspect body, foot ring, collar and handle for integrity</div>
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-widest px-2.5 py-1 rounded-full border ${checks.visual ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{checks.visual ? 'PASS' : 'CHECK'}</span>
                </label>

                <div className={`rounded-xl px-4 py-3 flex items-center gap-3 border ${allChecksPass ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${allChecksPass ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.3L3 21h18l-7.3-17.7a1 1 0 0 0-1.4 0Z" /></svg>
                  </div>
                  <p className={`text-[12px] font-semibold leading-5 ${allChecksPass ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {allChecksPass ? 'All checks PASS — Ready to Confirm Fill & Sync to Depot+NPA.' : 'All checks must PASS before Confirm Fill & Sync to Depot+NPA.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-[#121A23] border border-slate-800 rounded-2xl overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-slate-800 bg-[#0F1720]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                  </div>
                  <h3 className="text-[13px] font-extrabold tracking-widest text-white uppercase">Weight Verification Logic</h3>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-[13px] text-slate-400 leading-6">Input <span className="text-white font-bold">actual gross</span> vs spec target.</p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 bg-[#0B1016] border border-slate-800 rounded-xl px-4 py-3">
                      <span className="mono text-[12px] font-bold text-slate-300 whitespace-nowrap">diff ≤0.2kg</span>
                      <span className="text-slate-600">→</span>
                      <span className="ml-auto px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-extrabold tracking-widest">PASS</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0B1016] border border-slate-800 rounded-xl px-4 py-3">
                      <span className="mono text-[12px] font-bold text-slate-300 whitespace-nowrap">diff ≤0.5kg</span>
                      <span className="text-slate-600">→</span>
                      <span className="ml-auto px-3 py-1 rounded-full bg-amber-500 text-black text-[11px] font-extrabold tracking-widest">ADJUST</span>
                    </div>
                    <div className="flex items-center gap-3 bg-[#0B1016] border border-slate-800 rounded-xl px-4 py-3">
                      <span className="mono text-[12px] font-bold text-slate-300 whitespace-nowrap">diff &gt;0.5kg</span>
                      <span className="text-slate-600">→</span>
                      <span className="ml-auto px-3 py-1 rounded-full bg-red-500 text-white text-[11px] font-extrabold tracking-widest">FAIL</span>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                  <div className="flex gap-2.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <p className="text-[12px] leading-5 text-cyan-200/90">
                      <span className="font-bold text-cyan-400">Commercial trolley warning</span> auto-shown for COMM cylinder PCB note enforced.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-500 mono">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Tolerance: ±0.2kg PASS • GNFS SOP §4.2
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-[#0B1016] border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Pass Rate</div>
                    <div className="mono text-[18px] font-extrabold text-emerald-400 mt-1">98.4%</div>
                  </div>
                  <div className="bg-[#0B1016] border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Avg Diff</div>
                    <div className="mono text-[18px] font-extrabold text-cyan-400 mt-1">0.08kg</div>
                  </div>
                  <div className="bg-[#0B1016] border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Today</div>
                    <div className="mono text-[18px] font-extrabold text-white mt-1">142</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#121A23] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 bg-[#0F1720]/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
                </div>
                <h3 className="text-[14px] font-extrabold tracking-widest text-white uppercase">Queue to Fill - Filling Plant</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[12px] font-extrabold mono">{queuedCount} queued</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-[#0B1016] border border-slate-800 rounded-full px-3 py-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Live sync: Depot+NPA
              </div>
              <button className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-[12px] font-bold text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                Export Queue
              </button>
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0B1016] border-b border-slate-800 text-[11px] font-extrabold tracking-widest text-slate-500 uppercase">
                  <th className="text-left px-5 py-3 font-extrabold">Serial / Type / Location</th>
                  <th className="text-left px-5 py-3 font-extrabold">Target Gross</th>
                  <th className="text-left px-5 py-3 font-extrabold">Actual Gross Input</th>
                  <th className="text-left px-5 py-3 font-extrabold">Result</th>
                  <th className="text-right px-5 py-3 font-extrabold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {cylinders.map((cyl) => {
                  const result = getVerificationResult(cyl.target, cyl.actual);
                  const isCommercial = cyl.type === 'COMMERCIAL';
                  const isSynced = cyl.status === 'synced';
                  return (
                    <tr key={cyl.id} className={`transition-colors ${isSynced ? 'bg-emerald-500/[0.03]' : 'bg-[#121A23] hover:bg-[#151E29]'}`}>
                      <td className="px-5 py-4">
                        <div className="mono text-[13px] font-bold text-white tracking-tight">{cyl.serial}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest border ${cyl.type === 'HOME' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{cyl.type}</span>
                          <span className="text-[12px] text-slate-500 font-medium">{cyl.location}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] mono text-slate-500">{cyl.pcb}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1016] border border-slate-800 mono text-[13px] font-bold text-white">
                          <span className={`w-2 h-2 rounded-full ${cyl.type === 'HOME' ? 'bg-cyan-500' : 'bg-amber-500'}`}></span>
                          {cyl.target}kg
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              value={cyl.actual}
                              onChange={(e) => handleActualChange(cyl.id, e.target.value)}
                              placeholder="0.0"
                              className="w-[140px] bg-[#0B1016] border border-slate-700 rounded-xl px-3 py-2.5 pr-10 mono text-[14px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-500 mono">kg</span>
                          </div>
                        </div>
                        {isCommercial && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            Trolley + 2 persons required
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-extrabold tracking-widest border ${result.color}`}>
                          {result.label}
                        </span>
                        {cyl.actual !== '' && !isNaN(parseFloat(cyl.actual)) && (
                          <div className="mono text-[11px] text-slate-500 mt-1">Δ {Math.abs(parseFloat(cyl.actual) - cyl.target).toFixed(1)}kg</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isSynced ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-[12px] font-extrabold">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12l5 5l10 -10" /></svg>
                            Synced
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirm(cyl.id)}
                            disabled={!allChecksPass}
                            className={`px-5 py-2.5 rounded-full text-[12px] font-extrabold tracking-wide transition-all inline-flex items-center gap-2 ${allChecksPass
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                              }`}
                            title={!allChecksPass ? 'Complete all 3 safety checks first' : 'Confirm fill'}
                          >
                            Confirm Fill & Sync
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                          </button>
                        )}
                        {!allChecksPass && !isSynced && (
                          <div className="text-[10px] font-bold text-slate-500 mt-1.5">Requires all checks PASS</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-800">
            {cylinders.map((cyl) => {
              const result = getVerificationResult(cyl.target, cyl.actual);
              const isSynced = cyl.status === 'synced';
              return (
                <div key={cyl.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="mono text-[13px] font-bold text-white">{cyl.serial}</div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest border ${cyl.type === 'HOME' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{cyl.type}</span>
                        <span className="text-[11px] text-slate-500">{cyl.location} • {cyl.pcb}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest border ${result.color}`}>{result.label}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0B1016] border border-slate-800 rounded-xl p-3">
                      <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Target Gross</div>
                      <div className="mono text-[15px] font-extrabold text-white mt-1">{cyl.target}kg</div>
                    </div>
                    <div className="bg-[#0B1016] border border-slate-800 rounded-xl p-3">
                      <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Actual Input</div>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          step="0.1"
                          value={cyl.actual}
                          onChange={(e) => handleActualChange(cyl.id, e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-[#121A23] border border-slate-700 rounded-lg px-3 py-2 pr-8 mono text-[14px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">kg</span>
                      </div>
                    </div>
                  </div>

                  {cyl.type === 'COMMERCIAL' && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                      Trolley + 2 persons required
                    </div>
                  )}

                  {isSynced ? (
                    <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-emerald-500 text-white text-[13px] font-extrabold">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M5 12l5 5l10 -10" /></svg>
                      Synced to Depot+NPA
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConfirm(cyl.id)}
                      disabled={!allChecksPass}
                      className={`w-full py-3 rounded-full text-[13px] font-extrabold flex items-center justify-center gap-2 ${allChecksPass ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'}`}
                    >
                      Confirm Fill & Sync
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                  )}
                  {!allChecksPass && !isSynced && <div className="text-center text-[11px] font-bold text-slate-500">Complete all 3 safety checks to enable</div>}
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 bg-[#0B1016] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
            <div className="text-slate-500 font-medium">
              Showing <span className="text-white font-bold">4</span> cylinders • <span className="text-emerald-400 font-bold">{cylinders.filter(c => c.status === 'synced').length} synced</span> • <span className="text-amber-400 font-bold">{queuedCount} queued</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] mono text-slate-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Auto-sync every 30s • Last sync: just now
            </div>
          </div>
        </section>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-2 text-[11px] text-slate-600 border-t border-slate-800/50 pt-6">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-widest uppercase">GasSafe QC PWA</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span className="mono">PCB-GS-V2 • GNFS SOP Compliant • PWA READY</span>
          </div>
          <div className="mono">Tema Filling Plant • GE-321-1234 • © 2024 GasSafe</div>
        </div>
      </main>
    </div>
  );
}
