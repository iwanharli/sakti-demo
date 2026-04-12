export const weatherForecast = [
  { day: 'SEN', isToday: false, icon: '🌧️', high: 28, low: 22, rainChance: 85 },
  { day: 'HARI INI', isToday: true, icon: '⛈️', high: 29, low: 23, rainChance: 92 },
  { day: 'RAB', isToday: false, icon: '🌦️', high: 30, low: 23, rainChance: 65 },
  { day: 'KAM', isToday: false, icon: '⛅', high: 31, low: 24, rainChance: 40 },
  { day: 'JUM', isToday: false, icon: '☀️', high: 32, low: 24, rainChance: 20 },
  { day: 'SAB', isToday: false, icon: '🌤️', high: 31, low: 23, rainChance: 25 },
  { day: 'MIN', isToday: false, icon: '🌧️', high: 29, low: 22, rainChance: 75 },
];

export const correlations = [
  { label: 'BANJIR → PENJARAHAN', value: '+34%', color: 'red' as const },
  { label: 'HUJAN → KECELAKAAN', value: '+52%', color: 'amber' as const },
  { label: 'MATI LAMPU → CURAT', value: '+28%', color: 'cyan' as const },
  { label: 'CUACA BAIK → NORMAL', value: '-12%', color: 'green' as const },
];
