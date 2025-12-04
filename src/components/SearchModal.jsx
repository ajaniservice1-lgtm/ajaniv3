// SearchModal.jsx - Full screen modal (Optimized Version)
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faXmark,
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { PiSliders } from "react-icons/pi";

// Custom debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

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

// Regular helper functions (not hooks)
const getCategoryDisplayName = (category) => {
  if (!category) return "Other";

  // Split by dot to get the second part
  const parts = category.split(".");
  if (parts.length > 1) {
    const secondPart = parts[1].trim();
    // Capitalize first letter and format
    if (secondPart.includes(" ")) {
      // For multi-word categories like "tourist center"
      return secondPart
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } else {
      // For single word categories
      return secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
    }
  }

  // Fallback: use the whole category
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const getCategorySlug = (category) => {
  if (!category) return "other";

  const parts = category.split(".");
  if (parts.length > 1) {
    return parts[1].trim().toLowerCase().replace(/\s+/g, "-");
  }

  return category.toLowerCase().replace(/\s+/g, "-");
};

// Dropdown Component with keyboard navigation
const Dropdown = ({
  isOpen,
  items,
  onSelect,
  selectedItem,
  type = "category",
  isMobile,
}) => {
  const dropdownRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        onSelect(items[focusedIndex]);
      } else if (e.key === "Escape") {
        onSelect(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items, focusedIndex, onSelect]);

  useEffect(() => {
    if (focusedIndex >= 0 && dropdownRef.current) {
      const focusedElement =
        dropdownRef.current.children[0]?.children[focusedIndex];
      focusedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`absolute top-full left-0 mt-1 ${
        isMobile ? "w-full" : "w-48"
      } bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-60 overflow-y-auto`}
      role="listbox"
      aria-label={`${type} dropdown`}
    >
      <div className="py-1">
        {items.length > 0 ? (
          items.map((item, index) => {
            const displayName =
              type === "category" ? getCategoryDisplayName(item) : item;

            return (
              <button
                key={index}
                onClick={() => onSelect(item)}
                className={`w-full text-left px-3 ${
                  isMobile ? "py-2" : "py-3"
                } hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  selectedItem === item
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700"
                } ${focusedIndex === index ? "ring-2 ring-blue-300" : ""}`}
                role="option"
                aria-selected={selectedItem === item}
                tabIndex={-1}
              >
                <span
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } font-manrope font-medium`}
                >
                  {displayName}
                </span>
                {selectedItem === item && (
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`${
                      isMobile ? "text-[10px]" : "text-xs"
                    } text-blue-600`}
                  />
                )}
              </button>
            );
          })
        ) : (
          <div
            className={`px-3 ${
              isMobile ? "py-2" : "py-3"
            } text-gray-500 text-center ${
              isMobile ? "text-xs" : "text-sm"
            } font-manrope`}
          >
            No items found
          </div>
        )}
      </div>
    </motion.div>
  );
};

// BusinessCard Component with lazy loading
const BusinessCard = React.memo(({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

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

  const location = item.area || "Ibadan";

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
      ref={cardRef}
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
      <div className="relative w-full lg:h-[170px] h-[150px]">
        {isVisible && (
          <img
            src={images[0]}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
            loading="lazy"
          />
        )}

        {/* Guest Favorite Badge - Top Left */}
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
          <span
            className={`${
              isMobile ? "text-[8px]" : "text-[9px]"
            } font-bold text-gray-900 font-manrope`}
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
          } font-bold text-gray-900 mb-1 line-clamp-1 font-manrope`}
        >
          {item.name}
        </h3>

        <p
          className={`${
            isMobile ? "text-[10px]" : "text-[11px]"
          } text-gray-600 mb-2 font-manrope`}
        >
          {location}
        </p>

        <div className="flex items-center justify-between">
          <p
            className={`${
              isMobile ? "text-[11px]" : "text-xs"
            } font-medium text-gray-900 font-manrope`}
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
                } font-medium text-gray-900 font-manrope`}
              >
                {item.rating}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BusinessCard.displayName = "BusinessCard";

// Category Section Component - Horizontal scrolling
const CategorySection = React.memo(({ title, items, isMobile }) => {
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
    const categorySlug = getCategorySlug(title);
    navigate(`/category/${categorySlug}`);
  };

  if (items.length === 0) return null;

  return (
    <div className={`${isMobile ? "mb-8" : "mb-10"} font-manrope`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-4">
        <h2
          className={`${
            isMobile ? "text-lg" : "text-xl"
          } font-bold text-gray-900 font-manrope`}
        >
          {getCategoryDisplayName(title)}.
        </h2>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative px-4">
        <div
          ref={scrollContainerRef}
          className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${
            isMobile ? "gap-3" : "gap-4"
          } pb-4`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item, index) => (
            <BusinessCard
              key={item.id || index}
              item={item}
              category={title}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scrollSection("prev")}
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 ${
            isMobile ? "w-6 h-6 -ml-2" : "w-8 h-8 -ml-4"
          } bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200`}
          aria-label="Scroll left"
        >
          <svg
            className={`${isMobile ? "w-2 h-2" : "w-3 h-3"} text-gray-600`}
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
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${
            isMobile ? "w-6 h-6 -mr-2" : "w-8 h-8 -mr-4"
          } bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200`}
          aria-label="Scroll right"
        >
          <svg
            className={`${isMobile ? "w-2 h-2" : "w-3 h-3"} text-gray-600`}
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
      </div>

      {/* View All Button - Centered below category */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleViewAll}
          className="text-[#06EAFC] hover:text-[#05d9eb] text-sm font-medium flex items-center gap-1 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-manrope"
          aria-label={`View all ${getCategoryDisplayName(title)}`}
        >
          View All
          <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
        </button>
      </div>
    </div>
  );
});

