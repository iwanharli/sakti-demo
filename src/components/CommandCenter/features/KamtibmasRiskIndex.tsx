import React from 'react';
import TacticalCard from '../shared/TacticalCard';
import type { RiskScore } from '../../../types';
import Swal from 'sweetalert2';

interface KamtibmasRiskIndexProps {
  riskScores: RiskScore[];
}

const KamtibmasRiskIndex: React.FC<KamtibmasRiskIndexProps> = ({ riskScores }) => {
  const showRiskDetail = (risk: RiskScore) => {
    const data = risk.additional_data || {};
    const formattedData = Object.entries(data)
      .map(([key, val]) => `
        <div class="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
          <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">${key.replace(/_/g, ' ')}</span>
          <span class="text-[11px] font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors">${val}</span>
        </div>
      `).join('');

    Swal.fire({
      title: `<span class="font-orbitron text-gray-100 tracking-[0.2em] font-black">INDEX RISIKO KAMTIBMAS • ${risk.region_name}</span>`,
      html: `
        <div class="text-left bg-[#0a0f18] p-5 rounded-xl border border-white/10 shadow-2xl max-h-[400px] overflow-y-auto ews-scrollbar">
          <div class="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/5">
             <div class="flex-1">
               <div class="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Skor Kamtibmas</div>
               <div class="text-3xl font-orbitron font-black text-cyan-400">${risk.value}</div>
             </div>
             <div class="w-[1px] h-10 bg-white/10"></div>
             <div class="flex-1 text-right">
               <div class="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Status Laporan</div>
               <div class="text-[11px] font-black text-emerald-500 tracking-widest">VERIFIED DATA</div>
             </div>
          </div>
          <div class="space-y-1">
            ${formattedData || '<div class="text-center py-8 text-gray-600 text-[11px]">Tidak ada parameter tambahan yang terdata untuk wilayah ini.</div>'}
          </div>
        </div>
      `,
      background: '#070a12',
      color: '#fff',
      showConfirmButton: false,
      showCloseButton: true,
      width: '500px',
      customClass: {
        popup: 'border border-cyan-500/20 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]',
        closeButton: 'text-gray-500 hover:text-red-500 transition-colors focus:outline-none focus:shadow-none'
      }
    });
  };

  return (
    <TacticalCard
      headerIcon="fa-solid fa-bullseye"
      headerTitle="Index Risiko Kamtibmas"
      headerSubtitle="Prediksi Vektor • Grid Intelijen"
    >
      <div className="relative overflow-hidden py-4 -mx-4 px-4 group">
        {/* Shadow Overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#070a12] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#070a12] to-transparent z-10 pointer-events-none"></div>

        <div className="flex gap-4 ews-ticker hover:[animation-play-state:paused] w-max">
          {/* Double the array for seamless looping */}
          {[...riskScores, ...riskScores].map((risk, idx) => {
            const colorClass = risk.value >= 80 ? 'red' : risk.value >= 60 ? 'amber' : 'emerald';
            const levelText = risk.value >= 80 ? 'LEVEL 4 • KRITIS' : risk.value >= 60 ? 'LEVEL 3 • SIAGA' : 'LEVEL 2 • AMAN';
            
            return (
              <div 
                key={`${risk.region_name}-${idx}`}
                className={`min-w-[180px] p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:z-20 ${
                  colorClass === 'red' ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                  colorClass === 'amber' ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                  'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                }`}
                onClick={() => showRiskDetail(risk)}
              >
                <div className="text-[12px] text-gray-200 uppercase tracking-[0.2em] mb-2 font-black truncate px-1">{risk.region_name}</div>
                <div className={`font-orbitron text-3xl font-black mb-1 ${
                  colorClass === 'red' ? 'text-red-400' :
                  colorClass === 'amber' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {risk.value}
                </div>
                <div className={`text-[11px] font-black tracking-[0.15em] uppercase whitespace-nowrap ${
                  colorClass === 'red' ? 'text-red-500' :
                  colorClass === 'amber' ? 'text-amber-500' :
                  'text-emerald-500'
                }`}>
                  {levelText}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TacticalCard>
  );
};

export default KamtibmasRiskIndex;
