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
  faArrowLeft,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { CiBookmark } from "react-icons/ci";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { RiShare2Line } from "react-icons/ri";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RoomSelection from "../components/RoomSelection";
import listingService from "../lib/listingService";

// Fallback images for different categories
const FALLBACK_IMAGES = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  event: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
};

const normalizeCategory = (category) => {
  if (!category) return 'restaurant';
  
  const cat = category.toString().toLowerCase().trim();
  
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

const getVendorImages = (vendor) => {
  if (!vendor) return Array(5).fill(FALLBACK_IMAGES.default);
  
  if (vendor.images && Array.isArray(vendor.images) && vendor.images.length > 0) {
    const imageUrls = vendor.images
      .map(img => img.url)
      .filter(url => url && url.startsWith("http"));
    
    if (imageUrls.length >= 5) {
      return imageUrls.slice(0, 5);
    } else if (imageUrls.length > 0) {
      const filledImages = [...imageUrls];
      const category = normalizeCategory(vendor.category);
      const fallbackImage = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
      
      while (filledImages.length < 5) {
        filledImages.push(fallbackImage);
      }
      return filledImages.slice(0, 5);
    }
  }
  
  const category = normalizeCategory(vendor.category);
  const fallbackImage = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
  return Array(5).fill(fallbackImage);
};

const getVendorIdFromListing = (listing) => {
  if (!listing) return null;
  
  if (typeof listing.vendorId === 'string') {
    return listing.vendorId;
  }
  
  if (listing.vendorId && listing.vendorId._id) {
    return listing.vendorId._id;
  }
  
  if (listing.vendor) {
    return listing.vendor._id || listing.vendor.id || listing.vendor;
  }
  
  return listing._id || listing.id;
};

const getVendorInfo = (listing) => {
  if (!listing) return null;
  
  if (listing.vendorId && typeof listing.vendorId === 'object') {
    return {
      id: listing.vendorId._id || listing.vendorId.id,
      name: listing.vendorId.name || listing.vendorId.username || listing.vendorId.email,
      email: listing.vendorId.email,
      phone: listing.vendorId.phone,
      verified: listing.vendorId.verified || false
    };
  }
  
  if (listing.vendor && typeof listing.vendor === 'object') {
    return {
      id: listing.vendor._id || listing.vendor.id,
      name: listing.vendor.name || listing.vendor.username || listing.vendor.email,
      email: listing.vendor.email,
      phone: listing.vendor.phone,
      verified: listing.vendor.verified || false
    };
  }
  
  if (typeof listing.vendorId === 'string') {
    return {
      id: listing.vendorId,
      name: "Vendor",
      email: null,
      phone: null,
      verified: false
    };
  }
  
  return null;
};

const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("auth_token");
    const userProfile = localStorage.getItem("userProfile");
    const isLoggedIn = !!token && !!userProfile;
    setIsAuthenticated(isLoggedIn);
    return isLoggedIn;
  };

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
  }, []);

  return isAuthenticated;
};

const VendorListingCard = ({ listing, onClick }) => {
  const images = getVendorImages(listing);
  const category = normalizeCategory(listing.category);
  
  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };
  
  const getCategoryIcon = () => {
    switch(category) {
      case 'hotel': return faBed;
      case 'restaurant': return faUtensils;
      case 'event': return faMusic;
      case 'shortlet': return faBed;
      default: return faUtensils;
    }
  };
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={images[0]} 
          alt={listing.title || listing.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
          {formatPrice(listing.price || listing.price_from)}
        </div>
        <div className="absolute bottom-2 left-2 bg-[#06EAFC] text-white px-2 py-1 rounded-full text-xs">
          {listing.status === 'active' ? 'Active' : listing.status}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-1 flex-1">
            {listing.title || listing.name}
          </h3>
          <FontAwesomeIcon 
            icon={getCategoryIcon()} 
            className="text-[#06EAFC] ml-2"
          />
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {listing.description?.substring(0, 100)}...
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
            <span className="text-xs font-semibold">{listing.rating || "4.5"}</span>
          </div>
          <span className="text-xs text-gray-500">
            {listing.location?.area || listing.area || "Ibadan"}
          </span>
        </div>
      </div>
    </div>
  );
};

