import { useState, useEffect } from 'react';
import { getApiBase, authFetch } from '../store/useAppStore';

const API_BASE = getApiBase();

export interface DisasterEvent {
  id: string;
  report_date: string;
  province_name: string;
  city_name: string;
  category: string;
  location: string;
  cause: string;
  total_meninggal: number;
  total_hilang: number;
  total_terluka: number;
  total_rumah_rusak: number;
  total_rumah_terendam: number;
  total_fasum_rusak: number;
  created_at: string;
}

export interface DisasterStats {
  deaths: string | number;
  missing: string | number;
  injured: string | number;
  damage: string | number;
  total_events: string | number;
}

export const useDisasterData = () => {
  const [history, setHistory] = useState<DisasterEvent[]>([]);
  const [stats, setStats] = useState<DisasterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('Nasional');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  
  const fetchMetadata = async () => {
    try {
      const response = await authFetch(`${API_BASE}/analytics/disaster-metadata`);
      if (response && response.ok) {
        const data = await response.json();
        
        // Use Set to ensure uniqueness after normalization
        const regions: string[] = [
          'Nasional', 
          ...Array.from(new Set((data.regions || []).map((r: any) => String(r).toUpperCase().trim()))).sort() as string[]
        ];

        const categories: string[] = [
          'Semua', 
          ...Array.from(new Set((data.categories || []).map((c: any) => String(c).toUpperCase().trim()))).sort() as string[]
        ];

        setAvailableRegions(regions);
        setAvailableCategories(categories);
      }
    } catch (err) {
      console.error('Fetch Disaster Metadata Error:', err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        province: selectedRegion,
        category: selectedCategory,
        start_date: startDate,
        end_date: endDate,
        search,
        limit: '50'
      });
      
      const response = await authFetch(`${API_BASE}/analytics/disaster-history?${params.toString()}`);
      
      if (response && response.ok) {
        const data = await response.json();
        // ID-based deduplication as a fail-safe
        const uniqueHistory = Array.from(new Map(data.map((item: any) => [item.id, item])).values());
        setHistory(uniqueHistory as DisasterEvent[]);
      }
    } catch (err) {
      console.error('Fetch Disaster History Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams({
        province: selectedRegion,
        category: selectedCategory,
        start_date: startDate,
        end_date: endDate,
        search
      });
      const response = await authFetch(`${API_BASE}/analytics/disaster-stats?${params.toString()}`);
      
      if (response && response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Fetch Disaster Stats Error:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchStats();
    setPage(1); // Reset to first page when any filter changes
  }, [selectedRegion, selectedCategory, startDate, endDate, search]);

  return {
    history,
    stats,
    loading,
    availableRegions,
    availableCategories,
    selectedRegion,
    setSelectedRegion,
    selectedCategory,
    setSelectedCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refresh: fetchHistory,
    resetFilters: () => {
      setSelectedRegion('Nasional');
      setSelectedCategory('Semua');
      setSearch('');
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
    },
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    totalPages: Math.ceil(history.length / pageSize)
  };
};
