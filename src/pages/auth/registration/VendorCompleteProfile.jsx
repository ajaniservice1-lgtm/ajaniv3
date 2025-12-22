import React, { useEffect, useState, useRef } from "react";
import {
  Home,
  List,
  Users,
  BookOpen,
  Settings,
  Search,
  Bell,
  Star,
  Trash2,
  Edit2,
  Eye,
  Plus,
  ChevronRight,
  MapPin,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  MoreVertical,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  Image as ImageIcon,
  Upload,
  Camera,
  XCircle,
  Save,
  User,
} from "lucide-react";
import Logo from "../../../assets/Logos/logo5.png";

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

  // Recent Bookings
  recentBookings: [
    {
      id: 1,
      customer: "Solo Fedipe Jr.",
      address: "Iron man street",
      product: "Hotel Booking",
      amount: "#26,000",
      status: "Completed",
      time: "Today, 10:30 am",
    },
    {
      id: 2,
      customer: "Bankole Johansson",
      address: "Bodija",
      product: "Event Centre",
      amount: "#06,000",
      status: "Completed",
      time: "Today, 10:33 am",
    },
  ],

  // Listings - FIXED: Added images array
  listings: [
    {
      id: 1,
      title: "Jogz Hotel and Suite",
      location: "Mobile, 80 B location",
      property: "Property",
      price: "#28.000/night",
      rating: 4.9,
      status: "Active",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      ],
    },
    {
      id: 2,
      title: "Jogz Hotel and Suite",
      location: "Mobile, 80 B location",
      property: "Property",
      price: "#28.000/night",
      rating: 4.8,
      status: "Active",
      images: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop",
      ],
    },
  ],

  // Customers (From Ogiani image)
  customers: [
    {
      id: 1,
      name: "Service Adeniyi for customer use",
      email: "adeniyi@example.com",
      bookings: 1,
      totalSpent: "#300k+",
      status: "Active",
    },
    {
      id: 2,
      name: "Service Cafe for customer use",
      email: "cafe@example.com",
      bookings: 1,
      totalSpent: "#300k+",
      status: "Active",
    },
    {
      id: 3,
      name: "Bankole Cole",
      email: "bankole@example.com",
      bookings: 1,
      totalSpent: "#30k+",
      status: "Active",
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

  // Notifications settings
  notifications: {
    email: true,
    whatsapp: true,
    promotionalMessages: false,
  },
};

/* ===============================
   SIDEBAR ITEM - Improved for mobile
================================ */
const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center justify-between px-4 lg:px-6 py-3 w-full text-sm transition-all duration-200
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
      <Icon size={18} />
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
   STAT CARD COMPONENT - Responsive
================================ */
const StatCard = ({ title, value, change, icon: Icon, color = "blue" }) => {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "text-green-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-600" },
  };

  const currentColor = colors[color];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
            {value}
          </h3>
          <p className="text-xs lg:text-sm text-gray-600 mt-1">{title}</p>
        </div>
        <div className={`p-2 lg:p-3 rounded-xl ${currentColor.bg}`}>
          <Icon size={18} className={currentColor.icon} />
        </div>
      </div>
      <div className="text-xs lg:text-sm text-green-600 font-medium">
        {change}
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
  const fileInputRef = useRef(null);
  const profileImageRef = useRef(null);

  /* Persist to localStorage */
  useEffect(() => {
    localStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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

  /* Toggle notification */
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
    <div className="space-y-6 lg:space-y-8">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">
            Overview
          </h1>
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search for something"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Revenue"
          value={data.stats.totalRevenue}
          change={data.stats.revenueChange}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Active Listing"
          value={data.stats.activeListings}
          change="from last month"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Total Booking"
          value={data.stats.totalBookings}
          change={data.stats.bookingChange}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Average Rating"
          value={data.stats.averageRating}
          change={data.stats.ratingChange}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Recent Bookings - Mobile responsive */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">
          Recent Bookings
        </h2>

        <div className="space-y-3 lg:space-y-4">
          {(data.recentBookings || []).map((booking) => (
            <div
              key={booking.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 lg:p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="mb-2 sm:mb-0 sm:flex-1">
                <h4 className="font-bold text-gray-900 text-sm lg:text-base">
                  {booking.customer}
                </h4>
                <p className="text-xs lg:text-sm text-gray-600 mt-1">
                  {booking.address}
                </p>
              </div>

              <div className="mb-2 sm:mb-0">
                <p className="text-xs lg:text-sm text-gray-600">Product</p>
                <p className="font-medium text-gray-900 text-sm lg:text-base">
                  {booking.product}
                </p>
              </div>

              <div className="mb-2 sm:mb-0">
                <p className="text-xs lg:text-sm text-gray-600">Amount</p>
                <p className="text-base lg:text-lg font-bold text-gray-900">
                  {booking.amount}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-4">
                <span className="px-2 lg:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium">
                  {booking.status}
                </span>
                <span className="text-xs lg:text-sm font-medium text-gray-900">
                  {booking.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* Listing View - Mobile responsive */
  const ListingView = () => (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          My Listings
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          Manage your properties and services
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
          />
        </div>
      </div>

      {/* Action Buttons - Mobile responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-base lg:text-lg font-semibold">Listing</h2>
        <div className="flex gap-2">
          <button className="px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm">
            Customer
          </button>
          <button className="px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm">
            Booking
          </button>
        </div>
      </div>

      {/* Listings Table - Mobile responsive */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px] lg:min-w-0">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">
                Property
              </th>
              <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">
                Price
              </th>
              <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">
                Rating
              </th>
              <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">
                Status
              </th>
              <th className="text-left p-3 lg:p-4 text-gray-600 font-medium text-xs lg:text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.map((listing) => (
              <tr key={listing.id} className="border-t border-gray-200">
                <td className="p-3 lg:p-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm lg:text-base">
                      {listing.title}
                    </h4>
                    <p className="text-xs lg:text-sm text-gray-600">
                      {listing.location}
                    </p>
                  </div>
                </td>
                <td className="p-3 lg:p-4">
                  <p className="font-bold text-gray-900 text-sm lg:text-base">
                    {listing.price}
                  </p>
                </td>
                <td className="p-3 lg:p-4">
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="font-medium text-sm lg:text-base">
                      {listing.rating}
                    </span>
                  </div>
                </td>
                <td className="p-3 lg:p-4">
                  <span className="px-2 lg:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium">
                    {listing.status}
                  </span>
                </td>
                <td className="p-3 lg:p-4">
                  <div className="flex items-center gap-1 lg:gap-2">
                    <button
                      onClick={() => window.open(listing.images?.[0], "_blank")}
                      className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingListing(listing);
                        setShowAddListingModal(true);
                      }}
                      className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-1 lg:p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Listing Button - Mobile responsive */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddListingModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
        >
          <Plus size={18} />
          Add Listing
        </button>
      </div>
    </div>
  );

  /* Customer View - Mobile responsive */
  const CustomerView = () => (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          Customers
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          View and manage your customer relationships.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
        />
      </div>

      {/* Action Buttons - Mobile responsive */}
      <div className="flex gap-2">
        <button className="px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm">
          Listing
        </button>
        <button className="px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs lg:text-sm">
          Search name
        </button>
      </div>

      {/* Customers Grid - Mobile responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="font-bold text-gray-900 text-base lg:text-lg mb-3 lg:mb-4">
              {customer.name}
            </h3>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm lg:text-base">
                  Booking
                </span>
                <span className="font-semibold text-sm lg:text-base">
                  {customer.bookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm lg:text-base">
                  Total Spent
                </span>
                <span className="font-bold text-green-600 text-sm lg:text-base">
                  {customer.totalSpent}
                </span>
              </div>
            </div>

            <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                <Mail size={12} />
                {customer.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* Booking View - Mobile responsive */
  const BookingView = () => (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          Bookings
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          Manage your booking requests and reservations
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
        />
      </div>

      {/* Action Buttons - Mobile responsive */}
      <div className="flex flex-wrap gap-2">
        <button className="px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm">
          Customer
        </button>
        <button className="px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm">
          Booking
        </button>
        <button className="px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs lg:text-sm">
          Setting
        </button>
      </div>

      {/* Booking Cards - Mobile responsive */}
      <div className="space-y-4 lg:space-y-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 mb-3 lg:mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base lg:text-lg">
                  {booking.customer}
                </h3>
                <p className="text-sm lg:text-base text-gray-600">
                  {booking.address}
                </p>
              </div>
              <span className="px-2 lg:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs lg:text-sm font-medium">
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
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
          </div>
        ))}
      </div>
    </div>
  );

  /* Settings View - Mobile responsive */
  const SettingsView = () => (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      {/* Edit Profile Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 lg:mb-6">
          Edit Profile
        </h2>

        <div className="space-y-4 lg:space-y-6">
          {/* Profile Image */}
          <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="relative">
              <img
                src={data.profile?.avatar}
                alt={data.profile?.fullName}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                onClick={() => profileImageRef.current.click()}
                className="absolute bottom-0 right-0 p-1.5 lg:p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                title="Change photo"
              >
                <Camera size={14} />
              </button>
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                placeholder="Customer Femi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                placeholder="chrisfemton@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                placeholder="Charlene Femi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                placeholder="Lagos"
              />
            </div>
          </div>

          {/* Bio Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
            />
            <div className="mt-2 lg:mt-3 bg-blue-50 rounded-xl p-3 lg:p-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.profile?.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:p-6">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
          Notifications
        </h2>
        <p className="text-gray-600 text-sm lg:text-base mb-4 lg:mb-6">
          How do you want to receive messages from Clients
        </p>

        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-500" />
              <span className="text-gray-700 text-sm lg:text-base">Email</span>
            </div>
            <input
              type="checkbox"
              checked={data.notifications?.email || false}
              onChange={() => toggleNotification("email")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} className="text-gray-500" />
              <span className="text-gray-700 text-sm lg:text-base">
                Whatsapp
              </span>
            </div>
            <input
              type="checkbox"
              checked={data.notifications?.whatsapp || false}
              onChange={() => toggleNotification("whatsapp")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-gray-500" />
              <span className="text-gray-700 text-sm lg:text-base">
                Promotional messages
              </span>
            </div>
            <input
              type="checkbox"
              checked={data.notifications?.promotionalMessages || false}
              onChange={() => toggleNotification("promotionalMessages")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* Add/Edit Listing Modal - FIXED the image map error */
  const ListingModal = () => {
    // Safely get images array
    const images =
      (editingListing ? editingListing.images : newListing.images) || [];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 lg:p-6 border-b border-gray-200">
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            {/* Images Upload - FIXED: Safe mapping */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 lg:mb-3">
                Listing Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4 mb-3 lg:mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Listing ${index + 1}`}
                      className="w-full h-24 lg:h-32 object-cover rounded-lg"
                    />
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
                      className="absolute top-1 lg:top-2 right-1 lg:right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="w-full h-24 lg:h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-blue-600"></div>
                  ) : (
                    <>
                      <Upload
                        size={20}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                  placeholder="e.g., Jogz Hotel and Suite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                  placeholder="e.g., Mobile, 80 B location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                  placeholder="e.g., #28,000/night"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                placeholder="Describe your listing..."
              />
            </div>
          </div>

          <div className="p-4 lg:p-6 border-t border-gray-200 flex items-center justify-end gap-2 lg:gap-3">
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
              className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={editingListing ? handleUpdateListing : handleAddListing}
              className="px-4 lg:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {editingListing ? <Save size={16} /> : <Plus size={16} />}
              {editingListing ? "Update Listing" : "Add Listing"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar - Mobile responsive */}
        <aside
          className={`
          fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="px-4 lg:px-6 py-6 lg:py-8">
            <div className="flex items-center gap-2 mb-6 lg:mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden lg:block">
                Dashboard
              </h1>
            </div>

            <nav className="space-y-1">
              <NavItem
                icon={Home}
                label="Overview"
                active={view === "overview"}
                onClick={() => {
                  setView("overview");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={List}
                label="Listing"
                active={view === "listing"}
                onClick={() => {
                  setView("listing");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Users}
                label="Customer"
                active={view === "customer"}
                onClick={() => {
                  setView("customer");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={BookOpen}
                label="Booking"
                active={view === "booking"}
                onClick={() => {
                  setView("booking");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Settings}
                label="Settings"
                active={view === "settings"}
                onClick={() => {
                  setView("settings");
                  setIsSidebarOpen(false);
                }}
              />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-3 sm:px-4 lg:px-8 py-6 lg:py-8">
          {/* Top Bar - Mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 capitalize">
                {view === "overview" ? "Overview" : view}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell size={20} />
              </button>

              <div className="relative">
                <img
                  src={data.profile?.avatar}
                  alt="avatar"
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-blue-500 cursor-pointer"
                  onClick={() => profileImageRef.current.click()}
                />
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </div>
            </div>
          </div>

          {/* Content based on view */}
          {view === "overview" && <OverviewView />}
          {view === "listing" && <ListingView />}
          {view === "customer" && <CustomerView />}
          {view === "booking" && <BookingView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>

      {/* Modals */}
      {showAddListingModal && <ListingModal />}
    </div>
  );
}
