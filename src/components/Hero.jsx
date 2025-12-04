// Hero.jsx - Updated with same search bar design as SearchModal
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchModal from "./SearchModal"; // Import the updated SearchModal

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

// Utility functions
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const AREA_CLUSTERS = {
  Bodija: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Sango: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Mokola: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Jericho: { lat: 7.4762, lng: 3.9147, radius: 2 },
  "Ring Road": { lat: 7.4762, lng: 3.9147, radius: 2 },
  Agodi: { lat: 7.4762, lng: 3.9147, radius: 2 },
  UI: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Dugbe: { lat: 7.4762, lng: 3.9147, radius: 2 },
  "Iwo Road": { lat: 7.4762, lng: 3.9147, radius: 2 },
  Challenge: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Moniya: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Akobo: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Oluyole: { lat: 7.4762, lng: 3.9147, radius: 2 },
  "New Garage": { lat: 7.4762, lng: 3.9147, radius: 2 },
  Ojoo: { lat: 7.4762, lng: 3.9147, radius: 2 },
  Ologuneru: { lat: 7.4762, lng: 3.9147, radius: 2 },
  "Oke-Are": { lat: 7.4762, lng: 3.9147, radius: 2 },
  "New Bodija": { lat: 7.4762, lng: 3.9147, radius: 2 },
  Gate: { lat: 7.4762, lng: 3.9147, radius: 2 },
};

const findNearbyAreas = (targetArea, allListings, maxDistance = 5) => {
  const targetCluster = AREA_CLUSTERS[targetArea];
  if (!targetCluster) return [];
  const nearbyAreas = new Set();
  nearbyAreas.add(targetArea);
  Object.entries(AREA_CLUSTERS).forEach(([area, cluster]) => {
    if (area !== targetArea) {
      const distance = calculateDistance(
        targetCluster.lat,
        targetCluster.lng,
        cluster.lat,
        cluster.lng
      );
      if (distance <= maxDistance) {
        nearbyAreas.add(area);
      }
    }
  });
  return Array.from(nearbyAreas);
};

const getAreaGroups = () => {
  const groups = [];
  const processedAreas = new Set();
  Object.keys(AREA_CLUSTERS).forEach((area) => {
    if (!processedAreas.has(area)) {
      const nearby = findNearbyAreas(area, [], 3);
      groups.push(nearby);
      nearby.forEach((a) => processedAreas.add(a));
    }
  });
  return groups;
};

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
  if (cat.includes("shortlet"))
    return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80";
  return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
};

// Animated Not Found Modal Component
const NotFoundModal = ({ isOpen, onClose, searchQuery }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl">
          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Animated Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 relative"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full" />
              <svg
                className="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
            </motion.div>

            {/* Title */}
            <motion.h3
              className="text-2xl font-bold text-gray-900 mb-2 font-manrope"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No Results Found
            </motion.h3>

            {/* Message */}
            <motion.p
              className="text-gray-600 mb-6 font-manrope"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              We couldn't find any results for{" "}
              <span className="font-semibold text-blue-600">
                "{searchQuery}"
              </span>
            </motion.p>

            {/* Suggestions */}
            <motion.div
              className="mb-8"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-gray-500 mb-3 font-manrope">
                Try searching for:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Hotels", "Restaurants", "Bodija", "Mokola", "Shortlets"].map(
                  (suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onClose();
                        // You can trigger a new search here if needed
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      {suggestion}
                    </motion.button>
                  )
                )}
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-manrope font-medium"
              >
                Try Another Search
              </button>
            </motion.div>

            {/* Additional Help */}
            <motion.p
              className="text-xs text-gray-400 mt-6 font-manrope"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Need help? Check our categories or contact support
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

