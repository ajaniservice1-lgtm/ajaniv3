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
  FaClock
} from "react-icons/fa";

// ======================= VENDOR MODAL COMPONENT =======================
const VendorModal = ({ vendor, isOpen, onClose }) => {
  // ... (keep your existing VendorModal component as is)
  // (The VendorModal component you provided remains unchanged)
};

// ======================= VENDOR SERVICE FUNCTIONS =======================

// Function to get all registered vendors from localStorage
const getAllRegisteredVendors = () => {
  try {
    // Get vendors from registration flow
    const vendorProfile = JSON.parse(localStorage.getItem("vendorCompleteProfile") || "null");
    const currentVendor = JSON.parse(localStorage.getItem("currentVendor") || "null");
    
    // Get pending vendors from registration steps
    const process1Data = JSON.parse(localStorage.getItem("vendorProcess1Data") || "null");
    const process2Data = JSON.parse(localStorage.getItem("vendorProcess2Data") || "null");
    const tempVendorData = JSON.parse(localStorage.getItem("tempVendorData") || "null");
    
    const vendors = [];
    
    // Add complete vendor profile
    if (vendorProfile) {
      vendors.push({
        id: `real_${vendorProfile.id || Date.now()}`,
        name: vendorProfile.businessName || `${vendorProfile.firstName}'s Business`,
        service_type: vendorProfile.workType || "Service Provider",
        description: vendorProfile.description || "Professional service provider",
        rating: "4.5", // New vendors start with base rating
        review_count: "0",
        image_url: vendorProfile.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        district: vendorProfile.location?.split(",")[0] || "City",
        location: vendorProfile.location || "Location not specified",
        is_verified: vendorProfile.status ? "TRUE" : "FALSE",
        is_available: "TRUE",
        years_experience: vendorProfile.yearsExperience || "1",
        phone: vendorProfile.phone || "+234 000 000 0000",
        email: vendorProfile.email || "vendor@example.com",
        businessType: vendorProfile.businessType || "Services",
        workType: vendorProfile.workType || "Service Provider",
        fullName: vendorProfile.fullName || `${vendorProfile.firstName} ${vendorProfile.lastName}`,
        completedProjects: vendorProfile.completedProjects || 0,
        repeatClients: vendorProfile.repeatClients || 0,
        satisfactionRate: vendorProfile.satisfactionRate || 0,
        responseTime: vendorProfile.responseTime || "Within 2 hours",
        activeWithin: vendorProfile.activeWithin || "Within 15 km",
        languages: vendorProfile.languages || ["English (Native)"],
        services: vendorProfile.services || [vendorProfile.workType || "General Services"],
        specialties: vendorProfile.specialties || ["New Vendor"],
        certifications: vendorProfile.certifications || [],
        businessName: vendorProfile.businessName || `${vendorProfile.firstName}'s Business`,
        hourlyRate: vendorProfile.hourlyRate || "₦0 - ₦0",
        minOrder: vendorProfile.minOrder || "₦0",
        businessHours: vendorProfile.businessHours || "9:00 AM - 6:00 PM",
        deliveryAvailable: vendorProfile.deliveryAvailable || false,
        onlineBookings: vendorProfile.onlineBookings || true,
        totalReviews: 0
      });
    }
    
    // Add current vendor (might be duplicate but ensures we capture all)
    if (currentVendor && !vendors.some(v => v.email === currentVendor.email)) {
      vendors.push({
        id: `current_${currentVendor.id || Date.now() + 1}`,
        name: currentVendor.businessName || `${currentVendor.firstName}'s Business`,
        service_type: currentVendor.workType || "Service Provider",
        description: currentVendor.description || "Professional service provider",
        rating: "4.5",
        review_count: "0",
        image_url: currentVendor.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        district: currentVendor.location?.split(",")[0] || "City",
        location: currentVendor.location || "Location not specified",
        is_verified: "TRUE",
        is_available: "TRUE",
        years_experience: currentVendor.yearsExperience || "1",
        phone: currentVendor.phone || "+234 000 000 0000",
        email: currentVendor.email || "vendor@example.com",
        businessType: currentVendor.businessType || "Services",
        workType: currentVendor.workType || "Service Provider",
        fullName: currentVendor.fullName || `${currentVendor.firstName} ${currentVendor.lastName}`,
        completedProjects: 0,
        repeatClients: 0,
        satisfactionRate: 0,
        responseTime: "Within 2 hours",
        activeWithin: "Within 15 km",
        languages: ["English (Native)"],
        services: [currentVendor.workType || "General Services"],
        specialties: ["New Vendor"],
        certifications: [],
        businessName: currentVendor.businessName || `${currentVendor.firstName}'s Business`,
        hourlyRate: "₦0 - ₦0",
        minOrder: "₦0",
        businessHours: "9:00 AM - 6:00 PM",
        deliveryAvailable: false,
        onlineBookings: true,
        totalReviews: 0
      });
    }
    
    // Add vendors from intermediate registration steps
    const registrationData = process2Data || process1Data || tempVendorData;
    if (registrationData && !vendors.some(v => v.email === registrationData.email)) {
      vendors.push({
        id: `reg_${Date.now() + 2}`,
        name: `${registrationData.firstName}'s ${registrationData.workType || "Business"}`,
        service_type: registrationData.workType || "Service Provider",
        description: registrationData.description || "Professional service provider",
        rating: "4.5",
        review_count: "0",
        image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
        district: registrationData.location?.split(",")[0] || "City",
        location: registrationData.location || "Location not specified",
        is_verified: "FALSE",
        is_available: "TRUE",
        years_experience: registrationData.yearsExperience || "1",
        phone: registrationData.phone || "+234 000 000 0000",
        email: registrationData.email || "vendor@example.com",
        businessType: registrationData.businessType || "Services",
        workType: registrationData.workType || "Service Provider",
        fullName: `${registrationData.firstName} ${registrationData.lastName}`,
        completedProjects: 0,
        repeatClients: 0,
        satisfactionRate: 0,
        responseTime: "Within 2 hours",
        activeWithin: "Within 15 km",
        languages: ["English (Native)"],
        services: [registrationData.workType || "General Services"],
        specialties: ["New Vendor"],
        certifications: [],
        businessName: `${registrationData.firstName}'s ${registrationData.workType || "Business"}`,
        hourlyRate: "₦0 - ₦0",
        minOrder: "₦0",
        businessHours: "9:00 AM - 6:00 PM",
        deliveryAvailable: false,
        onlineBookings: true,
        totalReviews: 0
      });
    }
    
    return vendors;
  } catch (error) {
    console.error("Error loading registered vendors:", error);
    return [];
  }
};

// Function to get all verified vendors (combines real and demo data)
const getAllVendors = () => {
  const registeredVendors = getAllRegisteredVendors();
  
  // Your existing demo vendors
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
    // Add 2-3 more demo vendors if needed, but leave space for real ones
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
    }
  ];
  
  // Combine registered vendors with demo vendors, avoiding duplicates by email
  const allVendors = [...registeredVendors];
  const registeredEmails = new Set(registeredVendors.map(v => v.email));
  
  demoVendors.forEach(demoVendor => {
    if (!registeredEmails.has(demoVendor.email)) {
      allVendors.push(demoVendor);
    }
  });
  
  return allVendors;
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
  "Painter"
];

// ======================= MAIN VENDORS PAGE =======================
const VendorsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadVendors();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [searchTerm, selectedCategory]);

  const loadVendors = () => {
    setIsLoading(true);
    try {
      const allVendors = getAllVendors();
      setFilteredVendors(allVendors);
    } catch (error) {
      console.error("Error loading vendors:", error);
      // Fallback to demo data
      const demoVendors = getAllVendors().slice(0, 3);
      setFilteredVendors(demoVendors);
    }
    setIsLoading(false);
  };

  const filterVendors = () => {
    let results = getAllVendors();

    if (selectedCategory !== "All Services") {
      results = results.filter(vendor => 
        vendor.service_type === selectedCategory || 
        vendor.workType === selectedCategory ||
        vendor.businessType?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(vendor =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.service_type.toLowerCase().includes(term) ||
        vendor.description.toLowerCase().includes(term) ||
        vendor.location.toLowerCase().includes(term) ||
        vendor.workType?.toLowerCase().includes(term) ||
        vendor.businessType?.toLowerCase().includes(term)
      );
    }

    setFilteredVendors(results);
  };

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

  const handleRefresh = () => {
    loadVendors();
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
            Find trusted local service providers in Ibadan
            {getAllRegisteredVendors().length > 0 && 
              ` • ${getAllRegisteredVendors().length} registered vendor${getAllRegisteredVendors().length > 1 ? 's' : ''} from your area`
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
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Loading vendors...
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Show registered vendors first */}
            {getAllRegisteredVendors().length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Registered Vendors ({getAllRegisteredVendors().length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
                  {getAllRegisteredVendors()
                    .filter(vendor => 
                      filteredVendors.some(fv => fv.id === vendor.id)
                    )
                    .map((vendor, index) => (
                      <VendorCard 
                        key={`registered_${vendor.id}`} 
                        vendor={vendor} 
                        index={index}
                        onShowContact={handleShowContact}
                        onContact={handleContact}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Show all other vendors */}
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

        {!isLoading && filteredVendors.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-12 max-w-md mx-auto shadow-sm border border-gray-200">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl lg:text-2xl text-gray-800 mb-3 lg:mb-4 font-bold">
                No vendors found
              </h3>
              <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
                {getAllRegisteredVendors().length === 0 
                  ? "Try registering as a vendor or check back later for available services."
                  : "Try adjusting your search or filters"
                }
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
                {getAllRegisteredVendors().length === 0 && (
                  <button
                    onClick={handleAddVendor}
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
                )}
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
            {vendor.id.startsWith('real_') && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow-sm text-xs px-1">
                New
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
              {vendor.id.startsWith('real_') && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Registered
                </span>
              )}
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
              onClick={() => onShowContact(vendor)}
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
                onClick={() => onContact(vendor, 'call')}
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
                onClick={() => onContact(vendor, 'whatsapp')}
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