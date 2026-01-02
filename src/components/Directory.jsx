import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { MdFavoriteBorder } from "react-icons/md";

// ---------------- Skeleton Loading Components ----------------
const SkeletonCard = ({ isMobile }) => (
  <div className={`bg-white rounded-xl overflow-hidden flex-shrink-0 font-manrope animate-pulse ${isMobile ? "w-[180px]" : "w-[280px]"} snap-start`}>
    {/* Image Skeleton */}
    <div className={`relative overflow-hidden rounded-xl bg-gray-200 ${isMobile ? "h-[180px]" : "h-[200px]"}`}></div>

    {/* Text Skeleton */}
    <div className={`${isMobile ? "p-2.5" : "p-3"} flex flex-col gap-2`}>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="flex items-center gap-1 mt-1">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

const SkeletonCategorySection = ({ isMobile }) => (
  <section className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <div className="h-7 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </div>

    <div className={`${isMobile ? "flex overflow-x-auto gap-[12px] pb-6 -mx-[16px] pl-[16px] pr-[48px] snap-x snap-mandatory" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4"}`}>
      {[...Array(6)].map((_, index) => (
        <SkeletonCard key={index} isMobile={isMobile} />
      ))}
    </div>
  </section>
);

const SkeletonDirectory = ({ isMobile }) => (
  <section id="directory" className="bg-white py-12 font-manrope">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
      {/* Header Skeleton - Reduced gap */}
      <div className="mb-8">
        <div className="text-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </div>

      {/* Category Sections Skeleton */}
      <div className="space-y-16">
        {[...Array(3)].map((_, index) => (
          <SkeletonCategorySection key={index} isMobile={isMobile} />
        ))}
      </div>
    </div>
  </section>
);

// ---------------- Helpers ----------------
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const FALLBACK_IMAGES = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&q=80",
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
  return [FALLBACK_IMAGES.default];
};

// ---------------- Custom Hook ----------------
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

// Check if user is authenticated
const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const userProfile = localStorage.getItem("userProfile");
    const isLoggedIn = !!token && !!userProfile;
    setIsAuthenticated(isLoggedIn);
    return isLoggedIn;
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("loginSuccess", handleAuthChange);
    window.addEventListener("logout", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("loginSuccess", handleAuthChange);
      window.removeEventListener("logout", handleAuthChange);
    };
  }, [checkAuth]);

  return isAuthenticated;
};

// ---------------- BusinessCard Component ----------------
const BusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // Use custom hooks
  const isFavorite = useIsFavorite(item.id);
  const isAuthenticated = useAuthStatus();

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

  // Determine tag based on category
  const getTag = () => {
    const cat = (item.category || "").toLowerCase();
    if (cat.includes("hotel")) return "Hotel";
    if (cat.includes("shortlet")) return "Shortlet";
    if (cat.includes("restaurant")) return "Restaurant";
    return "Co";
  };

  const tag = getTag();
  const priceText = getPriceText();
  const locationText = item.area || item.location || "Ibadan";
  const rating = item.rating || "4.9";
  const businessName = item.name || "Business Name";

  // Shorten text like Airbnb
  const displayName = businessName.length > 25 
    ? businessName.substring(0, 22) + "..." 
    : businessName;

  const displayLocation = locationText.length > 20
    ? locationText.substring(0, 18) + "..."
    : locationText;

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
      // Remove any existing toast
      const existingToast = document.getElementById("toast-notification");
      if (existingToast) {
        existingToast.remove();
      }

      // Create toast element
      const toast = document.createElement("div");
      toast.id = "toast-notification";
      toast.className = `fixed z-[9999] px-4 py-3 rounded-lg shadow-sm border ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`;

      // Position toast with margin
      toast.style.top = "15px";
      toast.style.right = "15px";
      toast.style.left = "15px";
      toast.style.maxWidth = "calc(100% - 30px)";
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
          <p class="text-sm opacity-80 mt-1">${displayName}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-70 transition-opacity">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

      // Add to DOM
      document.body.appendChild(toast);

      // Auto remove after 3 seconds
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
    [displayName]
  );

  // Handle favorite click
  const handleFavoriteClick = useCallback(
    async (e) => {
      e.stopPropagation();

      // Prevent multiple clicks while processing
      if (isProcessing) return;

      // Immediately show loading state
      setIsProcessing(true);

      try {
        // Check if user is signed in using the proper auth check
        if (!isAuthenticated) {
          showToast("Please login to save listings", "info");

          // Store the current URL to redirect back after login
          localStorage.setItem("redirectAfterLogin", window.location.pathname);

          // Store the item details to save after login
          const itemToSaveAfterLogin = {
            id: item.id,
            name: displayName,
            price: priceText,
            rating: parseFloat(rating),
            tag: "Guest Favorite",
            image: images[0] || FALLBACK_IMAGES.default,
            category: capitalizeFirst(category) || "Business",
            location: displayLocation,
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

          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate("/login");
            setIsProcessing(false);
          }, 800);

          return;
        }

        // User is logged in, proceed with bookmarking
        // Get existing saved listings from localStorage
        const saved = JSON.parse(
          localStorage.getItem("userSavedListings") || "[]"
        );

        // Check if this item is already saved
        const isAlreadySaved = saved.some(
          (savedItem) => savedItem.id === item.id
        );

        if (isAlreadySaved) {
          // REMOVE FROM SAVED
          const updated = saved.filter((savedItem) => savedItem.id !== item.id);
          localStorage.setItem("userSavedListings", JSON.stringify(updated));

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
            name: displayName,
            price: priceText,
            rating: parseFloat(rating),
            tag: "Guest Favorite",
            image: images[0] || FALLBACK_IMAGES.default,
            category: capitalizeFirst(category) || "Business",
            location: displayLocation,
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

          // Show toast notification
          showToast("Added to saved listings!", "success");

          // Dispatch event for other components
          window.dispatchEvent(
            new CustomEvent("savedListingsUpdated", {
              detail: { action: "added", item: listingToSave },
            })
          );
        }
      } catch (error) {
        showToast("Something went wrong. Please try again.", "info");
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      item,
      displayName,
      priceText,
      rating,
      images,
      category,
      displayLocation,
      showToast,
      navigate,
      isAuthenticated,
    ]
  );

  // Check for pending saves after login
  useEffect(() => {
    const pendingSaveItem = JSON.parse(
      localStorage.getItem("pendingSaveItem") || "null"
    );

    if (pendingSaveItem && pendingSaveItem.id === item.id) {
      // Clear the pending save
      localStorage.removeItem("pendingSaveItem");

      // Get existing saved listings
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );

      // Check if already saved (to avoid duplicates)
      const isAlreadySaved = saved.some(
        (savedItem) => savedItem.id === item.id
      );

      if (!isAlreadySaved) {
        // Add to saved listings
        const updated = [...saved, pendingSaveItem];
        localStorage.setItem("userSavedListings", JSON.stringify(updated));

        // Show success message
        showToast("Added to saved listings!", "success");

        // Dispatch event
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
      className={`bg-white rounded-xl overflow-hidden font-manrope relative group transition-all duration-200 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] snap-start ${
        isMobile ? "w-[180px] flex-shrink-0" : "w-full"
      }`}
      onClick={handleCardClick}
    >
      {/* Image - Fixed to prevent overlap */}
      <div
        className={`relative rounded-xl ${
          isMobile ? "h-[160px]" : "h-[160px]"
        }`}
      >
        <img
          src={images[0]}
          alt={displayName}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null;
          }}
          loading="lazy"
        />

        {/* Guest favorite badge */}
        <div className="absolute top-2 left-2 bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">
          <span className="text-[10px] font-semibold text-gray-900">
            Guest favorite
          </span>
        </div>

        {/* Heart icon */}
        <button
          onClick={handleFavoriteClick}
          disabled={isProcessing}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 ${
            isFavorite
              ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              : "bg-white/90 hover:bg-white backdrop-blur-sm"
          } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
          title={isFavorite ? "Remove from saved" : "Add to saved"}
          aria-label={isFavorite ? "Remove from saved" : "Save this listing"}
          aria-pressed={isFavorite}
        >
          {isProcessing ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isFavorite ? (
            <svg
              className="w-3 h-3 text-white"
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
            <MdFavoriteBorder className="text-[#06EAFC] text-[#06EAFC] w-3 h-3" />
          )}
        </button>
      </div>

      {/* Text Content */}
      <div className={`${isMobile ? "p-2.5" : "p-3"} flex flex-col gap-1`}>
        {/* Title and Rating in one line */}
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1 flex-1 mr-2">
            {displayName}
          </h3>
        </div>

        {/* Location */}
        <p className="text-gray-600 text-xs mb-2 line-clamp-1">
          {displayLocation}
        </p>

        {/* Price and Rating */}
        <div className="mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[12px] text-gray-900 font-semibold">
              {priceText}
            </span>
            <span className="text-[12px] text-gray-600">
              for 2 nights
            </span>
            <div className="flex items-center md:ml-7 ml-2 flex-shrink-0">
              <FontAwesomeIcon
                icon={faStar}
                className="text-[10px] text-black"
              />
              <span className="text-[10px] font-semibold text-black">
                {rating}
              </span>
            </div>
          </div>
        </div>

        {/* Tag - Moved to bottom of card content with dark ash background and black text */}
        <div className="mt-2 pt-2">
          <span className="text-[10px] font-semibold text-black px-2 py-1 rounded-md bg-gray-100">
            {tag}
          </span>
        </div>
      </div>
    </div>
  );
};

