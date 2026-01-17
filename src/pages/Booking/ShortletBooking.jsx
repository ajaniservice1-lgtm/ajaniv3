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
    
    // Validate data
    if (!bookingData.checkInDate || !bookingData.checkOutDate || !bookingData.numberOfGuests) {
      alert("Please fill in all required fields");
      return;
    }

    if (!bookingData.contactInfo.name || !bookingData.contactInfo.email || !bookingData.contactInfo.phone) {
      alert("Please fill in all contact information");
      return;
    }

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
      paymentMethod: "direct"
    };

    // Save to localStorage
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    localStorage.setItem('shortletBooking', JSON.stringify(completeBooking));
    
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
  const serviceFee = 0; // All fees set to 0
  const taxes = 0; // All fees set to 0
  const total = subtotal + serviceFee + taxes;

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
              <FontAwesomeIcon icon={faHome} className="text-yellow-600 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Property Selected</h2>
            <p className="text-gray-600 mb-6">Please select a property before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
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
                <span className="font-medium">Back to property selection</span>
              </button>
            </div>

            {/* Grid - Single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 p-4 sm:p-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header - Smaller on mobile */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Complete Your Shortlet Booking
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                  Please fill in your details to secure your stay
                </p>

                {/* Property & Room Preview Card - More compact */}
                <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                        alt={vendorData.name}
                        className="w-full h-40 sm:h-48 object-cover rounded-lg sm:rounded-xl shadow-md"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                        {vendorData.rating || 4.5}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                            {vendorData.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span className="truncate">{vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full">
                          Shortlet Apartment
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faHome} className="text-blue-600 text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Property Type</p>
                            <p className="font-medium text-sm">Shortlet</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 text-xs sm:text-sm" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Max Guests</p>
                            <p className="font-medium text-sm">Up to {vendorData.maxGuests || 4}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400" />
                          <span>{formatDateDisplay(bookingData.checkInDate)} → {formatDateDisplay(bookingData.checkOutDate)}</span>
                        </div>
                        <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                        <div>
                          <span className="font-semibold">{nights} night{nights !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-500" />
                    Dates & Duration
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <input
                        type="date"
                        name="checkInDate"
                        value={bookingData.checkInDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateDisplay(bookingData.checkInDate)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <input
                        type="date"
                        name="checkOutDate"
                        value={bookingData.checkOutDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm sm:text-base"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDateDisplay(bookingData.checkOutDate)}
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
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            numberOfGuests: Math.max(1, prev.numberOfGuests - 1)
                          }))}
                          className="w-12 h-12 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer text-lg font-bold text-blue-600"
                        >
                          -
                        </button>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 mb-1">{bookingData.numberOfGuests}</div>
                          <div className="text-sm text-gray-600">guests</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({
                            ...prev,
                            numberOfGuests: prev.numberOfGuests + 1
                          }))}
                          className="w-12 h-12 rounded-full border-2 border-emerald-300 bg-white flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer text-lg font-bold text-emerald-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6 sm:mb-8">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500" />
                      Contact Information
                    </h2>
                    <p className="text-sm text-gray-600">Who's checking in?</p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="contactInfo.name"
                          value={bookingData.contactInfo.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
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
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faNotesMedical} className="text-blue-500" />
                    Additional Notes (Optional)
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg sm:rounded-xl p-4">
                    <textarea
                      name="additionalNotes"
                      value={bookingData.additionalNotes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Any specific requests or requirements... (e.g., early check-in, special arrangements, etc.)"
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
                      By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy. I understand that my booking is subject to the property's cancellation policy and any applicable fees.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r bg-blue-600  text-white font-bold py-3 sm:py-4 px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm sm:text-base"
                  >
                    Send Booking Request
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
                  
                  {/* Property Card */}
                  <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                          alt={vendorData.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{vendorData.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                            <span className="text-xs font-medium">{vendorData.rating || 4.5}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">• {vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm text-gray-600">Check-in</span>
                          <span className="text-xs sm:text-sm font-medium">{formatDateDisplay(bookingData.checkInDate)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <span className="text-xs sm:text-sm text-gray-600">Check-out</span>
                          <span className="text-xs sm:text-sm font-medium">{formatDateDisplay(bookingData.checkOutDate)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Stay Duration</span>
                          <span className="text-xs sm:text-sm font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
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
                          <span className="text-gray-600">Price per night</span>
                          <span className="font-medium">{formatPrice(pricePerNight)}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">× {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span className="font-medium">{formatPrice(subtotal)}</span>
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
                          Booking request - confirmation required
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
                        <span className="text-gray-700">Fully furnished apartment</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">Free WiFi</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">Kitchen facilities</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                        <span className="text-gray-700">24/7 support</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                      <span className="font-medium">Best Price Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Flexible cancellation policy
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-2">
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