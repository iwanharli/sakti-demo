export const tickerItems = [
  { icon: 'fa-solid fa-circle-dot', text: 'Laporan 110 — Kecelakaan Beruntun Jl. Gajah Mada KM 3 · 14:32', color: 'text-red-400' },
  { icon: 'fa-solid fa-triangle-exclamation', text: 'Spike keywords "demo" +410% · Area Monas & Harmoni', color: 'text-amber-400' },
  { icon: 'fa-solid fa-circle-check', text: 'Patrol Unit SKT-01 sampai di titik rawan Tanah Abang · 14:28', color: 'text-emerald-400' },
  { icon: 'fa-solid fa-circle-info', text: 'Sinkronisasi Data CCTV Jakarta Smart City Berhasil · 1,240 titik aktif', color: 'text-cyan-400' },
];

export const timelineItems = [
  { time: '14:38 WIB', content: 'Kecelakaan beruntun · Jl. Sudirman — Dukuh Atas', tags: ['PRIORITAS TINGGI', 'LANTAS'], color: 'red' as const },
  { time: '14:12 WIB', content: 'Laporan pencopetan · Area Pasar Tanah Abang Blok B', tags: ['SEDANG', 'RESKRIM'], color: 'amber' as const },
  { time: '13:55 WIB', content: 'Konsentrasi massa · Depan Gedung MK (Monas)', tags: ['MONITORING', 'INTELKAM'], color: 'cyan' as const },
  { time: '13:20 WIB', content: 'Patroli rutin Senayan · situasi kondusif', tags: ['SELESAI'], color: 'green' as const },
];

export const riskScores = [
  { area: 'TANAH ABANG', score: 89, level: 'KRITIS', color: 'red' as const },
  { area: 'SENEN', score: 72, level: 'WASPADA', color: 'amber' as const },
  { area: 'KOTA TUA', score: 65, level: 'WASPADA', color: 'amber' as const },
  { area: 'SENAYAN', score: 24, level: 'AMAN', color: 'green' as const },
];
