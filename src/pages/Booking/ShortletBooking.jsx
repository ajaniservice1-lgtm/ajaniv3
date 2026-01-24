import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faCalendar, faUsers, faBed, 
  faWifi, faHome, faUtensils,
  faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt,
  faShieldAlt, faCreditCard,
  faHotel, faKey, faConciergeBell,
  faChevronLeft, faClock, faNotesMedical
} from "@fortawesome/free-solid-svg-icons";

const ShortletBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 2,
    additionalNotes: "",
    contactInfo: {
      name: "",
      phone: "",
      email: ""
    }
  });

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
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
      const prefix = "SHT-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setBookingId(generateBookingId());

    // Pre-fill dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setBookingData(prev => ({
      ...prev,
      checkInDate: formatDate(today),
      checkOutDate: formatDate(tomorrow)
    }));

    // Load vendor data
    const loadVendorData = () => {
      setLoading(true);
      
      // Try to get from location state
      if (location.state?.vendorData) {
        setVendorData(location.state.vendorData);
      } 
      // Try from localStorage
      else {
        const savedData = localStorage.getItem('currentVendorBooking');
        if (savedData) {
          setVendorData(JSON.parse(savedData));
        }
      }
      
      // Pre-fill user data if logged in or guest
      const authStatus = requireAuth();
      if (authStatus.authenticated || authStatus.guest) {
        if (authStatus.guest) {
          // For guest users, get guest session data
          const guestSession = checkGuestSession();
          if (guestSession && guestSession.email) {
            setBookingData(prev => ({
              ...prev,
              contactInfo: {
                name: guestSession.name || prev.contactInfo.name,
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
                  name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || prev.contactInfo.name,
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
  }, [location.state]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Submit button clicked");
    
    // Validate terms acceptance
    if (!isTermsAccepted) {
      alert("You must accept the terms and conditions to proceed");
      return;
    }

    // Validate data
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.numberOfGuests) {
      alert("Please fill in all required fields");
      return;
    }

    if (!bookingData.contactInfo.name || !bookingData.contactInfo.email || !bookingData.contactInfo.phone) {
      alert("Please fill in all contact information");
      return;
    }

    // Check authentication
    const authStatus = requireAuth();
    console.log("Auth status:", authStatus);
    
    if (!authStatus.authenticated && !authStatus.guest) {
      console.log("User not authenticated, saving pending booking");
      
      // Calculate nights and total
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const pricePerNight = vendorData?.priceFrom || 0;
      const total = pricePerNight * nights;
      
      // Save current booking details to localStorage to restore after login
      const pendingBooking = {
        type: "shortlet",
        vendorData: vendorData,
        bookingData: bookingData,
        bookingId: bookingId,
        totalAmount: total,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.numberOfGuests,
        nights: nights,
        timestamp: Date.now()
      };
      
      console.log("Saving pending booking:", pendingBooking);
      localStorage.setItem("pendingBookingData", JSON.stringify(pendingBooking));
      
      // Save redirect URL for after login
      localStorage.setItem("redirectAfterAuth", window.location.pathname);
      
      // Save form data temporarily
      localStorage.setItem('shortletFormData', JSON.stringify(bookingData));
      
      // Redirect to login with comprehensive state
      navigate("/login", { 
        state: { 
          from: window.location.pathname,
          intent: "shortlet_booking",
          guestAccess: false, // Shortlet bookings also require registration
          timestamp: Date.now(),
          requiresVerification: true,
          message: "Please login or create an account to complete your shortlet booking"
        } 
      });
      return;
    }
    
    if (authStatus.guest) {
      // Guest users cannot complete shortlet bookings - require registration
      alert("⚠️ Shortlet bookings require account registration. Please create an account to proceed.");
      
      // Redirect to register with current booking data
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("redirectAfterRegister", currentPath);
      
      // Save current booking data for restoration after registration
      localStorage.setItem("pendingBookingData", JSON.stringify({
        type: "shortlet",
        vendorData: vendorData,
        bookingData: bookingData,
        bookingId: bookingId,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        guests: bookingData.numberOfGuests
      }));
      
      navigate("/register", {
        state: {
          from: currentPath,
          upgradeFromGuest: true,
          requiresBooking: true,
          message: "Create an account to complete your shortlet booking"
        }
      });
      return;
    }
    
    if (!authStatus.verified) {
      console.log("User not verified, redirecting to OTP verification");
      // Redirect to OTP verification
      navigate("/verify-otp", { 
        state: { 
          message: "Please verify your account to complete your booking",
          returnPath: window.location.pathname
        } 
      });
      return;
    }

    console.log("User authenticated and verified, proceeding with booking");

    // Calculate nights
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Combine all data
    const completeBooking = {
      vendorData: vendorData,
      bookingData: {
        ...bookingData,
        nights: nights
      },
      bookingType: 'shortlet',
      bookingDate: new Date().toISOString(),
      bookingId: bookingId,
      paymentMethod: "direct",
      userId: JSON.parse(localStorage.getItem("userProfile") || "{}")._id || null,
      status: "confirmed",
      termsAccepted: isTermsAccepted,
      isGuest: false
    };

    console.log("Complete booking data:", completeBooking);

    // Save to localStorage
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    localStorage.setItem('shortletBooking', JSON.stringify(completeBooking));
    
    // Clear any pending booking data
    localStorage.removeItem('pendingBookingData');
    localStorage.removeItem('shortletFormData');
    
    // Navigate directly to confirmation
    navigate('/booking-confirmation/shortlet', { 
      state: { 
        bookingData: completeBooking 
      } 
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate total price
  const checkIn = new Date(bookingData.checkInDate);
  const checkOut = new Date(bookingData.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const pricePerNight = vendorData?.priceFrom || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = 0;
  const taxes = 0;
  const total = subtotal + serviceFee + taxes;

  // Guest Warning Banner Component
  const GuestWarningBanner = () => {
    if (!isGuestUser) return null;
    
    const handleRegister = () => {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("redirectAfterRegister", currentPath);
      
      // Save current form data
      localStorage.setItem('shortletFormData', JSON.stringify(bookingData));
      
      navigate("/register", {
        state: {
          from: currentPath,
          upgradeFromGuest: true,
          requiresBooking: true,
          name: bookingData.contactInfo.name,
          email: bookingData.contactInfo.email,
          phone: bookingData.contactInfo.phone
        }
      });
    };

 
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
              <FontAwesomeIcon icon={faHome} className="text-yellow-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Property Selected</h2>
            <p className="text-gray-600 mb-5">Please select a property before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-sm"
            >
              ← Go Back & Select Property
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                <span className="font-medium">Back to property selection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
              <div className="lg:col-span-2">
                <div className="px-1 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    Complete Your Shortlet Booking
                  </h1>
                  <p className="text-sm text-gray-600">
                    Please fill in your details to secure your stay
                  </p>
                </div>

                {/* Property & Room Preview Card */}
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                        alt={vendorData.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        {vendorData.rating || 4.5}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            {vendorData.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          Shortlet Apartment
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faHome} className="text-blue-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Property Type</p>
                            <p className="font-medium text-xs">Shortlet</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Max Guests</p>
                            <p className="font-medium text-xs">Up to {vendorData.maxGuests || 4}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                          <span>{formatDateDisplay(bookingData.checkInDate)} → {formatDateDisplay(bookingData.checkOutDate)}</span>
                        </div>
                        <div className="hidden sm:block h-3 w-px bg-gray-300"></div>
                        <div>
                          <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-500 text-sm" />
                    Dates & Duration
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        name="checkInDate"
                        value={bookingData.checkInDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateDisplay(bookingData.checkInDate)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        name="checkOutDate"
                        value={bookingData.checkOutDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateDisplay(bookingData.checkOutDate)}
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
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            numberOfGuests: Math.max(1, prev.numberOfGuests - 1)
                          }))}
                          className="w-10 h-10 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer text-base font-bold text-blue-600"
                        >
                          -
                        </button>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-0.5">{bookingData.numberOfGuests}</div>
                          <div className="text-xs text-gray-600">guests</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            numberOfGuests: prev.numberOfGuests + 1
                          }))}
                          className="w-10 h-10 rounded-full border-2 border-emerald-300 bg-white flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer text-base font-bold text-emerald-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-4 sm:mb-6">
                  <div className="mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500 text-sm" />
                      Contact Information
                    </h2>
                    <p className="text-xs text-gray-600">Who's checking in?</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          name="contactInfo.name"
                          value={bookingData.contactInfo.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
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
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faNotesMedical} className="text-blue-500 text-sm" />
                    Additional Notes (Optional)
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3">
                    <textarea
                      name="additionalNotes"
                      value={bookingData.additionalNotes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any specific requests or requirements... (e.g., early check-in, special arrangements, etc.)"
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
                      By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy. I understand that my booking is subject to the property's cancellation policy and any applicable fees.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isGuestUser}
                    className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm ${
                      isGuestUser ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGuestUser ? "Create Account to Book" : "Send Booking Request"}
                    <span className="ml-2">→</span>
                  </button>
                  
                  {isGuestUser && (
                    <p className="text-xs text-red-600 text-center mt-2">
                      ⚠️ Shortlet bookings require account registration
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
                
                  </div>
                  
                  {/* Property Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-2.5">
                      <div className="flex items-start gap-2.5">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                          alt={vendorData.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{vendorData.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{vendorData.rating || 4.5}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">• {vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Check-in</span>
                          <span className="text-xs font-medium">{formatDateDisplay(bookingData.checkInDate)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Check-out</span>
                          <span className="text-xs font-medium">{formatDateDisplay(bookingData.checkOutDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Stay Duration</span>
                          <span className="text-xs font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
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
                          <span className="text-gray-600">Price per night</span>
                          <span className="font-medium">{formatPrice(pricePerNight)}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">× {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span className="font-medium">{formatPrice(subtotal)}</span>
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
                          Booking request - confirmation required
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
                        <span className="text-gray-700">Fully furnished apartment</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">Free WiFi</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">Kitchen facilities</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span className="text-gray-700">24/7 support</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="font-medium">Best Price Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Flexible cancellation policy
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                      Booking confirmation required
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

export default ShortletBooking;