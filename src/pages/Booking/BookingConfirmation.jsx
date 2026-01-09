// src/pages/BookingConfirmation.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faStar, faPrint, faHome, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const BookingConfirmation = () => {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingReference, setBookingReference] = useState("");

  useEffect(() => {
    // Generate unique booking reference
    const generateReference = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'AJN-';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    setBookingReference(generateReference());
    
    // Get data from location state
    if (location.state) {
      setBookingData(location.state.bookingData);
      setVendorData(location.state.vendorData);
      setSelectedRoom(location.state.selectedRoom);
    }
  }, [location.state]);

  const getCategoryName = () => {
    switch(category) {
      case 'event': return 'Golden Tulip Event Centre';
      case 'restaurant': return 'JAGZ Restaurant';
      case 'hotel': return 'JAZZ Hotel';
      default: return 'Vendor';
    }
  };

  const getServiceTypeName = () => {
    switch(category) {
      case 'event': return 'Events';
      case 'restaurant': return 'Restaurants';
      case 'hotel': return 'Hotels';
      default: return 'Services';
    }
  };

  if (!bookingData || !vendorData) {
    return (
      <div className="min-h-screen font-manrope">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faCheckCircle} className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank you for booking with Ajani!</h1>
            
            <p className="text-gray-600 mb-6">
              Your booking request has been successfully received.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
              <p className="text-blue-800 mb-3">
                <span className="font-semibold">Ajani</span> is now checking availability with{' '}
                <span className="font-semibold">{getCategoryName()}</span> for your selected date and details.
              </p>
              
              <p className="text-blue-800">
                Once availability is confirmed, we'll notify you via phone call, SMS, or WhatsApp with the next steps.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Service Type</span>
                <span className="font-medium capitalize">{category}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Vendor</span>
                <span className="font-medium">{getCategoryName()}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-medium text-[#06EAFC]">{bookingReference}</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Estimated Response Time</span>
                <span className="font-medium">Within 24 hours</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link
                to="/"
                className="inline-block w-full md:w-auto px-8 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors font-medium"
              >
                Return to Home
              </Link>
              
              <Link
                to={`/category/${category}`}
                className="inline-block w-full md:w-auto px-8 py-3 border border-[#06EAFC] text-[#06EAFC] rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Browse More {getServiceTypeName()}
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Need immediate assistance?{' '}
                <a href="tel:+2348123456789" className="text-[#06EAFC] hover:underline">
                  Call +234 812 345 6789
                </a>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Detailed confirmation view with all booking data
  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-8"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-4 sm:px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Booking Confirmed</h2>
          </div>
          <div className="p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Booking Confirmed</h2>
              <p className="text-gray-600 text-sm">Your booking has been successfully confirmed</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#06EAFC]/10 to-[#06F49F]/10 rounded-xl p-4 sm:p-6 mb-8 border border-[#06EAFC]/20">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{vendorData.name}</h3>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 text-sm">{vendorData.area || vendorData.address || "Mokola, Rd. 2314"}</span>
              </div>
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {vendorData.description || "Sunrise Premium Hotel offers a blend of comfort, modern amenities, and warm hospitality in the heart of Ibadan."}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700 font-medium">{vendorData.rating || "4.78"}</span>
                </div>
                <span className="text-gray-500">({vendorData.reviews || "23"})</span>
              </div>
            </div>
            
            {/* Room Selection Details for Hotels */}
            {selectedRoom && (
              <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Room Selected</h4>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    <img
                      src={selectedRoom.image}
                      alt={selectedRoom.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">{selectedRoom.name}</h5>
                    <p className="text-gray-600 text-sm">{selectedRoom.capacity} adults</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-red-600 font-bold">₦{selectedRoom.price.toLocaleString()}</span>
                      <span className="text-gray-500 line-through">₦{selectedRoom.originalPrice.toLocaleString()}</span>
                      <span className="text-green-600">-{selectedRoom.discount}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Check-in: {selectedRoom.selectedDateRange?.checkIn}</p>
                    <p className="text-gray-600 text-sm">Check-out: {selectedRoom.selectedDateRange?.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Rooms: {selectedRoom.roomCount}</p>
                    <p className="text-gray-600 text-sm">Guests: {selectedRoom.capacity * selectedRoom.roomCount}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Booking Reference</span>
                    <span className="font-medium text-sm sm:text-base">{bookingReference}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Booking Date</span>
                    <span className="font-medium text-sm sm:text-base">{new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  
                  {/* Category-specific details */}
                  {category === 'hotel' ? (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium text-sm sm:text-base">{bookingData.checkInDate || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium text-sm sm:text-base">{bookingData.checkOutDate || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Rooms</span>
                        <span className="font-medium text-sm sm:text-base">{bookingData.numberOfRooms || "1"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Nights</span>
                        <span className="font-medium text-sm sm:text-base">{bookingData.numberOfNights || "1"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium text-sm sm:text-base">{bookingData.date || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium text-sm sm:text-base">{bookingData.time || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Guests</span>
                        <span className="font-medium text-sm sm:text-base">
                          {bookingData.numberOfGuests || bookingData.expectedGuests || "1"}
                        </span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Contact Person</span>
                    <span className="font-medium text-sm sm:text-base">
                      {bookingData.contactName || bookingData.guestName || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-lg sm:text-xl font-bold text-[#06EAFC]">
                      ₦{(vendorData?.priceFrom ? parseInt(vendorData.priceFrom.replace(/[^\d]/g, "")) || 85000 : 85000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h4>
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                        <span className="text-gray-700 font-medium">••••</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Credit Card</p>
                        <p className="text-sm text-gray-600">Ending in 4321</p>
                      </div>
                    </div>
                    <span className="text-gray-600">Paid</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="text-blue-800 text-sm mb-2">
                  <strong>Important:</strong> You'll receive a confirmation email shortly. Please check your spam folder if you don't see it within 10 minutes.
                </p>
                <p className="text-blue-800 text-sm">
                  For any changes or cancellations, please contact our support team at support@ajani.com or call +234 800 123 4567.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
                >
                  <FontAwesomeIcon icon={faPrint} className="mr-2" />
                  Print Confirmation
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 bg-gradient-to-r from-[#06EAFC] to-[#06F49F] text-white rounded-lg hover:opacity-90 transition-opacity flex-1"
                >
                  <FontAwesomeIcon icon={faHome} className="mr-2" />
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;