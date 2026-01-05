// src/components/DiscoverIbadan.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faMapMarkerAlt,
  faFilter,
  faChevronRight,
  faChevronLeft,
  faBuilding,
  faUtensils,
  faHome,
  faTools,
  faHotel,
  faBriefcase,
  faStar,
  faConciergeBell,
  faLightbulb,
  faFire,
  faStore,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";

/* ---------------- IMAGES ---------------- */
import hotelImg from "../assets/Logos/hotel.jpg";
import tourismImg from "../assets/Logos/tourism.jpg";
import eventsImg from "../assets/Logos/events.jpg";
import restuarantImg from "../assets/Logos/restuarant.jpg";
// import vendorImg from "../assets/Logos/vendor.jpg"; // Make sure this image exists

/* ---------------- FALLBACKS ---------------- */
const FALLBACK_IMAGES = {
  Hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
  Restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
  Shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
  Tourism: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
  Vendor:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400", // Changed from Services to Vendor
};

/* ---------------- SOPHISTICATED ICON MAPPING ---------------- */
const getSophisticatedCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  
  if (cat.includes("hotel")) return faHotel;
  if (cat.includes("restaurant") || cat.includes("food")) return faUtensils;
  if (cat.includes("shortlet") || cat.includes("apartment")) return faHome;
  if (cat.includes("vendor")) return faStore; // Changed from faConciergeBell to faStore
  if (cat.includes("tourism")) return faMapMarkerAlt;
  if (cat.includes("trending")) return faFire;
  if (cat.includes("popular") || cat.includes("featured")) return faStar;
  
  return faBriefcase;
};

/* ---------------- HELPER FUNCTIONS ---------------- */

// Google Sheet Hook
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

// Get category image
const getCategoryImage = (category, fallback) => {
  try {
    switch (category) {
      case "Hotel":
        return hotelImg;
      case "Tourism":
        return tourismImg;
      case "Shortlet":
        return eventsImg;
      case "Restaurant":
        return restuarantImg;
      case "Vendor": // Changed from Services to Vendor
        return vendorImg || FALLBACK_IMAGES.Vendor;
      default:
        return fallback;
    }
  } catch (error) {
    console.log(`Error loading ${category} image:`, error);
    return fallback;
  }
};

// Get category icon (original - keep for hero section)
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes("hotel")) return faBuilding;
  if (cat.includes("restaurant") || cat.includes("food")) return faUtensils;
  if (cat.includes("shortlet") || cat.includes("apartment")) return faHome;
  if (cat.includes("tourism") || cat.includes("tourist")) return faMapMarkerAlt;
  if (cat.includes("vendor")) return faStore; // Changed from faTools to faStore
  return faFilter;
};

// Format date
const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

// Get category display name
const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories") return "All Categories";

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

// Get location display name
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

// Get category breakdown
const getCategoryBreakdown = (listings) => {
  const categoryCounts = {};

  listings.forEach((item) => {
    if (item.category) {
      const category = getCategoryDisplayName(item.category);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      icon: getCategoryIcon(category),
    }))
    .sort((a, b) => b.count - a.count);
};

// Get location breakdown
const getLocationBreakdown = (listings) => {
  const locationCounts = {};

  listings.forEach((item) => {
    if (item.area) {
      const location = getLocationDisplayName(item.area);
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

// Generate search suggestions
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
        .map((item) => item.area)
        .filter((loc) => loc && loc.trim() !== "")
        .map((loc) => loc.trim())
    ),
  ];

  // Category suggestions
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

      const topLocations = locationBreakdown.slice(0, 3);

      return {
        type: "category",
        title: getCategoryDisplayName(category),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found`,
        breakdownText:
          topLocations.length > 0
            ? `Top locations: ${topLocations
                .map((loc) => `${loc.location} (${loc.count})`)
                .join(", ")}`
            : `Available in multiple areas`,
        breakdown: topLocations,
        action: () => {
          const params = new URLSearchParams();
          params.append("category", category);
          return `/search-results?${params.toString()}`;
        },
      };
    })
    .sort((a, b) => b.count - a.count);

  // Location suggestions
  const locationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((location) => {
      const locationListings = listings.filter(
        (item) =>
          item.area && item.area.toLowerCase() === location.toLowerCase()
      );

      const categoryBreakdown = getCategoryBreakdown(locationListings);
      const totalPlaces = locationListings.length;

      const topCategories = categoryBreakdown.slice(0, 4);

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found`,
        breakdownText: `Places include: ${topCategories
          .map((cat) => `${cat.category} (${cat.count})`)
          .join(", ")}${
          categoryBreakdown.length > 4
            ? `, +${categoryBreakdown.length - 4} more`
            : ""
        }`,
        breakdown: topCategories,
        action: () => {
          const params = new URLSearchParams();
          params.append("location", location);
          return `/search-results?${params.toString()}`;
        },
      };
    })
    .sort((a, b) => b.count - a.count);

  // Combine and sort by relevance
  return [...categoryMatches, ...locationMatches]
    .sort((a, b) => {
      // Exact matches first
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

/* ---------------- COMPONENTS ---------------- */

// Mobile Search Modal Component - APPLE STANDARD DESIGN
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
    onClose();
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const params = new URLSearchParams();
      params.append("q", inputValue.trim());
      onSuggestionClick(`/search-results?${params.toString()}`);
      onClose();
    }
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
  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Minimal Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990] animate-fadeIn"
        onClick={onClose}
      />

      {/* Apple-Style Modal Content */}
      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-[9991] animate-slideInUp flex flex-col"
        style={{
          boxShadow: "0 -25px 50px -12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Clean Header */}
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

        {/* Clean Body */}
        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            <>
              {/* Clean Suggestions Section */}
              {suggestions.length > 0 ? (
                <div className="p-5">
                  {/* Clean Header */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Suggestions ({suggestions.length})
                    </h3>
                  </div>

                  {/* Clean Suggestions List */}
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => {
                      const sophisticatedIcon = suggestion.type === "category" 
                        ? getSophisticatedCategoryIcon(suggestion.title)
                        : faMapMarkerAlt;
                      
                      return (
                        <button
                          key={index}
                          onClick={() =>
                            handleSuggestionClick(suggestion.action())
                          }
                          className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
                        >
                          <div className="flex items-start gap-4">
                            {/* Minimal Icon Container */}
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${suggestion.type === "category" 
                              ? "bg-gray-100" 
                              : "bg-gray-100"
                            }`}>
                              <FontAwesomeIcon
                                icon={sophisticatedIcon}
                                className={`w-5 h-5 ${suggestion.type === "category" 
                                  ? "text-gray-700" 
                                  : "text-gray-700"
                                }`}
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
                                  className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${suggestion.type === "category" 
                                    ? "bg-blue-50 text-blue-700" 
                                    : "bg-purple-50 text-purple-700"
                                  }`}
                                >
                                  {suggestion.count} {suggestion.count === 1 ? "place" : "places"}
                                </span>
                              </div>

                              {/* Clean Breakdown */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2">
                                  {suggestion.breakdownText}
                                </p>

                                {/* Clean Breakdown Tags */}
                                <div className="flex flex-wrap gap-1.5">
                                  {suggestion.breakdown.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className={`text-xs px-2 py-1 rounded ${suggestion.type === "category" 
                                        ? "bg-gray-100 text-gray-700" 
                                        : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {item.category || item.location} ({item.count})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Clean View All CTA */}
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
                      );
                    })}
                  </div>

                  {/* Clean Show All Results Button */}
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
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="w-4 h-4"
                      />
                    </div>
                  </button>
                </div>
              ) : (
                /* Clean No Results Message */
                <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="w-8 h-8 text-gray-400"
                    />
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
            /* Clean Empty State */
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="w-8 h-8 text-gray-400"
                />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Start searching
              </h3>
              <p className="text-gray-600 text-center max-w-sm mb-10">
                Search for hotels, restaurants, shortlets, and vendors in Ibadan
              </p>

              {/* Clean Popular Search Tips */}
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

// Desktop Search Suggestions Component - APPLE STANDARD DESIGN
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

  const containerWidth = searchBarPosition?.width || 0;

  return createPortal(
    <>
      {/* Minimal Backdrop */}
      <div
        className="fixed inset-0 bg-transparent z-[9980]"
        onClick={onClose}
      />

      {/* Apple-Style Modal Container */}
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
        {/* Clean Suggestions Header */}
        <div className="p-4 border-b border-gray-200">
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
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close suggestions"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Suggestions List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(70vh - 56px)" }}
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => {
              const sophisticatedIcon = suggestion.type === "category" 
                ? getSophisticatedCategoryIcon(suggestion.title)
                : faMapMarkerAlt;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    onSuggestionClick(suggestion.action());
                    onClose();
                  }}
                  className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors duration-150 mb-1 last:mb-0 group"
                >
                  <div className="flex items-start gap-3">
                    {/* Minimal Icon */}
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                      <FontAwesomeIcon
                        icon={sophisticatedIcon}
                        className="w-4 h-4 text-gray-700"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {suggestion.title}
                        </h4>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2 ${suggestion.type === "category" 
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

                      {/* Clean Breakdown */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">
                          {suggestion.breakdownText}
                        </p>

                        {/* Clean Breakdown Tags */}
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
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="w-3 h-3 text-gray-400"
                      />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Clean Show All Results Button */}
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

/* ---------------- MAIN COMPONENT ---------------- */
const DiscoverIbadan = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({
    left: 0,
    bottom: 0,
    width: 0,
  });

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { data: listings = [], loading } = useGoogleSheet(SHEET_ID, API_KEY);

  /* ---------------- MOBILE CHECK ---------------- */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* ---------------- SEARCH BAR POSITION TRACKING ---------------- */
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

  /* ---------------- SEARCH HANDLERS ---------------- */
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery.trim());
      navigate(`/search-results?${params.toString()}`);
      setShowSuggestions(false);
      setShowMobileModal(false);
    }
  }, [searchQuery, navigate]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const handleSuggestionClick = useCallback(
    (url) => {
      navigate(url);
      setShowSuggestions(false);
      setShowMobileModal(false);
    },
    [navigate]
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);
      if (!isMobile && value.trim().length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [isMobile]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  const handleMobileSearchClick = useCallback(() => {
    if (isMobile) {
      setShowMobileModal(true);
    }
  }, [isMobile]);

  const handleSearchFocus = useCallback(() => {
    if (isMobile) {
      handleMobileSearchClick();
    } else if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [isMobile, searchQuery, handleMobileSearchClick]);

  /* ---------------- CATEGORY HANDLERS ---------------- */
  const scrollToAiTopPicks = useCallback(() => {
    const aiTopPicksSection = document.getElementById("toppicks");
    if (aiTopPicksSection) {
      const offset = 80;
      const elementPosition = aiTopPicksSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  const handleCategoryClick = (category) => {
    const categoryMap = {
      Hotel: "hotel",
      Restaurant: "restaurant",
      Shortlet: "shortlet",
      Tourism: "tourist-center",
      Vendor: "vendor", // Changed from Services to Vendor
    };
    const categorySlug = categoryMap[category];

    if (categorySlug) {
      if (category === "Vendor") {
        scrollToAiTopPicks();
      } else {
        navigate(`/category/${categorySlug}`);
      }
    }
  };

  return (
    <div className="min-h-[50%] bg-[#F7F7FA] font-manrope">
      <section className="pt-14 lg:pt-12 text-center bg-[#F7F7FA] overflow-hidden relative">
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 lg:py-4">
          <div className="flex flex-col items-center text-center space-y-4 md:space-y-5 lg:space-y-4">
            {/* Hero Title */}
            <div className="space-y-1 md:space-y-2 max-w-xl md:max-w-2xl w-full mt-1 md:mt-2 lg:mt-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl md:mt-4 leading-tight font-bold text-gray-900">
                Discover{" "}
                <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                  Ibadan
                </span>{" "}
                through AI & Local Stories
              </h1>
              <p className="text-[13.5px] sm:text-lg md:text-xl lg:text-[16px] md:mt-3 text-gray-600 font-medium max-w-xl mx-auto px-2">
                Your all-in-one local guide for hotels, food, events, vendors,
                and market prices.
              </p>
            </div>

            {/* SEARCH BAR - 60% WIDER */}
            <div className="w-full">
              <div className="flex items-center gap-3 justify-center">
                <div 
                  className="relative"
                  ref={searchContainerRef}
                  style={{
                    // KEPT 60% wider (43.2%)
                    width: isMobile ? "100%" : "43.2%",
                  }}
                >
                  <form onSubmit={handleSearchSubmit} className="w-full">
                    <div className="flex items-center justify-center w-full">
                      <div className="flex items-center bg-gray-200 rounded-full shadow-sm relative z-40 w-full">
                        <div className="pl-3 sm:pl-4 text-gray-500">
                          <FontAwesomeIcon
                            icon={faSearch}
                            className="h-4 w-4"
                          />
                        </div>
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Search by area, category, or name..."
                          value={searchQuery}
                          onChange={(e) =>
                            handleSearchChange(e.target.value)
                          }
                          onFocus={handleSearchFocus}
                          onKeyPress={handleKeyPress}
                          className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:rounded-full"
                          autoFocus={false}
                          aria-label="Search input"
                          role="searchbox"
                        />
                        {searchQuery && (
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

            {/* Category Icons - 60% WIDER */}
            <div className="w-full" style={{
              // KEPT 60% wider (43.2%)
              width: isMobile ? "100%" : "43.2%",
              marginLeft: "auto",
              marginRight: "auto",
            }}>
              <div className="flex justify-between items-center gap-1">
                {["Hotel", "Shortlet", "Restaurant", "Vendor"].map(
                  (category) => (
                    <motion.div
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group cursor-pointer flex flex-col items-center"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {/* Square Container - KEPT 60% larger */}
                      <div className="relative w-16 h-16 sm:w-19 sm:h-19 md:w-22 md:h-22 lg:w-22 lg:h-22">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 rounded-md transform group-hover:scale-105 transition-transform duration-300"></div>
                        <div className="relative w-full h-full p-0.5">
                          <div className="w-full h-full overflow-hidden rounded-sm shadow-xs group-hover:shadow-xs transition-all duration-300">
                            <img
                              src={getCategoryImage(
                                category,
                                FALLBACK_IMAGES[category]
                              )}
                              alt={category}
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = FALLBACK_IMAGES[category];
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] xs:text-[12px] font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-200 text-center whitespace-nowrap">
                        {category}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Green Separator Line */}
        <div className="relative">
          <div className="absolute left-0 right-0 h-[1px] sm:h-[1px] bg-gradient-to-r from-green-400 via-green-500 to-green-400 opacity-70"></div>
        </div>
      </section>

      {/* Apple Standard Desktop Search Suggestions */}
      {!isMobile && (
        <DesktopSearchSuggestions
          searchQuery={searchQuery}
          listings={listings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
          isVisible={showSuggestions && !loading}
          searchBarPosition={searchBarPosition}
        />
      )}

      {/* Apple Standard Mobile Fullscreen Search Modal */}
      {isMobile && (
        <MobileSearchModal
          searchQuery={searchQuery}
          listings={listings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowMobileModal(false)}
          onTyping={handleSearchChange}
          isVisible={showMobileModal}
        />
      )}
    </div>
  );
};

export default DiscoverIbadan;