import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RiShare2Line } from "react-icons/ri";
import { CiBookmark } from "react-icons/ci";
import { FaPhone, FaRegCircleCheck } from "react-icons/fa6";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import {
  faStar,
  faMapMarkerAlt,
  faWifi,
  faSwimmingPool,
  faCar,
  faUtensils,
  faShieldAlt,
  faChevronLeft,
  faChevronRight,
  faBed,
  faCalendarAlt,
  faUsers,
  faCheckCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { motion } from "framer-motion";

// Google Sheets hook (keep as is)
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

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const imageRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Use your actual Google Sheets data
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Find the specific vendor by ID
  const vendor = listings.find((item) => item.id === id);

  // Check if vendor exists - if not, redirect to 404
  useEffect(() => {
    if (!loading && !error && id && !vendor) {
      // Vendor not found, redirect to 404
      navigate("/404", { replace: true });
    }
  }, [loading, error, id, vendor, navigate]);

  // Check if vendor is already saved on mount
  useEffect(() => {
    if (vendor) {
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );
      const isAlreadySaved = saved.some(
        (savedItem) => savedItem.id === vendor.id
      );
      setIsSaved(isAlreadySaved);
    }
  }, [vendor]);

  // Listen for saved listings updates from other components
  useEffect(() => {
    const handleSavedListingsChange = () => {
      if (vendor) {
        const saved = JSON.parse(
          localStorage.getItem("userSavedListings") || "[]"
        );
        const isAlreadySaved = saved.some(
          (savedItem) => savedItem.id === vendor.id
        );
        setIsSaved(isAlreadySaved);
      }
    };

    // Listen for custom event
    window.addEventListener("savedListingsUpdated", handleSavedListingsChange);

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "userSavedListings") {
        handleSavedListingsChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "savedListingsUpdated",
        handleSavedListingsChange
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [vendor]);

  // Dummy images for carousel (5 images as shown in your reference)
  const dummyImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80",
    "https://images.unsplash.com/photo-1564501049418-3c27787d01e8?w=1200&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
  ];

  // Get images for the vendor
  const getVendorImages = (vendor) => {
    if (!vendor) return dummyImages;

    const raw = vendor["image url"] || "";
    const urls = raw
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u && u.startsWith("http"));

    if (urls.length > 0) {
      const combined = [...urls.slice(0, 5)];
      while (combined.length < 5) {
        combined.push(dummyImages[combined.length % dummyImages.length]);
      }
      return combined.slice(0, 5);
    }

    return dummyImages;
  };

  // Parse features from features column
  const getFeatures = (vendor) => {
    if (!vendor?.features) return [];

    try {
      const parsed = JSON.parse(vendor.features);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return vendor.features
        .split(/[,|]/)
        .map((f) => f.trim())
        .filter((f) => f);
    }

    return [];
  };

  // Parse services from services column
  const getServices = (vendor) => {
    if (!vendor?.services) return [];

    try {
      const parsed = JSON.parse(vendor.services);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return vendor.services
        .split(/[,|]/)
        .map((f) => f.trim())
        .filter((f) => f);
    }

    return [];
  };

  // Get reviews from Google Sheets or use dummy data
  const getReviews = (vendor) => {
    if (vendor?.reviews) {
      try {
        const parsed = JSON.parse(vendor.reviews);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // If parsing fails, use dummy data
      }
    }

    // Default dummy reviews with profile data
    return [
      {
        id: 1,
        name: "Angela Bassey",
        rating: 4,
        comment:
          "Beautiful place. The rooms were clean, the staff were very polite, and check-in was smooth. I loved the breakfast and the calm environment. Definitely coming back.",
        date: "2 weeks ago",
        profileImage: "", // Empty string will show initial
      },
      {
        id: 2,
        name: "Ibrahim O",
        rating: 4,
        comment:
          "The hotel is well maintained and the service quality is very good. WiFi was fast, and the location is perfect for moving around Ibadan. The only issue was slight noise from the hallway at night.",
        date: "1 month ago",
        profileImage: "",
      },
      {
        id: 3,
        name: "Tola & Fola",
        rating: 4,
        comment:
          "The hosted a small event here and everything went perfectly. The hall was clean, the AC worked well, and the staff were helpful throughout. Highly recommended.",
        date: "3 weeks ago",
        profileImage: "",
      },
      {
        id: 4,
        name: "Popoola Basit",
        rating: 4,
        comment:
          "I really enjoyed their service, they are very professional, arrived on time, their decoration beautiful and made my event colourful as well, I absolutely love them.",
        date: "2 days ago",
        profileImage: "",
      },
    ];
  };

  // Format price with Naira symbol
  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US");
  };

  // Get actual price from vendor data
  const getPriceRange = (vendor) => {
    const priceFrom = vendor.price_from || 25000;
    const priceTo = vendor.price_to || 85000;
    return { from: priceFrom, to: priceTo };
  };

  // Get category display name from Google Sheets
  const getCategoryDisplay = (vendor) => {
    if (vendor?.category) {
      const category = vendor.category.toString().trim();

      // Remove numbers and dots at the beginning (like "1. ", "2. ", etc.)
      let cleanedCategory = category.replace(/^\d+\.\s*/, "");

      // If there's still a dot, take text after the last dot
      if (cleanedCategory.includes(".")) {
        const parts = cleanedCategory.split(".");
        cleanedCategory = parts[parts.length - 1].trim();
      }

      // Remove any quotes or extra spaces
      cleanedCategory = cleanedCategory.replace(/['"]/g, "").trim();

      // If empty after cleaning, use fallback
      if (!cleanedCategory) {
        return getFallbackCategory(vendor);
      }

      // Capitalize only first letter
      return (
        cleanedCategory.charAt(0).toUpperCase() +
        cleanedCategory.slice(1).toLowerCase()
      );
    }

    return getFallbackCategory(vendor);
  };

  // Helper function for fallback category
  const getFallbackCategory = (vendor) => {
    if (vendor?.name?.toLowerCase().includes("hotel")) return "Hotel";
    if (vendor?.name?.toLowerCase().includes("restaurant")) return "Restaurant";
    if (vendor?.name?.toLowerCase().includes("shortlet")) return "Shortlet";
    if (vendor?.name?.toLowerCase().includes("event")) return "Event Center";
    if (vendor?.name?.toLowerCase().includes("spa")) return "Spa";
    if (vendor?.name?.toLowerCase().includes("gym")) return "Gym";

    return "Hotel";
  };

  // Get rating from vendor data - ensure it's a proper decimal
  const getRating = (vendor) => {
    if (vendor?.rating) {
      // Handle string values like "4.8", "2.3", etc.
      const ratingValue = parseFloat(vendor.rating);
      return isNaN(ratingValue) ? 4.7 : ratingValue;
    }
    return 4.7; // Default
  };

  // Get review count from vendor data
  const getReviewCount = (vendor) => {
    if (vendor?.review_count) {
      const count = parseInt(vendor.review_count);
      return isNaN(count) ? 9 : count;
    }
    if (vendor?.reviews_count) {
      const count = parseInt(vendor.reviews_count);
      return isNaN(count) ? 9 : count;
    }
    return 9; // Default
  };

  // Get area from vendor data
  const getArea = (vendor) => {
    if (vendor?.area) return vendor.area;
    if (vendor?.location) return vendor.location;
    return "Jericho, Ibadan";
  };

  // Format rating to one decimal place
  const formatRating = (rating) => {
    return rating.toFixed(1); // Shows 4.8, 2.3, etc.
  };

  // Next/Prev image navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }

    setTouchStart(null);
    setTouchEnd(null);
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
      toast.className = `fixed z-50 px-4 py-3 rounded-lg shadow-lg border ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
      }`;

      // Position toast
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
            <p class="text-sm opacity-80 mt-1">${vendor?.name || "Vendor"}</p>
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
    },
    [isMobile, vendor?.name]
  );

  // Check login status
  const checkLoginStatus = () => {
    return localStorage.getItem("ajani_dummy_login") === "true";
  };

  // Handle Call Button Click
  const handleCallClick = () => {
    const isLoggedIn = checkLoginStatus();

    if (!isLoggedIn) {
      showToast("Please login to view contact information", "info");

      // Store current URL for redirect after login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);

      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 800);
      return;
    }

    // User is logged in, show phone number or make call
    if (vendor?.contact) {
      window.location.href = `tel:${vendor.contact}`;
    } else {
      showToast("No contact information available", "info");
    }
  };

  // Handle Booking Button Click
  const handleBookingClick = () => {
    const isLoggedIn = checkLoginStatus();

    if (!isLoggedIn) {
      showToast("Please login to make a booking", "info");

      // Store current URL for redirect after login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);

      // Redirect to login page
      setTimeout(() => {
        navigate("/login");
      }, 800);
      return;
    }

    // User is logged in, proceed with booking
    showToast("Booking feature coming soon!", "info");
    // You can add your booking logic here
  };

  // Handle Bookmark click with login requirement
  const handleBookmarkClick = useCallback(
    async (e) => {
      e?.stopPropagation();

      if (!vendor || isProcessing) return;

      // Immediately show loading state
      setIsProcessing(true);

      try {
        // Check if user is signed in
        const isLoggedIn = checkLoginStatus();

        // If not logged in, show login prompt and redirect to login page
        if (!isLoggedIn) {
          showToast("Please login to save listings", "info");

          // Store the current URL to redirect back after login
          localStorage.setItem("redirectAfterLogin", window.location.pathname);

          // Store the item details to save after login
          const images = getVendorImages(vendor);
          const categoryDisplay = getCategoryDisplay(vendor);
          const priceRange = getPriceRange(vendor);
          const rating = getRating(vendor);
          const area = getArea(vendor);

          // Determine per text based on category
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

            if (
              nightlyCategories.some((cat) =>
                categoryDisplay.toLowerCase().includes(cat)
              )
            ) {
              return "for 2 nights";
            }

            if (
              categoryDisplay.toLowerCase().includes("restaurant") ||
              categoryDisplay.toLowerCase().includes("food") ||
              categoryDisplay.toLowerCase().includes("cafe")
            ) {
              return "per meal";
            }

            return "per guest";
          };

          const itemToSaveAfterLogin = {
            id: vendor.id,
            name: vendor.name || "Vendor",
            price: `₦${formatPrice(priceRange.from)}`,
            perText: getPerText(),
            rating: rating,
            tag: "Guest Favorite",
            image: images[0] || dummyImages[0],
            category: categoryDisplay,
            location: area,
            originalData: {
              price_from: vendor.price_from,
              area: vendor.area,
              rating: vendor.rating,
              description: vendor.description,
              amenities: vendor.amenities,
              contact: vendor.contact,
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
          (savedItem) => savedItem.id === vendor.id
        );

        if (isAlreadySaved) {
          // REMOVE FROM SAVED
          const updated = saved.filter(
            (savedItem) => savedItem.id !== vendor.id
          );
          localStorage.setItem("userSavedListings", JSON.stringify(updated));
          setIsSaved(false);

          // Show toast notification
          showToast("Removed from saved listings", "info");

          // Dispatch event for other components
          window.dispatchEvent(
            new CustomEvent("savedListingsUpdated", {
              detail: { action: "removed", itemId: vendor.id },
            })
          );
        } else {
          // ADD TO SAVED
          const images = getVendorImages(vendor);
          const categoryDisplay = getCategoryDisplay(vendor);
          const priceRange = getPriceRange(vendor);
          const rating = getRating(vendor);
          const area = getArea(vendor);

          // Determine per text based on category
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

            if (
              nightlyCategories.some((cat) =>
                categoryDisplay.toLowerCase().includes(cat)
              )
            ) {
              return "for 2 nights";
            }

            if (
              categoryDisplay.toLowerCase().includes("restaurant") ||
              categoryDisplay.toLowerCase().includes("food") ||
              categoryDisplay.toLowerCase().includes("cafe")
            ) {
              return "per meal";
            }

            return "per guest";
          };

          const listingToSave = {
            id: vendor.id,
            name: vendor.name || "Vendor",
            price: `₦${formatPrice(priceRange.from)}`,
            perText: getPerText(),
            rating: rating,
            tag: "Guest Favorite",
            image: images[0] || dummyImages[0],
            category: categoryDisplay,
            location: area,
            savedDate: new Date().toISOString().split("T")[0],
            originalData: {
              price_from: vendor.price_from,
              area: vendor.area,
              rating: vendor.rating,
              description: vendor.description,
              amenities: vendor.amenities,
              contact: vendor.contact,
              features: vendor.features,
              services: vendor.services,
            },
          };

          const updated = [...saved, listingToSave];
          localStorage.setItem("userSavedListings", JSON.stringify(updated));
          setIsSaved(true);

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
        console.error("Error saving/removing favorite:", error);
        showToast("Something went wrong. Please try again.", "info");
      } finally {
        setIsProcessing(false);
      }
    },
    [vendor, isProcessing, showToast, navigate]
  );

  // Check for pending saves after login (when user returns from login)
  useEffect(() => {
    const pendingSaveItem = JSON.parse(
      localStorage.getItem("pendingSaveItem") || "null"
    );

    if (pendingSaveItem && pendingSaveItem.id === vendor?.id) {
      // Clear the pending save
      localStorage.removeItem("pendingSaveItem");

      // Get existing saved listings
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );

      // Check if already saved (to avoid duplicates)
      const isAlreadySaved = saved.some(
        (savedItem) => savedItem.id === vendor.id
      );

      if (!isAlreadySaved) {
        // Add to saved listings
        const updated = [...saved, pendingSaveItem];
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        setIsSaved(true);

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
  }, [vendor?.id, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-manrope">
        <div className="flex space-x-1">
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
    );
  }

  // If vendor not found and not loading, return null (will redirect to 404)
  if (!vendor) {
    return null;
  }

  // Get data from Google Sheets
  const images = getVendorImages(vendor);
  const features = getFeatures(vendor);
  const services = getServices(vendor);
  const reviews = getReviews(vendor);
  const priceRange = getPriceRange(vendor);
  const categoryDisplay = getCategoryDisplay(vendor);
  const rating = getRating(vendor);
  const formattedRating = formatRating(rating);
  const reviewCount = getReviewCount(vendor);
  const area = getArea(vendor);

  // Default services if none in Google Sheets
  const defaultServices = [
    "Standard, Deluxe & Executive Rooms",
    "Restaurant & Bar",
    "Event & Meeting Spaces",
    "Airport Pickup",
    "Laundry & Concierge Services",
  ];

  // Default features if none in Google Sheets
  const defaultFeatures = [
    { icon: faWifi, name: "WiFi" },
    { icon: faSwimmingPool, name: "Swimming Pool" },
    { icon: faCar, name: "Parking" },
    { icon: faUtensils, name: "Restaurant" },
    { icon: faShieldAlt, name: "24/7 Security" },
  ];

  return (
    <div className="min-h-screen font-manrope">
      <Meta
        title={`${vendor.name} | ${categoryDisplay} in ${area}`}
        description={
          vendor.short_desc ||
          vendor.description ||
          `Discover ${vendor.name} - ${categoryDisplay}`
        }
        url={`https://ajani.ai/vendor/${vendor.id}`}
        image={images[0]}
      />

      <Header />

      <main className="lg:max-w-7xl mx-auto px-0 sm:px-2 md:px-6 lg:px-8 py-4 md:py-6 mt-16">
        {/* MOBILE BACK BUTTON */}
        <div className="md:hidden fixed top-16 left-0 z-50">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Go back"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-gray-800 text-base"
            />
          </button>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-gray-600 mb-4 md:mb-6 px-4 sm:px-2 md:px-0 font-manrope justify-center">
          <Link to="/" className="hover:text-[#06EAFC] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/category/${vendor.category
              ?.toLowerCase()
              .replace(/\s+/g, "-")}`}
            className="hover:text-[#06EAFC] transition-colors"
          >
            {categoryDisplay}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[120px] md:max-w-xs">
            {vendor.name}
          </span>
        </nav>

        {/* Single Column Layout */}
        <div className="space-y-4 md:space-y-8">
          {/* Header Info */}
          <div className="px-4 sm:px-2 md:px-4 lg:px-8 py-4 md:py-8 bg-white rounded-xl md:rounded-2xl mx-0 md:mx-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
              {/* Left: Name and Info */}
              <div className="flex-1">
                {/* Vendor name */}
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900 font-manrope line-clamp-2">
                    {vendor.name}
                  </h1>
                  <VscVerifiedFilled className="text-green-500 text-base md:text-xl" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-8">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium py-1 font-manrope text-xs md:text-sm">
                      {categoryDisplay}
                    </span>
                  </div>

                  {/* Rating with SINGLE star */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400 text-xs md:text-sm"
                      />
                    </div>
                    <span className="font-bold text-gray-900 font-manrope text-xs md:text-sm">
                      {formattedRating}
                    </span>
                    <span className="text-gray-600 font-manrope text-xs md:text-sm">
                      ({reviewCount} Reviews)
                    </span>
                  </div>

                  {/* Area with location icon */}
                  <div className="flex items-center gap-2 text-gray-700 font-manrope text-xs md:text-sm">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-500 text-xs md:text-sm"
                    />
                    <span className="truncate max-w-[150px] md:max-w-none">
                      {area}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Save/Share buttons with login-triggering bookmark functionality */}
              <div className="flex flex-col items-end gap-2 md:gap-4 mt-2 md:mt-0">
                <div className="flex gap-4 md:gap-6 items-center">
                  {/* Share button first */}
                  <div className="flex items-center gap-1 md:gap-2">
                    <button className="w-8 h-8 md:w-10 md:h-10 bg-white border border-gray-200 md:border-2 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <RiShare2Line className="text-gray-600 text-base md:text-xl" />
                    </button>
                    <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline">
                      Share
                    </span>
                  </div>

                  {/* Save/Bookmark button with login requirement */}
                  <div className="flex items-center gap-1 md:gap-2">
                    <button
                      onClick={handleBookmarkClick}
                      disabled={isProcessing}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors border md:border-2 ${
                        isSaved
                          ? "bg-gradient-to-br from-red-500 to-pink-500 border-red-200 hover:from-red-600 hover:to-pink-600"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      } ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
                      title={isSaved ? "Remove from saved" : "Add to saved"}
                      aria-label={
                        isSaved ? "Remove from saved" : "Save this vendor"
                      }
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isSaved ? (
                        <svg
                          className="w-5 h-5 text-white"
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
                        <CiBookmark className="text-base md:text-xl text-gray-600" />
                      )}
                    </button>
                    <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline">
                      {isProcessing
                        ? "Processing..."
                        : isSaved
                        ? "Saved"
                        : "Save"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE: Swipeable Image Gallery */}
          <div className="block md:hidden px-0">
            <div className="relative w-full">
              <div
                className="relative w-full h-[320px] rounded-none md:rounded-2xl overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={imageRef}
              >
                <img
                  src={images[activeImageIndex]}
                  alt={`${vendor.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Prev Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <IoIosArrowBack className="text-gray-800 text-lg" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <IoIosArrowForward className="text-gray-800 text-lg" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-manrope backdrop-blur-sm">
                  {activeImageIndex + 1}/{images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 px-4 mt-0">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === activeImageIndex
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP: Original Image Gallery */}
          <div className="hidden md:block p-4">
            <div className="flex gap-4">
              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-4">
                {images.slice(1, 3).map((img, i) => (
                  <button key={i} onClick={() => setActiveImageIndex(i + 1)}>
                    <img
                      src={img}
                      style={{
                        width: "305px",
                        height: "251px",
                        borderRadius: "20px",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* CENTER LARGE IMAGE */}
              <div className="relative">
                <img
                  src={images[activeImageIndex]}
                  style={{
                    width: "630px",
                    height: "517px",
                    borderRadius: "20px",
                    objectFit: "cover",
                  }}
                />

                {/* Prev Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <IoIosArrowBack className="text-gray-800 text-xl" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                >
                  <IoIosArrowForward className="text-gray-800 text-xl" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-manrope">
                  {activeImageIndex + 1}/{images.length}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col gap-4">
                {images.slice(3, 5).map((img, i) => (
                  <button key={i} onClick={() => setActiveImageIndex(i + 3)}>
                    <img
                      src={img}
                      style={{
                        width: "305px",
                        height: "251px",
                        borderRadius: "20px",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range Section */}
          <div className="px-0 md:px-0">
            <div className="text-center bg-white py-4 md:py-6 mx-0 md:mx-0">
              <p className="text-[#00065A] font-manrope text-base md:text-xl font-bold mb-2 md:text-start px-4 sm:px-2 md:px-0">
                Price Range
              </p>
              <div className="flex md:justify-start flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-4 sm:px-2 md:px-0">
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="text-xl md:text-2xl text-gray-900 font-manrope font-bold">
                    ₦{formatPrice(priceRange.from)}
                  </span>
                  <span className="text-gray-500 text-xl">-</span>
                  <span className="text-xl md:text-2xl text-gray-900 font-manrope font-bold">
                    ₦{formatPrice(priceRange.to)}
                  </span>
                </div>
                <span className="text-gray-600 text-sm md:text-base mt-1 md:mt-0 md:ml-3">
                  per night
                </span>
              </div>
            </div>
          </div>

          {/* Action Icons Bar */}
          <div className="flex justify-center px-0 md:px-0">
            <div className="w-full md:w-[600px] h-14 md:h-16 bg-gray-200 rounded-none md:rounded-3xl flex items-center justify-between px-4 md:px-12 mx-0 md:mx-0">
              {/* Call Button with login check */}
              <button
                onClick={handleCallClick}
                className="flex flex-col items-center hover:opacity-80 transition-opacity px-2"
              >
                <FaPhone size={24} color="#000" />
                <span className="text-xs mt-1 font-manrope">Call</span>
              </button>

              {/* Chat Button */}
              <button
                onClick={() => showToast("Chat feature coming soon!", "info")}
                className="flex flex-col items-center hover:opacity-80 transition-opacity px-2"
              >
                <IoChatbubbleEllipsesOutline size={24} color="#000" />
                <span className="text-xs mt-1 font-manrope">Chat</span>
              </button>

              {/* Booking Button with login check */}
              <button
                onClick={handleBookingClick}
                className="flex flex-col items-center hover:opacity-80 transition-opacity px-2"
              >
                <FaBookOpen size={24} color="#000" />
                <span className="text-xs mt-1 font-manrope">Book</span>
              </button>

              {/* Map Button */}
              <button
                onClick={() => showToast("Map feature coming soon!", "info")}
                className="flex flex-col items-center hover:opacity-80 transition-opacity px-2"
              >
                <HiLocationMarker size={24} color="#000" />
                <span className="text-xs mt-1 font-manrope">Map</span>
              </button>
            </div>
          </div>

          {/* About and Features Section */}
          <section className="w-full bg-[#F7F7FA] rounded-none md:rounded-3xl">
            <div className="px-4 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
              {/* About Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-lg md:text-xl font-bold text-[#06F49F] mb-3 md:mb-4 font-manrope">
                  About
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base font-manrope">
                  {vendor.description ||
                    vendor.short_desc ||
                    "Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan. Designed for both business and leisure travelers, the hotel provides a peaceful stay with quick access to major city landmarks."}
                </p>
              </div>

              {/* What They Do & Features Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* What They Do Section */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-4 md:mb-6 font-manrope">
                    What They Do
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {(services.length > 0 ? services : defaultServices).map(
                      (service, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 md:gap-4"
                        >
                          <div className="flex-shrink-0 mt-0.5 md:mt-1">
                            <FaRegCircleCheck
                              size={18}
                              className="text-[#06EAFC]"
                            />
                          </div>
                          <span className="text-gray-700 font-manrope leading-relaxed text-sm md:text-sm">
                            {service}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Key Features Section */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-4 md:mb-6 font-manrope">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {(features.length > 0
                      ? features.slice(0, 6).map((feature, index) => ({
                          icon: defaultFeatures[index % defaultFeatures.length]
                            .icon,
                          name: feature,
                        }))
                      : defaultFeatures
                    ).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 md:gap-3"
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={feature.icon}
                            className="text-sm md:text-base text-gray-900"
                          />
                        </div>
                        <span className="font-medium text-gray-900 font-manrope text-xs md:text-sm">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-[#F7F7FA] rounded-none md:rounded-3xl shadow-sm md:shadow-lg p-4 md:p-8 mx-0 md:mx-0">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[#06F49F] font-manrope">
                Reviews
              </h2>
              <span className="text-gray-600 font-manrope text-xs md:text-sm">
                {reviewCount} reviews
              </span>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {/* Review Header with Profile */}
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-3">
                      {/* Profile Image */}
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                        {review.profileImage ? (
                          <img
                            src={review.profileImage}
                            alt={review.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base md:text-lg font-bold text-blue-600">
                            {review.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Name and Rating */}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm md:text-base font-manrope">
                          {review.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                          {/* Star rating */}
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FontAwesomeIcon
                                key={i}
                                icon={faStar}
                                className={`text-xs md:text-sm ${
                                  i < Math.floor(review.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-700 font-medium ml-1 text-xs md:text-sm">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed font-manrope text-xs md:text-sm line-clamp-3 md:line-clamp-none">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>

            {/* Load More Reviews Button */}
            {reviewCount > 4 && (
              <div className="text-center mt-6 md:mt-8">
                <button className="px-4 py-2 md:px-6 md:py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors font-manrope text-sm">
                  Load More Reviews
                </button>
              </div>
            )}
          </section>

          {/* Location Map */}
          <div className="p-0 md:p-8 mx-0 md:mx-0">
            <h3 className="text-lg font-bold text-gray-900 mb-3 md:mb-4 font-manrope px-4 sm:px-4 md:px-0">
              Location
            </h3>

            <div className="relative rounded-none md:rounded-2xl overflow-hidden h-64 md:h-96">
              {vendor.lat && vendor.long ? (
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    parseFloat(vendor.long) - 0.01
                  }%2C${parseFloat(vendor.lat) - 0.01}%2C${
                    parseFloat(vendor.long) + 0.01
                  }%2C${parseFloat(vendor.lat) + 0.01}&layer=mapnik&marker=${
                    vendor.lat
                  }%2C${vendor.long}`}
                  className="w-full h-full border-0"
                  title="Location Map"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-blue-600 text-lg md:text-xl"
                      />
                    </div>
                    <p className="text-gray-700 font-medium font-manrope text-sm">
                      {area}
                    </p>
                    <p className="text-gray-500 text-xs mt-2 font-manrope">
                      No coordinates available
                    </p>
                  </div>
                </div>
              )}

              {/* Location Info Card */}
              <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg max-w-[180px] md:max-w-xs">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-blue-600 text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-manrope text-xs md:text-sm line-clamp-1">
                      {vendor.name}
                    </h4>
                    <p className="text-gray-600 text-xs font-manrope line-clamp-1">
                      {area}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="mt-4 md:mt-6 flex flex-col md:flex-row gap-3 px-4 sm:px-4 md:px-0">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${vendor.name} ${area}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors font-manrope text-sm flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Open in Google Maps
              </a>
              {vendor.lat && vendor.long && (
                <a
                  href={`https://www.openstreetmap.org/#map=15/${vendor.lat}/${vendor.long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors font-manrope text-sm flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  Open in OSM
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDetail;
