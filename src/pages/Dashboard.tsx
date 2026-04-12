import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Toast } from '../types';

interface DashboardProps {
  addToast: (message: string, type: Toast['type']) => void;
}

import {
  JAKARTA_CENTER,
  vulnerabilityZones,
  path1,
  path2,
  path3,
  tickerItems,
  timelineItems,
  patrolStatusUnits,
  riskScores
} from '../data/mockDashboard';

// Animated Patrol Unit Component
const MovingPatrolUnit = ({ path, color, label, duration = 20000 }: { path: [number, number][], color: string, label: string, duration?: number }) => {
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

export default function Dashboard({ addToast }: DashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Ticker */}
      <div className="relative bg-cyan-500/5 border-y border-cyan-500/20 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 bg-cyan-500 text-black px-3 flex items-center text-xs font-bold z-10">
          SIARAN LANGSUNG (JKT)
        </div>
        <div className="flex gap-10 py-2 pl-36 ews-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2 text-sm">
              <span className={item.color}>{item.icon}</span>
              <span className="text-gray-400">{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Insiden Aktif */}
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Membuka detail insiden aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Insiden Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">14</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400">▲ 2</span>
            <span className="text-gray-500">vs rata-rata</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🚨</div>
        </div>

        {/* Kasus Berjalan */}
        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Membuka daftar kasus berjalan', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kasus Berjalan</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">52</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">▼ 3</span>
            <span className="text-gray-500">diselesaikan hari ini</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">📁</div>
        </div>

        {/* Personel Bertugas */}
        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Membuka status personel', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Personel Bertugas</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">84</div>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ews-animate-blink" />
            <span>Online / 120 total</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">👮</div>
        </div>

        {/* Prediksi Risiko */}
        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Membuka analisis prediksi risiko', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Risiko Wilayah JKT</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">74</div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <span>▲ TINGGI TERDETEKSI</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🔮</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Map Container - Takes 2 columns */}
        <div className="col-span-2 ews-card flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-lg">🗺️</span>
              <span className="font-semibold text-sm uppercase tracking-tight">PETA OPERASIONAL REAL-TIME : DKI JAKARTA</span>
              <span className="ews-live-badge red">
                <span className="ews-live-dot" />
                LIVE
              </span>
            </div>
            <div className="flex gap-2">
              <button className="ews-btn ews-btn-cyan text-[10px] py-1 px-2">Sudirman-Thamrin</button>
              <button className="ews-btn ews-btn-cyan text-[10px] py-1 px-2">Tanah Abang - Senayan</button>
            </div>
          </div>
          
          <div className="relative flex-1 bg-[#070a12] overflow-hidden">
            <MapContainer 
              center={JAKARTA_CENTER} 
              zoom={14} 
              scrollWheelZoom={true}
              className="w-full h-full z-0"
              zoomControl={false}
              attributionControl={false}
            >
              {/* Dark Theme Tile Layer (CartoDB Dark Matter) */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              {/* Vulnerability Circles */}
              {vulnerabilityZones.map((zone, idx) => (
                <Circle 
                  key={idx}
                  center={zone.pos as [number, number]}
                  radius={zone.radius}
                  pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2, weight: 1 }}
                />
              ))}

              {/* Patrol Paths */}
              <Polyline positions={path1} pathOptions={{ color: '#10b981', weight: 1, dashArray: '5, 10', opacity: 0.5 }} />
              <Polyline positions={path2} pathOptions={{ color: '#06b6d4', weight: 1, dashArray: '5, 10', opacity: 0.5 }} />
              <Polyline positions={path3} pathOptions={{ color: '#f59e0b', weight: 1, dashArray: '5, 10', opacity: 0.5 }} />

              {/* Animated Patrol Units */}
              <MovingPatrolUnit path={path1} color="#10b981" label="5123-VII" duration={120000} />
              <MovingPatrolUnit path={path2} color="#06b6d4" label="4152-VII" duration={90000} />
              <MovingPatrolUnit path={path3} color="#f59e0b" label="Unit Sabhara P-01" duration={150000} />
            </MapContainer>

            {/* Map Overlay HUD */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-2 rounded flex flex-col gap-1">
                <div className="text-[10px] text-cyan-400 font-bold font-orbitron tracking-tighter">COORDS MONITORING</div>
                <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">LAT: 06° 11' 17" S</div>
                <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">LON: 106° 49' 31" E</div>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-3 rounded-lg flex flex-col gap-2">
                <div className="text-[10px] text-cyan-400 font-bold font-orbitron tracking-tighter mb-1 uppercase">Unit Identification</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] text-gray-400 font-mono">5123-VII (PATROLI 1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                  <span className="text-[10px] text-gray-400 font-mono">4152-VII (PATROLI 2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-[10px] text-gray-400 font-mono">P-01 (PATROLI 3)</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
               <div className="font-orbitron text-[10px] text-gray-600 tracking-[0.4em] uppercase">SEKTOR : JAKARTA PUSAT - SELATAN</div>
            </div>

            <div className="absolute bottom-4 right-4 z-[1000]">
              <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-3 rounded-lg flex flex-col gap-2">
                <div className="text-[10px] text-amber-400 font-bold font-orbitron tracking-tighter mb-1 uppercase">Zone Categories</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                  <span className="text-[10px] text-gray-400">Zona Kerawanan (Kritis)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-[10px] text-gray-400">Zona Waspada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Recent Incidents */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🚨</span>
              <span className="font-semibold text-sm text-gray-300">INSIDEN TERKINI (LIVE)</span>
            </div>
            <div className="ews-timeline">
              {timelineItems.map((item, idx) => (
                <div key={idx} className="ews-timeline-item">
                  <div 
                    className="ews-timeline-dot"
                    style={{ 
                      backgroundColor: item.color === 'red' ? '#ef4444' : item.color === 'amber' ? '#f59e0b' : item.color === 'green' ? '#10b981' : '#06b6d4',
                      borderColor: '#070a12'
                    }}
                  />
                  <div className="text-[10px] text-gray-500 font-mono mb-0.5">{item.time}</div>
                  <div className="text-sm text-gray-300 mb-1.5">{item.content}</div>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, tidx) => (
                      <span 
                        key={tidx} 
                        className={`ews-tag text-[9px] py-0 px-1.5 ${
                          tag === 'PRIORITAS TINGGI' ? 'ews-tag-red' : 
                          tag === 'SEDANG' ? 'ews-tag-amber' : 
                          tag === 'SELESAI' ? 'ews-tag-green' : 
                          'ews-tag-cyan'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Scores */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔮</span>
              <span className="font-semibold text-sm text-gray-300">INDOREK KERAWANAN WILAYAH</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {riskScores.map((risk, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border text-center cursor-pointer hover:opacity-80 transition-opacity ${
                    risk.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                    risk.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-emerald-500/10 border-emerald-500/30'
                  }`}
                  onClick={() => addToast(`Detail risiko ${risk.area}`, 'info')}
                >
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">{risk.area}</div>
                  <div className={`font-orbitron text-2xl font-bold ${
                    risk.color === 'red' ? 'text-red-400' :
                    risk.color === 'amber' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {risk.score}
                  </div>
                  <div className={`text-[9px] ${
                    risk.color === 'red' ? 'text-red-400' :
                    risk.color === 'amber' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {risk.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Crime Trend Chart */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📈</span>
            <span className="font-semibold text-sm text-gray-300">TREN KEJAHATAN (7 HARI)</span>
          </div>
          <svg viewBox="0 0 240 100" className="w-full h-24">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="20" x2="240" y2="20" stroke="rgba(6,182,212,0.1)" strokeWidth="1"/>
            <line x1="0" y1="50" x2="240" y2="50" stroke="rgba(6,182,212,0.1)" strokeWidth="1"/>
            <line x1="0" y1="80" x2="240" y2="80" stroke="rgba(6,182,212,0.1)" strokeWidth="1"/>
            <path d="M10,65 L45,55 L80,70 L115,40 L150,45 L185,30 L220,35 L220,90 L10,90 Z" fill="url(#areaGrad)" />
            <path d="M10,65 L45,55 L80,70 L115,40 L150,45 L185,30 L220,35" fill="none" stroke="#06b6d4" strokeWidth="1.5"/>
            <path d="M10,80 L45,72 L80,75 L115,60 L150,68 L185,55 L220,58 L220,90 L10,90 Z" fill="url(#areaGrad2)" />
            <path d="M10,80 L45,72 L80,75 L115,60 L150,68 L185,55 L220,58" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2"/>
            <circle cx="185" cy="30" r="3" fill="#06b6d4"/>
            <circle cx="220" cy="35" r="3" fill="#06b6d4"/>
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
              <text key={day} x={10 + i * 35} y="96" fill="rgba(122,168,200,0.5)" fontSize="8">{day}</text>
            ))}
          </svg>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-3 h-0.5 bg-cyan-500" />
              <span>Curanmor</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-3 h-0.5 bg-red-500" style={{ background: 'repeating-linear-gradient(90deg,#ef4444 0,#ef4444 4px,transparent 4px,transparent 6px)' }} />
              <span>Begal</span>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📱</span>
            <span className="font-semibold text-sm text-gray-300">SENTIMEN PUBLIK JKT (24 JAM)</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Positif', value: 38, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Netral', value: 29, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
              { label: 'Negatif', value: 24, color: 'bg-red-500', textColor: 'text-red-400' },
              { label: 'Provokasi', value: 9, color: 'bg-purple-500', textColor: 'text-purple-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16">{item.label}</span>
                <div className="flex-1 ews-progress-bar">
                  <div 
                    className={`ews-progress-fill ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className={`text-xs font-mono w-8 text-right ${item.textColor}`}>{item.value}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded">
            <div className="text-[10px] text-amber-400 font-semibold">⚠️ Konsentrasi Massa Terdeteksi</div>
            <div className="text-[11px] text-gray-400 mt-1">Area Monas & Patung Kuda +120% pergerakan</div>
          </div>
        </div>

        {/* Patrol Status */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🚔</span>
            <span className="font-semibold text-sm text-gray-300">STATUS PATROLI POLDA METRO</span>
          </div>
          <div className="space-y-2">
            {patrolStatusUnits.map((unit) => (
              <div 
                key={unit.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                  unit.statusColor === 'green' ? 'bg-emerald-500/5 border-emerald-500/20' :
                  unit.statusColor === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/20' :
                  'bg-amber-500/5 border-amber-500/20'
                }`}
                onClick={() => addToast(`Detail unit ${unit.id}`, 'info')}
              >
                <div>
                  <div className="text-xs font-semibold text-white">{unit.id} · {unit.type}</div>
                  <div className="text-[10px] text-gray-500">{unit.location}</div>
                </div>
                <span className={`ews-tag text-[9px] ${
                  unit.statusColor === 'green' ? 'ews-tag-green' :
                  unit.statusColor === 'cyan' ? 'ews-tag-cyan' :
                  'ews-tag-amber'
                }`}>
                  {unit.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
