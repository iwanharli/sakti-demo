import React from 'react';
import TacticalCard from '../shared/TacticalCard';

interface TacticalTimelineProps {
  filter: string;
  setFilter: (f: 'all' | 'bmkg' | 'issue') => void;
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
        <div className="flex p-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 shadow-[inner_0_1px_2px_rgba(255,255,255,0.05)]">
          {[
            { id: 'all', label: 'ALL FEED', icon: 'fa-layer-group' },
            { id: 'bmkg', label: 'BMKG', icon: 'fa-tower-broadcast' },
            { id: 'issue', label: 'ISSUE', icon: 'fa-triangle-exclamation' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`
                flex-1 flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-md text-[10px] font-bold tracking-[0.2em] transition-all duration-300 uppercase font-rajdhani relative
                ${filter === btn.id 
                  ? 'text-cyan-400 bg-white/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
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

      <div className="flex-1 ews-timeline overflow-y-auto ews-scrollbar space-y-4 pr-2 border-b border-gray-800/50 mb-1 min-h-0 max-h-[1330px]">
        {filteredTimeline.length > 0 ? (
          filteredTimeline.map((item, idx) => {
            const isIssue = item.tags.includes('ISSUE');
            const icon = isIssue ? 'fa-solid fa-triangle-exclamation' :
                         item.tags.includes('LANTAS') ? 'fa-solid fa-car-burst' : 
                         item.tags.includes('RESKRIM') ? 'fa-solid fa-fingerprint' : 
                         item.tags.includes('INTELKAM') ? 'fa-solid fa-masks-theater' : 
                         item.tags.includes('MONITORING') ? 'fa-solid fa-display' : 
                         'fa-solid fa-bolt-lightning';
            
            const pColor = item.color === 'red' ? '#ef4444' : 
                           item.color === 'amber' ? '#f59e0b' : 
                           item.color === 'emerald' || item.color === 'green' ? '#10b981' : '#06b6d4';

            const glowClass = item.color === 'red' ? 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
                              item.color === 'amber' ? 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 
                              'shadow-[0_0_15px_rgba(6,182,212,0.15)]';
            
            return (
              <div 
                key={idx} 
                className={`
                  relative p-4 rounded-lg bg-black/20 border border-white/5 
                  hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group cursor-pointer
                  backdrop-blur-md overflow-hidden ews-animate-fade-in
                `}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Minimalist Priority Indicator */}
                <div 
                   className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-300 group-hover:w-[4px]`}
                   style={{ 
                     backgroundColor: pColor,
                     boxShadow: `0 0 10px ${pColor}40`
                   }}
                />

                <div className="flex flex-col gap-2 relative z-10">
                  {/* Top Row: Meta Information */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <i className={`${icon} text-[10px] opacity-60`} style={{ color: pColor }}></i>
                       <span className="text-[9px] font-orbitron font-bold text-gray-500 uppercase tracking-[0.2em]">
                         {item.tags?.[0] || 'GENERAL'}
                       </span>
                       <span className="text-[9px] font-mono text-gray-600 tracking-tighter">{item.time}</span>
                    </div>
                    
                    {item.percentage !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-[1px] bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-cyan-500/60" style={{ width: `${item.percentage}%` }} />
                        </div>
                        <span className="text-[9px] font-orbitron text-cyan-500/80 tracking-widest">{item.percentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Middle Row: Content (Capitalized) */}
                  <div className="text-[12px] font-bold text-gray-100 leading-tight uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                    {item.content}
                  </div>

                  {/* Event Tag */}
                  {item.event && (
                    <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
                       <span className="w-1 h-1 rounded-full" style={{ backgroundColor: pColor }} />
                       {item.event}
                    </div>
                  )}

                  {/* Components (Seismic, Maps, etc.) - Minimalist Versions */}
                  {item.magnitude && (
                    <div className="mt-2 grid grid-cols-3 gap-2 py-2 border-t border-white/5">
                      <div>
                        <div className="text-[7px] text-gray-600 uppercase font-black tracking-widest">MAGNITUDE</div>
                        <div className="text-xs font-orbitron font-bold text-red-500/80">{item.magnitude} SR</div>
                      </div>
                      <div>
                        <div className="text-[7px] text-gray-600 uppercase font-black tracking-widest">DEPTH</div>
                        <div className="text-xs font-orbitron font-bold text-gray-300">{item.depth} KM</div>
                      </div>
                      <div>
                        <div className="text-[7px] text-gray-600 uppercase font-black tracking-widest">TSUNAMI</div>
                        <div className={`text-[7px] font-black tracking-widest mt-0.5 ${item.status?.toLowerCase().includes('tidak') ? 'text-emerald-500/60' : 'text-red-500/80 animate-pulse'}`}>
                          {item.status?.toLowerCase().includes('tidak') ? 'NEGATIVE' : 'ALERT'}
                        </div>
                      </div>
                    </div>
                  )}

                  {item.epicenter && (
                    <div className="mt-1 pt-1 border-t border-white/5 flex flex-col gap-0.5">
                       <div className="font-mono text-[9px] text-cyan-600/60 truncate">{item.coordinates}</div>
                       <div className="text-[9px] text-gray-500 font-medium italic lowercase truncate">
                         "{item.epicenter}"
                       </div>
                    </div>
                  )}

                  {item.subRegions && item.subRegions.length > 0 && filter !== 'issue' && (
                    <div className="mt-1 flex flex-wrap gap-1 opacity-60">
                      {item.subRegions.slice(0, 4).map((loc: string, i: number) => (
                        <span key={i} className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-gray-500 uppercase">
                          {loc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/[0.02] rounded-xl border border-dashed border-white/10 mx-2">
            <div className="w-16 h-16 rounded-full bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center mb-6">
               <i className="fa-solid fa-shield-check text-cyan-500/20 text-2xl" />
            </div>
            <h3 className="font-orbitron font-black text-[13px] text-cyan-500 tracking-[0.3em] uppercase mb-3">
              SITUASI TERPANTAU KONDUSIF
            </h3>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[280px] uppercase tracking-wider">
               Belum terdeteksi adanya peringatan dini atau kejadian menonjol dalam basis data.
            </p>
          </div>
        )}
      </div>
    </TacticalCard>
  );
};

export default TacticalTimeline;
