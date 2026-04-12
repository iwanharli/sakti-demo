export const cases = [
  { id: 'SKT-2024-0847', type: 'Curanmor', typeColor: 'red', location: 'Pasar Mall', date: '08/04/2025', investigator: 'Ipda Santoso', stage: 'Olah TKP', stageColor: 'amber', status: 'open' as const },
  { id: 'SKT-2024-0841', type: 'Penipuan', typeColor: 'amber', location: 'Online / Kota Metro', date: '06/04/2025', investigator: 'Bripka Wulandari', stage: 'Penyidikan', stageColor: 'cyan', status: 'progress' as const },
  { id: 'SKT-2024-0835', type: 'Begal', typeColor: 'red', location: 'Jl. Yos Sudarso', date: '04/04/2025', investigator: 'Ipda Rahardjo', stage: 'P-19 (DPO)', stageColor: 'red', status: 'open' as const },
  { id: 'SKT-2024-0829', type: 'Narkotika', typeColor: 'purple', location: 'Kel. Banjarsari', date: '02/04/2025', investigator: 'Aiptu Hernawan', stage: 'P-21 Siap', stageColor: 'cyan', status: 'progress' as const },
  { id: 'SKT-2024-0812', type: 'Penggelapan', typeColor: 'amber', location: 'Jl. Gatot Subroto', date: '28/03/2025', investigator: 'Briptu Nuraini', stage: 'Dilimpahkan', stageColor: 'green', status: 'closed' as const },
  { id: 'SKT-2024-0801', type: 'Kekerasan', typeColor: 'red', location: 'Kel. Hadimulyo', date: '25/03/2025', investigator: 'Ipda Firmansyah', stage: 'Gelar Perkara', stageColor: 'amber', status: 'open' as const },
];

export const sp2hpStatus = [
  { title: 'SP2HP Overdue (>30hr)', desc: '3 pelapor belum menerima update', status: 'URGENT', statusColor: 'red' as const },
  { title: 'EMP Belum Diproses', desc: '5 pengaduan masyarakat baru', status: 'PENDING', statusColor: 'amber' as const },
  { title: 'SP2HP Terkirim Hari Ini', desc: '18 pelapor telah dinotifikasi', status: 'SELESAI', statusColor: 'green' as const },
];

export const crimeDistribution = [
  { name: 'Curanmor', value: 35, color: '#ef4444' },
  { name: 'Penipuan', value: 25, color: '#f59e0b' },
  { name: 'Begal', value: 20, color: '#06b6d4' },
  { name: 'Narkotika', value: 12, color: '#8b5cf6' },
  { name: 'Lainnya', value: 8, color: '#10b981' },
];

export const filters = ['Semua', 'Curanmor', 'Begal', 'Penipuan', 'Narkotika', 'Kekerasan'];
