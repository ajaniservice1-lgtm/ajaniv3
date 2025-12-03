// src/pages/CategoryResults.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faFilter,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { MdFavoriteBorder } from "react-icons/md";
import { PiSliders } from "react-icons/pi";

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
    verifiedVendor: false,
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Search Bar - Functional with real-time filtering */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className="relative mx-auto w-full"
            >
              <div
                className="flex items-center bg-gray-200 rounded-[33.35px] shadow-sm w-full relative z-10 cursor-text"
                onClick={handleSearchInputClick}
              >
                <div className="pl-4 text-gray-500">
                  <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search ${categoryTitle} in Ibadan...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent py-4 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 cursor-text"
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
                  className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-[33.35px] border border-[#06EAFC] py-4 px-6 text-sm transition-colors duration-200 whitespace-nowrap mx-2"
                  style={{
                    width: "152.81px",
                    height: "52.7px",
                    borderWidth: "1.11px",
                  }}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Search status indicator */}
              {isSearching && (
                <div className="absolute -bottom-6 left-0 text-xs text-gray-600">
                  Found {filteredListings.length} results for "{searchQuery}" in{" "}
                  {categoryTitle}
                </div>
              )}
            </form>
          </div>
        </div>

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
            {/* Verified Vendor Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.verifiedVendor}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      verifiedVendor: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    filters.verifiedVendor ? "bg-[#06EAFC]" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    filters.verifiedVendor
                      ? "transform translate-x-5"
                      : "transform translate-x-1"
                  }`}
                ></div>
              </div>
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Verified Vendor Only
              </span>
            </label>

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
