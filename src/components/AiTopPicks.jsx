// src/components/AiTopPicks.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { GoVerified } from "react-icons/go";
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
          header?.toString().trim().toLowerCase()
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
                obj[header] = row[i]?.toString().trim() || "";
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
    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8 p-6 bg-white">
      {/* Left side filters */}
      <div className="flex flex-wrap gap-4 items-center">
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

        {/* District Dropdown */}
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="appearance-none bg-[#D9D9D9] px-4 py-3 pr-10 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC] cursor-pointer min-w-[140px] font-medium"
          >
            <option value="" className="text-gray-500">
              District
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

      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className="bg-gray-800 hover:bg-gray-900 px-6 py-3 flex items-center rounded-xl gap-3 capitalize cursor-pointer transition-colors duration-200 font-semibold text-sm text-white"
      >
        <span>Filter</span>
        <PiSliders className="text-lg" />
      </button>
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

        /* Mobile */
        w-[175.77px]
        h-[237.48px]
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
        <GoVerified className="text-green-500 text-sm lg:text-xl" />
      </div>

      {/* Profile Image */}
      <div className="flex justify-center pt-4 lg:pt-8">
        <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full overflow-hidden shadow-md border border-gray-200 bg-white">
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

        <button className="w-full py-1.5 lg:py-3 mt-2 lg:mt-4 rounded-xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition text-xs lg:text-base">
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

      /* Mobile */
      w-[175.77px]
      h-[237.48px]
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

    {/* Profile Image Skeleton */}
    <div className="flex justify-center pt-4 lg:pt-8">
      <div className="w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-gray-300"></div>
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
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [availableNow, setAvailableNow] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // New state for card management
  const [initialMobileCount] = useState(4); // 2x2 grid on mobile
  const [initialDesktopCount] = useState(3); // 3 cards on desktop
  const [visibleCount, setVisibleCount] = useState(initialMobileCount);

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
      is_available: "TRUE",
      category: "Food",
      price_range: "800-2500",
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
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Events",
      price_range: "50000-200000",
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
      is_available: "TRUE",
      category: "Events",
      price_range: "45000-180000",
    },
    {
      id: "7",
      name: "City View Hotel",
      service_type: "Hotels",
      description:
        "Luxury hotel with panoramic city views and premium amenities.",
      rating: "4.9",
      delivery_count: "5",
      image_url:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
      district: "GRA",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Hotels",
      price_range: "25000-80000",
    },
    {
      id: "8",
      name: "Tech Hub Coworking",
      service_type: "Workspace",
      description:
        "Modern coworking space for professionals and entrepreneurs.",
      rating: "4.7",
      delivery_count: "3",
      image_url:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80",
      district: "Bodija",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Workspace",
      price_range: "5000-15000",
    },
  ];

  // Use Google Sheets data if available, otherwise use demo data
  const displayVenues = venues.length > 0 ? venues : demoVenues;

  // Filter logic
  const filteredVenues = displayVenues.filter((venue) => {
    const matchesService =
      !selectedService || venue.service_type === selectedService;
    const matchesDistrict =
      !selectedDistrict || venue.district === selectedDistrict;
    const matchesVerified = !verifiedOnly || venue.is_verified === "TRUE";
    const matchesAvailable = !availableNow || venue.is_available === "TRUE";

    return (
      matchesService && matchesDistrict && matchesVerified && matchesAvailable
    );
  });

  // Get featured venues (verified ones)
  const featuredVenues = filteredVenues.filter(
    (venue) => venue.is_verified === "TRUE"
  );

  // Visible venues based on load more
  const visibleVenues = featuredVenues.slice(0, visibleCount);

  // Button logic
  const hasMoreVenues = visibleCount < featuredVenues.length;
  const canShowLess = visibleCount > initialMobileCount;

  const loadMore = () => {
    // Auto-detect screen size and load appropriate number
    const isMobile = window.innerWidth < 1024;
    const increment = isMobile ? 2 : 3; // 2 cards on mobile, 3 on desktop
    setVisibleCount((prev) =>
      Math.min(prev + increment, featuredVenues.length)
    );
  };

  const showLess = () => {
    // Auto-detect screen size and reduce appropriate number
    const isMobile = window.innerWidth < 1024;
    const decrement = isMobile ? 2 : 3; // 2 cards on mobile, 3 on desktop
    const targetCount = Math.max(
      isMobile ? initialMobileCount : initialDesktopCount,
      visibleCount - decrement
    );
    setVisibleCount(targetCount);
  };

  const services = [
    ...new Set(displayVenues.map((v) => v.service_type).filter(Boolean)),
  ];
  const districts = [
    ...new Set(displayVenues.map((v) => v.district).filter(Boolean)),
  ];

  if (loading) {
    return (
      <section className="bg-white py-16 font-manrope" id="toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
              Verified Vendors
            </h1>
            <p className="text-gray-600 text-lg">
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

          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-12">
            {[...Array(initialMobileCount)].map((_, index) => (
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
    <section className="bg-white py-16 font-manrope" id="toppicks">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-12">
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
              className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4"
            >
              Verified Vendors
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -50 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
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
        {featuredVenues.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
              <h3 className="text-2xl text-gray-800 mb-4 font-bold">
                No ventures found
              </h3>
              <p className="text-gray-600 text-lg">
                Try adjusting your filters
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          {/* View More Button - Shows when there are more venues to load */}
          {hasMoreVenues && (
            <button
              onClick={loadMore}
              className="px-8 lg:px-12 py-3 lg:py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-bold text-base lg:text-lg hover:border-gray-400 hover:shadow-lg"
            >
              View More
            </button>
          )}

          {/* View Less Button - Shows when expanded beyond initial count */}
          {canShowLess && (
            <button
              onClick={showLess}
              className="px-8 lg:px-12 py-3 lg:py-4 border-2 border-blue-600 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 font-bold text-base lg:text-lg hover:border-blue-700 hover:shadow-lg"
            >
              View Less
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default AiTopPicks;
