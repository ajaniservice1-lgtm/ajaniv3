// src/components/SearchResults.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { PiSliders } from "react-icons/pi";
import { MdFavoriteBorder } from "react-icons/md";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";
import { createPortal } from "react-dom";

// Google Sheets hook
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

// ================== BUSINESS CARD (EXACT DESIGN AS REQUESTED) ==================
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
    : "From #2,500 per guest";

  const location = item.area || "Ibadan";

  const handleCardClick = () => {
    if (item.id) {
      navigate(`/vendor-detail/${item.id}`);
    } else if (item.name) {
      navigate(`/vendor-detail/${encodeURIComponent(item.name)}`);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope
        ${isMobile ? "w-[165px]" : "w-full"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div
        className={`
          relative overflow-hidden rounded-xl 
          ${isMobile ? "w-full h-[150px]" : "w-full h-[170px]"}
        `}
      >
        <img
          src={images[0]}
          alt=""
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
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
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MdFavoriteBorder className="text-[#00d1ff] text-sm" />
        </button>
      </div>

      {/* Text */}
      <div className={`${isMobile ? "p-1.5" : "p-2.5"} flex flex-col gap-0.5`}>
        <h3
          className={`
            font-semibold text-gray-900 
            leading-tight line-clamp-2 
            ${isMobile ? "text-xs" : "text-sm"}
          `}
        >
          {item.name}
        </h3>

        <p
          className={`
            text-gray-600 
            ${isMobile ? "text-[9px]" : "text-xs"}
          `}
        >
          {location}
        </p>

        <div className="flex items-center gap-1 mt-0.5">
          <p
            className={`
              font-normal text-gray-900 
              ${isMobile ? "text-[9px]" : "text-xs"}
            `}
          >
            {priceText} <span>•</span>
          </p>

          <div
            className={`
              flex items-center gap-1 text-gray-800 
              ${isMobile ? "text-[9px]" : "text-xs"}
            `}
          >
            <FontAwesomeIcon
              icon={faStar}
              className={`${isMobile ? "text-[9px]" : "text-xs"} text-black`}
            />
            {item.rating || "4.9"}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== DESKTOP SEARCH SUGGESTIONS ==================
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
}) => {
  const suggestionsRef = useRef(null);
  const searchInputRef = useRef(null);

  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim() || !listings.length) return [];

    const query = searchQuery.toLowerCase().trim();
    const suggestions = [];

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
          .map((item) => item.area)
          .filter((loc) => loc && loc.trim() !== "")
          .map((loc) => loc.trim())
      ),
    ];

    const categoryMatches = uniqueCategories
      .filter((category) => {
        const displayName = getCategoryDisplayName(category).toLowerCase();
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          categoryValue: category,
          action: `/search-results?category=${encodeURIComponent(category)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = getLocationDisplayName(location).toLowerCase();
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          locationValue: location,
          action: `/search-results?location=${encodeURIComponent(location)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const allSuggestions = [...categoryMatches, ...locationMatches];

    return allSuggestions
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return b.count - a.count;
      })
      .slice(0, 6);
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

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, onClose]);

  // Get the search input position
  useEffect(() => {
    if (isVisible) {
      // Find the search input element
      const searchInput = document.querySelector('input[role="searchbox"]');
      if (searchInput) {
        searchInputRef.current = searchInput;
      }
    }
  }, [isVisible]);

  if (!isVisible || !searchQuery.trim() || suggestions.length === 0)
    return null;

  return createPortal(
    <div
      ref={suggestionsRef}
      className="fixed inset-0 z-[999998] pointer-events-none"
      style={{
        zIndex: 999998,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="absolute inset-0 bg-black/50 pointer-events-auto" 
        onClick={onClose} 
      />
      <div className="relative w-full h-full">
        <div
          className="absolute top-40 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto max-h-[70vh] overflow-y-auto"
          style={{ 
            zIndex: 999999,
            marginTop: '120px' // Position it below the search input
          }}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Quick search suggestions
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {suggestions.length} suggestions
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                onClick={() => {
                  onSuggestionClick(suggestion.action);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FontAwesomeIcon
                        icon={
                          suggestion.type === "category"
                            ? faFilter
                            : faMapMarkerAlt
                        }
                        className={`text-sm ${
                          suggestion.type === "category"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          {suggestion.title}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {suggestion.count}{" "}
                          {suggestion.count === 1 ? "place" : "places"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="ml-12 mt-3">
                  <span className="text-xs text-blue-600 font-medium">
                    Click to view all results →
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Click any suggestion to view detailed results
            </p>
          </div>
        </div>
      </div>
    </div>,
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
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = React.useMemo(() => {
    if (!inputValue.trim() || !listings.length) return [];

    const query = inputValue.toLowerCase().trim();
    const suggestions = [];

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
          .map((item) => item.area)
          .filter((loc) => loc && loc.trim() !== "")
          .map((loc) => loc.trim())
      ),
    ];

    const categoryMatches = uniqueCategories
      .filter((category) => {
        const displayName = getCategoryDisplayName(category).toLowerCase();
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          action: `/search-results?category=${encodeURIComponent(category)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = getLocationDisplayName(location).toLowerCase();
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          action: `/search-results?location=${encodeURIComponent(location)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const allSuggestions = [...categoryMatches, ...locationMatches];

    return allSuggestions
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return b.count - a.count;
      })
      .slice(0, 6);
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(inputValue.trim())}`);
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
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000000]"
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
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="absolute inset-0 bg-white flex flex-col"
        ref={modalRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Search</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 font-medium px-3 py-1"
                aria-label="Close search"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent ml-3 py-1 outline-none font-manrope text-base placeholder:text-gray-500"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search by area, category, or name..."
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {inputValue.trim() ? (
            <>
              <div className="sticky top-0 p-4 border-b border-gray-100 bg-gray-50 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Quick search suggestions
                  </span>
                  {suggestions.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {suggestions.length} suggestions
                    </span>
                  )}
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors group"
                      onClick={() => {
                        onSuggestionClick(suggestion.action);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <FontAwesomeIcon
                              icon={
                                suggestion.type === "category"
                                  ? faFilter
                                  : faMapMarkerAlt
                              }
                              className={`text-sm ${
                                suggestion.type === "category"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-gray-900">
                                {suggestion.title}
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {suggestion.count}{" "}
                                {suggestion.count === 1 ? "place" : "places"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="ml-12 mt-3">
                        <span className="text-xs text-blue-600 font-medium">
                          Tap to view all results →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="h-12 w-12 mx-auto mb-4 text-gray-300"
                  />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    No matches found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="h-16 w-16 mx-auto mb-6 text-gray-300"
              />
              <p className="text-xl font-medium text-gray-700 mb-2">
                Start typing to search
              </p>
              <p className="text-sm text-gray-500">
                Search for categories, locations, or places in Ibadan
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// ================== ENHANCED FILTER SIDEBAR (SEARCHABLE) ==================
const FilterSidebar = ({
  onFilterChange,
  allLocations,
  allCategories,
  currentFilters,
  onClose,
  isMobileModal = false,
  isDesktopModal = false,
  onApplyFilters,
  currentSearchQuery = "",
  currentCategoryParam = "",
  currentLocationParam = "",
  onDynamicFilterApply,
}) => {
  const [filters, setFilters] = useState(
    currentFilters || {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    }
  );

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: true,
    price: true,
    rating: true,
    amenities: false,
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

  const handleLocationChange = (location) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleRatingChange = (stars) => {
    setFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.includes(stars)
        ? prev.ratings.filter((s) => s !== stars)
        : [...prev.ratings, stars],
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

  const handleSortChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
    }));
  };

  const handleDynamicApply = () => {
    if (onDynamicFilterApply) {
      const hasCategoryFilters = filters.categories.length > 0;
      const hasLocationFilters = filters.locations.length > 0;

      let newCategory = currentCategoryParam;
      let newLocation = currentLocationParam;

      if (hasCategoryFilters && filters.categories[0]) {
        const selectedCategory = allCategories.find(
          (cat) => getCategoryDisplayName(cat) === filters.categories[0]
        );
        if (selectedCategory) {
          newCategory = selectedCategory;
        }
      }

      if (hasLocationFilters && filters.locations[0]) {
        const selectedLocation = allLocations.find(
          (loc) => getLocationDisplayName(loc) === filters.locations[0]
        );
        if (selectedLocation) {
          newLocation = selectedLocation;
        }
      }

      onDynamicFilterApply({
        filters,
        newCategory,
        newLocation,
        keepSearchQuery: currentSearchQuery,
      });
    }

    handleApply();
  };

  const handleReset = () => {
    const resetFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };
    setFilters(resetFilters);
    setLocationSearch("");
    setCategorySearch("");
    onFilterChange(resetFilters);
    if (onApplyFilters) {
      onApplyFilters(resetFilters);
    }
  };

  const handleApply = () => {
    onFilterChange(filters);
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    if ((isMobileModal || isDesktopModal) && onClose) {
      onClose();
    }
  };

  const handleSelectAllLocations = () => {
    if (filters.locations.length === uniqueLocationDisplayNames.length) {
      setFilters((prev) => ({ ...prev, locations: [] }));
    } else {
      setFilters((prev) => ({
        ...prev,
        locations: [...uniqueLocationDisplayNames],
      }));
    }
  };

  const handleSelectAllCategories = () => {
    if (filters.categories.length === uniqueCategoryDisplayNames.length) {
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else {
      setFilters((prev) => ({
        ...prev,
        categories: [...uniqueCategoryDisplayNames],
      }));
    }
  };

  const sidebarContent = (
    <div
      className={`space-y-6 ${
        isMobileModal || isDesktopModal ? "p-4 sm:p-6" : ""
      }`}
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
            {filters.locations.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                {filters.locations.length}
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  {filters.locations.length ===
                  uniqueLocationDisplayNames.length
                    ? "Clear All Locations"
                    : "Select All Locations"}
                </button>
                <span className="text-xs text-gray-500">
                  {filteredLocationDisplayNames.length} locations
                </span>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2">
              {filteredLocationDisplayNames.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No locations found matching "{locationSearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredLocationDisplayNames.map((location, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => handleLocationChange(location)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-[#06EAFC] transition-colors truncate">
                        {location}
                      </span>
                      {filters.locations.includes(location) && (
                        <span className="ml-auto text-xs text-blue-600">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {filters.locations.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Selected: {filters.locations.slice(0, 3).join(", ")}
                  {filters.locations.length > 3 &&
                    ` +${filters.locations.length - 3} more`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CATEGORY SECTION WITH SEARCH */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex justify-between items-center mb-3"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-green-500" />
            <h4 className="font-semibold text-gray-900 text-base">Category</h4>
            {filters.categories.length > 0 && (
              <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                {filters.categories.length}
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  {filters.categories.length ===
                  uniqueCategoryDisplayNames.length
                    ? "Clear All Categories"
                    : "Select All Categories"}
                </button>
                <span className="text-xs text-gray-500">
                  {filteredCategoryDisplayNames.length} categories
                </span>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2">
              {filteredCategoryDisplayNames.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No categories found matching "{categorySearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredCategoryDisplayNames.map((category, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-[#06EAFC] transition-colors truncate">
                        {category}
                      </span>
                      {filters.categories.includes(category) && (
                        <span className="ml-auto text-xs text-green-600">
                          ✓
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {filters.categories.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                  Selected: {filters.categories.slice(0, 3).join(", ")}
                  {filters.categories.length > 3 &&
                    ` +${filters.categories.length - 3} more`}
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
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">
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
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
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
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <span className="text-gray-500 font-medium mt-6">to</span>
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
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
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
            {filters.ratings.length > 0 && (
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">
                {filters.ratings.length}
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
                className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={filters.ratings.includes(stars)}
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
                  <span className="text-sm text-gray-700 group-hover:text-[#06EAFC] transition-colors">
                    {stars}+ stars
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 pt-4">
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Reset All
          </button>
          <button
            onClick={handleDynamicApply}
            className="flex-1 px-4 py-3 text-sm font-medium bg-[#06EAFC] text-white rounded-xl hover:bg-[#05d9eb] transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faCheck} />
            Apply Filters
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Applying filters will update the search results
        </p>
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
          width: "100%",
          height: "100%",
        }}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-xl font-bold text-gray-900">Filter & Sort</h3>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-4">{sidebarContent}</div>
        </div>
      </motion.div>,
      document.body
    );
  }

  // Desktop Modal - Fullscreen like mobile search
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

  // Regular sidebar (not modal)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit sticky top-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filter Options</h3>
      </div>
      {sidebarContent}
    </div>
  );
};

// ================== CATEGORY SECTION ==================
const CategorySection = ({ title, items, sectionId, isMobile, category }) => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate(`/category/${category}`);
  };

  if (items.length === 0) return null;

  if (isMobile) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <button
              onClick={handleCategoryClick}
              className="text-[#00065A] hover:text-[#06EAFC] transition-colors text-left text-sm font-bold cursor-pointer flex items-center gap-1"
            >
              {title}
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4">
          {items.map((listing, index) => (
            <BusinessCard
              key={listing.id || index}
              item={listing}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <div>
          <button
            onClick={handleCategoryClick}
            className="text-[#00065A] hover:text-[#06EAFC] transition-colors text-left text-base font-bold cursor-pointer flex items-center gap-1"
          >
            {title}
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((listing, index) => (
          <BusinessCard
            key={listing.id || index}
            item={listing}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    categories: [],
    priceRange: { min: "", max: "" },
    ratings: [],
    sortBy: "relevance",
    amenities: [],
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filteredListings, setFilteredListings] = useState([]);
  const [groupedListings, setGroupedListings] = useState({});
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showDesktopSearchSuggestions, setShowDesktopSearchSuggestions] =
    useState(false);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  useEffect(() => {
    if (listings.length > 0) {
      const locations = [
        ...new Set(listings.map((item) => item.area).filter(Boolean)),
      ];
      const categories = [
        ...new Set(listings.map((item) => item.category).filter(Boolean)),
      ];
      setAllLocations(locations);
      setAllCategories(categories);
    }
  }, [listings]);

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

  useEffect(() => {
    if (!listings.length) {
      setFilteredListings([]);
      setFilteredCount(0);
      setGroupedListings({});
      return;
    }

    let filtered = [...listings];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesLocation = item.area?.toLowerCase().includes(query);
        const matchesDescription = item.description
          ?.toLowerCase()
          .includes(query);

        return (
          matchesName ||
          matchesCategory ||
          matchesLocation ||
          matchesDescription
        );
      });
    }

    if (category && category !== "All Categories" && category !== "All") {
      const targetCategory = getCategoryDisplayName(category);
      filtered = filtered.filter((item) => {
        const itemCategory = getCategoryDisplayName(item.category || "");
        return itemCategory === targetCategory;
      });
    }

    if (location && location !== "All Locations" && location !== "All") {
      const targetLocation = getLocationDisplayName(location);
      filtered = filtered.filter((item) => {
        const itemLocation = getLocationDisplayName(item.area || "");
        return itemLocation === targetLocation;
      });
    }

    if (activeFilters.locations.length > 0) {
      filtered = filtered.filter((item) => {
        const itemLocation = getLocationDisplayName(item.area || "");
        return activeFilters.locations.includes(itemLocation);
      });
    }

    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = getCategoryDisplayName(item.category || "");
        return activeFilters.categories.includes(itemCategory);
      });
    }

    if (activeFilters.priceRange.min || activeFilters.priceRange.max) {
      const min = Number(activeFilters.priceRange.min) || 0;
      const max = Number(activeFilters.priceRange.max) || Infinity;
      filtered = filtered.filter((item) => {
        const price = Number(item.price_from) || 0;
        return price >= min && price <= max;
      });
    }

    if (activeFilters.ratings.length > 0) {
      filtered = filtered.filter((item) => {
        const rating = Number(item.rating) || 0;
        return activeFilters.ratings.some((stars) => rating >= stars);
      });
    }

    if (activeFilters.sortBy && activeFilters.sortBy !== "relevance") {
      filtered = [...filtered].sort((a, b) => {
        switch (activeFilters.sortBy) {
          case "price_low":
            return (Number(a.price_from) || 0) - (Number(b.price_from) || 0);
          case "price_high":
            return (Number(b.price_from) || 0) - (Number(a.price_from) || 0);
          case "rating":
            return (Number(b.rating) || 0) - (Number(a.rating) || 0);
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          default:
            return 0;
        }
      });
    }

    setFilteredListings(filtered);
    setFilteredCount(filtered.length);
    setCurrentPage(1);

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

  const handleSuggestionClick = (url) => {
    const urlObj = new URL(url, window.location.origin);
    const params = new URLSearchParams(urlObj.search);
    setSearchParams(params);
    setShowMobileSearchModal(false);
    setShowDesktopSearchSuggestions(false);
    setLocalSearchQuery("");
  };

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    if (!isMobile) {
      setShowDesktopSearchSuggestions(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", localSearchQuery.trim());
      setSearchParams(params);
      setShowMobileSearchModal(false);
      setShowDesktopSearchSuggestions(false);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    const params = new URLSearchParams();
    setSearchParams(params);
    setShowDesktopSearchSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (isMobile) {
      setShowMobileSearchModal(true);
      if (showMobileFilters) {
        setShowMobileFilters(false);
      }
    } else {
      setShowDesktopSearchSuggestions(true);
      if (showDesktopFilters) {
        setShowDesktopFilters(false);
      }
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
    setShowMobileSearchModal(false);
  };

  const toggleDesktopFilters = () => {
    setShowDesktopFilters(!showDesktopFilters);
    setShowDesktopSearchSuggestions(false);
  };

  const handleDynamicFilterApply = ({
    filters,
    newCategory,
    newLocation,
    keepSearchQuery,
  }) => {
    const params = new URLSearchParams();

    if (keepSearchQuery && searchQuery) {
      params.set("q", searchQuery);
    }

    if (newCategory) {
      params.set("category", newCategory);
    } else if (category) {
      params.set("category", category);
    }

    if (newLocation) {
      params.set("location", newLocation);
    } else if (location) {
      params.set("location", location);
    }

    setSearchParams(params);
    setActiveFilters(filters);

    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const handleFilterChangeWithScroll = (newFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const removeFilter = (type, value = null) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      switch (type) {
        case "location":
          newFilters.locations = value
            ? prev.locations.filter((l) => l !== value)
            : [];
          break;
        case "category":
          newFilters.categories = value
            ? prev.categories.filter((c) => c !== value)
            : [];
          break;
        case "price":
          newFilters.priceRange = { min: "", max: "" };
          break;
        case "rating":
          newFilters.ratings = value
            ? prev.ratings.filter((r) => r !== value)
            : [];
          break;
        case "sort":
          newFilters.sortBy = "relevance";
          break;
      }

      return newFilters;
    });
  };

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

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    setSearchParams(params);

    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    } else if (
      category &&
      category !== "All Categories" &&
      category !== "All"
    ) {
      const displayCategory = getCategoryDisplayName(category);
      return `${displayCategory} in Ibadan`;
    } else if (location && location !== "All Locations" && location !== "All") {
      const displayLocation = getLocationDisplayName(location);
      return `Places in ${displayLocation}`;
    } else {
      return "All Places in Ibadan";
    }
  };

  const getPageDescription = () => {
    if (searchQuery) {
      return `Find the best places in Ibadan matching "${searchQuery}". Search results include hotels, restaurants, shortlets, tourist attractions, and more.`;
    } else if (
      category &&
      category !== "All Categories" &&
      category !== "All"
    ) {
      const displayCategory = getCategoryDisplayName(category);
      return `Browse the best ${displayCategory.toLowerCase()} places in Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
    } else if (location && location !== "All Locations" && location !== "All") {
      const displayLocation = getLocationDisplayName(location);
      return `Discover amazing places in ${displayLocation}, Ibadan. Find restaurants, hotels, attractions, and more in this area.`;
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
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = filteredListings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Fixed Search Bar Container */}
        <div className="z-30 py-6 relative" style={{ zIndex: 100 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div
                className="w-full max-w-md relative"
                ref={searchContainerRef}
              >
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center">
                    <div className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-40">
                      <div className="pl-3 sm:pl-4 text-gray-500">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
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
                          className="p-1 mr-2 text-gray-500 hover:text-gray-700"
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

                  {/* Desktop Search Suggestions */}
                  {!isMobile && showDesktopSearchSuggestions && (
                    <DesktopSearchSuggestions
                      searchQuery={localSearchQuery}
                      listings={listings}
                      onSuggestionClick={handleSuggestionClick}
                      onClose={() => setShowDesktopSearchSuggestions(false)}
                      isVisible={showDesktopSearchSuggestions}
                    />
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fullscreen Search Modal */}
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
            onApplyFilters={handleFilterChangeWithScroll}
            onDynamicFilterApply={handleDynamicFilterApply}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            currentCategoryParam={category}
            currentLocationParam={location}
            onClose={() => setShowDesktopFilters(false)}
            isDesktopModal={true}
          />
        )}

        {/* Mobile Filter Modal */}
        {isMobile && showMobileFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onApplyFilters={handleFilterChangeWithScroll}
            onDynamicFilterApply={handleDynamicFilterApply}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            currentCategoryParam={category}
            currentLocationParam={location}
            onClose={() => setShowMobileFilters(false)}
            isMobileModal={true}
          />
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar - Always visible on desktop */}
          {!isMobile && (
            <div className="lg:w-1/4">
              <FilterSidebar
                onFilterChange={handleFilterChangeWithScroll}
                onApplyFilters={handleFilterChangeWithScroll}
                onDynamicFilterApply={handleDynamicFilterApply}
                allLocations={allLocations}
                allCategories={allCategories}
                currentFilters={activeFilters}
                currentSearchQuery={searchQuery}
                currentCategoryParam={category}
                currentLocationParam={location}
              />
            </div>
          )}

          {/* Results Content */}
          <div className="lg:w-3/4" ref={resultsRef}>
            {/* Page Header with Filter Button */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Desktop filter button */}
                  {!isMobile && (
                    <div className="relative" ref={filterButtonRef}>
                      <button
                        onClick={toggleDesktopFilters}
                        className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        <PiSliders className="text-gray-600" />
                        <span className="text-sm font-medium">
                          Filter & Sort
                        </span>
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
                          <span className="bg-[#06EAFC] text-white text-xs px-2 py-0.5 rounded-full">
                            {Object.values(activeFilters).reduce((acc, val) => {
                              if (Array.isArray(val)) return acc + val.length;
                              if (typeof val === "object" && val !== null) {
                                return acc + (val.min || val.max ? 1 : 0);
                              }
                              return acc + (val && val !== "relevance" ? 1 : 0);
                            }, 0)}
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Title and Count */}
                  <div>
                    <h1 className="text-xl font-bold text-[#00065A] mb-1">
                      {getPageTitle()}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {filteredCount} {filteredCount === 1 ? "place" : "places"}{" "}
                      found
                    </p>
                  </div>
                </div>

                {/* Mobile filter button - Icon only, no text */}
                {isMobile && (
                  <button
                    onClick={toggleMobileFilters}
                    className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    aria-label="Open filters"
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
              </div>
            </div>

            {/* Active Filters Display */}
            {(activeFilters.locations.length > 0 ||
              activeFilters.categories.length > 0 ||
              activeFilters.priceRange.min ||
              activeFilters.priceRange.max ||
              activeFilters.ratings.length > 0 ||
              activeFilters.sortBy !== "relevance") && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium text-sm">
                      Active Filters:
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="text-[#06EAFC] hover:text-[#05d9eb] text-sm font-medium"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Location Filters */}
                    {activeFilters.locations.map((location, idx) => (
                      <FilterPill
                        key={`location-${idx}`}
                        type="location"
                        label="Location"
                        value={location}
                        onRemove={() => removeFilter("location", location)}
                      />
                    ))}

                    {/* Category Filters */}
                    {activeFilters.categories.map((category, idx) => (
                      <FilterPill
                        key={`category-${idx}`}
                        type="category"
                        label="Category"
                        value={category}
                        onRemove={() => removeFilter("category", category)}
                      />
                    ))}

                    {/* Price Filter */}
                    {(activeFilters.priceRange.min ||
                      activeFilters.priceRange.max) && (
                      <FilterPill
                        type="price"
                        label="Price"
                        value={`#${activeFilters.priceRange.min || "0"} - #${
                          activeFilters.priceRange.max || "∞"
                        }`}
                        onRemove={() => removeFilter("price")}
                      />
                    )}

                    {/* Rating Filters */}
                    {activeFilters.ratings.map((rating, idx) => (
                      <FilterPill
                        key={`rating-${idx}`}
                        type="rating"
                        label="Min Rating"
                        value={`${rating}+ stars`}
                        onRemove={() => removeFilter("rating", rating)}
                      />
                    ))}

                    {/* Sort Filter */}
                    {activeFilters.sortBy !== "relevance" && (
                      <FilterPill
                        type="sort"
                        label="Sorted by"
                        value={
                          activeFilters.sortBy === "price_low"
                            ? "Price: Low to High"
                            : activeFilters.sortBy === "price_high"
                            ? "Price: High to Low"
                            : activeFilters.sortBy === "rating"
                            ? "Highest Rated"
                            : activeFilters.sortBy === "name"
                            ? "Name: A to Z"
                            : "Relevance"
                        }
                        onRemove={() => removeFilter("sort")}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            <div className="space-y-6">
              {filteredCount === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-4xl text-gray-300 mb-4 block"
                  />
                  <h3 className="text-xl text-gray-800 mb-2">
                    No matching results found
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {searchQuery
                      ? `No places found for "${searchQuery}" with the selected filters.`
                      : "No places match your current filters."}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors"
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
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Adjust Filters
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Tip: Try selecting fewer filters or different combinations
                  </p>
                </div>
              )}

              {filteredCount > 0 && (
                <>
                  {/* Show results based on URL parameters */}
                  {searchQuery || category || location ? (
                    <>
                      {isMobile ? (
                        <div className="space-y-4">
                          {Array.from({
                            length: Math.ceil(currentListings.length / 5),
                          }).map((_, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="flex overflow-x-auto scrollbar-hide gap-2 pb-4"
                            >
                              {currentListings
                                .slice(rowIndex * 5, (rowIndex + 1) * 5)
                                .map((listing, index) => (
                                  <BusinessCard
                                    key={listing.id || `${rowIndex}-${index}`}
                                    item={listing}
                                    isMobile={isMobile}
                                  />
                                ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {currentListings.map((listing, index) => (
                            <BusinessCard
                              key={listing.id || index}
                              item={listing}
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
                          category={categorySlug}
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

      {/* Custom scrollbar hiding */}
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

export default SearchResults;
