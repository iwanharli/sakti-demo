import React from 'react';
import TacticalCard from '../shared/TacticalCard';

interface TacticalTimelineProps {
  filter: string;
  setFilter: (f: 'all' | 'cuaca' | 'gempa') => void;
  filteredTimeline: any[];
}

const TacticalTimeline: React.FC<TacticalTimelineProps> = ({ 
  filter, 
  setFilter, 
  filteredTimeline 
}) => {
  return (
    <TacticalCard
      headerIcon="fa-solid fa-bolt-lightning"
      headerTitle="PERINGATAN DINI & KEJADIAN"
      headerSubtitle="Umpan Langsung • Prioritas Aktif"
      iconBgColor="bg-red-500/10"
      iconColor="text-red-500"
      className="flex-1 shadow-2xl border-cyan-500/10"
    >
      <div className="mb-6">
        <div className="flex p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 shadow-[inner_0_1px_2px_rgba(255,255,255,0.05)]">
          {[
            { id: 'all', label: 'ALL FEED', icon: 'fa-layer-group' },
            { id: 'cuaca', label: 'CUACA', icon: 'fa-cloud-bolt' },
            { id: 'gempa', label: 'GEMPA', icon: 'fa-house-crack' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`
                flex-1 flex items-center justify-center gap-2.5 py-2 px-5 rounded-md text-[10px] font-bold tracking-[0.15em] transition-all duration-300 uppercase font-rajdhani
                ${filter === btn.id 
                  ? 'text-cyan-400 bg-white/5 shadow-[0_0_15px_rgba(34,211,238,0.1)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}
              `}
            >
              {filter === btn.id && (
                <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent pointer-events-none" />
              )}
              <i className={`fa-solid ${btn.icon} text-[10px] ${filter === btn.id ? 'text-cyan-400' : 'text-gray-600'}`}></i>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 ews-timeline overflow-y-auto ews-scrollbar space-y-3 pr-2 border-b border-gray-800/50 mb-1 min-h-0 max-h-[970px]">
        {filteredTimeline.length > 0 ? (
          filteredTimeline.map((item, idx) => {
            const icon = item.tags.includes('LANTAS') ? 'fa-solid fa-car-burst' : 
                         item.tags.includes('RESKRIM') ? 'fa-solid fa-fingerprint' : 
                         item.tags.includes('INTELKAM') ? 'fa-solid fa-masks-theater' : 
                         item.tags.includes('MONITORING') ? 'fa-solid fa-display' : 
                         'fa-solid fa-triangle-exclamation';
            
            const priorityColor = item.color === 'red' ? 'border-red-500' : 
                                  item.color === 'amber' ? 'border-amber-500' : 
                                  item.color === 'green' ? 'border-emerald-500' : 'border-cyan-500';

            const priorityBg = item.color === 'red' ? 'bg-red-500/10' : 
                               item.color === 'amber' ? 'bg-amber-500/10' : 
                               item.color === 'green' ? 'bg-emerald-500/10' : 'bg-cyan-500/10';
            
            return (
              <div 
                key={idx} 
                className={`
                  relative p-5 rounded-xl bg-white/[0.01] border border-white/5 border-l-4 ${priorityColor}
                  hover:bg-white/[0.03] hover:border-r-white/10 transition-all duration-500 group cursor-pointer
                  backdrop-blur-sm overflow-hidden
                `}
              >
                <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-l from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-lg bg-black/40 border border-white/5 shadow-inner ${item.color === 'red' ? 'text-red-400' : item.color === 'amber' ? 'text-amber-400' : 'text-cyan-400'}`}>
                      <i className={`${icon} text-[11px]`}></i>
                    </div>
                    <div>
                      <span className="text-[11px] font-orbitron font-bold text-gray-200 block leading-none mb-1">
                        {item.tags?.[0] || 'GENERAL'}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-gray-500 uppercase tracking-tight">{item.time}</span>
                    </div>
                  </div>
                  
                  {idx === 0 ? (
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-500/5 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] ews-animate-blink" />
                      <span className="text-[10px] font-black text-red-500 tracking-[0.15em]">LIVE FEED</span>
                    </div>
                  ) : (
                    <div className={`px-2 py-0.5 rounded-md border border-white/5 text-[9px] font-black bg-white/5 text-gray-500 tracking-widest uppercase`}>
                      ARCHIVE
                    </div>
                  )}
                </div>

                {item.event && (
                  <div className={`text-[10px] font-black text-white px-2.5 py-1 mb-3 inline-flex items-center gap-2 rounded-md border border-white/10 uppercase tracking-widest font-orbitron ${priorityBg}`}>
                     <span className={`w-1 h-1 rounded-full ${item.color === 'red' ? 'bg-red-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                     {item.event}
                  </div>
                )}

                <div className="text-[13px] font-medium text-gray-300 leading-relaxed mb-4 group-hover:text-gray-100 transition-colors">
                  {item.content}
                </div>

                {item.subRegions && item.subRegions.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="text-[9px] font-black text-cyan-500/80 uppercase tracking-widest flex items-center gap-2">
                       <i className="fa-solid fa-location-crosshairs text-[8px]"></i> Sector Monitoring: {item.region}
                    </div>
                    <div className="relative group/tags">
                      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto ews-scrollbar-hide pr-2">
                        {item.subRegions.map((loc: string, i: number) => (
                          <span key={i} className="text-[9px] bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded border border-white/5 font-mono hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/20 transition-all cursor-default">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {item.magnitude && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/10 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <i className="fa-solid fa-waveform text-4xl text-red-500"></i>
                    </div>
                    <div className="text-[9px] font-black text-red-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <i className="fa-solid fa-tower-broadcast"></i> Seismic Alert Component
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border-r border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">Magnitude</div>
                        <div className="text-[16px] font-orbitron font-bold text-red-500 leading-none">{item.magnitude} <span className="text-[10px]">SR</span></div>
                      </div>
                      <div className="border-r border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">Depth</div>
                        <div className="text-[16px] font-orbitron font-bold text-gray-300 leading-none">{item.depth} <span className="text-[10px]">KM</span></div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase font-black tracking-tighter mb-1">Tsunami</div>
                        <div className={`text-[12px] font-black tracking-widest ${item.status?.toLowerCase().includes('tidak') ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                          {item.status?.toLowerCase().includes('tidak') ? 'NEGATIVE' : 'ALERT!'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {item.epicenter && (
                  <div className="mb-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg border-l-2 border-l-red-500/50 group/map">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-crosshairs text-[10px] text-gray-600"></i>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Target Coordinates</div>
                      </div>
                    </div>
                    <div className="font-mono text-[11px] text-cyan-400/80 mb-2">{item.coordinates}</div>
                    <div className="text-[10px] text-gray-400 font-medium leading-relaxed bg-white/5 p-2 rounded border border-white/5">{item.epicenter}</div>
                  </div>
                )}

                {item.impact && (
                  <div className="mb-4 flex items-center gap-3 py-2 px-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500 text-[10px] animate-pulse"></i>
                    <div className="text-[11px] text-amber-500/80 italic font-medium">"{item.impact}"</div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/[0.02] rounded-xl border border-dashed border-white/5 mx-2">
            <h3 className="font-orbitron font-black text-[13px] text-cyan-500 tracking-[0.3em] uppercase mb-3">
              SITUASI TERPANTAU KONDUSIF
            </h3>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[280px] uppercase tracking-wider">
               Belum terdeteksi adanya peringatan dini atau kejadian menonjol.
            </p>
          </div>
        )}
      </div>
    </TacticalCard>
  );
};

export default TacticalTimeline;
