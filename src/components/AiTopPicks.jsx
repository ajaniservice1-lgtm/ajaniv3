import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { VscVerifiedFilled } from "react-icons/vsc";
import { PiSliders } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate } from "react-router-dom";

// ---------------- Custom Hook ----------------
const useGoogleSheet = (sheetId, apiKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:K100?key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        if (
          !json.values ||
          !Array.isArray(json.values) ||
          json.values.length < 2
        ) {
          throw new Error("No data found or sheet is empty.");
        }

        const headers = json.values[0].map((header) =>
          header?.toString().trim()
        );
        const rows = json.values.slice(1);

        const result = rows
          .filter(
            (row) => row && row.length > 0 && row[0] && row[0].trim() !== ""
          )
          .map((row, index) => {
            const obj = { id: `venue-${index}` };
            headers.forEach((header, i) => {
              if (header && row[i] !== undefined) {
                const key = header.toLowerCase();
                obj[key] = row[i]?.toString().trim() || "";
              }
            });
            return obj;
          });

        setData(result);
      } catch (err) {
        console.error("Google Sheets error:", err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetId, apiKey]);

  return { data, loading, error };
};

// ---------------- Toggle Switch Component ----------------
const ToggleSwitch = ({ enabled, setEnabled, label }) => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        className={`${
          enabled ? "bg-[#000000]" : "bg-gray-200"
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none hover:shadow-md`}
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
      >
        <span
          aria-hidden="true"
          className={`${
            enabled ? "translate-x-5" : "translate-x-0"
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200">
        {label}
      </span>
    </div>
  );
};

// ---------------- Filter Bar Component ----------------
const FilterBar = ({
  selectedService,
  setSelectedService,
  selectedDistrict,
  setSelectedDistrict,
  verifiedOnly,
  setVerifiedOnly,
  availableNow,
  setAvailableNow,
  services,
  districts,
  onFilterClick,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-8 p-4 lg:p-6 bg-white rounded-xl shadow-sm">
      {/* Mobile: Line 1 - Location, Service/Product, and Sliders icon */}
      <div className="flex lg:hidden items-center justify-between gap-3">
        {/* District Dropdown */}
        <div className="relative flex-1 cursor-pointer">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer w-full font-medium hover:bg-[#D0D0D0] transition-all duration-200 hover:shadow-md"
          >
            <option value="" className="text-gray-500">
              Location
            </option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <IoIosArrowDown />
          </div>
        </div>

        {/* Service/Product Dropdown */}
        <div className="relative flex-1 cursor-pointer">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer w-full font-medium hover:bg-[#D0D0D0] transition-all duration-200 hover:shadow-md"
          >
            <option value="" className="text-gray-500">
              Service/Product
            </option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <IoIosArrowDown />
          </div>
        </div>

        {/* Sliders Icon Button */}
        <button
          onClick={onFilterClick}
          className="bg-gray-800 hover:bg-gray-900 p-3 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <PiSliders className="text-lg text-white" />
        </button>
      </div>

      {/* Mobile: Line 2 - Toggle switches only */}
      <div className="flex lg:hidden items-center justify-center gap-6">
        <ToggleSwitch
          enabled={availableNow}
          setEnabled={setAvailableNow}
          label="Available Now"
        />
      </div>

      {/* Desktop: Original single-line layout */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:w-full">
        {/* Left side filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* District Dropdown */}
          <div className="relative cursor-pointer">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer min-w-[140px] font-medium hover:bg-[#D0D0D0] transition-all duration-200 hover:shadow-md"
            >
              <option value="" className="text-gray-500">
                Location
              </option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <IoIosArrowDown />
            </div>
          </div>

          {/* Service/Product Dropdown */}
          <div className="relative cursor-pointer">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer min-w-[180px] font-medium hover:bg-[#D0D0D0] transition-all duration-200 hover:shadow-md"
            >
              <option value="" className="text-gray-500">
                Service/Product
              </option>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <IoIosArrowDown />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-6">
            <ToggleSwitch
              enabled={availableNow}
              setEnabled={setAvailableNow}
              label="Available Now"
            />
          </div>
        </div>

        {/* Filter Button - Icon only */}
        <button
          onClick={onFilterClick}
          className="bg-gray-800 hover:bg-gray-900 p-3 flex items-center rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <PiSliders className="text-lg text-white" />
        </button>
      </div>
    </div>
  );
};

// ---------------- Vendor Card Component ----------------
const VendorCard = ({ venue, index }) => {
  const navigate = useNavigate();

  const handleViewVendor = () => {
    const vendorData = {
      id: venue.id,
      firstName: venue.name?.split(" ")[0] || "Vendor",
      lastName: venue.name?.split(" ").slice(1).join(" ") || "Name",
      fullName: venue.name,
      email:
        venue.email ||
        `${venue.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: venue.phone || "+234 812 345 6789",
      businessType: venue.category || "Service",
      workType: venue.service_type,
      location: venue.location || venue.district,
      description: venue.description,
      yearsExperience: venue.years_experience || "5",
      avatar:
        venue.image_url || "https://randomuser.me/api/portraits/women/68.jpg",
      rating: parseFloat(venue.rating) || 4.8,
      totalReviews: parseInt(venue.review_count) || 128,
      completedProjects: parseInt(venue.completed_projects) || 247,
      repeatClients: parseInt(venue.repeat_clients) || 89,
      satisfactionRate: parseInt(venue.satisfaction_rate) || 98,
      address: venue.address || venue.location,
      responseTime: venue.response_time || "Within 2 hours",
      activeWithin: `Within 15 km of ${
        venue.location?.split(",")[0] || "your location"
      }`,
      languages: ["English (Native)", "Yoruba (Fluent)"],
      services: [venue.service_type || "Your service"],
      specialties: venue.specialties
        ? venue.specialties.split(",")
        : ["Traditional Cuisine", "Corporate Events"],
      certifications: venue.certifications
        ? venue.certifications.split(",")
        : ["Food Safety Certified", "Health Department Approved"],
      businessName: venue.business_name || venue.name,
      hourlyRate: venue.hourly_rate || "₦5,000 - ₦10,000",
      minOrder: venue.min_order || "₦15,000",
      businessHours: venue.business_hours || "8:00 AM - 10:00 PM",
      deliveryAvailable: venue.delivery_available === "TRUE",
      onlineBookings: venue.online_bookings === "TRUE",
      listings: [],
      reviews: [],
    };

    navigate("/vendor-profile", { state: vendorData });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow:
          "0 20px 40px rgba(0, 209, 255, 0.15), 0 10px 20px rgba(0, 209, 255, 0.1)",
      }}
      className="
        bg-[#D9D9D9]
        border border-gray-100 
        shadow-sm hover:shadow-xl 
        transition-all duration-300 
        relative
        overflow-hidden
        cursor-pointer

        w-[175.77px]
        h-[280px]
        rounded-[14.9px]

        lg:w-[349.16px]
        lg:h-[483px]
        lg:rounded-[30.3px]
        lg:mx-4

        mx-auto
        hover:border-[#00d1ff]
        hover:border-2
        group
      "
    >
      {/* Verified Badge */}
      <div className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-white rounded-full p-1 lg:p-2 shadow-md border border-green-200 z-10 group-hover:scale-110 transition-transform duration-300">
        <VscVerifiedFilled className="text-green-500 text-sm lg:text-xl" />
      </div>

      {/* Profile Image */}
      <div className="flex justify-center pt-[13.62px] lg:pt-[27.7px]">
        <div className="overflow-hidden shadow-md border border-gray-200 bg-white group-hover:shadow-lg group-hover:border-[#00d1ff] transition-all duration-300 w-[92.78px] h-[92.78px] rounded-full lg:w-[188.70px] lg:h-[188.70px] lg:rounded-full">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/150/DDDDDD/808080?text=No+Image";
            }}
          />
        </div>
      </div>

      <div className="p-3 lg:p-6 text-center">
        <h3 className="text-sm lg:text-xl font-semibold text-gray-900 mt-2 lg:mt-4 line-clamp-1 group-hover:text-gray-800 transition-colors duration-300">
          {venue.name}
        </h3>

        <div className="flex justify-center items-center gap-1 lg:gap-2 mt-1 lg:mt-2">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon
              icon={faStar}
              className="text-yellow-500 text-xs lg:text-sm group-hover:text-yellow-600 transition-colors duration-300"
            />
            <span className="font-semibold text-gray-900 text-xs lg:text-sm group-hover:text-gray-800 transition-colors duration-300">
              {venue.rating}
            </span>
          </div>

          <span className="text-gray-600 text-xs lg:text-sm group-hover:text-gray-700 transition-colors duration-300">
            {venue.delivery_count} new
          </span>
        </div>

        <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-gray-700 font-medium group-hover:text-gray-800 transition-colors duration-300">
          Service:{" "}
          <span className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
            {venue.service_type}
          </span>
        </p>

        <p className="text-gray-500 text-[10px] lg:text-sm leading-tight lg:leading-relaxed mt-1 lg:mt-2 line-clamp-2 lg:line-clamp-3 group-hover:text-gray-600 transition-colors duration-300">
          {venue.description}
        </p>

        <button
          onClick={handleViewVendor}
          className="w-full py-1.5 lg:py-3 mt-2 lg:mt-4 rounded-xl border border-black text-gray-800 font-semibold hover:bg-gray-200 transition-all duration-300 text-xs lg:text-base hover:text-black hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          style={{
            boxShadow: "0 0 0 rgba(0, 209, 255, 0)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 0 20px rgba(0, 209, 255, 0.5), 0 0 40px rgba(0, 209, 255, 0.3)";
            e.currentTarget.style.borderColor = "#00d1ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 0 0 rgba(0, 209, 255, 0)";
            e.currentTarget.style.borderColor = "black";
          }}
        >
          View Vendor
        </button>
      </div>
    </motion.div>
  );
};

