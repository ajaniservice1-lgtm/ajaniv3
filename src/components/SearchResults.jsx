// src/components/SearchResults.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSearch,
  faTimes,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { MdFavoriteBorder } from "react-icons/md";
import { PiSliders } from "react-icons/pi";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";

// Import your Google Sheets hook
const useGoogleSheet = (sheetId, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sheetId || !apiKey) {
      setError("⚠️ Missing SHEET_ID or API_KEY");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        let result = [];
        if (
          json.values &&
          Array.isArray(json.values) &&
          json.values.length > 1
        ) {
          const headers = json.values[0];
          const rows = json.values.slice(1);
          result = rows
            .filter((row) => Array.isArray(row) && row.length > 0)
            .map((row, index) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
              obj.id = obj.id || `item-${index}`;
              return obj;
            });
        }
        setData(result);
      } catch (err) {
        console.error("Google Sheets fetch error:", err);
        setError("⚠️ Failed to load directory. Try again later.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, apiKey]);

  return { data: Array.isArray(data) ? data : [], loading, error };
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
  if (!category || category === "All Categories") return "All Categories";

  // Split by dot and get the part after the first dot
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
  if (!location) return "All Locations";

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

// Helper function to extract words after dots for categories
const extractDisplayName = (text) => {
  if (!text) return "";
  const parts = text.split(".");
  if (parts.length > 1) {
    return parts.slice(1).join(".").trim();
  }
  return text.trim();
};

const getCardImages = (item) => {
  const raw = item["image url"] || "";
  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u && u.startsWith("http"));

  if (urls.length > 0) return urls;

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

// FilterDropdown Component
const FilterDropdown = ({ isOpen, onClose, onFilterChange }) => {
  const dropdownRef = useRef(null);
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: "", max: "" },
    reviews: [],
    badges: [],
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleReviewChange = (stars) => {
    setFilters((prev) => ({
      ...prev,
      reviews: prev.reviews.includes(stars)
        ? prev.reviews.filter((s) => s !== stars)
        : [...prev.reviews, stars],
    }));
  };

  const handleBadgeChange = (badge) => {
    setFilters((prev) => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter((b) => b !== badge)
        : [...prev.badges, badge],
    }));
  };

  const handlePriceChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value,
      },
    }));
  };

  const handleReset = () => {
    setFilters({
      categories: [],
      priceRange: { min: "", max: "" },
      reviews: [],
      badges: [],
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-gray-900">Filter Options</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Category Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Category
          </h4>
          <div className="space-y-2">
            {["Hotel", "Shortlet", "Restaurant", "Tourist Center"].map(
              (category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-gray-700 group-hover:text-[#06EAFC] transition-colors">
                    {category}
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Price
          </h4>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="number"
                placeholder="2,500"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceChange("min", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <span className="text-gray-500 font-medium">-</span>
            <div className="flex-1">
              <input
                type="number"
                placeholder="5,000"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceChange("max", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Review
          </h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label
                key={stars}
                className="flex items-center space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.reviews.includes(stars)}
                  onChange={() => handleReviewChange(stars)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <div className="flex items-center space-x-2">
                  {[...Array(stars)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="text-yellow-400 text-sm"
                    />
                  ))}
                  <span className="text-gray-700 group-hover:text-[#06EAFC] transition-colors text-sm">
                    {stars} Star{stars !== 1 ? "s" : ""}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// BusinessCard Component
const BusinessCard = ({ item, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const priceText = item.price_from
    ? `#${formatPrice(item.price_from)} for 2 nights`
    : "–";

  const location = getLocationDisplayName(item.area) || "Ibadan";

  const handleCardClick = () => {
    if (item.id) {
      navigate(`/vendor-detail/${item.id}`);
    } else if (item.name) {
      navigate(`/vendor-detail/${encodeURIComponent(item.name)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCardClick();
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope
        ${isMobile ? "w-[165px]" : "w-[210px]"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
      aria-label={`View details for ${item.name} in ${location}`}
    >
      {/* Image with Guest Favorite Badge */}
      <div className="relative w-full h-[170px]">
        <img
          src={images[0]}
          alt={item.name}
          className="w-full h-full object-cover cursor-pointer rounded-xl"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
          loading="lazy"
        />

        {/* Guest Favorite Badge - Top Left */}
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer">
          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
          <span
            className={`${
              isMobile ? "text-[8px]" : "text-[9px]"
            } font-bold text-gray-900 font-manrope cursor-pointer`}
          >
            Guest favorite
          </span>
        </div>
      </div>

      {/* Content */}
      <div className={`${isMobile ? "p-2" : "p-3"}`}>
        <h3
          className={`${
            isMobile ? "text-xs" : "text-sm"
          } font-bold text-gray-900 mb-1 line-clamp-1 font-manrope cursor-pointer`}
        >
          {item.name}
        </h3>

        <p
          className={`${
            isMobile ? "text-[10px]" : "text-[11px]"
          } text-gray-600 mb-2 font-manrope cursor-pointer`}
        >
          {location}
        </p>

        <div className="flex items-center justify-between">
          <p
            className={`${
              isMobile ? "text-[11px]" : "text-xs"
            } font-medium text-gray-900 font-manrope cursor-pointer`}
          >
            {priceText}
          </p>

          {item.rating && (
            <div className="flex items-center gap-1">
              <FontAwesomeIcon
                icon={faStar}
                className={`${
                  isMobile ? "text-[9px]" : "text-[10px]"
                } text-yellow-400`}
              />
              <span
                className={`${
                  isMobile ? "text-[10px]" : "text-[11px]"
                } font-medium text-gray-900 font-manrope cursor-pointer`}
              >
                {item.rating}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Section Component - Horizontal scrolling
const CategorySection = ({ title, items, isMobile }) => {
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollSection = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = isMobile ? 170 : 220;
    const newPosition =
      direction === "next"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  const handleViewAll = () => {
    // Extract category from title for navigation
    const category = title.toLowerCase().replace(/\s+/g, "-");
    navigate(`/category/${category}`);
  };

  if (items.length === 0) return null;

  return (
    <div className={`${isMobile ? "mb-6" : "mb-10"} font-manrope`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h2
          className={`${
            isMobile ? "text-base" : "text-xl"
          } font-bold text-gray-900 font-manrope`}
        >
          {title}
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {items.length} {items.length === 1 ? "place" : "places"}
        </span>
      </div>

      {/* Horizontal Scroll Container */}
      <div className={`relative ${isMobile ? "px-0" : "px-4"}`}>
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${
            isMobile ? "gap-1 pl-1" : "gap-4"
          } pb-3`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item, index) => (
            <BusinessCard
              key={item.id || index}
              item={item}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Scroll Buttons - Only show on desktop */}
        {!isMobile && (
          <>
            <button
              onClick={() => scrollSection("prev")}
              className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-8 h-8 -ml-4 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer`}
              aria-label="Scroll left"
            >
              <svg
                className="w-3 h-3 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={() => scrollSection("next")}
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-8 -mr-4 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer`}
              aria-label="Scroll right"
            >
              <svg
                className="w-3 h-3 text-gray-600"
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
          </>
        )}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-3">
        <button
          onClick={handleViewAll}
          className="text-[#06EAFC] hover:text-[#05d9eb] text-sm font-medium flex items-center gap-1 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-manrope cursor-pointer"
          aria-label={`View all ${title}`}
        >
          View All
          <FontAwesomeIcon icon={faStar} className="text-xs" />
        </button>
      </div>
    </div>
  );
};

// Main SearchResults Component
const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get search parameters from URL
  const searchQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";

  const [filters, setFilters] = useState({
    availableNow: false,
    priceRange: { min: "", max: "" },
    rating: "",
    sortBy: "relevance",
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filteredListings, setFilteredListings] = useState([]);
  const [groupedListings, setGroupedListings] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter listings based on search parameters
  useEffect(() => {
    if (!listings.length) return;

    let filtered = listings;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = getCategoryDisplayName(item.category || "")
          .toLowerCase()
          .includes(query);
        const matchesLocation = getLocationDisplayName(item.area || "")
          .toLowerCase()
          .includes(query);
        return matchesName || matchesCategory || matchesLocation;
      });
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter((item) => {
        return item.category === category;
      });
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter((item) => {
        return item.area === location;
      });
    }

    // Apply advanced filters
    if (activeFilters.categories && activeFilters.categories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = getCategoryDisplayName(item.category || "");
        return activeFilters.categories.some((cat) =>
          itemCategory.toLowerCase().includes(cat.toLowerCase())
        );
      });
    }

    // Apply price range filter
    if (activeFilters.priceRange) {
      const min = Number(activeFilters.priceRange.min) || 0;
      const max = Number(activeFilters.priceRange.max) || Infinity;
      filtered = filtered.filter((item) => {
        const price = Number(item.price_from) || 0;
        return price >= min && price <= max;
      });
    }

    // Apply review filter
    if (activeFilters.reviews && activeFilters.reviews.length > 0) {
      filtered = filtered.filter((item) => {
        const rating = Number(item.rating) || 0;
        return activeFilters.reviews.some((stars) => rating >= stars);
      });
    }

    setFilteredListings(filtered);

    // Group listings by category for horizontal scrolling sections
    const grouped = {};
    filtered.forEach((item) => {
      const cat = getCategoryDisplayName(item.category || "Other");
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    });
    setGroupedListings(grouped);
  }, [listings, searchQuery, category, location, activeFilters]);

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Close filter dropdown
  const closeFilterDropdown = () => {
    setShowFilterDropdown(false);
  };

  // Handle filter changes from dropdown
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Update URL with new search query
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    navigate(`/search-results?${params.toString()}`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("q");
    navigate(`/search-results?${params.toString()}`);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by URL parameter
  };

  // Format price
  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Get page title
  const getPageTitle = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (category) return `${getCategoryDisplayName(category)} in Ibadan`;
    if (location) return `Places in ${getLocationDisplayName(location)}`;
    return "Search Results";
  };

  // Get page description
  const getPageDescription = () => {
    if (searchQuery)
      return `Found ${filteredListings.length} places matching "${searchQuery}"`;
    if (category)
      return `Browse ${filteredListings.length} ${getCategoryDisplayName(
        category
      ).toLowerCase()} places in Ibadan`;
    if (location)
      return `Discover ${
        filteredListings.length
      } places in ${getLocationDisplayName(location)}`;
    return `Found ${filteredListings.length} places in Ibadan`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
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

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-gray-200 rounded-full shadow-sm w-full">
                <div className="pl-4 text-gray-500">
                  <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by area or category..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 bg-transparent py-3 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-3 px-6 text-sm transition-colors duration-200 whitespace-nowrap mx-2"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#00065A] mb-2">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600">
                {filteredListings.length}{" "}
                {filteredListings.length === 1 ? "place" : "places"} found
              </p>
            </div>

            {/* Clear search button */}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Available Now Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.availableNow}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      availableNow: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    filters.availableNow ? "bg-[#06EAFC]" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    filters.availableNow
                      ? "transform translate-x-5"
                      : "transform translate-x-1"
                  }`}
                ></div>
              </div>
              <span className="text-sm text-gray-700">Available Now</span>
            </label>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={toggleFilterDropdown}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PiSliders className="text-gray-600" />
              <span className="text-sm text-gray-700">Filter</span>
            </button>

            <AnimatePresence>
              <FilterDropdown
                isOpen={showFilterDropdown}
                onClose={closeFilterDropdown}
                onFilterChange={handleFilterChange}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium text-sm">
                Active Filters:
              </span>
              <button
                onClick={() => setActiveFilters({})}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          {/* If we have specific category or location search, show all results together */}
          {(category || location) && filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredListings.map((item, index) => (
                <BusinessCard
                  key={item.id || index}
                  item={item}
                  isMobile={isMobile}
                />
              ))}
            </div>
          ) : (
            /* Group by category for general search */
            Object.entries(groupedListings).map(([category, items]) => (
              <CategorySection
                key={category}
                title={category}
                items={items.slice(0, 10)}
                isMobile={isMobile}
              />
            ))
          )}

          {/* No Results State */}
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-3xl text-gray-300 mb-4 block"
                />
                <h3 className="text-lg text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `No places found for "${searchQuery}"`
                    : "Try adjusting your search or filters"}
                </p>
                <button
                  onClick={handleClearSearch}
                  className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination for category/location specific views */}
        {(category || location) && filteredListings.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-600">
              Page {currentPage} of {Math.ceil(filteredListings.length / 12)}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(filteredListings.length / 12)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage >= Math.ceil(filteredListings.length / 12)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Custom scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
