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
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { PiSliders } from "react-icons/pi";
import { MdFavoriteBorder } from "react-icons/md";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";
import { createPortal } from "react-dom";
import axiosInstance from "../lib/axios";

// ================== HELPER FUNCTIONS ==================

// Helper to check if search query looks like a location
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

// Helper to normalize location text for matching
const normalizeLocation = (location) => {
  if (!location) return '';
  
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

// ================== CUSTOM BACKEND HOOK ==================

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

// Helper function to get location display name
const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations" || location === "All")
    return "All Locations";

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

// Helper function to get location breakdown
const getLocationBreakdown = (listings) => {
  const locationCounts = {};
  listings.forEach((item) => {
    const location = getLocationDisplayName(item.location?.area || item.area || "Unknown");
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to get category breakdown for a specific location
const getCategoryBreakdownForLocation = (listings, targetLocation) => {
  const filteredListings = listings.filter((item) => {
    const itemLocation = getLocationDisplayName(item.location?.area || item.area || "Unknown");
    return itemLocation.toLowerCase() === targetLocation.toLowerCase();
  });

  const categoryCounts = {};
  filteredListings.forEach((item) => {
    const category = getCategoryDisplayName(item.category || "other.other");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes("hotel") || cat.includes("accommodation")) return faBuilding;
  if (cat.includes("shortlet") || cat.includes("apartment")) return faHome;
  if (cat.includes("weekend") || cat.includes("event")) return faCalendarWeek;
  if (cat.includes("restaurant") || cat.includes("food")) return faUtensils;
  if (cat.includes("tourist") || cat.includes("attraction")) return faLandmark;
  if (cat.includes("services")) return faTools;
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
  if (cat.includes("services")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  if (cat.includes("hall") || cat.includes("weekend"))
    return [FALLBACK_IMAGES.hall];
  return [FALLBACK_IMAGES.default];
};

// ================== DESKTOP SEARCH SUGGESTIONS COMPONENT ==================

const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
}) => {
  const suggestionsRef = useRef(null);

  // Generate suggestions
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, listings);
  }, [searchQuery, listings]);

  // Handle click outside
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

  // Get the search container width from the search bar position
  const containerWidth = searchBarPosition?.width || 0;

  return createPortal(
    <>
      {/* Semi-transparent backdrop - allows page content to be visible */}
      <div
        className="fixed inset-0 bg-black/5 z-[9980] animate-fadeIn"
        onClick={onClose}
      />

      <div
        ref={suggestionsRef}
        className="absolute bg-white rounded-xl shadow-xl border border-gray-200 z-[9981] animate-scaleIn overflow-hidden"
        style={{
          left: `${searchBarPosition?.left || 0}px`,
          top: `${(searchBarPosition?.bottom || 0) + 8}px`,
          width: `${containerWidth}px`,
          maxHeight: "70vh",
        }}
      >
        {/* Suggestions Header */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faSearch}
                className="w-4 h-4 text-gray-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Results for "{searchQuery}"
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close suggestions"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggestions List - Scrollable with max height */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(70vh - 48px)" }}
        >
          <div className="p-4">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onSuggestionClick(suggestion.action());
                  onClose();
                }}
                className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-lg border border-gray-100 transition-all duration-200 hover:shadow-sm mb-2 last:mb-0 group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      suggestion.type === "category"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        suggestion.type === "category"
                          ? faFilter
                          : faMapMarkerAlt
                      }
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {suggestion.title}
                      </h4>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                          suggestion.type === "category"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {suggestion.count}{" "}
                        {suggestion.count === 1 ? "place" : "places"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {suggestion.description}
                    </p>

                    {/* Dynamic Breakdown */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        {suggestion.breakdownText}
                      </p>

                      {/* Breakdown Tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.breakdown.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                              suggestion.type === "category"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {suggestion.type === "location" && (
                              <FontAwesomeIcon
                                icon={getCategoryIcon(item.category)}
                                className="w-3 h-3"
                              />
                            )}
                            <span className="font-medium">
                              {item.category || item.location} ({item.count})
                            </span>
                          </div>
                        ))}
                        {suggestion.breakdown.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{suggestion.breakdown.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="w-3 h-3 text-blue-600"
                    />
                  </div>
                </div>
              </button>
            ))}

            {/* Show All Results Button */}
            <button
              onClick={() => {
                const params = new URLSearchParams();
                params.append("q", searchQuery.trim());
                onSuggestionClick(`/search-results?${params.toString()}`);
                onClose();
              }}
              className="w-full mt-4 p-4 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-bold">Show all results</p>
                  <p className="text-xs opacity-90 mt-1">
                    Search across all categories and locations
                  </p>
                </div>
                <div className="transform group-hover:translate-x-1 transition-transform">
                  <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// ================== SEARCH SUGGESTIONS HELPER FUNCTIONS ==================

const generateSearchSuggestions = (query, listings) => {
  if (!query.trim() || !listings.length) return [];

  const queryLower = query.toLowerCase().trim();
  const suggestions = [];

  // Get unique categories and locations
  const uniqueCategories = [
    ...new Set(
      listings
        .map((item) => item.category)
        .filter((cat) => cat && cat.trim() !== "")
        .map((cat) => cat.trim())
    ),
  ];

  const uniqueLocations = [
    ...new Set(
      listings
        .map((item) => item.location?.area || item.area)
        .filter((loc) => loc && loc.trim() !== "")
        .map((loc) => loc.trim())
    ),
  ];

  // 1. First check for EXACT matches (highest priority)
  // Exact category matches
  const exactCategoryMatches = uniqueCategories
    .filter((category) => {
      const displayName = getCategoryDisplayName(category).toLowerCase();
      return displayName === queryLower;
    })
    .map((category) => {
      const categoryListings = listings.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === category.toLowerCase()
      );

      const locationBreakdown = getLocationBreakdown(categoryListings);
      const totalPlaces = categoryListings.length;

      return {
        type: "category",
        title: getCategoryDisplayName(category),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found`,
        breakdownText: `${totalPlaces} ${getCategoryDisplayName(category)} options available`,
        breakdown: locationBreakdown.slice(0, 3),
        action: () => {
          // Navigate directly to category page for exact matches
          const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
          return `/category/${categorySlug}`;
        },
      };
    });

  // Exact location matches
  const exactLocationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName === queryLower;
    })
    .map((location) => {
      const locationListings = listings.filter(
        (item) => {
          const itemLocation = item.location?.area || item.area;
          return itemLocation && itemLocation.toLowerCase() === location.toLowerCase();
        }
      );

      const categoryBreakdown = getCategoryBreakdownForLocation(
        locationListings,
        location
      );
      const totalPlaces = locationListings.length;

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found`,
        breakdownText: `Places in ${getLocationDisplayName(location)}`,
        breakdown: categoryBreakdown.slice(0, 4),
        action: () => {
          const params = new URLSearchParams();
          params.append("location", location);
          return `/search-results?${params.toString()}`;
        },
      };
    });

  // 2. If there are exact matches, return ONLY those
  if (exactCategoryMatches.length > 0 || exactLocationMatches.length > 0) {
    return [...exactCategoryMatches, ...exactLocationMatches]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }

  // 3. If no exact matches, show general suggestions
  const categoryMatches = uniqueCategories
    .filter((category) => {
      const displayName = getCategoryDisplayName(category).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((category) => {
      const categoryListings = listings.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === category.toLowerCase()
      );

      const locationBreakdown = getLocationBreakdown(categoryListings);
      const totalPlaces = categoryListings.length;

      return {
        type: "category",
        title: getCategoryDisplayName(category),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found`,
        breakdownText: `${totalPlaces} ${getCategoryDisplayName(category)} options available`,
        breakdown: locationBreakdown.slice(0, 3),
        action: () => {
          const params = new URLSearchParams();
          params.append("category", category);
          return `/category/${category.toLowerCase().replace(/\s+/g, '-')}`;
        },
      };
    });

  const locationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((location) => {
      const locationListings = listings.filter(
        (item) => {
          const itemLocation = item.location?.area || item.area;
          return itemLocation && itemLocation.toLowerCase() === location.toLowerCase();
        }
      );

      const categoryBreakdown = getCategoryBreakdownForLocation(
        locationListings,
        location
      );
      const totalPlaces = locationListings.length;

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found`,
        breakdownText: `Places in ${getLocationDisplayName(location)}`,
        breakdown: categoryBreakdown.slice(0, 4),
        action: () => {
          const params = new URLSearchParams();
          params.append("location", location);
          return `/search-results?${params.toString()}`;
        },
      };
    });

  // Combine and sort by relevance
  return [...categoryMatches, ...locationMatches]
    .sort((a, b) => {
      // Exact word matches first
      const aExact = a.title.toLowerCase() === queryLower;
      const bExact = b.title.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Starts with query
      const aStartsWith = a.title.toLowerCase().startsWith(queryLower);
      const bStartsWith = b.title.toLowerCase().startsWith(queryLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Then by count
      return b.count - a.count;
    })
    .slice(0, 8);
};

// ================== MOBILE SEARCH MODAL ==================

const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate suggestions
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(inputValue, listings);
  }, [inputValue, listings]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onTyping(value);
  };

  // Handle clear input
  const handleClearInput = () => {
    setInputValue("");
    onTyping("");
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (action) => {
    onSuggestionClick(action);
    handleClose();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const params = new URLSearchParams();
      params.append("q", inputValue.trim());
      onSuggestionClick(`/search-results?${params.toString()}`);
      handleClose();
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 200);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  // Prevent body scroll when modal is open
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

  // Sync inputValue with searchQuery prop
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Don't render if not visible
  if (!isVisible && !isExiting) return null;

  return createPortal(
    <>
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] ${
          isExiting ? "animate-fadeOutSharp" : "animate-fadeInSharp"
        }`}
        onClick={handleClose}
        style={{
          opacity: isExiting ? 0 : 1,
          transition: "opacity 0.2s ease-out",
        }}
      />

      {/* Modal Content with fade animation */}
      <div
        ref={modalRef}
        className={`fixed inset-0 bg-white z-[9991] ${
          isExiting ? "animate-fadeOutSharp" : "animate-fadeInSharp"
        } flex flex-col`}
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting ? "translateY(-10px)" : "translateY(0)",
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>
            <div className="flex-1 relative flex justify-center">
              <div
                className="w-full"
                style={{ width: isMobile ? "100%" : "30%", maxWidth: "600px" }}
              >
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Search by area, category, or name..."
                    autoFocus
                  />
                  {inputValue && (
                    <button
                      onClick={handleClearInput}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            <>
              {/* Suggestions Section */}
              {suggestions.length > 0 ? (
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                      Top Suggestions ({suggestions.length})
                    </h3>

                    {/* Suggestions List */}
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleSuggestionClick(suggestion.action())
                          }
                          className="w-full text-left p-4 bg-white hover:bg-blue-50 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                suggestion.type === "category"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={
                                  suggestion.type === "category"
                                    ? faFilter
                                    : faMapMarkerAlt
                                }
                                className="w-5 h-5"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {suggestion.title}
                                </h4>
                                <span
                                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                    suggestion.type === "category"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {suggestion.count}{" "}
                                  {suggestion.count === 1 ? "place" : "places"}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {suggestion.description}
                              </p>

                              {/* Dynamic Breakdown */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">
                                  {suggestion.breakdownText}
                                </p>

                                {/* Breakdown Tags */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {suggestion.breakdown.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                                        suggestion.type === "category"
                                          ? "bg-blue-50 text-blue-700"
                                          : "bg-green-50 text-green-700"
                                      }`}
                                    >
                                      {suggestion.type === "location" && (
                                        <FontAwesomeIcon
                                          icon={getCategoryIcon(item.category)}
                                          className="w-3 h-3"
                                        />
                                      )}
                                      <span className="text-xs font-medium">
                                        {item.category || item.location} (
                                        {item.count})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* View All Button */}
                          <div className="flex items-center justify-end mt-2">
                            <span className="text-sm text-blue-600 font-medium">
                              View all {suggestion.count}{" "}
                              {suggestion.count === 1 ? "place" : "places"}
                            </span>
                            <FontAwesomeIcon
                              icon={faChevronRight}
                              className="ml-1 text-blue-600 w-3 h-3"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show All Results Button */}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append("q", inputValue.trim());
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      handleClose();
                    }}
                    className="w-full p-4 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-bold text-lg">
                          Show all results for "{inputValue}"
                        </p>
                        <p className="text-sm opacity-90 mt-1">
                          Search across all categories and locations
                        </p>
                      </div>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="w-5 h-5"
                      />
                    </div>
                  </button>
                </div>
              ) : (
                /* No Results Message */
                <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="w-10 h-10 text-gray-400"
                    />
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mb-3">
                    No matches found for "{inputValue}"
                  </p>
                  <p className="text-sm text-gray-600 text-center max-w-xs mb-8">
                    Try searching with different keywords or browse categories
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append("q", inputValue.trim());
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      handleClose();
                    }}
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Search anyway
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-10 h-10 text-gray-400"
                />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-3">
                Start typing to search
              </p>
              <p className="text-sm text-gray-600 text-center max-w-xs">
                Search for categories, locations, or places in Ibadan
              </p>

              {/* Popular Search Tips */}
              <div className="mt-8 w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Try searching for:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Hotels",
                    "Restaurants",
                    "Ibadan",
                    "Shortlets",
                    "Tourism",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setInputValue(term);
                        onTyping(term);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
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

// Custom hook for tracking favorite status
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
    // Initial check
    checkFavoriteStatus();

    // Create a custom event listener
    const handleSavedListingsChange = () => {
      checkFavoriteStatus();
    };

    // Listen for storage events
    const handleStorageChange = (e) => {
      if (e.key === "userSavedListings") {
        checkFavoriteStatus();
      }
    };

    // Add event listeners
    window.addEventListener("savedListingsUpdated", handleSavedListingsChange);
    window.addEventListener("storage", handleStorageChange);

    // Poll for changes (fallback)
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

// Check if user is authenticated
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
  const [imageHeight, setImageHeight] = useState(170);
  const isFavorite = useIsFavorite(item._id || item.id);
  const cardRef = useRef(null);
  
  // Use auth status hook
  const isAuthenticated = useAuthStatus();

  // Set consistent height based on device - FIXED: Use fixed values
  useEffect(() => {
    // Always use fixed heights to prevent dimension changes
    setImageHeight(isMobile ? 150 : 170);
  }, [isMobile]);

  // FIXED: Add a resize listener to maintain dimensions
  useEffect(() => {
    const handleResize = () => {
      // Re-set the fixed height on resize
      setImageHeight(window.innerWidth < 768 ? 150 : 170);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const locationText = item.location?.area || item.area || "Ibadan";
  const rating = item.rating || "4.9";
  const businessName = item.title || item.name || "Business Name";
  // FIX: Get subcategory (word after the dot)
  const subcategory = getSubcategory(category);

  const handleCardClick = () => {
    if (item._id || item.id) {
      navigate(`/vendor-detail/${item._id || item.id}`);
    } else {
      navigate(`/category/${category}`);
    }
  };

  // Toast Notification Function
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
          type === "success" ? "text-green-600" : "text-blue-600"
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

  // Handle favorite click
  const handleFavoriteClick = useCallback(
    async (e) => {
      e.stopPropagation();

      if (isProcessing) return;
      setIsProcessing(true);

      try {
        // Check if user is signed in using proper auth check
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
      subcategory,
      locationText,
      showToast,
      navigate,
      isAuthenticated,
    ]
  );

  // Check for pending saves after login
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
        font-manrope relative group flex flex-col h-full
        ${isMobile ? "w-[165px]" : "w-full"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
      style={{
        height: isMobile ? "280px" : "320px",
        minHeight: isMobile ? "280px" : "320px",
        maxHeight: isMobile ? "280px" : "320px",
        minWidth: isMobile ? "165px" : "240px",
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-xl flex-shrink-0"
        style={{
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
            height: "100%",
            width: "100%",
            objectFit: "cover",
            minHeight: `${imageHeight}px`,
            maxHeight: `${imageHeight}px`,
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
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <MdFavoriteBorder className="text-[#00d1ff] w-4 h-4" />
          )}
        </button>
      </div>

      {/* Text Content */}
      <div 
        className={`flex-1 ${isMobile ? "p-1.5" : "p-2.5"} flex flex-col`}
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

            {/* Combined Price, Per Text, and Ratings on same line */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 flex-wrap">
                {/* Price and Per Text */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xs md:text-xs font-manrope text-gray-900">
                    {priceText}
                  </span>
                  <span className="text-[9px] md:text-xs text-gray-600">
                    {perText}
                  </span>
                </div>
              </div>

              {/* Ratings on the right */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-gray-800 text-[9px] md:text-xs">
                  <FontAwesomeIcon icon={faStar} className="text-black" />
                  <span className="font-semibold text-black">{rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Category tag and Saved indicator */}
          <div className="flex items-center justify-between mt-auto pt-2">
            {/* Category tag - FIX: Show subcategory */}
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

// ================== CATEGORY BREAKDOWN BADGES COMPONENT ==================

const CategoryBreakdownBadges = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  const topCategories = categories.slice(0, 3);

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2 font-medium">Places include:</p>
      <div className="flex flex-wrap gap-2">
        {topCategories.map(({ category, count }, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200"
          >
            <FontAwesomeIcon
              icon={getCategoryIcon(category)}
              className="text-xs text-gray-600"
            />
            <span className="text-xs font-medium text-gray-700">
              {getSubcategory(category)}
            </span>
            <span className="text-xs font-bold text-blue-600">({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================== CATEGORY BUTTONS COMPONENT ==================

const CategoryButtons = ({ selectedCategories, onCategoryClick }) => {
  // Only these 4 categories + All Categories
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
      icon: faTools 
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
        {/* Mobile: Horizontal scroll */}
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
                      ? 'bg-[#00065A] text-white shadow-sm' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                    ${button.key === 'all' 
                      ? 'text-sm font-semibold' 
                      : 'text-xs'
                    }
                  `}
                  style={{
                    minWidth: 'auto',
                  }}
                >
                  <FontAwesomeIcon 
                    icon={button.icon} 
                    className={`${isSelected ? 'text-white' : 'text-gray-500'} text-xs`}
                  />
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
                      ? 'bg-[#00065A] text-white shadow-sm' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <FontAwesomeIcon 
                    icon={button.icon} 
                    className={`${isSelected ? 'text-white' : 'text-gray-500'} text-sm`}
                  />
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

// ================== FILTER SIDEBAR ==================

const FilterSidebar = ({
  onFilterChange,
  allLocations,
  allCategories,
  currentFilters,
  onClose,
  isMobileModal = false,
  isDesktopModal = false,
  currentSearchQuery = "",
  onDynamicFilterApply,
  isInitialized,
  isMobile,
}) => {
  const [localFilters, setLocalFilters] = useState(
    currentFilters || {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
    }
  );

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: false,
    price: true,
    rating: true,
    sort: true,
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const uniqueLocationDisplayNames = React.useMemo(() => {
    const locations = [
      ...new Set(allLocations.map((loc) => getLocationDisplayName(loc))),
    ];
    return locations.sort();
  }, [allLocations]);

  const uniqueCategoryDisplayNames = React.useMemo(() => {
    const categories = [
      ...new Set(allCategories.map((cat) => getCategoryDisplayName(cat))),
    ];
    return categories.sort();
  }, [allCategories]);

  const filteredLocationDisplayNames = React.useMemo(() => {
    if (!locationSearch.trim()) return uniqueLocationDisplayNames;
    const searchTerm = locationSearch.toLowerCase().trim();
    return uniqueLocationDisplayNames.filter((location) =>
      location.toLowerCase().includes(searchTerm)
    );
  }, [uniqueLocationDisplayNames, locationSearch]);

  const filteredCategoryDisplayNames = React.useMemo(() => {
    if (!categorySearch.trim()) return uniqueCategoryDisplayNames;
    const searchTerm = categorySearch.toLowerCase().trim();
    return uniqueCategoryDisplayNames.filter((category) =>
      category.toLowerCase().includes(searchTerm)
    );
  }, [uniqueCategoryDisplayNames, categorySearch]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Sync local filters when currentFilters prop changes
  useEffect(() => {
    if (isInitialized && currentFilters) {
      setLocalFilters(currentFilters);
    }
  }, [currentFilters, isInitialized]);

  // Updated filter handlers with immediate application for desktop non-modal
  const handleLocationChange = (location) => {
    const updatedFilters = {
      ...localFilters,
      locations: localFilters.locations.includes(location)
        ? localFilters.locations.filter((l) => l !== location)
        : [...localFilters.locations, location],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleCategoryChange = (category) => {
    const updatedFilters = {
      ...localFilters,
      categories: localFilters.categories.includes(category)
        ? localFilters.categories.filter((c) => c !== category)
        : [...localFilters.categories, category],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleRatingChange = (stars) => {
    const updatedFilters = {
      ...localFilters,
      ratings: localFilters.ratings.includes(stars)
        ? localFilters.ratings.filter((s) => s !== stars)
        : [...localFilters.ratings, stars],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
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

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
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

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleSelectAllCategories = () => {
    const updatedFilters = {
      ...localFilters,
      categories:
        localFilters.categories.length === uniqueCategoryDisplayNames.length
          ? []
          : [...uniqueCategoryDisplayNames],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    onClose();
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

      {/* LOCATION SECTION WITH SEARCH */}
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
                        style={{
                          flex: 1,
                        }}
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

      {/* CATEGORY SECTION */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex justify-between items-center mb-3"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-green-500" />
            <h4 className="font-semibold text-gray-900 text-base">
              Category
            </h4>
            {localFilters.categories.length > 0 && (
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                {localFilters.categories.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.category ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.category && (
          <>
            <div className="mb-3">
              <div className="relative mb-3">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
                {categorySearch && (
                  <button
                    onClick={() => setCategorySearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                )}
              </div>
              <div className="flex justify-between mb-2">
                <button
                  onClick={handleSelectAllCategories}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {localFilters.categories.length ===
                  uniqueCategoryDisplayNames.length
                    ? "Clear All Categories"
                    : "Select All Categories"}
                </button>
                <span className="text-xs text-gray-500">
                  {filteredCategoryDisplayNames.length} categories
                </span>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto pr-1">
              {filteredCategoryDisplayNames.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No categories found matching "{categorySearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredCategoryDisplayNames.map((category, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors"
                      />
                      <span
                        className={`text-sm group-hover:text-[#06EAFC] transition-colors truncate ${
                          localFilters.categories.includes(category)
                            ? "text-green-700 font-medium"
                            : "text-gray-700"
                        }`}
                        style={{
                          flex: 1,
                        }}
                      >
                        {category}
                      </span>
                      {localFilters.categories.includes(category) && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-sm text-green-600"
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {localFilters.categories.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                  Selected: {localFilters.categories.slice(0, 3).join(", ")}
                  {localFilters.categories.length > 3 &&
                    ` +${localFilters.categories.length - 3} more`}
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

                    // For desktop non-modal, apply immediately
                    if (!isMobileModal && !isDesktopModal && !isMobile) {
                      onFilterChange(updatedFilters);
                    }
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

      {/* RATING SECTION */}
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

                    // For desktop non-modal, apply immediately
                    if (!isMobileModal && !isDesktopModal && !isMobile) {
                      onFilterChange(updatedFilters);
                    }
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
    </div>
  );

  // Mobile Modal - Fullscreen
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
          {/* Main content with minimal padding */}
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

          {/* Mobile Action Buttons */}
          <div
            className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            style={{
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
            }}
          >
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-3.5 text-base font-bold bg-[#06EAFC] text-white rounded-xl hover:bg-[#05d9eb] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              style={{
                fontSize: "16px",
              }}
            >
              <FontAwesomeIcon icon={faCheck} className="text-base" />
              Apply Filter
            </button>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }

  // Desktop Modal - Fullscreen
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

            {/* Modal Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg mt-8">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-3 text-sm font-medium bg-[#06EAFC] text-white rounded-xl hover:bg-[#05d9eb] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} />
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }

  // Regular sidebar (not modal) - NO APPLY BUTTON for desktop
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
      {sidebarContent}
      {/* NO Apply button for desktop - filters apply immediately */}
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
  // FIX: Get subcategory for section title
  const subcategoryTitle = getSubcategory(title) || title;

  // Check scroll position to update arrow states
  const checkScrollPosition = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeftArrow(scrollLeft > 0);
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
    setShowRightArrow(!isAtEnd);
  };

  // Initialize and add scroll listener
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
          {/* Left arrow */}
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

          {/* Right arrow */}
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
          {/* Spacer for last card visibility */}
          <div className="flex-shrink-0" style={{ width: "8px" }}></div>
        </div>
      </div>
    </section>
  );
};

// ================== FILTER PILL ==================

const FilterPill = ({ type, label, value, onRemove }) => {
  const getPillColor = (type) => {
    switch (type) {
      case "location":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "category":
        return "bg-green-100 text-green-800 border-green-200";
      case "price":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rating":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "location":
        return faMapMarkerAlt;
      case "category":
        return faFilter;
      case "price":
        return faDollarSign;
      case "rating":
        return faStar;
      default:
        return faFilter;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${getPillColor(
        type
      )} text-sm`}
    >
      <FontAwesomeIcon icon={getIcon(type)} className="text-xs" />
      <span>
        {label}: {value}
      </span>
      <button
        onClick={onRemove}
        className="ml-1 hover:opacity-70 transition-opacity"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </div>
  );
};

// ================== MAIN SEARCHRESULTS COMPONENT ==================

const SearchResults = () => {
  // ✅ Always scroll to top on page entry
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = searchParams.get("q") || "";
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
  const [selectedCategoryButtons, setSelectedCategoryButtons] = useState(["all"]);
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);

  // Use backend listings hook with EXACT location matching
  const { listings, loading, error, apiResponse } = useBackendListings(searchQuery, activeFilters);

  // CRITICAL FIX: Scroll to top on component mount and when search params change
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

  // Track search bar position for suggestions
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

    // Initial update
    updateSearchBarPosition();

    // Update on scroll and resize
    const handleScroll = () => {
      updateSearchBarPosition();
    };

    const handleResize = () => {
      updateSearchBarPosition();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, showSuggestions]);

  // Handle mobile filter apply with auto-scroll
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

  // FIXED: Extract ALL locations and categories from backend data
  useEffect(() => {
    if (!loading && !error && listings.length > 0) {
      // Extract unique locations from listings
      const uniqueLocations = [...new Set(listings.map(item => item.location?.area || item.area).filter(Boolean))];
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

  // Initialize filters from URL parameters
  useEffect(() => {
    if (!listings.length && !loading) return;

    const initialFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };

    // Collect all location parameters
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Collect all category parameters
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
    }

    // Set locations from URL params
    if (locationParams.length > 0) {
      initialFilters.locations = [...new Set(locationParams)];
    }

    // Set categories from URL params
    if (categoryParams.length > 0) {
      initialFilters.categories = [...new Set(categoryParams)];
      
      // Update selected category buttons state
      if (categoryParams.length > 0) {
        const firstCategory = categoryParams[0].toLowerCase();
        // Map category to button key
        const buttonKey = getCategoryButtonKey(firstCategory);
        setSelectedCategoryButtons([buttonKey]);
      }
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
  }, [listings.length, searchParams.toString(), loading]);

  // Helper function to get category button key from category name
  const getCategoryButtonKey = (categoryName) => {
    const catLower = categoryName.toLowerCase();
    
    if (catLower.includes("services")) return "vendor";
    if (catLower.includes("shortlet")) return "shortlet";
    if (catLower.includes("tourist")) return "tourist";
    if (catLower.includes("hotel")) return "hotel";
    if (catLower.includes("restaurant")) return "restaurant";
    
    return "all";
  };

  // Handle search change - show suggestions
  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    if (!isMobile && value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle search focus - show suggestions or open mobile modal
  const handleSearchFocus = () => {
    if (isMobile) {
      // On mobile, open the fullscreen modal
      setShowMobileSearchModal(true);
    } else if (localSearchQuery.trim().length > 0) {
      // On desktop, show suggestions if there's text
      setShowSuggestions(true);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setShowSuggestions(false);
    setShowMobileSearchModal(false);
    const params = new URLSearchParams();
    // Preserve filter parameters when clearing search
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

  // Handle dynamic filter application
  const handleDynamicFilterApply = ({
    filters,
    categories = [],
    locations = [],
    keepSearchQuery,
  }) => {
    const params = new URLSearchParams();

    // Always keep the search query if present
    if (keepSearchQuery && searchQuery) {
      params.set("q", searchQuery);
    }

    // Clear previous category parameters
    for (const [key] of params.entries()) {
      if (key.startsWith("category")) {
        params.delete(key);
      }
    }

    // Add categories to params
    categories.forEach((category, index) => {
      if (index === 0) {
        params.set("category", category);
      } else {
        params.set(`category${index + 1}`, category);
      }
    });

    // Clear previous location parameters
    for (const [key] of params.entries()) {
      if (key.startsWith("location")) {
        params.delete(key);
      }
    }

    // Add locations to params
    locations.forEach((location, index) => {
      if (index === 0) {
        params.set("location", location);
      } else {
        params.set(`location${index + 1}`, location);
      }
    });

    // Update URL
    setSearchParams(params);
    setActiveFilters(filters);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", localSearchQuery.trim());
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

  // Filter change handler - applies immediately for desktop
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);

    // For desktop, apply filters immediately by updating URL
    if (!isMobile) {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set("q", searchQuery);
      }

      // Clear previous parameters
      for (const [key] of searchParams.entries()) {
        if (key.startsWith("category") || key.startsWith("location")) {
          params.delete(key);
        }
      }

      // Add new category filters
      newFilters.categories.forEach((categoryDisplayName, index) => {
        const selectedCategory = allCategories.find(
          (cat) => getCategoryDisplayName(cat) === categoryDisplayName
        );
        if (selectedCategory) {
          if (index === 0) {
            params.set("category", selectedCategory);
          } else {
            params.set(`category${index + 1}`, selectedCategory);
          }
        }
      });

      // Add new location filters
      newFilters.locations.forEach((locationDisplayName, index) => {
        const selectedLocation = allLocations.find(
          (loc) => getLocationDisplayName(loc) === locationDisplayName
        );
        if (selectedLocation) {
          if (index === 0) {
            params.set("location", selectedLocation);
          } else {
            params.set(`location${index + 1}`, selectedLocation);
          }
        }
      });

      setSearchParams(params);
    }
  };

  // Handle suggestion click
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
    setSelectedCategoryButtons(["all"]);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    setSearchParams(params);
  };

  // Handle category button click
  const handleCategoryButtonClick = (categoryKey) => {
    const params = new URLSearchParams();
    
    // Keep existing search query if any
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    
    // Keep existing location filters
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        params.set(key, value);
      }
    }
    
    // Clear previous category parameters
    for (const [key] of searchParams.entries()) {
      if (key.startsWith("category")) {
        params.delete(key);
      }
    }
    
    // Map button keys to actual backend category values
    const categoryMap = {
      'hotel': 'hotel',
      'restaurant': 'restaurant',
      'shortlet': 'shortlet',
      'vendor': 'services' // Assuming vendor maps to services in backend
    };
    
    // If "All Categories" is clicked or already selected, clear category filter
    if (categoryKey === "all") {
      // Just update state to show "All Categories" is selected
      setSelectedCategoryButtons(["all"]);
      
      // Update filters
      const updatedFilters = {
        ...activeFilters,
        categories: [],
      };
      setActiveFilters(updatedFilters);
      
      // Update URL without category parameter
      setSearchParams(params);
    } else {
      // Get the actual backend category value
      const actualCategory = categoryMap[categoryKey] || categoryKey;
      
      // Select the new category (single selection only)
      const newSelectedCategories = [categoryKey];
      
      setSelectedCategoryButtons(newSelectedCategories);
      
      // Update URL with category parameter only if not "all"
      if (newSelectedCategories[0] !== "all") {
        params.set("category", actualCategory);
      }
      setSearchParams(params);
      
      // Update filters
      const displayName = getCategoryDisplayName(actualCategory);
      const updatedFilters = {
        ...activeFilters,
        categories: newSelectedCategories.includes("all") ? [] : [displayName],
      };
      setActiveFilters(updatedFilters);
      
      // Navigate to category page for direct access
      if (categoryKey !== "all") {
        navigate(`/category/${actualCategory}`);
      }
    }
  };

  const getPageTitle = () => {
    // Get all location parameters
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Get all category parameters
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
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
    } else if (
      activeFilters.locations.length > 0 ||
      activeFilters.categories.length > 0
    ) {
      const parts = [];
      if (activeFilters.categories.length > 0)
        parts.push(activeFilters.categories.join(", "));
      if (activeFilters.locations.length > 0)
        parts.push(activeFilters.locations.join(", "));
      return `Places in ${parts.join(" • ")}`;
    } else {
      return "All Places in Ibadan";
    }
  };

  const getPageDescription = () => {
    // Get all location parameters
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Get all category parameters
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
    }

    if (searchQuery) {
      if (locationParams.length > 0 || categoryParams.length > 0) {
        let parts = [];
        if (categoryParams.length > 0) parts.push(categoryParams.join(", "));
        if (locationParams.length > 0) parts.push(locationParams.join(", "));

        return `Find the best places in ${parts.join(
          " • "
        )} matching "${searchQuery}". Search results include hotels, restaurants, shortlets, tourist attractions, and more.`;
      }
      return `Find the best places in Ibadan matching "${searchQuery}". Search results include hotels, restaurants, shortlets, tourist attractions, and more.`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `Browse the best ${categoriesText.toLowerCase()} places in ${locationParams.join(
          ", "
        )}, Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
      }
      return `Browse the best ${categoriesText.toLowerCase()} places in Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
    } else if (locationParams.length > 0) {
      return `Discover amazing places in ${locationParams.join(
        ", "
      )}, Ibadan. Find restaurants, hotels, attractions, and more in these areas.`;
    } else if (
      activeFilters.locations.length > 0 ||
      activeFilters.categories.length > 0
    ) {
      const parts = [];
      if (activeFilters.categories.length > 0)
        parts.push(activeFilters.categories.join(", "));
      if (activeFilters.locations.length > 0)
        parts.push(activeFilters.locations.join(", "));
      return `Discover amazing places in ${parts.join(
        " • "
      )}, Ibadan. Find restaurants, hotels, attractions, and more in these areas.`;
    } else {
      return "Browse all places in Ibadan. Find hotels, restaurants, shortlets, tourist attractions, cafes, bars, services, events, and halls.";
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

  // Group by category for browsing view
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

  // CRITICAL FIX: Loading state for mobile (hide header)
  if (loading && isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Only show three dots animation */}
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
          <p className="text-sm text-gray-600">Loading results from backend...</p>
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
    <div className="min-h-screen bg-gray-50 font-manrope">
      <Meta
        title={`${getPageTitle()} | Ajani Directory`}
        description={getPageDescription()}
        url={`https://ajani.ai/search-results?${searchParams.toString()}`}
        image="https://ajani.ai/images/search-og.jpg"
      />

      {/* Hide Header on mobile only */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main
        className="pb-8 md:mt-14"
        style={{
          paddingLeft: isMobile ? "0.75rem" : "1rem",
          paddingRight: isMobile ? "0.75rem" : "1rem",
        }}
      >
        {/* Fixed Search Bar Container with Back Button */}
        <div
          className="z-30 py-4 md:py-6 relative"
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
              {/* Back Button - Show only on mobile */}
              <BackButton className="md:hidden" />

              <div className="flex-1">
                <div className="flex justify-center">
                  <div
                    className="w-full relative"
                    ref={searchContainerRef}
                    style={{
                      width: "100%",
                    }}
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <div className="flex items-center justify-center">
                        <div
                          className="flex items-center bg-gray-200 rounded-full shadow-sm relative z-40"
                          style={{
                            width: isMobile ? "100%" : "27%",
                          }}
                        >
                          <div className="pl-3 sm:pl-4 text-gray-500">
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="h-4 w-4"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Search by area, category, or name..."
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={handleSearchFocus}
                            className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope"
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
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="h-4 w-4"
                              />
                            </button>
                          )}
                        </div>

                        <div className="ml-2">
                          <button
                            type="submit"
                            className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-2.5 px-4 sm:px-6 text-sm transition-colors duration-200 whitespace-nowrap font-manrope"
                            aria-label="Perform search"
                          >
                            Search
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="mt-4 md:mt-6">
            <CategoryButtons
              selectedCategories={selectedCategoryButtons}
              onCategoryClick={handleCategoryButtonClick}
            />
          </div>
        </div>

        {/* Desktop Search Suggestions */}
        {!isMobile && (
          <DesktopSearchSuggestions
            searchQuery={localSearchQuery}
            listings={listings}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowSuggestions(false)}
            isVisible={showSuggestions && !loading}
            searchBarPosition={searchBarPosition}
          />
        )}

        {/* Mobile Search Modal */}
        {isMobile && (
          <MobileSearchModal
            searchQuery={localSearchQuery}
            listings={listings}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowMobileSearchModal(false)}
            onTyping={handleSearchChange}
            isVisible={showMobileSearchModal}
          />
        )}

        {/* Desktop Filter Modal */}
        {!isMobile && showDesktopFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onDynamicFilterApply={handleDynamicFilterApply}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            onClose={() => setShowDesktopFilters(false)}
            isDesktopModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
          />
        )}

        {/* Mobile Filter Modal */}
        {isMobile && showMobileFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onDynamicFilterApply={(data) => {
              handleDynamicFilterApply(data);
              handleMobileFilterApply();
            }}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            onClose={handleMobileFilterApply}
            isMobileModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
          />
        )}

        {/* Main Content Layout */}
        <div
          className="flex flex-col lg:flex-row gap-6"
          style={{
            width: "100%",
            marginLeft: "0",
            marginRight: "0",
            paddingLeft: "0",
            paddingRight: "0",
          }}
        >
          {/* Desktop Filter Sidebar */}
          {!isMobile && filtersInitialized && (
            <div className="lg:w-1/4">
              <FilterSidebar
                onFilterChange={handleFilterChange}
                onDynamicFilterApply={handleDynamicFilterApply}
                allLocations={allLocations}
                allCategories={allCategories}
                currentFilters={activeFilters}
                currentSearchQuery={searchQuery}
                isInitialized={filtersInitialized}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Results Content */}
          <div
            className="lg:w-3/4"
            ref={resultsRef}
            style={{
              width: "100%",
              paddingLeft: isMobile ? "0" : "0",
              paddingRight: isMobile ? "0" : "0",
            }}
          >
            {/* Page Header with Filter Button and Sort Dropdown on LG */}
            <div
              className="mb-6"
              style={{ paddingLeft: "0", paddingRight: "0" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-3">
                  {/* Mobile filter button */}
                  {isMobile && filtersInitialized && (
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
                  )}

                  {/* Title and Count */}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-[#00065A] mb-1">
                      {getPageTitle()}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {apiResponse?.results || 0} {apiResponse?.results === 1 ? "place" : "places"}{" "}
                      found
                    </p>
                  </div>
                </div>

                {/* Sort By Dropdown - Only on mobile and LG screens */}
                {(isMobile || window.innerWidth >= 1024) &&
                  filtersInitialized && (
                    <div className="flex items-center gap-2">
                      {/* LG Screen: Sort dropdown at far right edge, no background */}
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
                            <option value="relevance">
                              Sort by: Relevance
                            </option>
                            <option value="price_low">
                              Price: Low to High
                            </option>
                            <option value="price_high">
                              Price: High to Low
                            </option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name: A to Z</option>
                          </select>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="text-gray-500 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Mobile: Regular dropdown */}
                      {isMobile && filtersInitialized && (
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
                            <option value="relevance">
                              Sort by: Relevance
                            </option>
                            <option value="price_low">
                              Price: Low to High
                            </option>
                            <option value="price_high">
                              Price: High to Low
                            </option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name: A to Z</option>
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="text-gray-500 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Results Display */}
            <div
              className="space-y-6"
              style={{
                width: "100%",
                paddingLeft: "0",
                paddingRight: "0",
              }}
            >
              {listings.length === 0 && filtersInitialized && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
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
                  {searchQuery ||
                  (() => {
                    // Check if there are any location or category parameters
                    for (const [key] of searchParams.entries()) {
                      if (
                        key.startsWith("location") ||
                        key.startsWith("category")
                      )
                        return true;
                    }
                    return false;
                  })() ? (
                    <>
                      {isMobile ? (
                        <div
                          className="space-y-4"
                          style={{ paddingLeft: "0", paddingRight: "0" }}
                        >
                          {Array.from({
                            length: Math.ceil(currentListings.length / 5),
                          }).map((_, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="flex overflow-x-auto scrollbar-hide gap-2 pb-4"
                              style={{
                                width: "100%",
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
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          style={{
                            width: "100%",
                          }}
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
                        <div className="flex justify-center items-center space-x-2 mt-8">
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
                    /* Group by category for browsing */
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

      {/* Custom styles */}
      <style jsx global>{`
        /* Ensure scroll to top works properly */
        html {
          scroll-behavior: smooth;
        }

        /* Fix for image width stability */
        img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        /* FIXED: Ensure consistent card dimensions */
        .search-result-card {
          min-width: 165px;
          max-width: 165px;
          height: 280px;
          min-height: 280px;
          max-height: 280px;
        }
        
        @media (min-width: 768px) {
          .search-result-card {
            min-width: 240px;
            max-width: 240px;
            height: 320px;
            min-height: 320px;
            max-height: 320px;
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

        /* Animation for search suggestions */
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

        /* NEW: Sharp fade animations */
        @keyframes fadeInSharp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOutSharp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
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

        .animate-fadeInSharp {
          animation: fadeInSharp 0.2s ease-out forwards;
        }

        .animate-fadeOutSharp {
          animation: fadeOutSharp 0.2s ease-in forwards;
        }

        /* Additional styles for mobile */
        @media (max-width: 767px) {
          .sticky {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: #f9fafb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          /* Reduced padding for mobile */
          main {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }

        /* LG screen sort dropdown styling */
        @media (min-width: 1024px) {
          select.bg-transparent {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          select.bg-transparent:hover {
            color: #00065a;
          }
        }

        /* LG screen padding */
        @media (min-width: 768px) {
          main {
            padding-left: 1rem !important;
            paddingright: 1rem !important;
          }
        }

        /* Category button specific styles */
        .category-button {
          transition: all 0.2s ease;
        }
        
        .category-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .category-button.selected {
          box-shadow: 0 4px 12px rgba(0, 6, 90, 0.15);
        }

        /* Ensure consistent button heights */
        .category-button-mobile {
          min-height: 42px;
        }
        
        .category-button-desktop {
          min-height: 56px;
        }

        /* Scroll behavior for mobile category buttons */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;