// RestaurantBooking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendar, 
  faUsers, 
  faClock,
  faUtensils,
  faLocationDot,
  faStar,
  faUser,
  faEnvelope,
  faPhone
} from "@fortawesome/free-solid-svg-icons";

const RestaurantBooking = ({ vendorData }) => {
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "19:00", // 7:00 PM in 24-hour format
    numberOfGuests: 2,
    specialRequests: "",
    contactInfo: {
      firstName: "",
      lastName: "",
      phone: "",
      email: ""
    }
  });

  useEffect(() => {
    // Pre-fill today's date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setBookingData(prev => ({ ...prev, date: formattedDate }));
  }, []);

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
        time: timeString
      },
      bookingType: 'restaurant',
      bookingDate: new Date().toISOString(),
      bookingId: 'REST-' + Date.now().toString().slice(-8)
    };

    // Save to localStorage
    localStorage.setItem('restaurantBooking', JSON.stringify(completeBooking));
    
    // Navigate directly to confirmation
    navigate('/booking-confirmation/restaurant', { 
      state: { 
        bookingData: completeBooking 
      } 
    });
  };

  const formatTimeForDisplay = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes}${ampm}`;
  };

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAvailableTimes = () => {
    return [
      "17:00", "17:30", "18:00", "18:30",
      "19:00", "19:30", "20:00", "20:30",
      "21:00", "21:30", "22:00"
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                  1
                </div>
                <span className="mt-1 text-green-600 font-medium">Customer Information</span>
              </div>
              
              <div className="h-0.5 w-12 bg-gray-300"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="mt-1 text-gray-400">Payment Information</span>
              </div>
              
              <div className="h-0.5 w-12 bg-gray-300"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="mt-1 text-gray-400">Booking is Confirmed</span>
              </div>
            </div>
          </div>

          {/* Restaurant Card */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="flex gap-6">
              <img
                src={vendorData?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"}
                alt={vendorData?.name}
                className="w-28 h-28 rounded-lg object-cover"
              />

              <div className="py-2">
                <h2 className="font-bold text-xl text-gray-900">{vendorData?.name || "JAGZ Restaurant"}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <FontAwesomeIcon icon={faLocationDot} className="text-gray-400 w-4 h-4" />
                  <p className="text-gray-600">{vendorData?.area || "Mekola, IL 2814"}</p>
                </div>
                <p className="text-gray-500 mt-2 text-sm max-w-lg">
                  {vendorData?.description || "Serving delicious meals with a cozy ambiance and warm hospitality."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold">
              <FontAwesomeIcon icon={faStar} className="w-4 h-4" />
              <span>{vendorData?.rating || "4.8"}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-6">Booking Request</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Primary Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                      required
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                      required
                    >
                      {getAvailableTimes().map(time => (
                        <option key={time} value={time}>
                          {formatTimeForDisplay(time)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Number of Guests
                  </label>
                  <div className="flex items-center gap-6">
                    <button
                      type="button"
                      onClick={() => handleGuestChange('decrease')}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-600 text-xl flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium bg-gray-100 px-6 py-2 rounded-full min-w-[120px] text-center">
                      {bookingData.numberOfGuests} {bookingData.numberOfGuests === 1 ? 'person' : 'people'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGuestChange('increase')}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-600 text-xl flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900">Contact Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 h-4" />
                        <label className="text-sm font-medium text-gray-700">
                          First Name *
                        </label>
                      </div>
                      <input
                        type="text"
                        name="contactInfo.firstName"
                        value={bookingData.contactInfo.firstName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4 h-4" />
                        <label className="text-sm font-medium text-gray-700">
                          Last Name *
                        </label>
                      </div>
                      <input
                        type="text"
                        name="contactInfo.lastName"
                        value={bookingData.contactInfo.lastName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-4 h-4" />
                        <label className="text-sm font-medium text-gray-700">
                          Email *
                        </label>
                      </div>
                      <input
                        type="email"
                        name="contactInfo.email"
                        value={bookingData.contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                        placeholder="john@gmail.com"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faPhone} className="text-gray-400 w-4 h-4" />
                        <label className="text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                      </div>
                      <input
                        type="tel"
                        name="contactInfo.phone"
                        value={bookingData.contactInfo.phone}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                        placeholder="+1 (234) 567-8900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any specific requests or requirements (dietary restrictions, seating preferences, etc.)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition resize-none"
                  />
                </div>

                {/* Summary Card */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Restaurant</span>
                      <span className="font-medium">{vendorData?.name || "JAGZ Restaurant"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">{formatDateForDisplay(bookingData.date)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium">{formatTimeForDisplay(bookingData.time)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Guests</span>
                      <span className="font-medium">{bookingData.numberOfGuests} {bookingData.numberOfGuests === 1 ? 'person' : 'people'}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="font-bold text-green-600 text-lg">
                          ₦{vendorData?.priceFrom ? parseInt(vendorData.priceFrom).toLocaleString() : "5,000"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Reservation only - pay at restaurant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Free cancellation up to 2 hours before</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl transition duration-300 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                >
                  Reserve Table
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestaurantBooking;