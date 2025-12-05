// Hero.jsx - Complete component with all functions
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faChevronDown,
  faMapMarkerAlt,
  faFilter,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// FALLBACK IMAGES
const FALLBACK_IMAGES = {
  Hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80",
  Restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80",
  Shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&q=80",
  Tourism:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&q=80",
};

// Helper function to fetch Google Sheet data
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

// Helper function to safely get image source
const getCategoryImage = (category, fallback) => {
  try {
    switch (category) {
      case "Hotel":
        try {
          const hotelImg = require("../assets/Logos/hotel.jpg");
          return hotelImg.default || hotelImg;
        } catch {
          return fallback;
        }
      case "Tourism":
        try {
          const tourismImg = require("../assets/Logos/tourism.jpg");
          return tourismImg.default || tourismImg;
        } catch {
          return fallback;
        }
      case "Shortlet":
        try {
          const shortletImg = require("../assets/Logos/events.jpg");
          return shortletImg.default || shortletImg;
        } catch {
          return fallback;
        }
      case "Restaurant":
        try {
          const restaurantImg = require("../assets/Logos/restaurant.jpg");
          return restaurantImg.default || restaurantImg;
        } catch {
          try {
            const restaurantImgAlt = require("../assets/Logos/restuarant.jpg");
            return restaurantImgAlt.default || restaurantImgAlt;
          } catch {
            return fallback;
          }
        }
      default:
        return fallback;
    }
  } catch (error) {
    console.log(`Error loading ${category} image:`, error);
    return fallback;
  }
};

// Helper functions for search
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

// Helper function to get location breakdown
const getLocationBreakdown = (listings) => {
  const locationCounts = {};
  listings.forEach((item) => {
    const location = getLocationDisplayName(item.area || "Unknown");
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to get category breakdown by location
const getCategoryBreakdownByLocation = (listings) => {
  const categoryCounts = {};
  listings.forEach((item) => {
    const category = getCategoryDisplayName(item.category || "other.other");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Search Suggestions Component
const SearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  isMobile,
}) => {
  const suggestionsRef = useRef(null);

  // Generate suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !listings.length) return [];

    const query = searchQuery.toLowerCase().trim();
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
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );
        const locationBreakdown = getLocationBreakdown(categoryListings);

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          locations: locationBreakdown,
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
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );
        const categoryBreakdown =
          getCategoryBreakdownByLocation(locationListings);

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          categories: categoryBreakdown,
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
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Starts with query
        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Then by count
        return b.count - a.count;
      })
      .slice(0, 6); // Limit to 6 suggestions
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

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto"
      style={{
        position: "absolute",
        width: "100%",
        maxWidth: "600px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <div className="p-3 border-b border-gray-100">
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
              if (suggestion.action) {
                onSuggestionClick(suggestion.action());
              }
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FontAwesomeIcon
                    icon={
                      suggestion.type === "category" ? faFilter : faMapMarkerAlt
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
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </div>
            </div>

            {/* Location or Category breakdown */}
            {suggestion.type === "category" &&
              suggestion.locations &&
              suggestion.locations.length > 0 && (
                <div className="ml-10 mt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    Available in these areas:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.locations.slice(0, 5).map((loc, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100"
                      >
                        {loc.location} ({loc.count})
                      </span>
                    ))}
                    {suggestion.locations.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{suggestion.locations.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

            {suggestion.type === "location" &&
              suggestion.categories &&
              suggestion.categories.length > 0 && (
                <div className="ml-10 mt-2">
                  <p className="text-xs text-gray-500 mb-1">Places include:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.categories.slice(0, 5).map((cat, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100"
                      >
                        {cat.category} ({cat.count})
                      </span>
                    ))}
                    {suggestion.categories.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{suggestion.categories.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

            <div className="ml-10 mt-3">
              <span className="text-xs text-blue-600 font-medium">
                Click to view all results →
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Click any suggestion to view detailed results
        </p>
      </div>
    </div>
  );
};

// Main Hero Component
const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef(null);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { data: listings = [], loading } = useGoogleSheet(SHEET_ID, API_KEY);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery.trim());
      navigate(`/search-results?${params.toString()}`);
      setShowSuggestions(false);
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
      setSearchQuery("");
    },
    [navigate]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  const handleCategoryClick = (category) => {
    const categoryMap = {
      Hotel: "hotel",
      Restaurant: "restaurant",
      Shortlet: "shortlet",
      Tourism: "tourist-center",
    };
    const categorySlug = categoryMap[category];
    if (categorySlug) {
      navigate(`/category/${categorySlug}`);
    }
  };

  return (
    <>
      <section
        id="hero"
        className="bg-[#F7F7FA] font-rubik overflow-hidden min-h-[30vh] sm:min-h-[30vh] flex items-start relative mt-16 cursor-default"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 w-full cursor-default">
          <div
            ref={heroRef}
            className="flex flex-col items-center text-center gap-2 sm:gap-3 pt-0 sm:pt-2 pb-2 sm:pb-4 cursor-default"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ margin: "-100px", once: false }}
              className="flex flex-col justify-start space-y-2 sm:space-y-3 max-w-xl sm:max-w-2xl w-full cursor-default relative"
            >
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-manrope font-bold text-[#101828] leading-tight mt-1 sm:mt-2 px-2 cursor-default">
                Discover Ibadan through AI & Local Stories
              </h1>
              <p className="text-xs sm:text-sm leading-[1.3] text-slate-600 mb-2 sm:mb-4 font-manrope max-w-lg mx-auto px-4 cursor-default">
                Your all-in-one local guide for hotels, food, events, vendors,
                and market prices.
              </p>

              {/* Search Bar with Suggestions */}
              <div className="relative mx-auto w-full max-w-md px-2 cursor-default">
                <div className="flex items-center cursor-default">
                  <div
                    className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-10 cursor-default"
                    ref={searchInputRef}
                  >
                    <div className="pl-3 sm:pl-4 text-gray-500 cursor-default">
                      <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by area, category, or name..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() =>
                        setShowSuggestions(searchQuery.trim().length > 0)
                      }
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope cursor-pointer"
                      autoFocus={false}
                      aria-label="Search input"
                      role="searchbox"
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="p-1 mr-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        aria-label="Clear search"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="ml-2">
                    <button
                      onClick={handleSearchSubmit}
                      className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-2.5 px-4 sm:px-6 text-sm transition-colors duration-200 whitespace-nowrap font-manrope cursor-pointer"
                      aria-label="Perform search"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Search Suggestions Dropdown */}
                <SearchSuggestions
                  searchQuery={searchQuery}
                  listings={listings}
                  onSuggestionClick={handleSuggestionClick}
                  onClose={() => setShowSuggestions(false)}
                  isVisible={showSuggestions && !loading}
                  isMobile={isMobile}
                />

                <motion.div
                  className="text-center mt-1 cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: searchQuery ? 1 : 0,
                    y: searchQuery ? 0 : 10,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-gray-500 font-manrope cursor-default">
                    Press Enter or click Search to find results
                  </p>
                </motion.div>
              </div>

              {/* Category Icons */}
              <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 overflow-hidden px-2 cursor-default">
                {["Hotel", "Tourism", "Shortlet", "Restaurant"].map(
                  (category) => (
                    <motion.div
                      key={category}
                      className="text-center cursor-pointer group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="relative">
                        <img
                          src={getCategoryImage(
                            category,
                            FALLBACK_IMAGES[category]
                          )}
                          alt={category}
                          className="w-10 h-10 rounded-lg overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover group-hover:brightness-110 group-hover:shadow-md transition-all duration-200 cursor-pointer"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGES[category];
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 cursor-pointer"></div>
                      </div>
                      <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-[#06EAFC] transition-colors duration-200 cursor-pointer">
                        {category}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Backdrop for suggestions when visible */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              className="fixed inset-0 bg-black/20 z-40 cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuggestions(false)}
            />
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

export default Hero;
