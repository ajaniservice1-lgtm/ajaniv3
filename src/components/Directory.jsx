// src/components/Directory.jsx
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link, useNavigate } from "react-router-dom";
import { MdFavoriteBorder } from "react-icons/md";
import { FaGreaterThan, FaLessThan } from "react-icons/fa";
import { PiSliders } from "react-icons/pi";

// ---------------- Skeleton Loading Components ----------------
const SkeletonCard = ({ isMobile }) => (
  <div
    className={`
      bg-white rounded-xl overflow-hidden flex-shrink-0 
      font-manrope animate-pulse
      ${isMobile ? "w-[160px]" : "w-[220px]"} 
    `}
  >
    {/* Image Skeleton */}
    <div
      className={`
        relative overflow-hidden rounded-xl bg-gray-200
        ${isMobile ? "w-full h-[140px]" : "w-full h-[160px]"}
      `}
    ></div>

    {/* Text Skeleton */}
    <div className={`${isMobile ? "p-1.5" : "p-2.5"} flex flex-col gap-2`}>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
      <div className="flex items-center gap-1 mt-1">
        <div className="h-2 bg-gray-200 rounded w-1/3"></div>
        <div className="h-2 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

const SkeletonCategorySection = ({ isMobile }) => (
  <section className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="flex gap-1">
        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
        <div className="w-6 h-6 rounded-full bg-gray-200"></div>
      </div>
    </div>

    <div className="flex overflow-x-auto scrollbar-hide gap-2">
      {[...Array(6)].map((_, index) => (
        <SkeletonCard key={index} isMobile={isMobile} />
      ))}
    </div>
  </section>
);

const SkeletonDirectory = ({ isMobile }) => (
  <section id="directory" className="bg-white py-4 font-manrope">
    <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Header Skeleton */}
      <div className="mb-4">
        <div className="text-center mb-4">
          <div className="h-5 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between mb-3">
          <div className="flex w-full sm:w-auto justify-between items-center gap-1">
            <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-8"></div>
          </div>
        </div>
      </div>

      {/* Category Sections Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <SkeletonCategorySection key={index} isMobile={isMobile} />
        ))}
      </div>
    </div>
  </section>
);

// ---------------- FilterDropdown Component ----------------
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

// ---------------- Helpers ----------------
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const FALLBACK_IMAGES = {
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
  hostel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  services:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
  event:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  weekend:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  hall: "https://images.unsplash.com-1511795409834-ef04bbd61622?w=600&q=80",
  attraction:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  garden:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  tower:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  amala:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
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
  if (cat.includes("cafe")) return [FALLBACK_IMAGES.cafe];
  if (cat.includes("bar")) return [FALLBACK_IMAGES.bar];
  if (cat.includes("hostel")) return [FALLBACK_IMAGES.hostel];
  if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
  if (cat.includes("services")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event") || cat.includes("weekend") || cat.includes("hall"))
    return [FALLBACK_IMAGES.event];
  if (
    cat.includes("attraction") ||
    cat.includes("garden") ||
    cat.includes("tower")
  )
    return [FALLBACK_IMAGES.attraction];
  if (cat.includes("amala")) return [FALLBACK_IMAGES.amala];
  return [FALLBACK_IMAGES.default];
};

// ---------------- Custom Hook ----------------
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

// ---------------- BusinessCard Component ----------------
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

  const priceText =
    category === "hotel" ||
    category === "hostel" ||
    category === "shortlet" ||
    category === "apartment" ||
    category === "cabin" ||
    category === "condo"
      ? `#${formatPrice(item.price_from)} for 2 nights`
      : `From #${formatPrice(item.price_from)} per guest`;

  const location = item.area || "Ibadan";

  const handleCardClick = () => {
    // Navigate to vendor detail page using the item's ID
    if (item.id) {
      navigate(`/vendor-detail/${item.id}`);
    } else {
      // Fallback to category page if no ID
      navigate(`/category/${category}`);
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
            e.stopPropagation(); // Prevent card click when clicking heart
            // Add to favorites logic here
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

// ---------------- CategorySection Component ----------------
const CategorySection = ({ title, items, sectionId, isMobile }) => {
  const navigate = useNavigate();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef(null);

  if (items.length === 0) return null;

  const getCategoryFromTitle = (title) => {
    const words = title.toLowerCase().split(" ");
    if (words.includes("hotel")) return "hotel";
    if (words.includes("shortlet")) return "shortlet";
    if (words.includes("restaurant")) return "restaurant";
    if (words.includes("tourist")) return "tourist-center";
    return words[1] || "all";
  };

  const category = getCategoryFromTitle(title);

  // Check scroll position to update arrow states
  const updateArrows = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Check if we can scroll left (not at start)
    const hasScrollLeft = scrollLeft > 0;
    setCanScrollLeft(hasScrollLeft);
    
    // Check if we can scroll right (not at end)
    // Using 5px buffer to account for rounding
    const hasScrollRight = Math.ceil(scrollLeft + clientWidth) < Math.floor(scrollWidth) - 5;
    setCanScrollRight(hasScrollRight);
    
    console.log(`Section: ${sectionId}, Left: ${hasScrollLeft}, Right: ${hasScrollRight}, scrollLeft: ${scrollLeft}, clientWidth: ${clientWidth}, scrollWidth: ${scrollWidth}`);
  };

  // Initialize and add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Initial check
      setTimeout(updateArrows, 100); // Small delay to ensure DOM is ready
      
      // Add scroll event listener
      container.addEventListener('scroll', updateArrows);
      
      // Also check on resize
      const handleResize = () => setTimeout(updateArrows, 100);
      window.addEventListener('resize', handleResize);
      
      return () => {
        container.removeEventListener('scroll', updateArrows);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [items.length, isMobile, sectionId]);

  const scrollSection = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = isMobile ? 180 : 220; // Slightly more than one card
    
    const newPosition = direction === "next" 
      ? container.scrollLeft + scrollAmount
      : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    // Check position after animation
    setTimeout(updateArrows, 400);
  };

  const handleCategoryClick = () => {
    navigate(`/category/${category}`);
  };

  return (
    <section className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <button
            onClick={handleCategoryClick}
            className={`
              text-[#00065A] hover:text-[#06EAFC] transition-colors text-left
              ${isMobile ? "text-sm" : "text-[19px]"} 
              font-bold cursor-pointer flex items-center gap-1
            `}
          >
            {title}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div className="flex gap-1">
          {/* Left arrow - gray when active, light gray when disabled */}
          <button
            onClick={() => scrollSection("prev")}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              canScrollLeft 
                ? "bg-gray-100 hover:bg-gray-300 cursor-pointer" 
                : "bg-gray-50 cursor-not-allowed"
            }`}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <FaLessThan 
              className={`text-[10px] ${
                canScrollLeft ? "text-gray-700" : "text-gray-400"
              }`} 
            />
          </button>
          
          {/* Right arrow - gray when active, light gray when disabled */}
          <button
            onClick={() => scrollSection("next")}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              canScrollRight 
                ? "bg-gray-100 hover:bg-gray-300 cursor-pointer" 
                : "bg-gray-50 cursor-not-allowed"
            }`}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <FaGreaterThan 
              className={`text-[10px] ${
                canScrollRight ? "text-gray-700" : "text-gray-400"
              }`} 
            />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          id={sectionId}
          className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${
            isMobile ? "gap-1" : "gap-2"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingRight: "16px",
          }}
          onScroll={updateArrows} // Also trigger on scroll
        >
          {items.map((item, index) => (
            <BusinessCard
              key={item.id || index}
              item={item}
              category={sectionId.replace("-section", "")}
              isMobile={isMobile}
            />
          ))}
          {/* Spacer for last card visibility */}
          <div className="flex-shrink-0" style={{ width: "16px" }}></div>
        </div>
      </div>
    </section>
  );
};

