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
} from "lucide-react";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("ajani_dummy_login") === "true";

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

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    // Clear login state
    localStorage.removeItem("ajani_dummy_login");
    localStorage.removeItem("ajani_dummy_email");

    // Optional: Keep userProfile and saved listings for next login
    // If you want to clear everything, uncomment below:
    // localStorage.removeItem("userProfile");
    // localStorage.removeItem("userSavedListings");

    navigate("/login");
  };

  const handleEditProfile = () => {
    // Navigate to profile edit page or show edit modal
    alert("Edit profile feature coming soon!");
    // navigate("/profile/edit");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-manrope flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-15">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10 mt-15">
        {/* Back Button and Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Member since {userProfile.memberSince || "Today"}
            </p>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="bg-gradient-to-r from-[#00d1ff] to-[#00d37f] rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                <img
                  src={
                    userProfile.image ||
                    "https://ui-avatars.com/api/?name=User&background=random"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://ui-avatars.com/api/?name=User&background=random";
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userProfile.fullName}</h2>
                <p className="text-white/80 text-sm mt-1">
                  {userProfile.email ||
                    localStorage.getItem("ajani_dummy_email")}
                </p>
              </div>
            </div>
            <button
              onClick={handleEditProfile}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Listings</p>
                <p className="text-3xl font-bold text-gray-900">{savedCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Link
              to="/saved"
              className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviews Written</p>
                <p className="text-3xl font-bold text-gray-900">
                  {reviewsCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <button
              onClick={() => navigate("/register/user/process4")}
              className="inline-block mt-4 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              View all →
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Member since {userProfile.memberSince || "today"}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
            <p className="text-gray-600 mt-2">
              {userProfile.about || "No bio added yet."}
            </p>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              {userProfile.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
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
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
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
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">Ibadan, Nigeria</p>
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
            <Link
              to="/saved"
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Saved Listings</h4>
                  <p className="text-sm text-gray-500">
                    View all your saved businesses
                  </p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
            </Link>

            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors w-full text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Explore Listings
                  </h4>
                  <p className="text-sm text-gray-500">
                    Discover new businesses
                  </p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
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
                  <h4 className="font-medium text-gray-900">
                    Account Settings
                  </h4>
                  <p className="text-sm text-gray-500">
                    Update preferences and privacy
                  </p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
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
                  <h4 className="font-medium">Logout</h4>
                  <p className="text-sm text-red-500">
                    Sign out of your account
                  </p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 transform rotate-180" />
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
