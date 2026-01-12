import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
// FontAwesome Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faCalendarAlt,
  faChevronRight,
  faChevronLeft,
  faMapMarkerAlt,
  faUser,
  faBuilding,
  faHome,
  faUtensils,
  faBed,
} from "@fortawesome/free-solid-svg-icons";
import { FaUserCircle } from "react-icons/fa";

/* ---------------- CUSTOM HOOK FOR BACKEND LISTINGS ---------------- */
const useBackendListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/listings");
        if (
          response.data?.status === "success" &&
          response.data.data?.listings
        ) {
          setListings(response.data.data.listings);
        } else {
          setListings([]);
          setError("No data received from backend");
        }
      } catch (err) {
        console.error("Backend API Error:", err.message);
        setError(err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return { listings, loading, error };
};

/* ---------------- HELPER FUNCTIONS ---------------- */
const formatDateLabel = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories") return "All Categories";
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations") return "All Locations";
  
  // Handle common Ibadan locations
  const locationMap = {
    'akobo': 'Akobo',
    'ringroad': 'Ringroad',
    'bodija': 'Bodija',
    'dugbe': 'Dugbe',
    'mokola': 'Mokola',
    'sango': 'Sango',
    'ui': 'UI',
    'poly': 'Poly',
    'oke': 'Oke',
    'agodi': 'Agodi',
    'jericho': 'Jericho',
    'gbagi': 'Gbagi',
    'apata': 'Apata',
    'secretariat': 'Secretariat',
    'moniya': 'Moniya',
    'challenge': 'Challenge',
    'molete': 'Molete',
    'agbowo': 'Agbowo',
    'sabo': 'Sabo',
    'bashorun': 'Bashorun'
  };
  
  const locLower = location.toLowerCase();
  if (locationMap[locLower]) {
    return locationMap[locLower];
  }
  
  // Fallback to proper case
  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper to normalize location for backend (convert to proper case)
const normalizeLocationForBackend = (location) => {
  if (!location) return '';
  
  // Convert to proper case
  return location
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getCategoryBreakdown = (listings) => {
  const categoryCounts = {};
  listings.forEach((item) => {
    if (item.category) {
      const category = getCategoryDisplayName(item.category);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });
  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

const getLocationBreakdown = (listings) => {
  const locationCounts = {};
  listings.forEach((item) => {
    if (item.location?.area) {
      const location = getLocationDisplayName(item.location.area);
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    }
  });
  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

/* ---------------- UPDATED: CATEGORY-SPECIFIC SEARCH SUGGESTIONS WITH PLURAL FORMS ---------------- */
const generateSearchSuggestions = (query, listings, activeCategory) => {
  if (!query.trim() || !listings.length) return [];

  const queryLower = query.toLowerCase().trim();
  const suggestions = [];

  // Filter listings by active category first
  const categoryFilteredListings = activeCategory === "All Categories" 
    ? listings 
    : listings.filter(item => {
        const itemCategory = getCategoryDisplayName(item.category || "").toLowerCase();
        const activeCategoryLower = activeCategory.toLowerCase();
        return itemCategory.includes(activeCategoryLower) || 
               activeCategoryLower.includes(itemCategory);
      });

  // Get unique locations from category-filtered listings
  const uniqueLocations = [
    ...new Set(
      categoryFilteredListings
        .map((item) => item.location?.area)
        .filter((loc) => loc && loc.trim() !== "")
        .map((loc) => loc.trim())
    ),
  ];

  // For exact location matches within the active category
  const exactLocationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName === queryLower;
    })
    .map((location) => {
      const locationListings = categoryFilteredListings.filter((item) => {
        const itemLocation = item.location?.area;
        return itemLocation && itemLocation.toLowerCase() === location.toLowerCase();
      });

      const totalPlaces = locationListings.length;
      
      // Get category display name in plural form
      let categoryPlural = activeCategory;
      if (activeCategory === "Hotel") categoryPlural = "Hotels";
      else if (activeCategory === "Restaurant") categoryPlural = "Restaurants";
      else if (activeCategory === "Shortlet") categoryPlural = "Shortlets";
      else if (activeCategory === "Vendor") categoryPlural = "Vendors";
      else categoryPlural = activeCategory + "s";

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${categoryPlural} in ${getLocationDisplayName(location)}`,
        breakdownText: "",
        breakdown: [],
        action: () => {
          const params = new URLSearchParams();
          // ✅ FIX: Always include category when searching from hero
          params.append("location.area", normalizeLocationForBackend(location));
          // CRITICAL: Always include category when searching from hero
          const categoryMap = {
            'Hotel': 'hotel',
            'Shortlet': 'shortlet',
            'Restaurant': 'restaurant',
            'Vendor': 'services'
          };
          const categorySlug = categoryMap[activeCategory] || activeCategory.toLowerCase();
          params.append("category", categorySlug);
          return `/search-results?${params.toString()}`;
        },
      };
    });

  if (exactLocationMatches.length > 0) {
    return exactLocationMatches.slice(0, 4);
  }

  // For location matches within the active category
  const locationMatches = uniqueLocations
    .filter((location) => {
      const displayName = getLocationDisplayName(location).toLowerCase();
      return displayName.includes(queryLower);
    })
    .map((location) => {
      const locationListings = categoryFilteredListings.filter((item) => {
        const itemLocation = item.location?.area;
        return itemLocation && itemLocation.toLowerCase() === location.toLowerCase();
      });

      const totalPlaces = locationListings.length;
      
      // Get category display name in plural form
      let categoryPlural = activeCategory;
      if (activeCategory === "Hotel") categoryPlural = "Hotels";
      else if (activeCategory === "Restaurant") categoryPlural = "Restaurants";
      else if (activeCategory === "Shortlet") categoryPlural = "Shortlets";
      else if (activeCategory === "Vendor") categoryPlural = "Vendors";
      else categoryPlural = activeCategory + "s";

      return {
        type: "location",
        title: getLocationDisplayName(location),
        count: totalPlaces,
        description: `${categoryPlural} in ${getLocationDisplayName(location)}`,
        breakdownText: "",
        breakdown: [],
        action: () => {
          const params = new URLSearchParams();
          // ✅ FIX: Always include category when searching from hero
          params.append("location.area", normalizeLocationForBackend(location));
          // CRITICAL: Always include category when searching from hero
          const categoryMap = {
            'Hotel': 'hotel',
            'Shortlet': 'shortlet',
            'Restaurant': 'restaurant',
            'Vendor': 'services'
          };
          const categorySlug = categoryMap[activeCategory] || activeCategory.toLowerCase();
          params.append("category", categorySlug);
          return `/search-results?${params.toString()}`;
        },
      };
    });

  // Also check for exact category matches (but only if it matches active category)
  if (activeCategory !== "All Categories") {
    const categoryLower = activeCategory.toLowerCase();
    if (categoryLower.includes(queryLower) || queryLower.includes(categoryLower)) {
      const categoryListings = categoryFilteredListings;
      const locationBreakdown = getLocationBreakdown(categoryListings);
      const totalPlaces = categoryListings.length;
      
      // Get category display name in plural form
      let categoryPlural = activeCategory;
      if (activeCategory === "Hotel") categoryPlural = "Hotels";
      else if (activeCategory === "Restaurant") categoryPlural = "Restaurants";
      else if (activeCategory === "Shortlet") categoryPlural = "Shortlets";
      else if (activeCategory === "Vendor") categoryPlural = "Vendors";
      else categoryPlural = activeCategory + "s";

      suggestions.push({
        type: "category",
        title: categoryPlural,
        count: totalPlaces,
        description: `Browse all ${categoryPlural} options`,
        breakdownText: "",
        breakdown: locationBreakdown.slice(0, 3),
        action: () => {
          const categorySlug = activeCategory.toLowerCase().replace(/\s+/g, '-');
          return `/category/${categorySlug}`;
        },
      });
    }
  }

  return [...suggestions, ...locationMatches]
    .sort((a, b) => {
      // Exact matches first
      const aExact = a.title.toLowerCase() === queryLower;
      const bExact = b.title.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Then by count
      return b.count - a.count;
    })
    .slice(0, 8);
};

/* ---------------- CALENDAR COMPONENT ---------------- */
const SimpleCalendar = ({ onSelect, onClose }) => {
  const modalRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    onSelect(newDate);
    onClose();
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm
            ${isToday ? "border border-blue-500" : ""}
            ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[10001] w-80 p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            ←
          </button>
          <h3 className="font-semibold text-gray-800">{getMonthName(currentDate)}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onSelect(new Date());
              onClose();
            }}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Select Today
          </button>
        </div>
      </div>
    </>
  );
};

/* ---------------- GUEST SELECTOR COMPONENT ---------------- */
const GuestSelector = ({ guests, onChange, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleGuestChange = (type, value) => {
    const newGuests = { ...guests };
    newGuests[type] = Math.max(0, newGuests[type] + value);
    onChange(newGuests);
  };

  const totalGuests = guests.adults + guests.children;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[10001] w-80 p-6"
      >
        <h3 className="font-semibold text-gray-800 mb-6 text-center">Guests & Rooms</h3>
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-medium text-gray-800">Adults</div>
            <div className="text-sm text-gray-500">Age 18+</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleGuestChange("adults", -1)}
              disabled={guests.adults <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.adults}</span>
            <button
              onClick={() => handleGuestChange("adults", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-medium text-gray-800">Children</div>
            <div className="text-sm text-gray-500">Age 0-17</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleGuestChange("children", -1)}
              disabled={guests.children <= 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.children}</span>
            <button
              onClick={() => handleGuestChange("children", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="font-medium text-gray-800">Rooms</div>
            <div className="text-sm text-gray-500">Number of rooms</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleGuestChange("rooms", -1)}
              disabled={guests.rooms <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.rooms}</span>
            <button
              onClick={() => handleGuestChange("rooms", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </button>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">Total Guests</div>
            <div className="text-xl font-bold text-blue-600">{totalGuests}</div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

/* ---------------- EMPTY SEARCH MODAL COMPONENT ---------------- */
const EmptySearchModal = ({ onClose, onConfirm }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-[10001] w-80 p-6"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faSearch} className="text-yellow-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Search Required</h3>
          <p className="text-gray-600 text-sm">
            Please enter a location, area, or business name to search.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enter Search Term
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

/* ---------------- SEARCH MODAL COMPONENTS ---------------- */
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
  activeCategory,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(inputValue, listings, activeCategory);
  }, [inputValue, listings, activeCategory]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onTyping(value);
  };

  const handleClearInput = () => {
    setInputValue("");
    onTyping("");
    inputRef.current?.focus();
  };

  // UPDATED: Handle suggestion click to populate input instead of navigating
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.title);
    onTyping(suggestion.title);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const params = new URLSearchParams();
      if (looksLikeLocation(inputValue.trim())) {
        // Use proper case for location
        params.append("location.area", normalizeLocationForBackend(inputValue.trim()));
      } else {
        params.append("q", inputValue.trim());
      }
      // ✅ CRITICAL: Always include category when searching from hero
      const categoryMap = {
        'Hotel': 'hotel',
        'Shortlet': 'shortlet',
        'Restaurant': 'restaurant',
        'Vendor': 'services'
      };
      const categorySlug = categoryMap[activeCategory] || activeCategory.toLowerCase();
      params.append("category", categorySlug);
      
      onSuggestionClick(suggestion => suggestion.action());
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [isVisible]);

  useEffect(() => setInputValue(searchQuery), [searchQuery]);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]" onClick={onClose} />
      <div
        ref={modalRef}
        className="fixed inset-0 bg-white z-[9991] flex flex-col"
        style={{ boxShadow: "0 -25px 50px -12px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="lg" />
            </button>
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faSearch} size="sm" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none text-gray-900 placeholder:text-gray-500"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Search ${activeCategory.toLowerCase()}...`}
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            suggestions.length > 0 ? (
              <div className="p-5">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Suggestions ({suggestions.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                          {suggestion.type === "category" ? (
                            <FontAwesomeIcon 
                              icon={faBuilding} 
                              className="text-gray-700 text-lg"
                            />
                          ) : (
                            <FontAwesomeIcon 
                              icon={faMapMarkerAlt} 
                              className="text-gray-700 text-lg"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900 text-base">{suggestion.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            </div>
                          </div>
                          {suggestion.breakdown && suggestion.breakdown.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex flex-wrap gap-1.5">
                                {suggestion.breakdown.map((item, idx) => (
                                  <div key={idx} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                                    {item.location} ({item.count})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                        <span className="text-sm text-blue-600 font-medium">Tap to select</span>
                        <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-blue-600" size="sm" />
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (looksLikeLocation(inputValue.trim())) {
                      // Use proper case for location
                      params.append("location.area", normalizeLocationForBackend(inputValue.trim()));
                    } else {
                      params.append("q", inputValue.trim());
                    }
                    // ✅ CRITICAL: Always include category when searching from hero
                    const categoryMap = {
                      'Hotel': 'hotel',
                      'Shortlet': 'shortlet',
                      'Restaurant': 'restaurant',
                      'Vendor': 'services'
                    };
                    const categorySlug = categoryMap[activeCategory] || activeCategory.toLowerCase();
                    params.append("category", categorySlug);
                    
                    onSuggestionClick(`/search-results?${params.toString()}`);
                    onClose();
                  }}
                  className="w-full mt-6 p-4 bg-gray-900 hover:bg-black text-white font-medium rounded-xl cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-base font-medium">Show all results</p>
                      <p className="text-sm text-gray-300 mt-1">View all {activeCategory} matches for "{inputValue}"</p>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} size="sm" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">No matches found</h3>
                <p className="text-gray-600 text-center max-w-sm mb-8">
                  Try different keywords or browse our categories
                </p>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (looksLikeLocation(inputValue.trim())) {
                      // Use proper case for location
                      params.append("location.area", normalizeLocationForBackend(inputValue.trim()));
                    } else {
                      params.append("q", inputValue.trim());
                    }
                    // ✅ CRITICAL: Always include category when searching from hero
                    const categoryMap = {
                      'Hotel': 'hotel',
                      'Shortlet': 'shortlet',
                      'Restaurant': 'restaurant',
                      'Vendor': 'services'
                    };
                    const categorySlug = categoryMap[activeCategory] || activeCategory.toLowerCase();
                    params.append("category", categorySlug);
                    
                    onSuggestionClick(`/search-results?${params.toString()}`);
                    onClose();
                  }}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black cursor-pointer"
                >
                  Search anyway
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Start searching</h3>
              <p className="text-gray-600 text-center max-w-sm mb-10">
                Search for {activeCategory.toLowerCase()} in Ibadan
              </p>
              <div className="w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">Popular locations</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Akobo", "Bodija", "Sango", "UI", "Mokola", "Dugbe", "Ringroad"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setInputValue(term);
                        onTyping(term);
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
  searchBarPosition,
  activeCategory,
}) => {
  const suggestionsRef = useRef(null);
  const suggestions = useMemo(() => {
    return generateSearchSuggestions(searchQuery, listings, activeCategory);
  }, [searchQuery, listings, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isVisible) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isVisible, onClose]);

  if (!isVisible || !searchQuery.trim() || suggestions.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 bg-transparent z-[9980]" onClick={onClose} />
      <div
        ref={suggestionsRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 z-[9981] overflow-hidden"
        style={{
          left: `${searchBarPosition?.left || 0}px`,
          top: `${(searchBarPosition?.top || 0) - 10}px`,
          width: `${searchBarPosition?.width || 0}px`,
          maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-sm" />
              <span className="text-sm font-medium text-gray-700">{activeCategory} results for "{searchQuery}"</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded cursor-pointer"
              aria-label="Close suggestions"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 56px)" }}>
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // UPDATED: Populate input instead of navigating directly
                  onSuggestionClick(suggestion);
                  onClose();
                }}
                className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded-lg mb-1 last:mb-0 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                    {suggestion.type === "category" ? (
                      <FontAwesomeIcon 
                        icon={faBuilding} 
                        className="text-gray-700 text-sm"
                      />
                    ) : (
                      <FontAwesomeIcon 
                        icon={faMapMarkerAlt} 
                        className="text-gray-700 text-sm"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{suggestion.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.description}</p>
                    {suggestion.breakdown && suggestion.breakdown.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.breakdown.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {item.location} ({item.count})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 text-sm" />
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (looksLikeLocation(searchQuery.trim())) {
                  // Use proper case for location
                  params.append("location.area", normalizeLocationForBackend(searchQuery.trim()));
                } else {
                  params.append("q", searchQuery.trim());
                }
                // ✅ CRITICAL: Always include category when searching from hero
                const categoryMap = {
                  'Hotel': 'hotel',
                  'Shortlet': 'shortlet',
                  'Restaurant': 'restaurant',
                  'Vendor': 'services'
                };
                const categorySlug = categoryMap[activeCategory] || activeCategory.toLowerCase();
                params.append("category", categorySlug);
                
                onSuggestionClick(`/search-results?${params.toString()}`);
                onClose();
              }}
              className="w-full mt-3 p-3 bg-gray-900 hover:bg-black text-white font-medium rounded-lg cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium">Show all results</p>
                  <p className="text-xs text-gray-300 mt-1">View all {activeCategory} matches for "{searchQuery}"</p>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------------- LOCATION DETECTION HELPER ---------------- */
const looksLikeLocation = (query) => {
  if (!query || query.trim() === '') return false;
  
  const queryLower = query.toLowerCase().trim();
  
  // Common Ibadan areas
  const ibadanAreas = [
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly', 'oke', 'agodi', 
    'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
    'molete', 'agbowo', 'sabo', 'bashorun', 'ondo road', 'ogbomoso', 'ife road',
    'akinyele', 'bodija market', 'dugbe market', 'mokola hill', 'sango roundabout'
  ];
  
  // Location suffixes
  const locationSuffixes = [
    'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
    'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
    'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station'
  ];
  
  // Check if query contains any Ibadan area
  const isIbadanArea = ibadanAreas.some(area => queryLower.includes(area));
  
  // Check if query contains location suffix
  const hasLocationSuffix = locationSuffixes.some(suffix => queryLower.includes(suffix));
  
  // Check if query is short (likely a location name)
  const isShortQuery = queryLower.split(/\s+/).length <= 3 && queryLower.length <= 15;
  
  return isIbadanArea || hasLocationSuffix || isShortQuery;
};

/* ---------------- FIXED MAIN COMPONENT WITH ALL REQUESTS ---------------- */
const DiscoverIbadan = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
  });
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  });
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  const [clickedSuggestion, setClickedSuggestion] = useState(null);
  const [isSearchButtonAnimating, setIsSearchButtonAnimating] = useState(false);
  const [showEmptySearchModal, setShowEmptySearchModal] = useState(false);
  const [searchParamsForResults, setSearchParamsForResults] = useState({
    checkInDate: null,
    checkOutDate: null,
    guests: null,
  });

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchButtonRef = useRef(null);
  const { listings = [], loading } = useBackendListings();

  // ✅ Default active tab is Hotel
  const [activeTab, setActiveTab] = useState("Hotel");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!searchContainerRef.current || isMobile) return;
    const updatePosition = () => {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setSearchBarPosition({
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        width: rect.width,
      });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isMobile]);

  // ✅ FIXED: Handle suggestion click - populate input instead of navigate
  const handleSuggestionClick = useCallback((suggestion) => {
    if (suggestion.action) {
      // If it's an action function, execute it to get the URL
      const url = suggestion.action();
      // Store the URL for later navigation
      setClickedSuggestion({ url, suggestion });
      // Populate the search input with the suggestion title
      setSearchQuery(suggestion.title);
      // Trigger search button animation
      setIsSearchButtonAnimating(true);
      setTimeout(() => {
        setIsSearchButtonAnimating(false);
      }, 2000);
    } else if (typeof suggestion === 'string') {
      // Direct URL navigation
      setClickedSuggestion({ url: suggestion });
      setShowSuggestions(false);
      setShowMobileModal(false);
      
      // Add search parameters if available
      const params = new URLSearchParams(window.location.search);
      if (searchParamsForResults.checkInDate) {
        params.append("checkInDate", searchParamsForResults.checkInDate.toISOString());
      }
      if (searchParamsForResults.checkOutDate) {
        params.append("checkOutDate", searchParamsForResults.checkOutDate.toISOString());
      }
      if (searchParamsForResults.guests) {
        params.append("guests", JSON.stringify(searchParamsForResults.guests));
      }
      
      const queryString = params.toString();
      const finalUrl = queryString ? `${suggestion}${suggestion.includes('?') ? '&' : '?'}${queryString}` : suggestion;
      
      navigate(finalUrl);
    }
  }, [navigate, searchParamsForResults]);

  // ✅ FIXED: Handle search submit with all parameters
  const handleSearchSubmit = useCallback(() => {
    // Check if search query is empty
    if (!searchQuery.trim()) {
      setShowEmptySearchModal(true);
      return;
    }
    
    const params = new URLSearchParams();
    
    // Always add category (convert display name to backend category)
    const categoryMap = {
      Hotel: "hotel",
      Shortlet: "shortlet",
      Restaurant: "restaurant",
      Vendor: "services", // Backend expects "services" for vendors
    };
    const categorySlug = categoryMap[activeTab];
    
    // ✅ CRITICAL FIX: ALWAYS include category when searching
    if (categorySlug) {
      params.append("category", categorySlug);
    } else {
      // Default to hotel if no category selected
      params.append("category", "hotel");
    }
    
    // Add location search if provided and looks like a location
    if (searchQuery.trim() && looksLikeLocation(searchQuery.trim())) {
      // Use proper case for location
      params.append("location.area", normalizeLocationForBackend(searchQuery.trim()));
    } else if (searchQuery.trim()) {
      // Regular search query
      params.append("q", searchQuery.trim());
    }
    
    // Add check-in and check-out dates if available
    if (checkInDate) {
      params.append("checkInDate", checkInDate.toISOString());
    }
    if (checkOutDate) {
      params.append("checkOutDate", checkOutDate.toISOString());
    }
    
    // Add guests information if available
    if (guests) {
      params.append("guests", JSON.stringify(guests));
    }
    
    // Navigate to search results with proper parameters
    const queryString = params.toString();
    console.log("🔍 Search parameters from hero:", queryString);
    navigate(`/search-results?${queryString}`);
    setShowSuggestions(false);
    setShowMobileModal(false);
  }, [activeTab, searchQuery, navigate, checkInDate, checkOutDate, guests]);

  // ✅ Enter key also triggers search
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (!isMobile && value.trim().length > 0) setShowSuggestions(true);
    else setShowSuggestions(false);
  }, [isMobile]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  const handleMobileSearchClick = useCallback(() => {
    if (isMobile) setShowMobileModal(true);
  }, [isMobile]);

  const handleSearchFocus = useCallback(() => {
    if (isMobile) handleMobileSearchClick();
    else if (searchQuery.trim().length > 0) setShowSuggestions(true);
  }, [isMobile, searchQuery, handleMobileSearchClick]);

  const handleCheckInClick = () => setShowCheckInCalendar(true);
  
  const handleCheckOutClick = () => {
    // For check-out, we want to set date to check-in + 1 day
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCheckOutDate(nextDay);
    setShowCheckInCalendar(true);
  };

  const handleGuestClick = () => setShowGuestSelector(true);

  const handleCheckInSelect = (date) => {
    setCheckInDate(date);
    // Auto-set check-out to check-in + 1 day
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setCheckOutDate(nextDay);
  };

  const handleGuestsChange = (newGuests) => {
    setGuests(newGuests);
    // Store for search results
    setSearchParamsForResults(prev => ({ ...prev, guests: newGuests }));
  };

  // ✅ Tab click only changes UI, no navigation
  const handleTabClick = (category) => {
    setActiveTab(category);
  };

  const getSearchPlaceholder = () => {
    if (activeTab === "Vendor") return "What service do you need?";
    if (activeTab === "Restaurant") return "Search by restaurant name, cuisine, or area...";
    if (activeTab === "Shortlet") return "Search by shortlet name, area, or location...";
    return "Search by hotel name, area, or location...";
  };

  const getSearchButtonText = () => {
    if (activeTab === "Hotel") return "Find Hotel";
    if (activeTab === "Shortlet") return "Find Shortlet";
    if (activeTab === "Restaurant") return "Find Restaurant";
    if (activeTab === "Vendor") return "Find Vendor";
    return "Search";
  };

  // Compute total people for restaurant
  const totalPeople = guests.adults + guests.children;

  // Animation effect for search button
  useEffect(() => {
    if (isSearchButtonAnimating && searchButtonRef.current) {
      const button = searchButtonRef.current;
      let scale = 1;
      const interval = setInterval(() => {
        scale = scale === 1 ? 1.2 : 1;
        button.style.transform = `scale(${scale})`;
      }, 500);
      
      setTimeout(() => {
        clearInterval(interval);
        button.style.transform = 'scale(1)';
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isSearchButtonAnimating]);

  // Handle click on search button after suggestion is selected
  const handleSearchButtonClick = () => {
    if (clickedSuggestion) {
      // Navigate to the stored URL
      const { url } = clickedSuggestion;
      const params = new URLSearchParams(window.location.search);
      
      // Add search parameters if available
      if (searchParamsForResults.checkInDate) {
        params.append("checkInDate", searchParamsForResults.checkInDate.toISOString());
      }
      if (searchParamsForResults.checkOutDate) {
        params.append("checkOutDate", searchParamsForResults.checkOutDate.toISOString());
      }
      if (searchParamsForResults.guests) {
        params.append("guests", JSON.stringify(searchParamsForResults.guests));
      }
      
      const queryString = params.toString();
      const finalUrl = queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url;
      
      navigate(finalUrl);
      setClickedSuggestion(null);
      setShowSuggestions(false);
      setShowMobileModal(false);
    } else {
      handleSearchSubmit();
    }
  };

  return (
    <div className="min-h-[50%] bg-[#F7F7FA] font-manrope">
      <section className="pt-14 lg:pt-12 text-center bg-[#F7F7FA] overflow-hidden relative">
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-[url('image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`}
        ></div>
        <div className="relative max-w-7xl mx-auto w-full py-4 lg:py-4 lg:mt-[-70px] mt-[-60px]">
          <div className="flex flex-col items-center text-center space-y-4 md:space-y-5 lg:space-y-4">
            {/* Hero Title */}
            <div className="space-y-1 md:space-y-2 max-w-xl md:max-w-2xl w-full mt-1 md:mt-2 lg:mt-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-3xl md:mt-4 leading-tight font-bold text-gray-900">
                Discover{" "}
                <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">
                  Ibadan
                </span>{" "}
                through AI & Local Stories
              </h1>
              <p className="text-[13.5px] sm:text-lg md:text-xl lg:text-[16px] md:mt-3 text-gray-600 font-medium max-w-xl mx-auto px-2">
                Your all-in-one local guide for hotels, food, events, vendors, and market prices.
              </p>
            </div>

            {/* TABS — UPDATED WITH BOLD SOLID ICONS */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              <div className="flex justify-between items-center gap-2 p-2.5 bg-white rounded-lg border border-[#f7f7fa]">
                {["Hotel", "Shortlet", "Restaurant", "Vendor"].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleTabClick(category)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeTab === category
                        ? "bg-[#06f49f] text-gray-600"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {/* ✅ UPDATED: Fixed icons - Vendor uses profile icon */}
                    <span className="flex-shrink-0">
                      {category === "Hotel" && (
                        <FontAwesomeIcon icon={faBuilding} className="w-3.5 h-3.5" />
                      )}
                      {category === "Shortlet" && (
                        <FontAwesomeIcon icon={faHome} className="w-3.5 h-3.5" />
                      )}
                      {category === "Restaurant" && (
                        <FontAwesomeIcon icon={faUtensils} className="w-3.5 h-3.5" />
                      )}
                      {category === "Vendor" && (
                        <FaUserCircle className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="text-[12.5px] font-medium">{category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH BAR */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              <div ref={searchContainerRef} className="relative w-full">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-blue-100 p-3 sm:p-3 md:p-4">
                  {/* Search Input */}
                  <div className="mb-2 sm:mb-3">
                    <div className="bg-[#d9d9d9] rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-200 cursor-pointer">
                      {/* ✅ UPDATED: Solid search icon */}
                      <FontAwesomeIcon icon={faSearch} className="text-gray-500 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={handleSearchFocus}
                        onKeyPress={handleKeyPress}
                        placeholder={getSearchPlaceholder()}
                        className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-500 text-xs min-w-0"
                      />
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="text-gray-900 hover:text-gray-600 flex-shrink-0 ml-1 cursor-pointer"
                        >
                          {/* ✅ UPDATED: Solid close icon */}
                          <FontAwesomeIcon icon={faTimes} className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Fields Based on Tab */}
                  {activeTab === "Hotel" || activeTab === "Shortlet" ? (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div
                        onClick={handleCheckInClick}
                        className="bg-[#d9d9d9] rounded-lg p-2 text-center hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          {/* ✅ UPDATED: Solid calendar icon */}
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> Check-in
                        </div>
                        <div className="text-xs font-medium text-blue-600">{formatDateLabel(checkInDate)}</div>
                      </div>
                      <div
                        onClick={handleCheckOutClick}
                        className="bg-[#d9d9d9] rounded-lg p-2 text-center hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          {/* ✅ UPDATED: Solid calendar icon */}
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> Check-out
                        </div>
                        <div className="text-xs font-medium text-blue-600">
                          {formatDateLabel(checkOutDate)}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "Restaurant" ? (
                    <div className="space-y-2 mb-2">
                      <div
                        onClick={handleCheckInClick}
                        className="bg-[#d9d9d9] rounded-lg p-2 text-center hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          {/* ✅ UPDATED: Solid calendar icon */}
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> When are you visiting?
                        </div>
                        <div className="text-xs font-medium text-blue-600">{formatDateLabel(checkInDate)}</div>
                      </div>
                      {/* ✅ UPDATED: Clickable "Number of People" with solid User icon */}
                      <div
                        onClick={handleGuestClick}
                        className="bg-[#d9d9d9] rounded-lg p-2 text-center hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          {/* ✅ UPDATED: Solid user icon */}
                          <FontAwesomeIcon icon={faUser} className="text-sm" /> Number of People (optional)
                        </div>
                        <div className="text-xs font-medium text-blue-600">
                          {totalPeople} {totalPeople === 1 ? "person" : "people"}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "Vendor" ? (
                    <div className="space-y-2 mb-2">
                      <div
                        onClick={handleCheckInClick}
                        className="bg-[#d9d9d9] rounded-lg p-2 text-center hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          {/* ✅ UPDATED: Solid calendar icon */}
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> Preferred service date (optional)
                        </div>
                        <div className="text-xs font-medium text-blue-600">{formatDateLabel(checkInDate)}</div>
                      </div>
                    </div>
                  ) : null}

                  {/* Guest Selector — Show for Hotel/Shortlet/Restaurant */}
                  {(activeTab === "Hotel" || activeTab === "Shortlet" || activeTab === "Restaurant") && (
                    <div className="mb-2 w-full">
                      <div
                        onClick={handleGuestClick}
                        className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#d9d9d9] px-4 py-2 text-[12.5px] font-medium text-gray-900 hover:bg-gray-200 cursor-pointer"
                      >
                        {activeTab !== "Restaurant" && (
                          <>
                            {/* ✅ UPDATED: Room icon for Rooms */}
                            <FontAwesomeIcon icon={faBed} className="mr-1 text-sm" />
                            <span>{guests.rooms} {guests.rooms === 1 ? "Room" : "Rooms"}</span>
                            <span className="mx-1">•</span>
                          </>
                        )}
                        {/* ✅ For Restaurant: Only show total people with solid User icon */}
                        {activeTab === "Restaurant" ? (
                          <>
                            {/* ✅ UPDATED: Solid user icon */}
                            <FontAwesomeIcon icon={faUser} className="mr-1 text-sm" />
                            <span>{totalPeople} {totalPeople === 1 ? "person" : "people"}</span>
                          </>
                        ) : (
                          <>
                            {/* ✅ UPDATED: Adult icon for Adults */}
                            <FontAwesomeIcon icon={faUser} className="mr-1 text-sm" />
                            <span>{guests.adults} {guests.adults === 1 ? "Adult" : "Adults"}</span>
                            {guests.children > 0 && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{guests.children} {guests.children === 1 ? "Child" : "Children"}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Search Button with Animation */}
                  <div className="w-full">
                    <button
                      ref={searchButtonRef}
                      onClick={handleSearchButtonClick}
                      className="w-full bg-gradient-to-r from-[#00E38C] to-teal-500 hover:from-[#00c97b] hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-transform duration-300"
                      style={{
                        transform: isSearchButtonAnimating ? 'scale(1.2)' : 'scale(1)',
                      }}
                    >
                      {/* ✅ UPDATED: Solid search icon */}
                      <FontAwesomeIcon icon={faSearch} className="text-sm" />
                      <span className="text-xs">{getSearchButtonText()}</span>
                      {clickedSuggestion && (
                        <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                          Click to search
                        </span>
                      )}
                    </button>
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-green-400 via-green-500 to-green-400 opacity-70"></div>
        </div>
      </section>

      {showCheckInCalendar && (
        <SimpleCalendar
          onSelect={handleCheckInSelect}
          onClose={() => setShowCheckInCalendar(false)}
        />
      )}
      {showGuestSelector && (
        <GuestSelector
          guests={guests}
          onChange={handleGuestsChange}
          onClose={() => setShowGuestSelector(false)}
        />
      )}
      {showEmptySearchModal && (
        <EmptySearchModal
          onClose={() => setShowEmptySearchModal(false)}
          onConfirm={() => {
            setShowEmptySearchModal(false);
            searchInputRef.current?.focus();
          }}
        />
      )}

      {!isMobile && (
        <DesktopSearchSuggestions
          searchQuery={searchQuery}
          listings={listings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
          isVisible={showSuggestions && !loading}
          searchBarPosition={searchBarPosition}
          activeCategory={activeTab}
        />
      )}
      {isMobile && (
        <MobileSearchModal
          searchQuery={searchQuery}
          listings={listings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowMobileModal(false)}
          onTyping={handleSearchChange}
          isVisible={showMobileModal}
          activeCategory={activeTab}
        />
      )}

      <style jsx global>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-slideInUp { animation: slideInUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-pulseScale { animation: pulseScale 0.5s ease-in-out infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DiscoverIbadan;