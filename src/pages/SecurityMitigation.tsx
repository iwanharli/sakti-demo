import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface MitigasiProps {
  addToast: (message: string, type: Toast['type']) => void;
}

import { riskMatrix, crowdMonitoring, vitalObjects, utilities, recommendations } from '../data/mockSecurityMitigation';

export default function SecurityMitigation({ addToast }: MitigasiProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/25';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🔐 MITIGASI KEAMANAN WILAYAH — KOTA/KABUPATEN
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail indeks risiko wilayah', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Indeks Risiko Wilayah</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">62</div>
          <div className="text-sm text-amber-400">● SEDANG TINGGI — Waspada</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">📊</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail kerumunan massa', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kerumunan Massa</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">3</div>
          <div className="text-sm text-gray-500">Terdeteksi hari ini · 1 berpotensi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">👥</div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail pos pengamanan', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pos Pengamanan Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">14</div>
          <div className="text-sm text-gray-500">dari 16 pos total</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🏛️</div>
        </div>

        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail laporan masyarakat', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Laporan Masyarakat</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">23</div>
          <div className="text-sm text-gray-500">Hari ini · 5 belum ditindaklanjuti</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">📱</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Risk Matrix */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🗺️</span>
            <span className="font-semibold text-sm text-gray-300">MATRIKS RISIKO PER KECAMATAN</span>
          </div>
          <table className="ews-table">
            <thead>
              <tr>
                <th>KECAMATAN</th>
                <th>IRS v3</th>
                <th>LEVEL</th>
                <th>ANCAMAN UTAMA</th>
                <th>TREN 7H</th>
              </tr>
            </thead>
            <tbody>
              {riskMatrix.map((item, idx) => (
                <tr 
                  key={idx} 
                  className="cursor-pointer"
                  onClick={() => addToast(`Detail risiko: ${item.kecamatan}`, 'info')}
                >
                  <td className="font-semibold text-white">{item.kecamatan}</td>
                  <td className={`font-mono font-bold ${
                    item.levelColor === 'red' ? 'text-red-400' :
                    item.levelColor === 'amber' ? 'text-amber-400' :
                    item.levelColor === 'cyan' ? 'text-cyan-400' :
                    'text-emerald-400'
                  }`}>
                    {item.score}
                  </td>
                  <td>
                    <span className={`ews-tag text-[10px] ${
                      item.levelColor === 'red' ? 'ews-tag-red' :
                      item.levelColor === 'amber' ? 'ews-tag-amber' :
                      item.levelColor === 'cyan' ? 'ews-tag-cyan' :
                      'ews-tag-green'
                    }`}>
                      {item.level}
                    </span>
                  </td>
                  <td className="text-[10px] text-gray-400">{item.threats}</td>
                  <td>
                    <span className={`ews-tag text-[10px] ${
                      item.trendColor === 'red' ? 'ews-tag-red' :
                      item.trendColor === 'amber' ? 'ews-tag-amber' :
                      item.trendColor === 'cyan' ? 'ews-tag-cyan' :
                      'ews-tag-green'
                    }`}>
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Crowd Monitoring */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">👥</span>
            <span className="font-semibold text-sm text-gray-300">PANTAUAN KERUMUNAN & POTENSI UNJUK RASA</span>
          </div>
          <div className="space-y-3">
            {crowdMonitoring.map((item, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border-l-4 cursor-pointer hover:opacity-80 transition-opacity ${
                  item.statusColor === 'red' ? 'bg-red-500/5 border-red-500' :
                  item.statusColor === 'amber' ? 'bg-amber-500/5 border-amber-500' :
                  'bg-emerald-500/5 border-emerald-500'
                }`}
                onClick={() => addToast(`Detail kerumunan: ${item.title}`, item.statusColor === 'red' ? 'alert' : 'info')}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                  <span className={`ews-tag text-[10px] ${
                    item.statusColor === 'red' ? 'ews-tag-red' :
                    item.statusColor === 'amber' ? 'ews-tag-amber' :
                    'ews-tag-green'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mb-2">{item.desc}</div>
                {item.tags.length > 0 && (
                  <div className="flex gap-1">
                    {item.tags.map((tag, tidx) => (
                      <span key={tidx} className={`ews-tag text-[9px] ${
                        tag === 'INTELKAM' ? 'ews-tag-cyan' : 'ews-tag-amber'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Vital Objects */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏭</span>
            <span className="font-semibold text-sm text-gray-300">OBYEK VITAL TERPANTAU</span>
          </div>
          <div className="space-y-2">
            {vitalObjects.map((obj, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center p-2 rounded bg-emerald-500/5 border border-gray-700"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{obj.name}</div>
                  <div className="text-[9px] text-gray-500">{obj.type}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusClass(obj.status)}`}>
                  {obj.status === 'safe' ? 'AMAN' : obj.status === 'warning' ? 'WASPADA' : 'KRITIS'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Utilities */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⚡</span>
            <span className="font-semibold text-sm text-gray-300">PANTAUAN UTILITAS PUBLIK</span>
          </div>
          <div className="space-y-3">
            {utilities.map((util, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{util.name}</span>
                  <span className={`font-bold ${
                    util.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {util.value}%
                  </span>
                </div>
                <div className="ews-progress-bar">
                  <div 
                    className={`ews-progress-fill ${
                      util.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${util.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📋</span>
            <span className="font-semibold text-sm text-gray-300">REKOMENDASI MITIGASI AI</span>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-lg border-l-2 cursor-pointer hover:opacity-80 transition-opacity ${
                  rec.color === 'red' ? 'bg-red-500/5 border-red-500' :
                  rec.color === 'amber' ? 'bg-amber-500/5 border-amber-500' :
                  rec.color === 'cyan' ? 'bg-cyan-500/5 border-cyan-500' :
                  'bg-emerald-500/5 border-emerald-500'
                }`}
                onClick={() => addToast(`Detail rekomendasi: ${rec.title}`, 'info')}
              >
                <div className={`text-[10px] font-bold mb-1 ${
                  rec.color === 'red' ? 'text-red-400' :
                  rec.color === 'amber' ? 'text-amber-400' :
                  rec.color === 'cyan' ? 'text-cyan-400' :
                  'text-emerald-400'
                }`}>
                  {rec.title}
                </div>
                <div className="text-[11px] text-gray-400 leading-relaxed">{rec.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
