// FULL UPDATED Header.jsx — With Area and Category Filtering
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Logos/logo5.png";
import LoginButton from "../components/ui/LoginButton";
import { IoPerson } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

// Location-based filtering utilities
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Define area clusters with their central coordinates
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

// Function to find nearby areas based on coordinates
const findNearbyAreas = (targetArea, allListings, maxDistance = 5) => {
  const targetCluster = AREA_CLUSTERS[targetArea];
  if (!targetCluster) return [];

  const nearbyAreas = new Set();

  // Add the target area itself
  nearbyAreas.add(targetArea);

  // Check all other areas for proximity
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

// Function to group areas by proximity
const getAreaGroups = () => {
  const groups = [];
  const processedAreas = new Set();

  Object.keys(AREA_CLUSTERS).forEach((area) => {
    if (!processedAreas.has(area)) {
      const nearby = findNearbyAreas(area, [], 3); // 3km radius
      groups.push(nearby);
      nearby.forEach((a) => processedAreas.add(a));
    }
  });

  return groups;
};

// Function to normalize words (convert to singular form and handle common plural patterns)
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
    guides: "guide",
    insights: "insight",
    blogs: "blog",
    vendors: "vendor",
    profiles: "profile",
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

// Enhanced filter function with location-based search
const filterVendors = (query, vendors) => {
  if (!query.trim()) return [];

  const normalizedQuery = normalizeWord(query);
  const queryWords = normalizedQuery
    .split(" ")
    .filter((word) => word.length > 0);

  return vendors.filter((item) => {
    // Check area first (priority for location-based search)
    const areaMatch = queryWords.some(
      (word) =>
        item.area && item.area.toLowerCase().includes(word.toLowerCase())
    );

    // Check for nearby areas
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

    // Check category with plural/singular matching
    const categoryMatch = queryWords.some(
      (word) =>
        matchesWord(word, item.category) ||
        (item.category &&
          item.category.toLowerCase().includes(word.toLowerCase()))
    );

    // Check name with plural/singular matching
    const nameMatch = queryWords.some(
      (word) =>
        matchesWord(word, item.name) ||
        (item.name && item.name.toLowerCase().includes(word.toLowerCase()))
    );

    // Check if any field matches
    return areaMatch || nearbyAreasMatch || categoryMatch || nameMatch;
  });
};

// Get unique areas with nearby suggestions
const getAreaSuggestions = (query = "", listings) => {
  const allAreas = [
    ...new Set(listings.map((item) => item.area).filter(Boolean)),
  ];

  if (!query.trim()) {
    // Show popular area groups when no query
    const areaGroups = getAreaGroups();
    return areaGroups.slice(0, 3).flat();
  }

  // Find areas matching query and their nearby areas
  const matchingAreas = allAreas.filter((area) =>
    area.toLowerCase().includes(query.toLowerCase())
  );

  const nearbySuggestions = new Set();

  matchingAreas.forEach((area) => {
    // Add the matching area
    nearbySuggestions.add(area);
    // Add nearby areas
    const nearby = findNearbyAreas(area, listings, 3);
    nearby.forEach((nearbyArea) => nearbySuggestions.add(nearbyArea));
  });

  return Array.from(nearbySuggestions).slice(0, 6);
};

// Format location display
const formatLocation = (item) => {
  const area = item.area || "Ibadan";
  return `${area}, Oyo State`;
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

// Search Modal Component with Area and Category Filtering
const SearchModal = ({ isOpen, onClose, listings = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Enhanced filter vendors based on search query with location-based support
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setAreaSuggestions(getAreaSuggestions("", listings)); // Show area groups when empty
      return;
    }

    const filtered = filterVendors(searchQuery, listings).slice(0, 8);
    setSuggestions(filtered);

    // Show area suggestions that match the query and nearby areas
    const matchingAreas = getAreaSuggestions(searchQuery, listings);
    setAreaSuggestions(matchingAreas);
  }, [searchQuery, listings]);

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

  const handleSelectSuggestion = (vendor) => {
    console.log("Selected vendor:", vendor);
    onClose();
  };

  const handleSelectArea = (area) => {
    setSearchQuery(area);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      navigate(`/directory?search=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  // Get result count text (singular/plural)
  const getResultCountText = (count) => {
    return count === 1 ? `${count} result` : `${count} results`;
  };

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

  if (!isVisible) return null;

  return (
    <>
      {/* Animated Overlay */}
      <motion.div
        className="fixed inset-0 z-[60] overflow-hidden"
        initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        animate={{
          backgroundColor: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={onClose}
      >
        {/* Backdrop blur that increases gradually */}
        <motion.div
          className="absolute inset-0 backdrop-blur-sm overflow-hidden"
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{
            backdropFilter: isOpen ? "blur(8px)" : "blur(0px)",
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </motion.div>

      {/* Animated Search Modal - Mobile comes from bottom and fills screen */}
      <motion.div
        className={`fixed z-70 bg-white shadow-2xl overflow-hidden ${
          isMobile
            ? "inset-0 rounded-none" // Full screen on mobile
            : "inset-y-0 left-0 w-full max-w-md"
        }`}
        initial={
          isMobile ? { y: "100%", opacity: 0 } : { x: "-100%", opacity: 0 }
        }
        animate={
          isMobile
            ? {
                y: isOpen ? "0%" : "100%",
                opacity: isOpen ? 1 : 0,
              }
            : {
                x: isOpen ? "0%" : "-100%",
                opacity: isOpen ? 1 : 0,
              }
        }
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          duration: 0.4,
        }}
      >
        <div className={`flex flex-col h-full ${isMobile ? "" : ""}`}>
          {/* Header with staggered animation */}
          <motion.div
            className={`flex items-center justify-between p-6 border-b border-gray-200 bg-white ${
              isMobile ? "" : ""
            }`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-8 bg-[#06EAFC] rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              />
              <h2 className="text-xl font-bold text-gray-900">Search</h2>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="w-6 h-6 text-gray-500"
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
            </motion.button>
          </motion.div>

          {/* Search Input with animation */}
          <motion.div
            className="p-6 border-b border-gray-100"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <motion.input
                type="text"
                placeholder="Search by area or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                autoFocus
              />
            </form>
          </motion.div>

          {/* Search Results with staggered animations - Critical overflow fix for mobile */}
          <div
            className={`flex-1 ${
              isMobile ? "overflow-y-auto overflow-x-hidden" : "overflow-y-auto"
            }`}
          >
            {searchQuery.trim() === "" ? (
              // Area suggestions when empty - Updated with location-based groups
              <motion.div
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <motion.h3
                  className="text-lg font-semibold text-gray-900 mb-4"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Popular Areas in Ibadan
                </motion.h3>
                <div className="space-y-4">
                  {getAreaGroups()
                    .slice(0, 3)
                    .map((areaGroup, index) => (
                      <motion.div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          delay: 0.1 + index * 0.05,
                          type: "spring",
                          stiffness: 100,
                        }}
                      >
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {areaGroup[0]} & Nearby
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {areaGroup.map((area, areaIndex) => (
                            <button
                              key={areaIndex}
                              onClick={() => handleSelectArea(area)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              {area}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            ) : suggestions.length === 0 ? (
              // No results state
              <motion.div
                className="p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-gray-400 mb-3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  <svg
                    className="w-12 h-12 mx-auto"
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
                </motion.div>
                <motion.p
                  className="text-gray-500 text-sm"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  No results found for "{searchQuery}"
                </motion.p>
                <motion.p
                  className="text-gray-400 text-xs mt-1"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Try searching for areas like "Bodija", "Mokola" or categories
                  like "Hotels", "Restaurants"
                </motion.p>
              </motion.div>
            ) : (
              // Suggestions list with staggered animations
              <motion.div
                className="p-4 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Area Suggestions with nearby areas */}
                {areaSuggestions.length > 0 && (
                  <motion.div
                    className="mb-6 overflow-hidden"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <h4 className="font-medium text-gray-900 text-sm mb-3 overflow-hidden">
                      Areas matching "{searchQuery}" and nearby locations
                    </h4>
                    <div className="space-y-2 overflow-hidden">
                      {areaSuggestions.map((area, index) => {
                        const isNearby = !area
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());

                        return (
                          <motion.button
                            key={index}
                            onClick={() => handleSelectArea(area)}
                            className={`flex items-center gap-3 p-3 w-full text-left rounded-lg transition-colors border overflow-hidden ${
                              isNearby
                                ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                                : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            }`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                              delay: 0.1 + index * 0.05,
                              type: "spring",
                              stiffness: 100,
                            }}
                          >
                            <svg
                              className={`w-4 h-4 ${
                                isNearby ? "text-orange-500" : "text-blue-500"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center justify-between overflow-hidden">
                                <span className="text-gray-700 font-medium text-sm block overflow-hidden">
                                  {area}
                                </span>
                                {isNearby && (
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full overflow-hidden">
                                    Nearby
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs overflow-hidden">
                                Ibadan, Oyo State
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Business Results */}
                <motion.div
                  className="flex items-center justify-between mb-4 overflow-hidden"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <h4 className="font-medium text-gray-900 text-sm overflow-hidden">
                    {getResultCountText(suggestions.length)} for "{searchQuery}"
                  </h4>
                </motion.div>

                <div className="space-y-3 overflow-hidden">
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
                      )} for 2 nights`;
                    } else {
                      priceText = `From #${formatPrice(
                        vendor.price_from
                      )} per guest`;
                    }

                    return (
                      <motion.div
                        key={vendor.id}
                        className="flex items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-100 overflow-hidden"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          delay: 0.1 + index * 0.05,
                          type: "spring",
                          stiffness: 100,
                        }}
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(59, 130, 246, 0.05)",
                        }}
                        onClick={() => handleSelectSuggestion(vendor)}
                      >
                        {/* Vendor Image */}
                        <motion.div
                          className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden mr-3"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <img
                            src={getCardImages(vendor)}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>

                        {/* Vendor Info */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-start justify-between overflow-hidden">
                            <div className="flex-1 overflow-hidden">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1 overflow-hidden">
                                {vendor.name}
                              </h4>
                              <p className="text-gray-600 text-xs mt-1 overflow-hidden">
                                {formatLocation(vendor)}
                              </p>
                            </div>
                            {vendor.price_from && (
                              <motion.div
                                className="text-right ml-2 flex-shrink-0 overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                              >
                                <p className="font-semibold text-green-600 text-xs overflow-hidden">
                                  {priceText}
                                </p>
                              </motion.div>
                            )}
                          </div>

                          {/* Rating and Category */}
                          <div className="flex items-center justify-between mt-2 overflow-hidden">
                            <div className="flex items-center gap-1 overflow-hidden">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-yellow-400 text-xs overflow-hidden"
                              />
                              <span className="text-gray-700 text-xs overflow-hidden">
                                {vendor.rating || "4.9"}
                              </span>
                            </div>
                            {vendor.category && (
                              <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded overflow-hidden">
                                {vendor.category.split(".")[1] ||
                                  vendor.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Categories with animation - Critical overflow fix for mobile */}
          <motion.div
            className={`p-6 border-t border-gray-100 bg-gray-50 ${
              isMobile ? "overflow-hidden" : ""
            }`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.p
              className="text-xs text-gray-600 mb-3 font-medium overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Popular Categories:
            </motion.p>
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
                <motion.button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors overflow-hidden"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

const Header = ({ onAuthToast }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Use the same Google Sheets data
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* FIXED HEADER WITH BOTTOM BLUE LINE - FIXED OVERFLOW */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7FA] border-b-2 border-[#00d1ff] h-16 font-rubik">
        {" "}
        {/* Reduced height to h-16 */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between py-2 w-full">
            {" "}
            {/* Reduced padding */}
            {/* LEFT — LOGO */}
            <div className="flex items-center gap-3">
              {" "}
              {/* Reduced gap */}
              <button
                onClick={() => {
                  closeMenu();
                  navigate("/");
                  setTimeout(
                    () => window.scrollTo({ top: 0, behavior: "smooth" }),
                    150
                  );
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-7 w-20 object-contain" /* Slightly smaller logo */
                />
              </button>
            </div>
            {/* CENTER — NAVIGATION (Centered like Image 1) */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-8 text-sm lg:ml-32">
              {" "}
              {/* Reduced gap and margin */}
              {[
                { label: "Home", id: "Home" },
                { label: "Categories", id: "Categories" },
                { label: "Price Insights", id: "Price Insights" },
                { label: "Blog", id: "Blog" },
                { label: "Vendor", id: "Vendor" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-[#00d1ff] transition-all whitespace-nowrap" /* Added whitespace-nowrap */
                >
                  {item.label}
                </button>
              ))}
            </div>
            {/* RIGHT SECTION - More compact */}
            <div className="flex items-center gap-3 text-sm">
              {" "}
              {/* Reduced gap */}
              {/* SEARCH ICON */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-xl hover:text-[#00d1ff] transition-colors" /* Smaller icon */
              >
                <CiSearch />
              </button>
              {/* Profile + Login + Hamburger */}
              <div className="flex items-center gap-3">
                {" "}
                {/* Reduced gap */}
                <div className="hidden lg:flex items-center gap-1 whitespace-nowrap">
                  {" "}
                  {/* Reduced gap, added whitespace */}
                  <IoPerson className="text-base" />
                  <span className="text-sm">My Profile</span>
                </div>
                <LoginButton onAuthToast={onAuthToast} />
                {/* MOBILE HAMBURGER */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="lg:hidden text-gray-900 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5" /* Smaller hamburger */
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        listings={listings}
      />

      {/* MOBILE MENU - More compact */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        ></div>

        {/* SLIDING PANEL - More compact */}
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col transform transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER - More compact */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-lg shadow-sm mt-1 mx-2">
            {" "}
            {/* Reduced padding, smaller margins */}
            <button
              onClick={closeMenu}
              className="flex flex-col items-start focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-6 w-16" /* Smaller logo in mobile menu */
                />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <span className="text-xs text-slate-600 hover:text-gray-900 whitespace-nowrap">
                  {" "}
                  The Ibadan Smart Guide
                </span>
              </div>
            </button>
            <button
              onClick={closeMenu}
              className="text-gray-900 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5" /* Smaller close icon */
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* NAVIGATION LINKS - More compact */}
          <nav className="flex-1 p-4 space-y-0.5 text-xs font-normal font-manrope">
            {" "}
            {[
              { label: "Categories", id: "Categories" },
              { label: "Price Insights", id: "Price Insights" },
              { label: "Blog", id: "Blog" },
              { label: "My Profile", id: "My Profile" },
              { label: "Log In", id: "Log In" },
              { label: "Register", id: "Register" },
            ].map((item) => (
              <button
                key={item.id}
                className="block w-full text-left py-1.5 text-gray-900 hover:text-[#06EAFC] font-medium whitespace-nowrap" /* Reduced padding */
                onClick={() => {
                  scrollToSection(item.id);
                  setTimeout(() => closeMenu(), 400);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