CategorySection.displayName = "CategorySection";

// Error Boundary Component
class SearchModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SearchModal Error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] bg-white p-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-sm">
            We encountered an error while loading the search. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="bg-[#06EAFC] hover:bg-[#05d9eb] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={this.props.onClose}
            className="mt-3 text-gray-600 hover:text-gray-800 text-sm"
          >
            Close Search
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main SearchModal Component
const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const inputRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  // Fetch data from Google Sheet
  const { data: listings = [] } = useGoogleSheet(SHEET_ID, API_KEY);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query) => {
      // Perform any additional search logic here
      console.log("Searching for:", query);
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      if (debouncedSearch.cancel) {
        debouncedSearch.cancel();
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (query) => {
      onSearchChange(query);
      debouncedSearch(query);
    },
    [onSearchChange, debouncedSearch]
  );

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      setSearchHistory((prev) =>
        [searchQuery, ...prev.filter((q) => q !== searchQuery)].slice(0, 5)
      );
      onSearchSubmit();
    }
  }, [searchQuery, onSearchSubmit]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Extract unique categories and locations from listings
  useEffect(() => {
    if (listings.length > 0) {
      const uniqueCategories = [
        ...new Set(listings.map((item) => item.category).filter(Boolean)),
      ];
      const uniqueLocations = [
        ...new Set(listings.map((item) => item.area).filter(Boolean)),
      ].sort();

      setAllCategories(uniqueCategories);
      setAllLocations(uniqueLocations);

      // Process categories for display
      const categoryMap = {};

      listings.forEach((item) => {
        const category = item.category || "other.other";

        // Group by the full category (e.g., "accommodation.hotel")
        if (!categoryMap[category]) {
          categoryMap[category] = [];
        }
        categoryMap[category].push(item);
      });

      // Convert to array format and sort by number of items
      const sortedCategories = Object.entries(categoryMap)
        .map(([category, items]) => ({
          title: category,
          items: items.slice(0, 10), // Limit to 10 items per category
          count: items.length,
          displayName: getCategoryDisplayName(category),
        }))
        .sort((a, b) => b.count - a.count);

      setCategoriesData(sortedCategories);
      setLoading(false);
    }
  }, [listings]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const handleClearSearch = useCallback(() => {
    onSearchChange("");
    setSelectedCategory(null);
    setSelectedLocation(null);
  }, [onSearchChange]);

  const handleCategorySelect = useCallback(
    (category) => {
      setSelectedCategory(category);
      setShowCategoryDropdown(false);
      onSearchChange(getCategoryDisplayName(category));
    },
    [onSearchChange]
  );

  const handleLocationSelect = useCallback(
    (location) => {
      setSelectedLocation(location);
      setShowLocationDropdown(false);
      onSearchChange(location);
    },
    [onSearchChange]
  );

  const handleAllCategoriesClick = useCallback(() => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    onSearchChange("");
  }, [onSearchChange]);

  // Filter categories based on search query and selected filters
  const filteredCategories = useMemo(() => {
    return categoriesData
      .filter((category) => {
        // Filter by search query
        if (searchQuery.trim() === "") return true;

        const matchesSearch =
          category.displayName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.items.some(
            (item) =>
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.area?.toLowerCase().includes(searchQuery.toLowerCase())
          );

        // Filter by selected category
        const matchesCategory =
          !selectedCategory || category.title === selectedCategory;

        // Filter by selected location
        const matchesLocation =
          !selectedLocation ||
          category.items.some((item) => item.area === selectedLocation);

        return matchesSearch && matchesCategory && matchesLocation;
      })
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const matchesSearch =
            searchQuery.trim() === "" ||
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesCategory =
            !selectedCategory || item.category === selectedCategory;
          const matchesLocation =
            !selectedLocation || item.area === selectedLocation;

          return matchesSearch && matchesCategory && matchesLocation;
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [categoriesData, searchQuery, selectedCategory, selectedLocation]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Full Screen Modal - Covers entire screen */}
      <motion.div
        className="fixed inset-0 z-[9999] bg-white overflow-hidden"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header - Search Section */}
          <div className="p-4 sm:p-6">
            {/* Top Row: Close button aligned with search bar */}
            <div className="flex items-center mb-4">
              <button
                onClick={onClose}
                className={`${
                  isMobile ? "w-8 h-8" : "w-10 h-10"
                } rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors`}
                aria-label="Close search modal"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } text-gray-600`}
                />
              </button>

              {/* Centered Search Bar Design */}
              <div className="flex-1 ml-3">
                <div className="flex items-center">
                  <div
                    className={`flex items-center bg-gray-200 rounded-full shadow-sm w-full ${
                      isMobile ? "max-w-full" : "max-w-md"
                    } relative z-10`}
                  >
                    <div
                      className={`${isMobile ? "pl-3" : "pl-4"} text-gray-500`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${
                          isMobile ? "h-3 w-3" : "h-4 w-4 sm:h-5 sm:w-5"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search by area or category..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className={`flex-1 bg-transparent ${
                        isMobile
                          ? "py-2 px-2 text-xs"
                          : "py-3 px-3 text-sm sm:text-base"
                      } text-gray-800 outline-none placeholder:text-gray-600 font-manrope`}
                      autoFocus
                      aria-label="Search input"
                      role="searchbox"
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className={`${
                          isMobile ? "p-1 mr-1" : "p-1 mr-2"
                        } text-gray-500 hover:text-gray-700`}
                        aria-label="Clear search"
                      >
                        <svg
                          className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Separate Search Button with gap */}
                  <div className={`${isMobile ? "ml-1" : "ml-2"}`}>
                    <button
                      onClick={handleSearchSubmit}
                      className={`bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full ${
                        isMobile
                          ? "py-2 px-3 text-xs"
                          : "py-3 px-6 text-sm sm:text-base"
                      } transition-colors duration-200 whitespace-nowrap font-manrope`}
                      aria-label="Perform search"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search hint text */}
            <motion.div
              className={`text-center mt-1 ${isMobile ? "mb-3" : "mb-4"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: searchQuery ? 1 : 0,
                y: searchQuery ? 0 : 10,
              }}
              transition={{ duration: 0.3 }}
            >
              <p
                className={`${
                  isMobile ? "text-[10px]" : "text-xs"
                } text-gray-500 font-manrope`}
              >
                Press Enter or click Search to find results
              </p>
            </motion.div>

            {/* Search History */}
            {searchHistory.length > 0 && !searchQuery && (
              <div className="mb-4">
                <p
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } text-gray-500 mb-2 font-manrope`}
                >
                  Recent searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSearchChange(term)}
                      className={`${
                        isMobile ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
                      } bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors font-manrope`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Buttons Row - Mobile responsive */}
            <div className="flex items-center justify-between">
              {/* Left side buttons - Mobile responsive layout */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
                <button
                  onClick={handleAllCategoriesClick}
                  className={`${
                    isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2"
                  } rounded-lg font-medium hover:bg-[#05d9eb] transition-colors flex items-center gap-1 flex-shrink-0 font-manrope ${
                    !selectedCategory && !selectedLocation
                      ? "bg-[#06EAFC] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label="Show all categories"
                >
                  All Categories
                </button>

                <div
                  className="relative flex-shrink-0"
                  ref={categoryDropdownRef}
                >
                  <button
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowLocationDropdown(false);
                    }}
                    className={`${
                      isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2"
                    } border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 font-manrope ${
                      selectedCategory
                        ? "border-[#06EAFC] text-[#06EAFC] bg-blue-50"
                        : "border-gray-300 text-gray-700"
                    }`}
                    aria-label="Select category"
                    aria-expanded={showCategoryDropdown}
                  >
                    Categories
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`${
                        isMobile ? "text-[10px]" : "text-xs"
                      } transition-transform ${
                        showCategoryDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    <Dropdown
                      isOpen={showCategoryDropdown}
                      items={allCategories}
                      onSelect={handleCategorySelect}
                      selectedItem={selectedCategory}
                      type="category"
                      isMobile={isMobile}
                    />
                  </AnimatePresence>
                </div>

                <div
                  className="relative flex-shrink-0"
                  ref={locationDropdownRef}
                >
                  <button
                    onClick={() => {
                      setShowLocationDropdown(!showLocationDropdown);
                      setShowCategoryDropdown(false);
                    }}
                    className={`${
                      isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2"
                    } border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 font-manrope ${
                      selectedLocation
                        ? "border-[#06EAFC] text-[#06EAFC] bg-blue-50"
                        : "border-gray-300 text-gray-700"
                    }`}
                    aria-label="Select location"
                    aria-expanded={showLocationDropdown}
                  >
                    Location
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`${
                        isMobile ? "text-[10px]" : "text-xs"
                      } transition-transform ${
                        showLocationDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    <Dropdown
                      isOpen={showLocationDropdown}
                      items={allLocations}
                      onSelect={handleLocationSelect}
                      selectedItem={selectedLocation}
                      type="location"
                      isMobile={isMobile}
                    />
                  </AnimatePresence>
                </div>
              </div>

              {/* Right side filter button - Mobile responsive */}
              <button
                className={`${
                  isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2"
                } border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 flex-shrink-0 font-manrope`}
                aria-label="Open filters"
              >
                <PiSliders
                  className={`${isMobile ? "text-base" : "text-lg"}`}
                />
                <span className={isMobile ? "hidden sm:inline" : "inline"}>
                  Filter
                </span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Search Results Summary - Mobile responsive */}
            {(searchQuery || selectedCategory || selectedLocation) && (
              <div
                className={`${isMobile ? "px-4 py-3" : "px-6 py-4"} ${
                  isMobile ? "mb-4" : "mb-6"
                }`}
              >
                <div
                  className={`flex flex-col ${isMobile ? "gap-2" : "gap-3"}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`${
                        isMobile ? "text-sm" : "text-base"
                      } text-gray-700 font-medium font-manrope`}
                    >
                      {searchQuery
                        ? `Results for "${searchQuery}"`
                        : "All Results"}
                    </span>
                    <span
                      className={`${
                        isMobile ? "text-xs" : "text-sm"
                      } text-gray-500 font-manrope`}
                    >
                      {filteredCategories.reduce(
                        (total, cat) => total + cat.items.length,
                        0
                      )}{" "}
                      places
                    </span>
                  </div>
                  {(selectedCategory || selectedLocation) && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                      {selectedCategory && (
                        <span
                          className={`${
                            isMobile
                              ? "px-2 py-1 text-[10px]"
                              : "px-3 py-1 text-xs"
                          } bg-blue-100 text-blue-700 rounded-full font-medium font-manrope flex-shrink-0`}
                        >
                          {getCategoryDisplayName(selectedCategory)}
                        </span>
                      )}
                      {selectedLocation && (
                        <span
                          className={`${
                            isMobile
                              ? "px-2 py-1 text-[10px]"
                              : "px-3 py-1 text-xs"
                          } bg-green-100 text-green-700 rounded-full font-medium font-manrope flex-shrink-0`}
                        >
                          {selectedLocation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading State - Mobile responsive */}
            {loading ? (
              <div className={`${isMobile ? "px-4" : "px-6"} space-y-6`}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div
                      className={`h-${
                        isMobile ? "4" : "6"
                      } bg-gray-200 rounded ${
                        isMobile ? "w-1/2" : "w-1/3"
                      } mb-4`}
                    ></div>
                    <div className="flex overflow-x-auto gap-4">
                      {[...Array(4)].map((_, j) => (
                        <div
                          key={j}
                          className={`${
                            isMobile ? "w-[165px]" : "w-[210px]"
                          } flex-shrink-0`}
                        >
                          <div className="lg:h-[170px] h-[150px] bg-gray-200 rounded-xl mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Categories List - Mobile responsive */
              <div className={`${isMobile ? "px-4" : "px-6"}`}>
                {filteredCategories.map((category, index) => (
                  <CategorySection
                    key={index}
                    title={category.title}
                    items={category.items}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            )}

            {/* No Results State - Mobile responsive */}
            {!loading && filteredCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full px-4">
                <div
                  className={`${
                    isMobile ? "w-16 h-16" : "w-20 h-20"
                  } bg-gray-100 rounded-full flex items-center justify-center mb-4 ${
                    isMobile ? "mb-4" : "mb-6"
                  }`}
                >
                  <svg
                    className={`${
                      isMobile ? "w-8 h-8" : "w-10 h-10"
                    } text-gray-400`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3
                  className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } font-bold text-gray-900 mb-2 font-manrope`}
                >
                  No results found
                </h3>
                <p
                  className={`text-gray-600 text-center ${
                    isMobile ? "mb-6 text-sm" : "mb-8"
                  } font-manrope ${isMobile ? "max-w-sm" : "max-w-md"}`}
                >
                  We couldn't find any results for "
                  {searchQuery ||
                    selectedCategory ||
                    selectedLocation ||
                    "your search"}
                  ". Try searching for different terms.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Hotel",
                    "Restaurant",
                    "Shortlet",
                    "Tourist Center",
                    "Cafe",
                    "Services",
                    "Event",
                    "Weekend",
                    "Hall",
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => onSearchChange(term)}
                      className={`${
                        isMobile ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
                      } bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-manrope`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

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
    </>
  );
};

// Wrap with Error Boundary
const SearchModalWithErrorBoundary = (props) => (
  <SearchModalErrorBoundary {...props}>
    <SearchModal {...props} />
  </SearchModalErrorBoundary>
);

export default SearchModalWithErrorBoundary;
