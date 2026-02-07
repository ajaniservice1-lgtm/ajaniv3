const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1/listings';

// Helper to build query parameters
const buildQuery = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Admin: Get all listings with filtering and pagination
export const getAdminListings = async (filters = {}, token) => {
  const queryString = buildQuery(filters);
  const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch listings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

// Admin: Get listings by specific vendor
export const getVendorListings = async (vendorId, filters = {}, token) => {
  const queryString = buildQuery(filters);
  const url = `${API_BASE_URL}/vendor/${vendorId}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch vendor listings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching vendor listings:', error);
    throw error;
  }
};

// Admin: Get single listing details
export const getListingDetails = async (listingId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${listingId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch listing details');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching listing details:', error);
    throw error;
  }
};

// Admin: Update listing (approve/reject/edit)
export const updateListing = async (listingId, updates, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${listingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update listing');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

// Admin: Delete listing
export const deleteListing = async (listingId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete listing');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

// Admin: Create listing (for vendor or direct)
export const createListing = async (listingData, token) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(listingData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create listing');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};