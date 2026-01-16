// src/pages/Booking/BookingCompletion.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Stepper from "../../components/Stepper";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { CheckCircle, Mail, Phone, Home, FileText, Share2 } from "lucide-react";

const BookingCompletion = () => {
  const navigate = useNavigate();
  const [bookingReference, setBookingReference] = useState("");
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Generate booking reference
    const generateReference = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'AJN-';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    const reference = generateReference();
    setBookingReference(reference);
    
    // Load booking data
    const savedBookingData = localStorage.getItem('bookingData');
    if (savedBookingData) {
      setBookingData(JSON.parse(savedBookingData));
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Your Ajani Booking Confirmation',
          text: `Booking Reference: ${bookingReference}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`Booking Reference: ${bookingReference}`);
      alert('Booking reference copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <Stepper currentStep={3} />
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thank you for booking with Ajani!
              </h1>
              <p className="text-gray-600">
                Your booking request has been successfully received.
              </p>
            </div>

            {/* Booking Status Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Booking Processing
                  </h3>
                  <p className="text-blue-800 mb-3">
                    <span className="font-semibold">Ajani</span> is now checking availability with{' '}
                    <span className="font-semibold">JAGZ Restaurant</span> for your selected date and details.
                  </p>
                  <p className="text-blue-800">
                    Once availability is confirmed, we'll notify you via phone call, SMS, or WhatsApp with the next steps.
                  </p>
                </div>
              </div>
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
                  <span className="font-medium">Hotels</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Vendor</span>
                  <span className="font-medium">JAGZ Hotel</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Lead Guest</span>
                  <span className="font-medium">
                    {bookingData ? `${bookingData.firstName} ${bookingData.lastName}` : 'John Adesoye'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Contact Email</span>
                  <span className="font-medium">
                    {bookingData?.email || 'examplepgd@gmail.com'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Estimated Response Time</span>
                  <span className="font-medium text-emerald-600">Within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share Booking Details
              </button>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5" />
                Download Receipt
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </Link>
              
              <Link
                to="/category/hotels"
                className="flex items-center justify-center gap-2 px-6 py-4 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
              >
                Browse More Hotels
              </Link>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">Need immediate assistance?</p>
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
                  +234 800 123 4567
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

export default BookingCompletion;