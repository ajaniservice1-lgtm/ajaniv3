// ================== UPDATED BACKEND HOOK WITH STRICT LOCATION FILTERING ==================

// Helper function to detect if query looks like a location
const looksLikeLocation = (query) => {
  if (!query || query.trim() === '') return false;
  
  const queryLower = query.toLowerCase().trim();
  
  // Common Ibadan/place indicators
  const locationIndicators = [
    // Ibadan areas
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly', 'oke', 'agodi', 
    'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
    'molete', 'agbowo', 'sabo', 'bashorun', 'ondo road', 'ogbomoso', 'ife road',
    'akinyele', 'bodija market', 'dugbe market', 'mokola hill', 'sango roundabout',
    
    // Location suffixes
    'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
    'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
    'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station',
    
    // Nigerian states/cities
    'ibadan', 'lagos', 'abuja', 'oyo', 'ogun', 'ondo', 'ekiti', 'osun',
    'abeokuta', 'ilorin', 'benin', 'port harcourt', 'kano', 'kaduna'
  ];
  
  // Check if query contains any location indicator
  const isLocation = locationIndicators.some(indicator => queryLower.includes(indicator));
  
  // Also check if query is short (likely a location name)
  const isShortQuery = queryLower.split(/\s+/).length <= 3 && queryLower.length <= 15;
  
  return isLocation || isShortQuery;
};

