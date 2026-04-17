import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

import { riskMatrix, crowdMonitoring, vitalObjects, utilities, recommendations } from '../data/mockSecurityMitigation';

export default function SecurityMitigation() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/25';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-red-500 bg-red-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <i className="fa-solid fa-user-shield text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Analisis strategi pencegahan kriminalitas berdasarkan tren titik rawan, rasio personel dilapangan, dan protokol respons cepat mitigasi kejahatan wilayah.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Source</span>
              <span className="font-orbitron text-lg font-bold text-red-500">INTELKAM</span>
            </div>
          </div>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail indeks risiko wilayah', 'alert')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Indeks Risiko Wilayah</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">62</div>
          <div className="text-[13px] text-amber-500 font-black italic uppercase">● SEDANG TINGGI</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-biohazard"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail kerumunan massa', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Crowd Monitoring</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">03</div>
          <div className="text-[13px] text-gray-500 italic">Terdeteksi • 1 Berpotensi Eskalasi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail pos pengamanan', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Pos Pengamanan (PAM)</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-500 mb-1">14</div>
          <div className="text-[13px] text-gray-500 italic">Status: Aktif & Terkendali</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-building-shield"></i>
          </div>
        </div>

        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail laporan masyarakat', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Laporan Publik (Sakti-App)</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">23</div>
          <div className="text-[13px] text-red-400 font-bold italic uppercase">5 Pending Review</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-purple-400">
            <i className="fa-solid fa-radio"></i>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {/* RISK MATRIX TABLE */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <i className="fa-solid fa-map-location-dot text-lg"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">MATRIKS RISIKO PER KECAMATAN</span>
                <span className="text-[11px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Regional Threat Assessment Matrix</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="ews-table w-full">
              <thead>
                <tr className="text-[12px] uppercase tracking-widest text-gray-500 bg-white/[0.02]">
                  <th className="py-3 px-3 text-left">Wilayah</th>
                  <th className="py-3 px-3 text-left">Skor IRS</th>
                  <th className="py-3 px-3 text-left">Level</th>
                  <th className="py-3 px-3 text-left">Ancaman Dominan</th>
                  <th className="py-3 px-3 text-left">7H</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/20">
                {riskMatrix.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className="group/row hover:bg-white/[0.02] cursor-pointer transition-all"
                    onClick={() => addToast(`Detail risiko wilayah: ${item.kecamatan}`, 'info')}
                  >
                    <td className="py-3 px-3 font-bold text-white text-[14px]">{item.kecamatan}</td>
                    <td className={`py-3 px-3 font-orbitron font-bold text-[16px] ${
                      item.levelColor === 'red' ? 'text-red-500' :
                      item.levelColor === 'amber' ? 'text-amber-500' :
                      'text-cyan-400'
                    }`}>
                      {item.score}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-black border ${
                        item.levelColor === 'red' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        item.levelColor === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                      }`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[12px] text-gray-400 font-medium">{item.threats}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold ${
                        item.trendColor === 'red' ? 'text-red-500' :
                        item.trendColor === 'amber' ? 'text-amber-500' :
                        'text-emerald-400'
                      }`}>
                        {item.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CROWD MONITORING FEED */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <i className="fa-solid fa-users-viewfinder text-lg"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">PANTAUAN KERUMUNAN REAL-TIME</span>
                <span className="text-[11px] text-amber-500/60 font-mono uppercase tracking-[0.2em]">Active Gathering Sensing</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">UPDATED: JUST NOW</span>
          </div>

          <div className="space-y-4 relative z-10">
            {crowdMonitoring.map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border-l-[3px] cursor-pointer transition-all duration-300 hover:bg-white/[0.02] ${
                  item.statusColor === 'red' ? 'bg-red-500/5 border-red-500/40' :
                  item.statusColor === 'amber' ? 'bg-amber-500/5 border-amber-500/40' :
                  'bg-emerald-500/5 border-emerald-500/40'
                }`}
                onClick={() => addToast(`Detail monitoring: ${item.title}`, item.statusColor === 'red' ? 'alert' : 'info')}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-black text-[15px] text-white tracking-wide uppercase">{item.title}</div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-widest ${
                    item.statusColor === 'red' ? 'bg-red-500 text-white shadow-[0_0_10px_#ef4444]' :
                    item.statusColor === 'amber' ? 'bg-amber-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-[13px] text-gray-400 leading-relaxed font-medium mb-3">{item.desc}</div>
                <div className="flex gap-2">
                  {item.tags.map((tag, tidx) => (
                    <span key={tidx} className="px-2 py-0.5 rounded bg-gray-900/50 border border-gray-800 text-[11px] text-gray-400 font-black tracking-tighter uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ANALYSIS GRID */}
      <div className="grid grid-cols-3 gap-6 relative z-10">
        {/* VITAL OBJECTS STATUS */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-building-shield text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">OBVITNAS MONITORING</span>
              <span className="text-[11px] text-emerald-500/60 font-mono uppercase tracking-[0.2em]">National Vital Assets</span>
            </div>
          </div>
          <div className="space-y-3 relative z-10">
            {vitalObjects.map((obj, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-gray-800 transition-all hover:bg-white/[0.05]"
              >
                <div>
                  <div className="text-[15px] font-black text-white uppercase tracking-wide">{obj.name}</div>
                  <div className="text-[12px] text-gray-500 font-mono uppercase">{obj.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    obj.status === 'safe' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                    obj.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 
                    'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  }`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${
                    obj.status === 'safe' ? 'text-emerald-400' :
                    obj.status === 'warning' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {obj.status === 'safe' ? 'Secure' : obj.status === 'warning' ? 'Caution' : 'Threat'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PUBLIC UTILITIES OVERLAY */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-bolt-lightning text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">UTILITAS & LOGISTIK</span>
              <span className="text-[11px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Supply Chain Integrity</span>
            </div>
          </div>
          <div className="space-y-5 relative z-10">
            {utilities.map((util, idx) => (
              <div key={idx} className="group/util">
                <div className="flex justify-between text-[14px] mb-2">
                  <span className="text-gray-400 font-black uppercase tracking-wider">{util.name}</span>
                  <span className={`font-orbitron font-bold text-[15px] ${
                    util.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {util.value}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-900/80 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out relative ${
                      util.color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                    }`}
                    style={{ width: `${util.value}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI STRATEGIC BRIEFING */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="w-10 h-10 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <i className="fa-solid fa-brain text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[18px] text-gray-100 uppercase tracking-wider block">REKOMENDASI MITIGASI AI</span>
              <span className="text-[11px] text-purple-500/60 font-mono uppercase tracking-[0.2em]">Strategic Neural Advisory</span>
            </div>
          </div>
          <div className="space-y-3 relative z-10">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border transition-all duration-300 hover:bg-white/[0.04] cursor-pointer ${
                  rec.color === 'red' ? 'bg-red-500/5 border-red-500/20' :
                  rec.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' :
                  rec.color === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/20' :
                  'bg-emerald-500/5 border-emerald-500/20'
                }`}
                onClick={() => addToast(`Detail rekomendasi: ${rec.title}`, 'info')}
              >
                <div className={`text-[11px] font-black mb-2 p-1 px-2 rounded inline-block tracking-widest ${
                  rec.color === 'red' ? 'bg-red-500/20 text-red-500' :
                  rec.color === 'amber' ? 'bg-amber-500/20 text-amber-500' :
                  rec.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {rec.title}
                </div>
                <div className="text-[14px] text-gray-300 leading-relaxed font-medium">
                  {rec.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
