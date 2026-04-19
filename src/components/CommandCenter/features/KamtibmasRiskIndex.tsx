import React, { useState, useMemo } from 'react';
import TacticalCard from '../shared/TacticalCard';
import TacticalModal from '../shared/TacticalModal';
import type { RiskScore } from '../../../types';

interface KamtibmasRiskIndexProps {
  riskScores: RiskScore[];
}

const KamtibmasRiskIndex: React.FC<KamtibmasRiskIndexProps> = ({ riskScores }) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskScore | null>(null);

  const topRiskScores = useMemo(() => 
    [...riskScores].sort((a, b) => b.value - a.value).slice(0, 5),
    [riskScores]
  );

  const renderRiskDetail = (risk: RiskScore) => {
    const data = risk.additional_data || {};
    const colorClass = risk.value >= 80 ? 'red' : risk.value >= 60 ? 'amber' : 'emerald';
    const statusText = risk.value >= 80 ? 'KRITIS' : risk.value >= 60 ? 'SIAGA' : 'AMAN';

    // Parse Case Detail
    const caseDetailRaw = data['case_detail'] || data['CASE DETAIL'];
    let caseDetail: any = null;
    if (caseDetailRaw) {
      try {
        caseDetail = typeof caseDetailRaw === 'string' ? JSON.parse(caseDetailRaw) : caseDetailRaw;
      } catch (e) { console.error("Parse Error", e); }
    }

    const categories = [
      { id: 'kejahatan_total', label: 'Kejahatan', icon: 'fa-solid fa-handcuffs', color: 'text-red-400' },
      { id: 'gangguan_total', label: 'Gangguan', icon: 'fa-solid fa-triangle-exclamation', color: 'text-amber-400' },
      { id: 'bencana_total', label: 'Bencana', icon: 'fa-solid fa-house-flood-water', color: 'text-blue-400' },
      { id: 'pelanggaran_total', label: 'Pelanggaran', icon: 'fa-solid fa-scale-unbalanced', color: 'text-cyan-400' },
    ];

    const ignoredKeys = ['CASE DETAIL', 'case_detail', 'REGION NAME', 'REGION CODE', 'DENSITY FACTOR', 'Region Name', 'Region Code', 'Density Factor'];

    return (
      <div className="text-left p-1">
        {/* Top Header Label */}
        <div className="flex items-center gap-3 justify-between w-full px-1 mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colorClass === 'red' ? 'bg-red-500 animate-pulse' : colorClass === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            <span className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.3em]">ANALYSIS</span>
          </div>
          <span className="font-orbitron text-[13px] text-gray-200 tracking-[0.2em] font-black uppercase">{risk.region_name}</span>
        </div>

        <div className="grid grid-cols-5 gap-8">
          {/* Left Column: Summary & HUD */}
          <div className="col-span-2 space-y-6">
            <div className="relative p-6 bg-gradient-to-br from-white/[0.04] to-transparent rounded-2xl border border-white/[0.05] overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/40"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/40"></div>
              
              <div className="flex flex-col gap-4 relative z-10">
                <div>
                  <div className="text-[9px] text-cyan-500/60 font-mono uppercase tracking-[0.3em] mb-1">Index Score</div>
                  <div className="text-6xl font-orbitron font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    {risk.value}<span className="text-lg text-gray-600 font-mono ml-1">%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-2 px-3 rounded-lg border border-white/5">
                  <div className="text-[8px] text-gray-600 uppercase font-black tracking-widest">Sector Status</div>
                  <div className={`px-2.5 py-1 bg-white/5 border border-white/10 rounded font-black text-[9px] tracking-widest ${
                    colorClass === 'red' ? 'text-red-500 border-red-500/30' :
                    colorClass === 'amber' ? 'text-amber-500 border-amber-500/30' :
                    'text-emerald-500 border-emerald-500/30'
                  }`}>
                    {statusText}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${
                    colorClass === 'red' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                    colorClass === 'amber' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                    'bg-emerald-500 shadow-[0_0_10px_#10b981]'
                  }`} 
                  style={{ width: `${risk.value}%` }}
                ></div>
              </div>
            </div>

            {/* Density Factor or other small stat */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <i className="fa-solid fa-users text-[10px] text-cyan-400"></i>
                </div>
                <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Population Density</div>
              </div>
              <div className="text-[13px] font-orbitron font-bold text-gray-300">{(data['DENSITY FACTOR'] || data['Density Factor'] || 0).toLocaleString()}</div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-span-3 space-y-6">
            {caseDetail && (
              <div>
                <div className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em] mb-4 flex items-center gap-2 px-1">
                  <span className="w-1.5 h-[1.5px] bg-cyan-500"></span>
                  Breakdown Kategori
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(cat => {
                    const catData = caseDetail[cat.id]?.[0] || {};
                    const val = catData.abs_n || 0;
                    const score = catData.skor_kategori || 0;
                    return (
                      <div key={cat.id} className="bg-white/5 border border-white/5 backdrop-blur-xl rounded-xl p-3 px-4 hover:border-white/10 hover:bg-white/[0.07] transition-all cursor-default group/cat">
                        <div className="flex items-center justify-between mb-2">
                          <i className={`${cat.icon} ${cat.color} text-[11px]`}></i>
                          <div className="text-[8px] text-gray-600 font-mono tracking-widest uppercase opacity-60">KPI: {score.toFixed(0)}</div>
                        </div>
                        <div className="text-xl font-orbitron font-black text-white">{val}</div>
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">{cat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em] mb-4 flex items-center gap-2 px-1">
                 <span className="w-1.5 h-[1.5px] bg-cyan-500"></span>
                 Vektor Parameter
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {Object.entries(data)
                  .filter(([key]) => !ignoredKeys.includes(key.toUpperCase()) && !ignoredKeys.includes(key))
                  .map(([key, val]) => {
                    if (typeof val === 'object') return null;
                    let displayVal = val;
                    if (key.toUpperCase().includes('POPULATION')) {
                      displayVal = Number(val).toLocaleString('id-ID');
                    }
                    return (
                      <div key={key} className="flex justify-between items-center py-2 px-3 hover:bg-white/[0.03] transition-all group rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-800 group-hover:bg-cyan-500 transition-colors"></span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-gray-400 group-hover:text-cyan-400 transition-colors">{displayVal as React.ReactNode}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <TacticalCard
        headerIcon="fa-solid fa-bullseye"
        headerTitle="Index Risiko Kamtibmas"
        headerSubtitle="5 Provinsi Tertinggi"
      >
        <div className="relative overflow-hidden py-4 -mx-4 px-4 group">
          {/* Shadow Overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#070a12] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#070a12] to-transparent z-10 pointer-events-none"></div>

          <div className="flex gap-4 ews-ticker hover:[animation-play-state:paused] w-max">
            {/* Double the array for seamless looping - only top 5 now */}
            {[...topRiskScores, ...topRiskScores].map((risk, idx) => {
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
                  onClick={() => setSelectedRisk(risk)}
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

      <TacticalModal
        isOpen={!!selectedRisk}
        onClose={() => setSelectedRisk(null)}
        title="Detail Index Kamtibmas"
        subtitle={`Vektor Analis Risiko — ${selectedRisk?.region_name}`}
        icon="fa-bullseye"
        width="max-w-4xl"
      >
        {selectedRisk && renderRiskDetail(selectedRisk)}
      </TacticalModal>
    </>
  );
};

export default KamtibmasRiskIndex;
