// src/pages/Booking/HotelBooking.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCalendar, faUsers, faBed, 
  faWifi, faCar, faUtensils,
  faCheck, faStar, faPhone,
  faEnvelope, faMapMarkerAlt
} from "@fortawesome/free-solid-svg-icons";

const HotelBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bookingData, setBookingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "Nigeria",
    phone: "+234 (0) ",
    specialRequests: ""
  });

  const [selectedPayment, setSelectedPayment] = useState("hotel");
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hotelData, setHotelData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const loadBookingData = () => {
      setLoading(true);
      
      // Load vendor data
      const vendorDataFromState = location.state?.vendorData;
      const fromLocalStorage = localStorage.getItem('currentVendorBooking');
      const fromSession = sessionStorage.getItem('currentVendorBooking');
      
      let vendorData = null;
      if (vendorDataFromState) {
        vendorData = vendorDataFromState;
      } else if (fromLocalStorage) {
        vendorData = JSON.parse(fromLocalStorage);
      } else if (fromSession) {
        vendorData = JSON.parse(fromSession);
      }
      
      if (vendorData) {
        setHotelData(vendorData);
      }
      
      // Load room data
      const savedRoomData = localStorage.getItem('roomBookingData');
      if (savedRoomData) {
        const parsedData = JSON.parse(savedRoomData);
        setRoomData(parsedData);
      } else if (vendorData?.selectedRoom) {
        // Create room data from selected room
        const roomInfo = vendorData.selectedRoom;
        setRoomData({
          hotel: {
            id: vendorData.id,
            name: vendorData.name,
            location: vendorData.area,
            rating: vendorData.rating || 4.5,
            image: vendorData.image,
            category: vendorData.category
          },
          room: {
            title: roomInfo.title || "Standard Room",
            name: roomInfo.name || "Standard Room",
            image: roomInfo.image || vendorData.image,
            size: roomInfo.size || "Not specified",
            beds: roomInfo.beds || "1 Double Bed",
            maxOccupancy: roomInfo.maxOccupancy || 2,
            features: roomInfo.features || [],
            amenities: roomInfo.amenities || [],
            rating: roomInfo.rating || 4.5,
            reviewCount: roomInfo.reviewCount || 0
          },
          booking: {
            checkIn: "Sat, Jan 24",
            checkOut: "Sun, Jan 25",
            adults: roomInfo.occupancy?.[0]?.adults || 2,
            nights: 1,
            price: roomInfo.occupancy?.[0]?.price || vendorData.priceFrom || 0,
            originalPrice: roomInfo.occupancy?.[0]?.originalPrice || vendorData.priceTo || 0,
            discount: roomInfo.occupancy?.[0]?.discount || "",
            breakfast: roomInfo.occupancy?.[0]?.breakfast || "",
            breakfastPrice: roomInfo.occupancy?.[0]?.breakfastPrice || "",
            benefits: roomInfo.occupancy?.[0]?.benefits || ["Pay at hotel", "Free WiFi"],
            checkInTime: "15:00",
            totalPrice: roomInfo.occupancy?.[0]?.price || vendorData.priceFrom || 0,
            perNight: roomInfo.occupancy?.[0]?.price || vendorData.priceFrom || 0
          }
        });
      }
      
      // Check for any guest info saved
      const savedGuestInfo = localStorage.getItem('bookingData');
      if (savedGuestInfo) {
        try {
          const guestData = JSON.parse(savedGuestInfo);
          setBookingData(prev => ({
            ...prev,
            ...guestData
          }));
        } catch (error) {
          console.error("Failed to parse guest info:", error);
        }
      }
      
      setLoading(false);
    };

    loadBookingData();
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!roomData) {
      alert("Please select a room first");
      navigate(-1);
      return;
    }

    // Save guest information
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Combine booking data
    const completeBooking = {
      ...bookingData,
      paymentMethod: selectedPayment,
      roomData: roomData,
      hotelData: hotelData,
      bookingType: 'hotel',
      bookingDate: new Date().toISOString(),
      bookingId: 'HOTEL-' + Date.now().toString().slice(-8)
    };

    // Save complete booking data
    localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
    localStorage.setItem('hotelBooking', JSON.stringify(completeBooking));
    
    // Navigate to payment page for hotels
    navigate('/booking/payment', { 
      state: { 
        bookingData: completeBooking 
      } 
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
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

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Room Selected</h2>
            <p className="text-gray-600 mb-6">Please select a room before proceeding to booking.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition cursor-pointer"
            >
              Go Back & Select Room
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate totals
  const roomPrice = roomData?.booking?.price || 0;
  const taxes = roomData?.booking?.taxes || Math.round(roomPrice * 0.1);
  const serviceFee = roomData?.booking?.serviceFee || Math.round(roomPrice * 0.05);
  const total = roomPrice + taxes + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-8">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Stepper currentStep={currentStep} type="hotel" />
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2 cursor-pointer"
            >
              ← Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                  Complete Your Booking
                </h1>

                {/* Hotel & Room Summary at Top */}
                <div className="mb-8 bg-gray-50 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Hotel Main Image */}
                    <div className="md:w-1/3">
                      <img 
                        src={roomData.hotel.image || hotelData?.image} 
                        alt={roomData.hotel.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex items-center gap-1 mt-2">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                        <span className="font-medium">{roomData.hotel.rating}</span>
                        <span className="text-gray-500 text-sm">({roomData.hotel.location})</span>
                      </div>
                    </div>
                    
                    {/* Room Info */}
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {roomData.hotel.name}
                      </h3>
                      <h4 className="text-md font-semibold text-emerald-600 mb-3">
                        {roomData.room.title}
                      </h4>
                      
                      {/* Room Image Gallery */}
                      {roomData.room.images && roomData.room.images.length > 0 ? (
                        <div className="mb-4">
                          <div className="flex space-x-2 overflow-x-auto pb-2">
                            {roomData.room.images.slice(0, 4).map((img, index) => (
                              <div key={index} className="flex-shrink-0">
                                <img 
                                  src={img} 
                                  alt={`Room view ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <img 
                            src={roomData.room.image} 
                            alt={roomData.room.title}
                            className="w-40 h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      
                      {/* Room Features */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faBed} className="text-gray-500" />
                          <span>{roomData.room.beds}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUsers} className="text-gray-500" />
                          <span>{roomData.room.maxOccupancy} Guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center">📏</span>
                          <span>{roomData.room.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faWifi} className="text-gray-500" />
                          <span>Free WiFi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dates & Guests Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Check-in</p>
                        <p className="font-medium">
                          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-emerald-500" />
                          {roomData.booking.checkIn}
                        </p>
                        <p className="text-sm text-gray-600">{roomData.booking.checkInTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Check-out</p>
                        <p className="font-medium">
                          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-emerald-500" />
                          {roomData.booking.checkOut}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Nights</p>
                        <p className="font-medium text-lg">{roomData.booking.nights} night</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Guests</p>
                        <p className="font-medium">
                          <FontAwesomeIcon icon={faUsers} className="mr-2 text-emerald-500" />
                          {roomData.booking.adults} adults
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Option Section */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Choose your payment option
                  </h2>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border-2 border-emerald-500 rounded-lg bg-emerald-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="hotel"
                        checked={selectedPayment === "hotel"}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1 cursor-pointer"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Pay in the hotel</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Pay when you arrive at the hotel
                        </p>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={selectedPayment === "card"}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        className="w-5 h-5 text-emerald-600 mt-1 cursor-pointer"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Credit/debit card</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Secure online payment
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="mb-8">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Who's the lead guest?
                    </h2>
                    <h2 className="text-gray-600 text-[14px]">contact information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First name *
                        </label>
                        <input 
                          type="text" 
                          name="firstName"
                          value={bookingData.firstName}
                          onChange={handleInputChange}
                          placeholder="John"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last name *
                        </label>
                        <input 
                          type="text" 
                          name="lastName"
                          value={bookingData.lastName}
                          onChange={handleInputChange}
                          placeholder="Adesoye"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        value={bookingData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country/region of residence *
                      </label>
                      <input 
                        type="text" 
                        name="country"
                        value={bookingData.country}
                        onChange={handleInputChange}
                        placeholder="Nigeria"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile number *
                      </label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        placeholder="+234 (0) 800 000 0000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                        required
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Please make sure your contact information is correct. We'll use it to send your booking confirmation and any reminders to assist you with booking completion.
                  </p>
                </div>

                {/* Special Requests */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Special requests
                  </h2>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe what you need..."
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
                      By proceeding with this booking, I agree to Ajani Terms of Use and Privacy Policy.
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-lg transition cursor-pointer"
                  >
                    Next: Payment
                  </button>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-xl p-6 space-y-6 sticky top-24">
                  <h3 className="font-semibold text-gray-800">Booking Summary</h3>
                  
                  {/* Hotel Information */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={roomData.hotel.image} 
                        alt={roomData.hotel.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{roomData.hotel.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3 text-gray-500" />
                          <p className="text-xs text-gray-500">{roomData.hotel.location}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-medium">{roomData.hotel.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stay Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Dates</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{roomData.booking.checkIn}</p>
                            <p className="text-xs text-gray-500">to {roomData.booking.checkOut}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Guests</span>
                          </div>
                          <span className="text-sm font-medium">{roomData.booking.adults} adults</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">Nights</span>
                          <span className="text-sm font-medium">{roomData.booking.nights} night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Room Selected */}
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-800">Room Selected</h5>
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatPrice(roomData.booking.price)}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="font-semibold text-gray-900 text-sm mb-1">{roomData.room.title}</h6>
                      <img 
                        src={roomData.room.image} 
                        alt={roomData.room.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Size</span>
                        <span className="font-medium">{roomData.room.size}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Beds</span>
                        <span className="font-medium">{roomData.room.beds}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Max Guests</span>
                        <span className="font-medium">{roomData.room.maxOccupancy}</span>
                      </div>
                      {roomData.room.rating && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Room Rating</span>
                          <div className="flex items-center gap-1">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
                            <span className="font-medium">{roomData.room.rating}</span>
                            <span className="text-gray-500 text-xs">({roomData.room.reviewCount})</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Room Features */}
                    {roomData.room.features && roomData.room.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Room Features</p>
                        <div className="flex flex-wrap gap-2">
                          {roomData.room.features.slice(0, 4).map((feature, index) => (
                            feature?.included && (
                              <div key={index} className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">{feature.name}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Breakfast & Benefits */}
                  {(roomData.booking.breakfast || roomData.booking.benefits.length > 0) && (
                    <div className="bg-white rounded-lg p-4 border">
                      {roomData.booking.breakfast && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faUtensils} className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Breakfast</span>
                          </div>
                          <p className="text-sm text-gray-600">{roomData.booking.breakfast}</p>
                          {roomData.booking.breakfastPrice && (
                            <p className="text-sm font-medium text-emerald-600 mt-1">
                              {roomData.booking.breakfastPrice}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {roomData.booking.benefits.length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Benefits Included</p>
                          <div className="space-y-2">
                            {roomData.booking.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-xs" />
                                <span className="text-gray-600">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Price Breakdown */}
                  <div className="bg-white rounded-lg p-4 border">
                    <h5 className="font-medium text-gray-800 mb-3">Price Breakdown</h5>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Room x {roomData.booking.nights} night</span>
                          <span className="font-medium">{formatPrice(roomData.booking.price)}</span>
                        </div>
                        
                        {roomData.booking.breakfastPrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Breakfast</span>
                            <span className="font-medium">{roomData.booking.breakfastPrice}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Taxes & fees</span>
                          <span className="font-medium">{formatPrice(taxes)}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatPrice(serviceFee)}</span>
                        </div>
                      </div>
                      
                      {/* Discount Section */}
                      {roomData.booking.discount && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400 line-through">
                              Original price
                            </span>
                            <span className="text-gray-400 line-through">
                              {formatPrice(roomData.booking.originalPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-red-500 mt-1">
                            <span>Discount</span>
                            <span>{roomData.booking.discount}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Total */}
                      <div className="pt-3 border-t border-gray-300">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Total Amount</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {formatPrice(total)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {selectedPayment === "hotel" ? "Pay at hotel" : "To be charged now"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Policies */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Free cancellation</span> up to 24 hours before check-in
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      You'll receive confirmation within minutes
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