// Add CSS styles for toast animations and utilities
const styles = `
/* Toast animation */
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

/* Line clamp utility */
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

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Scrollbar hiding */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Snap scrolling */
.snap-x {
  scroll-snap-type: x mandatory;
}

.snap-mandatory {
  scroll-snap-stop: always;
}

.snap-start {
  scroll-snap-align: start;
}

/* Fix for grid columns to prevent overflow */
.grid-cols-fix {
  grid-template-columns: repeat(6, minmax(0, 280px));
}
`;

// Inject styles into the document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// ---------------- CategorySection Component ----------------
const CategorySection = ({ title, items, isMobile }) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const getCategoryFromTitle = (title) => {
    const words = title.toLowerCase().split(" ");
    if (words.includes("hotel")) return "hotel";
    if (words.includes("shortlet")) return "shortlet";
    if (words.includes("restaurant")) return "restaurant";
    return words[1] || "all";
  };

  const category = getCategoryFromTitle(title);

  const handleCategoryClick = () => {
    navigate(`/category/${category}`);
  };

  // Show only 6 cards
  const displayItems = items.slice(0, 6);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 
            className="text-gray-900 text-xl font-bold"
            style={{ color: '#000651' }}
          >
            {title}
          </h2>
        </div>
        {/* View All button with arrow icon */}
        <button
          onClick={handleCategoryClick}
          className="text-gray-900 hover:text-[#06EAFC] transition-colors text-sm font-medium cursor-pointer flex items-center gap-2 group"
          style={{ color: '#000651' }}
        >
          View all
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* Desktop: Grid layout for 6 cards - FIXED */}
      {/* Mobile: Horizontal scroll with Airbnb-style peek - REMOVED WHITE SHADOW */}
      {!isMobile ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {displayItems.map((item, index) => (
            <BusinessCard
              key={item.id || index}
              item={item}
              category={category}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Airbnb-style mobile scroll container with exact measurements */}
          {/* REMOVED the pr-[48px] padding that was creating the white shadow */}
          <div className="flex overflow-x-auto scrollbar-hide gap-[12px] pb-4 -mx-[16px] pl-[16px] snap-x snap-mandatory">
            {displayItems.map((item, index) => (
              <BusinessCard
                key={item.id || index}
                item={item}
                category={category}
                isMobile={isMobile}
              />
            ))}
          </div>
          {/* REMOVED the gradient fade overlay completely */}
        </div>
      )}
    </section>
  );
};

// ---------------- Main Directory Component ----------------
const Directory = () => {
  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const [isMobile, setIsMobile] = useState(false);

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(
    "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y",
    import.meta.env.VITE_GOOGLE_API_KEY
  );

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show skeleton loading while data is being fetched
  if (loading) {
    return <SkeletonDirectory isMobile={isMobile} />;
  }

  // Define the specific categories we want to display
  const getPopularCategories = () => {
    return ["hotel", "shortlet", "restaurant"];
  };

  // Filter listings based on search and filters
  const filteredListings = listings.filter((item) => {
    return true; // Show all listings for now
  });

  // Group listings by the specific categories we want
  const categorizedListings = {};
  getPopularCategories().forEach((category) => {
    categorizedListings[category] = filteredListings.filter((item) => {
      const itemCategory = (item.category || "").toLowerCase();
      return itemCategory.includes(category);
    });
  });

  if (error)
    return (
      <section id="directory" className="bg-white py-12 font-manrope">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        </div>
      </section>
    );

  return (
    <section id="directory" className="bg-white py-8 font-manrope">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Drastically reduced gap */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4"
        >
          <h1 className="text-xl md:text-start text-center font-bold text-gray-900 mb-1">
            Explore Categories
          </h1>
          <p className="text-gray-600 md:text-[15px] md:text-start text-center text-[13.5px]">
            Find the best places and services in Ibadan
          </p>
        </motion.div>

        {/* Category Sections */}
        <div className="space-y-8">
          {getPopularCategories().map((category, index) => {
            const items = categorizedListings[category] || [];
            if (items.length === 0) return null;

            const title = `Popular ${capitalizeFirst(category)} in Ibadan`;

            return (
              <CategorySection
                key={category}
                title={title}
                items={items}
                isMobile={isMobile}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
              <i className="fas fa-search text-4xl text-gray-300 mb-4 block"></i>
              <h3 className="text-lg text-gray-800 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Directory;