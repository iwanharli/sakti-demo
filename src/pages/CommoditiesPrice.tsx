import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

import { sembakoData, priceAlerts } from '../data/mockCommoditiesPrice';

export default function CommoditiesPrice() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate 30-day mock data for Chili (Cabai Merah)
  const chiliPriceHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(40000 + Math.sin(i / 5) * 15000 + i * 1500 + Math.random() * 5000),
    status: i > 22 ? 'KRITIS' : (i > 12 ? 'WASPADA' : 'NORMAL')
  }));

  const getPriceX = (index: number) => (index / 29) * 360;
  // Scale within 100 viewBox: min 40k max 100k
  const getPriceY = (val: number) => 100 - ((val - 35000) / 65000) * 100;

  const pathD = chiliPriceHistory.reduce((acc, curr, i) => {
    return acc + (i === 0 ? `M${getPriceX(i)},${getPriceY(curr.value)}` : ` L${getPriceX(i)},${getPriceY(curr.value)}`);
  }, "");

  const areaD = `${pathD} L360,100 L0,100 Z`;

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-amber-500 bg-amber-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <i className="fa-solid fa-basket-shopping text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Monitoring harga 9 bahan pokok secara real-time melalui integrasi data PIHPS Nasional dan survei pasar digital untuk analisis stabilitas pangan wilayah.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Source</span>
              <span className="font-orbitron text-lg font-bold text-amber-500">DISPERINDAG</span>
            </div>
          </div>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail komoditas naik', 'alert')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Lonjakan Harga</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">04</div>
          <div className="text-[13px] text-gray-500 italic">Komoditas kritis teridentifikasi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail komoditas stabil', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Harga Stabil</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-500 mb-1">05</div>
          <div className="text-[13px] text-gray-500 italic">Sesuai HET Pemerintah</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-check-double"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail inflasi', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Indeks Inflasi</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">1.8%</div>
          <div className="text-[13px] text-red-400 font-bold italic">▲ 0.3% DARI BULAN LALU</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-scale-balanced"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail pasar dipantau', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Pasar Terhubung</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">09</div>
          <div className="text-[13px] text-gray-500 italic">Sensing Node Aktif</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-shop"></i>
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
              <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">MATRIKS HARGA 9 BAHAN POKOK</span>
              <span className="text-[11px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Daily Market Stabilization Monitoring</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.1em] mb-0.5">Last Sync</div>
              <div className="text-xs font-mono text-gray-300 font-bold">14:00:22 WIB</div>
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
              {sembakoData.map((item, idx) => (
                <tr 
                  key={idx} 
                  className="group/row hover:bg-white/[0.02] transition-all duration-200 cursor-pointer"
                  onClick={() => addToast(`Detail harga: ${item.name}`, 'info')}
                >
                  <td className="py-4 px-4 font-bold text-white text-sm">
                    {item.name}
                  </td>
                  <td className="py-4 px-4 font-orbitron font-bold text-cyan-400 text-base">{item.price}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1.5 rounded-lg text-[13px] font-black tracking-wide ${
                      item.changeColor === 'red' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      item.changeColor === 'amber' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.change}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-400 text-[13px]">{item.het}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${
                        item.statusColor === 'red' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                        item.statusColor === 'amber' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                        'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      }`} />
                      <span className={`text-[13px] font-bold uppercase tracking-wider ${
                        item.statusColor === 'red' ? 'text-red-400' :
                        item.statusColor === 'amber' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {item.status}
                      </span>
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
        </div>
      </div>

      {/* 30-DAY TREND ANALYTICS (FULL WIDTH) */}
      <div className="ews-card p-6 relative overflow-hidden group z-10">
        <div className="flex items-center justify-between mb-8 relative z-10 border-b border-gray-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <i className="fa-solid fa-chart-line text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">TREN HARGA CABAI MERAH (30 HARI)</span>
              <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em]">Volatility & Supply Analytics</span>
            </div>
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
              ACTUAL MARKET PRICE
            </div>
          </div>
        </div>

        <div className="h-64 relative z-10 mb-6 bg-black/20 rounded-lg border border-white/5 p-4 group/chart">
          {/* Tooltip Overlay */}
          {hoveredTrendIndex !== null && (
            <div 
              className="absolute z-50 pointer-events-none bg-[#0a0f1d]/90 border border-red-500/50 backdrop-blur-md p-3 rounded shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-200"
              style={{
                left: `${getPriceX(hoveredTrendIndex)}px`,
                top: `${getPriceY(chiliPriceHistory[hoveredTrendIndex].value) - 60}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="text-[10px] text-red-500 font-mono uppercase tracking-widest mb-1">
                Day {chiliPriceHistory[hoveredTrendIndex].day} • PRICE POINT
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] text-gray-500">Rp</span>
                <span className="font-orbitron text-xl font-bold text-white">
                  {new Intl.NumberFormat('id-ID').format(chiliPriceHistory[hoveredTrendIndex].value)}
                </span>
              </div>
              <div className={`text-[9px] mt-1 font-black px-1.5 py-0.5 rounded inline-block uppercase ${
                chiliPriceHistory[hoveredTrendIndex].status === 'KRITIS' ? 'bg-red-500/20 text-red-500' : 
                chiliPriceHistory[hoveredTrendIndex].status === 'WASPADA' ? 'bg-amber-500/20 text-amber-500' :
                'bg-emerald-500/20 text-emerald-500'
              }`}>
                {chiliPriceHistory[hoveredTrendIndex].status}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0f1d] border-r border-b border-red-500/50 rotate-45"></div>
            </div>
          )}

          <svg viewBox="0 0 360 100" className="w-full h-full" preserveAspectRatio="none">
             {/* Background Grid */}
            <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5">
              {[0, 20, 40, 60, 80, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="360" y2={y} />
              ))}
              {[0, 60, 120, 180, 240, 300, 360].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" />
              ))}
            </g>

            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#priceGrad)" className="transition-all duration-500" />
            <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" className="opacity-80 transition-all duration-500" />
            
             {/* 30 Data Points */}
             {chiliPriceHistory.map((pt, idx) => (
              <g key={idx}>
                <circle 
                  cx={getPriceX(idx)} 
                  cy={getPriceY(pt.value)} 
                  r={hoveredTrendIndex === idx ? "3" : "1.5"} 
                  fill={hoveredTrendIndex === idx ? "#fff" : "#ef4444"} 
                  className="transition-all duration-200"
                />
                <rect
                  x={getPriceX(idx) - 6}
                  y="0"
                  width="12"
                  height="100"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTrendIndex(idx)}
                  onMouseLeave={() => setHoveredTrendIndex(null)}
                />
              </g>
            ))}
          </svg>
          
          <div className="flex justify-between mt-4 px-1 text-[11px] font-mono text-gray-600 uppercase font-bold tracking-tighter">
            <span>30 DAYS AGO</span>
            <span>CURRENT TREND</span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-500/5 border border-red-500/15 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="text-[14px] text-gray-400 leading-relaxed font-medium">
            📌 <span className="text-red-400 font-bold">ANALISIS RISIKO:</span> Penyebab utama kenaikan harga adalah gagal panen akibat cuaca ekstrem di sentra produksi + distribusi terganggu banjir ruas Jl. Lintas Timur. Tingkat kerawanan gangguan pasar: <span className="text-red-500 font-black">MODERAT TINGGI</span>.
          </div>
        </div>
      </div>

      {/* PRICE ALERTS & RISK MATRIX */}
      <div className="ews-card p-6 relative overflow-hidden group z-10">
        <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
          <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <i className="fa-solid fa-bell-concierge text-lg"></i>
          </div>
          <div>
            <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">ALERT HARGA & MATRIKS KERAWANAN</span>
            <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em]">Socio-Economic Threat Detection</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {priceAlerts.map((alert, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-xl border flex flex-col transition-all duration-300 hover:bg-white/[0.02] cursor-pointer ${
                alert.color === 'red' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' :
                alert.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' :
                'bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40'
              }`}
              onClick={() => addToast(`Detail alert: ${alert.title}`, alert.color === 'red' ? 'alert' : 'info')}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded text-[12px] font-black tracking-widest border ${
                  alert.color === 'red' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                  alert.color === 'amber' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                  'bg-cyan-500/20 text-cyan-500 border-cyan-500/30'
                }`}>
                  {alert.level}
                </span>
                <span className="text-[12px] text-gray-600 font-mono uppercase">Node: TRAD-0{idx+1}</span>
              </div>
              <div className={`text-[16px] font-black mb-3 tracking-wide uppercase leading-snug ${
                alert.color === 'red' ? 'text-red-400' :
                alert.color === 'amber' ? 'text-amber-400' :
                'text-cyan-400'
              }`}>
                {alert.title}
              </div>
              <div className="text-[14px] text-gray-400 leading-relaxed font-medium line-clamp-4">
                {alert.desc}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-800/20 flex items-center justify-between opacity-50 text-[12px] font-mono">
                <span>ACTION REQUIRED</span>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
