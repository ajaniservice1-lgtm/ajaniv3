// FULL UPDATED Header.jsx — With Search Modal and Proper Imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/Logos/logo5.png";
import LoginButton from "../components/ui/LoginButton";
import { IoPerson } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

// Search Modal Component
const SearchModal = ({ isOpen, onClose, listings = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Filter suggestions based on search query
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
      .slice(0, 8);

    setSuggestions(filtered);
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
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <>
      {/* Animated Overlay - Gradually reveals main page content */}
      <motion.div
        className="fixed inset-0 z-[60]"
        initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        animate={{
          backgroundColor: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={onClose}
      >
        {/* Backdrop blur that increases gradually */}
        <motion.div
          className="absolute inset-0 backdrop-blur-sm"
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{
            backdropFilter: isOpen ? "blur(8px)" : "blur(0px)",
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </motion.div>

      {/* Animated Search Modal */}
      <motion.div
        className="fixed inset-y-0 left-0 w-full max-w-md bg-white shadow-2xl z-[70]"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{
          x: isOpen ? "0%" : "-100%",
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          duration: 0.4,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header with staggered animation */}
          <motion.div
            className="flex items-center justify-between p-6 border-b border-gray-200 bg-white"
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
                placeholder="Search for hotels, restaurants, events..."
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

          {/* Search Results with staggered animations */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery.trim() === "" ? (
              // Empty state with gentle animations
              <motion.div
                className="p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="max-w-sm mx-auto">
                  <motion.h3
                    className="text-lg font-semibold text-gray-900 mb-2"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Search for...
                  </motion.h3>
                  <motion.p
                    className="text-gray-600 text-sm mb-6"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <strong>our brad..... isn't just an</strong>
                    <br />
                    our brad.........shopping should feel: calm and effortless
                  </motion.p>
                  <motion.div
                    className="bg-gray-50 rounded-lg p-4 text-left"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-gray-700 text-sm mb-2">
                      <strong>Enjoy effortless navigation</strong> that puts you
                      in control.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Say goodbye to clutter and find what you need with ease.
                    </p>
                    <motion.p
                      className="text-gray-700 text-sm mt-3 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      Choose our brad......... — where shopping meets simplicity.
                    </motion.p>
                  </motion.div>
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
                  Try different keywords
                </motion.p>
              </motion.div>
            ) : (
              // Suggestions list with staggered animations
              <motion.div
                className="p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-between mb-4"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <h4 className="font-medium text-gray-900 text-sm">
                    Search Results
                  </h4>
                  <span className="text-gray-500 text-xs">
                    {suggestions.length} found
                  </span>
                </motion.div>

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
                        key={vendor.id}
                        className="flex items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors duration-150 border border-gray-100"
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
                              <motion.div
                                className="text-right ml-2 flex-shrink-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                              >
                                <p className="font-semibold text-green-600 text-xs">
                                  {priceText}
                                </p>
                              </motion.div>
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
              </motion.div>
            )}
          </div>

          {/* Quick Categories with animation */}
          <motion.div
            className="p-6 border-t border-gray-100 bg-gray-50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.p
              className="text-xs text-gray-600 mb-3 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Popular Categories:
            </motion.p>
            <div className="flex flex-wrap gap-2">
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
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
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
    if (isMenuOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
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
      {/* FIXED HEADER WITH BOTTOM BLUE LINE (Image 1 style) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7FA] border-b-2 border-[#00d1ff] h-20 font-rubik">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <nav className="flex items-center justify-between px-6 py-1 w-full">
            {/* LEFT — LOGO */}
            <div className="flex items-center gap-4">
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
                  className="h-8 w-24 object-contain"
                />
              </button>
            </div>

            {/* CENTER — NAVIGATION (Centered like Image 1) */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-10 text-sm">
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
                  className="hover:text-[#00d1ff] transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* SEARCH ICON */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="text-2xl mx-2.5 hover:text-[#00d1ff] transition-colors"
            >
              <CiSearch />
            </button>

            {/* RIGHT — Profile + Login + Hamburger */}
            <div className="flex items-center gap-4 text-sm">
              <div className="hidden lg:flex items-center gap-2">
                <IoPerson />
                <span>My Profile</span>
              </div>

              <LoginButton onAuthToast={onAuthToast} />

              {/* MOBILE HAMBURGER */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden text-gray-900 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
          </nav>
        </div>
      </header>

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        listings={listings}
      />

      {/* MOBILE MENU */}
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

        {/* SLIDING PANEL */}
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col transform transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-full shadow-md px-6 py-3 mt-1.5">
            <button
              onClick={closeMenu}
              className="flex flex-col items-start focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Ajani Logo" className="h-8 w-24" />
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <span className="md:text-sm text-[12.5px] text-slate-600 hover:text-gray-900">
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
                className="h-6 w-6"
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

          {/* NAVIGATION LINKS */}
          <nav className="flex-1 p-5 space-y-1 font-normal font-rubik">
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
                className="block w-full text-left py-2 text-gray-900 hover:text-[#06EAFC] font-medium"
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
