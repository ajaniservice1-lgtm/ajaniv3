import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
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
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faClock,
  faUserCheck,
  faRulerCombined,
  faSnowflake,
  faTv,
  faCoffee,
  faBath,
  faConciergeBell,
  faPlug,
  faWineGlass,
  faShieldAlt,
  faKey,
  faChair,
  faDesktop,
  faCouch,
  faSuitcase,
  faWind,
  faThermometerHalf,
  faBookmark as faBookmarkSolid,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { CiBookmark } from "react-icons/ci";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { RiShare2Line } from "react-icons/ri";
import { VscVerifiedFilled } from "react-icons/vsc";
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

// Helper function to safely convert values to strings
const safeToString = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    // Try common properties
    if (value.name) return safeToString(value.name, defaultValue);
    if (value.title) return safeToString(value.title, defaultValue);
    if (value.area) return safeToString(value.area, defaultValue);
    if (value.address) return safeToString(value.address, defaultValue);
    if (value.value) return safeToString(value.value, defaultValue);
    // Last resort: JSON stringify
    try {
      return JSON.stringify(value);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

// Normalize category function
const normalizeCategory = (category) => {
  if (!category) return 'hotel';
  
  const cat = safeToString(category).toLowerCase().trim();
  
  // Handle shortlets separately - CHECK THIS FIRST
  if (cat.includes('shortlet') || 
      cat.includes('vacation rental') || 
      cat.includes('apartment') || 
      cat.includes('airbnb') || 
      cat.includes('vacation home') ||
      cat.includes('holiday home') ||
      cat.includes('self-catering') ||
      cat.includes('serviced apartment')) {
    return 'shortlet';
  }
  
  // Handle composite categories (with slashes)
  if (cat.includes("/")) {
    const parts = cat.split("/").map(part => part.trim());
    for (const part of parts) {
      if (part.includes('restaurant') || part.includes('food') || part.includes('cafe') || part.includes('eatery')) {
        return 'restaurant';
      }
      if (part.includes('hotel') || part.includes('resort') || part.includes('inn')) {
        return 'hotel';
      }
      if (part.includes('event') || part.includes('venue') || part.includes('hall') || part.includes('center')) {
        return 'event';
      }
      if (part.includes('shortlet')) {
        return 'shortlet';
      }
    }
    if (cat.includes('food')) return 'restaurant';
  }
  
  // Individual category checks
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('eatery') || cat.includes('diner') || cat.includes('bistro') || cat.includes('bar')) {
    return 'restaurant';
  }
  if (cat.includes('hotel') || cat.includes('resort') || cat.includes('inn') || cat.includes('motel') || cat.includes('lodging') || cat.includes('guest house')) {
    return 'hotel';
  }
  if (cat.includes('event') || cat.includes('venue') || cat.includes('hall') || cat.includes('center') || cat.includes('conference') || cat.includes('meeting') || cat.includes('banquet')) {
    return 'event';
  }
  
  // Default fallback
  return 'hotel';
};

