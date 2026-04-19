import { useState, useEffect, useCallback } from 'react';
import { getApiBase, authFetch, useAppStore } from '../store/useAppStore';

export interface TrafficAccident {
  id: string;
  report_year: number;
  report_month: number;
  report_date: string;
  region_name: string;
  city_name: string;
  polres: string;
  accident_date: string;
  victim_name: string;
  injury_status: 'MD' | 'LB' | 'LR' | 'LL' | '';
  victim_status: string;
  location_description: string;
  location_latlong: string;
  report_number: string;
  officer_name: string;
}

export interface TrafficAccidentStats {
  total: number;
  fatal: number;
  heavy: number;
  light: number;
}

export const useTrafficAccidentData = () => {
  const [accidents, setAccidents] = useState<TrafficAccident[]>([]);
  const [stats, setStats] = useState<TrafficAccidentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const addToast = useAppStore(s => s.addToast);

  // Filters
  const [province, setProvince] = useState('Nasional');
  const [injuryStatus, setInjuryStatus] = useState('Semua');
  const [victimStatus, setVictimStatus] = useState('Semua');
  const [polres, setPolres] = useState('Semua');
  
  // Default to last 7 days from now (2026-04-19)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date('2026-04-19');
    d.setDate(d.getDate() - 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('2026-04-19');
  const [search, setSearch] = useState('');
  
  const [limit, setLimit] = useState(500);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ total: number, totalPages: number } | null>(null);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (province !== 'Nasional') params.append('province', province);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const res = await authFetch(`${getApiBase()}/analytics/traffic-accident-stats?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch traffic stats:', err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [province, startDate, endDate]);

  const fetchAccidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (province !== 'Nasional') params.append('province', province);
      if (injuryStatus !== 'Semua') params.append('injury_status', injuryStatus);
      if (victimStatus !== 'Semua') params.append('victim_status', victimStatus);
      if (polres !== 'Semua') params.append('polres', polres);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (search) params.append('search', search);
      params.append('limit', limit.toString());
      params.append('page', page.toString());

      const res = await authFetch(`${getApiBase()}/analytics/traffic-accidents?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setAccidents(result.data || []);
        setPagination(result.pagination || null);
      }
    } catch (err) {
      console.error('Failed to fetch accidents:', err);
      addToast('Gagal memuat data kecelakaan', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [province, injuryStatus, victimStatus, polres, startDate, endDate, search, limit, page, addToast]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [province, injuryStatus, victimStatus, polres, startDate, endDate, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchAccidents();
  }, [fetchAccidents]);

  return {
    accidents,
    stats,
    isLoading,
    isStatsLoading,
    province,
    setProvince,
    injuryStatus,
    setInjuryStatus,
    victimStatus,
    setVictimStatus,
    polres,
    setPolres,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    search,
    setSearch,
    limit,
    setLimit,
    page,
    setPage,
    pagination,
    resetFilters: () => {
      setProvince('Nasional');
      setInjuryStatus('Semua');
      setVictimStatus('Semua');
      setPolres('Semua');
      setSearch('');
      const d = new Date('2026-04-19');
      setEndDate('2026-04-19');
      d.setDate(d.getDate() - 3);
      setStartDate(d.toISOString().split('T')[0]);
      setPage(1);
    },
    refresh: () => { fetchStats(); fetchAccidents(); }
  };
};
