import { useState, useEffect } from 'react';
import type { Toast } from '../types';

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

interface IntegritasProps {
  addToast: (message: string, type: Toast['type']) => void;
}

import { systemLayers, auditLogs, accessLevels, securityFeatures } from '../data/mockSecurityIntegrity';

export default function SecurityIntegrity({ addToast }: IntegritasProps) {
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
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🛡️ MODUL 6 — INTEGRITAS & KEAMANAN SISTEM
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Status sistem aman', 'success')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status Sistem</div>
          <div className="font-orbitron text-xl font-bold text-emerald-400 mb-1">AMAN</div>
          <div className="text-sm text-emerald-400">● Semua layer operasional</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail uptime platform', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Uptime Platform</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">99.7%</div>
          <div className="text-sm text-gray-500">30 hari terakhir</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail percobaan akses gagal', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Percobaan Akses Gagal</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">23</div>
          <div className="text-sm text-gray-500">24 jam terakhir · Diblokir</div>
        </div>

        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail anomali insider', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Anomali Insider</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">1</div>
          <div className="text-sm text-amber-400">⚠ Investigasi aktif</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* System Health */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⚙️</span>
            <span className="font-semibold text-sm text-gray-300">KESEHATAN SISTEM — 4 LAYER</span>
          </div>
          <div className="space-y-3">
            {systemLayers.map((layer, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-bold text-xs">L{idx + 1}</span>
                    <span className="text-sm text-gray-400">{layer.name}</span>
                  </div>
                  <div className="ews-progress-bar">
                    <div 
                      className={`ews-progress-fill ${
                        layer.health >= 90 ? 'bg-emerald-500' :
                        layer.health >= 70 ? 'bg-cyan-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${layer.health}%` }}
                    />
                  </div>
                </div>
                <div className={`font-mono text-sm ${
                  layer.health >= 90 ? 'text-emerald-400' :
                  layer.health >= 70 ? 'text-cyan-400' :
                  'text-amber-400'
                }`}>
                  {layer.health}%
                </div>
                <span className={`ews-tag text-[9px] ${
                  layer.statusColor === 'green' ? 'ews-tag-green' : 'ews-tag-cyan'
                }`}>
                  {layer.status}
                </span>
              </div>
            ))}
          </div>

          {/* Security Features */}
          <div className="mt-5 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔒</span>
              <span className="font-semibold text-sm text-gray-300">ENKRIPSI & PERLINDUNGAN DATA</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {securityFeatures.map((feature, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-center"
                >
                  <div className="text-[9px] text-gray-500 mb-1">{feature.name}</div>
                  <div className="text-xs font-bold text-emerald-400">{feature.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <div className="ews-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <span className="font-semibold text-sm text-gray-300">AUDIT LOG IMMUTABLE</span>
            </div>
            <span className="ews-live-badge red">
              <span className="ews-live-dot" />
              LIVE
            </span>
          </div>
          <div className="ews-timeline max-h-[300px] overflow-y-auto pr-1">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="ews-timeline-item">
                <div 
                  className="ews-timeline-dot"
                  style={{ 
                    backgroundColor: log.typeColor === 'red' ? '#ef4444' : log.typeColor === 'amber' ? '#f59e0b' : log.typeColor === 'green' ? '#10b981' : '#06b6d4',
                    borderColor: '#070a12'
                  }}
                />
                <div className="text-[10px] text-gray-500 font-mono mb-0.5">
                  {log.time} {log.type === 'INSIDER THREAT' && '· ⚠ ANOMALI'}
                </div>
                <div className="text-sm text-gray-300 mb-1">{log.content}</div>
                <span className={`ews-tag text-[9px] ${
                  log.typeColor === 'red' ? 'ews-tag-red' :
                  log.typeColor === 'amber' ? 'ews-tag-amber' :
                  log.typeColor === 'green' ? 'ews-tag-green' :
                  'ews-tag-cyan'
                }`}>
                  {log.type}
                </span>
              </div>
            ))}
          </div>

          {/* Access Management */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👥</span>
              <span className="font-semibold text-sm text-gray-300">MANAJEMEN HAK AKSES</span>
            </div>
            <div className="space-y-1.5">
              {accessLevels.map((level, idx) => (
                <div 
                  key={idx}
                  className="flex justify-between items-center p-2 rounded bg-cyan-500/5"
                >
                  <span className="text-xs text-gray-400">{level.level}</span>
                  <span className="ews-tag ews-tag-cyan text-[9px]">{level.users} user</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Logs Section */}
      <div className="ews-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="font-semibold text-sm text-gray-300 uppercase tracking-wider">Log Verifikasi Personel & GPS</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={runDiagnostics}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest flex items-center gap-1 border border-amber-500/30 px-2 py-1 rounded"
            >
              <span>🔍</span> DIAGNOSTIK
            </button>
            <button 
              onClick={clearLogs}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest flex items-center gap-1"
            >
              <span>🗑️</span> HAPUS LOG
            </button>
            <button 
              onClick={fetchLogs}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest flex items-center gap-1"
            >
              <span>🔄</span> REFRESH
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingLogs ? (
            <div className="col-span-full py-10 text-center text-gray-500 font-mono text-xs animate-pulse">
              MENGAMBIL DATA DARI MEMORI LOKAL...
            </div>
          ) : trackingLogs.length === 0 ? (
            <div className="col-span-full py-10 text-center text-gray-600 font-mono text-xs border border-dashed border-gray-800 rounded-lg">
              BELUM ADA DATA VERIFIKASI TERCATAT
            </div>
          ) : (
            trackingLogs.map((log) => (
              <div key={log.id} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden flex flex-col group hover:border-cyan-500/30 transition-colors">
                <div className="relative aspect-video bg-black/40 flex items-center justify-center overflow-hidden">
                  {log.photo ? (
                    <img 
                      src={log.photo} 
                      alt="Verification Snapshot" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="text-[10px] text-gray-600 font-mono">NO IMAGE</div>
                  )}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] text-cyan-400 font-mono border border-cyan-500/20">
                    ID: {log.id}
                  </div>
                  {log.is_ip_location && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/20 backdrop-blur-md rounded text-[9px] text-amber-400 font-mono border border-amber-500/30">
                      🛰️ IP GEO-LOC
                    </div>
                  )}
                </div>
                
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span className="text-emerald-400">{log.timestamp}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="bg-black/30 p-2 rounded border border-gray-800">
                      {log.lat && log.lng ? (
                        <div className="flex justify-between items-center">
                          <div className="text-[10px] text-gray-500 font-mono leading-relaxed">
                            <div className="flex gap-2">
                              <span className="text-gray-600">LAT:</span> 
                              <span className="text-cyan-400/80">{log.lat.toFixed(6)}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-gray-600">LNG:</span> 
                              <span className="text-cyan-400/80">{log.lng.toFixed(6)}</span>
                            </div>
                            {log.accuracy && (
                              <div className="text-[9px] text-gray-600 mt-1 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-cyan-500" />
                                Akurasi: {log.accuracy.toFixed(1)}m
                              </div>
                            )}
                          </div>
                          <a 
                            href={`https://www.google.com/maps?q=${log.lat},${log.lng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 p-2 rounded text-cyan-400 transition-colors"
                            title="Buka di Google Maps"
                          >
                            📍
                          </a>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-600 italic">DATA LOKASI TIDAK TERSEDIA</div>
                      )}

                      {/* IP-Based Extra Info */}
                      {(log.city || log.isp) && (
                        <div className="mt-2 pt-2 border-t border-gray-800/50 space-y-1">
                          {log.city && (
                            <div className="text-[10px] flex items-center gap-2">
                              <span className="text-gray-600 uppercase text-[8px] tracking-tighter">Lokasi IP:</span>
                              <span className="text-amber-400/80 font-mono">{log.city}, {log.region}</span>
                            </div>
                          )}
                          {log.isp && (
                            <div className="text-[10px] flex items-center gap-2">
                              <span className="text-gray-600 uppercase text-[8px] tracking-tighter">Provider:</span>
                              <span className="text-gray-400 font-mono truncate max-w-[150px]">{log.isp}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
