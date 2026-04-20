import React, { useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { TrafficAccident } from '../../hooks/useTrafficAccidentData';
import 'leaflet/dist/leaflet.css';

interface AccidentMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  accident: TrafficAccident | null;
}

// 1. Move Static Logic outside for performance
const createTacticalIcon = (status: string) => {
  const color = status === 'MD' ? '#ef4444' : status === 'LB' ? '#f59e0b' : (status === 'LL' || status === 'LR') ? '#06b6d4' : '#9ca3af';
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
      <div class="absolute w-8 h-8 rounded-full animate-pulse opacity-40 border-2" style="border-color: ${color}"></div>
      <div class="relative w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}"></div>
    </div>
  `;
  return L.divIcon({
    className: 'tactical-marker',
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

// 2. Memoize Static HUD to prevent re-renders during Map interaction
const VictimCard = memo(({ accident }: { accident: TrafficAccident }) => (
  <div className="bg-[#0a0f1a]/95 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl max-w-sm pointer-events-auto transform-gpu">
    <div className="flex items-center justify-between mb-4">
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
        accident.injury_status === 'MD' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
        accident.injury_status === 'LB' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 
        'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'
      }`}>
        {accident.injury_status === 'MD' ? 'Meninggal Dunia' : accident.injury_status === 'LB' ? 'Luka Berat' : 'Luka Luka'}
      </span>
      <span className="text-[10px] text-gray-500 font-bold font-mono">
        {new Date(accident.accident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </span>
    </div>
    
    <div className="mb-4">
      <div className="text-xl font-orbitron font-black text-white uppercase tracking-tight">{accident.victim_name}</div>
      <div className="flex items-center gap-2 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em]">{accident.victim_status}</span>
      </div>
    </div>

    <div className="space-y-3 pt-4 border-t border-white/5">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Location Matrix</span>
        <p className="text-[11px] text-gray-400 leading-relaxed italic">"{accident.location_description.replace(/,?\s*TITIK KOORDINAT.*$/i, '')}"</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[9px] text-white/30 uppercase font-black tracking-widest">Polres</div>
          <div className="text-[11px] text-white font-bold">{accident.polres}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-white/30 uppercase font-black tracking-widest">Coordinates</div>
          <div className="text-[11px] text-cyan-400 font-mono font-bold leading-none mt-1">{accident.location_latlong}</div>
        </div>
      </div>
    </div>
  </div>
));

VictimCard.displayName = 'VictimCard';

export const AccidentMapModal: React.FC<AccidentMapModalProps> = ({ isOpen, onClose, accident }) => {
  // 3. Early return and position calculation
  const position = useMemo(() => {
    if (!accident?.location_latlong) return null;
    const [lat, lng] = accident.location_latlong.split(',').map(s => parseFloat(s.trim()));
    return [lat, lng] as [number, number];
  }, [accident]);

  const markerIcon = useMemo(() => {
    if (!accident) return null;
    return createTacticalIcon(accident.injury_status);
  }, [accident]);

  if (!isOpen || !accident || !position) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in zoom-in-95 duration-200 transform-gpu">
      {/* 4. Optimized Background Overlay (Reduced Blur Intensity) */}
      <div 
        className="absolute inset-0 bg-[#020617]/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* 5. Modal Container with hardware acceleration */}
      <div className="relative w-full max-w-6xl h-full max-h-[800px] bg-[#0a0f1a] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transform-gpu translate-z-0">
        {/* Header HUD */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
            <div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.3em]">Sector Analysis</span>
                  <span className="text-gray-700 text-xs">/</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{accident.report_number}</span>
               </div>
               <h2 className="text-xl font-orbitron font-black text-white tracking-widest uppercase truncate leading-none mt-1">Incident Localization</h2>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all group"
          >
            <i className="fa-solid fa-xmark text-lg group-hover:rotate-90 transition-transform duration-300"></i>
          </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative overflow-hidden bg-[#0d121f]">
          <MapContainer 
            center={position} 
            zoom={16} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {markerIcon && <Marker position={position} icon={markerIcon} />}
            <ZoomControl position="bottomright" />
          </MapContainer>

          {/* Tactical Overlay HUDs */}
          <div className="absolute top-6 left-6 z-[1000] pointer-events-none space-y-4">
             <VictimCard accident={accident} />
          </div>

          <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
             <div className="bg-[#0a0f1a]/95 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-4 transform-gpu">
                <div className="flex flex-col items-end">
                   <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">Satellite Relay</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-500 font-black">ACTIVE</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer HUD */}
        <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 opacity-50">
                 <i className="fa-solid fa-crosshairs text-cyan-500 text-xs"></i>
                 <span className="text-[10px] text-white font-black uppercase tracking-widest">Target Acquisition Ready</span>
              </div>
           </div>
           <span className="text-[9px] text-gray-700 font-mono font-bold tracking-tight">MODE: MITIGATION_LOG_FOCUS_v2.1_OPT</span>
        </div>
      </div>
    </div>
  );
};
