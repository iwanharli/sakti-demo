import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/useAppStore';

import { 
  JAKARTA_CENTER, 
  vulnerabilityZones, 
  path1, 
  path2, 
  path3 
} from '../data/mockDashboard';
import { patrolRoutes, gpsTracking } from '../data/mockCrimeMapping';

// Component to track map movement for HUD
const MapMonitor = ({ onMove }: { onMove: (coords: [number, number]) => void }) => {
  useMapEvents({
    move: (e) => {
      const center = e.target.getCenter();
      onMove([center.lat, center.lng]);
    },
  });
  return null;
};

// Animated Patrol Unit Component (Reused from Dashboard but specialized)
const MovingPatrolUnit = ({ path, color, label, duration = 60000 }: { path: [number, number][], color: string, label: string, duration?: number }) => {
  const [pos, setPos] = useState<[number, number]>(path[0]);
  
  useEffect(() => {
    let startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % duration;
      const progress = elapsed / duration;
      const totalPoints = path.length - 1;
      const step = progress * totalPoints;
      const index = Math.floor(step);
      const nextIndex = (index + 1) % path.length;
      const stepProgress = step - index;
      const p1 = path[index];
      const p2 = path[nextIndex];
      const currentLat = p1[0] + (p2[0] - p1[0]) * stepProgress;
      const currentLng = p1[1] + (p2[1] - p1[1]) * stepProgress;
      setPos([currentLat, currentLng]);
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [path, duration]);

  const unitIcon = useMemo(() => L.divIcon({
    className: 'custom-unit-icon',
    html: `
      <div class="ews-patrol-marker">
        <div style="color: ${color}; background-color: ${color};" class="ews-marker-dot"></div>
        <div class="ews-marker-label">${label}</div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }), [color, label]);

  return <Marker position={pos} icon={unitIcon} />;
};

export default function CrimeMapping() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [mapFilter, setMapFilter] = useState('heat');
  const [currentCoords, setCurrentCoords] = useState<[number, number]>(JAKARTA_CENTER);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilterChange = (filter: string) => {
    setMapFilter(filter);
    addToast(`Mode peta: ${filter.toUpperCase()} diaktifkan`, 'info');
  };

  const formatCoord = (coord: number, isLat: boolean) => {
    const dir = isLat ? (coord < 0 ? 'S' : 'N') : (coord < 0 ? 'W' : 'E');
    const absCoord = Math.abs(coord);
    const deg = Math.floor(absCoord);
    const min = Math.floor((absCoord - deg) * 60);
    const sec = Math.floor(((absCoord - deg) * 60 - min) * 60);
    return `${deg}° ${min}' ${sec}" ${dir}`;
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-cyan-500 bg-cyan-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,211,234,0.1)]">
              <i className="fa-solid fa-map-location-dot text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Integrasi data GPS real-time dari unit operasional Sabhara & Lantas yang dipadukan dengan koordinat laporan 110 untuk visualisasi kepadatan ancaman spasial secara dinamis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail zona merah aktif', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Zona Merah Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">3</div>
          <div className="text-sm text-gray-500">Risiko sangat tinggi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-20 text-red-500">
            <i className="fa-solid fa-fire-flame-curved"></i>
          </div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail unit patroli aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Unit Patroli Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">8</div>
          <div className="text-sm text-gray-500">GPS Terpantau</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-car-on"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail rute patroli optimal', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rute Patroli Optimal</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">4</div>
          <div className="text-sm text-gray-500">Diperbarui AI 30 mnt lalu</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-route"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail laporan 110 masuk', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Laporan 110 Masuk</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">17</div>
          <div className="text-sm text-gray-500">Hari ini · 3 belum direspon</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl opacity-20 text-amber-500">
            <i className="fa-solid fa-phone-volume"></i>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Big Interactive Map */}
        <div className="col-span-2 ews-card flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400"><i className="fa-solid fa-map-location-dot"></i></span>
              <span className="font-semibold text-[15px] uppercase tracking-tight">INTERACTIVE STRATEGIC MAP — POLRES KOTA METRO</span>
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
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${
                    mapFilter === filter
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
                  }`}
                >
                  {filter === 'heat' ? 'Heatmap' : filter === 'patrol' ? 'Patroli' : 'Insiden'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative flex-1 min-h-[500px] bg-[#070a12] overflow-hidden">
            <MapContainer 
              center={JAKARTA_CENTER} 
              zoom={14} 
              scrollWheelZoom={true}
              className="w-full h-full z-0"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              <MapMonitor onMove={setCurrentCoords} />

              {/* Dynamic Overlays based on Filter */}
              {mapFilter === 'heat' && vulnerabilityZones.map((zone, idx) => (
                <Circle 
                  key={idx}
                  center={zone.pos as [number, number]}
                  radius={zone.radius}
                  pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.15, weight: 1 }}
                />
              ))}

              {mapFilter === 'patrol' && (
                <>
                  <Polyline positions={path1} pathOptions={{ color: '#10b981', weight: 1, dashArray: '5, 10', opacity: 0.4 }} />
                  <Polyline positions={path2} pathOptions={{ color: '#06b6d4', weight: 1, dashArray: '5, 10', opacity: 0.4 }} />
                  <Polyline positions={path3} pathOptions={{ color: '#f59e0b', weight: 1, dashArray: '5, 10', opacity: 0.4 }} />
                  <MovingPatrolUnit path={path1} color="#10b981" label="SKT-01" duration={90000} />
                  <MovingPatrolUnit path={path2} color="#06b6d4" label="LNT-02" duration={70000} />
                  <MovingPatrolUnit path={path3} color="#f59e0b" label="SKT-03" duration={120000} />
                </>
              )}

              {mapFilter === 'incidents' && (
                <Marker position={[-6.1884, 106.8150]} icon={L.divIcon({
                  className: 'custom-incident-icon',
                  html: '<div class="ews-animate-pulse-red w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>'
                })} />
              )}
            </MapContainer>

            {/* Tactical HUD Overlays - Reused from Dashboard style */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 p-3 rounded-lg flex flex-col gap-1.5 shadow-2xl">
                <div className="text-[10px] text-cyan-400 font-bold font-orbitron tracking-tighter uppercase">Coordinate Stream</div>
                <div className="text-[11px] text-gray-200 font-mono tracking-widest uppercase">{formatCoord(currentCoords[0], true)}</div>
                <div className="text-[11px] text-gray-200 font-mono tracking-widest uppercase">{formatCoord(currentCoords[1], false)}</div>
                <div className="mt-2 h-px bg-cyan-900/50 w-full" />
                <div className="text-[9px] text-cyan-600 font-mono">SECTOR: JKT-CENTRAL-01</div>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md border border-gray-800 p-3 rounded-lg flex flex-col gap-2 shadow-2xl overflow-hidden">
                <div className="text-[10px] text-cyan-400 font-bold font-orbitron tracking-tighter mb-1 uppercase">Map Legend</div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Critical Zone</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Warning Zone</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-0.5 bg-cyan-500/50" style={{ borderStyle: 'dashed', borderWidth: '0 0 1px 0' }} />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Patrol Route</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000]">
              <div className="bg-black/70 backdrop-blur-md border border-gray-800 px-3 py-1.5 rounded flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ews-animate-blink" />
                  <span className="text-[10px] text-gray-300 font-bold">GPS: SYNCED</span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="text-[10px] text-gray-500 font-mono">ENCRYPTION: AES-256-MIL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Smart Patrol Routing */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-cyan-400"><i className="fa-solid fa-diamond-turn-right"></i></span>
              <span className="font-semibold text-[15px] text-gray-300 uppercase tracking-tight">AI Patrol Optimization</span>
            </div>
            <div className="space-y-3">
              {patrolRoutes.map((route) => (
                <div 
                  key={route.id}
                  className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/30 cursor-pointer transition-all duration-300 group shadow-lg"
                  onClick={() => addToast(`Detail rute ${route.unit}`, 'info')}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-widest">{route.unit} — ROUTE {route.id}</span>
                    <span className={`ews-tag text-[9px] px-1.5 py-0 ${
                      route.statusColor === 'red' ? 'ews-tag-red' : 'ews-tag-amber'
                    }`}>
                      {route.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-2 leading-relaxed italic">{route.route}</div>
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-gray-400 font-mono">EST: {route.time}</span>
                    <span className="text-cyan-600 font-mono">DIST: {route.distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live GPS Tracking Table */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-cyan-400"><i className="fa-solid fa-satellite-dish"></i></span>
              <span className="font-semibold text-[15px] text-gray-300 uppercase tracking-tight">Active Asset Feed</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-800/50">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th className="text-left py-2 px-3 text-gray-500 font-black uppercase tracking-widest">Asset</th>
                    <th className="text-left py-2 px-1 text-gray-500 font-black uppercase tracking-widest text-center">KM/H</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-black uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {gpsTracking.map((unit, idx) => (
                    <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-100">{unit.unit}</div>
                        <div className="text-[9px] text-gray-500">{unit.location}</div>
                      </td>
                      <td className={`py-2.5 px-1 text-center font-mono font-bold ${
                        unit.speed === 0 ? 'text-red-500' : 'text-cyan-400'
                      }`}>
                        {unit.speed}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`ews-tag text-[9px] px-1.5 ${
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
      </div>
    </div>
  );
}
