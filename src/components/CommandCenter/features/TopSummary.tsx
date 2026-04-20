import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
interface TopSummaryProps {
  nationalKamtibmasStats: { today: number; yesterday: number; trend_pct: number } | null;
  commodityHetStats: { sp2kp: number; pihps: number } | null;
  sosmedSentiment: any | null;
  accidentStats: { total: number; trend_pct: number; latest_date?: string } | null;
  tickerItems: { text: string; icon: string; color: string }[];
}

const TopSummary: React.FC<TopSummaryProps> = ({ 
  nationalKamtibmasStats, 
  commodityHetStats,
  sosmedSentiment,
  accidentStats,
  tickerItems 
}) => {
  const { addToast } = useAppStore();

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
  };

  // Calculate negative percentage from sosmed sentiment
  const negativePct = React.useMemo(() => {
    if (!sosmedSentiment || !sosmedSentiment.stats) return 24.5; // fallback during loading
    const negativeStat = sosmedSentiment.stats.find((s: any) => 
      s.sentiment === 'Negatif' || s.sentiment?.toLowerCase().includes('negati')
    );
    return negativeStat ? negativeStat.percentage : 24.5;
  }, [sosmedSentiment]);

  return (
    <div className="space-y-4 mb-6">
      {/* News Ticker Bar - Premium Colorful Layout */}
      <div className="relative h-11 flex items-center overflow-hidden group rounded-lg border border-white/5 bg-gradient-to-r from-cyan-900/20 via-black/60 to-red-900/20 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        {/* Solid dark indicator strip for contrast */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/80 z-30" />
        
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-6 bg-[#facc15] text-black font-black text-[11px] tracking-widest shadow-[10px_0_30px_rgba(0,0,0,0.5)] select-none uppercase font-orbitron">
           <span className="flex items-center gap-2">
             <i className="fa-solid fa-satellite-dish animate-pulse"></i>
             LIVE FEED
           </span>
        </div>
        
        <div className="flex whitespace-nowrap ews-ticker py-2 pl-44">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-3 px-8 border-r border-white/10 last:border-0 group-hover:pause transition-all">
              <i className={`${item.icon} ${item.color} text-[10px] drop-shadow-[0_0_5px_currentColor]`}></i>
              <span className="text-[11px] font-bold text-gray-200 tracking-wide uppercase font-rajdhani">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Glossy top highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        
        {/* Fine-tuned gradient overlays */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#070a12] via-[#070a12]/80 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Analytical Summary Cards */}
      <div className="grid grid-cols-4 gap-5">
        {/* Kamtibmas Total */}
        <div 
          className="ews-stat-card red cursor-pointer group hover:scale-[1.02] transition-all" 
          onClick={() => handleNavigate('#/kamtibmas-management')}
        >
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Total Kejadian Kamtibmas</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">
            {nationalKamtibmasStats?.today.toLocaleString('id-ID') || '1.227'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-rajdhani font-bold">
            <span className={nationalKamtibmasStats?.trend_pct && nationalKamtibmasStats.trend_pct > 0 ? 'text-red-500' : 'text-emerald-500'}>
              <i className={`fa-solid ${nationalKamtibmasStats?.trend_pct && nationalKamtibmasStats.trend_pct > 0 ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
              {Math.abs(nationalKamtibmasStats?.trend_pct || 45.4).toFixed(2)}%
            </span>
            <span className="text-gray-500 uppercase tracking-tighter italic">vs kemarin</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-red-500 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-handcuffs"></i>
          </div>
        </div>

        {/* Commodity HET */}
        <div 
          className="ews-stat-card amber cursor-pointer group hover:scale-[1.02] transition-all"
          onClick={() => handleNavigate('#/commodities-price')}
        >
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Komoditas Diatas HET</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">
            {commodityHetStats ? (commodityHetStats.sp2kp + commodityHetStats.pihps) : '13'}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-rajdhani font-bold">
            <span className="text-amber-500">SP2KP: {commodityHetStats?.sp2kp || 9}</span>
            <span className="text-gray-700">|</span>
            <span className="text-amber-500">PIHPS: {commodityHetStats?.pihps || 4}</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-amber-500 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
        </div>

        {/* Sentiment Analysis */}
        <div 
          className="ews-stat-card red cursor-pointer group hover:scale-[1.02] transition-all"
          onClick={() => handleNavigate('#/osint')}
        >
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Sentimen Negatif</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">
            {negativePct}%
          </div>
          <div className="flex flex-col gap-1.5 font-rajdhani font-bold text-[11px]">
            {sosmedSentiment?.filtered_date && (
              <div className="text-gray-500 uppercase tracking-tighter text-[10px]">
                <i className="fa-solid fa-calendar-day mr-1 text-gray-700"></i>
                Data: {new Date(sosmedSentiment.filtered_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-red-500 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-face-frown"></i>
          </div>
        </div>

        {/* Accident Data */}
        <div 
          className="ews-stat-card cyan cursor-pointer group hover:scale-[1.02] transition-all"
          onClick={() => handleNavigate('#/traffic-accident-mitigation')}
        >
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Data Kecelakaan</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
            {accidentStats?.total.toLocaleString('id-ID') || '42'}
          </div>
          <div className="flex flex-col gap-1 text-[11px] font-rajdhani font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className={accidentStats?.trend_pct && accidentStats.trend_pct > 0 ? 'text-red-400' : 'text-emerald-400'}>
                <i className={`fa-solid ${accidentStats?.trend_pct && accidentStats.trend_pct > 0 ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                {Math.abs(accidentStats?.trend_pct || 0).toFixed(1)}%
              </span>
              <span className="text-gray-500 italic">7 hari terakhir</span>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-cyan-400 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-truck-medical"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSummary;
