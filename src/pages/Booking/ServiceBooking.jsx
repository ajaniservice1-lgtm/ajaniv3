import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faCalendar, faClock, 
  faWrench, faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt, faShieldAlt,
  faCreditCard, faTools, faCar,
  faChevronLeft, faNotesMedical, faHome,
  faBriefcase, faPaintBrush, faPlane,
  faTruck, faFirstAid, faCogs
} from "@fortawesome/free-solid-svg-icons";

const ServiceBooking = ({ vendorData: propVendorData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    serviceType: "repair",
    serviceDate: "",
    serviceTime: "09:00",
    duration: "2",
    locationType: "residential",
    address: {
      street: "",
      city: "",
      state: "Lagos",
      postalCode: ""
    },
    contactPerson: {
      firstName: "",
      lastName: "",
      phone: "",
      email: ""
    },
    problemDescription: "",
    urgency: "standard",
    preferredProfessional: "any",
    specialRequirements: "",
    recurringService: false,
    recurrence: "none"
  });

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  const serviceTypes = [
    { id: "repair", name: "Repair Service", icon: faWrench, color: "blue" },
    { id: "cleaning", name: "Cleaning Service", icon: faHome, color: "green" },
    { id: "maintenance", name: "Maintenance", icon: faTools, color: "orange" },
    { id: "consultation", name: "Consultation", icon: faBriefcase, color: "purple" },
    { id: "installation", name: "Installation", icon: faCogs, color: "red" },
    { id: "other", name: "Other Service", icon: faTruck, color: "gray" }
  ];

  const urgencyLevels = [
    { id: "emergency", name: "Emergency", desc: "Within 2 hours", priceMultiplier: 2.5 },
    { id: "urgent", name: "Urgent", desc: "Same day", priceMultiplier: 1.5 },
    { id: "standard", name: "Standard", desc: "Next available slot", priceMultiplier: 1 }
  ];

  const locationTypes = [
    { id: "residential", name: "Residential", icon: faHome },
    { id: "commercial", name: "Commercial", icon: faBriefcase },
    { id: "industrial", name: "Industrial", icon: faTools }
  ];

  const checkAuthStatus = () => {
    const token = localStorage.getItem("auth_token");
    const guestSession = localStorage.getItem("guestSession");
    return !!(token || guestSession);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const generateBookingId = () => {
      const prefix = "SVC-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setBookingId(generateBookingId());

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setBookingData(prev => ({ ...prev, serviceDate: formattedDate }));

    const loadVendorData = () => {
      setLoading(true);
      
      let data = null;
      
      if (propVendorData) {
        data = propVendorData;
      } else if (location.state?.vendorData) {
        data = location.state.vendorData;
      } else {
        const savedData = localStorage.getItem('currentVendorBooking');
        if (savedData) {
          data = JSON.parse(savedData);
        }
      }
      
      setVendorData(data);
      
      const isAuthenticated = checkAuthStatus();
      if (isAuthenticated) {
        try {
          const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
          const userEmail = localStorage.getItem("user_email");
          const guestSession = localStorage.getItem("guestSession");
          
          if (userProfile.firstName || userProfile.lastName || userProfile.email || userEmail) {
            const userPhone = userProfile.phone || "";
            setPhoneInput(userPhone.replace(/^\+234/, ""));
            setBookingData(prev => ({
              ...prev,
              contactPerson: {
                firstName: userProfile.firstName || prev.contactPerson.firstName,
                lastName: userProfile.lastName || prev.contactPerson.lastName,
                email: userProfile.email || userEmail || prev.contactPerson.email,
                phone: userPhone || prev.contactPerson.phone
              },
              address: {
                ...prev.address,
                city: userProfile.city || prev.address.city,
                state: userProfile.state || prev.address.state
              }
            }));
          } else if (guestSession) {
            const session = JSON.parse(guestSession);
            if (session.email) {
              setBookingData(prev => ({
                ...prev,
                contactPerson: {
                  ...prev.contactPerson,
                  email: session.email
                }
              }));
            }
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
      
      setLoading(false);
    };

    loadVendorData();
  }, [propVendorData, location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setBookingData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    setPhoneInput(limitedDigits);
    
    const fullPhoneNumber = `+234${limitedDigits}`;
    setBookingData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        phone: fullPhoneNumber
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = [
      { field: bookingData.serviceDate, name: "Service Date" },
      { field: bookingData.contactPerson.firstName, name: "First Name" },
      { field: bookingData.contactPerson.lastName, name: "Last Name" },
      { field: bookingData.contactPerson.email, name: "Email Address" },
      { field: bookingData.contactPerson.phone, name: "Phone Number" },
      { field: bookingData.address.street, name: "Street Address" },
      { field: bookingData.address.city, name: "City" },
      { field: bookingData.problemDescription, name: "Problem Description" }
    ];

    const missingFields = requiredFields.filter(f => !f.field || f.field.toString().trim() === "");
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n${missingFields.map(f => `• ${f.name}`).join('\n')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.contactPerson.email)) {
      alert("Please enter a valid email address");
      return;
    }

    const phoneDigits = bookingData.contactPerson.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 13) {
      alert("Please enter a complete 10-digit Nigerian phone number");
      return;
    }

    if (!isTermsAccepted) {
      alert("You must accept the terms and conditions to proceed");
      return;
    }

    const isAuthenticated = checkAuthStatus();
    
    if (!isAuthenticated) {
      const pendingBooking = {
        type: "service",
        vendorData: vendorData,
        bookingData: bookingData,
        bookingId: bookingId,
        totalAmount: calculateTotal(),
        timestamp: Date.now()
      };
      
      localStorage.setItem("pendingServiceBooking", JSON.stringify(pendingBooking));
      
      navigate("/login", { 
        state: { 
          message: "Please login or continue as guest to complete your service booking",
          fromBooking: true,
          intent: "service_booking",
          returnTo: "/booking/payment"
        } 
      });
      return;
    }

    const guestSession = localStorage.getItem("guestSession");
    const isGuest = !!guestSession;
    
    const completeBooking = {
      vendorData: vendorData,
      bookingData: bookingData,
      bookingType: 'service',
      bookingDate: new Date().toISOString(),
      bookingId: bookingId,
      status: "pending",
      totalAmount: calculateTotal(),
      timestamp: Date.now(),
      ...(isGuest ? {
        isGuestBooking: true,
        guestSessionId: JSON.parse(guestSession).sessionId,
        guestEmail: JSON.parse(guestSession).email
      } : {
        userId: JSON.parse(localStorage.getItem("userProfile") || "{}")._id || null,
        userEmail: localStorage.getItem("user_email")
      }),
      termsAccepted: isTermsAccepted
    };

    if (isGuest) {
      localStorage.setItem('pendingGuestServiceBooking', JSON.stringify(completeBooking));
    } else {
      localStorage.setItem('pendingLoggedInServiceBooking', JSON.stringify(completeBooking));
    }
    
    localStorage.removeItem('pendingServiceBooking');
    
    navigate('/booking/payment', { 
      state: { 
        bookingData: completeBooking,
        bookingType: 'service',
        isGuestBooking: isGuest || false
      } 
    });
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeForDisplay = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const calculateTotal = () => {
    const basePrice = vendorData?.priceFrom || 15000;
    const durationMultiplier = parseInt(bookingData.duration) / 2;
    const urgencyMultiplier = urgencyLevels.find(u => u.id === bookingData.urgency)?.priceMultiplier || 1;
    const locationMultiplier = bookingData.locationType === 'commercial' ? 1.2 : 
                              bookingData.locationType === 'industrial' ? 1.5 : 1;
    
    return Math.round(basePrice * durationMultiplier * urgencyMultiplier * locationMultiplier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-3 py-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faWrench} className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Service Provider Selected</h2>
            <p className="text-gray-600 mb-5">Please select a service provider before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-sm"
            >
              ← Go Back & Select Service
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const total = calculateTotal();
  const serviceFee = 0;
  const taxes = 0;
  const urgencyMultiplier = urgencyLevels.find(u => u.id === bookingData.urgency)?.priceMultiplier || 1;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-0">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          {/* Stepper */}
          <div className="mb-4 sm:mb-8">
            <Stepper currentStep={1} />
          </div>
          
          {/* Main Card */}
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Back Button */}
            <div className="px-3 sm:px-6 pt-3 sm:pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                <span className="font-medium">Back to service selection</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="px-1 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    Book Professional Service
                  </h1>
                  <p className="text-sm text-gray-600">
                    Schedule your service appointment
                  </p>
                </div>

                {/* Service Provider Preview Card */}
                <div className="mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12"} 
                        alt={vendorData.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        {vendorData.rating || 4.8}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            {vendorData.name || "ProFix Solutions"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{vendorData.area || vendorData.location || "Lagos, Nigeria"}</span>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Verified Professional
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faWrench} className="text-blue-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Specialty</p>
                            <p className="font-medium text-xs">{vendorData.specialty || "General Repairs"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-cyan-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faBriefcase} className="text-cyan-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="font-medium text-xs">{vendorData.experience || "10+ years"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        {vendorData.description || "Professional service provider with expertise in repairs, maintenance, and installations. Licensed and insured."}
                      </p>
                    </div>
                  </div>
                </div>

             

               

                {/* Service Details */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-500 text-sm" />
                    Service Schedule
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Service Date *
                        </label>
                        <input
                          type="date"
                          name="serviceDate"
                          value={bookingData.serviceDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateForDisplay(bookingData.serviceDate)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Preferred Time *
                        </label>
                        <select
                          name="serviceTime"
                          value={bookingData.serviceTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        >
                          {getTimeSlots().map(time => (
                            <option key={time} value={time}>
                              {formatTimeForDisplay(time)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Estimated Duration
                        </label>
                        <select
                          name="duration"
                          value={bookingData.duration}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        >
                          <option value="1">1 hour</option>
                          <option value="2">2 hours</option>
                          <option value="3">3 hours</option>
                          <option value="4">4 hours</option>
                          <option value="5">5+ hours</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 text-sm" />
                    Service Location
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Location Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {locationTypes.map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => setBookingData(prev => ({ ...prev, locationType: location.id }))}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              bookingData.locationType === location.id 
                                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={location.icon} className="text-sm" />
                              <span className="text-sm font-medium">{location.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={bookingData.address.street}
                          onChange={handleInputChange}
                          placeholder="123 Main Street"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={bookingData.address.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          State *
                        </label>
                        <select
                          name="address.state"
                          value={bookingData.address.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        >
                          <option value="Lagos">Lagos</option>
                          <option value="Abuja">Abuja</option>
                          <option value="Rivers">Rivers</option>
                          <option value="Kano">Kano</option>
                          <option value="Oyo">Oyo</option>
                          <option value="Edo">Edo</option>
                          <option value="Delta">Delta</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="address.postalCode"
                          value={bookingData.address.postalCode}
                          onChange={handleInputChange}
                          placeholder="Postal Code"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faNotesMedical} className="text-blue-500 text-sm" />
                    Service Details
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Problem Description *
                      </label>
                      <textarea
                        name="problemDescription"
                        value={bookingData.problemDescription}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Please describe the problem or service needed in detail..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Special Requirements (Optional)
                      </label>
                      <textarea
                        name="specialRequirements"
                        value={bookingData.specialRequirements}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Any specific requirements, materials needed, or additional information..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="recurringService"
                        name="recurringService"
                        checked={bookingData.recurringService}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="recurringService" className="text-sm text-gray-700 cursor-pointer">
                        This is a recurring service
                      </label>
                    </div>
                    
                    {bookingData.recurringService && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Recurrence Schedule
                        </label>
                        <select
                          name="recurrence"
                          value={bookingData.recurrence}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        >
                          <option value="none">None</option>
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500 text-sm" />
                      Contact Information
                    </h2>
                    <p className="text-xs text-gray-600">Who should we contact about this service?</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          First Name *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="contactPerson.firstName"
                            value={bookingData.contactPerson.firstName}
                            onChange={handleInputChange}
                            placeholder="FirstName"
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Last Name *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                          <input
                            type="text"
                            name="contactPerson.lastName"
                            value={bookingData.contactPerson.lastName}
                            onChange={handleInputChange}
                            placeholder="LastName"
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="email"
                          name="contactPerson.email"
                          value={bookingData.contactPerson.email}
                          onChange={handleInputChange}
                          placeholder="your email address"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <FontAwesomeIcon icon={faPhone} className="text-gray-400 text-sm mr-1" />
                          <span className="text-xs text-gray-500">+234</span>
                        </div>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={handlePhoneChange}
                          placeholder="800 000 0000"
                          className="w-full pl-20 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                          maxLength={10}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Preferred Professional
                      </label>
                      <select
                        name="preferredProfessional"
                        value={bookingData.preferredProfessional}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                      >
                        <option value="any">Any available professional</option>
                        <option value="experienced">Experienced professional only</option>
                        <option value="specific">Request specific professional</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="mt-6">
                  <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg">
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        required
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-900 leading-relaxed cursor-pointer">
                      By proceeding with this booking, I agree to Ajani's{' '}
                      <a href="/terms-service" onClick={(e) => e.stopPropagation()} className="underline hover:text-blue-600 transition-colors">Terms of Use</a>{' '}
                      and{' '}
                      <a href="/privacy" onClick={(e) => e.stopPropagation()} className="underline hover:text-blue-600 transition-colors">Privacy Policy</a>.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                  >
                    Schedule Service
                    <span className="ml-2">→</span>
                  </button>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 space-y-3">
                  {/* Summary Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-3 text-white">
                    <h3 className="text-base font-bold mb-1">Service Booking Summary</h3>
                    <p className="text-xs opacity-90">Booking ID: {bookingId}</p>
                  </div>
                  
                  {/* Service Provider Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-2.5">
                      <div className="flex items-start gap-2.5">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1581094794329-c8112a89af12"} 
                          alt={vendorData.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{vendorData.name || "ProFix Solutions"}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{vendorData.rating || 4.8}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Service Type</span>
                          <span className="text-xs font-medium">
                            {serviceTypes.find(s => s.id === bookingData.serviceType)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Date</span>
                          <span className="text-xs font-medium">{formatDateForDisplay(bookingData.serviceDate)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Time</span>
                          <span className="text-xs font-medium">
                            {formatTimeForDisplay(bookingData.serviceTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Duration</span>
                          <span className="text-xs font-medium">{bookingData.duration} hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">Price Estimate</h5>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Base service fee ({bookingData.duration} hours)</span>
                          <span className="font-medium">{formatPrice((vendorData?.priceFrom || 15000) * (parseInt(bookingData.duration) / 2))}</span>
                        </div>
                        
                        {urgencyMultiplier > 1 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Urgency fee ({bookingData.urgency})</span>
                            <span className="font-medium text-amber-600">
                              +{formatPrice((calculateTotal() * (urgencyMultiplier - 1)) / urgencyMultiplier)}
                            </span>
                          </div>
                        )}
                        
                        {bookingData.locationType !== 'residential' && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Location surcharge</span>
                            <span className="font-medium">
                              {bookingData.locationType === 'commercial' ? '+20%' : '+50%'}
                            </span>
                          </div>
                        )}
                        
                        {/* Taxes & Fees */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">{formatPrice(taxes)}</span>
                        </div>
                        
                        {/* Service fee */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Platform fee</span>
                          <span className="font-medium">{formatPrice(serviceFee)}</span>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">Estimated Total</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          Final price may vary based on actual service requirements
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Included Services */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">What's Included</h5>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                          <span>Professional assessment</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                          <span>Service completion</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                          <span>Basic materials (if specified)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500 text-xs" />
                          <span>30-day service warranty</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="font-medium">Service Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Satisfaction guaranteed or your money back
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ServiceBooking;