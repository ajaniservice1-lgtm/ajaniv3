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

// Search Suggestions Component
const SearchSuggestions = ({
  searchQuery,
  suggestions,
  onSelectSuggestion,
  onClose,
  isVisible,
}) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
    >
      {/* Search Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900">Search Results</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Showing results for "
          <span className="font-medium">{searchQuery}</span>"
        </p>
      </div>

      {/* Suggestions List */}
      <div className="p-2">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
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
                ></path>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              No results found for "{searchQuery}"
            </p>
            <p className="text-gray-400 text-xs mt-1">Try different keywords</p>
          </div>
        ) : (
          suggestions.map((vendor) => {
            // Determine price text based on category
            const category = (vendor.category || "").toLowerCase();
            let priceText = "";
            if (
              category.includes("hotel") ||
              category.includes("hostel") ||
              category.includes("shortlet")
            ) {
              priceText = `#${formatPrice(vendor.price_from)} for 2 night`;
            } else {
              priceText = `From #${formatPrice(vendor.price_from)} per guest`;
            }

            const images = getCardImages(vendor);

            return (
              <div
                key={vendor.id}
                className="flex items-start p-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors duration-150 group"
                onClick={() => onSelectSuggestion(vendor)}
              >
                {/* Vendor Image */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden mr-3">
                  <img
                    src={images[0]}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {vendor.name}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                        {vendor.category || "Business"}
                      </p>
                      {vendor.area && (
                        <p className="text-gray-500 text-xs mt-1">
                          {vendor.area}
                        </p>
                      )}
                    </div>
                    {vendor.price_from && (
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="font-semibold text-green-600 text-sm">
                          {priceText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rating and Category */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400 text-xs"
                      />
                      <span className="text-gray-700 text-xs font-normal">
                        {vendor.rating || "4.89"}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vendor.category?.split(".")[1] ||
                        vendor.category ||
                        "Business"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Categories */}
      {suggestions.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-600 mb-2">Popular Categories:</p>
          <div className="flex flex-wrap gap-2">
            {["Hotels", "Restaurants", "Events", "Tourism"].map((category) => (
              <button
                key={category}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Helper functions from Directory
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
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Filter vendors based on search query - using same logic as Directory
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = listings
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.area &&
            item.area.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .slice(0, 5); // Limit to 5 suggestions

    setSuggestions(filtered);
  }, [searchQuery, listings]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (vendor) => {
    setSearchQuery(vendor.name);
    setShowSuggestions(false);
    // Here you can navigate to the vendor page or perform search
    console.log("Selected vendor:", vendor);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Perform search action - you can redirect to directory with search query
      console.log("Searching for:", searchQuery);
      setShowSuggestions(false);
      // Example: navigate to directory with search query
      // window.location.href = `/directory?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const categoryData = [
    { name: "Hotel", img: HeroImage2 },
    { name: "Restaurant", img: HeroImage5 },
    { name: "Events", img: HeroImage4 },
    { name: "Tourism", img: HeroImage3 },
  ];

  return (
    <section
      id="hero"
      className="bg-[#F7F7FA] font-rubik overflow-hidden min-h-[calc(100vh-80px)] flex items-start relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-4 w-full">
        <div
          ref={heroRef}
          className="flex flex-col items-center text-center gap-6 sm:gap-8 pt-8 sm:pt-12 pb-8 sm:pb-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px", once: false }}
            className="flex flex-col justify-start space-y-6 sm:space-y-5 max-w-xl sm:max-w-2xl w-full"
          >
            {/* Headline */}
            <h1 className="text-4xl sm:text-3xl md:text-5xl font-bold text-[#101828] leading-tight mt-10">
              Discover Ibadan through AI & Local Stories
            </h1>

            {/* Subtitle */}
            <p className="lg:text-lg text-[15px] md:text-xl leading-[1.5] text-slate-600 mb-10 font-manrope">
              Your all-in-one local guide for hotels, food, events, vendors, and
              market prices.
            </p>

            {/* Search Bar with Suggestions */}
            <div className="relative mx-auto w-full sm:max-w-md">
              <div className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-10">
                <div className="pl-3 sm:pl-4 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 sm:h-5 w-4 sm:w-5"
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
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="flex-1 bg-transparent py-3 sm:py-5 px-4 sm:px-3 text-xs sm:text-sm text-gray-800 outline-none placeholder:text-gray-600"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-3 sm:py-5 px-4 sm:px-8 text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                <SearchSuggestions
                  searchQuery={searchQuery}
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                  onClose={() => setShowSuggestions(false)}
                  isVisible={showSuggestions && searchQuery.length > 0}
                />
              </AnimatePresence>
            </div>

            {/* Categories */}
            <div className="flex justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
              {categoryData.map((item) => (
                <div key={item.name} className="text-center">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="
          w-[82.47px] h-[82.47px] rounded-[11.25px]
          md:w-[156.47px] md:h-[156.47px] md:rounded-[21.34px]
          object-cover
        "
                  />
                  <p className="mt-2 text-xs sm:text-sm font-medium">
                    {item.name}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
