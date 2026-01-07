import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { MdFavoriteBorder } from "react-icons/md";
import axiosInstance from "../lib/axios";

// ---------------- API Service Functions ----------------
const buildQueryString = (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add filters - ONLY category filter
  if (filters.category) params.append('category', filters.category);
  
  return params.toString();
};

// Get listings by category using axiosInstance.get() - SIMPLIFIED
const getListingsByCategory = async (category) => {
  try {
    const filters = {
      category: category,
      // REMOVED: sort, limit, status
    };
    
    const queryString = buildQueryString(filters);
    const url = `/listings${queryString ? `?${queryString}` : ''}`;
    
    console.log(`📡 Making GET request for ${category}:`, url);
    
    const response = await axiosInstance.get(url);
    
    console.log(`✅ ${category} Response Status:`, response.data?.status);
    console.log(`📊 ${category} Results:`, response.data?.results || 0);
    
    return response.data;
  } catch (error) {
    console.error(`❌ ${category} Error:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    // Return empty data structure instead of throwing
    return {
      status: 'error',
      message: error.message,
      results: 0,
      data: { listings: [] }
    };
  }
};

// ---------------- Skeleton Loading Components ----------------
const SkeletonCard = ({ isMobile }) => (
  <div
    className={`bg-white rounded-xl overflow-hidden flex-shrink-0 font-manrope animate-pulse ${
      isMobile ? "w-[165px]" : "w-[210px]"
    } snap-start`}
  >
    <div
      className={`relative overflow-hidden rounded-xl bg-gray-200 ${
        isMobile ? "h-[150px]" : "h-[150px]"
      }`}
    ></div>
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
      <div className={isMobile ? "mb-3" : "mb-4"}>
        <div className="text-center">
          <div
            className={`${isMobile ? "h-6" : "h-8"} bg-gray-200 rounded w-1/4 mx-auto mb-2`}
          ></div>
          <div
            className={`${isMobile ? "h-4" : "h-5"} bg-gray-200 rounded w-1/3 mx-auto`}
          ></div>
        </div>
      </div>
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
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop&q=80",
  services: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&q=80",
  event: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop&q=80",
};

const getCardImages = (listing) => {
  if (listing.images && listing.images.length > 0 && listing.images[0].url) {
    return [listing.images[0].url];
  }
  
  const cat = (listing.category || "").toLowerCase();
  if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
  if (cat.includes("restaurant")) return [FALLBACK_IMAGES.restaurant];
  if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
  if (cat.includes("services")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event")) return [FALLBACK_IMAGES.event];
  return [FALLBACK_IMAGES.default];
};

// ---------------- Custom Hooks ----------------
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
    checkFavoriteStatus();

    const handleSavedListingsChange = () => {
      checkFavoriteStatus();
    };

    const handleStorageChange = (e) => {
      if (e.key === "userSavedListings") {
        checkFavoriteStatus();
      }
    };

    window.addEventListener("savedListingsUpdated", handleSavedListingsChange);
    window.addEventListener("storage", handleStorageChange);

    const pollInterval = setInterval(checkFavoriteStatus, 1000);

    return () => {
      window.removeEventListener("savedListingsUpdated", handleSavedListingsChange);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [itemId, checkFavoriteStatus]);

  return isFavorite;
};

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
    checkAuth();

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

// Custom hook for fetching listings - SIMPLIFIED
const useListings = (category) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Fetching ${category} listings...`);
        const data = await getListingsByCategory(category);
        setApiResponse(data);
        
        // Handle the API response structure correctly
        if (data && data.status === 'success' && data.data && data.data.listings) {
          const fetchedListings = data.data.listings;
          console.log(`✅ Found ${fetchedListings.length} ${category} listings`);
          setListings(fetchedListings);
          
          // Log status distribution
          const statusCount = fetchedListings.reduce((acc, listing) => {
            acc[listing.status] = (acc[listing.status] || 0) + 1;
            return acc;
          }, {});
          console.log(`📊 ${category} status distribution:`, statusCount);
        } else if (data && data.status === 'error') {
          console.warn(`⚠️ API Error for ${category}:`, data.message);
          setError(data.message || 'API Error');
          setListings([]);
        } else {
          console.warn(`⚠️ Unexpected response structure for ${category}:`, data);
          setListings([]);
        }
      } catch (err) {
        console.error(`❌ Error fetching ${category}:`, err.message);
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [category]);

  return { listings, loading, error, apiResponse };
};

