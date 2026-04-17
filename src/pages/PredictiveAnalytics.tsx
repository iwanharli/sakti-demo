import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

import { recidivismData, curanmorPredictions, begalPredictions, dataSources } from '../data/mockPredictiveAnalytics';

export default function PredictiveAnalytics() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'ews-tag-red';
      case 'medium':
        return 'ews-tag-amber';
      case 'low':
        return 'ews-tag-green';
      default:
        return 'ews-tag-cyan';
    }
  };

  const getAvatarClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500/15 border-red-500/30 text-red-400';
      case 'medium':
        return 'bg-amber-500/12 border-amber-500/30 text-amber-400';
      case 'low':
        return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
      default:
        return 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400';
    }
  };

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>

      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-cyan-500 bg-cyan-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,211,234,0.1)]">
              <i className="fa-solid fa-brain text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Menggunakan pemrosesan Neural Network pada data historis kriminalitas 5 tahun terakhir untuk menghasilkan Heatmap probabilitas kejadian berdasarkan variabel waktu dan lokasi dengan tingkat akurasi tinggi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Source</span>
              <span className="font-orbitron text-lg font-bold text-cyan-400">NEURAL NET</span>
            </div>
          </div>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail akurasi model AI', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Akurasi Model AI</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">87<span className="text-2xl">%</span></div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-red-400 uppercase font-black">▲ 2.4%</span>
            <span className="text-gray-500 italic">Efisiensi Neural</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-microchip"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail target pantauan', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Target Pantauan</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">134</div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-red-500 uppercase font-black animate-pulse">28 KRITIS</span>
            <span className="text-gray-500 italic">risiko tinggi</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-user-check"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail titik rawan', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Titik Rawan</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">05</div>
          <div className="text-[13px] text-gray-500 italic">Zona Terkunci / 24 Jam</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-location-crosshairs"></i>
          </div>
        </div>

        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail saturasi data', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Saturasi Data</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">08</div>
          <div className="text-[13px] text-gray-500 italic">Aliran Paralel Aktif</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-purple-500">
            <i className="fa-solid fa-database"></i>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* SUBJECT TRACKING MATRIX */}
        <div className="bg-[#0a0f1d]/60 border border-gray-800 rounded-xl overflow-hidden relative group">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1425]/80">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-users-viewfinder text-cyan-500 text-xs"></i>
              <span className="font-orbitron font-bold text-[15px] tracking-wider text-white uppercase">SUBJECT TRACKING</span>
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-[600px] overflow-auto ews-scrollbar">
            {recidivismData.map((person) => (
              <div 
                key={person.id}
                className="group/item flex items-center gap-3 p-3 rounded-lg bg-[#0e1528]/40 border border-gray-800/50 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer relative"
                onClick={() => addToast(`Detail profil: ${person.name}`, 'info')}
              >
                {/* Tactical Corner */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/0 group-hover/item:border-cyan-500/40 transition-all" />
                
                <div className={`w-10 h-10 rounded bg-gray-900 border flex items-center justify-center text-sm font-orbitron font-black shadow-inner ${getAvatarClass(person.riskLevel)}`}>
                  {person.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-bold text-gray-100 uppercase tracking-wide group-hover/item:text-white">{person.name}</div>
                    <span className="text-[10px] text-gray-600 font-mono">ID-{person.id.toString().padStart(4, '0')}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium truncate">{person.description}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-2 py-0.5 rounded text-[11px] font-black tracking-widest ${getRiskBadgeClass(person.riskLevel)}`}>
                    {person.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-[12px] text-gray-400 font-orbitron">{person.score} Pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PREDICTIVE ANALYTICS MAIN ENGINE */}
        <div className="col-span-2 space-y-5">
          <div className="bg-[#0a0f1d]/60 border border-gray-800 rounded-xl relative overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1425]/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-chart-area text-amber-500 text-xs"></i>
                <span className="font-orbitron font-bold text-[15px] tracking-wider text-white uppercase">Spatio-Temporal Predictive Matrix</span>
              </div>
            </div>
            
            <div className="p-5 grid grid-cols-2 gap-6">
              {/* Curanmor Predictions */}
              <div className="relative group">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Prediction: CURANMOR</span>
                </div>
                <div className="space-y-4">
                  {curanmorPredictions.map((pred, idx) => (
                    <div key={idx} className="group/bar">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px] text-gray-400 font-bold group-hover/bar:text-gray-200 transition-colors uppercase leading-none">{pred.location}</span>
                        <span className={`text-[13px] font-orbitron font-bold ${pred.color === 'red' ? 'text-red-500' : 'text-amber-500'}`}>
                          {pred.probability}% <span className="text-[10px] text-gray-600">PROB</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800/50 relative">
                        <div 
                          className={`h-full relative transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${pred.color === 'red' ? 'bg-red-500 text-red-500' : 'bg-amber-500 text-amber-500'}`}
                          style={{ width: `${pred.probability}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Begal Predictions */}
              <div className="relative group">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Prediction: BEGAL</span>
                </div>
                <div className="space-y-4">
                  {begalPredictions.map((pred, idx) => (
                    <div key={idx} className="group/bar">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px] text-gray-400 font-bold group-hover/bar:text-gray-200 transition-colors uppercase leading-none">{pred.location}</span>
                        <span className={`text-[13px] font-orbitron font-bold ${pred.color === 'amber' ? 'text-amber-500' : 'text-cyan-500'}`}>
                          {pred.probability}% <span className="text-[10px] text-gray-600">PROB</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800/50 relative">
                        <div 
                          className={`h-full relative transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor] ${pred.color === 'amber' ? 'bg-amber-500 text-amber-500' : 'bg-cyan-500 text-cyan-500'}`}
                          style={{ width: `${pred.probability}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tactical Risk Timeline */}
            <div className="mx-5 mb-5 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <i className="fa-solid fa-clock-rotate-left text-4xl"></i>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <i className="fa-solid fa-hourglass-half text-cyan-500 text-sm"></i>
                <span className="text-[12px] text-cyan-500 font-black uppercase tracking-[0.2em]">High-Activity Time Windows</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-[11px] font-orbitron text-red-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" /> 20:00 – 23:00 WIB
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] font-orbitron text-amber-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" /> 06:00 – 08:00 WIB
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[11px] font-orbitron text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" /> SAT–SUN ×2.1 RISK
                </div>
              </div>
            </div>
          </div>

          {/* INTELLIGENCE FEED SOURCES */}
          <div className="bg-[#0a0f1d]/60 border border-gray-800 rounded-xl relative overflow-hidden group">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0d1425]/80">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-server text-purple-500 text-xs"></i>
                <span className="font-orbitron font-bold text-[15px] tracking-wider text-white uppercase">Active Intelligence Sources</span>
              </div>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-3">
              {dataSources.map((source, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-[#0e1528]/40 border border-gray-800/80 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer group/source"
                  onClick={() => addToast(`Detail sumber: ${source.name}`, 'info')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded bg-gray-900 border border-gray-800 flex items-center justify-center text-purple-400 group-hover/source:text-purple-300 group-hover/source:border-purple-500/30 shadow-inner">
                      <i className={`fa-solid ${
                        source.name.includes('SPKT') ? 'fa-building-shield' : 
                        source.name.includes('BPS') ? 'fa-chart-pie' : 
                        source.name.includes('BMKG') ? 'fa-cloud-bolt' : 'fa-database'
                      } text-xs`}></i>
                    </div>
                    <div className="text-[14px] font-bold text-gray-100 font-rajdhani group-hover/source:text-white transition-colors">{source.name}</div>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium leading-relaxed">{source.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
