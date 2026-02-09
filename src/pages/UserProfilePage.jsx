import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ArrowLeft,
  Heart,
  Star,
  Clock,
  Settings,
  Edit,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  CreditCard,
  Building,
  Home,
  Utensils,
  Briefcase,
  Shield,
  Bell,
  User,
  FileText,
  CreditCard as CardIcon,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from "lucide-react";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("ajani_dummy_login") === "true" || 
                      localStorage.getItem("auth_token");

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Load user profile
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        setUserProfile(parsedProfile);
        
        // Load bookings from user profile
        if (parsedProfile.bookings && Array.isArray(parsedProfile.bookings)) {
          setBookingsCount(parsedProfile.bookings.length);
          
          // Get upcoming bookings (next 30 days)
          const now = new Date();
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          const upcoming = parsedProfile.bookings.filter(booking => {
            if (booking.status === 'cancelled') return false;
            
            const checkInDate = booking.details?.checkIn;
            if (checkInDate) {
              const checkIn = new Date(checkInDate);
              return checkIn >= now && checkIn <= thirtyDaysFromNow;
            }
            return false;
          }).slice(0, 3); // Show only 3 upcoming bookings
          
          setUpcomingBookings(upcoming);
        }
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }

    // Load saved listings count
    const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
    setSavedCount(saved.length);

    // Load reviews count
    const reviews = JSON.parse(localStorage.getItem("userReviews") || "[]");
    setReviewsCount(reviews.length);

    // Also check separate bookings storage
    const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    if (userBookings.length > bookingsCount) {
      setBookingsCount(userBookings.length);
    }

    setLoading(false);
  }, [navigate]);

// In your logout function (in LoginPage, Profile pages, etc.):
const handleLogout = () => {
  // Mark as manual logout
  localStorage.setItem("logout_manual", "true");
  
  // Clear auth data
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("ajani_dummy_login");
  
  // Dispatch events
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new Event("logout"));
  
  // Navigate to home
  navigate("/");
  window.location.reload();
};

  const handleEditProfile = () => {
    // Navigate to profile edit page or show edit modal
    alert("Edit profile feature coming soon!");
    // navigate("/profile/edit");
  };

  const handleViewSaved = () => {
    // Navigate to saved listings page
    alert("Saved listings page coming soon!");
    // navigate("/saved");
  };

  const handleViewBookings = () => {
    // Navigate to bookings page
    alert("Bookings page coming soon!");
    // navigate("/my-bookings");
  };

  const handleViewReviews = () => {
    // Navigate to reviews page
    alert("Reviews page coming soon!");
    // navigate("/reviews");
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
    if (isNaN(num)) return "₦ --";
    return `₦${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBookingIcon = (type) => {
    switch(type) {
      case 'hotel': return Building;
      case 'restaurant': return Utensils;
      case 'shortlet': return Home;
      case 'event': return Calendar;
      case 'service': return Briefcase;
      default: return Package;
    }
  };

  const getBookingStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-manrope flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-15">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-100 rounded-xl h-32"></div>
              <div className="bg-gray-100 rounded-xl h-32"></div>
              <div className="bg-gray-100 rounded-xl h-32"></div>
              <div className="bg-gray-100 rounded-xl h-32"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white font-manrope flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-15">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Settings size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Profile not found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Please log in to view your profile.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium"
            >
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-manrope flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 mt-15">
        {/* Back Button and Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-[13.5px]"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Profile
            </h1>
            <p className="text-[13.5px] text-gray-600 mt-1">
              Member since {userProfile.memberSince || 
                (userProfile.registrationDate 
                  ? new Date(userProfile.registrationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })
                  : "Today")}
            </p>
          </div>
        </div>

        {/* Profile Summary Card - WITH GRADIENT BACKGROUND */}
        <div className="bg-gradient-to-r from-[#00d1ff] via-[#00d3af] to-[#00d370] rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                <img
                  src={
                    userProfile.image ||
                    userProfile.avatar ||
                    "https://ui-avatars.com/api/?name=" + 
                    encodeURIComponent(userProfile.fullName || userProfile.firstName || "User") + 
                    "&background=random&color=fff"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://ui-avatars.com/api/?name=User&background=random";
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userProfile.fullName || 
                  `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() || 
                  "User"}</h2>
                <p className="text-white/80 text-[13.5px] mt-1">
                  {userProfile.email ||
                    localStorage.getItem("ajani_dummy_email")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                    Verified Account
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition text-[13.5px]"
              >
                <Package className="w-4 h-4" />
                My Bookings
              </button>
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition text-[13.5px]"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] text-gray-600">Saved Listings</p>
                <p className="text-3xl font-bold text-gray-900">{savedCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <button
              onClick={handleViewSaved}
              className="inline-block mt-4 text-[13.5px] text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] text-gray-600">My Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {bookingsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <button
              onClick={handleViewBookings}
              className="inline-block mt-4 text-[13.5px] text-purple-600 hover:text-purple-800 font-medium"
            >
              View all →
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] text-gray-600">Reviews Written</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reviewsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <button
              onClick={handleViewReviews}
              className="inline-block mt-4 text-[13.5px] text-green-600 hover:text-green-800 font-medium"
            >
              View all →
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13.5px] text-gray-600">Account Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="mt-4 text-[13.5px] text-gray-500">
              Member since {userProfile.memberSince || "today"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-1 font-medium text-[13.5px] border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-[#00d37f] text-[#00d37f]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-3 px-1 font-medium text-[13.5px] border-b-2 transition-colors ${
                activeTab === "bookings"
                  ? "border-[#00d37f] text-[#00d37f]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Upcoming Bookings
                {upcomingBookings.length > 0 && (
                  <span className="bg-[#00d37f] text-white text-[11px] px-1.5 py-0.5 rounded-full">
                    {upcomingBookings.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-3 px-1 font-medium text-[13.5px] border-b-2 transition-colors ${
                activeTab === "security"
                  ? "border-[#00d37f] text-[#00d37f]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Profile Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
                <p className="text-[13.5px] text-gray-600 mt-2">
                  {userProfile.about || userProfile.bio || "No bio added yet."}
                </p>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProfile.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[13.5px] text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 text-[13.5px]">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {userProfile.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[13.5px] text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900 text-[13.5px]">
                          {userProfile.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[13.5px] text-gray-500">Location</p>
                      <p className="font-medium text-gray-900 text-[13.5px]">
                        {userProfile.location || "Ibadan, Nigeria"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-[13.5px] text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900 text-[13.5px]">
                        {userProfile.registrationDate
                          ? new Date(userProfile.registrationDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                <button
                  onClick={handleViewSaved}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[13.5px]">Saved Listings</h4>
                      <p className="text-[13.5px] text-gray-500">
                        View all your saved businesses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={handleViewBookings}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[13.5px]">
                        My Bookings
                      </h4>
                      <p className="text-[13.5px] text-gray-500">
                        View all your reservations
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[13.5px]">
                        Explore Listings
                      </h4>
                      <p className="text-[13.5px] text-gray-500">
                        Discover new businesses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => alert("Settings feature coming soon!")}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[13.5px]">
                        Account Settings
                      </h4>
                      <p className="text-[13.5px] text-gray-500">
                        Update preferences and privacy
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[13.5px]">Logout</h4>
                      <p className="text-[13.5px] text-red-500">
                        Sign out of your account
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-6">
            {upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Upcoming Bookings
                </h3>
                <p className="text-[13.5px] text-gray-600 mb-6">
                  You don't have any upcoming bookings in the next 30 days.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2.5 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium text-[13.5px]"
                >
                  Book Now
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming Bookings
                  </h3>
                  <button
                    onClick={handleViewBookings}
                    className="text-[13.5px] text-[#00d37f] hover:text-[#02be72] font-medium"
                  >
                    View All Bookings →
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {upcomingBookings.map((booking) => {
                    const BookingIcon = getBookingIcon(booking.type);
                    return (
                      <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookingIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-[13.5px]">
                                  {booking.vendor?.name || "Property"}
                                </h4>
                                <p className="text-[12px] text-gray-500 capitalize">{booking.type}</p>
                              </div>
                            </div>
                            <span className={`text-[12px] px-2 py-1 rounded-full ${getBookingStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="space-y-3 text-[13.5px]">
                            {booking.details?.checkIn && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Check-in: {formatDate(booking.details.checkIn)}
                                </span>
                              </div>
                            )}
                            
                            {booking.details?.guests && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {booking.details.guests.adults || 1} guests
                                </span>
                              </div>
                            )}
                            
                            {booking.details?.totalAmount && (
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">
                                  {formatPrice(booking.details.totalAmount)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <p className="text-[12px] text-gray-500 mb-1">Booking Reference</p>
                            <p className="font-mono text-[13.5px] font-medium">{booking.reference}</p>
                          </div>
                        </div>
                        
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                          <button
                            onClick={() => navigate(`/booking/confirmation/${booking.type || 'hotel'}?ref=${booking.reference}`)}
                            className="w-full text-center text-[13.5px] text-[#00d37f] hover:text-[#02be72] font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Security</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 text-[13.5px]">Two-Factor Authentication</h4>
                  <p className="text-[13.5px] text-gray-600 mt-1">Add an extra layer of security</p>
                </div>
                <button className="px-4 py-2 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] text-[13.5px] font-medium">
                  Enable
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 text-[13.5px]">Change Password</h4>
                  <p className="text-[13.5px] text-gray-600 mt-1">Update your password regularly</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-[13.5px] font-medium">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 text-[13.5px]">Login Activity</h4>
                  <p className="text-[13.5px] text-gray-600 mt-1">Review recent account activity</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-[13.5px] font-medium">
                  View
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 text-[13.5px]">Connected Devices</h4>
                  <p className="text-[13.5px] text-gray-600 mt-1">Manage devices with access</p>
                </div>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-[13.5px] font-medium">
                  Manage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h4 className="text-[13.5px] font-medium text-gray-700 mb-4">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[13.5px]">
            <div>
              <p className="text-gray-600">User ID</p>
              <p className="font-medium text-gray-900">
                {userProfile.id || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Registration Date</p>
              <p className="font-medium text-gray-900">
                {userProfile.registrationDate
                  ? new Date(userProfile.registrationDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Account Type</p>
              <p className="font-medium text-gray-900">Standard User</p>
            </div>
            <div>
              <p className="text-gray-600">Last Active</p>
              <p className="font-medium text-gray-900">Just now</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;