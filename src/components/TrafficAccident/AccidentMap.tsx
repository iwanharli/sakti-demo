import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { TrafficAccident } from '../../hooks/useTrafficAccidentData';
import 'leaflet/dist/leaflet.css';

interface AccidentMapProps {
  accidents: TrafficAccident[];
}

const createCustomIcon = (status: string) => {
  const color = status === 'MD' ? '#ef4444' : status === 'LB' ? '#f59e0b' : '#06b6d4';
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-6 h-6 bg-${color} rounded-full blur-[4px] opacity-40 animate-pulse" style="background-color: ${color}"></div>
      <div class="relative w-3 h-3 bg-white border-2 border-${color} rounded-full" style="border-color: ${color}"></div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-marker',
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export const AccidentMap: React.FC<AccidentMapProps> = ({ accidents }) => {
  const center: [number, number] = [-2.5489, 118.0149]; // Indonesia Center

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a0e17]">
      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ZoomControl position="bottomright" />

        {accidents.map((acc) => {
          if (!acc.location_latlong) return null;
          const [lat, lng] = acc.location_latlong.split(',').map(s => parseFloat(s.trim()));
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={acc.id} 
              position={[lat, lng]} 
              icon={createCustomIcon(acc.injury_status)}
            >
              <Popup className="ews-popup">
                <div className="p-1 font-rajdhani">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-black ${
                      acc.injury_status === 'MD' ? 'bg-red-500/20 text-red-400' : 
                      acc.injury_status === 'LB' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {acc.injury_status === 'MD' ? 'MENINGGAL DUNIA (MD)' : acc.injury_status === 'LB' ? 'LUKA BERAT' : 'LUKA RINGAN'}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(acc.accident_date).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{acc.victim_name}</div>
                  <div className="text-xs text-gray-400 leading-tight mb-2">{acc.location_description}</div>
                  <div className="text-xs text-cyan-500/80 font-mono tracking-tight">{acc.polres}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Overlay HUD */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-none">
        <div className="bg-[#0d121f]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-pulse" />
            <span className="text-xs text-white font-black uppercase tracking-widest">Incident Radar</span>
          </div>
          <div className="text-[11px] text-gray-500 uppercase tracking-tighter">Live Geospatial Distribution</div>
        </div>
      </div>
    </div>
  );
};
