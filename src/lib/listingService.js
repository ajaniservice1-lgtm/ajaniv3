// src/lib/listingService.js
import axiosInstance from './axios';

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
    const response = await axiosInstance.get(`/listings/${listingId}`);
    
    if (response.data) {
      const data = response.data;
      
      if (data.message && data.data) {
        return {
          status: 'success',
          message: data.message,
          data: { listing: data.data },
          results: 1
        };
      }
      
      if (data.status === 'success') {
        return data;
      }
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
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = `/listings${queryString ? `?${queryString}` : ''}`;
    
    const response = await axiosInstance.get(url);
    
    if (response.data) {
      const data = response.data;
      
      if (data.message && data.data) {
        return {
          status: 'success',
          message: data.message,
          data: data.data,
          results: data.data.listings?.length || 0
        };
      }
      
      if (data.status === 'success') {
        return data;
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

export default {
  getListingsByVendor,
  getListingById,
  getListingsByCategory
};