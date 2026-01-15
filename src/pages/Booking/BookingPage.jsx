// src/pages/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMapMarkerAlt, 
  faStar, 
  faCalendar, 
  faUsers,
  faBed,
  faCheckCircle,
  faChevronLeft,
  faClock,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [vendorData, setVendorData] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    address: "",
    specialRequests: ""
  });
  
  // Date states
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  
  const [selectedPayment, setSelectedPayment] = useState("hotel");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Fix: Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Additional fix: Also scroll to top when data loads
  useEffect(() => {
    if (vendorData) {
      window.scrollTo(0, 0);
    }
  }, [vendorData]);

  useEffect(() => {
    // Get data from location state or localStorage
    if (location.state) {
      setVendorData(location.state.vendorData);
      setSelectedRoom(location.state.selectedRoom);
    } else {
      const storedBooking = localStorage.getItem('currentVendorBooking');
      if (storedBooking) {
        try {
          const parsed = JSON.parse(storedBooking);
          setVendorData(parsed.vendorData);
          setSelectedRoom(parsed.selectedRoom);
        } catch (error) {
          console.error("Error parsing stored booking:", error);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckInDate(today);
    setCheckOutDate(tomorrow);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    if (!selectedRoom || !checkInDate || !checkOutDate) {
      const basePrice = vendorData?.priceFrom ? 
        parseInt(vendorData.priceFrom.toString().replace(/[^\d]/g, "")) : 85000;
      const nights = calculateNights();
      return basePrice * nights + 7500;
    }
    
    const roomPrice = selectedRoom.occupancy[0]?.price || 
      (vendorData.priceFrom ? parseInt(vendorData.priceFrom.toString().replace(/[^\d]/g, "")) : 85000);
    const nights = calculateNights();
    const rooms = parseInt(bookingData.numberOfRooms) || 1;
    return (roomPrice * nights * rooms) + 7500;
  };

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vendorData) {
      alert("No vendor data available");
      return;
    }

    setIsSubmitting(true);

    const bookingObject = {
      vendorData,
      selectedRoom,
      bookingData: {
        ...bookingData,
        checkInDate: checkInDate?.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
        numberOfNights: calculateNights().toString(),
        numberOfRooms: "1",
        numberOfGuests: selectedRoom?.maxGuests ? selectedRoom.maxGuests.toString() : "1"
      },
      selectedPayment,
      totalAmount: calculateTotal(),
      bookingDate: new Date().toISOString(),
      bookingReference: `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log("Submitting booking:", bookingObject);

    localStorage.setItem('lastBooking', JSON.stringify(bookingObject));
    sessionStorage.setItem('lastBooking', JSON.stringify(bookingObject));

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/booking-confirmation/${bookingObject.bookingReference}`, {
        state: bookingObject
      });
    }, 1500);
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  const isHotel = vendorData.category?.toLowerCase().includes('hotel');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Steps Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
            >
              ← Back
            </button>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span className={`${currentStep >= 1 ? 'text-emerald-600 font-semibold' : ''}`}>
                Customer Information
              </span>
              <span className={`${currentStep >= 2 ? 'text-emerald-600 font-semibold' : ''}`}>
                Payment Information
              </span>
              <span className={`${currentStep >= 3 ? 'text-emerald-600 font-semibold' : ''}`}>
                Booking Confirmed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT SIDE - Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hotel/Room Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={vendorData.image || vendorData.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"}
                      alt={vendorData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">{vendorData.name}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{vendorData.area || vendorData.address || "Mokola, Rd. 2314"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{vendorData.rating || "4.8"}</span>
                      </div>
                      <span className="text-gray-500">({vendorData.reviews || "23"})</span>
                    </div>
                    
                    {selectedRoom && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-1">Selected Room</h3>
                        <p className="text-sm text-gray-600">{selectedRoom.name || selectedRoom.title}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
                            {selectedRoom.maxGuests || selectedRoom.maxOccupancy} guests
                          </span>
                          <span className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faBed} className="w-4 h-4" />
                            {selectedRoom.beds || "2 Single Beds"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date Selection with DatePicker */}
              {isHotel && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">
                    Select Dates
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={checkInDate}
                          onChange={(date) => {
                            setCheckInDate(date);
                            // Auto-set checkout to next day if not set
                            if (!checkOutDate || date >= checkOutDate) {
                              const nextDay = new Date(date);
                              nextDay.setDate(nextDay.getDate() + 1);
                              setCheckOutDate(nextDay);
                            }
                          }}
                          minDate={new Date()}
                          dateFormat="EEE, MMM d"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                          placeholderText="Select check-in date"
                          popperPlacement="bottom-start"
                        />
                        <FontAwesomeIcon 
                          icon={faCalendar} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={checkOutDate}
                          onChange={setCheckOutDate}
                          minDate={checkInDate ? new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000) : new Date()}
                          dateFormat="EEE, MMM d"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                          placeholderText="Select check-out date"
                          popperPlacement="bottom-start"
                        />
                        <FontAwesomeIcon 
                          icon={faCalendar} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {checkInDate && checkOutDate && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">
                          {calculateNights()} night{calculateNights() > 1 ? 's' : ''} selected
                        </span>
                        <span className="text-sm font-medium text-emerald-700">
                          {formatDate(checkInDate)} → {formatDate(checkOutDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Option */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Choose your payment option
                </h3>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="hotel"
                      checked={selectedPayment === "hotel"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div>
                      <span className="font-medium">Pay at the hotel</span>
                      <p className="text-xs text-gray-500 mt-1">Pay when you arrive at the hotel</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card"
                      checked={selectedPayment === "card"}
                      onChange={(e) => setSelectedPayment(e.target.value)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <div>
                      <span className="font-medium">Credit/Debit card</span>
                      <p className="text-xs text-gray-500 mt-1">Secure payment with your card</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Lead Guest Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">
                  Who's the lead guest? *
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">First name *</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={bookingData.firstName}
                      onChange={handleInputChange}
                      placeholder="First name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Last name *</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={bookingData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Country/region *</label>
                    <input 
                      type="text" 
                      name="country"
                      value={bookingData.country}
                      onChange={handleInputChange}
                      placeholder="Country/region"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mobile number *</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      placeholder="Mobile number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={bookingData.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  We'll only use your details to process this booking.
                </p>
              </div>

              {/* Special Requests */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Special requests
                </h3>
                <textarea
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what you need (optional)..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Terms and CTA */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-2 mb-6">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the terms and conditions, privacy policy, and cancellation policy
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Next: Final Step - ${formatPrice(calculateTotal())}`
                  )}
                </button>
                
                <p className="text-center text-gray-500 text-xs mt-3">
                  You won't be charged until your booking is confirmed
                </p>
              </div>
            </div>

            {/* RIGHT SIDE - Booking Summary */}
            <div className="space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-5 sticky top-24">
                {/* Dates Summary */}
                {isHotel && checkInDate && checkOutDate && (
                  <div className="flex justify-between text-sm pb-4 border-b">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-semibold">{formatDate(checkInDate)}</p>
                      <p className="text-xs text-gray-400">From 2:00 PM</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-semibold">{formatDate(checkOutDate)}</p>
                      <p className="text-xs text-gray-400">Until 11:00 AM</p>
                    </div>
                  </div>
                )}

                {/* Hotel Card */}
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={vendorData.image || vendorData.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"}
                    alt={vendorData.name}
                    className="h-36 w-full object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-semibold text-sm">{vendorData.name}</h4>
                    <p className="text-xs text-gray-500">{vendorData.area || vendorData.address || "New York, USA"}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-emerald-600 font-medium">{vendorData.rating || "4.8"}</span>
                      <span className="text-xs text-gray-400">({vendorData.reviews || "23"})</span>
                    </div>
                  </div>
                </div>

                {/* Room Selected */}
                {selectedRoom && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Room Selected</p>
                    <p className="font-semibold text-sm">{selectedRoom.name || selectedRoom.title}</p>
                    <ul className="text-xs text-gray-500 mt-2 space-y-1">
                      <li className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 w-3 h-3" />
                        Free cancellation
                      </li>
                      <li className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 w-3 h-3" />
                        {selectedRoom.maxGuests || selectedRoom.maxOccupancy} guests
                      </li>
                      <li className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheck} className="text-emerald-500 w-3 h-3" />
                        {selectedRoom.beds || "2 Single Beds"}
                      </li>
                    </ul>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Price Breakdown</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {selectedRoom ? selectedRoom.name : "Standard rate"} × {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                      </span>
                      <span className="font-medium">
                        {formatPrice(
                          (selectedRoom ? (selectedRoom.occupancy?.[0]?.price || vendorData.priceFrom || 85000) : 
                           (vendorData.priceFrom || 85000)) * calculateNights()
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee</span>
                      <span className="font-medium">₦7,500</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes & charges</span>
                      <span className="font-medium text-emerald-600">Included</span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-emerald-600">{formatPrice(calculateTotal())}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Includes all taxes and fees</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium text-sm">
                    {selectedPayment === "hotel" ? "Pay at Hotel" : "Credit/Debit Card"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedPayment === "hotel" 
                      ? "Pay when you check-in at the hotel" 
                      : "Card will be charged upon confirmation"}
                  </p>
                </div>

                {/* Need Help */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-gray-500">Need help with your booking?</p>
                  <p className="text-sm font-medium text-emerald-600 mt-1">+234 800 123 4567</p>
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

export default BookingPage;