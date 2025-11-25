// src/components/Directory.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import { generateSlug } from "../utils/vendorUtils";
import { FaGreaterThan } from "react-icons/fa";
import { FaLessThan } from "react-icons/fa";

// ---------------- Helpers ----------------
const capitalizeFirst = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const FALLBACK_IMAGES = {
  hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&q=80",
  hostel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
  services:
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80",
  event:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  weekend:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
  hall: "https://images.unsplash.com-1511795409834-ef04bbd61622?w=600&q=80",
  attraction:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  garden:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  tower:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80",
  amala:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  default: "/mnt/data/4d461a2d-d714-4cb9-a9ce-66785f412bb3.png",
};

const getCardImages = (item) => {
  const raw = item["image url"] || "";
  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u && u.startsWith("http"));

  if (urls.length > 0) return urls;

  const cat = (item.category || "").toLowerCase();
  if (cat.includes("hotel")) return [FALLBACK_IMAGES.hotel];
  if (cat.includes("restaurant")) return [FALLBACK_IMAGES.restaurant];
  if (cat.includes("cafe")) return [FALLBACK_IMAGES.cafe];
  if (cat.includes("bar")) return [FALLBACK_IMAGES.bar];
  if (cat.includes("hostel")) return [FALLBACK_IMAGES.hostel];
  if (cat.includes("shortlet")) return [FALLBACK_IMAGES.shortlet];
  if (cat.includes("services")) return [FALLBACK_IMAGES.services];
  if (cat.includes("event") || cat.includes("weekend") || cat.includes("hall"))
    return [FALLBACK_IMAGES.event];
  if (
    cat.includes("attraction") ||
    cat.includes("garden") ||
    cat.includes("tower")
  )
    return [FALLBACK_IMAGES.attraction];
  if (cat.includes("amala")) return [FALLBACK_IMAGES.amala];
  return [FALLBACK_IMAGES.default];
};

// ---------------- Custom Hook ----------------
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

// ---------------- Image Display ----------------
const ImageDisplay = ({ card, onImageClick, isMobile = false }) => {
  const images = getCardImages(card);

  return (
    <div
      className={`relative w-full ${
        isMobile ? "h-[144.57px]" : "h-[299px]"
      } overflow-hidden rounded-lg bg-gray-100 cursor-pointer`}
      onClick={() => onImageClick(images, 0)}
    >
      <img
        src={images[0]}
        alt={`${card.name || "Business"} image`}
        className="w-full h-full object-cover"
        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGES.default)}
        loading="lazy"
      />
      {/* Guest Favorite Badge */}
      <div className="absolute top-2 left-2 bg-[#F7F7FA] px-2 py-1 rounded-full flex items-center gap-1">
        <span className="text-black text-[10px] lg:text-[14px]">
          Guest Favorite
        </span>
      </div>
    </div>
  );
};

// ---------------- Directory Component ----------------
const Directory = () => {
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
    item: null,
  });

  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [area, setArea] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Filter listings based on search and filters
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !mainCategory ||
      item.category?.toLowerCase().includes(mainCategory.toLowerCase());

    const matchesArea = !area || item.area === area;

    return matchesSearch && matchesCategory && matchesArea;
  });

  // Extract subcategories from the data (text after the ".")
  const getSubcategories = () => {
    const subcategories = new Set();

    listings.forEach((item) => {
      const category = item.category || "";
      const parts = category.split(".");
      if (parts.length > 1) {
        const subcategory = parts[1].toLowerCase();
        if (
          subcategory &&
          subcategory !== "other" &&
          subcategory !== "others"
        ) {
          subcategories.add(subcategory);
        }
      }
    });

    return Array.from(subcategories);
  };

  // Group listings by subcategory
  const categorizedListings = {};
  getSubcategories().forEach((subcategory) => {
    categorizedListings[subcategory] = filteredListings.filter((item) => {
      const category = item.category || "";
      return category.toLowerCase().includes(`.${subcategory}`);
    });
  });

  // Scroll functions for horizontal sections
  const scrollSection = (sectionId, direction) => {
    const container = document.getElementById(sectionId);
    if (!container) return;

    const scrollAmount = isMobile ? 176 : 332; // Desktop: 322px + 10px gap = 332px
    const newPosition =
      direction === "next"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  // Card component for consistent styling
  // Card component for consistent styling
  const BusinessCard = ({ item, category }) => {
    const itemId = `business-${item.id}`;

    // Determine price text based on category
    let priceText = "";
    if (
      category === "hotel" ||
      category === "hostel" ||
      category === "shortlet"
    ) {
      priceText = `#${formatPrice(item.price_from)} for 2 night`;
    } else {
      priceText = `From #${formatPrice(item.price_from)} per guest`;
    }

    return (
      <div
        className={`bg-white rounded-lg overflow-hidden flex-shrink-0 ${
          isMobile ? "w-[155.69px] mr-[4.83px]" : "w-[322px]" // ← Keep mobile as is
        } transition-all duration-300 hover:shadow-lg`}
      >
        {/* Standalone Image with Guest Favorite Badge */}
        <ImageDisplay
          card={item}
          onImageClick={(images, index) =>
            setImageModal({
              isOpen: true,
              images,
              initialIndex: index,
              item,
            })
          }
          isMobile={isMobile}
        />

        {/* Text content beneath the image - All black text, no bold */}
        <div className={`${isMobile ? "p-[4.83px]" : "p-[10px]"}`}>
          {" "}
          {/* ← Change to p-[10px] for desktop */}
          {/* Business Name - Black (NO BOLD) */}
          <h3
            className={`text-black ${
              isMobile ? "text-xs mb-1" : "text-lg mb-2" // ← Keep as is
            } leading-tight`}
          >
            {item.name}
          </h3>
          {/* Price and Rating in one line - All Black (NO BOLD) */}
          <div className="flex justify-between items-center">
            <p className={`text-black ${isMobile ? "text-[10px]" : "text-sm"}`}>
              {priceText}
            </p>
            <div className="flex items-center gap-1">
              <FontAwesomeIcon
                icon={faStar}
                className={`text-black ${isMobile ? "text-[10px]" : "text-sm"}`}
              />
              <span
                className={`text-black ${isMobile ? "text-[10px]" : "text-sm"}`}
              >
                {item.rating || "4.89"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Section component for each category
  const CategorySection = ({ title, items, sectionId }) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2
              className={`text-gray-900 ${isMobile ? "text-lg" : "text-2xl"}`}
            >
              {title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollSection(sectionId, "prev")}
              className="w-6 h-6 rounded-full  flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <FaLessThan className="text-gray-600" /> {/* ← Changed to icon */}
            </button>
            <button
              onClick={() => scrollSection(sectionId, "next")}
              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <PiGreaterThan className="text-gray-600" />{" "}
              {/* ← Changed to icon */}
            </button>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div className="relative">
          <div
            id={sectionId}
            className={`flex overflow-x-auto pb-4 scrollbar-hide scroll-smooth ${
              isMobile ? "" : "gap-[10px]" // ← Add gap-[10px] for desktop
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {items.map((item, index) => (
              <BusinessCard
                key={item.id || index}
                item={item}
                category={sectionId.replace("-section", "")}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (loading)
    return (
      <section id="directory" className="py-16 text-center font-manrope">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-600">Loading Ibadan Directory...</p>
      </section>
    );

  if (error)
    return (
      <section
        id="directory"
        className="max-w-4xl mx-auto px-4 py-12 font-manrope"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </section>
    );

  return (
    <section id="directory" className="bg-white py-8 font-manrope">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Search */}
        <div className="mb-8">
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl text-gray-900 mb-2">Explore Categories</h1>
            <p className="text-gray-600 text-lg">
              Find the best place and services in Ibadan
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSearch("");
                  setMainCategory("");
                  setArea("");
                }}
                className="px-6 py-4 bg-[#06EAFC]  rounded-[10px] text-sm hover:bg-[#08d7e6] transition-colors"
              >
                Popular destination
              </button>

              <select
                value={mainCategory}
                onChange={(e) => setMainCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-[10px] text-sm bg-gray-300"
              >
                <option value="">Categories</option>
                {getSubcategories().map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {capitalizeFirst(subcategory)}
                  </option>
                ))}
              </select>

              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm bg-white"
              >
                <option value="">District</option>
                {[...new Set(listings.map((i) => i.area).filter(Boolean))]
                  .sort()
                  .map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
              </select>
            </div>

            <div className="relative w-full lg:w-64">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search name, service, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category Sections - Dynamically generated from subcategories */}
        <div className="space-y-8">
          {getSubcategories().map((subcategory) => {
            const items = categorizedListings[subcategory] || [];
            if (items.length === 0) return null;

            const title = `Popular ${capitalizeFirst(subcategory)} in Ibadan`;
            const sectionId = `${subcategory}-section`;

            return (
              <CategorySection
                key={subcategory}
                title={title}
                items={items}
                sectionId={sectionId}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
              <i className="fas fa-search text-4xl text-gray-300 mb-4 block"></i>
              <h3 className="text-xl text-gray-800 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <ImageModal
          images={imageModal.images}
          initialIndex={imageModal.initialIndex}
          isOpen={imageModal.isOpen}
          onClose={() => setImageModal({ ...imageModal, isOpen: false })}
          item={imageModal.item}
        />
      )}

      {/* Custom scrollbar hiding */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Directory;
