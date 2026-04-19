/**
 * Weather condition icon mapping for BMKG data
 */
export const getConditionIcon = (condition: string) => {
  const c = condition?.toLowerCase() || '';
  if (c.includes('petir')) return { icon: 'fa-cloud-bolt', color: 'text-purple-400', hex: '#a855f7', pulse: true };
  if (c.includes('lebat') || c.includes('deras')) return { icon: 'fa-cloud-showers-water', color: 'text-blue-500', hex: '#3b82f6', pulse: true };
  if (c.includes('hujan') && c.includes('sedang')) return { icon: 'fa-cloud-showers-heavy', color: 'text-cyan-400', hex: '#22d3ee', pulse: false };
  if (c.includes('hujan')) return { icon: 'fa-cloud-rain', color: 'text-cyan-300', hex: '#67e8f9', pulse: false };
  if (c.includes('cerah berawan')) return { icon: 'fa-cloud-sun', color: 'text-amber-300', hex: '#fcd34d', pulse: false };
  if (c.includes('cerah')) return { icon: 'fa-sun', color: 'text-amber-400', hex: '#fbbf24', pulse: false };
  if (c.includes('berawan')) return { icon: 'fa-cloud', color: 'text-gray-400', hex: '#9ca3af', pulse: false };
  if (c.includes('kabut') || c.includes('asap')) return { icon: 'fa-smog', color: 'text-gray-300', hex: '#d1d5db', pulse: false };
  return { icon: 'fa-cloud-sun', color: 'text-amber-200', hex: '#fde68a', pulse: false };
};

/**
 * Robust Name Normalizer for DB <-> GeoJSON matching
 */
export const normalizeName = (name: string) => {
  if (!name) return '';
  return name.toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove all non-alphanumeric chars (spaces, dots, etc.)
    .replace(/^KOTA/g, '')     // Remove prefixes
    .replace(/^KAB/g, '')      
    .replace(/^ADMINISTRASI/g, '')
    .trim();
};
