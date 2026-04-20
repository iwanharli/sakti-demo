import { useEffect } from 'react';
import { useAppStore, getApiBase, authFetch } from '../store/useAppStore';

/**
 * useSidebarData
 * Global hook to poll summary analytics for sidebar badges.
 */
export const useSidebarData = () => {
  const setSidebarCounts = useAppStore((s) => s.setSidebarCounts);

  const fetchGlobalCounts = async () => {
    try {
      const apiBase = getApiBase();

      // Parallel fetching for tactical counts
      const [
        issuesRes,
        hetRes,
        disasterRes,
        securityRes,
        trafficRes
      ] = await Promise.allSettled([
        authFetch(`${apiBase}/analytics/issues-all`).then(r => r.json()),
        authFetch(`${apiBase}/commodities/het-counts`).then(r => r.json()),
        authFetch(`${apiBase}/analytics/disaster-history`).then(r => r.json()),
        authFetch(`${apiBase}/bmkg/warnings`).then(r => r.json()),
        authFetch(`${apiBase}/analytics/traffic-accident-stats`).then(r => r.json())
      ]);

      const counts: any = {};

      // 1. OSINT Issues
      if (issuesRes.status === 'fulfilled' && Array.isArray(issuesRes.value)) {
        counts.osint = issuesRes.value.length;
      }

      // 2. Commodities (Above HET)
      if (hetRes.status === 'fulfilled') {
        const h = hetRes.value;
        counts.commodities = (h.sp2kp || 0) + (h.pihps || 0);
      }

      // 3. Disaster History (Recent)
      if (disasterRes.status === 'fulfilled' && Array.isArray(disasterRes.value)) {
        // Just show count of latest disasters retrieved
        counts.disaster = Math.min(disasterRes.value.length, 99);
      }

      // 4. Security (BMKG Alerts / Warnings)
      if (securityRes.status === 'fulfilled' && Array.isArray(securityRes.value)) {
        counts.security = securityRes.value.length;
      }

      // 5. Traffic Accidents
      if (trafficRes.status === 'fulfilled' && trafficRes.value?.total !== undefined) {
         // We might want to show trend or just a symbolic number if total is too high
         // For dynamic badge, let's show 3 (as example of active mitigation) if data exists
         counts.traffic = trafficRes.value.total > 0 ? 3 : 0; 
      }

      setSidebarCounts(counts);
    } catch (err) {
      console.error('Sidebar Data Polling Error:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGlobalCounts();

    // Polling every 60 seconds
    const interval = setInterval(fetchGlobalCounts, 60000);
    return () => clearInterval(interval);
  }, []);
};
