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
} from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Load vendor data from localStorage or location state
  const getInitialVendor = () => {
    const locationData = location.state;
    const savedProfile = localStorage.getItem("vendorCompleteProfile");

    // Default data structure that matches all requirements
    const defaultVendor = {
      firstName: "Vendor",
      lastName: "Name",
      fullName: "Vendor Name",
      email: "vendor@example.com",
      phone: "+234 812 345 6789",
      businessType: "restaurant",
      workType: "Catering services",
      location: "Ibadan, Nigeria",
      description:
        "Experienced vendor with over 5 years in the industry. Committed to providing exceptional service quality and customer satisfaction.",
      yearsExperience: "5",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      coverImage:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=400&fit=crop",
      status: "Currently taking orders",
      availability: "Available now",
      rating: 4.8,
      totalReviews: 128,
      completedProjects: 247,
      repeatClients: 89,
      satisfactionRate: 98,
      address: "123 George Street, Akure Lane, Ondo State",
      responseTime: "Within 2 hours",
      activeWithin: "Within 15 km of Ibadan",
      languages: ["English (Native)", "Yoruba (Fluent)"],
      services: [
        "Restaurant Vendor",
        "Catering Services",
        "Event Planning",
        "Food Delivery",
      ],
      specialties: [
        "Traditional Cuisine",
        "Corporate Events",
        "Wedding Catering",
        "Private Dining",
      ],
      certifications: [
        "Food Safety Certified",
        "Health Department Approved",
        "5-Star Rating",
      ],
      businessName: "Vendor's Kitchen",
      hourlyRate: "₦5,000 - ₦10,000",
      minOrder: "₦15,000",
      businessHours: "8:00 AM - 10:00 PM",
      deliveryAvailable: true,
      onlineBookings: true,
      listings: [
        {
          id: 1,
          title: "Jagz Hotel and Suite",
          description: "Luxury hotel with premium amenities",
          price: "#28,000/night",
          pricePer: "night",
          rating: 4.8,
          reviews: 12,
          location: "Moiete, RD 6 Ibadan",
          image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
          category: "Property",
          status: "Active",
        },
        {
          id: 2,
          title: "Golden Tulip Restaurant",
          description: "Fine dining experience with traditional cuisine",
          price: "#50,000 per event",
          pricePer: "event",
          rating: 4.7,
          reviews: 8,
          location: "Jericho, Ibadan",
          image:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
          category: "Restaurant",
          status: "Active",
        },
        {
          id: 3,
          title: "Ibadan Central Catering",
          description: "Professional catering for all occasions",
          price: "#70,000 per package",
          pricePer: "package",
          rating: 4.8,
          reviews: 15,
          location: "Bodija, Ibadan",
          image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
          category: "Catering",
          status: "Active",
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
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
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
          customer: "Sole Fadipe Jr.",
          address: "Iron man street",
          orderId: "#290888890",
          service: "Hotel Booking",
          amount: "#20,000",
          status: "Completed",
          date: "Today",
          productType: "Product",
        },
        {
          id: 2,
          customer: "Bankole Johansson",
          address: "Bodija",
          orderId: "#888800",
          service: "Event Centre",
          amount: "#45,000",
          status: "Complete",
          date: "Restart",
          productType: "Product",
        },
      ],
      reviews: [
        {
          id: 1,
          name: "John Doe",
          text: "Amazing experience! The vendor was professional and delivered beyond expectations. Highly recommend their services!",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          rating: 5,
          date: "2 days ago",
        },
        {
          id: 2,
          name: "Jane Smith",
          text: "Great service and friendly staff. The attention to detail was exceptional. Will definitely work with them again!",
          image: "https://randomuser.me/api/portraits/women/47.jpg",
          rating: 4,
          date: "1 week ago",
        },
      ],
    };

    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (locationData) {
        return {
          ...defaultVendor,
          ...parsed,
          firstName:
            locationData.firstName ||
            parsed.firstName ||
            defaultVendor.firstName,
          lastName:
            locationData.lastName || parsed.lastName || defaultVendor.lastName,
          fullName:
            locationData.fullName || parsed.fullName || defaultVendor.fullName,
          email: locationData.email || parsed.email || defaultVendor.email,
          phone: locationData.phone || parsed.phone || defaultVendor.phone,
          businessType:
            locationData.businessType ||
            parsed.businessType ||
            defaultVendor.businessType,
          workType:
            locationData.workType || parsed.workType || defaultVendor.workType,
          location:
            locationData.location || parsed.location || defaultVendor.location,
          description:
            locationData.description ||
            parsed.description ||
            defaultVendor.description,
          yearsExperience:
            locationData.yearsExperience ||
            parsed.yearsExperience ||
            defaultVendor.yearsExperience,
        };
      }
      return { ...defaultVendor, ...parsed };
    }

    if (locationData) {
      return {
        ...defaultVendor,
        id: Date.now(),
        firstName: locationData.firstName || defaultVendor.firstName,
        lastName: locationData.lastName || defaultVendor.lastName,
        fullName: locationData.fullName || defaultVendor.fullName,
        email: locationData.email || defaultVendor.email,
        phone: locationData.phone || defaultVendor.phone,
        businessType: locationData.businessType || defaultVendor.businessType,
        workType: locationData.workType || defaultVendor.workType,
        location: locationData.location || defaultVendor.location,
        yearsExperience:
          locationData.yearsExperience || defaultVendor.yearsExperience,
        description: locationData.description || defaultVendor.description,
        registrationDate: new Date().toISOString(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        activeWithin: `Within 15 km of ${
          locationData.location?.split(",")[0] || "your location"
        }`,
        services: [locationData.workType || "Your service"],
        businessName: `${locationData.firstName}'s ${
          (locationData.workType || "").split(" ")[0] || "Business"
        }`,
      };
    }

    return defaultVendor;
  };

  const [vendor, setVendor] = useState(getInitialVendor);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);

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

  // Card Component for stats
  const StatCard = ({ title, value, change, icon: Icon }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon size={24} className="text-blue-500" />
      </div>
      <div className="flex items-center gap-1 text-sm">
        <span
          className={`font-medium ${
            change && change.startsWith("+") ? "text-green-600" : "text-red-600"
          }`}
        >
          {change || "from last month"}
        </span>
        <span className="text-gray-500">{!change && "from last month"}</span>
      </div>
    </div>
  );

  // Sidebar Navigation Item
  const NavItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 w-full text-left transition-colors ${
        isActive
          ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
          : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Dashboard View
  const DashboardView = () => {
    // Ensure bookings exists and is an array
    const bookings = vendor.bookings || [];

    return (
      <div className="space-y-8 ">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value="#250,005.34"
              change="+12%"
              icon={DollarSign}
            />
            <StatCard title="Active Listing" value="3" icon={Package} />
            <StatCard
              title="Total Booking"
              value="1"
              change="+5 from last month"
              icon={Calendar}
            />
            <StatCard
              title="Average Rating"
              value="4.9"
              change="+0.5 from last month"
              icon={Star}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Bookings
          </h2>
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <div
                  key={booking.id || index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.customer}
                      </p>
                      <p className="text-sm text-gray-600">{booking.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-600">{booking.orderId}</p>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.service}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.productType || "Product"}
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === "Completed" ||
                        booking.status === "Complete"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {booking.status}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {booking.date}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bookings found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Listing View
  const ListingView = () => {
    const listings = vendor.listings || [];

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
              <p className="text-sm text-gray-600">
                Manage your properties and services
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
              <Plus size={18} />
              Add Listing
            </button>
          </div>
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search Listings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Listing
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Rating
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Act
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.length > 0 ? (
                  listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {listing.title}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={12} />
                            {listing.location}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {listing.category}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {listing.price}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {renderStars(listing.rating || 0)}
                          <span className="text-xs text-gray-500">
                            ({listing.reviews || 0})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block">
                          {listing.status || "Active"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-red-600 transition">
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No listings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Customer View
  const CustomerView = () => {
    const customers = vendor.customers || [];

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Customers</h2>
              <p className="text-sm text-gray-600">
                View and manage your customer relationships
              </p>
            </div>
          </div>
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                <div
                  key={customer.id || index}
                  className="border border-blue-100 rounded-xl p-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {customer.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Bookings</p>
                      <p className="font-semibold text-gray-900">
                        {customer.bookings || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Spent</p>
                      <p className="font-semibold text-gray-900">
                        {customer.totalSpent || "#0"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No customers found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Booking View
  const BookingView = () => {
    const listings = vendor.listings || [];

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
              <p className="text-sm text-gray-600">
                Manage your booking requests and reservations
              </p>
            </div>
          </div>
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div className="space-y-4">
            {listings.length > 0 ? (
              listings.slice(0, 1).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {listing.title}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={12} />
                        {listing.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm text-gray-600">Property</div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {listing.price}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bookings found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Settings View
  const SettingsView = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
        <p className="text-sm text-gray-600 mb-6">
          Manage your account and preferences
        </p>

        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Edit Profile
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={vendor.fullName || ""}
                onChange={(e) =>
                  setVendor({ ...vendor, fullName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={vendor.email || ""}
                onChange={(e) =>
                  setVendor({ ...vendor, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={vendor.description || ""}
                onChange={(e) =>
                  setVendor({ ...vendor, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  value={vendor.firstName || ""}
                  onChange={(e) =>
                    setVendor({ ...vendor, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={
                    vendor.location?.split(",")[0] || vendor.location || ""
                  }
                  onChange={(e) =>
                    setVendor({ ...vendor, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              We specialize in luxury coastal properties and mountain retreats.
              Our properties are carefully selected to provide the best
              experience for our guests.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-manrope">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 h-screen fixed">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">ajani</h1>
          </div>
          <nav className="space-y-2">
            <NavItem
              icon={Home}
              label="Overview"
              isActive={activeView === "dashboard" && !showSettings}
              onClick={() => {
                setActiveView("dashboard");
                setShowSettings(false);
              }}
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
      </div>

      {/* Main Content */}
      <div className="flex-grow ml-64">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
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
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search for something"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-64"
                />
              </div>
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  if (!showSettings) setActiveView("settings");
                }}
                className={`p-2 transition ${
                  showSettings
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Settings size={20} />
              </button>
              <div className="relative">
                <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src={vendor.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </button>
              </div>
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
        <Footer />
      </div>
    </div>
  );
};

export default VendorDashboard;
