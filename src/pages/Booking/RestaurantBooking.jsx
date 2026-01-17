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
      status: selectedPayment === "card" ? "pending_payment" : "confirmed"
    };

    // Save to localStorage
    localStorage.setItem('restaurantBooking', JSON.stringify(completeBooking));
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    
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
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faUtensils} className="text-yellow-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Restaurant Selected</h2>
            <p className="text-gray-600 mb-6">Please select a restaurant before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
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
      
      <div className="md:pt-2 pt-2">
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
                <span className="font-medium">Back to restaurant selection</span>
              </button>
            </div>

            {/* Grid - Single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 p-4 sm:p-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header - Smaller on mobile */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Reserve Your Table
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Please fill in your details to reserve your table
                </p>

                {/* Restaurant Preview Card - More compact */}
                <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                        alt={vendorData.name}
                        className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl shadow-md"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        {vendorData.rating || 4.8}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                            {vendorData.name || "JAGZ Restaurant"}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{vendorData.area || vendorData.location || "Mekola, IL 2814"}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                          Fine Dining
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cuisine</p>
                            <p className="font-medium text-sm">{vendorData.cuisine || "Continental"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faClock} className="text-emerald-600 text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reservation</p>
                            <p className="font-medium text-sm">Table Booking</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600">
                        {vendorData.description || "Serving delicious meals with a cozy ambiance and warm hospitality."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates & Time Section */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-500" />
                    Date & Time
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateForDisplay(bookingData.date)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time *
                      </label>
                      <select
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                        required
                      >
                        {getAvailableTimes().map(time => (
                          <option key={time} value={time}>
                            {formatTimeForDisplay(time)}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Dining time slot
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guests Section */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-500" />
                    Number of Guests
                  </h2>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Select number of guests *
                      </label>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleGuestChange('decrease')}
                          className="w-12 h-12 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer text-lg font-bold text-blue-600"
                        >
                          -
                        </button>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">{bookingData.numberOfGuests}</div>
                          <div className="text-sm text-gray-600">guest{bookingData.numberOfGuests !== 1 ? 's' : ''}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleGuestChange('increase')}
                          className="w-12 h-12 rounded-full border-2 border-emerald-300 bg-white flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer text-lg font-bold text-emerald-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCreditCard} className="text-blue-500" />
                    Payment Options
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handlePaymentChange("restaurant")}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                        selectedPayment === "restaurant" 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === "restaurant" 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === "restaurant" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <FontAwesomeIcon icon={faUtensils} className="text-blue-600 text-sm" />
                            <span className="font-bold text-gray-900 text-sm sm:text-base">Pay at Restaurant</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">Pay when you arrive</p>
                          <div className="flex items-center gap-1 mt-2">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 text-xs" />
                            <span className="text-xs text-green-600">No prepayment needed</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      type="button"
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
                          <div className="flex items-center gap-1 mt-2">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 text-xs" />
                            <span className="text-xs text-green-600">SSL encrypted</span>
                          </div>
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
                      Contact Information
                    </h2>
                    <p className="text-sm text-gray-600">Who's making the reservation?</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="contactInfo.firstName"
                            value={bookingData.contactInfo.firstName}
                            onChange={handleInputChange}
                            placeholder="John"
                            className="w-full px-12 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <div className="relative">
                          <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name="contactInfo.lastName"
                            value={bookingData.contactInfo.lastName}
                            onChange={handleInputChange}
                            placeholder="Doe"
                            className="w-full px-12 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                            required
                          />
                        </div>
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
                          name="contactInfo.email"
                          value={bookingData.contactInfo.email}
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
                          name="contactInfo.phone"
                          value={bookingData.contactInfo.phone}
                          onChange={handleInputChange}
                          placeholder="+234 800 000 0000"
                          className="w-full px-12 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faNotesMedical} className="text-blue-500" />
                    Special Requests (Optional)
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg sm:rounded-xl p-4">
                    <textarea
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Any specific requests or requirements (dietary restrictions, seating preferences, special occasions, etc.)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base bg-transparent"
                    />
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
                      By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy. I understand that my reservation is subject to the restaurant's cancellation policy and any applicable fees.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
                  >
                    {selectedPayment === "restaurant" ? "Reserve Table" : "Proceed to Payment"}
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
                  
                  {/* Restaurant Card */}
                  <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                          alt={vendorData.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{vendorData.name || "JAGZ Restaurant"}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{vendorData.rating || 4.8}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">• {vendorData.area || "Mekola, IL 2814"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm text-gray-600">Date</span>
                          <span className="text-xs sm:text-sm font-medium">{formatDateForDisplay(bookingData.date)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm text-gray-600">Time</span>
                          <span className="text-xs sm:text-sm font-medium">{formatTimeForDisplay(bookingData.time)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Guests</span>
                          <span className="text-xs sm:text-sm font-medium">{bookingData.numberOfGuests} guest{bookingData.numberOfGuests !== 1 ? 's' : ''}</span>
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
                          <span className="text-gray-600">Reservation fee</span>
                          <span className="font-medium">{formatPrice(total)}</span>
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
                          {selectedPayment === "restaurant" ? "Pay at restaurant upon arrival" : "Payment required now"}
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
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">Reserved table for {bookingData.numberOfGuests}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">Complimentary welcome drink</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">Priority seating</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">Special requests accommodation</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="font-medium">Best Table Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
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