// Main Hero Component
const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNotFoundModalOpen, setIsNotFoundModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { data: listings = [] } = useGoogleSheet(SHEET_ID, API_KEY);

  const filterVendors = (query, vendors) => {
    if (!query.trim()) return [];
    const normalizedQuery = normalizeWord(query);
    const queryWords = normalizedQuery
      .split(" ")
      .filter((word) => word.length > 0);
    return vendors.filter((item) => {
      const areaMatch = queryWords.some(
        (word) =>
          item.area && item.area.toLowerCase().includes(word.toLowerCase())
      );
      const nearbyAreasMatch = queryWords.some((word) => {
        const targetArea = Object.keys(AREA_CLUSTERS).find((area) =>
          area.toLowerCase().includes(word.toLowerCase())
        );
        if (targetArea && item.area) {
          const nearbyAreas = findNearbyAreas(targetArea, vendors, 3);
          return nearbyAreas.includes(item.area);
        }
        return false;
      });
      const categoryMatch = queryWords.some(
        (word) =>
          matchesWord(word, item.category) ||
          (item.category &&
            item.category.toLowerCase().includes(word.toLowerCase()))
      );
      const nameMatch = queryWords.some(
        (word) =>
          item.name && item.name.toLowerCase().includes(word.toLowerCase())
      );
      return areaMatch || nearbyAreasMatch || categoryMatch || nameMatch;
    });
  };

  const getAreaSuggestions = (query = "") => {
    const allAreas = [
      ...new Set(listings.map((item) => item.area).filter(Boolean)),
    ];
    if (!query.trim()) {
      const areaGroups = getAreaGroups();
      return areaGroups.slice(0, 3).flat();
    }
    const matchingAreas = allAreas.filter((area) =>
      area.toLowerCase().includes(query.toLowerCase())
    );
    const nearbySuggestions = new Set();
    matchingAreas.forEach((area) => {
      nearbySuggestions.add(area);
      const nearby = findNearbyAreas(area, listings, 3);
      nearby.forEach((nearbyArea) => nearbySuggestions.add(nearbyArea));
    });
    return Array.from(nearbySuggestions).slice(0, 6);
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setAreaSuggestions(getAreaSuggestions());
      return;
    }
    const filtered = filterVendors(searchQuery, listings).slice(0, 8);
    setSuggestions(filtered);
    const matchingAreas = getAreaSuggestions(searchQuery);
    setAreaSuggestions(matchingAreas);
  }, [searchQuery, listings]);

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

  const handleSelectSuggestion = (vendor) => {
    if (vendor && vendor.id) {
      setIsSearchModalOpen(false);
      navigate(`/vendor-detail/${vendor.id}`);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const filtered = filterVendors(searchQuery, listings);
      if (filtered.length > 0) {
        // If we have results, navigate to the first one
        setIsSearchModalOpen(false);
        navigate(`/vendor-detail/${filtered[0].id}`);
      } else {
        // If no results, show not found modal
        setIsSearchModalOpen(false);
        setIsNotFoundModalOpen(true);
      }
    }
  };

  const handleSearchClick = (e) => {
    e.stopPropagation();
    if (searchQuery.trim()) {
      handleSearchSubmit();
    } else {
      setIsSearchModalOpen(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleSelectArea = (area) => {
    setSearchQuery(area);
    setIsSearchModalOpen(false);
    navigate(`/search?query=${encodeURIComponent(area)}`);
  };

  return (
    <>
      <section
        id="hero"
        className="bg-[#F7F7FA] font-rubik overflow-hidden min-h-[30vh] sm:min-h-[30vh] flex items-start relative mt-16"
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
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-manrope font-bold text-[#101828] leading-tight mt-1 sm:mt-2 px-2">
                Discover Ibadan through AI & Local Stories
              </h1>
              <p className="text-xs sm:text-sm leading-[1.3] text-slate-600 mb-2 sm:mb-4 font-manrope max-w-lg mx-auto px-4">
                Your all-in-one local guide for hotels, food, events, vendors,
                and market prices.
              </p>

              {/* Updated Search Bar - Same design as SearchModal */}
              <div className="relative mx-auto w-full max-w-md px-2">
                <div className="flex items-center">
                  <div className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-10">
                    <div className="pl-3 sm:pl-4 text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
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
                      placeholder="Search by area or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchModalOpen(true)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope"
                      autoFocus={false}
                      aria-label="Search input"
                      role="searchbox"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="p-1 mr-2 text-gray-500 hover:text-gray-700"
                        aria-label="Clear search"
                      >
                        <svg
                          className="w-4 h-4"
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

                  {/* Separate Search Button with gap - Same as SearchModal */}
                  <div className="ml-2">
                    <button
                      onClick={handleSearchSubmit}
                      className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-2.5 px-4 sm:px-6 text-sm transition-colors duration-200 whitespace-nowrap font-manrope"
                      aria-label="Perform search"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Search hint text - Same as SearchModal */}
                <motion.div
                  className="text-center mt-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: searchQuery ? 1 : 0,
                    y: searchQuery ? 0 : 10,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-gray-500 font-manrope">
                    Press Enter or click Search to find results
                  </p>
                </motion.div>
              </div>

              {/* Category Icons */}
              <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 overflow-hidden px-2">
                <motion.div
                  className="text-center cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick("Hotel")}
                >
                  <div className="relative">
                    <img
                      src={getCategoryImage("Hotel", FALLBACK_IMAGES.Hotel)}
                      alt="Hotel"
                      className="w-10 h-10 rounded-lg overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover group-hover:brightness-110 group-hover:shadow-md transition-all duration-200"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGES.Hotel;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                  </div>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-[#06EAFC] transition-colors duration-200">
                    Hotel
                  </p>
                </motion.div>

                <motion.div
                  className="text-center cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick("Tourism")}
                >
                  <div className="relative">
                    <img
                      src={getCategoryImage("Tourism", FALLBACK_IMAGES.Tourism)}
                      alt="Tourism"
                      className="w-10 h-10 rounded-lg overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover group-hover:brightness-110 group-hover:shadow-md transition-all duration-200"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGES.Tourism;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                  </div>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-[#06EAFC] transition-colors duration-200">
                    Tourism
                  </p>
                </motion.div>

                <motion.div
                  className="text-center cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick("Shortlet")}
                >
                  <div className="relative">
                    <img
                      src={getCategoryImage(
                        "Shortlet",
                        FALLBACK_IMAGES.Shortlet
                      )}
                      alt="Shortlet"
                      className="w-10 h-10 rounded-lg overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover group-hover:brightness-110 group-hover:shadow-md transition-all duration-200"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGES.Shortlet;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                  </div>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-[#06EAFC] transition-colors duration-200">
                    Shortlet
                  </p>
                </motion.div>

                <motion.div
                  className="text-center cursor-pointer group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick("Restaurant")}
                >
                  <div className="relative">
                    <img
                      src={getCategoryImage(
                        "Restaurant",
                        FALLBACK_IMAGES.Restaurant
                      )}
                      alt="Restaurant"
                      className="w-10 h-10 rounded-lg overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover group-hover:brightness-110 group-hover:shadow-md transition-all duration-200"
                      onError={(e) => {
                        e.target.src = FALLBACK_IMAGES.Restaurant;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                  </div>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-[#06EAFC] transition-colors duration-200">
                    Restaurant
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSelectSuggestion={handleSelectSuggestion}
        />
        <NotFoundModal
          isOpen={isNotFoundModalOpen}
          onClose={() => setIsNotFoundModalOpen(false)}
          searchQuery={searchQuery}
        />
      </AnimatePresence>
    </>
  );
};

export default Hero;
