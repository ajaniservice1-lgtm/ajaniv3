import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RiShare2Line } from "react-icons/ri";
import { CiBookmark } from "react-icons/ci";
import { FaPhone } from "react-icons/fa6";
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
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

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

    // Default dummy reviews
    return [
      {
        id: 1,
        name: "Angela Bassey",
        rating: 5,
        comment:
          "Beautiful place. The rooms were clean, the staff were very polite, and check-in was smooth. I loved the breakfast and the calm environment. Definitely coming back.",
        date: "2 weeks ago",
      },
      {
        id: 2,
        name: "Ibrahim O",
        rating: 5,
        comment:
          "The hotel is well maintained and the service quality is very good. WiFi was fast, and the location is perfect for moving around Ibadan. The only issue was slight noise from the hallway at night.",
        date: "1 month ago",
      },
      {
        id: 3,
        name: "Tola & Fola",
        rating: 5,
        comment:
          "The hosted a small event here and everything went perfectly. The hall was clean, the AC worked well, and the staff were helpful throughout. Highly recommended.",
        date: "3 weeks ago",
      },
      {
        id: 4,
        name: "Popoola Basit",
        rating: 5,
        comment:
          "I really enjoyed their service, they are very professional, arrived on time, their decoration beautiful and made my event colourful as well, I absolutely love them.",
        date: "2 days ago",
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
      return vendor.category;
    }
    // Fallback to determine from name or type
    if (vendor?.name?.toLowerCase().includes("hotel"))
      return "Hotel & Event Centre";
    if (vendor?.name?.toLowerCase().includes("restaurant"))
      return "Restaurant & Bar";
    if (vendor?.name?.toLowerCase().includes("shortlet"))
      return "Shortlet & Apartment";
    return "Hotel & Event Centre";
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

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesomeIcon
            key={`full-${i}`}
            icon={faStar}
            className="text-yellow-400"
          />
        ))}

        {/* Half star if needed */}
        {hasHalfStar && (
          <div className="relative">
            <FontAwesomeIcon icon={faStar} className="text-gray-300" />
            <div
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesomeIcon
            key={`empty-${i}`}
            icon={faStar}
            className="text-gray-300"
          />
        ))}
      </div>
    );
  };

  // Next/Prev image navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 font-manrope">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
              <i className="fas fa-exclamation-triangle text-3xl text-gray-300 mb-4 block"></i>
              <h3 className="text-lg text-gray-800 mb-2">Vendor Not Found</h3>
              <p className="text-gray-600 mb-4">
                The vendor you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate(-1)}
                className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors font-manrope"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
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
    { icon: faWifi, name: "WiFi", color: "text-blue-600" },
    { icon: faSwimmingPool, name: "Swimming Pool", color: "text-blue-500" },
    { icon: faCar, name: "Parking", color: "text-green-600" },
    { icon: faUtensils, name: "Restaurant", color: "text-orange-600" },
    { icon: faShieldAlt, name: "24/7 Security", color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-manrope">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6 font-manrope">
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
          <span className="text-gray-900 truncate max-w-xs">{vendor.name}</span>
        </nav>

        {/* Single Column Layout */}
        <div className="space-y-8">
          {/* Header Info - Updated layout */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Left: Name and Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 font-manrope">
                    {vendor.name}
                  </h1>
                  <VscVerifiedFilled className="text-green-500 text-2xl" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-6">
                  {/* Category - No icon in front */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-full font-manrope">
                      {categoryDisplay}
                    </span>
                  </div>

                  {/* Rating with proper star rendering */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(rating)}
                    </div>
                    <span className="font-bold text-gray-900 font-manrope">
                      {formattedRating}
                    </span>
                    <span className="text-gray-600 font-manrope">
                      ({reviewCount} Reviews)
                    </span>
                  </div>

                  {/* Area with location icon */}
                  <div className="flex items-center gap-2 text-gray-700 font-manrope">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-500"
                    />
                    <span>{area}</span>
                  </div>
                </div>
              </div>

              {/* Right: Save/Share buttons with new icons */}
              <div className="flex flex-col items-end gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isSaved
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-white border-2 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <CiBookmark
                      className={`text-2xl ${
                        isSaved ? "text-blue-500" : "text-gray-600"
                      }`}
                    />
                  </button>
                  <button className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <RiShare2Line className="text-gray-600 text-2xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-[500px]">
              <img
                src={images[activeImageIndex]}
                alt={`${vendor.name} - Image ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation buttons */}
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <IoIosArrowBack className="text-gray-800 text-2xl" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <IoIosArrowForward className="text-gray-800 text-2xl" />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-6 right-6 bg-black/80 text-white px-4 py-2 rounded-full text-lg font-medium font-manrope">
                {activeImageIndex + 1}/{images.length}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden border-3 transition-all duration-200 ${
                      activeImageIndex === index
                        ? "border-[#06EAFC] ring-4 ring-[#06EAFC]/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="px-8 pb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-manrope">
                Price Range
              </h3>
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-bold text-gray-900 font-manrope">
                  ₦{formatPrice(priceRange.from)}
                </span>
                <span className="text-xl text-gray-600 font-manrope">-</span>
                <span className="text-xl font-bold text-gray-900 font-manrope">
                  ₦{formatPrice(priceRange.to)}
                </span>
                <span className="text-lg text-gray-600 ml-3 font-manrope">
                  per night
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full p-6">
              <div className="bg-gray-100 rounded-3xl flex items-center justify-around p-4 max-w-4xl mx-auto">
                <button className="flex flex-col items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <FaPhone size={28} color="#000" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 font-manrope">
                    Call
                  </span>
                </button>

                <button className="flex flex-col items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <IoChatbubbleEllipsesOutline size={28} color="#000" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 font-manrope">
                    Chat
                  </span>
                </button>

                <button className="flex flex-col items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <FaBookOpen size={28} color="#000" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 font-manrope">
                    Book
                  </span>
                </button>

                <button className="flex flex-col items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <HiLocationMarker size={28} color="#000" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 font-manrope">
                    Location
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* About Section - Full Width */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-manrope">
              About
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-8 font-manrope">
              {vendor.description ||
                vendor.short_desc ||
                "Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan. Designed for both business and leisure travelers, the hotel provides a peaceful stay with quick access to major city landmarks."}
            </p>
          </section>

          {/* What They Do & Features Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What They Do Section */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-manrope">
                What They Do
              </h3>
              <div className="space-y-3">
                {(services.length > 0 ? services : defaultServices).map(
                  (service, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#06EAFC] rounded-full mt-2"></div>
                      <span className="text-gray-700 font-manrope">
                        {service}
                      </span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Key Features Section */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-manrope">
                Key Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(features.length > 0
                  ? features.slice(0, 6).map((feature, index) => ({
                      icon: defaultFeatures[index % defaultFeatures.length]
                        .icon,
                      name: feature,
                      color:
                        defaultFeatures[index % defaultFeatures.length].color,
                    }))
                  : defaultFeatures
                ).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${feature.color}`}
                    >
                      <FontAwesomeIcon
                        icon={feature.icon}
                        className="text-lg"
                      />
                    </div>
                    <span className="font-medium text-gray-900 font-manrope">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Reviews Section - Updated to use proper star rendering */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-manrope">
                Reviews
              </h2>
              <span className="text-gray-600 font-manrope">
                {reviewCount} reviews
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="pb-6 border-b border-gray-200 last:border-b-0"
                >
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-900 text-lg font-manrope">
                      {review.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      {review.date && (
                        <span className="text-sm text-gray-500 font-manrope">
                          {review.date}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed font-manrope">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Location Map */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 font-manrope">
              Location
            </h3>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-blue-600 text-2xl"
                    />
                  </div>
                  <p className="text-gray-700 font-medium font-manrope">
                    {area}
                  </p>
                  <p className="text-gray-500 text-sm mt-2 font-manrope">
                    View on map
                  </p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    className="text-gray-700"
                  />
                </button>
                <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="text-gray-700"
                  />
                </button>
              </div>
            </div>

            <button className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors font-manrope">
              Open in Google Maps
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDetail;
