import React, { useMemo, useState } from 'react';
import TacticalCard from '../shared/TacticalCard';
import TacticalModal from '../shared/TacticalModal';
import { useCommandCenterData } from '../../../hooks/useCommandCenterData';

const PublicSentiment: React.FC = () => {
  const { sosmedSentiment, isSosmedLoading, sosmedDate, setSosmedDate } = useCommandCenterData();
  const [showKeywordsList, setShowKeywordsList] = useState(false);

  const stats = useMemo(() => {
    if (!sosmedSentiment || !sosmedSentiment.stats) {
      return { positif: 0, netral: 0, negatif: 0 }; // Default to empty if no data
    }
    const find = (label: string) => 
      sosmedSentiment.stats.find((s: any) => s.sentiment === label)?.percentage || 0;
    
    return {
      positif: find('Positif'),
      netral: find('Netral'),
      negatif: find('Negatif'),
    };
  }, [sosmedSentiment]);

  // Status computation
  const statusInfo = useMemo(() => {
    if (stats.negatif + stats.positif + stats.netral === 0) {
      return { label: 'NO DATA', color: 'text-gray-500', sub: 'No records found' };
    }
    if (stats.negatif > 40) return { label: 'WASPADA', color: 'text-amber-400', sub: 'Tensi Meningkat' };
    if (stats.negatif > 30) return { label: 'TENANG', color: 'text-cyan-400', sub: 'Pola Terdeteksi' };
    return { label: 'STABIL', color: 'text-emerald-400', sub: 'Normal Pattern' };
  }, [stats]);

  return (
    <>
      <TacticalCard
      headerIcon="fa-solid fa-satellite-dish"
      headerTitle="SENTIMEN PUBLIK"
      headerSubtitle="Analisis Medsos • Deteksi Pola"
      headerExtra={
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1 hover:border-cyan-500/50 transition-colors group">
          <i className="fa-solid fa-calendar-days text-cyan-400 text-[10px] group-hover:drop-shadow-[0_0_5px_#22d3ee]" />
          <input 
            type="date" 
            value={sosmedDate}
            onChange={(e) => setSosmedDate(e.target.value)}
            className="bg-transparent text-[11px] text-gray-400 font-mono focus:outline-none [color-scheme:dark] cursor-pointer"
          />
        </div>
      }
    >
      <div className="flex flex-col items-center py-6 relative h-full">

        {isSosmedLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
            <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Donut Chart Container - Enlarged */}
        <div className="relative w-72 h-72 flex-shrink-0 mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
            {/* Definitions for gradients/glows */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Track */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" stroke="rgba(255,255,255,0.05)" 
              strokeWidth="10" 
            />

            {/* Segments Mapping */}
            {/* Positif Segment */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="10" 
              strokeDasharray={`${stats.positif * 2.513} 251.3`}
              strokeDashoffset="0"
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-80 transition-all duration-1000"
            />
            {/* Netral Segment */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="10" 
              strokeDasharray={`${stats.netral * 2.513} 251.3`}
              strokeDashoffset={`-${stats.positif * 2.513}`}
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-80 transition-all duration-1000"
            />
            {/* Negatif Segment */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="10" 
              strokeDasharray={`${stats.negatif * 2.513} 251.3`}
              strokeDashoffset={`-${(stats.positif + stats.netral) * 2.513}`}
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-80 transition-all duration-1000"
            />
          </svg>

          {/* Center HUD */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-gray-500 font-mono font-bold uppercase tracking-[0.2em] leading-none mb-1">Status</div>
            <div className={`text-[22px] ${statusInfo.color} font-black font-orbitron uppercase tracking-widest leading-none`}>
              {statusInfo.label}
            </div>
            <div className="text-[10px] text-gray-600 font-mono uppercase mt-2 border-t border-white/10 pt-1 px-4">
              {statusInfo.sub}
            </div>
          </div>
        </div>

        {/* Legend List - Bottom Grid */}
        <div className="w-full space-y-6">
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
            {[
              { label: 'Positif', value: stats.positif, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Netral', value: stats.netral, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
              { label: 'Negatif', value: stats.negatif, color: 'bg-red-500', textColor: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center group cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_10px_${item.color.replace('bg-', 'rgba(')}] group-hover:scale-125 transition-transform`} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className={`text-[18px] font-orbitron font-black ${item.textColor}`}>
                  {item.value.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 px-4">
            <div className="flex flex-col gap-2">
              <div className="text-[9px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Monitoring Sources</div>
              <div className="flex gap-4 items-center">
                <i className="fa-brands fa-tiktok text-[14px] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] hover:scale-110 transition-all cursor-pointer" title="TikTok" />
                <i className="fa-brands fa-x-twitter text-[14px] text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] hover:scale-110 transition-all cursor-pointer" title="X (Twitter)" />
                <i className="fa-brands fa-instagram text-[14px] text-pink-500 drop-shadow-[0_0_5_rgba(236,72,153,0.4)] hover:scale-110 transition-all cursor-pointer" title="Instagram" />
                <i className="fa-brands fa-facebook text-[14px] text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.4)] hover:scale-110 transition-all cursor-pointer" title="Facebook" />
                <i className="fa-brands fa-youtube text-[14px] text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.4)] hover:scale-110 transition-all cursor-pointer" title="YouTube" />
                
                <div 
                  onClick={() => setShowKeywordsList(true)}
                  className="flex items-center gap-2 ml-2 pl-4 border-l border-white/10 uppercase font-mono cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-all group/kw"
                >
                  <span className="text-[9px] text-gray-500 tracking-wider group-hover/kw:text-gray-300">Keywords:</span>
                  <span className="text-[11px] text-cyan-400 font-bold tracking-widest group-hover/kw:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{sosmedSentiment?.keyword_count || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 items-end h-full py-1">
              <div className="w-1 h-3 bg-cyan-500/20 rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-cyan-500/40 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-3 bg-cyan-500/60 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </div>
      </div>
    </TacticalCard>

    <TacticalModal
      isOpen={showKeywordsList}
      onClose={() => setShowKeywordsList(false)}
      title="Monitored Keywords"
      subtitle="Sosmed Intelligence — Real-time Keyword Discovery"
      icon="fa-fingerprint"
      width="max-w-md"
      footer={
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest px-2">
          <span>Metode: Real-time Keyword Indexing</span>
          <span className="text-cyan-500/50">Total Keywords: {sosmedSentiment?.keywords?.length || 0} Unit</span>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2 pb-4">
        {sosmedSentiment?.keywords?.length > 0 ? (
          sosmedSentiment.keywords.map((kw: string) => (
            <div 
              key={kw} 
              className="px-3 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-[10px] font-mono text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/15 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-default group/tag"
            >
              <span className="opacity-40 mr-1.5 font-black text-white/40">#</span>
              {kw}
            </div>
          ))
        ) : (
          <div className="w-full py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <i className="fa-solid fa-magnifying-glass text-gray-700 text-3xl mb-4 opacity-20"></i>
            <div className="text-gray-600 font-mono text-[10px] uppercase tracking-widest">No Keywords Detected</div>
          </div>
        )}
      </div>
    </TacticalModal>
  </>
);
};

export default PublicSentiment;
