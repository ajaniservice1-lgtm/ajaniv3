// Header.jsx - Updated with proper vendor navigation
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Logos/logo5.png";
import LoginButton from "../components/ui/LoginButton";
import { IoPerson } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

// Location-based filtering utilities (same as before)
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

// Search Modal Component for Header
const HeaderSearchModal = ({ isOpen, onClose, listings = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const navigate = useNavigate();

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
      setAreaSuggestions(getAreaSuggestions(""));
      return;
    }
    const filtered = filterVendors(searchQuery, listings).slice(0, 8);
    setSuggestions(filtered);
    const matchingAreas = getAreaSuggestions(searchQuery);
    setAreaSuggestions(matchingAreas);
  }, [searchQuery, listings]);

  const handleSelectSuggestion = (vendor) => {
    if (vendor && vendor.id) {
      onClose();
      navigate(`/vendor-detail/${vendor.id}`);
    }
  };

  const handleSelectArea = (area) => {
    setSearchQuery(area);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigate(`/directory?search=${encodeURIComponent(searchQuery)}`);
    }
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
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
  };

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US");
  };

  const formatLocation = (item) => {
    const area = item.area || "Ibadan";
    return `${area}, Oyo State`;
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 z-[70] w-full max-w-md bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Search</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
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
            </button>
          </div>
          <div className="p-6 border-b">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by area or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus
              />
            </form>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {searchQuery.trim() === "" ? (
              <div className="p-4">
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
                              onClick={() => handleSelectArea(area)}
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
              <div>
                {areaSuggestions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 text-sm mb-3">
                      Areas matching "{searchQuery}" and nearby locations
                    </h4>
                    <div className="space-y-2">
                      {areaSuggestions.map((area, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectArea(area)}
                          className="flex items-center gap-3 p-3 w-full text-left bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4 text-blue-500"
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
                          <div>
                            <span className="text-gray-700 font-medium text-sm">
                              {area}
                            </span>
                            <p className="text-gray-500 text-xs">
                              Ibadan, Oyo State
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {suggestions.length} results for "{searchQuery}"
                  </h4>
                </div>
                <div className="space-y-3">
                  {suggestions.map((vendor, index) => (
                    <div
                      key={vendor.id || index}
                      className="flex items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                      onClick={() => handleSelectSuggestion(vendor)}
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
                                From #{formatPrice(vendor.price_from)}
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
                              {vendor.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Main Header Component
const Header = ({ onAuthToast }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { data: listings = [] } = useGoogleSheet(SHEET_ID, API_KEY);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7FA] border-b-2 border-[#00d1ff] h-16 font-rubik">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-between py-2 w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigate("/");
                  setTimeout(() => window.scrollTo({ top: 0 }), 150);
                }}
                className="flex items-center gap-2"
              >
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-7 w-20 object-contain"
                />
              </button>
            </div>
            <div className="hidden lg:flex flex-1 justify-center items-center gap-8 text-sm lg:ml-32">
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
                  className="hover:text-[#00d1ff] transition-all whitespace-nowrap"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-xl hover:text-[#00d1ff] transition-colors"
              >
                <CiSearch />
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-1 whitespace-nowrap">
                  <IoPerson className="text-base" />
                  <span className="text-sm">My Profile</span>
                </div>
                <LoginButton onAuthToast={onAuthToast} />
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="lg:hidden text-gray-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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

      <HeaderSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        listings={listings}
      />

      {/* Mobile Menu (same as before) */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col transform transition-transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-lg shadow-sm mt-1 mx-2">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-start"
            >
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Ajani Logo" className="h-6 w-16" />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <span className="text-xs text-slate-600 hover:text-gray-900 whitespace-nowrap">
                  The Ibadan Smart Guide
                </span>
              </div>
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-900 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
          <nav className="flex-1 p-4 space-y-0.5 text-xs font-manrope">
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
                className="block w-full text-left py-1.5 text-gray-900 hover:text-[#06EAFC] font-medium whitespace-nowrap"
                onClick={() => {
                  scrollToSection(item.id);
                  setTimeout(() => setIsMenuOpen(false), 400);
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
