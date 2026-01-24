import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faCalendar, faUsers, faClock, 
  faUtensils, faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt, faShieldAlt,
  faCreditCard, faHotel, faConciergeBell,
  faChevronLeft, faNotesMedical, faReceipt
} from "@fortawesome/free-solid-svg-icons";

const RestaurantBooking = ({ vendorData: propVendorData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "19:00",
    numberOfGuests: 2,
    specialRequests: "",
    contactInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      email: ""
    }
  });

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("restaurant");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(false);

  // Auth Utility Functions
  const checkAuthStatus = () => {
    const token = localStorage.getItem("auth_token");
    const userProfile = localStorage.getItem("userProfile");
    const userEmail = localStorage.getItem("user_email");
    
    if (token && userEmail) {
      return true;
    }
    
    if (userProfile) {
      try {
        const parsed = JSON.parse(userProfile);
        return !!parsed.email;
      } catch (error) {
        return false;
      }
    }
    
    return false;
  };

  const isUserVerified = () => {
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      return profile?.isVerified || false;
    } catch (error) {
      return false;
    }
  };

  const checkGuestSession = () => {
    try {
      const guestSession = localStorage.getItem("guestSession");
      if (!guestSession) return null;
      
      const session = JSON.parse(guestSession);
      const now = Date.now();
      const expiresAt = new Date(session.expiresAt).getTime();
      
      if (now > expiresAt) {
        localStorage.removeItem("guestSession");
        return null;
      }
      
      return session;
    } catch (error) {
      localStorage.removeItem("guestSession");
      return null;
    }
  };

  const requireAuth = () => {
    // Check guest session first
    const guestSession = checkGuestSession();
    if (guestSession) {
      return { authenticated: false, verified: false, message: "guest_user", guest: true };
    }
    
    const isAuthenticated = checkAuthStatus();
    const isVerified = isUserVerified();
    
    if (!isAuthenticated) {
      return { authenticated: false, verified: false, message: "not_authenticated", guest: false };
    }
    
    if (!isVerified) {
      return { authenticated: true, verified: false, message: "not_verified", guest: false };
    }
    
    return { authenticated: true, verified: true, message: "authenticated", guest: false };
  };

  // Check guest status on mount
  useEffect(() => {
    const guestSession = checkGuestSession();
    setIsGuestUser(!!guestSession);
  }, []);

  // Fix 1: Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    // Generate booking ID
    const generateBookingId = () => {
      const prefix = "REST-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setBookingId(generateBookingId());

    // Pre-fill today's date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setBookingData(prev => ({ ...prev, date: formattedDate }));

    // Load vendor data
    const loadVendorData = () => {
      setLoading(true);
      
      // Priority: props > location state > localStorage
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
      
      // Pre-fill user data if logged in or guest
      const authStatus = requireAuth();
      if (authStatus.authenticated || authStatus.guest) {
        if (authStatus.guest) {
          // For guest users, get guest session data
          const guestSession = checkGuestSession();
          if (guestSession) {
            setBookingData(prev => ({
              ...prev,
              contactInfo: {
                firstName: guestSession.firstName || prev.contactInfo.firstName,
                lastName: guestSession.lastName || prev.contactInfo.lastName,
                email: guestSession.email || prev.contactInfo.email,
                phone: guestSession.phone || prev.contactInfo.phone
              }
            }));
          }
        } else {
          // For authenticated users
          try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            if (userProfile.firstName || userProfile.lastName || userProfile.email) {
              setBookingData(prev => ({
                ...prev,
                contactInfo: {
                  firstName: userProfile.firstName || prev.contactInfo.firstName,
                  lastName: userProfile.lastName || prev.contactInfo.lastName,
                  email: userProfile.email || prev.contactInfo.email,
                  phone: userProfile.phone || prev.contactInfo.phone
                }
              }));
            }
          } catch (error) {
            console.error("Failed to load user profile:", error);
          }
        }
      }
      
      setLoading(false);
    };

    loadVendorData();
  }, [propVendorData, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGuestChange = (operation) => {
    setBookingData(prev => ({
      ...prev,
      numberOfGuests: operation === 'increase' 
        ? prev.numberOfGuests + 1 
        : Math.max(1, prev.numberOfGuests - 1)
    }));
  };

  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Submit button clicked - Restaurant Booking");
    
    // Validate terms acceptance
    if (!isTermsAccepted) {
      alert("You must accept the terms and conditions to proceed");
      return;
    }

    // Validate data
    if (!bookingData.date || !bookingData.time || !bookingData.numberOfGuests) {
      alert("Please fill in all required fields");
      return;
    }

    if (!bookingData.contactInfo.firstName || !bookingData.contactInfo.lastName || 
        !bookingData.contactInfo.email || !bookingData.contactInfo.phone) {
      alert("Please fill in all contact information");
      return;
    }

    // Check authentication
    const authStatus = requireAuth();
    console.log("Auth status:", authStatus);
    
    if (!authStatus.authenticated && !authStatus.guest) {
      console.log("User not authenticated, saving pending booking");
      
      // Convert 24-hour time to 12-hour format for display
      const timeString = formatTimeForDisplay(bookingData.time);
      
      // Calculate total
      const total = calculateTotal();
      
      // Save current booking details to localStorage to restore after login
      const pendingBooking = {
        type: "restaurant",
        vendorData: vendorData,
        bookingData: {
          ...bookingData,
          time: timeString,
          paymentMethod: selectedPayment
        },
        bookingId: bookingId,
        totalAmount: total,
        timestamp: Date.now()
      };
      
      console.log("Saving pending booking:", pendingBooking);
      localStorage.setItem("pendingBookingData", JSON.stringify(pendingBooking));
      
      // Save redirect URL for after login
      localStorage.setItem("redirectAfterAuth", window.location.pathname);
      
      // Save form data temporarily
      localStorage.setItem('restaurantFormData', JSON.stringify(bookingData));
      
      // Redirect to login with comprehensive state
      navigate("/login", { 
        state: { 
          from: window.location.pathname,
          intent: "restaurant_booking",
          guestAccess: false, // Restaurant bookings also require registration
          timestamp: Date.now(),
          requiresVerification: true,
          message: "Please login or create an account to complete your restaurant reservation"
        } 
      });
      return;
    }
    
    if (authStatus.guest) {
      // Guest users cannot complete restaurant bookings - require registration
      alert("⚠️ Restaurant reservations require account registration. Please create an account to proceed.");
      
      // Redirect to register with current booking data
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("redirectAfterRegister", currentPath);
      
      // Save current booking data for restoration after registration
      localStorage.setItem("pendingBookingData", JSON.stringify({
        type: "restaurant",
        vendorData: vendorData,
        bookingData: bookingData,
        bookingId: bookingId,
        time: formatTimeForDisplay(bookingData.time),
        guests: bookingData.numberOfGuests
      }));
      
      navigate("/register", {
        state: {
          from: currentPath,
          upgradeFromGuest: true,
          requiresBooking: true,
          message: "Create an account to complete your restaurant reservation"
        }
      });
      return;
    }
    
    if (!authStatus.verified) {
      console.log("User not verified, redirecting to OTP verification");
      // Redirect to OTP verification
      navigate("/verify-otp", { 
        state: { 
          message: "Please verify your account to complete your reservation",
          returnPath: window.location.pathname
        } 
      });
      return;
    }

    console.log("User authenticated and verified, proceeding with booking");

    // Convert 24-hour time to 12-hour format for display
    const timeString = formatTimeForDisplay(bookingData.time);

    // Combine all data
    const completeBooking = {
      vendorData: vendorData,
      bookingData: {
        ...bookingData,
        time: timeString,
        paymentMethod: selectedPayment
      },
      bookingType: 'restaurant',
      bookingDate: new Date().toISOString(),
      bookingId: bookingId,
      status: selectedPayment === "card" ? "pending_payment" : "confirmed",
      userId: JSON.parse(localStorage.getItem("userProfile") || "{}")._id || null,
      termsAccepted: isTermsAccepted,
      isGuest: false
    };

    console.log("Complete booking data:", completeBooking);

    // Save to localStorage
    localStorage.setItem('restaurantBooking', JSON.stringify(completeBooking));
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    
    // Clear any pending booking data
    localStorage.removeItem('pendingBookingData');
    localStorage.removeItem('restaurantFormData');
    
    // Navigate based on payment method
    if (selectedPayment === "restaurant") {
      navigate('/booking-confirmation/restaurant', { 
        state: { 
          bookingData: completeBooking 
        } 
      });
    } else {
      navigate('/booking/payment', { 
        state: { 
          bookingData: completeBooking,
          bookingType: 'restaurant'
        } 
      });
    }
  };

  const formatTimeForDisplay = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  const getAvailableTimes = () => {
    return [
      "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30",
      "17:00", "17:30", "18:00", "18:30",
      "19:00", "19:30", "20:00", "20:30",
      "21:00", "21:30", "22:00"
    ];
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const calculateTotal = () => {
    return vendorData?.priceFrom || 5000;
  };

  // Guest Warning Banner Component
  const GuestWarningBanner = () => {
    if (!isGuestUser) return null;
    
    const handleRegister = () => {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("redirectAfterRegister", currentPath);
      
      // Save current form data
      localStorage.setItem('restaurantFormData', JSON.stringify(bookingData));
      
      navigate("/register", {
        state: {
          from: currentPath,
          upgradeFromGuest: true,
          requiresBooking: true,
          firstName: bookingData.contactInfo.firstName,
          lastName: bookingData.contactInfo.lastName,
          email: bookingData.contactInfo.email,
          phone: bookingData.contactInfo.phone
        }
      });
    };

    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FontAwesomeIcon icon={faShieldAlt} className="text-yellow-500 text-lg" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              ⚠️ You're browsing as a guest
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                To complete your restaurant reservation, you need to create an account.
                This will also allow you to:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Save your reservation history</li>
                <li>Manage future reservations</li>
                <li>Receive exclusive offers</li>
                <li>Save payment methods securely</li>
              </ul>
            </div>
            <div className="mt-3">
              <button
                onClick={handleRegister}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Create Account to Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your booking details...</p>
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
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faUtensils} className="text-yellow-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Restaurant Selected</h2>
            <p className="text-gray-600 mb-5">Please select a restaurant before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-sm"
            >
              ← Go Back & Select Restaurant
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <div className="pt-0">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          <div className="mb-4 sm:mb-8">
            <Stepper currentStep={1} />
          </div>
          
          {/* Guest Warning Banner */}
          <GuestWarningBanner />
          
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                <span className="font-medium">Back to restaurant selection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
              <div className="lg:col-span-2">
                <div className="px-1 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    Reserve Your Table
                  </h1>
                  <p className="text-sm text-gray-600">
                    Please fill in your details to reserve your table
                  </p>
                </div>

                {/* Restaurant Preview Card */}
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
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
                            {vendorData.name || "JAGZ Restaurant"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{vendorData.area || vendorData.location || "Mekola, IL 2814"}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Fine Dining
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cuisine</p>
                            <p className="font-medium text-xs">{vendorData.cuisine || "Continental"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faClock} className="text-emerald-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reservation</p>
                            <p className="font-medium text-xs">Table Booking</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        {vendorData.description || "Serving delicious meals with a cozy ambiance and warm hospitality."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates & Time Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-500 text-sm" />
                    Date & Time
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateForDisplay(bookingData.date)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Time *
                      </label>
                      <select
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        required
                      >
                        {getAvailableTimes().map(time => (
                          <option key={time} value={time}>
                            {formatTimeForDisplay(time)}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Dining time slot
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guests Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-sm" />
                    Number of Guests
                  </h2>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-3">
                        Select number of guests *
                      </label>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleGuestChange('decrease')}
                          className="w-10 h-10 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer text-base font-bold text-blue-600"
                        >
                          -
                        </button>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-0.5">{bookingData.numberOfGuests}</div>
                          <div className="text-xs text-gray-600">guest{bookingData.numberOfGuests !== 1 ? 's' : ''}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGuestChange('increase')}
                          className="w-10 h-10 rounded-full border-2 border-emerald-300 bg-white flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer text-base font-bold text-emerald-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-sm" />
                    Payment Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePaymentChange("restaurant")}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedPayment === "restaurant" 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === "restaurant" 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === "restaurant" && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-xs" />
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">Pay at Restaurant</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-tight">Pay when you arrive</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 text-xs" />
                            <span className="text-xs text-green-600">No prepayment needed</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handlePaymentChange("card")}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedPayment === "card" 
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === "card" 
                            ? 'border-emerald-500 bg-emerald-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === "card" && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <FontAwesomeIcon icon={faCreditCard} className="text-emerald-600 text-xs" />
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">Credit/Debit Card</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-tight">Secure online payment</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 text-xs" />
                            <span className="text-xs text-green-600">SSL encrypted</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500 text-sm" />
                      Contact Information
                    </h2>
                    <p className="text-xs text-gray-600">Who's making the reservation?</p>
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
                            name="contactInfo.firstName"
                            value={bookingData.contactInfo.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
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
                            name="contactInfo.lastName"
                            value={bookingData.contactInfo.lastName}
                            onChange={handleInputChange}
                            placeholder="Doe"
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
                          name="contactInfo.email"
                          value={bookingData.contactInfo.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
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
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="tel"
                          name="contactInfo.phone"
                          value={bookingData.contactInfo.phone}
                          onChange={handleInputChange}
                          placeholder="+234 800 000 0000"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faNotesMedical} className="text-blue-500 text-sm" />
                    Special Requests (Optional)
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3">
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any specific requests or requirements (dietary restrictions, seating preferences, special occasions, etc.)"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm bg-transparent"
                    />
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="mt-6">
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={isTermsAccepted}
                        onChange={(e) => setIsTermsAccepted(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                      By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy. I understand that my reservation is subject to the restaurant's cancellation policy and any applicable fees.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isGuestUser}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm ${
                      isGuestUser ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGuestUser ? "Create Account to Reserve" : selectedPayment === "restaurant" ? "Reserve Table" : "Proceed to Payment"}
                    <span className="ml-2">→</span>
                  </button>
                  
                  {isGuestUser && (
                    <p className="text-xs text-red-600 text-center mt-2">
                      ⚠️ Restaurant reservations require account registration
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 space-y-3">
                  {/* Summary Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                    <h3 className="text-base font-bold mb-1">Booking Summary</h3>
                    <p className="text-xs opacity-90">Booking ID: {bookingId}</p>
                    {isGuestUser && (
                      <div className="mt-2 flex items-center gap-1 text-xs bg-yellow-500/20 p-1 rounded">
                        <FontAwesomeIcon icon={faShieldAlt} />
                        <span>Guest Mode - Limited Access</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Restaurant Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-2.5">
                      <div className="flex items-start gap-2.5">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                          alt={vendorData.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{vendorData.name || "JAGZ Restaurant"}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{vendorData.rating || 4.8}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">• {vendorData.area || "Mekola, IL 2814"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Date</span>
                          <span className="text-xs font-medium">{formatDateForDisplay(bookingData.date)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Time</span>
                          <span className="text-xs font-medium">{formatTimeForDisplay(bookingData.time)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Guests</span>
                          <span className="text-xs font-medium">{bookingData.numberOfGuests} guest{bookingData.numberOfGuests !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm">Price Breakdown</h5>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Reservation fee</span>
                          <span className="font-medium">{formatPrice(total)}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">{formatPrice(taxes)}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatPrice(serviceFee)}</span>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          {selectedPayment === "restaurant" ? "Pay at restaurant upon arrival" : "Payment required now"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Benefits Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 p-2.5">
                    <h6 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-sm">
                      <FontAwesomeIcon icon={faConciergeBell} className="text-emerald-600" />
                      What's Included
                    </h6>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">Reserved table for {bookingData.numberOfGuests}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">Complimentary welcome drink</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">Priority seating</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">Special requests accommodation</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="font-medium">Best Table Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Free cancellation up to 2 hours before reservation
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

export default RestaurantBooking;