// src/pages/CategoryResults.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faFilter } from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Meta from "../components/Meta";

// Import your Google Sheets hook
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

const CategoryResults = () => {
  const { category } = useParams();
  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    rating: "",
    sortBy: "relevance",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use your actual Google Sheets data
  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const {
    data: listings = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter listings based on the category parameter
  const filteredListings = listings.filter((item) => {
    const itemCategory = (item.category || "").toLowerCase();
    const targetCategory = (category || "").toLowerCase();

    // Handle different category mappings
    if (targetCategory === "tourist-center") {
      return (
        itemCategory.includes("tourist") || itemCategory.includes("attraction")
      );
    }

    return itemCategory.includes(targetCategory);
  });

  const FilterSidebar = () => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-gray-900">Filter Options</h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          {[
            "Hotel",
            "Shortlet",
            "Restaurant",
            "Tourist Centre",
            "Bar & Lounge",
            "Event Centre",
          ].map((cat) => (
            <label
              key={cat}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Price</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="2,000"
              value={filters.priceRange.min}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, min: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="4,200"
              value={filters.priceRange.max}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: { ...prev.priceRange, max: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Review Filter */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Review</h4>
        <div className="space-y-2">
          {[5, 4, 3].map((stars) => (
            <label
              key={stars}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                {[...Array(stars)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="text-yellow-400 text-sm"
                  />
                ))}
                <span className="text-gray-700 text-sm">
                  {stars} Star{stars !== 1 ? "s" : ""}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const formatPrice = (n) => {
    if (!n) return "–";
    const num = Number(n);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const getPriceText = (item, category) => {
    const priceCategories = [
      "hotel",
      "hostel",
      "shortlet",
      "apartment",
      "cabin",
      "condo",
    ];
    const isAccommodation = priceCategories.some((cat) =>
      category.includes(cat)
    );

    if (isAccommodation) {
      return `#${formatPrice(item.price_from)} for 2 nights`;
    }
    return `From #${formatPrice(item.price_from)} per guest`;
  };

  const ListingCard = ({ listing }) => {
    const images = listing["image url"]
      ? listing["image url"]
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url.startsWith("http"))
      : [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
        ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-1/3">
            <img
              src={images[0]}
              alt={listing.name}
              className="w-full h-48 md:h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
              }}
            />
          </div>

          {/* Content */}
          <div className="p-4 md:w-2/3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-900">
                {listing.name}
              </h3>
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-400 text-sm"
                />
                <span className="text-gray-700 font-medium">
                  {listing.rating || "4.9"}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-3">
              {getPriceText(listing, category)}
            </p>

            <p className="text-gray-500 text-sm mb-3">
              {listing.area || "Ibadan"}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">
                #{formatPrice(listing.price_from)}
              </span>
              <button className="bg-[#06EAFC] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#05d9e8] transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const categoryTitle = category
    ? category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Category";

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Meta
        title={`${categoryTitle} in Ibadan | Ajani Directory`}
        description={`Find the best ${categoryTitle} in Ibadan. Browse prices, reviews, and book directly.`}
        url={`https://ajani.ai/category/${category}`}
        image="https://ajani.ai/images/category-og.jpg"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Popular {categoryTitle} in Ibadan
          </h1>
          <p className="text-gray-600">
            {filteredListings.length} places found in Ibadan
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC]"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#06EAFC] focus:border-[#06EAFC]"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Mobile Filter Button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
                <span>Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Hidden on mobile unless toggled */}
          {(!isMobile || showMobileFilters) && (
            <div
              className={`${
                isMobile
                  ? "fixed inset-0 z-50 bg-white p-6 overflow-auto"
                  : "md:w-1/4"
              }`}
            >
              {isMobile && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-2xl text-gray-500"
                  >
                    ×
                  </button>
                </div>
              )}
              <FilterSidebar />
              {isMobile && (
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-[#06EAFC] text-white py-3 rounded-lg font-medium mt-4"
                >
                  Apply Filters
                </button>
              )}
            </div>
          )}

          {/* Listings */}
          <div className="flex-1">
            <div className="space-y-6">
              {filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id || listing.name}
                    listing={listing}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                    <i className="fas fa-search text-3xl text-gray-300 mb-4 block"></i>
                    <h3 className="text-lg text-gray-800 mb-2">
                      No {categoryTitle} found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryResults;
