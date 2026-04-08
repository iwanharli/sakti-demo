import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface BencanaProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const bencanaAlerts = [
  { time: '14:30 WIB', source: 'BMKG', content: 'Peringatan Dini Hujan Lebat (>100mm/3jam) wilayah Kecamatan Selatan & Timur', tags: ['SIAGA', 'BMKG'], color: 'red' as const },
  { time: '13:15 WIB', source: 'BPBD', content: 'Tinggi muka air Sungai Way Sekampung naik 1.2m · Ambang batas: 2.5m · Status WASPADA', tags: ['WASPADA'], color: 'amber' as const },
  { time: '12:00 WIB', source: 'PUSDALOPS', content: 'Posko evakuasi GOR Kota Metro aktif · Kapasitas 500 jiwa · Logistik tersedia 3 hari', tags: ['SIAP'], color: 'green' as const },
  { time: '10:30 WIB', source: 'POLRES', content: 'Rapat koordinasi mitigasi bencana selesai · 8 OPD hadir · Jalur evakuasi diverifikasi', tags: ['KOORDINASI'], color: 'cyan' as const },
  { time: '09:00 WIB', source: 'BMKG', content: 'Gempa M3.2 — Kedalaman 10km — 45km Barat Daya Kota Metro · Tidak berpotensi tsunami', tags: ['INFO'], color: 'amber' as const },
];

const resources = [
  { name: 'Ambulans', current: 6, total: 8, status: 'good' as const },
  { name: 'Perahu Karet', current: 4, total: 6, status: 'good' as const },
  { name: 'Truk Logistik', current: 3, total: 4, status: 'good' as const },
  { name: 'Genset Portable', current: 2, total: 5, status: 'warning' as const },
  { name: 'Tenda Pengungsi', current: 20, total: 25, status: 'good' as const },
];

const emergencyContacts = [
  { name: 'BPBD Kota Metro', sub: 'Pusdalops PB', status: 'ONLINE', statusColor: 'green' as const },
  { name: 'BMKG Stasiun Lampung', sub: 'Cuaca & Gempa', status: 'ONLINE', statusColor: 'green' as const },
  { name: 'PMI Kota Metro', sub: 'SAR & Medis', status: 'ONLINE', statusColor: 'green' as const },
  { name: 'Kodim 0411 Metro', sub: 'Bantuan TNI', status: 'STANDBY', statusColor: 'cyan' as const },
];

const vulnerabilityIndex = [
  { name: 'Banjir', value: 78, color: 'from-amber-500 to-red-500' },
  { name: 'Tanah Longsor', value: 52, color: 'amber-500' },
  { name: 'Kebakaran', value: 41, color: 'amber-500' },
  { name: 'Gempa Bumi', value: 25, color: 'cyan-500' },
  { name: 'Angin Puting Beliung', value: 15, color: 'emerald-500' },
];

