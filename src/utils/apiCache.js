// High-performance client-side cache with Stale-While-Revalidate (SWR)
const cache = new Map();
const TTL = 30000; // 30 seconds fresh cache

export async function fastFetch(url, options = {}) {
  const method = options.method || 'GET';

  // For non-GET requests, invalidate cache and perform direct fetch
  if (method !== 'GET') {
    // Invalidate related cache entries
    for (const key of cache.keys()) {
      if (url.includes('/api/')) {
        const endpoint = url.split('?')[0];
        if (key.includes(endpoint) || key.includes('/api/dashboard/summary')) {
          cache.delete(key);
        }
      }
    }
    const res = await fetch(url, options);
    return res.json();
  }

  const cacheKey = `${url}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  // If cache is fresh, return immediately
  if (cached && (now - cached.timestamp < TTL)) {
    return cached.data;
  }

  // If stale cache exists, trigger background revalidation and return stale data immediately
  if (cached) {
    // Background revalidate
    fetch(url, options)
      .then(r => r.json())
      .then(freshData => {
        cache.set(cacheKey, { data: freshData, timestamp: Date.now() });
      })
      .catch(() => {});
    return cached.data;
  }

  // Direct fetch and cache
  const res = await fetch(url, options);
  const data = await res.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export function clearApiCache() {
  cache.clear();
}
