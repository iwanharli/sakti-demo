import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface SembakoProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const sembakoData = [
  { name: '🍚 Beras Premium', price: 'Rp 15.800', change: '+8.2%', changeColor: 'red', het: 'Rp 14.900', status: '⚠ DI ATAS HET', statusColor: 'red', trend: '📈' },
  { name: '🌶️ Cabai Merah', price: 'Rp 85.000', change: '+22.4%', changeColor: 'red', het: '—', status: '🚨 KRITIS', statusColor: 'red', trend: '🔺' },
  { name: '🥚 Telur Ayam', price: 'Rp 31.500', change: '+5.0%', changeColor: 'amber', het: 'Rp 30.600', status: '⚠ WASPADA', statusColor: 'amber', trend: '📈' },
  { name: '🫗 Minyak Goreng', price: 'Rp 18.200', change: '+3.4%', changeColor: 'amber', het: 'Rp 17.600', status: '⚠ WASPADA', statusColor: 'amber', trend: '📈' },
  { name: '🧂 Gula Pasir', price: 'Rp 17.500', change: '+0.6%', changeColor: 'green', het: 'Rp 17.500', status: '✅ STABIL', statusColor: 'green', trend: '➡️' },
  { name: '🧅 Bawang Merah', price: 'Rp 42.000', change: '-1.2%', changeColor: 'green', het: '—', status: '✅ STABIL', statusColor: 'green', trend: '📉' },
  { name: '🍗 Daging Ayam', price: 'Rp 38.000', change: '+1.1%', changeColor: 'green', het: '—', status: '✅ STABIL', statusColor: 'green', trend: '➡️' },
  { name: '🧂 Garam', price: 'Rp 8.000', change: '0%', changeColor: 'green', het: '—', status: '✅ STABIL', statusColor: 'green', trend: '➡️' },
  { name: '🌾 Tepung Terigu', price: 'Rp 12.500', change: '+0.4%', changeColor: 'green', het: '—', status: '✅ STABIL', statusColor: 'green', trend: '➡️' },
];

const priceAlerts = [
  { 
    level: 'KRITIS', 
    title: 'PERINGATAN KRITIS — CABAI MERAH', 
    desc: 'Kenaikan 22.4% dalam 7 hari melewati ambang batas 15%. Berpotensi memicu keluhan pedagang pasar dan protes harga. Rekomendasi: Koordinasi dengan Disperindag untuk operasi pasar.',
    color: 'red' as const 
  },
  { 
    level: 'WASPADA', 
    title: 'PERINGATAN — BERAS DI ATAS HET', 
    desc: 'Harga beras premium melampaui HET Rp 14.900. Sidak bersama Satgas Pangan diperlukan. 3 distributor teridentifikasi menimbun stok.',
    color: 'amber' as const 
  },
  { 
    level: 'INFO', 
    title: 'INFO — OPERASI PASAR DIJADWALKAN', 
    desc: 'Bulog akan menggelar operasi pasar beras di 3 titik: Pasar Metro, Pasar Cendrawasih, Pasar Margorejo. Jumat, 08:00 WIB.',
    color: 'cyan' as const 
  },
];

