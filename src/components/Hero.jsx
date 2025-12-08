// Hero.jsx - Complete fixed component
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faChevronDown,
  faMapMarkerAlt,
  faFilter,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { createPortal } from "react-dom";

// Direct image imports
import hotelImg from "../assets/Logos/hotel.jpg";
import tourismImg from "../assets/Logos/tourism.jpg";
import eventsImg from "../assets/Logos/events.jpg";
import restuarantImg from "../assets/Logos/restuarant.jpg";

// FALLBACK IMAGES
const FALLBACK_IMAGES = {
  Hotel:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&q=80",
  Restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80",
  Shortlet:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&q=80",
  Tourism:
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&q=80",
};

// Helper function to fetch Google Sheet data
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
            .map((row, index) => {
              const obj = {};
              headers.forEach((h, i) => {
                obj[h?.toString().trim() || `col_${i}`] = (row[i] || "")
                  .toString()
                  .trim();
              });
              obj.id = obj.id || `item-${index}`;
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

// Helper function to safely get image source
const getCategoryImage = (category, fallback) => {
  try {
    switch (category) {
      case "Hotel":
        return hotelImg;
      case "Tourism":
        return tourismImg;
      case "Shortlet":
        return eventsImg;
      case "Restaurant":
        return restuarantImg;
      default:
        return fallback;
    }
  } catch (error) {
    console.log(`Error loading ${category} image:`, error);
    return fallback;
  }
};

// Helper functions for search
const getCategoryDisplayName = (category) => {
  if (!category || category === "All Categories") return "All Categories";

  const parts = category.split(".");
  if (parts.length > 1) {
    const afterDot = parts.slice(1).join(".").trim();
    return afterDot
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getLocationDisplayName = (location) => {
  if (!location) return "All Locations";

  const parts = location.split(".");
  if (parts.length > 1) {
    const afterDot = parts.slice(1).join(".").trim();
    return afterDot
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return location
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to get location breakdown
const getLocationBreakdown = (listings) => {
  const locationCounts = {};
  listings.forEach((item) => {
    const location = getLocationDisplayName(item.area || "Unknown");
    locationCounts[location] = (locationCounts[location] || 0) + 1;
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
};

// Helper function to get category breakdown by location
const getCategoryBreakdownByLocation = (listings) => {
  const categoryCounts = {};
  listings.forEach((item) => {
    const category = getCategoryDisplayName(item.category || "other.other");
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Mobile Fullscreen Search Modal Component
const MobileSearchModal = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  onTyping,
  isVisible,
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Generate suggestions based on search query
  const suggestions = useMemo(() => {
    if (!inputValue.trim() || !listings.length) return [];

    const query = inputValue.toLowerCase().trim();
    const suggestions = [];

    // Get unique categories and locations
    const uniqueCategories = [
      ...new Set(
        listings
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== "")
          .map((cat) => cat.trim())
      ),
    ];

    const uniqueLocations = [
      ...new Set(
        listings
          .map((item) => item.area)
          .filter((loc) => loc && loc.trim() !== "")
          .map((loc) => loc.trim())
      ),
    ];

    // Category suggestions
    const categoryMatches = uniqueCategories
      .filter((category) => {
        const displayName = getCategoryDisplayName(category).toLowerCase();
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );
        const locationBreakdown = getLocationBreakdown(categoryListings);

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          locations: locationBreakdown,
          action: () => {
            const params = new URLSearchParams();
            params.append("category", category);
            return `/search-results?${params.toString()}`;
          },
        };
      })
      .sort((a, b) => b.count - a.count);

    // Location suggestions
    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = getLocationDisplayName(location).toLowerCase();
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );
        const categoryBreakdown =
          getCategoryBreakdownByLocation(locationListings);

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          categories: categoryBreakdown,
          action: () => {
            const params = new URLSearchParams();
            params.append("location", location);
            return `/search-results?${params.toString()}`;
          },
        };
      })
      .sort((a, b) => b.count - a.count);

    // Combine and sort by relevance
    return [...categoryMatches, ...locationMatches]
      .sort((a, b) => {
        // Exact matches first
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Starts with query
        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Then by count
        return b.count - a.count;
      })
      .slice(0, 6);
  }, [inputValue, listings]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onTyping(value);
  };

  // Handle clear input
  const handleClearInput = () => {
    setInputValue("");
    onTyping("");
    inputRef.current?.focus();
  };

  // Handle suggestion click
  const handleSuggestionClick = (action) => {
    onSuggestionClick(action);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      const params = new URLSearchParams();
      params.append("q", inputValue.trim());
      onSuggestionClick(`/search-results?${params.toString()}`);
    }
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isVisible]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Prevent body scroll when modal is open - FIXED VERSION
  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isVisible]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="mobile-fullscreen-modal"
        style={{
          animation: "slideInUp 0.3s ease-out",
        }}
      >
        {/* Modal Header with Search Bar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            zIndex: 9999999,
          }}
        >
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              {/* Spacer for alignment */}
              <div style={{ width: "80px" }}></div>
            </div>

            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                borderRadius: "9999px",
                padding: "8px 16px",
                transition: "all 0.2s",
                border: "2px solid transparent",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Back button/icon */}
              <button
                onClick={onClose}
                style={{
                  color: "#4b5563",
                  fontWeight: "500",
                  padding: "2px",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                aria-label="Go back"
              >
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  style={{ fontSize: "14px" }}
                />
              </button>
              <input
                ref={inputRef}
                type="text"
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  marginLeft: "12px",
                  padding: "8px 0",
                  outline: "none",
                  border: "none",
                  fontSize: "16px",
                  fontFamily: "'Manrope', sans-serif",
                  color: "#111827",
                  caretColor: "#06EAFC",
                }}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search by area, category, or name..."
                autoFocus
              />
              {inputValue && (
                <button
                  onClick={handleClearInput}
                  style={{
                    color: "#6b7280",
                    padding: "4px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e5e7eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  aria-label="Clear search"
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    style={{ width: "16px", height: "16px" }}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            paddingBottom: "20px",
          }}
        >
          {inputValue.trim() ? (
            <>
              {/* Suggestions Header */}
              <div
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #f3f4f6",
                  backgroundColor: "#f9fafb",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#4b5563",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Quick search suggestions
                  </span>
                  {suggestions.length > 0 && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        backgroundColor: "#f3f4f6",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {suggestions.length} suggestions
                    </span>
                  )}
                </div>
              </div>

              {/* Suggestions List */}
              {suggestions.length > 0 ? (
                <div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "16px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        borderBottom: "1px solid #f3f4f6",
                        position: "relative",
                      }}
                      onClick={() => handleSuggestionClick(suggestion.action())}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f0f9ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              backgroundColor:
                                suggestion.type === "category"
                                  ? "#dbeafe"
                                  : "#dcfce7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <FontAwesomeIcon
                              icon={
                                suggestion.type === "category"
                                  ? faFilter
                                  : faMapMarkerAlt
                              }
                              style={{
                                fontSize: "16px",
                                color:
                                  suggestion.type === "category"
                                    ? "#2563eb"
                                    : "#16a34a",
                              }}
                            />
                          </div>
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <h3
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                  color: "#111827",
                                }}
                              >
                                {suggestion.title}
                              </h3>
                              <span
                                style={{
                                  fontSize: "11px",
                                  backgroundColor:
                                    suggestion.type === "category"
                                      ? "#dbeafe"
                                      : "#dcfce7",
                                  color:
                                    suggestion.type === "category"
                                      ? "#1e40af"
                                      : "#166534",
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                  fontWeight: "600",
                                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                                }}
                              >
                                {suggestion.count}{" "}
                                {suggestion.count === 1 ? "place" : "places"}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginTop: "4px",
                              }}
                            >
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            color: "#9ca3af",
                            transition: "all 0.2s",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            style={{ fontSize: "14px" }}
                          />
                        </div>
                      </div>

                      {/* Location or Category breakdown */}
                      {suggestion.type === "category" &&
                        suggestion.locations &&
                        suggestion.locations.length > 0 && (
                          <div
                            style={{ marginLeft: "52px", marginTop: "12px" }}
                          >
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "6px",
                                fontWeight: "500",
                              }}
                            >
                              Available in these areas:
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                              }}
                            >
                              {suggestion.locations
                                .slice(0, 5)
                                .map((loc, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      fontSize: "11px",
                                      backgroundColor: "#eff6ff",
                                      color: "#1d4ed8",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      border: "1px solid #dbeafe",
                                      fontWeight: "500",
                                      boxShadow:
                                        "0 1px 2px rgba(0, 0, 0, 0.05)",
                                    }}
                                  >
                                    {loc.location} ({loc.count})
                                  </span>
                                ))}
                              {suggestion.locations.length > 5 && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    backgroundColor: "#f3f4f6",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  +{suggestion.locations.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      {suggestion.type === "location" &&
                        suggestion.categories &&
                        suggestion.categories.length > 0 && (
                          <div
                            style={{ marginLeft: "52px", marginTop: "12px" }}
                          >
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginBottom: "6px",
                                fontWeight: "500",
                              }}
                            >
                              Places include:
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                              }}
                            >
                              {suggestion.categories
                                .slice(0, 5)
                                .map((cat, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      fontSize: "11px",
                                      backgroundColor: "#f0fdf4",
                                      color: "#166534",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      border: "1px solid #dcfce7",
                                      fontWeight: "500",
                                      boxShadow:
                                        "0 1px 2px rgba(0, 0, 0, 0.05)",
                                    }}
                                  >
                                    {cat.category} ({cat.count})
                                  </span>
                                ))}
                              {suggestion.categories.length > 5 && (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    backgroundColor: "#f3f4f6",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  +{suggestion.categories.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                      <div
                        style={{
                          marginLeft: "52px",
                          marginTop: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#2563eb",
                            fontWeight: "600",
                          }}
                        >
                          Tap to view all results
                        </span>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          style={{
                            fontSize: "10px",
                            color: "#2563eb",
                            marginLeft: "4px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{
                        width: "32px",
                        height: "32px",
                        color: "#9ca3af",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "8px",
                    }}
                  >
                    No matches found
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      maxWidth: "280px",
                      lineHeight: "1.5",
                    }}
                  >
                    Try searching with different keywords or browse categories
                  </p>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{
                    width: "40px",
                    height: "40px",
                    color: "#9ca3af",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "12px",
                }}
              >
                Start typing to search
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  maxWidth: "280px",
                  lineHeight: "1.5",
                  marginBottom: "24px",
                }}
              >
                Search for categories, locations, or places in Ibadan
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                  maxWidth: "300px",
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

// Desktop Search Suggestions Component
const DesktopSearchSuggestions = ({
  searchQuery,
  listings,
  onSuggestionClick,
  onClose,
  isVisible,
}) => {
  const suggestionsRef = useRef(null);

  // Generate suggestions (same logic as mobile)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !listings.length) return [];

    const query = searchQuery.toLowerCase().trim();
    const suggestions = [];

    // Get unique categories and locations
    const uniqueCategories = [
      ...new Set(
        listings
          .map((item) => item.category)
          .filter((cat) => cat && cat.trim() !== "")
          .map((cat) => cat.trim())
      ),
    ];

    const uniqueLocations = [
      ...new Set(
        listings
          .map((item) => item.area)
          .filter((loc) => loc && loc.trim() !== "")
          .map((loc) => loc.trim())
      ),
    ];

    // Category suggestions
    const categoryMatches = uniqueCategories
      .filter((category) => {
        const displayName = getCategoryDisplayName(category).toLowerCase();
        return displayName.includes(query);
      })
      .map((category) => {
        const categoryListings = listings.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );
        const locationBreakdown = getLocationBreakdown(categoryListings);

        return {
          type: "category",
          title: getCategoryDisplayName(category),
          count: categoryListings.length,
          description: `Search ${
            categoryListings.length
          } ${getCategoryDisplayName(category).toLowerCase()} places`,
          locations: locationBreakdown,
          action: () => {
            const params = new URLSearchParams();
            params.append("category", category);
            return `/search-results?${params.toString()}`;
          },
        };
      })
      .sort((a, b) => b.count - a.count);

    // Location suggestions
    const locationMatches = uniqueLocations
      .filter((location) => {
        const displayName = getLocationDisplayName(location).toLowerCase();
        return displayName.includes(query);
      })
      .map((location) => {
        const locationListings = listings.filter(
          (item) =>
            item.area && item.area.toLowerCase() === location.toLowerCase()
        );
        const categoryBreakdown =
          getCategoryBreakdownByLocation(locationListings);

        return {
          type: "location",
          title: getLocationDisplayName(location),
          count: locationListings.length,
          description: `Search ${
            locationListings.length
          } places in ${getLocationDisplayName(location)}`,
          categories: categoryBreakdown,
          action: () => {
            const params = new URLSearchParams();
            params.append("location", location);
            return `/search-results?${params.toString()}`;
          },
        };
      })
      .sort((a, b) => b.count - a.count);

    // Combine and sort by relevance
    return [...categoryMatches, ...locationMatches]
      .sort((a, b) => {
        const aExact = a.title.toLowerCase() === query;
        const bExact = b.title.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStartsWith = a.title.toLowerCase().startsWith(query);
        const bStartsWith = b.title.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        return b.count - a.count;
      })
      .slice(0, 6);
  }, [searchQuery, listings]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !searchQuery.trim() || suggestions.length === 0)
    return null;

  return createPortal(
    <>
      {/* Backdrop for desktop */}
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{
          cursor: "pointer",
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Suggestions Modal */}
      <div
        ref={suggestionsRef}
        className="desktop-modal"
        style={{
          width: "90%",
          maxWidth: "600px",
          animation: "scaleIn 0.3s ease-out",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#4b5563",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Search Suggestions
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#6b7280",
                backgroundColor: "#f0f0f0",
                padding: "4px 10px",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              {suggestions.length} suggestions
            </span>
          </div>
        </div>

        <div
          style={{
            maxHeight: "calc(70vh - 57px)",
            overflowY: "auto",
            padding: "4px 0",
            backgroundColor: "#ffffff",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              style={{
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.2s",
                borderBottom: "1px solid #f9f9f9",
                position: "relative",
                backgroundColor: "#ffffff",
              }}
              onClick={() => onSuggestionClick(suggestion.action())}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8fbff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ffffff")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor:
                        suggestion.type === "category" ? "#e6f0ff" : "#e6f7ed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        suggestion.type === "category"
                          ? faFilter
                          : faMapMarkerAlt
                      }
                      style={{
                        fontSize: "18px",
                        color:
                          suggestion.type === "category"
                            ? "#2563eb"
                            : "#16a34a",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "4px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#111827",
                        }}
                      >
                        {suggestion.title}
                      </h3>
                      <span
                        style={{
                          fontSize: "12px",
                          backgroundColor:
                            suggestion.type === "category"
                              ? "#e6f0ff"
                              : "#e6f7ed",
                          color:
                            suggestion.type === "category"
                              ? "#1e40af"
                              : "#166534",
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontWeight: "600",
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        {suggestion.count}{" "}
                        {suggestion.count === 1 ? "place" : "places"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                      }}
                    >
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    color: "#9ca3af",
                    transition: "all 0.2s",
                    marginTop: "4px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              {/* Location or Category breakdown */}
              {suggestion.type === "category" &&
                suggestion.locations &&
                suggestion.locations.length > 0 && (
                  <div style={{ marginLeft: "58px", marginTop: "14px" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Available in these areas:
                    </p>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {suggestion.locations.slice(0, 6).map((loc, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: "11px",
                            backgroundColor: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            border: "1px solid #dbeafe",
                            fontWeight: "500",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {loc.location} ({loc.count})
                        </span>
                      ))}
                      {suggestion.locations.length > 6 && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            backgroundColor: "#f0f0f0",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            fontWeight: "500",
                          }}
                        >
                          +{suggestion.locations.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

              {suggestion.type === "location" &&
                suggestion.categories &&
                suggestion.categories.length > 0 && (
                  <div style={{ marginLeft: "58px", marginTop: "14px" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "8px",
                        fontWeight: "500",
                      }}
                    >
                      Places include:
                    </p>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {suggestion.categories.slice(0, 6).map((cat, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: "11px",
                            backgroundColor: "#f0fdf4",
                            color: "#166534",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            border: "1px solid #dcfce7",
                            fontWeight: "500",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          {cat.category} ({cat.count})
                        </span>
                      ))}
                      {suggestion.categories.length > 6 && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            backgroundColor: "#f0f0f0",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            fontWeight: "500",
                          }}
                        >
                          +{suggestion.categories.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

              <div
                style={{
                  marginLeft: "58px",
                  marginTop: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  Click to view all results
                </span>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  style={{
                    fontSize: "10px",
                    color: "#2563eb",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "#fafafa",
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            Press{" "}
            <span
              style={{
                fontWeight: "600",
                backgroundColor: "#e5e7eb",
                padding: "2px 6px",
                borderRadius: "4px",
                margin: "0 2px",
              }}
            >
              ESC
            </span>{" "}
            to close • Click any suggestion to view details
          </p>
        </div>
      </div>
    </>,
    document.body
  );
};

// Main Hero Component
const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const searchInputRef = useRef(null);

  const SHEET_ID = "1ZUU4Cw29jhmSnTh1yJ_ZoQB7TN1zr2_7bcMEHP8O1_Y";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const { data: listings = [], loading } = useGoogleSheet(SHEET_ID, API_KEY);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append("q", searchQuery.trim());
      navigate(`/search-results?${params.toString()}`);
      setShowSuggestions(false);
      setShowMobileModal(false);
    }
  }, [searchQuery, navigate]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    },
    [handleSearchSubmit]
  );

  const handleSuggestionClick = useCallback(
    (url) => {
      navigate(url);
      setShowSuggestions(false);
      setShowMobileModal(false);
      setSearchQuery("");
    },
    [navigate]
  );

  // FIXED: Handle search change properly
  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);
      // Show suggestions when typing on desktop (not mobile)
      if (!isMobile && value.trim().length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [isMobile]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  // Handle mobile search click - opens fullscreen modal
  const handleMobileSearchClick = useCallback(() => {
    if (isMobile) {
      setShowMobileModal(true);
    }
  }, [isMobile]);

  // Handle search input focus - FIXED
  const handleSearchFocus = useCallback(() => {
    if (isMobile) {
      handleMobileSearchClick();
    } else if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [isMobile, searchQuery, handleMobileSearchClick]);

  const handleCategoryClick = (category) => {
    const categoryMap = {
      Hotel: "hotel",
      Restaurant: "restaurant",
      Shortlet: "shortlet",
      Tourism: "tourist-center",
    };
    const categorySlug = categoryMap[category];
    if (categorySlug) {
      navigate(`/category/${categorySlug}`);
    }
  };

  return (
    <>
      <section
        id="hero"
        className="bg-[#F7F7FA] font-rubik overflow-hidden min-h-[30vh] sm:min-h-[30vh] flex items-start relative cursor-default"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 w-full cursor-default">
          <div
            ref={heroRef}
            className="flex flex-col items-center text-center gap-2 sm:gap-3 pt-0 sm:pt-2 pb-2 sm:pb-4 cursor-default"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ margin: "-100px", once: false }}
              className="flex flex-col justify-start space-y-2 sm:space-y-3 max-w-xl sm:max-w-2xl w-full cursor-default"
            >
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-manrope font-bold text-[#101828] leading-tight mt-1 sm:mt-2 px-2 cursor-default">
                Discover Ibadan through AI & Local Stories
              </h1>
              <p className="text-xs sm:text-sm leading-[1.3] text-slate-600 mb-2 sm:mb-4 font-manrope max-w-lg mx-auto px-4 cursor-default">
                Your all-in-one local guide for hotels, food, events, vendors,
                and market prices.
              </p>

              {/* Search Bar with Suggestions */}
              <div className="relative mx-auto w-full max-w-md px-2 cursor-default">
                <div className="flex items-center cursor-default">
                  <div
                    className="flex items-center bg-gray-200 rounded-full shadow-sm w-full relative"
                    ref={searchInputRef}
                    onClick={isMobile ? handleMobileSearchClick : undefined}
                  >
                    <div className="pl-3 sm:pl-4 text-gray-500 cursor-default">
                      <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by area, category, or name..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={handleSearchFocus}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-transparent py-2.5 px-3 text-sm text-gray-800 outline-none placeholder:text-gray-600 font-manrope cursor-pointer"
                      autoFocus={false}
                      aria-label="Search input"
                      role="searchbox"
                      readOnly={isMobile}
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="p-1 mr-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                        aria-label="Clear search"
                      >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="ml-2">
                    <button
                      onClick={handleSearchSubmit}
                      className="bg-[#06EAFC] hover:bg-[#0be4f3] font-semibold rounded-full py-2.5 px-4 sm:px-6 text-sm transition-colors duration-200 whitespace-nowrap font-manrope cursor-pointer"
                      aria-label="Perform search"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Desktop Search Suggestions */}
                {!isMobile &&
                  showSuggestions &&
                  searchQuery.trim().length > 0 && (
                    <DesktopSearchSuggestions
                      searchQuery={searchQuery}
                      listings={listings}
                      onSuggestionClick={handleSuggestionClick}
                      onClose={() => setShowSuggestions(false)}
                      isVisible={showSuggestions && !loading}
                    />
                  )}

                <motion.div
                  className="text-center mt-1 cursor-default"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: searchQuery ? 1 : 0,
                    y: searchQuery ? 0 : 10,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xs text-gray-500 font-manrope cursor-default">
                    Press Enter or click Search to find results
                  </p>
                </motion.div>
              </div>

              {/* Category Icons */}
              <div className="flex justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 overflow-hidden px-2 cursor-default">
                {["Hotel", "Tourism", "Shortlet", "Restaurant"].map(
                  (category) => (
                    <motion.div
                      key={category}
                      className="text-center cursor-pointer group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <div className="relative">
                        <img
                          src={getCategoryImage(
                            category,
                            FALLBACK_IMAGES[category]
                          )}
                          alt={category}
                          className="w-10 h-10 rounded-lg overflow-hidden sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover group-hover:brightness-110 group-hover:shadow-md transition-all duration-200 cursor-pointer"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGES[category];
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 cursor-pointer"></div>
                      </div>
                      <p className="mt-0.5 text-[10px] sm:text-xs font-medium text-gray-700 group-hover:text-[#06EAFC] transition-colors duration-200 cursor-pointer">
                        {category}
                      </p>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Fullscreen Search Modal */}
      {isMobile && (
        <MobileSearchModal
          searchQuery={searchQuery}
          listings={listings}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowMobileModal(false)}
          onTyping={handleSearchChange}
          isVisible={showMobileModal}
        />
      )}
    </>
  );
};

export default Hero;
