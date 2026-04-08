import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface KolaborasiProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const instansiList = [
  { icon: '🏢', name: 'Dukcapil Kota Metro', desc: 'Data kependudukan · 98,743 record · Update real-time', status: 'active' as const },
  { icon: '🏥', name: 'RSUD Jend. Ahmad Yani', desc: 'Laporan IGD · Kasus kekerasan & kecelakaan · Sinkron setiap jam', status: 'active' as const },
  { icon: '📊', name: 'BPS Kota Metro', desc: 'Data sosio-ekonomi · Kemiskinan · Pengangguran', status: 'partial' as const },
  { icon: '⚡', name: 'PLN — Data Penerangan Jalan', desc: 'Titik PJU mati · Korelasi titik gelap dengan rawan kejahatan', status: 'active' as const },
  { icon: '🏫', name: 'Dinas Pendidikan', desc: 'Data pelajar rentan · Anak putus sekolah', status: 'offline' as const },
  { icon: '🌧', name: 'BMKG — Stasiun Kota Metro', desc: 'Cuaca real-time · EWS banjir · Peringatan dini', status: 'active' as const },
  { icon: '🚰', name: 'Dinkes — Puskesmas', desc: 'Laporan penyalahgunaan napza · Rehabilitasi', status: 'active' as const },
];

const permintaanData = [
  { icon: '📋', title: 'Verifikasi NIK Tersangka × 3', desc: 'Permintaan dari Reskrim ke Dukcapil · Case SKT-2024-0835', status: 'MENUNGGU 2 JAM', statusColor: 'amber' as const, priority: 'high' as const },
  { icon: '🏥', title: 'Data IGD Malam Minggu Lalu', desc: 'Korelasi kecelakaan vs laporan kekerasan', status: 'DITERIMA', statusColor: 'cyan' as const, priority: 'medium' as const },
  { icon: '⚡', title: 'Data PJU Mati — Kel. Hadimulyo', desc: '12 titik PJU mati berkorelasi dengan zona rawan', status: '✓ SELESAI', statusColor: 'green' as const, priority: 'low' as const },
];

const insights = [
  { title: '🔗 Korelasi PJU vs Curanmor', desc: '12 titik PJU mati = 78% curanmor terjadi dalam radius 200m. Rekomendasi: ajukan ke Pemkot.' },
  { title: '🏥 Laporan IGD ↔ Kekerasan', desc: 'Peningkatan luka trauma IGD Sabtu malam +40% berkorelasi dengan 3 kasus yang belum dilaporkan ke SPKT.' },
  { title: '📊 BPS: Pengangguran & Begal', desc: '3 kelurahan dengan pengangguran >18% menyumbang 65% kasus begal. Data BPS dimasukkan ke model prediktif.' },
];

export default function Kolaborasi({ addToast }: KolaborasiProps) {
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
      {/* Section Title */}
      <div className="ews-section-title">
        🤝 MODUL 5 — KOLABORASI SEKTORAL (DUAL-USE TECHNOLOGY)
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
