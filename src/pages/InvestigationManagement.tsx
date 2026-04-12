import React, { useState, useEffect } from 'react';
import type { Toast } from '../types';

interface ReskrimProps {
  addToast: (message: string, type: Toast['type']) => void;
}

import { cases, sp2hpStatus, crimeDistribution, filters } from '../data/mockInvestigationManagement';

export default function InvestigationManagement({ addToast }: ReskrimProps) {
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Semua');

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusPillClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      case 'progress':
        return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
      case 'closed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      default:
        return 'bg-gray-500/15 text-gray-400';
    }
  };

  const getTypeTagClass = (color: string) => {
    switch (color) {
      case 'red':
        return 'ews-tag-red';
      case 'amber':
        return 'ews-tag-amber';
      case 'purple':
        return 'ews-tag-purple';
      default:
        return 'ews-tag-cyan';
    }
  };

  const filteredCases = activeFilter === 'Semua' 
    ? cases 
    : cases.filter(c => c.type === activeFilter);

  return (
    <div className={`space-y-5 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* Section Title */}
      <div className="ews-section-title">
        🔍 MODUL 4 — MANAJEMEN INVESTIGASI TERPADU (RESKRIM)
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="ews-stat-card red cursor-pointer" onClick={() => addToast('Detail kasus aktif', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kasus Aktif</div>
          <div className="font-orbitron text-4xl font-bold text-red-400 mb-1">47</div>
          <div className="text-sm text-gray-500">Dalam penanganan</div>
        </div>

        <div className="ews-stat-card amber cursor-pointer" onClick={() => addToast('Detail kasus pending', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kasus Pending</div>
          <div className="font-orbitron text-4xl font-bold text-amber-400 mb-1">12</div>
          <div className="text-sm text-gray-500">Menunggu tindakan</div>
        </div>

        <div className="ews-stat-card green cursor-pointer" onClick={() => addToast('Detail kasus diselesaikan', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Diselesaikan Bulan Ini</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">38</div>
          <div className="text-sm text-emerald-400">81% clearance rate</div>
        </div>

        <div className="ews-stat-card cyan cursor-pointer" onClick={() => addToast('Detail tersangka DPO', 'info')}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tersangka DPO</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">9</div>
          <div className="text-sm text-gray-500">Dalam pencarian aktif</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              activeFilter === filter
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-transparent border-gray-700 text-gray-500 hover:border-cyan-500/30 hover:text-cyan-400'
            }`}
          >
            {filter}
          </button>
        ))}
        <input
          type="text"
          placeholder="🔍 Cari nomor kasus..."
          className="ml-auto px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none w-48"
        />
      </div>

      {/* Cases Table */}
      <div className="ews-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📁</span>
          <span className="font-semibold text-sm text-gray-300">DAFTAR KASUS AKTIF</span>
        </div>
        <table className="ews-table">
          <thead>
            <tr>
              <th>NO. KASUS</th>
              <th>JENIS</th>
              <th>TKP</th>
              <th>TANGGAL</th>
              <th>PENYIDIK</th>
              <th>TAHAPAN</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((caseItem) => (
              <tr 
                key={caseItem.id} 
                className="cursor-pointer"
                onClick={() => addToast(`Membuka detail kasus ${caseItem.id}`, 'info')}
              >
                <td>
                  <span className="font-mono text-xs text-cyan-400">{caseItem.id}</span>
                </td>
                <td>
                  <span className={`ews-tag text-[10px] ${getTypeTagClass(caseItem.typeColor)}`}>
                    {caseItem.type}
                  </span>
                </td>
                <td className="text-gray-400">{caseItem.location}</td>
                <td className="font-mono text-xs text-gray-500">{caseItem.date}</td>
                <td className="text-gray-400 text-xs">{caseItem.investigator}</td>
                <td>
                  <span className={`ews-tag text-[10px] ${
                    caseItem.stageColor === 'red' ? 'ews-tag-red' :
                    caseItem.stageColor === 'amber' ? 'ews-tag-amber' :
                    caseItem.stageColor === 'green' ? 'ews-tag-green' :
                    'ews-tag-cyan'
                  }`}>
                    {caseItem.stage}
                  </span>
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusPillClass(caseItem.status)}`}>
                    {caseItem.status === 'open' ? 'BUKA' : caseItem.status === 'progress' ? 'PROSES' : 'TUTUP'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* SP2HP Status */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📬</span>
            <span className="font-semibold text-sm text-gray-300">STATUS SP2HP / EMP</span>
          </div>
          <div className="space-y-2">
            {sp2hpStatus.map((item, idx) => (
              <div 
                key={idx}
                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${
                  item.statusColor === 'red' ? 'bg-red-500/5 border-red-500/15' :
                  item.statusColor === 'amber' ? 'bg-amber-500/5 border-amber-500/15' :
                  'bg-emerald-500/5 border-emerald-500/15'
                }`}
                onClick={() => addToast(`Detail: ${item.title}`, 'info')}
              >
                <div>
                  <div className="text-xs font-semibold text-white">{item.title}</div>
                  <div className="text-[10px] text-gray-500">{item.desc}</div>
                </div>
                <span className={`ews-tag text-[10px] ${
                  item.statusColor === 'red' ? 'ews-tag-red' :
                  item.statusColor === 'amber' ? 'ews-tag-amber' :
                  'ews-tag-green'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Crime Distribution */}
        <div className="ews-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📊</span>
            <span className="font-semibold text-sm text-gray-300">SEBARAN JENIS KEJAHATAN (BULAN INI)</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="18"/>
              {crimeDistribution.reduce((acc, item, idx) => {
                const prevTotal = crimeDistribution.slice(0, idx).reduce((sum, i) => sum + i.value, 0);
                const circumference = 2 * Math.PI * 35;
                const dashArray = `${(item.value / 100) * circumference} ${circumference}`;
                const dashOffset = -((prevTotal / 100) * circumference);
                return [
                  ...acc,
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="18"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                  />
                ];
              }, [] as React.ReactElement[])}
              <circle cx="50" cy="50" r="24" fill="#111827"/>
              <text x="50" y="47" textAnchor="middle" fill="#e8f4ff" fontSize="9" fontWeight="bold">47</text>
              <text x="50" y="57" textAnchor="middle" fill="rgba(122,168,200,0.6)" fontSize="6">kasus</text>
            </svg>

            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {crimeDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-400 flex-1">{item.name}</span>
                  <span className="text-xs font-mono text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
