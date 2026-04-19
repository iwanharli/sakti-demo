import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface TrackingLog {
  id: string;
  timestamp: string;
  photo: string | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  city?: string | null;
  region?: string | null;
  isp?: string | null;
  is_ip_location?: boolean;
}



import { systemLayers, auditLogs, accessLevels, securityFeatures } from '../data/mockSecurityIntegrity';

export default function SecurityIntegrity() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchLogs();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sakti_tracking_logs') {
        fetchLogs();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(fetchLogs, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const fetchLogs = () => {
    try {
      const logsRaw = localStorage.getItem('sakti_tracking_logs');
      if (logsRaw) {
        const parsed = JSON.parse(logsRaw);
        setTrackingLogs(Array.isArray(parsed) ? parsed : []);
      } else {
        setTrackingLogs([]);
      }
    } catch (err) {
      console.error('Failed to parse tracking logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const clearLogs = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua log verifikasi?')) {
      localStorage.removeItem('sakti_tracking_logs');
      localStorage.removeItem('last_sakti_geo_error');
      fetchLogs();
      addToast('Semua log verifikasi telah dihapus.', 'info');
    }
  };

  const runDiagnostics = () => {
    const raw = localStorage.getItem('sakti_tracking_logs');
    const geoError = localStorage.getItem('last_sakti_geo_error') || 'Belum ada data (Sync Terlebih Dahulu)';
    const size = raw ? (raw.length / 1024).toFixed(2) : '0';
    const entries = trackingLogs.length;
    
    alert(`🔍 DIAGNOSTIK STORAGE:
- Key: sakti_tracking_logs
- Status: ${raw ? 'TERISI' : 'KOSONG'}
- Ukuran: ${size} KB
- Jumlah Entri: ${entries}

📍 DIAGNOSTIK GPS/IP:
- Status Error Terakhir: ${geoError}

Jika GPS Error "Error code 1", sistem otomatis akan menggunakan IP Geolocation sebagai fallback.`);
  };

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>

      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Status sistem aman', 'success')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Internal Health</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-500 mb-1 tracking-tight">NOMINAL</div>
          <div className="text-[13px] text-emerald-500/60 font-black italic uppercase">System Kernel OK</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-house-shield"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail uptime platform', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Platform Uptime</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">99.7%</div>
          <div className="text-[13px] text-gray-500 italic lowercase tracking-wider">30-day session stability</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-hourglass-start"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail percobaan akses gagal', 'alert')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Blocked Access</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">23</div>
          <div className="text-[13px] text-red-400 font-bold italic uppercase">Detected Brute Force</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-user-slash"></i>
          </div>
        </div>

        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail anomali insider', 'alert')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Insider Anomalies</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">01</div>
          <div className="text-[13px] text-gray-500 font-bold italic uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Investigasi Aktif
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-user-ninja"></i>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {/* SYSTEM HEALTH MATRIC */}
        <div className="ews-card p-6 relative overflow-hidden group/card">
          <div className="ews-hud-corner ews-hud-tl" />
          <div className="ews-hud-corner ews-hud-tr" />
          <div className="ews-hud-corner ews-hud-bl" />
          <div className="ews-hud-corner ews-hud-br" />
          <div className="ews-card-header-bar" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <i className="fa-solid fa-gears text-lg"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">KESEHATAN SISTEM (4 LAYER)</span>
                <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Monitoring Kernel • Status Operasional
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            {systemLayers.map((layer, idx) => (
              <div key={idx} className="group/layer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron font-black text-[11px] text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">L{idx + 1}</span>
                    <span className="text-[14px] font-bold text-gray-300 uppercase tracking-wide">{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-orbitron font-black text-[16px] ${
                      layer.health >= 90 ? 'text-emerald-400' :
                      layer.health >= 70 ? 'text-cyan-400' :
                      'text-amber-400'
                    }`}>
                      {layer.health}%
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-widest border ${
                      layer.statusColor === 'green' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                    }`}>
                      {layer.status}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-900/80 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out relative ${
                      layer.health >= 90 ? 'bg-emerald-500' :
                      layer.health >= 70 ? 'bg-cyan-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${layer.health}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <i className="fa-solid fa-lock text-sm"></i>
              </div>
              <span className="font-orbitron font-bold text-[13px] text-gray-100 uppercase tracking-wider block">CRYPTO-STORAGE LOCK</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {securityFeatures.map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.02] border border-gray-800 hover:border-emerald-500/30 transition-all flex flex-col items-center justify-center group/feat"
                >
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 group-hover/feat:text-emerald-500/50 transition-colors">{feature.name}</div>
                  <div className="text-[14px] font-orbitron font-black text-emerald-400 tracking-wider inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    {feature.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AUDIT LOG TIMELINE */}
        <div className="ews-card p-6 relative overflow-hidden group/card">
          <div className="ews-hud-corner ews-hud-tl" />
          <div className="ews-hud-corner ews-hud-tr" />
          <div className="ews-hud-corner ews-hud-bl" />
          <div className="ews-hud-corner ews-hud-br" />
          <div className="ews-card-header-bar" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <i className="fa-solid fa-list-check text-lg"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">LOG AUDIT SISTEM</span>
                <span className="text-[10px] text-amber-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Riwayat Aktivitas • Tautan Hash
                </span>
              </div>
            </div>
            <span className="ews-live-badge red shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              <span className="ews-live-dot" />
              LIVE
            </span>
          </div>

          <div className="ews-timeline max-h-[500px] overflow-y-auto pr-2 relative z-10 custom-scrollbar">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="ews-timeline-item mb-6 group/item">
                <div 
                  className="ews-timeline-dot shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  style={{ 
                    backgroundColor: log.typeColor === 'red' ? '#ef4444' : log.typeColor === 'amber' ? '#f59e0b' : log.typeColor === 'green' ? '#10b981' : '#06b6d4',
                    border: '2px solid #070a12',
                    boxShadow: log.typeColor === 'red' ? '0 0 10px rgba(239,68,68,0.4)' : 'none'
                  }}
                />
                <div className="text-[11px] text-gray-600 font-mono mb-1 flex items-center gap-2">
                  <span className="font-black text-gray-400">{log.time}</span> 
                  {log.type === 'INSIDER THREAT' && <span className="text-red-500 animate-pulse font-black uppercase text-[10px]">● ATENSI ANOMALI</span>}
                </div>
                <div className="text-[14px] text-gray-300 font-medium leading-relaxed mb-2 pr-4">{log.content}</div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-black border tracking-widest ${
                    log.typeColor === 'red' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    log.typeColor === 'amber' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    log.typeColor === 'green' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-[11px] text-gray-700 font-mono">HASH: 0x{Math.random().toString(16).slice(2, 6)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACCESS MANAGEMENT (FULL WIDTH) */}
      <div className="ews-card p-6 relative overflow-hidden group/card z-10">
        <div className="ews-hud-corner ews-hud-tl" />
        <div className="ews-hud-corner ews-hud-tr" />
        <div className="ews-hud-corner ews-hud-bl" />
        <div className="ews-hud-corner ews-hud-br" />
        <div className="ews-card-header-bar" />
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <i className="fa-solid fa-users-gear text-lg"></i>
          </div>
          <div>
            <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">MANAJEMEN HAK AKSES SISTEM</span>
            <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Matriks Otorisasi • Akses Regional
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 relative z-10">
          {accessLevels.map((level, idx) => (
            <div 
              key={idx}
              className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-gray-800 hover:border-cyan-500/30 transition-all group/level"
            >
              <div className="flex flex-col">
                <span className="text-[14px] text-gray-100 font-black uppercase tracking-wider group-hover/level:text-cyan-400 transition-colors">
                  {level.level.split('(')[0]}
                </span>
                <span className="text-[11px] text-gray-400 font-mono tracking-tighter uppercase opacity-80">
                  {level.level.split('(')[1]?.replace(')', '') || 'Authorized'}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-orbitron font-black text-cyan-400 text-2xl">{level.users}</span>
                <span className="text-[11px] text-gray-500 font-black uppercase tracking-tighter">Personnel</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRACKING LOGS SECTION (PERSONNEL IDENTIFICATION UNITS) */}
      <div className="ews-card p-6 relative overflow-hidden group/card z-10">
        <div className="ews-hud-corner ews-hud-tl" />
        <div className="ews-hud-corner ews-hud-tr" />
        <div className="ews-hud-corner ews-hud-bl" />
        <div className="ews-hud-corner ews-hud-br" />
        <div className="ews-card-header-bar" />
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <i className="fa-solid fa-fingerprint text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">VERIFIKASI PERSONEL</span>
              <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Umpan Log Verifikasi • Autentikasi Personel
              </span>
            </div>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={runDiagnostics}
              className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-[10px] text-amber-400 hover:bg-amber-500/10 transition-all font-black tracking-widest flex items-center gap-2"
            >
              <i className="fa-solid fa-magnifying-glass-chart"></i> DIAGNOSTIK
            </button>
            <button 
              onClick={clearLogs}
              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 text-[10px] text-red-400 hover:bg-red-500/10 transition-all font-black tracking-widest flex items-center gap-2"
            >
              <i className="fa-solid fa-trash-can"></i> CLEAR LOGS
            </button>
            <button 
              onClick={fetchLogs}
              className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-[10px] text-cyan-400 hover:bg-cyan-500/10 transition-all font-black tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
            >
              <i className="fa-solid fa-rotate"></i> REFRESH
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {isLoadingLogs ? (
            <div className="col-span-full py-20 text-center">
              <div className="inline-block relative">
                 <div className="w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin mb-4" />
                 <div className="text-[11px] text-cyan-500 font-mono tracking-widest animate-pulse font-black">FETCHING KERNEL DATA...</div>
              </div>
            </div>
          ) : trackingLogs.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl bg-white/[0.01]">
              <i className="fa-solid fa-folder-open text-3xl text-gray-700 mb-4 block"></i>
              <div className="text-[12px] text-gray-600 font-mono font-black uppercase tracking-widest">TIDAK ADA DATA VERIFIKASI TERCATAT</div>
              <div className="text-[10px] text-gray-700 font-medium mt-2">Menunggu input dari modul personel lapangan</div>
            </div>
          ) : (
            trackingLogs.map((log) => (
              <div key={log.id} className="ews-card p-0 overflow-hidden flex flex-col group/log hover:border-cyan-500/50 transition-all duration-300 relative group/card">
                <div className="ews-hud-corner ews-hud-tl" />
                <div className="ews-hud-corner ews-hud-tr" />
                <div className="ews-hud-corner ews-hud-bl" />
                <div className="ews-hud-corner ews-hud-br" />
                <div className="ews-card-header-bar opacity-30" />
                <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                  {/* SCANLINE OVERLAY */}
                  <div className="absolute inset-0 pointer-events-none z-10 bg-scanline opacity-[0.03]" />
                  {/* VIGNETTE & TINT */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 z-10 group-hover/log:bg-cyan-500/5 transition-colors duration-500" />
                  
                  {log.photo ? (
                    <img 
                      src={log.photo} 
                      alt="Verification Snapshot" 
                      className="w-full h-full object-cover grayscale-[0.3] group-hover/log:grayscale-0 transition-all duration-700 group-hover/log:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900/40 border-b border-gray-800">
                      <i className="fa-solid fa-user-secret text-4xl text-gray-800"></i>
                    </div>
                  )}

                  {/* TACTICAL OVERLAYS */}
                  <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5">
                    <div className="px-2 py-0.5 bg-black/80 backdrop-blur-md rounded border border-cyan-500/30 text-[11px] text-cyan-400 font-mono font-black shadow-lg">
                      UID: {log.id}
                    </div>
                    {log.is_ip_location && (
                      <div className="px-2 py-0.5 bg-amber-500/20 backdrop-blur-md rounded border border-amber-500/40 text-[11px] text-amber-400 font-mono font-black shadow-lg">
                        <i className="fa-solid fa-satellite-dish mr-1"></i> IP-BASED
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 z-30">
                    <div className="w-10 h-10 rounded-full border border-gray-500/50 flex items-center justify-center text-[12px] text-white backdrop-blur-sm bg-black/40 hover:bg-cyan-500 hover:border-cyan-400 transition-all cursor-pointer">
                      <i className="fa-solid fa-expand"></i>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-emerald-400 font-orbitron font-black uppercase tracking-widest">{log.timestamp.split(' ')[1]}</span>
                    <span className="text-[11px] text-gray-400 font-mono tracking-tighter uppercase">{log.timestamp.split(' ')[0]}</span>
                  </div>
                  
                  <div className="bg-black/30 p-3 rounded-xl border border-gray-800/80 group-hover/log:border-cyan-500/20 transition-all">
                    {log.lat && log.lng ? (
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center bg-cyan-500/10 px-2 py-1 rounded">
                             <span className="text-[10px] text-cyan-500/60 font-black">LAT</span>
                             <span className="text-[13px] font-orbitron font-black text-cyan-400 tracking-tighter">{log.lat.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-cyan-500/10 px-2 py-1 rounded">
                             <span className="text-[10px] text-cyan-500/60 font-black">LNG</span>
                             <span className="text-[13px] font-orbitron font-black text-cyan-400 tracking-tighter">{log.lng.toFixed(6)}</span>
                          </div>
                          {log.accuracy && (
                            <div className="text-[11px] text-gray-500 mt-2 pl-1 flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]"></span>
                               ERROR RADIUS: {log.accuracy.toFixed(1)}m
                            </div>
                          )}
                        </div>
                        <a 
                          href={`https://www.google.com/maps?q=${log.lat},${log.lng}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] shrink-0"
                          title="View Intelligence Map"
                        >
                          <i className="fa-solid fa-location-crosshairs"></i>
                        </a>
                      </div>
                    ) : (
                      <div className="py-2 text-center text-[10px] text-red-500/60 font-black tracking-widest italic uppercase">LOCATION DATA NULL</div>
                    )}

                    {(log.city || log.isp) && (
                      <div className="mt-3 pt-3 border-t border-gray-800/50 space-y-1.5">
                        {log.city && (
                          <div className="flex items-center gap-3">
                            <i className="fa-solid fa-city text-[11px] text-gray-500"></i>
                            <span className="text-[11px] text-amber-500 font-black uppercase tracking-tighter">{log.city}, {log.region}</span>
                          </div>
                        )}
                        {log.isp && (
                          <div className="flex items-center gap-3">
                            <i className="fa-solid fa-server text-[11px] text-gray-500"></i>
                            <span className="text-[11px] text-gray-400 font-mono truncate">{log.isp}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
