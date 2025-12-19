import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  List,
  Users,
  BookOpen,
  Settings,
  Search,
  Eye,
  Trash2,
  Edit2,
  Star,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  ChevronRight,
  MapPin,
  MoreVertical,
  Plus,
  Menu,
  X,
  Bell,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  // Default vendor data
  const getInitialVendor = () => {
    const savedProfile = localStorage.getItem("vendorCompleteProfile");

    if (savedProfile) {
      return JSON.parse(savedProfile);
    }

    return {
      firstName: "Charlene",
      lastName: "Femi",
      fullName: "Charlene Femi",
      email: "charlenefemi@gmail.com",
      phone: "+234 812 345 6789",
      location: "Ibadan",
      bio: "We specialize in luxury coastal properties and mountain retreats. Our properties are carefully selected to provide the best experience for our guests.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      totalRevenue: "#250,005.34",
      activeListings: 3,
      totalBookings: 1,
      averageRating: 4.9,
      revenueChange: "+12%",
      bookingChange: "+5",
      ratingChange: "+0.5",
      listings: [
        {
          id: 1,
          title: "Jagz Hotel and Suite",
          location: "Moiete, RD 6 Ibadan",
          category: "Property",
          price: "#28,000/night",
          rating: 4.8,
          reviews: 12,
          status: "Active",
          image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
        },
        {
          id: 2,
          title: "Golden Tulip Restaurant",
          location: "Jericho, Ibadan",
          category: "Restaurant",
          price: "#50,000/event",
          rating: 4.7,
          reviews: 8,
          status: "Active",
          image:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
        },
        {
          id: 3,
          title: "Ibadan Central Catering",
          location: "Bodija, Ibadan",
          category: "Catering",
          price: "#70,000/package",
          rating: 4.8,
          reviews: 15,
          status: "Active",
          image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        },
      ],
      customers: [
        {
          id: 1,
          name: "Rotimi Samuelson",
          email: "rotimi@example.com",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
          bookings: 1,
          totalSpent: "#300k+",
          company: "Boeing",
        },
        {
          id: 2,
          name: "Sandra Adoway",
          email: "sandra@example.com",
          avatar: "https://randomuser.me/api/portraits/women/47.jpg",
          bookings: 1,
          totalSpent: "#300k+",
          company: "Boeing",
        },
        {
          id: 3,
          name: "Bankole Cole",
          email: "bankole@example.com",
          avatar: "https://randomuser.me/api/portraits/men/67.jpg",
          bookings: 1,
          totalSpent: "#30k+",
          company: "Boeing",
        },
      ],
      bookings: [
        {
          id: 1,
          customer: "Solo Fedipe Jr.",
          address: "Iron man street",
          orderId: "#290888890",
          service: "Hotel Booking",
          amount: "#28,000",
          status: "Completed",
          date: "Today",
          type: "Proposal",
        },
        {
          id: 2,
          customer: "Bankole Johansson",
          address: "Bodija",
          orderId: "#888800",
          service: "Event Centre",
          amount: "#45,000",
          status: "Completed",
          date: "Restart",
          type: "Event",
        },
      ],
    };
  };

  const [vendor, setVendor] = useState(getInitialVendor);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [notifications] = useState(3);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("vendorCompleteProfile", JSON.stringify(vendor));
  }, [vendor]);

  // Render stars for ratings
  const renderStars = (rating) => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? "#F59E0B" : "#E5E7EB"}
          stroke={i < rating ? "#F59E0B" : "#D1D5DB"}
          className="shrink-0"
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );

  // Stat Card Component
  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    changeType = "positive",
    description,
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-blue-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`p-3 rounded-xl ${
            title === "Total Revenue"
              ? "bg-blue-50"
              : title === "Active Listing"
              ? "bg-green-50"
              : title === "Total Booking"
              ? "bg-purple-50"
              : "bg-yellow-50"
          }`}
        >
          <Icon
            size={20}
            className={
              title === "Total Revenue"
                ? "text-blue-600"
                : title === "Active Listing"
                ? "text-green-600"
                : title === "Total Booking"
                ? "text-purple-600"
                : "text-yellow-600"
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm " >
        {change && (
          <span
            className={`flex items-center gap-1 font-medium ${
              changeType === "positive" ? "text-green-600" : "text-red-600"
            }`}
          >
            {changeType === "positive" ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {change}
          </span>
        )}
        <span className="text-gray-500">
          {description || "from last month"}
        </span>
      </div>
    </div>
  );

  // Sidebar Navigation Item
  const NavItem = ({ icon: Icon, label, isActive, onClick, badge }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 w-full text-left transition-all duration-200 rounded-xl mb-1 ${
        isActive
          ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border border-blue-200"
          : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={isActive ? "text-blue-600" : "text-gray-500"}
        />
        <span className="font-medium">{label}</span>
      </div>
      {badge && (
        <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  // Dashboard View
  const DashboardView = () => {
    const bookings = vendor.bookings || [];

    return (
      <div className="space-y-6 mt-8 lg:mt-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Overview
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {vendor.firstName}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Revenue"
            value={vendor.totalRevenue}
            change={vendor.revenueChange}
            icon={DollarSign}
          />
          <StatCard
            title="Active Listing"
            value={vendor.activeListings}
            description="from last month"
            icon={Package}
          />
          <StatCard
            title="Total Booking"
            value={vendor.totalBookings}
            change={`+${vendor.bookingChange} from last month`}
            icon={Calendar}
          />
          <StatCard
            title="Average Rating"
            value={vendor.averageRating}
            change={`+${vendor.ratingChange} from last month`}
            icon={Star}
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
              Recent Bookings
            </h2>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              View all <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="mb-4 md:mb-0 md:flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                      <Home size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.customer}
                      </p>
                      <p className="text-sm text-gray-600">{booking.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {booking.orderId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 md:mb-0 md:w-48">
                  <p className="font-medium text-gray-900">{booking.service}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {booking.amount}
                  </p>
                </div>

                <div className="mb-4 md:mb-0">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {booking.type}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      booking.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {booking.status}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {booking.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Listing View
  const ListingView = () => {
    const listings = vendor.listings || [];

    return (
      <div className="space-y-6 mt-8 lg:mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Listings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your properties and services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              <span>Add Listing</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search Listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-48">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {listing.status}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin size={14} />
                      {listing.location}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {listing.price}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">
                      {listing.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-1">
                      {renderStars(listing.rating)}
                      <span className="text-xs text-gray-500">
                        ({listing.reviews})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Customer View
  const CustomerView = () => {
    const customers = vendor.customers || [];

    return (
      <div className="space-y-6 mt-8 lg:mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Customers
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your customer relationships
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Users size={16} />
            <span>Add Customer</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search customers by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.company}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 font-medium">
                      Bookings
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {customer.bookings}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600 font-medium">
                      Total Spent
                    </p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {customer.totalSpent}
                    </p>
                  </div>
                </div>

                <button className="w-full mt-6 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Booking View
  const BookingView = () => {
    const listings = vendor.listings || [];

    return (
      <div className="space-y-6 mt-8 lg:mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Bookings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your booking requests and reservations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              <span>New Booking</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search booking by customer name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {listings.slice(0, 1).map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <Home size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {listing.title}
                  </p>
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <MapPin size={14} />
                    {listing.location}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {listing.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {listing.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-gray-900">
                    {listing.price}
                  </p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Settings View
  const SettingsView = () => (
    <div className="space-y-6 mt-8 lg:mt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <p className="text-gray-600 text-sm mt-1">
            Update your personal information
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={vendor.firstName}
                  onChange={(e) =>
                    setVendor({ ...vendor, firstName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={vendor.lastName}
                  onChange={(e) =>
                    setVendor({ ...vendor, lastName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={vendor.email}
                onChange={(e) =>
                  setVendor({ ...vendor, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={vendor.phone}
                onChange={(e) =>
                  setVendor({ ...vendor, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={vendor.location}
                onChange={(e) =>
                  setVendor({ ...vendor, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={vendor.bio}
                onChange={(e) => setVendor({ ...vendor, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-5">
              <p className="text-sm text-gray-700 leading-relaxed">
                We specialize in luxury coastal properties and mountain
                retreats. Our properties are carefully selected to provide the
                best experience for our guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-manrope  mt-20">
      {/* Use imported Header */}
      <Header />

      {/* Mobile Sidebar Backdrop with Blur Effect */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm bg-black/30 transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
          <div className="p-6">
            <nav className="space-y-1">
              <NavItem
                icon={Home}
                label="Overview"
                isActive={activeView === "dashboard" && !showSettings}
                onClick={() => {
                  setActiveView("dashboard");
                  setShowSettings(false);
                }}
                badge="3"
              />
              <NavItem
                icon={List}
                label="My Listings"
                isActive={activeView === "listing"}
                onClick={() => {
                  setActiveView("listing");
                  setShowSettings(false);
                }}
              />
              <NavItem
                icon={Users}
                label="Customers"
                isActive={activeView === "customer"}
                onClick={() => {
                  setActiveView("customer");
                  setShowSettings(false);
                }}
              />
              <NavItem
                icon={BookOpen}
                label="Bookings"
                isActive={activeView === "booking"}
                onClick={() => {
                  setActiveView("booking");
                  setShowSettings(false);
                }}
                badge="2"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                isActive={showSettings}
                onClick={() => {
                  setShowSettings(true);
                  setActiveView("settings");
                }}
              />
            </nav>
          </div>
        </aside>

        {/* Sidebar - Mobile with Slide Animation */}
        <aside
          className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Home size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">ajani</h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              <NavItem
                icon={Home}
                label="Overview"
                isActive={activeView === "dashboard" && !showSettings}
                onClick={() => {
                  setActiveView("dashboard");
                  setShowSettings(false);
                  setIsSidebarOpen(false);
                }}
                badge="3"
              />
              <NavItem
                icon={List}
                label="My Listings"
                isActive={activeView === "listing"}
                onClick={() => {
                  setActiveView("listing");
                  setShowSettings(false);
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Users}
                label="Customers"
                isActive={activeView === "customer"}
                onClick={() => {
                  setActiveView("customer");
                  setShowSettings(false);
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={BookOpen}
                label="Bookings"
                isActive={activeView === "booking"}
                onClick={() => {
                  setActiveView("booking");
                  setShowSettings(false);
                  setIsSidebarOpen(false);
                }}
                badge="2"
              />
              <NavItem
                icon={Settings}
                label="Settings"
                isActive={showSettings}
                onClick={() => {
                  setShowSettings(true);
                  setActiveView("settings");
                  setIsSidebarOpen(false);
                }}
              />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-0">
          {/* Top Bar - Internal */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center gap-4">
              <MobileMenuButton />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {showSettings
                    ? "Settings"
                    : activeView === "dashboard"
                    ? "Overview"
                    : activeView === "listing"
                    ? "My Listings"
                    : activeView === "customer"
                    ? "Customers"
                    : activeView === "booking"
                    ? "Bookings"
                    : "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search for something..."
                  className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors w-64"
                />
              </div>

              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell size={20} />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  if (!showSettings) setActiveView("settings");
                }}
                className={`p-2 transition-colors ${
                  showSettings
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Settings size={20} />
              </button>

              <div className="relative">
                <button className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-500">
                    <img
                      src={vendor.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-400 hidden lg:block"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mb-6 md:hidden">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search for something..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Content based on active view */}
          {showSettings ? (
            <SettingsView />
          ) : (
            activeView === "dashboard" && <DashboardView />
          )}
          {activeView === "listing" && <ListingView />}
          {activeView === "customer" && <CustomerView />}
          {activeView === "booking" && <BookingView />}
        </main>
      </div>

      {/* Use imported Footer */}
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default VendorDashboard;
