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
  Briefcase as BriefcaseIcon,
} from "lucide-react";
import Logo from "../assets/Logos/logo5.png";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to format location
const formatLocation = (location) => {
  if (!location) return "Location available";

  if (typeof location === "string") {
    return location;
  }

  if (typeof location === "object") {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    try {
      return Object.values(location)
        .filter((value) => typeof value === "string" && value.trim().length > 0)
        .join(", ");
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

// Helper function to format price
const formatPrice = (price) => {
  if (!price && price !== 0) return "₦ --";
  const num =
    typeof price === "number"
      ? price
      : parseInt(price.toString().replace(/[^\d]/g, ""));
  if (isNaN(num)) return "₦ --";
  return `₦${num.toLocaleString()}`;
};

// Helper function to sync saved listings between different storage keys
const syncSavedListings = () => {
  try {
    const userSavedListings = JSON.parse(
      localStorage.getItem("userSavedListings") || "[]",
    );
    const savedListings = JSON.parse(
      localStorage.getItem("savedListings") || "[]",
    );

    // Merge both lists, avoiding duplicates by ID
    const allSaved = [...savedListings];
    userSavedListings.forEach((item) => {
      const existingIndex = allSaved.findIndex(
        (saved) => saved.id === item.id || saved._id === item.id,
      );
      if (existingIndex === -1) {
        allSaved.push(item);
      } else {
        // Update existing item with newer data
        allSaved[existingIndex] = { ...allSaved[existingIndex], ...item };
      }
    });

    // Save to both locations for compatibility
    localStorage.setItem("userSavedListings", JSON.stringify(allSaved));
    localStorage.setItem("savedListings", JSON.stringify(allSaved));

    return allSaved;
  } catch (error) {
    console.error("Error syncing saved listings:", error);
    return [];
  }
};

// Booking categories with icons - MATCHING BUYER UI
const bookingCategories = [
  { id: "hotel", label: "Hotels", icon: Bed, color: "blue" },
  { id: "shortlet", label: "Shortlets", icon: HomeIcon, color: "purple" },
  { id: "restaurant", label: "Restaurants", icon: Utensils, color: "green" },
  { id: "event", label: "Events", icon: CalendarDays, color: "orange" },
  { id: "service", label: "Services", icon: BriefcaseIcon, color: "indigo" },
];

// Helper functions for booking icons and status - MATCHING BUYER UI
const getBookingIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "hotel":
      return <Bed className="text-blue-500 w-4 h-4" />;
    case "shortlet":
      return <HomeIcon className="text-purple-500 w-4 h-4" />;
    case "restaurant":
      return <Utensils className="text-green-500 w-4 h-4" />;
    case "event":
    case "event center":
      return <CalendarDays className="text-orange-500 w-4 h-4" />;
    case "service":
      return <BriefcaseIcon className="text-indigo-500 w-4 h-4" />;
    default:
      return <CalendarCheck className="text-gray-500 w-4 h-4" />;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

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
    bio: "",
  });

  // Business Info
  const [businessInfo, setBusinessInfo] = useState({
    name: "",
    category: "",
    registrationNumber: "",
    taxId: "",
    established: "",
    description: "",
  });

  // Personal Bookings (bookings made BY the vendor to other vendors)
  const [personalBookings, setPersonalBookings] = useState([]);

  // Business Bookings (bookings made BY customers TO this vendor)
  const [businessBookings, setBusinessBookings] = useState([]);

  const [savedListings, setSavedListings] = useState([]);

  // Settings - MATCHING BUYER UI
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    whatsapp: true,
    promotionalEmail: false,
    promotionalWhatsapp: false,
  });

  const [profileImage, setProfileImage] = useState(null);

  // Notification States - MATCHING BUYER UI
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "booking",
      title: "New Business Booking",
      message: "John Doe booked your Luxury Villa",
      time: "5 min ago",
      read: false,
      icon: CalendarCheck,
    },
    {
      id: 2,
      type: "review",
      title: "New Review",
      message: "You received a 5-star rating",
      time: "1 hour ago",
      read: false,
      icon: Star,
    },
    {
      id: 3,
      type: "system",
      title: "System Update",
      message: "New features are now available",
      time: "1 day ago",
      read: true,
      icon: Settings,
    },
  ]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [blurContent, setBlurContent] = useState(false);

  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Profile-Focused Tabs - MATCHING BUYER UI (renamed for vendor context)
  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    {
      id: "personal-bookings",
      label: "My Personal Bookings",
      icon: CalendarCheck,
    },
    { id: "business-bookings", label: "Business Bookings", icon: Building },
    { id: "saved", label: "Saved", icon: Heart },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Calculate unread notifications
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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

    // Listen for saved listings updates from other components
    const handleSavedListingsUpdate = () => {
      loadSavedListings();
    };

    window.addEventListener("savedListingsUpdated", handleSavedListingsUpdate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "savedListingsUpdated",
        handleSavedListingsUpdate,
      );
    };
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
        bio: parsedProfile.bio || "",
      });

      // Set business info
      setBusinessInfo({
        name: parsedProfile.businessName || "",
        category: parsedProfile.businessCategory || "",
        registrationNumber: parsedProfile.registrationNumber || "",
        taxId: parsedProfile.taxId || "",
        established: parsedProfile.established || "",
        description: parsedProfile.businessDescription || "",
      });

      // Set profile image
      setProfileImage(parsedProfile.profileImage || null);

      // Load personal bookings (bookings made BY this vendor)
      const vendorPersonalBookingsData = localStorage.getItem(
        "vendorPersonalBookings",
      );

      if (vendorPersonalBookingsData) {
        const parsedPersonalBookings = JSON.parse(vendorPersonalBookingsData);
        setPersonalBookings(parsedPersonalBookings);
      } else {
        const allBookings = JSON.parse(
          localStorage.getItem("allBookings") || "[]",
        );

        const vendorPersonalBookings = allBookings.filter((booking) => {
          return (
            booking.bookedBy?.isVendor === true &&
            booking.bookedBy?.userId === parsedProfile.id
          );
        });

        setPersonalBookings(vendorPersonalBookings);
        localStorage.setItem(
          "vendorPersonalBookings",
          JSON.stringify(vendorPersonalBookings),
        );
      }

      // Load business bookings (bookings made TO this vendor's business)
      const vendorBusinessBookingsData = localStorage.getItem(
        "vendorBusinessBookings",
      );

      if (vendorBusinessBookingsData) {
        const parsedBusinessBookings = JSON.parse(vendorBusinessBookingsData);
        setBusinessBookings(parsedBusinessBookings);
      } else {
        const allBookings = JSON.parse(
          localStorage.getItem("allBookings") || "[]",
        );

        // Filter bookings where this vendor is the service provider
        const vendorBusinessBookings = allBookings.filter((booking) => {
          return (
            booking.vendor?.id === parsedProfile.id ||
            booking.vendorId === parsedProfile.id ||
            booking.businessId === parsedProfile.id
          );
        });

        setBusinessBookings(vendorBusinessBookings);
        localStorage.setItem(
          "vendorBusinessBookings",
          JSON.stringify(vendorBusinessBookings),
        );
      }

      // Load saved listings
      loadSavedListings();

      // Load settings
      const savedNotifications = localStorage.getItem(
        "vendorNotificationSettings",
      );
      if (savedNotifications)
        setNotificationSettings(JSON.parse(savedNotifications));
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedListings = () => {
    try {
      // First sync listings from different storage locations
      const allSavedListings = syncSavedListings();

      // Format saved listings to match expected structure
      const formattedSavedListings = allSavedListings.map((item) => ({
        id: item.id || item._id || `saved-${Date.now()}-${Math.random()}`,
        name: item.name || item.businessName || item.title || "Unknown Listing",
        description: item.description || item.businessDescription || "",
        price: item.price || "₦ --",
        location:
          item.location ||
          item.area ||
          item.address ||
          "Location not specified",
        category: item.category || "General",
        rating: item.rating || 4.9,
        savedDate: item.savedDate || new Date().toISOString().split("T")[0],
        image:
          item.image ||
          item.images?.[0] ||
          item.originalData?.images?.[0] ||
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
        tag: item.tag || "Guest Favorite",
        businessName: item.businessName || item.name,
      }));

      setSavedListings(formattedSavedListings);
    } catch (error) {
      console.error("Error loading saved listings:", error);
      setSavedListings([]);
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
        profileImage: profileImage,
        updatedAt: new Date().toISOString(),
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

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        "vendorNotificationSettings",
        JSON.stringify(notificationSettings),
      );
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    }
  };

  const handleNotificationToggle = (type) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.match("image.*")) {
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

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
  };

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
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
    alert("Password reset email sent!");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("vendorPersonalBookings");
      localStorage.removeItem("vendorBusinessBookings");
      localStorage.removeItem("userSavedListings");
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
        businessBookings,
        savedListings,
        settings: {
          notifications: notificationSettings,
        },
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vendor_profile_export_${new Date().toISOString().split("T")[0]}.json`;
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
    localStorage.setItem("logout_manual", "true");

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("ajani_dummy_login");

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("logout"));

    navigate("/");
    window.location.reload();
  };

  const viewBookingDetails = (bookingId) => {
    navigate(`/booking/confirmation/${bookingId}`);
  };

  const cancelPersonalBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const updatedBookings = personalBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "cancelled",
                cancelledDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : booking,
        );

        setPersonalBookings(updatedBookings);
        localStorage.setItem(
          "vendorPersonalBookings",
          JSON.stringify(updatedBookings),
        );

        alert("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking");
      }
    }
  };

  const updateBusinessBookingStatus = (bookingId, newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to mark this booking as ${newStatus}?`,
      )
    ) {
      try {
        const updatedBookings = businessBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : booking,
        );

        setBusinessBookings(updatedBookings);
        localStorage.setItem(
          "vendorBusinessBookings",
          JSON.stringify(updatedBookings),
        );

        alert(`Booking marked as ${newStatus}!`);
      } catch (error) {
        console.error("Error updating booking status:", error);
        alert("Failed to update booking status");
      }
    }
  };

  const removeSavedListing = (itemId, itemName) => {
    if (
      window.confirm(
        `Are you sure you want to remove "${itemName}" from saved items?`,
      )
    ) {
      try {
        const currentSaved = JSON.parse(
          localStorage.getItem("userSavedListings") || "[]",
        );
        const updatedSaved = currentSaved.filter(
          (item) => item.id !== itemId && item._id !== itemId,
        );

        localStorage.setItem("userSavedListings", JSON.stringify(updatedSaved));
        localStorage.setItem("savedListings", JSON.stringify(updatedSaved));

        setSavedListings(
          updatedSaved.map((item) => ({
            id: item.id || item._id,
            name: item.name || item.businessName || item.title || "Unknown",
            description: item.description || "",
            price: item.price || "₦ --",
            location: item.location || item.area || "",
            category: item.category || "General",
            rating: item.rating || 4.9,
            savedDate: item.savedDate || new Date().toISOString().split("T")[0],
            image:
              item.image ||
              item.images?.[0] ||
              "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
          })),
        );

        window.dispatchEvent(
          new CustomEvent("savedListingsUpdated", {
            detail: { action: "removed", itemId: itemId },
          }),
        );

        alert(`"${itemName}" removed from saved items!`);
      } catch (error) {
        console.error("Error removing saved item:", error);
        alert("Failed to remove item. Please try again.");
      }
    }
  };

  // Calculate stats for overview
  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  // Categorize personal bookings
  const hotelBookings = personalBookings.filter(
    (b) => b.type?.toLowerCase() === "hotel",
  );
  const shortletBookings = personalBookings.filter(
    (b) => b.type?.toLowerCase() === "shortlet",
  );
  const restaurantBookings = personalBookings.filter(
    (b) => b.type?.toLowerCase() === "restaurant",
  );
  const eventBookings = personalBookings.filter(
    (b) =>
      b.type?.toLowerCase() === "event" ||
      b.type?.toLowerCase() === "event center",
  );
  const serviceBookings = personalBookings.filter(
    (b) => b.type?.toLowerCase() === "service",
  );

  // Get recent personal bookings
  const recentPersonalBookings = [...personalBookings]
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    )
    .slice(0, 5);

  // Get recent business bookings
  const recentBusinessBookings = [...businessBookings]
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt),
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6cff] mx-auto"></div>
            <p className="mt-4 text-gray-600 font-manrope">
              Loading profile...
            </p>
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

      {/* Top Navigation - EXACTLY MATCHING BUYER UI */}
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
          {/* Notifications Button - MATCHING BUYER UI */}
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

            {/* Notifications Dropdown - MATCHING BUYER UI */}
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
                        <Bell
                          size={32}
                          className="mx-auto text-gray-300 mb-3"
                        />
                        <p className="text-gray-600">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Icon size={18} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {notification.time}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {notification.message}
                                </p>
                                {!notification.read && (
                                  <div className="inline-flex items-center mt-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="text-xs text-blue-600">
                                      Unread
                                    </span>
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

          {/* Profile Menu - MATCHING BUYER UI */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-[#6cff] flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {userData?.firstName}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Profile Dropdown Menu - MATCHING BUYER UI */}
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
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {userData?.firstName} {userData?.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {userData?.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Vendor
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setActiveTab("settings");
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
                      <span className="text-sm font-medium">
                        Help & Support
                      </span>
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
        {/* Sidebar - MATCHING BUYER UI */}
        <aside
          className={`${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"} md:translate-x-0 md:w-64 bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative h-[calc(100vh-65px)] z-30 overflow-y-auto`}
        >
          <div className="p-4">
            {/* Profile Summary - MATCHING BUYER UI */}
            <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-[#6cff] flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {profileForm.firstName} {profileForm.lastName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {profileForm.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Vendor
                </span>
              </div>
            </div>

            {/* Navigation - MATCHING BUYER UI */}
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
                    {tab.id === "personal-bookings" &&
                      personalBookings.length > 0 && (
                        <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {personalBookings.length}
                        </span>
                      )}
                    {tab.id === "business-bookings" &&
                      businessBookings.length > 0 && (
                        <span className="ml-auto bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {businessBookings.length}
                        </span>
                      )}
                    {tab.id === "saved" && savedListings.length > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {savedListings.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Book Section - MATCHING BUYER UI */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Book
              </h3>
              <div className="space-y-2">
                {bookingCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/${category.id}`)}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                  >
                    <category.icon
                      size={16}
                      className={`mr-2 text-${category.color}-500`}
                    />
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links - MATCHING BUYER UI (removed Export Data) */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Links
              </h3>
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
                  onClick={() => navigate("/saved")}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg relative"
                >
                  <Heart size={16} className="mr-2" />
                  Saved Listings
                  {savedListings.length > 0 && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {savedListings.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-200 ${
            blurContent ? "blur-sm pointer-events-none" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* OVERVIEW TAB - UPDATED WITH REQUESTED CHANGES */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Welcome Header - MATCHING BUYER UI */}
                  <div className="bg-[#6cff] rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                          Welcome back, {userData?.firstName}!
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

                  {/* Stats Cards - UPDATED WITH REQUESTED HEADINGS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Personal Bookings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CalendarCheck size={20} className="text-blue-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">
                          Personal Bookings
                        </h3>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {personalBookings.length}
                      </div>
                    </div>

                    {/* Business Bookings Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Building size={20} className="text-green-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">
                          Business Bookings
                        </h3>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {businessBookings.length}
                      </div>
                    </div>

                    {/* Business Status Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <CheckCircle size={20} className="text-yellow-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">
                          Business Status
                        </h3>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        Active
                      </div>
                    </div>

                    {/* Member Since Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Award size={20} className="text-purple-600" />
                        </div>
                        <h3 className="text-gray-500 font-medium">
                          Member Since
                        </h3>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-2">
                        {memberSince}
                      </div>
                    </div>
                  </div>

                  {/* Saved Items Card - NEW CARD */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Heart size={20} className="text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-gray-500 font-medium">
                            Saved Items
                          </h3>
                          <div className="text-3xl font-bold text-gray-900 mt-1">
                            {savedListings.length}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("saved")}
                        className="text-sm text-pink-600 hover:text-pink-800 hover:underline font-medium"
                      >
                        View saved items →
                      </button>
                    </div>
                  </div>

                  {/* Recent Business Bookings Section */}
                  {recentBusinessBookings.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                          Recent Business Bookings
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Bookings made by customers to your business
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Customer
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Service
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Date
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Status
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Amount
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {recentBusinessBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User
                                        size={16}
                                        className="text-gray-600"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 truncate max-w-[150px]">
                                        {booking.customer?.name ||
                                          booking.bookedBy?.name ||
                                          "Customer"}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {booking.customer?.email || ""}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1">
                                    {getBookingIcon(booking.type)}
                                    <span className="text-gray-900 capitalize text-sm">
                                      {booking.type || "Booking"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-gray-900 text-sm">
                                  {formatDate(
                                    booking.date || booking.createdAt,
                                  )}
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                                  >
                                    {booking.status || "Pending"}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-900 font-medium">
                                  {formatPrice(
                                    booking.details?.totalAmount ||
                                      booking.amount,
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        viewBookingDetails(booking.id)
                                      }
                                      className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {booking.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            updateBusinessBookingStatus(
                                              booking.id,
                                              "confirmed",
                                            )
                                          }
                                          className="text-green-400 hover:text-green-600 p-1 transition-colors"
                                          title="Confirm Booking"
                                        >
                                          <CheckCircle size={16} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            updateBusinessBookingStatus(
                                              booking.id,
                                              "cancelled",
                                            )
                                          }
                                          className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                          title="Cancel Booking"
                                        >
                                          <X size={16} />
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
                      {businessBookings.length > 5 && (
                        <div className="p-4 border-t border-gray-200">
                          <button
                            onClick={() => setActiveTab("business-bookings")}
                            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View All {businessBookings.length} Business Bookings
                            →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recent Personal Bookings Section */}
                  {recentPersonalBookings.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                          Recent Personal Bookings
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Bookings you made to other vendors
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Vendor
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Type
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Date
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Status
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Amount
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {recentPersonalBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        booking.vendor?.image ||
                                        "https://images.unsplash.com/photo-1552566626-52f8b828add9"
                                      }
                                      alt={booking.vendor?.name}
                                      className="w-10 h-10 rounded-md object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80";
                                      }}
                                    />
                                    <div>
                                      <div className="font-medium text-gray-900 truncate max-w-[150px]">
                                        {booking.vendor?.name ||
                                          "Unknown Vendor"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1">
                                    {getBookingIcon(booking.type)}
                                    <span className="text-gray-900 capitalize text-sm">
                                      {booking.type || "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-gray-900 text-sm">
                                  {formatDate(
                                    booking.details?.checkIn || booking.date,
                                  )}
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                                  >
                                    {booking.status || "Pending"}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-900 font-medium">
                                  {formatPrice(booking.details?.totalAmount)}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        viewBookingDetails(booking.id)
                                      }
                                      className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {booking.status === "confirmed" && (
                                      <button
                                        onClick={() =>
                                          cancelPersonalBooking(booking.id)
                                        }
                                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                        title="Cancel Booking"
                                      >
                                        <X size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {personalBookings.length > 5 && (
                        <div className="p-4 border-t border-gray-200">
                          <button
                            onClick={() => setActiveTab("personal-bookings")}
                            className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View All {personalBookings.length} Personal Bookings
                            →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Booking Cards - MATCHING BUYER UI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookingCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => navigate(`/${category.id}`)}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`p-2 bg-${category.color}-100 rounded-lg`}
                          >
                            <category.icon
                              size={24}
                              className={`text-${category.color}-600`}
                            />
                          </div>
                          <h3 className="font-bold text-gray-900">
                            {category.label}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm">
                          {category.id === "hotel" &&
                            "Find and book the perfect hotel for your stay"}
                          {category.id === "shortlet" &&
                            "Discover amazing short-term rental properties"}
                          {category.id === "restaurant" &&
                            "Reserve tables at top restaurants"}
                          {category.id === "event" &&
                            "Book venues and plan your events"}
                          {category.id === "service" &&
                            "Find professional services for your needs"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MY PERSONAL BOOKINGS TAB - EXACTLY MATCHING BUYER UI BOOKINGS TAB */}
              {activeTab === "personal-bookings" && (
                <div className="space-y-6">
                  {/* Header - MATCHING BUYER UI */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          My Personal Bookings
                        </h2>
                        <p className="text-gray-600">
                          Manage and track all your personal bookings
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/")}
                          className="px-4 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 text-sm font-medium transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bookings by Category - EXACTLY MATCHING BUYER UI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookingCategories.map((category) => {
                      const categoryBookings = personalBookings.filter(
                        (b) =>
                          b.type?.toLowerCase() === category.id ||
                          (category.id === "event" &&
                            b.type?.toLowerCase() === "event center"),
                      );

                      return (
                        <div
                          key={category.id}
                          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 bg-${category.color}-100 rounded-lg`}
                              >
                                <category.icon
                                  size={20}
                                  className={`text-${category.color}-600`}
                                />
                              </div>
                              <h3 className="font-bold text-gray-900">
                                {category.label}
                              </h3>
                            </div>
                            <span className="text-xl font-bold text-gray-900">
                              {categoryBookings.length}
                            </span>
                          </div>
                          {categoryBookings.length > 0 ? (
                            <div className="space-y-3">
                              {categoryBookings.slice(0, 3).map((booking) => (
                                <div
                                  key={booking.id}
                                  className="p-3 border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">
                                        {booking.vendor?.name ||
                                          "Unknown Vendor"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(booking.date)}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(booking.status)}`}
                                    >
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {categoryBookings.length > 3 && (
                                <button
                                  onClick={() =>
                                    setActiveTab("personal-bookings")
                                  }
                                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  View {categoryBookings.length - 3} more →
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">
                                No {category.label.toLowerCase()} bookings yet
                              </p>
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

                  {/* All Personal Bookings Table - EXACTLY MATCHING BUYER UI */}
                  {personalBookings.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">
                          All Personal Bookings ({personalBookings.length})
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Vendor
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Type
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Date
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Status
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Amount
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {personalBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={
                                        booking.vendor?.image ||
                                        "https://images.unsplash.com/photo-1552566626-52f8b828add9"
                                      }
                                      alt={booking.vendor?.name}
                                      className="w-10 h-10 rounded-md object-cover"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80";
                                      }}
                                    />
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">
                                        {booking.vendor?.name ||
                                          "Unknown Vendor"}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {formatLocation(
                                          booking.vendor?.location,
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1">
                                    {getBookingIcon(booking.type)}
                                    <span className="text-gray-900 text-sm capitalize">
                                      {booking.type || "N/A"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-gray-900 text-sm">
                                  {formatDate(
                                    booking.details?.checkIn || booking.date,
                                  )}
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm ${getStatusColor(booking.status)}`}
                                  >
                                    {booking.status || "N/A"}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-900 font-medium">
                                  {formatPrice(booking.details?.totalAmount)}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        viewBookingDetails(booking.id)
                                      }
                                      className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {booking.status === "confirmed" && (
                                      <button
                                        onClick={() =>
                                          cancelPersonalBooking(booking.id)
                                        }
                                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                        title="Cancel Booking"
                                      >
                                        <X size={16} />
                                      </button>
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
                </div>
              )}

              {/* BUSINESS BOOKINGS TAB */}
              {activeTab === "business-bookings" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Business Bookings
                        </h2>
                        <p className="text-gray-600">
                          Bookings made by customers to your business
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                          <CheckCircle size={16} className="mr-1" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Business Stats Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#6cff] rounded-xl p-4 text-white">
                      <div className="text-2xl font-bold">
                        {businessBookings.length}
                      </div>
                      <p className="text-sm opacity-90">Total Bookings</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {
                          businessBookings.filter(
                            (b) => b.status === "confirmed",
                          ).length
                        }
                      </div>
                      <p className="text-sm text-gray-600">Confirmed</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {
                          businessBookings.filter((b) => b.status === "pending")
                            .length
                        }
                      </div>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ₦
                        {businessBookings
                          .reduce((sum, b) => {
                            const amount =
                              b.details?.totalAmount || b.amount || 0;
                            return (
                              sum + (typeof amount === "number" ? amount : 0)
                            );
                          }, 0)
                          .toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                  </div>

                  {/* All Business Bookings Table */}
                  {businessBookings.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">
                          All Business Bookings ({businessBookings.length})
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Customer
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Service
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Date
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Status
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Amount
                              </th>
                              <th className="text-left p-4 text-sm font-semibold text-gray-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {businessBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <User
                                        size={16}
                                        className="text-gray-600"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 text-sm truncate">
                                        {booking.customer?.name ||
                                          booking.bookedBy?.name ||
                                          "Customer"}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {booking.customer?.email ||
                                          booking.bookedBy?.email ||
                                          ""}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-1">
                                    {getBookingIcon(booking.type)}
                                    <span className="text-gray-900 text-sm capitalize">
                                      {booking.type || "Booking"}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-gray-900 text-sm">
                                  {formatDate(
                                    booking.date || booking.createdAt,
                                  )}
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                                  >
                                    {booking.status || "Pending"}
                                  </span>
                                </td>
                                <td className="p-4 text-gray-900 font-medium">
                                  {formatPrice(
                                    booking.details?.totalAmount ||
                                      booking.amount,
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        viewBookingDetails(booking.id)
                                      }
                                      className="text-blue-400 hover:text-blue-600 p-1 transition-colors"
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {booking.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            updateBusinessBookingStatus(
                                              booking.id,
                                              "confirmed",
                                            )
                                          }
                                          className="text-green-400 hover:text-green-600 p-1 transition-colors"
                                          title="Confirm Booking"
                                        >
                                          <CheckCircle size={16} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            updateBusinessBookingStatus(
                                              booking.id,
                                              "cancelled",
                                            )
                                          }
                                          className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                          title="Cancel Booking"
                                        >
                                          <X size={16} />
                                        </button>
                                      </>
                                    )}
                                    {booking.status === "confirmed" && (
                                      <button
                                        onClick={() =>
                                          updateBusinessBookingStatus(
                                            booking.id,
                                            "completed",
                                          )
                                        }
                                        className="text-purple-400 hover:text-purple-600 p-1 transition-colors"
                                        title="Mark as Completed"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                      <Building
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                      />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        No Business Bookings Yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        When customers book your services, they'll appear here.
                      </p>
                      <button
                        onClick={() => navigate("/vendor/dashboard")}
                        className="px-6 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                      >
                        Go to Business Dashboard
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SAVED TAB - MATCHING BUYER UI */}
              {activeTab === "saved" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Saved Listings
                        </h2>
                        <p className="text-gray-600">
                          Your favorite hotels, restaurants, and services
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate("/saved")}
                          className="px-4 py-2 border border-[#6cff] text-[#6cff] rounded-lg hover:bg-[#6cff]/10"
                        >
                          View Full Page
                        </button>
                        <button
                          onClick={() => navigate("/")}
                          className="px-4 py-2 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                        >
                          Browse More
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  {savedListings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-[#6cff] rounded-xl p-4 text-white">
                        <div className="text-2xl font-bold">
                          {savedListings.length}
                        </div>
                        <p className="text-sm opacity-90">Total Saved</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {
                            new Set(savedListings.map((item) => item.category))
                              .size
                          }
                        </div>
                        <p className="text-sm text-gray-600">Categories</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {
                            new Set(savedListings.map((item) => item.location))
                              .size
                          }
                        </div>
                        <p className="text-sm text-gray-600">Locations</p>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round(
                            savedListings.reduce((sum, item) => {
                              const price = parseInt(
                                item.price?.replace(/[^0-9]/g, "") || "0",
                              );
                              return sum + price;
                            }, 0) /
                              (savedListings.length || 1) /
                              1000,
                          )}
                          K
                        </div>
                        <p className="text-sm text-gray-600">Avg Price</p>
                      </div>
                    </div>
                  )}

                  {/* Saved Listings Grid */}
                  {savedListings.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                      <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        No Saved Items
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Save listings you're interested in for quick access
                        later
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-[#6cff] text-white rounded-lg hover:opacity-90"
                      >
                        Browse Services
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {savedListings.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          {/* Image */}
                          <div className="h-48 overflow-hidden relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80";
                              }}
                            />
                            <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-md shadow-sm">
                              <span className="text-xs font-semibold text-gray-900">
                                {item.tag || "Guest Favorite"}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                removeSavedListing(item.id, item.name)
                              }
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all"
                              title="Remove from saved"
                            >
                              <Heart
                                size={16}
                                className="text-red-500 fill-red-500"
                              />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 line-clamp-1">
                                  {item.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin size={14} className="text-gray-400" />
                                  <p className="text-sm text-gray-600 line-clamp-1">
                                    {item.location}
                                  </p>
                                </div>
                              </div>
                              {item.rating && (
                                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                  <Star
                                    size={12}
                                    className="text-yellow-500 fill-yellow-500"
                                  />
                                  <span className="text-xs font-semibold">
                                    {item.rating}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div>
                                <div className="font-bold text-gray-900">
                                  {item.price}
                                </div>
                                {item.category && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  navigate(`/vendor-detail/${item.id}`)
                                }
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View Details →
                              </button>
                            </div>

                            {item.savedDate && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  Saved on {formatDate(item.savedDate)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Categories Filter */}
                  {savedListings.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="font-bold text-gray-900 mb-4">
                        Saved by Category
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          new Set(savedListings.map((item) => item.category)),
                        ).map((category) => {
                          const count = savedListings.filter(
                            (item) => item.category === category,
                          ).length;
                          return (
                            <button
                              key={category}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
                              onClick={() => {
                                alert(`Showing ${count} items in ${category}`);
                              }}
                            >
                              <span>{category}</span>
                              <span className="bg-gray-300 text-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SETTINGS TAB - MATCHING BUYER UI */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Edit Profile
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage your account and preferences
                      </p>
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
                            <div className="w-20 h-20 rounded-full bg-[#6cff] flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform">
                              <User size={40} className="text-white" />
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 bg-[#6cff] text-white rounded-full p-2 cursor-pointer group-hover:scale-110 transition-transform shadow-lg">
                            <Camera size={16} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Click the camera icon to upload a new profile
                            picture
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  firstName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  lastName: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              value={profileForm.email}
                              readOnly
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) =>
                                setProfileForm({
                                  ...profileForm,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={profileForm.address}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                address: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your address"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Notification Preferences
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Choose how you want to receive notifications
                    </p>

                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-md font-medium text-gray-900 mb-3">
                          Email
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-500" />
                            <span className="text-gray-900">
                              Email Notifications
                            </span>
                          </div>
                          <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="email-toggle"
                              checked={notificationSettings.email}
                              onChange={() => handleNotificationToggle("email")}
                              className="sr-only"
                            />
                            <label
                              htmlFor="email-toggle"
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                notificationSettings.email
                                  ? "bg-[#6cff]"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                  notificationSettings.email
                                    ? "translate-x-6"
                                    : "translate-x-0"
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-md font-medium text-gray-900 mb-3">
                          WhatsApp
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare
                              size={16}
                              className="text-gray-500"
                            />
                            <span className="text-gray-900">
                              WhatsApp Notifications
                            </span>
                          </div>
                          <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="whatsapp-toggle"
                              checked={notificationSettings.whatsapp}
                              onChange={() =>
                                handleNotificationToggle("whatsapp")
                              }
                              className="sr-only"
                            />
                            <label
                              htmlFor="whatsapp-toggle"
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                notificationSettings.whatsapp
                                  ? "bg-[#6cff]"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                                  notificationSettings.whatsapp
                                    ? "translate-x-6"
                                    : "translate-x-0"
                                }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={handleSaveSettings}
                        className="px-6 py-2.5 bg-[#6cff] text-white rounded-lg hover:opacity-90 text-sm font-medium"
                      >
                        Save Notification Settings
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                      Account Actions
                    </h2>
                    <div className="space-y-3">
                      <button
                        onClick={handleChangePassword}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 border border-gray-200"
                      >
                        Reset Password
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

              {/* REVIEWS TAB - MATCHING BUYER UI */}
              {activeTab === "reviews" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Reviews
                  </h2>
                  <p className="text-gray-600 mb-6">Your reviews and ratings</p>
                  <div className="text-center py-12">
                    <Star size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You haven't written any reviews yet.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIVITY TAB - MATCHING BUYER UI */}
              {activeTab === "activity" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Activity Log
                  </h2>
                  <p className="text-gray-600 mb-6">Your recent activities</p>
                  <div className="space-y-4">
                    {personalBookings.slice(0, 3).map((booking, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <CalendarCheck size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Booked {booking.type} from{" "}
                            {booking.vendor?.name || "Vendor"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.date)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>
                    ))}
                    {businessBookings.slice(0, 3).map((booking, index) => (
                      <div
                        key={`business-${index}`}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Building size={20} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            New booking from{" "}
                            {booking.customer?.name || "Customer"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.date)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>
                    ))}
                    {savedListings.slice(0, 3).map((item, index) => (
                      <div
                        key={`saved-${index}`}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Heart size={20} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Saved "{item.name}"
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.savedDate
                              ? formatDate(item.savedDate)
                              : "Recently"}
                          </p>
                        </div>
                        <button
                          onClick={() => removeSavedListing(item.id, item.name)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  {personalBookings.length === 0 &&
                    businessBookings.length === 0 &&
                    savedListings.length === 0 && (
                      <div className="text-center py-12">
                        <Clock
                          size={48}
                          className="mx-auto text-gray-300 mb-4"
                        />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          No Recent Activity
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Your activity log will appear here.
                        </p>
                      </div>
                    )}
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
