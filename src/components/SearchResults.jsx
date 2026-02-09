import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams, useNavigate, useLocation, useParams } from "react-router-dom";
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
  faCalendarAlt,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { PiSliders } from "react-icons/pi";
import { MdFavoriteBorder } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";
import { createPortal } from "react-dom";
import axiosInstance from "../lib/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ---------------- HELPER FUNCTIONS FOR SEO-FRIENDLY URLS ---------------- */

// Helper to parse SEO-friendly slug from URL
const parseSeoSlug = (slug) => {
  if (!slug) return { category: null, location: null };
  
  const cleanSlug = slug.replace(/^\/|\/$/g, '');
  
  const inPattern = /^([a-z-]+)-in-([a-z-]+)$/;
  const match = cleanSlug.match(inPattern);
  
  if (match) {
    const [, categoryPart, locationPart] = match;
    return {
      category: categoryPart.replace(/-/g, ' '),
      location: locationPart.replace(/-/g, ' ')
    };
  }
  
  const categoryPattern = /^[a-z-]+$/;
  if (categoryPattern.test(cleanSlug)) {
    return {
      category: cleanSlug.replace(/-/g, ' '),
      location: null
    };
  }
  
  const placesPattern = /^places-in-(.+)$/;
  const placesMatch = cleanSlug.match(placesPattern);
  if (placesMatch) {
    return {
      category: 'places',
      location: placesMatch[1].replace(/-/g, ' ')
    };
  }
  
  return { category: null, location: null };
};

// Helper to map URL category slugs to display names
const mapCategorySlugToDisplay = (slug) => {
  const categoryMap = {
    'hotel': 'Hotel',
    'hotels': 'Hotel',
    'shortlet': 'Shortlet',
    'shortlets': 'Shortlet',
    'restaurant': 'Restaurant',
    'restaurants': 'Restaurant',
    'services': 'Vendor',
    'vendor': 'Vendor',
    'vendors': 'Vendor',
    'places': 'All Categories'
  };
  
  return categoryMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
};

// Helper to create SEO-friendly slug
const createSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper to get category slug for URL
const getCategorySlug = (category) => {
  const categoryMap = {
    'Hotel': 'hotel',
    'Shortlet': 'shortlet', 
    'Restaurant': 'restaurant',
    'Vendor': 'services',
    'All Categories': ''
  };
  
  return categoryMap[category] || createSlug(category);
};

/* ---------------- UNIFIED LOADING COMPONENT ================== */
const UnifiedLoadingScreen = ({ isMobile = false, category = null }) => {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center max-w-sm mx-auto px-4">
        <div className="relative mb-6">
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-[#06EAFC]/10 rounded-full`}></div>
          <div className={`${isMobile ? 'w-14 h-14' : 'w-20 h-20'} border-4 border-transparent border-t-[#06EAFC] rounded-full absolute top-0 left-0 animate-spin`}></div>
        </div>
        
        <div className="text-center">
          <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
            {category ? `Loading ${category}...` : "Loading Results"}
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
      </div>
    </div>
  );
};

/* ---------------- CATEGORY SWITCH LOADER ================== */
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
      </div>
    </div>
  );
};

/* ---------------- UPDATED BACKEND HOOK - NO AUTO-SEARCH ON TYPING ---------------- */
const useBackendListings = (searchQuery = '', filters = {}, seoCategory = null, seoLocation = null, shouldFetch = true) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [filteredCounts, setFilteredCounts] = useState({});
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      if (!shouldFetch) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let url = '/listings';
        const params = new URLSearchParams();
        
        if (seoCategory && seoCategory !== "All Categories") {
          const backendCategories = [seoCategory].map(cat => {
            const categoryMap = {
              'hotel': 'hotel',
              'restaurant': 'restaurant', 
              'shortlet': 'shortlet',
              'vendor': 'services',
              'services': 'services',
              'Hotel': 'hotel',
              'Restaurant': 'restaurant',
              'Shortlet': 'shortlet',
              'Vendor': 'services'
            };
            const catLower = cat.toLowerCase();
            return categoryMap[catLower] || catLower;
          });
          params.append('category', backendCategories[0]);
        }
        
        if (filters.locations && filters.locations.length > 0) {
          const properCaseLocation = normalizeLocationForBackend(filters.locations[0]);
          params.append('location.area', properCaseLocation);
        }
        else if (searchQuery && looksLikeLocation(searchQuery)) {
          const properCaseLocation = normalizeLocationForBackend(searchQuery);
          params.append('location.area', properCaseLocation);
        }
        else if (searchQuery && !looksLikeLocation(searchQuery)) {
          params.append('q', searchQuery);
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
        
        if (filters.sortBy && filters.sortBy !== 'relevance') {
          params.append('sort', filters.sortBy);
        }
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        const response = await axiosInstance.get(url);
        setApiResponse(response.data);
        
        if (response.data && response.data.status === 'success' && response.data.data?.listings) {
          let allListings = response.data.data.listings;
          
          const uniqueLocations = [...new Set(allListings.map(item => item.location?.area).filter(Boolean))];
          setAllLocations(uniqueLocations);
          
          let finalListings = allListings;
          
          if (seoCategory && seoCategory !== "All Categories") {
            const activeCategory = seoCategory.toLowerCase();
            finalListings = finalListings.filter(item => {
              const itemCategory = (item.category || '').toLowerCase();
              const matchesCategory = itemCategory.includes(activeCategory) || 
                     activeCategory.includes(itemCategory) ||
                     (activeCategory === 'services' && itemCategory === 'vendor') ||
                     (activeCategory === 'vendor' && itemCategory === 'services') ||
                     (activeCategory === 'hotel' && itemCategory === 'hotel') ||
                     (activeCategory === 'restaurant' && itemCategory === 'restaurant') ||
                     (activeCategory === 'shortlet' && itemCategory === 'shortlet');
              
              return matchesCategory;
            });
          }
          
          if (filters.locations && filters.locations.length > 0) {
            const searchLocation = filters.locations[0].toLowerCase();
            finalListings = finalListings.filter(item => {
              const itemLocation = (item.location?.area || '').toLowerCase();
              const matchesLocation = itemLocation.includes(searchLocation) || 
                                      searchLocation.includes(itemLocation) ||
                                      normalizeLocation(itemLocation) === normalizeLocation(searchLocation);
              
              return matchesLocation;
            });
          }
          
          if (searchQuery && !looksLikeLocation(searchQuery)) {
            finalListings = finalListings.filter(item => {
              const title = (item.title || '').toLowerCase();
              const description = (item.description || '').toLowerCase();
              const category = (item.category || '').toLowerCase();
              
              return title.includes(searchQuery.toLowerCase()) ||
                     description.includes(searchQuery.toLowerCase()) ||
                     category.includes(searchQuery.toLowerCase());
            });
          }
          
          const counts = {};
          finalListings.forEach(item => {
            const category = item.category || 'Other';
            const pluralCategory = getPluralCategoryName(category);
            counts[pluralCategory] = (counts[pluralCategory] || 0) + 1;
          });
          setFilteredCounts(counts);
          
          setListings(finalListings);
        } else {
          setListings([]);
          setFilteredCounts({});
          setAllLocations([]);
          setError(response.data?.message || 'No data received');
        }
      } catch (err) {
        setError(err.message);
        setListings([]);
        setFilteredCounts({});
        setAllLocations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchQuery, JSON.stringify(filters), seoCategory, shouldFetch]);

  return { 
    listings, 
    loading, 
    error, 
    apiResponse,
    filteredCounts,
    allLocations
  };
};

/* ---------------- ADDITIONAL HELPER FUNCTIONS ---------------- */
const normalizeLocationForBackend = (location) => {
  if (!location) return '';
  return location
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const looksLikeLocation = (query) => {
  if (!query || query.trim() === '') return false;
  
  const queryLower = query.toLowerCase().trim();
  
  const ibadanAreas = [
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly',  'agodi', 
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

const normalizeLocation = (location) => {
  if (!location) return '';
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

const getPluralCategoryName = (category) => {
  if (!category) return "Places";
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("hotel")) return "Hotels";
  if (categoryLower.includes("shortlet")) return "Shortlets";
  if (categoryLower.includes("restaurant")) return "Restaurants";
  if (categoryLower.includes("vendor") || categoryLower.includes("services")) return "Vendors";
  return category + "s";
};

const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations" || location === "All")
    return "All Locations";
  
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
  
  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "";
  }
};

const formatShortDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    return `${day} ${month}`;
  } catch (error) {
    return '';
  }
};

const formatDateForLargeScreen = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      weekday: 'long'
    });
  } catch (error) {
    return '';
  }
};

const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories" || category === "All")
    return "All Categories";

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* ================== FALLBACK IMAGES ================== */
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
  if (cat.includes("services") || cat.includes("vendor")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  if (cat.includes("hall") || cat.includes("weekend")) return [FALLBACK_IMAGES.hall];
  return [FALLBACK_IMAGES.default];
};

/* ================== UNIVERSAL HELPER FUNCTIONS ================== */

// Universal price getter - works for all structures
const getPriceFromItem = (item) => {
  try {
    if (item.price !== undefined && item.price !== null) {
      return item.price;
    }
    
    if (item.details?.priceRangePerMeal) {
      const { priceFrom, priceTo } = item.details.priceRangePerMeal;
      
      if (priceFrom !== undefined && priceTo !== undefined) {
        return Math.round((priceFrom + priceTo) / 2);
      } else if (priceFrom !== undefined) {
        return priceFrom;
      } else if (priceTo !== undefined) {
        return priceTo;
      }
    }
    
    if (item.details?.roomTypes?.[0]?.pricePerNight !== undefined) {
      return item.details.roomTypes[0].pricePerNight;
    }
    
    if (item.details?.pricePerNight !== undefined) {
      return item.details.pricePerNight;
    }
    
    if (item.category?.toLowerCase() === 'event' && item.details?.priceRange) {
      const { priceFrom, priceTo } = item.details.priceRange;
      
      if (priceFrom !== undefined && priceTo !== undefined) {
        return Math.round((priceFrom + priceTo) / 2);
      } else if (priceFrom !== undefined) {
        return priceFrom;
      } else if (priceTo !== undefined) {
        return priceTo;
      }
    }
    
    if (item.category?.toLowerCase() === 'services' && item.details?.pricingRange) {
      const { priceFrom, priceTo } = item.details.pricingRange;
      
      if (priceFrom !== undefined && priceTo !== undefined) {
        return Math.round((priceFrom + priceTo) / 2);
      } else if (priceFrom !== undefined) {
        return priceFrom;
      } else if (priceTo !== undefined) {
        return priceTo;
      }
    }
    
    return 0;
  } catch (error) {
    return 0;
  }
};

// Universal location getter
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

// Universal business name getter
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

/* ================== SIMPLE CALENDAR FOR EDITING DATES ================== */
const SimpleCalendar = ({ onSelect, onClose, selectedDate: propSelectedDate, isCheckOut = false }) => {
  const modalRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(propSelectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    onSelect(newDate);
    onClose();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer
            ${isToday ? "border border-blue-500" : ""}
            ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[10001] w-80 p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            ←
          </button>
          <h3 className="font-semibold text-gray-800">{getMonthName(currentDate)}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              const today = new Date();
              setSelectedDate(today);
              onSelect(today);
              onClose();
            }}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Select Today
          </button>
        </div>
      </div>
    </>
  );
};

