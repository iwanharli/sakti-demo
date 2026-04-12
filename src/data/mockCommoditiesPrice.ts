export const sembakoData = [
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

export const priceAlerts = [
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
