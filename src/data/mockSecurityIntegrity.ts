export const systemLayers = [
  { name: 'Data Ingestion Pipeline', health: 94, status: 'OK', statusColor: 'green' as const },
  { name: 'AI & Processing Engine', health: 78, status: 'LOAD', statusColor: 'cyan' as const },
  { name: 'Cybersecurity & Audit', health: 100, status: 'OK', statusColor: 'green' as const },
  { name: 'Presentation & Action', health: 99, status: 'OK', statusColor: 'green' as const },
];

export const auditLogs = [
  { time: '14:41 WIB', content: 'Akses bulk export data Dukcapil oleh USER-047 · Query tidak lazim · Diblokir & diselidiki', type: 'INSIDER THREAT', typeColor: 'red' as const },
  { time: '14:22 WIB', content: 'Login gagal × 5 dari IP 103.xx.xx.12 · Akses panel admin', type: 'BRUTE FORCE', typeColor: 'amber' as const },
  { time: '14:05 WIB', content: 'AKBP Ahmad K. mengakses laporan prediksi Zone-A · Diotorisasi', type: 'NORMAL', typeColor: 'green' as const },
  { time: '13:48 WIB', content: 'Sinkronisasi data SPKT berhasil · 247 record · Hash SHA-256 valid', type: 'SYNC', typeColor: 'cyan' as const },
  { time: '13:30 WIB', content: 'Ipda Santoso membuka kasus SKT-2024-0847 · Role Penyidik · Valid', type: 'NORMAL', typeColor: 'green' as const },
  { time: '13:00 WIB', content: 'Backup otomatis selesai · 3.2GB · Enkripsi AES-256 · Cloud & On-prem', type: 'BACKUP', typeColor: 'cyan' as const },
  { time: '12:15 WIB', content: 'Model AI prediktif diperbarui · v2.4.1 · Akurasi naik ke 87.3%', type: 'UPDATE', typeColor: 'green' as const },
];

export const accessLevels = [
  { level: 'Kapolres (L4 — Full Access)', users: 1 },
  { level: 'Wakapolres / Kabag (L3)', users: 4 },
  { level: 'Penyidik Reskrim (L2)', users: 18 },
  { level: 'Sabhara / Bhabinkamtibmas (L1)', users: 24 },
];

export const securityFeatures = [
  { name: 'ENKRIPSI DATA', value: 'AES-256' },
  { name: 'PROTOKOL', value: 'TLS 1.3' },
  { name: 'FIREWALL', value: 'AKTIF' },
  { name: '2FA', value: 'WAJIB' },
];
