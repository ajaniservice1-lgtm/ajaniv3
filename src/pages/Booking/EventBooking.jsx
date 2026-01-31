import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faCalendar, faUsers, faClock, 
  faMusic, faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt, faShieldAlt,
  faBirthdayCake, faGlassCheers,
  faMicrophone, faCamera, faVideo, 
  faChevronLeft, faNotesMedical,
  faChair, faWifi
} from "@fortawesome/free-solid-svg-icons";

const EventBooking = ({ vendorData: propVendorData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    eventType: "birthday",
    eventDate: "",
    startTime: "14:00",
    endTime: "18:00",
    numberOfGuests: 50,
    eventName: "",
    contactPerson: {
      firstName: "",
      lastName: "",
      phone: "",
      email: ""
    },
    specialRequirements: "",
    equipment: {
      soundSystem: false,
      projector: false,
      microphone: false,
      stage: false,
      seating: false,
      wifi: false
    },
    setupTime: "1",
    selectedPrice: 10000
  });

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  // BRAND COLORS
  const brandColors = {
    primary: "#66ccff",
    primaryDark: "#4d94ff",
    accent: "#00cc99",
    accentLight: "#e6f7f2",
    light: "#f0f9ff",
    dark: "#1a365d"
  };

  // Price options from ₦10,000 to ₦500,000
  const priceOptions = [
    { value: 10000, label: "₦10,000" },
    { value: 25000, label: "₦25,000" },
    { value: 50000, label: "₦50,000" },
    { value: 75000, label: "₦75,000" },
    { value: 100000, label: "₦100,000" },
    { value: 150000, label: "₦150,000" },
    { value: 200000, label: "₦200,000" },
    { value: 250000, label: "₦250,000" },
    { value: 300000, label: "₦300,000" },
    { value: 350000, label: "₦350,000" },
    { value: 400000, label: "₦400,000" },
    { value: 450000, label: "₦450,000" },
    { value: 500000, label: "₦500,000" }
  ];

  const eventTypes = [
    { id: "birthday", name: "Birthday Party", icon: faBirthdayCake },
    { id: "wedding", name: "Wedding Reception", icon: faGlassCheers },
    { id: "corporate", name: "Corporate Event", icon: faUsers },
    { id: "conference", name: "Conference", icon: faMicrophone },
    { id: "baby-shower", name: "Baby Shower", icon: faUsers },
    { id: "other", name: "Other Event", icon: faMusic }
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
      const prefix = "EVENT-";
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
    setBookingData(prev => ({ ...prev, eventDate: formattedDate }));

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

  // Handle guest input directly
  const handleGuestInputChange = (e) => {
    const value = e.target.value;
    
    // Allow empty input
    if (value === "") {
      setBookingData(prev => ({ ...prev, numberOfGuests: 0 }));
      return;
    }
    
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 5 digits (max 99999 guests)
    const limitedValue = numericValue.slice(0, 5);
    
    // Convert to number
    const numValue = parseInt(limitedValue) || 0;
    
    // Update the actual booking data
    setBookingData(prev => ({ ...prev, numberOfGuests: numValue }));
  };

  const handlePriceChange = (priceValue) => {
    setBookingData(prev => ({ ...prev, selectedPrice: priceValue }));
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

  // Handle guest change via buttons
  const handleGuestChange = (operation) => {
    const currentGuests = bookingData.numberOfGuests || 0;
    const newValue = operation === 'increase' 
      ? currentGuests + 1
      : Math.max(0, currentGuests - 1);
    
    setBookingData(prev => ({ ...prev, numberOfGuests: newValue }));
  };

  const handleEquipmentChange = (equipmentName) => {
    setBookingData(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentName]: !prev.equipment[equipmentName]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = [
      { field: bookingData.eventDate, name: "Event Date" },
      { field: bookingData.eventName, name: "Event Name" },
      { field: bookingData.contactPerson.firstName, name: "First Name" },
      { field: bookingData.contactPerson.lastName, name: "Last Name" },
      { field: bookingData.contactPerson.email, name: "Email Address" },
      { field: bookingData.contactPerson.phone, name: "Phone Number" },
      { field: bookingData.selectedPrice, name: "Event Package Price" }
    ];

    // Validate number of guests
    if (!bookingData.numberOfGuests || bookingData.numberOfGuests < 1) {
      alert("Please enter a valid number of guests (minimum: 1)");
      return;
    }

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
        type: "event",
        vendorData: vendorData,
        bookingData: bookingData,
        bookingId: bookingId,
        totalAmount: calculateTotal(),
        timestamp: Date.now()
      };
      
      localStorage.setItem("pendingEventBooking", JSON.stringify(pendingBooking));
      
      navigate("/login", { 
        state: { 
          message: "Please login or continue as guest to complete your event booking",
          fromBooking: true,
          intent: "event_booking",
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
      bookingType: 'event',
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
      localStorage.setItem('pendingGuestEventBooking', JSON.stringify(completeBooking));
    } else {
      localStorage.setItem('pendingLoggedInEventBooking', JSON.stringify(completeBooking));
    }
    
    localStorage.removeItem('pendingEventBooking');
    
    navigate('/booking/payment', { 
      state: { 
        bookingData: completeBooking,
        bookingType: 'event',
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
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) slots.push(`${hour.toString().padStart(2, '0')}:30`);
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
    // Use selected price from user choice
    const basePrice = bookingData.selectedPrice;
    // Equipment is free (0 cost)
    const equipmentCost = Object.values(bookingData.equipment).filter(v => v).length * 0;
    
    return basePrice + equipmentCost;
  };

  const calculateDuration = () => {
    const start = parseInt(bookingData.startTime.split(':')[0]);
    const end = parseInt(bookingData.endTime.split(':')[0]);
    const duration = end - start;
    return duration > 0 ? duration : duration + 24;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto"
                 style={{ borderColor: brandColors.primary }}></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                 style={{ backgroundColor: `${brandColors.primary}20` }}>
              <FontAwesomeIcon icon={faMusic} style={{ color: brandColors.primary }} className="text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Event Venue Selected</h2>
            <p className="text-gray-600 mb-5">Please select an event venue before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-sm"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.primaryDark})`,
                '&:hover': { opacity: 0.9 }
              }}
            >
              ← Go Back & Select Venue
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
  const duration = calculateDuration();

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
                <span className="font-medium">Back to venue selection</span>
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="px-1 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    Book Your Event
                  </h1>
                  <p className="text-sm text-gray-600">
                    Plan your perfect event with us
                  </p>
                </div>

                {/* Venue Preview Card */}
                <div className="mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 border border-blue-100"
                     style={{ borderColor: `${brandColors.primary}40`, backgroundColor: `${brandColors.light}20` }}>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
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
                            {vendorData.name || "Grand Event Hall"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: brandColors.primary }} />
                            <span className="truncate">{vendorData.area || vendorData.location || "Victoria Island, Lagos"}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${brandColors.primary}20`, color: brandColors.primaryDark }}>
                          Event Venue
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                               style={{ backgroundColor: `${brandColors.primary}20` }}>
                            <FontAwesomeIcon icon={faUsers} style={{ color: brandColors.primary }} className="text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Capacity</p>
                            <p className="font-medium text-xs">{vendorData.capacity || "Up to 500 guests"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                               style={{ backgroundColor: `${brandColors.accent}20` }}>
                            <FontAwesomeIcon icon={faChair} style={{ color: brandColors.accent }} className="text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Venue Type</p>
                            <p className="font-medium text-xs">{vendorData.venueType || "Banquet Hall"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        {vendorData.description || "Elegant event space perfect for weddings, corporate events, and celebrations with full amenities."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Event Type Selection */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faMusic} style={{ color: brandColors.primary }} className="text-sm" />
                    Event Type
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {eventTypes.map((event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setBookingData(prev => ({ ...prev, eventType: event.id }))}
                        className={`p-2 sm:p-3 rounded-lg border transition-all cursor-pointer text-left ${
                          bookingData.eventType === event.id 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        style={bookingData.eventType === event.id ? {
                          borderColor: brandColors.primary,
                          backgroundColor: `${brandColors.primary}10`,
                          color: brandColors.primaryDark
                        } : {}}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            bookingData.eventType === event.id ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                          style={bookingData.eventType === event.id ? { backgroundColor: `${brandColors.primary}20` } : {}}>
                            <FontAwesomeIcon 
                              icon={event.icon} 
                              className={`text-sm ${bookingData.eventType === event.id ? 'text-blue-600' : 'text-gray-600'}`}
                              style={bookingData.eventType === event.id ? { color: brandColors.primary } : {}}
                            />
                          </div>
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Details Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendar} style={{ color: brandColors.primary }} className="text-sm" />
                    Event Details
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        name="eventName"
                        value={bookingData.eventName}
                        onChange={handleInputChange}
                        placeholder="e.g., John & Jane's Wedding Reception"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        style={{ '--tw-ring-color': brandColors.primary }}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Event Date *
                        </label>
                        <input
                          type="date"
                          name="eventDate"
                          value={bookingData.eventDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          style={{ '--tw-ring-color': brandColors.primary }}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateForDisplay(bookingData.eventDate)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Start Time *
                        </label>
                        <select
                          name="startTime"
                          value={bookingData.startTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          style={{ '--tw-ring-color': brandColors.primary }}
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
                          End Time *
                        </label>
                        <select
                          name="endTime"
                          value={bookingData.endTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          style={{ '--tw-ring-color': brandColors.primary }}
                          required
                        >
                          {getTimeSlots().map(time => (
                            <option key={time} value={time}>
                              {formatTimeForDisplay(time)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FontAwesomeIcon icon={faClock} style={{ color: brandColors.primary }} />
                      <span>Event Duration: {duration} hours</span>
                    </div>
                  </div>
                </div>

                {/* Price Selection Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faStar} style={{ color: brandColors.primary }} className="text-sm" />
                    Select Event Package Price *
                  </h2>
                  
                  <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-3">
                      Choose your preferred package price
                    </label>
                    
                    {/* Price Buttons Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                      {priceOptions.map((price) => (
                        <button
                          key={price.value}
                          type="button"
                          onClick={() => handlePriceChange(price.value)}
                          className={`p-2 sm:p-3 rounded-lg border transition-all cursor-pointer text-center ${
                            bookingData.selectedPrice === price.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                          style={bookingData.selectedPrice === price.value ? {
                            borderColor: brandColors.primary,
                            backgroundColor: `${brandColors.primary}10`,
                            color: brandColors.primaryDark
                          } : {}}
                        >
                          <div className="font-medium text-sm">{price.label}</div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Custom Price Input */}
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Or enter custom amount (₦10,000 - ₦500,000)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                        <input
                          type="number"
                          min="10000"
                          max="500000"
                          step="1000"
                          value={bookingData.selectedPrice}
                          onChange={(e) => {
                            const value = Math.min(500000, Math.max(10000, parseInt(e.target.value) || 10000));
                            handlePriceChange(value);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          style={{ '--tw-ring-color': brandColors.primary }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Selected: {formatPrice(bookingData.selectedPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guests Section - SIMPLIFIED with just input field */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUsers} style={{ color: brandColors.primary }} className="text-sm" />
                    Number of Guests
                  </h2>
                  
                  <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-3">
                      Estimated number of guests *
                    </label>
                    
                    <div className="flex items-center justify-center gap-3">
                      {/* Decrease Button */}
                      <button
                        type="button"
                        onClick={() => handleGuestChange('decrease')}
                        className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center hover:bg-blue-50 transition-all cursor-pointer text-base font-bold flex-shrink-0"
                        style={{ 
                          borderColor: `${brandColors.primary}80`,
                          color: brandColors.primaryDark,
                          '&:hover': { borderColor: brandColors.primaryDark }
                        }}
                        title="Decrease guests"
                      >
                        -
                      </button>
                      
                      {/* Simple Input Field - No double display */}
                      <div className="relative w-full max-w-[140px]">
                        <input
                          type="text"
                          value={bookingData.numberOfGuests || ""}
                          onChange={handleGuestInputChange}
                          className="w-full text-center py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-2xl font-bold text-gray-900"
                          style={{ '--tw-ring-color': brandColors.primary }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <div className="absolute -bottom-5 left-0 right-0 text-center">
                          <div className="text-xs text-gray-600">
                            guest{bookingData.numberOfGuests !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Increase Button */}
                      <button
                        type="button"
                        onClick={() => handleGuestChange('increase')}
                        className="w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center hover:bg-emerald-50 transition-all cursor-pointer text-base font-bold flex-shrink-0"
                        style={{ 
                          borderColor: `${brandColors.accent}80`,
                          color: brandColors.accent,
                          '&:hover': { borderColor: brandColors.accent }
                        }}
                        title="Increase guests"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="mt-6 flex flex-col items-center gap-1">
                      <p className="text-xs text-center text-gray-500">
                        Type directly in the box, or use +/- buttons
                      </p>
                      
                    </div>
                  </div>
                </div>

                {/* Equipment & Services */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faVideo} style={{ color: brandColors.primary }} className="text-sm" />
                    Equipment & Services (Free)
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { name: 'soundSystem', label: 'Sound System', icon: faMusic },
                        { name: 'projector', label: 'Projector', icon: faVideo },
                        { name: 'microphone', label: 'Microphone', icon: faMicrophone },
                        { name: 'stage', label: 'Stage Setup', icon: faVideo },
                        { name: 'seating', label: 'Seating', icon: faChair },
                        { name: 'wifi', label: 'WiFi', icon: faWifi }
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleEquipmentChange(item.name)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            bookingData.equipment[item.name]
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          style={bookingData.equipment[item.name] ? {
                            borderColor: brandColors.primary,
                            backgroundColor: `${brandColors.primary}10`,
                            color: brandColors.primaryDark
                          } : {}}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${
                              bookingData.equipment[item.name] ? 'bg-blue-100' : 'bg-gray-100'
                            }`}
                            style={bookingData.equipment[item.name] ? { backgroundColor: `${brandColors.primary}20` } : {}}>
                              <FontAwesomeIcon 
                                icon={item.icon} 
                                className={`text-xs ${bookingData.equipment[item.name] ? 'text-blue-600' : 'text-gray-600'}`}
                                style={bookingData.equipment[item.name] ? { color: brandColors.primary } : {}}
                              />
                            </div>
                            <span className="text-xs font-medium">{item.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Setup Time Required (hours before event)
                      </label>
                      <select
                        name="setupTime"
                        value={bookingData.setupTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        style={{ '--tw-ring-color': brandColors.primary }}
                      >
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4 hours</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} style={{ color: brandColors.primary }} className="text-sm" />
                      Contact Person
                    </h2>
                    <p className="text-xs text-gray-600">Main contact for this event</p>
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
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            style={{ '--tw-ring-color': brandColors.primary }}
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
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                            style={{ '--tw-ring-color': brandColors.primary }}
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
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          style={{ '--tw-ring-color': brandColors.primary }}
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
                          className="w-full pl-20 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          style={{ '--tw-ring-color': brandColors.primary }}
                          required
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faNotesMedical} style={{ color: brandColors.primary }} className="text-sm" />
                    Special Requirements
                  </h2>
                  <div className="rounded-lg p-3" style={{ backgroundColor: `${brandColors.light}10` }}>
                    <textarea
                      name="specialRequirements"
                      value={bookingData.specialRequirements}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any specific requirements, theme details, accessibility needs, or other special arrangements..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm bg-transparent"
                      style={{ '--tw-ring-color': brandColors.primary }}
                    />
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="mt-6">
                  <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg" style={{ backgroundColor: `${brandColors.light}10` }}>
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                        className="w-3.5 h-3.5 rounded focus:ring-blue-500 cursor-pointer"
                        style={{ 
                          color: brandColors.primary,
                          '--tw-ring-color': brandColors.primary 
                        }}
                        required
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-900 leading-relaxed cursor-pointer">
                      By proceeding with this booking, I agree to Ajani's{' '}
                      <a href="/terms-service" onClick={(e) => e.stopPropagation()} 
                         className="underline hover:text-blue-600 transition-colors"
                         style={{ '--tw-text-opacity': '1', color: brandColors.primaryDark }}>
                        Terms of Use
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" onClick={(e) => e.stopPropagation()} 
                         className="underline hover:text-blue-600 transition-colors"
                         style={{ '--tw-text-opacity': '1', color: brandColors.primaryDark }}>
                        Privacy Policy
                      </a>.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                    style={{ 
                      backgroundColor: brandColors.primary,
                      '&:hover': { backgroundColor: brandColors.primaryDark }
                    }}
                  >
                    Proceed to Payment
                    <span className="ml-2">→</span>
                  </button>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 space-y-3">
                  {/* Summary Header */}
                  <div className="rounded-lg p-3 text-white"
                       style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.primaryDark})` }}>
                    <h3 className="text-base font-bold mb-1">Event Booking Summary</h3>
                    <p className="text-xs opacity-90">Booking ID: {bookingId}</p>
                  </div>
                  
                  {/* Venue Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-2.5">
                      <div className="flex items-start gap-2.5">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                          alt={vendorData.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{vendorData.name || "Grand Event Hall"}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{vendorData.rating || 4.8}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Event Type</span>
                          <span className="text-xs font-medium">
                            {eventTypes.find(e => e.id === bookingData.eventType)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Date</span>
                          <span className="text-xs font-medium">{formatDateForDisplay(bookingData.eventDate)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Time</span>
                          <span className="text-xs font-medium">
                            {formatTimeForDisplay(bookingData.startTime)} - {formatTimeForDisplay(bookingData.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Guests</span>
                          <span className="text-xs font-medium">{bookingData.numberOfGuests} guest{bookingData.numberOfGuests !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown - Updated */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">Price Breakdown</h5>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Event Package</span>
                          <span className="font-medium">{formatPrice(bookingData.selectedPrice)}</span>
                        </div>
                        
                        {/* Equipment Rental - Free */}
                        {Object.entries(bookingData.equipment).filter(([_, value]) => value).length > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Equipment Rental</span>
                            <span className="font-medium">₦0</span>
                          </div>
                        )}
                        
                        {/* Taxes & Fees */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">{formatPrice(taxes)}</span>
                        </div>
                        
                        {/* Service fee */}
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatPrice(serviceFee)}</span>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                          <span className="text-lg font-bold" style={{ color: brandColors.accent }}>
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          Full payment required
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Services Included */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">Services Included</h5>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} style={{ color: brandColors.accent }} className="text-xs" />
                          <span>Basic venue setup</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} style={{ color: brandColors.accent }} className="text-xs" />
                          <span>Security personnel</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} style={{ color: brandColors.accent }} className="text-xs" />
                          <span>Cleaning services</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faCheck} style={{ color: brandColors.accent }} className="text-xs" />
                          <span>Power supply</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} style={{ color: brandColors.accent }} />
                      <span className="font-medium">Event Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Free cancellation up to 7 days before event
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

export default EventBooking;