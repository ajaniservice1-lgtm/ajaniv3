import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Home,
  Calendar,
  Star,
  Heart,
  Settings,
  Save,
  Camera,
  Edit3,
  X,
  LogOut,
  Bell,
  Shield,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Download,
  ChevronRight,
  Package,
  Award,
  Users,
  Clock,
  BarChart3,
  PieChart,
  MessageSquare,
  ChevronDown,
  HelpCircle,
  ShoppingBag,
  Receipt,
  CalendarDays,
  Hotel,
  Utensils,
  Wrench,
  CalendarCheck,
  List,
  Bed,
  Home as HomeIcon,
  Briefcase as BriefcaseIcon
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

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return "N/A";
  }
};

// Helper function to format price
const formatPrice = (price) => {
  if (!price && price !== 0) return "₦ --";
  const num = typeof price === 'number' ? price : parseInt(price.toString().replace(/[^\d]/g, ""));
  if (isNaN(num)) return "₦ --";
  return `₦${num.toLocaleString()}`;
};

// Booking categories with icons
const bookingCategories = [
  { id: "hotel", label: "Hotels", icon: Bed, color: "blue" },
  { id: "shortlet", label: "Shortlets", icon: HomeIcon, color: "purple" },
  { id: "restaurant", label: "Restaurants", icon: Utensils, color: "green" },
  { id: "event", label: "Events", icon: CalendarDays, color: "orange" },
  { id: "service", label: "Services", icon: BriefcaseIcon, color: "indigo" }
];

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Personal Profile Data
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    bio: ""
  });
  
  // Business Info
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    category: "",
    registrationNumber: "",
    taxId: "",
    established: "",
    description: ""
  });
  
  // Personal Bookings (bookings made BY the vendor to other vendors)
  const [personalBookings, setPersonalBookings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  
  // Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    bookingAlerts: true,
    reviewAlerts: true
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    showBookings: false
  });
  
  // Security
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    deviceManagement: true
  });

  // Notification States
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking',
      message: 'John Doe booked your "Luxury Villa" for 3 nights',
      time: '5 min ago',
      read: false,
      icon: Calendar
    },
    {
      id: 2,
      type: 'review',
      title: 'New Review',
      message: 'Sarah Johnson gave you 5-star rating',
      time: '1 hour ago',
      read: false,
      icon: Star
    },
    {
      id: 3,
      type: 'message',
      title: 'New Message',
      message: 'Mike requested more information about your restaurant',
      time: '2 hours ago',
      read: true,
      icon: MessageSquare
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'New dashboard features are now available',
      time: '1 day ago',
      read: true,
      icon: Settings
    }
  ]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [blurContent, setBlurContent] = useState(false);
  
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Profile-Focused Tabs
  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "personal-bookings", label: "My Personal Bookings", icon: ShoppingBag },
    { id: "business-bookings", label: "Business Bookings", icon: CalendarCheck },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Calculate unread notifications
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update blur content state
  useEffect(() => {
    setBlurContent(showNotifications || showProfileMenu);
  }, [showNotifications, showProfileMenu]);

  useEffect(() => {
    loadProfileData();
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

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile from localStorage
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        navigate("/login");
        return;
      }
      
      const parsedProfile = JSON.parse(userProfile);
      setUserData(parsedProfile);
      
      // Set personal profile form data
      setProfileForm({
        firstName: parsedProfile.firstName || "",
        lastName: parsedProfile.lastName || "",
        email: parsedProfile.email || "",
        phone: parsedProfile.phone || "",
        address: parsedProfile.address || "",
        city: parsedProfile.city || "",
        state: parsedProfile.state || "",
        country: parsedProfile.country || "",
        bio: parsedProfile.bio || ""
      });
      
      // Set business info
      setBusinessInfo({
        name: parsedProfile.businessName || "",
        category: parsedProfile.businessCategory || "",
        registrationNumber: parsedProfile.registrationNumber || "",
        taxId: parsedProfile.taxId || "",
        established: parsedProfile.established || "",
        description: parsedProfile.businessDescription || ""
      });
      
      // Load personal bookings (bookings made BY this vendor)
      const vendorPersonalBookingsData = localStorage.getItem("vendorPersonalBookings");
      
      if (vendorPersonalBookingsData) {
        const parsedPersonalBookings = JSON.parse(vendorPersonalBookingsData);
        setPersonalBookings(parsedPersonalBookings);
      } else {
        const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
        
        const vendorPersonalBookings = allBookings.filter(booking => {
          return booking.bookedBy?.isVendor === true && 
                 booking.bookedBy?.userId === parsedProfile.id;
        });
        
        setPersonalBookings(vendorPersonalBookings);
        localStorage.setItem("vendorPersonalBookings", JSON.stringify(vendorPersonalBookings));
      }
      
      // Load saved listings
      const savedListingsData = localStorage.getItem("savedListings") || "[]";
      setSavedListings(JSON.parse(savedListingsData));
      
      // Load settings
      const savedNotifications = localStorage.getItem("notificationSettings");
      const savedPrivacy = localStorage.getItem("privacySettings");
      const savedSecurity = localStorage.getItem("securitySettings");
      
      if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
      if (savedPrivacy) setPrivacySettings(JSON.parse(savedPrivacy));
      if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity));
      
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!profileForm.firstName || !profileForm.email) {
        alert("First name and email are required");
        return;
      }
      
      const updatedUserData = {
        ...userData,
        ...profileForm,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      
      window.dispatchEvent(new Event("storage"));
      
      setIsEditing(false);
      alert("Profile updated successfully!");
      
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleSaveSettings = (type) => {
    try {
      switch(type) {
        case 'notifications':
          localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
          break;
        case 'privacy':
          localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
          break;
        case 'security':
          localStorage.setItem("securitySettings", JSON.stringify(securitySettings));
          break;
      }
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    setNotifications(updatedNotifications);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setShowProfileMenu(false);
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (!showProfileMenu) {
      setShowNotifications(false);
    }
  };

  const handleChangePassword = () => {
    alert("Password change functionality would be implemented here");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("vendorPersonalBookings");
      navigate("/");
      alert("Account deleted successfully");
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        profile: profileForm,
        businessInfo,
        personalBookings,
        savedListings,
        settings: {
          notifications: notificationSettings,
          privacy: privacySettings,
          security: securitySettings
        },
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor_profile_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert("Profile data exported successfully!");
      
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  const getBookingIcon = (type) => {
    switch(type) {
      case 'hotel': return Bed;
      case 'restaurant': return Utensils;
      case 'service': return Wrench;
      case 'shortlet': return HomeIcon;
      default: return Calendar;
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewBookingDetails = (bookingId) => {
    navigate(`/booking/confirmation/${bookingId}`);
  };

  const cancelPersonalBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const updatedBookings = personalBookings.map(booking => 
          booking.id === bookingId 
            ? { 
                ...booking, 
                status: "cancelled", 
                cancelledDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : booking
        );
        
        setPersonalBookings(updatedBookings);
        localStorage.setItem("vendorPersonalBookings", JSON.stringify(updatedBookings));
        
        const userProfile = localStorage.getItem("userProfile");
        if (userProfile) {
          const parsedProfile = JSON.parse(userProfile);
          if (parsedProfile.bookings) {
            const updatedProfileBookings = parsedProfile.bookings.map(booking =>
              booking.id === bookingId 
                ? { 
                    ...booking, 
                    status: "cancelled", 
                    cancelledDate: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                : booking
            );
            
            parsedProfile.bookings = updatedProfileBookings;
            localStorage.setItem("userProfile", JSON.stringify(parsedProfile));
          }
        }
        
        alert("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6cff] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-manrope relative">
      {/* Blur overlay */}
      <AnimatePresence>
        {blurContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <X size={20} className="text-gray-600" />
            ) : (
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            )}
          </button>
          
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-8 w-auto cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications Button */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-600">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Icon size={18} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                  <span className="text-xs text-gray-500">{notification.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                                {!notification.read && (
                                  <div className="inline-flex items-center mt-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="text-xs text-blue-600">Unread</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={() => setActiveTab("activity")}
                      className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-[#6cff] flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:inline text-sm font-medium">{userData?.firstName}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#6cff] flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {userData?.firstName} {userData?.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{userData?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Vendor
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/vendor/dashboard");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <BarChart3 size={16} className="text-gray-600" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <User size={16} className="text-gray-600" />
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab("settings");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <Settings size={16} className="text-gray-600" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate("/help");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <HelpCircle size={16} className="text-gray-600" />
                      <span className="text-sm font-medium">Help & Support</span>
                    </button>
                    
                    <div className="my-2 border-t border-gray-200"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 text-left"
                    >
                      <LogOut size={16} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'} md:translate-x-0 md:w-64 bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative h-[calc(100vh-65px)] z-30 overflow-y-auto`}>
          <div className="p-4">
            {/* Profile Summary */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-[#6cff] flex items-center justify-center">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {profileForm.firstName} {profileForm.lastName}
                </h3>
                <p className="text-sm text-gray-600 truncate">{profileForm.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Vendor
                </span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {tab.id === "personal-bookings" && personalBookings.length > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {personalBookings.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Quick Book Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Book</h3>
              <div className="space-y-2">
                {bookingCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/${category.id}`)}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <category.icon size={16} className={`mr-2 text-${category.color}-500`} />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Home size={16} className="mr-2" />
                  Home
                </button>
                <button
                  onClick={() => navigate("/explore")}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Search size={16} className="mr-2" />
                  Explore
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Download size={16} className="mr-2" />
                  Export Data
                </button>
                <button
                  onClick={() => navigate("/vendor/notifications")}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg relative"
                >
                  <Bell size={16} className="mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200 ${
          blurContent ? 'blur-sm pointer-events-none' : ''
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Welcome Header */}
                  <div className="bg-[#6cff] rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                          Welcome back, {profileForm.firstName}!
                        </h1>
                        <p className="text-white/90">Your vendor dashboard</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <Edit3 size={16} />
                        Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Bookings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CalendarCheck size={20} className="text-blue-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">Personal Bookings</h3>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">{personalBookings.length}</div>
                    </div>
                    
                    {/* Business Status Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Building size={20} className="text-green-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">Business Status</h3>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">Active</div>
                    </div>
                    
                    {/* Member Since Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Award size={20} className="text-yellow-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">Member Since</h3>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        {userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}
                      </div>
                    </div>

                    {/* Saved Items Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Heart size={20} className="text-purple-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">Saved Items</h3>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">{savedListings.length}</div>
                    </div>
                  </div>

                  {/* Recent Personal Bookings */}
                  {personalBookings.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Recent Personal Bookings</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Booking</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Vendor</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Amount</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {personalBookings.slice(0, 5).map((booking) => {
                              const Icon = getBookingIcon(booking.type);
                              return (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                  <td className="p-4">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        <Icon size={18} className="text-blue-600" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {booking.type?.charAt(0).toUpperCase() + booking.type?.slice(1)} Booking
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          Ref: {booking.reference || booking.id.substring(0, 8)}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-medium text-gray-900">{booking.vendor?.name || "Vendor"}</div>
                                    <div className="text-sm text-gray-600">
                                      {formatLocation(booking.vendor?.location) || "Location"}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                      {booking.status || "Pending"}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-medium text-gray-900">{formatPrice(booking.details?.totalAmount)}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => viewBookingDetails(booking.id)}
                                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50"
                                      >
                                        View
                                      </button>
                                      {booking.status === 'confirmed' && (
                                        <button
                                          onClick={() => cancelPersonalBooking(booking.id)}
                                          className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {personalBookings.length > 5 && (
                        <div className="p-4 border-t border-gray-200">
                          <button
                            onClick={() => setActiveTab("personal-bookings")}
                            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View All {personalBookings.length} Bookings →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Booking Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookingCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => navigate(`/${category.id}`)}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                            <category.icon size={24} className={`text-${category.color}-600`} />
                          </div>
                          <h3 className="font-bold text-gray-900">{category.label}</h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {category.id === 'hotel' && "Find and book the perfect hotel for your stay"}
                          {category.id === 'shortlet' && "Discover amazing short-term rental properties"}
                          {category.id === 'restaurant' && "Reserve tables at top restaurants"}
                          {category.id === 'event' && "Book venues and plan your events"}
                          {category.id === 'service' && "Find professional services for your needs"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Bookings Tab */}
              {activeTab === "personal-bookings" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">My Personal Bookings</h2>
                        <p className="text-gray-600">Bookings you made to other vendors' services</p>
                      </div>
                      <button
                        onClick={() => navigate("/vendor/dashboard?tab=bookings")}
                        className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                      >
                        View Business Bookings
                      </button>
                    </div>
                  </div>

                  {/* Bookings by Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookingCategories.map((category) => {
                      const categoryBookings = personalBookings.filter(b => 
                        b.type?.toLowerCase() === category.id || 
                        (category.id === 'event' && b.type?.toLowerCase() === 'event center')
                      );
                      
                      return (
                        <div 
                          key={category.id}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 bg-${category.color}-100 rounded-lg`}>
                                <category.icon size={20} className={`text-${category.color}-600`} />
                              </div>
                              <h3 className="font-bold text-gray-900">{category.label}</h3>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{categoryBookings.length}</span>
                          </div>
                          {categoryBookings.length > 0 ? (
                            <div className="space-y-3">
                              {categoryBookings.slice(0, 3).map((booking) => (
                                <div key={booking.id} className="p-3 border border-gray-200 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">
                                        {booking.vendor?.name || "Unknown Vendor"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(booking.date)}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {categoryBookings.length > 3 && (
                                <button 
                                  onClick={() => setActiveTab("personal-bookings")}
                                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View {categoryBookings.length - 3} more →
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">No {category.label.toLowerCase()} bookings yet</p>
                              <button
                                onClick={() => navigate(`/${category.id}`)}
                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Book {category.label} →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* All Personal Bookings Table */}
                  {personalBookings.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">All Personal Bookings ({personalBookings.length})</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Booking</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Vendor</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Status</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Amount</th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {personalBookings.map((booking) => {
                              const Icon = getBookingIcon(booking.type);
                              return (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                  <td className="p-4">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        <Icon size={18} className="text-blue-600" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {booking.type?.charAt(0).toUpperCase() + booking.type?.slice(1)} Booking
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          Ref: {booking.reference || booking.id.substring(0, 8)}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-medium text-gray-900">{booking.vendor?.name || "Vendor"}</div>
                                    <div className="text-sm text-gray-600">
                                      {formatLocation(booking.vendor?.location) || "Location"}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                      {booking.status || "Pending"}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="font-medium text-gray-900">{formatPrice(booking.details?.totalAmount)}</div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => viewBookingDetails(booking.id)}
                                        className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50"
                                      >
                                        View Details
                                      </button>
                                      {booking.status === 'confirmed' && (
                                        <button
                                          onClick={() => cancelPersonalBooking(booking.id)}
                                          className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded-lg hover:bg-red-50"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Note about Bookings</h3>
                      <p className="text-sm text-gray-600">
                        • <strong>Personal Bookings</strong>: Bookings you made to other vendors' services
                        <br />
                        • <strong>Business Bookings</strong>: Bookings made by customers to your services
                        <br />
                        <span className="text-xs text-gray-500 mt-2 block">
                          View your business bookings in the Vendor Dashboard
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Bookings Tab */}
              {activeTab === "business-bookings" && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Business Bookings</h1>
                        <p className="text-gray-600">Bookings made by customers to your business</p>
                      </div>
                      <button
                        onClick={() => navigate("/vendor/dashboard?tab=bookings")}
                        className="px-4 py-2 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                      >
                        Go to Business Dashboard
                      </button>
                    </div>
                    
                    <div className="text-center py-12">
                      <CalendarCheck size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Business Bookings in Dashboard</h3>
                      <p className="text-gray-600 mb-6">
                        Your business bookings are managed in the Vendor Dashboard for better business analytics
                      </p>
                      <button
                        onClick={() => navigate("/vendor/dashboard?tab=bookings")}
                        className="px-6 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                      >
                        Go to Business Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                      <p className="text-sm text-gray-600 mt-1">Manage your account and preferences</p>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-6">
                        {/* Profile Photo */}
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                              {userData?.avatar ? (
                                <img src={userData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User size={40} className="text-gray-400" />
                              )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-[#6cff] text-white rounded-full p-2 cursor-pointer hover:opacity-90">
                              <Camera size={16} />
                              <input type="file" accept="image/*" className="hidden" />
                            </label>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Upload a profile photo</p>
                            <p className="text-xs text-gray-500">Recommended: Square image, max 2MB</p>
                          </div>
                        </div>
                        
                        {/* Personal Information Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter first name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter last name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                            <input
                              type="email"
                              value={profileForm.email}
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                            />
                            <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter phone number"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                              value={profileForm.bio}
                              onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                              rows="3"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Tell us about yourself..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              value={profileForm.city}
                              onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter city"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input
                              type="text"
                              value={profileForm.country}
                              onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter country"
                            />
                          </div>
                        </div>
                        
                        {/* Business Information */}
                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Business Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                              <input
                                type="text"
                                value={businessInfo.name}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                              <input
                                type="text"
                                value={businessInfo.category}
                                readOnly
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                              />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-4">
                            Business information can be edited in the{' '}
                            <button
                              onClick={() => navigate("/vendor/dashboard")}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Business Dashboard
                            </button>
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                          >
                            <Save size={16} />
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="space-y-6">
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                              <p className="text-gray-900">
                                {profileForm.firstName} {profileForm.lastName}
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <p className="text-gray-900">{profileForm.email}</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <p className="text-gray-900">{profileForm.phone || "Not provided"}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                              <p className="text-gray-900">
                                {[profileForm.city, profileForm.state, profileForm.country]
                                  .filter(Boolean)
                                  .join(', ') || "Not provided"}
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                              <p className="text-gray-900">
                                {userData?.createdAt ? formatDate(userData.createdAt) : "N/A"}
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                              <p className="text-gray-900">
                                <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  Vendor
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bio */}
                        {profileForm.bio && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <p className="text-gray-900 whitespace-pre-line">{profileForm.bio}</p>
                          </div>
                        )}
                        
                        {/* Business Info */}
                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Business Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                              <p className="text-gray-900">{businessInfo.name || "Not set"}</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <p className="text-gray-900">{businessInfo.category || "Not set"}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-200">
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                          >
                            <Edit3 size={16} />
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Notifications */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Settings</h2>
                    <div className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </div>
                            <div className="text-sm text-gray-600">
                              {key === 'emailNotifications' && 'Receive email notifications'}
                              {key === 'smsNotifications' && 'Receive SMS notifications'}
                              {key === 'marketingEmails' && 'Receive marketing emails'}
                              {key === 'bookingAlerts' && 'Get alerts for new bookings'}
                              {key === 'reviewAlerts' && 'Get alerts for new reviews'}
                            </div>
                          </div>
                          <button
                            onClick={() => setNotificationSettings({
                              ...notificationSettings,
                              [key]: !value
                            })}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              value ? 'bg-[#6cff]' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() => handleSaveSettings('notifications')}
                        className="px-4 py-2 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                      >
                        Save Notification Settings
                      </button>
                    </div>
                  </div>
                  
                  {/* Account Actions */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h2>
                    <div className="space-y-3">
                      <button
                        onClick={handleExportData}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 border border-gray-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">Export Data</div>
                          <div className="text-sm text-gray-600">Download all your personal data</div>
                        </div>
                        <Download size={20} className="text-gray-400" />
                      </button>
                      
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600 border border-red-200"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs remain similar... */}
              {activeTab === "saved" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Saved Items</h2>
                  <p className="text-gray-600 mb-6">Your saved listings and services</p>
                  
                  {savedListings.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Saved Items</h3>
                      <p className="text-gray-600 mb-6">Save listings you're interested in for quick access later</p>
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                      >
                        Browse Services
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedListings.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
                              <button
                                onClick={() => {
                                  const updated = savedListings.filter(i => i.id !== item.id);
                                  setSavedListings(updated);
                                  localStorage.setItem("savedListings", JSON.stringify(updated));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Reviews</h2>
                  <p className="text-gray-600 mb-6">Your reviews and ratings</p>
                  <div className="text-center py-12">
                    <Star size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't received any reviews yet.</p>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Activity Log</h2>
                  <p className="text-gray-600 mb-6">Your recent activities</p>
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Recent Activity</h3>
                    <p className="text-gray-600 mb-6">Your activity log will appear here.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default VendorProfilePage;