// Helper to normalize location for matching
const normalizeLocation = (location) => {
  if (!location) return '';
  
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

// Helper to normalize location for backend (convert to proper case)
const normalizeLocationForBackend = (location) => {
  if (!location) return '';
  
  // Convert to proper case
  return location
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const useBackendListings = (searchQuery = '', filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  // Get URL params for direct filtering
  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get('category');
  const urlLocation = urlParams.get('location.area') || urlParams.get('location');
  const urlSearchQuery = urlParams.get('q');

  // Function to filter listings based on URL parameters (CRITICAL)
  const filterByURLParams = useCallback((allListings) => {
    console.log('🔍 URL Params for filtering:', { 
      urlCategory, 
      urlLocation, 
      urlSearchQuery,
      searchQuery,
      filters 
    });
    
    let filteredListings = allListings;
    
    // ✅ CRITICAL: Filter by URL category (if exists)
    if (urlCategory) {
      const activeCategory = urlCategory.toLowerCase();
      console.log(`🔧 Filtering by URL category: ${activeCategory}`);
      
      filteredListings = filteredListings.filter(item => {
        const itemCategory = (item.category || '').toLowerCase();
        const matchesCategory = itemCategory.includes(activeCategory) || 
               activeCategory.includes(itemCategory) ||
               (activeCategory === 'services' && itemCategory === 'vendor') ||
               (activeCategory === 'vendor' && itemCategory === 'services');
        
        if (!matchesCategory) {
          console.log(`❌ Item filtered out - Category mismatch: ${item.title} (${itemCategory}) vs ${activeCategory}`);
        }
        return matchesCategory;
      });
      
      console.log(`✅ After URL category filtering: ${filteredListings.length} listings`);
    }
    
    // ✅ CRITICAL: Filter by URL location (if exists) - STRICT MATCHING
    if (urlLocation) {
      const searchLocation = urlLocation.toLowerCase();
      console.log(`📍 Filtering by URL location: ${searchLocation}`);
      
      filteredListings = filteredListings.filter(item => {
        const itemLocation = normalizeLocation(item.location?.area || item.area || item.location || '');
        const normalizedSearchLocation = normalizeLocation(searchLocation);
        
        // Check for exact or partial match
        const matchesLocation = 
          itemLocation.includes(normalizedSearchLocation) || 
          normalizedSearchLocation.includes(itemLocation) ||
          itemLocation === normalizedSearchLocation;
        
        if (!matchesLocation) {
          console.log(`❌ Item filtered out - Location mismatch: ${item.title} (${item.location?.area}) vs ${searchLocation}`);
        }
        return matchesLocation;
      });
      
      console.log(`✅ After URL location filtering: ${filteredListings.length} listings`);
    }
    
    // ✅ Filter by URL search query (non-location)
    if (urlSearchQuery && !looksLikeLocation(urlSearchQuery)) {
      console.log(`🔍 Filtering by URL search query: ${urlSearchQuery}`);
      const queryLower = urlSearchQuery.toLowerCase();
      
      filteredListings = filteredListings.filter(item => {
        const itemName = (item.title || item.name || '').toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        const itemDescription = (item.description || '').toLowerCase();
        const itemTags = (item.tags || '').toLowerCase();
        
        return itemName.includes(queryLower) ||
               itemCategory.includes(queryLower) ||
               itemDescription.includes(queryLower) ||
               itemTags.includes(queryLower);
      });
      
      console.log(`✅ After URL search query filtering: ${filteredListings.length} listings`);
    }
    
    return filteredListings;
  }, [urlCategory, urlLocation, urlSearchQuery]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/listings';
        const params = new URLSearchParams();
        
        // ✅ STRATEGY: Send minimal params to backend, filter client-side for accuracy
        
        // Check what type of search we have
        const isLocationSearch = looksLikeLocation(searchQuery);
        const hasLocationFilter = filters.locations && filters.locations.length > 0;
        const hasCategoryFilter = filters.categories && filters.categories.length > 0;
        
        console.log('🎯 Search Analysis:', {
          searchQuery,
          isLocationSearch,
          hasLocationFilter,
          hasCategoryFilter,
          urlCategory,
          urlLocation
        });
        
        // ✅ Send category to backend if we have it in URL
        if (urlCategory) {
          const backendCategory = urlCategory.toLowerCase() === 'vendor' ? 'services' : urlCategory.toLowerCase();
          params.append('category', backendCategory);
          console.log(`📦 Sending category to backend: ${backendCategory}`);
        } else if (hasCategoryFilter) {
          // Fallback to filter categories
          const backendCategories = filters.categories.map(cat => {
            const categoryMap = {
              'hotel': 'hotel',
              'restaurant': 'restaurant', 
              'shortlet': 'shortlet',
              'vendor': 'services',
              'services': 'services'
            };
            return categoryMap[cat.toLowerCase()] || cat;
          });
          params.append('category', backendCategories[0]);
        }
        
        // ✅ Send location to backend ONLY if we have URL location
        if (urlLocation) {
          const properCaseLocation = normalizeLocationForBackend(urlLocation);
          params.append('location.area', properCaseLocation);
          console.log(`📍 Sending location to backend: "${properCaseLocation}"`);
        } else if (hasLocationFilter && filters.locations[0]) {
          // Fallback to filter location
          const properCaseLocation = normalizeLocationForBackend(filters.locations[0]);
          params.append('location.area', properCaseLocation);
          console.log(`📍 Sending filter location to backend: "${properCaseLocation}"`);
        }
        
        // ✅ Send regular search query (non-location) to backend
        if (searchQuery && !isLocationSearch) {
          params.append('q', searchQuery);
          console.log(`🔍 Sending search query to backend: "${searchQuery}"`);
        }
        
        // Add other filters
        if (filters.priceRange?.min) {
          params.append('minPrice', filters.priceRange.min);
        }
        
        if (filters.priceRange?.max) {
          params.append('maxPrice', filters.priceRange.max);
        }
        
        if (filters.ratings && filters.ratings.length > 0) {
          params.append('minRating', Math.min(...filters.ratings));
        }
        
        if (filters.sortBy && filters.sortBy !== 'relevance') {
          params.append('sort', filters.sortBy);
        }
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        console.log('📡 Backend API Request:', url);
        
        const response = await axiosInstance.get(url);
        setApiResponse(response.data);
        
        if (response.data && response.data.status === 'success' && response.data.data?.listings) {
          let allListings = response.data.data.listings;
          
          console.log(`📦 Received ${allListings.length} listings from backend`);
          
          // ✅ CRITICAL: Apply STRICT client-side filtering based on URL params
          let finalListings = filterByURLParams(allListings);
          
          // ✅ If we have a location search query (not URL param), apply additional filtering
          if (searchQuery && isLocationSearch && !urlLocation) {
            console.log(`📍 Additional location search filtering for: "${searchQuery}"`);
            
            finalListings = finalListings.filter(item => {
              const itemLocation = normalizeLocation(item.location?.area || item.area || item.location || '');
              const normalizedSearchLocation = normalizeLocation(searchQuery);
              
              // Check for exact or partial match
              return itemLocation.includes(normalizedSearchLocation) || 
                     normalizedSearchLocation.includes(itemLocation) ||
                     itemLocation === normalizedSearchLocation;
            });
            
            console.log(`✅ After location search filtering: ${finalListings.length} listings`);
          }
          
          // ✅ Apply additional filter-based filtering (for UI filters)
          if (filters.locations && filters.locations.length > 0 && !urlLocation) {
            console.log(`📍 Applying UI location filters: ${filters.locations.join(', ')}`);
            
            finalListings = finalListings.filter(item => {
              const itemLocation = getLocationDisplayName(item.location?.area || '');
              return filters.locations.some(filterLocation => 
                normalizeLocation(filterLocation) === normalizeLocation(itemLocation)
              );
            });
            
            console.log(`✅ After UI location filtering: ${finalListings.length} listings`);
          }
          
          // ✅ Apply category filter if not already filtered by URL
          if (filters.categories && filters.categories.length > 0 && !urlCategory) {
            console.log(`🔧 Applying UI category filtering: ${filters.categories.join(', ')}`);
            
            finalListings = finalListings.filter(item => {
              const itemCategory = (item.category || '').toLowerCase();
              return filters.categories.some(filterCategory => 
                itemCategory.includes(filterCategory.toLowerCase()) ||
                filterCategory.toLowerCase().includes(itemCategory)
              );
            });
            
            console.log(`✅ After UI category filtering: ${finalListings.length} listings`);
          }
          
          setListings(finalListings);
        } else {
          console.log('⚠️ No listings data received');
          setListings([]);
          setError(response.data?.message || 'No data received');
        }
      } catch (err) {
        console.error('❌ Backend API Error:', err.message);
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery, JSON.stringify(filters), filterByURLParams, urlCategory, urlLocation]);

  return { 
    listings, 
    loading, 
    error, 
    apiResponse,
    looksLikeLocation: () => looksLikeLocation(searchQuery)
  };
};