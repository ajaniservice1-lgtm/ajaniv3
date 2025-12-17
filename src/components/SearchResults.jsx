// src/components/SearchResults.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSearch,
  faTimes,
  faFilter,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
  faDollarSign,
  faCheck,
  faChevronRight,
  faChevronLeft,
  faTimesCircle,
  faBed,
  faHome,
  faCalendarWeek,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { PiSliders } from "react-icons/pi";
import { MdFavoriteBorder } from "react-icons/md";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import Meta from "./Meta";
import { createPortal } from "react-dom";

// BackButton Component
const BackButton = ({ className = "", onClick }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors active:scale-95 ${className}`}
      aria-label="Go back"
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-gray-700 text-lg" />
    </button>
  );
};

// Add capitalizeFirst function at the top
const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Google Sheets hook
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
            .map((row, index) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
              obj.id = obj.id || `item-${index}`;
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

// FALLBACK IMAGES
const FALLBACK_IMAGES = {
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  tourist:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
  services:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
  event:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  hall: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  weekend:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  default:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
};

// Helper function to get category display name
const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories" || category === "All")
    return "All Categories";

  const parts = category.split(".");
  if (parts.length > 1) {
    const afterDot = parts.slice(1).join(".").trim();
    return afterDot
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to get location display name
const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations" || location === "All")
    return "All Locations";

  const parts = location.split(".");
  if (parts.length > 1) {
    const afterDot = parts.slice(1).join(".").trim();
    return afterDot
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to get location breakdown
const getLocationBreakdown = (listings) => {
  const locationCounts = {};
  listings.forEach((item) => {
    const location = getLocationDisplayName(item.area || "Unknown");
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to get category breakdown for a specific location
const getCategoryBreakdownForLocation = (listings, targetLocation) => {
  const filteredListings = listings.filter((item) => {
    const itemLocation = getLocationDisplayName(item.area || "Unknown");
    return itemLocation.toLowerCase() === targetLocation.toLowerCase();
  });

  const categoryCounts = {};
  filteredListings.forEach((item) => {
    const category = getCategoryDisplayName(item.category || "other.other");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes("hotel") || cat.includes("accommodation")) return faBed;
  if (cat.includes("shortlet") || cat.includes("apartment")) return faHome;
  if (cat.includes("weekend") || cat.includes("event")) return faCalendarWeek;
  if (cat.includes("restaurant") || cat.includes("food")) return faFilter;
  return faFilter;
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
  if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
  if (cat.includes("tourist")) return [FALLBACK_IMAGES.tourist];
  if (cat.includes("cafe")) return [FALLBACK_IMAGES.cafe];
  if (cat.includes("bar") || cat.includes("lounge"))
    return [FALLBACK_IMAGES.bar];
  if (cat.includes("services")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  if (cat.includes("hall") || cat.includes("weekend"))
    return [FALLBACK_IMAGES.hall];
  return [FALLBACK_IMAGES.default];
};

// Custom hook for tracking favorite status
const useIsFavorite = (itemId) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const checkFavoriteStatus = useCallback(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );
      const isAlreadySaved = saved.some((savedItem) => savedItem.id === itemId);
      setIsFavorite(isAlreadySaved);
    } catch (error) {
      console.error("Error checking favorite status:", error);
      setIsFavorite(false);
    }
  }, [itemId]);

  useEffect(() => {
    // Initial check
    checkFavoriteStatus();

    // Create a custom event listener
    const handleSavedListingsChange = () => {
      checkFavoriteStatus();
    };

    // Listen for storage events
    const handleStorageChange = (e) => {
      if (e.key === "userSavedListings") {
        checkFavoriteStatus();
      }
    };

    // Add event listeners
    window.addEventListener("savedListingsUpdated", handleSavedListingsChange);
    window.addEventListener("storage", handleStorageChange);

    // Poll for changes (fallback)
    const pollInterval = setInterval(checkFavoriteStatus, 1000);

    return () => {
      window.removeEventListener(
        "savedListingsUpdated",
        handleSavedListingsChange
      );
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [itemId, checkFavoriteStatus]);

  return isFavorite;
};

// ---------------- SearchResultBusinessCard Component ----------------
const SearchResultBusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageHeight, setImageHeight] = useState(170);
  const isFavorite = useIsFavorite(item.id);
  const cardRef = useRef(null);

  // Set consistent height based on device
  useEffect(() => {
    setImageHeight(isMobile ? 150 : 170);
  }, [isMobile]);

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPriceText = () => {
    const priceFrom = item.price_from || item.price || "0";
    const formattedPrice = formatPrice(priceFrom);
    return `₦${formattedPrice}`;
  };

  const getPerText = () => {
    const nightlyCategories = [
      "hotel",
      "hostel",
      "shortlet",
      "apartment",
      "cabin",
      "condo",
      "resort",
      "inn",
      "motel",
    ];

    if (nightlyCategories.some((cat) => category.toLowerCase().includes(cat))) {
      return "for 2 nights";
    }

    if (
      category.toLowerCase().includes("restaurant") ||
      category.toLowerCase().includes("food") ||
      category.toLowerCase().includes("cafe")
    ) {
      return "per meal";
    }

    return "per guest";
  };

  const priceText = getPriceText();
  const perText = getPerText();
  const locationText = item.area || item.location || "Ibadan";
  const rating = item.rating || "4.9";
  const businessName = item.name || "Business Name";

  const handleCardClick = () => {
    if (item.id) {
      navigate(`/vendor-detail/${item.id}`);
    } else {
      navigate(`/category/${category}`);
    }
  };

  // Toast Notification Function
  const showToast = useCallback(
    (message, type = "success") => {
      const existingToast = document.getElementById("toast-notification");
      if (existingToast) {
        existingToast.remove();
      }

      const toast = document.createElement("div");
      toast.id = "toast-notification";
      toast.className = `fixed z-[9999] px-4 py-3 rounded-lg shadow-lg border ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`;

      toast.style.top = isMobile ? "15px" : "15px";
      toast.style.right = "15px";
      toast.style.maxWidth = "320px";
      toast.style.animation = "slideInRight 0.3s ease-out forwards";

      toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="${
          type === "success" ? "text-green-600" : "text-blue-600"
        } mt-0.5">
          ${
            type === "success"
              ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
              : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
          }
        </div>
        <div class="flex-1">
          <p class="font-medium">${message}</p>
          <p class="text-sm opacity-80 mt-1">${businessName}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-70 transition-opacity">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

      document.body.appendChild(toast);

      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = "slideOutRight 0.3s ease-in forwards";
          setTimeout(() => {
            if (toast.parentElement) {
              toast.remove();
            }
          }, 300);
        }
      }, 3000);
    },
    [isMobile, businessName]
  );

  // Handle favorite click
  const handleFavoriteClick = useCallback(
    async (e) => {
      e.stopPropagation();

      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const isLoggedIn = localStorage.getItem("ajani_dummy_login") === "true";

        if (!isLoggedIn) {
          showToast("Please login to save listings", "info");

          localStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname + window.location.search
          );

          const itemToSaveAfterLogin = {
            id: item.id,
            name: businessName,
            price: priceText,
            perText: perText,
            rating: parseFloat(rating),
            tag: "Guest Favorite",
            image: images[0] || FALLBACK_IMAGES.default,
            category: capitalizeFirst(category) || "Business",
            location: locationText,
            originalData: {
              price_from: item.price_from,
              area: item.area,
              rating: item.rating,
              description: item.description,
              amenities: item.amenities,
              contact: item.contact,
            },
          };

          localStorage.setItem(
            "pendingSaveItem",
            JSON.stringify(itemToSaveAfterLogin)
          );

          setTimeout(() => {
            navigate("/login");
            setIsProcessing(false);
          }, 800);

          return;
        }

        const saved = JSON.parse(
          localStorage.getItem("userSavedListings") || "[]"
        );

        const isAlreadySaved = saved.some(
          (savedItem) => savedItem.id === item.id
        );

        if (isAlreadySaved) {
          const updated = saved.filter((savedItem) => savedItem.id !== item.id);
          localStorage.setItem("userSavedListings", JSON.stringify(updated));

          showToast("Removed from saved listings", "info");

          window.dispatchEvent(
            new CustomEvent("savedListingsUpdated", {
              detail: { action: "removed", itemId: item.id },
            })
          );
        } else {
          const listingToSave = {
            id: item.id || `listing_${Date.now()}`,
            name: businessName,
            price: priceText,
            perText: perText,
            rating: parseFloat(rating),
            tag: "Guest Favorite",
            image: images[0] || FALLBACK_IMAGES.default,
            category: capitalizeFirst(category) || "Business",
            location: locationText,
            savedDate: new Date().toISOString().split("T")[0],
            originalData: {
              price_from: item.price_from,
              area: item.area,
              rating: item.rating,
              description: item.description,
              amenities: item.amenities,
              contact: item.contact,
            },
          };

          const updated = [...saved, listingToSave];
          localStorage.setItem("userSavedListings", JSON.stringify(updated));

          showToast("Added to saved listings!", "success");

          window.dispatchEvent(
            new CustomEvent("savedListingsUpdated", {
              detail: { action: "added", item: listingToSave },
            })
          );
        }
      } catch (error) {
        console.error("Error saving/removing favorite:", error);
        showToast("Something went wrong. Please try again.", "info");
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      item,
      businessName,
      priceText,
      perText,
      rating,
      images,
      category,
      locationText,
      showToast,
      navigate,
    ]
  );

  // Check for pending saves after login
  useEffect(() => {
    const pendingSaveItem = JSON.parse(
      localStorage.getItem("pendingSaveItem") || "null"
    );

    if (pendingSaveItem && pendingSaveItem.id === item.id) {
      localStorage.removeItem("pendingSaveItem");

      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );

      const isAlreadySaved = saved.some(
        (savedItem) => savedItem.id === item.id
      );

      if (!isAlreadySaved) {
        const updated = [...saved, pendingSaveItem];
        localStorage.setItem("userSavedListings", JSON.stringify(updated));

        showToast("Added to saved listings!", "success");

        window.dispatchEvent(
          new CustomEvent("savedListingsUpdated", {
            detail: { action: "added", item: pendingSaveItem },
          })
        );
      }
    }
  }, [item.id, showToast]);

  return (
    <div
      ref={cardRef}
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope relative group flex flex-col h-full
        ${isMobile ? "w-[165px]" : "w-full"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
      style={{
        height: isMobile ? "280px" : "320px",
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-xl flex-shrink-0"
        style={{
          height: `${imageHeight}px`,
          minHeight: `${imageHeight}px`,
          maxHeight: `${imageHeight}px`,
        }}
      >
        <img
          src={images[0]}
          alt={businessName}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null;
          }}
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
          onClick={handleFavoriteClick}
          disabled={isProcessing}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
            isFavorite
              ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-white/90 hover:bg-white backdrop-blur-sm"
          } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
          title={isFavorite ? "Remove from saved" : "Add to saved"}
          aria-label={isFavorite ? "Remove from saved" : "Save this listing"}
          aria-pressed={isFavorite}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isFavorite ? (
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <MdFavoriteBorder className="text-[#00d1ff] w-4 h-4" />
          )}
        </button>
      </div>

      {/* Text Content */}
      <div className={`flex-1 ${isMobile ? "p-1.5" : "p-2.5"} flex flex-col`}>
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-xs md:text-sm mb-1 flex-shrink-0">
          {businessName}
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-[9px] md:text-xs line-clamp-1 mb-2">
              {locationText}
            </p>

            {/* Combined Price, Per Text, and Ratings on same line */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 flex-wrap">
                {/* Price and Per Text */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xs md:text-xs font-manrope text-gray-900">
                    {priceText}
                  </span>
                  <span className="text-[9px] md:text-xs text-gray-600">
                    {perText}
                  </span>
                </div>
              </div>

              {/* Ratings on the right */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-gray-800 text-[9px] md:text-xs">
                  <FontAwesomeIcon icon={faStar} className="text-black" />
                  <span className="font-semibold text-black">{rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Category tag and Saved indicator */}
          <div className="flex items-center justify-between mt-auto pt-2">
            {/* Category tag */}
            <div>
              <span className="inline-block text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {capitalizeFirst(category)}
              </span>
            </div>

            {/* Saved indicator badge */}
            {isFavorite && !isProcessing && (
              <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <svg
                  className="w-2 h-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
    </div>
  );
};

// ================== CATEGORY BREAKDOWN BADGES COMPONENT ==================
const CategoryBreakdownBadges = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  const topCategories = categories.slice(0, 3);

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-2 font-medium">Places include:</p>
      <div className="flex flex-wrap gap-2">
        {topCategories.map(({ category, count }, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200"
          >
            <FontAwesomeIcon
              icon={getCategoryIcon(category)}
              className="text-xs text-gray-600"
            />
            <span className="text-xs font-medium text-gray-700">
              {category}
            </span>
            <span className="text-xs font-bold text-blue-600">({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================== ENHANCED FILTER SIDEBAR ==================
const FilterSidebar = ({
  onFilterChange,
  allLocations,
  allCategories,
  currentFilters,
  onClose,
  isMobileModal = false,
  isDesktopModal = false,
  currentSearchQuery = "",
  onDynamicFilterApply,
  isInitialized,
  isMobile,
}) => {
  const [localFilters, setLocalFilters] = useState(
    currentFilters || {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    }
  );

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    category: false,
    price: true,
    rating: true,
    amenities: false,
    sort: true,
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategorySection, setShowCategorySection] = useState(false);

  const uniqueLocationDisplayNames = React.useMemo(() => {
    const locations = [
      ...new Set(allLocations.map((loc) => getLocationDisplayName(loc))),
    ];
    return locations.sort();
  }, [allLocations]);

  const uniqueCategoryDisplayNames = React.useMemo(() => {
    const categories = [
      ...new Set(allCategories.map((cat) => getCategoryDisplayName(cat))),
    ];
    return categories.sort();
  }, [allCategories]);

  const filteredLocationDisplayNames = React.useMemo(() => {
    if (!locationSearch.trim()) return uniqueLocationDisplayNames;
    const searchTerm = locationSearch.toLowerCase().trim();
    return uniqueLocationDisplayNames.filter((location) =>
      location.toLowerCase().includes(searchTerm)
    );
  }, [uniqueLocationDisplayNames, locationSearch]);

  const filteredCategoryDisplayNames = React.useMemo(() => {
    if (!categorySearch.trim()) return uniqueCategoryDisplayNames;
    const searchTerm = categorySearch.toLowerCase().trim();
    return uniqueCategoryDisplayNames.filter((category) =>
      category.toLowerCase().includes(searchTerm)
    );
  }, [uniqueCategoryDisplayNames, categorySearch]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Show category section when location is selected
  useEffect(() => {
    if (localFilters.locations.length > 0) {
      setShowCategorySection(true);
      if (!expandedSections.category) {
        setExpandedSections((prev) => ({ ...prev, category: true }));
      }
    }
  }, [localFilters.locations.length, expandedSections.category]);

  // Sync local filters when currentFilters prop changes
  useEffect(() => {
    if (isInitialized && currentFilters) {
      setLocalFilters(currentFilters);
      if (currentFilters.locations.length > 0) {
        setShowCategorySection(true);
      }
    }
  }, [currentFilters, isInitialized]);

  // Updated filter handlers with immediate application for desktop non-modal
  const handleLocationChange = (location) => {
    const updatedFilters = {
      ...localFilters,
      locations: localFilters.locations.includes(location)
        ? localFilters.locations.filter((l) => l !== location)
        : [...localFilters.locations, location],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleCategoryChange = (category) => {
    const updatedFilters = {
      ...localFilters,
      categories: localFilters.categories.includes(category)
        ? localFilters.categories.filter((c) => c !== category)
        : [...localFilters.categories, category],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleRatingChange = (stars) => {
    const updatedFilters = {
      ...localFilters,
      ratings: localFilters.ratings.includes(stars)
        ? localFilters.ratings.filter((s) => s !== stars)
        : [...localFilters.ratings, stars],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handlePriceChange = (field, value) => {
    const updatedFilters = {
      ...localFilters,
      priceRange: {
        ...localFilters.priceRange,
        [field]: value,
      },
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleSelectAllLocations = () => {
    const updatedFilters = {
      ...localFilters,
      locations:
        localFilters.locations.length === uniqueLocationDisplayNames.length
          ? []
          : [...uniqueLocationDisplayNames],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  const handleSelectAllCategories = () => {
    const updatedFilters = {
      ...localFilters,
      categories:
        localFilters.categories.length === uniqueCategoryDisplayNames.length
          ? []
          : [...uniqueCategoryDisplayNames],
    };
    setLocalFilters(updatedFilters);

    // For desktop non-modal, apply immediately
    if (!isMobileModal && !isDesktopModal && !isMobile) {
      onFilterChange(updatedFilters);
    }
  };

  // Apply filters when user clicks Apply button (for modals only)
  const handleApplyFilters = () => {
    // Apply the local filters to the main component
    onFilterChange(localFilters);

    if (onDynamicFilterApply) {
      const hasCategoryFilters = localFilters.categories.length > 0;
      const hasLocationFilters = localFilters.locations.length > 0;

      let categoryParams = [];
      if (hasCategoryFilters) {
        localFilters.categories.forEach((catDisplayName) => {
          const selectedCategory = allCategories.find(
            (cat) => getCategoryDisplayName(cat) === catDisplayName
          );
          if (selectedCategory) {
            categoryParams.push(selectedCategory);
          }
        });
      }

      let locationParams = [];
      if (hasLocationFilters) {
        localFilters.locations.forEach((locDisplayName) => {
          const selectedLocation = allLocations.find(
            (loc) => getLocationDisplayName(loc) === locDisplayName
          );
          if (selectedLocation) {
            locationParams.push(selectedLocation);
          }
        });
      }

      onDynamicFilterApply({
        filters: localFilters,
        categories: categoryParams,
        locations: locationParams,
        keepSearchQuery: currentSearchQuery,
      });
    }

    // Close the modal if it's open
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div
      className={`space-y-6 ${isMobileModal ? "px-0" : ""}`}
      style={{
        marginLeft: isMobileModal ? "0" : "0",
        marginRight: isMobileModal ? "0" : "0",
        paddingLeft: isMobileModal ? "0.75rem" : "0",
        paddingRight: isMobileModal ? "0.75rem" : "0",
      }}
    >
      {(isMobileModal || isDesktopModal) && (
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Filter & Sort</h3>
            <p className="text-sm text-gray-500 mt-1">
              Refine your search results
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
      )}

      {/* LOCATION SECTION WITH SEARCH */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("location")}
          className="w-full flex justify-between items-center mb-3"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
            <h4 className="font-semibold text-gray-900 text-base">Location</h4>
            {localFilters.locations.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                {localFilters.locations.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.location ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.location && (
          <>
            <div className="mb-3">
              <div className="relative mb-3">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-sm" />
                  </button>
                )}
              </div>
              <div className="flex justify-between mb-2">
                <button
                  onClick={handleSelectAllLocations}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {localFilters.locations.length ===
                  uniqueLocationDisplayNames.length
                    ? "Clear All Locations"
                    : "Select All Locations"}
                </button>
                <span className="text-xs text-gray-500">
                  {filteredLocationDisplayNames.length} locations
                </span>
              </div>
            </div>
            <div className="max-h-52 overflow-y-auto pr-1">
              {filteredLocationDisplayNames.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No locations found matching "{locationSearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {filteredLocationDisplayNames.map((location, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.locations.includes(location)}
                        onChange={() => handleLocationChange(location)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                      />
                      <span
                        className={`text-sm group-hover:text-[#06EAFC] transition-colors truncate ${
                          localFilters.locations.includes(location)
                            ? "text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                        style={{
                          flex: 1,
                        }}
                      >
                        {location}
                      </span>
                      {localFilters.locations.includes(location) && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-sm text-blue-600"
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {localFilters.locations.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  Selected: {localFilters.locations.slice(0, 3).join(", ")}
                  {localFilters.locations.length > 3 &&
                    ` +${localFilters.locations.length - 3} more`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CATEGORY SECTION WITH SEARCH - Show after location selection */}
      {(showCategorySection || localFilters.categories.length > 0) && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection("category")}
            className="w-full flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-green-500" />
              <h4 className="font-semibold text-gray-900 text-base">
                Category
              </h4>
              {localFilters.categories.length > 0 && (
                <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                  {localFilters.categories.length}
                </span>
              )}
            </div>
            <FontAwesomeIcon
              icon={expandedSections.category ? faChevronUp : faChevronDown}
              className="text-gray-400"
            />
          </button>

          {expandedSections.category && (
            <>
              <div className="mb-3">
                <div className="relative mb-3">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  {categorySearch && (
                    <button
                      onClick={() => setCategorySearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  )}
                </div>
                <div className="flex justify-between mb-2">
                  <button
                    onClick={handleSelectAllCategories}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {localFilters.categories.length ===
                    uniqueCategoryDisplayNames.length
                      ? "Clear All Categories"
                      : "Select All Categories"}
                  </button>
                  <span className="text-xs text-gray-500">
                    {filteredCategoryDisplayNames.length} categories
                  </span>
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto pr-1">
                {filteredCategoryDisplayNames.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No categories found matching "{categorySearch}"
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {filteredCategoryDisplayNames.map((category, index) => (
                      <label
                        key={index}
                        className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={localFilters.categories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors"
                        />
                        <span
                          className={`text-sm group-hover:text-[#06EAFC] transition-colors truncate ${
                            localFilters.categories.includes(category)
                              ? "text-green-700 font-medium"
                              : "text-gray-700"
                          }`}
                          style={{
                            flex: 1,
                          }}
                        >
                          {category}
                        </span>
                        {localFilters.categories.includes(category) && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="text-sm text-green-600"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {localFilters.categories.length > 0 && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-800">
                    Selected: {localFilters.categories.slice(0, 3).join(", ")}
                    {localFilters.categories.length > 3 &&
                      ` +${localFilters.categories.length - 3} more`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PRICE RANGE SECTION */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center mb-3"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faDollarSign} className="text-yellow-500" />
            <h4 className="font-semibold text-gray-900 text-base">
              Price Range
            </h4>
            {(localFilters.priceRange.min || localFilters.priceRange.max) && (
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                Set
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.price ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.price && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    #
                  </span>
                  <input
                    type="number"
                    placeholder="2,500"
                    value={localFilters.priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <span className="text-gray-500 font-medium mt-6 text-sm">to</span>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    #
                  </span>
                  <input
                    type="number"
                    placeholder="50,000"
                    value={localFilters.priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
            {(localFilters.priceRange.min || localFilters.priceRange.max) && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...localFilters,
                      priceRange: { min: "", max: "" },
                    };
                    setLocalFilters(updatedFilters);

                    // For desktop non-modal, apply immediately
                    if (!isMobileModal && !isDesktopModal && !isMobile) {
                      onFilterChange(updatedFilters);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Price Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RATING SECTION */}
      <div className="border-b pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex justify-between items-center mb-3"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
            <h4 className="font-semibold text-gray-900 text-base">
              Minimum Rating
            </h4>
            {localFilters.ratings.length > 0 && (
              <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">
                {localFilters.ratings.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.rating ? faChevronUp : faChevronDown}
            className="text-gray-400"
          />
        </button>

        {expandedSections.rating && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label
                key={stars}
                className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={localFilters.ratings.includes(stars)}
                  onChange={() => handleRatingChange(stars)}
                  className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 transition-colors"
                />
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-sm ${
                          i < stars ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-sm group-hover:text-[#06EAFC] transition-colors ${
                      localFilters.ratings.includes(stars)
                        ? "text-yellow-700 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {stars}+ stars
                  </span>
                </div>
              </label>
            ))}
            {localFilters.ratings.length > 0 && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...localFilters,
                      ratings: [],
                    };
                    setLocalFilters(updatedFilters);

                    // For desktop non-modal, apply immediately
                    if (!isMobileModal && !isDesktopModal && !isMobile) {
                      onFilterChange(updatedFilters);
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Ratings
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Modal - Fullscreen
  if (isMobileModal) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000000] bg-white"
        style={{
          zIndex: 1000000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
        }}
      >
        <div
          className="h-full overflow-y-auto w-full"
          style={{ paddingLeft: "0", paddingRight: "0" }}
        >
          {/* Main content with minimal padding */}
          <div
            className="pt-5"
            style={{
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              maxWidth: "100vw",
            }}
          >
            {sidebarContent}
          </div>

          {/* Mobile Action Buttons */}
          <div
            className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            style={{
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
            }}
          >
            <button
              onClick={handleApplyFilters}
              className="w-full px-4 py-3.5 text-base font-bold bg-[#06EAFC] text-white rounded-xl hover:bg-[#05d9eb] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              style={{
                fontSize: "16px",
              }}
            >
              <FontAwesomeIcon icon={faCheck} className="text-base" />
              Apply Filter
            </button>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }

  // Desktop Modal - Fullscreen
  if (isDesktopModal) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000000] bg-white"
        style={{
          zIndex: 1000000,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="container mx-auto px-4 py-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Filter & Sort
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Refine your search results
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xl"
                  aria-label="Close filters"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            {sidebarContent}

            {/* Modal Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg mt-8">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-3 text-sm font-medium bg-[#06EAFC] text-white rounded-xl hover:bg-[#05d9eb] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} />
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </motion.div>,
      document.body
    );
  }

  // Regular sidebar (not modal) - NO APPLY BUTTON for desktop
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
      {sidebarContent}
      {/* NO Apply button for desktop - filters apply immediately */}
    </div>
  );
};

// ---------------- CategorySection Component ----------------
const CategorySection = ({ title, items, sectionId, isMobile, category }) => {
  const navigate = useNavigate();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
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

  const categorySlug = getCategoryFromTitle(title);

  // Check scroll position to update arrow states
  const checkScrollPosition = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeftArrow(scrollLeft > 0);
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
    setShowRightArrow(!isAtEnd);
  };

  // Initialize and add scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      checkScrollPosition();
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [items.length, isMobile]);

  const scrollSection = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = isMobile ? 165 + 4 : 210 + 8;
    const cardsToScroll = isMobile ? 3 : 3;
    const scrollAmount = cardWidth * cardsToScroll;

    const newPosition =
      direction === "next"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setTimeout(checkScrollPosition, 300);
  };

  const handleCategoryClick = () => {
    navigate(`/category/${categorySlug}`);
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
          {/* Left arrow */}
          <button
            onClick={() => scrollSection("prev")}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
              showLeftArrow
                ? "bg-[#D9D9D9] hover:bg-gray-300 cursor-pointer"
                : "bg-gray-100 cursor-not-allowed"
            }`}
            disabled={!showLeftArrow}
          >
            <FaLessThan
              className={`text-[10px] ${
                showLeftArrow ? "text-gray-600" : "text-gray-400"
              }`}
            />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scrollSection("next")}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
              showRightArrow
                ? "bg-[#D9D9D9] hover:bg-gray-300 cursor-pointer"
                : "bg-gray-100 cursor-not-allowed"
            }`}
            disabled={!showRightArrow}
          >
            <FaGreaterThan
              className={`text-[10px] ${
                showRightArrow ? "text-gray-600" : "text-gray-400"
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
            isMobile ? "gap-1 pl-0" : "gap-2"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingRight: "8px",
          }}
        >
          {items.map((item, index) => (
            <SearchResultBusinessCard
              key={item.id || index}
              item={item}
              category={category || sectionId.replace("-section", "")}
              isMobile={isMobile}
            />
          ))}
          {/* Spacer for last card visibility */}
          <div className="flex-shrink-0" style={{ width: "8px" }}></div>
        </div>
      </div>
    </section>
  );
};

// ================== FILTER PILL ==================
const FilterPill = ({ type, label, value, onRemove }) => {
  const getPillColor = (type) => {
    switch (type) {
      case "location":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "category":
        return "bg-green-100 text-green-800 border-green-200";
      case "price":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rating":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "location":
        return faMapMarkerAlt;
      case "category":
        return faFilter;
      case "price":
        return faDollarSign;
      case "rating":
        return faStar;
      default:
        return faFilter;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${getPillColor(
        type
      )} text-sm`}
    >
      <FontAwesomeIcon icon={getIcon(type)} className="text-xs" />
      <span>
        {label}: {value}
      </span>
      <button
        onClick={onRemove}
        className="ml-1 hover:opacity-70 transition-opacity"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </div>
  );
};

// ================== MAIN SEARCHRESULTS COMPONENT ==================
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = searchParams.get("q") || "";
  const [activeFilters, setActiveFilters] = useState({
    locations: [],
    categories: [],
    priceRange: { min: "", max: "" },
    ratings: [],
    sortBy: "relevance",
    amenities: [],
  });

  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [filteredListings, setFilteredListings] = useState([]);
  const [groupedListings, setGroupedListings] = useState({});
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchContainerRef = useRef(null);
  const filterButtonRef = useRef(null);
  const resultsRef = useRef(null);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // CRITICAL FIX 1: Scroll to top on component mount and when search params change
  useEffect(() => {
    const scrollToTop = () => {
      const searchSection = document.getElementById("search-section");
      if (searchSection) {
        searchSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    };

    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  // Handle mobile filter apply with auto-scroll
  const handleMobileFilterApply = useCallback(() => {
    if (showMobileFilters) {
      setShowMobileFilters(false);

      setTimeout(() => {
        const searchSection = document.getElementById("search-section");
        if (searchSection) {
          searchSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300);
    }
  }, [showMobileFilters]);

  useEffect(() => {
    if (listings.length > 0) {
      const locations = [
        ...new Set(listings.map((item) => item.area).filter(Boolean)),
      ];
      const categories = [
        ...new Set(listings.map((item) => item.category).filter(Boolean)),
      ];
      setAllLocations(locations);
      setAllCategories(categories);
    }
  }, [listings]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Initialize filters from URL parameters
  useEffect(() => {
    if (!listings.length) return;

    const initialFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };

    // Collect all location parameters
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Collect all category parameters
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
    }

    // Set locations from URL params
    if (locationParams.length > 0) {
      initialFilters.locations = [...new Set(locationParams)];
    }

    // Set categories from URL params
    if (categoryParams.length > 0) {
      initialFilters.categories = [...new Set(categoryParams)];
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
  }, [listings.length, searchParams.toString()]);

  // Filter logic
  const applyFilters = (listingsToFilter, filters) => {
    let filtered = [...listingsToFilter];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesLocation = item.area?.toLowerCase().includes(query);
        const matchesDescription = item.description
          ?.toLowerCase()
          .includes(query);

        return (
          matchesName ||
          matchesCategory ||
          matchesLocation ||
          matchesDescription
        );
      });
    }

    // Get all location parameters from URL
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Get all category parameters from URL
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
    }

    // Apply locations from URL
    if (locationParams.length > 0) {
      filtered = filtered.filter((item) => {
        const itemLocation = getLocationDisplayName(item.area || "");
        return locationParams.some(
          (loc) => itemLocation.toLowerCase() === loc.toLowerCase()
        );
      });
    }

    // Apply categories from URL
    if (categoryParams.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = getCategoryDisplayName(item.category || "");
        return categoryParams.some(
          (cat) => itemCategory.toLowerCase() === cat.toLowerCase()
        );
      });
    }

    // Apply filter panel locations
    if (filters.locations.length > 0) {
      filtered = filtered.filter((item) => {
        const itemLocation = getLocationDisplayName(item.area || "");
        return filters.locations.some(
          (selectedLocation) =>
            itemLocation.toLowerCase() === selectedLocation.toLowerCase()
        );
      });
    }

    // Apply filter panel categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = getCategoryDisplayName(item.category || "");
        return filters.categories.some(
          (selectedCategory) =>
            itemCategory.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    // Apply price range
    if (filters.priceRange.min || filters.priceRange.max) {
      const min = Number(filters.priceRange.min) || 0;
      const max = Number(filters.priceRange.max) || Infinity;
      filtered = filtered.filter((item) => {
        const price = Number(item.price_from) || 0;
        return price >= min && price <= max;
      });
    }

    // Apply ratings
    if (filters.ratings.length > 0) {
      filtered = filtered.filter((item) => {
        const rating = Number(item.rating) || 0;
        return filters.ratings.some((stars) => rating >= stars);
      });
    }

    // Apply sorting
    if (filters.sortBy && filters.sortBy !== "relevance") {
      filtered = [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case "price_low":
            return (Number(a.price_from) || 0) - (Number(b.price_from) || 0);
          case "price_high":
            return (Number(b.price_from) || 0) - (Number(a.price_from) || 0);
          case "rating":
            return (Number(b.rating) || 0) - (Number(a.rating) || 0);
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          default:
            return 0;
        }
      });
    }

    setFilteredListings(filtered);
    setFilteredCount(filtered.length);
    setCurrentPage(1);

    // Group by category for browsing view
    const grouped = {};
    filtered.forEach((item) => {
      const cat = getCategoryDisplayName(item.category || "Other");
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    });
    setGroupedListings(grouped);
  };

  // Apply filters whenever any dependency changes
  useEffect(() => {
    if (!listings.length || !filtersInitialized) {
      setFilteredListings([]);
      setFilteredCount(0);
      setGroupedListings({});
      return;
    }

    applyFilters(listings, activeFilters);
  }, [
    listings,
    searchQuery,
    searchParams.toString(),
    activeFilters,
    filtersInitialized,
  ]);

  // Handle dynamic filter application
  const handleDynamicFilterApply = ({
    filters,
    categories = [],
    locations = [],
    keepSearchQuery,
  }) => {
    const params = new URLSearchParams();

    // Always keep the search query if present
    if (keepSearchQuery && searchQuery) {
      params.set("q", searchQuery);
    }

    // Clear previous category parameters
    for (const [key] of params.entries()) {
      if (key.startsWith("category")) {
        params.delete(key);
      }
    }

    // Add categories to params
    categories.forEach((category, index) => {
      if (index === 0) {
        params.set("category", category);
      } else {
        params.set(`category${index + 1}`, category);
      }
    });

    // Clear previous location parameters
    for (const [key] of params.entries()) {
      if (key.startsWith("location")) {
        params.delete(key);
      }
    }

    // Add locations to params
    locations.forEach((location, index) => {
      if (index === 0) {
        params.set("location", location);
      } else {
        params.set(`location${index + 1}`, location);
      }
    });

    // Update URL
    setSearchParams(params);
    setActiveFilters(filters);
  };

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
  };

  // CRITICAL FIX 2: Prevent image width change when clearing search on desktop
  const handleClearSearch = () => {
    setLocalSearchQuery("");
    const params = new URLSearchParams();
    // Preserve filter parameters when clearing search
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location") || key.startsWith("category")) {
        params.set(key, value);
      }
    }
    setSearchParams(params);
    // Fix: Don't trigger unnecessary re-renders that affect image width
    setTimeout(() => {
      const searchInput = document.querySelector('input[role="searchbox"]');
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", localSearchQuery.trim());
      setSearchParams(params);
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const toggleDesktopFilters = () => {
    setShowDesktopFilters(!showDesktopFilters);
  };

  // Filter change handler - applies immediately for desktop
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);

    // For desktop, apply filters immediately by updating URL
    if (!isMobile) {
      const hasCategoryFilters = newFilters.categories.length > 0;
      const hasLocationFilters = newFilters.locations.length > 0;

      let categoryParams = [];
      if (hasCategoryFilters) {
        newFilters.categories.forEach((catDisplayName) => {
          const selectedCategory = allCategories.find(
            (cat) => getCategoryDisplayName(cat) === catDisplayName
          );
          if (selectedCategory) {
            categoryParams.push(selectedCategory);
          }
        });
      }

      let locationParams = [];
      if (hasLocationFilters) {
        newFilters.locations.forEach((locDisplayName) => {
          const selectedLocation = allLocations.find(
            (loc) => getLocationDisplayName(loc) === locDisplayName
          );
          if (selectedLocation) {
            locationParams.push(selectedLocation);
          }
        });
      }

      const params = new URLSearchParams();
      if (searchQuery) {
        params.set("q", searchQuery);
      }

      // Clear previous category parameters
      for (const [key] of params.entries()) {
        if (key.startsWith("category")) {
          params.delete(key);
        }
      }

      // Add categories to params
      categoryParams.forEach((category, index) => {
        if (index === 0) {
          params.set("category", category);
        } else {
          params.set(`category${index + 1}`, category);
        }
      });

      // Clear previous location parameters
      for (const [key] of params.entries()) {
        if (key.startsWith("location")) {
          params.delete(key);
        }
      }

      // Add locations to params
      locationParams.forEach((location, index) => {
        if (index === 0) {
          params.set("location", location);
        } else {
          params.set(`location${index + 1}`, location);
        }
      });

      setSearchParams(params);
    }
  };

  const clearAllFilters = () => {
    const resetFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };
    setActiveFilters(resetFilters);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    setSearchParams(params);
  };

  const getPageTitle = () => {
    // Get all location parameters
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Get all category parameters
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
    }

    if (searchQuery) {
      if (locationParams.length > 0 || categoryParams.length > 0) {
        let parts = [];
        if (categoryParams.length > 0) parts.push(categoryParams.join(", "));
        if (locationParams.length > 0) parts.push(locationParams.join(", "));

        return `Search Results for "${searchQuery}" in ${parts.join(" • ")}`;
      }
      return `Search Results for "${searchQuery}"`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `${categoriesText} in ${locationParams.join(", ")}`;
      }
      return `${categoriesText} in Ibadan`;
    } else if (locationParams.length > 0) {
      return `Places in ${locationParams.join(", ")}`;
    } else if (
      activeFilters.locations.length > 0 ||
      activeFilters.categories.length > 0
    ) {
      const parts = [];
      if (activeFilters.categories.length > 0)
        parts.push(activeFilters.categories.join(", "));
      if (activeFilters.locations.length > 0)
        parts.push(activeFilters.locations.join(", "));
      return `Places in ${parts.join(" • ")}`;
    } else {
      return "All Places in Ibadan";
    }
  };

  const getPageDescription = () => {
    // Get all location parameters
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Get all category parameters
    const categoryParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("category")) {
        const displayName = getCategoryDisplayName(value);
        if (displayName !== "All Categories" && displayName !== "All") {
          categoryParams.push(displayName);
        }
      }
    }

    if (searchQuery) {
      if (locationParams.length > 0 || categoryParams.length > 0) {
        let parts = [];
        if (categoryParams.length > 0) parts.push(categoryParams.join(", "));
        if (locationParams.length > 0) parts.push(locationParams.join(", "));

        return `Find the best places in ${parts.join(
          " • "
        )} matching "${searchQuery}". Search results include hotels, restaurants, shortlets, tourist attractions, and more.`;
      }
      return `Find the best places in Ibadan matching "${searchQuery}". Search results include hotels, restaurants, shortlets, tourist attractions, and more.`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `Browse the best ${categoriesText.toLowerCase()} places in ${locationParams.join(
          ", "
        )}, Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
      }
      return `Browse the best ${categoriesText.toLowerCase()} places in Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
    } else if (locationParams.length > 0) {
      return `Discover amazing places in ${locationParams.join(
        ", "
      )}, Ibadan. Find restaurants, hotels, attractions, and more in these areas.`;
    } else if (
      activeFilters.locations.length > 0 ||
      activeFilters.categories.length > 0
    ) {
      const parts = [];
      if (activeFilters.categories.length > 0)
        parts.push(activeFilters.categories.join(", "));
      if (activeFilters.locations.length > 0)
        parts.push(activeFilters.locations.join(", "));
      return `Discover amazing places in ${parts.join(
        " • "
      )}, Ibadan. Find restaurants, hotels, attractions, and more in these areas.`;
    } else {
      return "Browse all places in Ibadan. Find hotels, restaurants, shortlets, tourist attractions, cafes, bars, services, events, and halls.";
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDesktopFilters &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target) &&
        !event.target.closest(".filter-modal-content")
      ) {
        setShowDesktopFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDesktopFilters]);

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentListings = filteredListings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // CRITICAL FIX: Loading state for mobile (hide header)
  if (loading && isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* Only show three dots animation */}
        <div className="flex flex-col items-center">
          <div className="flex space-x-1 mb-4">
            <div className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-[#06EAFC] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
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
        title={`${getPageTitle()} | Ajani Directory`}
        description={getPageDescription()}
        url={`https://ajani.ai/search-results?${searchParams.toString()}`}
        image="https://ajani.ai/images/search-og.jpg"
      />

      {/* Hide Header on mobile only */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main
        className="pb-8 md:mt-14"
        style={{
          paddingLeft: isMobile ? "0.75rem" : "1rem", // FIX: Add padding for LG screens
          paddingRight: isMobile ? "0.75rem" : "1rem", // FIX: Add padding for LG screens
        }}
      >
        {/* Fixed Search Bar Container with Back Button */}
        <div
          className={`
            relative 
            ${isMobile ? "sticky top-0 bg-gray-50 z-50 pt-4 pb-3" : "z-30 py-6"}
          `}
          style={{
            zIndex: isMobile ? 50 : 50,
            width: "100%",
            marginLeft: "0",
            marginRight: "0",
            paddingLeft: isMobile ? "0" : "0",
            paddingRight: isMobile ? "0" : "0",
          }}
          id="search-section"
        >
          <div
            style={{
              paddingLeft: isMobile ? "0" : "0",
              paddingRight: isMobile ? "0" : "0",
            }}
          >
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <BackButton className={isMobile ? "flex" : "hidden"} />

              <div className="flex-1">
                <div className="flex justify-center">
                  <div
                    className="w-full relative"
                    ref={searchContainerRef}
                    style={{
                      width: "100%",
                    }}
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <div className="flex items-center">
                        <div
                          className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-40"
                          style={{
                            width: "100%",
                          }}
                        >
                          <div className="pl-3 sm:pl-4 text-gray-500">
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="h-4 w-4"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Search by area, category, or name..."
                            value={localSearchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope"
                            autoFocus={false}
                            aria-label="Search input"
                            role="searchbox"
                            style={{
                              width: "100%",
                            }}
                          />
                          {localSearchQuery && (
                            <button
                              type="button"
                              onClick={handleClearSearch}
                              className="p-1 mr-2 text-gray-500 hover:text-gray-700 transition-colors"
                              aria-label="Clear search"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="h-4 w-4"
                              />
                            </button>
                          )}
                        </div>

                        <div className="ml-2">
                          <button
                            type="submit"
                            className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-2.5 px-4 sm:px-6 text-sm transition-colors duration-200 whitespace-nowrap font-manrope"
                            aria-label="Perform search"
                          >
                            Search
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Filter Modal */}
        {!isMobile && showDesktopFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onDynamicFilterApply={handleDynamicFilterApply}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            onClose={() => setShowDesktopFilters(false)}
            isDesktopModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
          />
        )}

        {/* Mobile Filter Modal */}
        {isMobile && showMobileFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onDynamicFilterApply={(data) => {
              handleDynamicFilterApply(data);
              handleMobileFilterApply();
            }}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            onClose={handleMobileFilterApply}
            isMobileModal={true}
            isInitialized={filtersInitialized}
            isMobile={isMobile}
          />
        )}

        {/* Main Content Layout */}
        <div
          className="flex flex-col lg:flex-row gap-6"
          style={{
            width: "100%",
            marginLeft: "0",
            marginRight: "0",
            paddingLeft: "0",
            paddingRight: "0",
          }}
        >
          {/* Desktop Filter Sidebar */}
          {!isMobile && filtersInitialized && (
            <div className="lg:w-1/4">
              <FilterSidebar
                onFilterChange={handleFilterChange}
                onDynamicFilterApply={handleDynamicFilterApply}
                allLocations={allLocations}
                allCategories={allCategories}
                currentFilters={activeFilters}
                currentSearchQuery={searchQuery}
                isInitialized={filtersInitialized}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Results Content */}
          <div
            className="lg:w-3/4"
            ref={resultsRef}
            style={{
              width: "100%",
              paddingLeft: isMobile ? "0" : "0",
              paddingRight: isMobile ? "0" : "0",
            }}
          >
            {/* Page Header with Filter Button and Sort Dropdown on LG */}
            <div
              className="mb-6"
              style={{ paddingLeft: "0", paddingRight: "0" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-3">
                  {/* Mobile filter button */}
                  {isMobile && filtersInitialized && (
                    <button
                      onClick={toggleMobileFilters}
                      className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                      aria-label="Open filters"
                    >
                      <div className="relative">
                        <PiSliders className="text-gray-600 text-lg" />
                        {Object.keys(activeFilters).some((key) => {
                          if (key === "priceRange") {
                            return (
                              activeFilters.priceRange.min ||
                              activeFilters.priceRange.max
                            );
                          }
                          return Array.isArray(activeFilters[key])
                            ? activeFilters[key].length > 0
                            : activeFilters[key] !== "relevance";
                        }) && (
                          <span className="absolute -top-1 -right-1 bg-[#06EAFC] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                            {Object.values(activeFilters).reduce((acc, val) => {
                              if (Array.isArray(val)) return acc + val.length;
                              if (typeof val === "object" && val !== null) {
                                return acc + (val.min || val.max ? 1 : 0);
                              }
                              return acc + (val && val !== "relevance" ? 1 : 0);
                            }, 0)}
                          </span>
                        )}
                      </div>
                    </button>
                  )}

                  {/* Title and Count */}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-[#00065A] mb-1">
                      {getPageTitle()}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {filteredCount} {filteredCount === 1 ? "place" : "places"}{" "}
                      found
                    </p>
                  </div>
                </div>

                {/* Sort By Dropdown - Only on mobile and LG screens */}
                {(isMobile || window.innerWidth >= 1024) &&
                  filtersInitialized && (
                    <div className="flex items-center gap-2">
                      {/* LG Screen: Sort dropdown at far right edge, no background */}
                      {!isMobile && (
                        <div className="relative">
                          <select
                            value={activeFilters.sortBy}
                            onChange={(e) => {
                              const updatedFilters = {
                                ...activeFilters,
                                sortBy: e.target.value,
                              };
                              handleFilterChange(updatedFilters);
                            }}
                            className="appearance-none px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-0 cursor-pointer pr-8 bg-transparent border-0"
                            style={{
                              background: "transparent",
                              border: "none",
                              boxShadow: "none",
                            }}
                          >
                            <option value="relevance">
                              Sort by: Relevance
                            </option>
                            <option value="price_low">
                              Price: Low to High
                            </option>
                            <option value="price_high">
                              Price: High to Low
                            </option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name: A to Z</option>
                          </select>
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="text-gray-500 text-xs"
                            />
                          </div>
                        </div>
                      )}

                      {/* Mobile: Regular dropdown */}
                      {isMobile && filtersInitialized && (
                        <div className="relative">
                          <select
                            value={activeFilters.sortBy}
                            onChange={(e) => {
                              const updatedFilters = {
                                ...activeFilters,
                                sortBy: e.target.value,
                              };
                              handleFilterChange(updatedFilters);
                            }}
                            className="appearance-none px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] transition-colors cursor-pointer pr-8"
                          >
                            <option value="relevance">
                              Sort by: Relevance
                            </option>
                            <option value="price_low">
                              Price: Low to High
                            </option>
                            <option value="price_high">
                              Price: High to Low
                            </option>
                            <option value="rating">Highest Rated</option>
                            <option value="name">Name: A to Z</option>
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="text-gray-500 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Results Display */}
            <div
              className="space-y-6"
              style={{
                width: "100%",
                paddingLeft: "0",
                paddingRight: "0",
              }}
            >
              {filteredCount === 0 && filtersInitialized && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-4xl text-gray-300 mb-4 block"
                  />
                  <h3 className="text-xl text-gray-800 mb-2">
                    No matching results found
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {searchQuery
                      ? `No places found for "${searchQuery}" with the selected filters.`
                      : "No places match your current filters."}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={clearAllFilters}
                      className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => {
                        if (isMobile) {
                          setShowMobileFilters(true);
                        } else {
                          setShowDesktopFilters(true);
                        }
                      }}
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Adjust Filters
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Tip: Try selecting fewer filters or different combinations
                  </p>
                </div>
              )}

              {filteredCount > 0 && filtersInitialized && (
                <>
                  {searchQuery ||
                  (() => {
                    // Check if there are any location or category parameters
                    for (const [key] of searchParams.entries()) {
                      if (
                        key.startsWith("location") ||
                        key.startsWith("category")
                      )
                        return true;
                    }
                    return false;
                  })() ? (
                    <>
                      {isMobile ? (
                        <div
                          className="space-y-4"
                          style={{ paddingLeft: "0", paddingRight: "0" }}
                        >
                          {Array.from({
                            length: Math.ceil(currentListings.length / 5),
                          }).map((_, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="flex overflow-x-auto scrollbar-hide gap-2 pb-4"
                              style={{
                                width: "100%",
                                paddingLeft: "0",
                                paddingRight: "8px",
                              }}
                            >
                              {currentListings
                                .slice(rowIndex * 5, (rowIndex + 1) * 5)
                                .map((listing, index) => (
                                  <SearchResultBusinessCard
                                    key={listing.id || `${rowIndex}-${index}`}
                                    item={listing}
                                    category={listing.category || "general"}
                                    isMobile={isMobile}
                                  />
                                ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                          style={{
                            width: "100%",
                          }}
                        >
                          {currentListings.map((listing, index) => (
                            <SearchResultBusinessCard
                              key={listing.id || index}
                              item={listing}
                              category={listing.category || "general"}
                              isMobile={isMobile}
                            />
                          ))}
                        </div>
                      )}

                      {totalPages > 1 && (
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
                            {Array.from(
                              { length: Math.min(totalPages, 5) },
                              (_, i) => i + 1
                            ).map((page) => (
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
                            ))}
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
                    </>
                  ) : (
                    /* Group by category for browsing */
                    Object.entries(groupedListings).map(([catName, items]) => {
                      const categorySlug = catName
                        .toLowerCase()
                        .replace(/\s+/g, "-");
                      const sectionId = `${categorySlug}-section`;

                      return (
                        <CategorySection
                          key={catName}
                          title={catName}
                          items={items}
                          sectionId={sectionId}
                          isMobile={isMobile}
                          category={catName}
                        />
                      );
                    })
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Custom styles */}
      <style jsx global>{`
        /* Ensure scroll to top works properly */
        html {
          scroll-behavior: smooth;
        }

        /* Fix for image width stability */
        img {
          max-width: 100%;
          height: auto;
          display: block;
        }

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

        /* Additional styles for mobile */
        @media (max-width: 767px) {
          .sticky {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: #f9fafb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          /* Reduced padding for mobile */
          main {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }

        /* LG screen sort dropdown styling */
        @media (min-width: 1024px) {
          select.bg-transparent {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          select.bg-transparent:hover {
            color: #00065a;
          }
        }

        /* LG screen padding */
        @media (min-width: 768px) {
          main {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResults;
