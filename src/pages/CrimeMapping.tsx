import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface CrimeMappingProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const patrolRoutes = [
  { id: 'A', unit: 'SKT-01', status: 'PRIORITAS', statusColor: 'red' as const, route: 'Polres → Jl. Merdeka → Pasar Baru → Jl. Ahmad Yani → Polres', time: '45 menit', distance: '18.2 km' },
  { id: 'B', unit: 'SKT-03', status: 'AKTIF', statusColor: 'amber' as const, route: 'Polsek Utara → Terminal → Kel. Hadimulyo → Kembali', time: '38 menit', distance: '14.5 km' },
  { id: 'C', unit: 'LNT-02', status: 'RESPON', statusColor: 'red' as const, route: 'Jl. Sudirman (Insiden aktif)', time: 'ETA 3 menit', distance: '1.2 km' },
];

const gpsTracking = [
  { unit: 'SKT-01', location: 'Jl. Merdeka', speed: 42, status: 'JALAN', statusColor: 'green' as const },
  { unit: 'SKT-03', location: 'Terminal', speed: 18, status: 'JALAN', statusColor: 'green' as const },
  { unit: 'LNT-02', location: 'Jl. Sudirman', speed: 0, status: 'BERHENTI', statusColor: 'red' as const },
  { unit: 'BBK-07', location: 'Kel. Rejo Agung', speed: 25, status: 'JALAN', statusColor: 'green' as const },
  { unit: 'RSK-04', location: 'Pasar Mall', speed: 0, status: 'OLAH TKP', statusColor: 'amber' as const },
];

