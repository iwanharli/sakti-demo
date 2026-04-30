export const recidivismData = [
  {
    id: 1,
    name: "Anton Sujarwo",
    initials: "AS",
    riskLevel: "high",
    description: "Residivis curanmor, terpantau aktif di area Jakarta Timur.",
    riskHistory: [45, 52, 68, 75, 82],
    score: 825
  },
  {
    id: 2,
    name: "Budi Santoso",
    initials: "BS",
    riskLevel: "medium",
    description: "Terlibat dalam jaringan distribusi narkoba skala kecil.",
    riskHistory: [30, 35, 42, 38, 45],
    score: 450
  },
  {
    id: 3,
    name: "Citra Lestari",
    initials: "CL",
    riskLevel: "low",
    description: "Mantan narapidana penipuan, dalam pengawasan rutin.",
    riskHistory: [20, 18, 15, 12, 10],
    score: 120
  },
  {
    id: 4,
    name: "Dedi Kurniawan",
    initials: "DK",
    riskLevel: "high",
    description: "Pimpinan kelompok begal motor, terdeteksi koordinasi baru.",
    riskHistory: [60, 65, 70, 85, 92],
    score: 920
  },
  {
    id: 5,
    name: "Eko Prasetyo",
    initials: "EP",
    riskLevel: "medium",
    description: "Spesialis pencurian rumah kosong, aktivitas meningkat.",
    riskHistory: [40, 45, 50, 55, 58],
    score: 580
  }
];

export const curanmorPredictions = [
  {
    location: "Senen, Jakarta Pusat",
    probability: 82,
    color: "red",
    timeVector: [20, 30, 45, 60, 82, 70]
  },
  {
    location: "Tambora, Jakarta Barat",
    probability: 75,
    color: "amber",
    timeVector: [40, 50, 65, 75, 60, 50]
  },
  {
    location: "Kebayoran Lama, Jaksel",
    probability: 68,
    color: "cyan",
    timeVector: [15, 25, 40, 68, 55, 40]
  }
];

export const begalPredictions = [
  {
    location: "Cakung, Jakarta Timur",
    probability: 88,
    color: "red",
    timeVector: [10, 20, 40, 70, 88, 75]
  },
  {
    location: "Cengkareng, Jakbar",
    probability: 72,
    color: "amber",
    timeVector: [30, 40, 55, 72, 60, 45]
  }
];

export const dataSources = [
  {
    name: "Laporan SPKT Real-time",
    description: "Integrasi data pelaporan langsung dari seluruh polres Metro Jaya."
  },
  {
    name: "Data Demografi BPS",
    description: "Analisis kepadatan penduduk dan tingkat pengangguran regional."
  },
  {
    name: "Sensor Cuaca BMKG",
    description: "Korelasi kondisi cuaca terhadap potensi gangguan kamtibmas."
  },
  {
    name: "Media Social Crawler",
    description: "Pemantauan narasi dan sentimen publik di platform digital."
  }
];

export const environmentFactors = {
  weather: "Hujan Deras Terproyeksi",
  impact: "RISIKO TINGGI: CURANMOR & BEGAL",
  activeEvents: [
    {
      title: "Konser Musik GBK",
      impact: "Peningkatan arus massa di Senayan (18:00 - 23:00)"
    },
    {
      title: "Unjuk Rasa Buruh",
      impact: "Penumpukan massa di area Harmoni - Istana (09:00 - 15:00)"
    }
  ]
};
