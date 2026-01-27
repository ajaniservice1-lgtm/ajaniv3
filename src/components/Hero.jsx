import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import listingService from "../lib/listingService";
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

/* ---------------- GLASSMORPHISM CSS STYLES ---------------- */
const glassStyles = `
  .glass-effect {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .glass-dark {
    background: rgba(217, 217, 217, 0.2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .glass-light {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .glass-pronounced {
    background: linear-gradient(
      135deg,
      rgba(217, 217, 217, 0.25) 0%,
      rgba(217, 217, 217, 0.1) 100%
    );
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.1),
      0 1px 8px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  }

  .glass-background {
    background: linear-gradient(
      135deg,
      rgba(217, 217, 217, 0.1) 0%,
      rgba(217, 217, 217, 0.05) 100%
    );
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .glass-dark:hover, .glass-light:hover, .glass-pronounced:hover {
    background: rgba(217, 217, 217, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }

  @supports not (backdrop-filter: blur(10px)) {
    .glass-effect,
    .glass-dark,
    .glass-light,
    .glass-pronounced {
      background: rgba(245, 245, 245, 0.95);
      border: 1px solid rgba(229, 231, 235, 0.8);
    }
    .glass-background {
      background: #F7F7FA;
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 227, 140, 0.3); }
    50% { box-shadow: 0 0 30px rgba(0, 227, 140, 0.5); }
  }

  .floating {
    animation: float 6s ease-in-out infinite;
  }

  .glowing {
    animation: glow 3s ease-in-out infinite;
  }
`;

/* ---------------- CUSTOM HOOK FOR BACKEND LISTINGS ---------------- */
const useBackendListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const result = await listingService.getAll();
        
        if (result?.status === "success" && result.data?.listings) {
          setListings(result.data.listings);
        } else {
          setListings([]);
          setError(result?.message || "No data received");
        }
      } catch (err) {
        console.error("Hero API Error:", err.message);
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

const formatDateForURL = (date) => {
  if (!date) return "";
  return date.toISOString();
};

const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories") return "All Categories";
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getLocationDisplayName = (location) => {
  if (!location || location === "All Locations") return "All Locations";
  
  const locationMap = {
    'akobo': 'Akobo',
    'ringroad': 'Ringroad',
    'bodija': 'Bodija',
    'dugbe': 'Dugbe',
    'mokola': 'Mokola',
    'sango': 'Sango',
    'ui': 'UI',
    'poly': 'Poly',
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
  
  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const normalizeLocationForBackend = (location) => {
  if (!location) return '';
  return location
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const createSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const getCategorySlug = (category) => {
  const categoryMap = {
    'Hotel': 'hotel',
    'Shortlet': 'shortlet', 
    'Restaurant': 'restaurant',
    'Vendor': 'services',
    'All Categories': ''
  };
  
  return categoryMap[category] || createSlug(category);
};

const normalizeLocation = (location) => {
  if (!location) return '';
  return location
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ');
};

const looksLikeLocation = (query) => {
  if (!query || query.trim() === '') return false;
  
  const queryLower = query.toLowerCase().trim();
  
  const ibadanAreas = [
    'akobo', 'bodija', 'dugbe', 'mokola', 'sango', 'ui', 'poly',  'agodi', 
    'jericho', 'gbagi', 'apata', 'ringroad', 'secretariat', 'moniya', 'challenge',
    'molete', 'agbowo', 'sabo', 'bashorun', 'ife road',
    'akinyele', 'mokola hill', 'sango roundabout'
  ];
  
  const locationSuffixes = [
    'road', 'street', 'avenue', 'drive', 'lane', 'close', 'way', 'estate',
    'area', 'zone', 'district', 'quarters', 'extension', 'phase', 'junction',
    'bypass', 'expressway', 'highway', 'roundabout', 'market', 'station'
  ];
  
  const isIbadanArea = ibadanAreas.some(area => queryLower.includes(area));
  const hasLocationSuffix = locationSuffixes.some(suffix => queryLower.includes(suffix));
  const isShortQuery = queryLower.split(/\s+/).length <= 3 && queryLower.length <= 15;
  
  return isIbadanArea || hasLocationSuffix || isShortQuery;
};

/* ---------------- MOBILE SEARCH MODAL COMPONENT ---------------- */
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
  
  // Use ALL Ibadan locations, not just from current listings
  const allIbadanLocations = useMemo(() => {
    const locationsFromListings = listingService.getLocationsFromListings(listings);
    const allLocations = [
      'Akobo', 'Bodija', 'Dugbe', 'Mokola', 'Sango', 'UI', 'Poly',  'Agodi',
      'Jericho', 'Gbagi', 'Apata', 'Ringroad', 'Secretariat', 'Moniya', 'Challenge',
      'Molete', 'Agbowo', 'Sabo', 'Bashorun',  'Ife Road',
      'Akinyele',  'Mokola Hill', 'Sango Roundabout',
      'Iwo Road', 'Gate', 'New Garage', 'Old Ife Road',
      ...locationsFromListings
    ];
    
    // Remove duplicates and sort alphabetically
    return [...new Set(allLocations)].sort();
  }, [listings]);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return [];
    
    const queryLower = inputValue.toLowerCase().trim();
    
    // Filter locations based on search
    const locationMatches = allIbadanLocations
      .filter((location) => {
        const displayName = location.toLowerCase();
        return displayName.includes(queryLower) || 
               normalizeLocation(location).includes(normalizeLocation(queryLower));
      })
      .map((location) => ({
        type: "location",
        title: getLocationDisplayName(location),
        location: location,
        description: `${activeCategory}s in ${getLocationDisplayName(location)}, Ibadan`,
      }));

    // Add a general search option if no exact location matches
    if (locationMatches.length === 0 && inputValue.trim()) {
      return [{
        type: "search",
        title: `Search for "${inputValue}"`,
        description: `Find ${activeCategory.toLowerCase()}s matching "${inputValue}" in Ibadan`,
      }];
    }

    return locationMatches.slice(0, 8);
  }, [inputValue, activeCategory, allIbadanLocations]);

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

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "location") {
      // Set the search input value and close modal
      const title = suggestion.title || suggestion;
      setInputValue(title);
      onTyping(title); // Update parent's search query
      onClose(); // Close the modal
    } else {
      // General search
      const searchValue = inputValue.trim();
      setInputValue(searchValue);
      onTyping(searchValue);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onTyping(inputValue.trim());
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

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

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
                className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none text-gray-900 placeholder:text-gray-500 cursor-text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Search ${activeCategory.toLowerCase()} locations in Ibadan...`}
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
            {/* Search button in modal header - JUST CLOSES MODAL, DOESN'T SEARCH */}
            <button
              onClick={() => {
                onClose(); // Just close the modal
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-semibold rounded-lg hover:from-[#00c97b] hover:to-teal-600 transition-all duration-300 cursor-pointer text-sm"
            >
              Done
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inputValue.trim() ? (
            suggestions.length > 0 ? (
              <div className="p-5">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Locations in Ibadan ({suggestions.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                          {suggestion.type === "search" ? (
                            <FontAwesomeIcon 
                              icon={faSearch} 
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
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              suggestion.type === "search" 
                                ? "text-purple-600 bg-purple-50" 
                                : "text-blue-600 bg-blue-50"
                            }`}>
                              {suggestion.type === "search" ? "Search" : "Location"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-100">
                        <span className="text-sm text-blue-600 font-medium">Tap to select</span>
                        <FontAwesomeIcon icon={faChevronRight} className="ml-1 text-blue-600" size="sm" />
                      </div>
                    </button>
                  ))}
                </div>
                {/* This button just closes the modal now */}
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full mt-6 p-4 bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:from-[#00c97b] hover:to-teal-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-base font-medium">Close and enter search manually</p>
                      <p className="text-sm text-gray-100 mt-1">Click "Find {activeCategory}" button to search</p>
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
                <h3 className="text-xl font-medium text-gray-900 mb-3">No matching locations</h3>
                <p className="text-gray-600 text-center max-w-sm mb-8">
                  Try a different location name or search term
                </p>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-semibold rounded-lg hover:from-[#00c97b] hover:to-teal-600 cursor-pointer transition-all duration-300"
                >
                  Close and search manually
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Search Ibadan locations</h3>
              <p className="text-gray-600 text-center max-w-sm mb-10">
                Find {activeCategory.toLowerCase()}s in any area of Ibadan
              </p>
              <div className="w-full max-w-md px-4">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">Popular locations in Ibadan</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {["Akobo", "Bodija", "Sango", "UI", "Mokola", "Dugbe", "Ringroad", "Challenge", "Iwo Road", "Agodi"].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setInputValue(term);
                        onTyping(term);
                        inputRef.current?.focus();
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer transition-all duration-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    Select a location, then click "Find {activeCategory}" button to search
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ---------------- DESKTOP SEARCH SUGGESTIONS ---------------- */
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick, // This just sets the search query
  onClose,
  isVisible,
  searchBarPosition,
  activeCategory,
}) => {
  const suggestionsRef = useRef(null);
  
  const allIbadanLocations = useMemo(() => {
    const locationsFromListings = listingService.getLocationsFromListings(listings);
    const allLocations = [
      'Akobo', 'Bodija', 'Dugbe', 'Mokola', 'Sango', 'UI', 'Poly',  'Agodi',
      'Jericho', 'Gbagi', 'Apata', 'Ringroad', 'Secretariat', 'Moniya', 'Challenge',
      'Molete', 'Agbowo', 'Sabo', 'Bashorun',  'Ife Road',
      'Akinyele',  'Mokola Hill', 'Sango Roundabout',
      'Iwo Road', 'Gate', 'New Garage', 'Old Ife Road',
      ...locationsFromListings
    ];
    
    return [...new Set(allLocations)].sort();
  }, [listings]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const queryLower = searchQuery.toLowerCase().trim();
    const suggestions = [];
    
    const locationMatches = allIbadanLocations
      .filter((location) => {
        const displayName = location.toLowerCase();
        return displayName.includes(queryLower) || 
               normalizeLocation(location).includes(normalizeLocation(queryLower));
      })
      .map((location) => ({
        type: "location",
        title: getLocationDisplayName(location),
        description: `${activeCategory}s in ${getLocationDisplayName(location)}, Ibadan`,
      }));

    // Also add a "Search for 'query'" option
    if (locationMatches.length === 0 && searchQuery.trim()) {
      suggestions.push({
        type: "search",
        title: `Search for "${searchQuery}"`,
        description: `Find ${activeCategory.toLowerCase()}s matching "${searchQuery}" in Ibadan`,
      });
    }

    return locationMatches
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === queryLower;
        const bExact = b.title.toLowerCase() === queryLower;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
      })
      .slice(0, 8);
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

  if (!isVisible || !searchQuery.trim()) return null;

  return (
    <>
      <div className="fixed inset-0 bg-transparent z-[9980]" onClick={onClose} />
      <div
        ref={suggestionsRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 z-[9981] overflow-hidden"
        style={{
          left: `${searchBarPosition?.left || 0}px`,
          top: `${(searchBarPosition?.top || 0) + 50}px`,
          width: `${searchBarPosition?.width || 0}px`,
          maxHeight: "70vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500 text-sm" />
              <span className="text-sm font-medium text-gray-700">Search locations in Ibadan</span>
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
            {suggestions.length > 0 ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 mb-2">
                    Showing {suggestions.length} location{suggestions.length !== 1 ? 's' : ''} in Ibadan
                  </p>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Just set the search query and close suggestions
                      onSuggestionClick(suggestion);
                      onClose();
                    }}
                    className="w-full text-left p-3 bg-white hover:bg-gray-50 rounded-lg mb-1 last:mb-0 cursor-pointer group transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                        {suggestion.type === "search" ? (
                          <FontAwesomeIcon 
                            icon={faSearch} 
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
                          <span className={`text-xs px-2 py-1 rounded ${
                            suggestion.type === "search" 
                              ? "text-purple-600 bg-purple-50" 
                              : "text-blue-600 bg-blue-50"
                          }`}>
                            {suggestion.type === "search" ? "Search" : "Location"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.description}</p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 text-sm group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
                <div className="px-3 py-3 mt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Select a location to add to search, then click "Find {activeCategory}" button to search
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">No matches found for "{searchQuery}"</p>
                <p className="text-xs text-gray-500">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------------- CALENDAR COMPONENT ---------------- */
const SimpleCalendar = ({ onSelect, onClose, selectedDate: propSelectedDate, isCheckOut = false }) => {
  const modalRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(propSelectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());

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
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer
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
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
            ←
          </button>
          <h3 className="font-semibold text-gray-800">{getMonthName(currentDate)}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
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
              const today = new Date();
              setSelectedDate(today);
              onSelect(today);
              onClose();
            }}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Select Today
          </button>
        </div>
      </div>
    </>
  );
};

/* ---------------- GUEST SELECTOR COMPONENT ---------------- */
const GuestSelector = ({ guests, onChange, onClose, category = 'hotel' }) => {
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
        <h3 className="font-semibold text-gray-800 mb-6 text-center">
          {category.includes('restaurant') ? 'Number of People' : 'Guests & Rooms'}
        </h3>
        
        {!category.includes('restaurant') && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="font-medium text-gray-800">Rooms</div>
              <div className="text-sm text-gray-500">Number of rooms</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGuestChange("rooms", -1)}
                disabled={guests.rooms <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronLeft} size="sm" />
              </button>
              <span className="w-8 text-center font-medium">{guests.rooms}</span>
              <button
                onClick={() => handleGuestChange("rooms", 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <FontAwesomeIcon icon={faChevronRight} size="sm" />
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="font-medium text-gray-800">Adults</div>
            <div className="text-sm text-gray-500">Age 18+</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleGuestChange("adults", -1)}
              disabled={guests.adults <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.adults}</span>
            <button
              onClick={() => handleGuestChange("adults", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
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
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="sm" />
            </button>
            <span className="w-8 text-center font-medium">{guests.children}</span>
            <button
              onClick={() => handleGuestChange("children", 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
            >
              <FontAwesomeIcon icon={faChevronRight} size="sm" />
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600">Total {category.includes('restaurant') ? 'People' : 'Guests'}</div>
            <div className="text-xl font-bold text-blue-600">{totalGuests}</div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium cursor-pointer"
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
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Enter Search Term
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
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
  const [showEmptySearchModal, setShowEmptySearchModal] = useState(false);

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchButtonRef = useRef(null);
  const { listings = [], loading } = useBackendListings();

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

  // Handle suggestion click: ONLY sets query and closes modal, NO navigation
  const handleSuggestionClick = useCallback((suggestion) => {
    if (suggestion && suggestion.title) {
      const searchValue = suggestion.title;
      setSearchQuery(searchValue);
      setShowSuggestions(false);
      setShowMobileModal(false);
      
      // Focus on the search input after setting value
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) {
      setShowEmptySearchModal(true);
      return;
    }
    
    // Normalize the location for SEO-friendly URL
    const locationToUse = searchQuery.trim();
    const normalizedLocation = looksLikeLocation(locationToUse) 
      ? normalizeLocationForBackend(locationToUse)
      : null;
    
    const categorySlug = getCategorySlug(activeTab);
    const locationSlug = normalizedLocation ? createSlug(locationToUse) : null;
    
    let seoPath = '';
    
    // Create SEO-friendly URL with location
    if (categorySlug && locationSlug && looksLikeLocation(locationToUse)) {
      seoPath = `/${categorySlug}-in-${locationSlug}`;
    } else if (categorySlug) {
      seoPath = `/${categorySlug}`;
    } else if (locationSlug) {
      seoPath = `/places-in-${locationSlug}`;
    } else {
      seoPath = '/search';
    }
    
    const queryParams = new URLSearchParams();
    
    const checkInToUse = checkInDate || new Date();
    const checkOutToUse = checkOutDate || new Date(new Date().setDate(newDate().getDate() + 1));
    
    queryParams.append("checkInDate", checkInToUse.toISOString());
    queryParams.append("checkOutDate", checkOutToUse.toISOString());
    
    if (guests) {
      queryParams.append("guests", JSON.stringify(guests));
    }
    
    // Add location as search query parameter
    queryParams.append("q", searchQuery.trim());
    queryParams.append("cat", activeTab);
    
    // ADD THIS: If it looks like a location, also add it as location filter
    if (looksLikeLocation(searchQuery.trim())) {
      const properCaseLocation = normalizeLocationForBackend(searchQuery.trim());
      queryParams.append("location", properCaseLocation);
      console.log('📍 Hero: Adding location filter:', properCaseLocation);
    }
    
    const finalUrl = queryParams.toString() 
      ? `${seoPath}?${queryParams.toString()}`
      : seoPath;
    
    console.log("🔍 Hero: Navigating to SEO-friendly URL:", finalUrl);
    navigate(finalUrl);
    
    setShowSuggestions(false);
    setShowMobileModal(false);
  }, [activeTab, searchQuery, navigate, checkInDate, checkOutDate, guests]);

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
    if (!isMobile && value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
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
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCheckOutDate(nextDay);
    setShowCheckInCalendar(true);
  };

  const handleGuestClick = () => setShowGuestSelector(true);

  const handleCheckInSelect = (date) => {
    setCheckInDate(date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setCheckOutDate(nextDay);
  };

  const handleGuestsChange = (newGuests) => {
    setGuests(newGuests);
  };

  const handleTabClick = (category) => {
    setActiveTab(category);
    setSearchQuery("");
    setShowSuggestions(false);
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

  const totalPeople = guests.adults + guests.children;

  const handleSearchButtonClick = () => {
    handleSearchSubmit();
  };

  return (
    <div className="min-h-[50%] bg-[#F7F7FA] font-manrope pt-15 md:pt-16">
      <style>{glassStyles}</style>
      
      <section className="pt-14 lg:pt-12 text-center glass-background overflow-hidden relative">
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

            {/* TABS */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              <div className="flex justify-between items-center gap-2 p-2.5 bg-white rounded-lg border border-[#f7f7fa] shadow-sm">
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

            {/* SEARCH BAR WITH GLASS EFFECT */}
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              <div ref={searchContainerRef} className="relative w-full floating">
                <div className="glass-pronounced rounded-xl sm:rounded-2xl border border-white/40 p-3 sm:p-3 md:p-4 shadow-2xl">
                  {/* Search Input */}
                  <div className="mb-2 sm:mb-3">
                    <div className="glass-dark rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-200/30 cursor-pointer transition-all duration-300">
                      <FontAwesomeIcon icon={faSearch} className="text-gray-500 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={handleSearchFocus}
                        onKeyPress={handleKeyPress}
                        placeholder={getSearchPlaceholder()}
                        className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-500 text-xs min-w-0 cursor-text"
                      />
                      {searchQuery && (
                        <button
                          onClick={handleClearSearch}
                          className="text-gray-900 hover:text-gray-600 flex-shrink-0 ml-1 cursor-pointer"
                        >
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
                        className="glass-dark rounded-lg p-2 text-center hover:bg-gray-200/30 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> Check-in
                        </div>
                        <div className="text-xs font-medium text-blue-600">{formatDateLabel(checkInDate)}</div>
                      </div>
                      <div
                        onClick={handleCheckOutClick}
                        className="glass-dark rounded-lg p-2 text-center hover:bg-gray-200/30 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
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
                        className="glass-dark rounded-lg p-2 text-center hover:bg-gray-200/30 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> When are you visiting?
                        </div>
                        <div className="text-xs font-medium text-blue-600">{formatDateLabel(checkInDate)}</div>
                      </div>
                      <div
                        onClick={handleGuestClick}
                        className="glass-dark rounded-lg p-2 text-center hover:bg-gray-200/30 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
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
                        className="glass-dark rounded-lg p-2 text-center hover:bg-gray-200/30 cursor-pointer transition-all duration-300"
                      >
                        <div className="text-xs text-gray-900 flex items-center justify-center gap-1 mb-0.5">
                          <FontAwesomeIcon icon={faCalendarAlt} className="text-sm" /> Preferred service date (optional)
                        </div>
                        <div className="text-xs font-medium text-blue-600">{formatDateLabel(checkInDate)}</div>
                      </div>
                    </div>
                  ) : null}

                  {/* Guest Selector */}
                  {(activeTab === "Hotel" || activeTab === "Shortlet" || activeTab === "Restaurant") && (
                    <div className="mb-2 w-full">
                      <div
                        onClick={handleGuestClick}
                        className="glass-dark inline-flex w-full items-center justify-center rounded-[10px] px-4 py-2 text-[12.5px] font-medium text-gray-900 hover:bg-gray-200/30 cursor-pointer transition-all duration-300"
                      >
                        {activeTab !== "Restaurant" && (
                          <>
                            <FontAwesomeIcon icon={faBed} className="mr-1 text-sm" />
                            <span>{guests.rooms} {guests.rooms === 1 ? "Room" : "Rooms"}</span>
                            <span className="mx-1">•</span>
                          </>
                        )}
                        {activeTab === "Restaurant" ? (
                          <>
                            <FontAwesomeIcon icon={faUser} className="mr-1 text-sm" />
                            <span>{totalPeople} {totalPeople === 1 ? "person" : "people"}</span>
                          </>
                        ) : (
                          <>
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

                  {/* Search Button - THIS IS THE "FIND X" BUTTON THAT TRIGGERS NAVIGATION */}
                  <div className="w-full">
                    <button
                      ref={searchButtonRef}
                      onClick={handleSearchButtonClick}
                      className={`w-full bg-gradient-to-r from-[#00E38C] to-teal-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 glowing hover:from-[#00c97b] hover:to-teal-600`}
                    >
                      <FontAwesomeIcon icon={faSearch} className="text-sm" />
                      <span className="text-xs">
                        {getSearchButtonText()}
                      </span>
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
          selectedDate={checkInDate}
        />
      )}
      {showGuestSelector && (
        <GuestSelector
          guests={guests}
          onChange={handleGuestsChange}
          onClose={() => setShowGuestSelector(false)}
          category={activeTab.toLowerCase()}
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
        .animate-slideInUp { animation: slideInUp 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .glass-background::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: -1;
        }
      `}</style>
    </div>
  );
};

export default DiscoverIbadan;