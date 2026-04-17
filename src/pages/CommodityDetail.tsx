import { useState, useEffect } from 'react';
import { useAppStore, getApiBase } from '../store/useAppStore';

const API_BASE = getApiBase();

const hetNumbers: Record<string, number> = {
  'beras-medium': 10900,
  'beras-premium': 13900,
  'bawang-merah': 32000,
  'bawang-putih-honan': 30000,
  'cabai-merah-besar': 45000,
  'cabai-rawit-merah': 55000,
  'daging-ayam-ras': 35000,
  'daging-sapi-paha-belakang': 140000,
  'gula-pasir-curah': 14500,
  'minyak-goreng-curah': 14000
};

const comparisonColors = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

interface AdditionalInfo {
  delta_harga: number;
  variant_nama: string;
  satuan_display: string;
  harga_pembanding: number;
  persen_perubahan: number;
  status_perubahan: string;
  tanggal_pembanding: string;
}

interface TrendPoint {
  report_date: string;
  price: number;
  additional_info?: AdditionalInfo;
}

interface CrosstabData {
  region_name: string;
  price: number;
  delta_harga: number;
  variation_pct: number;
}

export default function CommodityDetail({ commodityCode }: { commodityCode: string }) {
  const { selectedRegion, selectedDate, selectedSource } = useAppStore();
  const [range, setRange] = useState('7d');
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  
  // Multi-Comparison State
  const [comparisonRegions, setComparisonRegions] = useState<string[]>([]);
  const [comparisonTrends, setComparisonTrends] = useState<Record<string, TrendPoint[]>>({});

  // Crosstab State
  const [isCrosstabOpen, setIsCrosstabOpen] = useState(false);
  const [crosstabData, setCrosstabData] = useState<CrosstabData[]>([]);
  const [loadingCrosstab, setLoadingCrosstab] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTrendData();
  }, [commodityCode, selectedRegion, selectedDate, range]);

  useEffect(() => {
    // When range/date/commodity changes, we MUST refresh all comparison trends
    // because the internal data points (TrendPoint[]) are now invalid for the new range.
    setComparisonTrends({});
    
    comparisonRegions.forEach(reg => {
       fetchComparisonTrend(reg);
    });
  }, [commodityCode, selectedDate, range]);

  useEffect(() => {
    // This effect handles adding/removing regions from the comparison list
    // Sync comparison trends for all selected regions that we don't have yet
    const regionsToFetch = comparisonRegions.filter(reg => !comparisonTrends[reg]);
    
    regionsToFetch.forEach(reg => {
       fetchComparisonTrend(reg);
    });

    // Cleanup trends for regions no longer selected
    const updatedTrends = { ...comparisonTrends };
    let changed = false;
    Object.keys(updatedTrends).forEach(reg => {
       if (!comparisonRegions.includes(reg)) {
          delete updatedTrends[reg];
          changed = true;
       }
    });
    if (changed) setComparisonTrends(updatedTrends);
  }, [comparisonRegions]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const query = `region=${encodeURIComponent(selectedRegion)}&date=${selectedDate}&commodity=${commodityCode}&range=${range}&source=${selectedSource}`;
      const res = await fetch(`${API_BASE}/commodities/trend?${query}`);
      const data = await res.json();
      setTrend(data);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonTrend = async (reg: string) => {
    try {
      const query = `region=${encodeURIComponent(reg)}&date=${selectedDate}&commodity=${commodityCode}&range=${range}&source=${selectedSource}`;
      const res = await fetch(`${API_BASE}/commodities/trend?${query}`);
      const data = await res.json();
      setComparisonTrends(prev => ({ ...prev, [reg]: data }));
    } catch (err) {
      console.error(`Failed to fetch trend for ${reg}:`, err);
    }
  };

  const fetchCrosstabData = async () => {
    setLoadingCrosstab(true);
    try {
      const query = `commodity=${commodityCode}&date=${selectedDate}&source=${selectedSource}`;
      const res = await fetch(`${API_BASE}/commodities/crosstab?${query}`);
      const data = await res.json();
      setCrosstabData(data);
      setIsCrosstabOpen(true);
    } catch (err) {
      console.error('Failed to fetch crosstab data:', err);
    } finally {
      setLoadingCrosstab(false);
    }
  };

  const toggleComparison = (reg: string) => {
    if (reg === selectedRegion) return;
    setComparisonRegions(prev => 
      prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]
    );
  };

  const hetValue = hetNumbers[commodityCode];
  const allPrices = [
    ...trend.map(p => p.price),
    ...Object.values(comparisonTrends).flatMap(t => t.map(p => p.price))
  ];
  if (hetValue) allPrices.push(hetValue);

  const getPriceX = (index: number, total: number) => (index / (Math.max(1, total - 1))) * 360;
  const minPrice = allPrices.length ? Math.min(...allPrices) * 0.95 : 35000;
  const maxPrice = allPrices.length ? Math.max(...allPrices) * 1.05 : 100000;
  const priceRange = Math.max(1, maxPrice - minPrice);
  const getPriceY = (val: number) => 100 - ((val - minPrice) / priceRange) * 100;

  const createPathD = (data: TrendPoint[]) => data.reduce((acc, curr, i) => {
    const x = getPriceX(i, data.length);
    const y = getPriceY(curr.price);
    return acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
  }, "");

  const trendPathD = createPathD(trend);
  const trendAreaD = trend.length > 0 ? `${trendPathD} L360,100 L0,100 Z` : "";

  const averagePrice = trend.length > 0 
    ? Math.round(trend.reduce((sum, item) => sum + Number(item.price), 0) / trend.length) 
    : 0;

  const latestInfo = trend.length > 0 ? trend[trend.length - 1].additional_info : null;
  const unitSuffix = latestInfo?.satuan_display ? ` / ${latestInfo.satuan_display}` : '';

  const rangeButtons = [
    { id: '7d', label: '7 HARI' },
    { id: '30d', label: '30 HARI' },
    { id: '3m', label: '3 BULAN' },
    { id: '1y', label: '1 TAHUN' },
    { id: 'all', label: 'SEMUA' }
  ];

  return (
    <div className="space-y-6 ews-animate-fade-in pb-10">
      {/* PROFESSIONAL HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.hash = '#/commodities-price'}
            className="w-10 h-10 rounded-lg bg-[#0a0f1d] border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-gray-600 transition-all active:scale-95"
          >
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          
          <div className="h-8 w-px bg-gray-800" />
          
          <div>
            <h2 className="font-orbitron font-bold text-xl text-white tracking-widest uppercase">
              DATA ANALYST: <span className="text-cyan-500">{latestInfo?.variant_nama || commodityCode.replace(/-/g, ' ')}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em]">{selectedRegion}</span>
               <span className="w-1 h-1 rounded-full bg-gray-700"></span>
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Snapshot: {selectedDate || 'Global'} • {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} WIB</span>
            </div>
          </div>
        </div>

        {/* SOURCE SP2KP IDENTITY - CLEAN STYLE */}
        <div className="flex flex-col items-end leading-tight text-right">
           <span className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase mb-1">Source</span>
           <span className="font-orbitron text-4xl font-bold text-amber-500 tracking-widest uppercase">
              {selectedSource}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* REFINED TREND CHART - BALANCED STYLE */}
        <div className="bg-[#0a0f1d]/60 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col gap-4 mb-8 border-b border-gray-800/40 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#10192c] border border-gray-800 flex items-center justify-center text-cyan-500/80">
                  <i className="fa-solid fa-chart-line text-sm"></i>
                </div>
                <span className="font-orbitron font-bold text-base text-gray-200 uppercase tracking-[0.2em]">Analitik Tren Harga</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchCrosstabData}
                  disabled={loadingCrosstab}
                  className={`px-4 py-1.5 rounded-lg border font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 ${
                    isCrosstabOpen 
                      ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                  }`}
                >
                  {loadingCrosstab ? (
                    <span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <i className="fa-solid fa-table-cells"></i>
                  )}
                  {comparisonRegions.length > 0 ? `Bandingkan (${comparisonRegions.length})` : 'Bandingkan Wilayah'}
                </button>

                {/* TIMEFRAME SELECTOR */}
                <div className="flex bg-black/40 rounded-lg p-1 border border-gray-800">
                  {rangeButtons.map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setRange(btn.id)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all ${
                          range === btn.id 
                            ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {btn.label}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MULTI-REGION LEGEND - REFINED PILL DESIGN */}
            <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2.5 bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                  <span className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase">{selectedRegion}</span>
               </div>
               
               {comparisonRegions.map((reg, idx) => (
                 <div key={reg} className="flex items-center gap-2.5 bg-white/[0.04] pl-4 pr-2 py-1.5 rounded-full border border-white/10 group/legend animate-fade-in animate-slide-right transition-all hover:border-white/20">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comparisonColors[idx % comparisonColors.length], boxShadow: `0 0 8px ${comparisonColors[idx % comparisonColors.length]}80` }}></div>
                    <span className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">{reg}</span>
                    <button 
                      onClick={() => toggleComparison(reg)}
                      className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ml-1 shadow-inner"
                    >
                      <i className="fa-solid fa-xmark text-[9px]"></i>
                    </button>
                 </div>
               ))}

               {comparisonRegions.length > 0 && (
                 <button 
                  onClick={() => setComparisonRegions([])}
                  className="px-3 py-1.5 rounded-lg text-[9px] text-gray-500 font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group"
                 >
                   <i className="fa-solid fa-trash-can text-[10px] group-hover:text-red-500 transition-colors"></i>
                   Reset Analytic
                 </button>
               )}
            </div>
          </div>

          <div className="h-[470px] relative z-10 mb-6 bg-black/20 rounded-xl border border-white/5 p-4 group/chart">
            {!loading && trend.length > 1 ? (
              <>
                {/* TOOLTIP MULTI-SERIES */}
                {hoveredTrendIndex !== null && trend[hoveredTrendIndex] && (
                  <div 
                    className="absolute z-50 pointer-events-none bg-[#0a0f1d]/98 border border-gray-700 px-5 py-4 rounded-xl shadow-2xl transition-all duration-200 backdrop-blur-md min-w-[200px]"
                    style={{
                      left: hoveredTrendIndex < 2 ? '0' : (hoveredTrendIndex > trend.length - 3 ? 'auto' : `${(hoveredTrendIndex / (trend.length - 1)) * 100}%`),
                      right: hoveredTrendIndex > trend.length - 3 ? '0' : 'auto',
                      top: `20px`,
                      transform: (hoveredTrendIndex < 2 || hoveredTrendIndex > trend.length - 3) 
                        ? 'none' 
                        : `translateX(-${(hoveredTrendIndex / (trend.length - 1)) * 100}%)`
                    }}
                  >
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3 pb-2 border-b border-white/5 flex justify-between">
                      <span>{new Date(trend[hoveredTrendIndex].report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-cyan-500/50 italic">Market Feed Active</span>
                    </div>
                    
                    <div className="space-y-3.5">
                       {/* Primary Series */}
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                             <span className="text-[9px] text-cyan-500 font-black uppercase tracking-tighter">{selectedRegion}</span>
                          </div>
                          <span className="font-orbitron text-xl font-bold text-white leading-none">
                            Rp {new Intl.NumberFormat('id-ID').format(trend[hoveredTrendIndex].price)}
                          </span>
                       </div>

                       {/* Comparison Series */}
                       {comparisonRegions.map((reg, idx) => {
                         const point = comparisonTrends[reg]?.[hoveredTrendIndex];
                         if (!point) return null;
                         return (
                           <div key={reg} className="flex flex-col border-t border-white/5 pt-2.5">
                              <div className="flex items-center gap-2 mb-1">
                                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: comparisonColors[idx % comparisonColors.length] }}></div>
                                 <span className="text-[9px] font-black uppercase tracking-tighter" style={{ color: comparisonColors[idx % comparisonColors.length] }}>{reg}</span>
                              </div>
                              <span className="font-orbitron text-xl font-bold text-white leading-none">
                                Rp {new Intl.NumberFormat('id-ID').format(point.price)}
                              </span>
                           </div>
                         );
                       })}
                    </div>
                    
                    <div className="text-[8px] text-gray-700 mt-4 font-black uppercase tracking-widest border-t border-white/5 pt-2 text-center">Data Authenticated by SP2KP Authority</div>
                  </div>
                )}

                <svg viewBox="0 0 360 100" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="primaryChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12"/>
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                    </linearGradient>
                    {comparisonRegions.map((reg, idx) => (
                      <linearGradient key={`grad-${reg}`} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={comparisonColors[idx % comparisonColors.length]} stopOpacity="0.08"/>
                        <stop offset="100%" stopColor={comparisonColors[idx % comparisonColors.length]} stopOpacity="0"/>
                      </linearGradient>
                    ))}
                  </defs>
                  
                  <g stroke="rgba(255,255,255,0.02)" strokeWidth="0.12">
                    {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={y} x2="360" y2={y} />)}
                  </g>

                  {/* HET REFERENCE LINE */}
                  {hetValue && (
                    <g>
                      <line 
                        x1="0" y1={getPriceY(hetValue)} 
                        x2="360" y2={getPriceY(hetValue)} 
                        stroke="#f59e0b" 
                        strokeWidth="0.3" 
                        strokeDasharray="2 2" 
                        className="opacity-30"
                      />
                      <text 
                        x="358" y={getPriceY(hetValue) - 2} 
                        fill="#f59e0b" 
                        fontSize="2.2" 
                        fontWeight="black" 
                        textAnchor="end"
                        className="opacity-40 uppercase tracking-tighter"
                      >
                        HET: Rp {new Intl.NumberFormat('id-ID').format(hetValue)}
                      </text>
                    </g>
                  )}

                  {/* COMPARISON SERIES */}
                  {comparisonRegions.map((reg, idx) => {
                    const data = comparisonTrends[reg];
                    if (!data || data.length < 2) return null;
                    const d = createPathD(data);
                    const areaD = `${d} L360,100 L0,100 Z`;
                    const color = comparisonColors[idx % comparisonColors.length];
                    return (
                      <g key={reg} className="animate-fade-in">
                        <path d={areaD} fill={`url(#grad-${idx})`} />
                        <path d={d} fill="none" stroke={color} strokeWidth="0.3" strokeLinecap="round" className="opacity-30" />
                        {/* Comparison Dots */}
                        {data.map((p, i) => (
                          <circle 
                            key={i} 
                            cx={getPriceX(i, data.length)} 
                            cy={getPriceY(p.price)} 
                            r="0.3" 
                            fill={color} 
                            className="opacity-40"
                          />
                        ))}
                      </g>
                    );
                  })}

                  {/* PRIMARY SERIES (TOPMOST) */}
                  <path d={trendAreaD} fill="url(#primaryChartGrad)" />
                  <path d={trendPathD} fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeLinecap="round" className="opacity-70" />
                  
                  {/* Primary Dots */}
                  {trend.map((p, i) => (
                    <circle 
                      key={i} 
                      cx={getPriceX(i, trend.length)} 
                      cy={getPriceY(p.price)} 
                      r="0.5" 
                      fill="#06b6d4" 
                      className="opacity-80"
                    />
                  ))}
                  
                  {/* Interaction Rects */}
                  {trend.map((_, idx) => (
                    <g key={idx}>
                      <rect
                        x={getPriceX(idx, trend.length) - 4} y="0" width="8" height="100"
                        fill="transparent" className="cursor-pointer"
                        onMouseEnter={() => setHoveredTrendIndex(idx)}
                        onMouseLeave={() => setHoveredTrendIndex(null)}
                      />
                    </g>
                  ))}
                </svg>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                 <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                 <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">{loading ? 'Synchronizing Market Feed...' : 'Insufficient trend data for range'}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Tertinggi', value: trend.length ? Math.max(...trend.map(p => p.price)) : 0, color: 'text-amber-500' },
              { label: 'Terendah', value: trend.length ? Math.min(...trend.map(p => p.price)) : 0, color: 'text-emerald-500' },
              { label: 'Rata-rata', value: averagePrice, color: 'text-cyan-500' }
            ].map((item, idx) => (
              <div key={idx} className="bg-black/20 border border-white/5 p-6 rounded-xl flex flex-col justify-center">
                 <div className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-3 italic">{item.label}</div>
                 <div className="flex items-baseline gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap">
                    <span className="text-xs text-gray-600 font-bold uppercase tracking-tighter leading-none">Rp</span>
                    <span className={`font-orbitron font-bold text-4xl ${item.color} leading-none`}>
                       {item.value ? new Intl.NumberFormat('id-ID').format(item.value) : '--'}
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase ml-1">{unitSuffix}</span>
                 </div>
              </div>
            ))}

            <div className="bg-cyan-500/5 border border-cyan-500/10 p-6 rounded-xl flex flex-col justify-center">
               <div className="text-[11px] text-cyan-500 font-black uppercase tracking-widest mb-3 italic">Dinamika Pasar</div>
               {latestInfo ? (
                 <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                       <span className="text-[10px] text-gray-500 font-bold uppercase">Delta</span>
                       <span className={`text-xl font-bold font-mono leading-none ${(latestInfo.delta_harga || 0) > 0 ? 'text-red-500' : ((latestInfo.delta_harga || 0) < 0 ? 'text-emerald-500' : 'text-gray-400')}`}>
                          {(latestInfo.delta_harga || 0) > 0 ? '+' : ''}{new Intl.NumberFormat('id-ID').format(latestInfo.delta_harga || 0)}
                       </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                       <span className="text-[10px] text-gray-500 font-bold uppercase">Variasi</span>
                       <span className={`text-xl font-bold font-mono leading-none ${(latestInfo.persen_perubahan || 0) > 0 ? 'text-red-500' : ((latestInfo.persen_perubahan || 0) < 0 ? 'text-emerald-500' : 'text-gray-400')}`}>
                          {(latestInfo.persen_perubahan || 0) > 0 ? '+' : ''}{Number(latestInfo.persen_perubahan || 0).toFixed(2)}%
                       </span>
                    </div>
                 </div>
               ) : (
                 <div className="text-[10px] text-gray-700 italic">No Metadata Available</div>
               )}
            </div>
          </div>
        </div>

      </div>

      {/* ENHANCED CROSSTAB MODAL (MULTI-SELECT) */}
      {isCrosstabOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
           {/* Light Backdrop with subtle blur - Forced absolute coverage */}
           <div className="fixed inset-0 bg-[#020617]/70 backdrop-blur-md" onClick={() => setIsCrosstabOpen(false)} />
           
           <div className="relative w-full max-w-5xl mx-6 bg-[#0a0f1d] border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl">
                       <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <div>
                       <h3 className="font-orbitron font-black text-2xl text-white tracking-widest uppercase">Multi-Regional Analytics</h3>
                       <p className="text-xs text-indigo-500/60 font-bold uppercase tracking-widest mt-1">Select multiple provinces to overlay on the trend chart</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCrosstabOpen(false)} className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-blue-400 hover:bg-white/10 transition-all">
                    <i className="fa-solid fa-check"></i>
                 </button>
              </div>

              <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                 <div className="mb-8 flex flex-col gap-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-1">Filter Wilayah Ops</label>
                    <div className="relative">
                       <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs"></i>
                       <input 
                          type="text"
                          placeholder="Cari provinsi..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white placeholder:text-gray-700 focus:outline-none focus:border-indigo-500/50 transition-all font-orbitron tracking-widest"
                       />
                       {searchTerm && (
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                          >
                             <i className="fa-solid fa-xmark"></i>
                          </button>
                       )}
                    </div>
                 </div>

                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Wilayah Ops</th>
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Harga Aktual</th>
                          <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Selection</th>
                       </tr>
                    </thead>
                    <tbody>
                       {crosstabData
                        .filter(row => row.region_name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((row, idx) => {
                          const isSelected = comparisonRegions.includes(row.region_name);
                          const isPrimary = row.region_name === selectedRegion;
                          return (
                            <tr 
                              key={idx} 
                              onClick={() => !isPrimary && toggleComparison(row.region_name)}
                              className={`border-b border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer ${isPrimary ? 'opacity-40 grayscale cursor-not-allowed' : ''} ${isSelected ? 'bg-indigo-500/[0.05]' : ''}`}
                            >
                               <td className="py-5 px-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`}>
                                        {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                                     </div>
                                     <span className={`font-orbitron text-sm font-bold tracking-widest ${isSelected ? 'text-indigo-400' : 'text-gray-300'}`}>
                                        {row.region_name.toUpperCase()}
                                     </span>
                                     {isPrimary && <span className="text-[8px] bg-cyan-500/10 text-cyan-500 px-1.5 py-0.5 rounded font-black tracking-widest">ACTIVE</span>}
                                  </div>
                               </td>
                               <td className="py-5 px-6 text-right">
                                  <div className="flex flex-col items-end">
                                     <span className="font-orbitron font-bold text-white">Rp {new Intl.NumberFormat('id-ID').format(row.price)}</span>
                                     <span className="text-[9px] text-gray-600 font-bold uppercase">{latestInfo?.satuan_display || 'unit'}</span>
                                  </div>
                               </td>
                               <td className="py-5 px-6 text-right">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-indigo-500' : 'text-gray-700'}`}>
                                     {isSelected ? 'Aggregated' : 'Not Selected'}
                                  </span>
                               </td>
                            </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>

              <div className="p-6 bg-indigo-500/5 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[9px] text-indigo-400 font-black uppercase tracking-widest">
                    <i className="fa-solid fa-circle-info"></i>
                    Click any row to toggle synchronization. Multiple regions are supported.
                 </div>
                 <button 
                  onClick={() => setIsCrosstabOpen(false)}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-orbitron font-black text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                 >
                   APPLY SELECTION
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