// ---------------- Main Directory Component ----------------
const Directory = () => {
  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [area, setArea] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const navigate = useNavigate();

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

  // Show skeleton loading while data is being fetched
  if (loading) {
    return <SkeletonDirectory isMobile={isMobile} />;
  }

  // Define the specific categories we want to display
  const getPopularCategories = () => {
    return ["hotel", "shortlet", "restaurant", "tourist center"];
  };

  // Apply advanced filters function
  const applyAdvancedFilters = (item, filters) => {
    if (!filters || Object.keys(filters).length === 0) return true;

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      const itemCategory = item.category || "";
      if (
        !filters.categories.some((cat) =>
          itemCategory.toLowerCase().includes(cat.toLowerCase())
        )
      ) {
        return false;
      }
    }

    // Price filter
    if (
      filters.priceRange &&
      (filters.priceRange.min || filters.priceRange.max)
    ) {
      const itemPrice = Number(item.price_from) || 0;
      const minPrice = Number(filters.priceRange.min) || 0;
      const maxPrice = Number(filters.priceRange.max) || Infinity;

      if (itemPrice < minPrice || itemPrice > maxPrice) {
        return false;
      }
    }

    // Review filter
    if (filters.reviews && filters.reviews.length > 0) {
      const itemRating = Number(item.rating) || 0;
      if (!filters.reviews.some((stars) => itemRating >= stars)) {
        return false;
      }
    }

    return true;
  };

  // Filter listings based on search and filters
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !mainCategory ||
      item.category?.toLowerCase().includes(mainCategory.toLowerCase());

    const matchesArea = !area || item.area === area;

    // Apply additional filters from filter dropdown
    const matchesFilters = applyAdvancedFilters(item, activeFilters);

    return matchesSearch && matchesCategory && matchesArea && matchesFilters;
  });

  // Group listings by the specific categories we want
  const categorizedListings = {};
  getPopularCategories().forEach((category) => {
    categorizedListings[category] = filteredListings.filter((item) => {
      const itemCategory = (item.category || "").toLowerCase();
      return itemCategory.includes(category);
    });
  });

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
  };

  // Handle category button click
  const handleCategoryButtonClick = (category) => {
    navigate(`/category/${category}`);
  };

  if (error)
    return (
      // REMOVED: All positioning and z-index from error state
      <section id="directory" className="bg-white py-6 font-manrope">
        <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        </div>
      </section>
    );

  return (
    // CRITICAL CHANGE: Removed ALL positioning and z-index
    <section id="directory" className="bg-white py-3 font-manrope">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Header - More compact with better mobile spacing */}
        <div className="mb-4">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-4"
          >
            <h1 className="text-base lg:text-lg text-gray-900 mb-1 font-bold">
              Explore Categories
            </h1>
            <p className="text-gray-600 text-xs">
              Find the best place and services in Ibadan
            </p>
          </motion.div>

          {/* Filters - Better mobile layout */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between mb-3">
            {/* Mobile View - Compact filter row */}
            <div className="flex w-full sm:w-auto justify-between items-center gap-1">
              <button
                className="md:px-2 md:py-1.5 p-2 bg-[#06EAFC] font-medium rounded-lg text-[12px] lg:text-[12px] hover:bg-[#08d7e6] transition-colors whitespace-nowrap flex-1 text-center"
              >
                Popular destination
              </button>

              <select
                value={mainCategory}
                onChange={(e) => {
                  setMainCategory(e.target.value);
                  if (e.target.value) {
                    handleCategoryButtonClick(e.target.value);
                  }
                }}
                className="md:px-2 md:py-1.5 p-2.5 border border-gray-300 rounded-lg font-medium text-[12px] lg:text-[12px] bg-gray-300 focus:ring-1 focus:ring-[#06EAFC]   focus:border-[#06EAFC] flex-1"
              >
                <option value="">Categories</option>
                {getPopularCategories().map((category) => (
                  <option key={category} value={category}>
                    {capitalizeFirst(category)}
                  </option>
                ))}
              </select>

              
            </div>
          </div>
        </div>

        {/* Category Sections - Tighter spacing */}
        <div className="space-y-4">
          {getPopularCategories().map((category) => {
            const items = categorizedListings[category] || [];
            if (items.length === 0) return null;

            const title = `Popular ${capitalizeFirst(category)} in Ibadan`;
            const sectionId = `${category}-section`;

            return (
              <CategorySection
                key={category}
                title={title}
                items={items}
                sectionId={sectionId}
                isMobile={isMobile}
              />
            );
          })}
        </div>

        {/* Empty State - Compact */}
        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-6">
            <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
              <i className="fas fa-search text-2xl text-gray-300 mb-2 block"></i>
              <h3 className="text-sm text-gray-800 mb-1">
                No businesses found
              </h3>
              <p className="text-gray-600 text-xs">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

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
    </section>
  );
};

export default Directory;
