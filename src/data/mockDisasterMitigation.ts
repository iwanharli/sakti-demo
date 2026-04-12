export const bencanaAlerts = [
  { time: '14:30 WIB', source: 'BMKG', content: 'Peringatan Dini Hujan Lebat (>100mm/3jam) wilayah Kecamatan Selatan & Timur', tags: ['SIAGA', 'BMKG'], color: 'red' as const },
  { time: '13:15 WIB', source: 'BPBD', content: 'Tinggi muka air Sungai Way Sekampung naik 1.2m · Ambang batas: 2.5m · Status WASPADA', tags: ['WASPADA'], color: 'amber' as const },
  { time: '12:00 WIB', source: 'PUSDALOPS', content: 'Posko evakuasi GOR Kota Metro aktif · Kapasitas 500 jiwa · Logistik tersedia 3 hari', tags: ['SIAP'], color: 'green' as const },
  { time: '10:30 WIB', source: 'POLRES', content: 'Rapat koordinasi mitigasi bencana selesai · 8 OPD hadir · Jalur evakuasi diverifikasi', tags: ['KOORDINASI'], color: 'cyan' as const },
  { time: '09:00 WIB', source: 'BMKG', content: 'Gempa M3.2 — Kedalaman 10km — 45km Barat Daya Kota Metro · Tidak berpotensi tsunami', tags: ['INFO'], color: 'amber' as const },
];

export const resources = [
  { name: 'Ambulans', current: 6, total: 8, status: 'good' as const },
  { name: 'Perahu Karet', current: 4, total: 6, status: 'good' as const },
  { name: 'Truk Logistik', current: 3, total: 4, status: 'good' as const },
  { name: 'Genset Portable', current: 2, total: 5, status: 'warning' as const },
  { name: 'Tenda Pengungsi', current: 20, total: 25, status: 'good' as const },
];

export const emergencyContacts = [
  { name: 'BPBD Kota Metro', sub: 'Pusdalops PB', status: 'ONLINE', statusColor: 'green' as const },
  { name: 'BMKG Stasiun Lampung', sub: 'Cuaca & Gempa', status: 'ONLINE', statusColor: 'green' as const },
  { name: 'PMI Kota Metro', sub: 'SAR & Medis', status: 'ONLINE', statusColor: 'green' as const },
  { name: 'Kodim 0411 Metro', sub: 'Bantuan TNI', status: 'STANDBY', statusColor: 'cyan' as const },
];

export const vulnerabilityIndex = [
  { name: 'Banjir', value: 78, color: 'from-amber-500 to-red-500' },
  { name: 'Tanah Longsor', value: 52, color: 'amber-500' },
  { name: 'Kebakaran', value: 41, color: 'amber-500' },
  { name: 'Gempa Bumi', value: 25, color: 'cyan-500' },
  { name: 'Angin Puting Beliung', value: 15, color: 'emerald-500' },
];
