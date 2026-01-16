// src/lib/listingService.js
import axiosInstance from './axios';

// Cache configuration
const CACHE_CONFIG = {
  TTL: 30 * 1000, // 30 seconds cache
  PREFIX: 'listing_cache_',
  MAX_SIZE: 50
};

// Cache storage
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
      // Manage cache size
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_CONFIG.PREFIX));
      
      if (keys.length >= CACHE_CONFIG.MAX_SIZE) {
        // Remove oldest caches
        keys.slice(0, 5).forEach(k => localStorage.removeItem(k));
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

export const getListingsByVendor = async (vendorId) => {
  try {
    const response = await axiosInstance.get(`/listings/vendor/${vendorId}`);
    
    if (response.data) {
      const data = response.data;
      
      if (data.status === 'success') {
        return data;
      }
      
      if (data.message && data.data) {
        return {
          status: 'success',
          message: data.message,
          data: data.data,
          results: data.data.listings?.length || 0
        };
      }
    }
    
    return {
      status: 'error',
      message: 'Invalid response structure',
      results: 0,
      data: { listings: [] }
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      results: 0,
      data: { listings: [] }
    };
  }
};

export const getListingById = async (listingId) => {
  try {
    const cacheKey = `${CACHE_CONFIG.PREFIX}item_${listingId}`;
    const cached = cacheStore.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const response = await axiosInstance.get(`/listings/${listingId}`, {
      timeout: 5000
    });
    
    if (response.data) {
      const data = response.data;
      let result;
      
      if (data.message && data.data) {
        result = {
          status: 'success',
          message: data.message,
          data: { listing: data.data },
          results: 1
        };
      } else if (data.status === 'success') {
        result = data;
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
};

export const getListingsByCategory = async (category, filters = {}) => {
  try {
    // Create cache key from category and filters
    const cacheKey = `${CACHE_CONFIG.PREFIX}category_${category}_${JSON.stringify(filters)}`;
    
    // Try to get from cache first
    const cached = cacheStore.get(cacheKey);
    if (cached) {
      // Return cached data immediately
      console.log(`Cache hit for category: ${category}`);
      return cached;
    }
    
    // Prepare query params
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.page) params.append('page', filters.page);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    const queryString = params.toString();
    const url = `/listings${queryString ? `?${queryString}` : ''}`;
    
    // Make API request with timeout - REMOVED Cache-Control header
    const response = await axiosInstance.get(url, {
      timeout: 8000 // 8 second timeout
      // REMOVED: headers: { 'Cache-Control': 'max-age=30' }
    });
    
    if (response.data) {
      const data = response.data;
      let result;
      
      if (data.message && data.data) {
        result = {
          status: 'success',
          message: data.message,
          data: data.data,
          results: data.data.listings?.length || 0
        };
      } else if (data.status === 'success') {
        result = data;
      } else {
        result = {
          status: 'error',
          message: 'Invalid response structure',
          results: 0,
          data: { listings: [] }
        };
      }
      
      // Cache the successful response
      if (result.status === 'success') {
        cacheStore.set(cacheKey, result);
      }
      
      return result;
    }
    
    return {
      status: 'error',
      message: 'Invalid response structure',
      results: 0,
      data: { listings: [] }
    };
  } catch (error) {
    console.error('Error fetching listings by category:', error);
    return {
      status: 'error',
      message: error.message,
      results: 0,
      data: { listings: [] }
    };
  }
};

// New functions for performance optimization
export const preloadListings = async (categories = []) => {
  try {
    const promises = categories.map(category => 
      getListingsByCategory(category, { limit: 6 }).catch(() => null)
    );
    
    await Promise.allSettled(promises);
    return true;
  } catch (error) {
    console.warn('Preloading failed:', error);
    return false;
  }
};

export const invalidateCategoryCache = (category) => {
  cacheStore.invalidate(`category_${category}`);
};

export const clearAllCache = () => {
  cacheStore.invalidate(CACHE_CONFIG.PREFIX);
};

// Helper to get cached data only (no API call)
export const getCachedListingsByCategory = (category, filters = {}) => {
  const cacheKey = `${CACHE_CONFIG.PREFIX}category_${category}_${JSON.stringify(filters)}`;
  return cacheStore.get(cacheKey);
};

export default {
  getListingsByVendor,
  getListingById,
  getListingsByCategory,
  preloadListings,
  invalidateCategoryCache,
  clearAllCache,
  getCachedListingsByCategory
};