import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Settings, 
  Edit, 
  MapPin, 
  Star, 
  Phone, 
  Mail,
  Calendar,
  ArrowLeft,
  Save,
  X,
  CreditCard,
  Bell,
  Shield,
  LogOut
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: ""
  });

  // Load user profile and saved listings
  useEffect(() => {
    console.log("UserProfilePage - Loading data...");
    loadUserProfile();
    loadSavedListings();

    // Listen for updates
    const handleProfileUpdate = () => {
      console.log("Profile update detected");
      loadUserProfile();
    };

    const handleSavedListingsUpdate = () => {
      console.log("Saved listings update detected");
      loadSavedListings();
    };

    window.addEventListener("authChange", handleProfileUpdate);
    window.addEventListener("savedListingsUpdated", handleSavedListingsUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener("authChange", handleProfileUpdate);
      window.removeEventListener("savedListingsUpdated", handleSavedListingsUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  const loadUserProfile = () => {
    console.log("Loading user profile...");
    
    // Check localStorage for user data
    const profileData = localStorage.getItem("userProfile");
    const authToken = localStorage.getItem("auth_token");
    const userEmail = localStorage.getItem("user_email");
    
    console.log("Auth check:", {
      profileData: !!profileData,
      authToken: !!authToken,
      userEmail: !!userEmail
    });

    // If we have a profile, use it
    if (profileData) {
      try {
        const parsedProfile = JSON.parse(profileData);
        console.log("Loaded profile:", parsedProfile);
        
        // Enhance profile if needed
        const enhancedProfile = {
          ...parsedProfile,
          email: parsedProfile.email || userEmail,
          isVerified: parsedProfile.isVerified || !!authToken,
          address: parsedProfile.address || "",
          createdAt: parsedProfile.createdAt || parsedProfile.registrationDate || new Date().toISOString()
        };
        
        setUserProfile(enhancedProfile);
        setEditFormData({
          firstName: enhancedProfile.firstName || "",
          lastName: enhancedProfile.lastName || "",
          phone: enhancedProfile.phone || "",
          address: enhancedProfile.address || ""
        });
        
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing profile:", error);
      }
    }

    // If we have auth data but no profile, create one
    if (userEmail || authToken) {
      const basicProfile = {
        email: userEmail || "user@example.com",
        firstName: userEmail ? userEmail.split('@')[0] : "User",
        lastName: "",
        phone: "",
        address: "",
        role: "user",
        isVerified: !!authToken,
        profilePicture: "",
        createdAt: new Date().toISOString()
      };
      
      console.log("Created basic profile:", basicProfile);
      setUserProfile(basicProfile);
      setEditFormData({
        firstName: basicProfile.firstName,
        lastName: "",
        phone: "",
        address: ""
      });
      
      // Save it for future use
      localStorage.setItem("userProfile", JSON.stringify(basicProfile));
      
      setLoading(false);
      return;
    }

    // No auth data found
    console.log("No authentication data found");
    setLoading(false);
  };

  const loadSavedListings = () => {
    console.log("Loading saved listings...");
    const savedFromStorage = localStorage.getItem("userSavedListings");

    if (savedFromStorage) {
      try {
        const parsed = JSON.parse(savedFromStorage);
        console.log("Loaded saved listings:", parsed.length);
        setSavedListings(parsed);
      } catch (error) {
        console.error("Error parsing saved listings:", error);
        setSavedListings([]);
      }
    } else {
      console.log("No saved listings found");
      setSavedListings([]);
    }
  };

  // Handle profile update
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    const updatedProfile = {
      ...userProfile,
      ...editFormData,
      updatedAt: new Date().toISOString()
    };
    
    console.log("Updating profile:", updatedProfile);
    
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
    
    // Notify other components
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("storage"));
    
    setIsEditing(false);
    showToast("Profile updated successfully!");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Remove a saved listing
  const handleRemoveSaved = (id, e) => {
    if (e) e.stopPropagation();

    const updatedListings = savedListings.filter(
      (listing) => listing.id !== id
    );
    setSavedListings(updatedListings);
    localStorage.setItem("userSavedListings", JSON.stringify(updatedListings));

    // Show notification
    showToast("Removed from saved listings");

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("savedListingsUpdated", {
        detail: { action: "removed", itemId: id },
      })
    );
  };

  const showToast = (message) => {
    // Remove existing toast
    const existingToast = document.getElementById("toast-notification");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border bg-blue-50 border-blue-200 text-blue-800 transform transition-all duration-300";
    toast.style.transform = "translateX(400px)";

    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-70 transition-opacity">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = "translateX(0)"; }, 10);
    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
    }, 3000);
  };

  // Format date for display
  const formatMemberSince = () => {
    if (!userProfile?.createdAt) return "Recently";
    
    const date = new Date(userProfile.createdAt);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userProfile) return "U";
    return `${userProfile.firstName?.charAt(0) || ""}${userProfile.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  // Handle sign out
  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("redirectAfterLogin");

      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("user_email");

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("logout"));

      navigate("/login");
      window.location.reload();
    }
  };

  // Business Card Component for Saved Listings
  const BusinessCard = ({ listing }) => {
    const handleCardClick = () => {
      if (listing.id) {
        navigate(`/vendor-detail/${listing.id}`);
      }
    };

    return (
      <div
        className="bg-white rounded-xl overflow-hidden flex-shrink-0 font-manrope relative group w-full md:w-[240px] transition-all duration-200 cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-gray-100"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-xl w-full h-[160px]">
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80";
            }}
          />

          {/* Heart icon - Remove */}
          <button
            onClick={(e) => handleRemoveSaved(listing.id, e)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 z-10"
            title="Remove from saved"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Price overlay */}
          {listing.price && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {listing.price.split(" ")[0]}
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm mb-1">
            {listing.name}
          </h3>

          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin size={12} />
            <p className="text-xs line-clamp-1">{listing.location}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold">{listing.rating || "4.9"}</span>
            </div>
            <span className="text-[10px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              Saved
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-manrope flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-gray-100 rounded-xl h-96"></div>
              <div className="lg:col-span-2 bg-gray-100 rounded-xl h-96"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If no userProfile after loading, show message
  if (!userProfile && !loading) {
    return (
      <div className="min-h-screen bg-white font-manrope flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto px-4 py-10 text-center">
          <div className="py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Register
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-manrope flex flex-col">
      <Header />

      <main className="flex-grow md:mt-10 mt-15 max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Profile Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#00d1ff]/20 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                    {userProfile.profilePicture ? (
                      <img
                        src={userProfile.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                              ${getUserInitials()}
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                        {getUserInitials()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <Edit size={16} />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
                <p className="text-gray-600 text-sm mb-3">{userProfile.email}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${userProfile.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={`text-sm ${userProfile.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {userProfile.isVerified ? "Verified Account" : "Pending Verification"}
                  </span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-sm">{userProfile.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
                {userProfile.address && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-sm">{userProfile.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-sm">Member since {formatMemberSince()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{savedListings.length}</div>
                    <p className="text-xs text-gray-600">Saved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">0</div>
                    <p className="text-xs text-gray-600">Bookings</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">0</div>
                    <p className="text-xs text-gray-600">Reviews</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/saved")}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Heart size={16} />
                    <span>View Saved Listings</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "profile"
                    ? "text-[#00d1ff] border-b-2 border-[#00d1ff]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "saved"
                    ? "text-[#00d1ff] border-b-2 border-[#00d1ff]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart size={16} />
                  Saved Listings ({savedListings.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "settings"
                    ? "text-[#00d1ff] border-b-2 border-[#00d1ff]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings size={16} />
                  Settings
                </div>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h3>
                
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={editFormData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={editFormData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleInputChange}
                        placeholder="+2348012345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        value={editFormData.address}
                        onChange={handleInputChange}
                        placeholder="Your address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] outline-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditFormData({
                            firstName: userProfile.firstName || "",
                            lastName: userProfile.lastName || "",
                            phone: userProfile.phone || "",
                            address: userProfile.address || ""
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">First Name</h4>
                        <p className="text-gray-900">{userProfile.firstName || "Not provided"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Last Name</h4>
                        <p className="text-gray-900">{userProfile.lastName || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email Address</h4>
                      <p className="text-gray-900">{userProfile.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h4>
                      <p className="text-gray-900">{userProfile.phone || "Not provided"}</p>
                    </div>
                    {userProfile.address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
                        <p className="text-gray-900">{userProfile.address}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Account Type</h4>
                      <p className="text-gray-900 capitalize">{userProfile.role || "User"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Account Status</h4>
                      <p className="text-gray-900">
                        {userProfile.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Pending Verification
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Saved Listings</h3>
                  <p className="text-gray-600">
                    {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} saved
                  </p>
                </div>

                {savedListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedListings.map((listing) => (
                      <BusinessCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Heart size={32} className="text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">No saved listings yet</h4>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      You haven't saved any listings yet. Start exploring and click the heart icon to save listings you like.
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="px-6 py-3 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium"
                    >
                      Explore Listings
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h3>
                
                <div className="space-y-8">
                  {/* Privacy Settings */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield size={20} className="text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-900">Privacy Settings</h4>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300 text-[#00d1ff] focus:ring-[#00d1ff]" defaultChecked />
                          <span className="text-sm text-gray-700">Show profile to other users</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300 text-[#00d1ff] focus:ring-[#00d1ff]" defaultChecked />
                          <span className="text-sm text-gray-700">Make saved listings private</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded border-gray-300 text-[#00d1ff] focus:ring-[#00d1ff]" defaultChecked />
                          <span className="text-sm text-gray-700">Allow email notifications</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Bell size={20} className="text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-900">Notification Preferences</h4>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Email notifications</span>
                        <input type="checkbox" className="rounded border-gray-300 text-[#00d1ff] focus:ring-[#00d1ff]" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Booking reminders</span>
                        <input type="checkbox" className="rounded border-gray-300 text-[#00d1ff] focus:ring-[#00d1ff]" defaultChecked />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Promotional offers</span>
                        <input type="checkbox" className="rounded border-gray-300 text-[#00d1ff] focus:ring-[#00d1ff]" />
                      </label>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="text-red-500"
                      >
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <h4 className="text-sm font-medium text-gray-900">Danger Zone</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg">
                        <div>
                          <p className="font-medium text-red-700">Delete Account</p>
                          <p className="text-xs text-red-600 mt-1">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                              localStorage.clear();
                              navigate("/");
                              window.location.reload();
                            }
                          }}
                          className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;