import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  }, [selectedCity, map, cityBoundaries]);

  return null;
}

interface WeatherRadarMapProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  mapCities: any[];
  cityBoundaries: any;
  weatherData: any;
  loading: boolean;
  addToast: (msg: string, type: any) => void;
}

export default function WeatherRadarMap({
  selectedCity,
  setSelectedCity,
  mapCities,
  cityBoundaries,
  weatherData,
  loading,
  addToast
}: WeatherRadarMapProps) {
  
  return (
    <div className="w-full h-full relative z-0 bg-[#070a12] rounded-3xl overflow-hidden ews-animate-fade-in">
       {/* LOADING OVERLAY */}
       {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="font-orbitron text-xs text-cyan-400 font-bold uppercase tracking-[0.2em] animate-pulse">Syncing BMKG Data...</div>
          </div>
        </div>
      )}

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
      </MapContainer>

      {/* MINIMALIST ZOOM HUD */}
      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))}
          className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl group pointer-events-auto outline-none"
          title="Zoom In"
        >
          <i className="fa-solid fa-plus text-sm group-hover:scale-110 transition-transform"></i>
        </button>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))}
          className="w-10 h-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300 shadow-xl group pointer-events-auto outline-none"
          title="Zoom Out"
        >
          <i className="fa-solid fa-minus text-sm group-hover:scale-110 transition-transform"></i>
        </button>
      </div>
    </div>
  );
}
