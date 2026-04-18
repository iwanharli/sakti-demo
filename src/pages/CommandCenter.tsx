import { useState, useEffect, useMemo } from 'react';
import { useAppStore, getApiBase, authFetch } from '../store/useAppStore';
import CountUp from '../components/CountUp';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  tickerItems,
  timelineItems,
  riskScores
} from '../data/mockDashboard';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import provinceBoundaries from '../assets/gadm41_IDN_1.json';
import type { 
  TimelineItem 
} from '../types';
import type { BMKGWarning } from '../bmkg_types';

// Weather icon mapping for BMKG conditions
const getConditionIcon = (condition: string) => {
  const c = condition?.toLowerCase() || '';
  if (c.includes('petir')) return { icon: 'fa-cloud-bolt', color: 'text-purple-400', hex: '#a855f7', pulse: true };
  if (c.includes('lebat') || c.includes('deras')) return { icon: 'fa-cloud-showers-water', color: 'text-blue-500', hex: '#3b82f6', pulse: true };
  if (c.includes('hujan') && c.includes('sedang')) return { icon: 'fa-cloud-showers-heavy', color: 'text-cyan-400', hex: '#22d3ee', pulse: false };
  if (c.includes('hujan')) return { icon: 'fa-cloud-rain', color: 'text-cyan-300', hex: '#67e8f9', pulse: false };
  if (c.includes('cerah berawan')) return { icon: 'fa-cloud-sun', color: 'text-amber-300', hex: '#fcd34d', pulse: false };
  if (c.includes('cerah')) return { icon: 'fa-sun', color: 'text-amber-400', hex: '#fbbf24', pulse: false };
  if (c.includes('berawan')) return { icon: 'fa-cloud', color: 'text-gray-400', hex: '#9ca3af', pulse: false };
  if (c.includes('kabut') || c.includes('asap')) return { icon: 'fa-smog', color: 'text-gray-300', hex: '#d1d5db', pulse: false };
  return { icon: 'fa-cloud-sun', color: 'text-amber-200', hex: '#fde68a', pulse: false };
};

// Robust Name Normalizer for DB <-> GeoJSON matching
const normalizeName = (name: string) => {
  if (!name) return '';
  return name.toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove all non-alphanumeric chars (spaces, dots, etc.)
    .replace(/^KOTA/g, '')     // Remove prefixes
    .replace(/^KAB/g, '')      
    .replace(/^ADMINISTRASI/g, '')
    .trim();
};

// Internal component to handle zoom synchronization
function MapZoomControls() {
  const map = useMap();
  useEffect(() => {
    const handleIn = () => map.zoomIn();
    const handleOut = () => map.zoomOut();
    window.addEventListener('map-zoom-in', handleIn);
    window.addEventListener('map-zoom-out', handleOut);
    return () => {
      window.removeEventListener('map-zoom-in', handleIn);
      window.removeEventListener('map-zoom-out', handleOut);
    };
  }, [map]);
  return null;
}

// Internal component to focus map on selected city
function MapFocusHandler({ selectedCity, cityBoundaries }: { selectedCity: string, cityBoundaries: any }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedCity) {
      const handleNationalFirst = () => map.flyTo([-2.5489, 118.0149], 5, { duration: 1.5 });
      window.addEventListener('map-national-view', handleNationalFirst);
      return () => window.removeEventListener('map-national-view', handleNationalFirst);
    }
    
    const handleNational = () => {
      map.flyTo([-2.5489, 118.0149], 5, { duration: 1.5 });
    };

    window.addEventListener('map-national-view', handleNational);

    const normalizedSelected = normalizeName(selectedCity);
    const feature = cityBoundaries?.features.find((f: any) => 
      normalizeName(f.properties.NAME_2) === normalizedSelected
    );

    if (feature) {
      const geoJsonLayer = L.geoJSON(feature);
      const bounds = geoJsonLayer.getBounds();
      map.flyToBounds(bounds, { padding: [120, 120], duration: 1.5, maxZoom: 11 });
    }
    return () => {
      window.removeEventListener('map-national-view', handleNational);
    };
  }, [selectedCity, map]);

  return null;
}
 
// Force-disable scroll zoom to prevent interference with page scrolling
const TacticalMapLock = () => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoom.disable();
      // Reinforce on focus to prevent browser overrides
      const lock = () => map.scrollWheelZoom.disable();
      map.on('focus', lock);
      return () => { map.off('focus', lock); };
    }
  }, [map]);
  return null;
};


