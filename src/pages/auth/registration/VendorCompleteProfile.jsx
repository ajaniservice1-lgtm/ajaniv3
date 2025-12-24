import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faList,
  faUsers,
  faBookOpen,
  faCog,
  faSearch,
  faBell,
  faStar,
  faTrashAlt,
  faEdit,
  faEye,
  faPlus,
  faChevronRight,
  faMapMarkerAlt,
  faBox,
  faCalendar,
  faDollarSign,
  faCheckCircle,
  faBars,
  faTimes,
  faChevronDown,
  faEnvelope,
  faComment,
  faUpload,
  faCamera,
  faTimesCircle,
  faSave,
  faPhone,
  faEllipsisV,
  faFilter,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import Icon from "../../../assets/Logos/logo5.png";

// Fallback logo in case the imported one doesn't work
const FALLBACK_LOGO = "https://via.placeholder.com/40/3B82F6/FFFFFF?text=Q";

/* ===============================
   LOCAL STORAGE KEYS
================================ */
const VENDOR_STORAGE_KEY = "vendor_dashboard_data";

/* ===============================
   INITIAL DATA (MATCHES IMAGE EXACTLY)
================================ */
const defaultData = {
  // Profile data for Settings page
  profile: {
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    fullName: "Charlene Femi",
    email: "chrisfemton@gmail.com",
    username: "Charlene Femi",
    city: "Lagos",
    bio: "We specialize in luxury coastal properties and mountain retreats. Our properties are carefully selected to provide the best experience for our guests.",
  },

  // Dashboard stats
  stats: {
    totalRevenue: "#250,005.34",
    activeListings: 3,
    totalBookings: 1,
    averageRating: 4.9,
    revenueChange: "+125 from last month",
    bookingChange: "+5 from last month",
    ratingChange: "+0.5 from last month",
  },

  // Recent Bookings - Updated to match image
  recentBookings: [
    {
      id: 1,
      customer: "Sola Fadipe Jr.",
      address: "Iron man street",
      product: "Hotel Booking",
      amount: "#28,000",
      status: "Completed",
      time: "Today, 10:30 am",
      orderId: "#290888890",
    },
    {
      id: 2,
      customer: "Bankole Johansson",
      address: "Bodija",
      product: "Event booking",
      amount: "#100,000",
      status: "Completed",
      time: "Today, 10:30 am",
      orderId: "#290888890",
    },
  ],

  // Listings - FIXED: Added images array with real hotel images
  listings: [
    {
      id: 1,
      title: "Jazz Hotel and Suite",
      location: "Lagos, Victoria Island",
      property: "Luxury Hotel",
      price: "#45,000/night",
      rating: 4.9,
      status: "Active",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
      ],
    },
    {
      id: 2,
      title: "Ocean View Resort",
      location: "Calabar, Cross River",
      property: "Beach Resort",
      price: "#35,000/night",
      rating: 4.8,
      status: "Active",
      images: [
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
      ],
    },
    {
      id: 3,
      title: "Mountain Retreat Lodge",
      location: "Jos, Plateau State",
      property: "Mountain Lodge",
      price: "#28,000/night",
      rating: 4.7,
      status: "Active",
      images: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1564501049418-3c27787d01e8?w=400&h=300&fit=crop",
      ],
    },
  ],

  // Customers - Updated to match image with profile images
  customers: [
    {
      id: 1,
      name: "Samuel Rottmi",
      email: "samuel@example.com",
      phone: "+234 801 234 5678",
      bookings: 1,
      totalSpent: "#300k+",
      status: "Active",
      profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Sandra Adewuyi",
      email: "sandra@example.com",
      phone: "+234 802 345 6789",
      bookings: 1,
      totalSpent: "#300k+",
      status: "Active",
      profileImage: "https://randomuser.me/api/portraits/women/26.jpg",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Bankole Cole",
      email: "bankole@example.com",
      phone: "+234 803 456 7890",
      bookings: 1,
      totalSpent: "#300k+",
      status: "Active",
      profileImage: "https://randomuser.me/api/portraits/men/44.jpg",
      joinDate: "2024-03-10",
    },
    {
      id: 4,
      name: "Service Cafe",
      email: "cafe@example.com",
      phone: "+234 804 567 8901",
      bookings: 3,
      totalSpent: "#500k+",
      status: "Active",
      profileImage: "https://randomuser.me/api/portraits/women/33.jpg",
      joinDate: "2024-01-05",
    },
    {
      id: 5,
      name: "Service Adeniyi",
      email: "adeniyi@example.com",
      phone: "+234 805 678 9012",
      bookings: 2,
      totalSpent: "#400k+",
      status: "Active",
      profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
      joinDate: "2024-02-15",
    },
    {
      id: 6,
      name: "Chris Femton",
      email: "chris@example.com",
      phone: "+234 806 789 0123",
      bookings: 1,
      totalSpent: "#200k+",
      status: "Inactive",
      profileImage: "https://randomuser.me/api/portraits/men/18.jpg",
      joinDate: "2024-03-25",
    },
  ],

  // Bookings
  bookings: [
    {
      id: 1,
      customer: "Solo Fedipe Jr.",
      address: "bon mon street",
      service: "Hotel Booking",
      amount: "#26,000",
      status: "Completed",
      time: "Today, 10:30 am",
    },
    {
      id: 2,
      customer: "Bankole Johansson",
      address: "Bodija",
      service: "Event Centre",
      amount: "#06,000",
      status: "Completed",
      time: "Today, 10:33 am",
    },
  ],

  // Notifications settings - Updated for toggle buttons
  notifications: {
    email: true,
    whatsapp: true,
    promotionalMessages: false,
  },
};