// SmallImage Component for Gallery
const SmallImage = ({ src, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="overflow-hidden cursor-pointer rounded-lg"
    >
      <img
        src={src}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      />
    </div>
  );
};

// StarRating Component
const StarRating = ({ rating, onRatingChange = null, interactive = false, size = "sm" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const handleClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (interactive) {
      setHoverRating(starIndex + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        const isFilled = interactive 
          ? (hoverRating ? i < hoverRating : i < rating)
          : i < rating;
        
        return (
          <svg
            key={i}
            className={`${sizes[size]} ${isFilled ? "text-yellow-400" : "text-gray-300"} ${
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => handleClick(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={handleMouseLeave}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.173c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.922-.755 1.688-1.54 1.118l-3.377-2.454a1 1 0 00-1.176 0l-3.377 2.454c-.784.57-1.838-.196-1.539-1.118l1.286-3.966a1 1 0 00-.364-1.118L2.02 9.394c-.783-.57-.38-1.81.588-1.81h4.173a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        );
      })}
    </div>
  );
};

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [vendorListings, setVendorListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVendorListings, setLoadingVendorListings] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  // Review States
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    title: ""
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const isAuthenticated = useAuthStatus();

  // Reviews data
  const initialReviews = [
    {
      id: 1,
      name: "Angela Bassey",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop",
      rating: 4,
      text: `Beautiful place. The rooms were clean, the staff were very polite, and check-in was smooth. I loved the breakfast and the calm environment. Definitely coming back.`,
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Tola & Fola",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
      rating: 4,
      text: `They hosted a small event here and everything went perfectly. The hall was clean, the AC worked well, and the staff were helpful throughout. Highly recommended.`,
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Ibrahim O",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop",
      rating: 4,
      text: `The hotel is well maintained and the service quality is very good. WiFi was fast, and the location is perfect for moving around Ibadan. The only issue was slight noise from the hallway at night.`,
      date: "3 weeks ago",
    },
    {
      id: 4,
      name: "Popoola Basit",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
      rating: 4,
      text: `I really enjoyed their service, they are very professional, arrived on time, their decoration was beautiful and made my event colourful as well. I absolutely love them.`,
      date: "2 months ago",
    },
  ];

  // Review statistics
  const reviewStats = [
    { stars: 5, percentage: 61 },
    { stars: 4, percentage: 60 },
    { stars: 3, percentage: 44 },
    { stars: 2, percentage: 91 },
    { stars: 1, percentage: 94 }
  ];

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const result = await listingService.getListingById(id);
        
        if (result.status === 'success' && result.data?.listing) {
          const foundVendor = result.data.listing;
          setVendor(foundVendor);
          
          const extractedVendorInfo = getVendorInfo(foundVendor);
          setVendorInfo(extractedVendorInfo);
          
          const savedListings = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
          setIsFavorite(savedListings.some(item => item.id === id || item.id === foundVendor._id));
          
          // Initialize reviews
          setReviews(initialReviews);
        } else {
          setError(result.message || "Vendor not found or invalid response");
        }
      } catch (err) {
        setError("Failed to load vendor details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendorData();
    }
  }, [id]);

  useEffect(() => {
    const fetchVendorListings = async () => {
      if (!vendor) return;
      
      const vendorId = getVendorIdFromListing(vendor);
      
      if (!vendorId) {
        return;
      }
      
      try {
        setLoadingVendorListings(true);
        
        const result = await listingService.getListingsByVendor(vendorId);
        
        if (result.status === 'success') {
          const allListings = result.data.listings || result.data;
          const otherListings = Array.isArray(allListings) 
            ? allListings.filter(listing => (listing._id || listing.id) !== id)
            : [];
          
          setVendorListings(otherListings);
        }
      } catch (error) {
        // Silently handle error for vendor listings
      } finally {
        setLoadingVendorListings(false);
      }
    };
    
    if (vendor) {
      fetchVendorListings();
    }
  }, [vendor, id]);

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const getAmenities = () => {
    if (vendor?.amenities) {
      if (typeof vendor.amenities === 'string') {
        return vendor.amenities.split(",").map(item => item.trim()).filter(item => item);
      }
      if (Array.isArray(vendor.amenities)) {
        return vendor.amenities;
      }
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

  const handleRoomSelect = (room) => {
    console.log("Room selected:", room);
    setSelectedRoom(room);
  };

  const handleShareClick = () => {
    const currentUrl = window.location.href;
    
    if (navigator.share && window.innerWidth < 768) {
      navigator.share({
        title: vendor?.title || vendor?.name || 'Check out this vendor',
        text: `Check out ${vendor?.title || vendor?.name || 'this amazing vendor'} on Ajani!`,
        url: currentUrl,
      })
      .then(() => showToast("Link shared successfully!", "success"))
      .catch((error) => {
        console.log("Sharing failed:", error);
        copyToClipboard(currentUrl);
      });
    } else {
      copyToClipboard(currentUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("Link copied to clipboard!", "success");
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        showToast("Failed to copy link", "info");
      });
  };

  const handleBookingClick = () => {
    console.log("Booking clicked for vendor:", vendor);
    
    if (!vendor) {
      console.error("No vendor data available");
      showToast("Unable to book. Vendor data not available.", "info");
      return;
    }
    
    const vendorId = vendor._id || vendor.id;
    console.log("Vendor ID:", vendorId);
    console.log("Selected room:", selectedRoom);
    
    const vendorBookingData = {
      id: vendorId,
      name: vendor.title || vendor.name,
      category: normalizeCategory(vendor.category),
      originalCategory: vendor.category,
      priceFrom: vendor.price || vendor.price_from,
      priceTo: vendor.price_to || vendor.price,
      area: vendor.location?.area || vendor.area,
      contact: vendor.contact || vendorInfo?.phone,
      email: vendor.email || vendorInfo?.email,
      description: vendor.description,
      rating: vendor.rating,
      capacity: vendor.capacity,
      amenities: vendor.amenities,
      images: getVendorImages(vendor),
      vendorId: getVendorIdFromListing(vendor),
      vendorInfo: vendorInfo,
      image: getVendorImages(vendor)[0],
      selectedRoom: selectedRoom,
      bookingType: selectedRoom ? 'room-booking' : 'standard-booking'
    };
    
    console.log("Storing vendor data with room:", vendorBookingData);
    
    // Store the data in localStorage
    localStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    
    // Also store in session storage for immediate access
    sessionStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    
    // Navigate to booking page with the selected room data
    navigate('/booking', { 
      state: { 
        vendorData: vendorBookingData,
        vendorId: vendorId,
        selectedRoom: selectedRoom
      } 
    });
  };

  const handleRoomBookNow = (room) => {
    console.log("Room Book Now clicked:", room);
    setSelectedRoom(room);
    
    const vendorBookingData = {
      id: vendor._id || vendor.id,
      name: vendor.title || vendor.name,
      category: normalizeCategory(vendor.category),
      originalCategory: vendor.category,
      priceFrom: vendor.price || vendor.price_from,
      priceTo: vendor.price_to || vendor.price,
      area: vendor.location?.area || vendor.area,
      contact: vendor.contact || vendorInfo?.phone,
      email: vendor.email || vendorInfo?.email,
      description: vendor.description,
      rating: vendor.rating,
      capacity: vendor.capacity,
      amenities: vendor.amenities,
      images: getVendorImages(vendor),
      vendorId: getVendorIdFromListing(vendor),
      vendorInfo: vendorInfo,
      image: getVendorImages(vendor)[0],
      selectedRoom: room,
      bookingType: 'room-booking'
    };
    
    localStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    sessionStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    
    navigate('/booking', { 
      state: { 
        vendorData: vendorBookingData,
        vendorId: vendor._id || vendor.id,
        selectedRoom: room
      } 
    });
  };

  const handleOtherListingClick = (listingId) => {
    navigate(`/vendor-detail/${listingId}`);
  };

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
    toast.style.top = "15px";
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
          <p class="text-sm opacity-80 mt-1">${vendor?.title || vendor?.name || "Vendor"}</p>
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

  const handleFavoriteToggle = () => {
    if (!vendor || isProcessing) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const savedListings = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
      const vendorId = vendor._id || vendor.id;
      
      if (!isAuthenticated) {
        showToast("Please login to save listings", "info");

        localStorage.setItem(
          "redirectAfterLogin",
          window.location.pathname + window.location.search
        );

        const itemToSaveAfterLogin = {
          id: vendorId,
          name: vendor.title || vendor.name,
          price: formatPrice(vendor.price || vendor.price_from),
          perText: normalizeCategory(vendor.category) === 'hotel' ? 'per night' : 
                   normalizeCategory(vendor.category) === 'restaurant' ? 'per meal' : 
                   'per guest',
          rating: parseFloat(vendor.rating || "4.5"),
          tag: "Guest Favorite",
          image: getVendorImages(vendor)[0],
          category: vendor.category || "Business",
          location: vendor.location?.area || vendor.area || "Ibadan",
          originalData: vendor
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
      
      if (isFavorite) {
        const updated = savedListings.filter(item => item.id !== vendorId);
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        setIsFavorite(false);
        showToast("Removed from saved listings", "info");
      } else {
        const category = normalizeCategory(vendor.category);
        const listingToSave = {
          id: vendorId,
          name: vendor.title || vendor.name,
          price: formatPrice(vendor.price || vendor.price_from),
          perText: category === 'hotel' ? 'per night' : 
                   category === 'restaurant' ? 'per meal' : 
                   'per guest',
          rating: parseFloat(vendor.rating || "4.5"),
          tag: "Guest Favorite",
          image: getVendorImages(vendor)[0],
          category: vendor.category || "Business",
          location: vendor.location?.area || vendor.area || "Ibadan",
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
    if (!vendor) return "Business";
    const name = (vendor.title || vendor.name || "").toLowerCase();
    if (name.includes("hotel")) return "Hotel";
    if (name.includes("restaurant")) return "Restaurant";
    if (name.includes("shortlet")) return "Shortlet";
    if (name.includes("event")) return "Event Center";
    return "Business";
  };

  const getReviewCount = () => {
    if (vendor?.review_count) {
      const count = parseInt(vendor.review_count);
      return isNaN(count) ? 9 : count;
    }
    return 9;
  };

  const getFeatures = () => {
    const defaultFeatures = [
      { icon: faWifi, name: "WiFi" },
      { icon: faSwimmingPool, name: "Swimming Pool" },
      { icon: faCar, name: "Parking" },
      { icon: faUtensils, name: "Restaurant" },
    ];
    return defaultFeatures;
  };

  const getServices = () => {
    if (vendor?.description) {
      const sentences = vendor.description.split(/[.!?]+/).filter(s => s.trim().length > 10);
      return sentences.slice(0, 5).map(s => s.trim() + ".");
    }
    
    const defaultServices = [
      "Standard, Deluxe & Executive Rooms",
      "Restaurant & Bar",
      "Event & Meeting Spaces",
      "Airport Pickup",
      "Laundry & Concierge Services",
    ];
    return defaultServices;
  };

  // Review Functions
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast("Please login to submit a review", "info");
      navigate("/login");
      return;
    }
    
    if (!newReview.comment.trim()) {
      showToast("Please enter your review comment", "info");
      return;
    }
    
    setIsSubmittingReview(true);
    
    try {
      // Get user info from localStorage
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      
      // Create new review object
      const userReview = {
        id: Date.now(),
        name: userProfile.name || "Anonymous User",
        image: userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
        rating: newReview.rating,
        text: newReview.comment,
        title: newReview.title || "",
        date: "Just now",
        userId: userProfile._id || userProfile.id
      };
      
      // Add to reviews
      setReviews(prev => [userReview, ...prev]);
      
      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
        title: ""
      });
      
      // Hide form
      setShowReviewForm(false);
      
      showToast("Review submitted successfully!", "success");
      
      // In a real app, you would send this to your backend
      // await reviewService.submitReview(vendorId, newReview);
      
    } catch (error) {
      showToast("Failed to submit review. Please try again.", "info");
      console.error("Review submission error:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      showToast("Please login to write a review", "info");
      navigate("/login");
      return;
    }
    
    setShowReviewForm(true);
  };

  // Get Ibadan location coordinates
  const getIbadanLocation = () => {
    // Coordinates for Ibadan, Nigeria
    return {
      lat: 7.3775,
      lng: 3.9470
    };
  };

  // Generate Google Maps embed URL for Ibadan
  const getGoogleMapsUrl = () => {
    const location = getIbadanLocation();
    const zoom = 13;
    return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d31715.418336948303!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sng!4v${Date.now()}!5m2!1sen!2sng`;
  };

  // Get images for gallery
  const getGalleryImages = () => {
    const images = getVendorImages(vendor);
    // Return exactly 5 images for the gallery layout
    if (images.length >= 5) {
      return images.slice(0, 5);
    }
    // If we have fewer than 5 images, duplicate some to fill
    const filledImages = [...images];
    while (filledImages.length < 5) {
      filledImages.push(images[0] || FALLBACK_IMAGES.default);
    }
    return filledImages.slice(0, 5);
  };

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

  if (error || !vendor) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The vendor you're looking for doesn't exist or has been removed."}</p>
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

  const images = getVendorImages(vendor);
  const galleryImages = getGalleryImages();
  const category = normalizeCategory(vendor.category);
  const amenities = getAmenities();
  const features = getFeatures();
  const services = getServices();
  const reviewCount = getReviewCount();
  const categoryDisplay = getCategoryDisplay(vendor);
  const vendorId = getVendorIdFromListing(vendor);
  const averageRating = vendor?.rating ? parseFloat(vendor.rating) : 4.5;

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="md:pt-5 pt-1">
        <div className="md:max-w-[1245px] md:mx-auto">
          {/* Breadcrumb with Back Button */}
          <div className="px-4 md:px-4">
            <nav className="flex items-center space-x-2 text-xs text-gray-600 mb-2 md:mb-2 font-manrope">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 hover:text-[#06EAFC] transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-800 text-sm" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <span className="hidden sm:inline">/</span>
              <Link
                to="/"
                className="hover:text-[#06EAFC] transition-colors hover:underline"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                to={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-[#06EAFC] transition-colors hover:underline"
              >
                {categoryDisplay}
              </Link>
              <span>/</span>
              <span className="text-gray-900 truncate max-w-[120px] md:max-w-xs">
                {vendor.title || vendor.name}
              </span>
            </nav>
          </div>

          <div className="space-y-3 md:space-y-6">
            {/* Vendor Header Section */}
            <div className="px-4 md:px-4 py-3 md:py-3 bg-white">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between md:justify-start gap-3 md:gap-4 mb-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900 font-manrope line-clamp-2 flex-1">
                        {vendor.title || vendor.name}
                      </h1>
                      <VscVerifiedFilled className="text-green-500 text-base md:text-xl hover:scale-110 transition-transform duration-200" />
                    </div>
                    
                    {/* MOBILE: Share and Bookmark buttons inline */}
                    <div className="flex md:hidden items-center gap-2">
                      <button
                        onClick={handleShareClick}
                        className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <RiShare2Line className="text-gray-600 text-base hover:text-[#06EAFC] transition-colors duration-300" />
                      </button>
                      
                      <button
                        onClick={handleFavoriteToggle}
                        disabled={isProcessing}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer ${
                          isFavorite
                            ? "bg-gradient-to-br from-red-500 to-pink-500 border-red-200 hover:from-red-600 hover:to-pink-600 hover:scale-110 hover:shadow-lg"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:scale-110 hover:shadow-md"
                        } ${isProcessing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isFavorite ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          <CiBookmark className="text-base text-gray-600 hover:text-[#06EAFC] transition-all duration-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-row md:items-center gap-2 md:gap-4 lg:gap-8">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-medium py-1 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200">
                        {categoryDisplay}
                      </span>
                    </div>

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

                    <div className="flex items-center gap-2 text-gray-700 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-gray-500 text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200"
                      />
                      <span className="truncate max-w-[150px] md:max-w-none">
                        {vendor.location?.area || vendor.area || "Ibadan"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DESKTOP: Share and Bookmark buttons */}
                <div className="hidden md:flex flex-col items-end gap-2 md:gap-4 mt-2 md:mt-0">
                  <div className="flex gap-4 md:gap-6 items-center">
                    <div className="flex items-center gap-1 md:gap-2 group relative">
                      <button
                        onClick={handleShareClick}
                        className="w-8 h-8 md:w-10 md:h-10 bg-white border border-gray-200 md:border-2 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <RiShare2Line className="text-gray-600 text-base md:text-xl group-hover:text-[#06EAFC] transition-colors duration-300" />
                      </button>
                      <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline group-hover:text-[#06EAFC] transition-colors duration-300">
                        Share
                      </span>
                    </div>

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
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= IMAGE GALLERY SECTION ================= */}
            {/* Desktop Gallery Layout (lg and above) */}
            <section className="hidden lg:block px-4">
              <div className="relative grid grid-cols-4 grid-rows-2 gap-3 h-[360px] overflow-hidden rounded-xl">
                {/* LEFT TOP */}
                <SmallImage 
                  src={galleryImages[0]} 
                  onClick={() => setGalleryOpen(true)}
                />

                {/* LEFT BOTTOM */}
                <SmallImage 
                  src={galleryImages[1]} 
                  onClick={() => setGalleryOpen(true)}
                />

                {/* CENTER BIG */}
                <div
                  onClick={() => setGalleryOpen(true)}
                  className="col-span-2 row-span-2 overflow-hidden cursor-pointer rounded-lg"
                >
                  <img
                    src={galleryImages[2]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>

                {/* RIGHT TOP */}
                <SmallImage 
                  src={galleryImages[3]} 
                  onClick={() => setGalleryOpen(true)}
                />

                {/* RIGHT BOTTOM */}
                <SmallImage 
                  src={galleryImages[4]} 
                  onClick={() => setGalleryOpen(true)}
                />

                {/* View all photos button */}
                <button
                  onClick={() => setGalleryOpen(true)}
                  className="absolute bottom-4 right-4 bg-white text-sm font-medium px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors"
                >
                  View all photos
                </button>
              </div>
            </section>

            {/* Mobile Gallery Layout */}
            <section className="lg:hidden px-4">
              <div className="space-y-2">
                {/* Main image */}
                <div onClick={() => setGalleryOpen(true)} className="cursor-pointer">
                  <img
                    src={galleryImages[2]}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 px-2 overflow-x-auto pb-2">
                  {galleryImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setGalleryOpen(true)}
                      className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ================= GALLERY MODAL ================= */}
            {galleryOpen && (
              <div className="fixed inset-0 z-50 bg-black">
                <button
                  onClick={() => setGalleryOpen(false)}
                  className="fixed top-4 right-4 z-50 bg-white rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  ✕ Close
                </button>

                {/* MOBILE SCROLL (Agoda style) */}
                <div className="lg:hidden h-full overflow-y-auto">
                  {galleryImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-full object-cover mb-[2px]"
                    />
                  ))}
                </div>

                {/* DESKTOP GRID GALLERY */}
                <div className="hidden lg:grid grid-cols-3 gap-2 p-6 overflow-y-auto h-full">
                  {galleryImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="w-full h-64 object-cover rounded hover:scale-105 transition-transform duration-300"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className="px-2">
              <div className=" text-start bg-white py-3 mx-auto">
                <p className="text-[#00065A]  font-manrope text-base md:text-xl font-bold mb-1">
                  Price Range
                </p>
                <div className="flex flex-col justify-center gap-1 md:gap-3">
                  <div className="flex items-center gap-1 md:gap-2 ">
                    <span className="text-[15px] md:text-2xl text-gray-900 font-manrope font-bold">
                      {formatPrice(vendor.price || vendor.price_from)}
                    </span>
                    <span className="text-gray-900 text-[12px]">
                      -
                    </span>
                    <span className="text-[15px] md:text-2xl text-gray-900 font-manrope font-bold">
                      {formatPrice(vendor.price_to || vendor.price || vendor.price_from)}
                    </span>
                  </div>
                  <span className="text-gray-900 text-sm md:text-base mt-1">
                    {category === 'hotel' ? 'per night' : 
                     category === 'restaurant' ? 'per meal' : 
                     'per guest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2">
              <div className="w-full h-14 md:h-16 bg-gray-200 rounded-[13px] md:rounded-3xl flex items-center justify-between px-4 md:px-12 mx-auto md:max-w-[600px] hover:shadow-lg transition-all duration-300 hover:bg-gray-300/50">
                <button
                  onClick={() => (vendor.contact || vendorInfo?.phone) && (window.location.href = `tel:${vendor.contact || vendorInfo?.phone}`)}
                  className="flex flex-col items-center transition-all duration-300 px-2 group relative"
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
                </button>

                <button
                  onClick={() => showToast("Chat feature coming soon!", "info")}
                  className="flex flex-col items-center transition-all duration-300 px-2 group relative"
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
                </button>

                <button
                  onClick={handleBookingClick}
                  className="flex flex-col items-center transition-all duration-300 px-2 group relative"
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
                </button>

                <button
                  onClick={() => showToast("Map feature coming soon!", "info")}
                  className="flex flex-col items-center transition-all duration-300 px-2 group relative"
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
                </button>
              </div>
            </div>

            {/* About Section */}
            <section className="w-full bg-[#F7F7FA] rounded-none md:rounded-3xl">
              <div className="px-4 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
                <div className="mb-8 md:mb-12">
                  <h2 className="text-lg md:text-xl font-bold text-[#06F49F] mb-3 md:mb-4 font-manrope">
                    About
                  </h2>
                  <p className="text-gray-900 text-sm md:[15px] font-manrope hover:text-gray-800">
                    {vendor.description ||
                      "Welcome to our premium venue, offering exceptional service and unforgettable experiences. With modern amenities and professional staff, we ensure your stay is comfortable and memorable."}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-4 md:mb-6 font-manrope">
                      What we Do
                    </h3>
                    <div className="space-y-3 md:space-y-4">
                      {services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 md:gap-4 hover:translate-x-1 transition-transform duration-300 group cursor-pointer"
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

                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-4 md:mb-6 font-manrope ">
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 md:gap-3 hover:translate-x-1 transition-transform duration-300 group cursor-pointer"
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

            {/* Room Selection Section - Only for Hotels */}
            {category === 'hotel' && (
              <div className="px-4 md:px-4">
                <RoomSelection 
                  category={category}
                  onRoomSelect={handleRoomSelect}
                  onRoomBookNow={handleRoomBookNow}
                  vendorData={vendor}
                />
              </div>
            )}

            {/* Reviews Section */}
            <section className="w-full bg-white px-4 sm:px-4 md:px-4 py-6 md:py-8">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#06F49F] mb-2 font-manrope">
                  Reviews
                  <span className="text-sm md:text-base font-normal text-gray-500 ml-2">
                    ({reviewCount} reviews)
                  </span>
                </h2>
                
                {/* Rating Summary - Mobile Optimized */}
                <div className="flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-8 mb-8 p-4 bg-gray-50 rounded-xl">
                  {/* Average Rating - Center on mobile */}
                  <div className="flex flex-col items-center md:items-start gap-3">
                    <div className="text-4xl md:text-5xl font-bold text-gray-900 text-center md:text-left">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <div className="flex items-center gap-1 mb-1">
                        <StarRating rating={Math.round(averageRating)} size="md" />
                      </div>
                      <p className="text-gray-600 text-sm text-center md:text-left">
                        Based on {reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating Breakdown - Stack vertically on mobile */}
                  <div className="flex-1 w-full space-y-3">
                    {reviewStats.map((stat, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-12">{stat.stars} star</span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{stat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Review Form - Only shows when authenticated */}
                {showReviewForm && (
                  <div className="mb-8 p-4 md:p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-[#00065A] mb-4 font-manrope">
                      Write a Review
                    </h3>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Your Rating
                        </label>
                        <div className="flex items-center gap-2">
                          <StarRating 
                            rating={newReview.rating} 
                            onRatingChange={(rating) => setNewReview({...newReview, rating})}
                            interactive={true}
                            size="lg"
                          />
                          <span className="text-gray-600 ml-2">
                            {newReview.rating} out of 5
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Review Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={newReview.title}
                          onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                          placeholder="Summarize your experience"
                          maxLength={100}
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Your Review *
                        </label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent min-h-[120px]"
                          placeholder="Share details of your experience..."
                          required
                          maxLength={1000}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Minimum 10 characters, maximum 1000 characters
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors font-manrope font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingReview ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Submitting...
                            </span>
                          ) : (
                            "Submit Review"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-manrope font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={review.image}
                          alt={review.name}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-100"
                        />
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <p className="font-medium text-gray-900 font-manrope text-sm md:text-base">
                                {review.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-xs text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed font-manrope">
                        {review.text}
                      </p>
                      
                      {/* Review Helpful Button */}
                      <div className="mt-4 flex items-center gap-4">
                        <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700">
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Load More Reviews Button */}
                {reviewCount > 4 && (
                  <div className="text-center mt-8">
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-manrope font-medium">
                      Load More Reviews
                    </button>
                  </div>
                )}
                
                {/* Write Review Button - Shows conditionally */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleWriteReviewClick}
                    className="w-full md:w-auto px-6 py-3 border-2 border-[#06EAFC] text-[#06EAFC] rounded-lg hover:bg-[#06EAFC] hover:text-white transition-colors font-manrope font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {isAuthenticated ? "Write a Review" : "Login to Write a Review"}
                  </button>
                </div>
              </div>
            </section>

            {/* Location Section with Google Maps */}
            <div className="px-4 md:px-4">
              <div className="bg-white rounded-xl p-4 md:p-6">
                <h2 className="text-xl font-bold text-[#00065A] mb-6 font-manrope">
                  Location
                </h2>
                
                <div className="space-y-6">
                  {/* Google Maps Embed - Ibadan focused */}
                  <div className="bg-gray-100 rounded-xl overflow-hidden h-64 md:h-96">
                    <iframe
                      src={getGoogleMapsUrl()}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map - Ibadan, Nigeria"
                      className="rounded-xl"
                    ></iframe>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 font-manrope">Location Details</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Address</p>
                        <p className="font-medium text-gray-900">
                          {vendor.address || `${vendor.title || vendor.name}, ${vendor.location?.area || vendor.area || "Ibadan"}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Area</p>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                          <p className="font-medium text-gray-900">
                            {vendor.location?.area || vendor.area || "Ibadan, Nigeria"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Contact</p>
                        <p className="font-medium text-gray-900">
                          {vendor.contact || vendorInfo?.phone || "Not provided"}
                        </p>
                      </div>
                      <div className="pt-4">
                        <a
                          href={`https://www.google.com/maps/dir//${encodeURIComponent(vendor.address || vendor.title || vendor.name + " Ibadan Nigeria")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors font-manrope font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Get Directions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Listings from This Vendor */}
            {vendorListings.length > 0 && (
              <div className="px-4 sm:px-4 md:px-4 lg:px-4 py-6 bg-white">
                <h2 className="text-xl font-bold text-[#00065A] mb-6">
                  Other Listings from This Vendor
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({vendorListings.length} {vendorListings.length === 1 ? 'listing' : 'listings'})
                  </span>
                </h2>
                
                {loadingVendorListings ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06EAFC]"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {vendorListings.slice(0, 4).map((listing, index) => (
                      <VendorListingCard
                        key={listing._id || index}
                        listing={listing}
                        onClick={() => handleOtherListingClick(listing._id || listing.id)}
                      />
                    ))}
                  </div>
                )}
                
                {vendorListings.length > 4 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => {
                        if (vendorId) {
                          navigate(`/vendor-listings/${vendorId}`);
                        }
                      }}
                      className="px-4 py-2 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors"
                    >
                      View All {vendorListings.length} Listings
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorDetail;