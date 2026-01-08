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
  faChevronLeft,
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

// ================== CUSTOM BACKEND HOOK ==================

const useBackendListings = (category = null, searchQuery = '', filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  // Helper to check if search query looks like a location
  const looksLikeLocation = (query) => {
    if (!query || query.trim() === '') return false;
    
    const queryLower = query.toLowerCase().trim();
    
    const locationIndicators = [
      'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly', 'oke', 'agodi', 
      'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
      'molete', 'agbowo', 'sabo', 'bashorun', 'ondo road', 'ogbomoso', 'ife road',
      'akinyele', 'bodija market', 'dugbe market', 'mokola hill', 'sango roundabout',
      
      'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
      'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
      'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station',
      
      'ibadan', 'lagos', 'abuja', 'oyo', 'ogun', 'ondo', 'ekiti', 'osun',
      'abeokuta', 'ilorin', 'benin', 'port harcourt', 'kano', 'kaduna'
    ];
    
    const isLocation = locationIndicators.some(indicator => queryLower.includes(indicator));
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

  // Function to filter listings based on location search
  const filterByLocation = useCallback((allListings, query) => {
    if (!query.trim()) return allListings;
    
    const queryLower = query.toLowerCase().trim();
    const isLocationSearch = looksLikeLocation(query);
    
    if (!isLocationSearch) {
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
    
    const locationMatches = itemsWithLocations.filter(item => {
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
      
      for (const location of item.normalizedLocations) {
        if (location === queryLower) return true;
        if (location.includes(queryLower)) return true;
        
        const locationWords = location.split(/\s+/);
        const hasLocationWordMatch = locationWords.some(locWord => 
          locWord.length > 2 && queryLower.includes(locWord)
        );
        if (hasLocationWordMatch) return true;
        
        const hasQueryWordMatch = queryWords.some(queryWord => 
          queryWord.length > 2 && location.includes(queryWord)
        );
        if (hasQueryWordMatch) return true;
      }
      
      return false;
    });
    
    return locationMatches;
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/listings';
        const params = new URLSearchParams();
        
        // Add category filter
        if (category) {
          const categoryMap = {
            'hotel': 'hotel',
            'restaurant': 'restaurant',
            'shortlet': 'shortlet',
            'services': 'services',
            'vendor': 'services'
          };
          const backendCategory = categoryMap[category] || category;
          params.append('category', backendCategory);
        }
        
        // Add search query - but DON'T send location queries to backend
        if (searchQuery && !looksLikeLocation(searchQuery)) {
          params.append('q', searchQuery);
        }
        
        // Add location filters
        if (filters.locations && filters.locations.length > 0) {
          params.append('locations', filters.locations.join(','));
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
  }, [category, searchQuery, JSON.stringify(filters), filterByLocation]);

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

// ================== SEARCH SUGGESTIONS HELPERS ==================

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
        description: `${totalPlaces} ${totalPlaces === 1 ? "place" : "places"} found`,
        breakdownText: `${totalPlaces} ${getCategoryDisplayName(category)} options available`,
        breakdown: locationBreakdown.slice(0, 3),
        action: () => {
          const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
          return `/category/${categorySlug}`;
        },
      };
    });

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
        description: `${totalPlaces} ${totalPlaces === 1 ? "place" : "places"} found`,
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
        description: `${totalPlaces} ${totalPlaces === 1 ? "place" : "places"} found`,
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
        description: `${totalPlaces} ${totalPlaces === 1 ? "place" : "places"} found`,
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
      const aExact = a.title.toLowerCase() === queryLower;
      const bExact = b.title.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStartsWith = a.title.toLowerCase().startsWith(queryLower);
      const bStartsWith = b.title.toLowerCase().startsWith(queryLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      return b.count - a.count;
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
                <span className="text-sm font-manrope text-gray-900">
                  {priceText}
                </span>
                <span className="text-xs text-gray-600">
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

const CategoryButtons = ({ selectedCategory, onCategoryClick }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const buttonConfigs = [
    { key: "all", label: "All", displayName: "All Categories", icon: faBuilding },
    { key: "hotel", label: "Hotel", displayName: "Hotels", icon: faBuilding },
    { key: "restaurant", label: "Restaurant", displayName: "Restaurants", icon: faUtensils },
    { key: "shortlet", label: "Shortlet", displayName: "Shortlets", icon: faHome },
    { key: "vendor", label: "Vendor", displayName: "Vendors", icon: faTools }
  ];

  return (
    <div className="mt-4 md:mt-6 mb-4 md:mb-6">
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
                  style={{ minWidth: 'auto' }}
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
              const isSelected = selectedCategory === button.key;
              
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
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
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

      {/* CLEAR ALL FILTERS BUTTON */}
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
      >
        <div className="h-full overflow-y-auto p-4">
          {sidebarContent}
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
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-6 max-w-4xl mx-auto">
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

// ================== SEARCH MODALS ==================

const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
}) => {
  const suggestionsRef = useRef(null);

  const suggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, listings);
  }, [searchQuery, listings]);

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
        className="fixed inset-0 bg-transparent z-[9980]"
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
                Results for "{searchQuery}"
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
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                          suggestion.type === "category" 
                            ? "bg-blue-50 text-blue-700" 
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {suggestion.count} {suggestion.count === 1 ? "place" : "places"}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {suggestion.description}
                    </p>

                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">
                        {suggestion.breakdownText}
                      </p>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.breakdown.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                          >
                            {item.category || item.location} ({item.count})
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
                    <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                const params = new URLSearchParams();
                params.append("q", searchQuery.trim());
                onSuggestionClick(`/search-results?${params.toString()}`);
                onClose();
              }}
              className="w-full mt-3 p-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors duration-150"
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

  const suggestions = useMemo(() => {
    return generateSearchSuggestions(inputValue, listings);
  }, [inputValue, listings]);

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990] animate-fadeIn"
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
                placeholder="Search hotels, restaurants, shortlets, vendors..."
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
                              <span
                                className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${suggestion.type === "category" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}
                              >
                                {suggestion.count} {suggestion.count === 1 ? "place" : "places"}
                              </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-2">
                                {suggestion.breakdownText}
                              </p>

                              <div className="flex flex-wrap gap-1.5">
                                {suggestion.breakdown.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-xs px-2 py-1 rounded ${suggestion.type === "category" ? "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700"}`}
                                  >
                                    {item.category || item.location} ({item.count})
                                  </div>
                                ))}
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
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
                    }}
                    className="w-full mt-6 p-4 bg-gray-900 hover:bg-black text-white font-medium rounded-xl transition-colors duration-200"
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

// ================== MAIN CATEGORY RESULTS COMPONENT ==================

const CategoryResults = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = searchParams.get("q") || "";
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
  const [selectedCategoryButton, setSelectedCategoryButton] = useState(category || "all");
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);

  const { listings, loading, error, apiResponse } = useBackendListings(category, searchQuery, activeFilters);

  useEffect(() => {
    if (category) {
      setSelectedCategoryButton(category);
    } else {
      setSelectedCategoryButton("all");
    }
  }, [category]);

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
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    if (locationParams.length > 0) {
      initialFilters.locations = [...new Set(locationParams)];
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
  }, [listings.length, searchParams.toString(), loading]);

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

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);

    if (!isMobile) {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set("q", searchQuery);
      }

      for (const [key] of searchParams.entries()) {
        if (key.startsWith("location")) {
          params.delete(key);
        }
      }

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

  const handleCategoryButtonClick = (categoryKey) => {
    if (categoryKey === "all") {
      navigate("/search-results");
    } else {
      const categoryMap = {
        "Hotel": "hotel",
        "Restaurant": "restaurant",
        "Shortlet": "shortlet",
        "Vendor": "services",
      };
      
      const categorySlug = categoryMap[categoryKey] || categoryKey.toLowerCase();
      navigate(`/category/${categorySlug}`);
    }
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
      params.set("q", searchQuery);
    }
    setSearchParams(params);
  };

  const getPageTitle = () => {
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    const categoryTitle = category
      ? category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      : "All Categories";

    if (searchQuery) {
      if (locationParams.length > 0) {
        return `${categoryTitle} matching "${searchQuery}" in ${locationParams.join(", ")}`;
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
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    const categoryTitle = category
      ? category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
      : "All Categories";

    if (searchQuery) {
      if (locationParams.length > 0) {
        return `Find the best ${categoryTitle.toLowerCase()} in ${locationParams.join(", ")} matching "${searchQuery}". Browse prices, reviews, and book directly.`;
      }
      return `Find the best ${categoryTitle.toLowerCase()} in Ibadan matching "${searchQuery}". Browse prices, reviews, and book directly.`;
    } else if (locationParams.length > 0) {
      return `Discover amazing ${categoryTitle.toLowerCase()} in ${locationParams.join(", ")}, Ibadan. Find top-rated places, compare prices, and book directly.`;
    } else {
      return `Find the best ${categoryTitle.toLowerCase()} in Ibadan. Browse prices, reviews, and book directly.`;
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
  const currentListings = listings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading && isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex space-x-1 mb-4">
            <div className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
        url={`https://ajani.ai/category/${category}?${searchParams.toString()}`}
        image="https://ajani.ai/images/category-og.jpg"
      />

      <div className="hidden md:block">
        <Header />
      </div>

      <main className="pb-8 md:mt-14 px-4 sm:px-6">
        {/* Search Section */}
        <div className="py-4 md:py-6 relative" id="search-section">
          <div className="flex items-center gap-3">
            <BackButton className="md:hidden" />

            <div className="flex-1">
              <div className="flex justify-center">
                <div className="w-full relative" ref={searchContainerRef}>
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex items-center justify-center">
                      <div
                        className="flex items-center bg-gray-200 rounded-full shadow-sm relative z-40"
                        style={{ width: isMobile ? "100%" : "27%" }}
                      >
                        <div className="pl-3 sm:pl-4 text-gray-500">
                          <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          placeholder={`Search ${category ? getCategoryDisplayName(category).toLowerCase() : ""} in Ibadan...`}
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
                            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
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

          {/* Category Buttons */}
          <div className="mt-4 md:mt-6">
            <CategoryButtons
              selectedCategory={selectedCategoryButton}
              onCategoryClick={handleCategoryButtonClick}
            />
          </div>
        </div>

        {/* Search Modals */}
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

        {/* Search Suggestions */}
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

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
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
          <div className="lg:w-3/4" ref={resultsRef}>
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-3">
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
                            return activeFilters.priceRange.min || activeFilters.priceRange.max;
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

                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-[#00065A] mb-1">
                      {getPageTitle()}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {apiResponse?.results || 0} {apiResponse?.results === 1 ? "place" : "places"} found
                    </p>
                  </div>
                </div>

                {/* Sort Dropdown */}
                {(isMobile || window.innerWidth >= 1024) && filtersInitialized && (
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
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results Display */}
            <div className="space-y-6">
              {listings.length === 0 && filtersInitialized && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-4xl text-gray-300 mb-4 block"
                  />
                  <h3 className="text-xl text-gray-800 mb-2">
                    No matching results found
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto px-4">
                    {searchQuery
                      ? `No ${getCategoryDisplayName(category).toLowerCase()} found for "${searchQuery}" with the selected filters.`
                      : `No ${getCategoryDisplayName(category).toLowerCase()} match your current filters.`}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center px-4">
                    <button
                      onClick={clearAllFilters}
                      className="bg-[#06EAFC] text-white px-4 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors text-sm"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => {
                        if (isMobile) {
                          setShowMobileFilters(true);
                        } else {
                          setShowDesktopFilters(true);
                        }
                      }}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Adjust Filters
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Tip: Try selecting fewer filters or different combinations
                  </p>
                </div>
              )}

              {listings.length > 0 && filtersInitialized && (
                <>
                  {isMobile ? (
                    <div className="space-y-4">
                      {Array.from({
                        length: Math.ceil(currentListings.length / 5),
                      }).map((_, rowIndex) => (
                        <div
                          key={rowIndex}
                          className="flex overflow-x-auto scrollbar-hide gap-2 pb-4"
                          style={{ paddingRight: "8px" }}
                        >
                          {currentListings
                            .slice(rowIndex * 5, (rowIndex + 1) * 5)
                            .map((listing, index) => (
                              <SearchResultBusinessCard
                                key={listing._id || `${rowIndex}-${index}`}
                                item={listing}
                                category={category || "general"}
                                isMobile={isMobile}
                              />
                            ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentListings.map((listing, index) => (
                        <SearchResultBusinessCard
                          key={listing._id || index}
                          item={listing}
                          category={category || "general"}
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
      `}</style>
    </div>
  );
};

export default CategoryResults;