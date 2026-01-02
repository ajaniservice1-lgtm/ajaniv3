import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
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
  FaCalendarCheck 
} from "react-icons/fa";

// ---------------- Vendor Modal Component ----------------
const VendorModal = ({ vendor, isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="
            bg-white rounded-3xl shadow-2xl
            w-full max-w-6xl max-h-[90vh]
            overflow-hidden
            relative
            border border-gray-200
          "
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="
              absolute top-6 right-6
              bg-white rounded-full p-3
              shadow-lg hover:shadow-xl
              hover:bg-gray-50
              transition-all duration-200
              z-10
              cursor-pointer
              border border-gray-200
              hover:border-gray-300
            "
            aria-label="Close modal"
          >
            <IoClose className="text-2xl text-gray-700" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            <div className="relative">
              <div className="h-56 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
              <div className="absolute -bottom-16 left-8 lg:left-12">
                <div className="relative">
                  <img
                    src={vendor.avatar}
                    alt={vendor.fullName}
                    className="
                      w-32 h-32 lg:w-40 lg:h-40 rounded-full
                      border-4 border-white
                      shadow-2xl
                      object-cover
                      bg-white
                    "
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/160/DDDDDD/808080?text=No+Image";
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-lg border border-green-200">
                    <VscVerifiedFilled className="text-2xl text-green-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 lg:p-10 pt-24 lg:pt-28">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                      {vendor.fullName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Verified Vendor
                      </span>
                      {vendor.yearsExperience && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {vendor.yearsExperience} years experience
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-600 mb-4">
                    {vendor.businessType} • {vendor.workType}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500 text-lg"
                      />
                      <span className="font-bold text-gray-900 text-xl">
                        {vendor.rating}
                      </span>
                      <span className="text-gray-500">
                        ({vendor.totalReviews} reviews)
                      </span>
                    </div>
                    <span className="text-gray-300 hidden lg:inline">•</span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCheckCircle className="text-green-500" />
                      <span>{vendor.completedProjects} projects completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="
                    px-8 py-3
                    bg-white text-black
                    rounded-xl
                    hover:bg-gray-50
                    transition-all duration-200
                    font-semibold
                    cursor-pointer
                    flex items-center justify-center gap-3
                    hover:shadow-lg
                    border border-gray-300
                  ">
                    <FaEnvelope />
                    Contact Vendor
                  </button>
                  <button className="
                    px-8 py-3
                    bg-[#06EAFC] text-black
                    rounded-xl
                    hover:bg-[#6cf5ff]
                    transition-all duration-200
                    font-semibold
                    cursor-pointer
                    flex items-center justify-center gap-3
                    hover:shadow-lg
                    border border-[#06EAFC]
                  ">
                    <FaCalendarCheck />
                    Book Now
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-200"
                >
                  <p className="text-sm text-gray-600 mb-2">Completed Projects</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.completedProjects.toLocaleString()}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-200"
                >
                  <p className="text-sm text-gray-600 mb-2">Repeat Clients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.repeatClients}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">High retention rate</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-200"
                >
                  <p className="text-sm text-gray-600 mb-2">Satisfaction Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.satisfactionRate}%
                  </p>
                  <p className="text-xs text-green-600 mt-1">Excellent feedback</p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-200"
                >
                  <p className="text-sm text-gray-600 mb-2">Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.responseTime}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Typically responds</p>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#06EAFC] rounded-full"></span>
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

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#06EAFC] rounded-full"></span>
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {vendor.services.map((service, index) => (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
                          className="
                            px-5 py-3
                            bg-gradient-to-r from-[#06EAFC]/10 to-blue-50
                            text-gray-700
                            rounded-xl
                            font-semibold
                            border border-[#06EAFC]/30
                            hover:border-[#06EAFC]
                            transition-all duration-200
                            cursor-default
                          "
                        >
                          {service}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#06EAFC] rounded-full"></span>
                      Specialties & Expertise
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {vendor.specialties.map((specialty, index) => (
                        <motion.span
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.15 }}
                          className="
                            px-5 py-3
                            bg-gradient-to-r from-green-50 to-teal-50
                            text-gray-700
                            rounded-xl
                            font-semibold
                            border border-green-200
                            hover:border-green-300
                            transition-all duration-200
                            cursor-default
                          "
                        >
                          {specialty}
                        </motion.span>
                      ))}
                    </div>
                    
                    {vendor.certifications && vendor.certifications.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold text-gray-900 mb-4">Certifications:</h4>
                        <div className="flex flex-wrap gap-3">
                          {vendor.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="
                                px-4 py-2
                                bg-yellow-50 text-yellow-800
                                rounded-lg
                                font-medium
                                border border-yellow-200
                                text-sm
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

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Contact & Details
                    </h3>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#06EAFC]/20 rounded-lg">
                          <FaMapMarkerAlt className="text-[#06EAFC] text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900">
                            {vendor.location}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {vendor.activeWithin}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#06EAFC]/20 rounded-lg">
                          <span className="font-bold text-[#06EAFC]">BN</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Business Name</p>
                          <p className="font-semibold text-gray-900">
                            {vendor.businessName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Hourly Rate</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {vendor.hourlyRate}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Minimum Order</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {vendor.minOrder}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-[#06EAFC]/20 rounded-lg">
                          <FaClock className="text-[#06EAFC] text-xl" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Business Hours</p>
                          <p className="font-semibold text-gray-900">
                            {vendor.businessHours}
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

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Languages</h4>
                    <div className="space-y-2">
                      {vendor.languages.map((language, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-[#06EAFC] rounded-full"></div>
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
    

      
    </div>
  );
};

// ---------------- Vendor Card Component ----------------
const VendorCard = ({ venue, index }) => {
  const [showModal, setShowModal] = useState(false);

  const vendorData = {
    id: venue.id,
    firstName: venue.name?.split(" ")[0] || "Vendor",
    lastName: venue.name?.split(" ").slice(1).join(" ") || "Name",
    fullName: venue.name,
    email:
      venue.email ||
      `${venue.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
    phone: venue.phone || "+234 812 345 6789",
    businessType: venue.category || "Service",
    workType: venue.service_type,
    location: venue.location || venue.district,
    description: venue.description,
    yearsExperience: venue.years_experience || "10+",
    avatar:
      venue.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    rating: parseFloat(venue.rating) || 4.9,
    totalReviews: parseInt(venue.review_count) || 128,
    completedProjects: parseInt(venue.completed_projects) || 247,
    repeatClients: parseInt(venue.repeat_clients) || 89,
    satisfactionRate: parseInt(venue.satisfaction_rate) || 98,
    address: venue.address || venue.location,
    responseTime: venue.response_time || "Within 2 hours",
    activeWithin: `Within 15 km of ${
      venue.location?.split(",")[0] || "your location"
    }`,
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: [venue.service_type || "Your service"],
    specialties: venue.specialties
      ? venue.specialties.split(",")
      : ["Traditional Cuisine", "Corporate Events"],
    certifications: venue.certifications
      ? venue.certifications.split(",")
      : ["Food Safety Certified", "Health Department Approved"],
    businessName: venue.business_name || venue.name,
    hourlyRate: venue.hourly_rate || "₦5,000 - ₦10,000",
    minOrder: venue.min_order || "₦15,000",
    businessHours: venue.business_hours || "8:00 AM - 10:00 PM",
    deliveryAvailable: venue.delivery_available === "TRUE",
    onlineBookings: venue.online_bookings === "TRUE",
    listings: [],
    reviews: [],
  };

  const handleViewVendor = () => {
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{
          y: -5,
          scale: 1.02,
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.08)",
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
          rounded-2xl
          group
          w-full
          max-w-sm
          mx-auto
          hover:border-gray-300
          flex flex-col
          min-h-[280px]
        "
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start gap-4 mb-5 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-all duration-200">
                <img
                  src={venue.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face"}
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-200 truncate">
                  {venue.name}
                </h3>
                
                <div className="flex items-center gap-1 shrink-0">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-yellow-500 text-sm"
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

              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-gray-400 text-sm flex-shrink-0" />
                <span className="text-gray-600 text-sm font-medium truncate">
                  {venue.district || venue.location || "Bodija, Ibadan"}
                </span>
              </div>

              <div className="mt-2">
                <p className="text-gray-700 leading-relaxed text-sm line-clamp-3">
                  {venue.description || 
                    `Professional ${venue.service_type?.toLowerCase() || "service"} with ${
                      venue.years_experience || "10+"
                    } years experience. Available 24/7 for emergencies.`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-4">
            <button
              onClick={handleViewVendor}
              className="
                w-full 
                py-3
                bg-white hover:bg-gray-50
                text-black 
                font-bold 
                text-base
                rounded-xl
                transition-all duration-200
                hover:shadow-lg
                hover:scale-[1.02]
                cursor-pointer
                group/btn
                border-2 border-gray-300
                focus:outline-none
                focus:ring-2 focus:ring-[#06EAFC] focus:ring-offset-2
                flex items-center justify-center gap-2
              "
            >
              Contact
              <svg 
                className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-150"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
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
        <div className="w-full py-3 bg-gray-300 rounded-xl"></div>
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

  const demoVenues = [
    {
      id: "1",
      name: "AJ Plumbing Services",
      service_type: "Plumber",
      description: "Professional plumber with 10+ years experience. Available 24/7 for emergencies.",
      rating: "4.9",
      review_count: "234",
      image_url:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      district: "Bodija",
      location: "Bodija, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Services",
      price_range: "1500-5000",
      response_time: "1-4 hours",
      years_experience: "10",
    },
    {
      id: "2",
      name: "RoyalPot Amala Spot",
      service_type: "Caterer",
      description:
        "Authentic amala, gbegiri, and local dishes loved across Ibadan.",
      rating: "4.7",
      review_count: "189",
      image_url:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      district: "Dugbe",
      location: "Dugbe, Ibadan",
      is_verified: "TRUE",
      is_available: "FALSE",
      category: "Food",
      price_range: "800-2500",
      response_time: "1-4 hours",
      years_experience: "8",
    },
    {
      id: "3",
      name: "Blossom Event Centre",
      service_type: "Event Planner",
      description: "Modern event space for weddings, parties, and conferences.",
      rating: "4.7",
      review_count: "156",
      image_url:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
      district: "Sango",
      location: "Sango, Ibadan",
      is_verified: "FALSE",
      is_available: "TRUE",
      category: "Events",
      price_range: "50000-200000",
      response_time: "5-8 hours",
      years_experience: "5",
    },
    {
      id: "4",
      name: "QuickClean Laundry",
      service_type: "Laundry Service",
      description: "Fast, reliable laundry service with pick-up and delivery.",
      rating: "4.5",
      review_count: "92",
      image_url:
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&q=80",
      district: "Iwo Road",
      location: "Iwo Road, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Services",
      price_range: "1200-4000",
      response_time: "1-4 hours",
      years_experience: "6",
    },
    {
      id: "5",
      name: "Sparkle Photography",
      service_type: "Photographer",
      description:
        "Professional photography for weddings, events, and portraits.",
      rating: "4.8",
      review_count: "143",
      image_url:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
      district: "Mokola",
      location: "Mokola, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Photography",
      price_range: "10000-50000",
      response_time: "1-4 hours",
      years_experience: "12",
    },
    {
      id: "6",
      name: "FixIt Auto Repairs",
      service_type: "Mechanic",
      description: "Expert car repairs and maintenance services.",
      rating: "4.6",
      review_count: "87",
      image_url:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80",
      district: "UI Area",
      location: "UI Area, Ibadan",
      is_verified: "TRUE",
      is_available: "FALSE",
      category: "Automotive",
      price_range: "5000-50000",
      response_time: "5-8 hours",
      years_experience: "7",
    },
    {
      id: "7",
      name: "Green Thumb Gardening",
      service_type: "Gardener",
      description: "Professional gardening and landscaping services.",
      rating: "4.8",
      review_count: "134",
      image_url:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
      district: "Bodija",
      location: "Bodija, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Services",
      price_range: "3000-15000",
      response_time: "1-4 hours",
      years_experience: "9",
    },
    {
      id: "8",
      name: "TechFix Solutions",
      service_type: "IT Support",
      description: "Computer repair and IT support services.",
      rating: "4.9",
      review_count: "178",
      image_url:
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&q=80",
      district: "UI Area",
      location: "UI Area, Ibadan",
      is_verified: "TRUE",
      is_available: "TRUE",
      category: "Technology",
      price_range: "5000-25000",
      response_time: "1-4 hours",
      years_experience: "11",
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

  const districts = [
    ...new Set(displayVenues.map((v) => v.location).filter(Boolean)),
  ];

  if (loading) {
    return (
      <section className="bg-white font-manrope" id="toppicks">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8 mb-8">
            <div className="flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                Verified Vendors
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
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8"
          >
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={
                  headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-xl lg:text-2xl text-start  font-bold text-center md:text-start text-gray-900 mb-1.5 cursor-default"
              >
                Verified Vendors
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={
                  headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ delay: 0.2, duration: 0.4 }}
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
              transition={{ delay: 0.3, duration: 0.4 }}
              onClick={handleViewAll}
              className="
                px-6 py-3 
                flex md:items-center md:justify-center 
                rounded-xl 
                cursor-pointer 
                transition-all duration-200 
                text-black
                w-full lg:w-auto
                text-center
                
              "
            >
              View All Vendors →
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