export default function Sembako({ addToast }: SembakoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🛒 PANTAUAN HARGA SEMBAKO — KOTA/KABUPATEN
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail komoditas naik', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Komoditas Naik Signifikan</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">4</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">▲</span>
            <span className="text-gray-500">Beras, Cabai, Telur, Minyak</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">📈</div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail komoditas stabil', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Komoditas Stabil</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">5</div>
          <div className="text-sm text-gray-500">Gula, Garam, Tepung, Daging, Bawang</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">✅</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail inflasi', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Inflasi Bulanan</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">1.8%</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">▲ 0.3%</span>
            <span className="text-gray-500">vs bulan lalu</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">💹</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail pasar dipantau', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pasar Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">6</div>
          <div className="text-sm text-gray-500">Tradisional & Modern</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🏪</div>
        </div>
      </div>

      {/* Price Table */}
      <div className="ews-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-semibold text-sm text-gray-300">HARGA SEMBAKO HARI INI — 9 BAHAN POKOK</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500">Update: 14:00 WIB</span>
            <span className="ews-live-badge red">
              <span className="ews-live-dot" />
              LIVE
            </span>
          </div>
        </div>
        <table className="ews-table">
          <thead>
            <tr>
              <th>KOMODITAS</th>
              <th>HARGA/KG</th>
              <th>PERUBAHAN 7H</th>
              <th>HET PEMERINTAH</th>
              <th>STATUS</th>
              <th>TREN</th>
            </tr>
          </thead>
          <tbody>
            {sembakoData.map((item, idx) => (
              <tr 
                key={idx} 
                className="cursor-pointer"
                onClick={() => addToast(`Detail harga: ${item.name}`, 'info')}
              >
                <td className="font-semibold text-white">{item.name}</td>
                <td className="font-mono text-white">{item.price}</td>
                <td>
                  <span className={`ews-tag text-[10px] ${
                    item.changeColor === 'red' ? 'ews-tag-red' :
                    item.changeColor === 'amber' ? 'ews-tag-amber' :
                    'ews-tag-green'
                  }`}>
                    {item.change}
                  </span>
                </td>
                <td className="font-mono text-gray-500">{item.het}</td>
                <td>
                  <span className={`ews-tag text-[10px] ${
                    item.statusColor === 'red' ? 'ews-tag-red' :
                    item.statusColor === 'amber' ? 'ews-tag-amber' :
                    'ews-tag-green'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="text-lg">{item.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Price Alerts */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🚨</span>
            <span className="font-semibold text-sm text-gray-300">ALERT HARGA — POTENSI GANGGUAN SOSIAL</span>
          </div>
          <div className="space-y-3">
            {priceAlerts.map((alert, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
                  alert.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                  alert.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-cyan-500/10 border-cyan-500/30'
                }`}
                onClick={() => addToast(`Detail alert: ${alert.title}`, alert.color === 'red' ? 'alert' : 'info')}
              >
                <div className={`text-xs font-bold mb-1 ${
                  alert.color === 'red' ? 'text-red-400' :
                  alert.color === 'amber' ? 'text-amber-400' :
                  'text-cyan-400'
                }`}>
                  {alert.level === 'KRITIS' && '⚠️ '}
                  {alert.level === 'WASPADA' && '⚠️ '}
                  {alert.level === 'INFO' && 'ℹ️ '}
                  {alert.title}
                </div>
                <div className="text-[10px] text-gray-400 leading-relaxed">{alert.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chili Price Trend */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <span className="font-semibold text-sm text-gray-300">TREN HARGA CABAI MERAH (30 HARI)</span>
          </div>
          <svg viewBox="0 0 360 140" className="w-full h-28">
            <defs>
              <linearGradient id="cabeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="25" x2="360" y2="25" stroke="rgba(239,68,68,0.2)" strokeWidth="1" strokeDasharray="4,4"/>
            <text x="3" y="22" fill="rgba(239,68,68,0.5)" fontSize="7">Rp 90.000</text>
            <line x1="0" y1="65" x2="360" y2="65" stroke="rgba(6,182,212,0.07)" strokeWidth="1"/>
            <text x="3" y="62" fill="rgba(122,168,200,0.4)" fontSize="7">Rp 60.000</text>
            <line x1="0" y1="105" x2="360" y2="105" stroke="rgba(6,182,212,0.07)" strokeWidth="1"/>
            <text x="3" y="102" fill="rgba(122,168,200,0.4)" fontSize="7">Rp 30.000</text>
            <path d="M0,80 L24,78 L48,75 L72,72 L96,68 L120,65 L144,60 L168,55 L192,50 L216,45 L240,40 L264,38 L288,32 L312,30 L336,28 L360,25 L360,120 L0,120 Z" fill="url(#cabeGrad)"/>
            <path d="M0,80 L24,78 L48,75 L72,72 L96,68 L120,65 L144,60 L168,55 L192,50 L216,45 L240,40 L264,38 L288,32 L312,30 L336,28 L360,25" fill="none" stroke="#ef4444" strokeWidth="2"/>
            <circle cx="360" cy="25" r="4" fill="#ef4444" stroke="white" strokeWidth="1.5">
              <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <text x="320" y="135" fill="rgba(122,168,200,0.5)" fontSize="7">Hari ini</text>
            <text x="5" y="135" fill="rgba(122,168,200,0.5)" fontSize="7">30 hari lalu</text>
          </svg>
          <div className="mt-3 p-2 bg-red-500/5 border border-red-500/15 rounded text-[10px] text-gray-400">
            📌 Penyebab utama: Gagal panen akibat cuaca ekstrem di sentra produksi + distribusi terganggu banjir ruas Jl. Lintas Timur
          </div>
        </div>
      </div>
    </div>
  );
}
