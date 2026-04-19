import { useState, useEffect, useMemo } from 'react';
import { useAppStore, getApiBase, authFetch } from '../store/useAppStore';
import type { TimelineItem, RiskScore } from '../types';
import type { BMKGWarning } from '../bmkg_types';
import { timelineItems } from '../data/mockDashboard';

export const useCommandCenterData = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [mounted, setMounted] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineItem[]>(timelineItems);
  const [filter, setFilter] = useState<'all' | 'bmkg' | 'issue'>('all');
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  
  // Kamtibmas Index Stats
  const [availableRegions, setAvailableRegions] = useState<string[]>(['Nasional', 'DKI JAKARTA']);
  const [kamtibmasRegion, setKamtibmasRegion] = useState('Nasional');
  const [kamtibmasIndex, setKamtibmasIndex] = useState<any>(null);
  const [kamtibmasTrend, setKamtibmasTrend] = useState<any[]>([]);
  const [isKamtibmasLoading, setIsKamtibmasLoading] = useState(false);
  const [nationalKamtibmasStats, setNationalKamtibmasStats] = useState<{today: number, yesterday: number, trend_pct: number} | null>(null);
  const [commodityHetStats, setCommodityHetStats] = useState<{sp2kp: number, pihps: number} | null>(null);
  const [commodityMatrix, setCommodityMatrix] = useState<any[]>([]);
  const [isCommodityLoading, setIsCommodityLoading] = useState(false);
  const [foodRiskData, setFoodRiskData] = useState<any[]>([]);
  const [foodRegion, setFoodRegion] = useState('Nasional');
  
  // Sosmed Sentiment
  const [sosmedSentiment, setSosmedSentiment] = useState<any>(null);
  const [sosmedDate, setSosmedDate] = useState<string>('');
  const [isSosmedLoading, setIsSosmedLoading] = useState(false);
  
  // Map Geospatial State
  const [mapCities, setMapCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [activeMapMode, setActiveMapMode] = useState<'situational' | 'weather' | 'test'>('situational');
  const [cityBoundaries, setCityBoundaries] = useState<any>(null);

  // RainViewer Radar States
  const [radarFrames, setRadarFrames] = useState<any[]>([]);
  const [radarIndex, setRadarIndex] = useState(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState(true);
  const [isSatelliteMode, setIsSatelliteMode] = useState(false);
  const [isRainViewerActive, setIsRainViewerActive] = useState(false);
  const [isWeatherHeatmapVisible, setIsWeatherHeatmapVisible] = useState(true);
  
  // Live Clock for Topbar
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Alert Count (Red/High priority items)
  const alertCount = useMemo(() => {
    return timelineData.filter(item => item.color === 'red').length;
  }, [timelineData]);

  const handleAlertClick = () => {
    addToast(`Menampilkan ${alertCount} peringatan kritis aktif`, 'warning');
    // Optionally scroll to timeline
    const timelineEl = document.querySelector('.ews-timeline');
    if (timelineEl) timelineEl.scrollTop = 0;
  };

  const filteredTimeline = useMemo(() => {
    if (filter === 'all') return timelineData;
    return timelineData.filter(item => {
      const isBMKG = item.tags.some(t => t.toUpperCase().includes('BMKG_ALERT') || t.toUpperCase().includes('GEMPA') || t.toUpperCase().includes('CUACA'));
      
      if (filter === 'bmkg') return isBMKG;
      if (filter === 'issue') return !isBMKG;
      return true;
    });
  }, [timelineData, filter]);

  const fetchMapBoundaries = async () => {
    try {
      const res = await authFetch(`${getApiBase()}/weather/boundaries`);
      if (res.ok) {
        const data = await res.json();
        setCityBoundaries(data);
      }
    } catch (err) {
      console.error('Failed to load map boundaries:', err);
    }
  };

  const fetchKamtibmasTrend = async () => {
    try {
      const poldaParam = kamtibmasRegion === 'Nasional' ? '' : `?polda=${encodeURIComponent(kamtibmasRegion)}`;
      const res = await authFetch(`${getApiBase()}/kamtibmas/trend${poldaParam}`);
      if (res.ok) {
        const data = await res.json();
        setKamtibmasTrend(data);
      }
    } catch (err) {
      console.error('Failed to fetch Kamtibmas trend:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await authFetch(`${getApiBase()}/weather/cities`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (err) {
      console.error('Cities Fetch Error:', err);
    }
  };

  const fetchForecast = async (city: string) => {
    try {
      const res = await authFetch(`${getApiBase()}/weather/forecast?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Forecast Fetch Error:', err);
    }
  };

  const fetchMapCities = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/weather/map-cities`);
      if (response.ok) {
        const data = await response.json();
        setMapCities(data);
      }
    } catch (err) {
      console.error('Map Cities Fetch Error:', err);
    }
  };

  const fetchAvailableRegions = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/analytics/kamtibmas-regions`);
      if (response.ok) {
        const data = await response.json();
        setAvailableRegions(data);
      }
    } catch (err) {
      console.error('Kamtibmas Regions Fetch Error:', err);
    }
  };

  const fetchCommodityHetStats = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/commodities/het-counts`);
      if (response.ok) {
        const data = await response.json();
        setCommodityHetStats(data);
      }
    } catch (err) {
      console.error('Commodity HET Stats Fetch Error:', err);
    }
  };

  const fetchNationalKamtibmasStats = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/analytics/kamtibmas-national-stats`);
      if (response.ok) {
        const data = await response.json();
        setNationalKamtibmasStats(data);
      }
    } catch (err) {
      console.error('National Kamtibmas Stats Fetch Error:', err);
    }
  };

  const fetchKamtibmasIndex = async () => {
    setIsKamtibmasLoading(true);
    try {
      const response = await authFetch(`${getApiBase()}/analytics/kamtibmas-index?region=${encodeURIComponent(kamtibmasRegion)}`);
      if (response.ok) {
        const data = await response.json();
        setKamtibmasIndex(data);
      }
    } catch (err) {
      console.error('Kamtibmas Index Fetch Error:', err);
    } finally {
      setIsKamtibmasLoading(false);
    }
  };

  const fetchBMKGWarnings = async () => {
    try {
      const apiBase = getApiBase();
      const response = await authFetch(`${apiBase}/bmkg/warnings`);
      const data: BMKGWarning[] = await response.json();
      
      const bmkgItems: TimelineItem[] = data.map(item => {
        const date = new Date(item.created_at);
        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        const desc = item.warning_description || '';
        const isGempa = item.warning_type.toLowerCase() === 'gempa';
        
        // ADVANCED TACTICAL PARSER
        // 1. Common / Weather Extraction
        const regionMatch = desc.match(/wilayah (.*?), khususnya di (.*?)\./);
        const region = regionMatch ? regionMatch[1].trim() : undefined;
        const subRegions = regionMatch ? regionMatch[2].split(',').map(s => s.trim()) : undefined;

        const impactMatch = desc.match(/berpotensi menimbulkan dampak berupa (.*?)\./);
        const impact = impactMatch ? impactMatch[1].trim() : undefined;

        const durationMatch = desc.match(/berlangsung hingga (.*?)\$/) || desc.match(/berlangsung hingga (.*)/);
        const duration = durationMatch ? durationMatch[1].trim() : undefined;

        // 2. Gempa Extraction
        const magMatch = desc.match(/magnitudo (.*?) SR/);
        const magnitude = magMatch ? magMatch[1].trim() : undefined;

        const depthMatch = desc.match(/kedalaman (.*?) km/);
        const depth = depthMatch ? depthMatch[1].trim() : undefined;

        const coordMatch = desc.match(/koordinat (.*?)\(/);
        const coordinates = coordMatch ? coordMatch[1].trim() : undefined;

        const epicenterMatch = desc.match(/tepatnya di (.*?)\./);
        const epicenter = epicenterMatch ? epicenterMatch[1].trim() : undefined;

        const statusMatch = desc.match(/Status: (.*?)\./) || desc.match(/Status: (.*)/);
        const status = statusMatch ? statusMatch[1].trim() : undefined;

        // 3. Extract Event Time and Date from Description
        const descDateMatch = desc.match(/(\d{1,2} [A-Z][a-z]+ \d{4})/);
        const descTimeMatch = desc.match(/(\d{2}:\d{2}(?::\d{2})? WIB)/i);

        let eventTime = timeStr;
        if (descDateMatch && descTimeMatch) {
          eventTime = `${descDateMatch[0]}, ${descTimeMatch[0]}`;
        } else if (descTimeMatch) {
          // If only time is found (common in Gempa), use the date from created_at
          const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          eventTime = `${formattedDate}, ${descTimeMatch[0]}`;
        } else if (descDateMatch) {
          eventTime = descDateMatch[0];
        }

        // 4. Clean content
        let mainContent = desc
          .replace(/Telah terjadi/gi, '')
          .replace(/Peringatan Dini Cuaca/gi, '🌤️')
          .replace(/wilayah .*?, khususnya di .*?\./gi, '')
          .replace(/berpotensi menimbulkan dampak berupa .*?\./gi, '')
          .replace(/Masyarakat dihimbau .*?\./gi, '')
          .replace(/Kondisi diperkirakan .*?\./gi, '')
          .replace(/Gempa magnitudo .*? pada jam .*?\./gi, '')
          .replace(/Lokasi pusat gempa berada .*? tepatnya di .*?\./gi, '')
          .replace(/Status: .*?\./gi, '')
          .trim();

        if (mainContent.length < 5) {
          mainContent = isGempa ? `Terdeteksi aktivitas seismik di ${epicenter || 'lokasi yang belum teridentifikasi'}.` : item.warning_title;
        }

        return {
          time: eventTime,
          event: item.warning_event,
          content: mainContent,
          region,
          subRegions,
          impact,
          duration,
          magnitude,
          depth,
          coordinates,
          epicenter,
          status,
          tags: [item.warning_type.toUpperCase(), 'BMKG_ALERT'],
          color: isGempa ? 'red' : 
                 item.warning_type.toLowerCase() === 'cuaca' ? 'cyan' : 'amber'
        } as TimelineItem;
      });

      const uniqueBmkgItems: TimelineItem[] = [];
      const seenGempa = new Set<string>();

      bmkgItems.forEach(item => {
        const isGempa = item.tags.some(t => t.toUpperCase() === 'GEMPA');
        if (isGempa) {
          // Create a unique key for Gempa based on its defining physical parameters
          const key = `${item.magnitude}-${item.depth}-${item.coordinates}-${item.epicenter}`;
          if (!seenGempa.has(key)) {
            seenGempa.add(key);
            uniqueBmkgItems.push(item);
          }
        } else {
          uniqueBmkgItems.push(item);
        }
      });

      setTimelineData(uniqueBmkgItems);
    } catch (err) {
      console.error('BMKG Fetch Error:', err);
    }
  };

  const fetchCommodityMatrix = async (source = 'sp2kp', region = 'Nasional') => {
    setIsCommodityLoading(true);
    try {
      const resp = await authFetch(`${getApiBase()}/commodities/matrix?source=${source}&region=${region}`);
      if (resp.ok) {
        const data = await resp.json();
        setCommodityMatrix(data);
      }
    } catch (err) {
      console.error('Commodity Matrix Fetch Error:', err);
    } finally {
      setIsCommodityLoading(false);
    }
  };

  const fetchRiskScores = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/analytics/risk-scores`);
      if (response.ok) {
        const data = await response.json();
        setRiskScores(data);
      }
    } catch (err) {
      console.error('Risk Scores Fetch Error:', err);
    }
  };

  const fetchFoodRiskData = async () => {
    try {
      const response = await authFetch(`${getApiBase()}/analytics/food-risk`);
      if (response.ok) {
        const data = await response.json();
        setFoodRiskData(data);
      }
    } catch (err) {
      console.error('Food Risk Fetch Error:', err);
    }
  };
  
  const fetchSosmedSentiment = async (dateOverride?: string) => {
    setIsSosmedLoading(true);
    try {
      const targetDate = dateOverride || sosmedDate;
      const dateParam = targetDate ? `?date=${targetDate}` : '';
      const response = await authFetch(`${getApiBase()}/analytics/sosmed-sentiment${dateParam}`);
      if (response.ok) {
        const data = await response.json();
        setSosmedSentiment(data);
        // If we didn't specify a date, sync with what the backend found as latest
        if (!targetDate && data.filtered_date) {
          const d = new Date(data.filtered_date).toISOString().split('T')[0];
          setSosmedDate(d);
        }
      }
    } catch (err) {
      console.error('Sosmed Sentiment Fetch Error:', err);
    } finally {
      setIsSosmedLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchBMKGWarnings();
    fetchAvailableRegions();
    fetchKamtibmasIndex();
    fetchKamtibmasTrend();
    fetchNationalKamtibmasStats();
    fetchCommodityHetStats();
    fetchCommodityMatrix();
    fetchRiskScores();
    fetchFoodRiskData();
    fetchMapCities();
    fetchCities();
    fetchMapBoundaries();
    fetchSosmedSentiment();
  }, []);

  useEffect(() => {
    fetchKamtibmasIndex();
    fetchKamtibmasTrend();
  }, [kamtibmasRegion]);

  useEffect(() => {
    fetchCommodityMatrix('sp2kp', foodRegion);
  }, [foodRegion]);

  useEffect(() => {
    if (sosmedDate) {
      fetchSosmedSentiment(sosmedDate);
    }
  }, [sosmedDate]);

  useEffect(() => {
    if (selectedCity) {
      fetchForecast(selectedCity);
    }
  }, [selectedCity]);

  // Radar Logic (RainViewer)
  useEffect(() => {
    if (activeMapMode === 'weather' && isRainViewerActive) {
      fetch('https://api.rainviewer.com/public/weather-maps.json')
        .then(res => res.json())
        .then(data => {
          if (data.radar && data.radar.past) {
            setRadarFrames(data.radar.past);
            setRadarIndex(0);
          }
        })
        .catch(err => console.error('RainViewer Fetch Error:', err));
    }
  }, [activeMapMode, isRainViewerActive]);

  useEffect(() => {
    let interval: any;
    if (activeMapMode === 'weather' && isRainViewerActive && isRadarPlaying && radarFrames.length > 0) {
      interval = setInterval(() => {
        setRadarIndex(prev => (prev + 1) % radarFrames.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [activeMapMode, isRainViewerActive, isRadarPlaying, radarFrames]);

  const crimeTrendData = useMemo(() => {
    if (!kamtibmasTrend || kamtibmasTrend.length === 0) {
      return Array.from({ length: 7 }).map((_, i) => ({
        day: ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'][i],
        kejahatan: 0, gangguan: 0, pelanggaran: 0, bencana: 0,
        yK: 100, yG: 100, yP: 100, yB: 100,
        x: i * (360 / 6)
      }));
    }

    // Group by date
    const grouped = kamtibmasTrend.reduce((acc: any, curr: any) => {
      const date = new Date(curr.date).toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase();
      if (!acc[curr.date]) acc[curr.date] = { day: date, kejahatan: 0, gangguan: 0, pelanggaran: 0, bencana: 0, rawDate: curr.date };
      
      if (curr.type === 'kejahatan_total') acc[curr.date].kejahatan = Number(curr.total);
      if (curr.type === 'gangguan_total') acc[curr.date].gangguan = Number(curr.total);
      if (curr.type === 'pelanggaran_total') acc[curr.date].pelanggaran = Number(curr.total);
      if (curr.type === 'bencana_total') acc[curr.date].bencana = Number(curr.total);
      
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();
    const maxValue = Math.max(...kamtibmasTrend.map(t => Number(t.total)), 10) * 1.2;

    return sortedDates.map((date, i) => {
      const d = grouped[date];
      return {
        ...d,
        x: i * (360 / (sortedDates.length - 1 || 1)),
        yK: 100 - (d.kejahatan / maxValue) * 100,
        yG: 100 - (d.gangguan / maxValue) * 100,
        yP: 100 - (d.pelanggaran / maxValue) * 100,
        yB: 100 - (d.bencana / maxValue) * 100,
      };
    });
  }, [kamtibmasTrend]);

  return {
    mounted,
    addToast,
    hoverIdx,
    setHoverIdx,
    timelineData,
    filter,
    setFilter,
    filteredTimeline,
    riskScores,
    availableRegions,
    kamtibmasRegion,
    setKamtibmasRegion,
    kamtibmasIndex,
    isKamtibmasLoading,
    nationalKamtibmasStats,
    commodityHetStats,
    commodityMatrix,
    isCommodityLoading,
    foodRiskData,
    foodRegion,
    setFoodRegion,
    mapCities,
    selectedCity,
    setSelectedCity,
    cities,
    weatherData,
    activeMapMode,
    setActiveMapMode,
    cityBoundaries,
    radarFrames,
    radarIndex,
    setRadarIndex,
    isRadarPlaying,
    setIsRadarPlaying,
    isSatelliteMode,
    setIsSatelliteMode,
    isRainViewerActive,
    setIsRainViewerActive,
    isWeatherHeatmapVisible,
    setIsWeatherHeatmapVisible,
    crimeTrendData,
    currentTime,
    alertCount,
    handleAlertClick,
    sosmedSentiment,
    sosmedDate,
    setSosmedDate,
    isSosmedLoading,
    fetchSosmedSentiment
  };
};