/* ===============================
   SIDEBAR ITEM - Improved for mobile
================================ */
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-between px-4 lg:px-6 py-3 w-full text-sm transition-all duration-200 cursor-pointer lg:cursor-pointer
      ${
        active
          ? "text-blue-600 font-semibold bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      } rounded-xl mb-1
    `}
  >
    <div className="flex items-center gap-3">
      {active && (
        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600 rounded-r-md" />
      )}
      <FontAwesomeIcon icon={icon} size="sm" />
      <span className="font-medium">{label}</span>
    </div>
    {badge && (
      <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

/* ===============================
   STAT CARD COMPONENT - Fixed layout
================================ */
const StatCard = ({ title, value, change, icon, color = "blue" }) => {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "text-green-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-600" },
  };

  const currentColor = colors[color];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default">
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className="w-full">
          {/* First line: Title */}
          <p className="text-xs lg:text-sm text-gray-600 mb-2">{title}</p>
          {/* Second line: Value */}
          <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2">
            {value}
          </h3>
          {/* Third line: Change */}
          <div className="text-xs lg:text-sm text-green-600 font-medium">
            {change}
          </div>
        </div>
        <div className={`p-2 lg:p-3 rounded-xl ${currentColor.bg}`}>
          <FontAwesomeIcon
            icon={icon}
            className={`text-lg ${currentColor.icon}`}
          />
        </div>
      </div>
    </div>
  );
};

/* ===============================
   TOGGLE BUTTON COMPONENT - New component for notifications
================================ */
const ToggleButton = ({ enabled, onChange, label, icon }) => (
  <div className="flex items-center justify-between cursor-pointer lg:cursor-pointer">
    <div className="flex items-center gap-3">
      <FontAwesomeIcon icon={icon} className="text-gray-500" />
      <span className="text-gray-700 text-sm lg:text-base">{label}</span>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer lg:cursor-pointer
        ${enabled ? "bg-blue-600" : "bg-gray-200"}
      `}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform cursor-pointer lg:cursor-pointer
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  </div>
);

