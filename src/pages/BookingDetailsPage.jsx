// src/pages/BookingDetailsPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Printer,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Utensils,
  Home,
  FileText,
  Share2
} from "lucide-react";

const BookingDetailsPage = () => {
  const { reference } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = () => {
      // Try to get from location state first
      if (location.state?.booking) {
        setBooking(location.state.booking);
        setLoading(false);
        return;
      }

      // Search in all possible storage locations
      const searchLocations = [
        JSON.parse(localStorage.getItem("userBookings") || "[]"),
        JSON.parse(localStorage.getItem("guestBookings") || "[]"),
        JSON.parse(localStorage.getItem("allBookings") || "[]")
      ];

      for (const location of searchLocations) {
        const found = location.find(b => b.reference === reference || b.id === reference);
        if (found) {
          setBooking(found);
          setLoading(false);
          return;
        }
      }

      // Check user profile
      const userProfileStr = localStorage.getItem("userProfile");
      if (userProfileStr) {
        try {
          const profile = JSON.parse(userProfileStr);
          const found = (profile.bookings || []).find(b => b.reference === reference);
          if (found) {
            setBooking(found);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing profile:", error);
        }
      }

      setLoading(false);
    };

    loadBooking();
  }, [reference, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The booking you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/my-bookings")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
          >
            Back to My Bookings
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-2">Reference: {booking.reference}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(booking.reference);
                  alert('Booking reference copied!');
                }}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Copy reference"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Status Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Booking Status</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600">
                Booking created on {new Date(booking.date).toLocaleDateString()}
              </p>
            </div>

            {/* Vendor Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Details</h2>
              
              <div className="flex items-start gap-4">
                {booking.vendor?.image && (
                  <img 
                    src={booking.vendor.image} 
                    alt={booking.vendor.name}
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1552566626-52f8b828add9";
                    }}
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.vendor?.name || "Property"}
                  </h3>
                  
                  {booking.vendor?.location && (
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.vendor.location}</span>
                    </div>
                  )}
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {booking.details?.checkIn && (
                      <div>
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="font-medium">{booking.details.checkIn}</p>
                      </div>
                    )}
                    
                    {booking.details?.checkOut && (
                      <div>
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="font-medium">{booking.details.checkOut}</p>
                      </div>
                    )}
                    
                    {booking.details?.guests && (
                      <div>
                        <p className="text-sm text-gray-500">Guests</p>
                        <p className="font-medium">
                          {booking.details.guests.adults || 1} adults
                          {booking.details.guests.children 
                            ? `, ${booking.details.guests.children} children`
                            : ''
                          }
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-500">Booking Type</p>
                      <p className="font-medium capitalize">{booking.type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ₦{(parseInt(booking.details?.totalAmount) || 0).toLocaleString()}
                  </span>
                </div>
                
                {booking.details?.paymentMethod && (
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium capitalize">
                      {booking.details.paymentMethod.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${
                    booking.status === 'confirmed' 
                      ? 'text-green-600'
                      : booking.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {booking.status === 'confirmed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference</span>
                  <span className="font-mono font-semibold">{booking.reference}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Booked</span>
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span>{booking.id}</span>
                </div>
                
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span className="text-emerald-600">
                      ₦{(parseInt(booking.details?.totalAmount) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.details?.specialRequests && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Special Requests</h3>
                <p className="text-gray-600 text-sm">{booking.details.specialRequests}</p>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Implement cancel booking
                    alert('Cancel booking feature coming soon!');
                  }}
                  className="w-full px-4 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                >
                  Cancel Booking
                </button>
                
                <button
                  onClick={() => {
                    // Implement modify booking
                    alert('Modify booking feature coming soon!');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Modify Booking
                </button>
                
                <button
                  onClick={() => {
                    // Implement contact support
                    alert('Contact support feature coming soon!');
                  }}
                  className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingDetailsPage;