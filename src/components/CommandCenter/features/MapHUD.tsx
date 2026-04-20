import React, { useState, useEffect } from 'react';
import type { RiskScore } from '../../../types';

interface MapHUDProps {
  riskScores: RiskScore[];
  status: 'AMAN' | 'WASPADA' | 'BAHAYA' | 'KRITIS';
  activeMapMode: 'situational' | 'weather' | 'test';
  setActiveMapMode: (mode: 'situational' | 'weather' | 'test') => void;
  onProvinceClick: (code: string, name: string) => void;
  onLiveMonitorUpdate?: (code: string) => void;
}

const MapHUD: React.FC<MapHUDProps> = ({ 
  riskScores, 
  status, 
  activeMapMode, 
  setActiveMapMode,
  onProvinceClick,
  onLiveMonitorUpdate
}) => {
  const [currentProvIdx, setCurrentProvIdx] = useState(0);

  // Auto-rotate provinces for the Live Monitor
  useEffect(() => {
    if (riskScores.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProvIdx((prev) => {
        const nextIdx = (prev + 1) % riskScores.length;
        const nextProv = riskScores[nextIdx];
        if (onLiveMonitorUpdate && nextProv) {
           const code = (nextProv as any).region_code 
                     || nextProv.additional_data?.['KODE_PROV'] 
                     || nextProv.additional_data?.['REGION CODE'] 
                     || nextProv.additional_data?.['Region Code'] 
                     || '';
           if (code) onLiveMonitorUpdate(String(code));
        }
        return nextIdx;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [riskScores.length, onLiveMonitorUpdate]);

  const currentProv = riskScores[currentProvIdx];

  const getStatusText = (score: number) => {
    if (score > 60) return 'BAHAYA';
    if (score >= 35) return 'WASPADA';
    return 'AMAN';
  };

  const currentScore = currentProv ? Math.round(currentProv.value) : 0;

  return (
    <>
      {/* STATUS BADGE (TOP CENTER) */}
      {activeMapMode !== 'weather' && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className={`status-badge-v3 ${status.toLowerCase()}`}>
            <span className="tracking-[0.3em] font-black">{status}</span>
            <div className="status-icon-v3">
              <i className={`fa-solid ${status === 'AMAN' ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MONITOR (TOP LEFT) */}
      {currentProv && activeMapMode !== 'weather' && (
        <div className="absolute top-8 left-8 z-30 pointer-events-auto">
          <div 
            className="province-monitor-v3 group cursor-pointer"
            onClick={() => {
                const code = currentProv.additional_data?.['KODE_PROV'] 
                          || currentProv.additional_data?.['REGION CODE']
                          || currentProv.additional_data?.['Region Code']
                          || (currentProv as any).region_code
                          || '';
                onProvinceClick(String(code), currentProv.region_name);
            }}
          >
            <div className="monitor-header-v3">
              <div className="monitor-meta-v3">
                <span className={`m-score ${getStatusText(currentScore).toLowerCase()}`}>
                  SCORE: {currentScore}
                </span>
                <span className="m-divider"></span>
                <span className={`m-status ${getStatusText(currentScore).toLowerCase()}`}>
                  {getStatusText(currentScore)}
                </span>
              </div>
            </div>
            
            <div className="monitor-content-v3">
              <h2 className="province-title-v3">
                {currentProv.region_name}
              </h2>
            </div>
            <div key={currentProvIdx} className="monitor-progress-v3"></div>
          </div>
        </div>
      )}

      {/* MAP MODE SWITCHER (TOP RIGHT) */}
      <div className="absolute top-10 right-10 z-20 flex flex-col gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-3xl border border-white/5 p-1.5 rounded-2xl pointer-events-auto shadow-2xl">
          {[
            { id: 'situational', label: 'Situational', icon: 'fa-layer-group' },
            { id: 'weather', label: 'Weather Radar', icon: 'fa-satellite-dish' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMapMode(mode.id as any)}
              title={mode.label}
              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center transition-all ${
                activeMapMode === mode.id 
                ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${mode.icon} text-sm`}></i>
            </button>
          ))}
        </div>
      </div>

      {/* TACTICAL FOOTER (BOTTOM LEFT) */}
      {activeMapMode !== 'weather' && (
        <div className="absolute bottom-10 left-10 z-20 pointer-events-none flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
        <span className="text-[10px] font-black tracking-[0.3em] text-cyan-400/60 uppercase">
          SAKTI GEOSPATIAL INTELLIGENCE
        </span>
      </div>
      )}

      {/* MAP AURA OVERLAY (BEETWEEN LAYERS) */}
      <div className={`map-aura-aura ${status.toLowerCase()}`}></div>
    </>
  );
};

export default MapHUD;
