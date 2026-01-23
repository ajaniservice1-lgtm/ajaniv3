import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, faCalendar, faUsers, faBed, 
  faWifi, faCar, faUtensils,
  faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt,
  faShieldAlt, faCreditCard,
  faHotel, faKey, faConciergeBell,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";

const HotelBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "Nigeria",
    phone: "+234 ",
    specialRequests: "",
    paymentMethod: "hotel"
  });

  const [selectedPayment, setSelectedPayment] = useState("hotel");
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelData, setHotelData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingId, setBookingId] = useState("");

  // Auth check functions
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

  const requireAuth = () => {
    const isAuthenticated = checkAuthStatus();
    const isVerified = isUserVerified();
    
    if (!isAuthenticated) {
      return { authenticated: false, verified: false, message: "not_authenticated" };
    }
    
    if (!isVerified) {
      return { authenticated: true, verified: false, message: "not_verified" };
    }
    
    return { authenticated: true, verified: true, message: "authenticated" };
  };

  // Fix 1: Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Generate unique booking ID
  useEffect(() => {
    const generateBookingId = () => {
      const prefix = "AJN-";
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    setBookingId(generateBookingId());
  }, []);

  useEffect(() => {
    const loadBookingData = () => {
      setLoading(true);
      
      console.log("🔄 Loading hotel booking data...");
      
      // Load vendor data from multiple sources
      const vendorDataFromState = location.state?.vendorData || location.state?.bookingData?.hotel;
      const fromLocalStorage = localStorage.getItem('currentVendorBooking');
      const fromSession = sessionStorage.getItem('currentVendorBooking');
      const roomBookingData = localStorage.getItem('roomBookingData');
      
      let vendorData = null;
      
      // Priority: location state > localStorage > sessionStorage
      if (vendorDataFromState) {
        console.log("📦 Vendor data from location state:", vendorDataFromState);
        vendorData = vendorDataFromState;
      } else if (fromLocalStorage) {
        vendorData = JSON.parse(fromLocalStorage);
      } else if (fromSession) {
        vendorData = JSON.parse(fromSession);
      }
      
      if (vendorData) {
        console.log("🏨 Hotel data set:", vendorData);
        setHotelData(vendorData);
      }
      
      // Load room data with priority
      if (roomBookingData) {
        try {
          const parsedData = JSON.parse(roomBookingData);
          console.log("🛏️ Room data loaded from localStorage:", parsedData);
          setRoomData(parsedData);
          
          // If we have room data but no hotel data, extract from room data
          if (!vendorData && parsedData.hotel) {
            setHotelData(parsedData.hotel);
          }
        } catch (error) {
          console.error("❌ Failed to parse room data:", error);
        }
      } else if (location.state?.bookingData) {
        console.log("📦 Room data from location state:", location.state.bookingData);
        setRoomData(location.state.bookingData);
        if (location.state.bookingData.hotel) {
          setHotelData(location.state.bookingData.hotel);
        }
      } else if (vendorData?.selectedRoom) {
        // Create room data from selected room
        const roomInfo = vendorData.selectedRoom;
        const newRoomData = {
          hotel: {
            id: vendorData.id || vendorData._id,
            name: vendorData.name || vendorData.title,
            location: vendorData.area || vendorData.location || "Location not specified",
            rating: vendorData.rating || 4.5,
            image: vendorData.image || vendorData.images?.[0],
            category: vendorData.category || "hotel"
          },
          room: {
            id: roomInfo.id || `room-${Date.now()}`,
            title: roomInfo.title || "Standard Room",
            name: roomInfo.name || "Standard Room",
            description: roomInfo.description || "Comfortable room with all amenities",
            image: roomInfo.image || vendorData.image,
            images: roomInfo.images || [roomInfo.image || vendorData.image],
            size: roomInfo.size || "Not specified",
            beds: roomInfo.beds || "1 Double Bed",
            maxOccupancy: roomInfo.maxOccupancy || 2,
            features: roomInfo.features || [],
            amenities: roomInfo.amenitiesList || [],
            rating: roomInfo.rating || 4.5,
            reviewCount: roomInfo.reviewCount || 0
          },
          booking: {
            checkIn: roomInfo.checkIn || "Today",
            checkOut: roomInfo.checkOut || "Tomorrow",
            adults: roomInfo.adults || roomInfo.occupancy?.[0]?.adults || 2,
            nights: roomInfo.nights || 1,
            price: roomInfo.price || roomInfo.occupancy?.[0]?.price || vendorData.priceFrom || 0,
            originalPrice: roomInfo.originalPrice || roomInfo.occupancy?.[0]?.originalPrice || vendorData.priceTo || 0,
            discount: roomInfo.discount || roomInfo.occupancy?.[0]?.discount || "",
            breakfast: roomInfo.breakfast || roomInfo.occupancy?.[0]?.breakfast || "",
            breakfastPrice: roomInfo.breakfastPrice || roomInfo.occupancy?.[0]?.breakfastPrice || "",
            benefits: roomInfo.benefits || roomInfo.occupancy?.[0]?.benefits || ["Pay at hotel", "Free WiFi"],
            checkInTime: roomInfo.checkInTime || "15:00",
            totalPrice: roomInfo.totalPrice || roomInfo.price || vendorData.priceFrom || 0,
            perNight: roomInfo.perNight || roomInfo.price || vendorData.priceFrom || 0
          }
        };
        console.log("🛠️ Created room data:", newRoomData);
        setRoomData(newRoomData);
      }
      
      // Load saved guest info
      const savedGuestInfo = localStorage.getItem('bookingData');
      if (savedGuestInfo) {
        try {
          const guestData = JSON.parse(savedGuestInfo);
          setBookingData(prev => ({
            ...prev,
            ...guestData
          }));
        } catch (error) {
          console.error("❌ Failed to parse guest info:", error);
        }
      }
      
      // Pre-fill user data if logged in
      const authStatus = requireAuth();
      if (authStatus.authenticated) {
        try {
          const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
          if (userProfile.firstName || userProfile.lastName || userProfile.email) {
            setBookingData(prev => ({
              ...prev,
              firstName: userProfile.firstName || prev.firstName,
              lastName: userProfile.lastName || prev.lastName,
              email: userProfile.email || prev.email,
              phone: userProfile.phone || prev.phone
            }));
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
        }
      }
      
      setLoading(false);
      console.log("✅ Booking data loading complete");
    };

    loadBookingData();
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method) => {
    setSelectedPayment(method);
    setBookingData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomData) {
      alert("Please select a room first");
      navigate(-1);
      return;
    }

    // Validate required fields
    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email || !bookingData.phone) {
      alert("Please fill in all required contact information");
      return;
    }

    // Check authentication
    const authStatus = requireAuth();
    
    if (!authStatus.authenticated) {
      // Save current booking details to localStorage to restore after login
      localStorage.setItem("pendingBooking", JSON.stringify({
        type: "hotel",
        hotelId: hotelData?.id || roomData.hotel?.id,
        hotelName: hotelData?.name || roomData.hotel?.name,
        hotelImage: hotelData?.image || roomData.hotel?.image,
        roomData: roomData,
        bookingData: bookingData,
        selectedPayment: selectedPayment,
        bookingId: bookingId,
        totalAmount: calculateTotal(),
        checkInDate: roomData.booking?.checkIn,
        checkOutDate: roomData.booking?.checkOut,
        guests: roomData.booking?.adults,
        timestamp: Date.now()
      }));
      
      // Save redirect URL for after login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      
      // Save form data temporarily
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
      
      // Redirect to login
      navigate("/login", { 
        state: { 
          message: "Please login or create an account to complete your booking",
          requiresVerification: true
        } 
      });
      return;
    }
    
    if (!authStatus.verified) {
      // Redirect to OTP verification
      navigate("/verify-otp", { 
        state: { 
          message: "Please verify your account to complete your booking",
          returnPath: window.location.pathname
        } 
      });
      return;
    }

    console.log("🚀 Submitting hotel booking...");

    // Save guest information
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Combine booking data with enhanced structure
    const completeBooking = {
      ...bookingData,
      paymentMethod: selectedPayment,
      roomData: roomData,
      hotelData: hotelData,
      bookingType: 'hotel',
      bookingDate: new Date().toISOString(),
      bookingId: bookingId,
      status: selectedPayment === "card" ? "pending_payment" : "confirmed",
      totalAmount: calculateTotal(),
      timestamp: Date.now(),
      userId: JSON.parse(localStorage.getItem("userProfile") || "{}")._id || null
    };

    console.log("💾 Complete booking data:", completeBooking);

    // Save complete booking data
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    localStorage.setItem('hotelBooking', JSON.stringify(completeBooking));
    
    // Clear temporary data
    localStorage.removeItem('roomBookingData');
    localStorage.removeItem('currentVendorBooking');
    
    // If paying at hotel, go directly to confirmation
    if (selectedPayment === "hotel") {
      console.log("🏨 Pay at hotel selected - redirecting to confirmation");
      navigate('/booking-confirmation/hotel', { 
        state: { 
          bookingData: completeBooking,
          bookingType: 'hotel'
        } 
      });
    } else {
      // For card payment, go to payment page
      console.log("💳 Card payment selected - redirecting to payment");
      navigate('/booking/payment', { 
        state: { 
          bookingData: completeBooking,
          bookingType: 'hotel'
        } 
      });
    }
  };

  // ALL FEES SET TO ZERO
  const calculateTotal = () => {
    if (!roomData?.booking?.price) return 0;
    const roomPrice = roomData.booking.price;
    // All fees set to 0
    const taxes = 0;
    const serviceFee = 0;
    return roomPrice + taxes + serviceFee; // Just room price
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const getLocationString = (locationData) => {
    if (!locationData) return 'Location not specified';
    if (typeof locationData === 'string') return locationData;
    if (typeof locationData === 'object') {
      if (locationData.area) return locationData.area;
      if (locationData.address) return locationData.address;
      if (locationData.location) return getLocationString(locationData.location);
    }
    return 'Location not specified';
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

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-3 py-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faBed} className="text-yellow-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">No Room Selected</h2>
            <p className="text-gray-600 mb-5">Please select a room before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-lg cursor-pointer text-sm"
            >
              ← Go Back & Select Room
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ALL FEES SET TO ZERO
  const roomPrice = roomData?.booking?.price || 0;
  const taxes = 0;
  const serviceFee = 0;
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* Reduced top spacing */}
      <div className="pt-0">
        {/* Main container with edge-to-edge padding on mobile */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-20 sm:py-26">
          {/* Stepper - Reduced spacing */}
          <div className="mb-4 sm:mb-8">
            <Stepper currentStep={1} />
          </div>
          
          {/* Main Card - Reduced padding and border radius on mobile */}
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Back Button - Compact */}
            <div className="px-3 sm:px-6 pt-3 sm:pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                <span className="font-medium">Back to room selection</span>
              </button>
            </div>

            {/* Grid - Tight spacing on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header - Compact */}
                <div className="px-1 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {hotelData?.category === 'shortlet' ? 'Book Your Shortlet Stay' : 
                     hotelData?.category === 'restaurant' ? 'Book Your Restaurant Table' : 
                     'Complete Your Hotel Booking'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {hotelData?.category === 'shortlet' ? 'Please fill in your details to book your stay' : 
                     hotelData?.category === 'restaurant' ? 'Please fill in your details to reserve your table' : 
                     'Please fill in your details to secure your stay'}
                  </p>
                </div>

                {/* Hotel & Room Preview Card - Compact */}
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={roomData.hotel?.image || hotelData?.image} 
                        alt={roomData.hotel?.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        {roomData.hotel?.rating || 4.5}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                            {roomData.hotel?.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{getLocationString(roomData.hotel?.location)}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {roomData.room?.title}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faBed} className="text-blue-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Beds</p>
                            <p className="font-medium text-xs">{roomData.room?.beds}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 text-xs" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Guests</p>
                            <p className="font-medium text-xs">{roomData.booking?.adults} adults</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                          <span>{roomData.booking?.checkIn} → {roomData.booking?.checkOut}</span>
                        </div>
                        <div className="hidden sm:block h-3 w-px bg-gray-300"></div>
                        <div>
                          <span className="font-semibold">{roomData.booking?.nights} night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Options - Compact */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCreditCard} className="text-blue-500 text-sm" />
                    Payment Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handlePaymentChange("hotel")}
                      className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedPayment === "hotel" 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedPayment === "hotel" 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === "hotel" && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <FontAwesomeIcon icon={faHotel} className="text-blue-600 text-xs" />
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">Pay at Hotel</span>
                          </div>
                          <p className="text-xs text-gray-600 leading-tight">Pay when you arrive</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
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
                      Guest Information
                    </h2>
                    <p className="text-xs text-gray-600">Who's checking in?</p>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          First Name *
                        </label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={bookingData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Last Name *
                        </label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={bookingData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
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
                          name="email"
                          value={bookingData.email}
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
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleInputChange}
                          placeholder="+234 800 000 0000"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Any special requirements or preferences..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="mt-6">
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-blue-50 rounded-lg">
                    <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                      By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy. I understand that my booking is subject to the hotel's cancellation policy and any applicable fees.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                  >
                    {selectedPayment === "hotel" ? "Confirm Booking" : "Proceed to Payment"}
                    <span className="ml-2">→</span>
                  </button>
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
                  
                  {/* Hotel Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-2.5">
                      <div className="flex items-start gap-2.5">
                        <img 
                          src={roomData.hotel?.image} 
                          alt={roomData.hotel?.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{roomData.hotel?.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{roomData.hotel?.rating}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">• {getLocationString(roomData.hotel?.location)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs text-gray-600">Room Type</span>
                          <span className="text-xs font-semibold text-gray-900">{roomData.room?.title}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Stay Duration</span>
                          <span className="text-xs font-medium">{roomData.booking?.nights} night</span>
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
                          <span className="text-gray-600">Room x {roomData.booking?.nights} night</span>
                          <span className="font-medium">{formatPrice(roomData.booking?.price)}</span>
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
                        
                        {/* Discount */}
                        {roomData.booking?.discount && (
                          <div className="pt-1.5 border-t border-gray-200">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-600">Discount</span>
                              <span className="font-bold text-emerald-600">{roomData.booking.discount}</span>
                            </div>
                          </div>
                        )}
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
                          {selectedPayment === "hotel" ? "Pay at hotel upon arrival" : "Payment required now"}
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
                      {roomData.booking?.benefits?.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-1.5 text-xs">
                          <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
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
      </div>
      
      <Footer />
    </div>
  );
};

export default HotelBooking;