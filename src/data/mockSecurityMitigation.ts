export const riskMatrix = [
  {
    kecamatan: "Gambir",
    score: 84,
    level: "SANGAT TINGGI",
    levelColor: "red",
    threats: "Unjuk Rasa, Kemacetan",
    trend: "▲ 12%",
    trendColor: "red"
  },
  {
    kecamatan: "Senen",
    score: 68,
    level: "TINGGI",
    levelColor: "amber",
    threats: "Pencopetan, Kerumunan",
    trend: "▲ 5%",
    trendColor: "amber"
  },
  {
    kecamatan: "Menteng",
    score: 42,
    level: "SEDANG",
    levelColor: "cyan",
    threats: "Pelanggaran Parkir",
    trend: "▼ 2%",
    trendColor: "emerald"
  },
  {
    kecamatan: "Tanah Abang",
    score: 89,
    level: "SANGAT TINGGI",
    levelColor: "red",
    threats: "Kriminalitas, PKL",
    trend: "▲ 8%",
    trendColor: "red"
  },
  {
    kecamatan: "Sawah Besar",
    score: 55,
    level: "SEDANG",
    levelColor: "cyan",
    threats: "Lalu Lintas",
    trend: "STABIL",
    trendColor: "cyan"
  }
];

export const crowdMonitoring = [
  {
    title: "Aksi Massa Depan DPR",
    status: "ESKALASI",
    statusColor: "red",
    desc: "Estimasi 500+ massa, orasi mulai memanas. Pengerahan unit sekat diperlukan.",
    tags: ["DEMO", "ZONA MERAH", "POLITIS"]
  },
  {
    title: "Pasar Tanah Abang",
    status: "PADAT",
    statusColor: "amber",
    desc: "Lonjakan pengunjung menjelang akhir pekan. Unit Sabhara dikerahkan untuk patroli dialogis.",
    tags: ["EKONOMI", "KERUMUNAN", "RUTIN"]
  },
  {
    title: "Stasiun Sudirman",
    status: "NORMAL",
    statusColor: "emerald",
    desc: "Arus komuter terkendali. Pengawasan melalui CCTV terintegrasi.",
    tags: ["TRANSPORTASI", "MONITORING"]
  }
];

export const vitalObjects = [
  {
    name: "Istana Negara",
    type: "PUSAT PEMERINTAHAN",
    status: "safe"
  },
  {
    name: "Gedung DPR/MPR",
    type: "LEGISLATIF",
    status: "warning"
  },
  {
    name: "PLTU Muara Karang",
    type: "ENERGI",
    status: "safe"
  },
  {
    name: "Bank Indonesia",
    type: "KEUANGAN",
    status: "safe"
  },
  {
    name: "Bandara Soetta",
    type: "TRANSPORTASI",
    status: "warning"
  }
];

export const utilities = [
  {
    name: "Pasokan Listrik Utama",
    value: 98,
    color: "emerald"
  },
  {
    name: "Ketersediaan Air Bersih",
    value: 85,
    color: "emerald"
  },
  {
    name: "Bahan Bakar Minyak",
    value: 72,
    color: "amber"
  },
  {
    name: "Stok Pangan Pokok",
    value: 91,
    color: "emerald"
  }
];

export const recommendations = [
  {
    title: "PENGETATAN RING-1",
    desc: "Meningkatkan pengamanan di sekitar area objek vital menyusul rencana aksi massa sore ini.",
    color: "red"
  },
  {
    title: "PATROLI DIALOGIS",
    desc: "Meningkatkan frekuensi patroli di pusat perbelanjaan untuk mencegah tindak kriminalitas copet.",
    color: "cyan"
  },
  {
    title: "OPTIMALISASI CCTV",
    desc: "Pastikan seluruh kamera pengawas di titik masuk wilayah Senen berfungsi optimal untuk deteksi dini.",
    color: "emerald"
  }
];
