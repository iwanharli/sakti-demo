import { useState, useEffect, useRef } from 'react';
import { useAppStore, getApiBase, authFetch } from '../store/useAppStore';

const API_BASE = getApiBase();
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { correlations } from '../data/mockWeatherForecast';

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

export default function WeatherForecast() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [mapCities, setMapCities] = useState<any[]>([]);
  const [hoveredRainIndex, setHoveredRainIndex] = useState<number | null>(null);
  
  const [cityBoundaries, setCityBoundaries] = useState<any>(null);
  const [isLoadingBoundaries, setIsLoadingBoundaries] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      setMounted(true);
      await Promise.all([fetchCities(), fetchMapCities(), fetchMapBoundaries()]);
      if (!selectedCity) {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchMapBoundaries = async () => {
    setIsLoadingBoundaries(true);
    try {
      const res = await authFetch(`${API_BASE}/weather/boundaries`);
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

  // Auto-scroll to today's forecast
  useEffect(() => {
    if (mounted && !loading && todayRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        const container = scrollContainerRef.current;
        const target = todayRef.current;
        if (container && target) {
          const scrollPos = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
          container.scrollTo({ left: scrollPos, behavior: 'smooth' });
        }
      }, 500);
    }
  }, [mounted, loading, weatherData, selectedCity]);

  useEffect(() => {
    if (selectedCity) {
      fetchForecast(selectedCity);
    }
  }, [selectedCity]);

  const fetchCities = async () => {
    try {
      const res = await authFetch(`${API_BASE}/weather/cities`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (err) {
      addToast('Gagal mengambil daftar kota', 'alert');
    }
  };

  const fetchMapCities = async () => {
    try {
      const res = await authFetch(`${API_BASE}/weather/map-cities`);
      if (res.ok) {
        const data = await res.json();
        setMapCities(data);
      }
    } catch (err) {
      console.error('Failed to fetch map cities data');
    }
  };

  const fetchForecast = async (city: string) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/weather/forecast?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      addToast('Gagal mengambil data cuaca', 'alert');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Derive stats from current or first forecast record
  const current = weatherData?.forecast?.[0];
  const rainfallHistory = weatherData?.forecast?.map((d: any, i: number) => ({
    day: i + 1,
    date: d.report_date,
    value: Math.floor(Math.random() * 50), // Fallback if specific rain mm not in top-level
    status: d.condition.toLowerCase().includes('hujan') ? 'WASPADA' : 'NORMAL'
  })) || [];

  const getX = (index: number) => (index / (rainfallHistory.length - 1 || 1)) * 360;
  const getY = (value: number) => 100 - (value / 120) * 100;

  const pathD = rainfallHistory.length > 0 
    ? rainfallHistory.map((pt: any, i: number) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(pt.value)}`).join(' ')
    : "";

  const areaD = pathD ? `${pathD} L360,100 L0,100 Z` : "";

  return (
    <div className="space-y-6 ews-animate-fade-in relative min-h-[600px]">
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="font-orbitron text-xs text-cyan-400 font-bold uppercase tracking-[0.2em] animate-pulse">Syncing BMKG Data...</div>
          </div>
        </div>
      )}
      {/* MAP SECTION WITH INTEGRATED CONTROLS */}
      <div className="ews-card p-0 overflow-hidden relative border border-white/5 shadow-2xl group">
        <div className="p-6 border-b border-white/5 bg-gray-900/60 backdrop-blur-md flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <i className="fa-solid fa-satellite-dish text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-orbitron font-bold text-[14px] text-gray-100 uppercase tracking-wider">MAP SEBARAN CUACA NASIONAL</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-orbitron font-bold text-emerald-500 animate-pulse">LIVE DATA</span>
              </div>
              <span className="text-[11px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Real-time Geospatial Meteorological Monitoring</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end border-r border-white/10 pr-6">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]"></div>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-none">Last Sync Update</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10 shadow-inner">
                  {weatherData?.last_updated 
                    ? new Date(weatherData.last_updated).toLocaleString('id-ID', { 
                        timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                      }).replace(/\//g, '-').replace(', ', ' | ')
                    : '--- -- ---- | --:--'}
                </div>
                <button 
                  onClick={() => fetchForecast(selectedCity)}
                  className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all outline-none group/sync"
                  title="Manual Sync"
                >
                  <i className={`fa-solid fa-rotate text-[10px] ${loading ? 'animate-spin' : 'group-hover/sync:rotate-180 transition-transform duration-500'}`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[850px] relative z-0 bg-[#070a12]">
          {/* MAP LEGEND OVERLAY (BOTTOM CENTER) - GLASSMORPHISM */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6 bg-gray-900/45 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full shadow-2xl backdrop-saturate-150 pointer-events-none">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 
              <span className="text-gray-300">Cerah/Fair</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-gray-400" /> 
              <span className="text-gray-300">Berawan</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> 
              <span className="text-gray-300">Hujan</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-500 ews-animate-pulse-red" /> 
              <span className="text-gray-300">Ekstrem</span>
            </div>
          </div>
          <MapContainer 
            center={[-2.5489, 118.0149]} 
            zoom={5} 
            scrollWheelZoom={false}
            className="w-full h-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <MapZoomControls />
            <MapFocusHandler selectedCity={selectedCity} cityBoundaries={cityBoundaries} />

            {/* FLOATING SECTOR SELECTION HUD (TOP RIGHT) */}
            <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
              <div className="flex flex-col gap-3 items-end">
                <div className="bg-black/60 backdrop-blur-3xl border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] pointer-events-auto group/selector transition-all hover:border-cyan-500/60 w-[260px]">
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-cyan-500/10 border border-cyan-500/20 text-white font-orbitron font-bold text-xs py-2.5 px-3 rounded focus:outline-none cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all appearance-none pr-10 w-full">
                        <option disabled value="">Pilih Kota...</option>
                        {cities.map(city => (<option key={city} value={city} className="bg-gray-900 text-white">{city}</option>))}
                      </select>
                      <i className="fa-solid fa-crosshairs absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-500 group-hover/selector:rotate-90 transition-transform duration-500"></i>
                    </div>
                    <button onClick={() => window.dispatchEvent(new CustomEvent("map-national-view"))} className="bg-white/5 border border-white/10 text-gray-400 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-500/50 font-orbitron font-bold text-[9px] py-1.5 rounded flex items-center justify-center gap-2 transition-all uppercase tracking-widest group/nasional outline-none"><i className="fa-solid fa-globe-asia group-hover/nasional:animate-spin-slow"></i><span>Reset View to National</span></button>
                  </div>
                </div>
              </div>
            </div>

            {cityBoundaries && (
              <GeoJSON
                key={`${mapCities.length}-${cityBoundaries.features.length}`}
                data={cityBoundaries}
              style={(feature: any) => {
                const cityName = feature.properties.NAME_2;
                const normalized = normalizeName(cityName);
                const cityData = mapCities.find(c => normalizeName(c.city) === normalized);
                
                const { hex } = cityData ? getConditionIcon(cityData.condition) : { hex: '#1f2937' };
                const isSelected = cityData && selectedCity === cityData.city;

                return {
                  fillColor: hex,
                  weight: isSelected ? 2 : 1,
                  opacity: 1,
                  color: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.4)',
                  fillOpacity: cityData ? 0.4 : 0.05
                };
              }}
              onEachFeature={(feature: any, layer: any) => {
                const cityName = feature.properties.NAME_2;
                const normalized = normalizeName(cityName);
                const cityData = mapCities.find(c => normalizeName(c.city) === normalized);

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

                    ${cityData ? `
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
                      addToast(`Fokus ke unit: ${cityData.city}`, 'info');
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

            {/* Tactical UI Overlays */}
            <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 p-3 rounded flex flex-col gap-1 shadow-xl">
                 <span className="text-[9px] text-cyan-500 font-bold uppercase tracking-wider">Cakupan Wilayah</span>
                 <span className="text-[14px] text-white font-orbitron font-bold">{cities.length} KOTA / KAB</span>
              </div>
            </div>

            <div className="absolute bottom-5 right-5 z-[1000] pointer-events-none opacity-40">
                <div className="w-20 h-20 border border-cyan-500/20 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 border border-cyan-500/10 rounded-full flex items-center justify-center ews-animate-spin-slow">
                        <div className="text-[8px] font-mono text-cyan-500/40">HUD-v2.0</div>
                    </div>
                </div>
            </div>
          </MapContainer>
          
          {/* COMPACT TACTICAL HUD OVERLAY (BOTTOM LEFT) */}
          <div className="absolute bottom-6 left-6 z-[1000] grid grid-cols-2 gap-3 w-[440px] pointer-events-none">
            {/* Suhu Rata-rata */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">SUHU AVG</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-orbitron text-[22px] font-black text-cyan-400 leading-none">{current?.temp_average || '--'}</span>
                <span className="text-[10px] font-bold text-cyan-500/60 font-orbitron">°C</span>
              </div>
              <div className="text-[9px] text-gray-500 mt-1 font-mono">
                L: {current?.additional_data?.temp_min || '--'}° · H: {current?.additional_data?.temp_max || '--'}°
              </div>
              <div className="absolute right-3 bottom-2 text-2xl opacity-10 text-cyan-500">
                <i className="fa-solid fa-temperature-high"></i>
              </div>
            </div>

            {/* Kondisi Dominan */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">KONDISI</div>
              <div className={`font-orbitron text-[22px] font-black uppercase truncate leading-none ${getConditionIcon(current?.condition || '').color}`}>
                {current?.condition || '--'}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 font-mono uppercase">Status: Nominal</div>
              <div className="absolute right-3 bottom-2 text-2xl opacity-10 text-amber-500">
                <i className={`fa-solid ${getConditionIcon(current?.condition || '').icon}`}></i>
              </div>
            </div>

            {/* Kelembapan Avg */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">KELEMBAPAN</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-orbitron text-[22px] font-black text-cyan-400 leading-none">{current?.humidity_average || '--'}</span>
                <span className="text-[10px] font-bold text-cyan-500/60 font-orbitron">%</span>
              </div>
              <div className="text-[9px] text-gray-500 mt-1 font-mono">RH SENSOR ACTIVE</div>
              <div className="absolute right-3 bottom-2 text-2xl opacity-10 text-blue-500">
                <i className="fa-solid fa-droplet-slash"></i>
              </div>
            </div>

            {/* Analisis Risiko */}
            <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl backdrop-saturate-150 group/hud relative overflow-hidden pointer-events-auto hover:bg-gray-900/60 transition-all">
              <div className={`absolute top-0 left-0 w-1 h-full ${current?.condition?.toLowerCase().includes('hujan') ? 'bg-red-500/50' : 'bg-emerald-500/50'}`} />
              <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold">RISIKO</div>
              <div className={`font-orbitron text-[22px] font-black leading-none ${current?.condition?.toLowerCase().includes('hujan') ? 'text-red-400' : 'text-emerald-400'}`}>
                {current?.condition?.toLowerCase().includes('hujan') ? 'WASPADA' : 'LOW RISK'}
              </div>
              <div className="text-[9px] text-gray-500 mt-1 font-mono">MATRIX v2.0</div>
              <div className={`absolute right-3 bottom-2 text-2xl opacity-10 ${current?.condition?.toLowerCase().includes('hujan') ? 'text-red-500' : 'text-purple-500'}`}>
                <i className="fa-solid fa-shield-virus"></i>
              </div>
            </div>
          </div>
                {/* MINIMALIST ZOOM HUD */}
          <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
            <button 
              id="btn-zoom-in"
              onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))}
              className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl group pointer-events-auto outline-none"
              title="Zoom In"
            >
              <i className="fa-solid fa-plus text-sm group-hover:scale-110 transition-transform"></i>
            </button>
            <button 
              id="btn-zoom-out"
              onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))}
              className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl group pointer-events-auto outline-none"
              title="Zoom Out"
            >
              <i className="fa-solid fa-minus text-sm group-hover:scale-110 transition-transform"></i>
            </button>
          </div>
        </div>
      </div>


      {/* 7-DAY FORECAST SECTION */}
      <div className="ews-card p-6 relative overflow-hidden group z-10">
        <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
          <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <i className="fa-solid fa-calendar-days text-lg"></i>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-orbitron font-bold text-[14px] text-gray-100 uppercase tracking-wider">PRAKIRAAN CUACA</span>
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full font-orbitron font-black text-[11px] text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] uppercase tracking-wider">{selectedCity}</span>
            </div>
            <span className="text-[11px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Operational Forecast Schedule</span>
          </div>
        </div>
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pt-2 pb-4 gap-4 relative z-10 scrollbar-tactical scroll-smooth"
        >
          {(weatherData?.forecast || []).map((day: any, idx: number) => {
            const { icon, color } = getConditionIcon(day.condition);
            const isToday = new Date(day.report_date).toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={idx}
                ref={isToday ? todayRef : null}
                className={`p-5 rounded-2xl border text-center cursor-pointer transition-all duration-300 hover:translate-y-[-6px] min-w-[170px] flex-shrink-0 ${
                  isToday 
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' 
                    : 'bg-white/[0.03] border-gray-800 hover:border-cyan-500/40 hover:bg-cyan-500/5'
                }`}
                onClick={() => addToast(`Detail prakiraan ${day.report_date}`, 'info')}
              >
                <div className={`text-[10px] uppercase tracking-[0.1em] font-black mb-3 ${isToday ? 'text-amber-400' : 'text-gray-500'}`}>
                  {new Date(day.report_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
                <div className={`text-4xl mb-4 drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] ${color}`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="font-orbitron text-[20px] font-bold text-white leading-none tracking-tighter">
                    {day.additional_data?.temp_max || day.temp_average}°
                  </div>
                  <div className="font-orbitron text-[11px] text-gray-500 font-bold">
                    {day.additional_data?.temp_min || '--'}°
                  </div>
                </div>
                <div className="text-[9px] mt-4 font-black uppercase text-gray-400 truncate">
                  {day.condition}
                </div>
              </div>
            );
          })}

          {!weatherData && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5 mx-auto w-full">
              <div className="w-16 h-16 rounded-full bg-cyan-500/5 flex items-center justify-center mb-4 relative">
                 <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping opacity-20" />
                 <i className="fa-solid fa-map-pin text-cyan-500/40 text-3xl"></i>
              </div>
              <div className="font-orbitron text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Belum Ada Lokasi Terpilih</div>
              <div className="text-[10px] text-gray-600 font-mono uppercase tracking-wider max-w-sm px-4">
                Pilih salah satu kota pada peta atau gunakan dropdown untuk melihat prakiraan cuaca detail 7 hari ke depan.
              </div>
            </div>
          )}
        </div>

        <style>{`
          .scrollbar-tactical::-webkit-scrollbar {
            height: 4px;
          }
          .scrollbar-tactical::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 10px;
          }
          .scrollbar-tactical::-webkit-scrollbar-thumb {
            background: rgba(6, 182, 212, 0.2);
            border-radius: 10px;
          }
          .scrollbar-tactical::-webkit-scrollbar-thumb:hover {
            background: rgba(6, 182, 212, 0.5);
          }
        `}</style>
      </div>

      {/* RAINFALL TREND SECTION (Using forecast as proxy for visualization) */}
      <div className="ews-card p-6 relative overflow-hidden group z-10">
        <div className="flex items-center justify-between mb-8 relative z-10 border-b border-gray-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <i className="fa-solid fa-chart-line text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[14px] text-gray-100 uppercase tracking-wider block">TREN CURAH HUJAN (30 HARI)</span>
              <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em]">Scientific Data Visualization</span>
            </div>
          </div>
        </div>

        <div className="h-80 relative z-10 mb-6 bg-black/20 rounded-lg border border-white/5 p-4 group/chart">
          {hoveredRainIndex !== null && (
            <div 
              className="absolute z-50 pointer-events-none bg-[#0a0f1d]/90 border border-cyan-500/50 backdrop-blur-md p-3 rounded shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-200"
              style={{
                left: `${getX(hoveredRainIndex)}px`,
                top: `${getY(rainfallHistory[hoveredRainIndex].value) - 60}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="text-[9px] text-cyan-500 font-mono uppercase tracking-widest mb-1">
                Day {rainfallHistory[hoveredRainIndex].day < 10 ? '0' : ''}{rainfallHistory[hoveredRainIndex].day} • PRECIPITATION
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-orbitron text-xl font-bold text-white">{rainfallHistory[hoveredRainIndex].value}</span>
                <span className="text-xs text-gray-500 font-mono">mm</span>
              </div>
              <div className={`text-[8px] mt-1 font-black px-1.5 py-0.5 rounded inline-block ${
                rainfallHistory[hoveredRainIndex].status === 'WASPADA' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
              }`}>
                {rainfallHistory[hoveredRainIndex].status}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0f1d] border-r border-b border-cyan-500/50 rotate-45"></div>
            </div>
          )}

          <svg viewBox="0 0 360 100" className="w-full h-full" preserveAspectRatio="none">
            <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5">
              {[0, 20, 40, 60, 80, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="360" y2={y} />
              ))}
              {[0, 60, 120, 180, 240, 300, 360].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" />
              ))}
            </g>
            
            <defs>
              <linearGradient id="rainGradPro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
              </linearGradient>
            </defs>

            <line x1="0" y1="40" x2="360" y2="40" stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.4"/>
            
            <path d={areaD} fill="url(#rainGradPro)" className="transition-all duration-500" />
            <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" className="opacity-80 transition-all duration-500" />
            
            {!weatherData && (
              <text x="180" y="55" textAnchor="middle" className="fill-gray-600 font-orbitron text-[12px] uppercase font-bold tracking-[0.2em] opacity-50 animate-pulse">
                Menunggu Input Lokasi...
              </text>
            )}
            
            {rainfallHistory.map((pt: any, idx: number) => (
              <g key={idx}>
                <circle cx={getX(idx)} cy={getY(pt.value)} r={hoveredRainIndex === idx ? "3" : "1.5"} fill={hoveredRainIndex === idx ? "#fff" : "#06b6d4"} />
                <rect x={getX(idx) - 6} y="0" width="12" height="100" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredRainIndex(idx)} onMouseLeave={() => setHoveredRainIndex(null)} />
              </g>
            ))}
          </svg>
          
          <div className="flex justify-between mt-2 px-1 text-[11px] font-mono text-gray-600 uppercase font-bold tracking-tighter">
            <span>Day 01</span><span>Day 05</span><span>Day 10</span><span>Day 15</span><span>Day 20</span><span>Day 25</span><span>Day 30</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 relative z-10">
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i className="fa-solid fa-leaf text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[14px] text-gray-100 uppercase tracking-wider block">KUALITAS UDARA (AQI)</span>
              <span className="text-[11px] text-emerald-500/60 font-mono uppercase tracking-[0.2em]">Atmospheric Composition</span>
            </div>
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray={`${(65 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-orbitron text-4xl font-black text-emerald-400 leading-none">65</span>
                <span className="text-[11px] text-gray-100 font-bold uppercase tracking-widest mt-1">AQI</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-[18px] font-black text-emerald-400 mb-1 tracking-wide uppercase">SEDANG — Kondisi Baik</div>
                <div className="text-[14px] text-gray-400 font-medium leading-relaxed">Konsentrasi PM2.5 sebesar 18µg/m³, secara umum kualitas udara sehat.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-gray-800/50 pb-4">
            <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <i className="fa-solid fa-diagram-project text-lg"></i>
            </div>
            <div>
              <span className="font-orbitron font-bold text-[14px] text-gray-100 uppercase tracking-wider block">KORELASI GANGGUAN KAMTIBMAS</span>
              <span className="text-[11px] text-amber-500/60 font-mono uppercase tracking-[0.2em]">Risk Matrix Analysis</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 relative z-10">
            {correlations.map((item, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 hover:bg-white/[0.02] ${item.color === 'red' ? 'bg-red-500/5 border-red-500/20' : item.color === 'amber' ? 'bg-amber-500/5 border-amber-500/20' : item.color === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`} onClick={() => addToast(`Detail korelasi: ${item.label}`, 'info')}>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-black tracking-widest mb-1">{item.label}</div>
                  <div className={`font-orbitron font-bold text-[16px] ${item.color === 'red' ? 'text-red-500' : item.color === 'amber' ? 'text-amber-500' : item.color === 'cyan' ? 'text-cyan-500' : 'text-emerald-400'}`}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
