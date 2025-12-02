// Hero.jsx - Complete Component with Search Integration
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

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

// Utility functions (same as before)
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

// SearchModal Component
const SearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  suggestions = [],
  areaSuggestions = [],
  onSelectSuggestion,
  onSelectArea,
  listings = [],
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  const getResultCountText = (count) => {
    return count === 1 ? `${count} result` : `${count} results`;
  };

  const formatLocation = (item) => {
    const area = item.area || "Ibadan";
    return `${area}, Oyo State`;
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
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
                placeholder="Search by area or category..."
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
          <div
            className={`flex-1 ${
              isMobile ? "overflow-y-auto overflow-x-hidden" : "overflow-y-auto"
            }`}
          >
            {searchQuery.trim() === "" ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Popular Areas in Ibadan
                </h3>
                <div className="space-y-4">
                  {getAreaGroups()
                    .slice(0, 3)
                    .map((areaGroup, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {areaGroup[0]} & Nearby
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {areaGroup.map((area, areaIndex) => (
                            <button
                              key={areaIndex}
                              onClick={() => onSelectArea(area)}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              {area}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : suggestions.length === 0 ? (
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
                  Try searching for areas like "Bodija", "Mokola", or categories
                  like "Hotels", "Restaurants"
                </p>
              </div>
            ) : (
              <div className="p-4">
                {areaSuggestions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 text-sm mb-3">
                      Areas matching "{searchQuery}" and nearby locations
                    </h4>
                    <div className="space-y-2">
                      {areaSuggestions.map((area, index) => {
                        const isNearby = !area
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());
                        return (
                          <button
                            key={index}
                            onClick={() => onSelectArea(area)}
                            className={`flex items-center gap-3 p-3 w-full text-left rounded-lg transition-colors border ${
                              isNearby
                                ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                                : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            }`}
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
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-medium text-sm">
                                  {area}
                                </span>
                                {isNearby && (
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                    Nearby
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs">
                                Ibadan, Oyo State
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                      )} for 2 nights`;
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
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden mr-3">
                          <img
                            src={getCardImages(vendor)}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                {vendor.name}
                              </h4>
                              <p className="text-gray-600 text-xs mt-1">
                                {formatLocation(vendor)}
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
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon
                                icon={faStar}
                                className="text-yellow-400 text-xs"
                              />
                              <span className="text-gray-700 text-xs">
                                {vendor.rating || "4.9"}
                              </span>
                            </div>
                            {vendor.category && (
                              <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
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
              </div>
            )}
          </div>
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
              {["Hotels", "Restaurants", "Shortlets", "Tourism"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => onSearchChange(category)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                  >
                    {category}
                  </button>
                )
              )}
            </div>
          </div>
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
      setIsSearchModalOpen(false);
    }
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
              <div className="relative mx-auto w-full sm:max-w-md overflow-hidden px-2">
                <div
                  className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-10 cursor-text"
                  onClick={() => setIsSearchModalOpen(true)}
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
                    placeholder="Search by area or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchModalOpen(true)}
                    className="flex-1 bg-transparent py-1.5 sm:py-2 px-2 text-xs text-gray-800 outline-none placeholder:text-gray-600 cursor-text"
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
                  <p className="text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Popular Hotels
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
                  <p className="text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Tourist Centers
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
                  <p className="text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Popular Shortlets
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
                  <p className="text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Popular Restaurants
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
          suggestions={suggestions}
          areaSuggestions={areaSuggestions}
          onSelectSuggestion={handleSelectSuggestion}
          onSelectArea={(area) => setSearchQuery(area)}
          listings={listings}
        />
      </AnimatePresence>
    </>
  );
};

export default Hero;
