import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001/api';
    }
    // Default to the current hostname but use port 3001
    return `http://${hostname}:3001/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

interface CommodityStats {
  price_spikes: number;
  mom_inflation: number;
  active_nodes: number;
}

interface CommodityMatrix {
  commodity_code: string;
  name: string;
  price: number;
  delta_day: number;
  variation_pct: number;
  report_date: string;
}

const hetValues: Record<string, string> = {
  'beras-medium': 'Rp 10.900',
  'beras-premium': 'Rp 13.900',
  'bawang-merah': 'Rp 32.000',
  'bawang-putih-honan': 'Rp 30.000',
  'cabai-merah-besar': 'Rp 45.000',
  'cabai-rawit-merah': 'Rp 55.000',
  'daging-ayam-ras': 'Rp 35.000',
  'daging-sapi-paha-belakang': 'Rp 140.000',
  'gula-pasir-curah': 'Rp 14.500',
  'minyak-goreng-curah': 'Rp 14.000'
};

export default function CommoditiesPrice() {
  const { addToast, selectedRegion, selectedDate, selectedSource, setSelectedRegion, setSelectedDate, setSelectedSource } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  // Data States
  const [regions, setRegions] = useState<string[]>(['Nasional']);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  
  const [stats, setStats] = useState<CommodityStats | null>(null);
  const [matrix, setMatrix] = useState<CommodityMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchRegions();
    fetchDates();
  }, [selectedSource]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRegion, selectedDate, selectedSource]);

  const fetchRegions = async () => {
    try {
      const res = await fetch(`${API_BASE}/commodities/regions?source=${selectedSource}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRegions(data);
      } else {
        console.error('Expected array for regions, got:', data);
      }
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  };

  const fetchDates = async () => {
    try {
      const res = await fetch(`${API_BASE}/commodities/dates?source=${selectedSource}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAvailableDates(data);
        if (data.length > 0 && !selectedDate) {
          setSelectedDate(data[0]); // Default to latest if not set
        }
      } else {
        console.error('Expected array for dates, got:', data);
      }
    } catch (err) {
      console.error('Failed to fetch dates:', err);
    }
  };

  const fetchDashboardData = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const query = `region=${encodeURIComponent(selectedRegion)}&date=${selectedDate}&source=${selectedSource}`;
      const [statsRes, matrixRes] = await Promise.all([
        fetch(`${API_BASE}/commodities/stats?${query}`),
        fetch(`${API_BASE}/commodities/matrix?${query}`)
      ]);

      const statsData = await statsRes.json();
      const matrixData = await matrixRes.json();

      setStats(statsData);
      setMatrix(matrixData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      addToast('Gagal memuat data pasar', 'alert');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (code: string) => {
    window.location.hash = `#/${selectedSource.toLowerCase()}/${code}`;
  };

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* HEADER & FILTERS */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <i className="fa-solid fa-earth-asia text-lg"></i>
           </div>
           <div>
              <h2 className="font-orbitron font-bold text-xl text-white tracking-widest uppercase">HARGA KOMODITAS PANGAN</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-500/80 font-mono uppercase tracking-widest">Market Feed Active</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4">
          {/* DATE SELECTOR */}
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-gray-500 font-orbitron font-bold uppercase tracking-widest">Timepoint:</span>
             <div className="relative">
                <select 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#0a0f1d] border border-gray-800 text-cyan-400 text-[12px] font-orbitron font-bold py-2 px-4 pr-10 rounded-lg focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[150px] cursor-pointer"
                >
                  {availableDates.map(d => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
                  <i className="fa-solid fa-calendar-days"></i>
                </div>
             </div>
          </div>

          {/* REGION SELECTOR */}
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-gray-500 font-orbitron font-bold uppercase tracking-widest">Region:</span>
              <div className="relative">
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-[#0a0f1d] border border-gray-800 text-gray-300 text-[12px] font-orbitron font-bold py-2 px-4 pr-10 rounded-lg focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[180px] cursor-pointer"
                >
                  {regions.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </div>
          </div>

          {/* SOURCE SELECTOR */}
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-gray-500 font-orbitron font-bold uppercase tracking-widest">Source:</span>
              <div className="relative">
                <select 
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="bg-[#0a0f1d] border border-gray-800 text-amber-500 text-[12px] font-orbitron font-bold py-2 px-4 pr-10 rounded-lg focus:outline-none focus:border-cyan-500/50 appearance-none min-w-[120px] cursor-pointer"
                >
                  <option value="SP2KP">SP2KP</option>
                  <option value="PIHPS">PIHPS</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
                  <i className="fa-solid fa-database"></i>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red cursor-pointer">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Lonjakan Harga</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">
            {loading ? '...' : (Number(stats?.price_spikes || 0) === 0 ? 'Tidak ada' : stats?.price_spikes.toString().padStart(2, '0'))}
          </div>
          <div className="text-[13px] text-gray-500 italic">Komoditas kritis teridentifikasi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>

        <div className="ews-stat-card green cursor-pointer">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Harga Stabil</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-500 mb-1">
            {loading ? '...' : (matrix.length - (stats?.price_spikes || 0)).toString().padStart(2, '0')}
          </div>
          <div className="text-[13px] text-gray-500 italic">Sesuai HET Pemerintah</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-check-double"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Indeks Inflasi</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">
            {loading ? '...' : `${stats?.mom_inflation || 0}%`}
          </div>
          <div className={`text-[13px] font-bold italic ${stats?.mom_inflation && stats.mom_inflation > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats?.mom_inflation && stats.mom_inflation > 0 ? '▲' : '▼'} {Math.abs(stats?.mom_inflation || 0)}% DARI BULAN LALU (MoM)
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-scale-balanced"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer">
           <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Komoditas Terpantau</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
            {loading ? '...' : (matrix.length || 0).toString().padStart(2, '0')}
          </div>
          <div className="text-[13px] text-gray-500 italic">Total entitas komoditas dalam pengawasan</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-shop"></i>
          </div>
        </div>
      </div>

      {/* ALERT HARGA & MATRIKS KERAWANAN - TACTICAL INTELLIGENCE SECTION */}
      <div className="rounded-2xl relative overflow-hidden mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
           {/* CRITICAL ALERT */}
           {(() => {
               const criticalItems = matrix.filter(item => item.variation_pct > 5);
               const count = criticalItems.length;

               return (
                 <div className={`bg-[#1a1012] border ${count > 0 ? 'border-red-900/30' : 'border-emerald-900/10'} rounded-2xl p-6 relative group hover:border-red-500/30 transition-all cursor-pointer`}>
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${count > 0 ? 'bg-red-500' : 'bg-emerald-500'} text-white font-black uppercase`}>
                             {count > 0 ? 'Kritis' : 'Normal'}
                          </span>
                       </div>
                    </div>
                    <h4 className={`font-bold ${count > 0 ? 'text-red-400' : 'text-emerald-500'} text-base mb-3 uppercase tracking-wider`}>
                       {count > 0 ? `${count} Lonjakan Harga Kritis` : 'Stabilitas Harga Terjaga'}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                       {count > 0 
                         ? `Terdeteksi lonjakan harga pada ${count} item: ${criticalItems.map(i => `${i.name || i.commodity_code.replace(/-/g, ' ').toUpperCase()} (+${i.variation_pct}%)`).join(', ')}. Disarankan koordinasi dengan Disperindag untuk intervensi stok.`
                         : "Tidak ditemukan anomali kenaikan harga di atas ambang batas kritis (5%). Seluruh komoditas terpantau dalam koridor fluktuasi normal."}
                    </p>
                 </div>
               );
            })()}

           {/* WARNING ALERT */}
           {(() => {
              const aboveHetItems = matrix.filter(item => {
                 const hetStr = hetValues[item.commodity_code];
                 const hetNum = hetStr ? Number(hetStr.replace(/[^\d]/g, '')) : null;
                 return hetNum && item.price > hetNum;
              });

              const count = aboveHetItems.length;

              return (
                <div className="bg-[#1a1610] border border-amber-900/30 rounded-2xl p-6 relative group hover:border-amber-500/30 transition-all cursor-pointer">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] ${count > 0 ? 'bg-amber-500' : 'bg-emerald-500'} text-black font-black uppercase`}>
                            {count > 0 ? 'Waspada' : 'Normal'}
                         </span>
                      </div>
                   </div>
                   <h4 className={`font-bold ${count > 0 ? 'text-amber-500' : 'text-emerald-500'} text-base mb-3 uppercase tracking-wider`}>
                      {count > 0 ? `${count} Komoditas Di Atas HET` : 'Harga Sesuai Regulasi'}
                   </h4>
                   <p className="text-xs text-gray-400 leading-relaxed">
                      {count > 0 
                        ? `Terdeteksi ${count} item (${aboveHetItems.map(i => i.name || i.commodity_code.replace(/-/g, ' ').toUpperCase()).join(', ')}) melampaui harga eceran tertinggi. Koordinasi dengan Satgas Pangan disarankan untuk pemantauan distribusi.`
                        : "Seluruh komoditas terpantau berada di bawah atau setara dengan ambang batas HET pemerintah. Profil pasar stabil."}
                   </p>
                </div>
              );
           })()}

           {/* INFO ALERT */}
           <div className="bg-[#0f172a]/40 border border-cyan-900/30 rounded-2xl p-6 relative group hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500 text-black font-black uppercase">Info</span>
                 </div>
              </div>
              <h4 className="font-bold text-cyan-400 text-base mb-3 uppercase tracking-wider">Operasi Pasar Dijadwalkan</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                 Bulog akan menggelar operasi pasar beras di 3 titik strategis: Pasar Metro, Pasar Cendrawasih, dan Pasar Margorejo pada Jumat, pukul 08:00 WIB.
              </p>
           </div>
        </div>
      </div>

      {/* PRICE MATRIX TABLE (FULL WIDTH) */}
      <div className="ews-card p-6 relative overflow-hidden group z-10">
        <div className="flex items-center justify-between mb-6 relative z-10 border-b border-gray-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <i className="fa-solid fa-list-check text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">
                MATRIKS HARGA KOMODITAS Utama
              </span>
              <span className="text-[11px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Data Point: {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.1em] mb-0.5">Navigation Status</div>
              <div className="text-xs font-mono text-emerald-500 font-bold uppercase">CLICK ROW FOR DETAILS</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 overflow-x-auto">
          <table className="ews-table w-full">
            <thead>
              <tr className="text-[12px] uppercase tracking-widest text-gray-500 bg-white/[0.02]">
                <th className="py-4 px-4 text-left font-black">Komoditas Utama</th>
                <th className="py-4 px-4 text-left font-black">Harga Aktual</th>
                <th className="py-4 px-4 text-left font-black">Varian 7H</th>
                <th className="py-4 px-4 text-left font-black">HET Pemerintah</th>
                <th className="py-4 px-4 text-left font-black">Status Keamanan</th>
                <th className="py-4 px-4 text-center font-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {matrix.map((item, idx) => (
                <tr 
                  key={idx} 
                  className="group/row hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
                  onClick={() => handleRowClick(item.commodity_code)}
                >
                  <td className="py-4 px-4 font-bold text-white text-sm">
                    {item.name || item.commodity_code.replace(/-/g, ' ').toUpperCase()}
                  </td>
                  <td className="py-4 px-4 group-hover:pl-6 transition-all duration-300">
                    <div className="flex flex-col">
                      <span className="font-orbitron font-bold text-white text-[15px] group-hover:text-cyan-400">
                        Rp {new Intl.NumberFormat('id-ID').format(item.price)}
                      </span>
                      {(() => {
                        const delta = Number(item.delta_day || 0);
                        if (delta === 0) {
                          return (
                            <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                               <span className="text-[8px] font-black uppercase tracking-tighter px-1 rounded bg-gray-500/20 text-gray-400">
                                 STABIL
                               </span>
                               <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">v Prev Day</span>
                            </div>
                          );
                        }
                        return (
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <span className={`text-[9px] font-black uppercase tracking-tighter px-1 rounded ${delta > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                               {delta > 0 ? '▲' : '▼'} {new Intl.NumberFormat('id-ID').format(Math.abs(delta))}
                             </span>
                             <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">v Prev Day</span>
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1.5 rounded-lg text-[13px] font-black tracking-wide ${
                      item.variation_pct > 5 ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      item.variation_pct > 2 ? 'bg-amber-500/10 text-amber-500 border border-red-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.variation_pct > 0 ? '+' : ''}{item.variation_pct}%
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-400 text-[13px]">
                    {hetValues[item.commodity_code] || '-'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                       {(() => {
                         const hetStr = hetValues[item.commodity_code];
                         const hetNum = hetStr ? Number(hetStr.replace(/[^\d]/g, '')) : null;
                         const isAboveHet = hetNum && item.price > hetNum;
                         
                         if (isAboveHet) {
                           return (
                             <>
                               <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_#dc2626] animate-pulse" />
                               <span className="text-[13px] font-black text-red-500 uppercase tracking-widest ring-1 ring-red-500/30 px-2 py-0.5 rounded bg-red-500/10">
                                 DI ATAS HET
                               </span>
                             </>
                           );
                         }

                         return (
                           <>
                             <span className={`w-2 h-2 rounded-full ${
                               item.variation_pct > 5 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                               item.variation_pct > 2 ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                               'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                             }`} />
                             <span className={`text-[13px] font-bold uppercase tracking-wider ${
                               item.variation_pct > 5 ? 'text-red-400' :
                               item.variation_pct > 2 ? 'text-amber-400' :
                               'text-emerald-400'
                             }`}>
                               {item.variation_pct > 5 ? 'KRITIS' : (item.variation_pct > 2 ? 'WASPADA' : 'NORMAL')}
                             </span>
                           </>
                         );
                       })()}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="w-8 h-8 rounded border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              <span className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest">Processing Market Data...</span>
            </div>
          )}
        </div>

        {/* MINIMAL STATUS LEGEND */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-end gap-6">
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_5px_#dc2626]"></span>
              <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Di Atas HET</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Normal: &lt; 2%</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"></span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Waspada: 2% - 5%</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kritis: &gt; 5%</span>
           </div>
        </div>
      </div>
    </div>
  );
}
