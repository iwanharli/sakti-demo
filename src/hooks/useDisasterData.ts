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
  const [selectedRegion, setSelectedRegion] = useState('Nasional');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        province: selectedRegion,
        category: selectedCategory,
        start_date: startDate,
        end_date: endDate,
        limit: '50'
      });
      
      const response = await authFetch(`${API_BASE}/analytics/disaster-history?${params.toString()}`);
      
      if (response && response.ok) {
        const data = await response.json();
        setHistory(data);
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
        end_date: endDate
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
    fetchHistory();
    fetchStats();
  }, [selectedRegion, selectedCategory, startDate, endDate]);

  return {
    history,
    stats,
    loading,
    selectedRegion,
    setSelectedRegion,
    selectedCategory,
    setSelectedCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refresh: fetchHistory
  };
};
