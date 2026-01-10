// src/pages/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PaymentOptions from "../../pages/Booking/PaymentOptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMapMarkerAlt, 
  faStar, 
  faCalendar, 
  faUsers,
  faBed,
  faCheckCircle,
  faChevronLeft
} from "@fortawesome/free-solid-svg-icons";

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [vendorData, setVendorData] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: "1",
    numberOfNights: "1",
    numberOfGuests: "1",
    contactName: "",
    email: "",
    phoneNumber: "",
    specialRequests: ""
  });
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Get data from location state
    if (location.state) {
      console.log("Location state:", location.state);
      setVendorData(location.state.vendorData);
      setSelectedRoom(location.state.selectedRoom);
    } else {
      // Try to get data from localStorage
      const storedBooking = localStorage.getItem('currentVendorBooking');
      if (storedBooking) {
        try {
          const parsed = JSON.parse(storedBooking);
          setVendorData(parsed);
          setSelectedRoom(parsed.selectedRoom);
        } catch (error) {
          console.error("Error parsing stored booking:", error);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Pre-fill form with default values
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setBookingData(prev => ({
      ...prev,
      checkInDate: today.toISOString().split('T')[0],
      checkOutDate: tomorrow.toISOString().split('T')[0],
      numberOfNights: "1",
      numberOfGuests: selectedRoom?.maxGuests ? selectedRoom.maxGuests.toString() : "1"
    }));
  }, [selectedRoom]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!selectedRoom) {
      const basePrice = vendorData?.priceFrom ? 
        parseInt(vendorData.priceFrom.toString().replace(/[^\d]/g, "")) : 85000;
      const nights = parseInt(bookingData.numberOfNights) || 1;
      return basePrice * nights + 7500; // Add service fee
    }
    
    const roomPrice = selectedRoom.occupancy[0].price;
    const nights = parseInt(bookingData.numberOfNights) || 1;
    const rooms = parseInt(bookingData.numberOfRooms) || 1;
    return (roomPrice * nights * rooms) + 7500; // Add service fee
  };

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vendorData) {
      alert("No vendor data available");
      return;
    }

    setIsSubmitting(true);

    // Create booking object
    const bookingObject = {
      vendorData,
      selectedRoom,
      bookingData,
      selectedPayment,
      totalAmount: calculateTotal(),
      bookingDate: new Date().toISOString(),
      bookingReference: `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log("Submitting booking:", bookingObject);

    // Store booking data
    localStorage.setItem('lastBooking', JSON.stringify(bookingObject));
    sessionStorage.setItem('lastBooking', JSON.stringify(bookingObject));

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Navigate to confirmation page with all data
      navigate(`/booking-confirmation/${bookingObject.bookingReference}`, {
        state: {
          vendorData,
          bookingData,
          selectedRoom,
          selectedPayment,
          bookingReference: bookingObject.bookingReference,
          totalAmount: calculateTotal()
        }
      });
    }, 1500);
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen font-manrope">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06EAFC] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isHotel = vendorData.category?.toLowerCase().includes('hotel');

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Vendor Info & Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={vendorData.image || vendorData.images?.[0]}
                    alt={vendorData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{vendorData.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">{vendorData.area || vendorData.address || "Mokola, Rd. 2314"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{vendorData.rating || "4.78"}</span>
                    </div>
                    <span className="text-gray-500">({vendorData.reviews || "23"})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Room Info (for hotels) */}
            {selectedRoom && isHotel && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Room</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden">
                    <img
                      src={selectedRoom.image}
                      alt={selectedRoom.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedRoom.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedRoom.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{selectedRoom.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBed} className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{selectedRoom.beds}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(selectedRoom.occupancy[0].price)}
                      </span>
                      <span className="text-gray-500 line-through text-sm">
                        {formatPrice(selectedRoom.occupancy[0].originalPrice)}
                      </span>
                      <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">
                        -{selectedRoom.occupancy[0].discount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>
              
              <div className="space-y-6">
                {isHotel ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          name="checkInDate"
                          value={bookingData.checkInDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          name="checkOutDate"
                          value={bookingData.checkOutDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Nights
                        </label>
                        <select
                          name="numberOfNights"
                          value={bookingData.numberOfNights}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(num => (
                            <option key={num} value={num}>{num} night{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Rooms
                        </label>
                        <select
                          name="numberOfRooms"
                          value={bookingData.numberOfRooms}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        >
                          {[1,2,3,4,5].map(num => (
                            <option key={num} value={num}>{num} room{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests
                        </label>
                        <select
                          name="numberOfGuests"
                          value={bookingData.numberOfGuests}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                        >
                          {[1,2,3,4,5,6].map(num => (
                            <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={bookingData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time
                      </label>
                      <select
                        name="time"
                        value={bookingData.time}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      >
                        <option value="">Select time</option>
                        <option value="08:00">8:00 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="19:00">7:00 PM</option>
                        <option value="20:00">8:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests
                      </label>
                      <select
                        name="numberOfGuests"
                        value={bookingData.numberOfGuests}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={bookingData.contactName}
                      onChange={handleInputChange}
                      required
                      placeholder="Your full name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={bookingData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="+234 800 123 4567"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any special requirements or requests..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
                  />
                </div>
              </div>
            </form>
            
            {/* Payment Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <PaymentOptions 
                onPaymentSelect={setSelectedPayment}
                selectedPayment={selectedPayment}
              />
            </div>
          </div>
          
          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
              
              <div className="space-y-4">
                {/* Vendor Info */}
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={vendorData.image || vendorData.images?.[0]}
                      alt={vendorData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-2">{vendorData.name}</h3>
                    <p className="text-gray-600 text-sm">{vendorData.area || vendorData.address}</p>
                  </div>
                </div>
                
                {/* Selected Room Info */}
                {selectedRoom && (
                  <div className="pb-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Room Selected</h4>
                    <p className="text-gray-600 text-sm mb-1">{selectedRoom.name}</p>
                    <p className="text-gray-500 text-xs">{selectedRoom.description}</p>
                  </div>
                )}
                
                {/* Booking Details */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Booking Details</h4>
                  
                  {isHotel ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Check-in</span>
                        <span className="font-medium text-sm">{bookingData.checkInDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Check-out</span>
                        <span className="font-medium text-sm">{bookingData.checkOutDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Nights</span>
                        <span className="font-medium text-sm">{bookingData.numberOfNights}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Rooms</span>
                        <span className="font-medium text-sm">{bookingData.numberOfRooms}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Date</span>
                        <span className="font-medium text-sm">{bookingData.date || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Time</span>
                        <span className="font-medium text-sm">{bookingData.time || "Not selected"}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Guests</span>
                    <span className="font-medium text-sm">{bookingData.numberOfGuests}</span>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">Price Breakdown</h4>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">
                      {selectedRoom ? selectedRoom.name : "Standard rate"} × {bookingData.numberOfNights} night{bookingData.numberOfNights > 1 ? 's' : ''}
                      {selectedRoom && bookingData.numberOfRooms > 1 && ` × ${bookingData.numberOfRooms} rooms`}
                    </span>
                    <span className="font-medium text-sm">
                      {formatPrice(
                        (selectedRoom ? selectedRoom.occupancy[0].price : 
                         (vendorData.priceFrom ? parseInt(vendorData.priceFrom.toString().replace(/[^\d]/g, "")) : 85000)) * 
                        (parseInt(bookingData.numberOfNights) || 1) *
                        (selectedRoom ? parseInt(bookingData.numberOfRooms) || 1 : 1)
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Service fee</span>
                    <span className="font-medium text-sm">₦7,500</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Taxes & charges</span>
                    <span className="font-medium text-sm">Included</span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#06EAFC]">{formatPrice(calculateTotal())}</span>
                </div>
                
                {/* Terms */}
                <div className="pt-4">
                  <div className="flex items-start gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-4 h-4 text-[#06EAFC] rounded focus:ring-[#06EAFC] mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the terms and conditions, privacy policy, and cancellation policy
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      `Confirm Booking - ${formatPrice(calculateTotal())}`
                    )}
                  </button>
                  
                  <p className="text-center text-gray-500 text-xs mt-4">
                    You won't be charged until your booking is confirmed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingPage;