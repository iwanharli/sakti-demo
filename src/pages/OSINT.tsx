import { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface OSINTProps {
  addToast: (message: string, type: Toast['type']) => void;
}

const keywordAlerts = [
  { keyword: 'demo · kerusuhan', platform: 'X, FB', volume: '3,240', spike: '+280%', spikeColor: 'red', sentiment: 'NEGATIF', sentimentColor: 'red', status: '🚨 ALERT', statusColor: 'red' },
  { keyword: 'penipuan · scam', platform: 'FB, TikTok', volume: '1,870', spike: '+340%', spikeColor: 'amber', sentiment: 'WASPADA', sentimentColor: 'amber', status: '⚠ MONITOR', statusColor: 'amber' },
  { keyword: 'begal · rampok', platform: 'X, Berita', volume: '920', spike: '+120%', spikeColor: 'amber', sentiment: 'NEGATIF', sentimentColor: 'red', status: '⚠ MONITOR', statusColor: 'amber' },
  { keyword: 'polisi · polres', platform: 'Semua', volume: '4,510', spike: '+15%', spikeColor: 'cyan', sentiment: 'CAMPURAN', sentimentColor: 'cyan', status: '✓ NORMAL', statusColor: 'green' },
  { keyword: 'keamanan · aman', platform: 'FB, Berita', volume: '2,180', spike: '+8%', spikeColor: 'green', sentiment: 'POSITIF', sentimentColor: 'green', status: '✓ NORMAL', statusColor: 'green' },
];

export default function OSINT({ addToast }: OSINTProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        📡 MODUL 1 — SOCIAL SENSING & OSINT (INTELKAM & SIBER)
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card purple cursor-pointer" onClick={() => addToast('Detail postingan dipantau', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Postingan Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-purple-400 mb-1">24.7K</div>
          <div className="text-sm text-gray-500">Dalam 24 jam terakhir</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">🌐</div>
        </div>

        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail alert provokasi', 'alert')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Alert Provokasi</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">7</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-400">▲ 3</span>
            <span className="text-gray-500">vs kemarin</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">⚡</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail akun dipantau', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Akun Dipantau</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">312</div>
          <div className="text-sm text-gray-500">Berpotensi provokatif</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">👤</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail platform aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Platform Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">4</div>
          <div className="text-sm text-gray-500">X · FB · TikTok · Berita</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10">📲</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Real-time Sentiment */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <span className="font-semibold text-sm text-gray-300">REAL-TIME SENTIMENT DASHBOARD</span>
          </div>
          <svg viewBox="0 0 360 130" className="w-full h-28">
            <defs>
              <linearGradient id="sg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="25" x2="360" y2="25" stroke="rgba(6,182,212,0.07)" strokeWidth="1"/>
            <line x1="0" y1="55" x2="360" y2="55" stroke="rgba(6,182,212,0.07)" strokeWidth="1"/>
            <line x1="0" y1="85" x2="360" y2="85" stroke="rgba(6,182,212,0.07)" strokeWidth="1"/>
            <path d="M0,70 L30,65 L60,55 L90,60 L120,40 L150,45 L180,50 L210,35 L240,42 L270,38 L300,30 L330,35 L360,25 L360,110 L0,110 Z" fill="url(#sg1)"/>
            <path d="M0,70 L30,65 L60,55 L90,60 L120,40 L150,45 L180,50 L210,35 L240,42 L270,38 L300,30 L330,35 L360,25" fill="none" stroke="#10b981" strokeWidth="1.5"/>
            <path d="M0,90 L30,85 L60,88 L90,75 L120,80 L150,70 L180,75 L210,65 L240,68 L270,72 L300,60 L330,65 L360,55 L360,110 L0,110 Z" fill="url(#sg2)"/>
            <path d="M0,90 L30,85 L60,88 L90,75 L120,80 L150,70 L180,75 L210,65 L240,68 L270,72 L300,60 L330,65 L360,55" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3"/>
            <text x="8" y="118" fill="rgba(122,168,200,0.5)" fontSize="8">00:00</text>
            <text x="88" y="118" fill="rgba(122,168,200,0.5)" fontSize="8">06:00</text>
            <text x="178" y="118" fill="rgba(122,168,200,0.5)" fontSize="8">12:00</text>
            <text x="268" y="118" fill="rgba(122,168,200,0.5)" fontSize="8">18:00</text>
            <text x="340" y="118" fill="rgba(122,168,200,0.5)" fontSize="8">Now</text>
          </svg>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-3 h-0.5 bg-emerald-500" />
              <span>Sentimen Positif</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-3 h-0.5 bg-red-500" style={{ background: 'repeating-linear-gradient(90deg,#ef4444 0,#ef4444 5px,transparent 5px,transparent 8px)' }} />
              <span>Sentimen Negatif</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { platform: 'TWITTER/X', value: '12.4K' },
              { platform: 'FACEBOOK', value: '8.1K' },
              { platform: 'TIKTOK', value: '4.2K' },
            ].map((item) => (
              <div key={item.platform} className="text-center p-2 bg-cyan-500/5 rounded">
                <div className="text-[9px] text-gray-500 mb-1">{item.platform}</div>
                <div className="font-orbitron text-base text-cyan-400">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Network Mapping */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🕸️</span>
            <span className="font-semibold text-sm text-gray-300">SOCIAL NETWORK MAPPING — PROVOKATOR</span>
          </div>
          <svg viewBox="0 0 280 180" className="w-full h-40">
            {/* Connection lines */}
            <line x1="140" y1="90" x2="80" y2="50" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5"/>
            <line x1="140" y1="90" x2="200" y2="50" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5"/>
            <line x1="140" y1="90" x2="60" y2="130" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
            <line x1="140" y1="90" x2="220" y2="130" stroke="rgba(245,158,11,0.3)" strokeWidth="1"/>
            <line x1="140" y1="90" x2="140" y2="155" stroke="rgba(6,182,212,0.25)" strokeWidth="1"/>
            <line x1="80" y1="50" x2="40" y2="30" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
            <line x1="80" y1="50" x2="50" y2="70" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
            <line x1="200" y1="50" x2="240" y2="30" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
            
            {/* Center (main provocateur) */}
            <circle cx="140" cy="90" r="18" fill="rgba(239,68,68,0.25)" stroke="#ef4444" strokeWidth="2"/>
            <text x="140" y="86" textAnchor="middle" fill="#ef4444" fontSize="14">⚠</text>
            <text x="140" y="97" textAnchor="middle" fill="#ef4444" fontSize="7">@provk_01</text>
            
            {/* Level 1 nodes */}
            <circle cx="80" cy="50" r="12" fill="rgba(239,68,68,0.18)" stroke="#ef4444" strokeWidth="1.5"/>
            <text x="80" y="54" textAnchor="middle" fill="#ef4444" fontSize="9">👤</text>
            <circle cx="200" cy="50" r="12" fill="rgba(245,158,11,0.18)" stroke="#f59e0b" strokeWidth="1.5"/>
            <text x="200" y="54" textAnchor="middle" fill="#f59e0b" fontSize="9">👤</text>
            <circle cx="60" cy="130" r="10" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1"/>
            <text x="60" y="134" textAnchor="middle" fill="#f59e0b" fontSize="8">👤</text>
            <circle cx="220" cy="130" r="10" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1"/>
            <text x="220" y="134" textAnchor="middle" fill="#f59e0b" fontSize="8">👤</text>
            <circle cx="140" cy="155" r="8" fill="rgba(6,182,212,0.12)" stroke="#06b6d4" strokeWidth="1"/>
            <text x="140" y="159" textAnchor="middle" fill="#06b6d4" fontSize="7">👤</text>
            
            {/* Level 2 nodes */}
            <circle cx="40" cy="30" r="7" fill="rgba(122,168,200,0.1)" stroke="rgba(122,168,200,0.3)" strokeWidth="1"/>
            <circle cx="50" cy="70" r="7" fill="rgba(122,168,200,0.1)" stroke="rgba(122,168,200,0.3)" strokeWidth="1"/>
            <circle cx="240" cy="30" r="7" fill="rgba(122,168,200,0.1)" stroke="rgba(122,168,200,0.3)" strokeWidth="1"/>
            
            {/* Labels */}
            <text x="70" y="42" fill="rgba(239,68,68,0.7)" fontSize="7">@acct_A</text>
            <text x="205" y="42" fill="rgba(245,158,11,0.7)" fontSize="7">@acct_B</text>
            <text x="42" y="145" fill="rgba(245,158,11,0.7)" fontSize="7">@acct_C</text>
          </svg>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Provokator Utama</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Penyebar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Jaringan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Alerting Table */}
      <div className="ews-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <span className="font-semibold text-sm text-gray-300">KEYWORD ALERTING — DETEKSI OTOMATIS</span>
          </div>
          <span className="ews-live-badge red">
            <span className="ews-live-dot" />
            LIVE
          </span>
        </div>
        <table className="ews-table">
          <thead>
            <tr>
              <th>KATA KUNCI</th>
              <th>PLATFORM</th>
              <th>VOLUME 1 JAM</th>
              <th>SPIKE</th>
              <th>SENTIMEN</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {keywordAlerts.map((alert, idx) => (
              <tr key={idx} className="cursor-pointer hover:bg-cyan-500/5" onClick={() => addToast(`Detail keyword: ${alert.keyword}`, 'info')}>
                <td className={`font-semibold ${
                  alert.spikeColor === 'red' ? 'text-red-400' :
                  alert.spikeColor === 'amber' ? 'text-amber-400' :
                  'text-gray-300'
                }`}>
                  {alert.keyword}
                </td>
                <td className="text-gray-500 text-xs">{alert.platform}</td>
                <td className="font-mono text-white">{alert.volume}</td>
                <td>
                  <span className={`ews-tag text-[10px] ${
                    alert.spikeColor === 'red' ? 'ews-tag-red' :
                    alert.spikeColor === 'amber' ? 'ews-tag-amber' :
                    alert.spikeColor === 'green' ? 'ews-tag-green' :
                    'ews-tag-cyan'
                  }`}>
                    {alert.spike}
                  </span>
                </td>
                <td>
                  <span className={`ews-tag text-[10px] ${
                    alert.sentimentColor === 'red' ? 'ews-tag-red' :
                    alert.sentimentColor === 'amber' ? 'ews-tag-amber' :
                    alert.sentimentColor === 'green' ? 'ews-tag-green' :
                    'ews-tag-cyan'
                  }`}>
                    {alert.sentiment}
                  </span>
                </td>
                <td>
                  <span className={`ews-tag text-[10px] ${
                    alert.statusColor === 'red' ? 'ews-tag-red' :
                    alert.statusColor === 'amber' ? 'ews-tag-amber' :
                    'ews-tag-green'
                  }`}>
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
