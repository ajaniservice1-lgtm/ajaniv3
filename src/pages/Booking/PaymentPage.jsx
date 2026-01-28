import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  CreditCard, 
  Building, 
  Calendar, 
  Users, 
  MapPin, 
  Star,
  Bed,
  Coffee,
  Shield,
  AlertCircle,
  ChevronLeft,
  X
} from "lucide-react";

// Helper function to check authentication status
const checkAuthStatus = () => {
  // Check for regular auth token
  const token = localStorage.getItem("auth_token");
  const userEmail = localStorage.getItem("user_email");
  const userProfile = localStorage.getItem("userProfile");
  
  if (token && userEmail) {
    return { 
      authenticated: true, 
      isGuest: false,
      type: "authenticated_user",
      email: userEmail,
      profile: userProfile ? JSON.parse(userProfile) : null
    };
  }
  
  // Check for guest session
  const guestSession = localStorage.getItem("guestSession");
  if (guestSession) {
    try {
      const session = JSON.parse(guestSession);
      
      // Check if session is expired
      if (session.expiresAt) {
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        
        if (expiresAt > now) {
          // Guest session is still valid
          return { 
            authenticated: true, 
            isGuest: true,
            type: "guest_user",
            sessionId: session.sessionId,
            email: session.email,
            sessionData: session
          };
        } else {
          // Guest session expired, clear it
          localStorage.removeItem("guestSession");
          return { 
            authenticated: false, 
            isGuest: false,
            type: "expired_guest" 
          };
        }
      } else {
        // No expiration date, assume valid
        return { 
          authenticated: true, 
          isGuest: true,
          type: "guest_user",
          sessionId: session.sessionId,
          email: session.email,
          sessionData: session
        };
      }
    } catch (error) {
      console.error("Failed to parse guest session:", error);
      localStorage.removeItem("guestSession");
      return { 
        authenticated: false, 
        isGuest: false,
        type: "error" 
      };
    }
  }
  
  // No authentication found
  return { 
    authenticated: false, 
    isGuest: false,
    type: "not_authenticated" 
  };
};

// Helper function to update session activity
const updateSessionActivity = () => {
  const guestSession = localStorage.getItem("guestSession");
  if (guestSession) {
    try {
      const sessionData = JSON.parse(guestSession);
      const updatedSession = {
        ...sessionData,
        lastActive: new Date().toISOString()
      };
      localStorage.setItem("guestSession", JSON.stringify(updatedSession));
      console.log("✅ Session activity updated");
    } catch (error) {
      console.error("Failed to update session activity:", error);
    }
  }
};

// Helper function to extract location string from location data
const getLocationString = (locationData) => {
  if (!locationData) return "Location";
  
  if (typeof locationData === 'string') {
    return locationData;
  }
  
  if (typeof locationData === 'object') {
    // Check for address property
    if (locationData.address && typeof locationData.address === 'string') {
      return locationData.address;
    }
    
    // Check for area property
    if (locationData.area && typeof locationData.area === 'string') {
      return locationData.area;
    }
    
    // Check for location property (could be nested object)
    if (locationData.location) {
      return getLocationString(locationData.location);
    }
    
    // If it's an object with geolocation property, return a default
    if (locationData.geolocation) {
      return "Area specified";
    }
  }
  
  return "Location";
};

// Toast Component
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed top-20 right-4 z-50 animate-slideIn">
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set default payment method to "hotel" and disable card option
  const [paymentMethod, setPaymentMethod] = useState("hotel");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [authStatus, setAuthStatus] = useState(null);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Fix: Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Update session activity when component mounts and on interactions
  useEffect(() => {
    updateSessionActivity();
    
    // Update session activity on user interactions
    const handleUserActivity = () => {
      updateSessionActivity();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, []);

  // Update session activity periodically (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateSessionActivity();
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Check authentication first
    const status = checkAuthStatus();
    setAuthStatus(status);
    
    if (!status.authenticated) {
      // User is not authenticated, redirect to login
      console.log("User not authenticated, redirecting to login");
      navigate('/login', {
        state: {
          message: "Please login or continue as guest to complete payment",
          fromBooking: true,
          intent: "payment",
          returnTo: location.pathname,
          from: location.pathname
        }
      });
      return;
    }
    
    // Generate booking ID
    const generateBookingId = () => {
      const prefix = status.isGuest ? "GUEST-" : "PAY-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    setBookingId(generateBookingId());

    const loadBookingData = () => {
      setLoading(true);
      setError("");
      
      console.log("📍 Payment page location state:", location.state);
      console.log("🔐 Auth status:", status);
      
      let loadedData = null;
      
      // 1. First try to get from location state
      if (location.state?.bookingData) {
        console.log("📦 Got booking data from location state");
        loadedData = location.state.bookingData;
      } 
      // 2. Try from localStorage (check for guest or regular pending bookings)
      else {
        console.log("🔍 Looking for booking data in localStorage...");
        
        // Check for guest booking data first if user is guest
        if (status.isGuest) {
          const guestHotelBooking = localStorage.getItem('pendingGuestHotelBooking');
          const guestRestaurantBooking = localStorage.getItem('pendingGuestRestaurantBooking');
          const guestShortletBooking = localStorage.getItem('pendingGuestShortletBooking');
          
          if (guestHotelBooking) {
            console.log("📦 Found pending guest hotel booking");
            loadedData = JSON.parse(guestHotelBooking);
          } else if (guestRestaurantBooking) {
            console.log("📦 Found pending guest restaurant booking");
            loadedData = JSON.parse(guestRestaurantBooking);
          } else if (guestShortletBooking) {
            console.log("📦 Found pending guest shortlet booking");
            loadedData = JSON.parse(guestShortletBooking);
          }
        } else {
          // Regular user - check for logged in pending bookings
          const loggedInHotelBooking = localStorage.getItem('pendingLoggedInHotelBooking');
          const loggedInRestaurantBooking = localStorage.getItem('pendingLoggedInRestaurantBooking');
          const loggedInShortletBooking = localStorage.getItem('pendingLoggedInShortletBooking');
          
          if (loggedInHotelBooking) {
            console.log("📦 Found pending logged-in hotel booking");
            loadedData = JSON.parse(loggedInHotelBooking);
          } else if (loggedInRestaurantBooking) {
            console.log("📦 Found pending logged-in restaurant booking");
            loadedData = JSON.parse(loggedInRestaurantBooking);
          } else if (loggedInShortletBooking) {
            console.log("📦 Found pending logged-in shortlet booking");
            loadedData = JSON.parse(loggedInShortletBooking);
          }
        }
        
        // Fallback to regular completeBooking
        if (!loadedData) {
          const savedData = localStorage.getItem('completeBooking');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              console.log("📦 Got booking data from completeBooking:", parsedData);
              loadedData = parsedData;
            } catch (error) {
              console.error("Failed to parse booking data:", error);
            }
          }
          
          // Also try hotelBooking as fallback
          const hotelData = localStorage.getItem('hotelBooking');
          if (hotelData && !loadedData) {
            try {
              const parsedData = JSON.parse(hotelData);
              console.log("📦 Got booking data from hotelBooking:", parsedData);
              loadedData = parsedData;
            } catch (error) {
              console.error("Failed to parse hotel booking data:", error);
            }
          }
        }
      }
      
      if (!loadedData) {
        setError("No booking data found. Please start your booking again.");
        setLoading(false);
        return;
      }
      
      // Add auth info to booking data
      if (status.isGuest) {
        loadedData.isGuestBooking = true;
        loadedData.guestSessionId = status.sessionId;
        loadedData.guestEmail = status.email;
      } else {
        loadedData.userId = status.profile?.id || status.profile?._id;
        loadedData.userEmail = status.email;
        loadedData.userName = `${status.profile?.firstName || ''} ${status.profile?.lastName || ''}`.trim();
      }
      
      setBookingData(loadedData);
      
      // Always set payment method to "hotel" by default
      setPaymentMethod("hotel");
      
      // Remove any saved card payment method
      localStorage.removeItem('paymentMethod');
      
      setLoading(false);
    };

    loadBookingData();
  }, [location.state, navigate, location.pathname]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  // Function to show toast message
  const showToast = (message) => {
    setToastMessage(message);
  };

  // Function to close toast
  const closeToast = () => {
    setToastMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingData) {
      alert("No booking data found. Please start over.");
      navigate('/');
      return;
    }

    // Check authentication again
    const currentAuthStatus = checkAuthStatus();
    if (!currentAuthStatus.authenticated) {
      alert("Your session has expired. Please login again.");
      navigate('/login', {
        state: {
          message: "Your session has expired. Please login again.",
          fromBooking: true,
          intent: "payment",
          returnTo: location.pathname
        }
      });
      return;
    }

    // Save payment details - only "hotel" is allowed
    localStorage.setItem('paymentMethod', "hotel");
    
    // Create complete booking record
    const completeBooking = {
      ...bookingData,
      paymentMethod: "hotel",
      cardDetails: null,
      paymentStatus: "pending",
      paymentDate: new Date().toISOString(),
      bookingId: bookingId,
      status: "pending",
      timestamp: new Date().toISOString(),
      // Add auth info
      ...(currentAuthStatus.isGuest && {
        isGuestBooking: true,
        guestSessionId: currentAuthStatus.sessionId,
        guestEmail: currentAuthStatus.email
      }),
      ...(!currentAuthStatus.isGuest && {
        userId: currentAuthStatus.profile?.id || currentAuthStatus.profile?._id,
        userEmail: currentAuthStatus.email
      })
    };

    console.log("💾 Complete booking data for confirmation:", completeBooking);

    // Save complete booking
    localStorage.setItem('confirmedBooking', JSON.stringify(completeBooking));
    
    // Also save to type-specific storage
    const bookingType = bookingData.bookingType || bookingData.type || 'hotel';
    localStorage.setItem(`${bookingType}Booking`, JSON.stringify(completeBooking));
    
    // CRITICAL: If this was a guest booking, clear the guest session IMMEDIATELY
    if (currentAuthStatus.isGuest) {
      console.log("🚫 Clearing guest session after payment submission");
      localStorage.removeItem("guestSession");
      
      // Also clear any pending guest bookings
      const guestKeys = [
        'pendingGuestHotelBooking',
        'pendingGuestRestaurantBooking',
        'pendingGuestShortletBooking'
      ];
      
      guestKeys.forEach(key => localStorage.removeItem(key));
    }
    
    // Clean up temporary booking data
    if (currentAuthStatus.isGuest) {
      localStorage.removeItem(`pendingGuest${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
    } else {
      localStorage.removeItem(`pendingLoggedIn${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
    }
    
    // Clean up other temporary data
    localStorage.removeItem('completeBooking');
    localStorage.removeItem('hotelBooking');
    localStorage.removeItem('restaurantBooking');
    localStorage.removeItem('shortletBooking');
    localStorage.removeItem('pendingHotelBooking');
    localStorage.removeItem('pendingRestaurantBooking');
    localStorage.removeItem('pendingShortletBooking');
    localStorage.removeItem('pendingBooking');
    
    // Navigate to confirmation page
    navigate(`/booking-confirmation/${bookingType}`, { 
      state: { 
        bookingData: completeBooking,
        isGuestBooking: currentAuthStatus.isGuest || false
      } 
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  // Extract data from bookingData
  const hotelData = bookingData?.hotelData || bookingData?.roomData?.hotel;
  const roomData = bookingData?.roomData?.room;
  const vendorData = bookingData?.vendorData;
  const bookingDetails = bookingData?.roomData?.booking || bookingData?.bookingData;
  const guestInfo = bookingData || {};

  // Calculate totals
  const roomPrice = bookingDetails?.price || bookingData?.totalAmount || 0;
  const taxes = 0; // All fees set to 0
  const serviceFee = 0; // All fees set to 0
  const total = roomPrice + taxes + serviceFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Header />
        <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-16">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {error || "No Booking Data Found"}
            </h2>
            <p className="text-gray-600 mb-5">
              {error ? error : "Please start your booking again."}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="bg-[#6cff] text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate(-1)}
                className="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get specific location name for the toast message
  const getLocationName = () => {
    if (bookingData.bookingType === 'restaurant') {
      return "restaurant";
    } else if (bookingData.bookingType === 'shortlet') {
      return "shortlet property";
    } else {
      return "hotel";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Toast Message */}
      {toastMessage && <Toast message={toastMessage} onClose={closeToast} />}
      
      {/* Reduced top spacing - matches hotelbooking page */}
      <div className="pt-0">
        {/* Main container with edge-to-edge padding on mobile */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          {/* Stepper - Reduced spacing */}
          <div className="mb-8 sm:mb-8">
            <Stepper currentStep={2} />
          </div>
          
          {/* User Status Banner */}
          {authStatus?.isGuest && (
            <div className="mb-4 sm:mb-6  border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">Continuing as Guest</p>
                <p className="text-xs text-gray-700">
                  You're booking as a guest. Your booking confirmation will be sent to {authStatus.email}
                </p>
              </div>
            </div>
          )}
          
          {/* Grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Main content */}
            <div className="lg:col-span-2">
              {/* Main Card - Reduced padding and border radius on mobile */}
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                {/* Back Button - Compact */}
                <div className="px-3 sm:px-6 pt-3 sm:pt-6">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span className="font-medium">Back to booking details</span>
                  </button>
                </div>

                <div className="p-3 sm:p-6">
                  {/* Header - Compact */}
                  <div className="px-1 mb-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                      Complete Payment
                    </h1>
                    <p className="text-sm text-gray-600">
                      Final step to confirm your booking at {hotelData?.name || vendorData?.name || "the property"}
                    </p>
                  </div>

                  {/* Guest Information Summary */}
                  <div className="mb-4 sm:mb-6  rounded-lg p-3 sm:p-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      Guest Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Lead Guest</p>
                        <p className="font-medium text-sm">
                          {guestInfo.firstName || guestInfo.contactInfo?.firstName || "Guest"} {guestInfo.lastName || guestInfo.contactInfo?.lastName || "User"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm">{guestInfo.email || guestInfo.contactInfo?.email || authStatus?.email || "Not provided"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-sm">{guestInfo.phone || guestInfo.contactInfo?.phone || "Not provided"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Booking Type</p>
                        <p className="font-medium text-sm capitalize">{bookingData.bookingType || bookingData.type || "hotel"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      Choose Payment Method
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {/* Pay at Property - Always selected and clickable */}
                      <button
                        onClick={() => setPaymentMethod("hotel")}
                        className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                          paymentMethod === "hotel" 
                            ? 'border-[#6cff] bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            paymentMethod === "hotel" 
                              ? 'border-[#6cff] bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === "hotel" && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-1">
                            <Building className="w-4 h-4 text-blue-600" />
                            <div className="text-left">
                              <span className="font-bold text-gray-900 text-xs sm:text-sm block">Pay at Property</span>
                              <p className="text-xs text-gray-600 leading-tight mt-0.5">
                                No upfront payment required. Pay when you arrive.
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {/* Pay with Card - Disabled with message */}
                      <div
                        onClick={() => showToast(`For security reasons, you can only pay at the ${getLocationName()}. Online payments are currently unavailable.`)}
                        className="p-2.5 sm:p-3 rounded-lg border-2 border-gray-200 text-left cursor-not-allowed opacity-70 relative"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-1">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <div className="text-left">
                              <span className="font-bold text-gray-400 text-xs sm:text-sm block">Pay Now with Card</span>
                              <p className="text-xs text-gray-400 leading-tight mt-0.5">
                                Currently unavailable
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            unavailable
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Information message */}
                    <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-yellow-800">Important Payment Information</p>
                          <p className="text-xs text-yellow-700 mt-0.5">
                            For security reasons, payments can only be made at the property. Online card payments will be available soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Submit */}
                  <div className="mt-6">
                    <div className="mb-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="termsAgreement"
                          required
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                <label htmlFor="terms" className="text-xs text-gray-900 leading-relaxed cursor-pointer">
  By proceeding with this booking, I agree to Ajani's{' '}
  <a href="/terms-service" onClick={(e) => e.stopPropagation()} className="underline hover:text-blue-600 transition-colors">
    Terms of Use
  </a>{' '}
  and{' '}
  <a href="/privacy" onClick={(e) => e.stopPropagation()} className="underline hover:text-blue-600 transition-colors">
    Privacy Policy
  </a>.{' '}
  I understand that my booking is subject to the property's cancellation policy.
</label>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="cancellationPolicy"
                          required
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="cancellationPolicy" className="text-xs text-gray-600 cursor-pointer">
                          I accept the cancellation policy (free cancellation up to 24 hours before check-in)
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full bg-[#6cff] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                    >
                      Confirm Booking & Continue
                      <span className="ml-2">→</span>
                    </button>
                    
                    <p className="text-center text-gray-500 text-xs mt-2">
                      Confirmation will be sent to {guestInfo.email || guestInfo.contactInfo?.email || authStatus?.email || "your email"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 space-y-4">
                {/* Summary Header */}
                <div className="bg-[#6cff] rounded-lg p-3 text-white">
                  <h3 className="text-base font-bold mb-1">Booking Summary</h3>
                  <p className="text-xs opacity-90">Booking ID: {bookingId}</p>
                </div>

                {/* Property/Vendor Summary */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-2.5">
                    <div className="flex items-start gap-2.5">
                      <img 
                        src={hotelData?.image || vendorData?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                        alt={hotelData?.name || vendorData?.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{hotelData?.name || vendorData?.name || "Property Name"}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium">{hotelData?.rating || vendorData?.rating || 4.5}</span>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            • {getLocationString(hotelData?.location || vendorData?.area)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                      <div className="space-y-1.5">
                        {bookingData.bookingType === 'hotel' || bookingData.type === 'hotel' ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Dates</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{bookingDetails?.checkIn || "Today"}</p>
                                <p className="text-xs text-gray-500">to {bookingDetails?.checkOut || "Tomorrow"}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Guests</span>
                              </div>
                              <span className="text-xs font-medium">{bookingDetails?.adults || bookingData?.guests?.adults || 2} adults</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Nights</span>
                              <span className="text-xs font-medium">{bookingDetails?.nights || 1} night</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Date</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{bookingDetails?.date || "Today"}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Guests</span>
                              </div>
                              <span className="text-xs font-medium">{bookingDetails?.numberOfGuests || bookingData?.guests?.adults || 2} people</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">Time</span>
                              </div>
                              <span className="text-xs font-medium">{bookingDetails?.time || "19:00"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Room Details (for hotels only) */}
                {roomData && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800 text-sm">Room</h5>
                      <span className="text-xs font-semibold text-emerald-600">
                        {formatPrice(bookingDetails?.price)}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <h6 className="font-semibold text-gray-900 text-xs mb-1">{roomData.title || "Room"}</h6>
                      <img 
                        src={roomData.image} 
                        alt={roomData.title}
                        className="w-full h-28 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Size</span>
                        <span className="font-medium">{roomData.size || "Not specified"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Beds</span>
                        <span className="font-medium">{roomData.beds || "1 Double Bed"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Max Guests</span>
                        <span className="font-medium">{roomData.maxOccupancy || 2}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5">
                  <h5 className="font-medium text-gray-800 mb-2 text-sm">Price Breakdown</h5>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        {bookingData.bookingType === 'hotel' || bookingData.type === 'hotel' 
                          ? `Room x ${bookingDetails?.nights || 1} night` 
                          : "Reservation fee"}
                      </span>
                      <span className="font-medium">{formatPrice(roomPrice)}</span>
                    </div>
                    
                    {/* Taxes & Fees - Showing as ₦0 */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Taxes & fees</span>
                      <span className="font-medium">{formatPrice(taxes)}</span>
                    </div>
                    
                    {/* Service fee - Showing as ₦0 */}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">{formatPrice(serviceFee)}</span>
                    </div>
                    
                    {/* Total */}
                    <div className="pt-2 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-0.5">
                        Pay at property
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Payment Info */}
                <div className="bg-yellow-50 rounded-lg border border-yellow-100 p-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800 text-xs">Payment Instructions</p>
                      <p className="text-xs text-yellow-700 mt-0.5">
                        Bring this amount with you to pay at the property: <span className="font-bold">{formatPrice(total)}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Guarantee */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span className="font-medium">Best Price Guarantee</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Free cancellation up to 24 hours before check-in
                  </p>
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

export default PaymentPage;