// ---------------- Skeleton Loading Component ----------------
const SkeletonCard = () => (
  <div
    className="
    bg-gray-200 border border-gray-100 relative overflow-hidden animate-pulse
    w-[175.77px] h-[280px] rounded-[14.9px]
    lg:w-[349.16px] lg:h-[483px] lg:rounded-[30.3px] lg:mx-4
    mx-auto
  "
  >
    <div className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-gray-300 rounded-full p-1 lg:p-2 z-10"></div>
    <div className="flex justify-center pt-[13.62px] lg:pt-[27.7px]">
      <div className="bg-gray-300 w-[92.78px] h-[92.78px] rounded-full lg:w-[188.70px] lg:h-[188.70px] lg:rounded-full"></div>
    </div>
    <div className="p-3 lg:p-6 text-center">
      <div className="h-3 lg:h-5 bg-gray-300 rounded mt-2 lg:mt-4 mx-auto w-3/4"></div>
      <div className="flex justify-center items-center gap-1 lg:gap-2 mt-1 lg:mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <div className="h-2 lg:h-3 bg-gray-300 rounded w-4 lg:w-6"></div>
        </div>
        <div className="h-2 lg:h-3 bg-gray-300 rounded w-8 lg:w-12"></div>
      </div>
      <div className="h-2 lg:h-3 bg-gray-300 rounded mt-1 lg:mt-2 w-5/6 mx-auto"></div>
      <div className="h-2 lg:h-3 bg-gray-300 rounded mt-1 lg:mt-2 w-full"></div>
      <div className="h-2 lg:h-3 bg-gray-300 rounded mt-1 w-4/5 mx-auto"></div>
      <div className="w-full py-1.5 lg:py-3 mt-2 lg:mt-4 rounded-xl bg-gray-300"></div>
    </div>
  </div>
);

