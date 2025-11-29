// src/components/AiTopPicks.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { VscVerifiedFilled } from "react-icons/vsc";
import { PiSliders } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";

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
                // Convert to lowercase for consistent access, but keep original header names
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`${
          enabled ? "bg-[#000000]" : "bg-gray-200"
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
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
      <span className="text-sm font-medium text-gray-700">{label}</span>
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
    <div className="flex flex-col gap-4 mb-8 p-4 lg:p-6 bg-white">
      {/* Mobile: Line 1 - Location, Service/Product, and Sliders icon */}
      <div className="flex lg:hidden items-center justify-between gap-3">
        {/* District Dropdown */}
        <div className="relative flex-1">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer w-full font-medium"
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
        <div className="relative flex-1">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer w-full font-medium"
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
          className="bg-gray-800 hover:bg-gray-900 p-3 flex items-center justify-center rounded-xl cursor-pointer transition-colors duration-200"
        >
          <PiSliders className="text-lg text-white" />
        </button>
      </div>

      {/* Mobile: Line 2 - Toggle switches only */}
      <div className="flex lg:hidden items-center justify-center gap-6">
        <ToggleSwitch
          enabled={verifiedOnly}
          setEnabled={setVerifiedOnly}
          label="Verified Only"
        />
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
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer min-w-[140px] font-medium"
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
          <div className="relative">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer min-w-[180px] font-medium"
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
              enabled={verifiedOnly}
              setEnabled={setVerifiedOnly}
              label="Verified Only"
            />
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
          className="bg-gray-800 hover:bg-gray-900 p-3 flex items-center rounded-xl cursor-pointer transition-colors duration-200"
        >
          <PiSliders className="text-lg text-white" />
        </button>
      </div>
    </div>
  );
};
// ---------------- Vendor Card Component - EXACT Design ----------------
const VendorCard = ({ venue, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="
        bg-[#D9D9D9]
        border border-gray-100 
        shadow-sm hover:shadow-md 
        transition-all duration-300 
        relative
        overflow-hidden

        /* Mobile - Increased height */
        w-[175.77px]
        h-[280px]  /* Increased from 237.48px to 280px */
        rounded-[14.9px]

        /* Desktop - Adjusted for better spacing */
        lg:w-[349.16px]
        lg:h-[483px]
        lg:rounded-[30.3px]
        lg:mx-4  /* Added left and right margin for better spacing */

        mx-auto
      "
    >
      {/* Verified Badge */}
      <div className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-white rounded-full p-1 lg:p-2 shadow-md border border-green-200 z-10">
        <VscVerifiedFilled className="text-green-500 text-sm lg:text-xl" />
      </div>

      {/* Profile Image - Updated with exact dimensions */}
      <div
        className="
        flex justify-center 
        pt-[13.62px] lg:pt-[27.7px]  /* top positioning */
      "
      >
        <div
          className="
          overflow-hidden shadow-md border border-gray-200 bg-white
          /* Mobile */
          w-[92.78px]
          h-[92.78px]
          rounded-full
          /* Desktop */
          lg:w-[188.70px]
          lg:h-[188.70px]
          lg:rounded-full
        "
        >
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/150/DDDDDD/808080?text=No+Image";
            }}
          />
        </div>
      </div>

      <div className="p-3 lg:p-6 text-center">
        <h3 className="text-sm lg:text-xl font-semibold text-gray-900 mt-2 lg:mt-4 line-clamp-1">
          {venue.name}
        </h3>

        <div className="flex justify-center items-center gap-1 lg:gap-2 mt-1 lg:mt-2">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon
              icon={faStar}
              className="text-yellow-500 text-xs lg:text-sm"
            />
            <span className="font-semibold text-gray-900 text-xs lg:text-sm">
              {venue.rating}
            </span>
          </div>

          <span className="text-gray-600 text-xs lg:text-sm">
            {venue.delivery_count} new
          </span>
        </div>

        <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-gray-700 font-medium">
          Service: <span className="text-gray-600">{venue.service_type}</span>
        </p>

        <p className="text-gray-500 text-[10px] lg:text-sm leading-tight lg:leading-relaxed mt-1 lg:mt-2 line-clamp-2 lg:line-clamp-3">
          {venue.description}
        </p>

        <button className="w-full py-1.5 lg:py-3 mt-2 lg:mt-4 rounded-xl border border-black text-gray-800 font-semibold hover:bg-gray-200 transition text-xs lg:text-base">
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
      bg-gray-200
      border border-gray-100 
      relative
      overflow-hidden
      animate-pulse

      /* Mobile - Increased height */
      w-[175.77px]
      h-[280px]  /* Increased from 237.48px to 280px */
      rounded-[14.9px]

      /* Desktop - Adjusted for better spacing */
      lg:w-[349.16px]
      lg:h-[483px]
      lg:rounded-[30.3px]
      lg:mx-4  /* Added left and right margin for better spacing */

      mx-auto
    "
  >
    {/* Verified Badge Skeleton */}
    <div className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-gray-300 rounded-full p-1 lg:p-2 z-10"></div>

    {/* Profile Image Skeleton - Updated with exact dimensions */}
    <div
      className="
      flex justify-center 
      pt-[13.62px] lg:pt-[27.7px]  /* top positioning */
    "
    >
      <div
        className="
        bg-gray-300
        /* Mobile */
        w-[92.78px]
        h-[92.78px]
        rounded-full
        /* Desktop */
        lg:w-[188.70px]
        lg:h-[188.70px]
        lg:rounded-full
      "
      ></div>
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
  const [verifiedOnly, setVerifiedOnly] = useState(false); // Start OFF
  const [availableNow, setAvailableNow] = useState(false); // Start OFF
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Set initial state based on screen size immediately
  const [initialMobileCount] = useState(4); // 2x2 grid on mobile
  const [initialDesktopCount] = useState(3); // 3 cards on desktop
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined"
      ? window.innerWidth < 1024
        ? initialMobileCount
        : initialDesktopCount
      : initialMobileCount
  );

  // Detect screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Adjust visible count based on screen size
      const targetCount = mobile ? initialMobileCount : initialDesktopCount;
      if (visibleCount < targetCount) {
        setVisibleCount(targetCount);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [visibleCount, initialMobileCount, initialDesktopCount]);

  // Same Google Sheet ID and API Key
  const SHEET_ID = "1GK10i6VZnZ3I-WVHs1yOrj2WbaByp00UmZ2k3oqb8_8";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";

  const {
    data: venues = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Demo data that matches your exact design
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
      is_available: "FALSE", // Example of unavailable vendor
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
      is_verified: "FALSE", // Example of unverified vendor
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
      is_available: "FALSE", // Example of unavailable vendor
      category: "Events",
      price_range: "45000-180000",
      response_time: "5-8 hours",
    },
  ];

  // Use Google Sheets data if available, otherwise use demo data
  const displayVenues = venues.length > 0 ? venues : demoVenues;

  // In the filter logic, update to use 'location' instead of 'district':

  const filteredVenues = displayVenues.filter((venue) => {
    const matchesService =
      !selectedService || venue.service_type === selectedService;
    const matchesLocation = // Changed from matchesDistrict to matchesLocation
      !selectedDistrict || venue.location === selectedDistrict; // Changed from venue.district to venue.location

    // Only apply verified filter when toggle is ON
    const matchesVerified = !verifiedOnly || venue.is_verified === "TRUE";

    // Only apply available filter when toggle is ON
    const matchesAvailable = !availableNow || venue.is_available === "TRUE";

    return (
      matchesService && matchesLocation && matchesVerified && matchesAvailable // Updated variable name
    );
  });

  // Get featured venues (all venues initially, filtered by toggles when ON)
  const featuredVenues = filteredVenues;

  // Get initial count based on screen size
  const getInitialCount = () =>
    isMobile ? initialMobileCount : initialDesktopCount;

  // Visible venues based on load more
  const visibleVenues = featuredVenues.slice(0, visibleCount);

  // Button logic
  const hasMoreVenues = visibleCount < featuredVenues.length;
  const canShowLess = visibleCount > getInitialCount();

  const loadMore = () => {
    const increment = isMobile ? 2 : 3; // 2 cards on mobile, 3 on desktop
    setVisibleCount((prev) =>
      Math.min(prev + increment, featuredVenues.length)
    );
  };

  const showLess = () => {
    const targetCount = getInitialCount();
    setVisibleCount(targetCount);
  };

  // In the main AiTopPicks component, update the districts extraction:

  const services = [
    ...new Set(displayVenues.map((v) => v.service_type).filter(Boolean)),
  ];
  const districts = [
    ...new Set(displayVenues.map((v) => v.location).filter(Boolean)), // Changed from 'district' to 'location'
  ];

  // Rest of the component remains the same...
  if (loading) {
    return (
      <section className="bg-white font-manrope" id="toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className=" text-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
              Verified Vendors
            </h1>
            <p className="text-gray-600 md:text-xl text-[10px]">
              Trusted businesses reviewed and approved for quality and
              reliability.
            </p>
          </div>

          {/* Filter Bar Skeleton */}
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

          {/* Skeleton Grid - Show appropriate number based on screen size */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-12">
            {[
              ...Array(isMobile ? initialMobileCount : initialDesktopCount),
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
            initial={{ opacity: 0, y: 30 }}
            animate={
              headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-start text-xl lg:text-3xl font-bold text-gray-900 mb-1"
            >
              Verified Vendors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -50 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-start lg:text-start text-gray-600 text-[14px] lg:text-[15px] max-w-2xl leading-relaxed"
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
          selectedDistrict={selectedDistrict} // This can stay the same as it's just the state variable name
          setSelectedDistrict={setSelectedDistrict} // This can stay the same
          verifiedOnly={verifiedOnly}
          setVerifiedOnly={setVerifiedOnly}
          availableNow={availableNow}
          setAvailableNow={setAvailableNow}
          services={services}
          districts={districts} // This now contains the actual locations from your Google Sheet
          onFilterClick={() => setShowFilterModal(true)}
        />

       

        {/* Venues Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-12">
          {visibleVenues.map((venue, index) => (
            <VendorCard key={venue.id} venue={venue} index={index} />
          ))}
        </div>

        {/* No Results State */}
        {featuredVenues.length === 0 && !loading && (
          <div className="text-center py-16">
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

        {/* Action Buttons */}
        {featuredVenues.length > 0 && (
          <div className="text-center space-x-4">
            {/* View More Button - Shows when there are more venues to load */}
            {hasMoreVenues && (
              <button
                onClick={loadMore}
                className="px-8 lg:px-12 py-3 lg:py-4 border-2 border-[#00d1ff] rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-bold text-base lg:text-lg hover:border-[#2dd8ff] hover:shadow-lg"
              >
                View More
              </button>
            )}

            {/* View Less Button - Shows when expanded beyond initial count */}
            {canShowLess && (
              <button
                onClick={showLess}
                className="px-8 lg:px-12 py-3 lg:py-4 border-2 border-[#00d1ff] rounded-xl text-gray-700  hover:bg-blue-50 transition-all duration-200 font-bold text-base lg:text-lg hover:border-[#1bd5fe] hover:shadow-lg"
              >
                View Less
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AiTopPicks;