const getVendorImages = (vendor) => {
  if (!vendor) return Array(5).fill(FALLBACK_IMAGES.default);
  
  // Check if vendor has images directly
  if (vendor.images && Array.isArray(vendor.images) && vendor.images.length > 0) {
    const imageUrls = vendor.images.map(img => {
      if (typeof img === 'string') return img;
      if (img && img.url) return img.url;
      return null;
    }).filter(url => url && url.startsWith("http"));
    
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
  
  // For hotels, check room images first
  const category = normalizeCategory(vendor.category);
  if (category === 'hotel' && vendor.details?.roomTypes && Array.isArray(vendor.details.roomTypes)) {
    // Collect all room images
    const allRoomImages = vendor.details.roomTypes.flatMap(room => 
      room.images ? room.images.map(img => img.url).filter(url => url) : []
    );
    
    if (allRoomImages.length > 0) {
      // Take up to 5 unique images
      const uniqueImages = [...new Set(allRoomImages)].slice(0, 5);
      if (uniqueImages.length >= 5) {
        return uniqueImages;
      }
      
      // Fill with fallback if needed
      const filledImages = [...uniqueImages];
      const fallbackImage = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
      while (filledImages.length < 5) {
        filledImages.push(fallbackImage);
      }
      return filledImages.slice(0, 5);
    }
  }
  
  // Fallback to category-specific image
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
      name: safeToString(listing.vendorId.businessName || listing.vendorId.name || listing.vendorId.username || listing.vendorId.email, 'Vendor'),
      email: safeToString(listing.vendorId.email),
      phone: safeToString(listing.vendorId.phone),
      verified: listing.vendorId.verified || false,
      businessName: safeToString(listing.vendorId.businessName, ''),
      businessAddress: safeToString(listing.vendorId.businessAddress, '')
    };
  }
  
  if (listing.vendor && typeof listing.vendor === 'object') {
    return {
      id: listing.vendor._id || listing.vendor.id,
      name: safeToString(listing.vendor.businessName || listing.vendor.name || listing.vendor.username || listing.vendor.email, 'Vendor'),
      email: safeToString(listing.vendor.email),
      phone: safeToString(listing.vendor.phone),
      verified: listing.vendor.verified || false,
      businessName: safeToString(listing.vendor.businessName, ''),
      businessAddress: safeToString(listing.vendor.businessAddress, '')
    };
  }
  
  if (typeof listing.vendorId === 'string') {
    return {
      id: listing.vendorId,
      name: "Vendor",
      email: null,
      phone: null,
      verified: false,
      businessName: '',
      businessAddress: ''
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

// Get amenities from vendor data
const getAmenities = (vendor) => {
  if (!vendor) return ["Not specified"];
  
  const category = normalizeCategory(vendor.category);
  
  // For hotels, prioritize room amenities
  if (category === 'hotel') {
    // Check room types for amenities
    if (vendor.details?.roomTypes && Array.isArray(vendor.details.roomTypes)) {
      // Collect all unique amenities from all rooms
      const allRoomAmenities = [];
      vendor.details.roomTypes.forEach(room => {
        if (room.amenities) {
          if (Array.isArray(room.amenities)) {
            allRoomAmenities.push(...room.amenities);
          } else if (typeof room.amenities === 'string') {
            allRoomAmenities.push(room.amenities);
          }
        }
      });
      
      if (allRoomAmenities.length > 0) {
        const uniqueAmenities = [...new Set(allRoomAmenities.map(a => safeToString(a)).filter(a => a))];
        if (uniqueAmenities.length > 0) {
          return uniqueAmenities.slice(0, 8);
        }
      }
    }
    
    // Fallback to vendor amenities
    if (vendor.amenities) {
      if (typeof vendor.amenities === 'string') {
        return vendor.amenities.split(",").map(item => item.trim()).filter(item => item);
      }
      if (Array.isArray(vendor.amenities) && vendor.amenities.length > 0) {
        return vendor.amenities;
      }
    }
    
    // Fallback to hotel details amenities
    if (vendor.details?.amenities && Array.isArray(vendor.details.amenities)) {
      return vendor.details.amenities;
    }
    
    // Default hotel amenities (from room selection modal)
    return [
      "Free WiFi",
      "Air Conditioning", 
      "Flat-screen TV",
      "Private Bathroom",
      "Daily Housekeeping",
      "Room Service",
      "Parking",
      "Swimming Pool"
    ];
  } else if (category === 'restaurant') {
    return ["Outdoor Seating", "Live Music", "Parking", "Takeaway", "Vegetarian Options", "Alcohol Served", "Air Conditioning"];
  } else if (category === 'event') {
    return ["Stage", "Sound System", "Lighting", "Parking", "Catering Service", "Decoration Service", "Projector", "Microphones"];
  } else if (category === 'shortlet') {
    // Try to get amenities from shortlet details
    if (vendor.details?.amenities && Array.isArray(vendor.details.amenities)) {
      return vendor.details.amenities;
    }
    return ["Full Kitchen", "WiFi", "Air Conditioning", "Parking", "Laundry", "24/7 Check-in", "Smart TV", "Workspace", "Security"];
  }
  
  return ["Not specified"];
};

// Get amenity icon based on feature name
const getAmenityIcon = (amenity) => {
  const lowerAmenity = amenity.toLowerCase();
  
  // Match with room selection modal features
  if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return faWifi;
  if (lowerAmenity.includes('air conditioning') || lowerAmenity.includes('ac') || lowerAmenity.includes('cooling')) return faSnowflake;
  if (lowerAmenity.includes('tv') || lowerAmenity.includes('television') || lowerAmenity.includes('flat-screen')) return faTv;
  if (lowerAmenity.includes('bathroom') || lowerAmenity.includes('bath') || lowerAmenity.includes('shower')) return faBath;
  if (lowerAmenity.includes('housekeeping') || lowerAmenity.includes('cleaning')) return faConciergeBell;
  if (lowerAmenity.includes('room service') || lowerAmenity.includes('service')) return faCheckCircle;
  if (lowerAmenity.includes('parking') || lowerAmenity.includes('car')) return faCar;
  if (lowerAmenity.includes('pool') || lowerAmenity.includes('swimming')) return faSwimmingPool;
  if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return faDumbbell;
  if (lowerAmenity.includes('spa') || lowerAmenity.includes('massage')) return faSpa;
  if (lowerAmenity.includes('music') || lowerAmenity.includes('entertainment')) return faMusic;
  if (lowerAmenity.includes('food') || lowerAmenity.includes('restaurant') || lowerAmenity.includes('meal')) return faUtensils;
  if (lowerAmenity.includes('bed') || lowerAmenity.includes('room') || lowerAmenity.includes('sleep')) return faBed;
  if (lowerAmenity.includes('home') || lowerAmenity.includes('apartment')) return faHome;
  if (lowerAmenity.includes('security') || lowerAmenity.includes('reception')) return faUserCheck;
  if (lowerAmenity.includes('laundry')) return faClock;
  if (lowerAmenity.includes('coffee') || lowerAmenity.includes('tea')) return faCoffee;
  if (lowerAmenity.includes('plug') || lowerAmenity.includes('socket')) return faPlug;
  if (lowerAmenity.includes('wine') || lowerAmenity.includes('bar')) return faWineGlass;
  if (lowerAmenity.includes('shield') || lowerAmenity.includes('safe')) return faShieldAlt;
  if (lowerAmenity.includes('key') || lowerAmenity.includes('access')) return faKey;
  if (lowerAmenity.includes('chair') || lowerAmenity.includes('furniture')) return faChair;
  if (lowerAmenity.includes('desk') || lowerAmenity.includes('workspace')) return faDesktop;
  if (lowerAmenity.includes('sofa') || lowerAmenity.includes('couch')) return faCouch;
  if (lowerAmenity.includes('suitcase') || lowerAmenity.includes('luggage')) return faSuitcase;
  if (lowerAmenity.includes('wind') || lowerAmenity.includes('ventilation')) return faWind;
  if (lowerAmenity.includes('thermometer') || lowerAmenity.includes('heating')) return faThermometerHalf;
  
  return faCheckCircle; // Default icon
};

// Get features for the "Key Features" section - showing AMENITIES not specifications
const getFeaturesFromRoomModal = (vendor) => {
  const category = normalizeCategory(vendor.category);
  
  if (category === 'hotel') {
    // First, try to get amenities from room data
    if (vendor.details?.roomTypes && Array.isArray(vendor.details.roomTypes)) {
      // Collect all amenities from all room types
      const allRoomAmenities = [];
      vendor.details.roomTypes.forEach(room => {
        if (room.amenities && Array.isArray(room.amenities)) {
          allRoomAmenities.push(...room.amenities);
        }
      });
      
      // If we found room amenities, use them
      if (allRoomAmenities.length > 0) {
        const uniqueAmenities = [...new Set(allRoomAmenities.map(a => safeToString(a)).filter(a => a))];
        if (uniqueAmenities.length > 0) {
          return uniqueAmenities.slice(0, 6).map(amenity => ({
            icon: getAmenityIcon(amenity),
            name: amenity
          }));
        }
      }
    }
    
    // Try vendor amenities
    if (vendor.amenities) {
      let vendorAmenities = [];
      if (typeof vendor.amenities === 'string') {
        vendorAmenities = vendor.amenities.split(",").map(item => item.trim());
      } else if (Array.isArray(vendor.amenities)) {
        vendorAmenities = vendor.amenities;
      }
      
      if (vendorAmenities.length > 0) {
        return vendorAmenities.slice(0, 6).map(amenity => ({
          icon: getAmenityIcon(amenity),
          name: amenity
        }));
      }
    }
    
    // Try hotel details amenities
    if (vendor.details?.amenities && Array.isArray(vendor.details.amenities)) {
      return vendor.details.amenities.slice(0, 6).map(amenity => ({
        icon: getAmenityIcon(amenity),
        name: amenity
      }));
    }
    
    // Default hotel features - THESE ARE THE AMENITIES FROM ROOM SELECTION MODAL
    return [
      { icon: faWifi, name: "Free WiFi" },
      { icon: faSnowflake, name: "Air Conditioning" },
      { icon: faTv, name: "Flat-screen TV" },
      { icon: faBath, name: "Private Bathroom" },
      { icon: faConciergeBell, name: "Daily Housekeeping" },
      { icon: faCheckCircle, name: "Room Service" }
    ];
  }
  
  // For non-hotels, use general amenities
  const amenities = getAmenities(vendor);
  return amenities.slice(0, 6).map(amenity => ({
    icon: getAmenityIcon(amenity),
    name: amenity
  }));
};

// Helper function to get location string safely
const getLocationString = (location, fallback = "Ibadan, Nigeria") => {
  if (!location) return fallback;
  
  if (typeof location === 'string') {
    return location.trim() || fallback;
  }
  
  if (typeof location === 'number') {
    return String(location);
  }
  
  if (typeof location === 'object') {
    if (location.area && typeof location.area === 'string') return location.area.trim() || fallback;
    if (location.name && typeof location.name === 'string') return location.name.trim() || fallback;
    if (location.address && typeof location.address === 'string') return location.address.trim() || fallback;
    if (location.city && typeof location.city === 'string') return location.city.trim() || fallback;
    if (location.state && typeof location.state === 'string') return location.state.trim() || fallback;
    if (location.country && typeof location.country === 'string') return location.country.trim() || fallback;
    
    if (location.geolocation) {
      if (typeof location.geolocation === 'string') {
        return location.geolocation.trim() || fallback;
      }
      if (typeof location.geolocation === 'object') {
        if (location.geolocation.lat && location.geolocation.lng) {
          return `${location.geolocation.lat}, ${location.geolocation.lng}`;
        }
      }
    }
    
    try {
      const stringified = JSON.stringify(location);
      if (stringified.length > 100 || stringified.includes('{') || stringified.includes('[')) {
        return fallback;
      }
      return stringified;
    } catch {
      return fallback;
    }
  }
  
  return fallback;
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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

  // Ref for room selection section
  const roomSelectionRef = useRef(null);

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

  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        console.log('Fetching vendor data for ID:', id);
        setLoading(true);
        setError(null);
        
        const result = await listingService.getListingById(id);
        console.log('Vendor fetch result:', result);
        
        if (result.status === 'success' && result.data?.listing) {
          const foundVendor = result.data.listing;
          console.log('Found vendor:', foundVendor);
          console.log('Vendor category:', foundVendor.category);
          console.log('Vendor details:', foundVendor.details);
          
          setVendor(foundVendor);
          
          const extractedVendorInfo = getVendorInfo(foundVendor);
          console.log('Extracted vendor info:', extractedVendorInfo);
          setVendorInfo(extractedVendorInfo);
          
          // Check if listing is saved
          const savedListings = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
          setIsFavorite(savedListings.some(item => item.id === id || item.id === foundVendor._id));
          
          // Initialize reviews
          setReviews(initialReviews);
          
          // Show success log
          console.log(`Successfully loaded ${normalizeCategory(foundVendor.category)} listing:`, foundVendor.name || foundVendor.title);
        } else {
          console.error('Vendor fetch error:', result.message);
          setError(result.message || "Vendor not found or invalid response");
        }
      } catch (err) {
        console.error('Vendor fetch exception:', err);
        setError("Failed to load vendor details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendorData();
    }
  }, [id]);

  // Fetch vendor listings
  useEffect(() => {
    const fetchVendorListings = async () => {
      if (!vendor) return;
      
      const vendorId = getVendorIdFromListing(vendor);
      
      if (!vendorId) {
        console.log('No vendor ID found for fetching other listings');
        return;
      }
      
      try {
        setLoadingVendorListings(true);
        console.log('Fetching other listings for vendor:', vendorId);
        
        // Get all listings by category first
        const category = normalizeCategory(vendor.category);
        console.log('Fetching all', category, 'listings');
        
        const result = await listingService.getListingsByCategory(category);
        
        if (result.status === 'success' && result.data?.listings) {
          const allListings = result.data.listings;
          console.log(`Found ${allListings.length} ${category} listings`);
          
          // Filter to get only listings from this vendor (excluding current listing)
          const vendorListings = allListings.filter(listing => {
            const listingVendorId = getVendorIdFromListing(listing);
            const isSameVendor = listingVendorId === vendorId;
            const isNotCurrent = (listing._id || listing.id) !== id;
            return isSameVendor && isNotCurrent;
          });
          
          console.log(`Found ${vendorListings.length} other listings from this vendor`);
          setVendorListings(vendorListings);
        } else {
          console.log('No listings found:', result.message);
          setVendorListings([]);
        }
      } catch (error) {
        console.error('Error fetching vendor listings:', error);
        setVendorListings([]);
      } finally {
        setLoadingVendorListings(false);
      }
    };
    
    if (vendor) {
      fetchVendorListings();
    }
  }, [vendor, id]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = parseInt(safeToString(price).replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const handleRoomSelect = (room) => {
    console.log("Room selected:", room);
    setSelectedRoom(room);
  };

  const handleRoomBookNow = (room, option) => {
    console.log("Room Book Now clicked:", room, option);
    setSelectedRoom({...room, selectedOption: option});
    
    // Prepare vendor data for booking
    const vendorBookingData = {
      id: vendor._id || vendor.id,
      name: safeToString(vendor.title || vendor.name, "Vendor"),
      category: 'hotel',
      originalCategory: safeToString(vendor.category),
      priceFrom: option.price || room.pricePerNight || vendor.price || 0,
      priceTo: option.price || room.pricePerNight || vendor.price || 0,
      area: getLocationString(vendor.location || vendor.area),
      contact: safeToString(vendor.contact || vendorInfo?.phone || vendor.contactInformation?.phone),
      email: safeToString(vendor.email || vendorInfo?.email),
      description: safeToString(vendor.description || vendor.about),
      rating: parseFloat(safeToString(vendor.rating, "4.5")),
      capacity: room.maxOccupancy || vendor.details?.maxGuests || 2,
      amenities: room.amenitiesList || getAmenities(vendor),
      images: room.images || getVendorImages(vendor),
      vendorId: getVendorIdFromListing(vendor),
      vendorInfo: vendorInfo,
      image: getVendorImages(vendor)[0],
      selectedRoom: room,
      selectedBookingOption: option,
      bookingType: 'hotel',
      // Add room-specific data
      roomName: room.name,
      roomDescription: room.description,
      roomSize: room.size,
      roomBeds: room.beds,
      details: vendor.details,
      contactInformation: vendor.contactInformation
    };
    
    // Store data
    localStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    sessionStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    
    // Navigate to booking page
    navigate('/booking', { 
      state: { 
        vendorData: vendorBookingData,
        category: 'hotel'
      } 
    });
  };

  // Toast notification function
  const showToast = (message, type = "success") => {
    // Remove any existing toast
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) {
      existingToast.remove();
    }

    // Create new toast element
    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = `fixed z-[99999] px-4 py-3 rounded-lg shadow-lg border ${
      type === "success" 
        ? "bg-green-50 border-green-200 text-green-800" 
        : "bg-blue-50 border-blue-200 text-blue-800"
    }`;
    
    // Set inline styles for positioning
    toast.style.top = "80px";
    toast.style.right = "15px";
    toast.style.maxWidth = "320px";
    toast.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    toast.style.backdropFilter = "blur(10px)";
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
          <p class="text-sm opacity-80 mt-1">${safeToString(vendor?.title || vendor?.name, "Vendor")}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-70 transition-opacity cursor-pointer">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    // Add toast to body
    document.body.appendChild(toast);

    // Auto-remove toast after 3 seconds
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
          name: safeToString(vendor.title || vendor.name, "Vendor"),
          price: formatPrice(vendor.price || vendor.details?.pricePerNight || vendor.price_from),
          perText: normalizeCategory(vendor.category) === 'hotel' ? 'per night' : 
                   normalizeCategory(vendor.category) === 'restaurant' ? 'per meal' : 
                   normalizeCategory(vendor.category) === 'shortlet' ? 'per night' :
                   'per guest',
          rating: parseFloat(safeToString(vendor.rating, "4.5")),
          tag: "Guest Favorite",
          image: getVendorImages(vendor)[0],
          category: safeToString(vendor.category, "Business"),
          location: getLocationString(vendor.location || vendor.area, "Ibadan"),
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
          name: safeToString(vendor.title || vendor.name, "Vendor"),
          price: formatPrice(vendor.price || vendor.details?.pricePerNight || vendor.price_from),
          perText: category === 'hotel' ? 'per night' : 
                   category === 'restaurant' ? 'per meal' : 
                   category === 'shortlet' ? 'per night' :
                   'per guest',
          rating: parseFloat(safeToString(vendor.rating, "4.5")),
          tag: "Guest Favorite",
          image: getVendorImages(vendor)[0],
          category: safeToString(vendor.category, "Business"),
          location: getLocationString(vendor.location || vendor.area, "Ibadan"),
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

  const handleShareClick = () => {
    const currentUrl = window.location.href;
    
    if (navigator.share && window.innerWidth < 768) {
      navigator.share({
        title: safeToString(vendor?.title || vendor?.name, 'Check out this vendor'),
        text: `Check out ${safeToString(vendor?.title || vendor?.name, 'this amazing vendor')} on Ajani!`,
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

  // Main booking click handler
  const handleBookingClick = () => {
    const currentCategory = normalizeCategory(vendor?.category);
    console.log('Booking clicked for category:', currentCategory);
    
    // For hotels, check if room is selected
    if (currentCategory === 'hotel') {
      if (!selectedRoom && vendor.details?.roomTypes?.length > 0) {
        // No room selected but rooms available, scroll to room selection
        if (roomSelectionRef.current) {
          roomSelectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Add highlight effect
          roomSelectionRef.current.classList.add('highlight-section');
          setTimeout(() => {
            if (roomSelectionRef.current) {
              roomSelectionRef.current.classList.remove('highlight-section');
            }
          }, 1500);
          
          showToast("Please select a room first", "info");
        }
        return;
      }
      
      // Room is selected, use the selected room for booking
      if (selectedRoom && selectedRoom.selectedOption) {
        handleRoomBookNow(selectedRoom, selectedRoom.selectedOption);
        return;
      }
    }
    
    // Prepare vendor data for non-hotel categories or hotels without room selection
    const vendorBookingData = {
      id: vendor._id || vendor.id,
      name: safeToString(vendor.title || vendor.name, "Vendor"),
      category: currentCategory,
      originalCategory: safeToString(vendor.category),
      priceFrom: vendor.price || vendor.details?.pricePerNight || vendor.price_from || 0,
      priceTo: vendor.price_to || vendor.price || vendor.details?.pricePerNight || 0,
      area: getLocationString(vendor.location || vendor.area),
      contact: safeToString(vendor.contact || vendorInfo?.phone || vendor.contactInformation?.phone),
      email: safeToString(vendor.email || vendorInfo?.email),
      description: safeToString(vendor.description || vendor.about),
      rating: parseFloat(safeToString(vendor.rating, "4.5")),
      capacity: vendor.capacity || vendor.details?.maxGuests || 2,
      amenities: getAmenities(vendor),
      images: getVendorImages(vendor),
      vendorId: getVendorIdFromListing(vendor),
      vendorInfo: vendorInfo,
      image: getVendorImages(vendor)[0],
      bookingType: currentCategory,
      selectedRoom: selectedRoom,
      details: vendor.details,
      contactInformation: vendor.contactInformation
    };
    
    console.log("Booking vendor data prepared:", vendorBookingData);
    
    // Store data
    localStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    sessionStorage.setItem('currentVendorBooking', JSON.stringify(vendorBookingData));
    
    // Navigate to booking page
    navigate('/booking', { 
      state: { 
        vendorData: vendorBookingData,
        category: currentCategory
      } 
    });
  };

  // Get features for Key Features section (from room selection modal - AMENITIES)
  const getFeatures = () => {
    return getFeaturesFromRoomModal(vendor);
  };

  const getServices = () => {
    if (vendor?.description || vendor?.about) {
      const description = safeToString(vendor.description || vendor.about);
      const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
      return sentences.slice(0, 5).map(s => s.trim() + ".");
    }
    
    const category = normalizeCategory(vendor?.category);
    if (category === 'hotel') {
      return [
        "Standard, Deluxe & Executive Rooms",
        "Restaurant & Bar Service",
        "Event & Meeting Spaces Available",
        "24/7 Reception and Concierge",
        "Laundry & Housekeeping Services",
      ];
    } else if (category === 'restaurant') {
      return [
        "Indoor & Outdoor Seating Options",
        "Private Dining Rooms Available",
        "Catering Services for Events",
        "Takeaway & Delivery Options",
        "Special Dietary Requirements Catered For",
      ];
    } else if (category === 'shortlet') {
      return [
        "Fully Furnished Apartments",
        "Monthly & Weekly Rates Available",
        "24/7 Self Check-in System",
        "Regular Cleaning Services",
        "All Utilities Included in Price",
      ];
    } else if (category === 'event') {
      return [
        "Event Planning Assistance Provided",
        "Audio-Visual Equipment Available",
        "Catering Coordination Services",
        "Decoration Services Available",
        "Professional Staff Support",
      ];
    }
    
    return [
      "Quality Service Guaranteed",
      "Professional Staff",
      "Modern Facilities",
      "Customer Satisfaction Focus",
      "Competitive Pricing",
    ];
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

  // Gallery Functions
  const handleOpenGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseGallery = () => {
    setGalleryOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    const galleryImages = getGalleryImages();
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    const galleryImages = getGalleryImages();
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Handle keyboard navigation in gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!galleryOpen) return;
      
      if (e.key === 'Escape') {
        handleCloseGallery();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen]);

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
    const errorMessage = error?.includes?.('timeout') 
      ? "Unable to load vendor details. The request took too long to complete."
      : error?.includes?.('not found')
      ? "The vendor you're looking for doesn't exist or has been removed."
      : "Unable to load vendor resources. Please refresh and try again.";

    const isNetworkError = error?.includes?.('timeout') || error?.includes?.('Failed to load');
    
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col mt- items-center justify-center min-h-[60vh] px-4">
          {/* Error Icon/Graphic */}
          <div className="mb-6 p-4 rounded-full bg-red-50 border border-red-100">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Error Title */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 font-manrope">
            {isNetworkError ? "Resource Loading Error" : "Vendor Not Found"}
          </h1>
          
          {/* Error Description */}
          <p className="text-gray-600 text-center mb-6 max-w-md font-manrope">
            {errorMessage}
            {isNetworkError && (
              <span className="block text-xs text-gray-500 mt-2">
                timeout of 5000ms exceeded
              </span>
            )}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Refresh Button */}
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors cursor-pointer font-medium flex items-center gap-2"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getVendorImages(vendor);
  const galleryImages = getGalleryImages();
  const category = normalizeCategory(vendor.category);
  const amenities = getAmenities(vendor);
  const features = getFeatures();
  const services = getServices();
  const vendorId = getVendorIdFromListing(vendor);
  const averageRating = vendor?.rating ? parseFloat(safeToString(vendor.rating)) : 4.5;
  const locationString = getLocationString(vendor.location || vendor.area, "Ibadan, Nigeria");
  const safeTitle = safeToString(vendor.title || vendor.name, "Vendor Details");

  // Get hotel room count for display
  const hotelRoomCount = category === 'hotel' 
    ? (vendor.details?.roomTypes?.length || 0)
    : 0;

  // Calculate price range for hotels
  const getPriceRange = () => {
    if (category === 'hotel' && vendor.details?.roomTypes) {
      const prices = vendor.details.roomTypes
        .map(room => room.pricePerNight || 0)
        .filter(price => price > 0);
      
      if (prices.length === 0) {
        return formatPrice(vendor.price || 0);
      }
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    
    return formatPrice(vendor.price || vendor.details?.pricePerNight || 0);
  };

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      {/* Embedded CSS for smooth scrolling, highlight effects, and toast styling */}
      <style jsx>{`
        @keyframes highlightPulse {
          0% {
            background-color: rgba(6, 234, 252, 0.05);
            box-shadow: 0 0 0 0 rgba(6, 234, 252, 0.4);
          }
          50% {
            background-color: rgba(6, 234, 252, 0.15);
            box-shadow: 0 0 0 10px rgba(6, 234, 252, 0);
          }
          100% {
            background-color: rgba(6, 234, 252, 0.05);
            box-shadow: 0 0 0 0 rgba(6, 234, 252, 0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .highlight-section {
          animation: highlightPulse 1.5s ease-in-out;
          border-radius: 1rem;
          position: relative;
          z-index: 1;
        }
        
        .smooth-scroll-target {
          scroll-margin-top: 20px;
          transition: all 0.5s ease;
        }
        
        /* Ensure smooth scrolling for the whole page */
        html {
          scroll-behavior: smooth;
        }
        
        /* Toast specific styles - with high z-index and proper positioning */
        #toast-notification {
          position: fixed !important;
          z-index: 99999 !important;
          top: 80px !important;
          right: 15px !important;
          max-width: 320px;
          animation: slideInRight 0.3s ease-out forwards;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          backdrop-filter: blur(10px);
        }
        
        /* Mobile optimization for toast */
        @media (max-width: 768px) {
          #toast-notification {
            top: 70px !important;
            right: 10px !important;
            left: 10px !important;
            max-width: calc(100% - 20px);
          }
        }
        
        /* Mobile optimization for other elements */
        @media (max-width: 768px) {
          .smooth-scroll-target {
            scroll-margin-top: 10px;
          }
          
          .highlight-section {
            animation: highlightPulse 1s ease-in-out;
          }
        }
      `}</style>
      
      <main className="md:pt-20 pt-16">
        <div className="md:max-w-[1245px] md:mx-auto">
          {/* Breadcrumb with Back Button - Compact mobile */}
          <div className="px-2.5 md:px-4">
            <nav className="flex items-center justify-between text-xs text-gray-600 mb-2 md:mb-2 font-manrope">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 hover:text-[#06EAFC] transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-800 text-sm" />
                <span className="hidden sm:inline">Back</span>
              </button>

              {/* Centered Route */}
              <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
                <Link
                  to="/"
                  className="hover:text-[#06EAFC] transition-colors hover:underline cursor-pointer"
                >
                  Home
                </Link>
                <span>/</span>
                <Link
                  to={`/category/${category}`}
                  className="hover:text-[#06EAFC] transition-colors hover:underline cursor-pointer"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}s
                </Link>
                <span>/</span>
                <span className="text-gray-900 truncate max-w-[100px] md:max-w-xs">
                  {safeTitle}
                </span>
              </div>

              {/* Empty div for spacing */}
              <div className="w-10"></div>
            </nav>
          </div>

          <div className="space-y-3 md:space-y-6">
            {/* Vendor Header Section - Compact mobile */}
            <div className="px-2.5 md:px-4 py-2 md:py-3 bg-white">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4 mb-1.5">
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <h1 className="text-lg md:text-xl lg:text-3xl font-bold text-gray-900 font-manrope line-clamp-2 flex-1">
                        {safeTitle}
                      </h1>
                      {vendorInfo?.verified && (
                        <VscVerifiedFilled className="text-green-500 text-sm md:text-xl hover:scale-110 transition-transform duration-200 cursor-pointer" />
                      )}
                    </div>
                    
                    {/* MOBILE: Share and Bookmark buttons */}
                    <div className="flex md:hidden items-center gap-1.5">
                      <button
                        onClick={handleShareClick}
                        className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <RiShare2Line className="text-gray-600 text-sm hover:text-[#06EAFC] transition-colors duration-300" />
                      </button>
                      
                      <button
                        onClick={handleFavoriteToggle}
                        disabled={isProcessing}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer ${
                          isFavorite
                            ? "bg-gradient-to-br from-red-500 to-pink-500 border-red-200 hover:from-red-600 hover:to-pink-600 hover:scale-110 hover:shadow-lg"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:scale-110 hover:shadow-md"
                        } ${isProcessing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {isProcessing ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isFavorite ? (
                          <FontAwesomeIcon 
                            icon={faBookmarkSolid} 
                            className="text-sm text-white" 
                          />
                        ) : (
                          <CiBookmark className="text-sm text-gray-600 hover:text-[#06EAFC] transition-all duration-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-row md:items-center gap-1.5 md:gap-4 lg:gap-8">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-700 font-medium py-1 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200 cursor-pointer">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        {category === 'hotel' && hotelRoomCount > 0 && (
                          <span className="text-gray-500 ml-1">({hotelRoomCount} room types)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="text-yellow-400 text-xs md:text-sm hover:text-yellow-500 transition-colors duration-200"
                        />
                      </div>
                      <span className="font-bold text-gray-900 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200 cursor-pointer">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-600 font-manrope text-xs md:text-sm hover:text-gray-800 transition-colors duration-200 cursor-pointer">
                        ({(vendor.reviewCount || 9)} Reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-700 font-manrope text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200 cursor-pointer">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-gray-500 text-xs md:text-sm hover:text-[#06EAFC] transition-colors duration-200"
                      />
                      <span className="truncate max-w-[120px] md:max-w-none">
                        {locationString}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DESKTOP: Share and Bookmark buttons */}
                <div className="hidden md:flex flex-col items-end gap-2 md:gap-4 mt-1 md:mt-0">
                  <div className="flex gap-3 md:gap-6 items-center">
                    <div className="flex items-center gap-1 md:gap-2 group relative">
                      <button
                        onClick={handleShareClick}
                        className="w-7 h-7 md:w-10 md:h-10 bg-white border border-gray-200 md:border-2 rounded-full flex items-center justify-center hover:bg-gray-50 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <RiShare2Line className="text-gray-600 text-sm md:text-xl group-hover:text-[#06EAFC] transition-colors duration-300" />
                      </button>
                      <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline group-hover:text-[#06EAFC] transition-colors duration-300 cursor-pointer">
                        Share
                      </span>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 group relative">
                      <button
                        onClick={handleFavoriteToggle}
                        disabled={isProcessing}
                        className={`w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border md:border-2 cursor-pointer group
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
                          <div className="w-3.5 h-3.5 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isFavorite ? (
                          <FontAwesomeIcon 
                            icon={faBookmarkSolid} 
                            className="text-sm md:text-xl text-white group-hover:scale-110 transition-transform duration-300" 
                          />
                        ) : (
                          <CiBookmark className="text-sm md:text-xl text-gray-600 group-hover:text-[#06EAFC] group-hover:scale-110 transition-all duration-300" />
                        )}
                      </button>
                      <span className="text-gray-600 text-xs md:text-sm font-manrope hidden md:inline group-hover:text-[#06EAFC] transition-colors duration-300 cursor-pointer">
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
            {/* Desktop Gallery Layout */}
            <section className="hidden lg:block px-2.5 md:px-4">
              <div className="relative grid grid-cols-4 grid-rows-2 gap-2.5 md:gap-3 h-[300px] md:h-[340px] overflow-hidden rounded-lg md:rounded-xl">
                {/* LEFT TOP */}
                <div 
                  onClick={() => handleOpenGallery(0)}
                  className="overflow-hidden cursor-pointer rounded md:rounded-lg"
                >
                  <img
                    src={galleryImages[0]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt="Gallery thumbnail"
                  />
                </div>

                {/* LEFT BOTTOM */}
                <div 
                  onClick={() => handleOpenGallery(1)}
                  className="overflow-hidden cursor-pointer rounded md:rounded-lg"
                >
                  <img
                    src={galleryImages[1]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt="Gallery thumbnail"
                  />
                </div>

                {/* CENTER BIG */}
                <div
                  onClick={() => handleOpenGallery(2)}
                  className="col-span-2 row-span-2 overflow-hidden cursor-pointer rounded md:rounded-lg"
                >
                  <img
                    src={galleryImages[2]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt="Main gallery image"
                  />
                </div>

                {/* RIGHT TOP */}
                <div 
                  onClick={() => handleOpenGallery(3)}
                  className="overflow-hidden cursor-pointer rounded md:rounded-lg"
                >
                  <img
                    src={galleryImages[3]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt="Gallery thumbnail"
                  />
                </div>

                {/* RIGHT BOTTOM */}
                <div 
                  onClick={() => handleOpenGallery(4)}
                  className="overflow-hidden cursor-pointer rounded md:rounded-lg"
                >
                  <img
                    src={galleryImages[4]}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    alt="Gallery thumbnail"
                  />
                </div>

                {/* View all photos button */}
                <button
                  onClick={() => handleOpenGallery(0)}
                  className="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-white text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 rounded md:rounded-lg shadow hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  View all photos
                </button>
              </div>
            </section>

            {/* Mobile Gallery Layout */}
            <section className="lg:hidden px-2.5">
              <div className="relative w-full">
                {/* Main Image - Reduced height */}
                <div className="relative rounded-lg overflow-hidden mb-2.5">
                  <img
                    src={galleryImages[currentImageIndex]}
                    alt="Main gallery"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-[200px] object-cover rounded-lg"
                    onClick={() => handleOpenGallery(currentImageIndex)}
                  />
                  
                  {/* Overlay button showing total photos */}
                  <button
                    onClick={() => handleOpenGallery(currentImageIndex)}
                    className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {galleryImages.length} Photos, click on the image to view
                  </button>
                </div>

                {/* Thumbnails Grid - Compact */}
                <div className="grid grid-cols-4 gap-1.5 px-0.5">
                  {galleryImages.slice(0, 4).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative rounded overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        currentImageIndex === index
                          ? "border-[#06EAFC] shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-14 object-cover hover:scale-105 transition-transform duration-200"
                      />
                      {/* Active indicator */}
                      {currentImageIndex === index && (
                        <div className="absolute inset-0 bg-[#06EAFC]/10 border-2 border-[#06EAFC] rounded"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Show all photos link if there are more than 4 */}
                {galleryImages.length > 4 && (
                  <div className="mt-1.5 text-center">
                    <button
                      onClick={() => handleOpenGallery(0)}
                      className="text-[#06EAFC] text-xs font-medium flex items-center justify-center gap-1 mx-auto hover:text-[#05d9eb] transition-colors cursor-pointer"
                    >
                      <span>View all {galleryImages.length} photos</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Price Range - Compact mobile */}
            <div className="px-2">
              <div className="text-start bg-white py-2.5 mx-auto">
                <p className="text-[#00065A] font-manrope text-base md:text-xl font-bold mb-0.5">
                  Price Range
                </p>
                <div className="flex flex-col justify-center gap-0.5 md:gap-3">
                  <div className="flex items-center gap-0.5 md:gap-2">
                    <span className="text-[14px] md:text-2xl text-gray-900 font-manrope font-bold">
                      {getPriceRange()}
                    </span>
                  </div>
                  <span className="text-gray-900 text-xs md:text-base mt-0.5 cursor-pointer">
                    {category === 'hotel' ? 'per night' : 
                     category === 'restaurant' ? 'per meal' : 
                     category === 'shortlet' ? 'per night' :
                     'per guest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Compact mobile */}
            <div className="px-2">
              <div className="w-full h-12 md:h-16 bg-gray-200 rounded-lg md:rounded-3xl flex items-center justify-between px-3 md:px-12 mx-auto md:max-w-[600px] hover:shadow-lg transition-all duration-300 hover:bg-gray-300/50">
                <button
                  onClick={() => {
                    const phone = safeToString(vendor.contact || vendorInfo?.phone || vendor.contactInformation?.phone);
                    if (phone) {
                      window.location.href = `tel:${phone}`;
                    } else {
                      showToast("Phone number not available", "info");
                    }
                  }}
                  className="flex flex-col items-center transition-all duration-300 px-1.5 group relative cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-blue-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <FontAwesomeIcon
                      icon={faPhone}
                      size={18}
                      className="text-gray-700 group-hover:text-blue-600 transition-all duration-300 transform group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs mt-0.5 font-manrope text-gray-700 group-hover:text-blue-600 transition-colors duration-300 relative">
                    Call
                  </span>
                </button>

                <button
                  onClick={() => showToast("Chat feature coming soon!", "info")}
                  className="flex flex-col items-center transition-all duration-300 px-1.5 group relative cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-green-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <IoChatbubbleEllipsesOutline
                      size={20}
                      className="text-gray-700 group-hover:text-green-600 transition-all duration-300 transform group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs mt-0.5 font-manrope text-gray-700 group-hover:text-green-600 transition-colors duration-300 relative">
                    Chat
                  </span>
                </button>

                {/* BOOKING BUTTON */}
                <button
                  onClick={handleBookingClick}
                  className="flex flex-col items-center transition-all duration-300 px-1.5 group relative cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-purple-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <FaBookOpen
                      size={18}
                      className="text-gray-700 group-hover:text-purple-600 transition-all duration-300 transform group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs mt-0.5 font-manrope text-gray-700 group-hover:text-purple-600 transition-colors duration-300 relative">
                    Book
                  </span>
                  {/* Tooltip for hotel category */}
                  {category === 'hotel' && (
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                      {selectedRoom ? "Ready to book" : "Select room first"}
                    </div>
                  )}
                </button>

                <button
                  onClick={() => showToast("Map feature coming soon!", "info")}
                  className="flex flex-col items-center transition-all duration-300 px-1.5 group relative cursor-pointer"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-red-100 group-hover:scale-125 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <HiLocationMarker
                      size={20}
                      className="text-gray-700 group-hover:text-red-600 transition-all duration-300 transform group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs mt-0.5 font-manrope text-gray-700 group-hover:text-red-600 transition-colors duration-300 relative">
                    Map
                  </span>
                </button>
              </div>
            </div>

            {/* About Section - Compact mobile */}
            <section className="w-full bg-[#F7F7FA] rounded-none md:rounded-3xl">
              <div className="px-2.5 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
                <div className="mb-4 md:mb-12">
                  <h2 className="text-base md:text-xl font-bold text-[#06F49F] mb-2 md:mb-4 font-manrope">
                    About
                  </h2>
                  <p className="text-gray-900 text-[13px] md:text-sm font-manrope hover:text-gray-800 cursor-pointer">
                    {safeToString(vendor.description || vendor.about || "Welcome to our premium venue, offering exceptional service and unforgettable experiences. With modern amenities and professional staff, we ensure your stay is comfortable and memorable.")}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-3 md:mb-6 font-manrope">
                      What we Do
                    </h3>
                    <div className="space-y-2.5 md:space-y-4">
                      {services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2.5 md:gap-4 hover:translate-x-1 transition-transform duration-300 group cursor-pointer"
                        >
                          <div className="flex-shrink-0 mt-0.5 md:mt-1 group-hover:scale-110 transition-transform duration-300">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              size={16}
                              className="text-[#06EAFC] group-hover:text-[#05d9eb] transition-colors duration-300"
                            />
                          </div>
                          <span className="text-gray-700 font-manrope leading-relaxed text-[13px] md:text-sm group-hover:text-gray-900 transition-colors duration-300">
                            {service}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-[#00065A] mb-3 md:mb-6 font-manrope">
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                      {features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 md:gap-3 hover:translate-x-1 transition-transform duration-300 group cursor-pointer"
                        >
                          <div className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FontAwesomeIcon
                              icon={feature.icon}
                              className="text-xs md:text-base text-gray-900 group-hover:text-[#06EAFC] transition-colors duration-300"
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

            {/* ================= ROOM SELECTION SECTION ================= */}
            {/* Only for Hotels (not shortlets) */}
            {category === 'hotel' && (
              <div 
                ref={roomSelectionRef}
                id="room-selection-section"
                className="smooth-scroll-target px-2.5 md:px-4"
              >
                <RoomSelection 
                  vendorData={vendor}
                  category={category}
                  onRoomSelect={handleRoomSelect}
                  onRoomBookNow={handleRoomBookNow}
                />
              </div>
            )}

            {/* Location Section with Google Maps - Compact mobile */}
            <div className="px-2.5 md:px-4">
              <div className="bg-white rounded-lg p-3 md:p-6">
                <h2 className="text-lg font-bold text-[#00065A] mb-4 font-manrope">
                  Location
                </h2>
                
                <div className="space-y-4">
                  {/* Google Maps Embed */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-48 md:h-96">
                    <iframe
                      src={getGoogleMapsUrl()}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map - Ibadan, Nigeria"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 font-manrope cursor-pointer">Location Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5 cursor-pointer">Address</p>
                        <p className="font-medium text-gray-900 text-sm cursor-pointer">
                          {safeToString(vendor.address || vendor.location?.address, `${safeToString(vendor.title || vendor.name, "Vendor")}, ${locationString}`)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5 cursor-pointer">Area</p>
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-xs" />
                          <p className="font-medium text-gray-900 text-sm cursor-pointer">
                            {locationString}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5 cursor-pointer">Contact</p>
                        <p className="font-medium text-gray-900 text-sm cursor-pointer">
                          {safeToString(vendor.contact || vendorInfo?.phone || vendor.contactInformation?.phone, "Not provided")}
                        </p>
                      </div>
                      <div className="pt-3">
                        <a
                          href={`https://www.google.com/maps/dir//${encodeURIComponent(safeToString(vendor.address || vendor.location?.address || vendor.title || vendor.name, "") + " Ibadan Nigeria")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors font-manrope font-medium cursor-pointer text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 13V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Get Directions
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* FULL SCREEN GALLERY MODAL */}
      {galleryOpen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white">
              <h2 className="text-base font-semibold">{safeToString(vendor?.title || vendor?.name, "Gallery")}</h2>
              <p className="text-xs text-white/80">
                {currentImageIndex + 1} / {galleryImages.length}
              </p>
            </div>
            
            <button
              onClick={handleCloseGallery}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faTimes} className="text-white text-xl" />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-3">
            <img
              src={galleryImages[currentImageIndex]}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={nextImage}
            />
            
            {/* Navigation Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-all md:left-8"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white cursor-pointer transition-all md:right-8"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-lg" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5">
              {galleryImages?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
                    currentImageIndex === index 
                      ? 'border-white scale-105' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Swipe Instructions */}
          <div className="md:hidden absolute bottom-16 left-0 right-0 text-center text-white/60 text-xs">
            <p>Swipe or use arrows to navigate</p>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VendorDetail;