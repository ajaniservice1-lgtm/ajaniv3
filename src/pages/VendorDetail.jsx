import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faStar, 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt,
  faCalendar,
  faUsers,
  faBed,
  faUtensils,
  faMusic,
  faWifi,
  faCar,
  faSwimmingPool,
  faSpa,
  faDumbbell,
  faCheckCircle,
  faChevronLeft,
  faArrowLeft,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import { CiBookmark } from "react-icons/ci";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { RiShare2Line } from "react-icons/ri";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Fallback images for different categories
const FALLBACK_IMAGES = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  event: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
};

// Category normalization utility
const normalizeCategory = (category) => {
  if (!category) return 'restaurant';
  
  const cat = category.toString().toLowerCase().trim();
  
  // Handle categories with slashes
  if (cat.includes("/")) {
    const parts = cat.split("/").map(part => part.trim());
    for (const part of parts) {
      if (part.includes('restaurant') || part.includes('food') || part.includes('cafe') || part.includes('eatery')) {
        return 'restaurant';
      }
      if (part.includes('hotel') || part.includes('shortlet') || part.includes('resort') || part.includes('inn')) {
        return 'hotel';
      }
      if (part.includes('event') || part.includes('venue') || part.includes('hall') || part.includes('center')) {
        return 'event';
      }
    }
    if (cat.includes('food')) return 'restaurant';
  }
  
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('eatery') || cat.includes('diner') || cat.includes('bistro')) {
    return 'restaurant';
  }
  if (cat.includes('hotel') || cat.includes('shortlet') || cat.includes('resort') || cat.includes('inn') || cat.includes('motel') || cat.includes('lodging')) {
    return 'hotel';
  }
  if (cat.includes('event') || cat.includes('venue') || cat.includes('hall') || cat.includes('center') || cat.includes('conference') || cat.includes('meeting')) {
    return 'event';
  }
  
  return 'restaurant';
};

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const imageRef = useRef(null);

  // Scroll to top on component mount and when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
        
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:Z1000?key=${API_KEY}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        let vendors = [];
        
        if (json.values && Array.isArray(json.values) && json.values.length > 1) {
          const headers = json.values[0];
          const rows = json.values.slice(1);
          
          vendors = rows
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
          
          // Find vendor by ID
          const foundVendor = vendors.find((v) => v.id === id);
          
          if (foundVendor) {
            setVendor(foundVendor);
            
            // Check if vendor is in favorites
            const savedListings = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
            setIsFavorite(savedListings.some(item => item.id === id));
          } else {
            setError("Vendor not found");
          }
        } else {
          setError("No vendor data available");
        }
      } catch (err) {
        console.error("Error fetching vendor:", err);
        setError("Failed to load vendor details");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  // Get vendor images - returns 5 images
  const getVendorImages = () => {
    if (!vendor) return [];
    
    const imageUrls = (vendor["image url"] || "")
      .split(",")
      .map(url => url.trim())
      .filter(url => url && url.startsWith("http"));
    
    const category = normalizeCategory(vendor.category);
    const fallbackImage = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
    
    if (imageUrls.length === 0) {
      return Array(5).fill(fallbackImage);
    } else if (imageUrls.length >= 5) {
      return imageUrls.slice(0, 5);
    } else {
      const filledImages = [...imageUrls];
      while (filledImages.length < 5) {
        filledImages.push(fallbackImage);
      }
      return filledImages.slice(0, 5);
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  // Get amenities list
  const getAmenities = () => {
    if (vendor?.amenities) {
      return vendor.amenities.split(",").map(item => item.trim()).filter(item => item);
    }
    
    const category = normalizeCategory(vendor?.category);
    if (category === 'hotel') {
      return ["Free WiFi", "Swimming Pool", "Parking", "Air Conditioning", "Restaurant", "Spa", "Gym"];
    } else if (category === 'restaurant') {
      return ["Outdoor Seating", "Live Music", "Parking", "Takeaway", "Vegetarian Options", "Alcohol Served"];
    } else if (category === 'event') {
      return ["Stage", "Sound System", "Lighting", "Parking", "Catering Service", "Decoration Service"];
    }
    
    return ["Not specified"];
  };

  // Next/Prev image navigation
  const nextImage = () => {
    const images = getVendorImages();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getVendorImages();
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

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle booking button click
  const handleBookingClick = () => {
    if (!vendor) return;
    
    const vendorBookingData = {
      id: vendor.id,
      name: vendor.name,
      category: normalizeCategory(vendor.category),
      originalCategory: vendor.category,
      priceFrom: vendor.price_from,
      priceTo: vendor.price_to,
      area: vendor.area,
      contact: vendor.contact,
      email: vendor.email,
      description: vendor.description,
      rating: vendor.rating,
      capacity: vendor.capacity,
      amenities: vendor.amenities
    };
    
    localStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    navigate(`/booking/${vendor.id}`);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!vendor || isProcessing) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const savedListings = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
      
      if (isFavorite) {
        const updated = savedListings.filter(item => item.id !== id);
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        setIsFavorite(false);
        showToast("Removed from saved listings", "info");
      } else {
        const category = normalizeCategory(vendor.category);
        const listingToSave = {
          id: vendor.id,
          name: vendor.name,
          price: vendor.price_from,
          perText: category === 'hotel' ? 'per night' : 
                   category === 'restaurant' ? 'per meal' : 
                   'per guest',
          rating: parseFloat(vendor.rating || "4.5"),
          tag: "Guest Favorite",
          image: getVendorImages()[0],
          category: vendor.category || "Business",
          location: vendor.area || "Ibadan",
          savedDate: new Date().toISOString().split("T")[0],
          originalData: vendor
        };
        
        const updated = [...savedListings, listingToSave];
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        setIsFavorite(true);
        showToast("Added to saved listings!", "success");
      }
      
      window.dispatchEvent(new Event("savedListingsUpdated"));
      setIsProcessing(false);
    }, 300);
  };

  // Toast notification function
  const showToast = (message, type = "success") => {
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed z-50 px-4 py-3 rounded-lg shadow-lg border ${
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
        <div class="${type === "success" ? "text-green-600" : "text-blue-600"} mt-0.5">
          ${type === "success" 
            ? '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
            : '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'}
        </div>
        <div class="flex-1">
          <p class="font-medium">${message}</p>
          <p class="text-sm opacity-80 mt-1">${vendor?.name || "Vendor"}</p>
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
  };

  // Helper functions
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'hotel': return faBed;
      case 'restaurant': return faUtensils;
      case 'event': return faMusic;
      default: return faUtensils;
    }
  };

  const getAmenityIcon = (amenity) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi')) return faWifi;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return faCar;
    if (lowerAmenity.includes('pool')) return faSwimmingPool;
    if (lowerAmenity.includes('spa')) return faSpa;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return faDumbbell;
    if (lowerAmenity.includes('music')) return faMusic;
    if (lowerAmenity.includes('food') || lowerAmenity.includes('restaurant') || lowerAmenity.includes('meal')) return faUtensils;
    if (lowerAmenity.includes('bed') || lowerAmenity.includes('room') || lowerAmenity.includes('sleep')) return faBed;
    return faCheckCircle;
  };

  // Get category display name
  const getCategoryDisplay = (vendor) => {
    if (vendor?.category) {
      const category = vendor.category.toString().trim();
      let cleanedCategory = category.replace(/^\d+\.\s*/, "");
      
      if (cleanedCategory.includes(".")) {
        const parts = cleanedCategory.split(".");
        cleanedCategory = parts[parts.length - 1].trim();
      }
      
      cleanedCategory = cleanedCategory.replace(/['"]/g, "").trim();
      
      if (!cleanedCategory) {
        return getFallbackCategory(vendor);
      }
      
      return cleanedCategory.charAt(0).toUpperCase() + cleanedCategory.slice(1).toLowerCase();
    }
    
    return getFallbackCategory(vendor);
  };

  const getFallbackCategory = (vendor) => {
    if (vendor?.name?.toLowerCase().includes("hotel")) return "Hotel";
    if (vendor?.name?.toLowerCase().includes("restaurant")) return "Restaurant";
    if (vendor?.name?.toLowerCase().includes("shortlet")) return "Shortlet";
    if (vendor?.name?.toLowerCase().includes("event")) return "Event Center";
    return "Hotel";
  };

  // Get review count
  const getReviewCount = () => {
    if (vendor?.review_count) {
      const count = parseInt(vendor.review_count);
      return isNaN(count) ? 9 : count;
    }
    return 9;
  };

  // Get features list
  const getFeatures = () => {
    const defaultFeatures = [
      { icon: faWifi, name: "WiFi" },
      { icon: faSwimmingPool, name: "Swimming Pool" },
      { icon: faCar, name: "Parking" },
      { icon: faUtensils, name: "Restaurant" },
      { icon: faShieldAlt, name: "24/7 Security" },
    ];
    return defaultFeatures;
  };

  // Get services list
  const getServices = () => {
    const defaultServices = [
      "Standard, Deluxe & Executive Rooms",
      "Restaurant & Bar",
      "Event & Meeting Spaces",
      "Airport Pickup",
      "Laundry & Concierge Services",
    ];
    return defaultServices;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06EAFC]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !vendor) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors"
          >
            Return Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getVendorImages();
  const category = normalizeCategory(vendor.category);
  const amenities = getAmenities();
  const features = getFeatures();
  const services = getServices();
  const reviewCount = getReviewCount();
  const categoryDisplay = getCategoryDisplay(vendor);

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="pt-14 md:pt-14"> {/* Reduced top padding */}
        {/* MOBILE BACK BUTTON */}
        <div className="md:hidden fixed top-16 left-0 z-50">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
            aria-label="Go back"
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="text-gray-800 text-base"
            />
          </button>
        </div>

        {/* Breadcrumb - Reduced margins */}
        <nav className="flex items-center space-x-2 text-xs text-gray-600 mb-2 md:mb-2 px-4 sm:px-2 md:px-0 font-manrope justify-center"> {/* Reduced mb-4 to mb-2 */}
          <Link
            to="/"
            className="hover:text-[#06EAFC] transition-colors hover:underline"
            style={{ cursor: "pointer" }}
          >
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-[#06EAFC] transition-colors hover:underline"
            style={{ cursor: "pointer" }}
          >
            {categoryDisplay}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-[120px] md:max-w-xs">
            {vendor.name}
          </span>
        </nav>

        {/* Single Column Layout */}
        <div className="space-y-3 md:space-y-6"> {/* Reduced space between sections */}
          {/* Header Info - Reduced top padding */}
          <div className="px-4 sm:px-2 md:px-4 lg:px-8 py-3 md:py-6 bg-white rounded-xl md:rounded-2xl mx-0 md:mx-0 hover:shadow-lg transition-shadow duration-300"> {/* Reduced py-4 to py-3, py-8 to py-6 */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
              {/* Left: Name and Info */}
              <div className="flex-1">
                {/* Vendor name */}
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2"> {/* Reduced mb-2 to mb-1 */}
                  <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900 font-manrope line-clamp-2">
                    {vendor.name}
                  </h1>
                  <VscVerifiedFilled className="text-green-500 text-base md:text-xl hover:scale-110 transition-transform duration-200" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-8">
                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium py-1 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200">
                      {categoryDisplay}
                    </span>
                  </div>

                  {/* Rating with star */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 hover:scale-105 transition-transform duration-200">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400 text-xs md:text-sm hover:text-yellow-500 transition-colors duration-200"
                      />
                    </div>
                    <span className="font-bold text-gray-900 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200">
                      {vendor.rating || "4.5"}
                    </span>
                    <span className="text-gray-600 font-manrope text-xs md:text-sm hover:text-gray-800 transition-colors duration-200">
                      ({reviewCount} Reviews)
                    </span>
                  </div>

                  {/* Area with location icon */}
                  <div className="flex items-center gap-2 text-gray-700 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-500 text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200"
                    />
                    <span className="truncate max-w-[150px] md:max-w-none">
                      {vendor.area || "Ibadan"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Save/Share buttons */}
              <div className="flex flex-col items-end gap-2 md:gap-4 mt-2 md:mt-0">
                <div className="flex gap-4 md:gap-6 items-center">
                  {/* Share button */}
                  <div className="flex items-center gap-1 md:gap-2 group relative">
                    <button
                      className="w-8 h-8 md:w-10 md:h-10 bg-white border border-gray-200 md:border-2 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer group"
                      style={{ cursor: "pointer" }}
                    >
                      <RiShare2Line className="text-gray-600 text-base md:text-xl group-hover:text-[#06EAFC] transition-colors duration-300" />
                    </button>
                    <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline group-hover:text-[#06EAFC] transition-colors duration-300">
                      Share
                    </span>
                    <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                      Share this vendor
                      <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>

                  {/* Save/Bookmark button */}
                  <div className="flex items-center gap-1 md:gap-2 group relative">
                    <button
                      onClick={handleFavoriteToggle}
                      disabled={isProcessing}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border md:border-2 cursor-pointer group
                        ${
                          isFavorite
                            ? "bg-gradient-to-br from-red-500 to-pink-500 border-red-200 hover:from-red-600 hover:to-pink-600 hover:scale-110 hover:shadow-lg"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:scale-110 hover:shadow-md"
                        } ${
                        isProcessing
                          ? "opacity-70 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      title={isFavorite ? "Remove from saved" : "Add to saved"}
                      aria-label={
                        isFavorite ? "Remove from saved" : "Save this vendor"
                      }
                      style={{
                        cursor: isProcessing ? "not-allowed" : "pointer",
                      }}
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isFavorite ? (
                        <svg
                          className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300"
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
                        <CiBookmark className="text-base md:text-xl text-gray-600 group-hover:text-[#06EAFC] group-hover:scale-110 transition-all duration-300" />
                      )}
                    </button>
                    <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline group-hover:text-[#06EAFC] transition-colors duration-300">
                      {isProcessing
                        ? "Processing..."
                        : isFavorite
                        ? "Saved"
                        : "Save"}
                    </span>
                    <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                      {isFavorite ? "Remove from saved" : "Save this vendor"}
                      <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MOBILE: Swipeable Image Gallery */}
          <div className="block md:hidden px-0">
            <div className="relative w-full">
              <div
                className="relative w-full h-[300px] rounded-none md:rounded-2xl overflow-hidden" 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={imageRef}
              >
                <img
                  src={images[activeImageIndex]}
                  alt={`${vendor.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />

                {/* Prev Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ cursor: "pointer" }}
                >
                  <IoIosArrowBack className="text-gray-800 text-lg hover:text-[#06EAFC] transition-colors duration-300" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ cursor: "pointer" }}
                >
                  <IoIosArrowForward className="text-gray-800 text-lg hover:text-[#06EAFC] transition-colors duration-300" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-manrope backdrop-blur-sm hover:bg-black/80 transition-colors duration-300">
                  {activeImageIndex + 1}/{images.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 px-4 mt-0">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 hover:scale-105 hover:shadow-md transition-all duration-300 cursor-pointer ${
                      index === activeImageIndex
                        ? "border-blue-500"
                        : "border-transparent hover:border-blue-300"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP: Modified 5 Image Gallery with further reduced height */}
          <div className="hidden md:block px-4 lg:px-8">
            <div className="flex gap-4">
              {/* LEFT COLUMN - 2 images */}
              <div className="flex flex-col gap-4">
                {images.slice(1, 3).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i + 1)}
                    className="hover:scale-105 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer"
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      style={{
                        width: "305px",
                        height: "162px", // Reduced from 180px (10% more reduction)
                        borderRadius: "16px",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* CENTER LARGE IMAGE - Reduced height by additional 10% */}
              <div className="relative group">
                <img
                  src={images[activeImageIndex]}
                  className="group-hover:scale-105 transition-transform duration-500"
                  style={{
                    width: "630px",
                    height: "324px", // Reduced from 360px (10% more reduction)
                    borderRadius: "16px",
                    objectFit: "cover",
                  }}
                />

                {/* Prev Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ cursor: "pointer" }}
                >
                  <IoIosArrowBack className="text-gray-800 text-xl hover:text-[#06EAFC] transition-colors duration-300" />
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ cursor: "pointer" }}
                >
                  <IoIosArrowForward className="text-gray-800 text-xl hover:text-[#06EAFC] transition-colors duration-300" />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-manrope hover:bg-black/80 transition-colors duration-300">
                  {activeImageIndex + 1}/{images.length}
                </div>
              </div>

              {/* RIGHT COLUMN - 2 images */}
              <div className="flex flex-col gap-4">
                {images.slice(3, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i + 3)}
                    className="hover:scale-105 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer"
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      style={{
                        width: "305px",
                        height: "162px", // Reduced from 180px (10% more reduction)
                        borderRadius: "16px",
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
            <div className="text-center bg-white py-4 md:py-6 mx-0 md:mx-0 hover:shadow-md transition-shadow duration-300 rounded-xl">
              <p className="text-[#00065A] font-manrope text-base md:text-xl font-bold mb-2 md:text-start px-4 sm:px-2 md:px-0 hover:text-[#06EAFC] transition-colors duration-300">
                Price Range
              </p>
              <div className="flex md:justify-start flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-4 sm:px-2 md:px-0">
                <div className="flex items-center gap-1 md:gap-2 hover:scale-105 transition-transform duration-300">
                  <span className="text-xl md:text-2xl text-gray-900 font-manrope font-bold hover:text-[#06EAFC] transition-colors duration-300">
                    {formatPrice(vendor.price_from)}
                  </span>
                  <span className="text-gray-500 text-xl hover:text-gray-700 transition-colors duration-300">
                    -
                  </span>
                  <span className="text-xl md:text-2xl text-gray-900 font-manrope font-bold hover:text-[#06EAFC] transition-colors duration-300">
                    {formatPrice(vendor.price_to || vendor.price_from)}
                  </span>
                </div>
                <span className="text-gray-600 text-sm md:text-base mt-1 md:mt-0 md:ml-3 hover:text-gray-800 transition-colors duration-300">
                  {category === 'hotel' ? 'per night' : 
                   category === 'restaurant' ? 'per meal' : 
                   'per guest'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Icons Bar - Matching second design width */}
          <div className="flex justify-center px-0 md:px-0">
            <div className="w-full md:w-[600px] h-14 md:h-16 bg-gray-200 rounded-none md:rounded-3xl flex items-center justify-between px-4 md:px-12 mx-0 md:mx-0 hover:shadow-lg transition-all duration-300 hover:bg-gray-300/50">
              {/* Call Button with enhanced hover effects */}
              <button
                onClick={() => vendor.contact && (window.location.href = `tel:${vendor.contact}`)}
                className="flex flex-col items-center transition-all duration-300 px-2 group relative"
                style={{ cursor: "pointer" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-blue-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FontAwesomeIcon
                    icon={faPhone}
                    size={20}
                    className="text-gray-700 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-110"
                  />
                </div>
                <span className="text-xs mt-1 font-manrope text-gray-700 group-hover:text-blue-600 transition-colors duration-300 relative">
                  Call
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </span>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                  Call vendor
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </button>

              {/* Chat Button with enhanced hover effects */}
              <button
                onClick={() => showToast("Chat feature coming soon!", "info")}
                className="flex flex-col items-center transition-all duration-300 px-2 group relative"
                style={{ cursor: "pointer" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-green-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <IoChatbubbleEllipsesOutline
                    size={22}
                    className="text-gray-700 group-hover:text-green-600 transition-all duration-300 transform group-hover:scale-110"
                  />
                </div>
                <span className="text-xs mt-1 font-manrope text-gray-700 group-hover:text-green-600 transition-colors duration-300 relative">
                  Chat
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </span>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                  Chat with vendor
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </button>

              {/* Booking Button with enhanced hover effects */}
              <button
                onClick={handleBookingClick}
                className="flex flex-col items-center transition-all duration-300 px-2 group relative"
                style={{ cursor: "pointer" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-purple-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FaBookOpen
                    size={20}
                    className="text-gray-700 group-hover:text-purple-600 transition-all duration-300 transform group-hover:scale-110"
                  />
                </div>
                <span className="text-xs mt-1 font-manrope text-gray-700 group-hover:text-purple-600 transition-colors duration-300 relative">
                  Book
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
                </span>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                  Make a booking
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </button>

              {/* Map Button with enhanced hover effects */}
              <button
                onClick={() => showToast("Map feature coming soon!", "info")}
                className="flex flex-col items-center transition-all duration-300 px-2 group relative"
                style={{ cursor: "pointer" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-red-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <HiLocationMarker
                    size={22}
                    className="text-gray-700 group-hover:text-red-600 transition-all duration-300 transform group-hover:scale-110"
                  />
                </div>
                <span className="text-xs mt-1 font-manrope text-gray-700 group-hover:text-red-600 transition-colors duration-300 relative">
                  Map
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </span>
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                  View on map
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              </button>
            </div>
          </div>

          {/* About and Features Section */}
          <section className="w-full bg-[#F7F7FA] rounded-none md:rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="px-4 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
              {/* About Section */}
              <div className="mb-8 md:mb-12">
                <h2 className="text-lg md:text-xl font-bold text-[#06F49F] mb-3 md:mb-4 font-manrope hover:text-[#05d9eb] transition-colors duration-300">
                  About
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base font-manrope hover:text-gray-800 transition-colors duration-300">
                  {vendor.description ||
                    "Welcome to our premium venue, offering exceptional service and unforgettable experiences. With modern amenities and professional staff, we ensure your stay is comfortable and memorable."}
                </p>
              </div>

              {/* What They Do & Features Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* What They Do Section */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-4 md:mb-6 font-manrope hover:text-[#06EAFC] transition-colors duration-300">
                    What They Do
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 md:gap-4 hover:translate-x-1 transition-transform duration-300 group cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="flex-shrink-0 mt-0.5 md:mt-1 group-hover:scale-110 transition-transform duration-300">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            size={18}
                            className="text-[#06EAFC] group-hover:text-[#05d9eb] transition-colors duration-300"
                          />
                        </div>
                        <span className="text-gray-700 font-manrope leading-relaxed text-sm md:text-sm group-hover:text-gray-900 transition-colors duration-300">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Features Section */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-4 md:mb-6 font-manrope hover:text-[#06EAFC] transition-colors duration-300">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 md:gap-3 hover:translate-x-1 transition-transform duration-300 group cursor-pointer"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FontAwesomeIcon
                            icon={feature.icon}
                            className="text-sm md:text-base text-gray-900 group-hover:text-[#06EAFC] transition-colors duration-300"
                          />
                        </div>
                        <span className="font-medium text-gray-900 font-manrope text-xs md:text-sm group-hover:text-gray-700 transition-colors duration-300">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"> {/* Reduced mt-8 to mt-6 */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {["overview", "amenities", "reviews", "location"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-[#06EAFC] text-[#06EAFC]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="py-6"> {/* Reduced py-8 to py-6 */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">About {vendor.name}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {vendor.description || `Welcome to ${vendor.name}, one of the finest ${category}s in ${vendor.area || "Ibadan"}. 
                    With a rating of ${vendor.rating || "4.5"} stars, we pride ourselves on delivering exceptional service and 
                    unforgettable experiences.`}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6"> {/* Reduced mt-8 to mt-6 */}
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <h4 className="font-bold text-gray-900 mb-4 hover:text-[#06EAFC] transition-colors duration-300">Key Features</h4>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300">
                          <div className="w-8 h-8 rounded-full bg-[#06EAFC]/10 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                            <FontAwesomeIcon icon={faCalendar} className="text-[#06EAFC] hover:text-[#05d9eb] transition-colors duration-300" />
                          </div>
                          <span className="hover:text-[#06EAFC] transition-colors duration-300">Available for booking year-round</span>
                        </li>
                        {vendor.capacity && (
                          <li className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300">
                            <div className="w-8 h-8 rounded-full bg-[#06EAFC]/10 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                              <FontAwesomeIcon icon={faUsers} className="text-[#06EAFC] hover:text-[#05d9eb] transition-colors duration-300" />
                            </div>
                            <span className="hover:text-[#06EAFC] transition-colors duration-300">Capacity: {vendor.capacity} guests</span>
                          </li>
                        )}
                        <li className="flex items-center gap-3 hover:translate-x-1 transition-transform duration-300">
                          <div className="w-8 h-8 rounded-full bg-[#06EAFC]/10 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                            <FontAwesomeIcon icon={getCategoryIcon(category)} className="text-[#06EAFC] hover:text-[#05d9eb] transition-colors duration-300" />
                          </div>
                          <span className="hover:text-[#06EAFC] transition-colors duration-300 capitalize">{category} services</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <h4 className="font-bold text-gray-900 mb-4 hover:text-[#06EAFC] transition-colors duration-300">Pricing Information</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center hover:bg-gray-100 p-2 rounded-lg transition-colors duration-300">
                          <span className="hover:text-gray-800 transition-colors duration-300">Standard Rate</span>
                          <span className="font-bold hover:text-[#06EAFC] transition-colors duration-300">{formatPrice(vendor.price_from)}</span>
                        </div>
                        {vendor.price_to && vendor.price_to !== vendor.price_from && (
                          <div className="flex justify-between items-center hover:bg-gray-100 p-2 rounded-lg transition-colors duration-300">
                            <span className="hover:text-gray-800 transition-colors duration-300">Premium Rate</span>
                            <span className="font-bold hover:text-[#06EAFC] transition-colors duration-300">{formatPrice(vendor.price_to)}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300">
                            *Prices may vary based on season, availability, and special requirements
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "amenities" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 hover:text-[#06EAFC] transition-colors duration-300">Amenities & Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-[#06EAFC]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="text-[#06EAFC] group-hover:text-[#05d9eb] transition-colors duration-300" />
                        </div>
                        <span className="font-medium group-hover:text-[#06EAFC] transition-colors duration-300">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 hover:text-[#06EAFC] transition-colors duration-300">Customer Reviews</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl font-bold text-gray-900 hover:text-[#06EAFC] transition-colors duration-300">{vendor.rating || "4.5"}</div>
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon 
                              key={i} 
                              icon={faStar} 
                              className={i < Math.floor(vendor.rating || 4.5) ? "text-yellow-500 hover:text-yellow-600 transition-colors duration-300" : "text-gray-300 hover:text-gray-400 transition-colors duration-300"} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 hover:text-gray-800 transition-colors duration-300">Based on {vendor.review_count || "50+"} reviews</p>
                      </div>
                    </div>
                    
                    {/* Sample Reviews */}
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-gray-900 group-hover:text-[#06EAFC] transition-colors duration-300">John D.</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon 
                                      key={i} 
                                      icon={faStar} 
                                      className="text-yellow-500 text-sm hover:scale-110 transition-transform duration-300" 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">2 weeks ago</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                            "Excellent service and beautiful venue. The staff were very accommodating and the facilities were top-notch."
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "location" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 hover:text-[#06EAFC] transition-colors duration-300">Location</h3>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="bg-gray-200 rounded-xl h-[400px] flex items-center justify-center hover:shadow-lg transition-shadow duration-300">
                        <div className="text-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-4xl text-gray-400 mb-4 hover:text-[#06EAFC] transition-colors duration-300" />
                          <p className="text-gray-600 hover:text-gray-800 transition-colors duration-300">Map would be displayed here</p>
                          <p className="text-sm text-gray-500 mt-2 hover:text-gray-700 transition-colors duration-300">Google Maps integration available</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                        <h4 className="font-bold text-gray-900 mb-4 hover:text-[#06EAFC] transition-colors duration-300">Location Details</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 transition-colors duration-300">Address</p>
                            <p className="font-medium hover:text-[#06EAFC] transition-colors duration-300">{vendor.address || `${vendor.name}, ${vendor.area || "Ibadan"}`}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 transition-colors duration-300">Area</p>
                            <p className="font-medium hover:text-[#06EAFC] transition-colors duration-300">{vendor.area || "Ibadan"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1 hover:text-gray-800 transition-colors duration-300">Contact</p>
                            <p className="font-medium hover:text-[#06EAFC] transition-colors duration-300">{vendor.contact || "Not provided"}</p>
                          </div>
                          <div className="pt-4">
                            <p className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-300">
                              Easily accessible from major roads and public transportation
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-[#06EAFC] to-[#06F49F] mt-10 py-12"> {/* Reduced mt-12 to mt-10 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">Ready to Book?</h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto hover:text-white transition-colors duration-300">
                Reserve your spot at {vendor.name} today and enjoy an unforgettable experience
              </p>
              <button
                onClick={handleBookingClick}
                className="px-8 py-4 bg-white text-[#06EAFC] rounded-xl font-bold hover:bg-gray-100 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                Book Now - {formatPrice(vendor.price_from)}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorDetail;