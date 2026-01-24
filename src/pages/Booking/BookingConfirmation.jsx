// BookingConfirmation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  CheckCircle, 
  Mail, 
  Phone, 
  Home, 
  FileText, 
  Share2,
  Calendar,
  Users,
  Clock
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  
  const [bookingData, setBookingData] = useState(null);
  const [bookingReference, setBookingReference] = useState("");

  useEffect(() => {
    // Generate booking reference
    const generateReference = () => {
      const prefix = type === 'restaurant' ? 'REST-' : 
                     type === 'shortlet' ? 'SHORT-' : 
                     type === 'hotel' ? 'HOTEL-' : 'AJN-';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = prefix;
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    setBookingReference(generateReference());
    
    // Load booking data based on type
    const loadBookingData = () => {
      let data = null;
      
      switch(type) {
        case 'restaurant':
          data = localStorage.getItem('restaurantBooking');
          break;
        case 'shortlet':
          data = localStorage.getItem('shortletBooking');
          break;
        case 'hotel':
          data = localStorage.getItem('completeBooking') || 
                 localStorage.getItem('roomBookingData');
          break;
        default:
          // Try all possible storage keys
          data = localStorage.getItem('completeBooking') || 
                 localStorage.getItem('restaurantBooking') || 
                 localStorage.getItem('shortletBooking');
      }
      
      if (data) {
        setBookingData(JSON.parse(data));
      }
    };
    
    loadBookingData();
  }, [type]);

  const getTitle = () => {
    switch(type) {
      case 'restaurant':
        return "Thank you for booking with Ajani 🎉 Table Reservation Request Sent!";
      case 'shortlet':
        return "Thank you for booking with Ajani 🎉 Shortlet Booking Request Sent!";
      case 'hotel':
        return "Thank you for booking with Ajani 🎉 Hotel Booking Confirmed!";
      default:
        return "Thank you for booking with Ajani 🎉 Booking Request Received!";
    }
  };

  const getMessage = () => {
    switch(type) {
      case 'restaurant':
        return "Your table reservation request has been sent to the restaurant. Your booking request has been successfully received. Ajani is now checking availability with JAGZ Resturant  for your selected date and details. Once availability is confirmed, we’ll notify you via phone call, SMS, or WhatsApp with the next steps";
      case 'shortlet':
        return "Your shortlet booking request has been sent to the property owner. They'll contact you shortly to confirm availability.";
      case 'hotel':
        return "Your hotel booking has been confirmed! Check your email for the booking confirmation.Ajani is now checking availability with JAGZ Resturant  for your selected date and details.Once availability is confirmed, we’ll notify you via phone call, SMS, or WhatsApp with the next steps.";
      default:
        return "Your booking request has been successfully received.";
    }
  };

  const getVendorName = () => {
    return bookingData?.vendorData?.name || 
           bookingData?.hotel?.name || 
           "Vendor";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Success Icon & Title */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getTitle()}
              </h1>
              <p className="text-gray-600">
                {getMessage()}
              </p>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Booking Reference</span>
                  <span className="font-mono font-bold text-emerald-600">{bookingReference}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Service Type</span>
                  <span className="font-medium capitalize">{type || "Booking"}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Vendor</span>
                  <span className="font-medium">{getVendorName()}</span>
                </div>
                
                {/* Display booking-specific details */}
                {bookingData?.bookingData && (
                  <>
                    {bookingData.bookingData.date && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">{bookingData.bookingData.date}</span>
                      </div>
                    )}
                    
                    {bookingData.bookingData.time && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium">{bookingData.bookingData.time}</span>
                      </div>
                    )}
                    
                    {bookingData.bookingData.checkInDate && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-medium">{bookingData.bookingData.checkInDate}</span>
                      </div>
                    )}
                    
                    {bookingData.bookingData.checkOutDate && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-medium">{bookingData.bookingData.checkOutDate}</span>
                      </div>
                    )}
                    
                    {bookingData.bookingData.numberOfGuests && (
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Guests</span>
                        <span className="font-medium">{bookingData.bookingData.numberOfGuests}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-emerald-600">
                    {type === 'hotel' ? 'Confirmed' : 'Pending Confirmation'}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bookingReference);
                  alert('Booking reference copied to clipboard!');
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Copy Reference
              </button>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5" />
                View Details
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </button>
              
              <button
                onClick={() => navigate(`/category/${type || 'hotel'}`)}
                className="flex items-center justify-center gap-2 px-6 py-4 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
              >
                Browse More {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Hotels'}
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">Need assistance with your booking?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:support@ajani.com"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Mail className="w-4 h-4" />
                  support@ajani.com
                </a>
                <a
                  href="tel:+2348001234567"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                  +234 8
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingConfirmation;