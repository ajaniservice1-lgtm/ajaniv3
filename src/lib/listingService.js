// src/lib/listingService.js - FIXED & OPTIMIZED VERSION
import axiosInstance from './axios';

const CACHE_CONFIG = {
  TTL: 60 * 1000, // 1 minute cache (increased from 30 seconds)
  PREFIX: 'listing_cache_',
  MAX_SIZE: 100 // Increased for 100+ listings
};

const cacheStore = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const cached = JSON.parse(item);
      // Check if cache is expired
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
        // Remove oldest caches (keep 50% of max size)
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

// MAIN FUNCTION: Get ALL listings with optional filters
export const getAllListings = async (filters = {}) => {
  try {
    const cacheKey = `${CACHE_CONFIG.PREFIX}all_${JSON.stringify(filters)}`;
    const cached = cacheStore.get(cacheKey);
    
    if (cached) {
      console.log('Cache hit for all listings');
      return cached;
    }
    
    // Build query params
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = `/listings${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(url, {
      timeout: 10000, // 10 second timeout for large responses
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.data) {
      const apiData = response.data;
      let result;
      
      // Handle different API response formats
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
      
      // Cache successful responses
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
    console.error('Error fetching all listings:', error);
    return {
      status: 'error',
      message: error.response?.data?.message || error.message,
      results: 0,
      data: { listings: [] }
    };
  }
};

// Get listings by category (your existing function - KEEP THIS)
export const getListingsByCategory = async (category, filters = {}) => {
  return getAllListings({ ...filters, category });
};

// Get listing by ID (your existing function - KEEP THIS)
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
};

// Get listings by vendor (your existing function - KEEP THIS)
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

// SEARCH Function: Search across ALL listings
export const searchListings = async (searchParams = {}) => {
  try {
    const {
      query = '',
      category = '',
      minPrice = 0,
      maxPrice = 1000000,
      location = '',
      sort = 'createdAt',
      limit = 20,
      page = 1
    } = searchParams;
    
    // Build search filters
    const filters = {};
    if (query) filters.search = query;
    if (category) filters.category = category;
    if (minPrice > 0) filters.minPrice = minPrice;
    if (maxPrice < 1000000) filters.maxPrice = maxPrice;
    if (location) filters.location = location;
    if (sort) filters.sort = sort;
    if (limit) filters.limit = limit;
    if (page > 1) filters.page = page;
    
    return await getAllListings(filters);
    
  } catch (error) {
    console.error('Search error:', error);
    return {
      status: 'error',
      message: error.message,
      results: 0,
      data: { listings: [] }
    };
  }
};

// BATCH Function: Get multiple listings by IDs
export const getListingsByIds = async (listingIds = []) => {
  try {
    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return {
        status: 'success',
        data: { listings: [] },
        results: 0
      };
    }
    
    // Try to get from cache first
    const cachedResults = [];
    const uncachedIds = [];
    
    listingIds.forEach(id => {
      const cacheKey = `${CACHE_CONFIG.PREFIX}item_${id}`;
      const cached = cacheStore.get(cacheKey);
      if (cached) {
        cachedResults.push(cached.data?.listing || cached.data);
      } else {
        uncachedIds.push(id);
      }
    });
    
    // If all are cached, return immediately
    if (uncachedIds.length === 0) {
      return {
        status: 'success',
        data: { listings: cachedResults },
        results: cachedResults.length
      };
    }
    
    // Fetch uncached listings in parallel
    const fetchPromises = uncachedIds.map(id => 
      axiosInstance.get(`/listings/${id}`, { timeout: 3000 }).catch(() => null)
    );
    
    const responses = await Promise.allSettled(fetchPromises);
    
    const fetchedListings = [];
    responses.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value?.data) {
        const apiData = result.value.data;
        const listing = apiData.data || apiData;
        
        // Cache the fetched listing
        const cacheKey = `${CACHE_CONFIG.PREFIX}item_${uncachedIds[index]}`;
        cacheStore.set(cacheKey, {
          status: 'success',
          data: { listing },
          results: 1
        });
        
        fetchedListings.push(listing);
      }
    });
    
    // Combine cached and fetched listings
    const allListings = [...cachedResults, ...fetchedListings];
    
    return {
      status: 'success',
      data: { listings: allListings },
      results: allListings.length
    };
    
  } catch (error) {
    console.error('Batch fetch error:', error);
    return {
      status: 'error',
      message: error.message,
      results: 0,
      data: { listings: [] }
    };
  }
};

// Keep your existing utility functions
export const preloadListings = async (categories = []) => {
  try {
    const promises = categories.map(category => 
      getListingsByCategory(category, { limit: 8 }).catch(() => null)
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
  cacheStore.invalidate('all_'); // Also invalidate "all listings" cache
};

export const clearAllCache = () => {
  cacheStore.invalidate(CACHE_CONFIG.PREFIX);
};

export const getCachedListingsByCategory = (category, filters = {}) => {
  const cacheKey = `${CACHE_CONFIG.PREFIX}category_${category}_${JSON.stringify(filters)}`;
  return cacheStore.get(cacheKey);
};

// Main export
export default {
  // Core functions for ALL listings
  getAllListings,
  getListingsByCategory,
  getListingById,
  getListingsByVendor,
  getListingsByIds,
  searchListings,
  
  // Cache utilities
  preloadListings,
  invalidateCategoryCache,
  clearAllCache,
  getCachedListingsByCategory
};