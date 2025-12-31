// BookingConfirmation.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BookingConfirmation = () => {
  const { category } = useParams();

  const getCategoryName = () => {
    switch(category) {
      case 'event': return 'Golden Tulip Event Centre';
      case 'restaurant': return 'JAGZ Restaurant';
      case 'hotel': return 'JAZZ Hotel';
      default: return 'Vendor';
    }
  };

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
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
              <span className="font-medium text-[#06EAFC]">AJN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
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
              Browse More {category === 'event' ? 'Events' : category === 'restaurant' ? 'Restaurants' : 'Hotels'}
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
};

export default BookingConfirmation;