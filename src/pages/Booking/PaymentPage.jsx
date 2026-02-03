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
  X,
  Wrench,
  DollarSign,
  Utensils,
  Music  // Added for event icon
} from "lucide-react";
import { ToastContainer, toast, Slide } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Helper function to check authentication status
const checkAuthStatus = () => {
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
  
  const guestSession = localStorage.getItem("guestSession");
  if (guestSession) {
    try {
      const session = JSON.parse(guestSession);
      
      if (session.expiresAt) {
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        
        if (expiresAt > now) {
          return { 
            authenticated: true, 
            isGuest: true,
            type: "guest_user",
            sessionId: session.sessionId,
            email: session.email,
            sessionData: session
          };
        } else {
          localStorage.removeItem("guestSession");
          return { 
            authenticated: false, 
            isGuest: false,
            type: "expired_guest" 
          };
        }
      } else {
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
  
  return { 
    authenticated: false, 
    isGuest: false,
    type: "not_authenticated" 
  };
};

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
    } catch (error) {
      console.error("Failed to update session activity:", error);
    }
  }
};

const getLocationString = (locationData) => {
  if (!locationData) return "Location";
  
  if (typeof locationData === 'string') {
    return locationData;
  }
  
  if (typeof locationData === 'object') {
    if (locationData.address && typeof locationData.address === 'string') {
      return locationData.address;
    }
    
    if (locationData.area && typeof locationData.area === 'string') {
      return locationData.area;
    }
    
    if (locationData.location) {
      return getLocationString(locationData.location);
    }
    
    if (locationData.geolocation) {
      return "Area specified";
    }
  }
  
  return "Location";
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isCancellationPolicyAgreed, setIsCancellationPolicyAgreed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    updateSessionActivity();
    
    const handleUserActivity = () => {
      updateSessionActivity();
    };
    
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      updateSessionActivity();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const status = checkAuthStatus();
    setAuthStatus(status);
    
    if (!status.authenticated) {
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
      
      let loadedData = null;
      
      if (location.state?.bookingData) {
        loadedData = location.state.bookingData;
      } else {
        const guestStorageKeys = [
          'pendingGuestServiceBooking',
          'pendingGuestHotelBooking',
          'pendingGuestRestaurantBooking',
          'pendingGuestShortletBooking',
          'pendingGuestEventBooking'  // Added event booking key
        ];
        
        const loggedInStorageKeys = [
          'pendingLoggedInServiceBooking',
          'pendingLoggedInHotelBooking',
          'pendingLoggedInRestaurantBooking',
          'pendingLoggedInShortletBooking',
          'pendingLoggedInEventBooking'  // Added event booking key
        ];
        
        if (status.isGuest) {
          for (const key of guestStorageKeys) {
            const data = localStorage.getItem(key);
            if (data) {
              loadedData = JSON.parse(data);
              break;
            }
          }
        } else {
          for (const key of loggedInStorageKeys) {
            const data = localStorage.getItem(key);
            if (data) {
              loadedData = JSON.parse(data);
              break;
            }
          }
        }
        
        if (!loadedData) {
          const savedData = localStorage.getItem('completeBooking');
          if (savedData) {
            try {
              loadedData = JSON.parse(savedData);
            } catch (error) {
              console.error("Failed to parse booking data:", error);
            }
          }
        }
      }
      
      if (!loadedData) {
        setError("No booking data found. Please start your booking again.");
        setLoading(false);
        return;
      }
      
      if (!loadedData.bookingType && loadedData.type) {
        loadedData.bookingType = loadedData.type;
      }
      
      // Handle restaurant booking data
      if (loadedData.bookingType === 'restaurant') {
        const contactInfo = loadedData.bookingData?.contactInfo || {};
        loadedData.firstName = loadedData.firstName || contactInfo.firstName;
        loadedData.lastName = loadedData.lastName || contactInfo.lastName;
        loadedData.email = loadedData.email || contactInfo.email || loadedData.guestEmail;
        loadedData.phone = loadedData.phone || contactInfo.phone;
        
        // Extract restaurant-specific data
        loadedData.numberOfGuests = loadedData.numberOfGuests || loadedData.bookingData?.numberOfGuests || 2;
        loadedData.reservationFee = loadedData.reservationFee || loadedData.bookingData?.price || loadedData.totalAmount || 1000;
        loadedData.priceFrom = loadedData.priceFrom || loadedData.vendorData?.priceFrom || 1000;
        loadedData.priceTo = loadedData.priceTo || loadedData.vendorData?.priceTo || 10000;
      }
      
      // Handle event booking data
      if (loadedData.bookingType === 'event') {
        const contactInfo = loadedData.bookingData?.contactPerson || loadedData.contactPerson || {};
        loadedData.firstName = loadedData.firstName || contactInfo.firstName;
        loadedData.lastName = loadedData.lastName || contactInfo.lastName;
        loadedData.email = loadedData.email || contactInfo.email || loadedData.guestEmail;
        loadedData.phone = loadedData.phone || contactInfo.phone;
        
        // Extract event-specific data
        loadedData.numberOfGuests = loadedData.numberOfGuests || loadedData.bookingData?.numberOfGuests || 50;
        loadedData.reservationFee = loadedData.reservationFee || 100000; // Fixed ₦100,000 reservation fee
        loadedData.priceFrom = loadedData.priceFrom || loadedData.vendorData?.priceFrom || 100000;
        loadedData.priceTo = loadedData.priceTo || loadedData.vendorData?.priceTo || 500000;
        
        // Event specific fields
        loadedData.eventType = loadedData.eventType || loadedData.bookingData?.eventType;
        loadedData.eventDate = loadedData.eventDate || loadedData.bookingData?.eventDate;
        loadedData.eventName = loadedData.eventName || loadedData.bookingData?.eventName;
        loadedData.startTime = loadedData.startTime || loadedData.bookingData?.startTime;
        loadedData.endTime = loadedData.endTime || loadedData.bookingData?.endTime;
      }
      
      // Handle service booking data
      if (loadedData.bookingType === 'service') {
        const contactInfo = loadedData.bookingData?.contactPerson || {};
        loadedData.firstName = loadedData.firstName || contactInfo.firstName;
        loadedData.lastName = loadedData.lastName || contactInfo.lastName;
        loadedData.email = loadedData.email || contactInfo.email || loadedData.guestEmail;
        loadedData.phone = loadedData.phone || contactInfo.phone;
        
        if (!loadedData.vendorData && loadedData.serviceData) {
          loadedData.vendorData = loadedData.serviceData;
        }
      }
      
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
      setPaymentMethod("hotel");
      localStorage.removeItem('paymentMethod');
      setLoading(false);
    };

    loadBookingData();
  }, [location.state, navigate, location.pathname]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!bookingData) {
      showToast("No booking data found. Please start over.");
      navigate('/');
      return;
    }

    const currentAuthStatus = checkAuthStatus();
    if (!currentAuthStatus.authenticated) {
      showToast("Your session has expired. Please login again.");
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

    if (!isTermsAgreed) {
      showToast("You must agree to the Terms of Use and Privacy Policy to proceed.");
      return;
    }

    if (!isCancellationPolicyAgreed) {
      showToast("You must accept the cancellation policy to proceed.");
      return;
    }

    localStorage.setItem('paymentMethod', "hotel");
    
    const completeBooking = {
      ...bookingData,
      paymentMethod: "hotel",
      cardDetails: null,
      paymentStatus: "pending",
      paymentDate: new Date().toISOString(),
      bookingId: bookingId,
      status: "pending",
      timestamp: new Date().toISOString(),
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

    localStorage.setItem('confirmedBooking', JSON.stringify(completeBooking));
    
    const bookingType = bookingData.bookingType || bookingData.type || 'hotel';
    localStorage.setItem(`${bookingType}Booking`, JSON.stringify(completeBooking));
    
    if (currentAuthStatus.isGuest) {
      localStorage.removeItem("guestSession");
      
      const guestKeys = [
        'pendingGuestHotelBooking',
        'pendingGuestRestaurantBooking',
        'pendingGuestShortletBooking',
        'pendingGuestServiceBooking',
        'pendingGuestEventBooking'
      ];
      
      guestKeys.forEach(key => localStorage.removeItem(key));
    }
    
    if (currentAuthStatus.isGuest) {
      localStorage.removeItem(`pendingGuest${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
    } else {
      localStorage.removeItem(`pendingLoggedIn${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
    }
    
    localStorage.removeItem('completeBooking');
    localStorage.removeItem('hotelBooking');
    localStorage.removeItem('restaurantBooking');
    localStorage.removeItem('shortletBooking');
    localStorage.removeItem('eventBooking');
    localStorage.removeItem('pendingHotelBooking');
    localStorage.removeItem('pendingRestaurantBooking');
    localStorage.removeItem('pendingShortletBooking');
    localStorage.removeItem('pendingServiceBooking');
    localStorage.removeItem('pendingEventBooking');
    localStorage.removeItem('pendingBooking');
    
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

  const formatPriceRange = (from, to) => {
    if (!from && !to) return "₦ --";
    const fromNum = from ? parseInt(from.toString().replace(/[^\d]/g, "")) : 0;
    const toNum = to ? parseInt(to.toString().replace(/[^\d]/g, "")) : 0;
    
    if (isNaN(fromNum) && isNaN(toNum)) return "₦ --";
    if (isNaN(fromNum)) return `₦${toNum.toLocaleString()}`;
    if (isNaN(toNum)) return `₦${fromNum.toLocaleString()}`;
    
    if (fromNum === toNum) return `₦${fromNum.toLocaleString()}`;
    
    return `₦${fromNum.toLocaleString()} - ${toNum.toLocaleString()}`;
  };

  const hotelData = bookingData?.hotelData || bookingData?.roomData?.hotel;
  const roomData = bookingData?.roomData?.room;
  const vendorData = bookingData?.vendorData;
  const bookingDetails = bookingData?.bookingData || bookingData?.roomData?.booking;
  const guestInfo = bookingData || {};

  // Calculate totals based on booking type
  const roomPrice = bookingDetails?.price || bookingData?.totalAmount || 0;
  const total = roomPrice;
  
  // Get booking type specific data
  const isRestaurantBooking = bookingData?.bookingType === 'restaurant';
  const isEventBooking = bookingData?.bookingType === 'event';
  const isServiceBooking = bookingData?.bookingType === 'service';
  
  // Restaurant data
  const reservationFee = bookingData?.reservationFee || (isRestaurantBooking ? 1000 : isEventBooking ? 100000 : 0);
  const priceFrom = bookingData?.priceFrom || vendorData?.priceFrom || (isRestaurantBooking ? 1000 : isEventBooking ? 100000 : 0);
  const priceTo = bookingData?.priceTo || vendorData?.priceTo || (isRestaurantBooking ? 10000 : isEventBooking ? 500000 : 0);
  const priceRange = formatPriceRange(priceFrom, priceTo);
  const numberOfGuests = bookingData?.numberOfGuests || (isRestaurantBooking ? 2 : isEventBooking ? 50 : 2);

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
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

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
                type="button"
                aria-label="Return to home page"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate(-1)}
                className="ml-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
                type="button"
                aria-label="Go back to previous page"
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

  const getLocationName = () => {
    if (isServiceBooking) {
      return "service provider";
    } else if (isRestaurantBooking) {
      return "restaurant";
    } else if (isEventBooking) {
      return "event venue";
    } else if (bookingData.bookingType === 'shortlet') {
      return "shortlet property";
    } else {
      return "hotel";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ToastContainer />
      
      <div className="pt-0">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          <div className="mb-8 sm:mb-8">
            <Stepper currentStep={2} />
          </div>
          
          {authStatus?.isGuest && (
            <div className="mb-4 sm:mb-6  border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">Continuing as Guest</p>
                <p className="text-xs text-gray-700">
                  You're booking as a guest. Your booking confirmation will be sent to {authStatus.email}
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="px-3 sm:px-6 pt-3 sm:pt-6">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
                    type="button"
                    aria-label="Go back to previous page"
                  >
                    <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                    <span className="font-medium">Back to booking details</span>
                  </button>
                </div>

                <div className="p-3 sm:p-6">
                  <div className="px-1 mb-4">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                      Complete Payment
                    </h1>
                    <p className="text-sm text-gray-600">
                      Final step to confirm your {isServiceBooking ? "service appointment" : isRestaurantBooking ? "restaurant reservation" : isEventBooking ? "event booking" : "booking"} at {hotelData?.name || vendorData?.name || "the property"}
                    </p>
                  </div>

                  <div className="mb-4 sm:mb-6  rounded-lg p-3 sm:p-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" aria-hidden="true" />
                      Guest Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Lead Guest</p>
                        <p className="font-medium text-sm">
                          {guestInfo.firstName || guestInfo.bookingData?.contactPerson?.firstName || guestInfo.bookingData?.contactInfo?.firstName || "Guest"} {guestInfo.lastName || guestInfo.bookingData?.contactPerson?.lastName || guestInfo.bookingData?.contactInfo?.lastName || "User"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-sm">
                          {guestInfo.email || guestInfo.bookingData?.contactPerson?.email || guestInfo.bookingData?.contactInfo?.email || authStatus?.email || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-sm">
                          {guestInfo.phone || guestInfo.bookingData?.contactPerson?.phone || guestInfo.bookingData?.contactInfo?.phone || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-500">Booking Type</p>
                        <p className="font-medium text-sm capitalize">
                          {bookingData.bookingType || bookingData.type || "service"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-500" aria-hidden="true" />
                      Choose Payment Method
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setPaymentMethod("hotel")}
                        className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                          paymentMethod === "hotel" 
                            ? 'border-[#6cff] bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        type="button"
                        aria-label="Select pay at property option"
                        aria-pressed={paymentMethod === "hotel"}
                        role="radio"
                        tabIndex="0"
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
                            <Building className="w-4 h-4 text-blue-600" aria-hidden="true" />
                            <div className="text-left">
                              <span className="font-bold text-gray-900 text-xs sm:text-sm block">Pay at Property</span>
                              <p className="text-xs text-gray-600 leading-tight mt-0.5">
                                No upfront payment required. Pay when you arrive.
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      <div
                        onClick={() => showToast(`For security reasons, you can only pay at the ${getLocationName()}. Online payments are currently unavailable.`)}
                        className="p-2.5 sm:p-3 rounded-lg border-2 border-gray-200 text-left cursor-not-allowed opacity-70 relative"
                        role="radio"
                        aria-label="Pay now with card (unavailable)"
                        aria-disabled="true"
                        tabIndex="-1"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-1">
                            <CreditCard className="w-4 h-4 text-gray-400" aria-hidden="true" />
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
                    
                    <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-medium text-yellow-800">Important Payment Information</p>
                          <p className="text-xs text-yellow-700 mt-0.5">
                            For security reasons, payments can only be made at the property. Online card payments will be available soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mt-6">
                      <div className="mb-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="termsAgreement"
                            name="termsAgreement"
                            required
                            checked={isTermsAgreed}
                            onChange={(e) => setIsTermsAgreed(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                            aria-required="true"
                            aria-describedby="terms-description"
                          />
                          <label htmlFor="termsAgreement" className="text-xs text-gray-900 leading-relaxed cursor-pointer">
                            <span id="terms-description">
                              By proceeding with this booking, I agree to Ajani's{' '}
                              <a href="/terms-service" onClick={(e) => e.stopPropagation()} className="underline hover:text-blue-600 transition-colors">
                                Terms of Use
                              </a>{' '}
                              and{' '}
                              <a href="/privacy" onClick={(e) => e.stopPropagation()} className="underline hover:text-blue-600 transition-colors">
                                Privacy Policy
                              </a>.{' '}
                              I understand that my booking is subject to the property's cancellation policy.
                            </span>
                          </label>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="cancellationPolicy"
                            name="cancellationPolicy"
                            required
                            checked={isCancellationPolicyAgreed}
                            onChange={(e) => setIsCancellationPolicyAgreed(e.target.checked)}
                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 mt-0.5 cursor-pointer"
                            aria-required="true"
                            aria-describedby="cancellation-description"
                          />
                          <label htmlFor="cancellationPolicy" className="text-xs text-gray-600 cursor-pointer">
                            <span id="cancellation-description">
                              I accept the cancellation policy (free cancellation up to {isEventBooking ? '7 days' : '24 hours'} before check-in)
                            </span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#6cff] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                        aria-label="Confirm booking and continue"
                      >
                        Confirm Booking & Continue
                        <span className="ml-2" aria-hidden="true">→</span>
                      </button>
                      
                      <p className="text-center text-gray-500 text-xs mt-2">
                        Confirmation will be sent to {guestInfo.email || guestInfo.bookingData?.contactPerson?.email || guestInfo.bookingData?.contactInfo?.email || authStatus?.email || "your email"}
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-20 space-y-4">
                <div className="bg-[#6cff] rounded-lg p-3 text-white">
                  <h3 className="text-base font-bold mb-1">Booking Summary</h3>
                  <p className="text-xs opacity-90">Booking ID: {bookingId}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-2.5">
                    <div className="flex items-start gap-2.5">
                      <img 
                        src={hotelData?.image || vendorData?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                        alt={hotelData?.name || vendorData?.name || "Property image"}
                        className="w-10 h-10 object-cover rounded"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {hotelData?.name || vendorData?.name || "Service Provider"}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" aria-hidden="true" />
                          <span className="text-xs font-medium">{hotelData?.rating || vendorData?.rating || 4.5}</span>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            • {getLocationString(hotelData?.location || vendorData?.area)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                      <div className="space-y-1.5">
                        {isServiceBooking ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Service Date</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">
                                  {formatDateForDisplay(bookingDetails?.serviceDate)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Time</span>
                              </div>
                              <span className="text-xs font-medium">
                                {formatTimeForDisplay(bookingDetails?.serviceTime) || "09:00 AM"}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Wrench className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Service Type</span>
                              </div>
                              <span className="text-xs font-medium">
                                {bookingDetails?.locationType || "Residential"}
                              </span>
                            </div>
                          </>
                        ) : isRestaurantBooking ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Date</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{formatDateForDisplay(bookingDetails?.date)}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Time</span>
                              </div>
                              <span className="text-xs font-medium">
                                {formatTimeForDisplay(bookingDetails?.time) || "07:00 PM"}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Guests</span>
                              </div>
                              <span className="text-xs font-medium">{numberOfGuests} people</span>
                            </div>
                          </>
                        ) : isEventBooking ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Music className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Event Type</span>
                              </div>
                              <span className="text-xs font-medium capitalize">
                                {bookingData.eventType || "Event"}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Event Date</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{formatDateForDisplay(bookingData.eventDate)}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Time</span>
                              </div>
                              <span className="text-xs font-medium">
                                {formatTimeForDisplay(bookingData.startTime) || "02:00 PM"} - {formatTimeForDisplay(bookingData.endTime) || "06:00 PM"}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Guests</span>
                              </div>
                              <span className="text-xs font-medium">{numberOfGuests} people</span>
                            </div>
                          </>
                        ) : bookingData.bookingType === 'hotel' || bookingData.type === 'hotel' ? (
                          <>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Dates</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{bookingDetails?.checkIn || "Today"}</p>
                                <p className="text-xs text-gray-500">to {bookingDetails?.checkOut || "Tomorrow"}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-500" aria-hidden="true" />
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
                                <Calendar className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Date</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{bookingDetails?.date || "Today"}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-500" aria-hidden="true" />
                                <span className="text-xs text-gray-600">Guests</span>
                              </div>
                              <span className="text-xs font-medium">{bookingDetails?.numberOfGuests || bookingData?.guests?.adults || 2} people</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-3 h-3 text-gray-500" aria-hidden="true" />
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
                
                {roomData && !isServiceBooking && !isRestaurantBooking && !isEventBooking && (
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
                        alt={roomData.title || "Room image"}
                        className="w-full h-28 object-cover rounded-md"
                        loading="lazy"
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
                
                {/* Price Breakdown - DIFFERENT FOR RESTAURANT AND EVENT BOOKINGS */}
                {!isServiceBooking && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5">
                    <h5 className="font-medium text-gray-800 mb-2 text-sm">Price Breakdown</h5>
                    
                    <div className="space-y-1.5">
                      {isRestaurantBooking ? (
                        <>
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Utensils className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                              <span className="text-gray-600">Reservation fee</span>
                            </div>
                            <span className="font-medium">{formatPrice(reservationFee)}</span>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Estimated meal cost</span>
                            <span className="font-medium">{priceRange}</span>
                          </div>
                        </>
                      ) : isEventBooking ? (
                        <>
                          <div className="flex justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Music className="w-3 h-3 text-emerald-500" aria-hidden="true" />
                              <span className="text-gray-600">Venue Booking Fee</span>
                            </div>
                            <span className="font-medium">{formatPrice(reservationFee)}</span>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Estimated Event Cost</span>
                            <span className="font-medium">{priceRange}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">
                              {bookingData.bookingType === 'hotel' || bookingData.type === 'hotel' 
                                ? `Room x ${bookingDetails?.nights || 1} night` 
                                : "Reservation fee"}
                            </span>
                            <span className="font-medium">{formatPrice(bookingDetails?.price)}</span>
                          </div>
                        </>
                      )}
                      
                      {/* Common fees for all types */}
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span className="font-medium">{formatPrice(0)}</span>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">{formatPrice(0)}</span>
                      </div>
                    </div>
                    
                    {/* Total - SHOW PRICE RANGE FOR RESTAURANT AND EVENT */}
                    <div className="pt-2 border-t border-gray-300">
                      {isRestaurantBooking ? (
                        <>
                          <div className="text-center mb-2">
                            <span className="font-bold text-gray-900 text-sm">Total Estimated Cost</span>
                            <div className="text-lg font-bold text-emerald-600">
                              {priceRange}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-0.5">
                            Booking fee + estimated meal cost
                          </p>
                        </>
                      ) : isEventBooking ? (
                        <>
                          <div className="text-center mb-2">
                            <span className="font-bold text-gray-900 text-sm">Total Estimated Cost</span>
                            <div className="text-lg font-bold text-emerald-600">
                              {priceRange}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-0.5">
                            Booking fee + estimated event cost
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                            <span className="text-lg font-bold text-emerald-600">
                              {formatPrice(total)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-0.5">
                            Pay at property
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Guarantee */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <Shield className="w-3 h-3 text-green-500" aria-hidden="true" />
                    <span className="font-medium">Best Price Guarantee</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Free cancellation up to {isEventBooking ? '7 days' : '24 hours'} before check-in
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