import React from 'react';
import type { TrafficAccidentStats } from '../../hooks/useTrafficAccidentData';

interface AccidentStatsProps {
  stats: TrafficAccidentStats | null;
  isLoading: boolean;
}

export const AccidentStats: React.FC<AccidentStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    { 
      label: 'Total Kejadian', 
      value: stats?.total || 0, 
      icon: 'fa-truck-medical', 
      color: 'cyan',
      subtext: 'Insiden Terdeteksi' 
    },
    { 
      label: 'Meninggal Dunia', 
      value: stats?.fatal || 0, 
      icon: 'fa-skull-crossbones', 
      color: 'red',
      subtext: 'Korban Fatalitas' 
    },
    { 
      label: 'Luka Berat', 
      value: stats?.heavy || 0, 
      icon: 'fa-ambulance', 
      color: 'amber',
      subtext: 'Penanganan Intensif' 
    },
    { 
      label: 'Luka Ringan', 
      value: stats?.light || 0, 
      icon: 'fa-user-injured', 
      color: 'emerald',
      subtext: 'Bantuan Medis Dasar' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div key={idx} className={`ews-stat-card ${card.color} group relative overflow-hidden`}>
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">{card.label}</div>
          
          <div className={`font-orbitron text-4xl font-bold mb-1 ${
            card.color === 'cyan' ? 'text-cyan-400' :
            card.color === 'red' ? 'text-red-500' :
            card.color === 'amber' ? 'text-amber-500' :
            'text-emerald-500'
          }`}>
            {isLoading ? (
              <div className="h-10 w-24 bg-white/5 animate-pulse rounded" />
            ) : (
              card.value.toLocaleString('id-ID')
            )}
          </div>

          <div className={`flex items-center gap-1.5 text-[11px] font-rajdhani font-bold uppercase tracking-widest ${
            card.color === 'cyan' ? 'text-cyan-500/80' :
            card.color === 'red' ? 'text-red-500/80' :
            card.color === 'amber' ? 'text-amber-500/80' :
            'text-emerald-500/80'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              card.color === 'cyan' ? 'bg-cyan-500' :
              card.color === 'red' ? 'bg-red-500' :
              card.color === 'amber' ? 'bg-amber-500' :
              'bg-emerald-500'
            }`} />
            {card.subtext}
          </div>

          <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 group-hover:opacity-20 transition-opacity ${
            card.color === 'cyan' ? 'text-cyan-400' :
            card.color === 'red' ? 'text-red-500' :
            card.color === 'amber' ? 'text-amber-500' :
            'text-emerald-500'
          }`}>
            <i className={`fa-solid ${card.icon}`}></i>
          </div>
        </div>
      ))}
    </div>
  );
};
