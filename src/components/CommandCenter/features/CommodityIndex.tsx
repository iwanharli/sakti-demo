import React, { useMemo } from 'react';
import TacticalCard from '../shared/TacticalCard';
import CountUp from '../../CountUp';

interface CommodityIndexProps {
  commodityMatrix: any[];
  isCommodityLoading: boolean;
  foodRiskData: any[];
  foodRegion: string;
  setFoodRegion: (region: string) => void;
}

export const CommodityIndex: React.FC<CommodityIndexProps> = ({ 
  commodityMatrix, 
  isCommodityLoading, 
  foodRiskData,
  foodRegion,
  setFoodRegion
}) => {
  // Extract available regions from foodRiskData
  const regions = useMemo(() => {
    const list = foodRiskData.map(d => d.region_name);
    const unique = Array.from(new Set(list)).sort();
    // Prioritize Nasional
    return ['Nasional', ...unique.filter(u => u !== 'Nasional')];
  }, [foodRiskData]);

  // Official Risk Index from Database (category: skor-pangan-agregasi)
  const riskIndex = useMemo(() => {
    if (!foodRiskData || foodRiskData.length === 0) return 19.0;
    const selectedData = foodRiskData.find(d => d.region_name === foodRegion) || foodRiskData[0];
    return Number(selectedData?.value || 19.0);
  }, [foodRiskData, foodRegion]);

  const riskLevel = riskIndex > 25 ? 'TINGGI' : riskIndex > 15 ? 'SEDANG' : 'RENDAH';
  const riskColor = riskIndex > 25 ? 'red' : riskIndex > 15 ? 'amber' : 'emerald';

  const topCommodities = useMemo(() => {
    return [...commodityMatrix]
      .sort((a, b) => Math.abs(Number(b.variation_pct)) - Math.abs(Number(a.variation_pct)))
      .slice(0, 8);
  }, [commodityMatrix]);

  if (isCommodityLoading && commodityMatrix.length === 0) {
    return (
      <TacticalCard headerTitle="RISIKO PANGAN" headerIcon="fa-solid fa-wheat-awn">
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin text-cyan-500 text-2xl">
            <i className="fa-solid fa-circle-notch"></i>
          </div>
        </div>
      </TacticalCard>
    );
  }

  return (
    <TacticalCard
      headerIcon="fa-solid fa-wheat-awn"
      headerTitle="RISIKO PANGAN"
      headerSubtitle="Analisis Kerawanan Pangan"
      headerExtra={
        <div className="relative group/select">
          <select 
            className="appearance-none bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer outline-none hover:border-cyan-500/30 hover:text-cyan-400 transition-all pr-8 w-40"
            value={foodRegion}
            onChange={(e) => setFoodRegion(e.target.value)}
          >
            {regions.map(region => (
              <option key={region} value={region}>{region.toUpperCase()}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-600 group-hover/select:text-cyan-500 transition-colors">
            <i className="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Main Score Area */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group hover:border-cyan-500/20 transition-all">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="font-orbitron text-5xl font-black text-white leading-none tracking-tighter">
                <CountUp value={riskIndex} decimals={1} />
              </div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">INDEX RISK</div>
            </div>
            
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                riskColor === 'red' ? 'bg-red-500/10 border-red-500/20' : 
                riskColor === 'amber' ? 'bg-amber-500/10 border-amber-500/20' : 
                'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                riskColor === 'red' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                riskColor === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 
                'bg-emerald-500 shadow-[0_0_8px_#10b981]'
              } animate-pulse`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{riskLevel}</span>
            </div>
          </div>
          
          {/* Subtle glow based on risk */}
          <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${
              riskColor === 'red' ? 'bg-red-500/5' : 
              riskColor === 'amber' ? 'bg-amber-500/5' : 
              'bg-emerald-500/5'
          } blur-3xl rounded-full`} />
        </div>

        {/* Commodity List */}
        <div className="space-y-4">
          <div className="flex justify-between px-4">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">KOMODITAS</span>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">DEVIASI</span>
          </div>

          <div className="max-h-[325px] overflow-y-auto overflow-x-hidden ews-scrollbar-hide pr-1 px-4">
            {topCommodities.map((item) => {
              const variation = Number(item.variation_pct || 0);
              
              return (
                <div key={item.commodity_code} className="group border-b border-white/[0.03] py-3 last:border-0 hover:bg-white/[0.01] transition-colors rounded-lg px-2 -mx-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[14px] font-black text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Base: Rp {Number(item.prev_price || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-orbitron font-bold text-white">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </div>
                      <div className={`text-[11px] font-black ${variation >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TacticalCard>
  );
};

export default CommodityIndex;
