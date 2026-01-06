import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  List,
  Users,
  CalendarCheck,
  Star,
  Settings,
  Plus,
  CheckCircle,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Menu,
  Eye,
  Trash2,
  Mail,
  MessageSquare,
  ToggleLeft,
  ToggleRight,
  User,
  ImageIcon,
  Bell,
  Globe,
  Edit3,
  ArrowLeft,
  ArrowRight,
  X,
  Save,
  Upload,
  DollarSign,
  Building,
  MapPin,
  Phone,
  Type,
  FileText,
  Heart,
  Package,
  Briefcase,
  TrendingUp,
  CreditCard,
  Shield,
  Camera,
  ChevronDown,
  ChevronUp,
  Check,
  Moon,
  Sun,
  Lock,
  Unlock,
  Share2,
  Gift,
  Award,
  Zap,
  Compass,
  Target,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Clock,
  Calendar,
  Layers,
  Grid,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  AlertTriangle,
  Info,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Link,
  Copy,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Trash,
  Edit,
  PlusCircle,
  MinusCircle,
  EyeOff,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Headphones,
  Mic,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Send,
  Inbox,
  Archive,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  HeartCrack,
  LockKeyhole,
  LockKeyholeOpen
} from "lucide-react";
import Logo from "../assets/Logos/logo5.png";
import { motion, AnimatePresence } from "framer-motion";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [profileImage, setProfileImage] = useState("");
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    name: "",
    category: "Property",
    price: "",
    description: "",
    location: "",
    amenities: [],
    images: []
  });
  const [currentAmenity, setCurrentAmenity] = useState("");

  // Settings state
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    city: "",
    bio: ""
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: false,
    whatsapp: true,
    promotionalEmail: false,
    promotionalWhatsapp: true
  });

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "listings", label: "Listing", icon: List },
    { id: "customers", label: "Customer", icon: Users },
    { id: "bookings", label: "Booking", icon: CalendarCheck },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  useEffect(() => {
    fetchUserData();
    // Close sidebar by default on mobile
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
      const userProfile = localStorage.getItem("userProfile");
      if (!userProfile) {
        navigate("/login");
        return;
      }
      const parsedProfile = JSON.parse(userProfile);
      if (parsedProfile.role !== "vendor") {
        if (parsedProfile.vendor) {
          parsedProfile.role = "vendor";
          localStorage.setItem("userProfile", JSON.stringify(parsedProfile));
        } else {
          navigate("/");
          return;
        }
      }
      if (!parsedProfile.vendor) {
        parsedProfile.vendor = {
          category: parsedProfile.category || "",
          businessName: parsedProfile.businessName || "",
          businessAddress: parsedProfile.businessAddress || "",
          approvalStatus: "pending",
          profileCompleted: false
        };
        localStorage.setItem("userProfile", JSON.stringify(parsedProfile));
      }
      setUserData(parsedProfile);
      // Initialize profile data for settings
      const fullName = parsedProfile.firstName && parsedProfile.lastName
        ? `${parsedProfile.firstName} ${parsedProfile.lastName}`
        : parsedProfile.username || "";
      setProfileData({
        name: fullName,
        username: parsedProfile.username || parsedProfile.email || "",
        email: parsedProfile.email || "",
        city: parsedProfile.city || "",
        bio: parsedProfile.bio || "We specialize in luxury coastal properties and mountain retreats. Our properties are carefully selected to provide the best experience for our guests."
      });
      // Set profile image from localStorage or default
      setProfileImage(parsedProfile.profileImage ||
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80");
      // Initialize listings from localStorage or use default
      const savedListings = localStorage.getItem("vendorListings");
      if (savedListings) {
        setListings(JSON.parse(savedListings));
      } else {
        const defaultListings = [
          {
            id: 1,
            name: "Jagz Hotel and Suite",
            category: "Property",
            price: "₦28,000/night",
            rating: "4.8(10)",
            status: "Active",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            location: "Mokola, RD 8 Ibadan",
            amenities: ["WiFi", "Parking", "Pool", "AC"]
          },
          {
            id: 2,
            name: "Jagz Hotel and Suite",
            category: "Property",
            price: "₦28,000/night",
            rating: "4.8(10)",
            status: "Active",
            image: "https://images.unsplash.com/photo-1584132967336-9b942d726e7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            location: "Mokola, RD 8 Ibadan",
            amenities: ["WiFi", "Breakfast", "Gym", "Spa"]
          }
        ];
        setListings(defaultListings);
        localStorage.setItem("vendorListings", JSON.stringify(defaultListings));
      }
      // Initialize customers with real images
      const defaultCustomers = [
        {
          id: 1,
          name: "Samuel Rotimi",
          email: "samuel@example.com",
          bookings: 1,
          totalSpent: "#300k+",
          image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
        },
        {
          id: 2,
          name: "Sandra Adeoye",
          email: "sandra@example.com",
          bookings: 1,
          totalSpent: "#300k+",
          image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
        },
        {
          id: 3,
          name: "Bankole Cole",
          email: "bankole@example.com",
          bookings: 1,
          totalSpent: "#300k+",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
        }
      ];
      setCustomers(defaultCustomers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset all data figures to zero as requested
  const mockStats = {
    totalRevenue: 0.00,
    activeListings: 0,
    totalBookings: 0,
    averageRating: 0.0
  };

  const mockRecentBookings = [
    {
      id: 1,
      customer: "Sola Fadipe Jr.",
      service: "Iron man street",
      details: "Hotel Booking",
      product: "Product",
      status: "Completed",
      date: "Today, 10:30 am",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      orderId: "#290888880"
    },
    {
      id: 2,
      customer: "Bankole Johansson",
      service: "Bodija",
      details: "Event booking",
      product: "Event Centre",
      status: "Completed",
      date: "Today, 10:30 am",
      image: "https://images.unsplash.com/photo-1584132967336-9b942d726e7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      orderId: "#290888880"
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "Completed":
      case "Active":
        return <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">{status}</span>;
      case "Pending":
        return <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">{status}</span>;
      default:
        return <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  // Handle Add Listing Modal
  const handleOpenAddListingModal = () => {
    setNewListing({
      name: "",
      category: "Property",
      price: "",
      description: "",
      location: "",
      amenities: [],
      images: []
    });
    setShowAddListingModal(true);
  };

  const handleCloseAddListingModal = () => {
    setShowAddListingModal(false);
  };

  const handleAddAmenity = () => {
    if (currentAmenity.trim() && !newListing.amenities.includes(currentAmenity.trim())) {
      setNewListing({
        ...newListing,
        amenities: [...newListing.amenities, currentAmenity.trim()]
      });
      setCurrentAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setNewListing({
      ...newListing,
      amenities: newListing.amenities.filter(a => a !== amenity)
    });
  };

  const handleSubmitListing = () => {
    if (!newListing.name || !newListing.price || !newListing.location) {
      alert("Please fill in all required fields");
      return;
    }
    const listing = {
      id: Date.now(),
      name: newListing.name,
      category: newListing.category,
      price: `₦${parseFloat(newListing.price).toLocaleString()}/night`,
      rating: "0.0(0)",
      status: "Active",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      location: newListing.location,
      description: newListing.description,
      amenities: newListing.amenities
    };
    const updatedListings = [...listings, listing];
    setListings(updatedListings);
    localStorage.setItem("vendorListings", JSON.stringify(updatedListings));
    setShowAddListingModal(false);
    alert("Listing added successfully!");
  };

  // Handle listing actions
  const handleDeleteListing = (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      const updatedListings = listings.filter(listing => listing.id !== id);
      setListings(updatedListings);
      localStorage.setItem("vendorListings", JSON.stringify(updatedListings));
    }
  };

  const handleEditListing = (id) => {
    const listing = listings.find(l => l.id === id);
    if (listing) {
      setNewListing({
        name: listing.name,
        category: listing.category,
        price: listing.price.replace(/[^0-9.]/g, ''),
        description: listing.description || "",
        location: listing.location || "",
        amenities: listing.amenities || [],
        images: []
      });
      setShowAddListingModal(true);
    }
  };

  const handleViewListing = (id) => {
    navigate(`/listing/${id}`);
  };

  // Mobile responsive sidebar toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle profile updates
  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (type) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Handle save profile
  const handleSaveProfile = () => {
    try {
      const updatedUserData = {
        ...userData,
        firstName: profileData.name.split(' ')[0] || userData.firstName,
        lastName: profileData.name.split(' ').slice(1).join(' ') || userData.lastName,
        username: profileData.username || userData.username,
        email: profileData.email || userData.email,
        city: profileData.city || userData.city,
        bio: profileData.bio || userData.bio,
        profileImage: profileImage
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    }
  };

  // Handle profile image upload
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

  // Handle logo click to navigate to homepage
  const handleLogoClick = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-manrope">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-manrope relative">
      {/* Mobile Sidebar Overlay with Blur Effect */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* New Top Navigation Bar - Single Logo Only */}
      <div className="bg-white border-b border-blue-500 shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        {/* Left side: Menu Button (Mobile only) and Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Hidden on large screens */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <Menu size={20} strokeWidth={2.5} className="text-blue-600" />
          </button>
          
          {/* Single Logo - Only on Top Nav Bar */}
          <img 
            src={Logo} 
            alt="Ajani" 
            className="h-8 w-auto cursor-pointer hover:scale-105 transition-transform"
            onClick={handleLogoClick}
          />
          
          {/* Page Title - Always shows "Overview" */}
          <h1 className="text-xl font-bold text-gray-900 font-manrope">
            Overview
          </h1>
        </div>

        {/* Right side: Search, Settings, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Box - Hidden on mobile to save space */}
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

          {/* Settings Icon */}
          <button 
            onClick={() => setActiveTab("settings")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={20} strokeWidth={2.5} className="text-gray-600" />
          </button>

          {/* Notifications Icon */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} strokeWidth={2.5} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500">
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <main className="flex-grow pt-0">
        <div className="flex h-[calc(100vh-65px)]">
          {/* Sidebar - No Logo, No Menu Button on Large Screens */}
          <motion.aside
            initial={false}
            animate={{ 
              x: isSidebarOpen ? 0 : '-100%',
              width: isSidebarOpen ? '256px' : '0px'
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed md:relative top-0 left-0 h-full z-50 md:translate-x-0 md:w-64 bg-white border-r border-gray-200 overflow-hidden"
          >
            {/* Sidebar Header - Menu Button only on mobile */}
            <div className="p-4 flex items-center md:hidden justify-end border-b border-gray-200">
              {/* Menu Button only visible on mobile */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu size={16} strokeWidth={2.5} className="text-gray-600" />
              </button>
            </div>
            
            <nav className="mt-4 md:mt-8 space-y-1 md:space-y-2 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center w-full px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-200 ${
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
            </nav>
            
            {/* User Info at Bottom */}
            {isSidebarOpen && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover sidebar-avatar"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-900 text-sm truncate font-manrope">{userData?.firstName} {userData?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate font-manrope">{userData?.role}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Main Content */}
          <div className="flex-grow overflow-y-auto w-full">
            {/* Mobile Search - Hidden when sidebar is open */}
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
            
            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-3 md:px-4 md:px-6 py-4 md:py-8">
              {/* Tab Content with Smooth Animation */}
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
                      {/* My Cards Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Total Revenue Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Total Revenue</h3>
                            <span className="text-blue-500 text-xs md:text-sm font-semibold font-manrope">+0% from last month</span>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">₦{mockStats.totalRevenue.toFixed(2)}</div>
                        </motion.div>
                        
                        {/* Active Listing Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Active Listing</h3>
                            <span className="text-gray-400 text-xs md:text-sm font-manrope">0</span>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{mockStats.activeListings}</div>
                        </motion.div>
                        
                        {/* Total Booking Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Total Booking</h3>
                            <span className="text-blue-500 text-xs md:text-sm font-semibold font-manrope">+0 from last month</span>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{mockStats.totalBookings}</div>
                        </motion.div>
                        
                        {/* Average Rating Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 }}
                          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3 md:mb-4">
                            <h3 className="text-gray-500 font-medium text-sm md:text-base font-manrope">Average Rating</h3>
                            <span className="text-blue-500 text-xs md:text-sm font-semibold font-manrope">+0.0 from last month</span>
                          </div>
                          <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 font-manrope">{mockStats.averageRating.toFixed(1)}</div>
                        </motion.div>
                      </div>
                      
                      {/* Recent Bookings Table */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                      >
                        <div className="p-4 md:p-6 border-b border-gray-200">
                          <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Recent Bookings</h2>
                        </div>
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px] md:min-w-0">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Customer</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Service</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Details</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Status</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {mockRecentBookings.map((booking, index) => (
                                  <motion.tr 
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-2 md:gap-3">
                                        <img src={booking.image} alt={booking.customer} className="w-8 h-8 md:w-10 md:h-10 rounded-md" />
                                        <div>
                                          <div className="font-medium text-gray-900 text-sm md:text-base font-manrope">{booking.customer}</div>
                                          <div className="text-xs text-gray-500 md:hidden font-manrope">{booking.service}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-900 hidden md:table-cell font-manrope">{booking.service}</td>
                                    <td className="p-3 md:p-4 text-gray-900 hidden md:table-cell font-manrope">{booking.details}</td>
                                    <td className="p-3 md:p-4">
                                      <span className="px-2 py-1 md:px-3 md:py-1 bg-green-100 text-green-800 rounded-full text-xs md:text-sm font-manrope">
                                        {booking.status}
                                      </span>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-500 text-sm font-manrope">{booking.date}</td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* My Listings Tab */}
                  {activeTab === "listings" && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">My Listings</h2>
                            <p className="text-gray-600 text-sm font-manrope">Manage your properties and services</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOpenAddListingModal}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 font-manrope transition-colors"
                          >
                            <Plus size={16} strokeWidth={2.5} /> <span>Add Listing</span>
                          </motion.button>
                        </div>
                        <div className="relative max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={2.5} />
                          <input
                            type="text"
                            placeholder="Search Listings"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                          />
                        </div>
                      </div>
                      
                      {/* Listings Table */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px] md:min-w-0">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Listing</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Category</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Price</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope hidden md:table-cell">Rating</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Status</th>
                                  <th className="text-left p-3 md:p-4 text-xs md:text-sm font-semibold text-gray-600 font-manrope">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {listings.map((listing, index) => (
                                  <motion.tr 
                                    key={listing.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-2 md:gap-3">
                                        <img src={listing.image} alt={listing.name} className="w-10 h-10 md:w-12 md:h-12 rounded-md" />
                                        <div className="min-w-0">
                                          <div className="font-medium text-gray-900 text-sm md:text-base font-manrope truncate">{listing.name}</div>
                                          <div className="text-xs text-gray-500 font-manrope truncate">{listing.location}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 md:p-4 text-gray-600 hidden md:table-cell font-manrope">{listing.category}</td>
                                    <td className="p-3 md:p-4 text-gray-900 font-medium font-manrope">{listing.price}</td>
                                    <td className="p-3 md:p-4 hidden md:flex items-center gap-1">
                                      <Star fill="#FFD700" stroke="#FFD700" size={16} strokeWidth={2.5} />
                                      <span className="text-gray-900 font-manrope">{listing.rating}</span>
                                    </td>
                                    <td className="p-3 md:p-4">
                                      {getStatusBadge(listing.status)}
                                    </td>
                                    <td className="p-3 md:p-4">
                                      <div className="flex items-center gap-2">
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleViewListing(listing.id)}
                                          className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                          title="View"
                                        >
                                          <Eye size={16} strokeWidth={2.5} />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleEditListing(listing.id)}
                                          className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
                                          title="Edit"
                                        >
                                          <Edit3 size={16} strokeWidth={2.5} />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => handleDeleteListing(listing.id)}
                                          className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 size={16} strokeWidth={2.5} />
                                        </motion.button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customers Tab */}
                  {activeTab === "customers" && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Customers</h2>
                            <p className="text-gray-600 text-sm font-manrope">View and manage your customer relationships</p>
                          </div>
                        </div>
                        <div className="relative max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={2.5} />
                          <input
                            type="text"
                            placeholder="Search name"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                          />
                        </div>
                      </div>
                      
                      {/* Customers Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {customers.map((customer, index) => (
                          <motion.div 
                            key={customer.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3 md:gap-4 mb-4">
                              <img src={customer.image} alt={customer.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-sm md:text-base font-manrope truncate">{customer.name}</div>
                                <div className="text-xs text-gray-500 font-manrope truncate">{customer.email}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-gray-200">
                              <div>
                                <div className="text-xs md:text-sm text-gray-600 font-manrope">Bookings</div>
                                <div className="text-lg md:text-xl font-medium text-gray-900 font-manrope">{customer.bookings}</div>
                              </div>
                              <div>
                                <div className="text-xs md:text-sm text-gray-600 font-manrope">Total Spent</div>
                                <div className="text-lg md:text-xl font-medium text-gray-900 font-manrope">{customer.totalSpent}</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
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
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 font-manrope">Bookings</h2>
                            <p className="text-gray-600 text-sm font-manrope">Manage your booking requests and reservations</p>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 font-manrope transition-colors"
                          >
                            <Plus size={16} strokeWidth={2.5} /> <span className="hidden md:inline">New Booking</span>
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Recent Bookings */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <h3 className="text-base md:text-lg font-bold text-gray-900 font-manrope mb-4">Recent Bookings</h3>
                        <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 md:gap-4">
                              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Jagz Hotel" className="w-10 h-10 md:w-12 md:h-12 rounded-md" />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 text-sm md:text-base font-manrope truncate">Jagz Hotel and Suite</div>
                                <div className="text-xs md:text-sm text-gray-600 font-manrope truncate">Mokola, RD 8 Ibadan</div>
                                <div className="mt-2 flex items-center gap-2 md:gap-4">
                                  <span className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 text-gray-800 rounded-full text-xs md:text-sm font-manrope">
                                    Property
                                  </span>
                                  <span className="px-2 py-1 md:px-3 md:py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm font-manrope">
                                    Admin
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-2xl font-bold text-gray-900 font-manrope">₦28,000/night</div>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-2 md:mt-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs md:text-sm font-manrope transition-colors"
                              >
                                View Details
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === "settings" && (
                    <div className="space-y-6">
                      {/* Profile Section */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <div className="border-b border-gray-200 pb-4 mb-6">
                          <h2 className="text-lg font-bold text-gray-900 font-manrope">Edit Profile</h2>
                          <p className="text-sm text-gray-600 mt-1 font-manrope">Manage your account and preferences</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="w-20 h-20 rounded-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
                              />
                              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer group-hover:scale-110 transition-transform shadow-lg">
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
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Your Name</label>
                                <input 
                                  type="text" 
                                  value={profileData.name}
                                  onChange={(e) => handleProfileChange('name', e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">User Name</label>
                                <input 
                                  type="text" 
                                  value={profileData.username}
                                  onChange={(e) => handleProfileChange('username', e.target.value)}
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
                                  onChange={(e) => handleProfileChange('email', e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">City</label>
                                <input 
                                  type="text" 
                                  value={profileData.city}
                                  onChange={(e) => handleProfileChange('city', e.target.value)}
                                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-manrope">Bio</label>
                              <textarea 
                                rows={4}
                                value={profileData.bio}
                                onChange={(e) => handleProfileChange('bio', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope resize-none"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveProfile}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 font-manrope transition-colors"
                          >
                            <Save size={16} strokeWidth={2.5} /> Save Changes
                          </motion.button>
                        </div>
                      </motion.div>
                      
                      {/* Notifications Section */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                      >
                        <h2 className="text-lg font-bold text-gray-900 font-manrope mb-4">Notifications</h2>
                        <p className="text-gray-600 mb-4 font-manrope">How do you want to receive messages from Clients?</p>
                        
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3 font-manrope">Email</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail size={16} strokeWidth={2.5} className="text-gray-500" />
                                <span className="text-gray-900 font-manrope">Email</span>
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
                                    notificationSettings.email ? 'bg-blue-600' : 'bg-gray-300'
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
                                <span className="text-gray-900 font-manrope">WhatsApp</span>
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
                                    notificationSettings.whatsapp ? 'bg-blue-600' : 'bg-gray-300'
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
                          
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-md font-medium text-gray-900 mb-3 font-manrope">Promotional messages</h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Mail size={16} strokeWidth={2.5} className="text-gray-500" />
                                  <span className="text-gray-900 font-manrope">Email</span>
                                </div>
                                <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                  <input 
                                    type="checkbox" 
                                    id="promo-email-toggle" 
                                    checked={notificationSettings.promotionalEmail}
                                    onChange={() => handleNotificationToggle('promotionalEmail')}
                                    className="sr-only"
                                  />
                                  <label 
                                    htmlFor="promo-email-toggle"
                                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                      notificationSettings.promotionalEmail ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span 
                                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                        notificationSettings.promotionalEmail ? 'translate-x-6' : 'translate-x-0'
                                      }`}
                                    ></span>
                                  </label>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MessageSquare size={16} strokeWidth={2.5} className="text-gray-500" />
                                  <span className="text-gray-900 font-manrope">WhatsApp</span>
                                </div>
                                <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                                  <input 
                                    type="checkbox" 
                                    id="promo-whatsapp-toggle" 
                                    checked={notificationSettings.promotionalWhatsapp}
                                    onChange={() => handleNotificationToggle('promotionalWhatsapp')}
                                    className="sr-only"
                                  />
                                  <label 
                                    htmlFor="promo-whatsapp-toggle"
                                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                      notificationSettings.promotionalWhatsapp ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span 
                                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                        notificationSettings.promotionalWhatsapp ? 'translate-x-6' : 'translate-x-0'
                                      }`}
                                    ></span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
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
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 font-manrope">Add New Listing</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseAddListingModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </motion.button>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 font-manrope">
                    <Type size={16} strokeWidth={2.5} /> Listing Name *
                  </label>
                  <input
                    type="text"
                    value={newListing.name}
                    onChange={(e) => setNewListing({...newListing, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                    placeholder="Enter listing name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 font-manrope">
                    <Briefcase size={16} strokeWidth={2.5} /> Category *
                  </label>
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                  >
                    <option value="Property">Property</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Event Center">Event Center</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Service">Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 font-manrope">
                    <DollarSign size={16} strokeWidth={2.5} /> Price per Night *
                  </label>
                  <input
                    type="number"
                    value={newListing.price}
                    onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 font-manrope">
                    <MapPin size={16} strokeWidth={2.5} /> Location *
                  </label>
                  <input
                    type="text"
                    value={newListing.location}
                    onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 font-manrope">
                    <FileText size={16} strokeWidth={2.5} /> Description
                  </label>
                  <textarea
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope resize-none"
                    rows={4}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 font-manrope">
                    <Package size={16} strokeWidth={2.5} /> Amenities
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={currentAmenity}
                      onChange={(e) => setCurrentAmenity(e.target.value)}
                      className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-manrope"
                      placeholder="Add amenity"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddAmenity}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-manrope transition-colors"
                    >
                      Add
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newListing.amenities.map((amenity, index) => (
                      <motion.span 
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1 font-manrope"
                      >
                        {amenity}
                        <button
                          onClick={() => handleRemoveAmenity(amenity)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X size={12} strokeWidth={2.5} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-6 border-t border-gray-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseAddListingModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium font-manrope transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitListing}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 font-manrope transition-colors"
                >
                  <Save size={16} strokeWidth={2.5} /> Save Listing
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorDashboard;