import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBuilding, FaEnvelope, FaPhone, FaCalendar, FaMapMarkerAlt, FaEdit, FaArrowLeft, FaCheckCircle, FaChartLine, FaBusinessTime, FaStar } from "react-icons/fa";

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    category: "",
    description: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token");
      const storedProfile = localStorage.getItem("userProfile");

      if (!token || !storedProfile) {
        navigate("/login");
        return;
      }

      try {
        const profile = JSON.parse(storedProfile);
        
        // Check if user is a vendor
        if (profile.role !== "vendor") {
          navigate("/");
          return;
        }

        setUserProfile(profile);
        setVendorData(profile.vendor || {});
        
        setFormData({
          businessName: profile.vendor?.businessName || profile.businessName || "",
          businessAddress: profile.vendor?.businessAddress || profile.businessAddress || "",
          category: profile.vendor?.category || profile.category || "",
          description: profile.vendor?.description || profile.description || "",
          phone: profile.phone || "",
          email: profile.email || "",
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
      // Update vendor data
      const updatedVendorData = {
        ...vendorData,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        category: formData.category,
        description: formData.description,
      };

      // Update profile
      const updatedProfile = {
        ...userProfile,
        ...formData,
        vendor: updatedVendorData
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      setVendorData(updatedVendorData);
      
      // Dispatch event to update header
      window.dispatchEvent(new Event("storage"));
      
      setIsEditing(false);
      
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

  const vendorCategories = [
    { value: "hotel", label: "Hotel" },
    { value: "restaurant", label: "Restaurant" },
    { value: "shortlet", label: "Shortlet/Apartment" },
    { value: "vendor", label: "Vendor" },
    { value: "accommodation", label: "Accommodation" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
              <p className="text-gray-600 mt-2">Manage your business profile and settings</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="px-4 py-2 border border-[#00d1ff] text-[#00d1ff] rounded-lg hover:bg-[#00d1ff] hover:text-white transition-colors"
              >
                Dashboard
              </button>
              
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Business Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Business Logo/Icon */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl mb-4">
                  <FaBuilding />
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">
                  {formData.businessName || "Your Business"}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">
                    {userProfile.isVerified ? "Verified Vendor" : "Pending Verification"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 capitalize">
                  {formData.category || "Category not set"}
                </p>
              </div>

              {/* Business Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaEnvelope />
                  <span className="text-sm truncate">{userProfile.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendar />
                  <span className="text-sm">Vendor since {memberSince}</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0.0</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Business Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/vendor/dashboard")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/add-business")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Add New Listing
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  Support Chat
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

          {/* Right Column - Business Details */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Business Information</h3>
              
              <div className="space-y-8">
                {/* Business Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Business Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                          placeholder="Enter business name"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg">
                          {formData.businessName || "Not set"}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      {isEditing ? (
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          {vendorCategories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg capitalize">
                          {formData.category || "Not set"}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Description
                    </label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                        placeholder="Describe your business..."
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">
                        {formData.description || "No description provided"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          {formData.phone || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="businessAddress"
                          value={formData.businessAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                          placeholder="Enter business address"
                        />
                      ) : (
                        <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {formData.businessAddress || "Not provided"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Business Hours & Settings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Business Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span>Accept Online Bookings</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d1ff]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span>Receive Booking Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d1ff]"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span>Public Profile Visibility</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00d1ff]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Stats & Overview */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChartLine />
                  Performance Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Monthly Views</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Booking Rate</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaStar />
                  Quick Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-[#00d1ff] rounded-full mt-1.5"></div>
                    Complete your business profile to increase visibility
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-[#00d1ff] rounded-full mt-1.5"></div>
                    Add high-quality photos of your business
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-[#00d1ff] rounded-full mt-1.5"></div>
                    Set competitive pricing to attract more customers
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-[#00d1ff] rounded-full mt-1.5"></div>
                    Respond quickly to customer inquiries
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;