// ---------------- Main AiTopPicks Component ----------------
const AiTopPicks = () => {
  const [headerRef, headerInView] = useInView({ threshold: 0.1 });
  const [selectedService, setSelectedService] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Get initial counts based on screen size
  const getInitialCounts = () => {
    if (typeof window === "undefined") {
      return { mobile: 4, desktop: 3 };
    }
    const isMobile = window.innerWidth < 1024;
    return {
      mobile: 4, // 2x2 grid on mobile
      desktop: 3, // 3 cards on desktop
      isMobile,
    };
  };

  const [initialCounts] = useState(getInitialCounts());
  const [isMobile, setIsMobile] = useState(initialCounts.isMobile);
  const [visibleCount, setVisibleCount] = useState(
    initialCounts.isMobile ? initialCounts.mobile : initialCounts.desktop
  );

  // Detect screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Set visible count based on screen size
      const targetCount = mobile ? initialCounts.mobile : initialCounts.desktop;
      setVisibleCount(targetCount);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialCounts]);

  // Same Google Sheet ID and API Key
  const SHEET_ID = "1GK10i6VZnZ3I-WVHs1yOrj2WbaByp00UmZ2k3oqb8_8";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";

  const {
    data: venues = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Demo data
  const demoVenues = [
    {
      id: "1",
      name: "PrimeTouch Laundry",
      service_type: "Laundry & Cleaning",
      description: "Fast, reliable laundry service with pick-up and delivery.",
      rating: "4.7",
      delivery_count: "12",
      image_url:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80",
      district: "Bodija",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Services",
      price_range: "1500-5000",
      response_time: "1-4 hours",
    },
    {
      id: "2",
      name: "RoyalPot Amala Spot",
      service_type: "Food & Restaurants",
      description:
        "Authentic amala, gbegiri, and local dishes loved across Ibadan.",
      rating: "4.7",
      delivery_count: "21",
      image_url:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      district: "Dugbe",
      is_verified: "TRUE",
      is_available: "FALSE",
      category: "Food",
      price_range: "800-2500",
      response_time: "1-4 hours",
    },
    {
      id: "3",
      name: "Blossom Event Centre",
      service_type: "Event Venues",
      description: "Modern event space for weddings, parties, and conferences.",
      rating: "4.7",
      delivery_count: "14",
      image_url:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
      district: "Sango",
      is_verified: "FALSE",
      is_available: "TRUE",
      category: "Events",
      price_range: "50000-200000",
      response_time: "5-8 hours",
    },
    {
      id: "4",
      name: "QuickClean Laundry",
      service_type: "Laundry & Cleaning",
      description: "Express laundry service with 3-hour delivery guarantee.",
      rating: "4.5",
      delivery_count: "8",
      image_url:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80",
      district: "Iwo Road",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Services",
      price_range: "1200-4000",
      response_time: "1-4 hours",
    },
    {
      id: "5",
      name: "Yoruba Kitchen",
      service_type: "Food & Restaurants",
      description:
        "Traditional Yoruba cuisine with authentic flavors and recipes.",
      rating: "4.8",
      delivery_count: "35",
      image_url:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      district: "Mokola",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Food",
      price_range: "1000-3000",
      response_time: "1-4 hours",
    },
    {
      id: "6",
      name: "Grand Hall Events",
      service_type: "Event Venues",
      description: "Spacious hall for corporate events and social gatherings.",
      rating: "4.6",
      delivery_count: "9",
      image_url:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
      district: "UI Area",
      is_verified: "TRUE",
      is_available: "FALSE",
      category: "Events",
      price_range: "45000-180000",
      response_time: "5-8 hours",
    },
  ];

  // Use Google Sheets data if available, otherwise use demo data
  const displayVenues = venues.length > 0 ? venues : demoVenues;

  // Filter venues
  const filteredVenues = displayVenues.filter((venue) => {
    const matchesService =
      !selectedService || venue.service_type === selectedService;
    const matchesLocation =
      !selectedDistrict || venue.location === selectedDistrict;
    const matchesVerified = !verifiedOnly || venue.is_verified === "TRUE";
    const matchesAvailable = !availableNow || venue.is_available === "TRUE";

    return (
      matchesService && matchesLocation && matchesVerified && matchesAvailable
    );
  });

  // Get initial count based on screen size
  const getInitialCount = () => {
    return isMobile ? initialCounts.mobile : initialCounts.desktop;
  };

  // Visible venues based on load more
  const visibleVenues = filteredVenues.slice(0, visibleCount);

  // Button logic
  const hasMoreVenues = visibleCount < filteredVenues.length;
  const canShowLess = visibleCount > getInitialCount();

  const loadMore = () => {
    const increment = isMobile ? 2 : 3;
    const newCount = visibleCount + increment;
    setVisibleCount(newCount);
  };

  const showLess = () => {
    const vendorsSection = document.getElementById("toppicks");
    if (vendorsSection) {
      vendorsSection.scrollIntoView({ behavior: "smooth" });
    }

    setTimeout(() => {
      const targetCount = getInitialCount();
      setVisibleCount(targetCount);
    }, 300);
  };

  const services = [
    ...new Set(displayVenues.map((v) => v.service_type).filter(Boolean)),
  ];
  const districts = [
    ...new Set(displayVenues.map((v) => v.location).filter(Boolean)),
  ];

  if (loading) {
    return (
      <section className="bg-white font-manrope" id="toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
              Verified Vendors
            </h1>
            <p className="text-gray-600 md:text-xl text-[10px]">
              Trusted businesses reviewed and approved for quality and
              reliability.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8 p-6 bg-white animate-pulse">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-gray-200 px-4 py-3 rounded-xl min-w-[180px] h-12"></div>
              <div className="bg-gray-200 px-4 py-3 rounded-xl min-w-[140px] h-12"></div>
              <div className="flex items-center gap-6">
                <div className="bg-gray-200 rounded-full w-11 h-6"></div>
                <div className="bg-gray-200 rounded-full w-11 h-6"></div>
              </div>
            </div>
            <div className="bg-gray-800 px-6 py-3 rounded-xl w-32 h-12"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-12">
            {[
              ...Array(isMobile ? initialCounts.mobile : initialCounts.desktop),
            ].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 text-center text-red-500">{error}</section>
    );
  }

  return (
    <section className="bg-white py-5 font-manrope" id="toppicks">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={
                headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-start text-xl lg:text-3xl font-bold text-gray-900 mb-1 cursor-default"
            >
              Verified Vendors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={
                headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-start lg:text-start text-gray-600 text-[14px] lg:text-[15px] max-w-2xl leading-relaxed cursor-default"
            >
              Trusted businesses reviewed and approved for quality and
              reliability.
            </motion.p>
          </motion.div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          availableNow={availableNow}
          setAvailableNow={setAvailableNow}
          services={services}
          districts={districts}
          onFilterClick={() => setShowFilterModal(true)}
        />

        {/* Venues Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-12">
          {visibleVenues.map((venue, index) => (
            <VendorCard key={venue.id} venue={venue} index={index} />
          ))}
        </div>

        {/* No Results State */}
        {filteredVenues.length === 0 && !loading && (
          <div className="text-center py-16 cursor-default">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
              <h3 className="text-2xl text-gray-800 mb-4 font-bold">
                No vendors found
              </h3>
              <p className="text-gray-600 text-lg">
                Try adjusting your filters or toggles
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons - SIDE BY SIDE */}
        {filteredVenues.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Show Less Button - Shows only when expanded beyond initial count */}
            {canShowLess && (
              <motion.button
                onClick={showLess}
                className="px-8 lg:px-12 py-3 lg:py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-bold text-base lg:text-lg hover:border-gray-400 hover:shadow-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 0 0 rgba(0, 209, 255, 0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(0, 209, 255, 0.1), 0 0 30px rgba(0, 209, 255, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 rgba(0, 209, 255, 0)";
                }}
              >
                Show Less
              </motion.button>
            )}

            {/* View More Button - Shows when there are more venues to load */}
            {hasMoreVenues && (
              <motion.button
                onClick={loadMore}
                className="px-8 lg:px-12 py-3 lg:py-4 border-2 border-[#00d1ff] rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-bold text-base lg:text-lg hover:border-[#2dd8ff] hover:shadow-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: "0 0 0 rgba(0, 209, 255, 0)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 20px rgba(0, 209, 255, 0.3), 0 0 30px rgba(0, 209, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 0 rgba(0, 209, 255, 0)";
                }}
              >
                View More
              </motion.button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AiTopPicks;
