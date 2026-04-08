import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface PrediktifProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const recidivismData = [
  { id: '1', initials: 'RS', name: 'Rahmat S.', description: 'Eks-napi Curanmor · Bebas 2 bln lalu', score: 89, riskLevel: 'high' as const },
  { id: '2', initials: 'BW', name: 'Budi W.', description: 'Eks-napi Begal · Bebas 5 bln lalu', score: 82, riskLevel: 'high' as const },
  { id: '3', initials: 'AN', name: 'Ahmad N.', description: 'Eks-napi Narkotika · Bebas 8 bln', score: 61, riskLevel: 'medium' as const },
  { id: '4', initials: 'DK', name: 'Dian K.', description: 'Eks-napi Penipuan · Bebas 1 thn', score: 54, riskLevel: 'medium' as const },
  { id: '5', initials: 'HP', name: 'Hendra P.', description: 'Eks-napi Curanmor · Bebas 2 thn', score: 22, riskLevel: 'low' as const },
];

const curanmorPredictions = [
  { location: 'Pasar Baru', probability: 78, color: 'red' as const },
  { location: 'Terminal', probability: 62, color: 'amber' as const },
  { location: 'Jl. Merdeka', probability: 55, color: 'amber' as const },
];

const begalPredictions = [
  { location: 'Jl. Yos Sudarso', probability: 65, color: 'amber' as const },
  { location: 'Jl. Gatot Subroto', probability: 48, color: 'amber' as const },
  { location: 'Kel. Hadimulyo', probability: 32, color: 'cyan' as const },
];

const dataSources = [
  { name: '📋 SPKT', description: '247 laporan · sinkron 5 menit lalu' },
  { name: '📊 BPS Daerah', description: 'Data sosio-ekonomi · Triwulan IV' },
  { name: '🌧 BMKG', description: 'Cuaca · hujan lebat malam ini' },
  { name: '📡 STAMAOPS', description: 'EWS aktif · 3 peristiwa terdeteksi' },
];

export default function Prediktif({ addToast }: PrediktifProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'ews-tag-red';
      case 'medium':
        return 'ews-tag-amber';
      case 'low':
        return 'ews-tag-green';
      default:
        return 'ews-tag-cyan';
    }
  };

  const getAvatarClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500/15 border-red-500/30 text-red-400';
      case 'medium':
        return 'bg-amber-500/12 border-amber-500/30 text-amber-400';
      case 'low':
        return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';
      default:
        return 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400';
    }
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🔮 MODUL 2 — ANALITIK PREDIKTIF & MITIGASI
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail akurasi model AI', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Akurasi Model AI</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">87%</div>
          <div className="text-sm text-gray-500">Prediksi 24 jam ke depan</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail mantan napi dipantau', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Mantan Napi Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">134</div>
          <div className="text-sm text-red-400">28 Risiko Tinggi</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail prediksi hotspot', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Prediksi Hotspot</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">5</div>
          <div className="text-sm text-gray-500">Zona rawan 24j ke depan</div>
        </div>

        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail data sumber aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Data Sumber Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">8</div>
          <div className="text-sm text-gray-500">SPKT · BPS · BMKG · STAMAOPS</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Recidivism Risk */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <span className="font-semibold text-sm text-gray-300">RECIDIVISM RISK SCORING</span>
          </div>
          <div className="space-y-2">
            {recidivismData.map((person) => (
              <div 
                key={person.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-cyan-500/30 cursor-pointer transition-colors"
                onClick={() => addToast(`Detail profil: ${person.name}`, 'info')}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border ${getAvatarClass(person.riskLevel)}`}>
                  {person.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{person.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{person.description}</div>
                </div>
                <span className={`ews-tag text-[10px] ${getRiskBadgeClass(person.riskLevel)}`}>
                  {person.riskLevel === 'high' ? 'TINGGI' : person.riskLevel === 'medium' ? 'SEDANG' : 'RENDAH'} {person.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Forecasting */}
        <div className="col-span-2 space-y-5">
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⏰</span>
              <span className="font-semibold text-sm text-gray-300">SPATIO-TEMPORAL CRIME FORECASTING — 24 JAM</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Curanmor Predictions */}
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">PREDIKSI CURANMOR</div>
                <div className="space-y-3">
                  {curanmorPredictions.map((pred, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{pred.location}</span>
                        <span className={`text-xs font-mono ${pred.color === 'red' ? 'text-red-400' : 'text-amber-400'}`}>
                          {pred.probability}%
                        </span>
                      </div>
                      <div className="ews-progress-bar">
                        <div 
                          className={`ews-progress-fill ${pred.color === 'red' ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${pred.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Begal Predictions */}
              <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">PREDIKSI BEGAL</div>
                <div className="space-y-3">
                  {begalPredictions.map((pred, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-400">{pred.location}</span>
                        <span className={`text-xs font-mono ${pred.color === 'amber' ? 'text-amber-400' : 'text-cyan-400'}`}>
                          {pred.probability}%
                        </span>
                      </div>
                      <div className="ews-progress-bar">
                        <div 
                          className={`ews-progress-fill ${pred.color === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'}`}
                          style={{ width: `${pred.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Risk */}
            <div className="mt-4 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <div className="text-[10px] text-gray-500 mb-2">⏱ WAKTU RAWAN DIPREDIKSI</div>
              <div className="flex flex-wrap gap-2">
                <span className="ews-tag ews-tag-red text-[10px]">20:00 – 23:00 WIB</span>
                <span className="ews-tag ews-tag-amber text-[10px]">06:00 – 08:00 WIB</span>
                <span className="ews-tag ews-tag-cyan text-[10px]">Sabtu–Minggu ×2.1 risiko</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🗄️</span>
              <span className="font-semibold text-sm text-gray-300">SUMBER DATA AKTIF</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dataSources.map((source, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-cyan-500/5 border border-gray-700 hover:border-cyan-500/30 cursor-pointer transition-colors"
                  onClick={() => addToast(`Detail sumber: ${source.name}`, 'info')}
                >
                  <div className="text-xs text-cyan-400 font-semibold mb-1">{source.name}</div>
                  <div className="text-[10px] text-gray-500">{source.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
