// src/lib/cache.js
const API_CACHE = new Map();

export const cacheApiCall = async (key, apiCall) => {
  // Return cached data if available and not expired
  if (API_CACHE.has(key)) {
    const cached = API_CACHE.get(key);
    if (Date.now() - cached.timestamp < 30000) { // 30 second cache
      return cached.data;
    }
  }
  
  // Fetch fresh data
  const data = await apiCall();
  API_CACHE.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

export const invalidateCache = (key) => {
  API_CACHE.delete(key);
};