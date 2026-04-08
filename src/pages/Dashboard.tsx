import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { Toast } from '../types';

interface DashboardProps {
  addToast: (message: string, type: Toast['type']) => void;
}

// Coordinates
const JAKARTA_CENTER: [number, number] = [-6.1786045056853, 106.83698404604189];

const vulnerabilityZones = [
  { pos: [-6.1884, 106.8150], radius: 600, color: '#ef4444' }, // Tanah Abang
  { pos: [-6.173, 106.835], radius: 500, color: '#f59e0b' },   // Senen Area
  { pos: [-6.165, 106.865], radius: 700, color: '#ef4444' },   // Kemayoran/Sunter (New)
];

// Patrol Paths (Only one active path as requested)
const path1: [number, number][] = [
  [-6.171322510246213, 106.82322308890963],
  [-6.180658081561788, 106.82144415477757],
  [-6.1806133070331555, 106.82229984461338],
  [-6.1807028560876205, 106.82320057075555],
  [-6.18043420887679, 106.8323429411036],
  [-6.172777706050539, 106.83002357128589],
  [-6.171053858275997, 106.83333373986034],
  [-6.172374729151485, 106.83412187523567],
  [-6.172956806796989, 106.83400928446895],
  [-6.17472542340964, 106.83265819525371],
  [-6.175486598361914, 106.83263567709963],
  [-6.17600151020973, 106.83252308633286],
  [-6.176471646676831, 106.83117199711762],
  [-6.175106011022521, 106.83065407958617],
  [-6.173471721103425, 106.83018119836095],
  [-6.173180682643974, 106.82941558113976],
  [-6.172800093647595, 106.82912284514373],
  [-6.172285178687375, 106.82919039960422],
  [-6.171613549727397, 106.82930299037298],
  [-6.171501611484629, 106.82896521806867],
  [-6.171456836180667, 106.8237410064412],
  [-6.171322510246213, 106.82322308890963],
];

const path2: [number, number][] = [
  [-6.184805221301545, 106.81493771691095],
  [-6.185734790824995, 106.81535686045316],
  [-6.186375872302264, 106.81556643222359],
  [-6.189004298230927, 106.81522789320923],
  [-6.192726347996853, 106.81462933211145],
  [-6.1977281214909254, 106.81425511392183],
  [-6.199753619584385, 106.81492039070355],
  [-6.20131679708544, 106.81552464644886],
  [-6.20243288124027, 106.8206251017757],
  [-6.203094263327813, 106.82257935232207],
  [-6.2003936145808325, 106.82311988970645],
  [-6.19573634089015, 106.82303673010904],
  [-6.1953229714156635, 106.82352182776265],
  [-6.196494184084159, 106.82475536179533],
  [-6.195639888041839, 106.82515729985033],
  [-6.194826927620724, 106.82521273958224],
  [-6.194482452488046, 106.82342480823189],
  [-6.194289546315673, 106.82287041091297],
  [-6.190332403196294, 106.82283185603518],
  [-6.187011625303441, 106.8228872957672],
  [-6.184710493114395, 106.82292887556594],
  [-6.183387682052768, 106.82287343583391],
  [-6.181968412338435, 106.8168027852011],
  [-6.184805221301545, 106.81493771691095]
];

const path3: [number, number][] = [
  [-6.174838551485436, 106.84544344477536],
  [-6.174749288519436, 106.85217723403963],
  [-6.171982129143416, 106.85229694584802],
  [-6.172011883621664, 106.85427219069936],
  [-6.172041638099486, 106.85561894855249],
  [-6.1717738477450155, 106.85696570640431],
  [-6.174183956058144, 106.85765404930737],
  [-6.173588868605478, 106.86019792525099],
  [-6.171268021151391, 106.8651958932831],
  [-6.172755745047482, 106.86597402004139],
  [-6.173440096637833, 106.86573459642358],
  [-6.17456740628478, 106.86456740628478],
  [-6.174749288519436, 106.86414841495258],
  [-6.176237002638857, 106.86423819880906],
  [-6.176415528052885, 106.87297716087653],
  [-6.170196857359059, 106.87414435101539],
  [-6.167548693136695, 106.87321658449434],
  [-6.166269238267432, 106.87585024429455],
  [-6.163680564324977, 106.87683786672028],
  [-6.154932538259942, 106.8621731701025],
  [-6.155378869608825, 106.85843217606703],
  [-6.164870760809251, 106.85223708994442],
  [-6.170524157635654, 106.84625149948806],
  [-6.174838551485436, 106.84544344477536]
];

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

// ... (tickerItems, timelineItems, patrolUnits, riskScores stay the same)
// Note: I'll include them in the final replacement for completeness as they were localized in the previous turn.

const tickerItems = [
  { icon: '🔴', text: 'Laporan 110 — Kecelakaan Beruntun Jl. Gajah Mada KM 3 · 14:32', color: 'text-red-400' },
  { icon: '🟡', text: 'Spike keywords "demo" +410% · Area Monas & Harmoni', color: 'text-amber-400' },
  { icon: '🟢', text: 'Patrol Unit SKT-01 sampai di titik rawan Tanah Abang · 14:28', color: 'text-emerald-400' },
  { icon: '🔵', text: 'Sinkronisasi Data CCTV Jakarta Smart City Berhasil · 1,240 titik aktif', color: 'text-cyan-400' },
];

const timelineItems = [
  { time: '14:38 WIB', content: 'Kecelakaan beruntun · Jl. Sudirman — Dukuh Atas', tags: ['PRIORITAS TINGGI', 'LANTAS'], color: 'red' as const },
  { time: '14:12 WIB', content: 'Laporan pencopetan · Area Pasar Tanah Abang Blok B', tags: ['SEDANG', 'RESKRIM'], color: 'amber' as const },
  { time: '13:55 WIB', content: 'Konsentrasi massa · Depan Gedung MK (Monas)', tags: ['MONITORING', 'INTELKAM'], color: 'cyan' as const },
  { time: '13:20 WIB', content: 'Patroli rutin Senayan · situasi kondusif', tags: ['SELESAI'], color: 'green' as const },
];

const patrolStatusUnits = [
  { id: '5123-VII', type: 'Sabhara', location: 'Menteng → Monas', status: 'PATROLI', statusColor: 'green' as const },
  { id: '4152-VII', type: 'Sabhara', location: 'Tanah Abang → HI', status: 'PATROLI', statusColor: 'green' as const },
  { id: 'P-01', type: 'Sabhara', location: 'Kemayoran → Sunter', status: 'PATROLI', statusColor: 'amber' as const },
  { id: 'BBK-12', type: 'Bhabinkamtibmas', location: 'Tanah Abang', status: 'STANDBY', statusColor: 'cyan' as const },
  { id: 'RSK-09', type: 'Reskrim', location: 'Senen — Olah TKP', status: 'BERTUGAS', statusColor: 'amber' as const },
];

const riskScores = [
  { area: 'TANAH ABANG', score: 89, level: 'KRITIS', color: 'red' as const },
  { area: 'SENEN', score: 72, level: 'WASPADA', color: 'amber' as const },
  { area: 'KOTA TUA', score: 65, level: 'WASPADA', color: 'amber' as const },
  { area: 'SENAYAN', score: 24, level: 'AMAN', color: 'green' as const },
];

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
