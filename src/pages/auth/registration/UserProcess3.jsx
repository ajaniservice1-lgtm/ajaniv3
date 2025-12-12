import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Heart, MapPin, Star, ArrowLeft, Filter, Search } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const UserProcess3 = () => {
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    sortBy: "recent",
    category: "all",
    priceRange: "all",
  });

  // Load saved listings from localStorage
  useEffect(() => {
    const loadSavedListings = () => {
      setLoading(true);
      const savedFromStorage = localStorage.getItem("userSavedListings");

      if (savedFromStorage) {
        try {
          const parsed = JSON.parse(savedFromStorage);
          setSavedListings(parsed);
        } catch (error) {
          console.error("Error parsing saved listings:", error);
          loadDefaultSavedListings();
        }
      } else {
        loadDefaultSavedListings();
      }
      setLoading(false);
    };

    loadSavedListings();

    // Listen for updates from Directory component
    const handleSavedListingsUpdate = () => {
      const updated = localStorage.getItem("userSavedListings");
      if (updated) {
        try {
          setSavedListings(JSON.parse(updated));
        } catch (error) {
          console.error("Error updating saved listings:", error);
        }
      }
    };

    window.addEventListener("savedListingsUpdated", handleSavedListingsUpdate);

    return () => {
      window.removeEventListener(
        "savedListingsUpdated",
        handleSavedListingsUpdate
      );
    };
  }, []);

  const loadDefaultSavedListings = () => {
    // Empty default - no fallback images
    const defaultListings = [];
    setSavedListings(defaultListings);
    localStorage.setItem("userSavedListings", JSON.stringify(defaultListings));
  };

  // Remove a listing from saved with toast notification
  const handleRemoveListing = (id, e) => {
    if (e) e.stopPropagation();

    const updatedListings = savedListings.filter(
      (listing) => listing.id !== id
    );
    setSavedListings(updatedListings);
    localStorage.setItem("userSavedListings", JSON.stringify(updatedListings));

    // Show toast notification
    showToast("Removed from saved listings");

    // Dispatch event for Directory to update
    window.dispatchEvent(
      new CustomEvent("savedListingsUpdated", {
        detail: { action: "removed", itemId: id },
      })
    );
  };

  // Toast notification function
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border bg-blue-50 border-blue-200 text-blue-800 transform transition-all duration-300";
    toast.style.transform = "translateX(400px)";

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-70 transition-opacity">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 10);

    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  };

  // Apply filters
  const applyFilters = (listings) => {
    let filtered = [...listings];

    // Sort by
    switch (activeFilters.sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.savedDate) - new Date(a.savedDate));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/\D/g, "")) || 0;
          const priceB = parseInt(b.price.replace(/\D/g, "")) || 0;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/\D/g, "")) || 0;
          const priceB = parseInt(b.price.replace(/\D/g, "")) || 0;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    // Filter by category
    if (activeFilters.category !== "all") {
      filtered = filtered.filter(
        (listing) =>
          listing.category.toLowerCase() ===
          activeFilters.category.toLowerCase()
      );
    }

    // Filter by price range
    if (activeFilters.priceRange !== "all") {
      filtered = filtered.filter((listing) => {
        const price = parseInt(listing.price.replace(/\D/g, "")) || 0;
        switch (activeFilters.priceRange) {
          case "budget":
            return price < 30000;
          case "mid":
            return price >= 30000 && price <= 70000;
          case "premium":
            return price > 70000;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredListings = applyFilters(savedListings);

  // Get unique categories
  const categories = [...new Set(savedListings.map((item) => item.category))];

  // Search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const searchedListings = searchTerm
    ? filteredListings.filter(
        (listing) =>
          listing.name.toLowerCase().includes(searchTerm) ||
          listing.location.toLowerCase().includes(searchTerm) ||
          listing.category.toLowerCase().includes(searchTerm)
      )
    : filteredListings;

  // Business Card Component (same as Directory)
  const BusinessCard = ({ listing }) => {
    const handleCardClick = () => {
      if (listing.id) {
        navigate(`/vendor-detail/${listing.id}`);
      }
    };

    return (
      <div
        className="bg-white rounded-xl overflow-hidden flex-shrink-0 font-manrope relative group w-[210px] transition-all duration-200 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-xl w-full h-[170px]">
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          />

          {/* Guest favorite badge */}
          <div className="absolute top-2 left-2 bg-white px-1.5 py-1 rounded-md shadow-sm flex items-center gap-1">
            <span className="text-[9px] font-semibold text-gray-900">
              {listing.tag || "Guest Favorite"}
            </span>
          </div>

          {/* Heart icon - Already saved (filled) */}
          <button
            onClick={(e) => handleRemoveListing(listing.id, e)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            title="Remove from saved"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Price overlay */}
          {listing.price && listing.price.includes("₦") && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {listing.price.split(" ")[0]}
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="p-2.5 flex flex-col gap-0.5">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm">
            {listing.name}
          </h3>

          <div className="flex items-center gap-1 text-gray-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-xs line-clamp-1">{listing.location}</p>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 text-gray-800 text-xs">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-xs text-yellow-500"
                />
                <span className="font-semibold">{listing.rating || "4.9"}</span>
                <span className="text-gray-500">
                  ({listing.reviews || "0"})
                </span>
              </div>
            </div>

            {/* Saved indicator badge */}
            <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Saved
            </span>
          </div>

          {/* Category tag */}
          {listing.category && (
            <div className="mt-1">
              <span className="inline-block text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {listing.category}
              </span>
            </div>
          )}
        </div>

        {/* Saved date (small text at bottom) */}
        <div className="px-2.5 pb-2">
          <p className="text-[10px] text-gray-500">
            Saved on{" "}
            {new Date(listing.savedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-manrope flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-manrope flex flex-col">
      <Header />

      <main className="flex-grow md:mt-10 mt-15 max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Back Button and Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Profile</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Saved Listings
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {savedListings.length}{" "}
              {savedListings.length === 1 ? "listing" : "listings"} saved
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-gradient-to-r from-[#00d1ff] to-[#00d37f] rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">Daniel Adeyemi</h2>
                <p className="text-white/80 text-sm">
                  Member since September 2025
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <div className="text-3xl font-bold">{savedListings.length}</div>
              <p className="text-white/80 text-sm">Saved Items</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search saved listings..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none transition"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                value={activeFilters.sortBy}
                onChange={(e) =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none transition"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Category:
              </span>
              <select
                value={activeFilters.category}
                onChange={(e) =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none transition"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Price:</span>
              <select
                value={activeFilters.priceRange}
                onChange={(e) =>
                  setActiveFilters((prev) => ({
                    ...prev,
                    priceRange: e.target.value,
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none transition"
              >
                <option value="all">All Prices</option>
                <option value="budget">Budget (&lt; ₦30,000)</option>
                <option value="mid">Mid (₦30,000 - ₦70,000)</option>
                <option value="premium">Premium (&gt; ₦70,000)</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(activeFilters.sortBy !== "recent" ||
              activeFilters.category !== "all" ||
              activeFilters.priceRange !== "all") && (
              <button
                onClick={() =>
                  setActiveFilters({
                    sortBy: "recent",
                    category: "all",
                    priceRange: "all",
                  })
                }
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Saved Listings - Horizontal Scroll (like Directory) */}
        {searchedListings.length > 0 ? (
          <div>
            {/* Mobile View - Horizontal Scroll */}
            <div className="block md:hidden">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-4">
                {searchedListings.map((listing) => (
                  <BusinessCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>

            {/* Desktop View - Grid with exact Directory card sizes */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchedListings.map((listing) => (
                <BusinessCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No listings found" : "No saved listings yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm
                ? "No listings match your search. Try different keywords or clear your search."
                : "You haven't saved any listings yet. Start exploring and click the heart icon to save listings you like."}
            </p>
            <div className="space-x-4">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-2.5 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => navigate("/directory")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Explore Listings
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary - Only show if there are listings */}
        {searchedListings.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {savedListings.length}
                </div>
                <p className="text-gray-600">Total Saved Listings</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {categories.length}
                </div>
                <p className="text-gray-600">Categories</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ₦
                  {Math.round(
                    savedListings.reduce((sum, item) => {
                      const price =
                        parseInt(item.price.replace(/\D/g, "")) || 0;
                      return sum + price;
                    }, 0) / 1000
                  )}
                  K
                </div>
                <p className="text-gray-600">Average Price Range</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserProcess3;
