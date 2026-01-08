// Update your useBackendListings hook in SearchResults component
// Add this helper function at the top
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

// Update useBackendListings hook in SearchResults component
const useBackendListings = (searchQuery = '', filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  // Function to filter listings based on location search
  const filterByLocation = useCallback((allListings, query) => {
    if (!query.trim()) return allListings;
    
    const queryLower = query.toLowerCase().trim();
    const isLocationSearch = looksLikeLocation(query);
    
    if (!isLocationSearch) {
      // Regular search - filter by name, category, description
      return allListings.filter(item => {
        const itemName = (item.title || item.name || '').toLowerCase();
        const itemCategory = (item.category || '').toLowerCase();
        const itemLocation = (item.location?.area || item.area || item.location || '').toLowerCase();
        const itemDescription = (item.description || '').toLowerCase();
        const itemTags = (item.tags || '').toLowerCase();
        
        return itemName.includes(queryLower) ||
               itemCategory.includes(queryLower) ||
               itemLocation.includes(queryLower) ||
               itemDescription.includes(queryLower) ||
               itemTags.includes(queryLower);
      });
    }
    
    // LOCATION SEARCH - Strict filtering
    console.log(`📍 STRICT Location search detected for: "${query}"`);
    
    // First, get all possible location fields from items
    const itemsWithLocations = allListings.map(item => ({
      ...item,
      normalizedLocations: [
        normalizeLocation(item.location?.area),
        normalizeLocation(item.area),
        normalizeLocation(item.location),
        normalizeLocation(item.address),
        normalizeLocation(item.city)
      ].filter(loc => loc && loc.length > 0)
    }));
    
    // Strict filtering: Only include items that have EXACT or CLOSE location matches
    const locationMatches = itemsWithLocations.filter(item => {
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
      
      // Check each normalized location field
      for (const location of item.normalizedLocations) {
        // 1. EXACT MATCH (highest priority)
        if (location === queryLower) {
          return true;
        }
        
        // 2. Location CONTAINS the entire query
        if (location.includes(queryLower)) {
          return true;
        }
        
        // 3. Query contains location words (e.g., "bodija" in "bodija area")
        const locationWords = location.split(/\s+/);
        const hasLocationWordMatch = locationWords.some(locWord => 
          locWord.length > 2 && queryLower.includes(locWord)
        );
        
        if (hasLocationWordMatch) {
          return true;
        }
        
        // 4. For multi-word queries, check if any query word matches location
        const hasQueryWordMatch = queryWords.some(queryWord => 
          queryWord.length > 2 && location.includes(queryWord)
        );
        
        if (hasQueryWordMatch) {
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`📍 Found ${locationMatches.length} strict location matches for "${query}"`);
    
    return locationMatches;
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/listings';
        const params = new URLSearchParams();
        
        // Add search query - but DON'T send location queries to backend
        // We'll filter them client-side for strict control
        if (searchQuery && !looksLikeLocation(searchQuery)) {
          params.append('q', searchQuery);
        }
        
        // Add other filters
        if (filters.locations && filters.locations.length > 0) {
          params.append('locations', filters.locations.join(','));
        }
        
        if (filters.categories && filters.categories.length > 0) {
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
          params.append('categories', backendCategories.join(','));
        }
        
        if (filters.priceRange?.min) {
          params.append('minPrice', filters.priceRange.min);
        }
        
        if (filters.priceRange?.max) {
          params.append('maxPrice', filters.priceRange.max);
        }
        
        if (filters.ratings && filters.ratings.length > 0) {
          params.append('minRating', Math.min(...filters.ratings));
        }
        
        // Add sorting
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
          const allListings = response.data.data.listings;
          
          // Apply strict location filtering if search query looks like a location
          let finalListings = allListings;
          
          if (searchQuery && looksLikeLocation(searchQuery)) {
            finalListings = filterByLocation(allListings, searchQuery);
            
            console.log(`📍 STRICT Location filtering applied for "${searchQuery}":`);
            console.log(`   - Total listings from backend: ${allListings.length}`);
            console.log(`   - After strict location filtering: ${finalListings.length}`);
            
            // Log exact matches
            if (finalListings.length > 0) {
              console.log('   - Exact location matches:');
              finalListings.slice(0, 5).forEach((item, i) => {
                const location = item.location?.area || item.area || item.location || 'No location';
                console.log(`     ${i+1}. ${item.title || item.name} - ${location}`);
              });
            }
          }
          
          setListings(finalListings);
        } else {
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
  }, [searchQuery, JSON.stringify(filters), filterByLocation]);

  return { 
    listings, 
    loading, 
    error, 
    apiResponse,
    looksLikeLocation: () => looksLikeLocation(searchQuery)
  };
};

// Add normalizeLocation helper
const normalizeLocation = (location) => {
  if (!location) return '';
  
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};