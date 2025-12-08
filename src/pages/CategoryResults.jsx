// src/pages/CategoryResults.jsx - Complete corrected file
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { MdFavoriteBorder } from "react-icons/md";
import { PiSliders } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

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
            .map((row) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
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

// Helper functions for search suggestions
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

// Mobile Fullscreen Search Modal Component
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  categoryTitle,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Generate suggestions based on search query
  const suggestions = React.useMemo(() => {
    if (!inputValue.trim() || !listings.length) return [];

    const query = inputValue.toLowerCase().trim();
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
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const params = new URLSearchParams();
      params.append("q", inputValue.trim());
      onSuggestionClick(`/search-results?${params.toString()}`);
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

  // Handle click outside modal
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

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 bg-white z-[99999] flex flex-col">
      {/* Modal Header with Search Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm">
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

          {/* Search Input */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent ml-3 py-1 outline-none font-manrope text-base placeholder:text-gray-500"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Search ${categoryTitle} in Ibadan...`}
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

      {/* Suggestions Content */}
      <div className="flex-1 overflow-y-auto">
        {inputValue.trim() ? (
          <>
            {/* Suggestions Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
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

            {/* Suggestions List */}
            {suggestions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors group"
                    onClick={() => handleSuggestionClick(suggestion.action())}
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

                    {/* Location or Category breakdown */}
                    {suggestion.type === "category" &&
                      suggestion.locations &&
                      suggestion.locations.length > 0 && (
                        <div className="ml-12 mt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            Available in these areas:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.locations
                              .slice(0, 5)
                              .map((loc, idx) => (
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
                        <div className="ml-12 mt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            Places include:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.categories
                              .slice(0, 5)
                              .map((cat, idx) => (
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
              Search for {categoryTitle.toLowerCase()} in Ibadan
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Desktop Search Suggestions Component
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
}) => {
  const suggestionsRef = useRef(null);

  // Generate suggestions (same logic as mobile)
  const suggestions = React.useMemo(() => {
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
            onClick={() => onSuggestionClick(suggestion.action())}
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

// Fallback images
const FALLBACK_IMAGES = {
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  tourist:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  default:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
};

// Helper functions
const normalizeWord = (word) => {
  if (!word || typeof word !== "string") return "";
  const lowerWord = word.toLowerCase().trim();
  const pluralToSingular = {
    hotels: "hotel",
    restaurants: "restaurant",
    events: "event",
    tourisms: "tourism",
    cafes: "cafe",
    cafés: "cafe",
    bars: "bar",
    hostels: "hostel",
    shortlets: "shortlet",
    services: "service",
    attractions: "attraction",
    gardens: "garden",
    towers: "tower",
    centers: "center",
    centres: "centre",
    vendors: "vendor",
    markets: "market",
    prices: "price",
    results: "result",
    stories: "story",
  };
  return pluralToSingular[lowerWord] || lowerWord;
};

const matchesWord = (searchWord, targetWord) => {
  if (!searchWord || !targetWord) return false;
  const normalizedSearch = normalizeWord(searchWord);
  const normalizedTarget = normalizeWord(targetWord);
  if (normalizedSearch === normalizedTarget) return true;
  if (
    normalizedTarget.includes(normalizedSearch) ||
    normalizedSearch.includes(normalizedTarget)
  ) {
    return true;
  }
  return false;
};

const CategoryResults = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    availableNow: false,
    priceRange: { min: "", max: "" },
    rating: "",
    sortBy: "relevance",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredListings, setFilteredListings] = useState([]);
  const [originalListings, setOriginalListings] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
  const searchInputRef = useRef(null);

  // Use your actual Google Sheets data
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Initialize listings and filter by category
  useEffect(() => {
    const filtered = listings.filter((item) => {
      const itemCategory = (item.category || "").toLowerCase();
      const targetCategory = (category || "").toLowerCase();

      // Handle different category mappings
      if (targetCategory === "tourist-center") {
        return (
          itemCategory.includes("tourist") ||
          itemCategory.includes("attraction")
        );
      }

      return itemCategory.includes(targetCategory);
    });

    setOriginalListings(filtered);
    setFilteredListings(filtered);
  }, [listings, category]);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search is empty, show all listings for this category
      setFilteredListings(originalListings);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchLower = searchQuery.toLowerCase().trim();

    const filtered = originalListings.filter((item) => {
      // Search in name
      const nameMatch = item.name?.toLowerCase().includes(searchLower);

      // Search in area
      const areaMatch = item.area?.toLowerCase().includes(searchLower);

      // Search in description
      const descMatch = item.short_desc?.toLowerCase().includes(searchLower);

      // Search in address
      const addressMatch = item.address?.toLowerCase().includes(searchLower);

      // Search in features
      const featuresMatch = item.features?.toLowerCase().includes(searchLower);

      return (
        nameMatch || areaMatch || descMatch || addressMatch || featuresMatch
      );
    });

    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, originalListings]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearchInputClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    console.log("Search submitted:", searchQuery);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  // Handle mobile search click - opens fullscreen modal
  const handleMobileSearchClick = () => {
    if (isMobile) {
      setShowMobileSearchModal(true);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (isMobile) {
      handleMobileSearchClick();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (url) => {
    navigate(url);
    setShowMobileSearchModal(false);
    setSearchQuery("");
  };

  // Get card images function
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
    return [FALLBACK_IMAGES.default];
  };

  // Pagination logic
  const cardsPerPage = isMobile ? 15 : 16;
  const totalPages = Math.ceil(filteredListings.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentListings = filteredListings.slice(
    startIndex,
    startIndex + cardsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const FilterSidebar = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-gray-900">Filter Options</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          {[
            "Hotel",
            "Shortlet",
            "Restaurant",
            "Tourist Centre",
            "Bar & Lounge",
            "Event Centre",
          ].map((cat) => (
            <label
              key={cat}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Price</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="2,000"
              value={filters.priceRange.min}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, min: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="4,200"
              value={filters.priceRange.max}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, max: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Review Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Review</h4>
        <div className="space-y-2">
          {[5, 4, 3].map((stars) => (
            <label
              key={stars}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                {[...Array(stars)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="text-yellow-400 text-sm"
                  />
                ))}
                <span className="text-gray-700 text-sm">
                  {stars} Star{stars !== 1 ? "s" : ""}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPriceText = (item) => {
    const priceCategories = [
      "hotel",
      "hostel",
      "shortlet",
      "apartment",
      "cabin",
      "condo",
    ];
    const isAccommodation = priceCategories.some((cat) =>
      category.includes(cat)
    );

    if (isAccommodation) {
      return `#${formatPrice(item.price_from)} for 2 nights`;
    }
    return `From #${formatPrice(item.price_from)} per guest`;
  };

  // Business Card Component
  const BusinessCard = ({ item }) => {
    const images = getCardImages(item);
    const priceText = getPriceText(item);
    const location = item.area || "Ibadan";

    const handleCardClick = () => {
      if (item.id) {
        navigate(`/vendor-detail/${item.id}`);
      } else {
        navigate(`/category/${category}`);
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
        <div
          className={`${isMobile ? "p-1.5" : "p-2.5"} flex flex-col gap-0.5`}
        >
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

  const categoryTitle = category
    ? category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Category";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex space-x-1">
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
        title={`${categoryTitle} in Ibadan | Ajani Directory`}
        description={`Find the best ${categoryTitle} in Ibadan. Browse prices, reviews, and book directly.`}
        url={`https://ajani.ai/category/${category}`}
        image="https://ajani.ai/images/category-og.jpg"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Search Bar - Designed like Hero and SearchResults */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <div className="relative mx-auto w-full">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div
                  className="flex items-center cursor-default"
                  onClick={handleSearchInputClick}
                >
                  <div
                    className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-10 cursor-default"
                    ref={searchInputRef}
                    onClick={isMobile ? handleMobileSearchClick : undefined}
                  >
                    <div className="pl-3 sm:pl-4 text-gray-500 cursor-default">
                      <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder={`Search ${categoryTitle} in Ibadan...`}
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={handleSearchFocus}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope cursor-pointer"
                      autoFocus={false}
                      aria-label="Search input"
                      role="searchbox"
                      readOnly={isMobile} // Read-only on mobile to force modal
                    />
                    {searchQuery && (
                      <button
                        type="button"
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
                      type="submit"
                      className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-2.5 px-4 sm:px-6 text-sm transition-colors duration-200 whitespace-nowrap font-manrope cursor-pointer"
                      aria-label="Perform search"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Desktop Search Suggestions */}
                {!isMobile && (
                  <div className="relative z-10000">
                    <DesktopSearchSuggestions
                      searchQuery={searchQuery}
                      listings={listings}
                      onSuggestionClick={handleSuggestionClick}
                      onClose={() => {}}
                      isVisible={searchQuery.trim().length > 0}
                    />
                  </div>
                )}

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
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Fullscreen Search Modal */}
        {isMobile && (
          <MobileSearchModal
            searchQuery={searchQuery}
            listings={listings}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowMobileSearchModal(false)}
            onTyping={handleSearchChange}
            isVisible={showMobileSearchModal}
            categoryTitle={categoryTitle}
          />
        )}

        {/* Page Header with dynamic count */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#00065A] mb-2">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : ` ${categoryTitle}s in Ibadan`}
              </h1>
              <p className="text-gray-600">
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Showing {filteredListings.length} of{" "}
                    {originalListings.length} {categoryTitle}
                  </span>
                ) : (
                  `${filteredListings.length} places found in Ibadan`
                )}
              </p>
            </div>

            {/* Clear search button */}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Toggle Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Available Now Toggle Only */}
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
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Available Now
              </span>
            </label>
          </div>

          {/* Sort Dropdown and Mobile Filter */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] min-w-[160px]"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Mobile Filter Button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <PiSliders className="text-gray-600 text-lg" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Hidden on mobile unless toggled */}
          {(!isMobile || showMobileFilters) && (
            <div
              className={`${
                isMobile
                  ? "fixed inset-0 z-50 bg-white p-6 overflow-auto"
                  : "md:w-1/4"
              }`}
            >
              {isMobile && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-2xl text-gray-500"
                  >
                    ×
                  </button>
                </div>
              )}
              <FilterSidebar />
              {isMobile && (
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-[#06EAFC] text-white py-3 rounded-lg font-medium mt-4"
                >
                  Apply Filters
                </button>
              )}
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {/* No results message */}
            {filteredListings.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-3xl text-gray-300 mb-4 block"
                  />
                  <h3 className="text-lg text-gray-800 mb-2">
                    {searchQuery
                      ? `No ${categoryTitle} found for "${searchQuery}"`
                      : `No ${categoryTitle} found`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery
                      ? "Try a different search term or clear your search"
                      : "Try adjusting your filters"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile View - Horizontal scrolling with 5 cards per row */}
            {isMobile && filteredListings.length > 0 ? (
              <div className="space-y-4">
                {/* Create rows with 5 cards each */}
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
                        />
                      ))}
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop View - 4 cards per row grid */
              filteredListings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentListings.map((listing, index) => (
                    <BusinessCard key={listing.id || index} item={listing} />
                  ))}
                </div>
              )
            )}

            {/* Pagination - Only show if we have results */}
            {filteredListings.length > 0 && totalPages > 1 && (
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    )
                  )}
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

export default CategoryResults;