export default function Bencana({ addToast }: BencanaProps) {
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
      {/* Section Title */}
      <div className="ews-section-title">
        🌋 MODUL MITIGASI BENCANA — KOTA/KABUPATEN
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail potensi bencana aktif', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Potensi Bencana Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">2</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">▲ 1</span>
            <span className="text-gray-500">Banjir & Longsor</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">⚠️</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail status siaga', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status Siaga</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">III</div>
          <div className="text-sm text-amber-400">WASPADA — Curah Hujan Tinggi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🟡</div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail posko siaga', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Posko Siaga Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">8</div>
          <div className="text-sm text-gray-500">dari 12 posko tersedia</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🏥</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail personel standby', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Personel Standby</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">124</div>
          <div className="text-sm text-gray-500">TNI + Polri + BPBD + PMI</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">👥</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Disaster Map */}
        <div className="ews-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗺️</span>
              <span className="font-semibold text-sm text-gray-300">PETA KERAWANAN BENCANA</span>
            </div>
            <span className="ews-live-badge red">
              <span className="ews-live-dot" />
              LIVE BMKG
            </span>
          </div>
          <div className="relative h-80 bg-gradient-to-b from-[#0d1f35] to-[#070a12] rounded-lg overflow-hidden">
            {/* Grid */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}
            />
            
            {/* Roads */}
            <div className="absolute left-0 right-0 top-[40%] h-0.5 bg-cyan-500/30" />
            <div className="absolute left-0 right-0 top-[70%] h-0.5 bg-cyan-500/30" />
            <div className="absolute left-[35%] top-0 bottom-0 w-0.5 bg-cyan-500/30" />
            <div className="absolute left-[70%] top-0 bottom-0 w-0.5 bg-cyan-500/30" />

            {/* Disaster Zones */}
            <div 
              className="absolute w-32 h-32 left-[30%] top-[35%] rounded-full animate-pulse"
              style={{ background: 'radial-gradient(circle, rgba(0,120,255,0.6) 0%, rgba(0,120,255,0) 70%)' }}
            />
            <div 
              className="absolute w-24 h-24 left-[65%] top-[60%] rounded-full animate-pulse"
              style={{ background: 'radial-gradient(circle, rgba(180,120,0,0.5) 0%, rgba(180,120,0,0) 70%)', animationDelay: '1s' }}
            />
            <div 
              className="absolute w-20 h-20 left-[50%] top-[20%] rounded-full animate-pulse"
              style={{ background: 'radial-gradient(circle, rgba(0,200,100,0.4) 0%, rgba(0,200,100,0) 70%)', animationDelay: '0.5s' }}
            />

            {/* Markers */}
            <div className="ews-map-marker left-[30%] top-[35%]">
              <div className="ews-marker-dot bg-blue-500 text-blue-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Zona Banjir — Kel. Rejo
              </div>
            </div>
            <div className="ews-map-marker left-[65%] top-[60%]">
              <div className="ews-marker-dot bg-amber-600 text-amber-600" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Rawan Longsor — Bukit Selatan
              </div>
            </div>
            <div className="ews-map-marker left-[50%] top-[20%]">
              <div className="ews-marker-dot bg-emerald-500 text-emerald-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Posko Evakuasi GOR
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-gray-900/90 border border-gray-700 rounded-lg p-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-gray-400">Zona Banjir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-[10px] text-gray-400">Zona Longsor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-gray-400">Posko Evakuasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Timeline */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📋</span>
            <span className="font-semibold text-sm text-gray-300">STATUS PERINGATAN DINI</span>
          </div>
          <div className="ews-timeline max-h-80 overflow-y-auto pr-1">
            {bencanaAlerts.map((alert, idx) => (
              <div key={idx} className="ews-timeline-item">
                <div 
                  className="ews-timeline-dot"
                  style={{ 
                    backgroundColor: alert.color === 'red' ? '#ef4444' : alert.color === 'amber' ? '#f59e0b' : alert.color === 'green' ? '#10b981' : '#06b6d4',
                    borderColor: '#070a12'
                  }}
                />
                <div className="text-[10px] text-gray-500 font-mono mb-0.5">{alert.time} · {alert.source}</div>
                <div className="text-sm text-gray-300 mb-1">{alert.content}</div>
                <div className="flex flex-wrap gap-1">
                  {alert.tags.map((tag, tidx) => (
                    <span key={tidx} className={`ews-tag text-[9px] ${
                      alert.color === 'red' ? 'ews-tag-red' :
                      alert.color === 'amber' ? 'ews-tag-amber' :
                      alert.color === 'green' ? 'ews-tag-green' :
                      'ews-tag-cyan'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Emergency Resources */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🚑</span>
            <span className="font-semibold text-sm text-gray-300">SUMBER DAYA DARURAT</span>
          </div>
          <div className="space-y-2">
            {resources.map((resource, idx) => (
              <div 
                key={idx}
                className={`flex justify-between items-center p-2 rounded ${
                  resource.status === 'good' ? 'bg-emerald-500/5' : 'bg-amber-500/5'
                }`}
              >
                <span className="text-xs text-gray-400">{resource.name}</span>
                <span className={`font-mono text-sm ${getResourceStatusClass(resource.status)}`}>
                  {resource.current} / {resource.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📞</span>
            <span className="font-semibold text-sm text-gray-300">KONTAK DARURAT SEKTORAL</span>
          </div>
          <div className="space-y-2">
            {emergencyContacts.map((contact, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center p-2 rounded bg-cyan-500/5"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{contact.name}</div>
                  <div className="text-[9px] text-gray-500">{contact.sub}</div>
                </div>
                <span className={`ews-tag text-[9px] ${
                  contact.statusColor === 'green' ? 'ews-tag-green' : 'ews-tag-cyan'
                }`}>
                  {contact.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerability Index */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <span className="font-semibold text-sm text-gray-300">INDEKS KERENTANAN WILAYAH</span>
          </div>
          <div className="space-y-3">
            {vulnerabilityIndex.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{item.name}</span>
                  <span className={`font-bold ${
                    item.value >= 70 ? 'text-red-400' :
                    item.value >= 40 ? 'text-amber-400' :
                    item.value >= 25 ? 'text-cyan-400' :
                    'text-emerald-400'
                  }`}>
                    {item.value}%
                  </span>
                </div>
                <div className="ews-progress-bar">
                  <div 
                    className={`ews-progress-fill ${
                      item.color.includes('gradient') ? '' : `bg-${item.color}`
                    }`}
                    style={{ 
                      width: `${item.value}%`,
                      background: item.color.includes('gradient') 
                        ? `linear-gradient(90deg, var(--tw-gradient-stops))` 
                        : undefined
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
