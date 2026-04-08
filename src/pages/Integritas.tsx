import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface IntegritasProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const systemLayers = [
  { name: 'Data Ingestion Pipeline', health: 94, status: 'OK', statusColor: 'green' as const },
  { name: 'AI & Processing Engine', health: 78, status: 'LOAD', statusColor: 'cyan' as const },
  { name: 'Cybersecurity & Audit', health: 100, status: 'OK', statusColor: 'green' as const },
  { name: 'Presentation & Action', health: 99, status: 'OK', statusColor: 'green' as const },
];

const auditLogs = [
  { time: '14:41 WIB', content: 'Akses bulk export data Dukcapil oleh USER-047 · Query tidak lazim · Diblokir & diselidiki', type: 'INSIDER THREAT', typeColor: 'red' as const },
  { time: '14:22 WIB', content: 'Login gagal × 5 dari IP 103.xx.xx.12 · Akses panel admin', type: 'BRUTE FORCE', typeColor: 'amber' as const },
  { time: '14:05 WIB', content: 'AKBP Ahmad K. mengakses laporan prediksi Zone-A · Diotorisasi', type: 'NORMAL', typeColor: 'green' as const },
  { time: '13:48 WIB', content: 'Sinkronisasi data SPKT berhasil · 247 record · Hash SHA-256 valid', type: 'SYNC', typeColor: 'cyan' as const },
  { time: '13:30 WIB', content: 'Ipda Santoso membuka kasus SKT-2024-0847 · Role Penyidik · Valid', type: 'NORMAL', typeColor: 'green' as const },
  { time: '13:00 WIB', content: 'Backup otomatis selesai · 3.2GB · Enkripsi AES-256 · Cloud & On-prem', type: 'BACKUP', typeColor: 'cyan' as const },
  { time: '12:15 WIB', content: 'Model AI prediktif diperbarui · v2.4.1 · Akurasi naik ke 87.3%', type: 'UPDATE', typeColor: 'green' as const },
];

const accessLevels = [
  { level: 'Kapolres (L4 — Full Access)', users: 1 },
  { level: 'Wakapolres / Kabag (L3)', users: 4 },
  { level: 'Penyidik Reskrim (L2)', users: 18 },
  { level: 'Sabhara / Bhabinkamtibmas (L1)', users: 24 },
];

const securityFeatures = [
  { name: 'ENKRIPSI DATA', value: 'AES-256' },
  { name: 'PROTOKOL', value: 'TLS 1.3' },
  { name: 'FIREWALL', value: 'AKTIF' },
  { name: '2FA', value: 'WAJIB' },
];

export default function Integritas({ addToast }: IntegritasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    </div>
  );
}
