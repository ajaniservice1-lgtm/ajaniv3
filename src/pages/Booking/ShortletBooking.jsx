import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  faCalendar, 
  faUsers, 
  faClock,
  faHome,
  faMapMarkerAlt,
  faStar,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Property Selected</h2>
            <p className="text-gray-600 mb-6">Please select a property before proceeding to booking.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Return Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate total price
  const checkIn = new Date(bookingData.checkInDate);
  const checkOut = new Date(bookingData.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const pricePerNight = vendorData?.priceFrom || 0;
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-8">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Stepper currentStep={1} />
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 cursor-pointer"
            >
              ← Back
            </button>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Book {vendorData.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Please provide your booking details
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Property Preview */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <img 
                            src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                            alt={vendorData.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="flex items-center gap-1 mt-2">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                            <span className="font-medium">{vendorData.rating || 4.5}</span>
                          </div>
                        </div>
                        <div className="md:w-2/3">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {vendorData.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500" />
                            <span>{vendorData.area || vendorData.location || "Location"}</span>
                          </div>
                          <p className="text-gray-600">
                            {vendorData.description || "Modern shortlet apartment with all amenities"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dates Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} />
                        Dates
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-in Date *
                          </label>
                          <input
                            type="date"
                            name="checkInDate"
                            value={bookingData.checkInDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateDisplay(bookingData.checkInDate)}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check-out Date *
                          </label>
                          <input
                            type="date"
                            name="checkOutDate"
                            value={bookingData.checkOutDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDateDisplay(bookingData.checkOutDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Guests Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} />
                        Guests
                      </h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests *
                        </label>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({
                              ...prev,
                              numberOfGuests: Math.max(1, prev.numberOfGuests - 1)
                            }))}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xl font-bold">{bookingData.numberOfGuests}</span>
                          <button
                            type="button"
                            onClick={() => setBookingData(prev => ({
                              ...prev,
                              numberOfGuests: prev.numberOfGuests + 1
                            }))}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Contact Information
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="contactInfo.name"
                            value={bookingData.contactInfo.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="contactInfo.phone"
                            value={bookingData.contactInfo.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="contactInfo.email"
                            value={bookingData.contactInfo.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Additional Notes (Optional)
                      </h2>
                      <textarea
                        name="additionalNotes"
                        value={bookingData.additionalNotes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Any specific requests or requirements..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                      />
                    </div>

                    {/* Terms and Submit */}
                    <div>
                      <div className="flex items-start gap-2 mb-6">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                          By proceeding with this booking, I agree to Ajani's Terms of Use and Privacy Policy.
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition cursor-pointer"
                      >
                        Send Booking Request
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 sticky top-24">
                  <h3 className="font-semibold text-gray-800">Booking Summary</h3>
                  
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={vendorData.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} 
                        alt={vendorData.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{vendorData.name}</h4>
                        <p className="text-sm text-gray-600">{vendorData.area || "Location"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium">{formatDateDisplay(bookingData.checkInDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium">{formatDateDisplay(bookingData.checkOutDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nights</span>
                        <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests</span>
                        <span className="font-medium">{bookingData.numberOfGuests} person{bookingData.numberOfGuests !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-800 mb-3">Price Breakdown</h5>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price per night</span>
                        <span className="font-medium">{formatPrice(pricePerNight)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">× {nights} night{nights !== 1 ? 's' : ''}</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">{formatPrice(serviceFee)}</span>
                      </div>
                      
                      {/* Total */}
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-lg font-bold text-emerald-600">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Benefits */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-800 mb-3">What's Included</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span>Fully furnished apartment</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span>Free WiFi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span>Kitchen facilities</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                        <span>24/7 support</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p className="mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                      Booking request - confirmation required
                    </p>
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheck} className="text-emerald-500" />
                      Flexible cancellation policy
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