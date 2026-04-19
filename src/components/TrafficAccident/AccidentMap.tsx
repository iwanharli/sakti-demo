import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TrafficAccident } from '../../hooks/useTrafficAccidentData';
import 'leaflet/dist/leaflet.css';

interface AccidentMapProps {
  accidents: TrafficAccident[];
  focusCoord?: string;
}

const MapController: React.FC<{ coords?: string }> = ({ coords }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (coords) {
      const [lat, lng] = coords.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 16, {
          duration: 1.5,
          animate: true
        });
      }
    }
  }, [coords, map]);

  return null;
};

const createCustomIcon = (status: string, count: number = 1) => {
  const color = status === 'MD' ? '#ef4444' : status === 'LB' ? '#f59e0b' : (status === 'LL' || status === 'LR') ? '#06b6d4' : '#9ca3af';
  const html = `
    <div class="relative flex items-center justify-center">
      <!-- Tactical Pulse -->
      <div class="absolute w-full h-full rounded-full tactical-pulse" style="background-color: ${color}"></div>
      
      <div class="absolute w-4 h-4 rounded-full border border-${color}/40 bg-${color}/10" style="border-color: ${color}66; background-color: ${color}1a"></div>
      <div class="relative w-2 h-2 rounded-full border border-white/80" style="background-color: ${color}"></div>
      ${count > 1 ? `
        <div class="absolute -top-3 -right-3 bg-white text-${color} text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.5)] border border-${color}/20" style="color: ${color}">
          ${count}
        </div>
      ` : ''}
    </div>
  `;
  return L.divIcon({
    className: 'custom-marker',
    html,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

export const AccidentMap: React.FC<AccidentMapProps> = ({ accidents, focusCoord }) => {
  const center: [number, number] = [-2.5489, 118.0149]; // Indonesia Center

  // Group accidents by exact or near coordinates
  const groupedAccidents = React.useMemo(() => {
    const groups: { [key: string]: TrafficAccident[] } = {};
    let validCount = 0;

    accidents.forEach(acc => {
      if (!acc.location_latlong) return;
      const [lat, lng] = acc.location_latlong.split(',').map(s => parseFloat(s.trim()));
      if (isNaN(lat) || isNaN(lng)) return;
      
      validCount++;
      // Rounded to 3 decimal places for grouping (roughly 110m proximity)
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(acc);
    });

    return { 
      data: Object.entries(groups).map(([key, items]) => ({
        coords: key.split(',').map(Number) as [number, number],
        items,
        worstStatus: items.some(i => i.injury_status === 'MD') ? 'MD' : 
                      items.some(i => i.injury_status === 'LB') ? 'LB' : 
                      items.some(i => i.injury_status === 'LL' || i.injury_status === 'LR') ? 'LL' : ''
      })),
      validCount,
      totalCount: accidents.length
    };
  }, [accidents]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a0e17]" id="accident-map-container">
      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapController coords={focusCoord} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="bottomright" />

        {groupedAccidents.data.map((group, idx) => (
          <Marker 
            key={idx} 
            position={group.coords} 
            icon={createCustomIcon(group.worstStatus, group.items.length)}
          >
            <Popup className="ews-popup">
              <div className="p-1 max-h-[400px] overflow-y-auto ews-scrollbar">
                {group.items.map((acc, i) => (
                  <div key={acc.id} className={`p-3 min-w-[240px] relative overflow-hidden group ${i > 0 ? 'border-t border-white/10 mt-2 pt-4' : ''}`}>
                    {/* Tactical Brackets */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50" />

                    <div className="flex items-center justify-between gap-6 mb-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] border ${
                        acc.injury_status === 'MD' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
                        acc.injury_status === 'LB' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                        (acc.injury_status === 'LR' || acc.injury_status === 'LL') ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 
                        'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {acc.injury_status === 'MD' ? 'MENINGGAL DUNIA' : 
                         acc.injury_status === 'LB' ? 'LUKA BERAT' : 
                         (acc.injury_status === 'LR' || acc.injury_status === 'LL') ? 'LUKA RINGAN' : 'TANPA KONDISI'}
                      </span>
                      <div className="text-right">
                        <div className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Accident Date</div>
                        <div className="text-[10px] text-white font-bold">{new Date(acc.accident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4 relative">
                      <div className="text-base font-black text-white uppercase tracking-tight leading-tight mb-0.5">{acc.victim_name}</div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
                        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">{acc.victim_status}</div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] text-white/30 uppercase font-black tracking-widest">
                          <i className="fa-solid fa-location-dot" />
                          <span>Incident Location</span>
                        </div>
                        <p className="text-[11px] text-gray-300 leading-relaxed italic pr-2">
                          "{acc.location_description.replace(/,?\s*TITIK KOORDINAT.*$/i, '')}"
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Satuan</span>
                          <span className="text-[10px] text-cyan-400 font-bold truncate">{acc.polres}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                          <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Wilayah</span>
                          <span className="text-[10px] text-white/80 font-bold uppercase truncate">{acc.city_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Overlay HUD */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="bg-[#0d121f]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
            <span className="text-xs text-white font-black uppercase tracking-widest">Incident Radar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/30 uppercase font-black tracking-tighter">Sync Status</span>
              <span className="text-[11px] text-gray-300 font-bold">
                {groupedAccidents.validCount} / {groupedAccidents.totalCount} <span className="text-gray-500 font-medium">Mapped</span>
              </span>
            </div>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[9px] text-white/30 uppercase font-black tracking-tighter">Clusters</span>
              <span className="text-[11px] text-cyan-500 font-bold">{groupedAccidents.data.length} Points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
