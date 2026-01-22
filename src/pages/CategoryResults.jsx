import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faFilter,
  faSearch,
  faTimes,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
  faDollarSign,
  faCheck,
  faChevronRight,
  faTimesCircle,
  faBed,
  faHome,
  faCalendarWeek,
  faArrowLeft,
  faBuilding,
  faUtensils,
  faLandmark,
  faTools,
  faUser,
  faChevronLeft,
  faCalendarAlt,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { MdFavoriteBorder } from "react-icons/md";
import { PiSliders } from "react-icons/pi";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import BackButton from "../components/BackButton";
import axiosInstance from "../lib/axios";
import { FaUserCircle } from "react-icons/fa";

// ================== CATEGORY SWITCH LOADER COMPONENT ==================

const CategorySwitchLoader = ({ isMobile = false, previousCategory = '', newCategory = '' }) => {
  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center transition-all duration-300 ${
        isMobile ? 'bg-white/95' : 'bg-white/90 backdrop-blur-sm'
      }`}
      style={{
        pointerEvents: 'all',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div className={`flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-6'}`}>
        {/* Animated spinner */}
        <div className="relative mb-6">
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-[#06EAFC]/10 rounded-full`}></div>
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-transparent border-t-[#06EAFC] rounded-full absolute top-0 left-0 animate-spin`}></div>
          <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} border-4 border-transparent border-b-[#00E38C] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading text with category transition */}
        <div className="text-center max-w-sm">
          <p className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-xl'} mb-2`}>
            Switching Categories
          </p>
          <div className={`flex items-center justify-center gap-2 ${isMobile ? 'text-sm' : 'text-base'} text-gray-600 mb-4`}>
            {previousCategory && (
              <>
                <span className="px-3 py-1 bg-gray-100 rounded-lg">{previousCategory}</span>
                <FontAwesomeIcon icon={faChevronRight} className="text-[#06EAFC]" />
              </>
            )}
            {newCategory && (
              <span className="px-3 py-1 bg-[#06EAFC]/10 text-[#06EAFC] font-medium rounded-lg">{newCategory}</span>
            )}
          </div>
          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Loading new listings...
          </p>
        </div>
        
        {/* Animated dots */}
        <div className="flex space-x-1 mt-6">
          <div className="w-2 h-2 bg-[#06EAFC] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#06EAFC] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#06EAFC] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
      
      {/* Embedded CSS styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .category-switch-loader {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ================== UNIFIED LOADING COMPONENT ==================

const UnifiedLoadingScreen = ({ isMobile = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center max-w-sm mx-auto px-4">
        {/* Animated spinner - larger for desktop */}
        <div className="relative mb-6">
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-[#06EAFC]/10 rounded-full`}></div>
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-transparent border-t-[#06EAFC] rounded-full absolute top-0 left-0 animate-spin`}></div>
        </div>
        
        {/* Loading text with dynamic sizing */}
        <div className="text-center">
          <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
            Loading Results
          </h3>
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'} mb-4`}>
            {isMobile 
              ? "Loading results please wait..." 
              : "Please wait while we fetch the best listings for you"
            }
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
          <div className="bg-gradient-to-r from-[#06EAFC] to-[#00E38C] h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
        
        {/* Loading tips for desktop */}
        {!isMobile && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">Tip: You can use filters to narrow down results</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-1.5 h-1.5 bg-[#06EAFC] rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-[#06EAFC] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#06EAFC] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ================== UPDATED CUSTOM BACKEND HOOK ==================

const useBackendListings = (category = null, searchQuery = '', filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  // Helper to normalize location for backend (convert to proper case)
  const normalizeLocationForBackend = (location) => {
    if (!location) return '';
    return location
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to check if search query looks like a location
  const looksLikeLocation = (query) => {
    if (!query || query.trim() === '') return false;
    
    const queryLower = query.toLowerCase().trim();
    
    // Common Ibadan areas
    const ibadanAreas = [
      'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly', 'oke', 'agodi', 
      'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
      'molete', 'agbowo', 'sabo', 'bashorun',  'ife road',
      'akinyele', 'bodija market', 'dugbe market', 'mokola hill', 'sango roundabout'
    ];
    
    // Location suffixes
    const locationSuffixes = [
      'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
      'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
      'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station'
    ];
    
    // Check if query contains any Ibadan area
    const isIbadanArea = ibadanAreas.some(area => queryLower.includes(area));
    
    // Check if query contains location suffix
    const hasLocationSuffix = locationSuffixes.some(suffix => queryLower.includes(suffix));
    
    // Check if query is short (likely a location name)
    const isShortQuery = queryLower.split(/\s+/).length <= 3 && queryLower.length <= 15;
    
    return isIbadanArea || hasLocationSuffix || isShortQuery;
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/listings';
        const params = new URLSearchParams();
        
        // Add category filter - IMPORTANT: Always send category
        if (category) {
          const categoryMap = {
            'hotel': 'hotel',
            'restaurant': 'restaurant',
            'shortlet': 'shortlet',
            'vendor': 'services',
            'services': 'services',
            'event': 'event'
          };
          const backendCategory = categoryMap[category] || category;
          params.append('category', backendCategory);
        }
        
        // ✅ FIX 2: When searching for hotel or any location, handle like search results
        // If search query looks like a location, send it as location.area to backend
        if (searchQuery && looksLikeLocation(searchQuery)) {
          // Use proper case for location
          params.append('location.area', normalizeLocationForBackend(searchQuery));
          console.log(`📍 Category page: Sending location to backend: "${searchQuery}" as "${normalizeLocationForBackend(searchQuery)}"`);
        } 
        // If it's a regular search query (not location)
        else if (searchQuery && !looksLikeLocation(searchQuery)) {
          params.append('q', searchQuery);
        }
        
        // Add location filters from active filters
        if (filters.locations && filters.locations.length > 0) {
          // Use proper case for location filter
          const properCaseLocation = normalizeLocationForBackend(filters.locations[0]);
          params.append('location.area', properCaseLocation);
          console.log(`📍 Category page: Sending filter location to backend: "${properCaseLocation}"`);
        }
        
        // Add price filters
        if (filters.priceRange?.min) {
          params.append('minPrice', filters.priceRange.min);
        }
        
        if (filters.priceRange?.max) {
          params.append('maxPrice', filters.priceRange.max);
        }
        
        // Add rating filters
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
        
        console.log('📡 Category Backend API Request:', url);
        
        const response = await axiosInstance.get(url);
        setApiResponse(response.data);
        
        if (response.data && response.data.status === 'success' && response.data.data?.listings) {
          let allListings = response.data.data.listings;
          
          console.log(`📦 Received ${allListings.length} listings for category page`);
          
          // ✅ FIX 2: Additional filtering for location searches
          let finalListings = allListings;
          
          // If search query is a location, do additional filtering for accuracy
          if (searchQuery && looksLikeLocation(searchQuery)) {
            const searchLocation = searchQuery.toLowerCase();
            console.log(`📍 Applying strict location filtering for: ${searchLocation}`);
            
            finalListings = allListings.filter(item => {
              const itemLocation = (item.location?.area || '').toLowerCase();
              
              // Check for partial matches
              const matchesLocation = itemLocation.includes(searchLocation) || 
                                      searchLocation.includes(itemLocation) ||
                                      (itemLocation && searchLocation && 
                                       itemLocation.split(' ').some(word => 
                                         word.length > 2 && searchLocation.includes(word)
                                       ));
              
              return matchesLocation;
            });
            
            console.log(`✅ After strict location filtering: ${finalListings.length} listings`);
          }
          
          setListings(finalListings);
        } else {
          setListings([]);
          setError(response.data?.message || 'No data received');
        }
      } catch (err) {
        console.error('❌ Category Backend API Error:', err.message);
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [category, searchQuery, JSON.stringify(filters)]);

  return { listings, loading, error, apiResponse };
};

// ================== HELPER FUNCTIONS ==================

const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getSubcategory = (category) => {
  if (!category) return "";
  const parts = category.split(".");
  if (parts.length > 1) {
    return parts.slice(1).join(".").trim();
  }
  return category.trim();
};

// FALLBACK IMAGES
const FALLBACK_IMAGES = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  tourist: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
  services: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
  event: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  hall: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  weekend: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
};

const getCardImages = (item) => {
  if (item.images && item.images.length > 0 && item.images[0].url) {
    return [item.images[0].url];
  }
  
  const cat = (item.category || "").toLowerCase();
  if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
  if (cat.includes("restaurant")) return [FALLBACK_IMAGES.restaurant];
  if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
  if (cat.includes("tourist")) return [FALLBACK_IMAGES.tourist];
  if (cat.includes("cafe")) return [FALLBACK_IMAGES.cafe];
  if (cat.includes("bar") || cat.includes("lounge")) return [FALLBACK_IMAGES.bar];
  if (cat.includes("services")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  if (cat.includes("hall") || cat.includes("weekend")) return [FALLBACK_IMAGES.hall];
  return [FALLBACK_IMAGES.default];
};

const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories" || category === "All")
    return "All Categories";

  const categoryMap = {
    'hotel': 'Hotels',
    'restaurant': 'Restaurants',
    'shortlet': 'Shortlets',
    'vendor': 'Vendors',
    'services': 'Vendors',
    'event': 'Events'
  };

  if (categoryMap[category.toLowerCase()]) {
    return categoryMap[category.toLowerCase()];
  }

  const subcategory = getSubcategory(category);
  if (subcategory) {
    return subcategory
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations" || location === "All")
    return "All Locations";

  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper to check if search query looks like a location
const looksLikeLocation = (query) => {
  if (!query || query.trim() === '') return false;
  
  const queryLower = query.toLowerCase().trim();
  
  // Common Ibadan areas
  const ibadanAreas = [
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly', 'oke', 'agodi', 
    'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
    'molete', 'agbowo', 'sabo', 'bashorun',  'ife road',
    'akinyele', 'bodija market', 'dugbe market', 'mokola hill', 'sango roundabout'
  ];
  
  // Location suffixes
  const locationSuffixes = [
    'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
    'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
    'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station'
  ];
  
  // Check if query contains any Ibadan area
  const isIbadanArea = ibadanAreas.some(area => queryLower.includes(area));
  
  // Check if query contains location suffix
  const hasLocationSuffix = locationSuffixes.some(suffix => queryLower.includes(suffix));
  
  // Check if query is short (likely a location name)
  const isShortQuery = queryLower.split(/\s+/).length <= 3 && queryLower.length <= 15;
  
  return isIbadanArea || hasLocationSuffix || isShortQuery;
};

// Helper to get plural category name
const getPluralCategoryName = (category) => {
  if (!category) return "Places";
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("hotel")) return "Hotels";
  if (categoryLower.includes("shortlet")) return "Shortlets";
  if (categoryLower.includes("restaurant")) return "Restaurants";
  if (categoryLower.includes("vendor") || categoryLower.includes("services")) return "Vendors";
  if (categoryLower.includes("tourist")) return "Tourist Centers";
  if (categoryLower.includes("event")) return "Events";
  return category + "s";
};

// ✅ FIX 1: UPDATED SEARCH SUGGESTIONS FOR CATEGORY PAGES (NO COUNTS)
const generateSearchSuggestions = (query, listings, activeCategory = '') => {
  if (!query.trim() || !listings.length) return [];

  const queryLower = query.toLowerCase().trim();
  const suggestions = [];

  // For category pages, we should focus on suggestions within the current category
  const categoryFilteredListings = activeCategory 
    ? listings.filter(item => {
        const itemCategory = (item.category || '').toLowerCase();
        const activeCategoryLower = activeCategory.toLowerCase();
        return itemCategory.includes(activeCategoryLower) || 
               activeCategoryLower.includes(itemCategory) ||
               (activeCategoryLower === 'services' && itemCategory === 'vendor') ||
               (activeCategoryLower === 'vendor' && itemCategory === 'services');
      })
    : listings;

  // Get unique locations from category-filtered listings
  const uniqueLocations = [
    ...new Set(
      categoryFilteredListings
        .map((item) => item.location?.area || item.area)
        .filter((loc) => loc && loc.trim() !== "")
        .map((loc) => loc.trim())
    ),
  ];

  // For category pages, focus on location suggestions within the category
  const locationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((location) => {
      // ✅ FIX 1: No count in description for category pages
      return {
        type: "location",
        title: getLocationDisplayName(location),
        description: `${getPluralCategoryName(activeCategory)} in ${getLocationDisplayName(location)}`,
        action: () => {
          const params = new URLSearchParams();
          params.append("location.area", location);
          if (activeCategory) {
            params.append("category", activeCategory.toLowerCase());
          }
          return `/search-results?${params.toString()}`;
        },
      };
    });

  // Also check for exact category matches
  if (activeCategory) {
    const categoryLower = activeCategory.toLowerCase();
    if (categoryLower.includes(queryLower) || queryLower.includes(categoryLower)) {
      const categoryPlural = getPluralCategoryName(activeCategory);
      
      suggestions.push({
        type: "category",
        title: categoryPlural,
        description: `Browse ${categoryPlural} options`,
        action: () => {
          const categorySlug = activeCategory.toLowerCase().replace(/\s+/g, '-');
          return `/category/${categorySlug}`;
        },
      });
    }
  }

  return [...suggestions, ...locationMatches]
    .sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === queryLower;
      const bExact = b.title.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by title length (shorter titles first)
      return a.title.length - b.title.length;
    })
    .slice(0, 8);
};

// ================== FAVORITES & AUTH HOOKS ==================

const useIsFavorite = (itemId) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const checkFavoriteStatus = useCallback(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );
      const isAlreadySaved = saved.some((savedItem) => savedItem.id === itemId);
      setIsFavorite(isAlreadySaved);
    } catch (error) {
      setIsFavorite(false);
    }
  }, [itemId]);

  useEffect(() => {
    checkFavoriteStatus();

    const handleSavedListingsChange = () => {
      checkFavoriteStatus();
    };

    const handleStorageChange = (e) => {
      if (e.key === "userSavedListings") {
        checkFavoriteStatus();
      }
    };

    window.addEventListener("savedListingsUpdated", handleSavedListingsChange);
    window.addEventListener("storage", handleStorageChange);

    const pollInterval = setInterval(checkFavoriteStatus, 1000);

    return () => {
      window.removeEventListener(
        "savedListingsUpdated",
        handleSavedListingsChange
      );
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [itemId, checkFavoriteStatus]);

  return isFavorite;
};

const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const userProfile = localStorage.getItem("userProfile");
    const isLoggedIn = !!token && !!userProfile;
    setIsAuthenticated(isLoggedIn);
    return isLoggedIn;
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("loginSuccess", handleAuthChange);
    window.addEventListener("logout", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("loginSuccess", handleAuthChange);
      window.removeEventListener("logout", handleAuthChange);
    };
  }, [checkAuth]);

  return isAuthenticated;
};

