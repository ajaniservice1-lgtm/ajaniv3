import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  CalendarCheck,
  Settings,
  Search,
  Menu,
  Eye,
  X,
  Save,
  Camera,
  Bell,
  Edit3,
  Trash2,
  Mail,
  MessageSquare,
  Award as AwardIcon,
  Heart as HeartIcon,
  MapPin as MapPinIcon,
  Building,
  Utensils,
  Briefcase,
  Home as HomeIcon,
  CalendarDays,
  User,
  Package,
  ChartLine,
  CreditCard,
  Shield,
  LogOut,
  FileText,
  ChevronRight,
  Star,
  Users,
  Clock,
  Download,
  Printer,
  AlertCircle,
  Check,
  Phone
} from "lucide-react";
import Logo from "../assets/Logos/logo5.png";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to format location
const formatLocation = (location) => {
  if (!location) return "Location available";
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    if (parts.length > 0) {
      return parts.join(', ');
    }
    
    try {
      return Object.values(location)
        .filter(value => typeof value === 'string' && value.trim().length > 0)
        .join(', ');
    } catch {
      return "Location available";
    }
  }
  
  return String(location);
};

// Default profile avatar component
const DefaultProfileAvatar = ({ size = "w-10 h-10", className = "" }) => {
  return (
    <div className={`${size} rounded-full bg-blue-100 flex items-center justify-center ${className}`}>
      <Building size={size === "w-10 h-10" ? 24 : 32} className="text-blue-600" />
    </div>
  );
};

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    category: "",
    description: "",
    phone: "",
    email: "",
  });

  // Settings state
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    city: "",
    bio: ""
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    whatsapp: true,
    promotionalEmail: false,
    promotionalWhatsapp: false
  });
  const [profileImage, setProfileImage] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  // Tab configuration for vendor profile
  const tabs = [
    { id: "overview", label: "Business Overview", icon: Building },
    { id: "bookings", label: "My Bookings", icon: Package },
    { id: "listings", label: "My Listings", icon: HomeIcon },
    { id: "analytics", label: "Analytics", icon: ChartLine },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Vendor categories with icons
  const vendorCategories = [
    { id: "hotel", label: "Hotels", icon: Building, color: "blue" },
    { id: "restaurant", label: "Restaurants", icon: Utensils, color: "green" },
    { id: "shortlet", label: "Shortlets", icon: HomeIcon, color: "purple" },
    { id: "event", label: "Event Centers", icon: CalendarDays, color: "orange" },
    { id: "service", label: "Services", icon: Briefcase, color: "indigo" }
  ];

  useEffect(() => {
    fetchUserData();
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUserData = () => {
    try {
      const token = localStorage.getItem("auth_token");
      const storedProfile = localStorage.getItem("userProfile");

      if (!token) {
        navigate("/login");
        return;
      }

      let profile;
      if (storedProfile) {
        profile = JSON.parse(storedProfile);
      } else {
        navigate("/login");
        return;
      }

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

      const fullName = profile.firstName && profile.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : profile.username || profile.email || "";
      setProfileData({
        name: fullName,
        username: profile.username || profile.email || "",
        email: profile.email || "",
        city: profile.city || "",
        bio: profile.bio || "Business owner and service provider on Ajani platform."
      });

      // Set profile image - use default avatar if no image is set
      setProfileImage(profile.profileImage || null);

      // Load vendor's personal bookings (as a customer)
      loadMyBookings(profile);
      
      // Load saved listings count
      const saved = JSON.parse(localStorage.getItem("userSavedListings") || "[]");
      setSavedCount(saved.length);

    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
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

  const getBookingIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'hotel':
        return <Building className="text-blue-500 w-4 h-4" />;
      case 'shortlet':
        return <HomeIcon className="text-purple-500 w-4 h-4" />;
      case 'restaurant':
        return <Utensils className="text-green-500 w-4 h-4" />;
      case 'event':
      case 'event center':
        return <CalendarDays className="text-orange-500 w-4 h-4" />;
      case 'service':
        return <Briefcase className="text-indigo-500 w-4 h-4" />;
      default:
        return <CalendarCheck className="text-gray-500 w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦ --";
    try {
      const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
      if (isNaN(num)) return "₦ --";
      return `₦${num.toLocaleString()}`;
    } catch {
      return "₦ --";
    }
  };

  const handleNotificationToggle = (type) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.match('image.*')) {
        alert("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
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

  const handleLogoClick = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNameClick = () => {
    alert("Contact support to change your name or email");
  };

  const handleEmailClick = () => {
    alert("Contact support to change your name or email");
  };

  const getCategoryIcon = (category) => {
    const cat = vendorCategories.find(c => c.id === category);
    if (cat) {
      const Icon = cat.icon;
      return <Icon className={`text-${cat.color}-500`} />;
    }
    return <Building className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-manrope">Loading vendor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  // Calculate stats
  const memberSince = userProfile?.registrationDate 
    ? new Date(userProfile.registrationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    : "Recently";

  const bookings = myBookings || [];
  const recentBookings = [...bookings].slice(0, 5);
  const savedListings = JSON.parse(localStorage.getItem("userSavedListings") || "[]");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-manrope relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-blue-500 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            {isSidebarOpen ? (
              <X size={20} strokeWidth={2.5} className="text-blue-600" />
            ) : (
              <Menu size={20} strokeWidth={2.5} className="text-blue-600" />
            )}
          </button>
          
          <img 
            src={Logo} 
            alt="Ajani" 
            className="h-8 w-auto cursor-pointer hover:scale-105 transition-transform"
            onClick={handleLogoClick}
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Search 
              size={16} 
              strokeWidth={2.5} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search for something"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
              style={{ width: '250px' }}
            />
          </div>

          <button 
            onClick={() => setActiveTab("settings")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={20} strokeWidth={2.5} className="text-gray-600" />
          </button>

          <button 
            onClick={() => {
              setActiveTab("notifications");
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} strokeWidth={2.5} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <DefaultProfileAvatar />
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow pt-0">
        <div className="flex h-[calc(100vh-65px)]">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ 
              x: isSidebarOpen ? 0 : '-100%',
              width: isSidebarOpen ? '256px' : '0px'
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed md:relative top-0 left-0 h-full z-50 md:translate-x-0 md:w-64 bg-white border-r border-gray-200 overflow-hidden"
          >
            <div className="p-4 flex items-center md:hidden justify-between border-b border-gray-200">
              <div className="ml-0">
                <img 
                  src={Logo} 
                  alt="Ajani" 
                  className="h-8 w-auto cursor-pointer hover:scale-105 transition-transform"
                  onClick={handleLogoClick}
                />
              </div>
              
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} strokeWidth={2.5} className="text-gray-600" />
              </button>
            </div>
            
            <nav className="mt-4 md:mt-8 px-4">
              <div className="space-y-3 md:space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`flex items-center w-full px-3 md:px-4 py-3 md:py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200"
                      }`}
                    >
                      <Icon size={16} strokeWidth={2.5} className="mr-3 flex-shrink-0" />
                      <span className="text-sm md:text-base font-manrope">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
            
            <div className="mt-6 px-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 font-manrope">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/vendor/dashboard")}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-manrope flex items-center gap-2"
                >
                  <ChartLine size={16} strokeWidth={2.5} className="text-blue-500" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/vendor/listings")}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-manrope flex items-center gap-2"
                >
                  <HomeIcon size={16} strokeWidth={2.5} className="text-green-500" />
                  My Listings
                </button>
                <button
                  onClick={() => navigate("/vendor/add-listing")}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-manrope flex items-center gap-2"
                >
                  <Building size={16} strokeWidth={2.5} className="text-purple-500" />
                  Add Listing
                </button>
                <button
                  onClick={() => navigate("/vendor/bookings")}
                  className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-manrope flex items-center gap-2"
                >
                  <Package size={16} strokeWidth={2.5} className="text-orange-500" />
                  Customer Bookings
                </button>
              </div>
            </div>
            
            {isSidebarOpen && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover sidebar-avatar"
                      />
                    ) : (
                      <DefaultProfileAvatar />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p 
                      onClick={handleNameClick}
                      className="font-medium text-gray-900 text-sm truncate font-manrope cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {formData.businessName || "Business Name"}
                    </p>
                    <p 
                      onClick={handleEmailClick}
                      className="text-xs text-gray-500 truncate font-manrope cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Main Content */}
          <div className="flex-grow overflow-y-auto w-full">
            {!isSidebarOpen && (
              <div className="md:hidden p-4 border-b border-gray-200">
                <div className="relative">
                  <Search 
                    size={16} 
                    strokeWidth={2.5} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Search for something"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                  />
                </div>
              </div>
            )}
            
            <div className="max-w-7xl mx-auto px-3 md:px-4 md:px-6 py-4 md:py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Overview Tab */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Welcome Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 font-manrope">
                              Welcome back, {formData.businessName || "Business"}!
                            </h1>
                            <p className="text-white/90 font-manrope">Your vendor dashboard and profile</p>
                          </div>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors font-manrope"
                          >
                            <Edit3 size={16} strokeWidth={2.5} />
                            Edit Profile
                          </button>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Personal Bookings Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package size={20} strokeWidth={2.5} className="text-blue-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">My Bookings</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{bookingsCount}</div>
                          <button
                            onClick={() => setActiveTab("bookings")}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View all →
                          </button>
                        </motion.div>
                        
                        {/* Business Type Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Building size={20} strokeWidth={2.5} className="text-green-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Business Type</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope capitalize">
                            {formData.category || "Not set"}
                          </div>
                        </motion.div>
                        
                        {/* Member Since Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <AwardIcon size={20} strokeWidth={2.5} className="text-purple-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Vendor Since</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{memberSince}</div>
                        </motion.div>
                        
                        {/* Saved Listings Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <HeartIcon size={20} strokeWidth={2.5} className="text-yellow-600" />
                            </div>
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Saved</h3>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{savedCount}</div>
                        </motion.div>
                      </div>

                      {/* Business Information Section */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-4 md:p-6 border-b border-gray-200">
                          <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Business Information</h2>
                        </div>
                        <div className="p-4 md:p-6">
                          {isEditing ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">
                                    Business Name *
                                  </label>
                                  <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-manrope"
                                    placeholder="Enter business name"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">
                                    Category *
                                  </label>
                                  <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-manrope"
                                  >
                                    <option value="">Select category</option>
                                    {vendorCategories.map((cat) => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">
                                  Business Description
                                </label>
                                <textarea
                                  name="description"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  rows="4"
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-manrope"
                                  placeholder="Describe your business..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">
                                  Business Address
                                </label>
                                <input
                                  type="text"
                                  name="businessAddress"
                                  value={formData.businessAddress}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-manrope"
                                  placeholder="Enter business address"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-manrope"
                                  placeholder="Enter phone number"
                                />
                              </div>
                              
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => setIsEditing(false)}
                                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium font-manrope transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveProfile}
                                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 font-manrope transition-colors"
                                >
                                  <Save size={16} strokeWidth={2.5} /> Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <p className="text-sm text-gray-500 font-manrope">Business Name</p>
                                  <p className="text-lg font-medium text-gray-900 font-manrope mt-1">
                                    {formData.businessName || "Not set"}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-500 font-manrope">Category</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getCategoryIcon(formData.category)}
                                    <span className="text-lg font-medium text-gray-900 font-manrope capitalize">
                                      {formData.category || "Not set"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 font-manrope">Description</p>
                                <p className="text-gray-900 mt-1 font-manrope">
                                  {formData.description || "No description provided"}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 font-manrope">Business Address</p>
                                <p className="text-gray-900 mt-1 font-manrope flex items-center gap-2">
                                  <MapPinIcon size={16} className="text-gray-400" />
                                  {formData.businessAddress || "Not provided"}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 font-manrope">Contact Information</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    <span className="text-gray-900 font-manrope">{userProfile.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" />
                                    <span className="text-gray-900 font-manrope">{formData.phone || "Not provided"}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Edit3 size={16} strokeWidth={2.5} />
                                Edit Business Information
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Bookings Section */}
                      {recentBookings.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                        >
                          <div className="p-4 md:p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Recent Bookings</h2>
                              <button
                                onClick={() => setActiveTab("bookings")}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View All →
                              </button>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <div className="min-w-[600px] md:min-w-0">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Vendor</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Type</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Date</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Status</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Amount</th>
                                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {recentBookings.map((booking, index) => (
                                    <motion.tr 
                                      key={booking.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.1 * index }}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                          <img 
                                            src={booking.vendor?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                                            alt={booking.vendor?.name} 
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover" 
                                          />
                                          <div>
                                            <div className="font-medium text-gray-900 text-sm md:text-base font-manrope truncate max-w-[150px]">
                                              {booking.vendor?.name || "Unknown Vendor"}
                                            </div>
                                            <div className="text-xs text-gray-500 md:hidden font-manrope">
                                              {formatDate(booking.date)}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-1">
                                          {getBookingIcon(booking.type)}
                                          <span className="text-gray-900 text-sm font-manrope capitalize">
                                            {booking.type || "N/A"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-3 md:p-4 text-gray-900 hidden md:table-cell font-manrope">
                                        {formatDate(booking.details?.checkIn || booking.date)}
                                      </td>
                                      <td className="p-3 md:p-4">
                                        <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-manrope ${getStatusColor(booking.status)}`}>
                                          {booking.status || "N/A"}
                                        </span>
                                      </td>
                                      <td className="p-3 md:p-4 text-gray-900 font-medium font-manrope">
                                        {formatPrice(booking.details?.totalAmount)}
                                      </td>
                                      <td className="p-3 md:p-4">
                                        <div className="flex items-center gap-2">
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => navigate(`/booking/confirmation/${booking.type}?ref=${booking.id}`)}
                                            className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                            title="View Details"
                                          >
                                            <Eye size={16} strokeWidth={2.5} />
                                          </motion.button>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Quick Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/vendor/dashboard")}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <ChartLine size={24} strokeWidth={2.5} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 font-manrope">Dashboard</h3>
                          </div>
                          <p className="text-gray-600 text-sm font-manrope">
                            View your business analytics and performance metrics
                          </p>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/vendor/listings")}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <HomeIcon size={24} strokeWidth={2.5} className="text-green-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 font-manrope">My Listings</h3>
                          </div>
                          <p className="text-gray-600 text-sm font-manrope">
                            Manage your business listings and availability
                          </p>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/vendor/add-listing")}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Building size={24} strokeWidth={2.5} className="text-purple-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 font-manrope">Add Listing</h3>
                          </div>
                          <p className="text-gray-600 text-sm font-manrope">
                            Create new listings for your business offerings
                          </p>
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Bookings Tab */}
                  {activeTab === "bookings" && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">My Bookings</h2>
                            <p className="text-gray-600 text-sm font-manrope">Your personal bookings as a customer</p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate("/")}
                              className="px-4 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 text-sm font-medium font-manrope transition-colors"
                            >
                              Book Now
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* All Bookings Table */}
                      {bookings.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <div className="p-4 md:p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 font-manrope">All Bookings ({bookings.length})</h3>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Vendor</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Type</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Date</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Status</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Amount</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {bookings.map((booking, index) => (
                                  <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-3">
                                        <img 
                                          src={booking.vendor?.image || "https://images.unsplash.com/photo-1552566626-52f8b828add9"} 
                                          alt={booking.vendor?.name}
                                          className="w-10 h-10 rounded-md object-cover"
                                        />
                                        <div className="min-w-0">
                                          <p className="font-medium text-gray-900 text-sm truncate font-manrope">
                                            {booking.vendor?.name || "Unknown Vendor"}
                                          </p>
                                          <p className="text-xs text-gray-500 font-manrope truncate">
                                            {formatLocation(booking.vendor?.location)}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-1">
                                        {getBookingIcon(booking.type)}
                                        <span className="text-gray-900 text-sm font-manrope capitalize">
                                          {booking.type || "N/A"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-900 hidden md:table-cell font-manrope">
                                      {formatDate(booking.details?.checkIn || booking.date)}
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-manrope ${getStatusColor(booking.status)}`}>
                                        {booking.status || "N/A"}
                                      </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-900 font-medium font-manrope">
                                      {formatPrice(booking.details?.totalAmount)}
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => navigate(`/booking/confirmation/${booking.type}?ref=${booking.id}`)}
                                          className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                          title="View Details"
                                        >
                                          <Eye size={16} strokeWidth={2.5} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                          <Package size={48} strokeWidth={1.5} className="mx-auto text-gray-300 mb-4" />
                          <h3 className="text-lg font-bold text-gray-900 mb-2 font-manrope">No Bookings Yet</h3>
                          <p className="text-gray-600 mb-6 font-manrope">You haven't made any bookings yet as a customer.</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/")}
                            className="px-6 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90 font-medium font-manrope transition-colors"
                          >
                            Explore Businesses
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <div className="space-y-6">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="border-b border-gray-200 pb-4 mb-6">
                          <h2 className="text-lg font-bold text-gray-900 font-manrope">Profile Settings</h2>
                          <p className="text-sm text-gray-600 mt-1 font-manrope">Manage your account and preferences</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              {profileImage ? (
                                <img 
                                  src={profileImage} 
                                  alt="Profile" 
                                  className="w-20 h-20 rounded-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform">
                                  <Building size={40} className="text-blue-600" />
                                </div>
                              )}
                              <label className="absolute bottom-0 right-0 bg-[#6cff] text-white rounded-full p-2 cursor-pointer group-hover:scale-110 transition-transform shadow-lg">
                                <Camera size={16} strokeWidth={2.5} />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleProfileImageUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 font-manrope">Click the camera icon to upload a new profile picture</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Business Name</label>
                                <input 
                                  type="text" 
                                  name="businessName"
                                  value={formData.businessName}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Phone</label>
                                <input 
                                  type="tel" 
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Email</label>
                                <input 
                                  type="email" 
                                  value={profileData.email}
                                  readOnly
                                  onClick={handleEmailClick}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Business Category</label>
                                <select
                                  name="category"
                                  value={formData.category}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                >
                                  <option value="">Select category</option>
                                  {vendorCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Business Address</label>
                              <input 
                                type="text" 
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                placeholder="Enter your business address"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium font-manrope transition-colors"
                          >
                            Cancel
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveProfile}
                            className="px-6 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 text-sm font-medium flex items-center gap-2 font-manrope transition-colors"
                          >
                            <Save size={16} strokeWidth={2.5} /> Save Changes
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Notification Preferences</h2>
                        <p className="text-gray-600 mb-4 font-manrope">Choose how you want to receive notifications</p>
                        
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3 font-manrope">Email</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail size={16} strokeWidth={2.5} className="text-gray-500" />
                                <span className="text-gray-900 font-manrope">Email Notifications</span>
                              </div>
                              <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                <input 
                                  type="checkbox" 
                                  id="email-toggle" 
                                  checked={notificationSettings.email}
                                  onChange={() => handleNotificationToggle('email')}
                                  className="sr-only"
                                />
                                <label 
                                  htmlFor="email-toggle"
                                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                    notificationSettings.email ? 'bg-[#6cff]' : 'bg-gray-300'
                                  }`}
                                >
                                  <span 
                                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                      notificationSettings.email ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                  ></span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3 font-manrope">WhatsApp</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare size={16} strokeWidth={2.5} className="text-gray-500" />
                                <span className="text-gray-900 font-manrope">WhatsApp Notifications</span>
                              </div>
                              <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                <input 
                                  type="checkbox" 
                                  id="whatsapp-toggle" 
                                  checked={notificationSettings.whatsapp}
                                  onChange={() => handleNotificationToggle('whatsapp')}
                                  className="sr-only"
                                />
                                <label 
                                  htmlFor="whatsapp-toggle"
                                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                    notificationSettings.whatsapp ? 'bg-[#6cff]' : 'bg-gray-300'
                                  }`}
                                >
                                  <span 
                                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                      notificationSettings.whatsapp ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                                  ></span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Account Actions</h2>
                        <div className="space-y-3">
                          <button
                            onClick={() => alert("Password reset email sent!")}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 border border-gray-200 font-manrope"
                          >
                            Reset Password
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 border border-red-200 font-manrope"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorProfilePage;