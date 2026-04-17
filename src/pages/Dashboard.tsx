import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/useAppStore';

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

export default function Dashboard() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const crimeTrendData = useMemo(() => {
    const days = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
    const curanmor = [65, 55, 70, 40, 45, 30, 35];
    const begal = [80, 72, 75, 60, 68, 55, 58];
    const xPoints = [20, 90, 160, 230, 300, 370, 440];
    
    return days.map((day, i) => ({
      day,
      curanmor: 100 - curanmor[i], // Normalize for values
      begal: 100 - begal[i],
      y1: curanmor[i],
      y2: begal[i],
      x: xPoints[i]
    }));
  }, []);

  const handleChartMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 480;
    
    // Find closest data point
    let closestIdx = 0;
    let minDiff = Math.abs(crimeTrendData[0].x - x);
    
    crimeTrendData.forEach((d, i) => {
      const diff = Math.abs(d.x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    
    setHoverIdx(closestIdx);
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Ticker */}
      <div className="relative bg-cyan-500/5 border-y border-cyan-500/20 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 bg-cyan-500 text-black px-4 flex items-center text-[13px] font-black z-10">
          LIVE FEED (JKT)
        </div>
        <div className="flex gap-12 py-3 pl-40 ews-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white">
              <i className={`${item.icon} ${item.color} text-[11px]`}></i>
              <span className="text-gray-400">{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Insiden Aktif */}
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Membuka detail insiden aktif', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Insiden Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">14</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400"><i className="fa-solid fa-caret-up"></i> 2</span>
            <span className="text-gray-500">vs rata-rata</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-red-500">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>

        {/* Kasus Berjalan */}
        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Membuka daftar kasus berjalan', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Kasus Berjalan</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">52</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400"><i className="fa-solid fa-caret-down"></i> 3</span>
            <span className="text-gray-500">diselesaikan hari ini</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-amber-500">
            <i className="fa-solid fa-folder-open"></i>
          </div>
        </div>

        {/* Personel Bertugas */}
        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Membuka status personel', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Personel Bertugas</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">84</div>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ews-animate-blink" />
            <span>Online / 120 total</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-user-shield"></i>
          </div>
        </div>

        {/* Prediksi Risiko */}
        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Membuka analisis prediksi risiko', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Risiko Wilayah JKT</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">74</div>
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <span><i className="fa-solid fa-tower-radar"></i> TINGGI TERDETEKSI</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-chart-line"></i>
          </div>
        </div>
      </div>

      {/* Main Map Container - Full Width */}
      <div className="ews-card flex flex-col h-[600px]">
        <div className="flex items-center justify-between p-6 relative z-10 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <i className="fa-solid fa-map-location-dot text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">PETA OPERASIONAL REAL-TIME</span>
              <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live Sensor Grid • Intelligence Matrix
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button className="ews-btn ews-btn-cyan text-[10px] py-1.5 px-3">Sudirman-Thamrin</button>
              <button className="ews-btn ews-btn-cyan text-[10px] py-1.5 px-3">Tanah Abang - Senayan</button>
            </div>
            <span className="ews-live-badge red">
              <span className="ews-live-dot" />
              LIVE
            </span>
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
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 p-2.5 rounded flex flex-col gap-1.5 shadow-2xl">
            <div className="text-[11px] text-cyan-400 font-bold font-orbitron tracking-tighter uppercase">Coordinate Monitoring</div>
            <div className="text-[11px] text-gray-400 font-mono tracking-widest uppercase">LAT: 06° 11' 17" S</div>
            <div className="text-[11px] text-gray-400 font-mono tracking-widest uppercase">LON: 106° 49' 31" E</div>
          </div>
          </div>

          <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-3.5 rounded-xl flex flex-col gap-2.5 shadow-2xl">
            <div className="text-[11px] text-cyan-400 font-bold font-orbitron tracking-tighter mb-1 uppercase tracking-[0.1em]">Unit Identification</div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[12px] text-gray-300 font-mono font-medium tracking-tight">5123-VII (PATROLI 1)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
              <span className="text-[12px] text-gray-300 font-mono font-medium tracking-tight">4152-VII (PATROLI 2)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              <span className="text-[12px] text-gray-300 font-mono font-medium tracking-tight">P-01 (PATROLI 3)</span>
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

      {/* Main Content Sections - 4 Column Layout */}
      <div className="grid grid-cols-3 gap-5 items-stretch">
        {/* Left Section (Take 3 Columns) */}
        <div className="col-span-2 space-y-5 flex flex-col">
          
          {/* Risk Scores Section (Horizontal Row) */}
          <div className="ews-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <i className="fa-solid fa-bullseye text-lg"></i>
                </div>
                <div>
                  <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">ANALISIS RISIKO WILAYAH</span>
                  <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    Vector Prediction • Intelligence Grid
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {riskScores.map((risk, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                    risk.color === 'red' ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                    risk.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                    'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  }`}
                  onClick={() => addToast(`Detail analisis risiko ${risk.area}`, 'info')}
                >
                  <div className="text-[14px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-black">{risk.area}</div>
                  <div className={`font-orbitron text-4xl font-black mb-1 ${
                    risk.color === 'red' ? 'text-red-400' :
                    risk.color === 'amber' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {risk.score}
                  </div>
                  <div className={`text-[13px] font-black tracking-[0.2em] uppercase ${
                    risk.color === 'red' ? 'text-red-500' :
                    risk.color === 'amber' ? 'text-amber-500' :
                    'text-emerald-500'
                  }`}>
                    {risk.level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Public Sentiment Section */}
            <div className="ews-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <i className="fa-solid fa-satellite-dish text-lg"></i>
                  </div>
                  <div>
                    <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">SENTIMEN PUBLIK JKT</span>
                    <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      Social Sensing • Pattern Recognition
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 flex-1 flex flex-col justify-center">
                {[
                  { label: 'Positif', value: 38, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: 'Netral', value: 29, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
                  { label: 'Negatif', value: 24, color: 'bg-red-500', textColor: 'text-red-400' },
                  { label: 'Provokasi', value: 9, color: 'bg-purple-500', textColor: 'text-purple-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-[13px] uppercase font-black text-gray-500 w-24">{item.label}</span>
                    <div className="flex-1 ews-progress-bar h-2">
                      <div 
                        className={`ews-progress-fill ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className={`text-[13px] font-mono font-black w-12 text-right ${item.textColor}`}>{item.value}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <div className="text-[11px] text-amber-500 font-black uppercase tracking-widest">⚠️ Massa Terdeteksi</div>
                <div className="text-[12px] text-gray-500 mt-1 leading-tight">Area Monas & Patung Kuda +120% pergerakan aktif</div>
              </div>
            </div>

            {/* Patrol Status Section */}
            <div className="ews-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <i className="fa-solid fa-car-on text-lg"></i>
                  </div>
                  <div>
                    <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">UNIT PATROLI LAPANGAN</span>
                    <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Fleet Ready • Deployment Matrix
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 flex-1 overflow-auto max-h-[250px] ews-scrollbar pr-1">
                {patrolStatusUnits.map((unit) => (
                  <div 
                    key={unit.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:border-white/20 transition-all duration-300 ${
                      unit.statusColor === 'green' ? 'bg-emerald-500/5 border-emerald-500/10' :
                      unit.statusColor === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/10' :
                      'bg-amber-500/5 border-amber-500/10'
                    }`}
                    onClick={() => addToast(`Detail unit ${unit.id}`, 'info')}
                  >
                    <div>
                      <div className="text-[15px] font-black text-white uppercase tracking-tight mb-0.5">{unit.id} · {unit.type}</div>
                      <div className="text-[12px] text-gray-500 font-mono font-medium uppercase tracking-wide">{unit.location}</div>
                    </div>
                    <span className={`ews-tag text-[12px] px-2 py-1 font-black tracking-tight ${
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

          {/* Crime Trend Chart - Full Width */}
          <div className="ews-card p-6 flex flex-col flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <i className="fa-solid fa-chart-area text-lg"></i>
                </div>
                <div>
                  <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">TREN KEJAHATAN (7 HARI)</span>
                  <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    Cumulative Data • Statistical Projection
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center min-h-[220px]">
              <svg 
                viewBox="0 0 480 100" 
                className="w-full h-48 overflow-visible cursor-crosshair"
                onMouseMove={handleChartMouseMove}
                onMouseLeave={() => setHoverIdx(null)}
              >
                {/* Horizontal Grid Lines */}
                {[0, 25, 50, 75, 100].map(y => (
                  <line 
                    key={y} 
                    x1="0" y1={y} x2="480" y2={y} 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="1" 
                  />
                ))}
                
                {/* Vertical Step Markers */}
                {crimeTrendData.map((d, i) => (
                  <line 
                    key={i} 
                    x1={d.x} y1="0" x2={d.x} y2="100" 
                    stroke={hoverIdx === i ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.03)'} 
                    strokeWidth={hoverIdx === i ? 2 : 1} 
                    className="transition-all duration-300"
                  />
                ))}

                {/* Scanline Guide */}
                {hoverIdx !== null && (
                  <line 
                    x1={crimeTrendData[hoverIdx].x} y1="0" x2={crimeTrendData[hoverIdx].x} y2="105" 
                    stroke="#22d3ee" 
                    strokeWidth="1" 
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                )}

                {/* Primary Data Line (Curanmor) */}
                <path 
                  d={`M${crimeTrendData.map(d => `${d.x},${d.y1}`).join(' L')}`} 
                  fill="none" 
                  stroke="#22d3ee" 
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
                
                {/* Predictive Data Line (Begal) */}
                <path 
                  d={`M${crimeTrendData.map(d => `${d.x},${d.y2}`).join(' L')}`} 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,3"
                  strokeLinecap="round"
                  className="transition-all duration-500 opacity-70"
                />
                
                {/* Standard Markers */}
                <circle cx="440" cy="35" r="2" fill="#22d3ee" />
                <circle cx="440" cy="58" r="2" fill="#fbbf24" />

                {/* Interactive Tooltip & Markers */}
                {hoverIdx !== null && (
                  <g>
                    <circle cx={crimeTrendData[hoverIdx].x} cy={crimeTrendData[hoverIdx].y1} r="4" fill="#22d3ee" className="animate-pulse" />
                    <circle cx={crimeTrendData[hoverIdx].x} cy={crimeTrendData[hoverIdx].y2} r="4" fill="#fbbf24" className="animate-pulse" />
                    
                    <foreignObject 
                      x={crimeTrendData[hoverIdx].x > 300 ? crimeTrendData[hoverIdx].x - 170 : crimeTrendData[hoverIdx].x + 15} 
                      y="5" width="160" height="90"
                      className="pointer-events-none"
                    >
                      <div className="bg-gray-900/95 border border-cyan-500/30 p-2.5 rounded-lg backdrop-blur-md shadow-2xl flex flex-col gap-1.5">
                        <div className="text-[10px] text-cyan-400 font-mono font-black uppercase tracking-widest border-b border-cyan-500/10 pb-1 italic">
                          TREN_HARI: {crimeTrendData[hoverIdx].day}
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-orbitron text-gray-100 font-bold">
                          <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Curanmor</span>
                          <span className="text-cyan-400 font-black">{crimeTrendData[hoverIdx].curanmor}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-orbitron text-gray-100 font-bold">
                          <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Begal (AI)</span>
                          <span className="text-amber-400 font-black">{crimeTrendData[hoverIdx].begal}</span>
                        </div>
                        <div className="mt-1 h-1 w-full bg-gray-800 rounded-full overflow-hidden flex">
                          <div style={{ width: `${crimeTrendData[hoverIdx].curanmor}%` }} className="bg-cyan-500 h-full" />
                          <div style={{ width: `${crimeTrendData[hoverIdx].begal}%` }} className="bg-amber-500 h-full opacity-50" />
                        </div>
                      </div>
                    </foreignObject>
                  </g>
                )}

                {crimeTrendData.map((d, i) => (
                  <text 
                    key={d.day} 
                    x={d.x} y="115" 
                    fill={hoverIdx === i ? '#22d3ee' : 'rgba(148, 163, 184, 0.5)'}
                    fontSize="10" 
                    fontWeight={hoverIdx === i ? 'black' : 'bold'}
                    textAnchor="middle"
                    className="font-mono tracking-tighter transition-all duration-300"
                  >
                    {d.day}
                  </text>
                ))}
              </svg>

              <div className="flex gap-8 mt-10 justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm bg-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.2)]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest leading-none">Curanmor</span>
                    <span className="text-[9px] text-gray-600 font-mono tracking-tighter">DATA_HISTORIS</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm border border-dashed border-[#fbbf24] bg-[#fbbf24]/20" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest leading-none">Begal</span>
                    <span className="text-[9px] text-amber-500/50 font-mono tracking-tighter">PREDIKSI_AI_VECTOR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (Takes 1 Column) - Elongated */}
        <div className="col-span-1 flex flex-col">
          <div className="ews-card p-6 flex-1 flex flex-col shadow-2xl border-cyan-500/10">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <i className="fa-solid fa-bolt-lightning text-lg"></i>
                </div>
                <div>
                  <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">INSIDEN TERKINI</span>
                  <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live Feed • High Priority Active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 ews-timeline overflow-auto ews-scrollbar space-y-3">
              {timelineItems.map((item, idx) => {
                // Get dynamic icon based on content/tags
                const icon = item.tags.includes('LANTAS') ? 'fa-solid fa-car-burst' : 
                             item.tags.includes('RESKRIM') ? 'fa-solid fa-fingerprint' : 
                             item.tags.includes('INTELKAM') ? 'fa-solid fa-masks-theater' : 
                             item.tags.includes('MONITORING') ? 'fa-solid fa-display' : 
                             'fa-solid fa-triangle-exclamation';
                
                const priorityColor = item.color === 'red' ? 'border-red-500' : 
                                      item.color === 'amber' ? 'border-amber-500' : 
                                      item.color === 'green' ? 'border-emerald-500' : 'border-cyan-500';
                
                                  item.color === 'amber' ? 'shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 
                                  'shadow-[0_0_10px_rgba(6,182,212,0.15)]';

                return (
                  <div 
                    key={idx} 
                    className={`
                      relative p-4 rounded-lg bg-[#0a0f1a] border border-gray-800/50 border-l-4 ${priorityColor}
                      hover:bg-gray-800/40 transition-all duration-300 group cursor-pointer
                    `}
                  >
                    {/* Time & Type Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-6 h-6 rounded bg-gray-900 border border-gray-800 ${item.color === 'red' ? 'text-red-400' : item.color === 'amber' ? 'text-amber-400' : 'text-cyan-400'}`}>
                          <i className={`${icon} text-[10px]`}></i>
                        </div>
                        <span className="text-[12px] font-mono font-bold text-gray-500">{item.time}</span>
                      </div>
                      {idx === 0 && (
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-500/5 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] ews-animate-blink" />
                          <span className="text-[11px] font-black text-red-500 tracking-widest">LIVE FEED</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="text-[16px] font-semibold text-gray-200 leading-normal mb-3 group-hover:text-cyan-400 transition-colors">
                      {item.content}
                    </div>

                    {/* Footer Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tidx) => (
                        <span 
                          key={tidx} 
                          className={`
                            text-[13px] font-black uppercase px-2.5 py-1 rounded bg-gray-900 border border-gray-800/50
                            ${tag === 'PRIORITAS TINGGI' ? 'text-red-500' : 
                              tag === 'SEDANG' ? 'text-amber-500' : 
                              tag === 'SELESAI' ? 'text-emerald-500' : 
                              'text-cyan-500'}
                          `}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <button 
                className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 rounded text-[12px] font-black text-cyan-400 uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                onClick={() => addToast('Mengunduh laporan insiden lengkap', 'info')}
              >
                Unduh Rekap Laporan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