// ================== BUSINESS CARD ==================

const SearchResultBusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageHeight] = useState(isMobile ? 150 : 170);
  const isFavorite = useIsFavorite(item._id || item.id);
  const cardRef = useRef(null);
  
  const isAuthenticated = useAuthStatus();

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPriceText = () => {
    const price = item.price || item.price_from || "0";
    const formattedPrice = formatPrice(price);
    return `₦${formattedPrice}`;
  };

  const getPerText = () => {
    const nightlyCategories = [
      "hotel", "hostel", "shortlet", "apartment", "cabin", "condo", "resort", "inn", "motel",
    ];

    if (nightlyCategories.some((cat) => category.toLowerCase().includes(cat))) {
      return "for 2 nights";
    }

    if (
      category.toLowerCase().includes("restaurant") ||
      category.toLowerCase().includes("food") ||
      category.toLowerCase().includes("cafe")
    ) {
      return "per meal";
    }

    return "per guest";
  };

  const priceText = getPriceText();
  const perText = getPerText();
  const locationText = item.location?.area || item.area || "Ibadan";
  const rating = item.rating || "4.9";
  const businessName = item.title || item.name || "Business Name";
  const subcategory = getSubcategory(category);

  const handleCardClick = () => {
    if (item._id || item.id) {
      navigate(`/vendor-detail/${item._id || item.id}`);
    } else {
      navigate(`/category/${category}`);
    }
  };

  const showToast = useCallback(
    (message, type = "success") => {
      const existingToast = document.getElementById("toast-notification");
      if (existingToast) {
        existingToast.remove();
      }

      const toast = document.createElement("div");
      toast.id = "toast-notification";
      toast.className = `fixed z-[9999] px-4 py-3 rounded-lg shadow-lg border ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`;

      toast.style.top = isMobile ? "15px" : "15px";
      toast.style.right = "15px";
      toast.style.maxWidth = "320px";
      toast.style.animation = "slideInRight 0.3s ease-out forwards";

      toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="${
          type === "success"
            ? "text-green-600"
            : "text-blue-600"
        } mt-0.5">
          ${
            type === "success"
              ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
              : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
          }
        </div>
        <div class="flex-1">
          <p class="font-medium">${message}</p>
          <p class="text-sm opacity-80 mt-1">${businessName}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-70 transition-opacity">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

      document.body.appendChild(toast);

      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = "slideOutRight 0.3s ease-in forwards";
          setTimeout(() => {
            if (toast.parentElement) {
              toast.remove();
            }
          }, 300);
        }
      }, 3000);
    },
    [isMobile, businessName]
  );

  const handleFavoriteClick = useCallback(
    async (e) => {
      e.stopPropagation();

      if (isProcessing) return;
      setIsProcessing(true);

      try {
        if (!isAuthenticated) {
          showToast("Please login to save listings", "info");

          localStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname + window.location.search
          );

          const itemToSaveAfterLogin = {
            id: item._id || item.id,
            name: businessName,
            price: priceText,
            perText: perText,
            rating: parseFloat(rating),
            tag: "Guest Favorite",
            image: images[0] || FALLBACK_IMAGES.default,
            category: capitalizeFirst(category) || "Business",
            location: locationText,
            originalData: {
              price: item.price,
              location: item.location,
              rating: item.rating,
              description: item.description,
            },
          };

          localStorage.setItem(
            "pendingSaveItem",
            JSON.stringify(itemToSaveAfterLogin)
          );

          setTimeout(() => {
            navigate("/login");
            setIsProcessing(false);
          }, 800);

          return;
        }

        const saved = JSON.parse(
          localStorage.getItem("userSavedListings") || "[]"
        );

        const itemId = item._id || item.id;
        const isAlreadySaved = saved.some(
          (savedItem) => savedItem.id === itemId
        );

        if (isAlreadySaved) {
          const updated = saved.filter((savedItem) => savedItem.id !== itemId);
          localStorage.setItem("userSavedListings", JSON.stringify(updated));

          showToast("Removed from saved listings", "info");

          window.dispatchEvent(
            new CustomEvent("savedListingsUpdated", {
              detail: { action: "removed", itemId: itemId },
            })
          );
        } else {
          const listingToSave = {
            id: itemId || `listing_${Date.now()}`,
            name: businessName,
            price: priceText,
            perText: perText,
            rating: parseFloat(rating),
            tag: "Guest Favorite",
            image: images[0] || FALLBACK_IMAGES.default,
            category: capitalizeFirst(category) || "Business",
            location: locationText,
            savedDate: new Date().toISOString().split("T")[0],
            originalData: {
              price: item.price,
              location: item.location,
              rating: item.rating,
              description: item.description,
            },
          };

          const updated = [...saved, listingToSave];
          localStorage.setItem("userSavedListings", JSON.stringify(updated));

          showToast("Added to saved listings!", "success");

          window.dispatchEvent(
            new CustomEvent("savedListingsUpdated", {
              detail: { action: "added", item: listingToSave },
            })
          );
        }
      } catch (error) {
        showToast("Something went wrong. Please try again.", "info");
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      item,
      businessName,
      priceText,
      perText,
      rating,
      images,
      category,
      locationText,
      showToast,
      navigate,
      isAuthenticated,
    ]
  );

  useEffect(() => {
    const pendingSaveItem = JSON.parse(
      localStorage.getItem("pendingSaveItem") || "null"
    );

    if (pendingSaveItem && pendingSaveItem.id === (item._id || item.id)) {
      localStorage.removeItem("pendingSaveItem");

      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );

      const isAlreadySaved = saved.some(
        (savedItem) => savedItem.id === (item._id || item.id)
      );

      if (!isAlreadySaved) {
        const updated = [...saved, pendingSaveItem];
        localStorage.setItem("userSavedListings", JSON.stringify(updated));

        showToast("Added to saved listings!", "success");

        window.dispatchEvent(
          new CustomEvent("savedListingsUpdated", {
            detail: { action: "added", item: pendingSaveItem },
          })
        );
      }
    }
  }, [item._id, item.id, showToast]);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl overflow-hidden flex-shrink-0 font-manrope relative group flex flex-col cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200"
      style={{
        width: isMobile ? "165px" : "240px",
        height: isMobile ? "280px" : "320px",
        minWidth: isMobile ? "165px" : "240px",
        maxWidth: isMobile ? "165px" : "240px",
        minHeight: isMobile ? "280px" : "320px",
        maxHeight: isMobile ? "280px" : "320px",
      }}
      onClick={handleCardClick}
    >
      {/* Image with FIXED dimensions */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          width: "100%",
          height: `${imageHeight}px`,
          minHeight: `${imageHeight}px`,
          maxHeight: `${imageHeight}px`,
        }}
      >
        <img
          src={images[0]}
          alt={businessName}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null;
          }}
          loading="lazy"
        />

        {/* Guest favorite badge */}
        <div className="absolute top-2 left-2 bg-white px-1.5 py-1 rounded-md shadow-sm flex items-center gap-1">
          <span className="text-[9px] font-semibold text-gray-900">
            Guest favorite
          </span>
        </div>

        {/* Heart icon */}
        <button
          onClick={handleFavoriteClick}
          disabled={isProcessing}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
            isFavorite
              ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-white/90 hover:bg-white backdrop-blur-sm"
          } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
          title={isFavorite ? "Remove from saved" : "Add to saved"}
          aria-label={isFavorite ? "Remove from saved" : "Save this listing"}
          aria-pressed={isFavorite}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isFavorite ? (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <MdFavoriteBorder className="text-[#00d1ff] w-4 h-4" />
          )}
        </button>
      </div>

      {/* Text Content */}
      <div className="flex-1 p-2.5 flex flex-col">
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm mb-1">
          {businessName}
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-xs line-clamp-1 mb-2">
              {locationText}
            </p>

            {/* Combined Price, Per Text, and Ratings */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] font-manrope text-gray-900">
                  {priceText}
                </span>
                <span className="text-[10px] text-gray-600">
                  {perText}
                </span>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-gray-800 text-xs">
                  <FontAwesomeIcon icon={faStar} className="text-black" />
                  <span className="font-semibold text-black">{rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Category tag and Saved indicator */}
          <div className="flex items-center justify-between mt-auto pt-2">
            {/* Category tag */}
            <div>
              <span className="inline-block text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {subcategory || capitalizeFirst(category)}
              </span>
            </div>

            {/* Saved indicator badge */}
            {isFavorite && !isProcessing && (
              <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <svg
                  className="w-2 h-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
    </div>
  );
};

// ================== CATEGORY BUTTONS ==================

const CategoryButtons = ({ selectedCategory, onCategoryClick, isSwitchingCategory = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsMd(width >= 768 && width < 1024);
      setIsLg(width >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const buttonConfigs = [
    { 
      key: "hotel", 
      label: "Hotel", 
      displayName: "Hotels",
      icon: faBuilding 
    },
    { 
      key: "restaurant", 
      label: "Restaurant", 
      displayName: "Restaurants",
      icon: faUtensils 
    },
    { 
      key: "shortlet", 
      label: "Shortlet", 
      displayName: "Shortlets",
      icon: faHome 
    },
    { 
      key: "vendor", 
      label: "Vendor", 
      displayName: "Vendors",
      icon: FaUserCircle
    }
  ];

  return (
    <div className="mt-4 md:mt-6 mb-4 md:mb-6 relative">
      {isSwitchingCategory && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-[#06EAFC] border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs text-gray-600">Switching...</span>
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-2">
          <div className="flex space-x-2 min-w-max px-1">
            {buttonConfigs.map((button) => {
              const isSelected = selectedCategory === button.key;
              
              return (
                <button
                  key={button.key}
                  onClick={() => onCategoryClick(button.key)}
                  disabled={isSwitchingCategory}
                  className={`
                    flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full
                    whitespace-nowrap transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                    ${isSwitchingCategory ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                    text-xs
                  `}
                  style={{ minWidth: 'auto' }}
                >
                  {button.icon === FaUserCircle ? (
                    <button.icon className={`${isSelected ? 'text-white' : 'text-gray-500'} text-xs`} />
                  ) : (
                    <FontAwesomeIcon 
                      icon={button.icon} 
                      className={`${isSelected ? 'text-white' : 'text-gray-500'} text-xs`}
                    />
                  )}
                  <span>{button.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden md:block">
          <div className="flex gap-2 justify-center">
            {buttonConfigs.map((button) => {
              const isSelected = selectedCategory === button.key;
              
              return (
                <button
                  key={button.key}
                  onClick={() => onCategoryClick(button.key)}
                  disabled={isSwitchingCategory}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-[15px]
                    transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                    ${isSwitchingCategory ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                    ${isMd ? 'text-sm px-3 py-2.5' : 'text-base px-4 py-3'}
                  `}
                >
                  {button.icon === FaUserCircle ? (
                    <button.icon className={`${isSelected ? 'text-white' : 'text-gray-500'} ${isMd ? 'text-sm' : 'text-base'}`} />
                  ) : (
                    <FontAwesomeIcon 
                      icon={button.icon} 
                      className={`${isSelected ? 'text-white' : 'text-gray-500'} ${isMd ? 'text-sm' : 'text-base'}`}
                    />
                  )}
                  <span className={isMd ? 'text-sm' : 'text-base'}>
                    {button.displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== FILTER SIDEBAR ==================

const FilterSidebar = ({
  onFilterChange,
  allLocations,
  currentFilters,
  onClose,
  isMobileModal = false,
  isDesktopModal = false,
  isInitialized,
  isMobile,
}) => {
  const [localFilters, setLocalFilters] = useState(
    currentFilters || {
      locations: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
    }
  );

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    price: true,
    rating: true,
    sort: true,
  });

  const [locationSearch, setLocationSearch] = useState("");

  const uniqueLocationDisplayNames = React.useMemo(() => {
    const locations = [
      ...new Set(allLocations.map((loc) => getLocationDisplayName(loc))),
    ];
    return locations.sort();
  }, [allLocations]);

  const filteredLocationDisplayNames = React.useMemo(() => {
    if (!locationSearch.trim()) return uniqueLocationDisplayNames;
    const searchTerm = locationSearch.toLowerCase().trim();
    return uniqueLocationDisplayNames.filter((location) =>
      location.toLowerCase().includes(searchTerm)
    );
  }, [uniqueLocationDisplayNames, locationSearch]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (isInitialized && currentFilters) {
      setLocalFilters(currentFilters);
    }
  }, [currentFilters, isInitialized]);

  // Handle location change - APPLIES IMMEDIATELY
  const handleLocationChange = (location) => {
    const updatedFilters = {
      ...localFilters,
      locations: localFilters.locations.includes(location)
        ? localFilters.locations.filter((l) => l !== location)
        : [...localFilters.locations, location],
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleRatingChange = (stars) => {
    const updatedFilters = {
      ...localFilters,
      ratings: localFilters.ratings.includes(stars)
        ? localFilters.ratings.filter((s) => s !== stars)
        : [...localFilters.ratings, stars],
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceChange = (field, value) => {
    const updatedFilters = {
      ...localFilters,
      priceRange: {
        ...localFilters.priceRange,
        [field]: value,
      },
    };
    
    setLocalFilters(updatedFilters);
    
    const timeoutId = setTimeout(() => {
      onFilterChange(updatedFilters);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSelectAllLocations = () => {
    const updatedFilters = {
      ...localFilters,
      locations:
        localFilters.locations.length === uniqueLocationDisplayNames.length
          ? []
          : [...uniqueLocationDisplayNames],
    };
    
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      locations: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const sidebarContent = (
    <div className="space-y-6">
      {(isMobileModal || isDesktopModal) && (
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Filter & Sort</h3>
            <p className="text-sm text-gray-500 mt-1">
              Refine your search results
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl cursor-pointer"
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
      )}

      {/* LOCATION SECTION */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("location")}
          className="w-full flex justify-between items-center mb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
            <h4 className="font-semibold text-gray-900 text-base">Location</h4>
            {localFilters.locations.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                {localFilters.locations.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.location ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.location && (
          <>
            <div className="mb-3">
              <div className="relative mb-3">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                />
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                )}
              </div>
              <div className="flex justify-between mb-2">
                <button
                  onClick={handleSelectAllLocations}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  {localFilters.locations.length === uniqueLocationDisplayNames.length
                    ? "Clear All Locations"
                    : "Select All Locations"}
                </button>
                <span className="text-xs text-gray-500">
                  {filteredLocationDisplayNames.length} locations
                </span>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto pr-1">
              {filteredLocationDisplayNames.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No locations found matching "{locationSearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredLocationDisplayNames.map((location, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.locations.includes(location)}
                        onChange={() => handleLocationChange(location)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                      />
                      <span
                        className={`text-sm group-hover:text-[#06EAFC] transition-colors truncate ${
                          localFilters.locations.includes(location)
                            ? "text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                        style={{ flex: 1 }}
                      >
                        {location}
                      </span>
                      {localFilters.locations.includes(location) && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-sm text-blue-600"
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {localFilters.locations.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Selected: {localFilters.locations.slice(0, 3).join(", ")}
                  {localFilters.locations.length > 3 &&
                    ` +${localFilters.locations.length - 3} more`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PRICE RANGE SECTION */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center mb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500" />
            <h4 className="font-semibold text-gray-900 text-base">
              Price Range
            </h4>
            {(localFilters.priceRange.min || localFilters.priceRange.max) && (
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                Set
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.price ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    #
                  </span>
                  <input
                    type="number"
                    placeholder="2,500"
                    value={localFilters.priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  />
                </div>
              </div>
              <span className="text-gray-500 font-medium mt-6 text-sm">to</span>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    #
                  </span>
                  <input
                    type="number"
                    placeholder="50,000"
                    value={localFilters.priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  />
                </div>
              </div>
            </div>
            {(localFilters.priceRange.min || localFilters.priceRange.max) && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...localFilters,
                      priceRange: { min: "", max: "" },
                    };
                    setLocalFilters(updatedFilters);
                    onFilterChange(updatedFilters);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Clear Price Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RATING SECTION */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex justify-between items-center mb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
            <h4 className="font-semibold text-gray-900 text-base">
              Minimum Rating
            </h4>
            {localFilters.ratings.length > 0 && (
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                {localFilters.ratings.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.rating ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label
                key={stars}
                className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={localFilters.ratings.includes(stars)}
                  onChange={() => handleRatingChange(stars)}
                  className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 transition-colors cursor-pointer"
                />
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-sm ${
                          i < stars ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-sm group-hover:text-[#06EAFC] transition-colors ${
                      localFilters.ratings.includes(stars)
                        ? "text-yellow-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {stars}+ stars
                  </span>
                </div>
              </label>
            ))}
            {localFilters.ratings.length > 0 && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...localFilters,
                      ratings: [],
                    };
                    setLocalFilters(updatedFilters);
                    onFilterChange(updatedFilters);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Clear Ratings
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CLEAR ALL FILTERS BUTTON */}
      {(localFilters.locations.length > 0 || 
        localFilters.priceRange.min || 
        localFilters.priceRange.max || 
        localFilters.ratings.length > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={clearAllFilters}
            className="w-full py-3 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );

  if (isMobileModal) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000000] bg-white"
      >
        <div className="h-full overflow-y-auto p-4">
          {sidebarContent}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }

  if (isDesktopModal) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000000] bg-white"
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Filter & Sort
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Refine your search results
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl cursor-pointer"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6 max-w-4xl mx-auto">
            {sidebarContent}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
      {sidebarContent}
    </div>
  );
};

// ================== UPDATED SEARCH MODALS ==================

// ✅ FIX 1: Desktop Search Suggestions for Category Pages (No Counts)
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
  activeCategory = '',
}) => {
  const suggestionsRef = useRef(null);

  const suggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, listings, activeCategory);
  }, [searchQuery, listings, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !searchQuery.trim() || suggestions.length === 0)
    return null;

  const containerWidth = searchBarPosition?.width || 0;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-transparent z-[9980] cursor-pointer"
        onClick={onClose}
      />

      <div
        ref={suggestionsRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 z-[9981] animate-fadeIn overflow-hidden"
        style={{
          left: `${searchBarPosition?.left || 0}px`,
          top: `${(searchBarPosition?.bottom || 0) + 8}px`,
          width: `${containerWidth}px`,
          maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Suggestions for "{searchQuery}"
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              aria-label="Close suggestions"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 56px)" }}>
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onSuggestionClick(suggestion.action());
                  onClose();
                }}
                className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-150 mb-1 last:mb-0 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                    <FontAwesomeIcon
                      icon={suggestion.type === "category" ? faBuilding : faMapMarkerAlt}
                      className="w-4 h-4 text-gray-700"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {suggestion.title}
                      </h4>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                const params = new URLSearchParams();
                params.append("q", searchQuery.trim());
                if (activeCategory) {
                  params.append("category", activeCategory.toLowerCase());
                }
                onSuggestionClick(`/search-results?${params.toString()}`);
                onClose();
              }}
              className="w-full mt-3 p-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors duration-150 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium">Show all results</p>
                  <p className="text-xs text-gray-300 mt-1">
                    View all matches for "{searchQuery}"
                  </p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// ✅ FIX 1: Mobile Search Modal for Category Pages (No Counts)
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  activeCategory = '',
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    return generateSearchSuggestions(inputValue, listings, activeCategory);
  }, [inputValue, listings, activeCategory]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onTyping(value);
  };

  const handleClearInput = () => {
    setInputValue("");
    onTyping("");
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (action) => {
    onSuggestionClick(action);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const params = new URLSearchParams();
      params.append("q", inputValue.trim());
      if (activeCategory) {
        params.append("category", activeCategory.toLowerCase());
      }
      onSuggestionClick(`/search-results?${params.toString()}`);
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  if (!isVisible) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990] animate-fadeIn cursor-pointer"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-[9991] animate-slideInUp flex flex-col"
        style={{
          boxShadow: "0 -25px 50px -12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900 text-base placeholder:text-gray-500 cursor-text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Search ${activeCategory || 'hotels, restaurants, shortlets, vendors'}...`}
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            <>
              {suggestions.length > 0 ? (
                <div className="p-5">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Suggestions ({suggestions.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.action())}
                        className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${suggestion.type === "category" ? "bg-gray-100" : "bg-gray-100"}`}>
                            <FontAwesomeIcon
                              icon={suggestion.type === "category" ? faBuilding : faMapMarkerAlt}
                              className={`w-5 h-5 ${suggestion.type === "category" ? "text-gray-700" : "text-gray-700"}`}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900 text-base">
                                  {suggestion.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                          <span className="text-sm text-blue-600 font-medium">
                            View all
                          </span>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="ml-1 text-blue-600 w-3 h-3"
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append("q", inputValue.trim());
                      if (activeCategory) {
                        params.append("category", activeCategory.toLowerCase());
                      }
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
                    }}
                    className="w-full mt-6 p-4 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-base font-medium">Show all results</p>
                        <p className="text-sm text-gray-300 mt-1">
                          View all matches for "{inputValue}"
                        </p>
                      </div>
                      <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FontAwesomeIcon icon={faSearch} className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    No matches found
                  </h3>
                  <p className="text-gray-600 text-center max-w-sm mb-8">
                    Try different keywords or browse our categories
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append("q", inputValue.trim());
                      if (activeCategory) {
                        params.append("category", activeCategory.toLowerCase());
                      }
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
                    }}
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors cursor-pointer"
                  >
                    Search anyway
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faSearch} className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Start searching
              </h3>
              <p className="text-gray-600 text-center max-w-sm mb-10">
                Search for hotels, restaurants, shortlets, and vendors in Ibadan
              </p>

              <div className="w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Hotels", "Restaurants", "Shortlets", "Vendors"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setInputValue(term);
                        onTyping(term);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

// ================== MAIN CATEGORY RESULTS COMPONENT ==================

const CategoryResults = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIX: Determine category from URL path - HANDLE BOTH PATTERNS
  const path = location.pathname;
  let activeCategory = category || 'hotel'; // Default fallback
  
  // Check for direct routes
  if (path === '/hotel') {
    activeCategory = 'hotel';
  } else if (path === '/restaurant') {
    activeCategory = 'restaurant';
  } else if (path === '/shortlet') {
    activeCategory = 'shortlet';
  } else if (path === '/event') {
    activeCategory = 'event';
  }
  
  const searchQuery = searchParams.get("q") || "";
  const urlLocation = searchParams.get("location.area") || searchParams.get("location");
  
  // Category switching loader states
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [previousCategory, setPreviousCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    priceRange: { min: "", max: "" },
    ratings: [],
    sortBy: "relevance",
  });

  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({
    left: 0,
    bottom: 0,
    width: 0,
  });
  const [selectedCategoryButton, setSelectedCategoryButton] = useState(activeCategory);
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);

  // ✅ FIX 2: Use activeCategory in the hook instead of category
  const { listings, loading, error, apiResponse } = useBackendListings(activeCategory, searchQuery, activeFilters);

  useEffect(() => {
    if (activeCategory) {
      setSelectedCategoryButton(activeCategory);
    } else {
      setSelectedCategoryButton("hotel");
    }
  }, [activeCategory]);

  useEffect(() => {
    const scrollToTop = () => {
      if (isMobile) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      } else {
        const header = document.querySelector("header");
        if (header) {
          header.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
      }
    };

    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search, isMobile]);

  useEffect(() => {
    if (!searchContainerRef.current || isMobile) return;

    const container = searchContainerRef.current;

    const updateSearchBarPosition = () => {
      const rect = container.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setSearchBarPosition({
        left: rect.left + scrollX,
        bottom: rect.bottom + scrollY,
        width: rect.width,
      });
    };

    updateSearchBarPosition();

    const handleScroll = () => {
      updateSearchBarPosition();
    };

    const handleResize = () => {
      updateSearchBarPosition();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, showSuggestions]);

  const handleMobileFilterApply = useCallback(() => {
    if (showMobileFilters) {
      setShowMobileFilters(false);
      setTimeout(() => {
        const searchSection = document.getElementById("search-section");
        if (searchSection) {
          searchSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, [showMobileFilters]);

  useEffect(() => {
    if (!loading && !error && listings.length > 0) {
      const uniqueLocations = [...new Set(listings.map(item => item.location?.area || item.area).filter(Boolean))];
      setAllLocations(uniqueLocations);
    }
  }, [listings, loading, error]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!listings.length && !loading) return;

    const initialFilters = {
      locations: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
    };

    const locationParams = [];
    // Check for location in URL
    if (urlLocation) {
      const displayName = getLocationDisplayName(urlLocation);
      if (displayName !== "All Locations" && displayName !== "All") {
        locationParams.push(displayName);
      }
    }

    if (locationParams.length > 0) {
      initialFilters.locations = [...new Set(locationParams)];
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
  }, [listings.length, searchParams.toString(), loading, urlLocation]);

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    if (!isMobile && value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchFocus = () => {
    if (isMobile) {
      setShowMobileSearchModal(true);
    } else if (localSearchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setShowSuggestions(false);
    setShowMobileSearchModal(false);
    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        params.set(key, value);
      }
    }
    setSearchParams(params);
    setTimeout(() => {
      const searchInput = document.querySelector('input[role="searchbox"]');
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
  };

  // ✅ FIX 2: Updated search submit to handle locations properly
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const params = new URLSearchParams();
      
      // ✅ FIX 2: Check if it's a location search
      if (looksLikeLocation(localSearchQuery.trim())) {
        params.set("location.area", localSearchQuery.trim());
      } else {
        params.set("q", localSearchQuery.trim());
      }
      
      // Keep category in URL - use activeCategory
      if (activeCategory) {
        params.set("category", activeCategory);
      }
      
      // Preserve existing filters
      if (urlLocation && !looksLikeLocation(localSearchQuery.trim())) {
        params.set("location.area", urlLocation);
      }
      
      setSearchParams(params);
      setShowSuggestions(false);
      setShowMobileSearchModal(false);
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const toggleDesktopFilters = () => {
    setShowDesktopFilters(!showDesktopFilters);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);

    if (!isMobile) {
      const params = new URLSearchParams();
      if (searchQuery) {
        if (looksLikeLocation(searchQuery)) {
          params.set("location.area", searchQuery);
        } else {
          params.set("q", searchQuery);
        }
      }

      // Clear existing location params
      for (const [key] of searchParams.entries()) {
        if (key.startsWith("location")) {
          params.delete(key);
        }
      }

      // Add new location filters
      newFilters.locations.forEach((locationDisplayName, index) => {
        const selectedLocation = allLocations.find(
          (loc) => getLocationDisplayName(loc) === locationDisplayName
        );
        if (selectedLocation) {
          if (index === 0) {
            params.set("location.area", selectedLocation);
          }
        }
      });

      // Keep category - use activeCategory
      if (activeCategory) {
        params.set("category", activeCategory);
      }

      setSearchParams(params);
    }
  };

  // ✅ UPDATED: Category switching with loader
  const handleCategoryButtonClick = (categoryKey) => {
    // Set loading state
    setIsSwitchingCategory(true);
    const currentCategory = activeCategory || "all";
    setPreviousCategory(getCategoryDisplayName(currentCategory));
    
    const categoryMap = {
      'hotel': 'Hotels',
      'restaurant': 'Restaurants',
      'shortlet': 'Shortlets',
      'vendor': 'Vendors'
    };
    setNewCategory(categoryMap[categoryKey] || categoryKey);
    
    // Navigate to direct route
    navigate(`/${categoryKey}`);
    
    // Auto-hide loader after 1.5 seconds
    setTimeout(() => {
      setIsSwitchingCategory(false);
    }, 1500);
  };

  const handleSuggestionClick = useCallback(
    (url) => {
      navigate(url);
      setShowSuggestions(false);
      setShowMobileSearchModal(false);
    },
    [navigate]
  );

  const clearAllFilters = () => {
    const resetFilters = {
      locations: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
    };
    setActiveFilters(resetFilters);

    const params = new URLSearchParams();
    if (searchQuery) {
      if (looksLikeLocation(searchQuery)) {
        params.set("location.area", searchQuery);
      } else {
        params.set("q", searchQuery);
      }
    }
    // Keep category - use activeCategory
    if (activeCategory) {
      params.set("category", activeCategory);
    }
    setSearchParams(params);
  };

  // ✅ UPDATED: Dynamic search header like search results page
  const getPageTitle = () => {
    const locationParams = [];
    if (activeFilters.locations.length > 0) {
      locationParams.push(...activeFilters.locations);
    } else if (urlLocation) {
      locationParams.push(getLocationDisplayName(urlLocation));
    }

    const categoryTitle = getCategoryDisplayName(activeCategory);

    if (searchQuery) {
      if (locationParams.length > 0) {
        if (looksLikeLocation(searchQuery)) {
          return `${categoryTitle} in ${getLocationDisplayName(searchQuery)}`;
        }
        return `${categoryTitle} matching "${searchQuery}" in ${locationParams.join(", ")}`;
      }
      if (looksLikeLocation(searchQuery)) {
        return `${categoryTitle} in ${getLocationDisplayName(searchQuery)}`;
      }
      return `${categoryTitle} matching "${searchQuery}"`;
    } else if (locationParams.length > 0) {
      return `${categoryTitle} in ${locationParams.join(", ")}`;
    } else {
      return `${categoryTitle} in Ibadan`;
    }
  };

  const getPageDescription = () => {
    const locationParams = [];
    if (activeFilters.locations.length > 0) {
      locationParams.push(...activeFilters.locations);
    } else if (urlLocation) {
      locationParams.push(getLocationDisplayName(urlLocation));
    }

    const categoryTitle = getCategoryDisplayName(activeCategory);
    const categoryLower = categoryTitle.toLowerCase();

    if (searchQuery) {
      if (locationParams.length > 0) {
        if (looksLikeLocation(searchQuery)) {
          return `Find the best ${categoryLower} in ${getLocationDisplayName(searchQuery)}. Browse prices, reviews, and book directly.`;
        }
        return `Find the best ${categoryLower} in ${locationParams.join(", ")} matching "${searchQuery}". Browse prices, reviews, and book directly.`;
      }
      if (looksLikeLocation(searchQuery)) {
        return `Discover amazing ${categoryLower} in ${getLocationDisplayName(searchQuery)}. Find top-rated places, compare prices, and book directly.`;
      }
      return `Find the best ${categoryLower} in Ibadan matching "${searchQuery}". Browse prices, reviews, and book directly.`;
    } else if (locationParams.length > 0) {
      return `Discover amazing ${categoryLower} in ${locationParams.join(", ")}, Ibadan. Find top-rated places, compare prices, and book directly.`;
    } else {
      return `Find the best ${categoryLower} in Ibadan. Browse prices, reviews, and book directly.`;
    }
  };

  // ✅ UPDATED: Get accurate count text like search results page
  const getAccurateCountText = () => {
    const total = listings.length;
    const categoryTitle = getCategoryDisplayName(activeCategory);
    
    if (searchQuery && looksLikeLocation(searchQuery)) {
      return `${categoryTitle} in ${getLocationDisplayName(searchQuery)} • ${total} ${total === 1 ? 'place' : 'places'} found`;
    } else if (activeFilters.locations.length > 0) {
      return `${categoryTitle} in ${activeFilters.locations[0]} • ${total} ${total === 1 ? 'place' : 'places'} found`;
    } else if (urlLocation) {
      return `${categoryTitle} in ${getLocationDisplayName(urlLocation)} • ${total} ${total === 1 ? 'place' : 'places'} found`;
    } else if (searchQuery) {
      return `${categoryTitle} matching "${searchQuery}" • ${total} ${total === 1 ? 'place' : 'places'} found`;
    }
    
    return `${total} ${total === 1 ? 'place' : 'places'} found`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDesktopFilters &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target) &&
        !event.target.closest(".filter-modal-content")
      ) {
        setShowDesktopFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDesktopFilters]);

  // Auto-hide loader timeout
  useEffect(() => {
    let timeoutId;
    
    if (isSwitchingCategory) {
      timeoutId = setTimeout(() => {
        setIsSwitchingCategory(false);
      }, 5000); // Auto-hide after 5 seconds max
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSwitchingCategory]);

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil((apiResponse?.results || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = listings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ================== UPDATED LOADING CONDITION ==================
  // Loading state for all screen sizes (both mobile and desktop)
  if (loading && !isSwitchingCategory) {
    return <UnifiedLoadingScreen isMobile={isMobile} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-1">Backend API Error</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get active category name for search suggestions
  const activeCategoryName = getCategoryDisplayName(activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 font-manrope ">
      <Meta
        title={`${getPageTitle()} | Ajani Directory`}
        description={getPageDescription()}
        url={`https://ajani.ai/${activeCategory}?${searchParams.toString()}`}
        image="https://ajani.ai/images/category-og.jpg"
      />

      {/* Category Switch Loader */}
      {isSwitchingCategory && (
        <CategorySwitchLoader 
          isMobile={isMobile} 
          previousCategory={previousCategory}
          newCategory={newCategory}
        />
      )}

      
        <Header />
      

      <main className="pb-8 w-full mx-auto max-w-[100vw] pt-15" style={{
        paddingLeft: isMobile ? "0.75rem" : "1rem",
        paddingRight: isMobile ? "0" : "1rem",
      }}>
        {/* Search Section - Updated with dynamic header */}
        <div className="z-30 py-4 md:py-6 relative w-full" style={{
          zIndex: 50,
          width: "100%",
          marginLeft: "0",
          marginRight: "0",
          paddingLeft: "0",
          paddingRight: "0",
        }} id="search-section">
          <div style={{
            paddingLeft: isMobile ? "0" : "0",
            paddingRight: isMobile ? "0" : "0",
          }}>
            <div className="flex items-center gap-3">
              <BackButton className="md:hidden" />

              <div className="flex-1">
                <div className="flex justify-center w-full">
                  <div className="w-full relative max-w-[100vw]" ref={searchContainerRef}>
                    <form onSubmit={handleSearchSubmit}>
                      <div className="flex items-center justify-center w-full">
                        {/* DESKTOP SEARCH BAR - Similar to search results page */}
                        {!isMobile ? (
                          <div className="hidden lg:block w-full max-w-6xl mx-auto">
                            <div className="relative w-full">
                              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4">
                                <div className="flex items-center gap-4">
                                  {/* Search Input */}
                                  <div className="flex-1">
                                    <div className="relative">
                                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <FontAwesomeIcon icon={faSearch} />
                                      </div>
                                      <input
                                        type="text"
                                        value={localSearchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={handleSearchFocus}
                                        onKeyPress={(e) => {
                                          if (e.key === "Enter") {
                                            handleSearchSubmit(e);
                                          }
                                        }}
                                        placeholder={`Search ${activeCategoryName.toLowerCase()}...`}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 cursor-text"
                                      />
                                      {localSearchQuery && (
                                        <button
                                          onClick={handleClearSearch}
                                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                        >
                                          <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Search Button */}
                                  <button
                                    onClick={handleSearchSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-semibold rounded-lg hover:from-[#00c97b] hover:to-teal-600 transition-all duration-300 cursor-pointer"
                                  >
                                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                    Search
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // MOBILE - Search input with similar styling to search results page
                          <div 
                            onClick={() => {
                              handleSearchFocus();
                              setShowMobileSearchModal(true);
                            }}
                            className="bg-[#d9d9d9] rounded-[15px] mr-2 px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-200 cursor-pointer w-full"
                          >
                            <FontAwesomeIcon icon={faSearch} className="text-gray-700 text-[15px] flex-shrink-0" />
                            <div className="flex flex-col text-left truncate w-full">
                              <span className="text-gray-900 font-medium text-[13px] truncate">
                                {getLocationDisplayName(urlLocation || (searchQuery && looksLikeLocation(searchQuery) ? searchQuery : '')) || `Search ${activeCategoryName.toLowerCase()}...`}
                              </span>
                              <span className="text-gray-600 text-[12px] truncate">
                                {searchQuery || "Enter search terms..."}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Buttons with switching loader */}
          <div className="mt-4 md:mt-6">
            <CategoryButtons
              selectedCategory={selectedCategoryButton}
              onCategoryClick={handleCategoryButtonClick}
              isSwitchingCategory={isSwitchingCategory}
            />
          </div>
        </div>

        {/* ✅ FIX 1 & 2: Updated Search Modals for Category Pages */}
        {!isMobile && (
          <DesktopSearchSuggestions
            searchQuery={localSearchQuery}
            listings={listings}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowSuggestions(false)}
            isVisible={showSuggestions && !loading}
            searchBarPosition={searchBarPosition}
            activeCategory={activeCategory}
          />
        )}

        {!isMobile && showDesktopFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            allLocations={allLocations}
            currentFilters={activeFilters}
            onClose={() => setShowDesktopFilters(false)}
            isDesktopModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
          />
        )}

        {isMobile && showMobileFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            allLocations={allLocations}
            currentFilters={activeFilters}
            onClose={handleMobileFilterApply}
            isMobileModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
          />
        )}

        {isMobile && (
          <MobileSearchModal
            searchQuery={localSearchQuery}
            listings={listings}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowMobileSearchModal(false)}
            onTyping={handleSearchChange}
            isVisible={showMobileSearchModal}
            activeCategory={activeCategory}
          />
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Desktop Filter Sidebar */}
          {!isMobile && filtersInitialized && (
            <div className="lg:w-1/4">
              <FilterSidebar
                onFilterChange={handleFilterChange}
                allLocations={allLocations}
                currentFilters={activeFilters}
                isInitialized={filtersInitialized}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Results Content */}
          <div className="lg:w-3/4 w-full" ref={resultsRef}>
            {/* Page Header - Updated with dynamic header like search results page */}
            <div className="mb-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div className="flex-1 flex items-center gap-3 w-full">
                  {isMobile && filtersInitialized && (
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h1 className="text-xl font-bold text-[#00065A] mb-1">
                          {getPageTitle()}
                        </h1>
                        <p className="text-sm text-gray-600">
                          {getAccurateCountText()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMobileFilters}
                          className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm cursor-pointer"
                          aria-label="Open filters"
                          ref={filterButtonRef}
                        >
                          <div className="relative">
                            <PiSliders className="text-gray-600 text-lg" />
                            {Object.keys(activeFilters).some((key) => {
                              if (key === "priceRange") {
                                return (
                                  activeFilters.priceRange.min ||
                                  activeFilters.priceRange.max
                                );
                              }
                              return Array.isArray(activeFilters[key])
                                ? activeFilters[key].length > 0
                                : activeFilters[key] !== "relevance";
                            }) && (
                              <span className="absolute -top-1 -right-1 bg-[#06EAFC] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {Object.values(activeFilters).reduce((acc, val) => {
                                  if (Array.isArray(val)) return acc + val.length;
                                  if (typeof val === "object" && val !== null) {
                                    return acc + (val.min || val.max ? 1 : 0);
                                  }
                                  return acc + (val && val !== "relevance" ? 1 : 0);
                                }, 0)}
                              </span>
                            )}
                          </div>
                        </button>
                        <div className="relative">
                          <select
                            value={activeFilters.sortBy}
                            onChange={(e) => {
                              const updatedFilters = {
                                ...activeFilters,
                                sortBy: e.target.value,
                              };
                              handleFilterChange(updatedFilters);
                            }}
                            className="appearance-none px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] transition-colors cursor-pointer pr-8"
                          >
                            <option value="relevance">Sort by: Relevance</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name: A to Z</option>
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faChevronDown} className="text-gray-500 text-xs" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isMobile && (
                    <div className="flex-1">
                      <h1 className="text-xl font-bold text-[#00065A] mb-1">
                        {getPageTitle()}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {getAccurateCountText()}
                      </p>
                    </div>
                  )}
                </div>
                {!isMobile && filtersInitialized && (
                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <div className="relative">
                        <select
                          value={activeFilters.sortBy}
                          onChange={(e) => {
                            const updatedFilters = {
                              ...activeFilters,
                              sortBy: e.target.value,
                            };
                            handleFilterChange(updatedFilters);
                          }}
                          className="appearance-none px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-0 cursor-pointer pr-8 bg-transparent border-0"
                          style={{
                            background: "transparent",
                            border: "none",
                            boxShadow: "none",
                          }}
                        >
                          <option value="relevance">Sort by: Relevance</option>
                          <option value="price_low">Price: Low to High</option>
                          <option value="price_high">Price: High to Low</option>
                          <option value="rating">Highest Rated</option>
                          <option value="name">Name: A to Z</option>
                        </select>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <FontAwesomeIcon icon={faChevronDown} className="text-gray-500 text-xs" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results Display - Updated with mobile responsiveness like search results page */}
            <div className="space-y-6 w-full">
              {listings.length === 0 && filtersInitialized && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 w-full">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-4xl text-gray-300 mb-4 block"
                  />
                  <h3 className="text-xl text-gray-800 mb-2">
                    No matching results found
                  </h3>
                  <p className="text-sm text-gray-500 mt-4">
                    Tip: Try selecting fewer filters or different combinations
                  </p>
                </div>
              )}

              {listings.length > 0 && filtersInitialized && (
                <>
                  {isMobile ? (
                    <div className="space-y-4 w-full">
                      {Array.from({
                        length: Math.ceil(currentListings.length / 5),
                      }).map((_, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex overflow-x-auto scrollbar-hide gap-2 pb-4 w-full"
                          style={{
                            paddingLeft: "0",
                            paddingRight: "8px",
                          }}
                        >
                          {currentListings
                            .slice(rowIndex * 5, (rowIndex + 1) * 5)
                            .map((listing, index) => (
                              <SearchResultBusinessCard
                                key={listing._id || `${rowIndex}-${index}`}
                                item={listing}
                                category={activeCategory}
                                isMobile={isMobile}
                              />
                            ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                      {currentListings.map((listing, index) => (
                        <SearchResultBusinessCard
                          key={listing._id || index}
                          item={listing}
                          category={activeCategory}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && listings.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center space-x-2 mt-8 w-full">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg border ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Previous
                      </button>
                      <div className="flex space-x-1">
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg border ${
                              currentPage === page
                                ? "bg-[#06EAFC] text-white border-[#06EAFC]"
                                : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg border ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Custom styles */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .search-result-card img {
          width: 100% !important;
          height: 170px !important;
          min-height: 170px !important;
          max-height: 170px !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
        }
        
        @media (max-width: 768px) {
          .search-result-card img {
            height: 150px !important;
            min-height: 150px !important;
            max-height: 150px !important;
          }
        }
        
        .search-result-card {
          contain: layout style paint;
        }
        
        .search-result-card > div:first-child {
          width: 100% !important;
          height: 170px !important;
          min-height: 170px !important;
          max-height: 170px !important;
        }
        
        @media (max-width: 768px) {
          .search-result-card > div:first-child {
            height: 150px !important;
            min-height: 150px !important;
            max-height: 150px !important;
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce {
          animation: bounce 0.6s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.7; 
            transform: scale(1.05); 
          }
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CategoryResults;