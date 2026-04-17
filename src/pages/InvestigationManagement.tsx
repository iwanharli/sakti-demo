import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

import { cases, sp2hpStatus, crimeDistribution, filters } from '../data/mockInvestigationManagement';

export default function InvestigationManagement() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'progress':
        return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
      case 'closed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      default:
        return 'bg-gray-500/15 text-gray-400';
    }
  };

  const getTypeTagClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'ews-tag-red';
      case 'amber':
        return 'ews-tag-amber';
      case 'purple':
        return 'ews-tag-purple';
      default:
        return 'ews-tag-cyan';
    }
  };

  const filteredCases = activeFilter === 'Semua' 
    ? cases 
    : cases.filter(c => c.type === activeFilter);

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-amber-500 bg-amber-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <i className="fa-solid fa-folder-tree text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Sistem administrasi perkara yang mengintegrasikan rekam jejak digital tersangka, matriks keterhubungan saksi, dan bukti forensik dalam database terenkripsi AES-256.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Source</span>
              <span className="font-orbitron text-lg font-bold text-amber-500">SAKTI DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail kasus aktif', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Kasus Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">47</div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-red-400 uppercase font-black uppercase">▲ CRITICAL</span>
            <span className="text-gray-500 italic">Pemantauan Kritis</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-folder-open"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail kasus pending', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Kasus Tertunda</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">12</div>
          <div className="text-[13px] text-gray-500 italic">Menunggu Disposisi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-hourglass-start"></i>
          </div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail kasus diselesaikan', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Kasus Selesai</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">38</div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-emerald-400 uppercase font-black">81% RATE</span>
            <span className="text-gray-500 italic">Tingkat Penyelesaian</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-check-double"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail tersangka DPO', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">DPO Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">09</div>
          <div className="text-[13px] text-gray-500 italic">Pelacakan Real-time</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-users-rays"></i>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex items-center justify-between gap-4 mb-2 relative z-10 flex-wrap lg:flex-nowrap">
        <div className="flex items-center gap-2 p-1 bg-gray-900/60 border border-gray-800 rounded-xl backdrop-blur-sm overflow-x-auto ews-scrollbar no-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-cyan-500 text-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div className="relative group w-full lg:w-72">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors">
            <i className="fa-solid fa-crosshairs text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="KASUS NO. VECTOR_SEARCH..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-950/80 border border-gray-800 text-[13px] text-white placeholder-gray-600 focus:border-cyan-500/50 focus:bg-gray-900 focus:outline-none transition-all font-mono shadow-inner"
          />
        </div>
      </div>

      {/* TACTICAL CASE MATRIX */}
      <div className="ews-card p-6 relative overflow-hidden group/table">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent h-1 w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <i className="fa-solid fa-folder-tree text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">ACTIVE CASE REPOSITORY</span>
              <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Sensing Active • Live Connection
              </span>
            </div>
          </div>
          <div className="text-[10px] text-gray-500 font-mono italic">[+] TOTAL_ENTRY: {filteredCases.length}</div>
        </div>

        <div className="overflow-auto ews-scrollbar max-h-[500px] relative z-10">
          <table className="w-full border-separate border-spacing-y-1.5">
            <thead className="sticky top-0 z-20 bg-[#070a12]/90 backdrop-blur-md">
              <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">
                <th className="text-left py-4 pl-6 border-b border-gray-800">No. Kasus</th>
                <th className="text-left py-4 border-b border-gray-800">Klasifikasi</th>
                <th className="text-left py-4 border-b border-gray-800">Lokasi TKP</th>
                <th className="text-left py-4 border-b border-gray-800">Timeline</th>
                <th className="text-left py-4 border-b border-gray-800">Penyidik</th>
                <th className="text-left py-4 border-b border-gray-800">Progres</th>
                <th className="text-right py-4 pr-6 border-b border-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseItem) => (
                <tr 
                  key={caseItem.id} 
                  className="group cursor-pointer transition-all duration-300 relative"
                  onClick={() => addToast(`Membuka detail kasus ${caseItem.id}`, 'info')}
                >
                  <td className="bg-gray-900/40 border-y border-l border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all rounded-l-xl pl-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0)] group-hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all" />
                      <span className="font-orbitron font-bold text-[14px] text-cyan-400 tracking-wider transition-colors">{caseItem.id}</span>
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-5">
                    <span className={`ews-tag text-[11px] font-black tracking-widest ${getTypeTagClass(caseItem.typeColor)}`}>
                      {caseItem.type}
                    </span>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-5">
                    <div className="flex items-center gap-2 text-[13px] text-gray-300 font-medium">
                      <i className="fa-solid fa-location-dot text-gray-600 text-[10px]"></i>
                      {caseItem.location}
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-5">
                    <div className="flex flex-col">
                      <span className="font-orbitron text-[12px] text-gray-400 font-bold">{caseItem.date}</span>
                      <span className="text-[10px] text-gray-600 uppercase font-mono tracking-tighter">Registered_Doc</span>
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-black text-gray-400">
                         {caseItem.investigator.split(' ').map(n => n[0]).join('')}
                       </div>
                       <span className="text-[13px] text-gray-300 font-bold">{caseItem.investigator}</span>
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-5">
                    <span className={`ews-tag text-[11px] font-black tracking-widest ${
                      caseItem.stageColor === 'red' ? 'ews-tag-red' :
                      caseItem.stageColor === 'amber' ? 'ews-tag-amber' :
                      caseItem.stageColor === 'green' ? 'ews-tag-green' :
                      'ews-tag-cyan'
                    }`}>
                      {caseItem.stage}
                    </span>
                  </td>
                  <td className="bg-gray-900/40 border-y border-r border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all rounded-r-xl pr-6 py-5 text-right">
                    <span className={`px-3 py-1 rounded text-[11px] font-black tracking-widest border shadow-inner ${getStatusPillClass(caseItem.status)}`}>
                      {caseItem.status === 'open' ? 'BUKA' : caseItem.status === 'progress' ? 'PROSES' : 'TUTUP'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* SP2HP Status */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none opacity-20" />
          <div className="flex items-center justify-between mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <i className="fa-solid fa-envelope-open-text text-lg"></i>
              </div>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">SP2HP / EMP STATUS</span>
            </div>
          </div>
          <div className="space-y-3 relative z-10">
            {sp2hpStatus.map((item, idx) => (
              <div 
                key={idx}
                className={`flex justify-between items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:translate-x-1 ${
                  item.statusColor === 'red' ? 'bg-red-500/5 border-red-500/15 hover:border-red-500/30' :
                  item.statusColor === 'amber' ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30' :
                  'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30'
                }`}
                onClick={() => addToast(`Detail: ${item.title}`, 'info')}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    item.statusColor === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    item.statusColor === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}>
                    <i className={`fa-solid ${item.statusColor === 'red' ? 'fa-triangle-exclamation' : 'fa-circle-info'} text-xs`}></i>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-gray-100">{item.title}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{item.desc}</div>
                  </div>
                </div>
                <span className={`ews-tag text-[11px] font-black tracking-widest ${
                  item.statusColor === 'red' ? 'ews-tag-red' :
                  item.statusColor === 'amber' ? 'ews-tag-amber' :
                  'ews-tag-green'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Distribution */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none opacity-20" />
          <div className="flex items-center justify-between mb-8 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <i className="fa-solid fa-chart-pie text-lg"></i>
              </div>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">CRIME DISTRIBUTION</span>
            </div>
            <div className="text-[10px] text-cyan-500/60 font-mono">30 Hari Terakhir</div>
          </div>
          <div className="flex items-center gap-10 relative z-10">
            {/* Donut Chart with HUD Marks */}
            <div className="relative group/chart">
              <svg viewBox="0 0 100 100" className="w-48 h-48 flex-shrink-0 drop-shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                {/* HUD Marks */}
                <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" strokeDasharray="2 4" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(6,182,212,0.03)" strokeWidth="1" />
                
                <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(6,182,212,0.05)" strokeWidth="18"/>
                {crimeDistribution.reduce((acc, item, idx) => {
                  const prevTotal = crimeDistribution.slice(0, idx).reduce((sum, i) => sum + i.value, 0);
                  const circumference = 2 * Math.PI * 35;
                  const dashArray = `${(item.value / 100) * circumference} ${circumference}`;
                  const dashOffset = -((prevTotal / 100) * circumference);
                  return [
                    ...acc,
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="18"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-1000"
                      transform="rotate(-90 50 50)"
                    />
                  ];
                }, [] as React.ReactElement[])}
                <circle cx="50" cy="50" r="25" fill="#070a12" className="shadow-inner" />
                <text x="50" y="46" textAnchor="middle" fill="#e8f4ff" fontSize="12" className="font-orbitron font-bold">47</text>
                <text x="50" y="58" textAnchor="middle" fill="rgba(6,182,212,0.5)" fontSize="6" className="font-mono uppercase tracking-widest">Total Kasus</text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {crimeDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-4 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}33` }} />
                    <span className="text-[13px] text-gray-400 font-bold">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="text-[12px] font-orbitron font-bold text-gray-300 w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
