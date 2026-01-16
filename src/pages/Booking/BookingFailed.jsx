// src/pages/Booking/BookingFailed.jsx
import React from "react";
import { Link } from "react-router-dom";
import { XCircle, Home, RefreshCw } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const BookingFailed = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Failed
            </h1>
            <p className="text-gray-600 mb-6">
              We encountered an issue while processing your booking. Please try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              
              <Link
                to="/"
                className="block w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                Return to Home
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Contact support at{" "}
                <a href="mailto:support@ajani.com" className="text-emerald-600 hover:underline">
                  support@ajani.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookingFailed;