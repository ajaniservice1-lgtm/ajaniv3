// BookingFailed.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const BookingFailed = () => {
  const { category } = useParams();

  return (
    <div className="min-h-screen font-manrope">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Complete</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-start mb-3">
              <span className="text-red-600 font-bold text-xl mr-2">X</span>
              <h2 className="text-xl font-semibold text-red-800">Thank you for booking with Ajani</h2>
            </div>
            
            <p className="text-red-700">
              Unfortunately, we couldn't complete your booking request at this time. This may be due to temporary unavailability or a system issue while confirming details with the vendor.
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-left bg-gray-50 p-6 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-3">Possible reasons:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  The venue may be fully booked for your selected date/time
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Temporary technical issues with the booking system
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  The vendor may be updating their availability
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  Network connectivity issues
                </li>
              </ul>
            </div>

            <div className="text-left bg-blue-50 p-6 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-3">What you can do:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Try booking again in a few minutes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Contact our support team for assistance
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Try different dates or times
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Browse similar venues in the same area
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Link
              to={`/booking/${category}`}
              className="inline-block w-full md:w-auto px-8 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors font-medium"
            >
              Try Booking Again
            </Link>
            
            <Link
              to="/"
              className="inline-block w-full md:w-auto px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Return to Home
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Still having trouble?{' '}
              <a href="tel:+2348123456789" className="text-[#06EAFC] hover:underline">
                Contact our support team
              </a>{' '}
              or email{' '}
              <a href="mailto:support@ajani.ai" className="text-[#06EAFC] hover:underline">
                support@ajani.ai
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingFailed;