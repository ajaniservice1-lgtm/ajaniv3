import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  List,
  Users,
  CalendarCheck,
  Star,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  X,
  Save,
  Building,
  MapPin,
  Type,
  FileText,
  Package,
  Briefcase,
  TrendingUp,
  Camera,
  DollarSign,
  BarChart3,
  Activity,
  Mail,
  Phone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
  MoreVertical,
  User,
  Settings,
  LogOut,
  ChevronRight,
  PieChart,
  TrendingDown,
  Bell,
  MessageSquare,
  ChevronDown,
  Clock,
  Award,
  HelpCircle,
  ShoppingBag,
  Receipt
} from "lucide-react";
import Logo from "../assets/Logos/logo5.png";
import { motion, AnimatePresence } from "framer-motion";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Business Data States
  const [listings, setListings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [businessBookings, setBusinessBookings] = useState([]); // Bookings TO vendor's business
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeListings: 0,
    totalBookings: 0,
    averageRating: 0,
    monthlyGrowth: 0,
    pendingBookings: 0
  });
  
  // Modal States
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  
  // Form States
  const [newListing, setNewListing] = useState({
    name: "",
    category: "",
    price: "",
    priceType: "",
    description: "",
    location: "",
    amenities: [],
    images: []
  });
  const [currentAmenity, setCurrentAmenity] = useState("");
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Notification States
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking',
      message: 'John Doe booked your "Luxury Villa" for 3 nights',
      time: '5 min ago',
      read: false,
      icon: CalendarCheck
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

  // Business-Focused Tabs Only
  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "listings", label: "Listings", icon: List },
    { id: "customers", label: "Customers", icon: Users },
    { id: "bookings", label: "Business Bookings", icon: CalendarCheck },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "performance", label: "Performance", icon: Activity }
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
    setBlurContent(showNotifications || showProfileMenu || showAddListingModal || showExportModal);
  }, [showNotifications, showProfileMenu, showAddListingModal, showExportModal]);

  // --- FUNCTION DEFINITIONS START HERE ---

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Load user data
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
      
      // Load business listings
      const savedListings = localStorage.getItem("businessListings") || "[]";
      const parsedListings = JSON.parse(savedListings);
      
      // Filter listings to show only this vendor's listings
      const vendorListings = parsedListings.filter(listing => 
        listing.vendorId === parsedProfile.id || listing.vendorId === parsedProfile.vendorId
      );
      
      setListings(vendorListings);
      
      // Load customers from bookings
      const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
      
      // Filter business bookings (bookings TO this vendor's listings)
      const vendorBusinessBookings = allBookings.filter(booking => {
        // Check if booking is made TO this vendor's business
        const isBusinessBooking = (
          booking.bookedBy?.isVendor === false && // Made by customer (not vendor)
          booking.vendor?.id === parsedProfile.vendorId // To this vendor's business
        );
        
        // OR if it's an older format booking
        const isOldFormatBusinessBooking = (
          booking.vendorId === parsedProfile.vendorId ||
          booking.businessId === parsedProfile.vendorId
        );
        
        return isBusinessBooking || isOldFormatBusinessBooking;
      });
      
      setBusinessBookings(vendorBusinessBookings);
      
      // Extract unique customers from business bookings
      const uniqueCustomers = [];
      const customerMap = new Map();
      
      vendorBusinessBookings.forEach(booking => {
        const customerEmail = booking.bookedBy?.userEmail || booking.customerEmail;
        const customerName = booking.bookedBy?.userName || booking.customerName;
        
        if (customerEmail && !customerMap.has(customerEmail)) {
          customerMap.set(customerEmail, true);
          uniqueCustomers.push({
            id: customerEmail,
            name: customerName || "Customer",
            email: customerEmail,
            totalBookings: vendorBusinessBookings.filter(b => 
              (b.bookedBy?.userEmail === customerEmail) || (b.customerEmail === customerEmail)
            ).length,
            totalSpent: vendorBusinessBookings
              .filter(b => (b.bookedBy?.userEmail === customerEmail) || (b.customerEmail === customerEmail))
              .reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0),
            lastBooking: vendorBusinessBookings
              .filter(b => (b.bookedBy?.userEmail === customerEmail) || (b.customerEmail === customerEmail))
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt
          });
        }
      });
      
      setCustomers(uniqueCustomers);
      
      // Calculate business stats
      const totalRevenue = vendorBusinessBookings.reduce((sum, booking) => 
        sum + (parseFloat(booking.totalAmount) || 0), 0
      );
      
      const activeBookings = vendorBusinessBookings.filter(b => 
        b.status === 'confirmed' || b.status === 'active'
      ).length;
      
      const pendingBookings = vendorBusinessBookings.filter(b => 
        b.status === 'pending'
      ).length;
      
      const totalBookings = vendorBusinessBookings.length;
      
      setStats({
        totalRevenue,
        activeListings: vendorListings.length,
        totalBookings,
        averageRating: 4.5, // This would come from reviews
        monthlyGrowth: 12.5, // This would be calculated
        pendingBookings
      });
      
      // Update localStorage with filtered data for this vendor
      localStorage.setItem(`vendor_${parsedProfile.id}_bookings`, JSON.stringify(vendorBusinessBookings));
      localStorage.setItem(`vendor_${parsedProfile.id}_customers`, JSON.stringify(uniqueCustomers));
      
    } catch (error) {
      console.error("Error loading business data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = () => {
    if (currentAmenity.trim()) {
      setNewListing({
        ...newListing,
        amenities: [...newListing.amenities, currentAmenity.trim()]
      });
      setCurrentAmenity("");
    }
  };

  const handleRemoveAmenity = (index) => {
    const updatedAmenities = [...newListing.amenities];
    updatedAmenities.splice(index, 1);
    setNewListing({
      ...newListing,
      amenities: updatedAmenities
    });
  };

  const resetListingForm = () => {
    setNewListing({
      name: "",
      category: "",
      price: "",
      priceType: "",
      description: "",
      location: "",
      amenities: [],
      images: []
    });
    setCurrentAmenity("");
  };

  const handleOpenAddListingModal = () => {
    resetListingForm();
    setShowAddListingModal(true);
  };

  const handleCloseAddListingModal = () => {
    setShowAddListingModal(false);
    resetListingForm();
  };

  const handleAddListing = async () => {
    if (!newListing.name || !newListing.price || !newListing.location) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      const listing = {
        id: Date.now().toString(),
        ...newListing,
        vendorId: userData?.id,
        businessId: userData?.vendorId,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedListings = [...listings, listing];
      setListings(updatedListings);
      
      // Save to business listings
      localStorage.setItem("businessListings", JSON.stringify(updatedListings));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeListings: prev.activeListings + 1
      }));
      
      handleCloseAddListingModal();
      alert("Listing added successfully!");
      
    } catch (error) {
      console.error("Error adding listing:", error);
      alert("Failed to add listing. Please try again.");
    }
  };

  const handleUpdateListing = async (id, updates) => {
    try {
      const updatedListings = listings.map(listing => 
        listing.id === id ? { ...listing, ...updates, updatedAt: new Date().toISOString() } : listing
      );
      
      setListings(updatedListings);
      localStorage.setItem("businessListings", JSON.stringify(updatedListings));
      
      alert("Listing updated successfully!");
      
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing.");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    
    try {
      const updatedListings = listings.filter(listing => listing.id !== id);
      setListings(updatedListings);
      localStorage.setItem("businessListings", JSON.stringify(updatedListings));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeListings: Math.max(0, prev.activeListings - 1)
      }));
      
      alert("Listing deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing.");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      // Update in business bookings
      const updatedBusinessBookings = businessBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
      );
      
      setBusinessBookings(updatedBusinessBookings);
      
      // Also update in all bookings storage
      const allBookings = JSON.parse(localStorage.getItem("allBookings") || "[]");
      const updatedAllBookings = allBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status, updatedAt: new Date().toISOString() } : booking
      );
      
      localStorage.setItem("allBookings", JSON.stringify(updatedAllBookings));
      
      // Update vendor-specific storage
      if (userData?.id) {
        localStorage.setItem(`vendor_${userData.id}_bookings`, JSON.stringify(updatedBusinessBookings));
      }
      
      alert(`Booking ${status} successfully!`);
      
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status.");
    }
  };

  const exportData = (type) => {
    try {
      let data, filename;
      
      switch(type) {
        case 'bookings':
          data = businessBookings;
          filename = `business_bookings_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'listings':
          data = listings;
          filename = `business_listings_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'customers':
          data = customers;
          filename = `business_customers_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          return;
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`);
      
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data.");
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

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredBookings = businessBookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookedBy?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    const bookingDate = new Date(booking.createdAt);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    const matchesDate = (!startDate || bookingDate >= startDate) && 
                       (!endDate || bookingDate <= endDate);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  // --- USE EFFECT HOOKS ---

  useEffect(() => {
    loadBusinessData();
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

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading business dashboard...</p>
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
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search dashboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '250px' }}
            />
          </div>

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
                      onClick={() => navigate("/vendor/notifications")}
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
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
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
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
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
                        navigate("/vendor/profile");
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <User size={16} className="text-gray-600" />
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate("/vendor/settings");
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
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Business Dashboard</h2>
              <p className="text-sm text-gray-600">{userData?.businessName || userData?.vendor?.businessName || "Your Business"}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                Vendor Account
              </span>
            </div>
            
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
                    {tab.id === "bookings" && businessBookings.length > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {businessBookings.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleOpenAddListingModal}
                  className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Add Listing
                </button>
                <button
                  onClick={() => setShowExportModal(true)}
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
                <button
                  onClick={() => navigate("/vendor/personal-bookings")}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <ShoppingBag size={16} className="mr-2" />
                  My Personal Bookings
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200 ${
          blurContent ? 'blur-sm pointer-events-none' : ''
        }`}>
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Overview Tab Content */}
              {activeTab === "overview" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                        <DollarSign size={20} className="text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</div>
                      <div className="mt-2 text-sm flex items-center">
                        <TrendingUp size={14} className="text-green-500 mr-1" />
                        <span className="text-green-600">{stats.monthlyGrowth}% this month</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Active Listings</h3>
                        <List size={20} className="text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stats.activeListings}</div>
                      <div className="mt-2 text-sm text-gray-600">Available for booking</div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Business Bookings</h3>
                        <CalendarCheck size={20} className="text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
                      <div className="mt-2 text-sm">
                        <span className="text-yellow-600">{stats.pendingBookings} pending</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Avg. Rating</h3>
                        <Star size={20} className="text-yellow-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                      <div className="mt-2 text-sm text-gray-600">Based on customer reviews</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">Recent Business Bookings</h2>
                      <button 
                        onClick={() => setActiveTab("bookings")}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {businessBookings.slice(0, 5).map(booking => (
                        <div key={booking.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CalendarCheck size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.bookedBy?.userName || booking.customerName || "Customer"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Booked {booking.vendor?.name || "your service"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₦{(booking.totalAmount || 0).toLocaleString()}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Listings Tab Content */}
              {activeTab === "listings" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Business Listings</h1>
                      <p className="text-gray-600">Manage your properties and services</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search listings..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                      <button
                        onClick={handleOpenAddListingModal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Listing
                      </button>
                    </div>
                  </div>
                  
                  {filteredListings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                      <List size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Listings Found</h3>
                      <p className="text-gray-600 mb-6">Get started by adding your first listing</p>
                      <button
                        onClick={handleOpenAddListingModal}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Your First Listing
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredListings.map(listing => (
                        <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{listing.name}</h3>
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <MapPin size={14} className="mr-1" />
                                  {listing.location}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                listing.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {listing.status}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>
                            
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-2xl font-bold text-gray-900">{listing.price}</div>
                                <div className="text-sm text-gray-600">Per night</div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center text-yellow-500">
                                  <Star size={16} className="fill-current" />
                                  <span className="ml-1 font-medium">4.8</span>
                                </div>
                                <div className="text-sm text-gray-600">(24 reviews)</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/listing/${listing.id}`)}
                                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => setSelectedListing(listing)}
                                  className="px-3 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                                >
                                  Edit
                                </button>
                              </div>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Customers Tab Content */}
              {activeTab === "customers" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                      <p className="text-gray-600">Customers who booked your services</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search customers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Booking</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customers.map(customer => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                    <User size={20} className="text-gray-400" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="font-medium text-gray-900">{customer.name}</div>
                                    <div className="text-sm text-gray-600">{customer.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-900">{customer.totalBookings || 0}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">₦{(customer.totalSpent || 0).toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {customer.lastBooking ? new Date(customer.lastBooking).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => navigate(`/vendor/customers/${customer.id}`)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* Business Bookings Tab */}
              {activeTab === "bookings" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Business Bookings</h1>
                      <p className="text-gray-600">Bookings made to your business listings</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button
                        onClick={() => navigate("/vendor/personal-bookings")}
                        className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                      >
                        View My Personal Bookings
                      </button>
                    </div>
                  </div>
                  
                  {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                      <CalendarCheck size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Business Bookings</h3>
                      <p className="text-gray-600 mb-4">You don't have any bookings for your business yet</p>
                      <div className="space-y-3">
                        <button
                          onClick={() => navigate("/vendor/personal-bookings")}
                          className="block w-full max-w-xs mx-auto px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                        >
                          View My Personal Bookings
                        </button>
                        <p className="text-sm text-gray-500">
                          Personal bookings are bookings you made to other vendors' services
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service/Listing</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredBookings.map(booking => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{booking.id.substring(0, 8)}...</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">
                                    {booking.bookedBy?.userName || booking.customerName || "Customer"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {booking.bookedBy?.userEmail || booking.customerEmail || "No email"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-gray-900">{booking.vendor?.name || "Your Service"}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {booking.details?.checkIn ? 
                                      `${new Date(booking.details.checkIn).toLocaleDateString()} - ${new Date(booking.details.checkOut).toLocaleDateString()}` :
                                      booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'
                                    }
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">₦{(booking.totalAmount || 0).toLocaleString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => navigate(`/vendor/bookings/${booking.id}`)}
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      View
                                    </button>
                                    {booking.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                          className="text-green-600 hover:text-green-800 text-sm"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                          className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Analytics Tab */}
              {activeTab === "analytics" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4">Revenue Trend</h3>
                      <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded">
                        <p className="text-gray-500">Revenue chart will appear here</p>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4">Booking Trends</h3>
                      <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded">
                        <p className="text-gray-500">Booking chart will appear here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Tab */}
              {activeTab === "performance" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Performance</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm text-gray-500 mb-2">Conversion Rate</h3>
                        <div className="text-2xl font-bold text-gray-900">24.5%</div>
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          +2.3% from last month
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm text-gray-500 mb-2">Avg. Occupancy</h3>
                        <div className="text-2xl font-bold text-gray-900">78%</div>
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <TrendingUp size={14} className="mr-1" />
                          +5% from last month
                        </div>
                      </div>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-sm text-gray-500 mb-2">Customer Satisfaction</h3>
                        <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                        <div className="mt-2 text-sm text-gray-600">Based on 128 reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Add Listing Modal */}
      <AnimatePresence>
        {showAddListingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Listing</h2>
                <button
                  onClick={handleCloseAddListingModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Name *</label>
                  <input
                    type="text"
                    value={newListing.name}
                    onChange={(e) => setNewListing({...newListing, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter listing name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={newListing.category}
                      onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="hotel">Hotel</option>
                      <option value="shortlet">Shortlet</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="event">Event Center</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <div className="flex">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-3 flex items-center">
                        ₦
                      </span>
                      <input
                        type="number"
                        value={newListing.price}
                        onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter price"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={newListing.location}
                    onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your listing..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentAmenity}
                      onChange={(e) => setCurrentAmenity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add amenity and press Enter"
                    />
                    <button
                      onClick={handleAddAmenity}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newListing.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1"
                      >
                        {amenity}
                        <button
                          onClick={() => handleRemoveAmenity(index)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={handleCloseAddListingModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddListing}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={16} /> Save Listing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Export Data</h2>
              <p className="text-gray-600 mb-6">Select the data you want to export:</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => exportData('bookings')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">Business Bookings</div>
                    <div className="text-sm text-gray-600">Export bookings made to your business</div>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => exportData('listings')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">Listings</div>
                    <div className="text-sm text-gray-600">Export all listing data</div>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => exportData('customers')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">Customers</div>
                    <div className="text-sm text-gray-600">Export customer information</div>
                  </div>
                  <Download size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorDashboard;