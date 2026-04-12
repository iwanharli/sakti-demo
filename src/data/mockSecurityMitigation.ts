export const riskMatrix = [
  { kecamatan: 'Metro Pusat', score: 78, level: 'TINGGI', levelColor: 'red', threats: 'Curanmor, Curas, Demo', trend: '▲ +8', trendColor: 'red' },
  { kecamatan: 'Metro Timur', score: 62, level: 'SEDANG', levelColor: 'amber', threats: 'Curanmor, Tawuran', trend: '▲ +3', trendColor: 'amber' },
  { kecamatan: 'Metro Utara', score: 55, level: 'SEDANG', levelColor: 'amber', threats: 'Penipuan, Curat', trend: '→ 0', trendColor: 'cyan' },
  { kecamatan: 'Metro Selatan', score: 42, level: 'RENDAH', levelColor: 'cyan', threats: 'Kenakalan remaja', trend: '▼ -5', trendColor: 'green' },
  { kecamatan: 'Metro Barat', score: 35, level: 'AMAN', levelColor: 'green', threats: 'Minor', trend: '▼ -2', trendColor: 'green' },
];

export const crowdMonitoring = [
  { title: 'Demo Buruh — Alun-alun', desc: 'Rencana demo UMK besok pkl 09:00 · Est. 500 massa · Ormas: KSBI, SPSI', status: 'WASPADA', statusColor: 'red', tags: ['INTELKAM', 'ESKALASI SEDANG'] },
  { title: 'Kumpulan Pedagang Pasar', desc: 'Keluhan kenaikan harga sembako · 80 pedagang · Pasar Metro Pusat', status: 'MONITOR', statusColor: 'amber', tags: [] },
  { title: 'Acara Keagamaan — Masjid Agung', desc: 'Pengajian rutin · Est. 300 jamaah · Pengamanan Polsek hadir', status: 'AMAN', statusColor: 'green', tags: [] },
];

export const vitalObjects = [
  { name: 'PLN GI Metro', type: 'Gardu Induk Listrik', status: 'safe' as const },
  { name: 'PDAM Instalasi', type: 'Pengolahan Air Bersih', status: 'safe' as const },
  { name: 'SPBU Jl. Jenderal Sudirman', type: 'BBM & LPG', status: 'warning' as const },
  { name: 'RS Jenderal A. Yani', type: 'Fasilitas Kesehatan Utama', status: 'safe' as const },
];

export const utilities = [
  { name: 'Pasokan Listrik', value: 94, color: 'emerald' as const },
  { name: 'Pasokan Air Bersih', value: 88, color: 'emerald' as const },
  { name: 'Stok BBM', value: 62, color: 'amber' as const },
  { name: 'Stok LPG 3kg', value: 55, color: 'amber' as const },
  { name: 'Jaringan Telekomunikasi', value: 97, color: 'emerald' as const },
];

export const recommendations = [
  { priority: 1, title: 'PRIORITAS 1', desc: 'Tingkatkan patroli Kec. Metro Pusat pukul 20:00-02:00 (peak curanmor)', color: 'red' as const },
  { priority: 2, title: 'PRIORITAS 2', desc: 'Siapkan pengamanan demo UMK besok — minimal 2 pleton Dalmas standby', color: 'amber' as const },
  { priority: 3, title: 'PRIORITAS 3', desc: 'Koordinasi Disperindag untuk sidak harga beras di 3 distributor teridentifikasi', color: 'cyan' as const },
  { priority: 4, title: 'PENCEGAHAN', desc: 'Aktifkan Bhabinkamtibmas untuk sosialisasi antisipasi banjir di 3 kelurahan rawan', color: 'green' as const },
];
