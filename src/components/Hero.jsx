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
  faLandmark,
  faHome,
  faTools,
  faClock,
  faCalendarDay,
  faSun,
  faMoon,
  faCoffee,
} from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";
import { format, isWeekend, isAfter, isBefore, addDays } from "date-fns";

// Direct image imports
import hotelImg from "../assets/Logos/hotel.jpg";
import tourismImg from "../assets/Logos/tourism.jpg";
import eventsImg from "../assets/Logos/events.jpg";
import restuarantImg from "../assets/Logos/restuarant.jpg";

// FALLBACK IMAGES - ADDED SERVICES
const FALLBACK_IMAGES = {
  Hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80",
  Restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80",
  Shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&q=80",
  Tourism:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&q=80",
  Services:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=300&fit=crop&q=80",
};

// ===== DATE HELPER FUNCTIONS =====
const getDateContext = () => {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM do");
  const hour = today.getHours();
  let timeOfDay;
  let timeIcon;
  if (hour < 6) {
    timeOfDay = "late night";
    timeIcon = faMoon;
  } else if (hour < 12) {
    timeOfDay = "morning";
    timeIcon = faSun;
  } else if (hour < 15) {
    timeOfDay = "afternoon";
    timeIcon = faSun;
  } else if (hour < 18) {
    timeOfDay = "evening";
    timeIcon = faSun;
  } else if (hour < 21) {
    timeOfDay = "night";
    timeIcon = faMoon;
  } else {
    timeOfDay = "late night";
    timeIcon = faMoon;
  }
  return {
    today,
    formattedDate,
    isWeekend: isWeekend(today),
    timeOfDay,
    timeIcon,
    dayName: format(today, "EEEE"),
    monthName: format(today, "MMMM"),
    year: today.getFullYear(),
    hour: hour,
    minute: today.getMinutes(),
  };
};

const getDateAwareListings = (listings, dateContext) => {
  if (!listings.length) return listings;
  return listings
    .map((item) => {
      let featuredScore = 0;
      let dateTags = [];
      // Weekend relevance
      if (dateContext.isWeekend) {
        if (item.category?.toLowerCase().includes("tourism")) {
          featuredScore += 4;
          dateTags.push("weekend getaway");
        }
        if (item.category?.toLowerCase().includes("hotel")) {
          featuredScore += 3;
          dateTags.push("weekend stay");
        }
        if (item.category?.toLowerCase().includes("restaurant")) {
          featuredScore += 2;
          dateTags.push("weekend dining");
        }
      }
      // Time of day relevance
      if (dateContext.timeOfDay === "morning") {
        if (item.category?.toLowerCase().includes("restaurant")) {
          featuredScore += 1;
          dateTags.push("breakfast spot");
        }
      } else if (dateContext.timeOfDay === "afternoon") {
        if (item.category?.toLowerCase().includes("tourism")) {
          featuredScore += 2;
          dateTags.push("afternoon activity");
        }
        if (item.category?.toLowerCase().includes("restaurant")) {
          featuredScore += 1;
          dateTags.push("lunch spot");
        }
      } else if (
        dateContext.timeOfDay === "evening" ||
        dateContext.timeOfDay === "night"
      ) {
        if (item.category?.toLowerCase().includes("restaurant")) {
          featuredScore += 3;
          dateTags.push("dinner spot");
        }
        if (item.category?.toLowerCase().includes("hotel")) {
          featuredScore += 2;
          dateTags.push("night stay");
        }
      }
      // Evening entertainment
      if (
        (dateContext.hour >= 18 || dateContext.hour < 6) &&
        item.category?.toLowerCase().includes("services")
      ) {
        featuredScore += 1;
        dateTags.push("evening service");
      }
      return {
        ...item,
        featuredScore,
        isFeaturedToday: featuredScore >= 3,
        dateTags: Array.from(new Set(dateTags)),
      };
    })
    .sort((a, b) => b.featuredScore - a.featuredScore);
};

// ===== HELPER FUNCTIONS =====
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
        return hotelImg;
      case "Tourism":
        return tourismImg;
      case "Shortlet":
        return eventsImg;
      case "Restaurant":
        return restuarantImg;
      case "Services":
        return FALLBACK_IMAGES.Services;
      default:
        return fallback;
    }
  } catch (error) {
    console.log(`Error loading ${category} image:`, error);
    return fallback;
  }
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes("hotel")) return faBuilding;
  if (cat.includes("restaurant") || cat.includes("food")) return faUtensils;
  if (cat.includes("shortlet") || cat.includes("apartment")) return faHome;
  if (cat.includes("tourism") || cat.includes("tourist")) return faLandmark;
  if (cat.includes("services")) return faTools;
  return faFilter;
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

// Helper function to get category breakdown for listings
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

// Helper function to get location breakdown for listings
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

// Helper function to generate search suggestions with breakdowns - ENHANCED WITH DATE
const generateSearchSuggestions = (query, listings, dateContext) => {
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
  // ===== CATEGORY SUGGESTIONS =====
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
      // Get top locations for this category
      const topLocations = locationBreakdown.slice(0, 3);
      // Add date-aware description
      const isWeekendRelevant =
        dateContext.isWeekend &&
        (category.toLowerCase().includes("tourism") ||
          category.toLowerCase().includes("hotel"));
      const isTimeRelevant =
        (dateContext.timeOfDay === "evening" ||
          dateContext.timeOfDay === "night") &&
        category.toLowerCase().includes("restaurant");
      return {
        type: "category",
        title: getCategoryDisplayName(category),
        count: totalPlaces,
        description: `${totalPlaces} ${
          totalPlaces === 1 ? "place" : "places"
        } found${isWeekendRelevant ? " • Great for weekends" : ""}${
          isTimeRelevant ? " • Perfect for now" : ""
        }`,
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
          if (dateContext.isWeekend) params.append("weekend", "true");
          if (
            dateContext.timeOfDay === "evening" ||
            dateContext.timeOfDay === "night"
          )
            params.append("time", "evening");
          return `/search-results?${params.toString()}`;
        },
      };
    })
    .sort((a, b) => b.count - a.count);
  // ===== LOCATION SUGGESTIONS =====
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
      // Get top categories for this location
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

// ===== COMPONENTS =====
// Mobile Fullscreen Search Modal Component
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  dateContext,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  // Generate suggestions with breakdowns
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(inputValue, listings, dateContext);
  }, [inputValue, listings, dateContext]);
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
      if (dateContext.isWeekend) params.append("weekend", "true");
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] animate-fadeIn"
        onClick={onClose}
      />
      {/* Modal Content */}
      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-[9991] animate-slideInUp flex flex-col"
      >
        {/* Header with Date Info */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>
            <div className="flex-1">
              {/* Date Display */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <FontAwesomeIcon
                    icon={dateContext.timeIcon}
                    className="w-3 h-3 text-amber-500"
                  />
                  <span className="font-medium">
                    {dateContext.formattedDate}
                  </span>
                  {dateContext.isWeekend && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">
                      Weekend
                    </span>
                  )}
                </div>
              </div>
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
                  placeholder={
                    dateContext.timeOfDay === "evening" ||
                    dateContext.timeOfDay === "night"
                      ? "Find dinner spots, hotels..."
                      : dateContext.timeOfDay === "morning"
                      ? "Search breakfast spots, morning activities..."
                      : "Search by area, category, or name..."
                  }
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
        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            <>
              {/* Suggestions Section */}
              {suggestions.length > 0 ? (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Top Suggestions ({suggestions.length})
                      </h3>
                      <div className="text-xs text-gray-500">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="w-3 h-3 mr-1"
                        />
                        Updated {format(new Date(), "h:mm a")}
                      </div>
                    </div>
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
                                          icon={item.icon}
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
                      if (dateContext.isWeekend)
                        params.append("weekend", "true");
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
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
                          {dateContext.isWeekend && " • Weekend mode active"}
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
                    {dateContext.isWeekend
                      ? "Try weekend-specific searches like 'hotels' or 'getaways'"
                      : "Try searching with different keywords or browse categories"}
                  </p>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.append("q", inputValue.trim());
                      if (dateContext.isWeekend)
                        params.append("weekend", "true");
                      onSuggestionClick(`/search-results?${params.toString()}`);
                      onClose();
                    }}
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Search anyway
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State with Date Tips */
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-teal-50 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon
                  icon={dateContext.timeIcon}
                  className="w-10 h-10 text-amber-500"
                />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-3">
                Good {dateContext.timeOfDay} in Ibadan
              </p>
              <p className="text-sm text-gray-600 text-center max-w-xs mb-2">
                {dateContext.formattedDate}
              </p>
              <p className="text-sm text-gray-600 text-center max-w-xs mb-8">
                {dateContext.isWeekend
                  ? "Weekend adventures await!"
                  : "Search for what you need today"}
              </p>
              {/* Popular Search Tips with Date Context */}
              <div className="mt-8 w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  {dateContext.isWeekend
                    ? "Weekend ideas:"
                    : "Try searching for:"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(dateContext.isWeekend
                    ? [
                        "Hotels",
                        "Weekend trips",
                        "Restaurants",
                        "Getaways",
                        "Activities",
                      ]
                    : dateContext.timeOfDay === "evening" ||
                      dateContext.timeOfDay === "night"
                    ? [
                        "Dinner spots",
                        "Hotels",
                        "Nightlife",
                        "Late food",
                        "24/7",
                      ]
                    : dateContext.timeOfDay === "morning"
                    ? [
                        "Breakfast",
                        "Hotels",
                        "Morning activities",
                        "Coffee",
                        "Brunch",
                      ]
                    : [
                        "Hotels",
                        "Restaurants",
                        "Ibadan",
                        "Shortlets",
                        "Tourism",
                      ]
                  ).map((term) => (
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

// Desktop Search Suggestions Component
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
  dateContext,
}) => {
  const suggestionsRef = useRef(null);
  // Generate suggestions with breakdowns
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, listings, dateContext);
  }, [searchQuery, listings, dateContext]);
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
        {/* Suggestions Header with Date Info */}
        <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-teal-50/50 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faSearch}
                className="w-4 h-4 text-gray-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Results for "{searchQuery}"
              </span>
              {dateContext.isWeekend && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  Weekend
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <FontAwesomeIcon
                  icon={dateContext.timeIcon}
                  className="w-3 h-3 text-amber-500"
                />
                <span>{dateContext.timeOfDay}</span>
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
                                icon={item.icon}
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
                if (dateContext.isWeekend) params.append("weekend", "true");
                if (
                  dateContext.timeOfDay === "evening" ||
                  dateContext.timeOfDay === "night"
                )
                  params.append("time", "evening");
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
                    {dateContext.isWeekend && " • Weekend mode active"}
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

// Main Discover Ibadan Component
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
  const [dateContext, setDateContext] = useState(getDateContext());
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { data: listings = [], loading } = useGoogleSheet(SHEET_ID, API_KEY);

  // Update date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setCurrentTime(newTime);
      setDateContext(getDateContext());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Get date-aware listings
  const dateAwareListings = useMemo(() => {
    return getDateAwareListings(listings, dateContext);
  }, [listings, dateContext]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track search bar position for suggestions - with real-time scroll updates
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

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery.trim());
      if (dateContext.isWeekend) params.append("weekend", "true");
      if (
        dateContext.timeOfDay === "evening" ||
        dateContext.timeOfDay === "night"
      )
        params.append("time", "evening");
      navigate(`/search-results?${params.toString()}`);
      setShowSuggestions(false);
      setShowMobileModal(false);
    }
  }, [searchQuery, navigate, dateContext]);

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

  // Handle search change
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

  // Handle mobile search click
  const handleMobileSearchClick = useCallback(() => {
    if (isMobile) {
      setShowMobileModal(true);
    }
  }, [isMobile]);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    if (isMobile) {
      handleMobileSearchClick();
    } else if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [isMobile, searchQuery, handleMobileSearchClick]);

  // Handle category click
  const handleCategoryClick = (category) => {
    const categoryMap = {
      Hotel: "hotel",
      Restaurant: "restaurant",
      Shortlet: "shortlet",
      Tourism: "tourist-center",
      Services: "services",
    };
    const categorySlug = categoryMap[category];
    if (categorySlug) {
      if (category === "Services") {
        // For Services, scroll to AiTopPicks section
        const aiTopPicksSection = document.getElementById("toppicks");
        if (aiTopPicksSection) {
          const offset = 80; // Adjust this value based on your header height
          const elementPosition = aiTopPicksSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      } else {
        // For other categories, navigate normally
        const params = new URLSearchParams();
        if (
          dateContext.isWeekend &&
          (category === "Hotel" || category === "Tourism")
        ) {
          params.append("weekend", "true");
        }
        navigate(`/category/${categorySlug}?${params.toString()}`);
      }
    }
  };

  // Get time-appropriate greeting
  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  return (
    <div className="min-h-screen bg-white font-manrope">
      {/* Hero Section */}
      <section
        id="hero"
        className="bg-[#F7F7FA] overflow-hidden min-h-[30vh] md:min-h-[35vh] lg:min-h-[40vh] flex items-start justify-center relative"
      >
        {/* Date Display Banner */}
        <div className="absolute top-4 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              {/* Current date and time */}
              <div className="flex items-center gap-2">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {currentTime.getDate()}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-gray-700">
                      <span className="font-semibold">
                        {dateContext.dayName}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{format(currentTime, "MMM dd")}</span>
                      <span className="mx-1">•</span>
                      <span className="text-gray-500">
                        {format(currentTime, "h:mm a")}
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
                {/* Weekend Badge */}
                {dateContext.isWeekend && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm flex items-center gap-1">
                    <span>🎉</span>
                    <span>Weekend Specials</span>
                  </div>
                )}
              </div>
              {/* Time-based info */}
              <div className="flex items-center gap-2">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={dateContext.timeIcon}
                      className={`w-3 h-3 ${
                        dateContext.timeOfDay.includes("night")
                          ? "text-blue-500"
                          : "text-amber-500"
                      }`}
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {getTimeGreeting()} in Ibadan
                    </span>
                  </div>
                </div>
                {/* Live indicator */}
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 md:mt-6">
          <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
            {/* Hero Title */}
            <div className="space-y-2 md:space-y-3 max-w-xl md:max-w-2xl w-full md:mt-12 mt-16">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Discover{" "}
                <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                  Ibadan through AI & Local Stories
                </span>{" "}
                <span className="text-sm md:text-base font-normal text-gray-600">
                  • {dateContext.formattedDate}
                </span>
              </h1>
              <p className="text-sm sm:text-sm md:text-base text-gray-600 font-medium max-w-xl md:ml-14">
                Your all-in-one local guide for hotels, food, events, vendors,
                and market prices.
              </p>
              {/* Today's Featured Stats */}
              <div className="hidden md:flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    {dateAwareListings.filter((l) => l.isFeaturedToday).length}{" "}
                    featured today
                  </span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <FontAwesomeIcon
                    icon={dateContext.timeIcon}
                    className="w-3 h-3 text-amber-500"
                  />
                  <span>
                    {dateContext.timeOfDay === "evening"
                      ? "Evening spots"
                      : dateContext.timeOfDay === "morning"
                      ? "Morning picks"
                      : dateContext.timeOfDay === "night"
                      ? "Night finds"
                      : "Afternoon activities"}
                  </span>
                </div>
                {dateContext.isWeekend && (
                  <>
                    <div className="text-gray-400">•</div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <span>🎉</span>
                      <span>Weekend mode</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search Box Container */}
            <div className="w-full max-w-md md:max-w-md mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex flex-col gap-4">
                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="h-4 w-4 text-gray-400"
                      />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={handleSearchFocus}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        dateContext.timeOfDay === "evening" ||
                        dateContext.timeOfDay === "night"
                          ? "Find dinner spots, hotels, nightlife..."
                          : dateContext.timeOfDay === "morning"
                          ? "Search breakfast spots, morning activities..."
                          : dateContext.timeOfDay === "afternoon"
                          ? "Search lunch spots, afternoon activities..."
                          : "Search by area, category, or name..."
                      }
                      className="w-full pl-9 pr-8 py-2 text-sm rounded-full border border-gray-300 bg-white shadow-sm hover:shadow transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Search businesses and locations in Ibadan"
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label="Clear search"
                      >
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="h-4 w-4 text-gray-400 hover:text-gray-600"
                        />
                      </button>
                    )}
                  </div>

                  {/* Category Icons */}
                  <div className="grid grid-cols-4 gap-4">
                    {["Hotel", "Restaurant", "Events", "Tourism"].map(
                      (category) => {
                        const isTimeRelevant =
                          ((dateContext.timeOfDay === "evening" ||
                            dateContext.timeOfDay === "night") &&
                            category === "Restaurant") ||
                          (dateContext.isWeekend &&
                            (category === "Hotel" || category === "Tourism"));
                        return (
                          <motion.div
                            key={category}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group cursor-pointer flex flex-col items-center"
                            onClick={() => handleCategoryClick(category)}
                          >
                            {/* Square Container */}
                            <div className="relative w-16 h-16">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl transform group-hover:scale-105 transition-transform duration-300"></div>
                              <div className="relative w-full h-full p-1">
                                <div className="w-full h-full overflow-hidden rounded-lg shadow-sm group-hover:shadow transition-all duration-300">
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
                              {/* Time/Weekend badge */}
                              {isTimeRelevant && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                                  <span className="text-white text-[10px]">
                                    ⭐
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="mt-2 text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-200 text-center whitespace-nowrap">
                              {category}
                            </p>
                          </motion.div>
                        );
                      }
                    )}
                  </div>

                  {/* Search Button */}
                  <button
                    onClick={handleSearchSubmit}
                    className="bg-gradient-to-r from-[#06EAFC] to-teal-400 hover:from-[#08d7e6] hover:to-teal-500 font-semibold py-2 px-4 rounded-full shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap text-sm flex items-center justify-center gap-1"
                    aria-label="Search"
                  >
                    <FontAwesomeIcon icon={faSearch} className="w-3 h-3" />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent opacity-50"></div>
      </section>

      {/* Green Separator Line with Live Status */}
      <div className="relative mb-4">
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-green-400 mt-3 via-green-500 to-green-400 opacity-70"></div>
        <div className="text-center mt-5">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1 rounded-full shadow-sm border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600">
              Live • Updated {format(currentTime, "h:mm a")} •{" "}
              {dateAwareListings.length} places in Ibadan
              {dateContext.isWeekend && " • Weekend mode active"}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Search Suggestions */}
      {!isMobile && (
        <DesktopSearchSuggestions
          searchQuery={searchQuery}
          listings={dateAwareListings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
          isVisible={showSuggestions && !loading}
          searchBarPosition={searchBarPosition}
          dateContext={dateContext}
        />
      )}

      {/* Mobile Fullscreen Search Modal */}
      {isMobile && (
        <MobileSearchModal
          searchQuery={searchQuery}
          listings={dateAwareListings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowMobileModal(false)}
          onTyping={handleSearchChange}
          isVisible={showMobileModal}
          dateContext={dateContext}
        />
      )}
    </div>
  );
};

export default DiscoverIbadan;
