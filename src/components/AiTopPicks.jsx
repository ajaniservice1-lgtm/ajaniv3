import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faSearch } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle,
  FaTruck,
  FaCalendarCheck,
  FaWhatsapp,
  FaUser
} from "react-icons/fa";

// ---------------- Vendor Modal Component ----------------
const VendorModal = ({ vendor, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    // Trap focus inside modal for accessibility
    const handleTabKey = (e) => {
      if (!isOpen) return;
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'auto'; // Keep pointer events enabled
      
      // Focus the close button when modal opens
      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector('button[aria-label="Close modal"]');
        closeButton?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
      document.body.style.pointerEvents = 'auto';
    };
  }, [isOpen, onClose]);

  // Prevent closing when clicking inside modal
  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop (not on any modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent closing when clicking on image or any content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Glassy Blur Background - Now clickable to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="vendor-modal-backdrop"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px) saturate(180%)',
          WebkitBackdropFilter: 'blur(8px) saturate(180%)',
        }}
        onClick={handleBackdropClick} // Only closes when clicking directly on backdrop
      />

      {/* Modal Container */}
      <div 
        className="vendor-modal-container"
        onClick={handleBackdropClick} // Also closes when clicking container
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            duration: 0.25, 
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.25 },
            y: { duration: 0.25 }
          }}
          className="vendor-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleModalClick} // Prevent closing when clicking modal content
        >
          {/* Close Button - Only way to close via clicking */}
          <button
            onClick={onClose}
            className="vendor-modal-close-btn"
            aria-label="Close modal"
          >
            <IoClose className="text-2xl text-gray-700" />
          </button>

          {/* Modal Content with proper scrolling */}
          <div 
            ref={contentRef}
            className="vendor-modal-scroll"
            onClick={handleModalClick} // Prevent closing when scrolling/clicking content
          >
            <div className="relative" onClick={handleModalClick}>
              <div className="h-56 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" onClick={handleModalClick} />
              <div className="absolute -bottom-16 left-8 lg:left-12" onClick={handleModalClick}>
                <div className="relative" onClick={handleModalClick}>
                  <img
                    src={vendor.image_url}
                    alt={vendor.fullName}
                    className="vendor-modal-avatar"
                    onClick={handleModalClick} // Explicitly prevent closing on image click
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/160/DDDDDD/808080?text=No+Image";
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-green-200" onClick={handleModalClick}>
                    <VscVerifiedFilled className="text-2xl text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-10 pt-24 lg:pt-28" onClick={handleModalClick}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10" onClick={handleModalClick}>
                <div className="flex-1" onClick={handleModalClick}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4" onClick={handleModalClick}>
                    <h2 id="modal-title" className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {vendor.fullName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Verified Vendor
                      </span>
                      {vendor.years_experience && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {vendor.years_experience} years experience
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-600 mb-4">
                    {vendor.category} • {vendor.service_type}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-black text-lg"
                      />
                      <span className="font-bold text-gray-900 text-xl">
                        {vendor.rating}
                      </span>
                      <span className="text-gray-500">
                        ({vendor.review_count} reviews)
                      </span>
                    </div>
                    <span className="text-gray-300 hidden lg:inline">•</span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCheckCircle className="text-green-500" />
                      <span>{vendor.completedProjects || 0} projects completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4" onClick={handleModalClick}>
                  <button className="vendor-modal-action-btn primary">
                    <FaEnvelope />
                    Contact Vendor
                  </button>
                  <button className="vendor-modal-action-btn secondary">
                    <FaCalendarCheck />
                    Book Now
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10" onClick={handleModalClick}>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="vendor-modal-stat-card"
                >
                  <p className="text-sm text-gray-600 mb-2">Completed Projects</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.completedProjects || 0}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="vendor-modal-stat-card"
                >
                  <p className="text-sm text-gray-600 mb-2">Repeat Clients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.repeatClients || 85}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">High retention rate</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="vendor-modal-stat-card"
                >
                  <p className="text-sm text-gray-600 mb-2">Satisfaction Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.satisfactionRate || 96}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">Excellent feedback</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="vendor-modal-stat-card"
                >
                  <p className="text-sm text-gray-600 mb-2">Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.response_time || "1-4 hours"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Typically responds</p>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8" onClick={handleModalClick}>
                <div className="lg:col-span-2 space-y-8" onClick={handleModalClick}>
                  <div className="vendor-modal-section">
                    <h3 className="vendor-modal-section-title">
                      <span className="vendor-modal-section-indicator"></span>
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {vendor.description || "No description available."}
                    </p>
                    
                    {vendor.description && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Why choose this vendor:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-1" />
                            <span>Professional and reliable service</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-1" />
                            <span>Competitive pricing with transparent quotes</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-1" />
                            <span>High-quality workmanship and attention to detail</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="vendor-modal-section">
                    <h3 className="vendor-modal-section-title">
                      <span className="vendor-modal-section-indicator"></span>
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(vendor.services || [vendor.service_type || "Service"]).map((service, index) => (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                          className="vendor-modal-service-tag"
                        >
                          {service}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="vendor-modal-section">
                    <h3 className="vendor-modal-section-title">
                      <span className="vendor-modal-section-indicator"></span>
                      Specialties & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(vendor.specialties || ["General Services"]).map((specialty, index) => (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                          className="vendor-modal-specialty-tag"
                        >
                          {specialty}
                        </motion.span>
                      ))}
                    </div>
                    
                    {(vendor.certifications && vendor.certifications.length > 0) && (
                      <div className="mt-8">
                        <h4 className="font-semibold text-gray-900 mb-4">Certifications:</h4>
                        <div className="flex flex-wrap gap-3">
                          {vendor.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="vendor-modal-certification-tag"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8" onClick={handleModalClick}>
                  <div className="vendor-modal-contact-card">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Contact & Details
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="vendor-modal-contact-icon">
                          <FaMapMarkerAlt className="text-[#06EAFC] text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900">
                            {vendor.location}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {vendor.activeWithin || `Within 15 km of ${vendor.location?.split(",")[0] || "your location"}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="vendor-modal-contact-icon">
                          <span className="font-bold text-[#06EAFC]">BN</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Business Name</p>
                          <p className="font-semibold text-gray-900">
                            {vendor.businessName || vendor.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Hourly Rate</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {vendor.price_range || "₦5,000 - ₦10,000"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Minimum Order</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {vendor.minOrder || "₦15,000"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="vendor-modal-contact-icon">
                          <FaClock className="text-[#06EAFC] text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Business Hours</p>
                          <p className="font-semibold text-gray-900">
                            {vendor.businessHours || "8:00 AM - 10:00 PM"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-2 h-2 rounded-full
                              ${vendor.deliveryAvailable ? 'bg-green-500' : 'bg-gray-300'}
                            `} />
                            <span className="text-gray-700">Delivery Available</span>
                          </div>
                          {vendor.deliveryAvailable ? (
                            <FaTruck className="text-green-500" />
                          ) : (
                            <span className="text-gray-400 text-sm">Not available</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-2 h-2 rounded-full
                              ${vendor.onlineBookings ? 'bg-green-500' : 'bg-gray-300'}
                            `} />
                            <span className="text-gray-700">Online Bookings</span>
                          </div>
                          {vendor.onlineBookings ? (
                            <FaCalendarCheck className="text-green-500" />
                          ) : (
                            <span className="text-gray-400 text-sm">Not available</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <FaEnvelope className="text-gray-400" />
                            <span className="text-gray-700">{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaPhone className="text-gray-400" />
                            <span className="text-gray-700">{vendor.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="vendor-modal-section">
                    <h4 className="font-semibold text-gray-900 mb-4">Languages</h4>
                    <div className="space-y-2">
                      {(vendor.languages || ["English (Native)", "Yoruba (Fluent)"]).map((language, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="vendor-modal-language-indicator"></div>
                          <span className="text-gray-700">{language}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

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

// ---------------- Filter Bar Component ----------------
const FilterBar = ({
  selectedDistrict,
  setSelectedDistrict,
  verifiedOnly,
  setVerifiedOnly,
  districts,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
      {/* Filter controls can be added here */}
    </div>
  );
};

// ---------------- Vendor Card Component ----------------
const VendorCard = ({ venue, index }) => {
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Use the exact same data structure as VendorsPage
  const vendorData = {
    id: venue.id,
    name: venue.name,
    service_type: venue.service_type,
    description: venue.description,
    rating: venue.rating || "4.9",
    review_count: venue.review_count || "128",
    image_url: venue.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    district: venue.district,
    location: venue.location || "Ibadan",
    is_verified: venue.is_verified || "TRUE",
    is_available: venue.is_available || "TRUE",
    years_experience: venue.years_experience || "5+",
    phone: venue.phone || "+234 801 234 5678",
    email: venue.email || `${venue.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
    category: venue.category || "Services",
    fullName: venue.name,
    completedProjects: venue.completed_projects || 128,
    repeatClients: 85,
    satisfactionRate: 96,
    response_time: venue.response_time || "1-4 hours",
    activeWithin: `Within 15 km of ${venue.district || "Ibadan"}`,
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: [venue.service_type || "Service"],
    specialties: ["Professional Service", "Quality Workmanship"],
    certifications: ["Verified Vendor"],
    businessName: venue.name,
    price_range: venue.price_range || "₦5,000 - ₦10,000",
    minOrder: "₦15,000",
    businessHours: "8:00 AM - 10:00 PM",
    deliveryAvailable: true,
    onlineBookings: true,
    workType: venue.service_type
  };

  const handleViewVendor = () => {
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        whileHover={{
          y: -6,
          scale: 1.01,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12), 0 5px 10px rgba(0, 0, 0, 0.08)",
          transition: { 
            duration: 0.15,
            ease: "easeInOut" 
          }
        }}
        className="vendor-card"
        onClick={handleViewVendor}
      >
        <div className="vendor-card-content">
          <div className="vendor-card-header">
            <div className="vendor-avatar-container">
              <div className="vendor-avatar">
                <img
                  src={venue.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face"}
                  alt={venue.name}
                  className="vendor-avatar-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80/DDDDDD/808080?text=No+Image";
                  }}
                />
              </div>
              
              <div className="vendor-verified-badge">
                <VscVerifiedFilled className="text-green-500 text-sm" />
              </div>
            </div>

            <div className="vendor-info">
              <div className="vendor-name-rating">
                <h3 className="vendor-name">
                  {venue.name}
                </h3>
                
                <div className="vendor-rating">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-black text-sm"
                  />
                  <span className="rating-value">
                    {venue.rating || "4.9"}
                  </span>
                </div>
              </div>

              <div className="vendor-category">
                <span className="category-text">
                  {venue.service_type || venue.category || "Service Provider"}
                </span>
              </div>

              <div className="vendor-location">
                <FaMapMarkerAlt className="location-icon" />
                <span className="location-text">
                  {venue.district || venue.location || "Ibadan"}
                </span>
              </div>

            </div>
          </div>
          
          <div className="vendor-description">
            <p className="description-text">
              {venue.description || 
                `Professional ${venue.service_type?.toLowerCase() || "service"} with ${
                  venue.years_experience || "5+"
                } years experience.`}
            </p>
          </div>
          
          <div className="vendor-actions">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              className="vendor-view-btn"
            >
              <FaUser className="text-black text-sm" />
              View Details
            </motion.button>
          </div>
        </div>
      </motion.div>

      <VendorModal
        vendor={vendorData}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

// ---------------- Skeleton Loading Component ----------------
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-content">
      <div className="skeleton-header">
        <div className="skeleton-avatar-container">
          <div className="skeleton-avatar"></div>
        </div>

        <div className="skeleton-info">
          <div className="skeleton-name-rating">
            <div className="skeleton-name"></div>
            <div className="skeleton-rating">
              <div className="skeleton-star"></div>
              <div className="skeleton-rating-value"></div>
            </div>
          </div>

          <div className="skeleton-category"></div>

          <div className="skeleton-location">
            <div className="skeleton-location-icon"></div>
            <div className="skeleton-location-text"></div>
          </div>

          <div className="skeleton-description">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      </div>
      
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
      </div>
    </div>
  </div>
);

// ---------------- Main AiTopPicks Component ----------------
const AiTopPicks = () => {
  const navigate = useNavigate();
  const [headerRef, headerInView] = useInView({ threshold: 0.1 });
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const getInitialCounts = () => {
    if (typeof window === "undefined") {
      return { mobile: 4, desktop: 6 };
    }
    const isMobile = window.innerWidth < 1024;
    return {
      mobile: 4,
      desktop: 6,
      isMobile,
    };
  };

  const [initialCounts] = useState(getInitialCounts());
  const [isMobile, setIsMobile] = useState(initialCounts.isMobile);
  const [visibleCount] = useState(
    initialCounts.isMobile ? initialCounts.mobile : initialCounts.desktop
  );

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialCounts]);

  const SHEET_ID = "1GK10i6VZnZ3I-WVHs1yOrj2WbaByp00UmZ2k3oqb8_8";
  const API_KEY = "AIzaSyCELfgRKcAaUeLnInsvenpXJRi2kSSwS3E";

  const {
    data: venues = [],
    loading,
    error,
  } = useGoogleSheet(SHEET_ID, API_KEY);

  // Use the exact same demo data as VendorsPage
  const demoVenues = [
    {
      id: "1",
      name: "AJ Plumbing Services",
      service_type: "Plumber",
      description: "Professional plumber with 10+ years experience. Available 24/7 for emergencies.",
      rating: "4.9",
      review_count: "234",
      image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      district: "Bodija",
      location: "Bodija, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      years_experience: "10",
      phone: "+234 801 234 5678",
      email: "aj.plumbing@example.com",
      category: "Services",
      completed_projects: "247",
      response_time: "1-4 hours",
      price_range: "₦1,500 - ₦5,000"
    },
    {
      id: "2",
      name: "Bright Electric Solutions",
      service_type: "Electrician",
      description: "Certified electrician for residential and commercial electrical works.",
      rating: "4.8",
      review_count: "189",
      image_url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop&crop=face",
      district: "Mokola",
      location: "Mokola, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      years_experience: "8",
      phone: "+234 802 345 6789",
      email: "bright.electric@example.com",
      category: "Services",
      completed_projects: "189",
      response_time: "1-4 hours",
      price_range: "₦4,000 - ₦8,000"
    },
    {
      id: "3",
      name: "Taste of Yoruba Catering",
      service_type: "Caterer",
      description: "Authentic Yoruba cuisine for weddings, parties and corporate events.",
      rating: "4.7",
      review_count: "156",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      district: "Dugbe",
      location: "Dugbe, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      years_experience: "5",
      phone: "+234 803 456 7890",
      email: "yoruba.taste@example.com",
      category: "Food",
      completed_projects: "156",
      response_time: "1-4 hours",
      price_range: "₦3,000 - ₦6,000"
    },
    {
      id: "4",
      name: "AutoFix Mechanics",
      service_type: "Mechanic",
      description: "Expert car repair and maintenance services with warranty.",
      rating: "4.6",
      review_count: "142",
      image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=400&fit=crop&crop=face",
      district: "Iwo Road",
      location: "Iwo Road, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      years_experience: "7",
      phone: "+234 804 567 8901",
      email: "autofix@example.com",
      category: "Automotive",
      completed_projects: "142",
      response_time: "1-4 hours",
      price_range: "₦5,000 - ₦12,000"
    },
    {
      id: "5",
      name: "Elegant Events Planning",
      service_type: "Event Planner",
      description: "Complete event planning and coordination services.",
      rating: "4.9",
      review_count: "201",
      image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
      district: "Sango",
      location: "Sango, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      years_experience: "12",
      phone: "+234 805 678 9012",
      email: "elegant.events@example.com",
      category: "Events",
      completed_projects: "201",
      response_time: "1-4 hours",
      price_range: "₦8,000 - ₦20,000"
    },
    {
      id: "6",
      name: "Glamour Makeup Studio",
      service_type: "Makeup Artist",
      description: "Professional makeup for weddings, photoshoots and special occasions.",
      rating: "4.8",
      review_count: "178",
      image_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop&crop=face",
      district: "UI Area",
      location: "UI Area, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      years_experience: "6",
      phone: "+234 806 789 0123",
      email: "glamour.makeup@example.com",
      category: "Beauty",
      completed_projects: "178",
      response_time: "1-4 hours",
      price_range: "₦5,000 - ₦15,000"
    },
  ];

  const displayVenues = venues.length > 0 ? venues : demoVenues;

  const filteredVenues = displayVenues.filter((venue) => {
    const matchesLocation =
      !selectedDistrict || venue.location === selectedDistrict;
    const matchesVerified = !verifiedOnly || venue.is_verified === "TRUE";

    return matchesLocation && matchesVerified;
  });

  const visibleVenues = filteredVenues.slice(0, visibleCount);

  const handleViewAll = () => {
    navigate('/vendors');
  };

  if (loading) {
    return (
      <section className="vendor-section" id="toppicks">
        <div className="container">
          <div className="section-header">
            <div className="header-content">
              <h1 className="section-title">
                Verified Vendors
              </h1>
              <p className="section-description">
                Trusted businesses reviewed and approved for quality and reliability.
              </p>
            </div>
            
            <div className="skeleton-button-large"></div>
          </div>

          <div className="vendors-grid">
            {[...Array(visibleCount)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
        
        {/* Add CSS styles */}
        <style jsx>{`
          ${vendorModalStyles}
        `}</style>
      </section>
    );
  }

  if (error) {
    return (
      <section className="error-section">
        <div className="error-content">{error}</div>
      </section>
    );
  }

  return (
    <>
      <section className="vendor-section" id="toppicks">
        <div className="container">
          <div ref={headerRef} className="mb-2 lg:mb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="section-header"
            >
              <div className="header-content">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="section-title"
                >
                  Verified Vendors
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="section-description"
                >
                  Trusted businesses reviewed and approved for quality and reliability.
                </motion.p>
              </div>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={
                  headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.2, duration: 0.3 }}
                onClick={handleViewAll}
                className="view-all-btn"
              >
                View All Vendors →
              </motion.button>
            </motion.div>
          </div>

          <div className={`vendors-grid ${isMobile ? 'mobile' : 'desktop'}`}>
            {visibleVenues.map((venue, index) => (
              <VendorCard key={venue.id} venue={venue} index={index} />
            ))}
          </div>

          {filteredVenues.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-state-content">
                <h3 className="empty-state-title">
                  No vendors found
                </h3>
                <p className="empty-state-text">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Add CSS styles */}
      <style jsx>{`
        ${vendorModalStyles}
        
        .vendor-section {
          background-color: white;
          padding: 2rem 1rem;
        }
        
        @media (min-width: 1024px) {
          .vendor-section {
            padding: 3rem 2rem;
          }
        }
        
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .section-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        @media (min-width: 1024px) {
          .section-header {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 2rem;
          }
        }
        
        .header-content {
          flex: 1;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        @media (min-width: 768px) {
          .section-title {
            text-align: left;
          }
        }
        
        @media (min-width: 1024px) {
          .section-title {
            font-size: 1.75rem;
          }
        }
        
        .section-description {
          color: #6b7280;
          font-size: 0.875rem;
          max-width: 48rem;
          margin-bottom: 1rem;
          line-height: 1.625;
          text-align: center;
        }
        
        @media (min-width: 768px) {
          .section-description {
            text-align: left;
            font-size: 1rem;
          }
        }
        
        .view-all-btn {
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
          color: black;
          width: 100%;
          text-align: center;
          font-weight: 500;
        }
        
        @media (min-width: 1024px) {
          .view-all-btn {
            width: auto;
          }
        }
        
        .view-all-btn:hover {
          transform: translateY(-2px);
        }
        
        .vendors-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 3rem;
        }
        
        .vendors-grid.mobile {
          grid-template-columns: 1fr;
        }
        
        .vendors-grid.desktop {
          grid-template-columns: 1fr;
        }
        
        @media (min-width: 768px) {
          .vendors-grid.desktop {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .vendors-grid.desktop {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 0;
          cursor: default;
        }
        
        .empty-state-content {
          background-color: #f9fafb;
          border-radius: 1rem;
          padding: 3rem;
          max-width: 28rem;
          margin: 0 auto;
        }
        
        .empty-state-title {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 1rem;
          font-weight: bold;
        }
        
        .empty-state-text {
          color: #6b7280;
          font-size: 1.125rem;
        }
        
        .skeleton-button-large {
          background-color: #06EAFC;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          width: 8rem;
          height: 3rem;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </>
  );
};

// CSS Styles - UPDATED
const vendorModalStyles = `
  /* Modal Backdrop - Now ONLY closes when clicking directly on backdrop */
  .vendor-modal-backdrop {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px) saturate(180%);
    -webkit-backdrop-filter: blur(8px) saturate(180%);
    cursor: pointer;
  }

  /* Modal Container */
  .vendor-modal-container {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    cursor: pointer;
    overflow-y: auto;
  }

  /* Modal Content - FIXED SCROLLING */
  .vendor-modal-content {
    position: relative;
    background-color: white;
    border-radius: 1.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 72rem;
    max-height: 85vh; /* Reduced to allow modal to fit */
    overflow: hidden;
    border: 1px solid rgba(229, 231, 235, 0.5);
    isolation: isolate;
    cursor: default; /* Reset cursor for content area */
    margin: auto; /* Center vertically */
  }

  /* Close Button - Only way to close via clicking */
  .vendor-modal-close-btn {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    border-radius: 9999px;
    padding: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    z-index: 10;
    cursor: pointer;
    border: 1px solid rgba(209, 213, 219, 0.5);
  }

  .vendor-modal-close-btn:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    background-color: white;
    border-color: rgba(156, 163, 175, 0.4);
  }

  .vendor-modal-close-btn:focus {
    outline: none;
    box-shadow: 0 0 0 2px #06EAFC, 0 0 0 4px rgba(6, 234, 252, 0.5);
  }

  /* Scrollable Content - FIXED SCROLLING */
  .vendor-modal-scroll {
    overflow-y: auto;
    max-height: 85vh; /* Match parent height */
    cursor: default; /* Prevent closing when scrolling */
  }

  /* Avatar */
  .vendor-modal-avatar {
    width: 8rem;
    height: 8rem;
    border-radius: 9999px;
    border-width: 4px;
    border-color: white;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    object-fit: cover;
    background-color: white;
    cursor: default; /* Prevent closing on image click */
  }

  @media (min-width: 1024px) {
    .vendor-modal-avatar {
      width: 10rem;
      height: 10rem;
    }
  }

  /* Action Buttons */
  .vendor-modal-action-btn {
    padding: 0.75rem 2rem;
    border-radius: 0.75rem;
    transition: all 0.15s;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    border: 1px solid;
  }

  .vendor-modal-action-btn:focus {
    outline: none;
  }

  .vendor-modal-action-btn.primary {
    background-color: #06EAFC;
    color: black;
    border-color: #06EAFC;
  }

  .vendor-modal-action-btn.primary:hover {
    background-color: #6cf5ff;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .vendor-modal-action-btn.primary:focus {
    box-shadow: 0 0 0 2px #06EAFC, 0 0 0 4px rgba(6, 234, 252, 0.5);
  }

  .vendor-modal-action-btn.secondary {
    background-color: white;
    color: #1f2937;
    border-color: #d1d5db;
  }

  .vendor-modal-action-btn.secondary:hover {
    background-color: #f9fafb;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .vendor-modal-action-btn.secondary:focus {
    box-shadow: 0 0 0 2px #d1d5db, 0 0 0 4px rgba(209, 213, 219, 0.5);
  }

  /* Stat Cards */
  .vendor-modal-stat-card {
    background-color: #f9fafb;
    padding: 1.5rem;
    border-radius: 1rem;
    border: 1px solid #e5e7eb;
    transition: all 0.15s;
    cursor: default;
  }

  .vendor-modal-stat-card:hover {
    border-color: #06EAFC;
  }

  /* Sections */
  .vendor-modal-section {
    background-color: white;
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    cursor: default;
  }

  .vendor-modal-section-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .vendor-modal-section-indicator {
    width: 0.25rem;
    height: 1.5rem;
    background-color: #06EAFC;
    border-radius: 9999px;
  }

  /* Tags */
  .vendor-modal-service-tag {
    padding: 0.75rem 1.25rem;
    background: linear-gradient(to right, rgba(6, 234, 252, 0.1), rgba(219, 234, 254, 0.1));
    color: #374151;
    border-radius: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(6, 234, 252, 0.3);
    transition: all 0.15s;
    cursor: default;
  }

  .vendor-modal-service-tag:hover {
    border-color: #06EAFC;
  }

  .vendor-modal-specialty-tag {
    padding: 0.75rem 1.25rem;
    background: linear-gradient(to right, rgba(240, 253, 244, 0.5), rgba(240, 253, 244, 0.5));
    color: #374151;
    border-radius: 0.75rem;
    font-weight: 600;
    border: 1px solid rgba(134, 239, 172, 0.3);
    transition: all 0.15s;
    cursor: default;
  }

  .vendor-modal-specialty-tag:hover {
    border-color: rgba(134, 239, 172, 0.6);
  }

  .vendor-modal-certification-tag {
    padding: 0.5rem 1rem;
    background-color: #fefce8;
    color: #92400e;
    border-radius: 0.5rem;
    font-weight: 500;
    border: 1px solid #fef08a;
    font-size: 0.875rem;
  }

  /* Contact Card */
  .vendor-modal-contact-card {
    background: linear-gradient(to bottom right, #f9fafb, white);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    cursor: default;
  }

  .vendor-modal-contact-icon {
    padding: 0.5rem;
    background-color: rgba(6, 234, 252, 0.2);
    border-radius: 0.5rem;
  }

  /* Language Indicator */
  .vendor-modal-language-indicator {
    width: 0.5rem;
    height: 0.5rem;
    background-color: #06EAFC;
    border-radius: 9999px;
  }

  /* Vendor Card Styles */
  .vendor-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border-radius: 1rem;
    width: 100%;
    max-width: 24rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 280px;
    transition: all 0.15s;
  }

  .vendor-card:hover {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), 0 5px 10px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  .vendor-card-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .vendor-card-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .vendor-avatar-container {
    position: relative;
    flex-shrink: 0;
  }

  .vendor-avatar {
    width: 5rem;
    height: 5rem;
    border-radius: 9999px;
    overflow: hidden;
    border: 2px solid #e5e7eb;
  }

  .vendor-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.15s;
  }

  .vendor-avatar-image:hover {
    transform: scale(1.05);
  }

  .vendor-verified-badge {
    position: absolute;
    top: -0.25rem;
    right: -0.25rem;
    background-color: white;
    border-radius: 9999px;
    padding: 0.25rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #d1fae5;
  }

  .vendor-info {
    flex: 1;
    min-width: 0;
  }

  .vendor-name-rating {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .vendor-name {
    font-size: 1.25rem;
    font-weight: bold;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.15s;
  }

  .vendor-name:hover {
    color: #4b5563;
  }

  .vendor-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .rating-value {
    font-weight: bold;
    color: #111827;
    font-size: 0.875rem;
  }

  .vendor-category {
    margin-bottom: 0.5rem;
  }

  .category-text {
    color: #6b7280;
    font-weight: 500;
    font-size: 0.875rem;
  }

  .vendor-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .location-icon {
    color: #9ca3af;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .location-text {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .vendor-description {
    flex: 1;
  }

  .description-text {
    color: #4b5563;
    line-height: 1.625;
    font-size: 0.875rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .vendor-actions {
    margin-top: auto;
    padding-top: 1rem;
  }

  .vendor-view-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: white;
    color: black;
    font-weight: bold;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    transition: all 0.1s;
    border: 2px solid #d1d5db;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .vendor-view-btn:hover {
    background-color: #f9fafb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border-color: #9ca3af;
  }

  /* Skeleton Styles */
  .skeleton-card {
    background-color: white;
    border: 1px solid #e5e7eb;
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    width: 100%;
    max-width: 24rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 280px;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .skeleton-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .skeleton-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
    flex-shrink: 0;
  }

  .skeleton-avatar-container {
    position: relative;
    flex-shrink: 0;
  }

  .skeleton-avatar {
    width: 5rem;
    height: 5rem;
    border-radius: 9999px;
    background-color: #d1d5db;
  }

  .skeleton-info {
    flex: 1;
    min-width: 0;
  }

  .skeleton-name-rating {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .skeleton-name {
    height: 1.5rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
    width: 6rem;
  }

  .skeleton-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .skeleton-star {
    width: 1rem;
    height: 1rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
  }

  .skeleton-rating-value {
    width: 1.5rem;
    height: 1rem;
    background-color: #d1d5db;
    border-radius: 0.25rem;
  }

  .skeleton-category {
    height: 1rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
    width: 4rem;
    margin-bottom: 0.5rem;
  }

  .skeleton-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .skeleton-location-icon {
    width: 1rem;
    height: 1rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
  }

  .skeleton-location-text {
    width: 5rem;
    height: 1rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
  }

  .skeleton-description {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .skeleton-line {
    height: 0.75rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
  }

  .skeleton-line:nth-child(1) {
    width: 100%;
  }

  .skeleton-line:nth-child(2) {
    width: 83.333333%;
  }

  .skeleton-line:nth-child(3) {
    width: 66.666667%;
  }

  .skeleton-actions {
    margin-top: auto;
    padding-top: 1rem;
  }

  .skeleton-button {
    width: 100%;
    height: 3rem;
    background-color: #d1d5db;
    border-radius: 0.5rem;
  }

  /* Error Section */
  .error-section {
    padding: 4rem 0;
    text-align: center;
    color: #ef4444;
  }

  .error-content {
    font-size: 1.125rem;
    font-weight: 500;
  }
`;

export default AiTopPicks;