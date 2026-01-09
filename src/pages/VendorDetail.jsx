// src/components/VendorDetail.jsx
import React, { useState, useEffect } from "react";
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
import listingService from "../lib/listingService";

// Import RoomSelection component
import RoomSelection from "../components/RoomSelection"; // Adjust path if needed

// ===== Fallback Images =====
const FALLBACK_IMAGES = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
  event: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  shortlet: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
};

// ===== Category Normalization =====
const normalizeCategory = (category) => {
  if (!category) return "restaurant";
  const cat = category.toString().toLowerCase().trim();

  if (
    cat.includes("restaurant") ||
    cat.includes("food") ||
    cat.includes("cafe") ||
    cat.includes("eatery") ||
    cat.includes("diner") ||
    cat.includes("bistro")
  )
    return "restaurant";

  if (
    cat.includes("hotel") ||
    cat.includes("shortlet") ||
    cat.includes("resort") ||
    cat.includes("inn") ||
    cat.includes("motel") ||
    cat.includes("lodging")
  )
    return "hotel";

  if (
    cat.includes("event") ||
    cat.includes("venue") ||
    cat.includes("hall") ||
    cat.includes("center") ||
    cat.includes("conference") ||
    cat.includes("meeting")
  )
    return "event";

  return "restaurant";
};

// ===== Helper Functions =====
const getVendorImages = (vendor) => {
  if (!vendor) return Array(5).fill(FALLBACK_IMAGES.default);

  if (vendor.images && Array.isArray(vendor.images)) {
    const imageUrls = vendor.images
      .map((img) => (typeof img === "string" ? img : img.url))
      .filter((url) => url && url.startsWith("http"));

    if (imageUrls.length > 0) {
      const category = normalizeCategory(vendor.category);
      const fallback = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default;
      const filled = [...imageUrls];
      while (filled.length < 5) filled.push(fallback);
      return filled.slice(0, 5);
    }
  }

  const category = normalizeCategory(vendor.category);
  return Array(5).fill(FALLBACK_IMAGES[category] || FALLBACK_IMAGES.default);
};

const getVendorIdFromListing = (listing) => {
  if (!listing) return null;
  return (
    listing.vendorId?._id ||
    listing.vendorId?.id ||
    listing.vendor?._id ||
    listing.vendor?.id ||
    listing.vendorId ||
    listing._id ||
    listing.id
  );
};

const getVendorInfo = (listing) => {
  if (!listing) return null;

  const vendorObj =
    (typeof listing.vendorId === "object" && listing.vendorId) ||
    (typeof listing.vendor === "object" && listing.vendor);

  if (vendorObj) {
    return {
      id: vendorObj._id || vendorObj.id,
      name: vendorObj.name || vendorObj.username || "Vendor",
      email: vendorObj.email || null,
      phone: vendorObj.phone || null,
      verified: !!vendorObj.verified,
    };
  }

  return {
    id: typeof listing.vendorId === "string" ? listing.vendorId : null,
    name: "Vendor",
    email: null,
    phone: null,
    verified: false,
  };
};

const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const profile = localStorage.getItem("userProfile");
      setIsAuthenticated(!!token && !!profile);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return isAuthenticated;
};

// ===== Vendor Detail Component =====
const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [vendorListings, setVendorListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const isAuthenticated = useAuthStatus();

  // Fetch vendor data
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const result = await listingService.getListingById(id);
        if (result.status === "success" && result.data?.listing) {
          const foundVendor = result.data.listing;
          setVendor(foundVendor);
          setVendorInfo(getVendorInfo(foundVendor));

          const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
          setIsFavorite(saved.some((item) => item.id === id));
        } else {
          setError("Vendor not found.");
        }
      } catch (err) {
        setError("Failed to load vendor details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVendorData();
  }, [id]);

  // Fetch other listings by same vendor
  useEffect(() => {
    const fetchOtherListings = async () => {
      if (!vendor) return;
      const vendorId = getVendorIdFromListing(vendor);
      if (!vendorId) return;

      try {
        const result = await listingService.getListingsByVendor(vendorId);
        if (result.status === "success") {
          const listings = Array.isArray(result.data.listings)
            ? result.data.listings
            : [];
          setVendorListings(listings.filter((l) => l._id !== id));
        }
      } catch (err) {
        console.warn("Could not load other vendor listings");
      }
    };

    fetchOtherListings();
  }, [vendor, id]);

  // ===== Handlers =====
  const handleBookingClick = () => {
    if (!vendor) return;

    const vendorId = vendor._id || vendor.id;
    const vendorBookingData = {
      id: vendorId,
      name: vendor.title || vendor.name,
      category: normalizeCategory(vendor.category),
      originalCategory: vendor.category,
      priceFrom: vendor.price || vendor.price_from,
      area: vendor.location?.area || vendor.area,
      contact: vendor.contact || vendorInfo?.phone,
      email: vendor.email || vendorInfo?.email,
      description: vendor.description,
      rating: vendor.rating,
      capacity: vendor.capacity,
      amenities: vendor.amenities,
      images: getVendorImages(vendor),
      vendorId,
      vendorInfo,
      image: getVendorImages(vendor)[0],
    };

    localStorage.setItem("currentVendorBooking", JSON.stringify(vendorBookingData));
    sessionStorage.setItem("currentVendorBooking", JSON.stringify(vendorBookingData));

    navigate("/booking", { state: { vendorData: vendorBookingData, vendorId } });
  };

  const handleFavoriteToggle = () => {
    if (!vendor || isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
      const vendorId = vendor._id || vendor.id;

      if (!isAuthenticated) {
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        localStorage.setItem("pendingSaveItem", JSON.stringify({ ...vendor, id: vendorId }));
        navigate("/login");
        setIsProcessing(false);
        return;
      }

      if (isFavorite) {
        const updated = saved.filter((item) => item.id !== vendorId);
        localStorage.setItem("userSavedListings", JSON.stringify(updated));
        setIsFavorite(false);
      } else {
        const category = normalizeCategory(vendor.category);
        const newItem = {
          id: vendorId,
          name: vendor.title || vendor.name,
          price: formatPrice(vendor.price || vendor.price_from),
          perText:
            category === "hotel"
              ? "per night"
              : category === "restaurant"
              ? "per meal"
              : "per guest",
          rating: parseFloat(vendor.rating || "4.5"),
          tag: "Guest Favorite",
          image: getVendorImages(vendor)[0],
          category: vendor.category,
          location: vendor.location?.area || vendor.area || "Ibadan",
          savedDate: new Date().toISOString().split("T")[0],
          originalData: vendor,
        };
        localStorage.setItem("userSavedListings", JSON.stringify([...saved, newItem]));
        setIsFavorite(true);
      }

      setIsProcessing(false);
    }, 300);
  };

  // ===== Render Helpers =====
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "hotel":
        return faBed;
      case "restaurant":
        return faUtensils;
      case "event":
        return faMusic;
      default:
        return faUtensils;
    }
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi")) return faWifi;
    if (lower.includes("parking") || lower.includes("car")) return faCar;
    if (lower.includes("pool")) return faSwimmingPool;
    if (lower.includes("spa")) return faSpa;
    if (lower.includes("gym") || lower.includes("fitness")) return faDumbbell;
    if (lower.includes("music")) return faMusic;
    if (lower.includes("food") || lower.includes("meal")) return faUtensils;
    if (lower.includes("bed") || lower.includes("room")) return faBed;
    return faCheckCircle;
  };

  const getAmenities = () => {
    if (vendor?.amenities) {
      if (typeof vendor.amenities === "string")
        return vendor.amenities.split(",").map((s) => s.trim()).filter(Boolean);
      if (Array.isArray(vendor.amenities)) return vendor.amenities;
    }

    const cat = normalizeCategory(vendor?.category);
    if (cat === "hotel")
      return ["Free WiFi", "Swimming Pool", "Parking", "Air Conditioning", "Restaurant", "Spa", "Gym"];
    if (cat === "restaurant")
      return ["Outdoor Seating", "Live Music", "Parking", "Takeaway", "Vegetarian Options"];
    if (cat === "event")
      return ["Stage", "Sound System", "Lighting", "Parking", "Catering Service"];
    return ["Not specified"];
  };

  const getServices = () => {
    if (vendor?.description) {
      return vendor.description
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 10)
        .slice(0, 5)
        .map((s) => s.trim() + ".");
    }
    return [
      "Standard, Deluxe & Executive Rooms",
      "Restaurant & Bar",
      "Event & Meeting Spaces",
      "Airport Pickup",
      "Laundry & Concierge Services",
    ];
  };

  const getReviewCount = () => {
    const count = parseInt(vendor?.review_count, 10);
    return isNaN(count) ? 9 : count;
  };

  const getCategoryDisplay = (v) => {
    if (v?.category) {
      let cleaned = v.category.toString().replace(/^\d+\.\s*/, "").split(".").pop()?.trim() || "";
      cleaned = cleaned.replace(/['"]/g, "").trim();
      return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : "Business";
    }
    return "Business";
  };

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? "₦ --" : `₦${num.toLocaleString()}`;
  };

  // ===== Loading & Error States =====
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
          <p className="text-gray-600 mb-6">{error || "The vendor doesn't exist or has been removed."}</p>
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

  // ===== Render =====
  const images = getVendorImages(vendor);
  const category = normalizeCategory(vendor.category);
  const amenities = getAmenities();
  const services = getServices();
  const reviewCount = getReviewCount();
  const categoryDisplay = getCategoryDisplay(vendor);
  const vendorId = getVendorIdFromListing(vendor);

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen font-manrope">
      <Header />

      <main className="pt-14 md:pt-14">
        {/* Mobile Back Button */}
        <div className="md:hidden fixed top-16 left-0 z-50">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
            aria-label="Go back"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-gray-800 text-base" />
          </button>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-gray-600 mb-2 px-4 font-manrope justify-center">
          <Link to="/" className="hover:text-[#06EAFC] transition-colors hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/category/${category}`}
            className="hover:text-[#06EAFC] transition-colors hover:underline"
          >
            {categoryDisplay}
          </Link>
          <span className="text-gray-900 truncate max-w-[120px]">{vendor.title || vendor.name}</span>
        </nav>

        {/* Main Content */}
        <div className="space-y-6 px-4 lg:px-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 line-clamp-2">
                    {vendor.title || vendor.name}
                  </h1>
                  {vendorInfo?.verified && <VscVerifiedFilled className="text-green-500 text-xl" />}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-gray-700 font-medium">{categoryDisplay}</span>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span className="font-bold text-gray-900">{vendor.rating || "4.5"}</span>
                    <span className="text-gray-600">({reviewCount} Reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
                    <span>{vendor.location?.area || vendor.area || "Ibadan"}</span>
                  </div>
                </div>

                {vendorInfo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#06EAFC] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(vendorInfo.name || "V").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {vendorInfo.name}
                          {vendorInfo.verified && <VscVerifiedFilled className="inline text-green-500 ml-1" />}
                        </h3>
                        <p className="text-xs text-gray-600">Vendor ID: {vendorId?.substring(0, 8)}...</p>
                      </div>
                    </div>
                    {vendorInfo.email && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                        <span>{vendorInfo.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center">
                <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50">
                  <RiShare2Line className="text-gray-600" />
                </button>
                <button
                  onClick={handleFavoriteToggle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isFavorite
                      ? "bg-gradient-to-br from-red-500 to-pink-500 border-red-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  title={isFavorite ? "Remove from saved" : "Add to saved"}
                >
                  {isFavorite ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <CiBookmark className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="hidden md:block">
            <div className="flex gap-4">
              <div className="flex flex-col gap-4">
                {images.slice(1, 3).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-[305px] h-[162px] object-cover rounded-2xl cursor-pointer hover:scale-105"
                    onClick={() => setActiveImageIndex(i + 1)}
                  />
                ))}
              </div>
              <div className="relative">
                <img
                  src={images[activeImageIndex]}
                  alt=""
                  className="w-[630px] h-[324px] object-cover rounded-2xl hover:scale-105"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                >
                  <IoIosArrowBack className="text-gray-800 text-xl" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white"
                >
                  <IoIosArrowForward className="text-gray-800 text-xl" />
                </button>
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                  {activeImageIndex + 1}/{images.length}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {images.slice(3, 5).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="w-[305px] h-[162px] object-cover rounded-2xl cursor-pointer hover:scale-105"
                    onClick={() => setActiveImageIndex(i + 3)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Image Gallery */}
          <div className="md:hidden">
            <div className="relative w-full h-[300px] rounded-none overflow-hidden">
              <img
                src={images[activeImageIndex]}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <IoIosArrowBack className="text-gray-800 text-lg" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"
              >
                <IoIosArrowForward className="text-gray-800 text-lg" />
              </button>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                {activeImageIndex + 1}/{images.length}
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === activeImageIndex ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="bg-white py-4 rounded-xl text-center hover:shadow-md">
            <p className="text-[#00065A] font-bold mb-2">Price Range</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold">{formatPrice(vendor.price || vendor.price_from)}</span>
              <span className="text-gray-500">-</span>
              <span className="text-xl font-bold">
                {formatPrice(vendor.price_to || vendor.price || vendor.price_from)}
              </span>
              <span className="text-gray-600 text-sm ml-2">
                {category === "hotel" ? "per night" : category === "restaurant" ? "per meal" : "per guest"}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex justify-center">
            <div className="flex items-center justify-between w-full max-w-[600px] h-16 bg-gray-200 rounded-3xl px-12">
              <button
                onClick={() =>
                  (vendor.contact || vendorInfo?.phone) &&
                  (window.location.href = `tel:${vendor.contact || vendorInfo?.phone}`)
                }
                className="flex flex-col items-center group"
              >
                <FontAwesomeIcon icon={faPhone} className="text-gray-700 group-hover:text-blue-600" size="lg" />
                <span className="text-xs mt-1 text-gray-700 group-hover:text-blue-600">Call</span>
              </button>
              <button
                onClick={() => alert("Chat feature coming soon!")}
                className="flex flex-col items-center group"
              >
                <IoChatbubbleEllipsesOutline className="text-gray-700 group-hover:text-green-600" size={22} />
                <span className="text-xs mt-1 text-gray-700 group-hover:text-green-600">Chat</span>
              </button>
              <button onClick={handleBookingClick} className="flex flex-col items-center group">
                <FaBookOpen className="text-gray-700 group-hover:text-purple-600" size="lg" />
                <span className="text-xs mt-1 text-gray-700 group-hover:text-purple-600">Book</span>
              </button>
              <button
                onClick={() => alert("Map feature coming soon!")}
                className="flex flex-col items-center group"
              >
                <HiLocationMarker className="text-gray-700 group-hover:text-red-600" size={22} />
                <span className="text-xs mt-1 text-gray-700 group-hover:text-red-600">Map</span>
              </button>
            </div>
          </div>

          {/* About Section — PLACE FOR ROOM SELECTION INTEGRATION */}
          <section className="bg-[#F7F7FA] rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#06F49F] mb-4">About</h2>
            <p className="text-gray-700 mb-8">{vendor.description || "No description available."}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#00065A] mb-6">What They Do</h3>
                <div className="space-y-4">
                  {services.map((service, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-[#06EAFC] mt-0.5" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#00065A] mb-6">Key Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: faWifi, name: "WiFi" },
                    { icon: faSwimmingPool, name: "Swimming Pool" },
                    { icon: faCar, name: "Parking" },
                    { icon: faUtensils, name: "Restaurant" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <FontAwesomeIcon icon={feat.icon} className="text-gray-900" />
                      <span className="font-medium">{feat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* === ROOM SELECTION FOR HOTELS ONLY === */}
          {category === 'hotel' && (
            <div className="px-4 sm:px-6 lg:px-8 py-6 bg-white rounded-xl">
              <RoomSelection
                vendorData={vendor}
                onRoomSelected={(selectedRoomData) => {
                  // Store selected room data
                  localStorage.setItem('selectedRoomData', JSON.stringify(selectedRoomData));
                  
                  // Navigate to booking with full context
                  const vendorBookingData = {
                    id: vendor._id || vendor.id,
                    name: vendor.title || vendor.name,
                    category: 'hotel',
                    priceFrom: vendor.price || vendor.price_from,
                    area: vendor.location?.area || vendor.area,
                    description: vendor.description,
                    rating: vendor.rating,
                    images: getVendorImages(vendor),
                    selectedRoom: selectedRoomData, // <-- pass room info
                  };

                  navigate('/booking', {
                    state: { vendorData: vendorBookingData }
                  });
                }}
              />
            </div>
          )}

          {/* Tabs */}
          <div className="max-w-7xl mx-auto">
            <div className="border-b border-gray-200">
              {["overview", "amenities", "reviews", "location", "vendor"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 font-medium text-sm border-b-2 ${
                    activeTab === tab
                      ? "border-[#06EAFC] text-[#06EAFC]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">About {vendor.title || vendor.name}</h3>
                  <p className="text-gray-600">{vendor.description}</p>
                </div>
              )}

              {activeTab === "amenities" && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Amenities & Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="text-[#06EAFC]" />
                        <span className="font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
                  <div className="text-5xl font-bold">{vendor.rating || "4.5"}</div>
                </div>
              )}

              {activeTab === "location" && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Location</h3>
                  <p>Address: {vendor.address || `${vendor.title}, ${vendor.area}`}</p>
                </div>
              )}

              {activeTab === "vendor" && vendorInfo && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Vendor Information</h3>
                  <p>Name: {vendorInfo.name}</p>
                  {vendorInfo.email && <p>Email: {vendorInfo.email}</p>}
                  {vendorInfo.phone && <p>Phone: {vendorInfo.phone}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-[#06EAFC] to-[#06F49F] py-12 text-center rounded-3xl">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Book?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Reserve your spot at {vendor.title || vendor.name} today!
            </p>
            <button
              onClick={handleBookingClick}
              className="px-8 py-4 bg-white text-[#06EAFC] rounded-xl hover:bg-gray-100 hover:scale-105 transition-all"
            >
              Book Now - {formatPrice(vendor.price || vendor.price_from)}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDetail;