// src/pages/CategoryResults.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faFilter,
  faSearch,
  faTimes,
  faMapMarkerAlt,
  faChevronDown,
  faChevronUp,
  faDollarSign,
  faCheck,
  faChevronRight,
  faTimesCircle,
  faBed,
  faHome,
  faCalendarWeek,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { MdFavoriteBorder } from "react-icons/md";
import { PiSliders } from "react-icons/pi";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

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

// Helper function for capitalizing
const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

// Helper function to get card images
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

// Helper function to get category breakdown by location
const getCategoryBreakdownByLocation = (listings) => {
  const categoryCounts = {};
  listings.forEach((item) => {
    const category = getCategoryDisplayName(item.category || "other.other");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
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

// ================== ENHANCED BUSINESS CARD WITH FAVORITES ==================
const SearchResultBusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if this item is already saved on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
    const isAlreadySaved = saved.some((savedItem) => savedItem.id === item.id);
    setIsFavorite(isAlreadySaved);
  }, [item.id]);

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Proper price text based on category
  const getPriceText = () => {
    const priceFrom = item.price_from || item.price || "0";
    const formattedPrice = formatPrice(priceFrom);

    // Categories that show "for 2 nights"
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
      return `₦${formattedPrice}`;
    }

    // Other categories show "per guest" or "per meal"
    if (
      category.toLowerCase().includes("restaurant") ||
      category.toLowerCase().includes("food") ||
      category.toLowerCase().includes("cafe")
    ) {
      return `₦${formattedPrice}`;
    }

    return `₦${formattedPrice}`;
  };

  // Get the per text (for 2 nights, per guest, per meal)
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
  const location = item.area || item.location || "Ibadan";
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
  const showToast = (message, type = "success") => {
    // Remove any existing toast
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed z-50 px-4 py-3 rounded-lg shadow-lg border ${
      type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-blue-50 border-blue-200 text-blue-800"
    }`;

    // Position toast lower - 15px for mobile, 15px for desktop
    toast.style.top = isMobile ? "15px" : "15px";
    toast.style.right = "15px";
    toast.style.maxWidth = "320px";
    toast.style.animation = "slideInRight 0.3s ease-out forwards";

    // Toast content
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
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideOutRight 0.3s ease-in forwards";
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  };

  // Full handleFavoriteClick Function (saves to saved listings)
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking heart

    // Get existing saved listings from localStorage
    const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");

    // Check if this item is already saved
    const isAlreadySaved = saved.some((savedItem) => savedItem.id === item.id);

    if (isAlreadySaved) {
      // REMOVE FROM SAVED
      const updated = saved.filter((savedItem) => savedItem.id !== item.id);
      localStorage.setItem("userSavedListings", JSON.stringify(updated));
      setIsFavorite(false); // Update React state

      // Show toast notification
      showToast("Removed from saved listings", "info");

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent("savedListingsUpdated", {
          detail: { action: "removed", itemId: item.id },
        })
      );
    } else {
      // ADD TO SAVED
      const listingToSave = {
        id: item.id || `listing_${Date.now()}`,
        name: businessName,
        price: priceText,
        perText: perText,
        rating: parseFloat(rating),
        tag: "Guest Favorite",
        image: images[0] || FALLBACK_IMAGES.default,
        category: capitalizeFirst(category) || "Business",
        location: location,
        savedDate: new Date().toISOString().split("T")[0],
        // Keep original data
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
      setIsFavorite(true); // Update React state

      // Show toast notification
      showToast("Added to saved listings!", "success");

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent("savedListingsUpdated", {
          detail: { action: "added", item: listingToSave },
        })
      );
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope relative group
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
          alt={businessName}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null; // Prevent infinite loop
          }}
          loading="lazy"
        />

        {/* Guest favorite badge */}
        <div className="absolute top-2 left-2 bg-white px-1.5 py-1 rounded-md shadow-sm flex items-center gap-1">
          <span className="text-[9px] font-semibold text-gray-900">
            Guest favorite
          </span>
        </div>

        {/* Heart icon - Updated with better styling */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 ${
            isFavorite
              ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-white/90 hover:bg-white backdrop-blur-sm"
          }`}
          title={isFavorite ? "Remove from saved" : "Add to saved"}
          aria-label={isFavorite ? "Remove from saved" : "Save this listing"}
        >
          {isFavorite ? (
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
      <div className={`${isMobile ? "p-1.5" : "p-2.5"} flex flex-col gap-0.5`}>
        <h3
          className={`
            font-semibold text-gray-900 
            leading-tight line-clamp-2 
            ${isMobile ? "text-xs" : "text-sm"}
          `}
        >
          {businessName}
        </h3>

        <div className="text-gray-600">
          <p className={`${isMobile ? "text-[9px]" : "text-xs"} line-clamp-1`}>
            {location}
          </p>
        </div>

        {/* Combined Price, Per Text, and Ratings on same line */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Price and Per Text */}
            <div className="flex items-baseline gap-1">
              <span
                className={`${
                  isMobile ? "text-xs" : "text-xs"
                } font-manrope text-gray-900`}
              >
                {priceText}
              </span>
              <span
                className={`${
                  isMobile ? "text-[9px]" : "text-xs"
                } text-gray-600`}
              >
                {perText}
              </span>
            </div>
          </div>

          {/* Ratings on the right */}
          <div className="flex items-center gap-1">
            <div
              className={`
                flex items-center gap-1 text-gray-800 
                ${isMobile ? "text-[9px]" : "text-xs"}
              `}
            >
              {/* BLACK STAR */}
              <FontAwesomeIcon
                icon={faStar}
                className={`${isMobile ? "text-[9px]" : "text-xs"} text-black`}
              />
              <span className="font-semibold text-black">{rating}</span>
            </div>
          </div>
        </div>

        {/* Bottom row: Category tag and Saved indicator */}
        <div className="flex items-center justify-between mt-1">
          {/* Category tag */}
          <div>
            <span className="inline-block text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              {capitalizeFirst(category)}
            </span>
          </div>

          {/* Saved indicator badge - Shows "Saved" when favorited */}
          {isFavorite && (
            <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
    </div>
  );
};

// ================== CATEGORY BREAKDOWN BADGES COMPONENT ==================
const CategoryBreakdownBadges = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  // Limit to top 3 categories for display
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

// ================== MOBILE SEARCH MODAL ==================
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  categoryTitle,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = React.useMemo(() => {
    if (!inputValue.trim() || !listings.length) return [];

    const query = inputValue.toLowerCase().trim();
    const suggestions = [];

    const uniqueCategories = [
      ...new Set(
        listings
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== "")
          .map((cat) => cat.trim())
      ),
    ];

    const uniqueLocations = [
      ...new Set(
        listings
          .map((item) => item.area)
          .filter((loc) => loc && loc.trim() !== "")
          .map((loc) => loc.trim())
      ),
    ];

    const categoryMatches = uniqueCategories
      .filter((category) => {
        const displayName = getCategoryDisplayName(category).toLowerCase();
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );
        const locationBreakdown = getLocationBreakdown(categoryListings);

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          locations: locationBreakdown,
          action: `/search-results?category=${encodeURIComponent(category)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = getLocationDisplayName(location).toLowerCase();
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );
        const categoryBreakdown = getCategoryBreakdownForLocation(
          listings,
          location
        );

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          categories: categoryBreakdown,
          action: `/search-results?location=${encodeURIComponent(location)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const allSuggestions = [...categoryMatches, ...locationMatches];

    return allSuggestions
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return b.count - a.count;
      })
      .slice(0, 6);
  }, [inputValue, listings]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onTyping(value);
  };

  const handleClearInput = () => {
    setInputValue("");
    onTyping("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onSuggestionClick(
        `/search-results?q=${encodeURIComponent(inputValue.trim())}`
      );
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest(".fixed.z-50") // Prevent conflict with toast
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible, onClose]);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000000]"
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
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="absolute inset-0 bg-white flex flex-col"
        ref={modalRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Search</h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 font-medium px-3 py-1"
                aria-label="Close search"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent ml-3 py-1 outline-none font-manrope text-base placeholder:text-gray-500"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Search ${categoryTitle} in Ibadan...`}
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4">
          {inputValue.trim() ? (
            <>
              <div className="sticky top-0 p-4 border-b border-gray-100 bg-gray-50 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Quick search suggestions
                  </span>
                  {suggestions.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {suggestions.length} suggestions
                    </span>
                  )}
                </div>
              </div>

              {suggestions.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors group"
                      onClick={() => {
                        onSuggestionClick(suggestion.action);
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <FontAwesomeIcon
                              icon={
                                suggestion.type === "category"
                                  ? faFilter
                                  : faMapMarkerAlt
                              }
                              className={`text-sm ${
                                suggestion.type === "category"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-gray-900">
                                {suggestion.title}
                              </h3>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {suggestion.count}{" "}
                                {suggestion.count === 1 ? "place" : "places"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {/* Category Breakdown for Location Suggestions */}
                      {suggestion.type === "location" &&
                        suggestion.categories &&
                        suggestion.categories.length > 0 && (
                          <div className="ml-12 mt-3">
                            <CategoryBreakdownBadges
                              categories={suggestion.categories}
                            />
                          </div>
                        )}

                      <div className="ml-12 mt-3">
                        <span className="text-xs text-blue-600 font-medium">
                          Tap to view all results →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="h-12 w-12 mx-auto mb-4 text-gray-300"
                  />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    No matches found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="h-16 w-16 mx-auto mb-6 text-gray-300"
              />
              <p className="text-xl font-medium text-gray-700 mb-2">
                Start typing to search
              </p>
              <p className="text-sm text-gray-500">
                Search for {categoryTitle.toLowerCase()} in Ibadan
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// ================== DESKTOP SEARCH SUGGESTIONS ==================
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
}) => {
  const suggestionsRef = useRef(null);
  const [modalStyle, setModalStyle] = useState({
    top: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "600px",
  });

  const suggestions = React.useMemo(() => {
    if (!searchQuery.trim() || !listings.length) return [];

    const query = searchQuery.toLowerCase().trim();
    const suggestions = [];

    const uniqueCategories = [
      ...new Set(
        listings
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== "")
          .map((cat) => cat.trim())
      ),
    ];

    const uniqueLocations = [
      ...new Set(
        listings
          .map((item) => item.area)
          .filter((loc) => loc && loc.trim() !== "")
          .map((loc) => loc.trim())
      ),
    ];

    const categoryMatches = uniqueCategories
      .filter((category) => {
        const displayName = getCategoryDisplayName(category).toLowerCase();
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          categoryValue: category,
          action: `/search-results?category=${encodeURIComponent(category)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = getLocationDisplayName(location).toLowerCase();
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );
        const categoryBreakdown = getCategoryBreakdownForLocation(
          listings,
          location
        );

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          locationValue: location,
          categories: categoryBreakdown,
          action: `/search-results?location=${encodeURIComponent(location)}`,
        };
      })
      .sort((a, b) => b.count - a.count);

    const allSuggestions = [...categoryMatches, ...locationMatches];

    return allSuggestions
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return b.count - a.count;
      })
      .slice(0, 6);
  }, [searchQuery, listings]);

  // Dynamic positioning effect
  useEffect(() => {
    if (isVisible) {
      const searchInput = document.querySelector('input[role="searchbox"]');
      if (searchInput) {
        const rect = searchInput.getBoundingClientRect();
        const searchContainer = searchInput.closest(".flex.items-center");

        let newStyle = {
          top: `${rect.bottom + window.scrollY + 10}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "600px",
        };

        if (searchContainer) {
          const containerRect = searchContainer.getBoundingClientRect();
          newStyle.width = `${containerRect.width}px`;
          newStyle.left = `${rect.left}px`;
          newStyle.transform = "translateX(0)";
        }

        setModalStyle(newStyle);
      }
    }
  }, [isVisible, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
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

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, onClose]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        const searchInput = document.querySelector('input[role="searchbox"]');
        if (searchInput) {
          const rect = searchInput.getBoundingClientRect();
          const searchContainer = searchInput.closest(".flex.items-center");

          let newStyle = {
            top: `${rect.bottom + window.scrollY + 10}px`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "600px",
          };

          if (searchContainer) {
            const containerRect = searchContainer.getBoundingClientRect();
            newStyle.width = `${containerRect.width}px`;
            newStyle.left = `${rect.left}px`;
            newStyle.transform = "translateX(0)";
          }

          setModalStyle(newStyle);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        const searchInput = document.querySelector('input[role="searchbox"]');
        if (searchInput) {
          const rect = searchInput.getBoundingClientRect();
          setModalStyle((prev) => ({
            ...prev,
            top: `${rect.bottom + window.scrollY + 10}px`,
          }));
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  if (!isVisible || !searchQuery.trim() || suggestions.length === 0)
    return null;

  return createPortal(
    <div
      ref={suggestionsRef}
      className="fixed z-[999998] pointer-events-none"
      style={{
        zIndex: 999998,
        position: "fixed",
        ...modalStyle,
      }}
    >
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={onClose}
        style={{
          backdropFilter: "blur(2px)",
          borderRadius: "12px",
        }}
      />

      <div
        className="relative bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto max-h-[70vh] overflow-y-auto"
        style={{
          zIndex: 999999,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="sticky top-0 p-4 border-b border-gray-100 bg-gray-50 z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Quick search suggestions
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {suggestions.length} suggestions
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
              onClick={() => {
                onSuggestionClick(suggestion.action);
                onClose();
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FontAwesomeIcon
                      icon={
                        suggestion.type === "category"
                          ? faFilter
                          : faMapMarkerAlt
                      }
                      className={`text-sm ${
                        suggestion.type === "category"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">
                        {suggestion.title}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {suggestion.count}{" "}
                        {suggestion.count === 1 ? "place" : "places"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                </div>
              </div>

              {/* Category Breakdown for Location Suggestions */}
              {suggestion.type === "location" &&
                suggestion.categories &&
                suggestion.categories.length > 0 && (
                  <div className="ml-12 mt-3">
                    <CategoryBreakdownBadges
                      categories={suggestion.categories}
                    />
                  </div>
                )}

              <div className="ml-12 mt-3">
                <span className="text-xs text-blue-600 font-medium">
                  Click to view all results →
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd>{" "}
            to close • Click any suggestion to view detailed results
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ================== ENHANCED FILTER SIDEBAR (SEARCHABLE) - REAL-TIME FILTERING ==================
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
  categoryTitle = "",
}) => {
  const [filters, setFilters] = useState(
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
    category: true,
    price: true,
    rating: true,
    amenities: false,
    sort: false,
  });

  const [locationSearch, setLocationSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

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

  // Sync filters when currentFilters prop changes
  useEffect(() => {
    if (isInitialized && currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters, isInitialized]);

  // Real-time filter application
  const applyFiltersImmediately = (updatedFilters) => {
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);

    // Update URL if needed
    if (onDynamicFilterApply) {
      const hasCategoryFilters = updatedFilters.categories.length > 0;
      const hasLocationFilters = updatedFilters.locations.length > 0;

      // For categories, we need to handle multiple selections
      // We'll use category1, category2, etc. for multiple categories
      let categoryParams = [];

      if (hasCategoryFilters) {
        // Map display names back to original category values
        updatedFilters.categories.forEach((catDisplayName) => {
          const selectedCategory = allCategories.find(
            (cat) => getCategoryDisplayName(cat) === catDisplayName
          );
          if (selectedCategory) {
            categoryParams.push(selectedCategory);
          }
        });
      }

      // For locations
      let locationParams = [];
      if (hasLocationFilters) {
        updatedFilters.locations.forEach((locDisplayName) => {
          const selectedLocation = allLocations.find(
            (loc) => getLocationDisplayName(loc) === locDisplayName
          );
          if (selectedLocation) {
            locationParams.push(selectedLocation);
          }
        });
      }

      onDynamicFilterApply({
        filters: updatedFilters,
        categories: categoryParams, // Pass array of categories
        locations: locationParams, // Pass array of locations
        keepSearchQuery: currentSearchQuery,
      });
    }
  };

  const handleLocationChange = (location) => {
    const updatedFilters = {
      ...filters,
      locations: filters.locations.includes(location)
        ? filters.locations.filter((l) => l !== location)
        : [...filters.locations, location],
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handleCategoryChange = (category) => {
    const updatedFilters = {
      ...filters,
      categories: filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handleRatingChange = (stars) => {
    const updatedFilters = {
      ...filters,
      ratings: filters.ratings.includes(stars)
        ? filters.ratings.filter((s) => s !== stars)
        : [...filters.ratings, stars],
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handlePriceChange = (field, value) => {
    const updatedFilters = {
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [field]: value,
      },
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handleSortChange = (value) => {
    const updatedFilters = {
      ...filters,
      sortBy: value,
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handleSelectAllLocations = () => {
    const updatedFilters = {
      ...filters,
      locations:
        filters.locations.length === uniqueLocationDisplayNames.length
          ? []
          : [...uniqueLocationDisplayNames],
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handleSelectAllCategories = () => {
    const updatedFilters = {
      ...filters,
      categories:
        filters.categories.length === uniqueCategoryDisplayNames.length
          ? []
          : [...uniqueCategoryDisplayNames],
    };
    applyFiltersImmediately(updatedFilters);
  };

  const handleClearAllFilters = () => {
    const resetFilters = {
      locations: [],
      categories: [],
      priceRange: { min: "", max: "" },
      ratings: [],
      sortBy: "relevance",
      amenities: [],
    };
    setFilters(resetFilters);
    setLocationSearch("");
    setCategorySearch("");
    onFilterChange(resetFilters);

    if (onDynamicFilterApply) {
      onDynamicFilterApply({
        filters: resetFilters,
        categories: [],
        locations: [],
        keepSearchQuery: currentSearchQuery,
      });
    }
  };

  const sidebarContent = (
    <div
      className={`space-y-8 ${isMobileModal ? "px-0" : ""}`} // Removed horizontal padding for mobile modal
      style={{
        // Ensure content stretches to screen edges on mobile
        marginLeft: isMobileModal ? "-1rem" : "0",
        marginRight: isMobileModal ? "-1rem" : "0",
        paddingLeft: isMobileModal ? "1.5rem" : "0",
        paddingRight: isMobileModal ? "1.5rem" : "0",
      }}
    >
      {/* REMOVED DUPLICATE HEADING SECTION */}

      {/* LOCATION SECTION WITH SEARCH - WIDER ON MOBILE */}
      <div className="border-b pb-6">
        <button
          onClick={() => toggleSection("location")}
          className="w-full flex justify-between items-center mb-4"
          style={{
            paddingLeft: isMobileModal ? "0" : "0",
            paddingRight: isMobileModal ? "0" : "0",
          }}
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-blue-500 text-xl"
            />
            <h4 className="font-bold text-gray-900 text-lg">Location</h4>
            {filters.locations.length > 0 && (
              <span className="bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">
                {filters.locations.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.location ? faChevronUp : faChevronDown}
            className="text-gray-400 text-lg"
          />
        </button>

        {expandedSections.location && (
          <>
            <div className="mb-4">
              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                />
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    // Wider input on mobile
                    width: isMobileModal ? "100%" : "100%",
                    fontSize: isMobileModal ? "16px" : "inherit",
                    paddingLeft: isMobileModal ? "3.5rem" : "3rem",
                    paddingRight: isMobileModal ? "3rem" : "2.5rem",
                  }}
                />
                {locationSearch && (
                  <button
                    onClick={() => setLocationSearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                  </button>
                )}
              </div>
              <div className="flex justify-between mb-3">
                <button
                  onClick={handleSelectAllLocations}
                  className="text-base text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {filters.locations.length ===
                  uniqueLocationDisplayNames.length
                    ? "Clear All Locations"
                    : "Select All Locations"}
                </button>
                <span className="text-sm text-gray-500">
                  {filteredLocationDisplayNames.length} locations
                </span>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2">
              {filteredLocationDisplayNames.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-base">
                  No locations found matching "{locationSearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredLocationDisplayNames.map((location, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      style={{
                        paddingLeft: isMobileModal ? "0.5rem" : "0.75rem",
                        paddingRight: isMobileModal ? "0.5rem" : "0.75rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => handleLocationChange(location)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                        style={{
                          transform: isMobileModal ? "scale(1.2)" : "scale(1)",
                          marginRight: isMobileModal ? "0.75rem" : "0.5rem",
                        }}
                      />
                      <span
                        className={`text-base group-hover:text-[#06EAFC] transition-colors truncate ${
                          filters.locations.includes(location)
                            ? "text-blue-700 font-semibold"
                            : "text-gray-700"
                        }`}
                        style={{
                          fontSize: isMobileModal ? "16px" : "inherit",
                          flex: 1,
                        }}
                      >
                        {location}
                      </span>
                      {filters.locations.includes(location) && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-base text-blue-600"
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {filters.locations.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  Selected: {filters.locations.slice(0, 3).join(", ")}
                  {filters.locations.length > 3 &&
                    ` +${filters.locations.length - 3} more`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* CATEGORY SECTION WITH SEARCH - WIDER ON MOBILE */}
      <div className="border-b pb-6">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex justify-between items-center mb-4"
          style={{
            paddingLeft: isMobileModal ? "0" : "0",
            paddingRight: isMobileModal ? "0" : "0",
          }}
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faFilter}
              className="text-green-500 text-xl"
            />
            <h4 className="font-bold text-gray-900 text-lg">Category</h4>
            {filters.categories.length > 0 && (
              <span className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-full">
                {filters.categories.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.category ? faChevronUp : faChevronDown}
            className="text-gray-400 text-lg"
          />
        </button>

        {expandedSections.category && (
          <>
            <div className="mb-4">
              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  style={{
                    // Wider input on mobile
                    width: isMobileModal ? "100%" : "100%",
                    fontSize: isMobileModal ? "16px" : "inherit",
                    paddingLeft: isMobileModal ? "3.5rem" : "3rem",
                    paddingRight: isMobileModal ? "3rem" : "2.5rem",
                  }}
                />
                {categorySearch && (
                  <button
                    onClick={() => setCategorySearch("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                  </button>
                )}
              </div>
              <div className="flex justify-between mb-3">
                <button
                  onClick={handleSelectAllCategories}
                  className="text-base text-green-600 hover:text-green-700 font-semibold"
                >
                  {filters.categories.length ===
                  uniqueCategoryDisplayNames.length
                    ? "Clear All Categories"
                    : "Select All Categories"}
                </button>
                <span className="text-sm text-gray-500">
                  {filteredCategoryDisplayNames.length} categories
                </span>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2">
              {filteredCategoryDisplayNames.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-base">
                  No categories found matching "{categorySearch}"
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredCategoryDisplayNames.map((category, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      style={{
                        paddingLeft: isMobileModal ? "0.5rem" : "0.75rem",
                        paddingRight: isMobileModal ? "0.5rem" : "0.75rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-colors"
                        style={{
                          transform: isMobileModal ? "scale(1.2)" : "scale(1)",
                          marginRight: isMobileModal ? "0.75rem" : "0.5rem",
                        }}
                      />
                      <span
                        className={`text-base group-hover:text-[#06EAFC] transition-colors truncate ${
                          filters.categories.includes(category)
                            ? "text-green-700 font-semibold"
                            : "text-gray-700"
                        }`}
                        style={{
                          fontSize: isMobileModal ? "16px" : "inherit",
                          flex: 1,
                        }}
                      >
                        {category}
                      </span>
                      {filters.categories.includes(category) && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          className="text-base text-green-600"
                        />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            {filters.categories.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800">
                  Selected: {filters.categories.slice(0, 3).join(", ")}
                  {filters.categories.length > 3 &&
                    ` +${filters.categories.length - 3} more`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PRICE RANGE SECTION - WIDER ON MOBILE */}
      <div className="border-b pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex justify-between items-center mb-4"
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faDollarSign}
              className="text-yellow-500 text-xl"
            />
            <h4 className="font-bold text-gray-900 text-lg">Price Range</h4>
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="bg-yellow-100 text-yellow-600 text-sm px-3 py-1 rounded-full">
                Set
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.price ? faChevronUp : faChevronDown}
            className="text-gray-400 text-lg"
          />
        </button>

        {expandedSections.price && (
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label className="block text-base text-gray-600 mb-2 font-medium">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="2,500"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceChange("min", e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{
                      fontSize: isMobileModal ? "16px" : "inherit",
                    }}
                  />
                </div>
              </div>
              <span className="text-gray-500 font-medium mt-8 text-lg">to</span>
              <div className="flex-1">
                <label className="block text-base text-gray-600 mb-2 font-medium">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="50,000"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceChange("max", e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{
                      fontSize: isMobileModal ? "16px" : "inherit",
                    }}
                  />
                </div>
              </div>
            </div>
            {(filters.priceRange.min || filters.priceRange.max) && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...filters,
                      priceRange: { min: "", max: "" },
                    };
                    applyFiltersImmediately(updatedFilters);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Price Range
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RATING SECTION - WIDER ON MOBILE */}
      <div className="border-b pb-6">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex justify-between items-center mb-4"
        >
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faStar}
              className="text-yellow-500 text-xl"
            />
            <h4 className="font-bold text-gray-900 text-lg">Minimum Rating</h4>
            {filters.ratings.length > 0 && (
              <span className="bg-yellow-100 text-yellow-600 text-sm px-3 py-1 rounded-full">
                {filters.ratings.length}
              </span>
            )}
          </div>
          <FontAwesomeIcon
            icon={expandedSections.rating ? faChevronUp : faChevronDown}
            className="text-gray-400 text-lg"
          />
        </button>

        {expandedSections.rating && (
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label
                key={stars}
                className="flex items-center space-x-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors"
                style={{
                  paddingLeft: isMobileModal ? "0.5rem" : "0.75rem",
                  paddingRight: isMobileModal ? "0.5rem" : "0.75rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.ratings.includes(stars)}
                  onChange={() => handleRatingChange(stars)}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 transition-colors"
                  style={{
                    transform: isMobileModal ? "scale(1.2)" : "scale(1)",
                    marginRight: isMobileModal ? "0.75rem" : "0.5rem",
                  }}
                />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FontAwesomeIcon
                        key={i}
                        icon={faStar}
                        className={`text-lg ${
                          i < stars ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-base group-hover:text-[#06EAFC] transition-colors ${
                      filters.ratings.includes(stars)
                        ? "text-yellow-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {stars}+ stars
                  </span>
                </div>
              </label>
            ))}
            {filters.ratings.length > 0 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => {
                    const updatedFilters = {
                      ...filters,
                      ratings: [],
                    };
                    applyFiltersImmediately(updatedFilters);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear Ratings
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SORTING SECTION - Only show for mobile modals */}
      {isMobileModal && (
        <div className="border-b pb-6">
          <button
            onClick={() => toggleSection("sort")}
            className="w-full flex justify-between items-center mb-4"
          >
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faFilter}
                className="text-purple-500 text-xl"
              />
              <h4 className="font-bold text-gray-900 text-lg">Sort By</h4>
              {filters.sortBy !== "relevance" && (
                <span className="bg-purple-100 text-purple-600 text-sm px-3 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>
            <FontAwesomeIcon
              icon={expandedSections.sort ? faChevronUp : faChevronDown}
              className="text-gray-400 text-lg"
            />
          </button>

          {expandedSections.sort && (
            <div className="space-y-3">
              {[
                { value: "relevance", label: "Relevance" },
                { value: "price_low", label: "Price: Low to High" },
                { value: "price_high", label: "Price: High to Low" },
                { value: "rating", label: "Highest Rated" },
                { value: "name", label: "Name: A to Z" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  style={{
                    paddingLeft: isMobileModal ? "0.5rem" : "0.75rem",
                    paddingRight: isMobileModal ? "0.5rem" : "0.75rem",
                  }}
                >
                  <input
                    type="radio"
                    name="sortBy"
                    checked={filters.sortBy === option.value}
                    onChange={() => handleSortChange(option.value)}
                    className="w-5 h-5 rounded-full border-gray-300 text-purple-600 focus:ring-purple-500 transition-colors"
                    style={{
                      transform: isMobileModal ? "scale(1.2)" : "scale(1)",
                      marginRight: isMobileModal ? "0.75rem" : "0.5rem",
                    }}
                  />
                  <span
                    className={`text-base group-hover:text-[#06EAFC] transition-colors ${
                      filters.sortBy === option.value
                        ? "text-purple-700 font-semibold"
                        : "text-gray-700"
                    }`}
                    style={{
                      fontSize: isMobileModal ? "16px" : "inherit",
                      flex: 1,
                    }}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      
    </div>
  );

  // Mobile Modal - Fullscreen with NO duplicate header
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
        <div className="h-full overflow-y-auto w-full">
          {/* Main content with increased width */}
          <div
            className="pt-5"
            style={{
              paddingLeft: "1rem",
              paddingRight: "1rem",
              maxWidth: "100vw",
            }}
          >
            {/* Header with Filter & Sort and Cancel button on same line */}
            <div className="flex items-center justify-between mb-6 px-1">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Filter & Sort
                </h3>
                <p className="text-base text-gray-500 mt-1">
                  Refine your search results
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-base font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
                aria-label="Close filters"
              >
                Cancel
              </button>
            </div>

            {sidebarContent}
          </div>

          {/* Mobile Action Buttons - Wider and closer to screen edges */}
          <div
            className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
            style={{
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <button
              onClick={onClose}
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

  // Desktop Modal - Fullscreen (unchanged)
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

            {/* Modal Action Buttons - Changed to Apply Filter */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg mt-8">
              <button
                onClick={onClose}
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

  // Regular sidebar (not modal) - No Apply/Reset buttons, real-time filtering
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
      {sidebarContent}
    </div>
  );
};

// ================== MAIN CATEGORY RESULTS COMPONENT ==================
const CategoryResults = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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
  const [allLocations, setAllLocations] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showDesktopSearchSuggestions, setShowDesktopSearchSuggestions] =
    useState(false);
  const [showMobileSearchModal, setShowMobileSearchModal] = useState(false);
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

  // Initialize listings and filter by category
  useEffect(() => {
    if (listings.length > 0) {
      const categorySlug = category.toLowerCase();
      const filtered = listings.filter((item) => {
        const itemCategory = (item.category || "").toLowerCase();

        // Handle different category mappings
        if (categorySlug === "tourist-center") {
          return (
            itemCategory.includes("tourist") ||
            itemCategory.includes("attraction")
          );
        }

        if (categorySlug === "shortlet") {
          return (
            itemCategory.includes("shortlet") ||
            itemCategory.includes("apartment")
          );
        }

        if (categorySlug === "restaurant") {
          return (
            itemCategory.includes("restaurant") ||
            itemCategory.includes("cafe") ||
            itemCategory.includes("food")
          );
        }

        if (categorySlug === "hotel") {
          return (
            itemCategory.includes("hotel") ||
            itemCategory.includes("accommodation")
          );
        }

        return itemCategory.includes(categorySlug);
      });

      // Extract unique locations and categories
      const locations = [
        ...new Set(filtered.map((item) => item.area).filter(Boolean)),
      ];
      const categories = [
        ...new Set(filtered.map((item) => item.category).filter(Boolean)),
      ];
      setAllLocations(locations);
      setAllCategories(categories);
    }
  }, [listings, category]);

  // Initialize filters from URL parameters - HANDLES MULTIPLE LOCATIONS AND CATEGORIES
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

    // Collect all location parameters (location, location2, location3, etc.)
    const locationParams = [];
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("location")) {
        const displayName = getLocationDisplayName(value);
        if (displayName !== "All Locations" && displayName !== "All") {
          locationParams.push(displayName);
        }
      }
    }

    // Collect all category parameters (category, category2, category3, etc.)
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
      initialFilters.locations = [...new Set(locationParams)]; // Remove duplicates
    }

    // Set categories from URL params
    if (categoryParams.length > 0) {
      initialFilters.categories = [...new Set(categoryParams)]; // Remove duplicates
    }

    setActiveFilters(initialFilters);
    setFiltersInitialized(true);
  }, [listings.length, searchParams.toString()]);

  // FIXED: Correct filter logic for exact area filtering with MULTIPLE LOCATIONS AND CATEGORIES
  const applyFilters = (listingsToFilter, filters) => {
    // First filter by category
    const categorySlug = category.toLowerCase();
    let filtered = listingsToFilter.filter((item) => {
      const itemCategory = (item.category || "").toLowerCase();

      // Handle different category mappings
      if (categorySlug === "tourist-center") {
        return (
          itemCategory.includes("tourist") ||
          itemCategory.includes("attraction")
        );
      }

      if (categorySlug === "shortlet") {
        return (
          itemCategory.includes("shortlet") ||
          itemCategory.includes("apartment")
        );
      }

      if (categorySlug === "restaurant") {
        return (
          itemCategory.includes("restaurant") ||
          itemCategory.includes("cafe") ||
          itemCategory.includes("food")
        );
      }

      if (categorySlug === "hotel") {
        return (
          itemCategory.includes("hotel") ||
          itemCategory.includes("accommodation")
        );
      }

      return itemCategory.includes(categorySlug);
    });

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

    // Apply locations from URL if present - MULTIPLE LOCATIONS SUPPORT
    if (locationParams.length > 0) {
      filtered = filtered.filter((item) => {
        const itemLocation = getLocationDisplayName(item.area || "");
        return locationParams.some(
          (loc) => itemLocation.toLowerCase() === loc.toLowerCase()
        );
      });
    }

    // Apply categories from URL if present - MULTIPLE CATEGORIES SUPPORT
    if (categoryParams.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = getCategoryDisplayName(item.category || "");
        return categoryParams.some(
          (cat) => itemCategory.toLowerCase() === cat.toLowerCase()
        );
      });
    }

    // Apply filter panel locations - show items ONLY in selected locations
    if (filters.locations.length > 0) {
      filtered = filtered.filter((item) => {
        const itemLocation = getLocationDisplayName(item.area || "");
        return filters.locations.some(
          (selectedLocation) =>
            itemLocation.toLowerCase() === selectedLocation.toLowerCase()
        );
      });
    }

    // Apply filter panel categories - show items ONLY in selected categories
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
  };

  // Apply filters whenever any dependency changes
  useEffect(() => {
    if (!listings.length || !filtersInitialized) {
      setFilteredListings([]);
      setFilteredCount(0);
      return;
    }

    applyFilters(listings, activeFilters);
  }, [
    listings,
    searchQuery,
    searchParams.toString(),
    activeFilters,
    filtersInitialized,
    category,
  ]);

  // FIXED: Handle multiple locations AND categories in URL parameters
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

    // Add categories to params - allow multiple with category, category2, category3, etc.
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
    // Update filters state
    setActiveFilters(filters);
  };

  const handleSuggestionClick = (url) => {
    const urlObj = new URL(url, window.location.origin);
    const params = new URLSearchParams(urlObj.search);
    setSearchParams(params);
    setShowMobileSearchModal(false);
    setShowDesktopSearchSuggestions(false);
    setLocalSearchQuery("");
  };

  const handleSearchChange = (value) => {
    setLocalSearchQuery(value);
    if (!isMobile) {
      setShowDesktopSearchSuggestions(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (localSearchQuery.trim()) {
      const params = new URLSearchParams();
      params.set("q", localSearchQuery.trim());
      setSearchParams(params);
      setShowMobileSearchModal(false);
      setShowDesktopSearchSuggestions(false);
    }
  };

  const handleClearSearch = () => {
    setLocalSearchQuery("");
    const params = new URLSearchParams();
    setSearchParams(params);
    setShowDesktopSearchSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (isMobile) {
      setShowMobileSearchModal(true);
      if (showMobileFilters) {
        setShowMobileFilters(false);
      }
    } else {
      setShowDesktopSearchSuggestions(true);
      if (showDesktopFilters) {
        setShowDesktopFilters(false);
      }
    }
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
    setShowMobileSearchModal(false);
  };

  const toggleDesktopFilters = () => {
    setShowDesktopFilters(!showDesktopFilters);
    setShowDesktopSearchSuggestions(false);
  };

  // Real-time filter change handler
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const removeFilter = (type, value = null) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      switch (type) {
        case "location":
          newFilters.locations = value
            ? prev.locations.filter((l) => l !== value)
            : [];
          break;
        case "category":
          newFilters.categories = value
            ? prev.categories.filter((c) => c !== value)
            : [];
          break;
        case "price":
          newFilters.priceRange = { min: "", max: "" };
          break;
        case "rating":
          newFilters.ratings = value
            ? prev.ratings.filter((r) => r !== value)
            : [];
          break;
        case "sort":
          newFilters.sortBy = "relevance";
          break;
      }

      return newFilters;
    });
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

  const categoryTitle = category
    ? category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Category";

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

        return `${categoryTitle} matching "${searchQuery}" in ${parts.join(
          " • "
        )}`;
      }
      return `${categoryTitle} matching "${searchQuery}"`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `${categoriesText} in ${locationParams.join(", ")}`;
      }
      return `${categoriesText} in Ibadan`;
    } else if (locationParams.length > 0) {
      return `${categoryTitle} in ${locationParams.join(", ")}`;
    } else if (
      activeFilters.locations.length > 0 ||
      activeFilters.categories.length > 0
    ) {
      const parts = [];
      if (activeFilters.categories.length > 0)
        parts.push(activeFilters.categories.join(", "));
      if (activeFilters.locations.length > 0)
        parts.push(activeFilters.locations.join(", "));
      return `${categoryTitle} in ${parts.join(" • ")}`;
    } else {
      return `${categoryTitle} in Ibadan`;
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

        return `Find the best ${categoryTitle.toLowerCase()} in ${parts.join(
          " • "
        )} matching "${searchQuery}". Browse prices, reviews, and book directly.`;
      }
      return `Find the best ${categoryTitle.toLowerCase()} in Ibadan matching "${searchQuery}". Browse prices, reviews, and book directly.`;
    } else if (categoryParams.length > 0) {
      const categoriesText = categoryParams.join(", ");
      if (locationParams.length > 0) {
        return `Browse the best ${categoriesText.toLowerCase()} in ${locationParams.join(
          ", "
        )}, Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
      }
      return `Browse the best ${categoriesText.toLowerCase()} in Ibadan. Find top-rated venues, compare prices, and book your next experience.`;
    } else if (locationParams.length > 0) {
      return `Discover amazing ${categoryTitle.toLowerCase()} in ${locationParams.join(
        ", "
      )}, Ibadan. Find top-rated places, compare prices, and book directly.`;
    } else if (
      activeFilters.locations.length > 0 ||
      activeFilters.categories.length > 0
    ) {
      const parts = [];
      if (activeFilters.categories.length > 0)
        parts.push(activeFilters.categories.join(", "));
      if (activeFilters.locations.length > 0)
        parts.push(activeFilters.locations.join(", "));
      return `Discover amazing ${categoryTitle.toLowerCase()} in ${parts.join(
        " • "
      )}, Ibadan. Find top-rated places, compare prices, and book directly.`;
    } else {
      return `Find the best ${categoryTitle.toLowerCase()} in Ibadan. Browse prices, reviews, and book directly.`;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
          <div className="flex space-x-1 justify-center">
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
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
        url={`https://ajani.ai/category/${category}?${searchParams.toString()}`}
        image="https://ajani.ai/images/category-og.jpg"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 mt-16">
        {/* Fixed Search Bar Container */}
        <div className="z-30 py-6 relative" style={{ zIndex: 100 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div
                className="w-full max-w-md relative"
                ref={searchContainerRef}
              >
                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center">
                    <div className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative z-40">
                      <div className="pl-3 sm:pl-4 text-gray-500">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        placeholder={`Search ${categoryTitle} in Ibadan...`}
                        value={localSearchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={handleSearchFocus}
                        className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope"
                        autoFocus={false}
                        aria-label="Search input"
                        role="searchbox"
                      />
                      {localSearchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="p-1 mr-2 text-gray-500 hover:text-gray-700"
                          aria-label="Clear search"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
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

                  {/* Desktop Search Suggestions */}
                  {!isMobile && showDesktopSearchSuggestions && (
                    <DesktopSearchSuggestions
                      searchQuery={localSearchQuery}
                      listings={listings}
                      onSuggestionClick={handleSuggestionClick}
                      onClose={() => setShowDesktopSearchSuggestions(false)}
                      isVisible={showDesktopSearchSuggestions}
                    />
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fullscreen Search Modal */}
        {isMobile && (
          <MobileSearchModal
            searchQuery={localSearchQuery}
            listings={listings}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowMobileSearchModal(false)}
            onTyping={handleSearchChange}
            isVisible={showMobileSearchModal}
            categoryTitle={categoryTitle}
          />
        )}

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
            categoryTitle={categoryTitle}
          />
        )}

        {/* Mobile Filter Modal */}
        {isMobile && showMobileFilters && (
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onDynamicFilterApply={handleDynamicFilterApply}
            allLocations={allLocations}
            allCategories={allCategories}
            currentFilters={activeFilters}
            currentSearchQuery={searchQuery}
            onClose={() => setShowMobileFilters(false)}
            isMobileModal={true}
            isInitialized={filtersInitialized}
            categoryTitle={categoryTitle}
          />
        )}

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filter Sidebar - Always visible on desktop */}
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
                categoryTitle={categoryTitle}
              />
            </div>
          )}

          {/* Results Content */}
          <div className="lg:w-3/4" ref={resultsRef}>
            {/* Page Header with Filter Button - REMOVED DESKTOP FILTER BUTTON */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-3">
                  {/* Mobile filter button - Show only on mobile */}
                  {isMobile && filtersInitialized && (
                    <button
                      onClick={toggleMobileFilters}
                      className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                      aria-label="Open filters"
                      ref={filterButtonRef}
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

                  {/* Title and Count - Moved to single line with sort */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-[#00065A] mb-1">
                        {getPageTitle()}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {filteredCount}{" "}
                        {filteredCount === 1 ? "place" : "places"} found
                      </p>
                    </div>

                    {/* Desktop Sort Dropdown - At far right, clean minimal design */}
                    {!isMobile && (
                      <div className="flex items-center">
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
                            className="appearance-none bg-transparent text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer pr-6"
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Sort By Dropdown - Only on mobile */}
                {isMobile && filtersInitialized && (
                  <div className="flex items-center gap-2">
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
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] transition-colors cursor-pointer pr-10"
                      >
                        <option value="relevance">Sort by: Relevance</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="name">Name: A to Z</option>
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="text-gray-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Display */}
            <div className="space-y-6">
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
                      ? `No ${categoryTitle.toLowerCase()} found for "${searchQuery}" with the selected filters.`
                      : `No ${categoryTitle.toLowerCase()} match your current filters.`}
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
                  {isMobile ? (
                    <div className="space-y-4">
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
                              <SearchResultBusinessCard
                                key={listing.id || `${rowIndex}-${index}`}
                                item={listing}
                                category={category}
                                isMobile={isMobile}
                              />
                            ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentListings.map((listing, index) => (
                        <SearchResultBusinessCard
                          key={listing.id || index}
                          item={listing}
                          category={category}
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
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Custom scrollbar hiding */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .modal-open {
          overflow: hidden !important;
        }

        /* Toast notification styles */
        #toast-notification {
          animation: slideInRight 0.3s ease-out forwards;
          z-index: 9999999;
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        /* Focus styles */
        input:focus,
        button:focus,
        select:focus {
          outline: none;
          ring-width: 2px;
          ring-color: #06eafc;
        }

        /* Better scrollbar for webkit */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default CategoryResults;
