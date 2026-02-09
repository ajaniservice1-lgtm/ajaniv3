// ================== UPDATED BACKEND HOOK WITH STRICT LOCATION FILTERING ==================

// Helper function to detect if query looks like a location
const looksLikeLocation = (query) => {
  if (!query || query.trim() === '') return false;
  
  const queryLower = query.toLowerCase().trim();
  
  // Common Ibadan/place indicators
  const locationIndicators = [
    // Ibadan areas
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly',  'agodi', 
    'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
    'molete', 'agbowo', 'sabo', 'bashorun', 'ondo road',  'ife road',
    'akinyele', 'mokola hill', 'sango roundabout',
    
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

// Helper to get location display name
const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations" || location === "All")
    return "All Locations";
  
  // Handle common Ibadan locations
  const locationMap = {
    'akobo': 'Akobo',
    'ringroad': 'Ringroad',
    'bodija': 'Bodija',
    'dugbe': 'Dugbe',
    'mokola': 'Mokola',
    'sango': 'Sango',
    'ui': 'UI',
    'poly': 'Poly',
   
    'agodi': 'Agodi',
    'jericho': 'Jericho',
    'gbagi': 'Gbagi',
    'apata': 'Apata',
    'secretariat': 'Secretariat',
    'moniya': 'Moniya',
    'challenge': 'Challenge',
    'molete': 'Molete',
    'agbowo': 'Agbowo',
    'sabo': 'Sabo',
    'bashorun': 'Bashorun'
  };
  
  const locLower = location.toLowerCase();
  if (locationMap[locLower]) {
    return locationMap[locLower];
  }
  
  // Fallback to proper case
  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// UPDATED BACKEND HOOK FOR SEO-FRIENDLY URLS
const useBackendListings = (searchQuery = '', filters = {}, seoCategory = null, seoLocation = null) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/listings';
        const params = new URLSearchParams();
        
        console.log('🎯 SEO Parameters Analysis:', {
          seoCategory,
          seoLocation,
          searchQuery,
          filters
        });
        
        // ✅ STRATEGY: Use SEO parameters as primary, fallback to others
        
        let finalCategory = seoCategory;
        let finalLocation = seoLocation;
        
        // If we have a search query that looks like a location, use it
        if (!finalLocation && searchQuery && looksLikeLocation(searchQuery)) {
          finalLocation = searchQuery;
          console.log(`📍 Using search query as location: ${finalLocation}`);
        }
        
        // If we have filters, use them as fallback
        if (!finalCategory && filters.categories && filters.categories.length > 0) {
          finalCategory = filters.categories[0];
          console.log(`🏨 Using filter category as fallback: ${finalCategory}`);
        }
        
        if (!finalLocation && filters.locations && filters.locations.length > 0) {
          finalLocation = filters.locations[0];
          console.log(`📍 Using filter location as fallback: ${finalLocation}`);
        }
        
        // ✅ Send category to backend
        if (finalCategory && finalCategory !== "All Categories") {
          const categoryMap = {
            'hotel': 'hotel',
            'Hotel': 'hotel',
            'restaurant': 'restaurant',
            'Restaurant': 'restaurant',
            'shortlet': 'shortlet',
            'Shortlet': 'shortlet',
            'vendor': 'services',
            'Vendor': 'services',
            'services': 'services'
          };
          
          const backendCategory = categoryMap[finalCategory] || finalCategory.toLowerCase();
          params.append('category', backendCategory);
          console.log(`📦 Sending category to backend: ${backendCategory}`);
        }
        
        // ✅ Send location to backend
        if (finalLocation) {
          const properCaseLocation = normalizeLocationForBackend(finalLocation);
          params.append('location.area', properCaseLocation);
          console.log(`📍 Sending location to backend: "${properCaseLocation}"`);
        }
        
        // ✅ Send regular search query (non-location) to backend
        if (searchQuery && !looksLikeLocation(searchQuery)) {
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
          
          let finalListings = allListings;
          
          // ✅ STRICT CLIENT-SIDE FILTERING BASED ON SEO PARAMETERS
          
          // Filter by SEO category if provided
          if (seoCategory && seoCategory !== "All Categories") {
            const activeCategory = seoCategory.toLowerCase();
            console.log(`🔧 Strict filtering by SEO category: ${activeCategory}`);
            
            finalListings = finalListings.filter(item => {
              const itemCategory = (item.category || '').toLowerCase();
              
              // Exact or partial category matching
              const matchesCategory = 
                itemCategory.includes(activeCategory) || 
                activeCategory.includes(itemCategory) ||
                (activeCategory === 'services' && itemCategory === 'vendor') ||
                (activeCategory === 'vendor' && itemCategory === 'services') ||
                (activeCategory === 'hotel' && itemCategory === 'hotel') ||
                (activeCategory === 'restaurant' && itemCategory === 'restaurant') ||
                (activeCategory === 'shortlet' && itemCategory === 'shortlet');
              
              if (!matchesCategory) {
                console.log(`❌ Item filtered out - Category mismatch: "${item.title}" (${itemCategory}) vs ${activeCategory}`);
              }
              return matchesCategory;
            });
            
            console.log(`✅ After SEO category filtering: ${finalListings.length} listings`);
          }
          
          // Filter by SEO location if provided - STRICT MATCHING
          if (seoLocation) {
            const searchLocation = seoLocation.toLowerCase();
            console.log(`📍 Strict filtering by SEO location: "${searchLocation}"`);
            
            finalListings = finalListings.filter(item => {
              // Get item location from various possible fields
              const itemLocation = item.location?.area || item.area || item.location || '';
              const normalizedItemLocation = normalizeLocation(itemLocation);
              const normalizedSearchLocation = normalizeLocation(searchLocation);
              
              // Multiple matching strategies
              const matchesLocation = 
                // Exact match
                normalizedItemLocation === normalizedSearchLocation ||
                // Contains match (item contains search or search contains item)
                normalizedItemLocation.includes(normalizedSearchLocation) || 
                normalizedSearchLocation.includes(normalizedItemLocation) ||
                // Display name match
                getLocationDisplayName(itemLocation).toLowerCase().includes(searchLocation) ||
                getLocationDisplayName(searchLocation).toLowerCase().includes(itemLocation.toLowerCase());
              
              if (!matchesLocation) {
                console.log(`❌ Item filtered out - Location mismatch: "${item.title}" (${itemLocation}) vs "${searchLocation}"`);
                console.log(`   Normalized: "${normalizedItemLocation}" vs "${normalizedSearchLocation}"`);
              } else {
                console.log(`✅ Item matches location: "${item.title}" (${itemLocation}) matches "${searchLocation}"`);
              }
              return matchesLocation;
            });
            
            console.log(`✅ After SEO location filtering: ${finalListings.length} listings`);
          }
          
          // ✅ Fallback: If no SEO location but we have search query that looks like location
          if (!seoLocation && searchQuery && looksLikeLocation(searchQuery)) {
            console.log(`📍 Fallback: Filtering by search query as location: "${searchQuery}"`);
            
            const searchLocation = searchQuery.toLowerCase();
            finalListings = finalListings.filter(item => {
              const itemLocation = item.location?.area || item.area || item.location || '';
              const normalizedItemLocation = normalizeLocation(itemLocation);
              const normalizedSearchLocation = normalizeLocation(searchLocation);
              
              return normalizedItemLocation.includes(normalizedSearchLocation) || 
                     normalizedSearchLocation.includes(normalizedItemLocation);
            });
            
            console.log(`✅ After fallback location filtering: ${finalListings.length} listings`);
          }
          
          // ✅ Apply additional filter-based filtering (for UI filters)
          if (filters.locations && filters.locations.length > 0 && !seoLocation) {
            console.log(`📍 Applying UI location filters: ${filters.locations.join(', ')}`);
            
            finalListings = finalListings.filter(item => {
              const itemLocation = getLocationDisplayName(item.location?.area || '');
              return filters.locations.some(filterLocation => 
                normalizeLocation(filterLocation) === normalizeLocation(itemLocation)
              );
            });
            
            console.log(`✅ After UI location filtering: ${finalListings.length} listings`);
          }
          
          // ✅ Apply category filter if not already filtered by SEO
          if (filters.categories && filters.categories.length > 0 && !seoCategory) {
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
          
          // Log sample items for debugging
          if (finalListings.length > 0) {
            console.log('📊 Sample listings found:');
            finalListings.slice(0, 3).forEach((item, index) => {
              console.log(`  ${index + 1}. "${item.title}" - Category: ${item.category}, Location: ${item.location?.area}`);
            });
          } else {
            console.log('⚠️ No listings found after filtering');
            console.log('   Search params:', {
              seoCategory,
              seoLocation,
              searchQuery,
              filters
            });
          }
        } else {
          console.log('⚠️ No listings data received from backend');
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
  }, [searchQuery, JSON.stringify(filters), seoCategory, seoLocation]);

  return { 
    listings, 
    loading, 
    error, 
    apiResponse,
    looksLikeLocation: () => looksLikeLocation(searchQuery)
  };
};