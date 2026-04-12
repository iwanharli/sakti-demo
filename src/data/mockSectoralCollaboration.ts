export const instansiList = [
  { icon: '🏢', name: 'Dukcapil Kota Metro', desc: 'Data kependudukan · 98,743 record · Update real-time', status: 'active' as const },
  { icon: '🏥', name: 'RSUD Jend. Ahmad Yani', desc: 'Laporan IGD · Kasus kekerasan & kecelakaan · Sinkron setiap jam', status: 'active' as const },
  { icon: '📊', name: 'BPS Kota Metro', desc: 'Data sosio-ekonomi · Kemiskinan · Pengangguran', status: 'partial' as const },
  { icon: '⚡', name: 'PLN — Data Penerangan Jalan', desc: 'Titik PJU mati · Korelasi titik gelap dengan rawan kejahatan', status: 'active' as const },
  { icon: '🏫', name: 'Dinas Pendidikan', desc: 'Data pelajar rentan · Anak putus sekolah', status: 'offline' as const },
  { icon: '🌧', name: 'BMKG — Stasiun Kota Metro', desc: 'Cuaca real-time · EWS banjir · Peringatan dini', status: 'active' as const },
  { icon: '🚰', name: 'Dinkes — Puskesmas', desc: 'Laporan penyalahgunaan napza · Rehabilitasi', status: 'active' as const },
];

export const permintaanData = [
  { icon: '📋', title: 'Verifikasi NIK Tersangka × 3', desc: 'Permintaan dari Reskrim ke Dukcapil · Case SKT-2024-0835', status: 'MENUNGGU 2 JAM', statusColor: 'amber' as const, priority: 'high' as const },
  { icon: '🏥', title: 'Data IGD Malam Minggu Lalu', desc: 'Korelasi kecelakaan vs laporan kekerasan', status: 'DITERIMA', statusColor: 'cyan' as const, priority: 'medium' as const },
  { icon: '⚡', title: 'Data PJU Mati — Kel. Hadimulyo', desc: '12 titik PJU mati berkorelasi dengan zona rawan', status: '✓ SELESAI', statusColor: 'green' as const, priority: 'low' as const },
];

export const insights = [
  { title: '🔗 Korelasi PJU vs Curanmor', desc: '12 titik PJU mati = 78% curanmor terjadi dalam radius 200m. Rekomendasi: ajukan ke Pemkot.' },
  { title: '🏥 Laporan IGD ↔ Kekerasan', desc: 'Peningkatan luka trauma IGD Sabtu malam +40% berkorelasi dengan 3 kasus yang belum dilaporkan ke SPKT.' },
  { title: '📊 BPS: Pengangguran & Begal', desc: '3 kelurahan dengan pengangguran >18% menyumbang 65% kasus begal. Data BPS dimasukkan ke model prediktif.' },
];