// ---------------- BusinessCard Component ----------------
const BusinessCard = ({ item, category, isMobile }) => {
  const images = getCardImages(item);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageHeight, setImageHeight] = useState(150);

  const isFavorite = useIsFavorite(item._id || item.id);
  const isAuthenticated = useAuthStatus();

  useEffect(() => {
    setImageHeight(isMobile ? 150 : 150);
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
    const price = item.price || "0";
    const formattedPrice = formatPrice(price);
    return `₦${formattedPrice}`;
  };

  const getTag = () => {
    const cat = (item.category || "").toLowerCase();
    if (cat.includes("hotel")) return "Hotel";
    if (cat.includes("shortlet")) return "Shortlet";
    if (cat.includes("restaurant")) return "Restaurant";
    if (cat.includes("services")) return "Service";
    if (cat.includes("event")) return "Event";
    return "Co";
  };

  const tag = getTag();
  const priceText = getPriceText();
  const locationText = item.location?.area || item.area || "Ibadan";
  const rating = "4.9";
  const businessName = item.title || item.name || "Business Name";
  const isPending = item.status === 'pending';

  const handleCardClick = () => {
    if (item._id || item.id) {
      navigate(`/vendor-detail/${item._id || item.id}`);
    } else {
      navigate(`/category/${category}`);
    }
  };

  const showToast = useCallback((message, type = "success") => {
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed z-[9999] px-4 py-3 rounded-lg shadow-sm border ${
      type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"
    }`;

    toast.style.top = "15px";
    toast.style.right = "15px";
    toast.style.left = "15px";
    toast.style.maxWidth = "calc(100% - 30px)";
    toast.style.animation = "slideInRight 0.3s ease-out forwards";

    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="${type === "success" ? "text-green-600" : "text-blue-600"} mt-0.5">
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
          if (toast.parentElement) toast.remove();
        }, 300);
      }
    }, 3000);
  }, [businessName]);

  const handleFavoriteClick = useCallback(async (e) => {
    e.stopPropagation();
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (!isAuthenticated) {
        showToast("Please login to save listings", "info");
        localStorage.setItem("redirectAfterLogin", window.location.pathname);

        const itemToSaveAfterLogin = {
          id: item._id || item.id,
          name: businessName,
          price: priceText,
          rating: parseFloat(rating),
          tag: "Guest Favorite",
          image: images[0] || FALLBACK_IMAGES.default,
          category: capitalizeFirst(category) || "Business",
          location: locationText,
          originalData: {
            price: item.price,
            location: item.location,
            description: item.description,
          },
        };

        localStorage.setItem("pendingSaveItem", JSON.stringify(itemToSaveAfterLogin));

        setTimeout(() => {
          navigate("/login");
          setIsProcessing(false);
        }, 800);
        return;
      }

      const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
      const itemId = item._id || item.id;
      const isAlreadySaved = saved.some(savedItem => savedItem.id === itemId);

      if (isAlreadySaved) {
        const updated = saved.filter(savedItem => savedItem.id !== itemId);
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        showToast("Removed from saved listings", "info");

        window.dispatchEvent(new CustomEvent("savedListingsUpdated", {
          detail: { action: "removed", itemId: itemId },
        }));
      } else {
        const listingToSave = {
          id: itemId || `listing_${Date.now()}`,
          name: businessName,
          price: priceText,
          rating: parseFloat(rating),
          tag: "Guest Favorite",
          image: images[0] || FALLBACK_IMAGES.default,
          category: capitalizeFirst(category) || "Business",
          location: locationText,
          savedDate: new Date().toISOString().split("T")[0],
          originalData: {
            price: item.price,
            location: item.location,
            description: item.description,
            category: item.category,
            status: item.status,
          },
        };

        const updated = [...saved, listingToSave];
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        showToast("Added to saved listings!", "success");

        window.dispatchEvent(new CustomEvent("savedListingsUpdated", {
          detail: { action: "added", item: listingToSave },
        }));
      }
    } catch (error) {
      showToast("Something went wrong. Please try again.", "info");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, item, businessName, priceText, rating, images, category, locationText, showToast, navigate, isAuthenticated]);

  return (
    <div
      className={`
        bg-white rounded-xl overflow-hidden flex-shrink-0 
        font-manrope relative group flex flex-col h-full
        ${isMobile ? "w-[165px]" : "w-[210px]"} 
        transition-all duration-200 cursor-pointer 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
        ${isPending ? 'border border-yellow-300' : ''}
      `}
      onClick={handleCardClick}
      style={{
        height: isMobile ? "280px" : "280px",
        minHeight: isMobile ? "280px" : "280px",
        maxHeight: isMobile ? "280px" : "280px",
        minWidth: isMobile ? "165px" : "165px",
      }}
    >
      {/* Status Badge */}
      {isPending && (
        <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-white px-2 py-0.5 rounded-md shadow-sm z-10">
          <span className="text-[8px] font-semibold">PENDING</span>
        </div>
      )}

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
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGES.default;
            e.currentTarget.onerror = null;
          }}
          loading="lazy"
        />

        {/* Guest favorite badge */}
        {!isPending && (
          <div className="absolute top-1.5 right-12 bg-white px-1 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
            <span className="text-[8px] font-semibold text-gray-900">
              Guest favorite
            </span>
          </div>
        )}

        {/* Heart icon */}
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
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          ) : (
            <MdFavoriteBorder className="text-[#00d1ff] w-3 h-3" />
          )}
        </button>
      </div>

      {/* Text Content */}
      <div className={`flex-1 ${isMobile ? "p-1.5" : "p-2"} flex flex-col`} style={{ minHeight: isMobile ? "130px" : "130px" }}>
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-[13.5px] mb-1 flex-shrink-0">
          {businessName}
        </h3>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-[12.5px] line-clamp-1 mb-1">
              {locationText}
            </p>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-0.5 flex-wrap">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[12px] font-manrope text-gray-900">
                    {priceText}
                  </span>
                  <span className="text-[12px] text-gray-600">
                    {category === 'hotel' || category === 'shortlet' ? 'for 2 nights' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <div className="flex items-center gap-0.5 text-gray-800 text-[12px]">
                  <FontAwesomeIcon icon={faStar} className="text-black w-2 h-2" />
                  <span className="font-semibold text-black">{rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-1">
            <div>
              <span className="inline-block text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            </div>

            {isFavorite && !isProcessing && (
              <span className="inline-flex items-center gap-0.5 text-[9px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
    </div>
  );
};

// ---------------- CategorySection Component ----------------
const CategorySection = ({ title, items, category, isMobile, loading, error, apiResponse }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-gray-900 font-bold" style={{ color: "#000651" }}>
              {isMobile ? <span className="text-[14px]">{title}</span> : <span className="text-xl">{title}</span>}
            </h2>
          </div>
          <button className="text-gray-900 hover:text-[#06EAFC] transition-colors font-medium cursor-pointer flex items-center gap-2 group" style={{ color: "#000651" }} onClick={() => navigate(`/category/${category}`)}>
            {isMobile ? <span className="text-[12px]">View all</span> : <span className="text-[13.5px]">View all</span>}
            <svg className={`transition-transform group-hover:translate-x-1 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div className={`${isMobile ? "flex overflow-x-auto gap-[8px] pb-4 -mx-[16px] pl-[16px] snap-x snap-mandatory" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3"}`}>
          {[...Array(6)].map((_, index) => <SkeletonCard key={index} isMobile={isMobile} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-gray-900 font-bold" style={{ color: "#000651" }}>
              {isMobile ? <span className="text-[14px]">{title}</span> : <span className="text-xl">{title}</span>}
            </h2>
          </div>
          <button className="text-gray-900 hover:text-[#06EAFC] transition-colors font-medium cursor-pointer flex items-center gap-2 group" style={{ color: "#000651" }} onClick={() => navigate(`/category/${category}`)}>
            {isMobile ? <span className="text-[12px]">View all</span> : <span className="text-[13.5px]">View all</span>}
            <svg className={`transition-transform group-hover:translate-x-1 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium text-sm">API Error: {error}</p>
          <p className="text-red-600 text-xs mt-1">Could not fetch listings from backend</p>
        </div>
      </section>
    );
  }

  const handleCategoryClick = () => {
    navigate(`/category/${category}`);
  };

  // Still show only 6 items per category
  const displayItems = items.slice(0, 6);
  const totalResults = apiResponse?.results || 0;
  const pendingCount = items.filter(item => item.status === 'pending').length;

  return (
    <section className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-gray-900 font-bold" style={{ color: "#000651" }}>
            {isMobile ? <span className="text-[14px]">{title}</span> : <span className="text-xl">{title}</span>}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
              ✅ {totalResults} total listings
            </span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
              📊 {displayItems.length} showing
            </span>
            {pendingCount > 0 && (
              <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                ⏳ {pendingCount} pending
              </span>
            )}
          </div>
        </div>
        <button onClick={handleCategoryClick} className="text-gray-900 hover:text-[#06EAFC] transition-colors font-medium cursor-pointer flex items-center gap-2 group" style={{ color: "#000651" }}>
          {isMobile ? <span className="text-[12px]">View all</span> : <span className="text-[13.5px]">View all</span>}
          <svg className={`transition-transform group-hover:translate-x-1 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium text-sm">No listings found</p>
          <p className="text-blue-600 text-xs mt-1">Try checking other categories</p>
        </div>
      ) : (
        <>
          {!isMobile ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {displayItems.map((item, index) => (
                <BusinessCard key={item._id || index} item={item} category={category} isMobile={isMobile} />
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none", paddingRight: "8px" }}>
                {displayItems.map((item, index) => (
                  <BusinessCard key={item._id || index} item={item} category={category} isMobile={isMobile} />
                ))}
                <div className="flex-shrink-0" style={{ width: "8px" }}></div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ---------------- Main Directory Component ----------------
const Directory = () => {
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: false });
  const [isMobile, setIsMobile] = useState(false);
  
  // ONLY 3 CATEGORIES: hotel, shortlet, restaurant
  const categories = [
    { key: 'hotel', name: 'Hotels' },
    { key: 'shortlet', name: 'Shortlets' },
    { key: 'restaurant', name: 'Restaurants' }
  ];
  
  // Fetch listings for each category - NO LIMIT PARAMETER
  const hotelListings = useListings('hotel');
  const shortletListings = useListings('shortlet');
  const restaurantListings = useListings('restaurant');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const categoryData = {
    hotel: hotelListings,
    shortlet: shortletListings,
    restaurant: restaurantListings,
  };

  // Check if any category is still loading
  const initialLoading = categories.some(cat => categoryData[cat.key].loading);
  
  if (initialLoading) return <SkeletonDirectory isMobile={isMobile} />;

  const totalListings = categories.reduce((total, cat) => total + (categoryData[cat.key].apiResponse?.results || 0), 0);

  return (
    <section id="directory" className="bg-white font-manrope">
      <div className={`${isMobile ? "py-0" : "py-8"}`}>
        {isMobile ? (
          <div className="w-full" style={{ paddingLeft: "0.75rem", paddingRight: "0.75rem" }}>
            <motion.div ref={headerRef} initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-4">
              <h1 className="text-lg font-bold text-center mb-2 text-[#00065A]">Explore Categories</h1>
              <p className="text-xs text-gray-600 text-center">Find the best places and services in Ibadan</p>
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-green-700 text-xs font-medium">✅ Connected to Backend API</p>
                <p className="text-green-600 text-xs mt-1">Found {totalListings} total listings</p>
              </div>
            </motion.div>

            <div className="space-y-6">
              {categories.map(({ key, name }) => {
                const { listings, loading, error, apiResponse } = categoryData[key];
                const title = `Popular ${name} in Ibadan`;
                return (
                  <CategorySection 
                    key={key} 
                    title={title} 
                    items={listings} 
                    category={key} 
                    isMobile={isMobile} 
                    loading={loading} 
                    error={error} 
                    apiResponse={apiResponse} 
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div ref={headerRef} initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900 md:text-start">Explore Categories</h1>
              <p className="text-gray-600 md:text-[15px] md:text-start text-[13.5px]">Find the best places and services in Ibadan</p>
              
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-green-800 font-medium">✅ Successfully Connected to Backend API</h3>
                    <p className="text-green-700 text-sm mt-1">Using axiosInstance.get() - Found {totalListings} total listings</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      {categories.map(({ key, name }) => (
                        <div key={key} className="bg-white p-2 rounded border">
                          <p className="font-medium">{name}</p>
                          <p className="text-green-600">{categoryData[key].apiResponse?.results || 0} listings</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {categories.map(({ key, name }) => {
                const { listings, loading, error, apiResponse } = categoryData[key];
                const title = `Popular ${name} in Ibadan`;
                return (
                  <CategorySection 
                    key={key} 
                    title={title} 
                    items={listings} 
                    category={key} 
                    isMobile={isMobile} 
                    loading={loading} 
                    error={error} 
                    apiResponse={apiResponse} 
                  />
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-gray-800 font-medium mb-3">API Integration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-gray-700 font-medium text-sm mb-2">Request Details</h4>
                  <p className="text-gray-600 text-xs">
                    <code className="bg-gray-100 px-2 py-1 rounded text-green-600">GET /listings?category=hotel</code>
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Simple category filtering only. No sorting, no limit, no status filter.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-gray-700 font-medium text-sm mb-2">Total Results</h4>
                  <p className="text-gray-600 text-xs">
                    {totalListings} listings found across 3 categories
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Showing first 6 listings per category (client-side limit)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const styles = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Directory;