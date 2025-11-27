// src/components/Directory.jsx
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { generateSlug } from "../utils/vendorUtils";
import { MdFavoriteBorder } from "react-icons/md";
import { FaGreaterThan } from "react-icons/fa";
import { FaLessThan } from "react-icons/fa";
import { PiSliders } from "react-icons/pi";

// ---------------- Filter Dropdown Component ----------------
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
            className="w-6 h-6 rounded-full bg-gray-100  flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
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
            {[
              "Hotels",
              "Restaurant",
              "Laundry",
              "Tourist Centre",
              "Event Centre",
            ].map((category) => (
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
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  {category}
                </span>
              </label>
            ))}
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
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors text-sm">
                    {stars} Star{stars !== 1 ? "s" : ""}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Badge Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Badge
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("verified")}
                onChange={() => handleBadgeChange("verified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Verified
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("unverified")}
                onChange={() => handleBadgeChange("unverified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Unverified
              </span>
            </label>
          </div>
        </div>
        {/* Respose Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Response Time
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("verified")}
                onChange={() => handleBadgeChange("verified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                1hr - 4hr
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("unverified")}
                onChange={() => handleBadgeChange("unverified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                5hr - 8hr
              </span>
            </label>
          </div>
        </div>
        {/* Language Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
            Language
          </h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("verified")}
                onChange={() => handleBadgeChange("verified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Yoruba Only
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("unverified")}
                onChange={() => handleBadgeChange("unverified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                English Only
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.badges.includes("unverified")}
                onChange={() => handleBadgeChange("unverified")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                Both
              </span>
            </label>
          </div>
          {/* Vendor Type Section */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Vendor Type
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.badges.includes("verified")}
                  onChange={() => handleBadgeChange("verified")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  Individual / Business
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.badges.includes("unverified")}
                  onChange={() => handleBadgeChange("unverified")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                />
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  Verified Company
                </span>
              </label>
            </div>
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

// ---------------- Image Modal Component ----------------
const ImageModal = ({ images, initialIndex, isOpen, onClose, item }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 z-10"
        >
          ×
        </button>

        <div className="flex items-center space-x-4">
          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev > 0 ? prev - 1 : images.length - 1
              )
            }
            className="text-white text-2xl hover:text-gray-300"
          >
            ‹
          </button>

          <img
            src={images[currentIndex]}
            alt={`${item?.name || "Business"} image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                prev < images.length - 1 ? prev + 1 : 0
              )
            }
            className="text-white text-2xl hover:text-gray-300"
          >
            ›
          </button>
        </div>

        <div className="text-white text-center mt-4">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
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

// ---------------- Main Directory Component ----------------
const Directory = () => {
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    item: null,
  });

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

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
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

  // Extract subcategories from the data (text after the ".")
  const getSubcategories = () => {
    const subcategories = new Set();

    listings.forEach((item) => {
      const category = item.category || "";
      const parts = category.split(".");
      if (parts.length > 1) {
        const subcategory = parts[1].toLowerCase();
        if (
          subcategory &&
          subcategory !== "other" &&
          subcategory !== "others"
        ) {
          subcategories.add(subcategory);
        }
      }
    });

    return Array.from(subcategories);
  };

  // Group listings by subcategory
  const categorizedListings = {};
  getSubcategories().forEach((subcategory) => {
    categorizedListings[subcategory] = filteredListings.filter((item) => {
      const category = item.category || "";
      return category.toLowerCase().includes(`.${subcategory}`);
    });
  });

  // Scroll functions for horizontal sections - Updated for exact 6 cards
  const scrollSection = (sectionId, direction) => {
    const container = document.getElementById(sectionId);
    if (!container) return;

    // Calculate exact scroll amount for 6 cards
    const scrollAmount = isMobile ? 160 : 304; // Matches card width + gap
    const newPosition =
      direction === "next"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

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

  // ---------------- BusinessCard Component (Exact Airbnb Style) ----------------
  const BusinessCard = ({ item, category }) => {
    const images = getCardImages(item);

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

    return (
      <div
        className={`
        bg-white rounded-2xl overflow-hidden flex-shrink-0 
        font-manrope
        ${isMobile ? "w-[160px]" : "w-[240px]"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      >
        {/* Image */}
        <div
          className={`
          relative overflow-hidden rounded-2xl 
          ${isMobile ? "w-full h-[150px]" : "w-[200px] h-[195px]"}
        `}
          onClick={() =>
            setImageModal({
              isOpen: true,
              images,
              initialIndex: 0,
              item,
            })
          }
        >
          <img
            src={images[0]}
            alt=""
            className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
            loading="lazy"
          />

          {/* Guest favorite badge */}
          <div className="absolute top-3 left-3 bg-white px-2 py-[5px] rounded-lg shadow-sm flex items-center gap-1">
            <span className="text-[10px] font-semibold text-gray-900">
              Guest favorite
            </span>
          </div>

          {/* Heart icon */}
          <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition">
            <MdFavoriteBorder className="text-[#00d1ff] text-lg" />
          </button>
        </div>

        {/* Text */}
        <div className={`${isMobile ? "p-2" : "p-3"} flex flex-col gap-1`}>
          <h3
            className={`
            font-semibold text-gray-900 
            leading-tight line-clamp-2 
            ${isMobile ? "text-xs" : "text-[15px]"}
          `}
          >
            {item.name}
          </h3>

          <p
            className={`
            text-gray-600 
            ${isMobile ? "text-[10px]" : "text-[13px]"}
          `}
          >
            {location}
          </p>

          <div className="flex items-center gap-1 mt-1">
            <p
              className={`
              font-normal text-gray-900 
              ${isMobile ? "text-xs" : "text-xs"}
            `}
            >
              {priceText} <span>•</span>
            </p>

            <div
              className={`
              flex items-center gap-1 text-gray-800 
              ${isMobile ? "text-[10px]" : "text-[13px]"}
            `}
            >
              <FontAwesomeIcon
                icon={faStar}
                className={`${
                  isMobile ? "text-[10px]" : "text-[13px]"
                } text-black`}
              />
              {item.rating || "4.9"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- CategorySection Component (6 Cards Exactly) ----------------
  const CategorySection = ({ title, items, sectionId }) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2
              className={`text-gray-900 ${
                isMobile ? "text-xl" : "text-2xl"
              } font-bold`}
            >
              {title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollSection(sectionId, "prev")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
            >
              <FaLessThan className="text-gray-600 text-sm" />
            </button>
            <button
              onClick={() => scrollSection(sectionId, "next")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
            >
              <FaGreaterThan className="text-gray-600 text-sm" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            id={sectionId}
            className={`flex overflow-x-auto scrollbar-hide scroll-smooth ${
              isMobile ? "gap-2" : "-space-x-6"
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
                category={sectionId.replace("-section", "")}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (loading)
    return (
      <section id="directory" className="bg-white py-8 font-manrope relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Loading Ibadan Directory...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section id="directory" className="bg-white py-8 font-manrope relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </section>
    );

  return (
    <section id="directory" className="bg-white py-8 font-manrope relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <div className="mb-8">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-xl lg:text-2xl text-gray-900 mb-2 font-bold">
              Explore Categories
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Find the best place and services in Ibadan
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setMainCategory("");
                  setArea("");
                  setActiveFilters({});
                }}
                className="px-6 py-4 bg-[#06EAFC] font-medium rounded-[10px] text-sm hover:bg-[#08d7e6] transition-colors"
              >
                Popular destination
              </button>

              <select
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-[10px] font-medium text-sm bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Categories</option>
                {getSubcategories().map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {capitalizeFirst(subcategory)}
                  </option>
                ))}
              </select>

              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 font-medium rounded-full text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">District</option>
                {[...new Set(listings.map((i) => i.area).filter(Boolean))]
                  .sort()
                  .map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
              </select>
            </div>

            {/* Search and Filter grouped together on the right */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search name, service, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filter Button with Dropdown */}
              <div className="relative">
                <div
                  className="bg-gray-300 p-4 flex items-center rounded-2xl gap-2 capitalize cursor-pointer hover:bg-gray-400 transition-colors duration-200 font-medium whitespace-nowrap"
                  onClick={toggleFilterDropdown}
                >
                  <p>filter</p>
                  <PiSliders className="text-lg" />
                </div>

                <AnimatePresence>
                  <FilterDropdown
                    isOpen={showFilterDropdown}
                    onClose={closeFilterDropdown}
                    onFilterChange={handleFilterChange}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">Active Filters:</span>
              <button
                onClick={() => setActiveFilters({})}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Category Sections - Dynamically generated from subcategories */}
        <div className="space-y-8">
          {getSubcategories().map((subcategory) => {
            const items = categorizedListings[subcategory] || [];
            if (items.length === 0) return null;

            const title = `Popular ${capitalizeFirst(subcategory)} in Ibadan >`;
            const sectionId = `${subcategory}-section`;

            return (
              <CategorySection
                key={subcategory}
                title={title}
                items={items}
                sectionId={sectionId}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <i className="fas fa-search text-4xl text-gray-300 mb-4 block"></i>
              <h3 className="text-xl text-gray-800 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {imageModal.isOpen && (
          <ImageModal
            images={imageModal.images}
            initialIndex={imageModal.initialIndex}
            isOpen={imageModal.isOpen}
            onClose={() => setImageModal({ ...imageModal, isOpen: false })}
            item={imageModal.item}
          />
        )}
      </AnimatePresence>

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
