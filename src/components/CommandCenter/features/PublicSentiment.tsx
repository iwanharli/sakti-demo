import React from 'react';
import TacticalCard from '../shared/TacticalCard';

const PublicSentiment: React.FC = () => {
  return (
    <TacticalCard
      headerIcon="fa-solid fa-satellite-dish"
      headerTitle="SENTIMEN PUBLIK"
      headerSubtitle="Analisis Medsos • Deteksi Pola"
    >
      <div className="flex flex-col items-center py-6">
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

            {/* Segments Mapping: 38% Positif, 38% Netral, 24% Negatif */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="10" 
              strokeDasharray={`${38 * 2.513} 251.3`}
              strokeDashoffset="0"
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-80 transition-all duration-1000"
            />
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="10" 
              strokeDasharray={`${38 * 2.513} 251.3`}
              strokeDashoffset={`-${38 * 2.513}`}
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-80 transition-all duration-1000"
            />
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="10" 
              strokeDasharray={`${24 * 2.513} 251.3`}
              strokeDashoffset={`-${(38 + 38) * 2.513}`}
              strokeLinecap="round"
              filter="url(#glow)"
              className="opacity-80 transition-all duration-1000"
            />
          </svg>

          {/* Center HUD */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[11px] text-gray-500 font-mono font-bold uppercase tracking-[0.2em] leading-none mb-1">Status</div>
            <div className="text-[22px] text-cyan-400 font-black font-orbitron uppercase tracking-widest leading-none">STABIL</div>
            <div className="text-[10px] text-gray-600 font-mono uppercase mt-2 border-t border-white/10 pt-1 px-4">Normal Pattern</div>
          </div>
        </div>

        {/* Legend List - Bottom Grid */}
        <div className="w-full space-y-6">
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
            {[
              { label: 'Positif', value: 38, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Netral', value: 38, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
              { label: 'Negatif', value: 24, color: 'bg-red-500', textColor: 'text-red-400' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center group cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_10px_${item.color.replace('bg-', 'rgba(')}] group-hover:scale-125 transition-transform`} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className={`text-[18px] font-orbitron font-black ${item.textColor}`}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 px-4">
            <div>
              <div className="text-[9px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] mb-0.5">Vector Focus</div>
              <div className="text-[11px] text-gray-300 font-black uppercase tracking-widest">Analisis Narasi</div>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-cyan-500/20 rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-cyan-500/40 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-3 bg-cyan-500/60 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </div>
      </div>
    </TacticalCard>
  );
};

export default PublicSentiment;
