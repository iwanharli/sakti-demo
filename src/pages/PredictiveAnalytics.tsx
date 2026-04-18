import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { recidivismData, curanmorPredictions, begalPredictions, dataSources, environmentFactors } from '../data/mockPredictiveAnalytics';

// --- TACTICAL SUB-COMPONENTS ---

const RiskSparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data, 100);
  const min = 0;
  const range = max - min;
  const width = 80;
  const height = 24;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="drop-shadow-[0_0_5px_currentColor]"
      />
      <circle 
        cx={width} 
        cy={height - ((data[data.length - 1] - min) / range) * height} 
        r="2" 
        fill={color} 
        className="animate-pulse"
      />
    </svg>
  );
};

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

      {/* FULL-WIDTH RISK TREND CHART */}
      <div className="bg-[#0a0f1d]/60 border border-gray-800 rounded-xl p-6 relative overflow-hidden group mb-6">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ef4444 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <i className="fa-solid fa-chart-line text-xl"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-wider block">Aggregate Crime Risk Index</span>
              <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Processing Vector Clusters • High Fidelity
              </span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Current Index</div>
              <div className="text-[20px] font-orbitron text-red-500 font-bold">78.4 <span className="text-[12px] text-gray-600">PTS</span></div>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Trend Analytica</div>
              <div className="text-[12px] font-mono text-cyan-400">STABLE/UP</div>
            </div>
          </div>
        </div>

        <div className="relative h-48 w-full">
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            {[25, 50, 75].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(239, 68, 68, 0.05)" strokeWidth="1" strokeDasharray="4 4" />
            ))}
            
            {/* Risk Path */}
            <path 
              d="M0,80 L100,75 L200,85 L300,60 L400,65 L500,40 L600,45 L700,30 L800,35 L900,20 L1000,22 L1000,100 L0,100 Z" 
              fill="url(#riskGradient)" 
            />
            <path 
              d="M0,80 L100,75 L200,85 L300,60 L400,65 L500,40 L600,45 L700,30 L800,35 L900,20 L1000,22" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            />
            
            {/* Interactive Points (Visual) */}
            <circle cx="1000" cy="22" r="4" fill="#ef4444" className="animate-ping" />
            <circle cx="1000" cy="22" r="2" fill="#ef4444" />
          </svg>
          
          <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-mono uppercase tracking-widest">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>NOW</span>
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
                  <div className="text-[11px] text-gray-500 font-medium truncate mb-1">{person.description}</div>
                  <div className="flex items-center gap-2">
                    <RiskSparkline 
                      data={person.riskHistory} 
                      color={person.riskLevel === 'high' ? '#ef4444' : person.riskLevel === 'medium' ? '#f59e0b' : '#10b981'} 
                    />
                    <span className="text-[9px] text-gray-600 font-mono uppercase tracking-tighter">5D TREND</span>
                  </div>
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
            {/* Spatio-Temporal Matrix Visualization */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-8 mb-6">
                {[
                  { title: 'CURANMOR (VEKTOR TEMPORAL)', data: curanmorPredictions, accent: 'red' },
                  { title: 'BEGAL (VEKTOR TEMPORAL)', data: begalPredictions, accent: 'cyan' }
                ].map((section, sidx) => (
                  <div key={sidx} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${section.accent === 'red' ? 'text-red-500' : 'text-cyan-500'}`}>
                        {section.title}
                      </span>
                      <span className="text-[9px] text-gray-600 font-mono">00:00 — 24:00</span>
                    </div>
                    
                    <div className="space-y-5">
                      {section.data.map((loc, lidx) => (
                        <div key={lidx} className="group/loc">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[12px] text-gray-300 font-bold uppercase group-hover/loc:text-white transition-colors">
                              {loc.location}
                            </span>
                            <span className={`text-[12px] font-orbitron font-bold ${loc.color === 'red' ? 'text-red-500' : loc.color === 'amber' ? 'text-amber-500' : 'text-cyan-400'}`}>
                              {loc.probability}% <span className="text-[9px] text-gray-600">PEAK</span>
                            </span>
                          </div>
                          
                          {/* Tactical Vector Bar */}
                          <div className="relative h-6 flex items-end gap-1">
                            {loc.timeVector.map((val, vidx) => (
                              <div key={vidx} className="flex-1 relative group/bar">
                                <div 
                                  className={`w-full rounded-t-sm transition-all duration-700 bg-gradient-to-t ${
                                    loc.color === 'red' ? 'from-red-500/10 to-red-500/60' : 
                                    loc.color === 'amber' ? 'from-amber-500/10 to-amber-500/60' : 
                                    'from-cyan-500/10 to-cyan-500/60'
                                  }`}
                                  style={{ height: `${val}%` }}
                                >
                                  {/* Tooltip on hover */}
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 px-2 py-1 rounded text-[9px] text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                    {String(vidx * 4).padStart(2, '0')}:00 • {val}%
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Baseline */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-800" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Environmental Context Section */}
              <div className="bg-[#0d1425]/40 border border-cyan-500/20 rounded-lg p-4 relative overflow-hidden group/env">
                 <div className="absolute top-0 right-0 p-2 opacity-5 group-hover/env:opacity-10 transition-opacity">
                   <i className="fa-solid fa-cloud-bolt text-6xl"></i>
                 </div>
                 <div className="flex items-center gap-2 mb-4">
                   <i className="fa-solid fa-microscope text-cyan-400 text-xs"></i>
                   <span className="text-[11px] text-cyan-400 font-black uppercase tracking-widest">Environmental Risk Correlation</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6 relative z-10">
                   <div>
                     <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Atmospheric Condition</div>
                     <div className="text-[14px] text-gray-100 font-rajdhani font-bold flex items-center gap-2">
                       <i className="fa-solid fa-droplet text-cyan-500"></i>
                       {environmentFactors.weather}
                     </div>
                     <div className="mt-2 inline-block px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-500 font-black animate-pulse">
                       {environmentFactors.impact}
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="text-[10px] text-gray-500 uppercase font-bold">Active Local Events</div>
                     {environmentFactors.activeEvents.map((ev, i) => (
                       <div key={i} className="flex items-start gap-2 bg-gray-950/40 p-2 rounded border border-gray-800/50">
                          <i className="fa-solid fa-triangle-exclamation text-amber-500 text-[10px] mt-1"></i>
                          <div>
                            <div className="text-[11px] text-gray-200 font-bold leading-none">{ev.title}</div>
                            <div className="text-[9px] text-gray-500 mt-1">{ev.impact}</div>
                          </div>
                       </div>
                     ))}
                   </div>
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
