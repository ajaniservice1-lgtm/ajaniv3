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
      timestamp: Date.now()
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
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faBed} className="text-yellow-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Room Selected</h2>
            <p className="text-gray-600 mb-6">Please select a room before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
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
      
      <div className="md:pt-2 pt-2">
        {/* Reduced padding on mobile */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          {/* Stepper - Reduced spacing */}
          <div className="mb-6 sm:mb-12">
            <Stepper currentStep={1} />
          </div>
          
          {/* Main Card - Reduced padding on mobile */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-gray-100">
            {/* Back Button - More compact on mobile */}
            <div className="px-4 sm:px-8 pt-4 sm:pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
                <span className="font-medium">Back to room selection</span>
              </button>
            </div>

            {/* Grid - Single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 p-4 sm:p-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header - Smaller on mobile */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {hotelData?.category === 'shortlet' ? 'Book Your Shortlet Stay' : 
                   hotelData?.category === 'restaurant' ? 'Book Your Restaurant Table' : 
                   'Complete Your Hotel Booking'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  {hotelData?.category === 'shortlet' ? 'Please fill in your details to book your stay' : 
                   hotelData?.category === 'restaurant' ? 'Please fill in your details to reserve your table' : 
                   'Please fill in your details to secure your stay'}
                </p>

                {/* Hotel & Room Preview Card - More compact */}
                <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={roomData.hotel?.image || hotelData?.image} 
                        alt={roomData.hotel?.name}
                        className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl shadow-md"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        {roomData.hotel?.rating || 4.5}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                            {roomData.hotel?.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{getLocationString(roomData.hotel?.location)}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                          {roomData.room?.title}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faBed} className="text-blue-600 text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Beds</p>
                            <p className="font-medium text-sm">{roomData.room?.beds}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Guests</p>
                            <p className="font-medium text-sm">{roomData.booking?.adults} adults</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                          <span>{roomData.booking?.checkIn} → {roomData.booking?.checkOut}</span>
                        </div>
                        <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                        <div>
                          <span className="font-semibold">{roomData.booking?.nights} night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Options - More compact */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCreditCard} className="text-blue-500" />
                    Payment Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      onClick={() => handlePaymentChange("hotel")}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                        selectedPayment === "hotel" 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === "hotel" 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === "hotel" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <FontAwesomeIcon icon={faHotel} className="text-blue-600 text-sm" />
                            <span className="font-bold text-gray-900 text-sm sm:text-base">Pay at Hotel</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">Pay when you arrive</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handlePaymentChange("card")}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                        selectedPayment === "card" 
                          ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === "card" 
                            ? 'border-emerald-500 bg-emerald-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === "card" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <FontAwesomeIcon icon={faCreditCard} className="text-emerald-600 text-sm" />
                            <span className="font-bold text-gray-900 text-sm sm:text-base">Credit/Debit Card</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">Secure online payment</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6 sm:mb-8">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                      Guest Information
                    </h2>
                    <p className="text-sm text-gray-600">Who's checking in?</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={bookingData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={bookingData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                          type="email" 
                          name="email"
                          value={bookingData.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
                          className="w-full px-12 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                          type="tel" 
                          name="phone"
                          value={bookingData.phone}
                          onChange={handleInputChange}
                          placeholder="+234 800 000 0000"
                          className="w-full px-12 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any special requirements or preferences..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="mt-8 sm:mt-10">
                  <div className="flex items-start gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 cursor-pointer">
                      By proceeding with this booking,  I agree to Ajani's Terms of Use and Privacy Policy. I understand that my booking is subject to the hotel's cancellation policy and any applicable fees.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full  bg-blue-600  text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
                  >
                    {selectedPayment === "hotel" ? "Confirm Booking" : "Proceed to Payment"}
                    <span className="ml-2">→</span>
                  </button>
                </div>
              </div>

              {/* Right Column - Booking Summary - Sticky on desktop only */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                  {/* Summary Header */}
                  <div className="bg-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Booking Summary</h3>
                    <p className="text-xs sm:text-sm opacity-90">Booking ID: {bookingId}</p>
                  </div>
                  
                  {/* Hotel Card */}
                  <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={roomData.hotel?.image} 
                          alt={roomData.hotel?.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{roomData.hotel?.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{roomData.hotel?.rating}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">• {getLocationString(roomData.hotel?.location)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm text-gray-600">Room Type</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">{roomData.room?.title}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Stay Duration</span>
                          <span className="text-xs sm:text-sm font-medium">{roomData.booking?.nights} night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown - ALL FEES SET TO 0 */}
                  <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 sm:p-6">
                      <h5 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Price Breakdown</h5>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Room x {roomData.booking?.nights} night</span>
                          <span className="font-medium">{formatPrice(roomData.booking?.price)}</span>
                        </div>
                        
                        {/* Taxes & Fees - Showing as ₦0 */}
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">{formatPrice(taxes)}</span>
                        </div>
                        
                        {/* Service fee - Showing as ₦0 */}
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatPrice(serviceFee)}</span>
                        </div>
                        
                        {/* Discount */}
                        {roomData.booking?.discount && (
                          <div className="pt-2 sm:pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">Discount</span>
                              <span className="font-bold text-emerald-600">{roomData.booking.discount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Total */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm sm:text-base">Total Amount</span>
                          <span className="text-lg sm:text-2xl font-bold text-emerald-600">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {selectedPayment === "hotel" ? "Pay at hotel upon arrival" : "Payment required now"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Benefits Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg sm:rounded-xl border border-emerald-100 p-3 sm:p-5">
                    <h6 className="font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      <FontAwesomeIcon icon={faConciergeBell} className="text-emerald-600" />
                      What's Included
                    </h6>
                    <div className="space-y-1 sm:space-y-2">
                      {roomData.booking?.benefits?.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                          <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="font-medium">Best Price Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
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