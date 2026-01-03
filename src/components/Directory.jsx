import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { MdFavoriteBorder } from "react-icons/md";

// ---------------- Skeleton Loading Components ----------------
const SkeletonCard = ({ isMobile }) => (
  <div
    className={`bg-white rounded-xl overflow-hidden flex-shrink-0 font-manrope animate-pulse ${
      isMobile ? "w-[165px]" : "w-[210px]"
    } snap-start`}
  >
    {/* Image Skeleton - Further reduced height */}
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-200 ${
        isMobile ? "h-[150px]" : "h-[150px]"
      }`}
    ></div>

    {/* Text Skeleton */}
    <div className={`${isMobile ? "p-1.5" : "p-2"} flex flex-col gap-1.5`}>
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
  <section className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <div
        className={`${isMobile ? "h-5" : "h-7"} bg-gray-200 rounded w-1/3`}
      ></div>
      <div
        className={`${isMobile ? "h-4" : "h-6"} bg-gray-200 rounded w-24`}
      ></div>
    </div>

    <div
      className={`${
        isMobile
          ? "flex overflow-x-auto gap-[8px] pb-4 -mx-[16px] pl-[16px] snap-x snap-mandatory"
          : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3"
      }`}
    >
      {[...Array(6)].map((_, index) => (
        <SkeletonCard key={index} isMobile={isMobile} />
      ))}
    </div>
  </section>
);

const SkeletonDirectory = ({ isMobile }) => (
  <section
    id="directory"
    className={`bg-white font-manrope ${isMobile ? "py-6" : "py-8"}`}
  >
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
      {/* Header Skeleton - Reduced gap */}
      <div className={isMobile ? "mb-3" : "mb-4"}>
        <div className="text-center">
          <div
            className={`${
              isMobile ? "h-6" : "h-8"
            } bg-gray-200 rounded w-1/4 mx-auto mb-2`}
          ></div>
          <div
            className={`${
              isMobile ? "h-4" : "h-5"
            } bg-gray-200 rounded w-1/3 mx-auto`}
          ></div>
        </div>
      </div>

      {/* Category Sections Skeleton - Reduced spacing */}
      <div className={isMobile ? "space-y-4" : "space-y-6"}>
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
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80",
  shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80",
  default:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&q=80",
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

// ---------------- Custom Hooks ----------------
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
  const [imageHeight, setImageHeight] = useState(150); // Reduced from 160

  // Use custom hooks
  const isFavorite = useIsFavorite(item.id);
  const isAuthenticated = useAuthStatus();

  // Set consistent height based on device - Further reduced desktop height
  useEffect(() => {
    setImageHeight(isMobile ? 150 : 150); // Same height for mobile and desktop now
  }, [isMobile]);

  // Add resize listener to maintain dimensions
  useEffect(() => {
    const handleResize = () => {
      setImageHeight(150); // Fixed height
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <p class="text-sm opacity-80 mt-1">${businessName}</p>
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
    [businessName]
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
            name: businessName,
            price: priceText,
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
            name: businessName,
            price: priceText,
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
      businessName,
      priceText,
      rating,
      images,
      category,
      locationText,
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
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope relative group flex flex-col h-full
        ${isMobile ? "w-[165px]" : "w-[210px]"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
      `}
      onClick={handleCardClick}
      // Significantly reduced dimensions for desktop
      style={{
        height: isMobile ? "280px" : "280px", // Same height as mobile
        minHeight: isMobile ? "280px" : "280px",
        maxHeight: isMobile ? "280px" : "280px",
        minWidth: isMobile ? "165px" : "165px", // Same min width as mobile
      }}
    >
      {/* Image - Reduced height */}
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
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null;
          }}
          loading="lazy"
        />

        {/* Guest favorite badge - Smaller */}
        <div className="absolute top-1.5 left-1.5 bg-white px-1 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
          <span className="text-[8px] font-semibold text-gray-900">
            Guest favorite
          </span>
        </div>

        {/* Heart icon - Smaller */}
        <button
          onClick={handleFavoriteClick}
          disabled={isProcessing}
          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 ${
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
            <MdFavoriteBorder className="text-[#00d1ff] w-3 h-3" />
          )}
        </button>
      </div>

      {/* Text Content - More compact */}
      <div
        className={`flex-1 ${isMobile ? "p-1.5" : "p-2"} flex flex-col`}
        style={{
          minHeight: isMobile ? "130px" : "130px", // Reduced from 140px
        }}
      >
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-[13.5px] mb-1 flex-shrink-0">
          {businessName}
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-[12.5px] line-clamp-1 mb-1">
              {locationText}
            </p>

            {/* Combined Price, Per Text, and Ratings on same line */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-0.5 flex-wrap">
                {/* Price and Per Text */}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[12px] font-manrope text-gray-900">
                    {priceText}
                  </span>
                  <span className="text-[12px] text-gray-600">
                    for 2 nights
                  </span>
                </div>
              </div>

              {/* Ratings on the right */}
              <div className="flex items-center gap-0.5">
                <div className="flex items-center gap-0.5 text-gray-800 text-[12px]">
                  <FontAwesomeIcon icon={faStar} className="text-black w-2 h-2" />
                  <span className="font-semibold text-black">{rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Category tag */}
          <div className="flex items-center justify-between mt-auto pt-1">
            {/* Category tag - Smaller */}
            <div>
              <span className="inline-block text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            </div>

            {/* Saved indicator badge - Smaller */}
            {isFavorite && !isProcessing && (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                <svg
                  className="w-1.5 h-1.5"
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
    <section className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-gray-900 font-bold" style={{ color: "#000651" }}>
            {isMobile ? (
              <span className="text-[14px]">{title}</span>
            ) : (
              <span className="text-xl">{title}</span>
            )}
          </h2>
        </div>
        {/* View All button with arrow icon */}
        <button
          onClick={handleCategoryClick}
          className="text-gray-900 hover:text-[#06EAFC] transition-colors font-medium cursor-pointer flex items-center gap-2 group"
          style={{ color: "#000651" }}
        >
          {isMobile ? (
            <span className="text-[12px]">View all</span>
          ) : (
            <span className="text-[13.5px]">View all</span>
          )}
          <svg
            className={`transition-transform group-hover:translate-x-1 ${
              isMobile ? "w-3 h-3" : "w-4 h-4"
            }`}
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
        </button>
      </div>

      {/* Desktop: Grid layout for 6 cards with reduced gap */}
      {/* Mobile: Horizontal scroll */}
      {!isMobile ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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
          <div
            className="flex overflow-x-auto scrollbar-hide gap-2 pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingRight: "8px",
            }}
          >
            {displayItems.map((item, index) => (
              <BusinessCard
                key={item.id || index}
                item={item}
                category={category}
                isMobile={isMobile}
              />
            ))}
            {/* Spacer for last card visibility */}
            <div className="flex-shrink-0" style={{ width: "8px" }}></div>
          </div>
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
  const navigate = useNavigate();

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
      setIsMobile(window.innerWidth < 768); // Mobile: < 768px
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
    <section id="directory" className="bg-white font-manrope">
      <div className={`${isMobile ? "py-0" : "py-8"}`}>
        {/* MOBILE VIEW */}
        {isMobile ? (
          <div
            className="w-full"
            style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem" }}
          >
            {/* Header */}
            <motion.div
              ref={headerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-4"
            >
              <h1 className="text-lg font-bold text-center mb-2 text-[#00065A]">
                Explore Categories
              </h1>
              <p className="text-xs text-gray-600 text-center">
                Find the best places and services in Ibadan
              </p>
            </motion.div>

            {/* Category Sections */}
            <div className="space-y-6">
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
          </div>
        ) : (
          /* DESKTOP VIEW */
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <motion.div
              ref={headerRef}
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-4"
            >
              <h1 className="text-xl font-semibold text-gray-900 md:text-start">
                Explore Categories
              </h1>
              <p className="text-gray-600 md:text-[15px] md:text-start text-[13.5px]">
                Find the best places and services in Ibadan
              </p>
            </motion.div>

            {/* Category Sections */}
            <div className="space-y-6">
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
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto">
                  <i className="fas fa-search text-3xl text-gray-300 mb-3 block"></i>
                  <h3 className="text-base text-gray-800 mb-2">
                    No businesses found
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
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
  grid-template-columns: repeat(6, minmax(0, 210px));
}
`;

// Inject styles into the document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Directory;