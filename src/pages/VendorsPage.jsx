import React, { useState, useEffect } from "react";
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
  FaClock
} from "react-icons/fa";

// ======================= VENDOR MODAL COMPONENT =======================
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

  if (!isOpen || !vendor) return null;

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
                    src={vendor.avatar || vendor.image_url}
                    alt={vendor.fullName || vendor.name}
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
                      {vendor.fullName || vendor.name}
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
                    {vendor.businessType || "Service"} • {vendor.workType || vendor.service_type}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-500 text-lg"
                      />
                      <span className="font-bold text-gray-900 text-xl">
                        {vendor.rating || "4.9"}
                      </span>
                      <span className="text-gray-500">
                        ({vendor.totalReviews || vendor.review_count || "0"} reviews)
                      </span>
                    </div>
                    <span className="text-gray-300 hidden lg:inline">•</span>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaCheckCircle className="text-green-500" />
                      <span>{vendor.completedProjects || "0"} projects completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="
                    px-8 py-3
                    bg-[#06EAFC] hover:bg-[#6cf5ff]
                    text-black
                    rounded-xl
                    transition-all duration-200
                    font-semibold
                    cursor-pointer
                    flex items-center justify-center gap-3
                    hover:shadow-lg
                    border border-[#06EAFC]
                  ">
                    <FaEnvelope />
                    Contact Vendor
                  </button>
                  <button className="
                    px-8 py-3
                    bg-white text-gray-800
                    rounded-xl
                    hover:bg-gray-50
                    transition-all duration-200
                    font-semibold
                    cursor-pointer
                    flex items-center justify-center gap-3
                    hover:shadow-lg
                    border border-gray-300
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
                    {(vendor.completedProjects || 0).toLocaleString()}
                  </p>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:border-[#06EAFC] transition-all duration-200"
                >
                  <p className="text-sm text-gray-600 mb-2">Repeat Clients</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {vendor.repeatClients || 0}%
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
                    {vendor.satisfactionRate || 0}%
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
                    {vendor.responseTime || "Within 2 hours"}
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
                      {vendor.description || "Professional service provider with years of experience."}
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
                      {(vendor.services || [vendor.service_type || "Service"]).map((service, index) => (
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
                      {(vendor.specialties || ["General Services"]).map((specialty, index) => (
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
                    
                    {(vendor.certifications && vendor.certifications.length > 0) && (
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
                            {vendor.activeWithin || `Within 15 km of ${vendor.location?.split(",")[0] || "your location"}`}
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
                            {vendor.businessName || vendor.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Hourly Rate</p>
                          <p className="font-bold text-gray-900 text-lg">
                            {vendor.hourlyRate || "₦5,000 - ₦10,000"}
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
                        <div className="p-2 bg-[#06EAFC]/20 rounded-lg">
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

                  <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Languages</h4>
                    <div className="space-y-2">
                      {(vendor.languages || ["English (Native)", "Yoruba (Fluent)"]).map((language, index) => (
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

// ======================= MAIN VENDORS PAGE =======================
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
  "Painter"
];

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
    businessType: "Services",
    workType: "Plumber",
    fullName: "AJ Plumbing Services",
    completedProjects: 247,
    repeatClients: 89,
    satisfactionRate: 98,
    responseTime: "Within 2 hours",
    activeWithin: "Within 15 km of Bodija",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Plumbing", "Pipe Repair", "Drain Cleaning"],
    specialties: ["Emergency Plumbing", "Pipe Installation", "Water Heater Repair"],
    certifications: ["Licensed Plumber", "Certified Professional"],
    businessName: "AJ Plumbing Services",
    hourlyRate: "₦5,000 - ₦10,000",
    minOrder: "₦15,000",
    businessHours: "24/7",
    deliveryAvailable: true,
    onlineBookings: true,
    totalReviews: 234
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
    businessType: "Services",
    workType: "Electrician",
    fullName: "Bright Electric Solutions",
    completedProjects: 189,
    repeatClients: 85,
    satisfactionRate: 96,
    responseTime: "Within 3 hours",
    activeWithin: "Within 20 km of Mokola",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Electrical Wiring", "Circuit Repair", "Lighting Installation"],
    specialties: ["Residential Electrical", "Commercial Wiring", "Emergency Electrical"],
    certifications: ["Certified Electrician", "Safety Certified"],
    businessName: "Bright Electric Solutions",
    hourlyRate: "₦4,000 - ₦8,000",
    minOrder: "₦10,000",
    businessHours: "8:00 AM - 8:00 PM",
    deliveryAvailable: false,
    onlineBookings: true,
    totalReviews: 189
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
    businessType: "Food",
    workType: "Caterer",
    fullName: "Taste of Yoruba Catering",
    completedProjects: 156,
    repeatClients: 92,
    satisfactionRate: 97,
    responseTime: "Within 4 hours",
    activeWithin: "Within 25 km of Dugbe",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Catering", "Event Planning", "Food Delivery"],
    specialties: ["Yoruba Cuisine", "Wedding Catering", "Corporate Events"],
    certifications: ["Food Safety Certified", "Health Department Approved"],
    businessName: "Taste of Yoruba Catering",
    hourlyRate: "₦3,000 - ₦6,000",
    minOrder: "₦20,000",
    businessHours: "9:00 AM - 10:00 PM",
    deliveryAvailable: true,
    onlineBookings: true,
    totalReviews: 156
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
    businessType: "Automotive",
    workType: "Mechanic",
    fullName: "AutoFix Mechanics",
    completedProjects: 142,
    repeatClients: 88,
    satisfactionRate: 95,
    responseTime: "Within 2 hours",
    activeWithin: "Within 15 km of Iwo Road",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Car Repair", "Maintenance", "Diagnostics"],
    specialties: ["Engine Repair", "Brake Service", "Transmission"],
    certifications: ["Certified Mechanic", "ASE Certified"],
    businessName: "AutoFix Mechanics",
    hourlyRate: "₦5,000 - ₦12,000",
    minOrder: "₦8,000",
    businessHours: "7:00 AM - 9:00 PM",
    deliveryAvailable: false,
    onlineBookings: true,
    totalReviews: 142
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
    businessType: "Events",
    workType: "Event Planner",
    fullName: "Elegant Events Planning",
    completedProjects: 201,
    repeatClients: 95,
    satisfactionRate: 99,
    responseTime: "Within 1 hour",
    activeWithin: "Within 30 km of Sango",
    languages: ["English (Native)", "Yoruba (Fluent)", "French"],
    services: ["Event Planning", "Wedding Coordination", "Corporate Events"],
    specialties: ["Wedding Planning", "Corporate Events", "Birthday Parties"],
    certifications: ["Event Planning Certified", "Wedding Specialist"],
    businessName: "Elegant Events Planning",
    hourlyRate: "₦8,000 - ₦20,000",
    minOrder: "₦50,000",
    businessHours: "9:00 AM - 6:00 PM",
    deliveryAvailable: false,
    onlineBookings: true,
    totalReviews: 201
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
    businessType: "Beauty",
    workType: "Makeup Artist",
    fullName: "Glamour Makeup Studio",
    completedProjects: 178,
    repeatClients: 90,
    satisfactionRate: 97,
    responseTime: "Within 2 hours",
    activeWithin: "Within 20 km of UI Area",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Makeup", "Bridal Makeup", "Special Effects"],
    specialties: ["Bridal Makeup", "Editorial Makeup", "Special Occasions"],
    certifications: ["Certified Makeup Artist", "Beauty Specialist"],
    businessName: "Glamour Makeup Studio",
    hourlyRate: "₦5,000 - ₦15,000",
    minOrder: "₦10,000",
    businessHours: "8:00 AM - 8:00 PM",
    deliveryAvailable: true,
    onlineBookings: true,
    totalReviews: 178
  },
  {
    id: "7",
    name: "Capture Moments Photography",
    service_type: "Photographer",
    description: "Professional photography for all your special moments.",
    rating: "4.7",
    review_count: "165",
    image_url: "https://images.unsplash.com/photo-1514888286974-6d03bde4ba47?w=400&h=400&fit=crop&crop=face",
    district: "Bodija",
    location: "Bodija, Ibadan",
    is_verified: "TRUE",
    is_available: "TRUE",
    years_experience: "9",
    phone: "+234 807 890 1234",
    email: "capture.moments@example.com",
    businessType: "Photography",
    workType: "Photographer",
    fullName: "Capture Moments Photography",
    completedProjects: 165,
    repeatClients: 87,
    satisfactionRate: 96,
    responseTime: "Within 3 hours",
    activeWithin: "Within 25 km of Bodija",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Photography", "Videography", "Photo Editing"],
    specialties: ["Wedding Photography", "Portrait Photography", "Event Coverage"],
    certifications: ["Professional Photographer", "Editing Specialist"],
    businessName: "Capture Moments Photography",
    hourlyRate: "₦10,000 - ₦25,000",
    minOrder: "₦30,000",
    businessHours: "9:00 AM - 7:00 PM",
    deliveryAvailable: false,
    onlineBookings: true,
    totalReviews: 165
  },
  {
    id: "8",
    name: "Master Carpentry Works",
    service_type: "Carpenter",
    description: "Custom furniture and carpentry solutions for home and office.",
    rating: "4.6",
    review_count: "134",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=face",
    district: "Mokola",
    location: "Mokola, Ibadan",
    is_verified: "TRUE",
    is_available: "TRUE",
    years_experience: "11",
    phone: "+234 808 901 2345",
    email: "master.carpentry@example.com",
    businessType: "Carpentry",
    workType: "Carpenter",
    fullName: "Master Carpentry Works",
    completedProjects: 134,
    repeatClients: 84,
    satisfactionRate: 95,
    responseTime: "Within 4 hours",
    activeWithin: "Within 20 km of Mokola",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Carpentry", "Furniture Making", "Wood Repair"],
    specialties: ["Custom Furniture", "Cabinet Making", "Wood Restoration"],
    certifications: ["Certified Carpenter", "Woodworking Specialist"],
    businessName: "Master Carpentry Works",
    hourlyRate: "₦3,000 - ₦7,000",
    minOrder: "₦12,000",
    businessHours: "8:00 AM - 6:00 PM",
    deliveryAvailable: true,
    onlineBookings: true,
    totalReviews: 134
  },
  {
    id: "9",
    name: "Color Splash Painting",
    service_type: "Painter",
    description: "Professional painting services for interior and exterior walls.",
    rating: "4.5",
    review_count: "121",
    image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop&crop=face",
    district: "Iwo Road",
    location: "Iwo Road, Ibadan",
    is_verified: "TRUE",
    is_available: "TRUE",
    years_experience: "8",
    phone: "+234 809 012 3456",
    email: "colorsplash@example.com",
    businessType: "Painting",
    workType: "Painter",
    fullName: "Color Splash Painting",
    completedProjects: 121,
    repeatClients: 82,
    satisfactionRate: 94,
    responseTime: "Within 2 hours",
    activeWithin: "Within 15 km of Iwo Road",
    languages: ["English (Native)", "Yoruba (Fluent)"],
    services: ["Painting", "Wall Repair", "Color Consultation"],
    specialties: ["Interior Painting", "Exterior Painting", "Color Matching"],
    certifications: ["Licensed Painter", "Color Specialist"],
    businessName: "Color Splash Painting",
    hourlyRate: "₦2,500 - ₦5,000",
    minOrder: "₦8,000",
    businessHours: "7:00 AM - 5:00 PM",
    deliveryAvailable: false,
    onlineBookings: true,
    totalReviews: 121
  },
];

const VendorsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [filteredVendors, setFilteredVendors] = useState(demoVendors);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let results = demoVendors;

    if (selectedCategory !== "All Services") {
      results = results.filter(vendor => vendor.service_type === selectedCategory);
    }

    if (searchTerm) {
      results = results.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVendors(results);
  }, [searchTerm, selectedCategory]);

  const handleContact = (vendor, method) => {
    switch(method) {
      case 'call':
        window.location.href = `tel:${vendor.phone}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${vendor.phone.replace(/\D/g, '')}`, '_blank');
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

  return (
    <div className="min-h-screen bg-gray-50 font-manrope flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8 mt-12">
          <div className="flex items-center gap-3 mb-2">
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
          <p className="text-gray-600 text-sm lg:text-base ml-11">
            Find trusted local service providers in Ibadan
          </p>
        </div>

        <div className="mb-6 lg:mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm lg:text-base" />
            </div>
            <input
              type="text"
              placeholder="Search vendors..."
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
            {/* Filter icon removed as requested */}
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

        <div className="mb-4 lg:mb-6">
          <p className="text-gray-600 text-sm lg:text-base">
            Showing {filteredVendors.length} vendors
            {selectedCategory !== "All Services" && ` in ${selectedCategory}`}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {filteredVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
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
                        {vendor.service_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 lg:mb-4">
                      <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
                      <span className="text-gray-600 text-xs lg:text-sm font-medium truncate">
                        {vendor.location}
                      </span>
                    </div>

                    <div className="mb-3 lg:mb-4 pl-0">
                      <p className="text-gray-700 leading-relaxed text-xs lg:text-sm line-clamp-2">
                        {vendor.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-3 lg:pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-2 lg:gap-3">
                    <button
                      onClick={() => handleShowContact(vendor)}
                      className="
                        w-full 
                        py-2.5 lg:py-3
                        bg-[#06EAFC] hover:bg-[#6cf5ff]
                        text-black 
                        font-semibold
                        text-xs lg:text-sm
                        rounded-lg lg:rounded-xl
                        transition-all duration-200
                        hover:shadow-md
                        cursor-pointer
                        flex items-center justify-center gap-2
                      "
                    >
                      <FaUser className="text-black text-xs lg:text-sm" />
                      Show Contact
                    </button>

                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                      <button
                        onClick={() => handleContact(vendor, 'call')}
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
                        onClick={() => handleContact(vendor, 'whatsapp')}
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
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-12 max-w-md mx-auto shadow-sm border border-gray-200">
              <h3 className="text-xl lg:text-2xl text-gray-800 mb-3 lg:mb-4 font-bold">
                No vendors found
              </h3>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                Try adjusting your search or filters
              </p>
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
            </div>
          </div>
        )}
      </main>

      <Footer />

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

export default VendorsPage;