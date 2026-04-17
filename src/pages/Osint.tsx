import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import ForceGraph2D from 'react-force-graph-2d';

import { keywordAlerts } from '../data/mockOsint';

export default function Osint() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 1000, height: 550 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setGraphDimensions({
          width: containerRef.current.clientWidth,
          height: 550
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [mounted]);

  // Network Graph Data
  const graphData = useMemo(() => ({
    nodes: [
      { id: 'hub', name: '@provk_01 (HUB)', type: 'primary', val: 30, icon: 'skull' },
      { id: 'acct_a', name: '@acct_A', type: 'transmitter', val: 18, icon: 'user' },
      { id: 'acct_b', name: '@acct_B', type: 'transmitter', val: 18, icon: 'twitter' },
      { id: 'acct_c', name: '@acct_C', type: 'passive', val: 14, icon: 'facebook' },
      { id: 'acct_d', name: '@acct_D', type: 'passive', val: 14, icon: 'tiktok' },
      { id: 'acct_e', name: '@acct_E', type: 'passive', val: 12, icon: 'instagram' },
      { id: 'acct_f', name: '@acct_F', type: 'passive', val: 12, icon: 'youtube' },
    ],
    links: [
      { source: 'hub', target: 'acct_a', value: 3 },
      { source: 'hub', target: 'acct_b', value: 3 },
      { source: 'acct_a', target: 'acct_c', value: 2 },
      { source: 'acct_b', target: 'acct_d', value: 2 },
      { source: 'acct_a', target: 'acct_e', value: 1 },
      { source: 'acct_b', target: 'acct_f', value: 1 },
    ]
  }), []);

  // Dynamic Sentiment Data Generator
  const sentimentData = useMemo(() => {
    const pointsCount = timeRange === '24h' ? 24 : 21;
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < pointsCount; i++) {
      const x = (i / (pointsCount - 1)) * 1000;
      let label = '';
      let fullTime = '';
      
      if (timeRange === '24h') {
        const h = i === pointsCount - 1 ? 'NOW' : `${String(i).padStart(2, '0')}:00`;
        label = i % 6 === 0 ? h : '';
        fullTime = h;
      } else {
        const dayOffset = Math.floor(i / 3);
        const d = new Date();
        d.setDate(now.getDate() - (6 - dayOffset));
        const dayName = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }).toUpperCase();
        label = i % 3 === 0 ? dayName : '';
        fullTime = dayName + (i % 3 === 0 ? '' : ` (S${i%3})`);
      }

      // Procedural tactical values
      const seed = timeRange === '24h' ? 0.4 : 0.7;
      const posVal = 40 + Math.sin(i * seed) * 15 + (i * 0.5);
      const negVal = 70 + Math.cos(i * seed) * 10 - (i * 0.3);

      data.push({
        x,
        time: label,
        fullTime: i === pointsCount - 1 ? 'NOW' : fullTime,
        pos: Math.max(10, Math.min(100, posVal)),
        neg: Math.max(30, Math.min(110, negVal))
      });
    }
    
    // Ensure last label is always NOW
    data[data.length - 1].time = 'NOW';
    
    return data;
  }, [timeRange]);

  // Generate SVG Path Strings from Data
  const posPath = `M${sentimentData.map(d => `${d.x},${d.pos}`).join(' L')}`;
  const negPath = `M${sentimentData.map(d => `${d.x},${d.neg}`).join(' L')}`;
  const posArea = `${posPath} L1000,110 L0,110 Z`;
  const negArea = `${negPath} L1000,110 L0,110 Z`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1000;
    
    // Find closest point
    let closestIdx = 0;
    let minDiff = Math.abs(sentimentData[0].x - x);
    
    sentimentData.forEach((d, i) => {
      const diff = Math.abs(d.x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    
    setHoverIdx(closestIdx);
  };

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-cyan-500 bg-cyan-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,211,234,0.1)]">
              <i className="fa-solid fa-satellite-dish text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Data bersumber dari intersep sinyal OSINT platform media sosial global (X, Meta, TikTok) yang diolah melalui mesin Natural Language Processing (NLP) untuk deteksi sentimen dan analisis jaringan aktor secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end pr-4">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Source</span>
              <span className="font-orbitron text-lg font-bold text-cyan-400">SOCIAL MEDIA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-5">
        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail postingan dipantau', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Postingan Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">24.7K</div>
          <div className="text-[13px] text-gray-500">Dalam 24 jam terakhir</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-purple-500">
            <i className="fa-solid fa-earth-americas"></i>
          </div>
        </div>

        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail alert provokasi', 'alert')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Alert Provokasi</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">7</div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-red-400 uppercase font-black">▲ 3 INCR</span>
            <span className="text-gray-500 italic">vs kemarin</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-bolt-lightning"></i>
          </div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail akun dipantau', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Akun Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">312</div>
          <div className="text-[13px] text-gray-500 italic">Berpotensi provokatif</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail platform aktif', 'info')}>
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Platform Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">6</div>
          <div className="text-[13px] text-gray-500">X · FB · TikTok · IG · TH · YT</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-mobile-screen-button"></i>
          </div>
        </div>
      </div>

      {/* Real-time Sentiment - Full Width */}
        <div className="ews-card p-6 relative overflow-hidden group">
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <i className="fa-solid fa-chart-line text-xl"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-wider block">SENTIMENT SURVEILLANCE HUB</span>
                <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Sensing Active • Intelligence Window
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              {/* Time Range Selector */}
              <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-800 backdrop-blur-sm">
                <button 
                  onClick={() => setTimeRange('24h')}
                  className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${timeRange === '24h' ? 'bg-cyan-500 text-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  24H
                </button>
                <button 
                  onClick={() => setTimeRange('7d')}
                  className={`px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded transition-all ${timeRange === '7d' ? 'bg-cyan-500 text-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  7D
                </button>
              </div>

              <div className="flex gap-6">
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Confidence</div>
                  <div className="text-[15px] font-orbitron text-emerald-400 font-bold">98.2%</div>
                </div>
                <div className="w-px h-10 bg-gray-800" />
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Active Sources</div>
                  <div className="text-[15px] font-orbitron text-cyan-400 font-bold">1.4K</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mb-8">
            {/* HUD Markings */}
            <div className="absolute -left-2 top-0 bottom-0 w-px bg-cyan-500/10" />
            <div className="absolute left-0 right-0 -bottom-2 h-px bg-cyan-500/10" />
            
            <svg 
              viewBox="0 0 1000 140" 
              className="w-full h-56 cursor-crosshair" 
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <defs>
                <linearGradient id="neonPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="neonNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Grid Lines */}
              {[25, 55, 85].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(6,182,212,0.05)" strokeWidth="1" strokeDasharray={y === 55 ? "0" : "4 4"} />
              ))}
              
              {/* Neon Area Paths */}
              <path d={posArea} fill="url(#neonPos)"/>
              <path d={posPath} fill="none" stroke="#10b981" strokeWidth="2.5" filter="url(#glow)"/>
              
              <path d={negArea} fill="url(#neonNeg)"/>
              <path d={negPath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" filter="url(#glow)"/>

              {/* Scanline / Interactive Marker */}
              {hoverIdx !== null ? (
                <g>
                  <line x1={sentimentData[hoverIdx].x} y1="0" x2={sentimentData[hoverIdx].x} y2="120" stroke="#06b6d4" strokeWidth="1.5" />
                  <circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].pos} r="5" fill="#10b981" filter="url(#glow)" />
                  <circle cx={sentimentData[hoverIdx].x} cy={sentimentData[hoverIdx].neg} r="5" fill="#ef4444" filter="url(#glow)" />
                  
                  {/* Tactical Tooltip inside SVG */}
                  <foreignObject x={sentimentData[hoverIdx].x > 800 ? sentimentData[hoverIdx].x - 160 : sentimentData[hoverIdx].x + 10} y="20" width="150" height="80">
                    <div className="bg-gray-900/90 border border-cyan-500/50 p-2 rounded backdrop-blur-md shadow-2xl">
                      <div className="text-[10px] text-cyan-400 font-mono font-black mb-1 italic">INTERSEPSI: {sentimentData[hoverIdx].time}</div>
                      <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">Positif</span>
                        <span className="text-[12px] font-orbitron text-emerald-400 font-bold">{(100 - sentimentData[hoverIdx].pos).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[8px] text-gray-400 uppercase font-bold">Negatif</span>
                        <span className="text-[12px] font-orbitron text-red-400 font-bold">{(100 - sentimentData[hoverIdx].neg).toFixed(2)}%</span>
                      </div>
                    </div>
                  </foreignObject>
                </g>
              ) : (
                <g>
                  <line x1="940" y1="10" x2="940" y2="120" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" className="animate-pulse" />
                  <circle cx="940" cy="27" r="4" fill="#06b6d4" className="animate-ping" />
                  <circle cx="940" cy="27" r="2" fill="#06b6d4" />
                </g>
              )}

              {/* Axis Labels */}
              <g className="text-[9px] fill-gray-500 font-black">
                {sentimentData.map((d, i) => d.time && (
                  <text key={i} x={d.x} y="132" textAnchor={i === 0 ? 'start' : i === sentimentData.length - 1 ? 'end' : 'middle'} fill={d.time === 'NOW' ? '#06b6d4' : 'currentColor'}>
                    {d.time}
                  </text>
                ))}
              </g>
            </svg>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-black uppercase tracking-widest">
                <div className="w-6 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
                <span>Positive Sentiment</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-black uppercase tracking-widest">
                <div className="w-6 h-1 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" style={{ background: 'repeating-linear-gradient(90deg,#ef4444 0,#ef4444 6px,transparent 6px,transparent 10px)' }} />
                <span>Negative Sentiment</span>
              </div>
            </div>
            <div className="text-[10px] text-cyan-500 font-mono font-bold animate-pulse">
              [+] DATA TRACE ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { platform: 'TWITTER / X', value: '12.4K', icon: 'fa-brands fa-x-twitter', color: 'text-white', pos: 72, neg: 28 },
              { platform: 'FACEBOOK', value: '8.1K', icon: 'fa-brands fa-facebook', color: 'text-blue-400', pos: 54, neg: 46 },
              { platform: 'TIKTOK', value: '4.2K', icon: 'fa-brands fa-tiktok', color: 'text-pink-400', pos: 81, neg: 19 },
              { platform: 'INSTAGRAM', value: '15.2K', icon: 'fa-brands fa-instagram', color: 'text-white', pos: 68, neg: 32 },
              { platform: 'THREADS', value: '2.1K', icon: 'fa-brands fa-threads', color: 'text-white', pos: 45, neg: 55 },
              { platform: 'YOUTUBE', value: '9.8K', icon: 'fa-brands fa-youtube', color: 'text-red-500', pos: 62, neg: 38 },
            ].map((item) => (
              <div key={item.platform} className="p-5 bg-gray-900 border border-gray-800 rounded-xl group hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all duration-500 cursor-pointer relative overflow-hidden">
                {/* Decorative background icon */}
                <i className={`${item.icon} absolute -right-4 -bottom-4 text-6xl opacity-[0.03] group-hover:opacity-[0.07] transition-all`}></i>
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 ${item.color}`}>
                    <i className={`${item.icon} text-xl`}></i>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-500/50 font-bold">STREAMING</div>
                </div>
                
                <div className="text-[11px] text-gray-500 mb-1 uppercase font-black tracking-widest">{item.platform}</div>
                <div className="font-orbitron text-3xl font-bold text-gray-100 mb-5">{item.value}</div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black font-mono tracking-tighter">
                    <span className="text-emerald-500">POS {item.pos}%</span>
                    <span className="text-red-500">NEG {item.neg}%</span>
                  </div>
                  <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-800 border border-gray-700/50">
                    <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${item.pos}%` }} />
                    <div className="bg-red-500 h-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${item.neg}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ews-card p-7 relative overflow-hidden group">
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="flex items-center justify-between mb-8 relative z-10 border-b border-gray-800/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <i className="fa-solid fa-share-nodes text-2xl"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-wider block">SOCIAL NETWORK SURVEILLANCE</span>
                <span className="text-[11px] text-red-500/70 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Tracing Node Dependencies • Critical Vector Found
                </span>
              </div>
            </div>
            
            <div className="flex gap-10">
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Critical Hubs</div>
                <div className="text-[20px] font-orbitron text-red-500 font-bold flex items-center justify-end gap-2">
                  03 <i className="fa-solid fa-tower-broadcast text-xs opacity-50"></i>
                </div>
              </div>
              <div className="w-px h-12 bg-gray-800" />
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Vectors</div>
                <div className="text-[20px] font-orbitron text-amber-500 font-bold flex items-center justify-end gap-2">
                  1.2K <i className="fa-solid fa-users-rays text-xs opacity-50"></i>
                </div>
              </div>
              <div className="w-px h-12 bg-gray-800" />
              <div className="text-right">
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">System Status</div>
                <div className="text-[11px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-1 border border-cyan-500/20 rounded mt-1">
                  SECURE TRACE
                </div>
              </div>
            </div>
          </div>

          <div ref={containerRef} className="relative flex justify-center items-center h-[550px] bg-black rounded-xl border border-gray-800/50 overflow-hidden group/graph">
            {/* HUD Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/20 z-10 pointer-events-none group-hover/graph:border-cyan-500/50 transition-colors" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/20 z-10 pointer-events-none group-hover/graph:border-cyan-500/50 transition-colors" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/20 z-10 pointer-events-none group-hover/graph:border-cyan-500/50 transition-colors" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/20 z-10 pointer-events-none group-hover/graph:border-cyan-500/50 transition-colors" />

            {/* Dynamic Interactive Graph */}
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              width={graphDimensions.width}
              height={graphDimensions.height}
              backgroundColor="transparent"
              nodeLabel="name"
              nodeRelSize={8}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const { x, y, type, name, val } = node;
                const color = type === 'primary' ? '#ef4444' : type === 'transmitter' ? '#f59e0b' : '#06b6d4';
                
                // Glow effect optimization
                ctx.shadowBlur = 12 / globalScale;
                ctx.shadowColor = color;
                
                // Tactical Rings
                ctx.beginPath();
                ctx.arc(x, y, val / globalScale, 0, 2 * Math.PI, false);
                ctx.fillStyle = `${color}33`;
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.5 / globalScale;
                ctx.stroke();

                // Inner core
                ctx.shadowBlur = 0;
                ctx.beginPath();
                ctx.arc(x, y, (val * 0.4) / globalScale, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();

                if (type === 'primary') {
                  ctx.beginPath();
                  ctx.arc(x, y, (val * 1.4) / globalScale, 0, 2 * Math.PI, false);
                  ctx.setLineDash([4, 12]);
                  ctx.strokeStyle = `${color}66`;
                  ctx.stroke();
                  ctx.setLineDash([]);
                }

                // Label Polish
                const fontSize = 11 / globalScale;
                ctx.font = `${fontSize}px Orbitron`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Text background for contrast
                const textWidth = ctx.measureText(name).width;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(x - textWidth/2 - 4, y + val/globalScale + 4, textWidth + 8, fontSize + 4);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.fillText(name, x, y + val/globalScale + fontSize/2 + 6);
              }}
              linkDirectionalParticles={4}
              linkDirectionalParticleSpeed={d => d.value * 0.003}
              linkDirectionalParticleWidth={1.5}
              linkDirectionalParticleColor={() => '#06b6d4'}
              linkColor={() => 'rgba(6, 182, 212, 0.1)'}
              linkWidth={1}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.4}
              cooldownTicks={100}
              onEngineStop={() => {
                fgRef.current.d3Force('link').distance(150);
                fgRef.current.zoomToFit(400, 40);
              }}
            />
            
            {/* Tactical Legend - Repositioned & Refined */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-3 p-5 bg-gray-900/90 border border-cyan-500/20 rounded-xl backdrop-blur-xl z-20 shadow-2xl">
              <div className="text-[10px] text-cyan-500/60 font-black uppercase tracking-[0.2em] mb-1 border-b border-cyan-500/10 pb-2">Node Classification</div>
              <div className="flex items-center gap-3 text-[11px] text-gray-100 font-bold uppercase tracking-wider">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                <span>Primary Hub</span>
                <span className="text-red-500/80 bg-red-500/10 px-1 rounded text-[9px] ml-auto">CRITICAL</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-100 font-bold uppercase tracking-wider">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]" />
                <span>Transmitter</span>
                <span className="text-amber-500/80 bg-amber-500/10 px-1 rounded text-[9px] ml-auto">ACTIVE</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-100 font-bold uppercase tracking-wider">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_12px_#06b6d4]" />
                <span>Passive Node</span>
                <span className="text-cyan-500/80 bg-cyan-500/10 px-1 rounded text-[9px] ml-auto">MONITORING</span>
              </div>
            </div>
        </div>
      </div>

      {/* Keyword Alerting Intelligence Feed */}
      <div className="ews-card p-6 relative overflow-hidden group/table">
        {/* Subtle background scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent h-1 w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20" />
        
        <div className="flex items-center justify-between mb-3 relative z-10 border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <i className="fa-solid fa-satellite-dish text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-sm text-gray-100 uppercase tracking-wider block">KEYWORD INTELLIGENCE FEED</span>
              <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                Scanning Active • High-Spike Vectors Detected
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="ews-live-badge red shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              <span className="ews-live-dot" />
              LIVE MONITORING
            </span>
          </div>
        </div>

        <div className="overflow-auto ews-scrollbar max-h-[450px] relative z-10">
          <table className="w-full border-separate border-spacing-y-1">
            <thead className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-sm">
              <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                <th className="text-left py-3 pl-4">Kata Kunci</th>
                <th className="text-left py-3">Platform</th>
                <th className="text-left py-3">Volume (1J)</th>
                <th className="text-left py-3">Lonjakan</th>
                <th className="text-left py-3">Sentimen Bias</th>
                <th className="text-right py-3 pr-4">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>
              {keywordAlerts.map((alert, idx) => (
                <tr key={idx} className="group cursor-pointer transition-all duration-300 relative" onClick={() => addToast(`Detail keyword: ${alert.keyword}`, 'info')}>
                  <td className="bg-gray-900/40 border-y border-l border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all rounded-l-xl pl-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-6 rounded-full ${
                        alert.spikeColor === 'red' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                        alert.spikeColor === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'
                      }`} />
                      <span className={`font-black tracking-tighter text-[15px] ${
                        alert.spikeColor === 'red' ? 'text-red-400' :
                        alert.spikeColor === 'amber' ? 'text-amber-400' : 'text-gray-100'
                      }`}>
                        {alert.keyword}
                      </span>
                      {alert.spikeColor === 'red' && (
                        <span className="text-[8px] bg-red-500/20 text-red-500 px-1 border border-red-500/30 rounded font-black animate-pulse">CRITICAL</span>
                      )}
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-xs">
                        <i className={`
                          ${alert.platform.includes('X') ? 'fa-brands fa-x-twitter' : 
                            alert.platform.includes('FB') ? 'fa-brands fa-facebook' : 
                            alert.platform.includes('TikTok') ? 'fa-brands fa-tiktok' : 
                            'fa-regular fa-newspaper'}
                        `}></i>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest">{alert.platform}</span>
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-4">
                    <div className="font-orbitron text-[14px] text-gray-100 font-bold">{alert.volume}</div>
                    <div className="w-20 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" style={{ width: '65%' }} />
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-4">
                    <div className={`text-[12px] font-orbitron font-bold flex items-center gap-1 ${
                      alert.spikeColor === 'red' ? 'text-red-500' :
                      alert.spikeColor === 'amber' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      <i className={`fa-solid fa-arrow-trend-up text-[10px] ${alert.spikeColor === 'red' ? 'animate-bounce' : ''}`}></i>
                      {alert.spike}
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black tracking-widest ${
                      alert.sentimentColor === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                      alert.sentimentColor === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                      'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    }`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${
                        alert.sentimentColor === 'red' ? 'bg-red-500' :
                        alert.sentimentColor === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {alert.sentiment}
                    </div>
                  </td>
                  <td className="bg-gray-900/40 border-y border-r border-gray-800 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/30 transition-all rounded-r-xl pr-4 py-4 text-right">
                    <div className={`inline-block px-4 py-1.5 rounded text-[10px] font-black shadow-lg uppercase tracking-widest border ${
                      alert.statusColor === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-red-500/10' :
                      alert.statusColor === 'amber' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-amber-500/10' :
                      'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10'
                    }`}>
                      {alert.statusColor === 'red' ? 'NEUTRALIZE' : 
                       alert.statusColor === 'amber' ? 'ESCALATE' : 'MONITORING'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
