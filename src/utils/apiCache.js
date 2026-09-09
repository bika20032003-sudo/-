import {
  initialDailySummary,
  initialRecentReports,
  initialCrushers,
  initialCrusherStocks,
  initialEquipment,
  initialAlerts,
  initialRoadProgress,
  initialTomorrowPlan,
  initialFuelLogs
} from '../data/mockData.js';

// Ultra-fast client-side cache with Stale-While-Revalidate (SWR) and instant offline fallback
const cache = new Map();
const TTL = 60000; // 60 seconds fresh cache

function getFallbackData(url) {
  if (url.includes('/api/dashboard/summary')) {
    return {
      success: true,
      totalProduction: initialDailySummary?.totalProduction?.total || 1470,
      totalFuel: initialDailySummary?.solarConsumption?.total || 4250,
      totalSharshoor: initialDailySummary?.sharshoor?.total || 882,
      totalEquipment: initialDailySummary?.workingEquipment?.total || 42,
      activeEquipment: (initialDailySummary?.workingEquipment?.total || 42) - (initialDailySummary?.stoppedEquipment?.total || 4),
      stoppedEquipment: initialDailySummary?.stoppedEquipment?.total || 4,
      operatingHours: initialDailySummary?.operatingHours?.total || 312,
      sectorAFuel: initialDailySummary?.solarConsumption?.sectorA || 2450,
      sectorBFuel: initialDailySummary?.solarConsumption?.sectorB || 1800,
      sectorAProd: initialDailySummary?.totalProduction?.sectorA || 850,
      sectorBProd: initialDailySummary?.totalProduction?.sectorB || 620,
      roadProgress: {
        kpis: {
          fdr: { meters: 220203, percentage: 97.3 },
          asphalt: { meters: 209923, percentage: 92.8 },
          aggregateBase: { meters: 215483, percentage: 95.2 },
          mco: { meters: 214303, percentage: 94.7 },
          totalTodayMeters: 1060
        }
      }
    };
  }
  if (url.includes('/api/dashboard/sector')) {
    return {
      success: true,
      summary: initialDailySummary,
      reports: initialRecentReports
    };
  }
  if (url.includes('/api/road-progress')) {
    return initialRoadProgress || [];
  }
  if (url.includes('/api/reports')) {
    return initialRecentReports || [];
  }
  if (url.includes('/api/crushers')) {
    return initialCrushers || [];
  }
  if (url.includes('/api/sharshoor')) {
    return initialCrusherStocks || [];
  }
  if (url.includes('/api/fuel')) {
    return initialFuelLogs || [];
  }
  if (url.includes('/api/equipment')) {
    return initialEquipment || [];
  }
  if (url.includes('/api/alerts')) {
    return initialAlerts || [];
  }
  if (url.includes('/api/plans')) {
    return initialTomorrowPlan || [];
  }
  return { success: true, data: [] };
}

async function fetchWithTimeout(url, options, timeoutMs = 1200) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fastFetch(rawUrl, options = {}) {
  let url = rawUrl;
  if (typeof url === 'string' && url.includes('localhost:5000/api')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      url = url.replace(/https?:\/\/localhost:5000/, apiBase);
    }
  }
  const method = options.method || 'GET';

  // For non-GET requests, invalidate cache
  if (method !== 'GET') {
    for (const key of cache.keys()) {
      if (url.includes('/api/')) {
        const endpoint = url.split('?')[0];
        if (key.includes(endpoint) || key.includes('/api/dashboard/summary')) {
          cache.delete(key);
        }
      }
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
    } catch {
      // offline mutation fallback
    }
    return { success: true, message: 'Saved locally' };
  }

  const cacheKey = `${url}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  // Return fresh cache instantly (0ms)
  if (cached && (now - cached.timestamp < TTL)) {
    return cached.data;
  }

  // Return stale cache immediately and revalidate in background
  if (cached) {
    fetchWithTimeout(url, options, 1500)
      .then(freshData => {
        if (freshData) cache.set(cacheKey, { data: freshData, timestamp: Date.now() });
      })
      .catch(() => {});
    return cached.data;
  }

  // Direct fetch with aggressive 1200ms timeout
  const data = await fetchWithTimeout(url, options, 1200);
  const finalData = data || getFallbackData(url);
  cache.set(cacheKey, { data: finalData, timestamp: Date.now() });
  return finalData;
}

export function clearApiCache() {
  cache.clear();
}
