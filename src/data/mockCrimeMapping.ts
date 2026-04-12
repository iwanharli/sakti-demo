export const patrolRoutes = [
  { id: 'A', unit: 'SKT-01', status: 'PRIORITAS', statusColor: 'red' as const, route: 'Polres → Jl. Merdeka → Pasar Baru → Jl. Ahmad Yani → Polres', time: '45 menit', distance: '18.2 km' },
  { id: 'B', unit: 'SKT-03', status: 'AKTIF', statusColor: 'amber' as const, route: 'Polsek Utara → Terminal → Kel. Hadimulyo → Kembali', time: '38 menit', distance: '14.5 km' },
  { id: 'C', unit: 'LNT-02', status: 'RESPON', statusColor: 'red' as const, route: 'Jl. Sudirman (Insiden aktif)', time: 'ETA 3 menit', distance: '1.2 km' },
];

export const gpsTracking = [
  { unit: 'SKT-01', location: 'Jl. Merdeka', speed: 42, status: 'JALAN', statusColor: 'green' as const },
  { unit: 'SKT-03', location: 'Terminal', speed: 18, status: 'JALAN', statusColor: 'green' as const },
  { unit: 'LNT-02', location: 'Jl. Sudirman', speed: 0, status: 'BERHENTI', statusColor: 'red' as const },
  { unit: 'BBK-07', location: 'Kel. Rejo Agung', speed: 25, status: 'JALAN', statusColor: 'green' as const },
  { unit: 'RSK-04', location: 'Pasar Mall', speed: 0, status: 'OLAH TKP', statusColor: 'amber' as const },
];
