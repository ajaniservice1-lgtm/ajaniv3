import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaMapMarkerAlt, FaEdit, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const BuyerProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    // Check auth
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const storedProfile = localStorage.getItem("userProfile");

      if (!token || !storedProfile) {
        navigate("/login");
        return;
      }

      try {
        const profile = JSON.parse(storedProfile);
        
        // Check if user is actually a buyer
        if (profile.role !== "user" && profile.role !== "buyer") {
          navigate("/");
          return;
        }

        setUserProfile(profile);
        setFormData({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          address: profile.address || "",
        });
      } catch (error) {
        console.error("Error parsing profile:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Update local storage
      const updatedProfile = {
        ...userProfile,
        ...formData
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      
      // Dispatch event to update header
      window.dispatchEvent(new Event("storage"));
      
      setIsEditing(false);
      
      // Show success message
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("auth-storage");
    
    window.dispatchEvent(new Event("storage"));
    navigate("/");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d1ff]"></div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const memberSince = userProfile.registrationDate 
    ? new Date(userProfile.registrationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    : "Recently";

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buyer Profile</h1>
              <p className="text-gray-600 mt-2">Manage your account and preferences</p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00d1ff] text-white rounded-lg hover:bg-[#00b8e6] transition-colors"
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaCheckCircle />
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                  {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">
                    {userProfile.isVerified ? "Verified Buyer" : "Not Verified"}
                  </span>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope />
                  <span>{userProfile.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendar />
                  <span>Member since {memberSince}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {JSON.parse(localStorage.getItem("userSavedListings") || "[]").length}
                    </div>
                    <div className="text-sm text-gray-600">Saved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/saved")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  View Saved Listings
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Chat with Assistant
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h3>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          {userProfile.firstName}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          {userProfile.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        {userProfile.email}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          {userProfile.phone || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                          placeholder="Enter your address"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {userProfile.address || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span>Email Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d1ff]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span>Marketing Communications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d1ff]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="text-center py-8 text-gray-500">
                <FaUser className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-4 py-2 bg-[#00d1ff] text-white rounded-lg hover:bg-[#00b8e6] transition-colors"
                >
                  Explore Listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfilePage;