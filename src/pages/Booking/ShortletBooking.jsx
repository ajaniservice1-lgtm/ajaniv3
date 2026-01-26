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

  // SIMPLIFIED AUTH CHECK - same as hotel booking
  const checkAuthStatus = () => {
    const token = localStorage.getItem("auth_token");
    const guestSession = localStorage.getItem("guestSession");
    
    if (token || guestSession) {
      return true;
    }
    
    return false;
  };

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
      
      // Pre-fill user data if logged in
      const isAuthenticated = checkAuthStatus();
      if (isAuthenticated) {
        try {
          const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
          const userEmail = localStorage.getItem("user_email");
          
          if (userProfile.firstName || userProfile.lastName || userProfile.email || userEmail) {
            setBookingData(prev => ({
              ...prev,
              contactInfo: {
                name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || prev.contactInfo.name,
                email: userProfile.email || userEmail || prev.contactInfo.email,
                phone: userProfile.phone || prev.contactInfo.phone
              }
            }));
          }
        } catch (error) {
          console.error("Failed to load user profile:", error);
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

    // SIMPLIFIED AUTH CHECK - same as hotel booking
    const isAuthenticated = checkAuthStatus();
    console.log("Auth status:", isAuthenticated);
    
    if (!isAuthenticated) {
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
      localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));
      localStorage.setItem("pendingShortletBooking", JSON.stringify(pendingBooking));
      
      // Save redirect URL for after login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      
      // Save form data temporarily
      localStorage.setItem('shortletFormData', JSON.stringify(bookingData));
      
      // Redirect to login with simplified flow
      navigate("/login", { 
        state: { 
          message: "Please login or continue as guest to complete your booking",
          fromBooking: true,
          intent: "shortlet_booking",
          returnTo: "/booking-confirmation/shortlet"
        } 
      });
      return;
    }

    console.log("User authenticated, proceeding with booking");

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
      totalAmount: calculateTotal(),
      timestamp: Date.now()
    };

    console.log("Complete booking data:", completeBooking);

    // Save to localStorage
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    localStorage.setItem('shortletBooking', JSON.stringify(completeBooking));
    
    // Clear any pending booking data
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('pendingShortletBooking');
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
  const calculateTotal = () => {
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const pricePerNight = vendorData?.priceFrom || 0;
    const subtotal = pricePerNight * nights;
    const serviceFee = 0;
    const taxes = 0;
    return subtotal + serviceFee + taxes;
  };

  const checkIn = new Date(bookingData.checkInDate);
  const checkOut = new Date(bookingData.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const pricePerNight = vendorData?.priceFrom || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = 0;
  const taxes = 0;
  const total = subtotal + serviceFee + taxes;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto cursor-pointer"></div>
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
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer">
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
          {/* Stepper - Reduced spacing */}
          <div className="mb-4 sm:mb-8">
            <Stepper currentStep={1} />
          </div>
          
          {/* Main Card - Reduced padding on mobile */}
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Back Button - More compact on mobile */}
            <div className="px-3 sm:px-6 pt-3 sm:pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer text-sm"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs cursor-pointer" />
                <span className="font-medium">Back to property selection</span>
              </button>
            </div>

            {/* Grid - Single column on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                {/* Header - Smaller on mobile */}
                <div className="px-1 mb-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    Complete Your Shortlet Booking
                  </h1>
                  <p className="text-sm text-gray-600">
                    Please fill in your details to secure your stay
                  </p>
                </div>

                {/* Property & Room Preview Card - More compact */}
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-blue-100 cursor-pointer">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="md:w-1/3 relative">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                        alt={vendorData.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-sm cursor-pointer"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full cursor-pointer">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1 cursor-pointer" />
                        {vendorData.rating || 4.5}
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 cursor-pointer">
                            {vendorData.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2 cursor-pointer">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500 cursor-pointer" />
                            <span className="truncate">{vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer">
                          Shortlet Apartment
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 cursor-pointer">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 cursor-pointer">
                            <FontAwesomeIcon icon={faHome} className="text-blue-600 text-xs cursor-pointer" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Property Type</p>
                            <p className="font-medium text-xs cursor-pointer">Shortlet</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 cursor-pointer">
                          <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 cursor-pointer">
                            <FontAwesomeIcon icon={faUsers} className="text-emerald-600 text-xs cursor-pointer" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Max Guests</p>
                            <p className="font-medium text-xs cursor-pointer">Up to {vendorData.maxGuests || 4}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs cursor-pointer">
                        <div className="flex items-center gap-1.5 cursor-pointer">
                          <FontAwesomeIcon icon={faCalendar} className="text-gray-400 cursor-pointer" />
                          <span>{formatDateDisplay(bookingData.checkInDate)} → {formatDateDisplay(bookingData.checkOutDate)}</span>
                        </div>
                        <div className="hidden sm:block h-3 w-px bg-gray-300 cursor-pointer"></div>
                        <div>
                          <span className="font-semibold cursor-pointer">{nights} night{nights !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5 cursor-pointer">
                    <FontAwesomeIcon icon={faCalendar} className="text-blue-500 text-sm cursor-pointer" />
                    Dates & Duration
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 cursor-pointer">
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
                      <p className="text-xs text-gray-500 mt-1 cursor-pointer">
                        {formatDateDisplay(bookingData.checkInDate)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 cursor-pointer">
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
                      <p className="text-xs text-gray-500 mt-1 cursor-pointer">
                        {formatDateDisplay(bookingData.checkOutDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guests Section */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5 cursor-pointer">
                    <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-sm cursor-pointer" />
                    Number of Guests
                  </h2>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 sm:p-4 cursor-pointer">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-3 cursor-pointer">
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
                        <div className="text-center cursor-pointer">
                          <div className="text-2xl font-bold text-gray-900 mb-0.5 cursor-pointer">{bookingData.numberOfGuests}</div>
                          <div className="text-xs text-gray-600 cursor-pointer">guests</div>
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
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 cursor-pointer">
                      <FontAwesomeIcon icon={faUser} className="text-blue-500 text-sm cursor-pointer" />
                      Contact Information
                    </h2>
                    <p className="text-xs text-gray-600 cursor-pointer">Who's checking in?</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 cursor-pointer">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm cursor-pointer" />
                        <input
                          type="text"
                          name="contactInfo.name"
                          value={bookingData.contactInfo.name}
                          onChange={handleInputChange}
                          placeholder="Full Name"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 cursor-pointer">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm cursor-pointer" />
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
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 cursor-pointer">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm cursor-pointer" />
                        <input
                          type="email"
                          name="contactInfo.email"
                          value={bookingData.contactInfo.email}
                          onChange={handleInputChange}
                          placeholder="your email address or gmail address"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:border-blue-300 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5 cursor-pointer">
                    <FontAwesomeIcon icon={faNotesMedical} className="text-blue-500 text-sm cursor-pointer" />
                    Additional Notes (Optional)
                  </h2>
                  <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-3 cursor-pointer">
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
                  <div className="flex items-start gap-2 mb-3 p-2.5 bg-blue-50 rounded-lg cursor-pointer">
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
                    className="w-full bg-[#6cff] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer text-sm"
                  >
                    Send Booking Request
                    <span className="ml-2 cursor-pointer">→</span>
                  </button>

                </div>
              </div>

              {/* Right Column - Booking Summary - Sticky on desktop only */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 space-y-3">
                  {/* Summary Header */}
                  <div className="bg-[#6cff] rounded-lg p-3 text-white cursor-pointer">
                    <h3 className="text-base font-bold mb-1 cursor-pointer">Booking Summary</h3>
                    <p className="text-xs opacity-90 cursor-pointer">Booking ID: {bookingId}</p>
                  </div>
                  
                  {/* Property Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden cursor-pointer">
                    <div className="p-2.5">
                      <div className="flex items-start gap-2.5 cursor-pointer">
                        <img 
                          src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                          alt={vendorData.name}
                          className="w-10 h-10 object-cover rounded cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 cursor-pointer">
                          <h4 className="font-bold text-gray-900 text-sm truncate cursor-pointer">{vendorData.name}</h4>
                          <div className="flex items-center gap-1 mt-0.5 cursor-pointer">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs cursor-pointer" />
                            <span className="text-xs font-medium cursor-pointer">{vendorData.rating || 4.5}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline cursor-pointer">• {vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100 cursor-pointer">
                        <div className="flex justify-between items-center mb-1.5 cursor-pointer">
                          <span className="text-xs text-gray-600 cursor-pointer">Check-in</span>
                          <span className="text-xs font-medium cursor-pointer">{formatDateDisplay(bookingData.checkInDate)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1.5 cursor-pointer">
                          <span className="text-xs text-gray-600 cursor-pointer">Check-out</span>
                          <span className="text-xs font-medium cursor-pointer">{formatDateDisplay(bookingData.checkOutDate)}</span>
                        </div>
                        <div className="flex justify-between items-center cursor-pointer">
                          <span className="text-xs text-gray-600 cursor-pointer">Stay Duration</span>
                          <span className="text-xs font-medium cursor-pointer">{nights} night{nights !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown - ALL FEES SET TO 0 */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer">
                    <div className="p-3">
                      <h5 className="font-bold text-gray-900 mb-2 text-sm cursor-pointer">Price Breakdown</h5>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs cursor-pointer">
                          <span className="text-gray-600 cursor-pointer">Price per night</span>
                          <span className="font-medium cursor-pointer">{formatPrice(pricePerNight)}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs cursor-pointer">
                          <span className="text-gray-600 cursor-pointer">× {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span className="font-medium cursor-pointer">{formatPrice(subtotal)}</span>
                        </div>
                        
                        {/* Taxes & Fees - Showing as ₦0 */}
                        <div className="flex justify-between text-xs cursor-pointer">
                          <span className="text-gray-600 cursor-pointer">Taxes & fees</span>
                          <span className="font-medium cursor-pointer">{formatPrice(taxes)}</span>
                        </div>
                        
                        {/* Service fee - Showing as ₦0 */}
                        <div className="flex justify-between text-xs cursor-pointer">
                          <span className="text-gray-600 cursor-pointer">Service fee</span>
                          <span className="font-medium cursor-pointer">{formatPrice(serviceFee)}</span>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="mt-2.5 pt-2.5 border-t border-gray-300 cursor-pointer">
                        <div className="flex justify-between items-center cursor-pointer">
                          <span className="font-bold text-gray-900 text-sm cursor-pointer">Total Amount</span>
                          <span className="text-lg font-bold text-emerald-600 cursor-pointer">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1 cursor-pointer">
                          Booking request - confirmation required
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Benefits Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100 p-2.5 cursor-pointer">
                    <h6 className="font-bold text-gray-900 mb-1.5 flex items-center gap-1.5 text-sm cursor-pointer">
                      <FontAwesomeIcon icon={faConciergeBell} className="text-emerald-600 cursor-pointer" />
                      What's Included
                    </h6>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 cursor-pointer" />
                        <span className="text-gray-700 cursor-pointer">Fully furnished apartment</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 cursor-pointer" />
                        <span className="text-gray-700 cursor-pointer">Free WiFi</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 cursor-pointer" />
                        <span className="text-gray-700 cursor-pointer">Kitchen facilities</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 cursor-pointer" />
                        <span className="text-gray-700 cursor-pointer">24/7 support</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guarantee */}
                  <div className="text-center cursor-pointer">
                    <div className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 cursor-pointer" />
                      <span className="font-medium cursor-pointer">Best Price Guarantee</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 cursor-pointer">
                      Flexible cancellation policy
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1.5 cursor-pointer">
                      <FontAwesomeIcon icon={faClock} className="text-emerald-500 cursor-pointer" />
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