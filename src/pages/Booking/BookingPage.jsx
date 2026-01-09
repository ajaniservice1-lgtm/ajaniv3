// src/pages/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faStar, faChevronLeft, faPrint, faHome } from "@fortawesome/free-solid-svg-icons";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    guestName: "",
    contactName: "",
    email: "",
    phoneNumber: "",
    country: "",
    numberOfGuests: "1",
    expectedGuests: "1",
    date: "",
    time: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: "1",
    numberOfNights: "1"
  });
  const [vendorData, setVendorData] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize booking data from location state or localStorage
  useEffect(() => {
    const initializeBooking = async () => {
      try {
        // Get vendor data from location state
        if (location.state?.vendorData) {
          setVendorData(location.state.vendorData);
        } else {
          // Fallback mock data
          setVendorData({
            name: "Golden Tulip Event Centre",
            area: "Mokola, Ibadan",
            address: "Mokola, Rd. 2314",
            description: "Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan.",
            rating: "4.78",
            reviews: "23",
            priceFrom: "₦85,000",
            category: "event"
          });
        }

        // Check for selected room data
        const selectedRoomData = localStorage.getItem("selectedRoomData");
        if (selectedRoomData) {
          try {
            const parsedRoom = JSON.parse(selectedRoomData);
            setSelectedRoom(parsedRoom);
            localStorage.removeItem("selectedRoomData");
          } catch (error) {
            console.error("Error parsing selected room data:", error);
          }
        }
      } catch (error) {
        console.error("Error initializing booking:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeBooking();
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (field, delta) => {
    setBookingData(prev => ({
      ...prev,
      [field]: Math.max(1, parseInt(prev[field] || "1") + delta).toString()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!bookingData.guestName || !bookingData.email || !bookingData.phoneNumber) {
      alert("Please fill in all required fields");
      return;
    }

    // Navigate to confirmation
    navigate(`/booking-confirmation/${vendorData?.category || 'event'}`, {
      state: {
        bookingData,
        vendorData,
        selectedRoom
      }
    });
  };

  const renderEventBooking = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            First name *
          </label>
          <input
            type="text"
            name="guestName"
            value={bookingData.guestName}
            onChange={handleInputChange}
            placeholder="John"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Last name *
          </label>
          <input
            type="text"
            name="contactName"
            value={bookingData.contactName}
            onChange={handleInputChange}
            placeholder="Adesoye"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Mobile number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={bookingData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
          Country/region of residence *
        </label>
        <input
          type="text"
          name="country"
          value={bookingData.country || ""}
          onChange={handleInputChange}
          placeholder="Enter your country"
          className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
          required
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Event details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={bookingData.date}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
              Time *
            </label>
            <input
              type="time"
              name="time"
              value={bookingData.time}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Expected number of guests *
          </label>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
            <button
              type="button"
              onClick={() => handleQuantityChange('expectedGuests', -1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={parseInt(bookingData.expectedGuests || "1") <= 1}
            >
              <span className="text-lg font-bold">-</span>
            </button>
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">{bookingData.expectedGuests}</span>
              <span className="block text-xs text-gray-600 mt-1">guests</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuantityChange('expectedGuests', 1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestaurantBooking = () => (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            First name *
          </label>
          <input
            type="text"
            name="guestName"
            value={bookingData.guestName}
            onChange={handleInputChange}
            placeholder="John"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Last name *
          </label>
          <input
            type="text"
            name="contactName"
            value={bookingData.contactName}
            onChange={handleInputChange}
            placeholder="Adesoye"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Mobile number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={bookingData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
          Country/region of residence *
        </label>
        <input
          type="text"
          name="country"
          value={bookingData.country || ""}
          onChange={handleInputChange}
          placeholder="Enter your country"
          className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
          required
        />
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={bookingData.date}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
              Time *
            </label>
            <input
              type="time"
              name="time"
              value={bookingData.time}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Number of guests *
          </label>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
            <button
              type="button"
              onClick={() => handleQuantityChange('numberOfGuests', -1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={parseInt(bookingData.numberOfGuests || "1") <= 1}
            >
              <span className="text-lg font-bold">-</span>
            </button>
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">{bookingData.numberOfGuests}</span>
              <span className="block text-xs text-gray-600 mt-1">guests</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuantityChange('numberOfGuests', 1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHotelBooking = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Room Selection Summary */}
      {selectedRoom && (
        <div className="bg-gradient-to-r from-[#06EAFC]/10 to-[#06F49F]/10 rounded-xl p-4 mb-6 border border-[#06EAFC]/20">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Room Selected</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={selectedRoom.image}
                alt={selectedRoom.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{selectedRoom.name}</h4>
              <p className="text-gray-600 text-sm">{selectedRoom.capacity} adults</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-600 font-bold">₦{selectedRoom.price.toLocaleString()}</span>
                <span className="text-gray-500 line-through">₦{selectedRoom.originalPrice.toLocaleString()}</span>
                <span className="text-green-600">-{selectedRoom.discount}%</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Check-in: {selectedRoom.selectedDateRange?.checkIn}</p>
            <p className="text-sm text-gray-600">Check-out: {selectedRoom.selectedDateRange?.checkOut}</p>
            <p className="text-sm text-gray-600">Rooms: {selectedRoom.roomCount}</p>
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            First name *
          </label>
          <input
            type="text"
            name="guestName"
            value={bookingData.guestName}
            onChange={handleInputChange}
            placeholder="John"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Last name *
          </label>
          <input
            type="text"
            name="contactName"
            value={bookingData.contactName}
            onChange={handleInputChange}
            placeholder="Adesoye"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Mobile number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={bookingData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
          Country/region of residence *
        </label>
        <input
          type="text"
          name="country"
          value={bookingData.country || ""}
          onChange={handleInputChange}
          placeholder="Enter your country"
          className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent placeholder-gray-500"
          required
        />
      </div>
      
      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Check-in Date *
          </label>
          <input
            type="date"
            name="checkInDate"
            value={bookingData.checkInDate}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Check-out Date *
          </label>
          <input
            type="date"
            name="checkOutDate"
            value={bookingData.checkOutDate}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06EAFC] focus:border-transparent"
            required
            min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      
      {/* Room Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Number of Rooms *
          </label>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
            <button
              type="button"
              onClick={() => handleQuantityChange('numberOfRooms', -1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={parseInt(bookingData.numberOfRooms || 1) <= 1}
            >
              <span className="text-lg font-bold">-</span>
            </button>
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">{bookingData.numberOfRooms || "1"}</span>
              <span className="block text-xs text-gray-600 mt-1">rooms</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuantityChange('numberOfRooms', 1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-900 uppercase tracking-wider mb-2">
            Number of Nights *
          </label>
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3 border border-gray-300">
            <button
              type="button"
              onClick={() => handleQuantityChange('numberOfNights', -1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={parseInt(bookingData.numberOfNights || 1) <= 1}
            >
              <span className="text-lg font-bold">-</span>
            </button>
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900">{bookingData.numberOfNights || "1"}</span>
              <span className="block text-xs text-gray-600 mt-1">nights</span>
            </div>
            <button
              type="button"
              onClick={() => handleQuantityChange('numberOfNights', 1)}
              className="w-8 h-8 rounded-lg border border-gray-400 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-[#06EAFC] transition-colors"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06EAFC]"></div>
      </div>
    );
  }

  const renderBookingForm = () => {
    const category = vendorData?.category || 'event';
    switch(category) {
      case 'hotel':
        return renderHotelBooking();
      case 'restaurant':
        return renderRestaurantBooking();
      default:
        return renderEventBooking();
    }
  };

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Book {vendorData?.name || "Vendor"}</h2>
            </div>
            <div className="p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                {renderBookingForm()}
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-base"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;