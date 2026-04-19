import React from 'react';
import type { TrafficAccidentStats } from '../../hooks/useTrafficAccidentData';

interface AccidentStatsProps {
  stats: TrafficAccidentStats | null;
  isLoading: boolean;
}

export const AccidentStats: React.FC<AccidentStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    { label: 'TOTAL KEJADIAN', value: stats?.total || 0, icon: 'fa-car-burst', color: 'cyan' },
    { label: 'MENINGGAL DUNIA', value: stats?.fatal || 0, icon: 'fa-skull-crossbones', color: 'red' },
    { label: 'LUKA-LUKA (LL)', value: stats?.light || 0, icon: 'fa-user-injured', color: 'amber' },
    { label: 'TANPA KONDISI', value: stats?.heavy || 0, icon: 'fa-question', color: 'gray' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="relative group">
          {/* Neon Backdrop */}
          <div className={`absolute -inset-0.5 bg-${card.color}-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
          
          <div className="relative bg-[#0d121f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-5 overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <div className={`w-14 h-14 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20 flex items-center justify-center`}>
              <i className={`fa-solid ${card.icon} text-2xl text-${card.color}-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]`}></i>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{card.label}</span>
              <div className="flex items-baseline gap-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/5 animate-pulse rounded" />
                ) : (
                  <span className={`font-orbitron text-3xl font-black text-white tracking-tighter shadow-sm`}>
                    {card.value.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  );
};