export default function CommandCenter() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineItem[]>(timelineItems);
  const [filter, setFilter] = useState<'all' | 'cuaca' | 'gempa'>('all');
  
  // Kamtibmas Index Stats
  const [availableRegions, setAvailableRegions] = useState<string[]>(['Nasional', 'DKI JAKARTA']);
  const [kamtibmasRegion, setKamtibmasRegion] = useState('Nasional');
  const [kamtibmasIndex, setKamtibmasIndex] = useState<any>(null);
  const [isKamtibmasLoading, setIsKamtibmasLoading] = useState(false);
  const [nationalKamtibmasStats, setNationalKamtibmasStats] = useState<{today: number, yesterday: number, trend_pct: number} | null>(null);
  const [commodityHetStats, setCommodityHetStats] = useState<{sp2kp: number, pihps: number} | null>(null);
  
  // Map Geospatial State
  const [mapCities, setMapCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [activeMapMode, setActiveMapMode] = useState<'situational' | 'weather' | 'test'>('situational');
  const [cityBoundaries, setCityBoundaries] = useState<any>(null);
  const [isLoadingBoundaries, setIsLoadingBoundaries] = useState(false);

  // RainViewer Radar States
  const [radarFrames, setRadarFrames] = useState<any[]>([]);
  const [radarIndex, setRadarIndex] = useState(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState(true);
  const [isSatelliteMode, setIsSatelliteMode] = useState(false);
  const [isRainViewerActive, setIsRainViewerActive] = useState(false);
  const [isWeatherHeatmapVisible, setIsWeatherHeatmapVisible] = useState(true);

  const filteredTimeline = useMemo(() => {
    if (filter === 'all') return timelineData;
    return timelineData.filter(item => {
      const isGempa = item.tags.some(t => t.toUpperCase().includes('GEMPA'));
      const isCuaca = item.tags.some(t => t.toUpperCase().includes('CUACA')) || (!isGempa && item.tags.includes('BMKG_ALERT'));
      
      if (filter === 'gempa') return isGempa;
      if (filter === 'cuaca') return isCuaca;
      return true;
    });
  }, [timelineData, filter]);

  useEffect(() => {
    setMounted(true);
    fetchBMKGWarnings();
    fetchAvailableRegions();
    fetchKamtibmasIndex();
    fetchNationalKamtibmasStats();
    fetchCommodityHetStats();
    fetchMapCities();
    fetchCities();
    fetchMapBoundaries();
  }, []);

  const fetchMapBoundaries = async () => {
    setIsLoadingBoundaries(true);
    try {
      const res = await authFetch(`${getApiBase()}/weather/boundaries`);
      if (res.ok) {
        const data = await res.json();
        setCityBoundaries(data);
      }
    } catch (err) {
      console.error('Failed to load map boundaries:', err);
    } finally {
      setIsLoadingBoundaries(false);
    }
  };

  useEffect(() => {
    fetchKamtibmasIndex();
  }, [kamtibmasRegion]);

  useEffect(() => {
    if (selectedCity) {
      fetchForecast(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (activeMapMode === 'weather' && isRainViewerActive) {
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then(res => res.json())
        .then(data => {
          if (data.radar && data.radar.past) {
            setRadarFrames(data.radar.past);
            setRadarIndex(0);
          }
        })
        .catch(err => console.error('RainViewer Fetch Error:', err));
    }
  }, [activeMapMode, isRainViewerActive]);

  useEffect(() => {
    let interval: any;
    if (activeMapMode === 'weather' && isRainViewerActive && isRadarPlaying && radarFrames.length > 0) {
      interval = setInterval(() => {
        setRadarIndex(prev => (prev + 1) % radarFrames.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [activeMapMode, isRainViewerActive, isRadarPlaying, radarFrames]);

  const fetchCities = async () => {
    try {
      const res = await authFetch(`${getApiBase()}/weather/cities`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (err) {
      console.error('Cities Fetch Error:', err);
    }
  };

  const fetchForecast = async (city: string) => {
    setIsLoadingWeather(true);
    try {
      const res = await authFetch(`${getApiBase()}/weather/forecast?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Forecast Fetch Error:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const fetchMapCities = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/weather/map-cities`);
      if (response.ok) {
        const data = await response.json();
        setMapCities(data);
      }
    } catch (err) {
      console.error('Map Cities Fetch Error:', err);
    }
  };

  const fetchAvailableRegions = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/analytics/kamtibmas-regions`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRegions(data);
      }
    } catch (err) {
      console.error('Kamtibmas Regions Fetch Error:', err);
    }
  };

  const fetchCommodityHetStats = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/commodities/het-counts`);
      if (response.ok) {
        const data = await response.json();
        setCommodityHetStats(data);
      }
    } catch (err) {
      console.error('Commodity HET Stats Fetch Error:', err);
    }
  };

  const fetchNationalKamtibmasStats = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/analytics/kamtibmas-national-stats`);
      if (response.ok) {
        const data = await response.json();
        setNationalKamtibmasStats(data);
      }
    } catch (err) {
      console.error('National Kamtibmas Stats Fetch Error:', err);
    }
  };

  const fetchKamtibmasIndex = async () => {
    setIsKamtibmasLoading(true);
    try {
      const response = await authFetch(`${getApiBase()}/analytics/kamtibmas-index?region=${encodeURIComponent(kamtibmasRegion)}`);
      if (response.ok) {
        const data = await response.json();
        setKamtibmasIndex(data);
      }
    } catch (err) {
      console.error('Kamtibmas Index Fetch Error:', err);
    } finally {
      setIsKamtibmasLoading(false);
    }
  };

  const fetchBMKGWarnings = async () => {
    try {
      const apiBase = getApiBase();
      const response = await authFetch(`${apiBase}/bmkg/warnings`);
      const data: BMKGWarning[] = await response.json();
      
      const bmkgItems: TimelineItem[] = data.map(item => {
        const date = new Date(item.created_at);
        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        const desc = item.warning_description || '';
        const isGempa = item.warning_type.toLowerCase() === 'gempa';
        
        // ADVANCED TACTICAL PARSER
        // 1. Common / Weather Extraction
        const regionMatch = desc.match(/wilayah (.*?), khususnya di (.*?)\./);
        const region = regionMatch ? regionMatch[1].trim() : undefined;
        const subRegions = regionMatch ? regionMatch[2].split(',').map(s => s.trim()) : undefined;

        const impactMatch = desc.match(/berpotensi menimbulkan dampak berupa (.*?)\./);
        const impact = impactMatch ? impactMatch[1].trim() : undefined;

        const durationMatch = desc.match(/berlangsung hingga (.*?)\$/) || desc.match(/berlangsung hingga (.*)/);
        const duration = durationMatch ? durationMatch[1].trim() : undefined;

        // 2. Gempa Extraction
        const magMatch = desc.match(/magnitudo (.*?) SR/);
        const magnitude = magMatch ? magMatch[1].trim() : undefined;

        const depthMatch = desc.match(/kedalaman (.*?) km/);
        const depth = depthMatch ? depthMatch[1].trim() : undefined;

        const coordMatch = desc.match(/koordinat (.*?)\(/);
        const coordinates = coordMatch ? coordMatch[1].trim() : undefined;

        const epicenterMatch = desc.match(/tepatnya di (.*?)\./);
        const epicenter = epicenterMatch ? epicenterMatch[1].trim() : undefined;

        const statusMatch = desc.match(/Status: (.*?)\./) || desc.match(/Status: (.*)/);
        const status = statusMatch ? statusMatch[1].trim() : undefined;

        // 3. Extract Event Time and Date from Description
        const descDateMatch = desc.match(/(\d{1,2} [A-Z][a-z]+ \d{4})/);
        const descTimeMatch = desc.match(/(\d{2}:\d{2}(?::\d{2})? WIB)/i);

        let eventTime = timeStr;
        if (descDateMatch && descTimeMatch) {
          eventTime = `${descDateMatch[0]}, ${descTimeMatch[0]}`;
        } else if (descTimeMatch) {
          // If only time is found (common in Gempa), use the date from created_at
          const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          eventTime = `${formattedDate}, ${descTimeMatch[0]}`;
        } else if (descDateMatch) {
          eventTime = descDateMatch[0];
        }

        // 4. Clean content
        let mainContent = desc
          .replace(/Telah terjadi/gi, '')
          .replace(/Peringatan Dini Cuaca/gi, '🌤️')
          .replace(/wilayah .*?, khususnya di .*?\./gi, '')
          .replace(/berpotensi menimbulkan dampak berupa .*?\./gi, '')
          .replace(/Masyarakat dihimbau .*?\./gi, '')
          .replace(/Kondisi diperkirakan .*?\./gi, '')
          .replace(/Gempa magnitudo .*? pada jam .*?\./gi, '')
          .replace(/Lokasi pusat gempa berada .*? tepatnya di .*?\./gi, '')
          .replace(/Status: .*?\./gi, '')
          .trim();

        if (mainContent.length < 5) {
          mainContent = isGempa ? `Terdeteksi aktivitas seismik di ${epicenter || 'lokasi yang belum teridentifikasi'}.` : item.warning_title;
        }

        return {
          time: eventTime,
          event: item.warning_event,
          content: mainContent,
          region,
          subRegions,
          impact,
          duration,
          magnitude,
          depth,
          coordinates,
          epicenter,
          status,
          tags: [item.warning_type.toUpperCase(), 'BMKG_ALERT'],
          color: isGempa ? 'red' : 
                 item.warning_type.toLowerCase() === 'cuaca' ? 'cyan' : 'amber'
        };
      });

      setTimelineData(bmkgItems);
    } catch (err) {
      console.error('BMKG Fetch Error:', err);
    }
  };

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
        {/* Total Kejadian Kamtibmas */}
        <div className="ews-stat-card red cursor-pointer" onClick={() => {
          window.location.hash = '#/kamtibmas-management';
          addToast('Membuka Manajemen Kamtibmas', 'info');
        }}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Total Kejadian Kamtibmas</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">
            <CountUp value={nationalKamtibmasStats?.today || 0} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={!nationalKamtibmasStats || nationalKamtibmasStats.trend_pct > 0 ? 'text-red-400' : 'text-emerald-400'}>
              <i className={`fa-solid fa-caret-${!nationalKamtibmasStats || nationalKamtibmasStats.trend_pct >= 0 ? 'up' : 'down'}`}></i> 
              {Math.abs(nationalKamtibmasStats?.trend_pct || 0).toFixed(1)}%
            </span>
            <span className="text-gray-500">vs kemarin</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-red-500">
            <i className="fa-solid fa-handcuffs"></i>
          </div>
        </div>

        {/* Jumlah Komoditas diatas HET */}
        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Membuka rincian harga komoditas', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Jumlah Komoditas diatas HET</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">
            <CountUp value={commodityHetStats ? (commodityHetStats.sp2kp + commodityHetStats.pihps) : 0} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400 font-bold uppercase tracking-tighter text-[10px]">
              SP2KP: {commodityHetStats?.sp2kp || 0} | PIHPS: {commodityHetStats?.pihps || 0}
            </span>
            <span className="text-gray-500 whitespace-nowrap text-[10px]">komoditas kritis</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-amber-500">
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
        </div>

        {/* Sentimen Negatif */}
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Membuka analisis sentimen', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Sentimen Negatif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">
            <CountUp value={24.5} formatter={(v) => `${v.toFixed(1)}%`} />
          </div>
          <div className="flex items-center gap-2 text-sm text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 ews-animate-blink" />
            <span>High Awareness Alert</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-red-500">
            <i className="fa-solid fa-face-frown"></i>
          </div>
        </div>

        {/* Total Data Kecelakaan */}
        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Membuka data kecelakaan lalin', 'info')}>
          <div className="text-[14px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Total Data Kecelakaan</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
            <CountUp value={42} />
          </div>
          <div className="flex items-center gap-2 text-sm text-cyan-400">
            <span><i className="fa-solid fa-car-burst"></i> TERDATA HARI INI</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-truck-medical"></i>
          </div>
        </div>
      </div>

      {/* Main Map Container - Full Width */}
      <div className="ews-card flex flex-col h-[720px]">
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
            {/* MAP MODE SELECTOR */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-3xl shadow-2xl">
              <button 
                onClick={() => {
                  setActiveMapMode('situational');
                  setIsRainViewerActive(false);
                  addToast('Mode: Situational Awareness Active', 'info');
                }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                  activeMapMode === 'situational' 
                  ? 'bg-cyan-500 text-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <i className={`fa-solid fa-shield-halved ${activeMapMode === 'situational' ? 'animate-pulse' : ''}`}></i>
                Situational Awareness
              </button>
              <button 
                onClick={() => {
                  setActiveMapMode('weather');
                  addToast('Mode: Weather Monitoring Active', 'info');
                }}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                  activeMapMode === 'weather' 
                  ? 'bg-cyan-500 text-gray-900 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <i className={`fa-solid fa-cloud-bolt ${activeMapMode === 'weather' ? 'animate-pulse' : ''}`}></i>
                Weather
              </button>
            </div>

            <span className="ews-live-badge red">
              <span className="ews-live-dot" />
              LIVE
            </span>
          </div>
        </div>
        
        <div className="relative flex-1 bg-[#070a12] overflow-hidden group">
          {activeMapMode === 'weather' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6 bg-gray-900/45 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full shadow-2xl backdrop-saturate-150 pointer-events-none transition-all group-hover:bg-gray-900/60 font-orbitron">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 
                <span className="text-gray-300">Cerah</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-gray-400" /> 
                <span className="text-gray-300">Berawan</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> 
                <span className="text-gray-300">Hujan</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> 
                <span className="text-gray-300">Ekstrem</span>
              </div>
            </div>
          )}

          <MapContainer 
            center={[-2.5489, 118.0149]} 
            zoom={5} 
            scrollWheelZoom={false}
            className="w-full h-full z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url={activeMapMode === 'weather' && isRainViewerActive && isSatelliteMode 
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              }
            />
            
            <MapZoomControls />
            <MapFocusHandler selectedCity={selectedCity} cityBoundaries={cityBoundaries} />

            {/* FLOATING SECTOR SELECTION HUD (TOP RIGHT) - Reused from WeatherForecast */}
            {activeMapMode === 'weather' && (
              <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
                <div className="flex flex-col gap-3 items-end">
                  <div className="bg-black/60 backdrop-blur-3xl border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] pointer-events-auto group/selector transition-all hover:border-cyan-500/60 w-[260px]">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <select 
                          value={selectedCity} 
                          onChange={(e) => setSelectedCity(e.target.value)} 
                          className="bg-cyan-500/10 border border-cyan-500/20 text-white font-orbitron font-bold text-xs py-2.5 px-3 rounded focus:outline-none cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all appearance-none pr-10 w-full"
                        >
                          <option disabled value="">Pilih Kota...</option>
                          {cities.map(city => (<option key={city} value={city} className="bg-gray-900 text-white">{city}</option>))}
                        </select>
                        <i className="fa-solid fa-crosshairs absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-500 group-hover/selector:rotate-90 transition-transform duration-500"></i>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsRainViewerActive(!isRainViewerActive);
                            addToast(isRainViewerActive ? 'Rain Viewer Off' : 'Rain Viewer On', 'info');
                          }} 
                          className={`flex-1 border font-orbitron font-bold text-[9px] py-1.5 rounded flex items-center justify-center gap-2 transition-all uppercase tracking-widest outline-none ${
                            isRainViewerActive 
                            ? 'bg-cyan-500 border-cyan-400 text-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <i className={`fa-solid fa-cloud-bolt ${isRainViewerActive ? 'animate-pulse' : ''}`}></i>
                          <span>Rain Viewer</span>
                        </button>
                        <button 
                          onClick={() => setIsWeatherHeatmapVisible(!isWeatherHeatmapVisible)}
                          className={`w-10 border flex items-center justify-center transition-all outline-none rounded ${
                            isWeatherHeatmapVisible 
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                          title={isWeatherHeatmapVisible ? 'Hide Heatmap' : 'Show Heatmap'}
                        >
                          <i className="fa-solid fa-layer-group"></i>
                        </button>
                        <button 
                          onClick={() => window.dispatchEvent(new CustomEvent("map-national-view"))} 
                          className="w-10 bg-white/5 border border-white/10 text-gray-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/50 font-orbitron font-bold text-[9px] py-1.5 rounded flex items-center justify-center transition-all outline-none group/nasional"
                          title="Reset to National"
                        >
                          <i className="fa-solid fa-globe-asia group-hover/nasional:animate-spin-slow"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMapMode === 'weather' && isRainViewerActive && radarFrames.length > 0 && (
              <TileLayer
                key={`radar-${radarFrames[radarIndex].path}`}
                url={`https://tilecache.rainviewer.com${radarFrames[radarIndex].path}/256/{z}/{x}/{y}/8/1_1.png`}
                opacity={0.6}
              />
            )}

            {activeMapMode !== 'test' && (
              <GeoJSON 
                data={activeMapMode === 'situational' ? (provinceBoundaries as any) : cityBoundaries}
              key={`${activeMapMode}-${cityBoundaries?.features?.length || 0}`}
              style={(feature: any) => {
                const cityName = feature.properties.NAME_2 || feature.properties.NAME_1;
                const normalized = normalizeName(cityName);
                const cityData = activeMapMode === 'weather' ? mapCities.find(c => normalizeName(c.city) === normalized) : null;
                
                const { hex } = cityData ? getConditionIcon(cityData.condition) : { hex: '#1f2937' };
                const isSelected = cityData && selectedCity === cityData.city;

                const isRainActive = activeMapMode === 'weather' && isRainViewerActive;

                return {
                  fillColor: activeMapMode === 'situational' ? 'rgba(6, 182, 212, 0.1)' : hex,
                  weight: isSelected ? 2 : 1,
                  opacity: isRainActive ? 0 : 1,
                  color: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.4)',
                  fillOpacity: isRainActive ? 0 : (activeMapMode === 'situational' ? 0.4 : (cityData ? (isWeatherHeatmapVisible ? 0.4 : 0) : 0.05))
                };
              }}
              onEachFeature={(feature: any, layer: any) => {
                const cityName = feature.properties.NAME_2 || feature.properties.NAME_1;
                const provName = feature.properties.NAME_1;
                const normalized = normalizeName(cityName);
                const cityData = activeMapMode === 'weather' ? mapCities.find(c => normalizeName(c.city) === normalized) : null;

                layer.bindTooltip(`
                  <div class="bg-gray-900/95 border border-white/10 p-5 rounded-2xl backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] min-w-[240px] pointer-events-none relative overflow-hidden group">
                    <!-- Corner Brackets -->
                    <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl"></div>
                    <div class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl"></div>
                    <div class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-xl"></div>
                    <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl"></div>
                    
                    <div class="text-[17px] font-orbitron font-black text-white uppercase tracking-[0.1em] mb-4 pb-3 border-b border-white/10 flex items-center justify-between mt-1">
                      ${cityName}
                      <i class="fa-solid fa-satellite text-[12px] text-cyan-500/40"></i>
                    </div>

                    ${activeMapMode === 'weather' ? (cityData ? `
                    <div class="space-y-3.5">
                      <div class="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/10 shadow-inner group/row hover:bg-white/10 transition-all">
                        <span class="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] group-hover/row:text-cyan-500/80 transition-colors">Temperature</span>
                        <span class="text-white font-orbitron text-[15px] font-black">${cityData.temp}°C</span>
                      </div>
                      <div class="flex justify-between items-center bg-white/5 px-4 py-3 rounded-xl border border-white/10 shadow-inner group/row hover:bg-white/10 transition-all">
                        <span class="text-[9px] text-gray-400 uppercase font-black tracking-[0.2em] group-hover/row:text-amber-500/80 transition-colors">Condition</span>
                        <span class="${getConditionIcon(cityData.condition).color} uppercase font-orbitron text-[11px] font-black tracking-tight">${cityData.condition}</span>
                      </div>
                    </div>
                    ` : `
                    <div class="flex items-center gap-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-500">
                      <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <i class="fa-solid fa-plug-circle-xmark text-lg animate-pulse"></i>
                      </div>
                      <div>
                        <div class="text-[10px] font-black uppercase tracking-widest">Link Failure</div>
                        <div class="text-[8px] font-mono opacity-60">ERR_CONNECTION_OFFLINE</div>
                      </div>
                    </div>
                    `) : `
                    <div class="space-y-2">
                      <div class="text-[10px] text-cyan-400 font-bold tracking-wider uppercase">Situational Awareness</div>
                      <div class="text-[12px] text-white/80 font-medium">Provinsi: ${provName}</div>
                      <div class="text-[9px] text-gray-500 font-mono mt-1">Status: Monitoring Aktif</div>
                    </div>
                    `}
                    
                    <div class="mt-5 flex flex-col gap-1.5">
                      <div class="flex justify-between text-[7px] font-mono text-gray-600 uppercase tracking-widest">
                        <span>Sync Status: Nominal</span>
                        <span>0.04ms</span>
                      </div>
                      <div class="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-cyan-500/40 animate-[ews-ticker_3s_linear_infinite]" style="width: 60%"></div>
                      </div>
                    </div>
                  </div>
                `, { sticky: true, direction: 'top', className: 'tactical-tooltip', offset: [0, -15] });

                if (cityData) {
                  layer.on({
                    click: () => {
                      setSelectedCity(cityData.city);
                      addToast(`Map focus: ${cityData.city}`, 'info');
                    },
                    mouseover: () => {
                      layer.setStyle({ fillOpacity: 0.7, weight: 2, color: '#06b6d4' });
                    },
                    mouseout: () => {
                      const isSelected = selectedCity === cityData.city;
                      layer.setStyle({ 
                        fillOpacity: 0.4, 
                        weight: isSelected ? 2 : 1, 
                        color: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.4)' 
                      });
                    }
                  });
                }
              }}
            />
          )}

            {/* COMPACT TACTICAL HUD OVERLAY (BOTTOM LEFT) - Reused from WeatherForecast */}
            {activeMapMode === 'weather' && weatherData && (
              <div className="absolute bottom-6 left-6 z-[1000] grid grid-cols-2 gap-3 w-[440px] pointer-events-none">
                {/* Suhu Rata-rata */}
                <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">SUHU AVG</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-orbitron text-[22px] font-black text-cyan-400 leading-none">{weatherData.forecast?.[0]?.temp_average || '--'}</span>
                    <span className="text-[10px] font-bold text-cyan-500/60 font-orbitron">°C</span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 font-mono">
                    L: {weatherData.forecast?.[0]?.additional_data?.temp_min || '--'}° · H: {weatherData.forecast?.[0]?.additional_data?.temp_max || '--'}°
                  </div>
                  <div className="absolute right-3 bottom-2 text-2xl opacity-10 text-cyan-500">
                    <i className="fa-solid fa-temperature-high"></i>
                  </div>
                </div>

                {/* Kondisi Dominan */}
                <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">KONDISI</div>
                  <div className={`font-orbitron text-[22px] font-black uppercase truncate leading-none ${getConditionIcon(weatherData.forecast?.[0]?.condition || '').color}`}>
                    {weatherData.forecast?.[0]?.condition || '--'}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 font-mono uppercase">Status: Nominal</div>
                  <div className="absolute right-3 bottom-2 text-2xl opacity-10 text-amber-500">
                    <i className={`fa-solid ${getConditionIcon(weatherData.forecast?.[0]?.condition || '').icon}`}></i>
                  </div>
                </div>

                {/* Kelembapan Avg */}
                <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">KELEMBAPAN</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-orbitron text-[22px] font-black text-cyan-400 leading-none">{weatherData.forecast?.[0]?.humidity_average || '--'}</span>
                    <span className="text-[10px] font-bold text-cyan-500/60 font-orbitron">%</span>
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 font-mono">RH SENSOR ACTIVE</div>
                  <div className="absolute right-3 bottom-2 text-2xl opacity-10 text-blue-500">
                    <i className="fa-solid fa-droplet-slash"></i>
                  </div>
                </div>

                {/* Analisis Risiko */}
                <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
                  <div className={`absolute top-0 left-0 w-1 h-full ${weatherData.forecast?.[0]?.condition?.toLowerCase().includes('hujan') ? 'bg-red-500/50' : 'bg-emerald-500/50'}`} />
                  <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">RISIKO</div>
                  <div className={`font-orbitron text-[22px] font-black leading-none ${weatherData.forecast?.[0]?.condition?.toLowerCase().includes('hujan') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {weatherData.forecast?.[0]?.condition?.toLowerCase().includes('hujan') ? 'WASPADA' : 'LOW RISK'}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 font-mono">MATRIX v2.0</div>
                  <div className={`absolute right-3 bottom-2 text-2xl opacity-10 ${weatherData.forecast?.[0]?.condition?.toLowerCase().includes('hujan') ? 'text-red-500' : 'text-purple-500'}`}>
                    <i className="fa-solid fa-shield-virus"></i>
                  </div>
                </div>
              </div>
            )}

            {/* MINIMALIST ZOOM HUD */}
            <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))}
                className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl pointer-events-auto outline-none"
              >
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))}
                className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl pointer-events-auto outline-none"
              >
                <i className="fa-solid fa-minus text-sm"></i>
              </button>
            </div>

            {/* TOP LEFT STATS */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl flex flex-col gap-1 shadow-xl">
                 <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-widest">Cakupan Wilayah</span>
                 <span className="text-[14px] text-white font-orbitron font-bold">
                   {activeMapMode === 'situational' ? `${provinceBoundaries.features.length} PROVINSI` : `${cities.length} KOTA / KAB`}
                 </span>
              </div>
            </div>
          </MapContainer>

          {/* RADAR MINIMALIST HUD (BOTTOM CENTER) */}
          {activeMapMode === 'weather' && isRainViewerActive && radarFrames.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2000] w-[540px] pointer-events-auto flex flex-col gap-3">
              {/* RADAR INTENSITY LEGEND */}
              <div className="flex justify-center translate-y-2">
                <div className="bg-black/30 backdrop-blur-xl border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-4 shadow-lg scale-90">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#000033] border border-white/10" />
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Light</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0000ff] shadow-[0_0_5px_rgba(0,0,255,0.3)]" />
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ffff] shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
                    <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Heavy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff] shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
                    <span className="text-[7px] font-black text-cyan-400 uppercase tracking-widest">Extreme</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-4 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.6)] flex items-center gap-5 transition-all hover:bg-black/50 hover:border-white/10 group/hud">
                {/* Controls Section */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsRadarPlaying(!isRadarPlaying)}
                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-gray-900 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 group/btn"
                    title={isRadarPlaying ? 'Pause' : 'Play'}
                  >
                    <i className={`fa-solid ${isRadarPlaying ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                  </button>

                  <button 
                    onClick={() => setIsSatelliteMode(!isSatelliteMode)}
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all active:scale-95 ${
                      isSatelliteMode 
                      ? 'bg-cyan-500 border-cyan-400 text-gray-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="Satellite Mode"
                  >
                    <i className="fa-solid fa-earth-asia text-xs"></i>
                  </button>
                </div>

                {/* Info & Slider Section */}
                <div className="flex-1 flex flex-col gap-1.5 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-orbitron font-bold text-white tracking-widest">
                         {new Date(radarFrames[radarIndex].time * 1000).toLocaleString('id-ID', { 
                           hour: '2-digit', 
                           minute: '2-digit',
                           day: '2-digit',
                           month: 'short'
                         })}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-white/20" />
                       <span className="text-[8px] font-mono text-cyan-500/50 uppercase tracking-widest">Live Radar</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-mono text-gray-500 uppercase">Sync</span>
                    </div>
                  </div>

                  <div className="relative h-1.5 flex items-center group/slider">
                    <input 
                      type="range" 
                      min="0" 
                      max={radarFrames.length - 1} 
                      value={radarIndex}
                      onChange={(e) => {
                        setRadarIndex(parseInt(e.target.value));
                        setIsRadarPlaying(false);
                      }}
                      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500 hover:h-1.5 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
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
                    <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">SENTIMEN PUBLIK</span>
                    <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                      Social Sensing • Pattern Recognition
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-8 py-4">
                {/* Donut Chart Container */}
                <div className="relative w-48 h-48 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
                    {/* Definitions for gradients/glows */}
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background Track */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" stroke="rgba(255,255,255,0.05)" 
                      strokeWidth="12" 
                    />

                    {/* Segments Mapping: 38% Positif, 38% Netral, 24% Negatif */}
                    {/* Positif (38%) */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="12" 
                      strokeDasharray={`${38 * 2.513} 251.3`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      filter="url(#glow)"
                      className="opacity-80 transition-all duration-1000"
                    />

                    {/* Netral (38%) */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke="#06b6d4" 
                      strokeWidth="12" 
                      strokeDasharray={`${38 * 2.513} 251.3`}
                      strokeDashoffset={`-${38 * 2.513}`}
                      strokeLinecap="round"
                      filter="url(#glow)"
                      className="opacity-80 transition-all duration-1000"
                    />

                    {/* Negatif (24%) */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="12" 
                      strokeDasharray={`${24 * 2.513} 251.3`}
                      strokeDashoffset={`-${(38 + 38) * 2.513}`}
                      strokeLinecap="round"
                      filter="url(#glow)"
                      className="opacity-80 transition-all duration-1000"
                    />
                  </svg>

                  {/* Center HUD */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest leading-none mb-1">Status</div>
                    <div className="text-[16px] text-cyan-400 font-black font-orbitron uppercase tracking-tighter leading-none">Stabil</div>
                    <div className="text-[9px] text-gray-600 font-mono uppercase mt-1">Normal Pattern</div>
                  </div>
                </div>
                {/* Legend List */}
                <div className="flex-1 space-y-4">
                  {[
                    { label: 'Positif', value: 38, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                    { label: 'Netral', value: 38, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
                    { label: 'Negatif', value: 24, color: 'bg-red-500', textColor: 'text-red-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform`} />
                        <span className="text-[13px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <span className={`text-[14px] font-mono font-black ${item.textColor}`}>
                        {item.value}%
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] mb-1">Vector Focus</div>
                    <div className="text-[12px] text-gray-300 font-bold tracking-wide">Analisis Narasi</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KAMTIBMAS Summary Section - Minimalist Refinement */}
            <div className="ews-card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <i className="fa-solid fa-shield-halved text-sm"></i>
                  </div>
                  <div>
                    <span className="font-orbitron font-bold text-[14px] text-gray-100 uppercase tracking-wider block">INDEX KAMTIBMAS</span>
                    <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Active Security Index
                    </span>
                  </div>
                </div>

                {/* Province Dropdown (Real) */}
                <div className="relative group/select">
                  <select 
                    className="appearance-none bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer outline-none hover:border-cyan-500/30 hover:text-cyan-400 transition-all pr-8 w-40"
                    value={kamtibmasRegion}
                    onChange={(e) => setKamtibmasRegion(e.target.value)}
                  >
                    {availableRegions.map(region => (
                      <option key={region} value={region}>{region.toUpperCase()}</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-gray-600 group-hover/select:text-cyan-500 transition-colors">
                    <i className="fa-solid fa-chevron-down"></i>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Compact Stats Row (Live) */}
                <div className="flex items-end justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group hover:border-red-500/20 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -mr-12 -mt-12" />
                  <div className={isKamtibmasLoading ? 'animate-pulse' : ''}>
                    <div className="font-orbitron text-4xl font-black text-white leading-none tracking-tighter">
                      <CountUp 
                        value={
                          (kamtibmasIndex?.additional_data?.case_detail?.kejahatan_total?.[0]?.kasus_mingguan || 0) +
                          (kamtibmasIndex?.additional_data?.case_detail?.gangguan_total?.[0]?.kasus_mingguan || 0) +
                          (kamtibmasIndex?.additional_data?.case_detail?.pelanggaran_total?.[0]?.kasus_mingguan || 0) +
                          (kamtibmasIndex?.additional_data?.case_detail?.bencana_total?.[0]?.kasus_mingguan || 0)
                        } 
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">TOTAL INSIDEN (7-HARI)</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      kamtibmasIndex?.additional_data?.level?.toLowerCase() === 'tinggi' ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        kamtibmasIndex?.additional_data?.level?.toLowerCase() === 'tinggi' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                      }`} />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">
                        {kamtibmasIndex?.additional_data?.level?.toUpperCase() || 'NORMAL'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">RISK INDEX</div>
                      <div className="text-[15px] font-orbitron font-bold text-cyan-400">
                        {kamtibmasIndex?.additional_data?.irs?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Condensed Sub-Stats Grid (Live Data Contextualized) */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'KEJAHATAN', value: kamtibmasIndex?.additional_data?.case_detail?.kejahatan_total?.[0]?.kasus_mingguan || 0 },
                    { label: 'GANGGUAN', value: kamtibmasIndex?.additional_data?.case_detail?.gangguan_total?.[0]?.kasus_mingguan || 0 },
                    { label: 'PELANGGARAN', value: kamtibmasIndex?.additional_data?.case_detail?.pelanggaran_total?.[0]?.kasus_mingguan || 0 },
                    { label: 'BENCANA', value: kamtibmasIndex?.additional_data?.case_detail?.bencana_total?.[0]?.kasus_mingguan || 0 },
                  ].map((item) => (
                    <div key={item.label} className="py-2.5 px-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] flex items-center justify-between hover:bg-white/[0.04] transition-all group/sub">
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover/sub:text-gray-400 transition-colors">{item.label}</span>
                      <span className="font-orbitron text-[15px] font-bold text-gray-200">{item.value.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
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
            <div className="flex flex-col gap-4 mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <i className="fa-solid fa-bolt-lightning text-lg"></i>
                  </div>
                  <div>
                    <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">PERINGATAN DINI & KEJADIAN</span>
                    <span className="text-[10px] text-red-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Live Feed • Priority Active
                    </span>
                  </div>
                </div>
              </div>

              {/* TACTICAL FILTER GROUP */}
              <div className="flex p-0.5 bg-white/5 rounded-lg border border-white/10">
                {[
                  { id: 'all', label: 'ALL', icon: 'fa-layer-group' },
                  { id: 'cuaca', label: 'CUACA', icon: 'fa-cloud-bolt' },
                  { id: 'gempa', label: 'GEMPA', icon: 'fa-house-crack' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id as any)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-black tracking-widest transition-all
                      ${filter === btn.id 
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                    `}
                  >
                    <i className={`fa-solid ${btn.icon} text-[9px]`}></i>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Timeline Feed with Scroll - Limited height for tactical focus */}
            <div className="flex-1 ews-timeline overflow-y-auto ews-scrollbar space-y-3 pr-2 border-b border-gray-800/50 mb-1 max-h-[840px]">
              {filteredTimeline.length > 0 ? (
                filteredTimeline.map((item, idx) => {
                  // Get dynamic icon based on content/tags
                  const icon = item.tags.includes('LANTAS') ? 'fa-solid fa-car-burst' : 
                               item.tags.includes('RESKRIM') ? 'fa-solid fa-fingerprint' : 
                               item.tags.includes('INTELKAM') ? 'fa-solid fa-masks-theater' : 
                               item.tags.includes('MONITORING') ? 'fa-solid fa-display' : 
                               'fa-solid fa-triangle-exclamation';
                  
                  const priorityColor = item.color === 'red' ? 'border-red-500' : 
                                        item.color === 'amber' ? 'border-amber-500' : 
                                        item.color === 'green' ? 'border-emerald-500' : 'border-cyan-500';
                  
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

                      {/* Header: Warning Event */}
                      {item.event && (
                        <div className="text-[11px] font-black text-white px-2 py-0.5 bg-white/5 border border-white/10 rounded mb-2 inline-block uppercase tracking-widest font-orbitron">
                           {item.event}
                        </div>
                      )}

                      {/* Content: Primary Message */}
                      <div className="text-[14px] font-semibold text-gray-200 leading-normal mb-4 group-hover:text-cyan-400 transition-colors">
                        {item.content}
                      </div>

                      {/* STRUCTURED DATA BLOCKS: CUACA */}
                      {item.subRegions && item.subRegions.length > 0 && (
                        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="text-[9px] font-black text-cyan-500/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <i className="fa-solid fa-location-crosshairs"></i> Sector Monitoring: {item.region}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {item.subRegions.map((loc, i) => (
                              <span key={i} className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                                {loc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STRUCTURED DATA BLOCKS: GEMPA */}
                      {item.magnitude && (
                        <div className="mb-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <div className="text-[9px] font-black text-red-500/80 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <i className="fa-solid fa-waveform"></i> Seismic Data
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">Magnitude</div>
                              <div className="text-[14px] font-bold text-red-500">{item.magnitude} SR</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">Depth</div>
                              <div className="text-[14px] font-bold text-gray-200">{item.depth} KM</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">Tsunami Risk</div>
                              <div className={`text-[12px] font-bold ${item.status?.toLowerCase().includes('tidak') ? 'text-green-500' : 'text-red-500'}`}>
                                {item.status?.toLowerCase().includes('tidak') ? 'NONE' : 'ALERT'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.epicenter && (
                        <div className="mb-4 p-2 bg-white/5 border border-white/10 rounded border-l-2 border-l-red-500 group/map">
                          <div className="flex justify-between items-start mb-1">
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Coordinates</div>
                            {item.coordinates && (
                              <button 
                                onClick={() => {
                                  const parts = item.coordinates?.split(' ') || [];
                                  let lat = parseFloat(parts[0] || '0');
                                  if (parts[1]?.toUpperCase() === 'LS') lat = -lat;
                                  let lng = parseFloat(parts[2] || '0');
                                  if (parts[3]?.toUpperCase() === 'BB') lng = -lng;
                                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                                }}
                                className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1"
                              >
                                <i className="fa-solid fa-map-location-dot"></i> TAC-MAP
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-gray-300 mb-1">{item.coordinates}</div>
                          <div className="text-[10px] text-red-400 font-bold">{item.epicenter}</div>
                        </div>
                      )}

                      {item.impact && (
                        <div className="mb-4 flex items-start gap-3">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          <div>
                            <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest mb-1">Environmental Impact</div>
                            <div className="text-[11px] text-gray-400 italic">"{item.impact}"</div>
                          </div>
                        </div>
                      )}

                      {item.duration && (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 border-t border-gray-800 pt-3">
                          <i className="fa-regular fa-clock text-cyan-500/50"></i>
                          ESTIMATED END TIME: <span className="text-gray-300">{item.duration}</span>
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/[0.02] rounded-xl border border-dashed border-white/5 mx-2">
                  <div className="w-20 h-20 rounded-full bg-cyan-500/5 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping opacity-20" />
                    <i className="fa-solid fa-shield-check text-cyan-500/40 text-4xl"></i>
                  </div>
                  <h3 className="font-orbitron font-black text-[13px] text-cyan-500 tracking-[0.3em] uppercase mb-3">
                    SITUASI TERPANTAU KONDUSIF
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[280px] uppercase tracking-wider">
                     Belum terdeteksi adanya peringatan dini atau kejadian menonjol dalam jangkauan radar monitoring saat ini.
                  </p>
                  <div className="mt-8 flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-cyan-500/70 tracking-widest lowercase">system.active.monitoring</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
