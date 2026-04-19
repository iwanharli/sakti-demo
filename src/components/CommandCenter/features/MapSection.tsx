import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import provinceBoundaries from '../../../assets/gadm41_IDN_1.json';
import { normalizeName, getConditionIcon } from '../../../utils/dashboardUtils';

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

interface MapSectionProps {
  activeMapMode: 'situational' | 'weather' | 'test';
  isRainViewerActive: boolean;
  isSatelliteMode: boolean;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: string[];
  cityBoundaries: any;
  radarFrames: any[];
  radarIndex: number;
  isRadarPlaying: boolean;
  setIsRadarPlaying: (playing: boolean) => void;
  setIsRainViewerActive: (active: boolean) => void;
  setIsSatelliteMode: (satellite: boolean) => void;
  isWeatherHeatmapVisible: boolean;
  setIsWeatherHeatmapVisible: (visible: boolean) => void;
  mapCities: any[];
  weatherData: any;
  addToast: (msg: string, type: any) => void;
  setActiveMapMode: (mode: 'situational' | 'weather' | 'test') => void;
}

const MapSection: React.FC<MapSectionProps> = ({
  activeMapMode,
  isRainViewerActive,
  isSatelliteMode,
  selectedCity,
  setSelectedCity,
  cities,
  cityBoundaries,
  radarFrames,
  radarIndex,
  isRadarPlaying,
  setIsRadarPlaying,
  setIsRainViewerActive,
  setIsSatelliteMode,
  isWeatherHeatmapVisible,
  setIsWeatherHeatmapVisible,
  mapCities,
  weatherData,
  addToast,
  setActiveMapMode
}) => {
  return (
    <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group/map-container">
      {/* MAP HUD OVERLAY (TOP LEFT) */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-3xl border border-white/10 p-1.5 rounded-2xl pointer-events-auto">
          {[
            { id: 'situational', label: 'Situational', icon: 'fa-layer-group' },
            { id: 'weather', label: 'Weather Radar', icon: 'fa-cloud-satellite-radar' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMapMode(mode.id as any);
                addToast(`Map Mode: ${mode.label}`, 'info');
              }}
              className={`px-5 py-2.5 rounded-xl font-orbitron font-bold text-[10px] tracking-[0.2em] transition-all flex items-center gap-3 uppercase ${
                activeMapMode === mode.id 
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${mode.icon} text-xs`}></i>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <MapContainer 
        center={[-2.5489, 118.0149]} 
        zoom={5} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={isSatelliteMode 
            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          }
        />

        {/* RainViewer Animated Radar Layer */}
        {activeMapMode === 'weather' && isRainViewerActive && radarFrames.length > 0 && (
          <TileLayer
            key={radarFrames[radarIndex]?.path}
            url={`https://tilecache.rainviewer.com${radarFrames[radarIndex].path}/256/{z}/{x}/{y}/2/1_1.png`}
            opacity={0.6}
            zIndex={100}
          />
        )}
        
        <MapZoomControls />
        <MapFocusHandler selectedCity={selectedCity} cityBoundaries={cityBoundaries} />

        {/* WEATHER CONTROLS HUD */}
        {activeMapMode === 'weather' && (
          <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
            <div className="bg-black/60 backdrop-blur-3xl border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] pointer-events-auto w-[260px]">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <select 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)} 
                    className="bg-cyan-500/10 border border-cyan-500/20 text-white font-orbitron font-bold text-xs py-2.5 px-3 rounded appearance-none w-full"
                  >
                    <option disabled value="">Pilih Kota...</option>
                    {cities.map(city => (<option key={city} value={city} className="bg-gray-900 text-white">{city}</option>))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsRainViewerActive(!isRainViewerActive)} className={`flex-1 border font-orbitron text-[9px] py-1.5 rounded flex items-center justify-center gap-2 ${isRainViewerActive ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    <i className="fa-solid fa-cloud-bolt"></i> RADAR
                  </button>
                  <button onClick={() => setIsSatelliteMode(!isSatelliteMode)} className={`flex-1 border font-orbitron text-[9px] py-1.5 rounded flex items-center justify-center gap-2 ${isSatelliteMode ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                    <i className="fa-solid fa-earth-asia"></i> SATELIT
                  </button>
                  <button onClick={() => setIsWeatherHeatmapVisible(!isWeatherHeatmapVisible)} className={`w-10 border rounded flex items-center justify-center ${isWeatherHeatmapVisible ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    <i className="fa-solid fa-layer-group"></i>
                  </button>
                </div>

                {/* ANIMATED RADAR CONTROLS */}
                {isRainViewerActive && radarFrames.length > 0 && (
                  <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsRadarPlaying(!isRadarPlaying)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isRadarPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}
                      >
                        <i className={`fa-solid ${isRadarPlaying ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
                      </button>
                      <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase tracking-tighter">
                        FRAME {radarIndex + 1}/{radarFrames.length}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      {radarFrames.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === radarIndex ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4] scale-125' : 'bg-gray-800'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GEOJSON LAYERS */}
        {activeMapMode !== 'test' && (
          <GeoJSON 
            data={activeMapMode === 'situational' ? (provinceBoundaries as any) : cityBoundaries}
            key={`${activeMapMode}-${cityBoundaries?.features?.length || 0}`}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  const cityName = feature.properties.NAME_2 || feature.properties.NAME_1;
                  if (cityName) {
                    setSelectedCity(cityName);
                    addToast(`Pusat Fokus: ${cityName}`, 'info');
                  }
                },
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: 0.7,
                    weight: 3
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: activeMapMode === 'situational' ? 0.4 : (selectedCity === (feature.properties.NAME_2 || feature.properties.NAME_1) ? 0.4 : 0.05),
                    weight: selectedCity === (feature.properties.NAME_2 || feature.properties.NAME_1) ? 2 : 1
                  });
                }
              });
            }}
            style={(feature: any) => {
              const cityName = feature.properties.NAME_2 || feature.properties.NAME_1;
              const normalized = normalizeName(cityName);
              const cityData = activeMapMode === 'weather' ? mapCities.find(c => normalizeName(c.city) === normalized) : null;
              const { hex } = cityData ? getConditionIcon(cityData.condition) : { hex: '#1f2937' };
              const isSelected = cityData && selectedCity === cityData.city;
              return {
                fillColor: activeMapMode === 'situational' ? 'rgba(6, 182, 212, 0.1)' : hex,
                weight: isSelected ? 2 : 1,
                opacity: (activeMapMode === 'weather' && isRainViewerActive) ? 0 : 1,
                color: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.4)',
                fillOpacity: (activeMapMode === 'weather' && isRainViewerActive) ? 0 : (activeMapMode === 'situational' ? 0.4 : (cityData ? (isWeatherHeatmapVisible ? 0.4 : 0) : 0.05))
              };
            }}
          />
        )}
      </MapContainer>

      {/* ZOOM & VIEW CONTROLS */}
      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-2">
        <button 
          onClick={() => {
            setSelectedCity('');
            window.dispatchEvent(new CustomEvent('map-national-view'));
          }} 
          className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all flex items-center justify-center group/nav"
          title="Back to National View"
        >
          <i className="fa-solid fa-flag text-sm group-hover/nav:scale-110"></i>
        </button>
        <div className="w-10 h-px bg-white/10 my-1" />
        <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-in'))} className="w-10 h-10 bg-black/60 border border-white/10 rounded-lg text-gray-400 hover:text-cyan-400">
          <i className="fa-solid fa-plus text-sm"></i>
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('map-zoom-out'))} className="w-10 h-10 bg-black/60 border border-white/10 rounded-lg text-gray-400 hover:text-cyan-400">
          <i className="fa-solid fa-minus text-sm"></i>
        </button>
      </div>

      {/* TACTICAL WEATHER REPORT HUD (BOTTOM LEFT) */}
      {activeMapMode === 'weather' && weatherData && (
        <div className="absolute bottom-8 left-8 z-[1000] pointer-events-none">
          <div className="bg-black/60 backdrop-blur-3xl border border-cyan-500/30 p-5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] pointer-events-auto w-[320px] ews-animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <i className={`fa-solid ${getConditionIcon(weatherData.condition || 'Cerah').icon} text-xl`}></i>
                </div>
                <div>
                  <div className="text-[12px] font-orbitron font-bold text-gray-100 uppercase tracking-widest leading-tight">{selectedCity}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[24px] font-orbitron font-bold text-cyan-400 leading-none">{weatherData.temperature || 28}°C</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{weatherData.condition || 'Cerah'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Humidity</div>
                <div className="flex items-end gap-2">
                  <div className="text-[15px] font-orbitron font-bold text-gray-200">{weatherData.humidity || 74}%</div>
                  <div className="h-1 flex-1 bg-gray-800 rounded-full mb-1.5 overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${weatherData.humidity || 74}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">Wind Speed</div>
                <div className="flex items-center gap-2">
                  <div className="text-[15px] font-orbitron font-bold text-gray-200">{weatherData.wind_speed || 12} <span className="text-[10px] text-gray-500">km/h</span></div>
                  <i className="fa-solid fa-wind text-[10px] text-cyan-500 animate-pulse"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSection;
