// src/pages/VendorDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faMapMarkerAlt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"; // Correct import for WhatsApp
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";
import { MdFavoriteBorder, MdShare } from "react-icons/md";

// Google Sheets hook (same as in CategoryResults)
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

  // Fallback images if no images in data
  const FALLBACK_IMAGES = {
    hotel:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    restaurant:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    shortlet:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    tourist:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
    default:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  };

  // Get images for the vendor
  const getVendorImages = (vendor) => {
    if (!vendor) return [FALLBACK_IMAGES.default];

    const raw = vendor["image url"] || "";
    const urls = raw
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u && u.startsWith("http"));

    if (urls.length > 0) return urls;

    const cat = (vendor.category || "").toLowerCase();
    if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
    if (cat.includes("restaurant")) return [FALLBACK_IMAGES.restaurant];
    if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
    if (cat.includes("tourist")) return [FALLBACK_IMAGES.tourist];
    return [FALLBACK_IMAGES.default];
  };

  // Parse features from features column
  const getFeatures = (vendor) => {
    if (!vendor?.features) return [];

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(vendor.features);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // If not JSON, split by comma or other delimiters
      return vendor.features
        .split(/[,|]/)
        .map((f) => f.trim())
        .filter((f) => f);
    }

    return [];
  };

  // Parse ratings breakdown
  const getRatingsBreakdown = (vendor) => {
    if (!vendor?.ratings_breakdown) return null;

    try {
      return JSON.parse(vendor.ratings_breakdown);
    } catch {
      return null;
    }
  };

  // Dummy reviews data (you can replace this with actual data later)
  const dummyReviews = [
    {
      id: 1,
      name: "Angola Bassey",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Beautiful place. The rooms were clean, the staff were very polite, and check-in was smooth. I loved the breakfast and the calm environment. Definitely coming back.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Tola & Fola",
      rating: 4,
      date: "1 month ago",
      comment:
        "The house a small event here and everything went perfectly. The hall was clean, the AC worked well, and the staff were helpful throughout. Highly recommended.",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Ibrahim O",
      rating: 4,
      date: "3 weeks ago",
      comment:
        "The hotel is well maintained and the service quality is very good. The location is perfect for moving around. The only issue was slight noise from the hallway at night.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
  ];

  // Dummy "What They Do" services
  const dummyServices = [
    "Standard, Deluxe & Executive Rooms",
    "Restaurant & Bar",
    "Event Meeting Spaces",
    "Airport Transfers",
    "24/7 Concierge Services",
    "Swimming Pool Access",
    "Free WiFi",
    "Parking Space",
  ];

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

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
  const ratingsBreakdown = getRatingsBreakdown(vendor);

  return (
    <div className="min-h-screen bg-gray-50">
      <Meta
        title={`${vendor.name} | ${vendor.category} in ${
          vendor.area || "Ibadan"
        }`}
        description={
          vendor.short_desc ||
          `Discover ${vendor.name} - ${vendor.category} in ${
            vendor.area || "Ibadan"
          }`
        }
        url={`https://ajani.ai/vendor/${vendor.id}`}
        image={images[0]}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
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
            {vendor.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{vendor.name}</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Gallery */}
            <div className="lg:w-1/2">
              <div className="rounded-xl overflow-hidden mb-4">
                <img
                  src={images[activeImageIndex]}
                  alt={vendor.name}
                  className="w-full h-64 lg:h-80 object-cover rounded-xl"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        activeImageIndex === index
                          ? "border-[#06EAFC]"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${vendor.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <div className="lg:w-1/2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {vendor.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-[#06EAFC]"
                      />
                      <span>{vendor.area || "Ibadan"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400"
                      />
                      <span className="font-semibold">
                        {vendor.rating || "4.7"}
                      </span>
                      <span>({dummyReviews.length} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <MdFavoriteBorder className="text-[#06EAFC] text-lg" />
                  </button>
                  <button className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <MdShare className="text-gray-600 text-lg" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Price Range</p>
                    <p className="text-xl font-bold text-gray-900">
                      #{formatPrice(vendor.price_from)} - #
                      {formatPrice(vendor.price_to || vendor.price_from * 2)}{" "}
                      per night
                    </p>
                  </div>
                  <button className="bg-[#06EAFC] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#05d9eb] transition-colors">
                    Book Now
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {vendor.phone && (
                  <a
                    href={`tel:${vendor.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-[#06EAFC]"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {vendor.phone}
                      </p>
                    </div>
                  </a>
                )}
                {vendor.whatsapp && (
                  <a
                    href={`https://wa.me/${vendor.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      className="text-green-500"
                    />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <p className="font-semibold text-gray-900">
                        {vendor.whatsapp}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Tags */}
              {vendor.tags && (
                <div className="flex flex-wrap gap-2">
                  {vendor.tags.split(",").map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {vendor.short_desc || "No description available."}
              </p>
            </section>

            {/* What They Do Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What They Do
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(features.length > 0 ? features : dummyServices).map(
                  (service, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#06EAFC] rounded-full"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Key Features Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Key Features
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { name: "Free WiFi", available: true },
                  { name: "Swimming Pool", available: true },
                  { name: "Parking", available: true },
                  {
                    name: "Airport Transfer",
                    available: vendor.category?.toLowerCase().includes("hotel"),
                  },
                  { name: "24/7 Security", available: true },
                  {
                    name: "Restaurant",
                    available: vendor.category?.toLowerCase().includes("hotel"),
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        feature.available ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-sm ${
                        feature.available ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-6">
                {dummyReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FontAwesomeIcon
                                    key={i}
                                    icon={faStar}
                                    className={`text-sm ${
                                      i < review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                {vendor.address && (
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-[#06EAFC] mt-1"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-gray-900">{vendor.address}</p>
                    </div>
                  </div>
                )}
                {vendor.open_hours && (
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 text-[#06EAFC] mt-1">⏰</div>
                    <div>
                      <p className="text-sm text-gray-600">Opening Hours</p>
                      <p className="text-gray-900">{vendor.open_hours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Location</h3>
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <p className="text-gray-500 text-sm">
                  Map will be displayed here
                </p>
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
