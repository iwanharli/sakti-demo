import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RiskScore } from '../../../types';
import indonesiaGeoJSONUrl from '../../../assets/indonesia.geojson?url';
import MapHUD from './MapHUD';
import WeatherRadarMap from './WeatherRadarMap';

// Mapbox Token from Environment
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

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
  mapCities: any[]; // Used for markers in weather mode
  weatherData: any;
  addToast: (msg: string, type: any) => void;
  setActiveMapMode: (mode: 'situational' | 'weather' | 'test') => void;
  riskScores: RiskScore[]; // New prop for tactical coloring
  setKamtibmasRegion: (region: string) => void; // New prop for syncing dashboard
  openSummaryModal: (code: string, name: string) => void; // Trigger for regional summary
}

const COLOR_SCALE: Record<number, string> = {
  0: 'rgba(16, 185, 129, 0.85)',   // AMAN (Green)
  1: 'rgba(16, 185, 129, 0.85)',   // AMAN
  2: 'rgba(245, 158, 11, 0.85)',   // WASPADA (Orange)
  3: 'rgba(245, 158, 11, 0.85)',   // WASPADA
  4: 'rgba(239, 68, 68, 0.85)',    // BAHAYA (Red)
  5: 'rgba(220, 38, 38, 0.95)'     // KRITIS (Crimson)
};

const MapSection: React.FC<MapSectionProps> = ({
  activeMapMode,
  isRainViewerActive,
  isSatelliteMode,
  selectedCity,
  setSelectedCity,
  cities,
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
  setActiveMapMode,
  riskScores,
  setKamtibmasRegion,
  cityBoundaries,
  openSummaryModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const hoveredStateId = useRef<string | number | null>(null);
  const activeStateId = useRef<string | number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isSatelliteMode 
        ? 'mapbox://styles/mapbox/satellite-v9' 
        : 'mapbox://styles/mapbox/dark-v11', // High-Fidelity Tactical Base
      center: [118.01, -2.55],
      zoom: 3.8,
      antialias: true,
      attributionControl: false // Custom footer branding instead
    });

    mapRef.current = map;

    map.on('load', () => {

      // 1. Globe & Fog Configuration
      try {
        map.setProjection('globe');
        (map as any).setFog({
          range: [0.6, 8],
          color: 'rgba(10, 20, 50, 0.25)', // Deep blue tint
          'horizon-blend': 0.18,
          'high-color': 'rgba(0, 242, 255, 0.12)', // Teal accent
          'space-color': 'rgb(2, 6, 23)', // Tactical Deep Space
          'star-intensity': 0.15
        });
      } catch (e) {
        console.warn('Mapbox Globe/Fog not supported:', e);
      }

      // 2. Hide Global Labels (Only Indonesia)
      const layers = map.getStyle()?.layers ?? [];
      const onlyIndonesia = [
        'any',
        ['==', ['get', 'iso_3166_1'], 'ID'],
        ['==', ['get', 'iso_3166_1_alpha_3'], 'IDN']
      ] as any;

      for (const layer of layers) {
        if (layer.type === 'symbol' && layer.id.match(/(country|state|place|settlement|town|city)/)) {
          try {
            const existing = map.getFilter(layer.id) as any;
            map.setFilter(
              layer.id,
              existing ? (['all', existing, onlyIndonesia] as any) : onlyIndonesia
            );
          } catch { }
        }
      }

      // 3. Add Custom Background for deepest black
      if (!map.getLayer('space_bg')) {
        map.addLayer({
          id: 'space_bg',
          type: 'background',
          paint: {
            'background-color': 'rgb(2, 6, 23)',
            'background-opacity': 1
          }
        }, layers[0]?.id);
      }

      // 4. Add Indonesia Source
      map.addSource('indonesia-provinces', {
        type: 'geojson',
        data: indonesiaGeoJSONUrl,
        promoteId: 'KODE_PROV'
      });

      // 5. Tactical Fill Layer
      map.addLayer({
        id: 'provinces-fill',
        type: 'fill',
        source: 'indonesia-provinces',
        paint: {
          'fill-color': 'rgba(20, 35, 60, 0.85)',
          'fill-opacity': 0.82
        }
      });

      // 6. Neon Glow Outline Layer
      map.addLayer({
        id: 'provinces-outline',
        type: 'line',
        source: 'indonesia-provinces',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'active'], false],
            '#00f2ff', // Active: Bright Cyan
            'rgba(0, 242, 255, 0.25)' // Default
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'active'], false],
            3, // Active: Thicker
            0.8 // Default
          ],
          'line-blur': [
            'case',
            ['boolean', ['feature-state', 'active'], false],
            3, // Active: Glow effect
            0
          ],
          'line-opacity': 0.8
        }
      });
      
      // Await style pipeline to finish processing completely
      map.once('idle', () => {
        setMapLoaded(true);
      });
    });

    // Interaction Handlers
    map.on('mousemove', 'provinces-fill', (e) => {
      if (e.features && e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        const id = e.features[0].id;
        
        if (id !== undefined && id !== hoveredStateId.current) {
          if (hoveredStateId.current !== null) {
            map.setFeatureState(
              { source: 'indonesia-provinces', id: hoveredStateId.current },
              { hover: false }
            );
          }
          hoveredStateId.current = id;
          map.setFeatureState(
            { source: 'indonesia-provinces', id: hoveredStateId.current },
            { hover: true }
          );
        }
      }
    });

    map.on('mouseleave', 'provinces-fill', () => {
      map.getCanvas().style.cursor = '';
      if (hoveredStateId.current !== null) {
        map.setFeatureState(
          { source: 'indonesia-provinces', id: hoveredStateId.current },
          { hover: false }
        );
        hoveredStateId.current = null;
      }
    });

    map.on('click', 'provinces-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const props = feature.properties;
        const name = props?.PROVINSI;
        const code = props?.KODE_PROV || '';
        const id = feature.id;

        if (name) {
          // Clear previous active state
          if (activeStateId.current !== null && activeStateId.current !== id) {
             map.setFeatureState(
               { source: 'indonesia-provinces', id: activeStateId.current },
               { active: false }
             );
          }

          setSelectedCity(name);
          setKamtibmasRegion(name); 
          addToast(`Fokus Wilayah: ${name}`, 'success');
          openSummaryModal(String(code), name);

          // Trigger Neon Glow via active feature state
          if (id !== undefined) {
             activeStateId.current = id;
             map.setFeatureState(
               { source: 'indonesia-provinces', id },
               { active: true }
             );
          }
        }
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleLiveMonitorUpdate = React.useCallback((code: string) => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    
    // We assume the feature ID matches the KODE_PROV for indonesia-provinces source
    if (activeStateId.current !== null && activeStateId.current !== code) {
       map.setFeatureState(
         { source: 'indonesia-provinces', id: activeStateId.current },
         { active: false }
       );
    }
    
    activeStateId.current = code;
    try {
      map.setFeatureState(
         { source: 'indonesia-provinces', id: code },
         { active: true }
      );
    } catch { /* ignore if feature not loaded */ }
  }, [mapLoaded]);

  // RainViewer Radar Layer Update (Simplified for Mapbox compatibility)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const sourceId = 'rainviewer-source';
    const layerId = 'rainviewer-layer';

    if (activeMapMode === 'weather' && isRainViewerActive && radarFrames.length > 0) {
      const currentFrame = radarFrames[radarIndex];
      const url = `https://tilecache.rainviewer.com${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      try {
        if (map.getSource(sourceId)) {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          map.removeSource(sourceId);
        }

        map.addSource(sourceId, {
          type: 'raster',
          tiles: [url],
          tileSize: 256
        });

        map.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId,
          paint: { 'raster-opacity': 0.6 }
        }, 'provinces-outline');
      } catch (e) {}
    } else {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (e) {}
    }
  }, [mapLoaded, activeMapMode, isRainViewerActive, radarFrames, radarIndex]);

  // Update Dynamic Colors based on Risk Scores
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !riskScores.length) return;

    const map = mapRef.current;
    
    // Base Color Mapping Expression
    const baseMatchExpression: any[] = [
      'match',
      ['to-string', ['get', 'KODE_PROV']]
    ];

    riskScores.forEach((risk: any) => {
      const data = risk.additional_data || {};
      const code = risk.region_code || data['REGION CODE'] || data['Region Code'] || data['region_code'] || data['KODE_PROV'];
      
      if (code) {
        const score = Math.round(risk.value);
        let color = 'rgba(16, 185, 129, 0.6)'; // Aman (Green per Mapeco MapBoxService)
        if (score > 60) color = 'rgba(239, 68, 68, 0.85)'; // Bahaya (Red)
        else if (score >= 35) color = 'rgba(245, 158, 11, 0.85)'; // Waspada (Orange)
        
        baseMatchExpression.push(String(code), color);
      }
    });

    baseMatchExpression.push('rgba(20, 35, 60, 0.85)'); // Default Tactical Blue

    // Apply Mapeco Tactial Hover Override
    const expression: mapboxgl.ExpressionSpecification = [
       'case',
       ['boolean', ['feature-state', 'hover'], false],
       'rgba(0, 242, 255, 0.85)', // Teal hover glow
       ['boolean', ['feature-state', 'active'], false],
       'rgba(0, 255, 255, 0.5)',  // Active: Bright glowing fill
       baseMatchExpression
    ];

    if (map.getLayer('provinces-fill')) {
      map.setPaintProperty('provinces-fill', 'fill-color', expression);
    }

    updateTacticalMarkers();
  }, [mapLoaded, riskScores, activeMapMode]);

  // Update Map Style on Mode Change
  useEffect(() => {
    if (!mapRef.current) return;
    const style = isSatelliteMode 
      ? 'mapbox://styles/mapbox/satellite-v9' 
      : 'mapbox://styles/mapbox/dark-v11'; // Maintain Tactical Base
    mapRef.current.setStyle(style);
  }, [isSatelliteMode]);

  const updateTacticalMarkers = async () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (activeMapMode !== 'situational') return;

    // We need centroids for 38 provinces. 
    // For now, we'll extract them from the source data once loaded
    const source = map.getSource('indonesia-provinces') as mapboxgl.GeoJSONSource;
    if (!source) return;

    // Since we can't easily iterate GeoJSON source features synchronously, 
    // we fetch the data if not already fetched.
    try {
      const response = await fetch(indonesiaGeoJSONUrl);
      const data = await response.json();
      
      data.features.forEach((feature: any) => {
        const props = feature.properties;
        const name = props.PROVINSI;
        const code = props.KODE_PROV;
        
        // Find matching risk score
        const risk = riskScores.find(r => r.region_name === name);
        if (!risk) return;

        // Calculate centroid (approximate)
        const center = getCentroid(feature.geometry);
        if (!center) return;

        // Create HTML Element
        const el = document.createElement('div');
        el.className = 'region-marker';
        
        const scoreIndex = Math.min(Math.floor(risk.value / 20), 5);
        el.innerHTML = `
          <div class="marker-container marker-level-${scoreIndex}">
            <div class="marker-dot">
              <span><i class="fa-solid fa-location-dot"></i></span>
            </div>
            <div class="marker-decor"></div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedCity(name);
          setKamtibmasRegion(name); // SYNC WITH DASHBOARD
          addToast(`Fokus Wilayah: ${name}`, 'success');
          openSummaryModal(String(code), name);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(center as [number, number])
          .addTo(map);
          
        markersRef.current.push(marker);
      });
    } catch (err) {
      console.error('Failed to update tactical markers:', err);
    }
  };

  const getCentroid = (geometry: any): [number, number] | null => {
    let coords: any[] = [];
    if (geometry.type === 'Polygon') coords = geometry.coordinates[0];
    else if (geometry.type === 'MultiPolygon') coords = geometry.coordinates[0][0];
    else return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    coords.forEach(([x, y]: [number, number]) => {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    });
    return [(minX + maxX) / 2, (minY + maxY) / 2];
  };

  // Derive overall status (Average of all valid provinces, or look for NASIONAL explicitly)
  const getOverallStatus = () => {
    if (!riskScores.length) return 'AMAN';

    // 1. If backend explicitly provides 'NASIONAL' in the list
    const nationalRisk = riskScores.find(r => 
      r.region_name?.toUpperCase() === 'NASIONAL' || 
      r.additional_data?.['KODE_PROV'] === '100'
    );

    if (nationalRisk) {
      const score = Math.round(nationalRisk.value);
      if (score > 80) return 'KRITIS';
      if (score > 60) return 'BAHAYA';
      if (score >= 35) return 'WASPADA';
      return 'AMAN';
    }

    // 2. Fallback: Meaningful national average (not maximum outlier)
    const validScores = riskScores.filter(r => r.value > 0);
    if (!validScores.length) return 'AMAN';
    
    const sum = validScores.reduce((acc, r) => acc + r.value, 0);
    const avg = sum / validScores.length;
    const roundedAvg = Math.round(avg);

    if (roundedAvg > 80) return 'KRITIS';
    if (roundedAvg > 60) return 'BAHAYA';
    if (roundedAvg >= 35) return 'WASPADA';
    return 'AMAN';
  };

  return (
    <div className="flex-1 bg-[#020617] rounded-3xl border border-white/10 relative overflow-hidden group/map-container">
      {/* TACTICAL MAP HUD OVERLAY */}
      <MapHUD 
        riskScores={riskScores}
        status={getOverallStatus() as any}
        activeMapMode={activeMapMode}
        setActiveMapMode={setActiveMapMode}
        onProvinceClick={(code, name) => {
            setSelectedCity(name);
            setKamtibmasRegion(name);
            openSummaryModal(code, name);
        }}
        onLiveMonitorUpdate={handleLiveMonitorUpdate}
      />

      {/* Actual Mapbox Container */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full ${activeMapMode === 'weather' ? 'hidden' : 'block'}`} 
      />

      {/* National Weather Map (Leaflet) */}
      {activeMapMode === 'weather' && (
        <WeatherRadarMap 
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          mapCities={mapCities}
          cityBoundaries={cityBoundaries}
          weatherData={weatherData}
          loading={false} // Loading handled by useCommandCenterData
          addToast={addToast}
        />
      )}

      {/* ZOOM & VIEW CONTROLS */}
      {activeMapMode !== 'weather' && (
        <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-2">
        <button 
          onClick={() => {
            setSelectedCity('');
            mapRef.current?.flyTo({ center: [118.01, -2.55], zoom: 3.8 });
          }} 
          className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center justify-center group/nav"
          title="Back to National View"
        >
          <i className="fa-solid fa-flag text-sm group-hover/nav:scale-110"></i>
        </button>
        <div className="w-10 h-px bg-white/5 my-1" />
        <button onClick={() => mapRef.current?.zoomIn()} className="w-10 h-10 bg-black/40 border border-white/5 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors">
          <i className="fa-solid fa-plus text-sm"></i>
        </button>
        <button onClick={() => mapRef.current?.zoomOut()} className="w-10 h-10 bg-black/40 border border-white/5 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors">
          <i className="fa-solid fa-minus text-sm"></i>
        </button>
      </div>
      )}
    </div>
  );
};

export default MapSection;
