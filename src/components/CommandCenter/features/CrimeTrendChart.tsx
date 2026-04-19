import React from 'react';
import TacticalCard from '../shared/TacticalCard';

interface CrimeTrendChartProps {
  crimeTrendData: any[];
  hoverIdx: number | null;
  setHoverIdx: (idx: number | null) => void;
}

const CrimeTrendChart: React.FC<CrimeTrendChartProps> = ({ 
  crimeTrendData, 
  hoverIdx, 
  setHoverIdx 
}) => {
  return (
    <TacticalCard
      headerIcon="fa-solid fa-chart-area"
      headerTitle="TREN KEJAHATAN (7 HARI)"
      headerSubtitle="Data Kumulatif • Proyeksi Statistik"
      className="flex-1 active:shadow-cyan-500/5 transition-all duration-500"
    >
      <div className="flex-1 flex flex-col relative">
        <div className="bg-black/20 rounded-xl border border-white/5 pt-4 px-4 pb-1 relative group/chart min-h-[400px]">
          {/* ADVANCED ANALYTICAL TOOLTIP */}
          {hoverIdx !== null && crimeTrendData[hoverIdx] && (
            <div 
              className="absolute z-50 pointer-events-none bg-[#0a0f1d]/98 border border-gray-700 px-5 py-4 rounded-xl shadow-2xl transition-all duration-200 backdrop-blur-md min-w-[220px]"
              style={{
                left: hoverIdx < 2 ? '20px' : (hoverIdx > crimeTrendData.length - 3 ? 'auto' : `${(hoverIdx / (crimeTrendData.length - 1)) * 100}%`),
                right: hoverIdx > crimeTrendData.length - 3 ? '20px' : 'auto',
                top: `20px`,
                transform: (hoverIdx < 2 || hoverIdx > crimeTrendData.length - 3) 
                  ? 'none' 
                  : `translateX(-${(hoverIdx / (crimeTrendData.length - 1)) * 100}%)`
              }}
            >
              <div className="space-y-3">
                 {[
                   { label: 'KEJAHATAN', val: crimeTrendData[hoverIdx].kejahatan, col: 'text-amber-400', bg: 'bg-amber-400' },
                   { label: 'GANGGUAN', val: crimeTrendData[hoverIdx].gangguan, col: 'text-blue-400', bg: 'bg-blue-400' },
                   { label: 'PELANGGARAN', val: crimeTrendData[hoverIdx].pelanggaran, col: 'text-purple-400', bg: 'bg-purple-400' },
                   { label: 'BENCANA', val: crimeTrendData[hoverIdx].bencana, col: 'text-emerald-400', bg: 'bg-emerald-400' }
                 ].map(series => (
                   <div key={series.label} className="flex flex-col border-b border-white/5 last:border-0 pb-1.5 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${series.bg}`}></div>
                         <span className={`text-[9px] font-black uppercase tracking-tighter ${series.col}`}>{series.label}</span>
                      </div>
                      <span className="font-orbitron text-xl font-bold text-white leading-none">
                        {crimeTrendData[hoverIdx][series.label.toLowerCase() as keyof typeof crimeTrendData[0]]}
                      </span>
                   </div>
                 ))}
              </div>
            </div>
          )}

          <svg 
            viewBox="0 0 360 110" 
            className="w-full h-full min-h-[370px] overflow-visible"
          >
            <defs>
              <linearGradient id="primaryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
              </linearGradient>
            </defs>

            {/* Refined Analytical Grid */}
            <g stroke="rgba(255,255,255,0.02)" strokeWidth="0.2">
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="360" y2={y} />
              ))}
            </g>

            {/* Data Paths */}
            {(() => {
              const createPathD = (yKey: string) => crimeTrendData.reduce((acc, curr, i) => {
                const x = curr.x;
                const y = curr[yKey as keyof typeof curr] as number;
                return acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
              }, "");

              const pathK = createPathD('yK');
              const pathG = createPathD('yG');
              const pathP = createPathD('yP');
              const pathB = createPathD('yB');

              return (
                <>
                  <path d={`${pathK} L360,100 L0,100 Z`} fill="url(#primaryAreaGrad)" className="transition-all duration-700" />
                  <path d={pathK} fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" className="opacity-80" />
                  <path d={pathG} fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeLinecap="round" className="opacity-40" />
                  <path d={pathP} fill="none" stroke="#a855f7" strokeWidth="0.4" strokeDasharray="2 2" className="opacity-30" />
                  <path d={pathB} fill="none" stroke="#10b981" strokeWidth="0.4" strokeDasharray="2 2" className="opacity-30" />

                  {crimeTrendData.map((d, i) => (
                    <g key={i}>
                      <circle cx={d.x} cy={d.yK} r="0.8" fill="#f59e0b" className={`transition-all duration-300 ${hoverIdx === i ? 'r-[1.5]' : 'opacity-60'}`} />
                      {hoverIdx === i && (
                         <line x1={d.x} y1="0" x2={d.x} y2="105" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" strokeDasharray="1 1" />
                      )}
                    </g>
                  ))}
                </>
              );
            })()}

            {/* Day Labels */}
            <g className="text-[5px] font-orbitron font-bold">
              {crimeTrendData.map((d, i) => (
                <text key={i} x={d.x} y="116" fill={hoverIdx === i ? '#fff' : 'rgba(148, 163, 184, 0.4)'} textAnchor="middle" className="tracking-widest transition-all">
                  {d.day}
                </text>
              ))}
            </g>

            {/* Interaction Rects */}
            {crimeTrendData.map((d, i) => (
              <rect
                key={i}
                x={d.x - 10} y="0" width="20" height="120"
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              />
            ))}
          </svg>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-3 mt-2 px-4 justify-center">
          {[
            { label: 'Kejahatan', color: 'bg-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]' },
            { label: 'Gangguan', color: 'bg-blue-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
            { label: 'Pelanggaran', color: 'bg-purple-500', glow: '' },
            { label: 'Bencana', color: 'bg-emerald-500', glow: '' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3.5 group cursor-pointer">
              <div className={`w-3 h-3 rounded-full ${item.color} ${item.glow} group-hover:scale-125 transition-all outline outline-offset-2 outline-transparent group-hover:outline-white/10`} />
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.25em] group-hover:text-gray-100 transition-colors">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </TacticalCard>
  );
};

export default CrimeTrendChart;
