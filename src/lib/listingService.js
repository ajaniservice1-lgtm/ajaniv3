import axiosInstance from './axios';

const CACHE_CONFIG = {
  TTL: 60 * 1000, // 1 minute cache
  PREFIX: 'listing_cache_',
  MAX_SIZE: 100
};

const cacheStore = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const cached = JSON.parse(item);
      if (Date.now() - cached.timestamp > CACHE_CONFIG.TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return cached.data;
    } catch (error) {
      localStorage.removeItem(key);
      return null;
    }
  },
  
  set: (key, data) => {
    try {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_CONFIG.PREFIX));
      
      if (keys.length >= CACHE_CONFIG.MAX_SIZE) {
        const keysToRemove = keys.slice(0, Math.floor(CACHE_CONFIG.MAX_SIZE * 0.5));
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
      
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  },
  
  invalidate: (pattern) => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache invalidation failed:', error);
    }
  }
};

// MAIN SERVICE FUNCTIONS
export const listingService = {
  // Get all listings with filters
  getAll: async (filters = {}) => {
    try {
      const cacheKey = `${CACHE_CONFIG.PREFIX}all_${JSON.stringify(filters)}`;
      const cached = cacheStore.get(cacheKey);
      
      if (cached) {
        console.log('Cache hit for all listings');
        return cached;
      }
      
      const params = new URLSearchParams();
      
      // Convert filters to API parameters
      if (filters.category) params.append('category', filters.category);
      
      // FIX: Try different location parameter formats
      if (filters.location) {
        // Try multiple parameter formats for location
        params.append('location', filters.location);
        params.append('location.area', filters.location);
        params.append('area', filters.location);
      }
      
      if (filters.search) params.append('q', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      
      const queryString = params.toString();
      const url = `/listings${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Backend API Request URL:', url);
      console.log('📡 Backend API Request params:', Object.fromEntries(params));
      
      const response = await axiosInstance.get(url, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('✅ Backend API Response:', response.data);
      
      if (response.data) {
        const apiData = response.data;
        let result;
        
        if (apiData.status === 'success') {
          result = apiData;
        } else if (apiData.message && apiData.data) {
          result = {
            status: 'success',
            message: apiData.message,
            data: apiData.data,
            results: apiData.results || apiData.data.listings?.length || 0
          };
        } else {
          result = {
            status: 'error',
            message: 'Invalid API response structure',
            results: 0,
            data: { listings: [] }
          };
        }
        
        if (result.status === 'success') {
          cacheStore.set(cacheKey, result);
        }
        
        return result;
      }
      
      return {
        status: 'error',
        message: 'No data received from server',
        results: 0,
        data: { listings: [] }
      };
      
    } catch (error) {
      console.error('❌ Error fetching all listings:', error);
      console.error('❌ Error response:', error.response?.data);
      return {
        status: 'error',
        message: error.response?.data?.message || error.message,
        results: 0,
        data: { listings: [] }
      };
    }
  },

  // Get by category (for Directory)
  getByCategory: async (category, filters = {}) => {
    return listingService.getAll({ ...filters, category });
  },

  // Search listings (for Hero & SearchResults)
  search: async (searchParams = {}) => {
    const {
      query = '',
      category = '',
      minPrice = 0,
      maxPrice = 1000000,
      location = '',
      sort = 'relevance',
      limit = 20,
      page = 1
    } = searchParams;
    
    const filters = {};
    if (query) filters.search = query;
    if (category) filters.category = category;
    if (minPrice > 0) filters.minPrice = minPrice;
    if (maxPrice < 1000000) filters.maxPrice = maxPrice;
    if (location) {
      filters.location = location;
      // Also try search query for location if it looks like a location
      if (!query && looksLikeLocation(location)) {
        filters.search = location;
      }
    }
    if (sort) filters.sort = sort;
    if (limit) filters.limit = limit;
    if (page > 1) filters.page = page;
    
    console.log('🔍 Search params to filters:', { searchParams, filters });
    return listingService.getAll(filters);
  },

  // Get single listing
  getById: async (listingId) => {
    try {
      const cacheKey = `${CACHE_CONFIG.PREFIX}item_${listingId}`;
      const cached = cacheStore.get(cacheKey);
      
      if (cached) return cached;
      
      const response = await axiosInstance.get(`/listings/${listingId}`, {
        timeout: 5000
      });
      
      if (response.data) {
        const apiData = response.data;
        let result;
        
        if (apiData.status === 'success') {
          result = apiData;
        } else if (apiData.message && apiData.data) {
          result = {
            status: 'success',
            message: apiData.message,
            data: { listing: apiData.data },
            results: 1
          };
        } else {
          result = {
            status: 'error',
            message: 'Invalid response structure',
            results: 0,
            data: { listing: null }
          };
        }
        
        cacheStore.set(cacheKey, result);
        return result;
      }
      
      return {
        status: 'error',
        message: 'Invalid response structure',
        results: 0,
        data: { listing: null }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        results: 0,
        data: { listing: null }
      };
    }
  },

  // Utility functions
  clearCache: () => {
    cacheStore.invalidate(CACHE_CONFIG.PREFIX);
  },

  getLocationsFromListings: (listings) => {
    const locations = listings.map(item => item.location?.area).filter(Boolean);
    const uniqueLocations = [...new Set(locations)];
    return uniqueLocations.sort();
  }
};

// Helper function to check if text looks like a location
const looksLikeLocation = (text) => {
  if (!text) return false;
  
  const textLower = text.toLowerCase().trim();
  const ibadanAreas = [
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly', 'agodi',
    'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
    'molete', 'agbowo', 'sabo', 'bashorun', 'ife road',
    'akinyele', 'mokola hill', 'sango roundabout'
  ];
  
  return ibadanAreas.some(area => textLower.includes(area) || area.includes(textLower));
};

export default listingService;