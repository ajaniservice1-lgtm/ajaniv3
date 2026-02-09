import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  Filter,
  ChevronRight,
  Building,
  Utensils,
  Home
} from "lucide-react";

const BookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, upcoming, past, cancelled
  const [userProfile, setUserProfile] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("ajani_dummy_login") === "true";
    const userProfileStr = localStorage.getItem("userProfile");
    
    if (isLoggedIn && userProfileStr) {
      try {
        const profile = JSON.parse(userProfileStr);
        setUserProfile(profile);
        loadUserBookings(profile);
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    } else {
      // Check for guest bookings
      setIsGuest(true);
      loadGuestBookings();
    }
    
    setLoading(false);
  }, []);

  const loadUserBookings = (profile) => {
    // Try multiple sources
    const sources = [
      profile.bookings || [],
      JSON.parse(localStorage.getItem("userBookings") || "[]"),
      JSON.parse(localStorage.getItem("allBookings") || "[]")
    ];
    
    // Merge all bookings
    const allBookings = sources.flat().map((booking, index) => ({
      ...booking,
      id: booking.id || `booking-${index}`,
      date: booking.date || new Date().toISOString()
    }));
    
    // Remove duplicates based on booking reference
    const uniqueBookings = Array.from(
      new Map(allBookings.map(item => [item.reference || item.id, item])).values()
    );
    
    setBookings(uniqueBookings.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const loadGuestBookings = () => {
    const guestBookings = JSON.parse(localStorage.getItem("guestBookings") || "[]");
    const persistentBookings = JSON.parse(localStorage.getItem("confirmedBooking_persistent") || "[]");
    
    const allBookings = [...guestBookings, ...persistentBookings]
      .filter(booking => booking)
      .map((booking, index) => ({
        ...booking,
        id: booking.id || `guest-booking-${index}`,
        date: booking.date || new Date().toISOString(),
        status: booking.status || "confirmed"
      }));
    
    setBookings(allBookings.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmed':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'pending':
        return { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'hotel':
        return { icon: Building, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'restaurant':
        return { icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'shortlet':
        return { icon: Home, color: 'text-purple-600', bgColor: 'bg-purple-50' };
      default:
        return { icon: Calendar, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return "₦ --";
    return `₦${parseInt(price).toLocaleString()}`;
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (filter !== "all" && booking.status !== filter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (booking.vendor?.name || "").toLowerCase().includes(searchLower) ||
        (booking.reference || "").toLowerCase().includes(searchLower) ||
        (booking.type || "").toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleDownloadConfirmation = (booking) => {
    const confirmationText = `
AJANI.AI BOOKING CONFIRMATION
================================

Booking Reference: ${booking.reference}
Booking Type: ${booking.type?.toUpperCase()}
Status: ${booking.status?.toUpperCase()}
Booking Date: ${formatDate(booking.date)}

VENDOR INFORMATION:
-------------------
Name: ${booking.vendor?.name || "Not specified"}
Location: ${booking.vendor?.location || "Not specified"}

BOOKING DETAILS:
----------------
${booking.details?.checkIn ? `Check-in: ${booking.details.checkIn}\n` : ''}
${booking.details?.checkOut ? `Check-out: ${booking.details.checkOut}\n` : ''}
${booking.details?.guests ? `Guests: ${booking.details.guests.adults || 1} adults\n` : ''}
${booking.details?.specialRequests ? `Special Requests: ${booking.details.specialRequests}\n` : ''}

PAYMENT INFORMATION:
--------------------
Total Amount: ${formatPrice(booking.details?.totalAmount)}
Payment Method: ${booking.details?.paymentMethod || "Not specified"}

Thank you for booking with Ajani.ai!
    `;
    
    const element = document.createElement("a");
    const file = new Blob([confirmationText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `booking-${booking.reference}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleViewDetails = (booking) => {
    // Navigate to booking details page
    navigate(`/booking-details/${booking.reference}`, { state: { booking } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            {isGuest 
              ? "View your recent bookings made as a guest" 
              : `Welcome back, ${userProfile?.fullName || userProfile?.firstName || "User"}!`}
          </p>
          
          {isGuest && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You're viewing bookings as a guest. To keep your booking history permanently, 
                please <button onClick={() => navigate("/signup")} className="font-semibold text-blue-600 hover:underline">create an account</button>.
              </p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'upcoming', 'past', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2.5 rounded-lg font-medium capitalize ${
                  filter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="text-right">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2.5 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 font-medium"
            >
              Book New Stay
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm 
                ? "No bookings match your search. Try a different search term."
                : isGuest
                  ? "You haven't made any bookings as a guest yet."
                  : "You haven't made any bookings yet."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              Start Booking
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status).icon;
              const TypeIcon = getTypeIcon(booking.type).icon;
              
              return (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Column */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 ${getTypeIcon(booking.type).bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon className={`w-6 h-6 ${getTypeIcon(booking.type).color}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.vendor?.name || "Unnamed Property"}
                              </h3>
                              <span className={`px-2.5 py-0.5 ${getStatusIcon(booking.status).bgColor} ${getStatusIcon(booking.status).color} rounded-full text-xs font-medium`}>
                                {booking.status}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(booking.date)}</span>
                              </div>
                              
                              {booking.vendor?.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" />
                                  <span>{booking.vendor.location}</span>
                                </div>
                              )}
                              
                              {booking.details?.guests && (
                                <div className="flex items-center gap-1.5">
                                  <Users className="w-4 h-4" />
                                  <span>{booking.details.guests.adults || 1} adults</span>
                                </div>
                              )}
                              
                              {booking.details?.totalAmount && (
                                <div className="flex items-center gap-1.5">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="font-semibold">{formatPrice(booking.details.totalAmount)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column - Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadConfirmation(booking)}
                            className="p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            title="Download confirmation"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => window.print()}
                            className="p-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            title="Print"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Reference */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500">Booking Reference:</span>
                          <span className="ml-2 font-mono font-semibold">{booking.reference}</span>
                        </div>
                        <StatusIcon className={`w-5 h-5 ${getStatusIcon(booking.status).color}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {bookings.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
              <div className="text-sm text-blue-800 mt-1">Total Bookings</div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-sm text-green-800 mt-1">Confirmed</div>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-800 mt-1">Pending</div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(bookings.reduce((sum, booking) => sum + (parseInt(booking.details?.totalAmount) || 0), 0))}
              </div>
              <div className="text-sm text-purple-800 mt-1">Total Value</div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BookingsPage;