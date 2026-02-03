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
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
    // Remove selectedPrice since we're using fixed range
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

  // FIXED PRICE RANGE - like restaurant ₦1,000 - 10,000
  const priceFrom = 100000;
  const priceTo = 500000;

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

  // Show toast notification
  const showToast = (message, type = "error") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
    });
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
      { field: bookingData.contactPerson.phone, name: "Phone Number" }
    ];

    // Validate number of guests
    if (!bookingData.numberOfGuests || bookingData.numberOfGuests < 1) {
      showToast("Please enter a valid number of guests (minimum: 1)");
      return;
    }

    const missingFields = requiredFields.filter(f => !f.field || f.field.toString().trim() === "");
    
    if (missingFields.length > 0) {
      showToast(`Please fill in all required fields:\n${missingFields.map(f => `• ${f.name}`).join('\n')}`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.contactPerson.email)) {
      showToast("Please enter a valid email address");
      return;
    }

    const phoneDigits = bookingData.contactPerson.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 13) {
      showToast("Please enter a complete 10-digit Nigerian phone number");
      return;
    }

    if (!isTermsAccepted) {
      showToast("You must accept the terms and conditions to proceed");
      return;
    }

    const isAuthenticated = checkAuthStatus();
    
    if (!isAuthenticated) {
      const pendingBooking = {
        type: "event",
        vendorData: vendorData,
        bookingData: {
          ...bookingData,
          // Add price range data like restaurant
          priceFrom: priceFrom,
          priceTo: priceTo,
          totalPriceRange: `${priceFrom} - ${priceTo}`
        },
        bookingId: bookingId,
        totalAmount: formatPriceRange(priceFrom, priceTo),
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
    
    // IMPORTANT: Structure data exactly like restaurant booking for consistency
    const completeBooking = {
      type: "event",
      vendorData: vendorData,
      bookingData: {
        ...bookingData,
        // Add price range data like restaurant
        priceFrom: priceFrom,
        priceTo: priceTo,
        totalPriceRange: `${priceFrom} - ${priceTo}`,
        // Add contact person structure like restaurant
        contactPerson: {
          firstName: bookingData.contactPerson.firstName,
          lastName: bookingData.contactPerson.lastName,
          email: bookingData.contactPerson.email,
          phone: bookingData.contactPerson.phone
        }
      },
      bookingType: 'event',
      bookingDate: new Date().toISOString(),
      bookingId: bookingId,
      status: "pending",
      totalAmount: formatPriceRange(priceFrom, priceTo),
      timestamp: Date.now(),
      
      // Extract contact info to root level for easy access
      firstName: bookingData.contactPerson.firstName,
      lastName: bookingData.contactPerson.lastName,
      email: bookingData.contactPerson.email,
      phone: bookingData.contactPerson.phone,
      guests: { adults: bookingData.numberOfGuests },
      specialRequests: bookingData.specialRequirements,
      paymentMethod: "event", // Changed from "hotel" to "event"
      
      // Add price range data
      priceFrom: priceFrom,
      priceTo: priceTo,
      reservationFee: priceFrom, // Use priceFrom as base fee
      
      // Add user info
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

  const formatPriceRange = (from, to) => {
    const fromNum = from ? parseInt(from.toString().replace(/[^\d]/g, "")) : 0;
    const toNum = to ? parseInt(to.toString().replace(/[^\d]/g, "")) : 0;
    
    if (isNaN(fromNum) && isNaN(toNum)) return "₦ --";
    if (isNaN(fromNum)) return `₦${toNum.toLocaleString()}`;
    if (isNaN(toNum)) return `₦${fromNum.toLocaleString()}`;
    
    if (fromNum === toNum) return `₦${fromNum.toLocaleString()}`;
    
    return `₦${fromNum.toLocaleString()} - ${toNum.toLocaleString()}`;
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

  const duration = calculateDuration();
  const serviceFee = 0;
  const taxes = 0;
  const priceRange = formatPriceRange(priceFrom, priceTo);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ToastContainer />
      
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
                            <span className="truncate">{vendorData.area || vendorData.location || "Ibadan, Oyo State"}</span>
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
                            <p className="text-xs text-gray-500">Price Range</p>
                            <p className="font-medium text-xs" style={{ color: brandColors.accent }}>
                              {priceRange}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        {vendorData.description || "Elegant event space perfect for weddings, corporate events, and celebrations with full amenities."}
                      </p>
                    </div>
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

                    {/* Fixed Location Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Country
                        </label>
                        <input
                          type="text"
                          value="Nigeria"
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          State
                        </label>
                        <input
                          type="text"
                          value="Oyo"
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value="Ibadan"
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                          required
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
                  
                  {/* Price Breakdown - Shows fixed range like restaurant */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">Price Breakdown</h5>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Venue Booking Fee</span>
                          <span className="font-medium">{formatPrice(priceFrom)}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Estimated Event Cost</span>
                          <span className="font-medium">{priceRange}</span>
                        </div>
                        
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
                      
                      {/* Total - Shows price range */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-300">
                        <div className="text-center mb-2">
                          <span className="font-bold text-gray-900 text-sm">Total Estimated Cost</span>
                          <div className="text-lg font-bold" style={{ color: brandColors.accent }}>
                            {priceRange}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          Booking fee + estimated event cost
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Information - Fixed to Oyo State */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">Location</h5>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: brandColors.primary }} className="text-xs" />
                          <span className="font-medium">Nigeria, Oyo State, Ibadan</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          All events are currently limited to Oyo State, Nigeria
                        </p>
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