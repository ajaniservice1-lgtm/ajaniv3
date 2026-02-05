import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faSearch } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { VscVerifiedFilled } from "react-icons/vsc";
import { IoClose } from "react-icons/io5";
import { 
  FaMapMarkerAlt, 
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaUser,
  FaCheckCircle,
  FaTruck,
  FaCalendarCheck,
  FaClock,
  FaBriefcase,
  FaMoneyBillWave,
  FaCertificate,
  FaGlobe,
  FaImages,
  FaBuilding
} from "react-icons/fa";

// ======================= VENDOR MODAL COMPONENT =======================
const VendorModal = ({ vendor, isOpen, onClose }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const [bgImageError, setBgImageError] = useState(false);
  const scrollPositionRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
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
      // Store the current scroll position
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;
      
      // Lock body scroll without moving the page
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
      
      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector('button[aria-label="Close modal"]');
        closeButton?.focus();
      }, 100);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      
      if (isOpen) {
        // Restore body styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen || !vendor) return null;

  return (
    <>
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

          <div 
            ref={contentRef}
            className="overflow-y-auto h-full"
          >
            <div className="relative">
              {/* Background Image with Gradient Overlay */}
              <div className="h-40 sm:h-48 lg:h-56 relative">
                {vendor.image_url && !bgImageError ? (
                  <>
                    <img
                      src={vendor.image_url}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                      onError={() => setBgImageError(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                  </>
                ) : (
                  <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                )}
              </div>
              
              <div className="absolute -bottom-10 sm:-bottom-12 lg:-bottom-16 left-3 sm:left-4 lg:left-6">
                <div className="relative">
                  <img
                    src={vendor.image_url}
                    alt={vendor.name}
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
                  {vendor.is_verified === "TRUE" && (
                    <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 lg:-top-2 lg:-right-2 bg-white rounded-full p-1 sm:p-1 lg:p-1.5 shadow-lg border border-green-200">
                      <VscVerifiedFilled className="text-base sm:text-lg lg:text-2xl text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 pt-16 sm:pt-20 lg:pt-24">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                    <h2 id="modal-title" className="text-lg sm:text-xl lg:text-[19.5px] font-bold text-gray-900">
                      {vendor.name}
                    </h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm lg:text-sm font-semibold">
                        {vendor.status === "approved" ? "Approved" : "Pending"}
                      </span>
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm lg:text-sm font-semibold">
                        {vendor.years_experience || vendor.yearsExperience || "0"} years experience
                      </span>
                      {vendor.cacRegistered && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm lg:text-sm font-semibold">
                          CAC Registered
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base lg:text-[15px] text-gray-600 mb-2 sm:mb-3 lg:mb-4">
                    {vendor.serviceCategory || vendor.service_type} • {vendor.category}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mt-2 sm:mt-3 lg:mt-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-black text-sm sm:text-base lg:text-lg"
                      />
                      <span className="font-bold text-gray-900 text-sm sm:text-base lg:text-[15px]">
                        {vendor.rating || "4.8"}
                      </span>
                      <span className="text-gray-500 text-xs sm:text-sm lg:text-[14px]">
                        ({vendor.review_count || "128"} reviews)
                      </span>
                    </div>
                    <span className="text-gray-300 hidden lg:inline">•</span>
                    {vendor.approvedAt && (
                      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2 text-gray-600 text-xs sm:text-sm lg:text-[14px]">
                        <FaCheckCircle className="text-green-500 text-sm sm:text-base" />
                        <span>Approved on {new Date(vendor.approvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `mailto:${vendor.email}`;
                    }}
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
                      text-xs sm:text-sm lg:text-[14px]
                    "
                  >
                    <FaEnvelope className="text-xs sm:text-sm lg:text-[14px]" />
                    <span className="whitespace-nowrap">Contact</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Prepare vendor data for booking
                      const bookingData = {
                        ...vendor,
                        category: vendor.category || "services",
                        bookingType: "service",
                        vendorId: vendor.id,
                        vendorName: vendor.name,
                        vendorImage: vendor.image_url,
                        vendorPhone: vendor.phone,
                        vendorEmail: vendor.email,
                        serviceType: vendor.service_type,
                        priceRange: vendor.price_range,
                        priceFrom: vendor.priceFrom,
                        priceTo: vendor.priceTo
                      };
                      
                      // Store in multiple locations for reliability
                      localStorage.setItem('currentVendorBooking', JSON.stringify(bookingData));
                      sessionStorage.setItem('currentVendorBooking', JSON.stringify(bookingData));
                      
                      // Navigate to booking route
                      navigate('/booking');
                    }}
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
                      text-xs sm:text-sm lg:text-[14px]
                    "
                  >
                    <FaCalendarCheck className="text-xs sm:text-sm lg:text-[14px]" />
                    <span className="whitespace-nowrap">Book Now</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 cursor-default">
                  <p className="text-xs sm:text-sm lg:text-[13px] text-gray-600 mb-1 sm:mb-1.5 lg:mb-2 flex items-center gap-1">
                    <FaBriefcase className="text-[#06EAFC]" />
                    Experience
                  </p>
                  <p className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-900">
                    {vendor.years_experience || "0"} years
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 cursor-default">
                  <p className="text-xs sm:text-sm lg:text-[13px] text-gray-600 mb-1 sm:mb-1.5 lg:mb-2 flex items-center gap-1">
                    <FaMoneyBillWave className="text-[#06EAFC]" />
                    Price Range
                  </p>
                  <p className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-900">
                    {vendor.price_range || "₦5,000 - ₦50,000"}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 cursor-default">
                  <p className="text-xs sm:text-sm lg:text-[13px] text-gray-600 mb-1 sm:mb-1.5 lg:mb-2 flex items-center gap-1">
                    <FaCertificate className="text-[#06EAFC]" />
                    Status
                  </p>
                  <p className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-900 capitalize">
                    {vendor.status || "active"}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-200 cursor-default">
                  <p className="text-xs sm:text-sm lg:text-[13px] text-gray-600 mb-1 sm:mb-1.5 lg:mb-2 flex items-center gap-1">
                    <FaGlobe className="text-[#06EAFC]" />
                    Service Area
                  </p>
                  <p className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-900 truncate">
                    {vendor.area || "Ibadan"}
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {/* Left Column - About & Services */}
                <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* About Section */}
                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-[19.5px] font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-3 sm:h-4 lg:h-6 bg-[#06EAFC] rounded-full"></span>
                      About
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm lg:text-[14px] whitespace-pre-line">
                      {vendor.about || vendor.description || "No description available."}
                    </p>
                    
                    {vendor.whatWeDo && (
                      <div className="mt-3 sm:mt-4 lg:mt-5">
                        <h4 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3 text-sm sm:text-base lg:text-[14px]">What We Do:</h4>
                        <p className="text-gray-700 text-xs sm:text-sm lg:text-[14px]">
                          {vendor.whatWeDo}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Services Offered */}
                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-[19.5px] font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-3 sm:h-4 lg:h-6 bg-[#06EAFC] rounded-full"></span>
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
                      {(vendor.listOfServices || vendor.services || []).map((service, index) => (
                        <span
                          key={index}
                          className="
                            px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2
                            bg-gradient-to-r from-[#06EAFC]/10 to-blue-50
                            text-gray-700
                            rounded-md sm:rounded-lg lg:rounded-xl
                            font-semibold
                            border border-[#06EAFC]/30
                            cursor-default
                            text-xs sm:text-sm lg:text-[13px]
                          "
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact & Details */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 shadow-sm cursor-default">
                    <h3 className="text-base sm:text-lg lg:text-[19.5px] font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-5">
                      Contact & Location
                    </h3>

                    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                      {/* Location */}
                      <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="p-1.5 sm:p-1.5 lg:p-2 bg-[#06EAFC]/20 rounded-lg flex-shrink-0">
                          <FaMapMarkerAlt className="text-[#06EAFC] text-sm sm:text-base lg:text-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm lg:text-[13px] text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-[14px]">
                            {vendor.address}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 sm:mt-0.5 lg:mt-1">
                            {vendor.area}
                          </p>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="p-1.5 sm:p-1.5 lg:p-2 bg-[#06EAFC]/20 rounded-lg flex-shrink-0">
                          <FaClock className="text-[#06EAFC] text-sm sm:text-base lg:text-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm lg:text-[13px] text-gray-600">Operating Hours</p>
                          <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-[14px]">
                            {vendor.operatingHours || "09:00 AM - 05:00 PM"}
                          </p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="pt-2.5 sm:pt-3 lg:pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 lg:mb-3 text-sm sm:text-base lg:text-[14px]">Contact Information</h4>
                        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                          <a 
                            href={`tel:${vendor.phone}`}
                            className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 hover:text-[#06EAFC] transition-colors duration-150"
                          >
                            <FaPhone className="text-gray-400 text-xs sm:text-sm lg:text-[14px]" />
                            <span className="text-gray-700 text-xs sm:text-sm lg:text-[14px] truncate">{vendor.phone}</span>
                          </a>
                          
                          {vendor.whatsapp && (
                            <a 
                              href={`https://wa.me/${vendor.whatsapp?.replace('+', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 hover:text-green-600 transition-colors duration-150"
                            >
                              <FaWhatsapp className="text-green-500 text-xs sm:text-sm lg:text-[14px]" />
                              <span className="text-gray-700 text-xs sm:text-sm lg:text-[14px] truncate">{vendor.whatsapp}</span>
                            </a>
                          )}
                          
                          <a 
                            href={`mailto:${vendor.email}`}
                            className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 hover:text-[#06EAFC] transition-colors duration-150"
                          >
                            <FaEnvelope className="text-gray-400 text-xs sm:text-sm lg:text-[14px]" />
                            <span className="text-gray-700 text-xs sm:text-sm lg:text-[14px] truncate">{vendor.email}</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approval Status */}
                  <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 border border-gray-200 cursor-default">
                    <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4 text-sm sm:text-base lg:text-[14px]">Approval Status</h4>
                    <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-xs sm:text-sm lg:text-[14px]">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          vendor.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : vendor.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(vendor.status || 'ACTIVE')?.toUpperCase()}
                        </span>
                      </div>
                      
                      {vendor.approvedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 text-xs sm:text-sm lg:text-[14px]">Approved On</span>
                          <span className="text-gray-900 text-xs sm:text-sm lg:text-[14px] font-medium">
                            {new Date(vendor.approvedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 text-xs sm:text-sm lg:text-[14px]">Verified</span>
                        <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm lg:text-[14px]">
                          <FaCheckCircle />
                          {vendor.isVerified || vendor.is_verified === "TRUE" ? 'Yes' : 'No'}
                        </span>
                      </div>
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

// ======================= VENDOR SERVICE FUNCTIONS =======================

// Custom hook for fetching backend data
const useBackendData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('https://ajanibackend.onrender.com/api/v1/listings?category=services');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        console.log('API Response:', json);

        let listings = [];
        
        if (json.status === 'success' && json.data && json.data.listings) {
          listings = json.data.listings;
        } else if (Array.isArray(json.data)) {
          listings = json.data;
        } else if (Array.isArray(json)) {
          listings = json;
        }

        if (!Array.isArray(listings)) {
          throw new Error("No valid listings array found in response");
        }

        const transformedData = listings.map((item, index) => {
          const vendor = item.vendorId || {};
          const details = item.details || {};
          const contact = item.contactInformation || {};
          const location = item.location || {};
          const geolocation = location.geolocation || {};
          const mainImage = item.images?.[0]?.url;
          
          return {
            id: item._id || `venue-${index}`,
            name: item.name,
            service_type: details.serviceCategory || item.category || "Service Provider",
            description: item.about,
            rating: "4.8",
            review_count: "128",
            image_url: mainImage || 
                      details.businessLogo || 
                      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
            district: location.area || "Ibadan",
            location: location.address || "",
            area: location.area || "",
            address: location.address || "",
            geolocation: geolocation,
            is_verified: vendor.isVerified ? "TRUE" : "FALSE",
            is_available: item.status === "approved" ? "TRUE" : "FALSE",
            years_experience: details.yearsOfExperience?.toString() || "3",
            phone: contact.phone || vendor.phone || "+234 801 234 5678",
            whatsapp: contact.whatsapp,
            email: contact.email || vendor.email || "vendor@example.com",
            category: item.category || "services",
            completed_projects: Math.floor(Math.random() * 200) + 100,
            response_time: "1-4 hours",
            priceFrom: details.pricingRange?.priceFrom || 5000,
            priceTo: details.pricingRange?.priceTo || 50000,
            price_range: details.pricingRange ? 
                        `₦${details.pricingRange.priceFrom?.toLocaleString()} - ₦${details.pricingRange.priceTo?.toLocaleString()}` : 
                        "₦5,000 - ₦50,000",
            businessName: vendor.businessName || item.name,
            vendorBusinessName: vendor.vendor?.businessName || item.name,
            vendorName: `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email,
            vendorEmail: vendor.email,
            operatingHours: details.operatingHours || "09:00 AM - 05:00 PM",
            services: details.listOfServices || ["Consultation", "Delivery"],
            listOfServices: details.listOfServices || [],
            cacRegistered: details.cacRegistered || false,
            cacNumber: details.cacNumber || "Not Registered",
            serviceCategory: details.serviceCategory || "General Services",
            businessDescription: details.businessDescription || item.about,
            about: item.about,
            whatWeDo: item.whatWeDo,
            status: item.status || "pending",
            approvedAt: item.approvedAt,
            images: item.images || [],
            isVerified: vendor.isVerified,
            fullName: item.name,
            completedProjects: Math.floor(Math.random() * 200) + 100,
            repeatClients: 85,
            satisfactionRate: 96,
            activeWithin: `Within 15 km of ${location.area || "Ibadan"}`,
            languages: ["English (Native)", "Yoruba (Fluent)"],
            specialties: ["Professional Service", "Quality Workmanship"],
            certifications: details.cacRegistered ? ["CAC Registered"] : ["Verified Vendor"],
            minOrder: "₦15,000",
            deliveryAvailable: true,
            onlineBookings: true,
            workType: details.serviceCategory
          };
        });

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Backend API error:", err);
        setError(`Failed to load data: ${err.message}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

// Function to get all vendors (from backend)
const getAllVendors = (vendorsData = []) => {
  // Your demo data as fallback
  const demoVendors = [
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
      price_range: "₦1,500 - ₦5,000",
      priceFrom: 1500,
      priceTo: 5000
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
      price_range: "₦4,000 - ₦8,000",
      priceFrom: 4000,
      priceTo: 8000
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
      price_range: "₦3,000 - ₦6,000",
      priceFrom: 3000,
      priceTo: 6000
    }
  ];

  // Use backend data if available, otherwise use demo data
  return vendorsData.length > 0 ? vendorsData : demoVendors;
};

// ======================= SERVICE CATEGORIES =======================
const serviceCategories = [
  "All Services",
  "Plumber",
  "Electrician", 
  "Caterer",
  "Mechanic",
  "Event Planner",
  "Makeup Artist",
  "Photographer",
  "Carpenter",
  "Painter",
  "Cleaning",
  "General Services"
];

// ======================= MAIN VENDORS PAGE =======================
const VendorsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use the backend hook
  const { data: backendVendors, loading, error } = useBackendData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Filter vendors whenever search term, category, or backend data changes
    let results = getAllVendors(backendVendors);

    if (selectedCategory !== "All Services") {
      results = results.filter(vendor => {
        const vendorCategory = vendor.serviceCategory || vendor.service_type || vendor.category;
        return vendorCategory?.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(vendor =>
        vendor.name?.toLowerCase().includes(term) ||
        vendor.service_type?.toLowerCase().includes(term) ||
        vendor.description?.toLowerCase().includes(term) ||
        vendor.location?.toLowerCase().includes(term) ||
        vendor.area?.toLowerCase().includes(term) ||
        vendor.address?.toLowerCase().includes(term) ||
        vendor.about?.toLowerCase().includes(term) ||
        vendor.serviceCategory?.toLowerCase().includes(term)
      );
    }

    setFilteredVendors(results);
  }, [searchTerm, selectedCategory, backendVendors]);

  const handleContact = (vendor, method) => {
    switch(method) {
      case 'call':
        window.location.href = `tel:${vendor.phone}`;
        break;
      case 'whatsapp':
        const whatsappNumber = vendor.whatsapp || vendor.phone;
        window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:${vendor.email}`;
        break;
      default:
        break;
    }
  };

  const handleShowContact = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Services");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleAddVendor = () => {
    navigate("/register/vendor");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-manrope flex flex-col">
      {/* Conditional rendering: Hide header when modal is open */}
      {!isModalOpen && <Header />}
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8 mt-12">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Verified Vendors
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                title="Refresh vendors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm lg:text-base ml-11">
            Find trusted service providers from our database
            {backendVendors.length > 0 && 
              ` • ${backendVendors.length} service${backendVendors.length > 1 ? 's' : ''} available`
            }
          </p>
        </div>

        <div className="mb-6 lg:mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm lg:text-base" />
            </div>
            <input
              type="text"
              placeholder="Search vendors by name, service, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 
                bg-white border border-gray-300 
                rounded-xl lg:rounded-2xl 
                focus:outline-none focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent
                text-gray-900 placeholder-gray-500 text-sm lg:text-base
                shadow-sm
              "
            />
          </div>
        </div>

        <div className="mb-6 lg:mb-8">
          <div className="flex overflow-x-auto pb-2 lg:pb-3 gap-2 lg:gap-3 hide-scrollbar">
            {serviceCategories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className={`
                  px-4 lg:px-5 py-2 lg:py-2.5 
                  rounded-lg lg:rounded-xl 
                  font-medium 
                  whitespace-nowrap
                  transition-all duration-200
                  text-xs lg:text-sm
                  flex-shrink-0
                  ${selectedCategory === category
                    ? 'bg-[#06EAFC] hover:bg-[#6cf5ff] text-black shadow-md lg:shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm lg:hover:shadow-md'
                  }
                `}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-4 lg:mb-6 flex justify-between items-center">
          <p className="text-gray-600 text-sm lg:text-base">
            Showing {filteredVendors.length} vendors
            {selectedCategory !== "All Services" && ` in ${selectedCategory}`}
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Loading vendors from API...
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <span>⚠️</span>
              <span>Using demo data</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[1, 2, 3, 4, 5, 6].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Show all vendors */}
            {filteredVendors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
                {filteredVendors.map((vendor, index) => (
                  <VendorCard 
                    key={vendor.id} 
                    vendor={vendor} 
                    index={index}
                    onShowContact={handleShowContact}
                    onContact={handleContact}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && filteredVendors.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-12 max-w-md mx-auto shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl lg:text-2xl text-gray-800 mb-3 lg:mb-4 font-bold">
                No vendors found
              </h3>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                Try adjusting your search or filters
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={clearAllFilters}
                  className="
                    px-4 lg:px-6 py-2.5 lg:py-3
                    bg-[#06EAFC] hover:bg-[#6cf5ff]
                    text-black
                    rounded-lg lg:rounded-xl
                    transition-all duration-200
                    font-semibold text-sm lg:text-base
                  "
                >
                  Clear All Filters
                </button>
                <button
                  onClick={() => navigate('/register/vendor')}
                  className="
                    px-4 lg:px-6 py-2.5 lg:py-3
                    bg-green-600 hover:bg-green-700
                    text-white
                    rounded-lg lg:rounded-xl
                    transition-all duration-200
                    font-semibold text-sm lg:text-base
                  "
                >
                  Register as Vendor
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Conditional rendering: Hide footer when modal is open */}
      {!isModalOpen && <Footer />}

      <VendorModal
        vendor={selectedVendor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// ======================= VENDOR CARD COMPONENT =======================
const VendorCard = ({ vendor, index, onShowContact, onContact }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05)",
        transition: { duration: 0.15, ease: "easeInOut" }
      }}
      className="
        bg-white
        border border-gray-200 
        shadow-sm hover:shadow-xl 
        transition-all duration-200
        relative
        overflow-hidden
        cursor-pointer
        rounded-xl lg:rounded-2xl
        group
        hover:border-gray-300
        flex flex-col
        h-full
      "
      onClick={() => onShowContact(vendor)}
    >
      <div className="p-4 lg:p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-5">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-all duration-200">
              <img
                src={vendor.image_url}
                alt={vendor.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/80/DDDDDD/808080?text=No+Image";
                }}
              />
            </div>
            
            {vendor.is_verified === "TRUE" && (
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-green-200">
                <VscVerifiedFilled className="text-green-500 text-xs" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-200 truncate">
                {vendor.name}
              </h3>
              
              <div className="flex items-center gap-1 shrink-0">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-500 text-xs"
                />
                <span className="font-bold text-gray-900 text-xs lg:text-sm">
                  {vendor.rating}
                </span>
                <span className="text-gray-500 text-xs hidden sm:inline">
                  ({vendor.review_count})
                </span>
              </div>
            </div>

            <div className="mb-1 lg:mb-2">
              <span className="text-gray-600 font-medium text-xs lg:text-sm">
                {vendor.serviceCategory || vendor.service_type}
              </span>
              {vendor.cacRegistered && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  CAC
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
              <span className="text-gray-600 text-xs lg:text-sm font-medium truncate">
                {vendor.area || vendor.district || "Ibadan"}
              </span>
            </div>

            <div className="mb-3 lg:mb-4 pl-0">
              <p className="text-gray-700 leading-relaxed text-xs lg:text-sm line-clamp-2">
                {vendor.about || vendor.description || "Professional service provider"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-3 lg:pt-4 border-t border-gray-100">
          <div className="flex flex-col gap-2 lg:gap-3">
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContact(vendor, 'call');
                }}
                className="
                  py-2 lg:py-2.5
                  bg-green-600
                  text-white
                  font-semibold
                  text-xs lg:text-sm
                  rounded-lg lg:rounded-xl
                  hover:bg-green-700
                  transition-all duration-200
                  hover:shadow-md
                  cursor-pointer
                  flex items-center justify-center gap-1 lg:gap-2
                "
              >
                <FaPhone className="text-white text-xs lg:text-sm" />
                Call Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onContact(vendor, 'whatsapp');
                }}
                className="
                  py-2 lg:py-2.5
                  bg-green-100
                  text-green-700
                  font-semibold
                  text-xs lg:text-sm
                  rounded-lg lg:rounded-xl
                  hover:bg-green-200
                  transition-all duration-200
                  hover:shadow-md
                  cursor-pointer
                  flex items-center justify-center gap-1 lg:gap-2
                "
              >
                <FaWhatsapp className="text-green-600 text-xs lg:text-sm" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VendorsPage;