export default function CrimeMapping({ addToast }: CrimeMappingProps) {
  const [mounted, setMounted] = useState(false);
  const [mapFilter, setMapFilter] = useState('heat');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilterChange = (filter: string) => {
    setMapFilter(filter);
    addToast(`Mode peta: ${filter.toUpperCase()} diaktifkan`, 'info');
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🗺️ MODUL 3 — DYNAMIC CRIME MAPPING (SABHARA & LANTAS)
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail zona merah aktif', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Zona Merah Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">3</div>
          <div className="text-sm text-gray-500">Risiko sangat tinggi</div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail unit patroli aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Unit Patroli Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">8</div>
          <div className="text-sm text-gray-500">GPS Terpantau</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail rute patroli optimal', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rute Patroli Optimal</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">4</div>
          <div className="text-sm text-gray-500">Diperbarui AI 30 mnt lalu</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail laporan 110 masuk', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Laporan 110 Masuk</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">17</div>
          <div className="text-sm text-gray-500">Hari ini · 3 belum direspon</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Big Map */}
        <div className="col-span-2 ews-card">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-lg">🗺️</span>
              <span className="font-semibold text-sm">INTERACTIVE HEATMAP — POLRES KOTA METRO</span>
              <span className="ews-live-badge red">
                <span className="ews-live-dot" />
                LIVE GPS
              </span>
            </div>
            <div className="flex gap-2">
              {['heat', 'patrol', 'incidents'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
                    mapFilter === filter
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-transparent border-gray-700 text-gray-500 hover:border-cyan-500/30 hover:text-cyan-400'
                  }`}
                >
                  {filter === 'heat' ? 'Heatmap' : filter === 'patrol' ? 'Patroli' : 'Insiden'}
                </button>
              ))}
            </div>
          </div>
          <div className="relative h-[450px] bg-gradient-to-b from-[#0d1f35] to-[#070a12] overflow-hidden">
            {/* Grid */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}
            />
            
            {/* Roads */}
            <div className="absolute left-0 right-0 top-[30%] h-0.5 bg-cyan-500/30" />
            <div className="absolute left-0 right-0 top-[55%] h-0.5 bg-cyan-500/30" />
            <div className="absolute left-0 right-0 top-[75%] h-0.5 bg-cyan-500/20" />
            <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-cyan-500/30" />
            <div className="absolute left-[55%] top-0 bottom-0 w-0.5 bg-cyan-500/30" />
            <div className="absolute left-[78%] top-0 bottom-0 w-0.5 bg-cyan-500/20" />

            {/* Heat Zones */}
            <div className="ews-heat-zone ews-heat-red w-36 h-36 left-[28%] top-[33%]" />
            <div className="ews-heat-zone ews-heat-amber w-28 h-28 left-[57%] top-[20%]" style={{ animationDelay: '0.8s' }} />
            <div className="ews-heat-zone ews-heat-amber w-24 h-24 left-[55%] top-[58%]" style={{ animationDelay: '1.5s' }} />
            <div className="ews-heat-zone ews-heat-yellow w-20 h-20 left-[15%] top-[60%]" style={{ animationDelay: '0.4s' }} />
            <div className="ews-heat-zone ews-heat-yellow w-16 h-16 left-[80%] top-[70%]" style={{ animationDelay: '2s' }} />

            {/* Patrol Routes (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M15 80 Q25 55 28 33 Q40 20 57 20 Q70 20 80 30" fill="none" stroke="rgba(6,182,212,0.35)" strokeWidth="0.5" strokeDasharray="2,2"/>
              <path d="M25 15 Q40 30 55 55 Q60 70 55 80" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" strokeDasharray="2,2"/>
            </svg>

            {/* Vehicles */}
            <div 
              className="absolute bg-cyan-500/20 border border-cyan-500 rounded px-2 py-1 text-[10px] font-mono text-cyan-400"
              style={{
                left: '20%',
                top: '30%',
                animation: 'vehicleMove 10s linear infinite'
              }}
            >
              ▶ SKT-01
            </div>
            <div className="absolute left-[62%] top-[48%] bg-emerald-500/20 border border-emerald-500 rounded px-2 py-1 text-[10px] font-mono text-emerald-400">
              ▶ LNT-02
            </div>

            {/* Markers */}
            <div className="ews-map-marker left-[28%] top-[33%]">
              <div className="ews-marker-dot bg-red-500 text-red-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Jl. Merdeka 🚨
              </div>
            </div>
            <div className="ews-map-marker left-[57%] top-[20%]">
              <div className="ews-marker-dot bg-amber-500 text-amber-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Pasar Baru
              </div>
            </div>
            <div className="ews-map-marker left-[55%] top-[58%]">
              <div className="ews-marker-dot bg-amber-500 text-amber-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Terminal
              </div>
            </div>
            <div className="ews-map-marker left-[15%] top-[60%]">
              <div className="ews-marker-dot bg-cyan-500 text-cyan-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Polsek Utara
              </div>
            </div>
            <div className="ews-map-marker left-[75%] top-[40%]">
              <div className="ews-marker-dot bg-emerald-500 text-emerald-500" />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/90 border border-gray-700 px-2 py-0.5 rounded text-[10px]">
                Polsek Timur
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {['+', '−', '⊕', '⛶'].map((btn, i) => (
                <button 
                  key={i}
                  className="w-7 h-7 bg-gray-900/90 border border-gray-700 rounded flex items-center justify-center text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 bg-gray-900/90 border border-gray-700 rounded-lg p-3">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">KETERANGAN</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] text-gray-400">Zona Kritis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] text-gray-400">Zona Waspada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-[10px] text-gray-400">Zona Rendah</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="text-[10px] text-gray-400">Pos / Polsek</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-0.5" style={{ background: 'repeating-linear-gradient(90deg,#06b6d4 0,#06b6d4 4px,transparent 4px,transparent 7px)' }} />
                  <span className="text-[10px] text-gray-400">Rute Patroli</span>
                </div>
              </div>
            </div>

            {/* City Label */}
            <div className="absolute top-3 left-3 font-orbitron text-[11px] text-gray-600 tracking-widest">
              KOTA METRO — PETA DINAMIS
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Smart Patrol Routing */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🧭</span>
              <span className="font-semibold text-sm text-gray-300">SMART PATROL ROUTING</span>
            </div>
            <div className="space-y-2">
              {patrolRoutes.map((route) => (
                <div 
                  key={route.id}
                  className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-colors"
                  onClick={() => addToast(`Detail rute ${route.unit}`, 'info')}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-cyan-400">RUTE OPTIMAL {route.id} — {route.unit}</span>
                    <span className={`ews-tag text-[9px] ${
                      route.statusColor === 'red' ? 'ews-tag-red' : 'ews-tag-amber'
                    }`}>
                      {route.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1">{route.route}</div>
                  <div className="text-[10px] text-gray-400">⏱ Est. {route.time} · {route.distance}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live GPS Tracking */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📡</span>
              <span className="font-semibold text-sm text-gray-300">LIVE ASSET TRACKING — GPS</span>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[9px] text-gray-500 uppercase tracking-wider pb-2">UNIT</th>
                  <th className="text-left text-[9px] text-gray-500 uppercase tracking-wider pb-2">LOKASI</th>
                  <th className="text-right text-[9px] text-gray-500 uppercase tracking-wider pb-2">KM/H</th>
                  <th className="text-right text-[9px] text-gray-500 uppercase tracking-wider pb-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {gpsTracking.map((unit, idx) => (
                  <tr key={idx} className="border-t border-gray-800/50">
                    <td className="py-2 text-xs font-semibold text-white">{unit.unit}</td>
                    <td className="py-2 text-[10px] text-gray-500">{unit.location}</td>
                    <td className={`py-2 text-right text-[10px] font-mono ${
                      unit.speed === 0 ? 'text-red-400' : 'text-cyan-400'
                    }`}>
                      {unit.speed}
                    </td>
                    <td className="py-2 text-right">
                      <span className={`ews-tag text-[9px] ${
                        unit.statusColor === 'green' ? 'ews-tag-green' :
                        unit.statusColor === 'red' ? 'ews-tag-red' :
                        'ews-tag-amber'
                      }`}>
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vehicleMove {
          0% { left: 20%; top: 30%; }
          25% { left: 45%; top: 20%; }
          50% { left: 65%; top: 45%; }
          75% { left: 40%; top: 65%; }
          100% { left: 20%; top: 30%; }
        }
      `}</style>
    </div>
  );
}
