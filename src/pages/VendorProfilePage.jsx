import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit, 
  ArrowLeft, 
  CheckCircle, 
  ChartLine, 
  Briefcase, 
  Star, 
  Users,
  Clock,
  CreditCard,
  Shield,
  Download,
  Printer,
  Package,
  Bell,
  Settings,
  LogOut,
  FileText,
  Home,
  Utensils,
  ChevronRight,
  AlertCircle,
  Check,
  Heart,
  User,
  Eye
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [savedCount, setSavedCount] = useState(0);

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

        // Load vendor's own bookings (as a customer)
        loadMyBookings(profile);
        
        // Load saved listings count
        const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
        setSavedCount(saved.length);
      } catch (error) {
        console.error("Error parsing profile:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadMyBookings = (profile) => {
    // Load bookings from vendor's profile (they made as a customer)
    const bookingsFromProfile = profile.bookings || [];
    
    // Also check separate bookings storage
    const userBookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
    
    // Merge all bookings
    const allBookings = [...bookingsFromProfile, ...userBookings]
      .map((booking, index) => ({
        ...booking,
        id: booking.id || `booking-${index}`,
        date: booking.date || new Date().toISOString()
      }));
    
    // Remove duplicates based on booking reference
    const uniqueBookings = Array.from(
      new Map(allBookings.map(item => [item.reference || item.id, item])).values()
    );
    
    setMyBookings(uniqueBookings.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setBookingsCount(uniqueBookings.length);
    
    // Get upcoming bookings (next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcoming = uniqueBookings.filter(booking => {
      if (booking.status === 'cancelled') return false;
      
      const checkInDate = booking.details?.checkIn;
      if (checkInDate) {
        const checkIn = new Date(checkInDate);
        return checkIn >= now && checkIn <= thirtyDaysFromNow;
      }
      return false;
    }).slice(0, 3); // Show only 3 upcoming bookings
    
    setUpcomingBookings(upcoming);
  };

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

  const getCategoryIcon = (category) => {
    switch(category) {
      case "hotel": return Building;
      case "restaurant": return Utensils;
      case "shortlet": return Home;
      case "event": return Calendar;
      case "service": return Briefcase;
      default: return Building;
    }
  };

  const vendorCategories = [
    { value: "hotel", label: "Hotel", icon: Building },
    { value: "restaurant", label: "Restaurant", icon: Utensils },
    { value: "shortlet", label: "Shortlet/Apartment", icon: Home },
    { value: "event", label: "Event Center", icon: Calendar },
    { value: "service", label: "Service Provider", icon: Briefcase }
  ];

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
              <p className="text-gray-600 mt-2">Manage your business profile and personal bookings</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/vendor/dashboard")}
                className="px-4 py-2 border border-[#00d1ff] text-[#00d1ff] rounded-lg hover:bg-[#00d1ff] hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </button>
              
              <button
                onClick={() => navigate("/my-bookings")}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  View My Bookings
                </div>
              </button>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00d1ff] text-white rounded-lg hover:bg-[#00b8e6] transition-colors text-sm font-medium"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <Check size={16} />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-[#00d1ff] text-[#00d1ff]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Business Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "bookings"
                  ? "border-[#00d1ff] text-[#00d1ff]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                My Bookings
                {upcomingBookings.length > 0 && (
                  <span className="bg-[#00d1ff] text-white text-xs px-1.5 py-0.5 rounded-full">
                    {upcomingBookings.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-[#00d1ff] text-[#00d1ff]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Business Overview */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl mb-4">
                  {(() => {
                    const CategoryIcon = getCategoryIcon(formData.category);
                    return <CategoryIcon size={48} />;
                  })()}
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
                  {vendorCategories.find(cat => cat.value === formData.category)?.label || "Category not set"}
                </p>
              </div>

              {/* Business Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={16} />
                  <span className="text-sm truncate">{userProfile.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={16} />
                  <span className="text-sm">Vendor since {memberSince}</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{bookingsCount}</div>
                    <div className="text-sm text-gray-600">My Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{savedCount}</div>
                    <div className="text-sm text-gray-600">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/vendor/dashboard")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                >
                  <ChartLine size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/my-bookings")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                >
                  <Package size={16} />
                  My Bookings
                </button>
                <button
                  onClick={() => navigate("/saved")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                >
                  <Heart size={16} />
                  Saved Listings
                </button>
                <button
                  onClick={() => navigate("/add-business")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                >
                  <Building size={16} />
                  Add Listing
                </button>
                <button
                  onClick={() => navigate("/chat")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                >
                  <Bell size={16} />
                  Support Chat
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 flex items-center gap-3"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Personal Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">My Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">{bookingsCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/my-bookings")}
                      className="inline-block mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      View all →
                    </button>
                  </div>

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
                    <button
                      onClick={() => navigate("/saved")}
                      className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                      Vendor since {memberSince}
                    </p>
                  </div>
                </div>

                {/* Business Details Form */}
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                              placeholder="Enter business name"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-lg">
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                            >
                              <option value="">Select category</option>
                              {vendorCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-lg capitalize">
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
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                            placeholder="Describe your business..."
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg min-h-[100px]">
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
                          <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                            <Mail className="text-gray-400" size={16} />
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                              <Phone className="text-gray-400" size={16} />
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-transparent"
                              placeholder="Enter business address"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-lg flex items-center gap-2">
                              <MapPin className="text-gray-400" size={16} />
                              {formData.businessAddress || "Not provided"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate("/my-bookings")}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">My Bookings</h4>
                          <p className="text-sm text-gray-500">View all your reservations</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => navigate("/saved")}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Saved Listings</h4>
                          <p className="text-sm text-gray-500">View saved businesses</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => navigate("/add-business")}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Add Listing</h4>
                          <p className="text-sm text-gray-500">List your business</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={() => navigate("/")}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Explore</h4>
                          <p className="text-sm text-gray-500">Discover businesses</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-6">
                {/* Upcoming Bookings */}
                {upcomingBookings.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Upcoming Bookings
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You don't have any upcoming bookings. Start exploring businesses to book!
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="px-6 py-2.5 bg-[#00d1ff] text-white rounded-lg hover:bg-[#00b8e6] transition font-medium"
                    >
                      Explore Now
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Upcoming Bookings
                      </h3>
                      <button
                        onClick={() => navigate("/my-bookings")}
                        className="text-[#00d1ff] hover:text-[#00b8e6] font-medium text-sm"
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
                                    <h4 className="font-semibold text-gray-900">
                                      {booking.vendor?.name || "Property"}
                                    </h4>
                                    <p className="text-xs text-gray-500 capitalize">{booking.type}</p>
                                  </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${getBookingStatusColor(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              
                              <div className="space-y-3 text-sm">
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
                                <p className="text-xs text-gray-500 mb-1">Booking Reference</p>
                                <p className="font-mono text-sm font-medium">{booking.reference}</p>
                              </div>
                            </div>
                            
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                              <button
                                onClick={() => navigate(`/booking-details/${booking.reference}`)}
                                className="w-full text-center text-sm text-[#00d1ff] hover:text-[#00b8e6] font-medium"
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
                
                {/* Booking Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-blue-600">{bookingsCount}</div>
                    <div className="text-sm text-blue-800 mt-1">Total Bookings</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-green-600">
                      {myBookings.filter(b => b.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-green-800 mt-1">Confirmed</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-yellow-600">
                      {myBookings.filter(b => b.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-800 mt-1">Pending</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-6">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(myBookings.reduce((sum, booking) => sum + (parseInt(booking.details?.totalAmount) || 0), 0))}
                    </div>
                    <div className="text-sm text-purple-800 mt-1">Total Spent</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield size={20} />
                    Security Settings
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-[#00d1ff] text-white rounded-lg hover:bg-[#00b8e6] text-sm font-medium">
                        Enable
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-600 mt-1">Update your password regularly</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        Change
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Login Activity</h4>
                        <p className="text-sm text-gray-600 mt-1">Review recent account activity</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => alert("Export data feature coming soon!")}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                    >
                      <Download size={16} />
                      Export Booking Data
                    </button>
                    
                    <button
                      onClick={() => alert("Print statements feature coming soon!")}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-3"
                    >
                      <Printer size={16} />
                      Print Booking History
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                          alert("Account deletion feature coming soon!");
                        }
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 flex items-center gap-3"
                    >
                      <AlertCircle size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white rounded-xl p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Vendor ID</p>
              <p className="font-medium text-gray-900">
                {vendorData?.id || userProfile.id || "N/A"}
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
              <p className="text-gray-600">Business Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {formData.category || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Last Active</p>
              <p className="font-medium text-gray-900">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;