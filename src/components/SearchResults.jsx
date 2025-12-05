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
import { motion, AnimatePresence } from "framer-motion";
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

// Enhanced FilterSidebar Component - Always visible on desktop
const FilterSidebar = ({
  onFilterChange,
  allLocations,
  allCategories,
  currentFilters,
  onClose,
  isMobileModal = false,
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

  // Toggle section expansion
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
    onFilterChange(resetFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
    if (isMobileModal && onClose) {
      onClose();
    }
  };

  const handleSelectAllLocations = () => {
    if (filters.locations.length === allLocations.length) {
      // If all are selected, clear selection
      setFilters((prev) => ({ ...prev, locations: [] }));
    } else {
      // Select all unique locations
      setFilters((prev) => ({
        ...prev,
        locations: [
          ...new Set(allLocations.map((l) => getLocationDisplayName(l))),
        ],
      }));
    }
  };

  const handleSelectAllCategories = () => {
    if (filters.categories.length === allCategories.length) {
      // If all are selected, clear selection
      setFilters((prev) => ({ ...prev, categories: [] }));
    } else {
      // Select all unique categories
      setFilters((prev) => ({
        ...prev,
        categories: [
          ...new Set(allCategories.map((c) => getCategoryDisplayName(c))),
        ],
      }));
    }
  };

  // Get unique display names for locations and categories
  const uniqueLocationDisplayNames = [
    ...new Set(allLocations.map((loc) => getLocationDisplayName(loc))),
  ].sort();
  const uniqueCategoryDisplayNames = [
    ...new Set(allCategories.map((cat) => getCategoryDisplayName(cat))),
  ].sort();

  const sidebarContent = (
    <div className={`space-y-6 ${isMobileModal ? "p-6" : ""}`}>
      {/* Header for mobile modal */}
      {isMobileModal && (
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Filter & Sort</h3>
            <p className="text-sm text-gray-500 mt-1">
              Refine your search results
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
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
              <button
                onClick={handleSelectAllLocations}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {filters.locations.length === uniqueLocationDisplayNames.length
                  ? "Clear All Locations"
                  : "Select All Locations"}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-2">
                {uniqueLocationDisplayNames.map((location, index) => (
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
                  </label>
                ))}
              </div>
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

      {/* CATEGORY SECTION */}
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
              <button
                onClick={handleSelectAllCategories}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                {filters.categories.length === uniqueCategoryDisplayNames.length
                  ? "Clear All Categories"
                  : "Select All Categories"}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 gap-2">
                {uniqueCategoryDisplayNames.map((category, index) => (
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
                  </label>
                ))}
              </div>
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
      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-3 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          Reset All
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-3 text-sm font-medium bg-[#06EAFC] text-white rounded-xl hover:bg-[#05d9eb] transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faCheck} />
          Apply Filters
        </button>
      </div>
    </div>
  );

  if (isMobileModal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-white z-50 overflow-y-auto"
      >
        {sidebarContent}
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filter Options</h3>
        <p className="text-sm text-gray-500 mt-1">Refine your search results</p>
      </div>
      {sidebarContent}
    </div>
  );
};

// BusinessCard Component - Updated to match Directory style
const BusinessCard = ({ item, category, isMobile }) => {
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

  const location = getLocationDisplayName(item.area) || "Ibadan";

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
        ${isMobile ? "w-[165px]" : "w-[210px]"} 
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
          alt={item.name}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
          loading="lazy"
        />

        {/* Guest favorite badge */}
        <div className="absolute top-2 left-2 bg-white px-1.5 py-1 rounded-md shadow-sm flex items-center gap-1">
          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
          <span className="text-[9px] font-semibold text-gray-900">
            Guest favorite
          </span>
        </div>
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
              className={`${
                isMobile ? "text-[9px]" : "text-xs"
              } text-yellow-400`}
            />
            {item.rating || "4.9"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced FilterPill Component for Active Filters
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

// CategorySection Component - Horizontal scrolling like Directory
const CategorySection = ({ title, items, sectionId, isMobile, category }) => {
  const navigate = useNavigate();

  const scrollSection = (direction) => {
    const container = document.getElementById(sectionId);
    if (!container) return;

    const scrollAmount = isMobile ? 140 : 220;
    const newPosition =
      direction === "next"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = () => {
    navigate(`/category/${category}`);
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <button
            onClick={handleCategoryClick}
            className={`
              text-[#00065A] hover:text-[#06EAFC] transition-colors text-left
              ${isMobile ? "text-sm" : "text-base"} 
              font-bold cursor-pointer flex items-center gap-1
            `}
          >
            {title}
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scrollSection("prev")}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
          >
            <FontAwesomeIcon
              icon={faChevronLeft}
              className="text-gray-600 text-[10px]"
            />
          </button>
          <button
            onClick={() => scrollSection("next")}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
          >
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-gray-600 text-[10px]"
            />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          id={sectionId}
          className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${
            isMobile ? "gap-1" : "gap-2"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item, index) => (
            <BusinessCard
              key={item.id || index}
              item={item}
              category={category}
              isMobile={isMobile}
            />
          ))}
        </div>
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

  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    categories: [],
    priceRange: { min: "", max: "" },
    ratings: [],
    sortBy: "relevance",
    amenities: [],
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filteredListings, setFilteredListings] = useState([]);
  const [groupedListings, setGroupedListings] = useState({});
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Extract unique locations and categories from listings
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

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter listings based on search parameters and active filters
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

    // Filter by category from URL
    if (category) {
      filtered = filtered.filter((item) => {
        return item.category === category;
      });
    }

    // Filter by location from URL
    if (location) {
      filtered = filtered.filter((item) => {
        return item.area === location;
      });
    }

    // Apply advanced filters from dropdown
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

    // Apply price range filter
    if (activeFilters.priceRange.min || activeFilters.priceRange.max) {
      const min = Number(activeFilters.priceRange.min) || 0;
      const max = Number(activeFilters.priceRange.max) || Infinity;
      filtered = filtered.filter((item) => {
        const price = Number(item.price_from) || 0;
        return price >= min && price <= max;
      });
    }

    // Apply rating filter
    if (activeFilters.ratings.length > 0) {
      filtered = filtered.filter((item) => {
        const rating = Number(item.rating) || 0;
        return activeFilters.ratings.some((stars) => rating >= stars);
      });
    }

    // Apply sort
    if (activeFilters.sortBy) {
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

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Close mobile filters
  const closeMobileFilters = () => {
    setShowMobileFilters(false);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  // Remove specific filter
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

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    });
  };

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
      return `Found ${filteredCount} places matching "${searchQuery}"`;
    if (category)
      return `Browse ${filteredCount} ${getCategoryDisplayName(
        category
      ).toLowerCase()} places in Ibadan`;
    if (location)
      return `Discover ${filteredCount} places in ${getLocationDisplayName(
        location
      )}`;
    return `Found ${filteredCount} places in Ibadan`;
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
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
                  placeholder="Search by area, category, or name..."
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

        {/* Mobile Filter Button - Only on mobile */}
        {isMobile && (
          <div className="mb-6">
            <button
              onClick={toggleMobileFilters}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm w-full justify-center"
            >
              <PiSliders className="text-gray-600" />
              <span className="text-sm text-gray-700 font-medium">
                Filter & Sort
              </span>
              {Object.keys(activeFilters).some((key) => {
                if (key === "priceRange") {
                  return (
                    activeFilters.priceRange.min || activeFilters.priceRange.max
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

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar - Hidden on mobile */}
          {!isMobile && (
            <div className="lg:w-1/4">
              <FilterSidebar
                onFilterChange={handleFilterChange}
                allLocations={allLocations}
                allCategories={allCategories}
                currentFilters={activeFilters}
              />
            </div>
          )}

          {/* Mobile Filter Modal */}
          <AnimatePresence>
            {isMobile && showMobileFilters && (
              <FilterSidebar
                onFilterChange={handleFilterChange}
                allLocations={allLocations}
                allCategories={allCategories}
                currentFilters={activeFilters}
                onClose={closeMobileFilters}
                isMobileModal={true}
              />
            )}
          </AnimatePresence>

          {/* Results Content */}
          <div className="lg:w-3/4">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#00065A] mb-1">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                {filteredCount} {filteredCount === 1 ? "place" : "places"} found
              </p>
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

            {/* Results - Horizontal Scrolling Sections like Directory */}
            <div className="space-y-6">
              {/* If no results with filters */}
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
                    {isMobile && (
                      <button
                        onClick={() => setShowMobileFilters(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Adjust Filters
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Tip: Try selecting fewer filters or different combinations
                  </p>
                </div>
              )}

              {/* Horizontal Scrolling Category Sections */}
              {filteredCount > 0 && (
                <>
                  {/* If we have specific category or location from URL, show all results in grid */}
                  {category || location ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredListings.map((item, index) => (
                        <BusinessCard
                          key={item.id || index}
                          item={item}
                          category={category || "all"}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Group by category for horizontal scrolling - Like Directory Component */
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
