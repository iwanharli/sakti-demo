import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface CuacaProps {
  addToast: (message: string, type: Toast['type']) => void;
}

import { weatherForecast, correlations } from '../data/mockWeatherForecast';

export default function WeatherForecast({ addToast }: CuacaProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🌦️ PREDIKSI CUACA & KLIMATOLOGI — KOTA/KABUPATEN
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail suhu saat ini', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Suhu Saat Ini</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">29°C</div>
          <div className="text-sm text-gray-500">Terasa seperti 33°C · Lembab 82%</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🌡️</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail curah hujan', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Curah Hujan Hari Ini</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">48mm</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">▲ Tinggi</span>
            <span className="text-gray-500">vs rata-rata 22mm</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🌧️</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail kecepatan angin', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kecepatan Angin</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">18km/h</div>
          <div className="text-sm text-gray-500">Arah: Barat Laut · Stabil</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">💨</div>
        </div>

        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail indeks UV', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Indeks UV</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">6</div>
          <div className="text-sm text-amber-400">● MODERAT TINGGI</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">☀️</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* 7 Day Forecast */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📅</span>
            <span className="font-semibold text-sm text-gray-300">PRAKIRAAN CUACA 7 HARI</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weatherForecast.map((day, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded-lg border text-center cursor-pointer hover:opacity-80 transition-opacity ${
                  day.isToday 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-cyan-500/5 border-cyan-500/15'
                }`}
                onClick={() => addToast(`Detail cuaca ${day.day}`, 'info')}
              >
                <div className={`text-[9px] ${day.isToday ? 'text-amber-400 font-bold' : 'text-gray-500'}`}>
                  {day.day}
                </div>
                <div className="text-xl my-1">{day.icon}</div>
                <div className="text-sm font-bold text-white">{day.high}°</div>
                <div className="text-[9px] text-gray-500">{day.low}°</div>
                <div className={`text-[8px] mt-1 ${
                  day.rainChance > 80 ? 'text-red-400' :
                  day.rainChance > 50 ? 'text-amber-400' :
                  'text-cyan-400'
                }`}>
                  {day.rainChance}%💧
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-xs text-red-400 font-bold mb-1">⚠️ PERINGATAN CUACA EKSTREM</div>
            <div className="text-xs text-gray-400">
              Potensi hujan lebat disertai petir Selasa-Rabu. Waspadai genangan & pohon tumbang di jalur utama.
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Rainfall Chart */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📈</span>
              <span className="font-semibold text-sm text-gray-300">TREN CURAH HUJAN 30 HARI (mm)</span>
            </div>
            <svg viewBox="0 0 360 120" className="w-full h-24">
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="360" y2="30" stroke="rgba(239,68,68,0.2)" strokeWidth="1" strokeDasharray="4,4"/>
              <text x="362" y="33" fill="rgba(239,68,68,0.5)" fontSize="7">Batas Bahaya</text>
              <path d="M0,90 L12,85 L24,88 L36,70 L48,75 L60,65 L72,60 L84,72 L96,55 L108,50 L120,58 L132,42 L144,48 L156,55 L168,40 L180,35 L192,45 L204,38 L216,30 L228,25 L240,32 L252,28 L264,35 L276,22 L288,18 L300,25 L312,20 L324,15 L336,22 L348,18 L360,10 L360,110 L0,110 Z" fill="url(#rainGrad)"/>
              <path d="M0,90 L12,85 L24,88 L36,70 L48,75 L60,65 L72,60 L84,72 L96,55 L108,50 L120,58 L132,42 L144,48 L156,55 L168,40 L180,35 L192,45 L204,38 L216,30 L228,25 L240,32 L252,28 L264,35 L276,22 L288,18 L300,25 L312,20 L324,15 L336,22 L348,18 L360,10" fill="none" stroke="#06b6d4" strokeWidth="1.5"/>
              <text x="5" y="108" fill="rgba(122,168,200,0.5)" fontSize="7">1</text>
              <text x="175" y="108" fill="rgba(122,168,200,0.5)" fontSize="7">15</text>
              <text x="345" y="108" fill="rgba(122,168,200,0.5)" fontSize="7">30</text>
            </svg>
            <div className="text-[10px] text-gray-500 mt-2">
              Tren curah hujan meningkat signifikan · Rata-rata 48mm/hari (normal: 22mm)
            </div>
          </div>

          {/* Air Quality */}
          <div className="ews-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌫️</span>
              <span className="font-semibold text-sm text-gray-300">KUALITAS UDARA (AQI)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="12"
                    strokeDasharray={`${(65 / 100) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-orbitron text-xl font-bold text-emerald-400">65</span>
                  <span className="text-[8px] text-gray-500">AQI</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-emerald-400 mb-1">SEDANG — Baik</div>
                <div className="text-[10px] text-gray-500">PM2.5: 18μg/m³ · PM10: 34μg/m³ · CO: 0.8ppm</div>
                <div className="text-[10px] text-gray-400 mt-1">Aktivitas luar ruangan aman untuk semua kelompok</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather-Kamtibmas Correlation */}
      <div className="ews-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔗</span>
          <span className="font-semibold text-sm text-gray-300">KORELASI CUACA ↔ GANGGUAN KAMTIBMAS</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {correlations.map((item, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-lg border text-center cursor-pointer hover:opacity-80 transition-opacity ${
                item.color === 'red' ? 'bg-red-500/5 border-red-500/15' :
                item.color === 'amber' ? 'bg-amber-500/5 border-amber-500/15' :
                item.color === 'cyan' ? 'bg-cyan-500/5 border-cyan-500/15' :
                'bg-emerald-500/5 border-emerald-500/15'
              }`}
              onClick={() => addToast(`Detail korelasi: ${item.label}`, 'info')}
            >
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">{item.label}</div>
              <div className={`font-orbitron text-2xl font-bold ${
                item.color === 'red' ? 'text-red-400' :
                item.color === 'amber' ? 'text-amber-400' :
                item.color === 'cyan' ? 'text-cyan-400' :
                'text-emerald-400'
              }`}>
                {item.value}
              </div>
              <div className="text-[9px] text-gray-500 mt-1">
                {item.label.includes('BANJIR') ? 'Korelasi historis' :
                 item.label.includes('HUJAN') ? 'Laka Lantas naik' :
                 item.label.includes('LAMPU') ? 'Saat listrik padam' :
                 'Gangguan menurun'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
