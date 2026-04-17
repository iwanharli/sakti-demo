import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

import { instansiList, permintaanData, insights } from '../data/mockSectoralCollaboration';

export default function SectoralCollaboration() {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'partial':
        return 'bg-amber-500/10 text-amber-400';
      case 'offline':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '● AKTIF';
      case 'partial':
        return '● PARSIAL';
      case 'offline':
        return '● OFFLINE';
      default:
        return '● UNKNOWN';
    }
  };

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* DATA SOURCE & METHODOLOGY SECTION */}
      <div className="ews-card p-6 border-l-4 border-cyan-500 bg-cyan-500/5 mb-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,211,234,0.1)]">
              <i className="fa-solid fa-handshake text-xl"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-orbitron font-bold text-xs text-white uppercase tracking-widest">DATA SOURCE & TEKNIK PENGOLAHAN</h3>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed font-rajdhani max-w-4xl">
                Portal pertukaran data lintas instansi menggunakan teknologi Dual-Use untuk koordinasi operasional bersama dan transparansi informasi strategis antar lembaga negara.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail instansi terhubung', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Instansi Terhubung</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">7</div>
          <div className="text-sm text-gray-500">Aktif · API tersinkron</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail data dipertukarkan', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Data Dipertukarkan Hari Ini</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">214K</div>
          <div className="text-sm text-gray-500">Record antar instansi</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail permintaan pending', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Permintaan Pending</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">4</div>
          <div className="text-sm text-gray-500">Menunggu verifikasi</div>
        </div>

        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail sesi aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sesi Aktif Bersama</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">2</div>
          <div className="text-sm text-gray-500">Koordinasi lintas instansi</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Instansi List */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏛️</span>
            <span className="font-semibold text-sm text-gray-300">STATUS KONEKSI INSTANSI</span>
          </div>
          <div className="space-y-2">
            {instansiList.map((instansi, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-cyan-500/30 cursor-pointer transition-colors"
                onClick={() => addToast(`Detail koneksi: ${instansi.name}`, 'info')}
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl flex-shrink-0">
                  {instansi.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{instansi.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{instansi.desc}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusClass(instansi.status)}`}>
                  {getStatusLabel(instansi.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Permintaan Data */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📨</span>
              <span className="font-semibold text-sm text-gray-300">PERMINTAAN DATA AKTIF</span>
            </div>
            <div className="space-y-2">
              {permintaanData.map((item, idx) => (
                <div 
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
                    item.priority === 'high' ? 'bg-amber-500/5 border-amber-500/30 border-l-4' :
                    item.priority === 'medium' ? 'bg-cyan-500/5 border-cyan-500/30 border-l-4' :
                    'bg-emerald-500/5 border-emerald-500/30 border-l-4'
                  }`}
                  onClick={() => addToast(`Detail permintaan: ${item.title}`, 'info')}
                >
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-[10px] text-gray-500">{item.desc}</div>
                    <div className="mt-1.5">
                      <span className={`ews-tag text-[9px] ${
                        item.statusColor === 'amber' ? 'ews-tag-amber' :
                        item.statusColor === 'cyan' ? 'ews-tag-cyan' :
                        'ews-tag-green'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💡</span>
              <span className="font-semibold text-sm text-gray-300">INSIGHT LINTAS SEKTORAL</span>
            </div>
            <div className="space-y-2">
              {insights.map((insight, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-cyan-500/5 border border-gray-700 hover:border-cyan-500/30 cursor-pointer transition-colors"
                  onClick={() => addToast(`Detail insight: ${insight.title}`, 'info')}
                >
                  <div className="text-xs font-semibold text-white mb-1">{insight.title}</div>
                  <div className="text-[10px] text-gray-500 leading-relaxed">{insight.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
