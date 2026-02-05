import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSearch,
  faTimes,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
  faCheck,
  faChevronRight,
  faBed,
  faHome,
  faArrowLeft,
  faBuilding,
  faUtensils,
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
import { FaUserCircle } from "react-icons/fa";
import axiosInstance from "../lib/axios";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { MdCheckCircle } from "react-icons/md";
import { FaTimes } from "react-icons/fa";

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
        <div className="relative mb-6">
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-[#06EAFC]/10 rounded-full`}></div>
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-transparent border-t-[#06EAFC] rounded-full absolute top-0 left-0 animate-spin`}></div>
          <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} border-4 border-transparent border-b-[#00E38C] rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
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
        
        <div className="flex space-x-1 mt-6">
          <div className="w-2 h-2 bg-[#06EAFC] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#06EAFC] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#06EAFC] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
      
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
        <div className="relative mb-6">
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-[#06EAFC]/10 rounded-full`}></div>
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-transparent border-t-[#06EAFC] rounded-full absolute top-0 left-0 animate-spin`}></div>
        </div>
        
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
        
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
          <div className="bg-gradient-to-r from-[#06EAFC] to-[#00E38C] h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
        
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

// ================== UPDATED USE LISTINGS HOOK ==================

const useListings = (category = null, searchQuery = '', filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const buildQueryString = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    return params.toString();
  };

  const getListingsByCategory = async (category, filters = {}) => {
    try {
      const queryFilters = { 
        category: category,
      };
      const queryString = buildQueryString(queryFilters);
      const url = `/listings${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(url, {
        timeout: 5000,
      });
      
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          status: 'error',
          message: 'Network timeout: The request took too long to complete.',
          results: 0,
          data: { listings: [] }
        };
      } else if (error.message.includes('Network Error')) {
        return {
          status: 'error',
          message: 'Network Error: Unable to connect to the server.',
          results: 0,
          data: { listings: [] }
        };
      }
      
      return {
        status: 'error',
        message: error.message,
        results: 0,
        data: { listings: [] }
      };
    }
  };

  const looksLikeLocation = (query) => {
    if (!query || query.trim() === '') return false;
    
    const queryLower = query.toLowerCase().trim();
    
    const ibadanAreas = [
      'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'agodi', 
      'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
      'molete', 'agbowo', 'sabo', 'bashorun', 'ife road',
      'akinyele', 'mokola hill', 'sango roundabout'
    ];
    
    const locationSuffixes = [
      'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
      'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
      'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station'
    ];
    
    const isIbadanArea = ibadanAreas.some(area => queryLower.includes(area));
    const hasLocationSuffix = locationSuffixes.some(suffix => queryLower.includes(suffix));
    const isShortQuery = queryLower.split(/\s+/).length <= 3 && queryLower.length <= 15;
    
    return isIbadanArea || hasLocationSuffix || isShortQuery;
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getListingsByCategory(category);
        
        if (data && data.status === 'success' && data.data && data.data.listings) {
          const fetchedListings = data.data.listings;
          setListings(fetchedListings);
        } else if (data && data.status === 'error') {
          setError(data.message || 'API Error');
          setListings([]);
        } else {
          setListings([]);
        }
      } catch (err) {
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchListings();
    }
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
  try {
    if (item.images && item.images.length > 0) {
      const images = item.images;
      if (typeof images[0] === 'string') {
        return [images[0]];
      }
      if (images[0]?.url) {
        return [images[0].url];
      }
    }
    
    if (item.details?.roomTypes?.[0]?.images?.length > 0) {
      const images = item.details.roomTypes[0].images;
      if (images[0]?.url) {
        return [images[0].url];
      }
    }
    
    const cat = (item.category || "").toLowerCase();
    if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
    if (cat.includes("restaurant")) return [FALLBACK_IMAGES.restaurant];
    if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
    if (cat.includes("services")) return [FALLBACK_IMAGES.services];
    if (cat.includes("event")) return [FALLBACK_IMAGES.event];
    return [FALLBACK_IMAGES.default];
  } catch (error) {
    return [FALLBACK_IMAGES.default];
  }
};

const getPriceFromItem = (item) => {
  try {
    if (item.price !== undefined && item.price !== null) {
      return Number(item.price);
    }
    
    if (item.details?.priceRangePerMeal) {
      const { priceFrom, priceTo } = item.details.priceRangePerMeal;
      
      if (priceFrom !== undefined && priceTo !== undefined) {
        return Math.round((Number(priceFrom) + Number(priceTo)) / 2);
      } else if (priceFrom !== undefined) {
        return Number(priceFrom);
      } else if (priceTo !== undefined) {
        return Number(priceTo);
      }
    }
    
    if (item.details?.priceRange) {
      const { priceFrom, priceTo } = item.details.priceRange;
      
      if (priceFrom !== undefined && priceTo !== undefined) {
        return Math.round((Number(priceFrom) + Number(priceTo)) / 2);
      } else if (priceFrom !== undefined) {
        return Number(priceFrom);
      } else if (priceTo !== undefined) {
        return Number(priceTo);
      }
    }
    
    if (item.details?.roomTypes?.[0]?.pricePerNight !== undefined) {
      return Number(item.details.roomTypes[0].pricePerNight);
    }
    
    if (item.details?.pricePerNight !== undefined) {
      return Number(item.details.pricePerNight);
    }
    
    if (item.details?.price !== undefined) {
      return Number(item.details.price);
    }
    
    if (item.details?.startingPrice !== undefined) {
      return Number(item.details.startingPrice);
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
};

const getLocationFromItem = (item) => {
  try {
    if (item.location?.area) {
      return item.location.area;
    }
    
    if (item.area) {
      return item.area;
    }
    
    if (item.location?.address) {
      return item.location.address;
    }
    
    if (item.address) {
      return item.address;
    }
    
    return "Ibadan";
  } catch (error) {
    return "Ibadan";
  }
};

const getBusinessName = (item) => {
  try {
    if (item.name) {
      return item.name;
    }
    
    if (item.title) {
      return item.title;
    }
    
    if (item.vendorId?.vendor?.businessName) {
      return item.vendorId.vendor.businessName;
    }
    
    return "Business";
  } catch (error) {
    return "Business";
  }
};

const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories" || category === "All")
    return "All Categories";

  const categoryMap = {
    'hotel': 'Hotels',
    'restaurant': 'Restaurants',
    'shortlet': 'Shortlets',
    'vendor': 'Services',
    'services': 'Services',
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

const getPluralCategoryName = (category) => {
  if (!category) return "Places";
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("hotel")) return "Hotels";
  if (categoryLower.includes("shortlet")) return "Shortlets";
  if (categoryLower.includes("restaurant")) return "Restaurants";
  if (categoryLower.includes("vendor") || categoryLower.includes("services")) return "Services";
  if (categoryLower.includes("tourist")) return "Tourist Centers";
  if (categoryLower.includes("event")) return "Events";
  return category + "s";
};

const getCategorySlug = (category) => {
  const categoryMap = {
    'Hotel': 'hotel',
    'Shortlet': 'shortlet', 
    'Restaurant': 'restaurant',
    'Vendor': 'services',
    'Services': 'services',
    'All Categories': ''
  };
  
  return categoryMap[category] || createSlug(category);
};

const createSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const normalizeLocation = (location) => {
  if (!location) return '';
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

const generateSearchSuggestions = (query, listings, activeCategory = '') => {
  if (!query.trim() || !listings.length) return [];

  const queryLower = query.toLowerCase().trim();
  const suggestions = [];

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

  const uniqueLocations = [
    ...new Set(
      categoryFilteredListings
        .map((item) => item.location?.area || item.area)
        .filter((loc) => loc && loc.trim() !== "")
        .map((loc) => loc.trim())
    ),
  ];

  const locationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((location) => {
      const categorySlug = getCategorySlug(activeCategory);
      const locationSlug = createSlug(location);
      let seoPath = '';
      
      if (categorySlug && locationSlug) {
        seoPath = `/${categorySlug}-in-${locationSlug}`;
      } else if (categorySlug) {
        seoPath = `/${categorySlug}`;
      } else if (locationSlug) {
        seoPath = `/places-in-${locationSlug}`;
      } else {
        seoPath = '/search';
      }
      
      return {
        type: "location",
        title: getLocationDisplayName(location),
        description: `${getPluralCategoryName(activeCategory)} in ${getLocationDisplayName(location)}`,
        action: () => {
          return `${seoPath}?category=${activeCategory}&q=${encodeURIComponent(location)}`;
        },
      };
    });

  if (activeCategory) {
    const categoryLower = activeCategory.toLowerCase();
    if (categoryLower.includes(queryLower) || queryLower.includes(categoryLower)) {
      const categoryPlural = getPluralCategoryName(activeCategory);
      const categorySlug = getCategorySlug(activeCategory);
      
      suggestions.push({
        type: "category",
        title: categoryPlural,
        description: `Browse ${categoryPlural} options`,
        action: () => {
          return `/${categorySlug}?category=${activeCategory}`;
        },
      });
    }
  }

  return [...suggestions, ...locationMatches]
    .sort((a, b) => {
      const aExact = a.title.toLowerCase() === queryLower;
      const bExact = b.title.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
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
  const [imageHeight] = useState(isMobile ? 180 : 200);
  const isFavorite = useIsFavorite(item._id || item.id);
  const cardRef = useRef(null);
  
  const isAuthenticated = useAuthStatus();
  const isPending = item.status === 'pending';

  // ✅ UPDATED: Shows full numbers with Naira symbol
  const formatPrice = (n) => {
    if (!n || n === 0) return "₦0";
    const num = Number(n);
    
    // Return full number with thousand separators and Naira symbol
    return `₦${num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // ✅ UPDATED: With Naira symbol
  const getPriceText = () => {
    if (category === 'restaurant' && item.details?.priceRangePerMeal) {
      const { priceFrom, priceTo } = item.details.priceRangePerMeal;
      
      if (priceFrom !== undefined && priceTo !== undefined && priceTo > priceFrom) {
        return `${formatPrice(priceFrom)} - ${formatPrice(priceTo)}`;
      } else if (priceFrom !== undefined) {
        return `From ${formatPrice(priceFrom)}`;
      }
    }
    
    if (category === 'event' && item.details?.priceRange) {
      const { priceFrom, priceTo } = item.details.priceRange;
      
      if (priceFrom !== undefined && priceTo !== undefined && priceTo > priceFrom) {
        return `${formatPrice(priceFrom)} - ${formatPrice(priceTo)}`;
      } else if (priceFrom !== undefined) {
        return `From ${formatPrice(priceFrom)}`;
      }
    }
    
    const price = getPriceFromItem(item) || 0;
    const formattedPrice = formatPrice(price);
    
    if (price === 0) {
      if (category === 'services' || category === 'vendor') {
        return 'Contact for pricing';
      }
      return 'Price not available';
    }
    
    return formattedPrice; // ✅ With Naira symbol
  };

  const getPerText = () => {
    const nightlyCategories = [
      "hotel", "hostel", "shortlet", "apartment", "cabin", "condo", "resort", "inn", "motel",
    ];

    if (nightlyCategories.some((cat) => category.toLowerCase().includes(cat))) {
      return "per night";
    }

    if (category.toLowerCase().includes("restaurant") ||
        category.toLowerCase().includes("food") ||
        category.toLowerCase().includes("cafe")) {
      return "per meal";
    }

    if (category.toLowerCase().includes("event") || 
        category.toLowerCase().includes("hall")) {
      return "per event";
    }

    if (category.toLowerCase().includes("services") || 
        category.toLowerCase().includes("vendor")) {
      return "";
    }

    return "per guest";
  };

  const getPriceUnit = () => {
    if (category === 'hotel' || category === 'shortlet') return 'per night';
    if (category === 'restaurant') return 'per meal';
    return 'per guest';
  };

  const priceText = getPriceText();
  const priceUnit = getPriceUnit();
  const locationText = getLocationFromItem(item) || "Ibadan";
  const rating = item.rating || "4.9";
  const businessName = getBusinessName(item) || "Business Name";
  const subcategory = getSubcategory(category);

  const handleCardClick = () => {
    if (item._id || item.id) {
      navigate(`/vendor-detail/${item._id || item.id}`);
    } else {
      navigate(`/category/${category}`);
    }
  };

  // ✅ UPDATED TO USE LOGIN PAGE TOAST DESIGN
  const showToast = useCallback(
    (message, type = "success") => {
      const backgroundColor = "#FFFFFF";
      const textColor = "#1C1C1E";
      const iconColor = type === "success" ? "#34C759" : "#FF3B30";
      const Icon = type === "success" ? MdCheckCircle : FaTimes;
      
      return toast(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon size={28} color={iconColor} />
          <span style={{
            fontWeight: 500,
            fontSize: '16px',
            color: textColor,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            {message}
          </span>
        </div>,
        {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          transition: Slide,
          style: {
            background: backgroundColor,
            color: textColor,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            padding: "12px 20px",
            minWidth: "240px"
          }
        }
      );
    },
    []
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
      className="bg-white rounded-[13px] overflow-hidden flex-shrink-0 font-manrope relative group flex flex-col cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200"
      style={{
        width: isMobile ? "180px" : "220px",
        height: isMobile ? "310px" : "350px",
        minWidth: isMobile ? "165px" : "100px",
        maxWidth: isMobile ? "250px" : "450px",
        minHeight: isMobile ? "310px" : "350px",
        maxHeight: isMobile ? "310px" : "350px",
      }}
      onClick={handleCardClick}
    >
      {isPending && (
        <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-white px-2 py-0.5 rounded-md shadow-sm z-10">
          <span className="text-[8px] font-semibold">PENDING</span>
        </div>
      )}

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

        {!isPending && (
          <div className="absolute top-2 left-2 bg-white px-1.5 py-1 rounded-md shadow-sm flex items-center gap-1">
            <span className="text-[9px] font-semibold text-gray-900">
              Guest favorite
            </span>
          </div>
        )}

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

      <div className="flex-1 p-2.5 flex flex-col">
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm mb-1">
          {businessName}
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-xs line-clamp-1 mb-2">
              {locationText}
            </p>

            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="text-[12px] font-manrope text-gray-900">
                  {priceText} {/* ✅ Now with Naira symbol */}
                </span>
                {priceUnit && (
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    {priceUnit}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-gray-800 text-xs">
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
      label: "Services", 
      displayName: "Services",
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
        {/* MOBILE BUTTONS - PERFECTLY FITTED, NO EXCESS PADDING */}
        <div className="md:hidden overflow-x-auto scrollbar-hide pb-2 px-4">
          <div className="flex space-x-2 min-w-max">
            {buttonConfigs.map((button) => {
              const isSelected = selectedCategory === button.key;
              
              return (
                <button
                  key={button.key}
                  onClick={() => onCategoryClick(button.key)}
                  disabled={isSwitchingCategory}
                  className={`
                    flex items-center justify-center gap-1.5 rounded-full
                    whitespace-nowrap transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                    ${isSwitchingCategory ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                    text-xs font-manrope
                  `}
                  style={{ 
                    minWidth: 'auto',
                    padding: '8px 14px', // Symmetrical: 14px both sides (fitted)
                    marginRight: '6px'
                  }}
                >
                  {button.icon === FaUserCircle ? (
                    <button.icon className={`${isSelected ? 'text-white' : 'text-gray-500'} text-xs`} />
                  ) : (
                    <FontAwesomeIcon 
                      icon={button.icon} 
                      className={`${isSelected ? 'text-white' : 'text-gray-500'} text-xs`}
                    />
                  )}
                  <span className="font-medium">{button.displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP BUTTONS */}
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
                    flex items-center justify-center gap-2 rounded-[15px]
                    transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                    ${isSwitchingCategory ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{
                    padding: isMd 
                      ? '10px 20px'   // Medium screens: symmetrical
                      : '12px 24px',  // Large screens: symmetrical
                  }}
                >
                  {button.icon === FaUserCircle ? (
                    <button.icon className={`${isSelected ? 'text-white' : 'text-gray-500'} ${isMd ? 'text-sm' : 'text-base'}`} />
                  ) : (
                    <FontAwesomeIcon 
                      icon={button.icon} 
                      className={`${isSelected ? 'text-white' : 'text-gray-500'} ${isMd ? 'text-sm' : 'text-base'}`}
                    />
                  )}
                  <span className={`${isMd ? 'text-sm' : 'text-base'} font-medium ml-1`}>
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

      {/* UPDATED PRICE RANGE SECTION - REMOVED NAIRA SYMBOLS */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center mb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {/* Removed Naira symbol */}
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
                  {/* Removed Naira symbol */}
                  <input
                    type="number"
                    placeholder="2500"
                    value={localFilters.priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  />
                </div>
              </div>
              <span className="text-gray-500 font-medium mt-6 text-sm">to</span>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Max Price
                </label>
                <div className="relative">
                  {/* Removed Naira symbol */}
                  <input
                    type="number"
                    placeholder="50000"
                    value={localFilters.priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
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
                const categorySlug = getCategorySlug(activeCategory);
                const locationSlug = createSlug(searchQuery.trim());
                let seoPath = '';
                
                if (categorySlug && locationSlug) {
                  seoPath = `/${categorySlug}-in-${locationSlug}`;
                } else if (categorySlug) {
                  seoPath = `/${categorySlug}`;
                } else if (locationSlug) {
                  seoPath = `/places-in-${locationSlug}`;
                } else {
                  seoPath = '/search';
                }
                
                const finalUrl = `${seoPath}?q=${encodeURIComponent(searchQuery.trim())}&cat=${activeCategory}`;
                onSuggestionClick(finalUrl);
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
      const categorySlug = getCategorySlug(activeCategory);
      const locationSlug = createSlug(inputValue.trim());
      let seoPath = '';
      
      if (categorySlug && locationSlug) {
        seoPath = `/${categorySlug}-in-${locationSlug}`;
      } else if (categorySlug) {
        seoPath = `/${categorySlug}`;
      } else if (locationSlug) {
        seoPath = `/places-in-${locationSlug}`;
      } else {
        seoPath = '/search';
      }
      
      const finalUrl = `${seoPath}?q=${encodeURIComponent(inputValue.trim())}&cat=${activeCategory}`;
      onSuggestionClick(finalUrl);
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
                placeholder={`Search ${activeCategory || 'hotels, restaurants, shortlets, services'}...`}
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={() => handleClearInput}
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
                      const categorySlug = getCategorySlug(activeCategory);
                      const locationSlug = createSlug(inputValue.trim());
                      let seoPath = '';
                      
                      if (categorySlug && locationSlug) {
                        seoPath = `/${categorySlug}-in-${locationSlug}`;
                      } else if (categorySlug) {
                        seoPath = `/${categorySlug}`;
                      } else if (locationSlug) {
                        seoPath = `/places-in-${locationSlug}`;
                      } else {
                        seoPath = '/search';
                      }
                      
                      const finalUrl = `${seoPath}?q=${encodeURIComponent(inputValue.trim())}&cat=${activeCategory}`;
                      onSuggestionClick(finalUrl);
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
                      const categorySlug = getCategorySlug(activeCategory);
                      const locationSlug = createSlug(inputValue.trim());
                      let seoPath = '';
                      
                      if (categorySlug && locationSlug) {
                        seoPath = `/${categorySlug}-in-${locationSlug}`;
                      } else if (categorySlug) {
                        seoPath = `/${categorySlug}`;
                      } else if (locationSlug) {
                        seoPath = `/places-in-${locationSlug}`;
                      } else {
                        seoPath = '/search';
                      }
                      
                      const finalUrl = `${seoPath}?q=${encodeURIComponent(inputValue.trim())}&cat=${activeCategory}`;
                      onSuggestionClick(finalUrl);
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
                Search for hotels, restaurants, shortlets, and services in Ibadan
              </p>

              <div className="w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Hotels", "Restaurants", "Shortlets", "Services"].map((term) => (
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
  
  const path = location.pathname;
  let activeCategory = category || 'hotel';
  
  const seoRouteMatch = path.match(/\/([a-z]+)-in-([a-z-]+)/i);
  if (seoRouteMatch) {
    const [, categorySlug] = seoRouteMatch;
    const slugToCategory = {
      'hotel': 'hotel',
      'restaurant': 'restaurant',
      'shortlet': 'shortlet',
      'services': 'vendor',
      'vendor': 'vendor'
    };
    activeCategory = slugToCategory[categorySlug.toLowerCase()] || categorySlug;
  }
  else if (path === '/hotel') {
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

  const { listings, loading, error, apiResponse } = useListings(activeCategory, searchQuery, activeFilters);

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
      const uniqueLocations = [...new Set(listings.map(item => getLocationFromItem(item)).filter(Boolean))];
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

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const categorySlug = getCategorySlug(activeCategory);
      const locationSlug = createSlug(localSearchQuery.trim());
      
      let seoPath = '';
      
      if (categorySlug && locationSlug) {
        seoPath = `/${categorySlug}-in-${locationSlug}`;
      } else if (categorySlug) {
        seoPath = `/${categorySlug}`;
      } else if (locationSlug) {
        seoPath = `/places-in-${locationSlug}`;
      } else {
        seoPath = '/search';
      }
      
      const queryParams = new URLSearchParams();
      
      const checkInDate = searchParams.get("checkInDate");
      const checkOutDate = searchParams.get("checkOutDate");
      const guests = searchParams.get("guests");
      
      if (checkInDate) queryParams.append("checkInDate", checkInDate);
      if (checkOutDate) queryParams.append("checkOutDate", checkOutDate);
      if (guests) queryParams.append("guests", guests);
      
      queryParams.append("q", localSearchQuery.trim());
      queryParams.append("cat", activeCategory);
      
      if (activeFilters.locations.length > 0) {
        queryParams.append("location.area", activeFilters.locations[0]);
      }
      
      if (activeFilters.priceRange.min) {
        queryParams.append("minPrice", activeFilters.priceRange.min);
      }
      
      if (activeFilters.priceRange.max) {
        queryParams.append("maxPrice", activeFilters.priceRange.max);
      }
      
      if (activeFilters.sortBy && activeFilters.sortBy !== "relevance") {
        queryParams.append("sort", activeFilters.sortBy);
      }
      
      const finalUrl = queryParams.toString() 
        ? `${seoPath}?${queryParams.toString()}`
        : seoPath;
      
      navigate(finalUrl);
      
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
            params.set("location.area", selectedLocation);
          }
        }
      });

      if (activeCategory) {
        params.set("category", activeCategory);
      }

      setSearchParams(params);
    }
  };

  const handleCategoryButtonClick = (categoryKey) => {
    setIsSwitchingCategory(true);
    const currentCategory = activeCategory || "all";
    setPreviousCategory(getCategoryDisplayName(currentCategory));
    
    const categoryMap = {
      'hotel': 'Hotels',
      'restaurant': 'Restaurants',
      'shortlet': 'Shortlets',
      'vendor': 'Services'
    };
    setNewCategory(categoryMap[categoryKey] || categoryKey);
    
    navigate(`/${categoryKey}`);
    
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
    if (activeCategory) {
      params.set("category", activeCategory);
    }
    setSearchParams(params);
  };

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

  useEffect(() => {
    let timeoutId;
    
    if (isSwitchingCategory) {
      timeoutId = setTimeout(() => {
        setIsSwitchingCategory(false);
      }, 5000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSwitchingCategory]);

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil((apiResponse?.results || listings.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = listings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading && !isSwitchingCategory) {
    return <UnifiedLoadingScreen isMobile={isMobile} />;
  }

  if (error) {
    const isNetworkError = error?.includes?.('timeout') || error?.includes?.('Network Error') || error?.includes?.('Failed to load');
    const errorMessage = isNetworkError 
      ? "Unable to load the category results. The request took too long to complete."
      : "The vendor you're looking for doesn't exist or has been removed.";

    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col mt-8 items-center justify-center min-h-[60vh] px-4">
          <div className="mb-6 p-4 rounded-full bg-red-50 border border-red-100">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 font-manrope">
            {isNetworkError ? "Resource Loading Error" : "Vendor Not Found"}
          </h1>
          
          <p className="text-gray-600 text-center mb-6 max-w-md font-manrope">
            {errorMessage}
            {isNetworkError && (
              <span className="block text-xs text-gray-500 mt-2">
                timeout of 5000ms exceeded
              </span>
            )}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors cursor-pointer font-medium flex items-center gap-2"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01 fifteen.357-2m15.357 2H15" 
                />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeCategoryName = getCategoryDisplayName(activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 font-manrope fixed inset-0 overflow-y-auto">
      
      <Meta
        title={`${getPageTitle()} | Ajani Directory`}
        description={getPageDescription()}
        url={`https://ajani.ai/${activeCategory}?${searchParams.toString()}`}
        image="https://ajani.ai/images/category-og.jpg"
      />

      {isSwitchingCategory && (
        <CategorySwitchLoader 
          isMobile={isMobile} 
          previousCategory={previousCategory}
          newCategory={newCategory}
        />
      )}

      <Header />

      <main className="pb-8 w-full mx-auto max-w-[100vw] pt-16">
        <div className="z-30 py-4 md:py-6 relative w-full" id="search-section">
          <div 
            className={`
              ${isMobile ? 'pl-0 pr-2' : 'px-4 md:px-6 lg:px-8'}
            `}
          >
            <div className="flex items-center gap-3">
              <BackButton className="md:hidden" />

              <div className="flex-1">
                <div className="flex justify-center w-full">
                  <div className="w-full relative max-w-6xl" ref={searchContainerRef}>
                    <form onSubmit={handleSearchSubmit}>
                      <div className="flex items-center justify-center w-full">
                        {!isMobile ? (
                          <div className="hidden lg:block w-full max-w-6xl mx-auto">
                            <div className="relative w-full">
                              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-4">
                                <div className="flex items-center gap-4">
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
                          <div 
                            onClick={() => {
                              handleSearchFocus();
                              setShowMobileSearchModal(true);
                            }}
                            className="bg-gray-200 rounded-[15px] mr-0 px-3 py-2.5 text-xs flex items-center gap-2 cursor-pointer w-full"
                            style={{ marginRight: 0 }}
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

          <div 
            className={`
              mt-4 md:mt-6
              ${isMobile ? 'pl-3 pr-0' : 'px-4 md:px-6 lg:px-8'}
            `}
          >
            <CategoryButtons
              selectedCategory={selectedCategoryButton}
              onCategoryClick={handleCategoryButtonClick}
              isSwitchingCategory={isSwitchingCategory}
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

        <div 
          className={`
            flex flex-col lg:flex-row gap-6 w-full
            ${isMobile ? 'pl-0 pr-0' : 'px-4 md:px-6 lg:px-8'}
          `}
        >
          {!isMobile && filtersInitialized && (
            <div 
              className="lg:w-1/4"
              style={{
                minWidth: '250px',
                maxWidth: '280px',
                width: isMobile ? '100%' : 'calc(25% - 20%)',
                flexShrink: 0,
                position: 'sticky',
                top: '100px',
                height: 'fit-content'
              }}
            >
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
            style={{
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto'
            }}
            ref={resultsRef}
          >
     <div className="mb-6 w-full">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
    <div className="flex-1 flex items-center gap-3 w-full">
      {isMobile && filtersInitialized && (
        <div className="w-full">
          {/* First row: Title + Filter icon */}
          <div className="flex items-center justify-between w-full mb-2">
            <div className="text-left">
              <h1 className="text-xl font-bold text-[#00065A]">
                {getPageTitle()}
              </h1>
            </div>
            
            {/* Filter icon - Same line as title, far right with padding */}
            <button
              onClick={toggleMobileFilters}
              className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm cursor-pointer mr-4"
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
          </div>
          
          {/* Second row: Count text + Sort dropdown */}
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-600">
              {getAccurateCountText()}
            </p>
            
            {/* Sort dropdown - Same line as count, far right with padding */}
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
    
    {/* Desktop sort dropdown */}
    {!isMobile && filtersInitialized && (
      <div className="flex items-center gap-2">
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
      </div>
    )}
  </div>
</div>

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
                          className="flex overflow-x-auto scrollbar-hide pb-4 w-full"
                          style={{
                            paddingLeft: "0",
                            paddingRight: "0",
                            marginRight: "0",
                            gap: "4px"
                          }}
                        >
                          {currentListings
                            .slice(rowIndex * 5, (rowIndex + 1) * 5)
                            .map((listing, index) => (
                              <div
                                key={listing._id || `${rowIndex}-${index}`}
                                className="flex-shrink-0"
                              >
                                <SearchResultBusinessCard
                                  item={listing}
                                  category={activeCategory}
                                  isMobile={isMobile}
                                />
                              </div>
                            ))}
                          <div className="flex-shrink-0 w-2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2 w-full"
                      style={{
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))'
                      }}
                    >
                      {currentListings.map((listing, index) => (
                        <div
                          key={listing._id || index}
                          style={{
                            width: '240px',
                            height: '350px',
                            minWidth: '240px',
                            maxWidth: '240px',
                            minHeight: '350px',
                            maxHeight: '350px'
                          }}
                        >
                          <SearchResultBusinessCard
                            item={listing}
                            category={activeCategory}
                            isMobile={isMobile}
                          />
                        </div>
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
      
      <ToastContainer />

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          overflow-x: hidden;
        }

        body {
          overflow-x: hidden;
        }

        .search-result-card img {
          width: 100% !important;
          height: 200px !important;
          min-height: 200px !important;
          max-height: 200px !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
        }
        
        @media (max-width: 768px) {
          .search-result-card img {
            height: 180px !important;
            min-height: 180px !important;
            max-height: 180px !important;
          }
        }
        
        .search-result-card {
          contain: layout style paint;
        }
        
        .search-result-card > div:first-child {
          width: 100% !important;
          height: 200px !important;
          min-height: 200px !important;
          max-height: 200px !important;
        }
        
        @media (max-width: 768px) {
          .search-result-card > div:first-child {
            height: 180px !important;
            min-height: 180px !important;
            max-height: 180px !important;
          }
        }

        main {
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          main, 
          .pl-3.pr-0,
          [class*="px-"] {
            padding-right: 0 !important;
            padding-left: 12px !important;
          }
          
          .w-full {
            padding-right: 0 !important;
            margin-right: 0 !important;
          }
          
          .overflow-x-auto {
            padding-right: 0 !important;
            padding-left: 0 !important;
          }
          
          .scrollbar-hide {
            -webkit-overflow-scrolling: touch !important;
            scroll-snap-type: x mandatory;
          }
          
          .md\\:hidden .overflow-x-auto {
            -webkit-overflow-scrolling: touch !important;
          }
          
          .min-w-max {
            padding-right: 12px;
          }
        }

        @media screen and (min-width: 768px) {
          main, 
          .px-4, 
          .px-6, 
          .px-8 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          .lg\\:w-1\\/4 {
            width: 20% !important;
          }
          
          .lg\\:w-3\\/4 {
            width: 80% !important;
          }
        }

        @media screen and (min-width: 1024px) {
          main {
            max-width: 1400px !important;
            margin-left: auto !important;
            margin-right: auto !important;
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