/* ================== GUEST SELECTOR FOR EDITING ================== */
const GuestSelector = ({ guests, onChange, onClose, category = 'hotel' }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleGuestChange = (type, value) => {
    const newGuests = { ...guests };
    newGuests[type] = Math.max(0, newGuests[type] + value);
    onChange(newGuests);
  };

  const totalGuests = guests.adults + guests.children;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[10001] w-80 p-6"
      >
        <h3 className="font-semibold text-gray-800 mb-6 text-center">
          {category.includes('restaurant') ? 'Number of People' : 'Guests & Rooms'}
        </h3>
        
        {!category.includes('restaurant') && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="font-medium text-gray-800">Rooms</div>
              <div className="text-sm text-gray-500">Number of rooms</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGuestChange("rooms", -1)}
                disabled={guests.rooms <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="sm" />
              </button>
              <span className="w-8 text-center font-medium">{guests.rooms}</span>
              <button
                onClick={() => handleGuestChange("rooms", 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} size="sm" />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-medium text-gray-800">Adults</div>
            <div className="text-sm text-gray-500">Age 18+</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleGuestChange("adults", -1)}
              disabled={guests.adults <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.adults}</span>
            <button
              onClick={() => handleGuestChange("adults", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-medium text-gray-800">Children</div>
            <div className="text-sm text-gray-500">Age 0-17</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleGuestChange("children", -1)}
              disabled={guests.children <= 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.children}</span>
            <button
              onClick={() => handleGuestChange("children", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">Total {category.includes('restaurant') ? 'People' : 'Guests'}</div>
            <div className="text-xl font-bold text-blue-600">{totalGuests}</div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

/* ================== UPDATED BUSINESS CARD ================== */
const SearchResultBusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageHeight] = useState(isMobile ? 180 : 200);
  const cardRef = useRef(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPriceText = () => {
    const cat = (category || "").toLowerCase();
    
    if (cat.includes('restaurant') && item.details?.priceRangePerMeal) {
      const { priceFrom, priceTo } = item.details.priceRangePerMeal;
      
      if (priceFrom !== undefined && priceTo !== undefined && priceTo > priceFrom) {
        return `₦${formatPrice(priceFrom)} - ₦${formatPrice(priceTo)}`;
      } else if (priceFrom !== undefined) {
        return `₦${formatPrice(priceFrom)}`;
      }
    }
    
    if (cat.includes('event') && item.details?.priceRange) {
      const { priceFrom, priceTo } = item.details.priceRange;
      
      if (priceFrom !== undefined && priceTo !== undefined && priceTo > priceFrom) {
        return `₦${formatPrice(priceFrom)} - ₦${formatPrice(priceTo)}`;
      } else if (priceFrom !== undefined) {
        return `₦${formatPrice(priceFrom)}`;
      }
    }
    
    if ((cat.includes('services') || cat.includes('vendor')) && item.details?.pricingRange) {
      const { priceFrom, priceTo } = item.details.pricingRange;
      
      if (priceFrom !== undefined && priceTo !== undefined && priceTo > priceFrom) {
        return `₦${formatPrice(priceFrom)} - ₦${formatPrice(priceTo)}`;
      } else if (priceFrom !== undefined) {
        return `₦${formatPrice(priceFrom)}`;
      }
    }
    
    const price = getPriceFromItem(item) || 0;
    const formattedPrice = formatPrice(price);
    return `₦${formattedPrice}`;
  };

  const getPriceUnit = () => {
    const cat = (category || "").toLowerCase();
    if (cat.includes('hotel') || cat.includes('shortlet')) return 'per night';
    if (cat.includes('restaurant')) return 'per meal';
    if (cat.includes('event')) return 'per event';
    if (cat.includes('services') || cat.includes('vendor')) return 'per service';
    return '';
  };

  const getTag = () => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("hotel")) return "Hotel";
    if (cat.includes("shortlet")) return "Shortlet";
    if (cat.includes("restaurant")) return "Restaurant";
    if (cat.includes("services") || cat.includes("vendor")) return "Service";
    if (cat.includes("event")) return "Event";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const priceText = getPriceText();
  const priceUnit = getPriceUnit();
  const locationText = getLocationFromItem(item) || "Ibadan";
  const rating = item.rating || "4.9";
  const businessName = getBusinessName(item) || "Business Name";
  const tag = getTag();

  const handleCardClick = () => {
    if (item._id || item.id) {
      navigate(`/vendor-detail/${item._id || item.id}`);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      toast.info('Please login to add to favorites', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope relative group flex flex-col
        ${isMobile ? "w-[180px]" : "w-[240px]"}
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
      style={{
        height: isMobile ? "310px" : "350px",
        minHeight: isMobile ? "310px" : "350px",
        maxHeight: isMobile ? "310px" : "350px",
        minWidth: isMobile ? "180px" : "240px",
        maxWidth: isMobile ? "180px" : "240px",
      }}
    >
      <div
        className="relative overflow-hidden rounded-xl flex-shrink-0"
        style={{
          height: `${imageHeight}px`,
          minHeight: `${imageHeight}px`,
          maxHeight: `${imageHeight}px`,
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
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
            isFavorite
              ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-white/90 hover:bg-white backdrop-blur-sm"
          }`}
          title={isFavorite ? "Remove from saved" : "Add to saved"}
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
        className={`flex-1 ${isMobile ? "p-2.5" : "p-2.5"} flex flex-col`}
        style={{
          minHeight: isMobile ? "130px" : "150px",
        }}
      >
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm mb-1 flex-shrink-0">
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
                  {priceText}
                </span>
                {priceUnit && (
                  <span className="text-[10px] text-gray-600 mt-0.5">
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
                {tag}
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

const CategoryButtons = ({ selectedCategories, onCategoryClick, isSwitchingCategory = false }) => {
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
      displayName: "Services",
      icon: FaUserCircle
    }
  ];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
              const isSelected = selectedCategories.some(
                cat => cat.toLowerCase() === button.key.toLowerCase()
              );
              
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

        {/* DESKTOP BUTTONS - Keep original styling */}
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
                  disabled={isSwitchingCategory}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-[15px]
                    transition-all duration-200 font-medium
                    ${isSelected 
                      ? 'bg-[#06f49f] text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                    }
                    ${isSwitchingCategory ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                    text-base px-4 py-3
                  `}
                >
                  {button.icon === FaUserCircle ? (
                    <button.icon className={`${isSelected ? 'text-white' : 'text-gray-500'} text-base`} />
                  ) : (
                    <FontAwesomeIcon 
                      icon={button.icon} 
                      className={`${isSelected ? 'text-white' : 'text-gray-500'} text-base`}
                    />
                  )}
                  <span className="text-base">
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

/* ================== UPDATED FILTER SIDEBAR - SYNC WITH URL ================== */
const FilterSidebar = ({
  onFilterChange,
  allLocations,
  currentFilters,
  onClose,
  isMobileModal = false,
  isDesktopModal = false,
  isInitialized,
  isMobile,
  onClearSearchQuery,
  onClearLocationFilters,
  category,
  searchQuery,
  checkInDate,
  checkOutDate,
  guests,
  navigate,
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
  const locationSearchRef = useRef(null);

  const allIbadanLocations = React.useMemo(() => {
    const locations = [
      'Akobo', 'Bodija', 'Dugbe', 'Mokola', 'Sango', 'UI', 'Poly',  'Agodi',
      'Jericho', 'Gbagi', 'Apata', 'Ringroad', 'Secretariat', 'Moniya', 'Challenge',
      'Molete', 'Agbowo', 'Sabo', 'Bashorun',  'Ife Road',
      'Akinyele',  'Mokola Hill', 'Sango Roundabout',
      'Iwo Road', 'Gate', 'New Garage', 'Old Ife Road',
      ...(allLocations || []).map(loc => getLocationDisplayName(loc))
    ];
    
    return [...new Set(locations)].sort();
  }, [allLocations]);

  const filteredLocationDisplayNames = React.useMemo(() => {
    if (!locationSearch.trim()) return allIbadanLocations;
    const searchTerm = locationSearch.toLowerCase().trim();
    return allIbadanLocations.filter((location) =>
      location.toLowerCase().includes(searchTerm)
    );
  }, [allIbadanLocations, locationSearch]);

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

  const updateUrlWithFilters = (filters) => {
    if (!navigate || !category) return;
    
    const params = new URLSearchParams();
    
    params.set("cat", category);
    
    if (checkInDate) params.set("checkInDate", checkInDate.toISOString());
    if (checkOutDate) params.set("checkOutDate", checkOutDate.toISOString());
    
    if (guests) params.set("guests", JSON.stringify(guests));
    
    if (searchQuery && searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    
    if (filters.locations && filters.locations.length > 0) {
      params.set("location", filters.locations[0]);
      params.delete("q");
    }
    
    if (filters.priceRange?.min) {
      params.set("minPrice", filters.priceRange.min);
    }
    if (filters.priceRange?.max) {
      params.set("maxPrice", filters.priceRange.max);
    }
    
    if (filters.ratings && filters.ratings.length > 0) {
      params.set("minRating", Math.min(...filters.ratings));
    }
    
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      params.set("sort", filters.sortBy);
    }
    
    const categorySlug = getCategorySlug(category);
    let locationSlug = null;
    
    if (filters.locations && filters.locations.length > 0) {
      locationSlug = createSlug(filters.locations[0]);
    }
    else if (searchQuery && looksLikeLocation(searchQuery)) {
      locationSlug = createSlug(searchQuery);
    }
    
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
    
    const finalUrl = params.toString() 
      ? `${seoPath}?${params.toString()}`
      : seoPath;
    
    navigate(finalUrl);
  };

  const handleLocationSearch = (value) => {
    setLocationSearch(value);
    
    if (value.trim() && localFilters.locations.length > 0) {
      const updatedFilters = {
        ...localFilters,
        locations: [],
      };
      setLocalFilters(updatedFilters);
      onFilterChange(updatedFilters);
      updateUrlWithFilters(updatedFilters);
    }
    
    if (onClearSearchQuery && value.trim()) {
      onClearSearchQuery();
    }
    
    if (onClearLocationFilters && value.trim()) {
      onClearLocationFilters();
    }
  };

  const handleLocationChange = (location) => {
    if (onClearSearchQuery) {
      onClearSearchQuery();
    }
    
    if (onClearLocationFilters) {
      onClearLocationFilters();
    }
    
    const updatedFilters = {
      ...localFilters,
      locations: [location],
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
    updateUrlWithFilters(updatedFilters);
    
    if (isMobileModal || isDesktopModal) {
      onClose();
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
    onFilterChange(updatedFilters);
    updateUrlWithFilters(updatedFilters);
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
      updateUrlWithFilters(updatedFilters);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleSortChange = (sortBy) => {
    const updatedFilters = {
      ...localFilters,
      sortBy,
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
    updateUrlWithFilters(updatedFilters);
  };

  const handleSelectAllLocations = () => {
    if (onClearSearchQuery) {
      onClearSearchQuery();
    }
    
    if (onClearLocationFilters) {
      onClearLocationFilters();
    }
    
    const updatedFilters = {
      ...localFilters,
      locations:
        localFilters.locations.length === allIbadanLocations.length
          ? []
          : [...allIbadanLocations],
    };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
    updateUrlWithFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    if (onClearSearchQuery) {
      onClearSearchQuery();
    }
    
    onFilterChange(localFilters);
    updateUrlWithFilters(localFilters);
    onClose();
  };

  const handleCancelFilters = () => {
    setLocalFilters(currentFilters);
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
                  ref={locationSearchRef}
                  type="text"
                  placeholder="Search all Ibadan locations..."
                  value={locationSearch}
                  onChange={(e) => handleLocationSearch(e.target.value)}
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
                  {localFilters.locations.length === allIbadanLocations.length
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
                  {locationSearch ? `No locations found matching "${locationSearch}"` : "No locations available"}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredLocationDisplayNames.map((location, index) => {
                    const isSelected = localFilters.locations.includes(location);
                    return (
                      <label
                        key={index}
                        className={`flex items-center space-x-2 cursor-pointer group p-2 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleLocationChange(location)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleLocationChange(location)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer flex-shrink-0"
                        />
                        <span
                          className={`text-sm transition-colors truncate flex-1 ${
                            isSelected
                              ? "text-blue-700 font-medium"
                              : "text-gray-700 group-hover:text-[#06EAFC]"
                          }`}
                        >
                          {location}
                        </span>
                        {isSelected && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="text-sm text-blue-600 ml-2 flex-shrink-0"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {currentFilters.locations.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800 font-medium mb-1">
                  Currently selected location:
                </p>
                <p className="text-sm text-blue-700">
                  {currentFilters.locations[0]}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center mb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 font-bold">#</span>
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
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
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
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
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
                    updateUrlWithFilters(updatedFilters);
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
                    updateUrlWithFilters(updatedFilters);
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

      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("sort")}
          className="w-full flex justify-between items-center mb-3 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
            <h4 className="font-semibold text-gray-900 text-base">
              Sort By
            </h4>
          </div>
          <FontAwesomeIcon
            icon={expandedSections.sort ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.sort && (
          <div className="space-y-2">
            {[
              { value: 'relevance', label: 'Relevance' },
              { value: 'price_low', label: 'Price: Low to High' },
              { value: 'price_high', label: 'Price: High to Low' },
              { value: 'rating', label: 'Highest Rated' },
              { value: 'name', label: 'Name: A to Z' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={localFilters.sortBy === option.value}
                  onChange={() => handleSortChange(option.value)}
                  className="w-4 h-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                />
                <span
                  className={`text-sm group-hover:text-[#06EAFC] transition-colors ${
                    localFilters.sortBy === option.value
                      ? "text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {(isMobileModal || isDesktopModal) && (
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Apply Filters
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
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <button
                  onClick={handleCancelFilters}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
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
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl cursor-pointer"
                  aria-label="Close filters"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6 max-w-4xl">
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
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit"
      style={{
        minWidth: '250px',
        maxWidth: '280px',
        width: 'calc(25% - 20%)',
        flexShrink: 0,
        position: 'sticky',
        top: '100px',
        height: 'fit-content'
      }}
    >
      {sidebarContent}
    </div>
  );
};

/* ================== DESKTOP SEARCH SUGGESTIONS ================== */
const DesktopSearchSuggestions = ({
  searchQuery,
  allLocations = [],
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
  activeCategory,
  checkInDate,
  checkOutDate,
  guests,
  onLocationSelected,
}) => {
  const suggestionsRef = useRef(null);
  
  const generateSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const queryLower = searchQuery.toLowerCase().trim();
    const suggestions = [];
    
    const allIbadanLocations = [
      'Akobo', 'Bodija', 'Dugbe', 'Mokola', 'Sango', 'UI', 'Poly', 'Agodi',
      'Jericho', 'Gbagi', 'Apata', 'Ringroad', 'Secretariat', 'Moniya', 'Challenge',
      'Molete', 'Agbowo', 'Sabo', 'Bashorun',  'Ife Road',
      'Akinyele',  'Mokola Hill', 'Sango Roundabout',
      'Iwo Road', 'Gate', 'Molete', 'Challenge', 'New Garage', 'Old Ife Road',
      ...allLocations.map(loc => getLocationDisplayName(loc))
    ];
    
    const uniqueLocations = [...new Set(allIbadanLocations)].sort();
    
    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = location.toLowerCase();
        return displayName.includes(queryLower) || 
               normalizeLocation(location).includes(normalizeLocation(queryLower));
      })
      .map((location) => {
        let categoryPlural = activeCategory;
        if (activeCategory === "Hotel") categoryPlural = "Hotels";
        else if (activeCategory === "Restaurant") categoryPlural = "Restaurants";
        else if (activeCategory === "Shortlet") categoryPlural = "Shortlets";
        else if (activeCategory === "Vendor") categoryPlural = "Vendors";
        else categoryPlural = activeCategory + "s";

        return {
          type: "location",
          title: location,
          location: location,
          description: `${categoryPlural} in ${location}, Ibadan`,
          action: (pasteToSearch = false) => {
            if (pasteToSearch) {
              return location;
            }
            
            const categorySlug = getCategorySlug(activeCategory);
            const locationSlug = createSlug(location);
            
            if (categorySlug && locationSlug) {
              const seoPath = `/${categorySlug}-in-${locationSlug}`;
              const queryParams = new URLSearchParams();
              
              if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
              if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
              if (guests) queryParams.append("guests", JSON.stringify(guests));
              queryParams.append("q", location);
              queryParams.append("cat", activeCategory);
              
              return queryParams.toString() 
                ? `${seoPath}?${queryParams.toString()}`
                : seoPath;
            }
            return '/';
          },
        };
      });

    if (locationMatches.length === 0 && searchQuery.trim()) {
      suggestions.push({
        type: "search",
        title: `Search for "${searchQuery}"`,
        description: `Find ${activeCategory.toLowerCase()}s matching "${searchQuery}" in Ibadan`,
        action: (pasteToSearch = false) => {
          if (pasteToSearch) {
            return searchQuery;
          }
          
          const categorySlug = getCategorySlug(activeCategory);
          const queryParams = new URLSearchParams();
          
          if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
          if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
          if (guests) queryParams.append("guests", JSON.stringify(guests));
          queryParams.append("q", searchQuery);
          queryParams.append("cat", activeCategory);
          
          if (categorySlug) {
            const seoPath = `/${categorySlug}`;
            return queryParams.toString() 
              ? `${seoPath}?${queryParams.toString()}`
              : seoPath;
          }
          return `/search?${queryParams.toString()}`;
        },
      });
    }

    return locationMatches
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === queryLower;
        const bExact = b.title.toLowerCase() === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStartsWith = a.title.toLowerCase().startsWith(queryLower);
        const bStartsWith = b.title.toLowerCase().startsWith(queryLower);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return 0;
      })
      .slice(0, 10);
  }, [searchQuery, activeCategory, checkInDate, checkOutDate, guests, allLocations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isVisible) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible || !searchQuery.trim()) return null;

  return (
    <>
      <div className="fixed inset-0 bg-transparent z-[9980]" onClick={onClose} />
      <div
        ref={suggestionsRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 z-[9981] overflow-hidden"
        style={{
          left: `${searchBarPosition?.left || 0}px`,
          top: `${(searchBarPosition?.top || 0) + (searchBarPosition?.height || 0) + 10}px`,
          width: `${searchBarPosition?.width || 0}px`,
          maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-sm" />
              <span className="text-sm font-medium text-gray-700">Search locations in Ibadan</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded cursor-pointer"
              aria-label="Close suggestions"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 56px)" }}>
          <div className="p-2">
            {generateSuggestions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FontAwesomeIcon icon={faSearch} className="text-2xl mb-2 opacity-50" />
                <p className="text-sm">No matching locations found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Showing {generateSuggestions.length} location{generateSuggestions.length !== 1 ? 's' : ''} in Ibadan
                  </p>
                </div>
                {generateSuggestions.map((suggestion, index) => (
                  <div key={index} className="mb-1 last:mb-0 border-b border-gray-100 last:border-0">
                    <div className="flex items-start p-3 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                        <FontAwesomeIcon 
                          icon={suggestion.type === "search" ? faSearch : faMapMarkerAlt} 
                          className="text-gray-700 text-sm group-hover:text-blue-600"
                        />
                      </div>
                      <div className="flex-1 min-w-0 ml-3">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{suggestion.title}</h4>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {suggestion.type === "search" ? "Search" : "Location"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.description}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              if (onLocationSelected) {
                                onLocationSelected(suggestion.action(true));
                              }
                              onClose();
                            }}
                            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Paste to Search
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-3 py-4 mt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Click "Paste to Search" to insert the exact location text into the search box
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ================== MOBILE SEARCH MODAL ================== */
const MobileSearchModalResults = ({
  searchQuery,
  allLocations = [],
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  activeCategory,
  checkInDate,
  checkOutDate,
  guests,
  onLocationSelected,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  
  const allIbadanLocations = useMemo(() => {
    const allLocationsList = [
      'Akobo', 'Bodija', 'Dugbe', 'Mokola', 'Sango', 'UI',  'Agodi',
      'Jericho', 'Gbagi', 'Apata', 'Ringroad', 'Secretariat', 'Moniya', 'Challenge',
      'Molete', 'Agbowo', 'Sabo', 'Bashorun',  'Ife Road',
      'Akinyele', 'Mokola Hill', 'Sango Roundabout',
      'Iwo Road', 'Gate', 'New Garage', 'Old Ife Road',
      ...allLocations.map(loc => getLocationDisplayName(loc))
    ];
    
    return [...new Set(allLocationsList)].sort();
  }, [allLocations]);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    const queryLower = inputValue.toLowerCase().trim();
    
    const locationMatches = allIbadanLocations
      .filter((location) => {
        const displayName = location.toLowerCase();
        return displayName.includes(queryLower);
      })
      .map((location) => ({
        type: "location",
        title: location,
        location: location,
        description: `${activeCategory}s in ${location}, Ibadan`,
        action: (pasteToSearch = false) => {
          if (pasteToSearch) {
            return location;
          }
          
          const categorySlug = getCategorySlug(activeCategory);
          const locationSlug = createSlug(location);
          
          if (categorySlug && locationSlug) {
            const seoPath = `/${categorySlug}-in-${locationSlug}`;
            const queryParams = new URLSearchParams();
            
            if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
            if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
            if (guests) queryParams.append("guests", JSON.stringify(guests));
            queryParams.append("q", location);
            queryParams.append("cat", activeCategory);
            
            return queryParams.toString() 
              ? `${seoPath}?${queryParams.toString()}`
              : seoPath;
          }
          return '/';
        },
      }));

    if (locationMatches.length === 0 && inputValue.trim()) {
      return [{
        type: "search",
        title: `Search for "${inputValue}"`,
        description: `Find ${activeCategory.toLowerCase()}s matching "${inputValue}"`,
        action: (pasteToSearch = false) => {
          if (pasteToSearch) {
            return inputValue;
          }
          
          const categorySlug = getCategorySlug(activeCategory);
          const queryParams = new URLSearchParams();
          
          if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
          if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
          if (guests) queryParams.append("guests", JSON.stringify(guests));
          queryParams.append("q", inputValue);
          queryParams.append("cat", activeCategory);
          
          if (categorySlug) {
            const seoPath = `/${categorySlug}`;
            return queryParams.toString() 
              ? `${seoPath}?${queryParams.toString()}`
              : seoPath;
          }
          return `/search?${queryParams.toString()}`;
        },
      }];
    }

    return locationMatches.slice(0, 8);
  }, [inputValue, activeCategory, checkInDate, checkOutDate, guests, allIbadanLocations]);

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

  const handleSuggestionClick = (suggestion, pasteToSearch = false) => {
    if (pasteToSearch) {
      if (onLocationSelected) {
        onLocationSelected(suggestion.action(true));
      }
      onClose();
    } else {
      const url = suggestion.action(false);
      onSuggestionClick(url);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const categorySlug = getCategorySlug(activeCategory);
      const queryParams = new URLSearchParams();
      
      if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
      if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
      if (guests) queryParams.append("guests", JSON.stringify(guests));
      queryParams.append("q", inputValue);
      queryParams.append("cat", activeCategory);
      
      const seoPath = categorySlug ? `/${categorySlug}` : '/search';
      const finalUrl = queryParams.toString() 
        ? `${seoPath}?${queryParams.toString()}`
        : seoPath;
      
      onSuggestionClick(finalUrl);
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [isVisible]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99990]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-[99991] flex flex-col"
        style={{ boxShadow: "0 -25px 50px -12px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="lg" />
            </button>
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} size="sm" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none text-gray-900 placeholder:text-gray-500 cursor-text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Search ${activeCategory.toLowerCase()} locations...`}
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            suggestions.length > 0 ? (
              <div className="p-5">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Locations in Ibadan ({suggestions.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="w-full bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                          {suggestion.type === "search" ? (
                            <FontAwesomeIcon 
                              icon={faSearch} 
                              className="text-gray-700 text-lg"
                            />
                          ) : (
                            <FontAwesomeIcon 
                              icon={faMapMarkerAlt} 
                              className="text-gray-700 text-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 text-base">{suggestion.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              suggestion.type === "search" 
                                ? "text-purple-600 bg-purple-50" 
                                : "text-blue-600 bg-blue-50"
                            }`}>
                              {suggestion.type === "search" ? "Search" : "Location"}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleSuggestionClick(suggestion, true)}
                              className="px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex-1"
                            >
                              Paste to Search
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const categorySlug = getCategorySlug(activeCategory);
                    const queryParams = new URLSearchParams();
                    
                    if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
                    if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
                    if (guests) queryParams.append("guests", JSON.stringify(guests));
                    queryParams.append("q", inputValue);
                    queryParams.append("cat", activeCategory);
                    
                    const seoPath = categorySlug ? `/${categorySlug}` : '/search';
                    const finalUrl = queryParams.toString() 
                      ? `${seoPath}?${queryParams.toString()}`
                      : seoPath;
                    
                    onSuggestionClick(finalUrl);
                    onClose();
                  }}
                  className="w-full mt-6 p-4 bg-gray-900 hover:bg-black text-white font-medium rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-base font-medium">Search anyway</p>
                      <p className="text-sm text-gray-300 mt-1">Find {activeCategory}s matching "{inputValue}"</p>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} size="sm" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No matching locations</h3>
                <p className="text-gray-600 text-center max-w-sm mb-8">
                  Try a different location name or search term
                </p>
                <button
                  onClick={() => {
                    const categorySlug = getCategorySlug(activeCategory);
                    const queryParams = new URLSearchParams();
                    
                    if (checkInDate) queryParams.append("checkInDate", checkInDate.toISOString());
                    if (checkOutDate) queryParams.append("checkOutDate", checkOutDate.toISOString());
                    if (guests) queryParams.append("guests", JSON.stringify(guests));
                    queryParams.append("q", inputValue);
                    queryParams.append("cat", activeCategory);
                    
                    const seoPath = categorySlug ? `/${categorySlug}` : '/search';
                    const finalUrl = queryParams.toString() 
                      ? `${seoPath}?${queryParams.toString()}`
                      : seoPath;
                    
                    onSuggestionClick(finalUrl);
                    onClose();
                  }}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black cursor-pointer transition-all duration-200"
                >
                  Search anyway for "{inputValue}"
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Search Ibadan locations</h3>
              <p className="text-gray-600 text-center max-w-sm mb-10">
                Find {activeCategory.toLowerCase()}s in any area of Ibadan
              </p>
              <div className="w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">Popular locations in Ibadan</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Akobo", "Bodija", "Sango", "UI", "Mokola", "Dugbe", "Ringroad", "Challenge", "Iwo Road", "Agodi"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        if (onLocationSelected) {
                          onLocationSelected(term);
                          onClose();
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer transition-all duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Type to search for more locations in Ibadan
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ================== AGODA-STYLE SEARCH MODAL - FULL SCREEN ================== */
const AgodaStyleSearchModal = ({ 
  isVisible, 
  onClose, 
  searchQuery, 
  onSearchChange,
  checkInDate,
  checkOutDate,
  guests,
  onDateChange,
  onGuestsChange,
  category
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localCheckIn, setLocalCheckIn] = useState(checkInDate);
  const [localCheckOut, setLocalCheckOut] = useState(checkOutDate);
  const [localGuests, setLocalGuests] = useState(guests);
  const modalRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [allIbadanLocations] = useState([
    'Akobo', 'Bodija', 'Dugbe', 'Mokola', 'Sango', 'UI', 'Poly', 'Agodi',
    'Jericho', 'Gbagi', 'Apata', 'Ringroad', 'Secretariat', 'Moniya', 'Challenge',
    'Molete', 'Agbowo', 'Sabo', 'Bashorun', 'Ife Road',
    'Akinyele', 'Mokola Hill', 'Sango Roundabout',
    'Iwo Road', 'Gate', 'New Garage', 'Old Ife Road'
  ]);

  const [editingDate, setEditingDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleLocationSearch = (value) => {
    setLocationSearch(value);
    if (value.trim()) {
      const filtered = allIbadanLocations.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = (location) => {
    setLocationSearch(location);
    setLocalSearchQuery(location);
    setShowSuggestions(false);
  };

  const handleGuestChange = (type, delta) => {
    setLocalGuests(prev => {
      const minValue = type === "rooms" ? 1 : 0;
      const newValue = Math.max(minValue, prev[type] + delta);
      return { ...prev, [type]: newValue };
    });
  };

  const handleSave = () => {
    onSearchChange(localSearchQuery);
    onDateChange({ checkIn: localCheckIn, checkOut: localCheckOut });
    onGuestsChange(localGuests);
    onClose();
  };

  const handleDateSelect = (date) => {
    if (editingDate === 'checkin') {
      setLocalCheckIn(date);
    } else if (editingDate === 'checkout') {
      setLocalCheckOut(date);
    }
    setShowDatePicker(false);
    setEditingDate(null);
  };

  const handleDateClick = (type) => {
    setEditingDate(type);
    setShowDatePicker(true);
  };

  const totalGuests = localGuests.adults + localGuests.children;

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      setLocalSearchQuery(searchQuery);
      setLocalCheckIn(checkInDate);
      setLocalCheckOut(checkOutDate);
      setLocalGuests(guests);
      setLocationSearch("");
      setShowSuggestions(false);
      setEditingDate(null);
      setShowDatePicker(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible, searchQuery, checkInDate, checkOutDate, guests]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowSuggestions(false);
        if (showDatePicker) {
          setShowDatePicker(false);
          setEditingDate(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  if (!isVisible) return null;

  const formatDateDisplay = (date) => {
    const day = date.getDate();
    const daySuffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    
    return {
      day: `${day}${daySuffix}`,
      weekday,
      month
    };
  };

  const checkInDisplay = formatDateDisplay(localCheckIn);
  const checkOutDisplay = formatDateDisplay(localCheckOut);

  const DatePickerComponent = ({ onSelect, selectedDate, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
    const [selectedDay, setSelectedDay] = useState(selectedDate ? selectedDate.getDate() : new Date().getDate());

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      return new Date(year, month, 1).getDay();
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleDayClick = (day) => {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDay(day);
      onSelect(selectedDate);
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDay;
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer
            ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="fixed inset-0 bg-white z-[10000] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h3 className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>
            {editingDate === 'checkin' ? 'Select Check-in Date' : 'Select Check-out Date'}
          </h3>
          <div className="w-10"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h3 className="font-semibold text-gray-900" style={{ fontSize: '12.5px' }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {days}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => {
                const today = new Date();
                onSelect(today);
              }}
              className="w-full py-3 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 cursor-pointer"
              style={{ fontSize: '12.5px' }}
            >
              Select Today
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-[99991] flex flex-col overflow-hidden">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
        >
          <FontAwesomeIcon icon={faChevronLeft} size="lg" />
        </button>
        <h2 className="text-xl font-bold text-gray-900" style={{ fontSize: '12.5px' }}>Edit Search</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-6">
          <div className="space-y-8">
            <div>
              <label className="block font-semibold text-gray-900 mb-4" style={{ fontSize: '12.5px' }}>
                Where are you going?
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" style={{ fontSize: '12.5px' }} />
                </div>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => handleLocationSearch(e.target.value)}
                  placeholder={`Search ${category.toLowerCase()}s in Ibadan...`}
                  className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontSize: '12.5px' }}
                  autoFocus
                />
                {locationSearch && (
                  <button
                    onClick={() => {
                      setLocationSearch("");
                      setShowSuggestions(false);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '12.5px' }} />
                  </button>
                )}
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                    {suggestions.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 flex items-center gap-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" style={{ fontSize: '12.5px' }} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900" style={{ fontSize: '12.5px' }}>{location}</div>
                          <div className="text-gray-500" style={{ fontSize: '12.5px' }}>{category}s in {location}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '12.5px' }}>Select Dates</h3>
              
              <div className="flex justify-between items-start">
                <div 
                  onClick={() => handleDateClick('checkin')}
                  className="flex flex-col items-start p-0 hover:opacity-80 active:opacity-60 cursor-pointer"
                >
                  <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '12.5px' }}>Check-in</div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">{checkInDisplay.day}</span>
                    <div className="mt-1">
                      <span className="text-gray-900 font-medium block" style={{ fontSize: '12.5px' }}>{checkInDisplay.weekday}</span>
                      <span className="text-gray-600 block" style={{ fontSize: '12.5px' }}>{checkInDisplay.month}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8">
                  <div className="text-gray-400" style={{ fontSize: '12.5px' }}>→</div>
                </div>
                
                <div 
                  onClick={() => handleDateClick('checkout')}
                  className="flex flex-col items-start p-0 hover:opacity-80 active:opacity-60 cursor-pointer"
                >
                  <div className="text-xs text-gray-600 mb-1" style={{ fontSize: '12.5px' }}>Check-out</div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">{checkOutDisplay.day}</span>
                    <div className="mt-1">
                      <span className="text-gray-900 font-medium block" style={{ fontSize: '12.5px' }}>{checkOutDisplay.weekday}</span>
                      <span className="text-gray-600 block" style={{ fontSize: '12.5px' }}>{checkOutDisplay.month}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4" style={{ fontSize: '12.5px' }}>
                {category.includes('restaurant') ? 'Number of People' : 'Guests & Rooms'}
              </h3>
              
              {category.includes('restaurant') ? (
                <div>
                  <div className="flex justify-between items-center p-5 border border-gray-300 rounded-2xl bg-white">
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>Number of People</div>
                      <div className="text-gray-500 mt-1" style={{ fontSize: '12.5px' }}>How many people are coming?</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleGuestChange("adults", -1)}
                        disabled={localGuests.adults <= 1}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '12.5px' }} />
                      </button>
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>{totalGuests}</div>
                        <div className="text-gray-500" style={{ fontSize: '12.5px' }}>people</div>
                      </div>
                      <button
                        onClick={() => handleGuestChange("adults", 1)}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12.5px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-5 border border-gray-300 rounded-2xl bg-white">
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>Rooms</div>
                      <div className="text-gray-500 mt-1" style={{ fontSize: '12.5px' }}>Number of rooms</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleGuestChange("rooms", -1)}
                        disabled={localGuests.rooms <= 1}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '12.5px' }} />
                      </button>
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>{localGuests.rooms}</div>
                        <div className="text-gray-500" style={{ fontSize: '12.5px' }}>rooms</div>
                      </div>
                      <button
                        onClick={() => handleGuestChange("rooms", 1)}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12.5px' }} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-5 border border-gray-300 rounded-2xl bg-white">
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>Adults</div>
                      <div className="text-gray-500 mt-1" style={{ fontSize: '12.5px' }}>Age 18+</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleGuestChange("adults", -1)}
                        disabled={localGuests.adults <= 1}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '12.5px' }} />
                      </button>
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>{localGuests.adults}</div>
                        <div className="text-gray-500" style={{ fontSize: '12.5px' }}>adults</div>
                      </div>
                      <button
                        onClick={() => handleGuestChange("adults", 1)}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12.5px' }} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-5 border border-gray-300 rounded-2xl bg-white">
                    <div>
                      <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>Children</div>
                      <div className="text-gray-500 mt-1" style={{ fontSize: '12.5px' }}>Age 0-17</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleGuestChange("children", -1)}
                        disabled={localGuests.children <= 0}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '12.5px' }} />
                      </button>
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold text-gray-900" style={{ fontSize: '12.5px' }}>{localGuests.children}</div>
                        <div className="text-gray-500" style={{ fontSize: '12.5px' }}>children</div>
                      </div>
                      <button
                        onClick={() => handleGuestChange("children", 1)}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '12.5px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex-shrink-0">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-bold rounded-xl hover:from-[#00c97b] hover:to-teal-600 transition-all duration-300 active:scale-[0.98] shadow-lg"
          style={{ fontSize: '12.5px' }}
        >
          Apply Search
        </button>
      </div>

      {showDatePicker && editingDate && (
        <DatePickerComponent
          onSelect={handleDateSelect}
          selectedDate={editingDate === 'checkin' ? localCheckIn : localCheckOut}
          onClose={() => {
            setShowDatePicker(false);
            setEditingDate(null);
          }}
        />
      )}
    </div>
  );
};

/* ================== BACK BUTTON ================== */
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
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors active:scale-95 cursor-pointer ${className}`}
      aria-label="Go back"
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700 text-lg" />
    </button>
  );
};

/* ================== MAIN SEARCH RESULTS COMPONENT ================== */
const SearchResults = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const urlSlug = params['*'] || '';
  const { category: urlCategorySlug, location: urlLocationSlug } = parseSeoSlug(urlSlug);
  
  const urlCategory = urlCategorySlug ? mapCategorySlugToDisplay(urlCategorySlug) : null;
  const urlLocation = urlLocationSlug ? urlLocationSlug.charAt(0).toUpperCase() + urlLocationSlug.slice(1) : null;
  
  const searchQuery = searchParams.get("q") || urlLocation || "";
  const checkInDateParam = searchParams.get("checkInDate");
  const checkOutDateParam = searchParams.get("checkOutDate");
  const guestsParam = searchParams.get("guests");
  const originalCategory = searchParams.get("cat");
  
  const finalCategory = originalCategory || urlCategory || "All Categories";
  
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
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedCategoryButtons, setSelectedCategoryButtons] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [previousCategory, setPreviousCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const [editingCheckIn, setEditingCheckIn] = useState(false);
  const [editingCheckOut, setEditingCheckOut] = useState(false);
  const [editingGuests, setEditingGuests] = useState(false);
  const [showEditCalendar, setShowEditCalendar] = useState(false);
  const [showEditGuestSelector, setShowEditGuestSelector] = useState(false);
  
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
  const [showAgodaModal, setShowAgodaModal] = useState(false);
  
  const [isUsingInitialState, setIsUsingInitialState] = useState({
    location: true,
    category: true,
    search: true
  });
  
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const [shouldFetchData, setShouldFetchData] = useState(true);

  const checkInDate = checkInDateParam ? new Date(checkInDateParam) : new Date();
  const checkOutDate = checkOutDateParam ? new Date(checkOutDateParam) : new Date(new Date().setDate(new Date().getDate() + 1));
  const guests = guestsParam ? JSON.parse(guestsParam) : { adults: 2, children: 0, rooms: 1 };

  const { listings, loading, error, apiResponse, filteredCounts, allLocations } = useBackendListings(
    localSearchQuery, 
    activeFilters,
    finalCategory,
    null,
    shouldFetchData
  );

  useEffect(() => {
    const initialFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };

    if (finalCategory && finalCategory !== "All Categories") {
      const displayName = getCategoryDisplayName(finalCategory);
      if (displayName !== "All Categories" && displayName !== "All") {
        initialFilters.categories = [displayName];
        
        const buttonKey = getCategoryButtonKey(finalCategory.toLowerCase());
        setSelectedCategoryButtons([buttonKey]);
      }
    }

    const urlLocationParam = searchParams.get("location");
    if (urlLocationParam) {
      const displayName = getLocationDisplayName(urlLocationParam);
      if (displayName !== "All Locations" && displayName !== "All") {
        initialFilters.locations = [displayName];
      }
    }
    else if (urlLocation && (!localSearchQuery || localSearchQuery.trim() === '')) {
      const displayName = getLocationDisplayName(urlLocation);
      if (displayName !== "All Locations" && displayName !== "All") {
        initialFilters.locations = [displayName];
      }
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice) {
      initialFilters.priceRange.min = minPrice;
    }
    if (maxPrice) {
      initialFilters.priceRange.max = maxPrice;
    }

    const minRating = searchParams.get("minRating");
    if (minRating) {
      initialFilters.ratings = [parseInt(minRating)];
    }

    const sortParam = searchParams.get("sort");
    if (sortParam && ["relevance", "price_low", "price_high", "rating", "name"].includes(sortParam)) {
      initialFilters.sortBy = sortParam;
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
    
    setIsUsingInitialState({
      location: !!urlLocation || !!urlLocationParam,
      category: !!finalCategory && finalCategory !== "All Categories",
      search: !!localSearchQuery
    });
  }, [finalCategory, urlLocation, localSearchQuery, searchParams]);

  const getCategoryButtonKey = (categoryName) => {
    const catLower = categoryName.toLowerCase();
    if (catLower.includes("services") || catLower.includes("vendor")) return "vendor";
    if (catLower.includes("shortlet")) return "shortlet";
    if (catLower.includes("hotel")) return "hotel";
    if (catLower.includes("restaurant")) return "restaurant";
    return "hotel";
  };

  const handleLocationSelected = (locationText) => {
    setLocalSearchQuery(locationText);
    
    if (activeFilters.locations.length > 0) {
      const updatedFilters = {
        ...activeFilters,
        locations: [],
      };
      setActiveFilters(updatedFilters);
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFilterChange = (newFilters) => {
    if (newFilters.locations.length > 0 && localSearchQuery) {
      setLocalSearchQuery("");
      
      setIsUsingInitialState(prev => ({
        ...prev,
        search: false
      }));
    }
    
    if (newFilters.locations.length === 0 && activeFilters.locations.length > 0) {
      setIsUsingInitialState(prev => ({
        ...prev,
        location: false
      }));
    }
    
    setActiveFilters(newFilters);
    
    const params = new URLSearchParams();
    
    params.set("cat", finalCategory);
    
    params.set("checkInDate", checkInDate.toISOString());
    params.set("checkOutDate", checkOutDate.toISOString());
    
    if (guests) {
      params.set("guests", JSON.stringify(guests));
    }
    
    if (newFilters.locations.length === 0 && localSearchQuery) {
      params.set("q", localSearchQuery);
    }
    
    if (newFilters.locations.length > 0) {
      params.set("location", newFilters.locations[0]);
      params.delete("q");
    }
    
    if (newFilters.priceRange?.min) {
      params.set("minPrice", newFilters.priceRange.min);
    }
    if (newFilters.priceRange?.max) {
      params.set("maxPrice", newFilters.priceRange.max);
    }
    
    if (newFilters.ratings && newFilters.ratings.length > 0) {
      params.set("minRating", Math.min(...newFilters.ratings));
    }
    
    if (newFilters.sortBy && newFilters.sortBy !== 'relevance') {
      params.set("sort", newFilters.sortBy);
    }
    
    const categorySlug = getCategorySlug(finalCategory);
    let locationSlug = null;
    
    if (newFilters.locations && newFilters.locations.length > 0) {
      locationSlug = createSlug(newFilters.locations[0]);
    }
    else if (localSearchQuery && looksLikeLocation(localSearchQuery)) {
      locationSlug = createSlug(localSearchQuery);
    }
    
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
    
    const finalUrl = params.toString() 
      ? `${seoPath}?${params.toString()}`
      : seoPath;
    
    navigate(finalUrl);
  };

  const handleSearchSubmit = (searchValue = null) => {
    const queryToUse = searchValue || localSearchQuery.trim();
    
    setShouldFetchData(true);
    
    if (queryToUse || finalCategory) {
      const resetFilters = {
        ...activeFilters,
        locations: [],
        categories: activeFilters.categories.length > 0 ? activeFilters.categories : [finalCategory],
      };
      setActiveFilters(resetFilters);
      
      setIsUsingInitialState(prev => ({
        ...prev,
        location: false,
        search: true
      }));
      
      const categorySlug = getCategorySlug(finalCategory);
      const locationSlug = queryToUse ? createSlug(queryToUse.trim()) : null;
      
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
      
      queryParams.append("checkInDate", checkInDate.toISOString());
      queryParams.append("checkOutDate", checkOutDate.toISOString());
      
      if (guests) {
        queryParams.append("guests", JSON.stringify(guests));
      }
      
      if (queryToUse) {
        queryParams.append("q", queryToUse.trim());
      }
      
      queryParams.append("cat", finalCategory);
      
      queryParams.delete("location");
      queryParams.delete("location.area");
      
      const finalUrl = queryParams.toString() 
        ? `${seoPath}?${queryParams.toString()}`
        : seoPath;
      
      navigate(finalUrl);
      setShowSuggestions(false);
      setShowMobileSearchModal(false);
    }
  };

  const handleCategoryButtonClick = (categoryKey) => {
    setIsSwitchingCategory(true);
    const currentCategory = activeFilters.categories[0] || 
                           (selectedCategoryButtons[0] ? 
                            getCategoryDisplayName(selectedCategoryButtons[0]) : 
                            'All Categories');
    setPreviousCategory(currentCategory);
    
    const categoryMap = {
      'hotel': 'Hotels',
      'restaurant': 'Restaurants',
      'shortlet': 'Shortlets',
      'vendor': 'Vendors'
    };
    setNewCategory(categoryMap[categoryKey] || categoryKey);
    
    const categoryActualMap = {
      'hotel': 'hotel',
      'restaurant': 'restaurant',
      'shortlet': 'shortlet',
      'vendor': 'services'
    };
    
    const actualCategory = categoryActualMap[categoryKey] || categoryKey;
    const newSelectedCategories = [categoryKey];
    setSelectedCategoryButtons(newSelectedCategories);
    
    const queryParams = new URLSearchParams();
    
    queryParams.append("checkInDate", checkInDate.toISOString());
    queryParams.append("checkOutDate", checkOutDate.toISOString());
    
    if (guests) {
      queryParams.append("guests", JSON.stringify(guests));
    }
    
    queryParams.append("cat", actualCategory);
    
    const categorySlug = getCategorySlug(actualCategory);
    const locationSlug = localSearchQuery ? createSlug(localSearchQuery) : null;
    
    let seoPath = '';
    if (categorySlug && locationSlug) {
      seoPath = `/${categorySlug}-in-${locationSlug}`;
    } else if (categorySlug) {
      seoPath = `/${categorySlug}`;
    } else {
      seoPath = '/search';
    }
    
    const finalUrl = queryParams.toString() 
      ? `${seoPath}?${queryParams.toString()}`
      : seoPath;
    
    navigate(finalUrl);
    
    const displayName = getCategoryDisplayName(actualCategory);
    const updatedFilters = {
      ...activeFilters,
      categories: [displayName],
      locations: [],
    };
    setActiveFilters(updatedFilters);
    
    setIsUsingInitialState({
      location: false,
      category: true,
      search: false
    });
    
    setTimeout(() => {
      setIsSwitchingCategory(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!showSuggestions || listings.length === 0) {
        handleSearchSubmit();
      }
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const toggleDesktopFilters = () => {
    setShowDesktopFilters(!showDesktopFilters);
  };

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    
    setShouldFetchData(false);
    
    if (value.trim() && activeFilters.locations.length > 0) {
      const updatedFilters = {
        ...activeFilters,
        locations: [],
      };
      setActiveFilters(updatedFilters);
      
      setIsUsingInitialState(prev => ({
        ...prev,
        location: false
      }));
    }
    
    if (!isMobile && value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  };

  const handleSearchFocus = () => {
    if (activeFilters.locations.length > 0) {
      const updatedFilters = {
        ...activeFilters,
        locations: [],
      };
      setActiveFilters(updatedFilters);
      
      setIsUsingInitialState(prev => ({
        ...prev,
        location: false
      }));
    }
    
    if (!isMobile && localSearchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    setShowSuggestions(false);
    
    setShouldFetchData(true);
    
    const updatedFilters = {
      locations: [],
      categories: activeFilters.categories.length > 0 ? activeFilters.categories : [finalCategory],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };
    setActiveFilters(updatedFilters);
    
    setIsUsingInitialState({
      location: false,
      category: true,
      search: false
    });
    
    const categorySlug = getCategorySlug(finalCategory);
    const queryParams = new URLSearchParams();
    
    queryParams.append("checkInDate", checkInDate.toISOString());
    queryParams.append("checkOutDate", checkOutDate.toISOString());
    
    if (guests) {
      queryParams.append("guests", JSON.stringify(guests));
    }
    
    queryParams.append("cat", finalCategory);
    
    const seoPath = categorySlug ? `/${categorySlug}` : '/search';
    const finalUrl = queryParams.toString() 
      ? `${seoPath}?${queryParams.toString()}`
      : seoPath;
    
    navigate(finalUrl);
  };

  const handleClearLocationFilters = () => {
    if (activeFilters.locations.length > 0) {
      const updatedFilters = {
        ...activeFilters,
        locations: [],
      };
      setActiveFilters(updatedFilters);
      
      setIsUsingInitialState(prev => ({
        ...prev,
        location: false
      }));
    }
  };

  const handleSuggestionClick = useCallback(
    (url) => {
      setShouldFetchData(true);
      navigate(url);
      setShowSuggestions(false);
    },
    [navigate]
  );

  const getPageTitle = () => {
    if (activeFilters.locations.length > 0 && finalCategory && finalCategory !== "All Categories") {
      return `${finalCategory}s in ${activeFilters.locations[0]}`;
    } else if (localSearchQuery && finalCategory && finalCategory !== "All Categories") {
      return `${finalCategory}s in ${localSearchQuery}`;
    } else if (activeFilters.locations.length > 0) {
      return `Places in ${activeFilters.locations[0]}`;
    } else if (localSearchQuery) {
      return `Search Results for "${localSearchQuery}"`;
    } else if (finalCategory && finalCategory !== "All Categories") {
      return `${finalCategory}s in Ibadan`;
    }
    return "All Places in Ibadan";
  };

  const getPageDescription = () => {
    if (activeFilters.locations.length > 0 && finalCategory && finalCategory !== "All Categories") {
      return `Browse the best ${finalCategory.toLowerCase()} places in ${activeFilters.locations[0]}, Ibadan.`;
    } else if (localSearchQuery && finalCategory && finalCategory !== "All Categories") {
      return `Browse the best ${finalCategory.toLowerCase()} places in ${localSearchQuery}, Ibadan.`;
    } else if (activeFilters.locations.length > 0) {
      return `Discover amazing places in ${activeFilters.locations[0]}, Ibadan.`;
    } else if (finalCategory && finalCategory !== "All Categories") {
      return `Browse the best ${finalCategory.toLowerCase()} places in Ibadan.`;
    } else if (localSearchQuery) {
      return `Find the best places in Ibadan matching "${localSearchQuery}".`;
    }
    return "Browse all places in Ibadan.";
  };

  
  const getSearchPlaceholder = () => {
    if (finalCategory.includes('Vendor')) return "What service do you need?";
    if (finalCategory.includes('Restaurant')) return "Search by restaurant name, cuisine, or area...";
    if (finalCategory.includes('Shortlet')) return "Search by shortlet name, area, or location...";
    if (finalCategory.includes('Hotel')) return "Search by hotel name, area, or location...";
    return "Search...";
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!searchContainerRef.current || isMobile) return;
    const container = searchContainerRef.current;
    const updateSearchBarPosition = () => {
      const rect = container.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      setSearchBarPosition({
        left: rect.left + scrollX,
        top: rect.top + scrollY,
        width: rect.width,
        height: rect.height,
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

  const renderCategorySpecificFields = () => {
    const activeCategory = finalCategory.toLowerCase();
    const totalGuests = guests ? (guests.adults + guests.children) : 0;
    
    if (activeCategory.includes('hotel') || activeCategory.includes('shortlet')) {
      return (
        <>
          <div className="flex items-center gap-2">
            <div
              onClick={() => setShowAgodaModal(true)}
              className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
              <div>
                <div className="text-xs text-gray-600 mb-1">Check-in</div>
                <div className="font-medium text-gray-900 text-sm">
                  {checkInDate ? formatShortDate(checkInDate) : "Select date"}
                </div>
              </div>
            </div>
            
            <div className="text-gray-400">→</div>
            
            <div
              onClick={() => setShowAgodaModal(true)}
              className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
            >
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
              <div>
                <div className="text-xs text-gray-600 mb-1">Check-out</div>
                <div className="font-medium text-gray-900 text-sm">
                  {checkOutDate ? formatShortDate(checkOutDate) : "Select date"}
                </div>
              </div>
            </div>
          </div>
          
          <div
            onClick={() => setShowAgodaModal(true)}
            className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
          >
            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
            <div>
              <div className="text-xs text-gray-600 mb-1">Guests & Rooms</div>
              <div className="font-medium text-gray-900 text-sm">
                {guests ? `${totalGuests} guest${totalGuests !== 1 ? 's' : ''} • ${guests.rooms} room${guests.rooms !== 1 ? 's' : ''}` : "Select"}
              </div>
            </div>
          </div>
        </>
      );
    }
    
    else if (activeCategory.includes('restaurant')) {
      return (
        <>
          <div
            onClick={() => setShowAgodaModal(true)}
            className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
            <div>
              <div className="text-xs text-gray-600 mb-1">When are you visiting?</div>
              <div className="font-medium text-gray-900 text-sm">
                {checkInDate ? formatShortDate(checkInDate) : "Select date"}
              </div>
            </div>
          </div>
          
          <div
            onClick={() => setShowAgodaModal(true)}
            className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
          >
            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
            <div>
              <div className="text-xs text-gray-600 mb-1">Number of People</div>
              <div className="font-medium text-gray-900 text-sm">
                {guests ? `${totalGuests} ${totalGuests === 1 ? 'person' : 'people'}` : "Select"}
              </div>
            </div>
          </div>
        </>
      );
    }
    
    else if (activeCategory.includes('vendor') || activeCategory.includes('services')) {
      return (
        <div
          onClick={() => setShowAgodaModal(true)}
          className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-600 mb-1">Preferred service date</div>
            <div className="font-medium text-gray-900 text-sm">
              {checkInDate ? formatShortDate(checkInDate) : "Select date"}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <>
        <div
          onClick={() => setShowAgodaModal(true)}
          className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-600 mb-1">Check-in</div>
            <div className="font-medium text-gray-900 text-sm">
              {checkInDate ? formatShortDate(checkInDate) : "Select date"}
            </div>
          </div>
        </div>
        
        <div
          onClick={() => setShowAgodaModal(true)}
          className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-600 mb-1">Check-out</div>
            <div className="font-medium text-gray-900 text-sm">
              {checkOutDate ? formatShortDate(checkOutDate) : "Select date"}
            </div>
          </div>
        </div>
        
        <div
          onClick={() => setShowAgodaModal(true)}
          className="px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer min-w-[140px] flex items-center gap-3"
        >
          <FontAwesomeIcon icon={faUser} className="text-gray-400" />
          <div>
            <div className="text-xs text-gray-600 mb-1">Guests & Rooms</div>
            <div className="font-medium text-gray-900 text-sm">
              {guests ? `${totalGuests} guest${totalGuests !== 1 ? 's' : ''} • ${guests.rooms} room${guests.rooms !== 1 ? 's' : ''}` : "Select"}
            </div>
          </div>
        </div>
      </>
    );
  };

  const getSearchButtonText = () => {
    const activeCategory = finalCategory.toLowerCase();
    if (activeCategory.includes('restaurant')) return "Find Restaurant";
    if (activeCategory.includes('shortlet')) return "Find Shortlet";
    if (activeCategory.includes('vendor') || activeCategory.includes('services')) return "Find Vendor";
    return "Find Hotel";
  };

  const handleDateSelect = (date) => {
    const params = new URLSearchParams(window.location.search);
    
    if (editingCheckIn) {
      params.set("checkInDate", date.toISOString());
    } else if (editingCheckOut) {
      params.set("checkOutDate", date.toISOString());
    }
    
    setSearchParams(params);
    setEditingCheckIn(false);
    setEditingCheckOut(false);
    setShowEditCalendar(false);
  };

  const handleGuestsUpdate = (newGuests) => {
    const params = new URLSearchParams(window.location.search);
    params.set("guests", JSON.stringify(newGuests));
    setSearchParams(params);
    setEditingGuests(false);
    setShowEditGuestSelector(false);
  };

  const handleAgodaModalSave = ({ checkIn, checkOut, guests: newGuests }) => {
    const params = new URLSearchParams(window.location.search);
    params.set("checkInDate", checkIn.toISOString());
    params.set("checkOutDate", checkOut.toISOString());
    params.set("guests", JSON.stringify(newGuests));
    setSearchParams(params);
    setShowAgodaModal(false);
  };

  if (loading && shouldFetchData && !isSwitchingCategory) {
    return <UnifiedLoadingScreen isMobile={isMobile} category={finalCategory} />;
  }

  if (error) {
    const isNetworkError = error?.includes?.('timeout') || 
                           error?.includes?.('Network Error') || 
                           error?.includes?.('Failed to load');
    const errorMessage = isNetworkError 
      ? "Unable to load the search results. The request took too long to complete."
      : "The search results could not be loaded. Please try again.";

    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col mt-16 items-center justify-center min-h-[60vh] px-4">
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
            {isNetworkError ? "Resource Loading Error" : "Search Results Error"}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
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

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil((apiResponse?.results || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = listings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen  font-manrope w-full overflow-x-hidden">
      <Meta
        title={`${getPageTitle()} | Ajani Directory`}
        description={getPageDescription()}
        url={`https://ajani.ai${location.pathname}${location.search}`}
        image="https://ajani.ai/images/search-og.jpg"
      />

      <ToastContainer />
      
      {isSwitchingCategory && (
        <CategorySwitchLoader 
          isMobile={isMobile}
          previousCategory={previousCategory}
          newCategory={newCategory}
        />
      )}

      <Header />

      <main
        className="pb-8 w-full mx-auto max-w-[100vw] pt-15 px-2 md:px-4"
        style={{
          paddingLeft: isMobile ? "0.5rem" : "1rem",
          paddingRight: isMobile ? "0.5rem" : "1rem",
        }}
      >
        <div
          className="z-30 py-4 md:py-6 relative w-full"
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
                    <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
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
                                        ref={searchInputRef}
                                        type="text"
                                        value={localSearchQuery}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          handleSearchChange(value);
                                          if (searchDebounceRef.current) {
                                            clearTimeout(searchDebounceRef.current);
                                          }
                                          if (!isMobile && value.trim().length > 0) {
                                            setShowSuggestions(true);
                                          } else {
                                            setShowSuggestions(false);
                                          }
                                        }}
                                        onFocus={handleSearchFocus}
                                        onKeyPress={handleKeyPress}
                                        placeholder={getSearchPlaceholder()}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 cursor-text"
                                      />
                                      {(localSearchQuery || isUsingInitialState.search) && (
                                        <button
                                          onClick={() => {
                                            handleClearSearch();
                                            setIsUsingInitialState(prev => ({
                                              ...prev,
                                              search: false
                                            }));
                                          }}
                                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                          title="Clear search and start fresh"
                                        >
                                          <FontAwesomeIcon icon={faTimesCircle} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {renderCategorySpecificFields()}
                                  
                                  <button
                                    onClick={handleSearchSubmit}
                                    type="button"
                                    className="px-6 py-3 bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-semibold rounded-lg hover:from-[#00c97b] hover:to-teal-600 transition-all duration-300 cursor-pointer"
                                  >
                                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                                    {getSearchButtonText()}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => setShowAgodaModal(true)}
                            className="bg-gray-200 rounded-[15px]  px-3 py-2.5 text-xs flex items-center gap-2 cursor-pointer w-full ml-0"
                          >
                            <FontAwesomeIcon icon={faSearch} className="text-gray-700 text-[15px] flex-shrink-0" />
                            <div className="flex flex-col text-left truncate w-full">
                              <span className="text-gray-900 font-medium text-[13px] truncate">
                                {getLocationDisplayName(activeFilters.locations[0] || localSearchQuery) || "Where to?"}
                              </span>
                              <span className="text-gray-600 text-[12px] truncate">
                                {checkInDate && checkOutDate ? 
                                  `${formatShortDate(checkInDate)} - ${formatShortDate(checkOutDate)}${guests ? ` • ${guests.adults + guests.children} guest${(guests.adults + guests.children) !== 1 ? 's' : ''}` : ''}` : 
                                  "Select dates"
                                }
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

          <div className="mt-4 md:mt-6">
            <CategoryButtons
              selectedCategories={selectedCategoryButtons}
              onCategoryClick={handleCategoryButtonClick}
              isSwitchingCategory={isSwitchingCategory}
            />
          </div>
        </div>

        {!isMobile && (
          <DesktopSearchSuggestions
            searchQuery={localSearchQuery}
            allLocations={allLocations}
            onSuggestionClick={handleSuggestionClick}
            onLocationSelected={handleLocationSelected}
            onClose={() => setShowSuggestions(false)}
            isVisible={showSuggestions && !loading}
            searchBarPosition={searchBarPosition}
            activeCategory={finalCategory}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guests={guests}
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
            onClearSearchQuery={() => setLocalSearchQuery("")}
            onClearLocationFilters={handleClearLocationFilters}
            category={finalCategory}
            searchQuery={localSearchQuery}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guests={guests}
            navigate={navigate}
          />
        )}

        {isMobile && showMobileFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            allLocations={allLocations}
            currentFilters={activeFilters}
            onClose={() => setShowMobileFilters(false)}
            isMobileModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
            onClearSearchQuery={() => setLocalSearchQuery("")}
            onClearLocationFilters={handleClearLocationFilters}
            category={finalCategory}
            searchQuery={localSearchQuery}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guests={guests}
            navigate={navigate}
          />
        )}

        <AgodaStyleSearchModal
          isVisible={showAgodaModal}
          onClose={() => setShowAgodaModal(false)}
          searchQuery={localSearchQuery}
          onSearchChange={handleSearchChange}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          guests={guests}
          onDateChange={({ checkIn, checkOut }) => {
            const params = new URLSearchParams(window.location.search);
            params.set("checkInDate", checkIn.toISOString());
            params.set("checkOutDate", checkOut.toISOString());
            setSearchParams(params);
          }}
          onGuestsChange={(newGuests) => {
            const params = new URLSearchParams(window.location.search);
            params.set("guests", JSON.stringify(newGuests));
            setSearchParams(params);
          }}
          category={finalCategory}
        />

        {showEditCalendar && (
          <SimpleCalendar
            onSelect={handleDateSelect}
            onClose={() => {
              setShowEditCalendar(false);
              setEditingCheckIn(false);
              setEditingCheckOut(false);
            }}
            selectedDate={editingCheckIn ? checkInDate : checkOutDate}
            isCheckOut={editingCheckOut}
          />
        )}
        
        {showEditGuestSelector && editingGuests && (
          <GuestSelector
            guests={guests}
            onChange={handleGuestsUpdate}
            onClose={() => {
              setShowEditGuestSelector(false);
              setEditingGuests(false);
            }}
            category={finalCategory.toLowerCase()}
          />
        )}

        {isMobile && showMobileSearchModal && (
          <MobileSearchModalResults
            searchQuery={localSearchQuery}
            allLocations={allLocations}
            onSuggestionClick={handleSuggestionClick}
            onLocationSelected={handleLocationSelected}
            onClose={() => setShowMobileSearchModal(false)}
            onTyping={handleSearchChange}
            isVisible={showMobileSearchModal}
            activeCategory={finalCategory}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            guests={guests}
          />
        )}

        <div
          className="flex flex-col lg:flex-row gap-6 w-full"
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
                onClearSearchQuery={() => setLocalSearchQuery("")}
                onClearLocationFilters={handleClearLocationFilters}
                category={finalCategory}
                searchQuery={localSearchQuery}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                guests={guests}
                navigate={navigate}
              />
            </div>
          )}

          <div
            className="lg:w-3/4 w-full"
            ref={resultsRef}
            style={{
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto'
            }}
          >
            <div className="mb-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div className="flex-1 flex items-center gap-3 w-full">
                  {isMobile && filtersInitialized && (
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h1 className="text-[16px] lg:text-xl font-bold text-[#00065A] mb-1">
                          {getPageTitle()}
                        </h1>
                       
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <button
                            onClick={toggleMobileFilters}
                            className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm cursor-pointer ml-2"
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
                              className="appearance-none px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] transition-colors cursor-pointer pr-12"
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
                    </div>
                  )}
                  {!isMobile && (
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1">
                        <h1 className="text-xl font-bold text-[#00065A] mb-1">
                          {getPageTitle()}
                        </h1>
                       
                      </div>
                    </div>
                  )}
                </div>
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

            <div
              className="space-y-6 w-full"
            >
              {listings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 w-full">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-4xl text-gray-300 mb-4 block"
                  />
                  <h3 className="text-xl text-gray-800 mb-2">
                    No matching results found
                  </h3>
                  <p className="text-sm text-gray-500 mt-4">
                    Try adjusting your search or filters
                  </p>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Searching for: {finalCategory !== "All Categories" ? finalCategory : "All categories"}</p>
                    <p>Location: {activeFilters.locations[0] || localSearchQuery || "All locations"}</p>
                  </div>
                </div>
              ) : (
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
                                  category={listing.category || "general"}
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
                            category={listing.category || "general"}
                            isMobile={isMobile}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && listings.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center space-x-2 mt-8 w-full">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                            onClick={() => setCurrentPage(page)}
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
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

      <style jsx global>{`
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
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .backdrop-blur-xs {
          backdrop-filter: blur(2px);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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

        @media (max-width: 768px) {
          main, 
          .pl-3.pr-0,
          [class*="px-"] {
            padding-right: 0 !important;
            padding-left: 4px !important;
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
            padding-right: 8px;
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
      `}</style>
    </div>
  );
};

export default SearchResults;