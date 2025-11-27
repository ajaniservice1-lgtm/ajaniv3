// src/components/Hero.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import HeroImage from "../assets/Logos/towerr.jpeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import HeroImage2 from "../assets/Logos/hotel.jpg";
import HeroImage3 from "../assets/Logos/tourism.jpg";
import HeroImage4 from "../assets/Logos/events.jpg";
import HeroImage5 from "../assets/Logos/restuarant.jpg";

// ... (keep all your existing imports and utility functions the same) ...
const normalizeWord = (word) => {
  if (!word || typeof word !== "string") return "";

  const lowerWord = word.toLowerCase().trim();

  // Common plural to singular conversions
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

  // Return singular form if found in mapping, otherwise return original word
  return pluralToSingular[lowerWord] || lowerWord;
};

// Function to check if search query matches a word in any form
const matchesWord = (searchWord, targetWord) => {
  if (!searchWord || !targetWord) return false;

  const normalizedSearch = normalizeWord(searchWord);
  const normalizedTarget = normalizeWord(targetWord);

  // Direct match
  if (normalizedSearch === normalizedTarget) return true;

  // Partial match (contains)
  if (
    normalizedTarget.includes(normalizedSearch) ||
    normalizedSearch.includes(normalizedTarget)
  ) {
    return true;
  }

  return false;
};

// Google-like Search Modal Component
const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  suggestions = [],
  onSelectSuggestion,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close modal when clicking outside or pressing Escape
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

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getCardImages = (item) => {
    const raw = item["image url"] || "";
    const urls = raw
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u && u.startsWith("http"));

    if (urls.length > 0) return urls[0];

    const cat = (item.category || "").toLowerCase();
    if (cat.includes("hotel"))
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
    if (cat.includes("restaurant"))
      return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";
    if (cat.includes("cafe"))
      return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80";
    if (cat.includes("bar"))
      return "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80";
    if (cat.includes("hostel"))
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
    if (cat.includes("shortlet"))
      return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80";
    if (cat.includes("services"))
      return "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80";
    if (
      cat.includes("event") ||
      cat.includes("weekend") ||
      cat.includes("hall")
    )
      return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80";
    if (
      cat.includes("attraction") ||
      cat.includes("garden") ||
      cat.includes("tower")
    )
      return "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80";
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  // Get result count text (singular/plural)
  const getResultCountText = (count) => {
    return count === 1 ? `${count} result` : `${count} results`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Critical for mobile */}
      <motion.div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      {/* Search Modal - Critical overflow control for mobile */}
      <motion.div
        className={`fixed z-[9999] bg-white overflow-hidden ${
          isMobile
            ? "inset-x-0 top-0 h-full"
            : "inset-x-4 top-4 mx-auto max-w-4xl rounded-2xl max-h-[90vh]"
        }`}
        initial={
          isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 }
        }
        animate={isMobile ? { y: 0, opacity: 1 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: "100%", opacity: 0 } : { scale: 0.9, opacity: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
      >
        <div
          className={`flex flex-col h-full ${
            isMobile ? "overflow-hidden" : "max-h-[90vh]"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 p-4 border-b border-gray-200 ${
              isMobile ? "overflow-hidden" : ""
            }`}
          >
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Search Input */}
            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-3">
              <svg
                className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search hotels, restaurants, events..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500 text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
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

            {!isMobile && (
              <button
                onClick={onClose}
                className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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

          {/* Content - Critical overflow for mobile */}
          <div
            className={`flex-1 ${
              isMobile ? "overflow-y-auto overflow-x-hidden" : "overflow-y-auto"
            }`}
          >
            {searchQuery.trim() === "" ? (
              // Recent Searches/Empty State
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent searches
                </h3>
                <div className="space-y-3">
                  {[
                    "Hotels in Ibadan",
                    "Restaurants",
                    "Event Centers",
                    "Tourist Attractions",
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => onSearchChange(item)}
                      className="flex items-center gap-3 p-3 w-full text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : suggestions.length === 0 ? (
              // No Results
              <div className="p-8 text-center">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg mb-2">No results found</p>
                <p className="text-gray-400 text-sm">
                  Try different keywords or check your spelling
                </p>
              </div>
            ) : (
              // Search Results
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {getResultCountText(suggestions.length)} for "{searchQuery}"
                  </h4>
                </div>

                <div className="space-y-3">
                  {suggestions.map((vendor, index) => {
                    const category = (vendor.category || "").toLowerCase();
                    let priceText = "";
                    if (
                      category.includes("hotel") ||
                      category.includes("hostel") ||
                      category.includes("shortlet")
                    ) {
                      priceText = `#${formatPrice(
                        vendor.price_from
                      )} for 2 night`;
                    } else {
                      priceText = `From #${formatPrice(
                        vendor.price_from
                      )} per guest`;
                    }

                    return (
                      <motion.div
                        key={vendor.id || index}
                        className="flex items-center p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelectSuggestion(vendor)}
                      >
                        {/* Vendor Image - Critical for mobile */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden mr-3">
                          <img
                            src={getCardImages(vendor)}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Vendor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                {vendor.name}
                              </h4>
                              <p className="text-gray-600 text-xs mt-1">
                                {vendor.category || "Business"}
                              </p>
                            </div>
                            {vendor.price_from && (
                              <div className="text-right ml-2 flex-shrink-0">
                                <p className="font-semibold text-green-600 text-xs">
                                  {priceText}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Rating and Location */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-yellow-400 text-xs"
                              />
                              <span className="text-gray-700 text-xs">
                                {vendor.rating || "4.89"}
                              </span>
                            </div>
                            {vendor.area && (
                              <span className="text-gray-500 text-xs">
                                {vendor.area}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Categories - Critical for mobile */}
          <div
            className={`p-4 border-t border-gray-100 bg-gray-50 ${
              isMobile ? "overflow-hidden" : ""
            }`}
          >
            <p className="text-xs text-gray-600 mb-3 font-medium">
              Popular Categories
            </p>
            <div
              className={`flex flex-wrap gap-2 ${
                isMobile ? "overflow-hidden" : ""
              }`}
            >
              {[
                "Hotels",
                "Restaurants",
                "Events",
                "Tourism",
                "Cafes",
                "Bars",
              ].map((category, index) => (
                <button
                  key={category}
                  onClick={() => onSearchChange(category)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// Custom Hook for Google Sheets Data
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

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Use the same Google Sheets data as Directory
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  useEffect(() => {
    if (isInView) setHasAnimated(true);
    else setHasAnimated(false);
  }, [isInView]);

  // Enhanced filter function that handles singular/plural forms
  const filterVendors = (query, vendors) => {
    if (!query.trim()) return [];

    const normalizedQuery = normalizeWord(query);
    const queryWords = normalizedQuery
      .split(" ")
      .filter((word) => word.length > 0);

    return vendors.filter((item) => {
      // Check name
      const nameMatch = queryWords.some(
        (word) =>
          matchesWord(word, item.name) ||
          (item.name && item.name.toLowerCase().includes(word))
      );

      // Check category
      const categoryMatch = queryWords.some(
        (word) =>
          matchesWord(word, item.category) ||
          (item.category && item.category.toLowerCase().includes(word))
      );

      // Check area
      const areaMatch = queryWords.some(
        (word) => item.area && item.area.toLowerCase().includes(word)
      );

      // Check if any field matches
      return nameMatch || categoryMatch || areaMatch;
    });
  };

  // Filter vendors based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = filterVendors(searchQuery, listings).slice(0, 8); // Limit to 8 suggestions
    setSuggestions(filtered);
  }, [searchQuery, listings]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleSelectSuggestion = (vendor) => {
    setSearchQuery(vendor.name);
    setIsSearchModalOpen(false);
    console.log("Selected vendor:", vendor);
    // Here you can navigate to the vendor page
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setIsSearchModalOpen(false);
      // Perform search action
    }
  };

  const handleSearchInputClick = () => {
    setIsSearchModalOpen(true);
  };

  const categoryData = [
    { name: "Hotel", img: HeroImage2 },
    { name: "Restaurant", img: HeroImage5 },
    { name: "Events", img: HeroImage4 },
    { name: "Tourism", img: HeroImage3 },
  ];

  return (
    <>
      {/* Main section - Ultra compact for better directory visibility */}
      <section
        id="hero"
        className="bg-[#F7F7FA] font-rubik overflow-hidden min-h-[50vh] sm:min-h-[55vh] flex items-start relative mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 w-full">
          <div
            ref={heroRef}
            className="flex flex-col items-center text-center gap-2 sm:gap-3 pt-0 sm:pt-2 pb-2 sm:pb-4"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ margin: "-100px", once: false }}
              className="flex flex-col justify-start space-y-2 sm:space-y-3 max-w-xl sm:max-w-2xl w-full"
            >
              {/* Headline - Ultra compact */}
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-manrope font-bold text-[#101828] leading-tight mt-1 sm:mt-2 px-2">
                Discover Ibadan through AI & Local Stories
              </h1>

              {/* Subtitle - Ultra compact */}
              <p className="text-xs sm:text-sm leading-[1.3] text-slate-600 mb-2 sm:mb-4 font-manrope max-w-lg mx-auto px-4">
                Your all-in-one local guide for hotels, food, events, vendors,
                and market prices.
              </p>

              {/* Search Bar - More compact */}
              <div className="relative mx-auto w-full sm:max-w-md overflow-hidden px-2">
                <div
                  className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-10 cursor-text"
                  onClick={handleSearchInputClick}
                >
                  <div className="pl-3 sm:pl-4 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 sm:h-4 sm:w-4"
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
                    type="text"
                    placeholder="Search hotels, restaurants, events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchInputClick}
                    className="flex-1 bg-transparent py-1.5 sm:py-2 px-2 text-xs text-gray-800 outline-none placeholder:text-gray-600 cursor-text"
                    readOnly
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearchSubmit();
                    }}
                    className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-1.5 sm:py-2 px-3 text-xs transition-colors duration-200 whitespace-nowrap mx-1"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Categories - Ultra compact with reduced spacing */}
              <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 overflow-hidden px-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="text-center">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="
                        w-10 h-10 rounded-lg overflow-hidden
                        sm:w-12 sm:h-12
                        md:w-14 md:h-14
                        object-cover
                      "
                    />
                    <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google-like Search Modal */}
      <AnimatePresence>
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
        />
      </AnimatePresence>
    </>
  );
};

export default Hero;
