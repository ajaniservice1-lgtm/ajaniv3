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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check if device is touch-enabled on mount
  useEffect(() => {
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    checkTouchDevice();
  }, []);

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
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
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
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      document.body.style.height = 'auto';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside - Only on backdrop
  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop (not on any modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent closing when clicking inside modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Glassy Blur Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}
        onClick={handleBackdropClick}
      />

      {/* Modal Container - Increased size for both mobile and lg */}
      <div 
        className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-3 lg:p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="
            bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl
            w-full max-w-7xl h-[95vh] lg:h-[92vh]
            overflow-hidden
            relative
            border border-gray-200
            mx-1 sm:mx-0
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleModalClick}
        >
          {/* Close Button - Positioned for larger modal */}
          <button
            onClick={onClose}
            className="
              absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4
              bg-white/90 backdrop-blur-sm
              rounded-full p-2 sm:p-2.5 lg:p-3
              shadow-lg hover:shadow-xl
              hover:bg-white
              transition-all duration-200
              z-10
              cursor-pointer
              border border-gray-300/50
              hover:border-gray-400
              focus:outline-none
              focus:ring-2 focus:ring-[#06EAFC] focus:ring-offset-2
            "
            aria-label="Close modal"
          >
            <IoClose className="text-xl sm:text-2xl text-gray-700" />
          </button>

          {/* Modal Content with increased height */}
          <div 
            ref={contentRef}
            className="overflow-y-auto h-full"
          >
            <div className="relative">
              <div className="h-40 sm:h-48 lg:h-56 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
              <div className="absolute -bottom-10 sm:-bottom-12 lg:-bottom-16 left-3 sm:left-4 lg:left-6">
                <div className="relative">
                  <img
                    src={vendor.image_url}
                    alt={vendor.fullName}
                    className="
                      w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32
                      rounded-full
                      border-4 border-white
                      shadow-2xl
                      object-cover
                      bg-white
                    "
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/160/DDDDDD/808080?text=No+Image";
                    }}
                  />
                  <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 lg:-top-2 lg:-right-2 bg-white rounded-full p-1 sm:p-1 lg:p-1.5 shadow-lg border border-green-200">
                    <VscVerifiedFilled className="text-base sm:text-lg lg:text-2xl text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 pt-16 sm:pt-20 lg:pt-24">
              {/* Header Section - Reduced text sizes for lg */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                    <h2 id="modal-title" className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                      {vendor.fullName}
                    </h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm lg:text-sm font-semibold">
                        Verified Vendor
                      </span>
                      {vendor.years_experience && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm lg:text-sm font-semibold">
                          {vendor.years_experience} years experience
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-3 lg:mb-4">
                    {vendor.category} • {vendor.service_type}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mt-2 sm:mt-3 lg:mt-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-black text-sm sm:text-base lg:text-lg"
                      />
                      <span className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">
                        {vendor.rating}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm lg:text-base">
                        ({vendor.review_count} reviews)
                      </span>
                    </div>
                    <span className="text-gray-300 hidden lg:inline">•</span>
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2 text-gray-600 text-xs sm:text-sm lg:text-base">
                      <FaCheckCircle className="text-green-500 text-sm sm:text-base" />
                      <span>{vendor.completedProjects || 0} projects completed</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Reduced size for lg */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-0">
                  <button 
                    className="
                      px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3
                      bg-[#06EAFC] hover:bg-[#6cf5ff]
                      text-black
                      rounded-lg sm:rounded-lg lg:rounded-xl
                      transition-all duration-150
                      font-semibold
                      cursor-pointer
                      flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3
                      hover:shadow-lg
                      border border-[#06EAFC]
                      focus:outline-none
                      focus:ring-2 focus:ring-[#06EAFC] focus:ring-offset-2
                      text-xs sm:text-sm lg:text-base
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${vendor.email}`;
                    }}
                  >
                    <FaEnvelope className="text-xs sm:text-sm lg:text-base" />
                    <span className="whitespace-nowrap">Contact Vendor</span>
                  </button>
                  <button 
                    className="
                      px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3
                      bg-white text-gray-800
                      rounded-lg sm:rounded-lg lg:rounded-xl
                      hover:bg-gray-50
                      transition-all duration-150
                      font-semibold
                      cursor-pointer
                      flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3
                      hover:shadow-lg
                      border border-gray-300
                      focus:outline-none
                      focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                      text-xs sm:text-sm lg:text-base
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add booking logic here
                    }}
                  >
                    <FaCalendarCheck className="text-xs sm:text-sm lg:text-base" />
                    <span className="whitespace-nowrap">Book Now</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid - Compact for lg */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <motion.div 
                  whileHover={isTouchDevice ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-150 cursor-default"
                >
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-600 mb-1 sm:mb-1.5 lg:mb-2">Completed Projects</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {vendor.completedProjects || 0}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={isTouchDevice ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-150 cursor-default"
                >
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-600 mb-1 sm:mb-1.5 lg:mb-2">Repeat Clients</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {vendor.repeatClients || 85}%
                  </p>
                  <p className="text-xs text-green-600 mt-0.5 sm:mt-0.5 lg:mt-1">High retention rate</p>
                </motion.div>
                <motion.div 
                  whileHover={isTouchDevice ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-150 cursor-default"
                >
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-600 mb-1 sm:mb-1.5 lg:mb-2">Satisfaction Rate</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {vendor.satisfactionRate || 96}%
                  </p>
                  <p className="text-xs text-green-600 mt-0.5 sm:mt-0.5 lg:mt-1">Excellent feedback</p>
                </motion.div>
                <motion.div 
                  whileHover={isTouchDevice ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.1 }}
                  className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-150 cursor-default"
                >
                  <p className="text-xs sm:text-sm lg:text-sm text-gray-600 mb-1 sm:mb-1.5 lg:mb-2">Response Time</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {vendor.response_time || "1-4 hours"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-0.5 lg:mt-1">Typically responds</p>
                </motion.div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Left Column - About & Services */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* About Section */}
                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-3 sm:h-4 lg:h-6 bg-[#06EAFC] rounded-full"></span>
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-base">
                      {vendor.description || "No description available."}
                    </p>
                    
                    {vendor.description && (
                      <div className="mt-3 sm:mt-4 lg:mt-5">
                        <h4 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3 text-sm sm:text-base lg:text-base">Why choose this vendor:</h4>
                        <ul className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                          <li className="flex items-start gap-1.5 sm:gap-2 lg:gap-3">
                            <FaCheckCircle className="text-green-500 mt-0.5 sm:mt-0.5 lg:mt-1 text-xs sm:text-sm lg:text-base" />
                            <span className="text-xs sm:text-sm lg:text-base">Professional and reliable service</span>
                          </li>
                          <li className="flex items-start gap-1.5 sm:gap-2 lg:gap-3">
                            <FaCheckCircle className="text-green-500 mt-0.5 sm:mt-0.5 lg:mt-1 text-xs sm:text-sm lg:text-base" />
                            <span className="text-xs sm:text-sm lg:text-base">Competitive pricing with transparent quotes</span>
                          </li>
                          <li className="flex items-start gap-1.5 sm:gap-2 lg:gap-3">
                            <FaCheckCircle className="text-green-500 mt-0.5 sm:mt-0.5 lg:mt-1 text-xs sm:text-sm lg:text-base" />
                            <span className="text-xs sm:text-sm lg:text-base">High-quality workmanship and attention to detail</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Services Offered */}
                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-3 sm:h-4 lg:h-6 bg-[#06EAFC] rounded-full"></span>
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
                      {(vendor.services || [vendor.service_type || "Service"]).map((service, index) => (
                        <motion.span
                          key={index}
                          whileHover={isTouchDevice ? {} : { scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                          className="
                            px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2
                            bg-gradient-to-r from-[#06EAFC]/10 to-blue-50
                            text-gray-700
                            rounded-md sm:rounded-lg lg:rounded-xl
                            font-semibold
                            border border-[#06EAFC]/30
                            hover:border-[#06EAFC]
                            transition-all duration-150
                            cursor-default
                            text-xs sm:text-sm lg:text-sm
                          "
                        >
                          {service}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Specialties & Expertise */}
                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-3 sm:h-4 lg:h-6 bg-[#06EAFC] rounded-full"></span>
                      Specialties & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
                      {(vendor.specialties || ["General Services"]).map((specialty, index) => (
                        <motion.span
                          key={index}
                          whileHover={isTouchDevice ? {} : { scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                          className="
                            px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2
                            bg-gradient-to-r from-green-50 to-teal-50
                            text-gray-700
                            rounded-md sm:rounded-lg lg:rounded-xl
                            font-semibold
                            border border-green-200
                            hover:border-green-300
                            transition-all duration-150
                            cursor-default
                            text-xs sm:text-sm lg:text-sm
                          "
                        >
                          {specialty}
                        </motion.span>
                      ))}
                    </div>
                    
                    {(vendor.certifications && vendor.certifications.length > 0) && (
                      <div className="mt-3 sm:mt-4 lg:mt-5">
                        <h4 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3 text-sm sm:text-base lg:text-base">Certifications:</h4>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
                          {vendor.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="
                                px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1
                                bg-yellow-50 text-yellow-800
                                rounded sm:rounded-md lg:rounded-lg
                                font-medium
                                border border-yellow-200
                                text-xs
                                cursor-default
                              "
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Contact & Details */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 shadow-sm cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-5">
                      Contact & Details
                    </h3>

                    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                      <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="p-1.5 sm:p-1.5 lg:p-2 bg-[#06EAFC]/20 rounded-lg flex-shrink-0">
                          <FaMapMarkerAlt className="text-[#06EAFC] text-sm sm:text-base lg:text-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm lg:text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                            {vendor.location}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 sm:mt-0.5 lg:mt-1">
                            {vendor.activeWithin || `Within 15 km of ${vendor.location?.split(",")[0] || "your location"}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="p-1.5 sm:p-1.5 lg:p-2 bg-[#06EAFC]/20 rounded-lg flex-shrink-0">
                          <span className="font-bold text-[#06EAFC] text-xs sm:text-sm lg:text-base">BN</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm lg:text-sm text-gray-600">Business Name</p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                            {vendor.businessName || vendor.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm lg:text-sm text-gray-600">Hourly Rate</p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">
                            {vendor.price_range || "₦5,000 - ₦10,000"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm lg:text-sm text-gray-600">Minimum Order</p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg">
                            {vendor.minOrder || "₦15,000"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="p-1.5 sm:p-1.5 lg:p-2 bg-[#06EAFC]/20 rounded-lg flex-shrink-0">
                          <FaClock className="text-[#06EAFC] text-sm sm:text-base lg:text-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm lg:text-sm text-gray-600">Business Hours</p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">
                            {vendor.businessHours || "8:00 AM - 10:00 PM"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                            <div className={`
                              w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
                              ${vendor.deliveryAvailable ? 'bg-green-500' : 'bg-gray-300'}
                            `} />
                            <span className="text-gray-700 text-xs sm:text-sm lg:text-base">Delivery Available</span>
                          </div>
                          {vendor.deliveryAvailable ? (
                            <FaTruck className="text-green-500 text-sm sm:text-base lg:text-lg" />
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">Not available</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                            <div className={`
                              w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
                              ${vendor.onlineBookings ? 'bg-green-500' : 'bg-gray-300'}
                            `} />
                            <span className="text-gray-700 text-xs sm:text-sm lg:text-base">Online Bookings</span>
                          </div>
                          {vendor.onlineBookings ? (
                            <FaCalendarCheck className="text-green-500 text-sm sm:text-base lg:text-lg" />
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">Not available</span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2.5 sm:pt-3 lg:pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3 text-sm sm:text-base lg:text-base">Contact Information</h4>
                        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                            <FaEnvelope className="text-gray-400 text-xs sm:text-sm lg:text-base" />
                            <span className="text-gray-700 text-xs sm:text-sm lg:text-base truncate">{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                            <FaPhone className="text-gray-400 text-xs sm:text-sm lg:text-base" />
                            <span className="text-gray-700 text-xs sm:text-sm lg:text-base">{vendor.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-base">Languages</h4>
                    <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                      {(vendor.languages || ["English (Native)", "Yoruba (Fluent)"]).map((language, index) => (
                        <div key={index} className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                          <div className="w-1.5 h-1.5 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-[#06EAFC] rounded-full"></div>
                          <span className="text-gray-700 text-xs sm:text-sm lg:text-base">{language}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* View All Vendors Section - Removed extra button, only modal close */}
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check if device is touch-enabled on mount
  useEffect(() => {
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    checkTouchDevice();
  }, []);

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
        whileHover={isTouchDevice ? {} : {
          y: -6,
          scale: 1.01,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12), 0 5px 10px rgba(0, 0, 0, 0.08)",
          transition: { 
            duration: 0.15,
            ease: "easeInOut" 
          }
        }}
        className="
          bg-white
          border border-gray-200 
          shadow-sm
          relative
          overflow-hidden
          cursor-pointer
          rounded-2xl
          group
          w-full
          max-w-sm
          mx-auto
          flex flex-col
          min-h-[280px]
          hover:shadow-xl
          transition-all duration-150
          hover:border-gray-300
        "
        onClick={handleViewVendor}
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src={venue.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face"}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/80/DDDDDD/808080?text=No+Image";
                  }}
                />
              </div>
              
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-green-200">
                <VscVerifiedFilled className="text-green-500 text-sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-gray-800 transition-colors duration-150">
                  {venue.name}
                </h3>
                
                <div className="flex items-center gap-1 shrink-0">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-black text-sm"
                  />
                  <span className="font-bold text-gray-900 text-sm">
                    {venue.rating || "4.9"}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-gray-600 font-medium text-sm">
                  {venue.service_type || venue.category || "Service Provider"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400 text-sm flex-shrink-0" />
                <span className="text-gray-600 text-sm font-medium truncate">
                  {venue.district || venue.location || "Ibadan"}
                </span>
              </div>

            </div>
          </div>
          
          <div className="">
            <p className="text-gray-700 leading-relaxed text-sm line-clamp-3">
              {venue.description || 
                `Professional ${venue.service_type?.toLowerCase() || "service"} with ${
                  venue.years_experience || "5+"
                } years experience.`}
            </p>
          </div>
          
          <div className="mt-auto pt-4">
            <motion.button
              whileHover={isTouchDevice ? {} : { scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              className="
                w-full 
                py-3
                text-black 
                font-bold 
                text-sm
                rounded-lg
                transition-all duration-100
                border-2 border-gray-300
                cursor-pointer
                flex items-center justify-center gap-2
                hover:shadow-md
              "
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
  <div
    className="
    bg-white border border-gray-200 relative overflow-hidden animate-pulse
    rounded-2xl
    w-full max-w-sm mx-auto
    flex flex-col
    min-h-[280px]
  "
  >
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start gap-4 mb-5 flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gray-300"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="h-6 bg-gray-300 rounded w-24"></div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-6"></div>
            </div>
          </div>

          <div className="mb-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="w-full py-3 bg-gray-300 rounded-lg"></div>
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check if device is touch-enabled on mount
  useEffect(() => {
    const checkTouchDevice = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouch);
    };
    checkTouchDevice();
  }, []);

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
    navigate('/vendor');
  };

  if (loading) {
    return (
      <section className="bg-white font-manrope" id="toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                Verified Services
              </h1>
              <p className="text-gray-600 text-lg lg:text-[16.5px] max-w-3xl leading-relaxed">
                Trusted businesses reviewed and approved for quality and reliability.
              </p>
            </div>
            
            <div className="bg-[#06EAFC] px-6 py-3 rounded-xl w-32 h-12 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {[...Array(visibleCount)].map((_, index) => (
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
    <section className="bg-white py-8 lg:py-12 font-manrope" id="toppicks">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="mb-2 lg:mb-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8"
          >
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={
                  headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-xl lg:text-2xl text-start  font-bold text-center md:text-start text-gray-900 mb-1.5 cursor-default"
              >
                Verified Services
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-gray-600 text-[13.5px]  md:text-start lg:text-[16.5px] max-w-3xl mb-4 leading-relaxed cursor-default"
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
              className="
                px-6 py-3 
                flex md:items-center md:justify-center 
                rounded-xl 
                cursor-pointer 
                transition-all duration-150 
                text-black font-semibold
                w-full lg:w-auto
                text-center
              "
            >
              View All Services →
            </motion.button>
          </motion.div>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4 lg:gap-8 mb-12`}>
          {visibleVenues.map((venue, index) => (
            <VendorCard key={venue.id} venue={venue} index={index} />
          ))}
        </div>

        {filteredVenues.length === 0 && !loading && (
          <div className="text-center py-16 cursor-default">
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
              <h3 className="text-2xl text-gray-800 mb-4 font-bold">
                No vendors found
              </h3>
              <p className="text-gray-600 text-lg">
                Try adjusting your filters
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AiTopPicks;