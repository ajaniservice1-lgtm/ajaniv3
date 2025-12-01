import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faMapMarkerAlt,
  faPhone,
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
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { MdFavoriteBorder, MdShare } from "react-icons/md";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// Google Sheets hook
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
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80"
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
      // If we have less than 5 images, add dummy ones to complete 5
      const combined = [...urls.slice(0, 5)];
      while (combined.length < 5) {
        combined.push(dummyImages[combined.length % dummyImages.length]);
      }
      return combined.slice(0, 5);
    }

    // If no images in sheet, use all 5 dummy images
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

  // Format price with Naira symbol
  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US");
  };

  // Next/Prev image navigation
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Reviews matching your exact reference image
  const reviews = [
    {
      id: 1,
      name: "Angela Bassey",
      rating: 5,
      comment: "Beautiful place. The rooms were clean, the staff were very polite, and check-in was smooth. I loved the breakfast and the calm environment. Definitely coming back.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Ibrahim O",
      rating: 5,
      comment: "The hotel is well maintained and the service quality is very good. WiFi was fast, and the location is perfect for moving around Ibadan. The only issue was slight noise from the hallway at night.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Tola & Fola",
      rating: 5,
      comment: "The hosted a small event here and everything went perfectly. The hall was clean, the AC worked well, and the staff were helpful throughout. Highly recommended.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Popoola Basit",
      rating: 5,
      comment: "I really enjoyed their service, they are very professional, arrived on time, their decoration beautiful and made my event colourful as well, I absolutely love them.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ];

  // Services based on your reference image
  const services = [
    "Standard, Deluxe & Executive Rooms",
    "Restaurant & Bar",
    "Event & Meeting Spaces",
    "Airport Pickup",
    "Laundry & Concierge Services"
  ];

  // Key features based on your reference
  const keyFeatures = [
    { icon: faWifi, name: "WiFi", color: "text-blue-600" },
    { icon: faSwimmingPool, name: "Swimming Pool", color: "text-blue-500" },
    { icon: faCar, name: "Parking", color: "text-green-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50">
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
                className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg hover:bg-[#05d9eb] transition-colors"
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

  const images = getVendorImages(vendor);
  const features = getFeatures(vendor);

  return (
    <div className="min-h-screen bg-gray-50">
      <Meta
        title={`${vendor.name} | ${vendor.category} in ${vendor.area || "Ibadan"}`}
        description={vendor.short_desc || `Discover ${vendor.name} - ${vendor.category}`}
        url={`https://ajani.ai/vendor/${vendor.id}`}
        image={images[0]}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-[#06EAFC] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to={`/category/${vendor.category?.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-[#06EAFC] transition-colors"
          >
            {vendor.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate max-w-xs">{vendor.name}</span>
        </nav>

        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:w-2/3 space-y-8">
            {/* Image Gallery with 5 images */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96">
                <img
                  src={images[activeImageIndex]}
                  alt={`${vendor.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <IoIosArrowBack className="text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <IoIosArrowForward className="text-gray-800" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {activeImageIndex + 1}/{images.length}
                </div>
              </div>
              
              {/* Thumbnail Strip */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === index
                          ? "border-[#06EAFC] ring-2 ring-[#06EAFC]/20"
                          : "border-gray-200 hover:border-gray-300"
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

            {/* Vendor Header Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Left: Name and Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {vendor.name}
                    </h1>
                    <VscVerifiedFilled className="text-green-500 text-2xl" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
                      <span>Hotel & Event Centre • Jericho, Ibadan</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <FontAwesomeIcon icon={faStar} className="text-gray-300" />
                        </div>
                        <span className="font-bold text-gray-900">4.7</span>
                        <span className="text-gray-600">(9 Reviews)</span>
                      </div>
                    </div>
                    
                    {/* Facility Icons */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBed} className="text-blue-600" />
                        <span className="text-gray-700 font-medium">2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-green-600" />
                        <span className="text-gray-700 font-medium">4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-600" />
                        <span className="text-gray-700 font-medium">Jan 20</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                        <span className="text-gray-700 font-medium">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Save/Share and Price */}
                <div className="flex flex-col items-end gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isSaved
                          ? "bg-red-50 border border-red-200"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <MdFavoriteBorder
                        className={`text-lg ${isSaved ? "text-red-500" : "text-gray-600"}`}
                      />
                    </button>
                    <button className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                      <MdShare className="text-gray-600 text-lg" />
                    </button>
                  </div>
                  
                  {/* Price Range - Exact design from image */}
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Price Range
                    </h3>
                    <div className="text-3xl font-bold text-gray-900">
                      ₦25,000 - ₦85,000
                      <span className="text-base font-normal text-gray-600 block">
                        per night
                      </span>
                    </div>
                    <button className="mt-4 bg-[#06EAFC] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#05d9eb] transition-colors shadow-lg">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
              <p className="text-gray-700 leading-relaxed text-lg mb-8">
                Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan. Designed for both business and leisure travelers, the hotel provides a peaceful stay with quick access to major city landmarks.
              </p>
              
              {/* What They Do Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What They Do</h3>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#06EAFC] rounded-full mt-2"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {keyFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl">
                      <FontAwesomeIcon
                        icon={feature.icon}
                        className={`${feature.color} text-3xl mb-3`}
                      />
                      <span className="font-medium text-gray-900">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews Section - Exact design from first image */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews</h2>
              <div className="space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0">
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={`text-yellow-400 ${i < review.rating ? "opacity-100" : "opacity-30"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Contact and Map */}
          <div className="lg:w-1/3 space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                {vendor.phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faPhone} className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${vendor.phone}`}
                        className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {vendor.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {vendor.whatsapp && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faWhatsapp} className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <a
                        href={`https://wa.me/${vendor.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {vendor.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                
                {vendor.email && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faUtensils} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${vendor.email}`}
                        className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {vendor.address && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-900 font-medium">{vendor.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Location</h3>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-gray-100 rounded-2xl h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 text-2xl" />
                    </div>
                    <p className="text-gray-700 font-medium">Jericho, Ibadan</p>
                    <p className="text-gray-500 text-sm mt-2">View on map</p>
                  </div>
                </div>
                
                {/* Map Controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <FontAwesomeIcon icon={faChevronLeft} className="text-gray-700" />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-700" />
                  </button>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Open in Google Maps
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button className="w-full bg-[#06EAFC] text-white py-3 rounded-xl font-bold hover:bg-[#05d9eb] transition-colors">
                  Check Availability
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                  Get Directions
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                  View Photos
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorDetail;