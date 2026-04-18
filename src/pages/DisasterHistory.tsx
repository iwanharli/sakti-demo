import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

import { bencanaAlerts, resources, emergencyContacts, vulnerabilityIndex } from '../data/mockDisasterMitigation';

export default function DisasterHistory() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getResourceStatusClass = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-red-500 bg-red-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <i className="fa-solid fa-house-flood-water text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Sinkronisasi data sensor lapangan IoT dan feed BMKG untuk deteksi dini bencana alam, monitoring ketinggian air, serta manajemen evakuasi kedaulatan secara real-time.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Source</span>
              <span className="font-orbitron text-lg font-bold text-red-500">BMKG</span>
            </div>
          </div>
        </div>
      </div>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail potensi bencana aktif', 'alert')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Potensi Bencana Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">02</div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-red-400 uppercase font-black">▲ CRITICAL</span>
            <span className="text-gray-500 italic">Banjir & Longsor</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail status siaga', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Status Siaga</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">III</div>
          <div className="text-[13px] text-amber-500 italic">Waspada — Curah Hujan Tinggi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-cloud-showers-heavy"></i>
          </div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail posko siaga', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Posko Siaga Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">08</div>
          <div className="text-[13px] text-gray-500 italic">8 dari 12 Unit Terpantau</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-house-medical"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail personel standby', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Personel Gabungan</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">124</div>
          <div className="text-[13px] text-gray-500 italic">BPBD · TNI · POLRI · PMI</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-users-gear"></i>
          </div>
        </div>
      </div>

      {/* TACTICAL DISASTER MAP - FULL WIDTH */}
      <div className="ews-card p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent h-1 w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <i className="fa-solid fa-map-location-dot text-xl"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">PETA MONITORING KERAWANAN REAL-TIME</span>
              <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Sensor Grid • Intelligence Matrix
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Active Alerts</div>
              <div className="text-[18px] font-orbitron text-red-500 font-bold">02 ZONES</div>
            </div>
            <div className="w-px h-10 bg-gray-800" />
            <span className="ews-live-badge red">
              <span className="ews-live-dot" />
              BMKG SAT-EL
            </span>
          </div>
        </div>

        <div className="relative h-[560px] bg-gradient-to-b from-[#0d1f35] to-[#070a12] rounded-xl overflow-hidden border border-gray-800/50">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          
          {/* Roads & Vectors */}
          <div className="absolute left-0 right-0 top-[30%] h-px bg-cyan-500/20" />
          <div className="absolute left-0 right-0 top-[65%] h-px bg-cyan-500/20" />
          <div className="absolute left-[30%] top-0 bottom-0 w-px bg-cyan-500/20" />
          <div className="absolute left-[75%] top-0 bottom-0 w-px bg-cyan-500/20" />

          {/* Interactive Heatzones */}
          <div className="ews-heat-zone ews-heat-red w-48 h-48 left-[25%] top-[25%]" />
          <div className="ews-heat-zone ews-heat-amber w-64 h-64 left-[60%] top-[45%] shadow-[0_0_40px_rgba(245,158,11,0.1)]" style={{ animationDelay: '1s' }} />
          <div className="ews-heat-zone ews-heat-amber w-32 h-32 left-[45%] top-[10%]" style={{ animationDelay: '0.5s' }} />

          {/* Tactical Markers */}
          <div className="ews-map-marker left-[35%] top-[35%]">
            <div className="ews-marker-dot text-red-500" />
            <div className="ews-marker-label">ZONA MERAH: KEL. REJO (BANJIR)</div>
          </div>
          
          <div className="ews-map-marker left-[72%] top-[62%]">
            <div className="ews-marker-dot text-amber-500" />
            <div className="ews-marker-label">RISIKO LONGSOR: BUKIT SELATAN</div>
          </div>

          <div className="ews-map-marker left-[52%] top-[18%]">
            <div className="ews-marker-dot text-emerald-500" />
            <div className="ews-marker-label">POSKO UTAMA: GOR MADIUN</div>
          </div>

          <div className="absolute bottom-6 right-6 bg-gray-900/90 border border-gray-800 rounded-xl p-4 backdrop-blur-xl shadow-2xl">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">Legend Information</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                <span className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">Bahaya Banjir</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                <span className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">Potensi Longsor</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <span className="text-[11px] text-gray-300 font-bold uppercase tracking-wider">Posko Evakuasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MID SECTION GRID */}
      <div className="grid grid-cols-3 gap-5">
        {/* Alert Timeline */}
        <div className="ews-card p-6 col-span-2 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <i className="fa-solid fa-bell-concierge text-lg"></i>
            </div>
            <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-widest">LOG PERINGATAN DINI</span>
          </div>
          <div className="ews-timeline max-h-[350px] overflow-y-auto ews-scrollbar pr-2 relative z-10">
            {bencanaAlerts.map((alert, idx) => (
              <div key={idx} className="ews-timeline-item pl-6">
                <div 
                  className="ews-timeline-dot"
                  style={{ 
                    backgroundColor: alert.color === 'red' ? '#ef4444' : alert.color === 'amber' ? '#f59e0b' : alert.color === 'green' ? '#10b981' : '#06b6d4',
                    boxShadow: `0 0 10px ${alert.color === 'red' ? '#ef4444' : alert.color === 'amber' ? '#f59e0b' : alert.color === 'green' ? '#10b981' : '#06b6d4'}`
                  }}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
                    <span>{alert.time} · SOURCE: {alert.source}</span>
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded">ID-TRK-{Math.floor(Math.random() * 1000)}</span>
                  </div>
                  <div className="text-[14px] text-gray-300 font-bold leading-relaxed">{alert.content}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {alert.tags.map((tag, tidx) => (
                      <span key={tidx} className={`ews-tag text-[9px] font-black tracking-widest ${
                        alert.color === 'red' ? 'ews-tag-red' :
                        alert.color === 'amber' ? 'ews-tag-amber' :
                        'ews-tag-cyan'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerability Index */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-chart-line text-lg"></i>
            </div>
            <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-widest">INDEKS KERENTANAN</span>
          </div>
          <div className="space-y-6 relative z-10">
            {vulnerabilityIndex.map((item, idx) => (
              <div key={idx} className="group/stat">
                <div className="flex justify-between text-xs mb-2 items-end">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">{item.name}</span>
                  <span className={`font-orbitron font-black text-sm ${
                    item.value >= 70 ? 'text-red-500' :
                    item.value >= 40 ? 'text-amber-500' :
                    item.value >= 25 ? 'text-cyan-400' :
                    'text-emerald-400'
                  }`}>
                    {item.value}%
                  </span>
                </div>
                <div className="ews-progress-bar h-1">
                  <div 
                    className={`ews-progress-fill relative overflow-hidden ${
                      item.color.includes('gradient') ? '' : `bg-${item.color.replace('500', '400')}`
                    }`}
                    style={{ 
                      width: `${item.value}%`,
                      background: item.color.includes('gradient') 
                        ? undefined 
                        : undefined
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded text-[10px] text-cyan-500/70 font-mono leading-relaxed">
            SENSORY DATA AGGREGATED FROM 12 MONITORING NODES.
          </div>
        </div>
      </div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-2 gap-5">
        {/* Emergency Resources */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-ambulance text-lg"></i>
            </div>
            <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-widest">LOGISTIK & SUMBER DAYA</span>
          </div>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {resources.map((resource, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border transition-all ${
                  resource.status === 'good' ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30' : 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30'
                }`}
              >
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{resource.name}</div>
                <div className={`font-orbitron text-lg font-bold ${getResourceStatusClass(resource.status)}`}>
                  {resource.current} <span className="text-xs opacity-50">/ {resource.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-phone-volume text-lg"></i>
            </div>
            <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-widest">KONTAK DARURAT SEKTORAL</span>
          </div>
          <div className="grid grid-cols-2 gap-3 relative z-10">
            {emergencyContacts.map((contact, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer group/contact"
              >
                <div>
                  <div className="text-[13px] font-bold text-gray-100 group-hover/contact:text-white">{contact.name}</div>
                  <div className="text-[9px] text-gray-500 font-mono italic">{contact.sub}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${contact.statusColor === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