/* ===============================
   GLOBAL HEADER COMPONENT - Mobile responsive
================================ */
const GlobalHeader = ({ onSettingsClick }) => (
  <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-3 lg:py-4 mb-4 lg:mb-8 cursor-default">
    <div className="flex items-center justify-between">
      {/* Left side - Brand name with mobile menu */}
      <div className="flex items-center gap-3">
        <span className="text-lg lg:text-xl font-bold text-gray-900">
          Overview
        </span>
      </div>

      {/* Right side - Search, Settings, Notification, Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Mobile search button */}
        <button className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer">
          <FontAwesomeIcon icon={faSearch} />
        </button>

        {/* Desktop Search */}
        <div className="hidden lg:block relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search globally..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm w-48 lg:w-64 cursor-text"
          />
        </div>

        {/* Settings Icon */}
        <button
          onClick={onSettingsClick}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
          title="Settings"
        >
          <FontAwesomeIcon icon={faCog} />
        </button>

        {/* Notification Icon */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer">
          <FontAwesomeIcon icon={faBell} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile Image */}
        <div className="flex items-center gap-2 cursor-pointer lg:cursor-pointer">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-blue-500">
            <img
              src={defaultData.profile.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="text-gray-400 text-xs hidden lg:block"
          />
        </div>
      </div>
    </div>
  </div>
);

/* ===============================
   MOBILE ACTION BAR COMPONENT
================================ */
const MobileActionBar = ({ view, onAddListing, onSearchClick }) => {
  const getViewTitle = () => {
    switch (view) {
      case "overview":
        return "Dashboard";
      case "listing":
        return "My Listings";
      case "customer":
        return "Customers";
      case "booking":
        return "Bookings";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 mb-4 cursor-default">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{getViewTitle()}</h1>
          <p className="text-xs text-gray-600">
            {view === "overview" && "Overview of your business"}
            {view === "listing" && "Manage your properties"}
            {view === "customer" && "View and manage customers"}
            {view === "booking" && "Manage bookings"}
            {view === "settings" && "Account settings"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {view === "listing" && (
            <button
              onClick={onAddListing}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer"
              title="Add Listing"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          )}

          <button
            onClick={onSearchClick}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
            title="Search"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>

          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
            title="More"
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   MOBILE SEARCH MODAL
================================ */
const MobileSearchModal = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  onSearch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 cursor-default">
      <div className="bg-white w-full max-w-md mx-4 rounded-2xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none cursor-text"
              autoFocus
            />
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              onSearch?.();
              onClose();
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer"
          >
            Search Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ===============================
   MAIN COMPONENT
================================ */
export default function VendorDashboard() {
  const [view, setView] = useState("overview");
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(VENDOR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [newListing, setNewListing] = useState({
    title: "",
    location: "",
    property: "",
    price: "",
    description: "",
    images: [],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const fileInputRef = useRef(null);
  const profileImageRef = useRef(null);

  /* Persist to localStorage */
  useEffect(() => {
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  /* Scroll to top on page load */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Add new listing */
  const handleAddListing = () => {
    if (!newListing.title || !newListing.location || !newListing.price) {
      alert("Please fill in all required fields");
      return;
    }

    const listing = {
      id: data.listings.length + 1,
      title: newListing.title,
      location: newListing.location,
      property: newListing.property || "Property",
      price: newListing.price,
      rating: 4.5,
      status: "Active",
      description: newListing.description || "No description provided",
      images:
        newListing.images.length > 0
          ? newListing.images
          : [
              "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
            ],
    };

    setData((prev) => ({
      ...prev,
      listings: [listing, ...prev.listings],
      stats: {
        ...prev.stats,
        activeListings: prev.stats.activeListings + 1,
      },
    }));

    setNewListing({
      title: "",
      location: "",
      property: "",
      price: "",
      description: "",
      images: [],
    });
    setShowAddListingModal(false);
    setEditingListing(null);
  };

  /* Update listing */
  const handleUpdateListing = () => {
    if (!editingListing) return;

    setData((prev) => ({
      ...prev,
      listings: prev.listings.map((listing) =>
        listing.id === editingListing.id ? editingListing : listing
      ),
    }));

    setEditingListing(null);
    setShowAddListingModal(false);
  };

  /* Delete listing - FIXED */
  const handleDeleteListing = (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setData((prev) => ({
        ...prev,
        listings: prev.listings.filter((listing) => listing.id !== id),
        stats: {
          ...prev.stats,
          activeListings: Math.max(0, prev.stats.activeListings - 1),
        },
      }));
    }
  };

  /* Handle image upload */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadingImage(true);

    setTimeout(() => {
      const newImages = files.map((file) => URL.createObjectURL(file));
      if (editingListing) {
        setEditingListing((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...newImages],
        }));
      } else {
        setNewListing((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...newImages],
        }));
      }
      setUploadingImage(false);
    }, 1000);
  };

  /* Handle profile image change */
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatar: reader.result,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /* Toggle notification - Updated for toggle buttons */
  const toggleNotification = (type) => {
    setData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  /* Filter data based on search */
  const filteredListings = (data.listings || []).filter(
    (listing) =>
      (listing?.title?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (listing?.location?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (listing?.property?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  );

  const filteredCustomers = (data.customers || []).filter(
    (customer) =>
      (customer?.name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (customer?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const filteredBookings = (data.bookings || []).filter(
    (booking) =>
      (booking?.customer?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (booking?.service?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
  );

  /* ================= COMPONENTS FOR DIFFERENT VIEWS ================= */

  /* Overview View - Mobile responsive */
  const OverviewView = () => (
    <div className="space-y-4 lg:space-y-8 cursor-default">
      {/* Stats Grid - Mobile responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard
          title="Total Revenue"
          value={data.stats.totalRevenue}
          change={data.stats.revenueChange}
          icon={faDollarSign}
          color="blue"
        />
        <StatCard
          title="Active Listing"
          value={data.stats.activeListings}
          change="from last month"
          icon={faBox}
          color="green"
        />
        <StatCard
          title="Total Booking"
          value={data.stats.totalBookings}
          change={data.stats.bookingChange}
          icon={faCalendar}
          color="purple"
        />
        <StatCard
          title="Average Rating"
          value={data.stats.averageRating}
          change={data.stats.ratingChange}
          icon={faStar}
          color="yellow"
        />
      </div>

      {/* Recent Bookings - Mobile responsive */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer lg:cursor-pointer">
            View all
          </button>
        </div>

        <div className="space-y-4">
          {(data.recentBookings || []).map((booking) => (
            <div
              key={booking.id}
              className="border border-gray-200 rounded-xl p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-default"
            >
              {/* Top Section - Customer Info and Order ID */}
              <div className="flex flex-col gap-2 mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {booking.customer}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-400 text-xs"
                    />
                    <p className="text-gray-600 text-xs">{booking.address}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium">Order ID</p>
                  <p className="text-gray-900 font-semibold text-sm">
                    {booking.orderId}
                  </p>
                </div>
              </div>

              {/* Middle Section - Product and Amount */}
              <div className="flex flex-col gap-3 mb-3">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">
                    Product
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={faBox} className="text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {booking.product}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">
                    Amount
                  </p>
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    {booking.amount}
                  </p>
                </div>
              </div>

              {/* Bottom Section - Status and Time */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 cursor-default">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                    {booking.status}
                  </span>
                  <span className="text-gray-900 font-medium text-xs">
                    {booking.time}
                  </span>
                </div>

                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 cursor-pointer lg:cursor-pointer">
                  View details
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* Listing View - Mobile responsive */
  const ListingView = () => (
    <div className="space-y-4 lg:space-y-8 cursor-default">
      {/* Mobile Add Listing Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowAddListingModal(true)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add New Listing
        </button>
      </div>

      {/* Search and Filter - Mobile */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-shadow duration-300 cursor-default">
        <div className="flex items-center gap-2">
          <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            <FontAwesomeIcon icon={faFilter} />
            Filter
          </button>
          <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            <FontAwesomeIcon icon={faSort} />
            Sort
          </button>
        </div>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-300 cursor-default">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
          />
        </div>
      </div>

      {/* Action Buttons - Desktop */}
      <div className="hidden lg:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-default">
        <h2 className="text-lg font-semibold">Listing</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer lg:cursor-pointer">
            Customer
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer lg:cursor-pointer">
            Booking
          </button>
        </div>
      </div>

      {/* Listings Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow duration-300 cursor-default"
          >
            {/* Property Image and Basic Info */}
            <div className="flex gap-3 mb-3">
              <div className="w-20 h-20 flex-shrink-0 cursor-pointer lg:cursor-pointer">
                <img
                  src={
                    listing.images?.[0] ||
                    "https://via.placeholder.com/100/3B82F6/FFFFFF?text=Hotel"
                  }
                  alt={listing.title}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base">
                  {listing.title}
                </h3>
                <p className="text-gray-600 text-sm">{listing.location}</p>
                <div className="flex items-center gap-1 mt-1">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-yellow-400 text-xs"
                  />
                  <span className="font-medium text-sm">{listing.rating}</span>
                </div>
              </div>
            </div>

            {/* Details Row */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-gray-500 text-xs">Price</p>
                <p className="font-bold text-gray-900">{listing.price}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium cursor-default">
                  {listing.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(listing.images?.[0], "_blank")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
                  title="View"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => {
                    setEditingListing(listing);
                    setShowAddListingModal(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
                  title="Edit"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDeleteListing(listing.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500 cursor-pointer lg:cursor-pointer"
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer lg:cursor-pointer">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Listings Table - Desktop */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-gray-600 font-medium text-sm cursor-default">
                Property
              </th>
              <th className="text-left p-4 text-gray-600 font-medium text-sm cursor-default">
                Price
              </th>
              <th className="text-left p-4 text-gray-600 font-medium text-sm cursor-default">
                Rating
              </th>
              <th className="text-left p-4 text-gray-600 font-medium text-sm cursor-default">
                Status
              </th>
              <th className="text-left p-4 text-gray-600 font-medium text-sm cursor-default">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map((listing) => (
              <tr
                key={listing.id}
                className="border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-default"
              >
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex-shrink-0 cursor-pointer lg:cursor-pointer">
                      <img
                        src={
                          listing.images?.[0] ||
                          "https://via.placeholder.com/100/3B82F6/FFFFFF?text=Hotel"
                        }
                        alt={listing.title}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer lg:cursor-pointer">
                        {listing.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {listing.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-900 cursor-default">
                    {listing.price}
                  </p>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 cursor-default">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-yellow-400"
                    />
                    <span className="font-medium">{listing.rating}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium cursor-default">
                    {listing.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(listing.images?.[0], "_blank")}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
                      title="View"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingListing(listing);
                        setShowAddListingModal(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-red-500 cursor-pointer lg:cursor-pointer"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop Add Listing Button */}
      <div className="hidden lg:flex justify-end">
        <button
          onClick={() => {
            setEditingListing(null);
            setNewListing({
              title: "",
              location: "",
              property: "",
              price: "",
              description: "",
              images: [],
            });
            setShowAddListingModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer lg:cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Listing
        </button>
      </div>

      {/* No Listings Message */}
      {filteredListings.length === 0 && (
        <div className="text-center py-8 cursor-default">
          <div className="text-gray-400 mb-4">
            <FontAwesomeIcon icon={faList} size="3x" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No listings found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or add a new listing
          </p>
          <button
            onClick={() => setShowAddListingModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer"
          >
            Add Your First Listing
          </button>
        </div>
      )}
    </div>
  );

  /* Customer View - Mobile responsive */
  const CustomerView = () => (
    <div className="space-y-4 lg:space-y-8 cursor-default">
      {/* Mobile Search Bar */}
      <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-shadow duration-300 cursor-default">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
          />
        </div>
      </div>

      {/* Desktop Search */}
      <div className="hidden lg:block">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer lg:cursor-pointer">
                Search
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer lg:cursor-pointer">
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Buttons */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm whitespace-nowrap hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer">
            All Customers
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            Active
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            Recent
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            Top Spenders
          </button>
        </div>
      </div>

      {/* Customers Grid - Mobile responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow duration-300 cursor-default"
          >
            {/* Customer Info with Profile Image */}
            <div className="flex items-start gap-3 lg:gap-4 mb-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 border-blue-100 flex-shrink-0 cursor-pointer lg:cursor-pointer">
                <img
                  src={customer.profileImage}
                  alt={customer.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base lg:text-lg mb-1 truncate hover:text-blue-600 transition-colors cursor-pointer lg:cursor-pointer">
                  {customer.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 text-xs lg:text-sm mb-1">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <span className="truncate cursor-text">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs lg:text-sm">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <span className="truncate cursor-text">{customer.phone}</span>
                </div>
              </div>
              <span
                className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 cursor-default
                ${
                  customer.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              `}
              >
                {customer.status}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-3 lg:my-4"></div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 cursor-default">
              <div className="text-center">
                <div className="mb-2">
                  <div className="inline-block px-3 py-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors cursor-pointer lg:cursor-pointer">
                    <span className="text-blue-600 font-bold text-base lg:text-xl">
                      {customer.bookings}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">
                  Bookings
                </p>
              </div>

              <div className="text-center">
                <div className="mb-2">
                  <div className="inline-block px-3 py-1 bg-green-50 rounded-full hover:bg-green-100 transition-colors cursor-pointer lg:cursor-pointer">
                    <span className="text-green-600 font-bold text-base lg:text-xl">
                      {customer.totalSpent}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-xs lg:text-sm font-medium">
                  Total Spent
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 lg:mt-6 pt-3 lg:pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button className="text-blue-600 hover:text-blue-800 text-xs lg:text-sm font-medium flex items-center gap-1 cursor-pointer lg:cursor-pointer">
                  View Profile
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
                <div className="flex items-center gap-1 lg:gap-2">
                  <button className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer lg:cursor-pointer">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-xs lg:text-sm"
                    />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer lg:cursor-pointer">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-xs lg:text-sm"
                    />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors text-blue-600 cursor-pointer lg:cursor-pointer">
                    <FontAwesomeIcon
                      icon={faEye}
                      className="text-xs lg:text-sm"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 cursor-default">
          <div className="text-gray-400 mb-4">
            <FontAwesomeIcon icon={faUsers} size="3x" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No customers found
          </h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );

  /* Booking View - Mobile responsive */
  const BookingView = () => (
    <div className="space-y-4 lg:space-y-8 cursor-default">
      {/* Mobile Search Bar */}
      <div className="lg:hidden">
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
          />
        </div>
      </div>

      {/* Desktop Search */}
      <div className="hidden lg:block relative max-w-md">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
        />
      </div>

      {/* Mobile Filter Buttons */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm whitespace-nowrap hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer">
            All Bookings
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            Completed
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            Pending
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm whitespace-nowrap hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
            Cancelled
          </button>
        </div>
      </div>

      {/* Desktop Action Buttons */}
      <div className="hidden lg:flex flex-wrap gap-2">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer lg:cursor-pointer">
          Customer
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer lg:cursor-pointer">
          Booking
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer lg:cursor-pointer">
          Setting
        </button>
      </div>

      {/* Booking Cards - Mobile responsive */}
      <div className="space-y-3 lg:space-y-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow duration-300 cursor-default"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 mb-3 lg:mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base lg:text-lg hover:text-blue-600 transition-colors cursor-pointer lg:cursor-pointer">
                  {booking.customer}
                </h3>
                <p className="text-sm lg:text-base text-gray-600">
                  {booking.address}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium self-start lg:self-auto cursor-default">
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 cursor-default">
              <div>
                <p className="text-gray-600 text-xs lg:text-sm">Service</p>
                <p className="font-semibold text-sm lg:text-base">
                  {booking.service}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs lg:text-sm">Amount</p>
                <p className="font-bold text-base lg:text-lg">
                  {booking.amount}
                </p>
              </div>
            </div>

            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-xs lg:text-sm">Time</p>
              <p className="font-medium text-sm lg:text-base">{booking.time}</p>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer lg:cursor-pointer">
                  View Details
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-500 cursor-pointer lg:cursor-pointer">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* Settings View - Mobile responsive */
  const SettingsView = () => (
    <div className="space-y-4 lg:space-y-8 cursor-default">
      {/* Edit Profile Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-sm transition-shadow duration-300 cursor-default">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
          Edit Profile
        </h2>

        <div className="space-y-4 lg:space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4 mb-4 lg:mb-6">
            <div className="relative">
              <img
                src={data.profile?.avatar}
                alt={data.profile?.fullName}
                className="w-20 h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer lg:cursor-pointer"
              />
              <button
                onClick={() => profileImageRef.current.click()}
                className="absolute bottom-0 right-0 p-1.5 lg:p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer lg:cursor-pointer"
                title="Change photo"
              >
                <FontAwesomeIcon icon={faCamera} className="text-sm" />
              </button>
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900">
                {data.profile?.fullName}
              </h3>
              <p className="text-gray-600 text-sm">{data.profile?.email}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                Your Name
              </label>
              <input
                type="text"
                value={data.profile?.fullName || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      fullName: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                placeholder="Customer Femi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                Email
              </label>
              <input
                type="email"
                value={data.profile?.email || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      email: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                placeholder="chrisfemton@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                User Name
              </label>
              <input
                type="text"
                value={data.profile?.username || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      username: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                placeholder="Charlene Femi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                City
              </label>
              <input
                type="text"
                value={data.profile?.city || ""}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    profile: {
                      ...prev.profile,
                      city: e.target.value,
                    },
                  }))
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                placeholder="Lagos"
              />
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
              Bio
            </label>
            <textarea
              value={data.profile?.bio || ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    bio: e.target.value,
                  },
                }))
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
            />
            <div className="mt-2 lg:mt-3 bg-blue-50 rounded-xl p-3 lg:p-4 cursor-default">
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.profile?.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-sm transition-shadow duration-300 cursor-default">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
          Notifications
        </h2>
        <p className="text-gray-600 text-sm lg:text-base mb-4 lg:mb-6">
          How do you want to receive messages from Clients
        </p>

        <div className="space-y-4 lg:space-y-6">
          <ToggleButton
            enabled={data.notifications?.email || false}
            onChange={() => toggleNotification("email")}
            label="Email"
            icon={faEnvelope}
          />

          <ToggleButton
            enabled={data.notifications?.whatsapp || false}
            onChange={() => toggleNotification("whatsapp")}
            label="Whatsapp"
            icon={faComment}
          />

          <ToggleButton
            enabled={data.notifications?.promotionalMessages || false}
            onChange={() => toggleNotification("promotionalMessages")}
            label="Promotional messages"
            icon={faBell}
          />
        </div>
      </div>
    </div>
  );

  /* Add/Edit Listing Modal - Mobile optimized */
  const ListingModal = () => {
    const images =
      (editingListing ? editingListing.images : newListing.images) || [];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-start lg:items-center justify-center z-50 p-0 lg:p-4 overflow-y-auto cursor-default">
        <div className="bg-white w-full lg:max-w-2xl lg:rounded-2xl lg:max-h-[90vh] lg:overflow-y-auto min-h-screen lg:min-h-0 hover:shadow-xl transition-shadow duration-300">
          {/* Mobile Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg lg:text-xl font-semibold">
                {editingListing ? "Edit Listing" : "Add New Listing"}
              </h3>
              <button
                onClick={() => {
                  setShowAddListingModal(false);
                  setEditingListing(null);
                  setNewListing({
                    title: "",
                    location: "",
                    property: "",
                    price: "",
                    description: "",
                    images: [],
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 lg:mb-3 cursor-default">
                Listing Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4 mb-3 lg:mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Listing ${index + 1}`}
                      className="w-full h-24 lg:h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer lg:cursor-pointer"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs rounded cursor-default">
                        Main
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (editingListing) {
                          setEditingListing((prev) => ({
                            ...prev,
                            images: (prev.images || []).filter(
                              (_, i) => i !== index
                            ),
                          }));
                        } else {
                          setNewListing((prev) => ({
                            ...prev,
                            images: (prev.images || []).filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }
                      }}
                      className="absolute top-1 lg:top-2 right-1 lg:right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer lg:cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-24 lg:h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer lg:cursor-pointer"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faUpload}
                        className="text-gray-400 mb-1 lg:mb-2"
                      />
                      <span className="text-xs lg:text-sm text-gray-600">
                        Upload Image
                      </span>
                    </>
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                  Title *
                </label>
                <input
                  type="text"
                  value={
                    editingListing ? editingListing.title : newListing.title
                  }
                  onChange={(e) =>
                    editingListing
                      ? setEditingListing({
                          ...editingListing,
                          title: e.target.value,
                        })
                      : setNewListing({ ...newListing, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                  placeholder="e.g., Jazz Hotel and Suite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                  Location *
                </label>
                <input
                  type="text"
                  value={
                    editingListing
                      ? editingListing.location
                      : newListing.location
                  }
                  onChange={(e) =>
                    editingListing
                      ? setEditingListing({
                          ...editingListing,
                          location: e.target.value,
                        })
                      : setNewListing({
                          ...newListing,
                          location: e.target.value,
                        })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                  placeholder="e.g., Lagos, Victoria Island"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                  Property Type
                </label>
                <select
                  value={
                    editingListing
                      ? editingListing.property
                      : newListing.property
                  }
                  onChange={(e) =>
                    editingListing
                      ? setEditingListing({
                          ...editingListing,
                          property: e.target.value,
                        })
                      : setNewListing({
                          ...newListing,
                          property: e.target.value,
                        })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-pointer lg:cursor-pointer"
                >
                  <option value="">Select Property Type</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Event Center">Event Center</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                  Price *
                </label>
                <input
                  type="text"
                  value={
                    editingListing ? editingListing.price : newListing.price
                  }
                  onChange={(e) =>
                    editingListing
                      ? setEditingListing({
                          ...editingListing,
                          price: e.target.value,
                        })
                      : setNewListing({ ...newListing, price: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                  placeholder="e.g., #45,000/night"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 cursor-default">
                Description
              </label>
              <textarea
                value={
                  editingListing
                    ? editingListing.description
                    : newListing.description
                }
                onChange={(e) =>
                  editingListing
                    ? setEditingListing({
                        ...editingListing,
                        description: e.target.value,
                      })
                    : setNewListing({
                        ...newListing,
                        description: e.target.value,
                      })
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-text"
                placeholder="Describe your listing..."
              />
            </div>
          </div>

          {/* Mobile Footer - Sticky at bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3">
              <button
                onClick={() => {
                  setShowAddListingModal(false);
                  setEditingListing(null);
                  setNewListing({
                    title: "",
                    location: "",
                    property: "",
                    price: "",
                    description: "",
                    images: [],
                  });
                }}
                className="w-full sm:flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer lg:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={
                  editingListing ? handleUpdateListing : handleAddListing
                }
                className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer lg:cursor-pointer"
              >
                {editingListing ? (
                  <FontAwesomeIcon icon={faSave} />
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
                {editingListing ? "Update Listing" : "Add Listing"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* Global Settings Modal */
  const GlobalSettingsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-start lg:items-center justify-center z-50 p-0 lg:p-4 cursor-default">
      <div className="bg-white w-full lg:max-w-md lg:rounded-2xl lg:max-h-[90vh] lg:overflow-y-auto min-h-screen lg:min-h-0 hover:shadow-xl transition-shadow duration-300">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 lg:p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg lg:text-xl font-semibold">
              Global Settings
            </h3>
            <button
              onClick={() => setShowGlobalSettings(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer lg:cursor-pointer"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 cursor-default">
              Language
            </h4>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-pointer lg:cursor-pointer">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 cursor-default">
              Timezone
            </h4>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-pointer lg:cursor-pointer">
              <option value="utc">UTC</option>
              <option value="est">Eastern Time (EST)</option>
              <option value="pst">Pacific Time (PST)</option>
              <option value="cet">Central European Time (CET)</option>
            </select>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 cursor-default">
              Currency
            </h4>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm cursor-pointer lg:cursor-pointer">
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
              <option value="ngn">NGN (₦)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <ToggleButton
              enabled={false}
              onChange={() => {}}
              label="Dark Mode"
              icon={faCog}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 lg:p-6">
          <button
            onClick={() => setShowGlobalSettings(false)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer lg:cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 cursor-default">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer"
      >
        {isSidebarOpen ? (
          <FontAwesomeIcon icon={faTimes} />
        ) : (
          <FontAwesomeIcon icon={faBars} />
        )}
      </button>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 cursor-pointer lg:cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar - FIXED: Fixed position on desktop, non-scrollable */}
        <aside
          className={`
          fixed lg:fixed top-0 left-0 h-full w-64 lg:w-72 bg-white border-r border-gray-200 z-50 lg:z-40
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:min-h-screen lg:overflow-y-auto
        `}
          style={{ height: "100vh" }}
        >
          <div className="h-full flex flex-col">
            <div className="px-4 lg:px-6 py-6 lg:py-8 flex-shrink-0">
              <div className="flex items-center gap-3 mb-6 lg:mb-8">
                <div className="mb-6 cursor-pointer lg:cursor-pointer">
                  <img
                    src={Icon}
                    alt="Ajani Logo"
                    className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>

              <nav className="space-y-1">
                <NavItem
                  icon={faHome}
                  label="Dashboard"
                  active={view === "overview"}
                  onClick={() => {
                    setView("overview");
                    setIsSidebarOpen(false);
                  }}
                />
                <NavItem
                  icon={faList}
                  label="Listing"
                  active={view === "listing"}
                  onClick={() => {
                    setView("listing");
                    setIsSidebarOpen(false);
                  }}
                />
                <NavItem
                  icon={faUsers}
                  label="Customer"
                  active={view === "customer"}
                  onClick={() => {
                    setView("customer");
                    setIsSidebarOpen(false);
                  }}
                />
                <NavItem
                  icon={faBookOpen}
                  label="Booking"
                  active={view === "booking"}
                  onClick={() => {
                    setView("booking");
                    setIsSidebarOpen(false);
                  }}
                />
                <NavItem
                  icon={faCog}
                  label="Settings"
                  active={view === "settings"}
                  onClick={() => {
                    setView("settings");
                    setIsSidebarOpen(false);
                  }}
                />
              </nav>
            </div>

            <div className="flex-grow"></div>

            {/* Bottom Section - User Profile in Sidebar */}
            <div className="px-4 lg:px-6 py-4 lg:py-6 border-t border-gray-200 mt-auto hover:bg-gray-50 transition-colors cursor-pointer lg:cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden border-2 border-blue-500">
                  <img
                    src={data.profile?.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm hover:text-blue-600 transition-colors">
                    {data.profile?.fullName}
                  </p>
                  <p className="text-gray-500 text-xs">{data.profile?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - FIXED: Scrollable area only on the right side */}
        <main className="flex-1 w-full lg:w-auto lg:ml-64 lg:ml-72 lg:overflow-y-auto lg:h-screen">
          {/* Global Header */}
          <GlobalHeader onSettingsClick={() => setShowGlobalSettings(true)} />

          {/* Mobile Action Bar */}
          <MobileActionBar
            view={view}
            onAddListing={() => setShowAddListingModal(true)}
            onSearchClick={() => setShowMobileSearch(true)}
          />

          {/* Content based on view - This is the scrollable area on desktop */}
          <div className="px-3 sm:px-4 lg:px-8 pb-6 lg:py-8">
            {view === "overview" && <OverviewView />}
            {view === "listing" && <ListingView />}
            {view === "customer" && <CustomerView />}
            {view === "booking" && <BookingView />}
            {view === "settings" && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Modals */}
      {showAddListingModal && <ListingModal />}
      {showGlobalSettings && <GlobalSettingsModal />}
    </div>
  );
}
