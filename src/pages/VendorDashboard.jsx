import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { 
  FaChartLine, 
  FaHome, 
  FaList, 
  FaUsers, 
  FaCalendarCheck, 
  FaStar, 
  FaCog,
  FaBell,
  FaArrowRight,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    try {
      // Get data from localStorage (from registration/login)
      const userProfile = localStorage.getItem("userProfile");
      
      if (!userProfile) {
        navigate("/login");
        return;
      }

      const parsedProfile = JSON.parse(userProfile);
      
      if (parsedProfile.role !== "vendor") {
        navigate("/");
        return;
      }

      setUserData(parsedProfile);
      
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo - remove when you have real vendor endpoints
  const mockStats = {
    totalRevenue: 250005.34,
    activeListings: 3,
    totalBookings: 1,
    averageRating: 4.9,
    pendingBookings: 2,
  };

  const mockQuickStats = [
    { 
      title: "Revenue", 
      value: `₦${mockStats.totalRevenue.toLocaleString()}`, 
      change: "+125 from last month", 
      icon: <FaChartLine />,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      title: "Active Listings", 
      value: mockStats.activeListings.toString(), 
      change: "+1", 
      icon: <FaList />,
      color: "bg-green-50 text-green-600"
    },
    { 
      title: "Bookings", 
      value: mockStats.totalBookings.toString(), 
      change: "+1", 
      icon: <FaCalendarCheck />,
      color: "bg-purple-50 text-purple-600"
    },
    { 
      title: "Rating", 
      value: mockStats.averageRating.toFixed(1), 
      change: "+0.5", 
      icon: <FaStar />,
      color: "bg-yellow-50 text-yellow-600"
    },
  ];

  const mockRecentBookings = [
    {
      id: 1,
      customer: "Sola Fadipe Jr.",
      service: "Hotel Booking",
      amount: "₦28,000",
      status: "completed",
      date: "Today, 10:30 AM",
    },
    {
      id: 2,
      customer: "Bankole Johansson",
      service: "Event Booking",
      amount: "₦100,000",
      status: "pending",
      date: "Yesterday, 14:20 PM",
    },
  ];

  const getApprovalStatusDisplay = () => {
    const status = userData?.vendor?.approvalStatus || "pending";
    
    switch(status) {
      case "approved":
        return {
          text: "Approved",
          color: "bg-green-100 text-green-800",
          icon: <FaCheckCircle />,
          message: "Your account is fully approved and active"
        };
      case "pending":
        return {
          text: "Pending Approval",
          color: "bg-yellow-100 text-yellow-800",
          icon: <FaClock />,
          message: "Awaiting admin approval. You can set up your profile."
        };
      case "rejected":
        return {
          text: "Rejected",
          color: "bg-red-100 text-red-800",
          icon: <FaExclamationTriangle />,
          message: "Your vendor application was rejected. Contact support."
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800",
          icon: <FaExclamationTriangle />,
          message: "Status not available"
        };
    }
  };

  const handleCompleteProfile = () => {
    navigate("/vendor/complete-profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Vendor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userData?.firstName}!
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00d37f] rounded-full flex items-center justify-center text-white font-semibold">
                {userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="font-medium">{userData?.firstName} {userData?.lastName}</p>
                <p className="text-sm text-gray-500">{userData?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Approval Status Banner */}
          {userData?.vendor?.approvalStatus && (
            <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getApprovalStatusDisplay().color}`}>
                    {getApprovalStatusDisplay().icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Account Status</h3>
                    <p className="text-gray-700 text-sm">
                      {getApprovalStatusDisplay().message}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg ${getApprovalStatusDisplay().color}`}>
                  <span className="font-medium">{getApprovalStatusDisplay().text}</span>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Welcome Message for New Vendors */}
          {(!userData?.vendor?.businessName || !userData?.vendor?.businessAddress) && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUsers className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Complete Your Business Profile</h3>
                  <p className="text-blue-700 text-sm">
                    Add your business details to start receiving bookings.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleCompleteProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats Grid - DEMO ONLY */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard Preview</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Demo Data
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockQuickStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Vendor Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Vendor Account</h2>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Full Name</label>
                        <p className="font-medium">{userData?.firstName} {userData?.lastName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Email</label>
                        <p className="font-medium">{userData?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Phone</label>
                        <p className="font-medium">{userData?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Account Type</label>
                        <p className="font-medium capitalize">{userData?.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Category</label>
                        <p className="font-medium capitalize">{userData?.vendor?.category || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Business Name</label>
                        <p className="font-medium">{userData?.vendor?.businessName || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Business Address</label>
                        <p className="font-medium">{userData?.vendor?.businessAddress || "Not set"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Member Since</label>
                        <p className="font-medium">
                          {userData?.createdAt 
                            ? new Date(userData.createdAt).toLocaleDateString() 
                            : new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCompleteProfile}
                      className="px-4 py-2 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] text-sm font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate("/support")}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Contact Support
                    </button>
                    <button
                      onClick={() => navigate("/vendor/help")}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Get Help
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleCompleteProfile}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FaUsers className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Complete Profile</p>
                        <p className="text-gray-500 text-sm">Add business details</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => alert("Coming soon!")}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <FaPlus className="text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Add Listing</p>
                        <p className="text-gray-500 text-sm">Create a new property</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <FaCog className="text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Account Settings</p>
                        <p className="text-gray-500 text-sm">Manage your account</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Account Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email Verified</span>
                    {userData?.isVerified ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600">
                        <FaExclamationTriangle className="mr-1" /> Pending
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Active</span>
                    {userData?.isActive !== false ? (
                      <span className="flex items-center text-green-600">
                        <FaCheckCircle className="mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <FaExclamationTriangle className="mr-1" /> Inactive
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Next Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Complete your business profile</li>
                      <li>Wait for admin approval</li>
                      <li>Start adding listings</li>
                      <li>Receive bookings</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;