import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSearch,
  faTimes,
  faFilter,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
  faDollarSign,
  faCheck,
  faChevronRight,
  faChevronLeft,
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
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { PiSliders } from "react-icons/pi";
import { MdFavoriteBorder } from "react-icons/md";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";
import { createPortal } from "react-dom";
import axiosInstance from "../lib/axios";

// ================== HELPER FUNCTIONS ==================

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
    'oke': 'Oke',
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
  const parts = location.split(".");
  if (parts.length > 1) {
    const afterDot = parts.slice(1).join(".").trim();
    return afterDot
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

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
    'molete', 'agbowo', 'sabo', 'bashorun', 'ondo road', 'ogbomoso', 'ife road',
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

// Helper to normalize location text for matching
const normalizeLocation = (location) => {
  if (!location) return '';
  
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

// ================== FIXED BACKEND HOOK ==================

const useBackendListings = (searchQuery = '', filters = {}) => {
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
        
        // ✅ CRITICAL FIX 1: Always send category when we have location
        // If we have location filter but no category, fetch ALL categories for client-side filtering
        const hasLocationFilter = filters.locations && filters.locations.length > 0;
        const hasCategoryFilter = filters.categories && filters.categories.length > 0;
        const isLocationSearch = searchQuery && looksLikeLocation(searchQuery);
        
        // ✅ FIX: Send category to backend ONLY when we have it
        if (hasCategoryFilter) {
          const backendCategories = filters.categories.map(cat => {
            const categoryMap = {
              'hotel': 'hotel',
              'restaurant': 'restaurant', 
              'shortlet': 'shortlet',
              'vendor': 'services',
              'services': 'services'
            };
            const catLower = cat.toLowerCase();
            return categoryMap[catLower] || catLower;
          });
          params.append('category', backendCategories[0]);
        } 
        // ✅ FIX 2: If searching by location (hero search), we need to handle it differently
        else if (isLocationSearch && !hasCategoryFilter) {
          // When user searches "Bodija" from hero, fetch all listings
          // We'll filter client-side based on URL params
          console.log('📍 Hero location search detected, fetching all listings for client-side filtering');
        }
        // ✅ FIX 3: If we have URL category but no filters.categories yet (initial load)
        else if (!hasCategoryFilter && !isLocationSearch) {
          // Don't send category param, let backend return all
        }
        
        // ✅ FIX 4: Send location filter to backend (proper case)
        if (hasLocationFilter) {
          const properCaseLocation = normalizeLocationForBackend(filters.locations[0]);
          params.append('location.area', properCaseLocation);
          console.log(`📍 Sending location to backend: "${properCaseLocation}"`);
        } else if (isLocationSearch && !hasLocationFilter) {
          // If search query is a location but no location filter in URL
          const properCaseLocation = normalizeLocationForBackend(searchQuery);
          params.append('location.area', properCaseLocation);
          console.log(`📍 Sending search query as location to backend: "${properCaseLocation}"`);
        }
        
        // ✅ FIX 5: Regular search query (non-location)
        if (searchQuery && !looksLikeLocation(searchQuery) && !hasLocationFilter) {
          params.append('q', searchQuery);
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
        console.log('🔍 Search Query:', searchQuery);
        console.log('🎯 Filters:', filters);
        console.log('📊 Parameters:', queryString);
        
        const response = await axiosInstance.get(url);
        setApiResponse(response.data);
        
        if (response.data && response.data.status === 'success' && response.data.data?.listings) {
          let allListings = response.data.data.listings;
          
          console.log(`📦 Received ${allListings.length} listings from backend`);
          
          // ✅ CRITICAL FIX 6: Apply STRICT client-side filtering based on URL params
          let finalListings = allListings;
          
          // Get URL params directly for accurate filtering
          const urlParams = new URLSearchParams(window.location.search);
          const urlCategory = urlParams.get('category');
          const urlLocation = urlParams.get('location.area');
          
          console.log('🔗 URL Params for filtering:', { urlCategory, urlLocation });
          
          // Filter by URL category (if exists)
          if (urlCategory) {
            const activeCategory = urlCategory.toLowerCase();
            console.log(`🔧 Filtering by URL category: ${activeCategory}`);
            
            finalListings = finalListings.filter(item => {
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
            
            console.log(`✅ After category filtering: ${finalListings.length} listings`);
          }
          
          // Filter by URL location (if exists) - EXACT MATCH
          if (urlLocation) {
            const searchLocation = urlLocation.toLowerCase();
            console.log(`📍 Filtering by URL location: ${searchLocation}`);
            
            finalListings = finalListings.filter(item => {
              const itemLocation = (item.location?.area || '').toLowerCase();
              
              // Check for exact or partial match
              const matchesLocation = itemLocation.includes(searchLocation) || 
                                      searchLocation.includes(itemLocation) ||
                                      normalizeLocation(itemLocation) === normalizeLocation(searchLocation);
              
              if (!matchesLocation) {
                console.log(`❌ Item filtered out - Location mismatch: ${item.title} (${item.location?.area}) vs ${searchLocation}`);
              }
              return matchesLocation;
            });
            
            console.log(`✅ After location filtering: ${finalListings.length} listings`);
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
  }, [searchQuery, JSON.stringify(filters), window.location.search]); // Added window.location.search dependency

  return { 
    listings, 
    loading, 
    error, 
    apiResponse,
    looksLikeLocation: () => looksLikeLocation(searchQuery)
  };
};

// ================== ADDITIONAL HELPER FUNCTIONS ==================

// BackButton Component
const BackButton = ({ className = "", onClick }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors active:scale-95 ${className}`}
      aria-label="Go back"
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700 text-lg" />
    </button>
  );
};

// Add capitalizeFirst function
const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Helper function to get subcategory (word after the dot)
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
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  tourist:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
  services:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
  event:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  hall: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  weekend:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
};

// Helper function to get category display name
const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories" || category === "All")
    return "All Categories";

  const parts = category.split(".");
  if (parts.length > 1) {
    const afterDot = parts.slice(1).join(".").trim();
    return afterDot
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes("hotel") || cat.includes("accommodation")) return faBuilding;
  if (cat.includes("shortlet") || cat.includes("apartment")) return faHome;
  if (cat.includes("weekend") || cat.includes("event")) return faCalendarWeek;
  if (cat.includes("restaurant") || cat.includes("food")) return faUtensils;
  if (cat.includes("tourist") || cat.includes("attraction")) return faLandmark;
  if (cat.includes("services") || cat.includes("vendor")) return faUser;
  return faFilter;
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
  if (cat.includes("bar") || cat.includes("lounge"))
    return [FALLBACK_IMAGES.bar];
  if (cat.includes("services") || cat.includes("vendor")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  if (cat.includes("hall") || cat.includes("weekend"))
    return [FALLBACK_IMAGES.hall];
  return [FALLBACK_IMAGES.default];
};

// ================== SEARCH SUGGESTIONS HELPER FUNCTIONS ==================

const getLocationBreakdown = (listings) => {
  const locationCounts = {};
  listings.forEach((item) => {
    const location = getLocationDisplayName(item.location?.area || "Unknown");
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

const generateSearchSuggestions = (query, listings, activeCategory) => {
  if (!query.trim() || !listings.length) return [];

  const queryLower = query.toLowerCase().trim();
  const suggestions = [];

  // Filter listings by active category
  const categoryFilteredListings = activeCategory === "All Categories" 
    ? listings 
    : listings.filter(item => {
        const itemCategory = getCategoryDisplayName(item.category || "").toLowerCase();
        const activeCategoryLower = activeCategory.toLowerCase();
        return itemCategory.includes(activeCategoryLower) || 
               activeCategoryLower.includes(itemCategory);
      });

  // Get unique locations from category-filtered listings
  const uniqueLocations = [
    ...new Set(
      categoryFilteredListings
        .map((item) => item.location?.area)
        .filter((loc) => loc && loc.trim() !== "")
        .map((loc) => loc.trim())
    ),
  ];

  // For exact location matches within the active category
  const exactLocationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName === queryLower;
    })
    .map((location) => {
      const locationListings = categoryFilteredListings.filter((item) => {
        const itemLocation = item.location?.area;
        return itemLocation && itemLocation.toLowerCase() === location.toLowerCase();
      });

      const totalPlaces = locationListings.length;

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${activeCategory} in ${getLocationDisplayName(location)}`,
        breakdownText: "",
        breakdown: [],
        action: () => {
          const params = new URLSearchParams();
          // Use proper case for location
          params.append("location.area", normalizeLocationForBackend(location));
          if (activeCategory !== "All Categories") {
            params.append("category", activeCategory.toLowerCase());
          }
          return `/search-results?${params.toString()}`;
        },
      };
    });

  if (exactLocationMatches.length > 0) {
    return exactLocationMatches.slice(0, 4);
  }

  // For location matches within the active category
  const locationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((location) => {
      const locationListings = categoryFilteredListings.filter((item) => {
        const itemLocation = item.location?.area;
        return itemLocation && itemLocation.toLowerCase() === location.toLowerCase();
      });

      const totalPlaces = locationListings.length;

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${activeCategory} in ${getLocationDisplayName(location)}`,
        breakdownText: "",
        breakdown: [],
        action: () => {
          const params = new URLSearchParams();
          // Use proper case for location
          params.append("location.area", normalizeLocationForBackend(location));
          if (activeCategory !== "All Categories") {
            params.append("category", activeCategory.toLowerCase());
          }
          return `/search-results?${params.toString()}`;
        },
      };
    });

  // Also check for exact category matches
  if (activeCategory !== "All Categories") {
    const categoryLower = activeCategory.toLowerCase();
    if (categoryLower.includes(queryLower) || queryLower.includes(categoryLower)) {
      const categoryListings = categoryFilteredListings;
      const locationBreakdown = getLocationBreakdown(categoryListings);
      const totalPlaces = categoryListings.length;

      suggestions.push({
        type: "category",
        title: activeCategory,
        count: totalPlaces,
        description: `Browse ${activeCategory} options`,
        breakdownText: "",
        breakdown: locationBreakdown.slice(0, 3),
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
      
      // Then by count
      return b.count - a.count;
    })
    .slice(0, 8);
};

// ================== DESKTOP SEARCH SUGGESTIONS COMPONENT ==================

const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
  activeCategory,
}) => {
  const suggestionsRef = useRef(null);
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, listings, activeCategory);
  }, [searchQuery, listings, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isVisible) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible || !searchQuery.trim() || suggestions.length === 0) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-transparent z-[9980]" onClick={onClose} />
      <div
        ref={suggestionsRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 z-[9981] animate-fadeIn overflow-hidden"
        style={{
          left: `${searchBarPosition?.left || 0}px`,
          top: `${(searchBarPosition?.bottom || 0) + 8}px`,
          width: `${searchBarPosition?.width || 0}px`,
          maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {activeCategory} results for "{searchQuery}"
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
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
                className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-150 mb-1 last:mb-0 group"
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
                if (looksLikeLocation(searchQuery.trim())) {
                  // Use proper case for location
                  params.append("location.area", normalizeLocationForBackend(searchQuery.trim()));
                } else {
                  params.append("q", searchQuery.trim());
                }
                if (activeCategory !== "All Categories") {
                  params.append("category", activeCategory.toLowerCase());
                }
                onSuggestionClick(`/search-results?${params.toString()}`);
                onClose();
              }}
              className="w-full mt-3 p-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium">Show all {activeCategory} results</p>
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

// ================== MOBILE SEARCH MODAL ==================
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  activeCategory,
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
      if (looksLikeLocation(inputValue.trim())) {
        // Use proper case for location
        params.append("location.area", normalizeLocationForBackend(inputValue.trim()));
      } else {
        params.append("q", inputValue.trim());
      }
      if (activeCategory !== "All Categories") {
        params.append("category", activeCategory.toLowerCase());
      }
      onSuggestionClick(`/search-results?${params.toString()}`);
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-[9991] animate-slideInUp flex flex-col"
        style={{ boxShadow: "0 -25px 50px -12px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
                className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-gray-900 text-base placeholder:text-gray-500"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Search ${activeCategory.toLowerCase()}...`}
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                        className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                            <FontAwesomeIcon
                              icon={suggestion.type === "category" ? faBuilding : faMapMarkerAlt}
                              className="w-5 h-5 text-gray-700"
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
                          <span className="text-sm text-blue-600 font-medium">View options</span>
                          <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-blue-600 w-3 h-3" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (looksLikeLocation(inputValue.trim())) {
                        // Use proper case for location
                        params.append("location.area", normalizeLocationForBackend(inputValue.trim()));
                      } else {
                        params.append("q", inputValue.trim());
                      }
                      if (activeCategory !== "All Categories") {
                        params.append("category", activeCategory.toLowerCase());
                      }
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
                    }}
                    className="w-full mt-6 p-4 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-base font-medium">Show all results</p>
                        <p className="text-sm text-gray-300 mt-1">
                          View all {activeCategory} matches for "{inputValue}"
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
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No matches found</h3>
                  <p className="text-gray-600 text-center max-w-sm mb-8">
                    Try different keywords or browse our categories
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (looksLikeLocation(inputValue.trim())) {
                        // Use proper case for location
                        params.append("location.area", normalizeLocationForBackend(inputValue.trim()));
                      } else {
                        params.append("q", inputValue.trim());
                      }
                      if (activeCategory !== "All Categories") {
                        params.append("category", activeCategory.toLowerCase());
                      }
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
                    }}
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
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
              <h3 className="text-xl font-medium text-gray-900 mb-3">Start searching</h3>
              <p className="text-gray-600 text-center max-w-sm mb-10">
                Search for {activeCategory.toLowerCase()} in Ibadan
              </p>
              <div className="w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">Popular locations</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Akobo", "Bodija", "Sango", "UI", "Mokola", "Dugbe", "Ringroad"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setInputValue(term);
                        onTyping(term);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
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

// ================== CUSTOM HOOK FOR FAVORITES ==================

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
      console.error("Error checking favorite status:", error);
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
      window.removeEventListener("savedListingsUpdated", handleSavedListingsChange);
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

// ================== SEARCH RESULT BUSINESS CARD ==================

const SearchResultBusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageHeight] = useState(isMobile ? 150 : 170);
  const isFavorite = useIsFavorite(item._id || item.id);
  const cardRef = useRef(null);
  const isAuthenticated = useAuthStatus();

  const cardDimensions = useMemo(() => ({
    width: isMobile ? "165px" : "240px",
    height: isMobile ? "280px" : "320px",
    imageHeight: isMobile ? 150 : 170,
    textPadding: isMobile ? "p-1.5" : "p-2.5"
  }), [isMobile]);

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
      "hotel",
      "hostel",
      "shortlet",
      "apartment",
      "cabin",
      "condo",
      "resort",
      "inn",
      "motel",
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
  const locationText = getLocationDisplayName(item.location?.area) || "Ibadan";
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
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
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
        console.error("Error saving/removing favorite:", error);
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
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope relative group flex flex-col
        ${isMobile ? "w-[165px]" : "w-[240px]"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
      style={{
        height: cardDimensions.height,
        minHeight: cardDimensions.height,
        maxHeight: cardDimensions.height,
        minWidth: cardDimensions.width,
        maxWidth: cardDimensions.width,
      }}
    >
      <div
        className="relative overflow-hidden rounded-xl flex-shrink-0"
        style={{
          height: `${cardDimensions.imageHeight}px`,
          minHeight: `${cardDimensions.imageHeight}px`,
          maxHeight: `${cardDimensions.imageHeight}px`,
          width: "100%",
        }}
      >
        <img
          src={images[0]}
          alt={businessName}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null;
          }}
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-white px-1.5 py-1 rounded-md shadow-sm flex items-center gap-1">
          <span className="text-[9px] font-semibold text-gray-900">
            Guest favorite
          </span>
        </div>
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
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <MdFavoriteBorder className="text-[#00d1ff] w-4 h-4" />
          )}
        </button>
      </div>
      <div 
        className={`flex-1 ${cardDimensions.textPadding} flex flex-col`}
        style={{
          minHeight: isMobile ? "130px" : "150px",
        }}
      >
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-xs md:text-sm mb-1 flex-shrink-0">
          {businessName}
        </h3>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-[9px] md:text-xs line-clamp-1 mb-2">
              {locationText}
            </p>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-xs md:text-xs font-manrope text-gray-900">
                  {priceText}
                </span>
                <span className="text-[9px] md:text-xs text-gray-600">
                  {perText}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-gray-800 text-[9px] md:text-xs">
                  <FontAwesomeIcon icon={faStar} className="text-black" />
                  <span className="font-semibold text-black">{rating}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div>
              <span className="inline-block text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {subcategory || capitalizeFirst(category)}
              </span>
            </div>
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
    </div>
  );
};

// ================== CATEGORY BUTTONS COMPONENT ==================

const CategoryButtons = ({ selectedCategories, onCategoryClick }) => {
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="mt-4 md:mt-6 mb-4 md:mb-6">
      <div className="relative">
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-2">
          <div className="flex space-x-2 min-w-max px-1">
            {buttonConfigs.map((button) => {
              const isSelected = selectedCategories.some(
                cat => cat.toLowerCase() === button.key.toLowerCase()
              );
              return (
                <button
                  key={button.key}
                  onClick={() => onCategoryClick(button.key)}
                  className={`
                    flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full
                    whitespace-nowrap transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
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
        <div className="hidden md:block">
          <div className="flex gap-2 justify-center">
            {buttonConfigs.map((button) => {
              const isSelected = selectedCategories.some(
                cat => cat.toLowerCase() === button.key.toLowerCase()
              );
              return (
                <button
                  key={button.key}
                  onClick={() => onCategoryClick(button.key)}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg
                    transition-all duration-200 font-medium text-base
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {button.icon === FaUserCircle ? (
                    <button.icon className={`${isSelected ? 'text-white' : 'text-gray-500'} text-sm`} />
                  ) : (
                    <FontAwesomeIcon 
                      icon={button.icon} 
                      className={`${isSelected ? 'text-white' : 'text-gray-500'} text-sm`}
                    />
                  )}
                  <span>{button.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== FIXED FILTER SIDEBAR ==================

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

  // ✅ FIX: Allow multiple locations to be selected
  const handleLocationChange = (location) => {
    const updatedFilters = {
      ...localFilters,
      locations: localFilters.locations.includes(location)
        ? localFilters.locations.filter((l) => l !== location) // Remove if already selected
        : [...localFilters.locations, location], // Add if not selected
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
    <div
      className={`space-y-6 ${isMobileModal ? "px-0" : ""}`}
      style={{
        marginLeft: isMobileModal ? "0" : "0",
        marginRight: isMobileModal ? "0" : "0",
        paddingLeft: isMobileModal ? "0.75rem" : "0",
        paddingRight: isMobileModal ? "0.75rem" : "0",
      }}
    >
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
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
      )}

      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("location")}
          className="w-full flex justify-between items-center mb-3"
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
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                )}
              </div>
              <div className="flex justify-between mb-2">
                <button
                  onClick={handleSelectAllLocations}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {localFilters.locations.length ===
                  uniqueLocationDisplayNames.length
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
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
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

      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center mb-3"
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
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Price Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex justify-between items-center mb-3"
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
                  className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 transition-colors"
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
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Ratings
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {(localFilters.locations.length > 0 || 
        localFilters.priceRange.min || 
        localFilters.priceRange.max || 
        localFilters.ratings.length > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={clearAllFilters}
            className="w-full py-3 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg hover:bg-red-50 transition-colors"
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
        style={{
          zIndex: 1000000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
        }}
      >
        <div
          className="h-full overflow-y-auto w-full"
          style={{ paddingLeft: "0", paddingRight: "0" }}
        >
          <div
            className="pt-5"
            style={{
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              maxWidth: "100vw",
            }}
          >
            {sidebarContent}
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
        style={{
          zIndex: 1000000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="container mx-auto px-4 py-4 max-w-4xl">
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
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
                  aria-label="Close filters"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {sidebarContent}
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

// ================== CATEGORY SECTION COMPONENT ==================

const CategorySection = ({ title, items, sectionId, isMobile, category }) => {
  const navigate = useNavigate();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef(null);

  if (items.length === 0) return null;

  const getCategoryFromTitle = (title) => {
    const words = title.toLowerCase().split(" ");
    if (words.includes("hotel")) return "hotel";
    if (words.includes("shortlet")) return "shortlet";
    if (words.includes("restaurant")) return "restaurant";
    if (words.includes("tourist")) return "tourist-center";
    return words[1] || "all";
  };

  const categorySlug = getCategoryFromTitle(title);
  const subcategoryTitle = getSubcategory(title) || title;

  const checkScrollPosition = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
    setShowRightArrow(!isAtEnd);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [items.length, isMobile]);

  const scrollSection = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const cardWidth = isMobile ? 165 + 4 : 210 + 8;
    const cardsToScroll = isMobile ? 3 : 3;
    const scrollAmount = cardWidth * cardsToScroll;
    const newPosition =
      direction === "next"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;
    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(checkScrollPosition, 300);
  };

  const handleCategoryClick = () => {
    navigate(`/category/${categorySlug}`);
  };

  return (
    <section className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <button
            onClick={handleCategoryClick}
            className={`
              text-[#00065A] hover:text-[#06EAFC] transition-colors text-left
              ${isMobile ? "text-sm" : "text-[19px]"} 
              font-bold cursor-pointer flex items-center gap-1
            `}
          >
            {subcategoryTitle}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scrollSection("prev")}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
              showLeftArrow
                ? "bg-[#D9D9D9] hover:bg-gray-300 cursor-pointer"
                : "bg-gray-100 cursor-not-allowed"
            }`}
            disabled={!showLeftArrow}
          >
            <FaLessThan
              className={`text-[10px] ${
                showLeftArrow ? "text-gray-600" : "text-gray-400"
              }`}
            />
          </button>
          <button
            onClick={() => scrollSection("next")}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
              showRightArrow
                ? "bg-[#D9D9D9] hover:bg-gray-300 cursor-pointer"
                : "bg-gray-100 cursor-not-allowed"
            }`}
            disabled={!showRightArrow}
          >
            <FaGreaterThan
              className={`text-[10px] ${
                showRightArrow ? "text-gray-600" : "text-gray-400"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={containerRef}
          id={sectionId}
          className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${
            isMobile ? "gap-1 pl-0" : "gap-2"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingRight: "8px",
          }}
        >
          {items.map((item, index) => (
            <SearchResultBusinessCard
              key={item._id || index}
              item={item}
              category={category || sectionId.replace("-section", "")}
              isMobile={isMobile}
            />
          ))}
          <div className="flex-shrink-0" style={{ width: "8px" }}></div>
        </div>
      </div>
    </section>
  );
};

// ================== FIXED MAIN SEARCHRESULTS COMPONENT ==================

const SearchResults = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category");
  const urlLocation = searchParams.get("location.area") || searchParams.get("location");
  
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    categories: [],
    priceRange: { min: "", max: "" },
    ratings: [],
    sortBy: "relevance",
    amenities: [],
  });

  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({
    left: 0,
    bottom: 0,
    width: 0,
  });
  const [selectedCategoryButtons, setSelectedCategoryButtons] = useState([]);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
  
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);

  const { listings, loading, error, apiResponse } = useBackendListings(searchQuery, activeFilters);

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
      const uniqueLocations = [...new Set(listings.map(item => item.location?.area).filter(Boolean))];
      const uniqueCategories = [...new Set(listings.map(item => item.category).filter(Boolean))];
      setAllLocations(uniqueLocations);
      setAllCategories(uniqueCategories);
    }
  }, [listings, loading, error]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // ✅ CRITICAL FIX: Initialize filters from URL parameters
  useEffect(() => {
    const initialFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };

    // Set category from URL
    if (urlCategory) {
      const displayName = getCategoryDisplayName(urlCategory);
      if (displayName !== "All Categories" && displayName !== "All") {
        initialFilters.categories = [displayName];
        
        // Set selected category button
        const buttonKey = getCategoryButtonKey(urlCategory.toLowerCase());
        setSelectedCategoryButtons([buttonKey]);
      }
    }

    // Set location from URL - use proper case
    if (urlLocation) {
      const displayName = getLocationDisplayName(urlLocation);
      if (displayName !== "All Locations" && displayName !== "All") {
        initialFilters.locations = [displayName];
      }
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
    
    console.log("🔧 Initialized filters from URL:", {
      urlCategory,
      urlLocation,
      initialFilters,
      selectedCategoryButtons
    });
  }, [urlCategory, urlLocation]);

  const getCategoryButtonKey = (categoryName) => {
    const catLower = categoryName.toLowerCase();
    if (catLower.includes("services") || catLower.includes("vendor")) return "vendor";
    if (catLower.includes("shortlet")) return "shortlet";
    if (catLower.includes("tourist")) return "tourist";
    if (catLower.includes("hotel")) return "hotel";
    if (catLower.includes("restaurant")) return "restaurant";
    return "hotel";
  };

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
      if (key.startsWith("location") || key.startsWith("category")) {
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

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const params = new URLSearchParams();
      
      // ✅ FIX: Handle location vs regular search
      if (looksLikeLocation(localSearchQuery.trim())) {
        // Use proper case for location
        params.set("location.area", normalizeLocationForBackend(localSearchQuery.trim()));
        
        // ✅ CRITICAL: When searching by location, ALWAYS include category if we have one
        if (activeFilters.categories.length > 0) {
          const categorySlug = activeFilters.categories[0].toLowerCase().replace(/\s+/g, '-');
          params.set("category", categorySlug);
        } else if (selectedCategoryButtons.length > 0) {
          // If no category filter but we have selected category button
          const categoryMap = {
            'hotel': 'hotel',
            'restaurant': 'restaurant',
            'shortlet': 'shortlet',
            'vendor': 'services'
          };
          const actualCategory = categoryMap[selectedCategoryButtons[0]] || selectedCategoryButtons[0];
          params.set("category", actualCategory);
        } else {
          // Default to hotel if no category selected
          params.set("category", "hotel");
        }
      } else {
        // Regular search query
        params.set("q", localSearchQuery.trim());
        
        // Keep existing category filter
        if (activeFilters.categories.length > 0) {
          const categorySlug = activeFilters.categories[0].toLowerCase().replace(/\s+/g, '-');
          params.set("category", categorySlug);
        }
      }
      
      // Preserve existing location filter (if not overriding with new search)
      if (!looksLikeLocation(localSearchQuery.trim()) && activeFilters.locations.length > 0) {
        params.set("location.area", activeFilters.locations[0]);
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

  // ✅ FIXED: Handle filter changes with proper URL updates
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    
    // Update URL with filters
    const params = new URLSearchParams();
    
    // Keep search query
    if (searchQuery) {
      if (looksLikeLocation(searchQuery)) {
        params.set("location.area", searchQuery);
      } else {
        params.set("q", searchQuery);
      }
    }
    
    // ✅ CRITICAL: Always include category when we have filters
    if (newFilters.categories.length > 0) {
      const categorySlug = newFilters.categories[0].toLowerCase().replace(/\s+/g, '-');
      params.set("category", categorySlug);
    } else if (newFilters.locations.length > 0) {
      // If user selects location but no category, keep existing or default to hotel
      const existingCategory = searchParams.get("category");
      if (existingCategory) {
        params.set("category", existingCategory);
      } else {
        params.set("category", "hotel");
      }
    } else if (selectedCategoryButtons.length > 0) {
      // Use selected category button
      const categoryMap = {
        'hotel': 'hotel',
        'restaurant': 'restaurant',
        'shortlet': 'shortlet',
        'vendor': 'services'
      };
      const actualCategory = categoryMap[selectedCategoryButtons[0]] || selectedCategoryButtons[0];
      params.set("category", actualCategory);
    }
    
    // ✅ FIX: Handle multiple locations - send only first to backend
    if (newFilters.locations.length > 0) {
      // Use proper case for the location sent to backend
      params.set("location.area", normalizeLocationForBackend(newFilters.locations[0]));
    } else {
      // Remove location filter if no locations selected
      params.delete("location.area");
    }
    
    // Keep other parameters
    for (const [key, value] of searchParams.entries()) {
      if (!["category", "location", "location.area", "q"].includes(key)) {
        params.set(key, value);
      }
    }
    
    setSearchParams(params);
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
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };
    setActiveFilters(resetFilters);
    setSelectedCategoryButtons([]);
    
    // Clear URL parameters but keep search query
    const params = new URLSearchParams();
    if (searchQuery) {
      if (looksLikeLocation(searchQuery)) {
        params.set("location.area", searchQuery);
      } else {
        params.set("q", searchQuery);
      }
    }
    setSearchParams(params);
  };

  // ✅ FIXED: Handle category button clicks
  const handleCategoryButtonClick = (categoryKey) => {
    const params = new URLSearchParams();
    
    // Keep existing search query if any
    if (searchQuery) {
      if (looksLikeLocation(searchQuery)) {
        params.set("location.area", searchQuery);
      } else {
        params.set("q", searchQuery);
      }
    }
    
    // Keep existing location filters (if any)
    if (activeFilters.locations.length > 0) {
      params.set("location.area", activeFilters.locations[0]);
    }
    
    // Set category
    const categoryMap = {
      'hotel': 'hotel',
      'restaurant': 'restaurant',
      'shortlet': 'shortlet',
      'vendor': 'services'
    };
    
    const actualCategory = categoryMap[categoryKey] || categoryKey;
    const newSelectedCategories = [categoryKey];
    setSelectedCategoryButtons(newSelectedCategories);
    
    // Always set category in URL
    params.set("category", actualCategory);
    
    setSearchParams(params);
    
    const displayName = getCategoryDisplayName(actualCategory);
    const updatedFilters = {
      ...activeFilters,
      categories: [displayName],
    };
    setActiveFilters(updatedFilters);
    
    console.log("🔧 Category button clicked:", {
      categoryKey,
      actualCategory,
      displayName,
      params: params.toString()
    });
  };

  const getPageTitle = () => {
    const locationParams = [];
    const categoryParams = [];

    if (activeFilters.locations.length > 0) {
      locationParams.push(...activeFilters.locations);
    }

    if (activeFilters.categories.length > 0) {
      categoryParams.push(...activeFilters.categories);
    }

    if (searchQuery) {
      if (locationParams.length > 0 || categoryParams.length > 0) {
        let parts = [];
        if (categoryParams.length > 0) parts.push(categoryParams.join(", "));
        if (locationParams.length > 0) parts.push(locationParams.join(", "));
        return `Search Results for "${searchQuery}" in ${parts.join(" • ")}`;
      }
      return `Search Results for "${searchQuery}"`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `${categoriesText} in ${locationParams.join(", ")}`;
      }
      return `${categoriesText} in Ibadan`;
    } else if (locationParams.length > 0) {
      return `Places in ${locationParams.join(", ")}`;
    } else {
      return "All Places in Ibadan";
    }
  };

  const getPageDescription = () => {
    const locationParams = [];
    const categoryParams = [];

    if (activeFilters.locations.length > 0) {
      locationParams.push(...activeFilters.locations);
    }

    if (activeFilters.categories.length > 0) {
      categoryParams.push(...activeFilters.categories);
    }

    if (searchQuery) {
      if (locationParams.length > 0 || categoryParams.length > 0) {
        let parts = [];
        if (categoryParams.length > 0) parts.push(categoryParams.join(", "));
        if (locationParams.length > 0) parts.push(locationParams.join(", "));
        return `Find the best places in ${parts.join(" • ")} matching "${searchQuery}".`;
      }
      return `Find the best places in Ibadan matching "${searchQuery}".`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `Browse the best ${categoriesText.toLowerCase()} places in ${locationParams.join(", ")}.`;
      }
      return `Browse the best ${categoriesText.toLowerCase()} places in Ibadan.`;
    } else if (locationParams.length > 0) {
      return `Discover amazing places in ${locationParams.join(", ")}.`;
    } else {
      return "Browse all places in Ibadan.";
    }
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

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil((apiResponse?.results || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = listings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const groupedListings = useMemo(() => {
    const grouped = {};
    listings.forEach((item) => {
      const cat = getCategoryDisplayName(item.category || "Other");
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    });
    return grouped;
  }, [listings]);

  const activeCategory = activeFilters.categories.length > 0 
    ? activeFilters.categories[0] 
    : "All Categories";

  if (loading && isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex space-x-1 mb-4">
            <div className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">Loading results...</p>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gray-50 font-manrope w-full overflow-x-hidden">
      <Meta
        title={`${getPageTitle()} | Ajani Directory`}
        description={getPageDescription()}
        url={`https://ajani.ai/search-results?${searchParams.toString()}`}
        image="https://ajani.ai/images/search-og.jpg"
      />

      <div className="hidden md:block">
        <Header />
      </div>

      <main
        className="pb-8 md:mt-14 w-full mx-auto max-w-[100vw]"
        style={{
          paddingLeft: isMobile ? "0.75rem" : "1rem",
          paddingRight: isMobile ? "0.75rem" : "1rem",
        }}
      >
        <div
          className="z-30 py-4 md:py-6 relative w-full"
          style={{
            zIndex: 50,
            width: "100%",
            marginLeft: "0",
            marginRight: "0",
            paddingLeft: "0",
            paddingRight: "0",
          }}
          id="search-section"
        >
          <div
            style={{
              paddingLeft: isMobile ? "0" : "0",
              paddingRight: isMobile ? "0" : "0",
            }}
          >
            <div className="flex items-center gap-3">
              <BackButton className="md:hidden" />
              <div className="flex-1">
                <div className="flex justify-center w-full">
                  <div
                    className="w-full relative max-w-[100vw]"
                    ref={searchContainerRef}
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <div className="flex items-center justify-center w-full">
                        <div
                          className="flex items-center bg-gray-200 rounded-full shadow-sm relative z-40 w-full"
                          style={{ maxWidth: isMobile ? "100%" : "27%" }}
                        >
                          <div className="pl-3 sm:pl-4 text-gray-500">
                            <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            placeholder={activeCategory === "All Categories" 
                              ? "Search by area, category, or name..." 
                              : `Search ${activeCategory.toLowerCase()}...`}
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={handleSearchFocus}
                            className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope w-full"
                            autoFocus={false}
                            aria-label="Search input"
                            role="searchbox"
                          />
                          {localSearchQuery && (
                            <button
                              type="button"
                              onClick={handleClearSearch}
                              className="p-1 mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                              aria-label="Clear search"
                            >
                              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-6">
            <CategoryButtons
              selectedCategories={selectedCategoryButtons}
              onCategoryClick={handleCategoryButtonClick}
            />
          </div>
        </div>

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

        <div
          className="flex flex-col lg:flex-row gap-6 w-full"
        >
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

          <div
            className="lg:w-3/4 w-full"
            ref={resultsRef}
          >
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
                          {apiResponse?.results || 0} {apiResponse?.results === 1 ? "place" : "places"} found
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMobileFilters}
                          className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
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
                        {apiResponse?.results || 0} {apiResponse?.results === 1 ? "place" : "places"} found
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

            <div
              className="space-y-6 w-full"
            >
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
                  {searchQuery || activeFilters.categories.length > 0 || activeFilters.locations.length > 0 ? (
                    <>
                      {isMobile ? (
                        <div
                          className="space-y-4 w-full"
                        >
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
                                    category={listing.category || "general"}
                                    isMobile={isMobile}
                                  />
                                ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full"
                        >
                          {currentListings.map((listing, index) => (
                            <SearchResultBusinessCard
                              key={listing._id || index}
                              item={listing}
                              category={listing.category || "general"}
                              isMobile={isMobile}
                            />
                          ))}
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8 w-full">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-lg border ${
                              currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50"
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
                                    : "bg-white text-gray-700 hover:bg-gray-50"
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
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    Object.entries(groupedListings).map(([catName, items]) => {
                      const categorySlug = catName
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                      const sectionId = `${categorySlug}-section`;
                      return (
                        <CategorySection
                          key={catName}
                          title={catName}
                          items={items}
                          sectionId={sectionId}
                          isMobile={isMobile}
                          category={catName}
                        />
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        img { max-width: 100%; height: auto; display: block; }
        .search-result-card {
          min-width: 165px; max-width: 165px; height: 280px;
          min-height: 280px; max-height: 280px;
        }
        @media (min-width: 768px) {
          .search-result-card {
            min-width: 240px; max-width: 240px; height: 320px;
            min-height: 320px; max-height: 320px;
          }
        }
        .scrollbar-hide {
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .line-clamp-2 {
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInSharp {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOutSharp {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }
        .animate-slideInUp { animation: slideInUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
        .animate-fadeInSharp { animation: fadeInSharp 0.2s ease-out forwards; }
        .animate-fadeOutSharp { animation: fadeOutSharp 0.2s ease-in forwards; }
        @media (max-width: 767px) {
          .sticky {
            position: sticky; top: 0; left: 0; right: 0;
            z-index: 50; background: #f9fafb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          main { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        }
        @media (min-width: 1024px) {
          select.bg-transparent {
            background: transparent !important; border: none !important;
            box-shadow: none !important;
          }
          select.bg-transparent:hover { color: #00065a; }
        }
        @media (min-width: 768px) {
          main { padding-left: 1rem !important; paddingRight: 1rem !important; }
        }
        .category-button { transition: all 0.2s ease; }
        .category-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .category-button.selected {
          box-shadow: 0 4px 12px rgba(6, 244, 159, 0.15);
        }
        .category-button-mobile { min-height: 42px; }
        .category-button-desktop { min-height: 56px; }
      `}</style>
    </div>
  );
};

export default SearchResults;