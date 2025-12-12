import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Star,
  Edit2,
  ArrowLeft,
  Trash2,
  Plus,
  Camera,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bookmark,
  Settings,
  Clock,
  CheckCircle,
  Award,
  Users,
  DollarSign,
  Package,
} from "lucide-react";
import Logo from "../../assets/Logos/logo5.png";

const VendorCompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load vendor data from localStorage or location state
  const getInitialVendor = () => {
    const locationData = location.state;
    const savedProfile = localStorage.getItem("vendorCompleteProfile");

    // Merge registration data with saved profile
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);

      if (locationData) {
        // Update with latest registration data
        return {
          ...parsed,
          firstName: locationData.firstName || parsed.firstName,
          lastName: locationData.lastName || parsed.lastName,
          fullName: locationData.fullName || parsed.fullName,
          email: locationData.email || parsed.email,
          phone: locationData.phone || parsed.phone,
          businessType: locationData.businessType || parsed.businessType,
          workType: locationData.workType || parsed.workType,
          location: locationData.location || parsed.location,
          description: locationData.description || parsed.description,
          yearsExperience:
            locationData.yearsExperience || parsed.yearsExperience,
        };
      }
      return parsed;
    }

    // Create from registration data if no saved profile
    if (locationData) {
      return {
        // Basic Info
        id: Date.now(),
        firstName: locationData.firstName,
        lastName: locationData.lastName,
        fullName: locationData.fullName,
        email: locationData.email,
        phone: locationData.phone,

        // Business Info
        businessType: locationData.businessType,
        workType: locationData.workType,
        location: locationData.location,
        yearsExperience: locationData.yearsExperience,
        description: locationData.description,

        // Profile Info
        registrationDate: new Date().toISOString(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
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

        // Additional Info
        address: locationData.location,
        responseTime: "Within 2 hours",
        activeWithin: `Within 15 km of ${
          locationData.location?.split(",")[0] || "your location"
        }`,
        languages: ["English (Native)", "Yoruba (Fluent)"],
        services: [locationData.workType || "Your service"],
        specialties: [
          "Traditional Cuisine",
          "Corporate Events",
          "Wedding Catering",
        ],
        certifications: [
          "Food Safety Certified",
          "Health Department Approved",
          "5-Star Rating",
        ],

        // Business Details
        businessName: `${locationData.firstName}'s ${
          (locationData.workType || "").split(" ")[0] || "Business"
        }`,
        hourlyRate: "₦5,000 - ₦10,000",
        minOrder: "₦15,000",
        businessHours: "8:00 AM - 10:00 PM",
        deliveryAvailable: true,
        onlineBookings: true,

        // Listings
        listings: [
          {
            id: 1,
            title: "Golden Tulip Restaurant",
            description: "Fine dining experience with traditional cuisine",
            price: "₦50,000 per event",
            rating: 4.7,
            location: "Jericho, Ibadan",
            image:
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
            category: "Restaurant",
            featured: true,
          },
          {
            id: 2,
            title: "Ibadan Central Catering",
            description: "Professional catering for all occasions",
            price: "₦70,000 per package",
            rating: 4.8,
            location: "Bodija, Ibadan",
            image:
              "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
            category: "Catering",
            featured: true,
          },
          {
            id: 3,
            title: "Royal Palace Events",
            description: "Wedding and event planning services",
            price: "₦60,000 per service",
            rating: 4.5,
            location: "Mokola, Ibadan",
            image:
              "https://images.unsplash.com/photo-1519677100203-7c61d0b01354?w=400&h=300&fit=crop",
            category: "Events",
            featured: false,
          },
        ],

        // Reviews
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
          {
            id: 3,
            name: "Mike Johnson",
            text: "Clean and professional work. They completed the project on time and within budget. Very satisfied!",
            image: "https://randomuser.me/api/portraits/men/58.jpg",
            rating: 5,
            date: "2 weeks ago",
          },
        ],
      };
    }

    // Default fallback
    return {
      firstName: "Vendor",
      lastName: "Name",
      fullName: "Vendor Name",
      email: "vendor@example.com",
      phone: "+234 812 345 6789",
      businessType: "restaurant",
      workType: "Catering services",
      location: "Ibadan, Nigeria",
      description:
        "Experienced vendor with over 5 years in the industry. Committed to providing exceptional service quality and customer satisfaction. Specializing in restaurant services and catering with attention to detail and timely delivery.",
      yearsExperience: "5",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      coverImage:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=400&fit=crop",
      status: "Currently taking orders",
      availability: "Available now",
      rating: 4.8,
      totalReviews: 128,
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
      listings: [],
      reviews: [],
      completedProjects: 247,
      repeatClients: 89,
      satisfactionRate: 98,
    };
  };

  const [vendor, setVendor] = useState(getInitialVendor);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    fullName: vendor.fullName,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    description: vendor.description,
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    workType: vendor.workType,
    location: vendor.location,
    hourlyRate: vendor.hourlyRate,
    minOrder: vendor.minOrder,
    services: vendor.services.join(", "),
    specialties: vendor.specialties.join(", "),
    yearsExperience: vendor.yearsExperience,
    businessHours: vendor.businessHours,
  });

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const listingInputRef = useRef(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("vendorCompleteProfile", JSON.stringify(vendor));
  }, [vendor]);

  // Update form when vendor changes
  useEffect(() => {
    setForm({
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      fullName: vendor.fullName,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      description: vendor.description,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      workType: vendor.workType,
      location: vendor.location,
      hourlyRate: vendor.hourlyRate,
      minOrder: vendor.minOrder,
      services: vendor.services.join(", "),
      specialties: vendor.specialties.join(", "),
      yearsExperience: vendor.yearsExperience,
      businessHours: vendor.businessHours,
    });
  }, [vendor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "firstName" || name === "lastName"
        ? {
            fullName: `${name === "firstName" ? value : prev.firstName} ${
              name === "lastName" ? value : prev.lastName
            }`.trim(),
          }
        : {}),
    }));
  };

  const saveProfileChanges = () => {
    setVendor((prev) => ({
      ...prev,
      firstName: form.firstName,
      lastName: form.lastName,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      description: form.description,
      businessName: form.businessName,
      businessType: form.businessType,
      workType: form.workType,
      location: form.location,
      hourlyRate: form.hourlyRate,
      minOrder: form.minOrder,
      businessHours: form.businessHours,
      services: form.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      specialties: form.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
      yearsExperience: form.yearsExperience,
    }));
    setEditMode(false);
    alert("Profile updated successfully!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setVendor((prev) => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setVendor((prev) => ({ ...prev, coverImage: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddListing = () => {
    const newListing = {
      id: Date.now(),
      title: "New Listing",
      description: "Add your description here",
      price: "₦0",
      rating: 0,
      location: vendor.location,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
      category: "New",
      featured: false,
    };
    setVendor((prev) => ({
      ...prev,
      listings: [...prev.listings, newListing],
    }));
  };

  const removeListing = (id) => {
    if (window.confirm("Are you sure you want to remove this listing?")) {
      setVendor((prev) => ({
        ...prev,
        listings: prev.listings.filter((listing) => listing.id !== id),
      }));
    }
  };

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

  const StatsCard = ({ icon: Icon, value, label, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      purple: "bg-purple-50 text-purple-600",
      yellow: "bg-yellow-50 text-yellow-600",
    };

    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
          </div>
        </div>
      </div>
    );
  };

  const FeatureBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
      <Icon size={16} />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  const ListingCard = ({ listing }) => (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {listing.featured && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
        {editMode && (
          <button
            onClick={() => removeListing(listing.id)}
            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1">
          {listing.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {listing.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-green-600">{listing.price}</p>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(listing.rating)}
              <span className="text-xs text-gray-500">({listing.rating})</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {listing.category}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <MapPin size={12} />
            <span>{listing.location}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewCard = ({ review }) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <img
          src={review.image}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">{review.name}</h4>
            <span className="text-xs text-gray-500">{review.date}</span>
          </div>
          <div className="mt-1">{renderStars(review.rating)}</div>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-manrope">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Ajani Logo" className="h-10" />
              <h1 className="text-xl font-bold text-gray-900 hidden md:block">
                Vendor Profile
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setForm({
                        firstName: vendor.firstName,
                        lastName: vendor.lastName,
                        fullName: vendor.fullName,
                        email: vendor.email,
                        phone: vendor.phone,
                        address: vendor.address,
                        description: vendor.description,
                        businessName: vendor.businessName,
                        businessType: vendor.businessType,
                        workType: vendor.workType,
                        location: vendor.location,
                        hourlyRate: vendor.hourlyRate,
                        minOrder: vendor.minOrder,
                        services: vendor.services.join(", "),
                        specialties: vendor.specialties.join(", "),
                        yearsExperience: vendor.yearsExperience,
                        businessHours: vendor.businessHours,
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfileChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Cover Photo */}
        <div className="relative mb-8">
          <div className="h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-teal-400 relative">
            <img
              src={vendor.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {editMode && (
              <>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium"
                >
                  <Camera size={16} />
                  Change Cover
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${
                      editMode
                        ? "border-blue-200 cursor-pointer hover:border-blue-300"
                        : "border-gray-200"
                    }`}
                    onClick={() => editMode && avatarInputRef.current?.click()}
                  >
                    <img
                      src={vendor.avatar}
                      alt={vendor.fullName}
                      className="w-full h-full object-cover"
                    />
                    {editMode && (
                      <>
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                          <Camera className="text-white" size={32} />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg">
                          <Plus size={16} />
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={form.address}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Description *
                        </label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {vendor.fullName}
                        </h1>
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {vendor.availability}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin size={18} />
                          <span>{vendor.address || vendor.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={18} />
                          <span>{vendor.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={18} />
                          <span>{vendor.phone}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">
                        {vendor.description}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                          {renderStars(vendor.rating)}
                          <span className="font-semibold">{vendor.rating}</span>
                          <span className="text-sm">
                            ({vendor.totalReviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
                          <span className="font-semibold">
                            {vendor.responseTime} response time
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg">
                          <span className="font-semibold">
                            {vendor.activeWithin}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Business Information
                </h2>
                <div className="flex items-center gap-2">
                  {vendor.deliveryAvailable && (
                    <FeatureBadge icon={Package} text="Delivery Available" />
                  )}
                  {vendor.onlineBookings && (
                    <FeatureBadge icon={Calendar} text="Online Bookings" />
                  )}
                </div>
              </div>

              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Type *
                    </label>
                    <input
                      type="text"
                      name="businessType"
                      value={form.businessType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Type *
                    </label>
                    <input
                      type="text"
                      name="workType"
                      value={form.workType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years Experience *
                    </label>
                    <input
                      type="text"
                      name="yearsExperience"
                      value={form.yearsExperience}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate *
                    </label>
                    <input
                      type="text"
                      name="hourlyRate"
                      value={form.hourlyRate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order *
                    </label>
                    <input
                      type="text"
                      name="minOrder"
                      value={form.minOrder}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Hours *
                    </label>
                    <input
                      type="text"
                      name="businessHours"
                      value={form.businessHours}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services (comma separated) *
                    </label>
                    <input
                      type="text"
                      name="services"
                      value={form.services}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="e.g., Catering, Event Planning, Delivery"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties (comma separated) *
                    </label>
                    <input
                      type="text"
                      name="specialties"
                      value={form.specialties}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      placeholder="e.g., Traditional Cuisine, Wedding Catering"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Business Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Business Name:</span>
                          <span className="font-medium">
                            {vendor.businessName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Business Type:</span>
                          <span className="font-medium">
                            {vendor.businessType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Work Type:</span>
                          <span className="font-medium">{vendor.workType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{vendor.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Years Experience:
                          </span>
                          <span className="font-medium">
                            {vendor.yearsExperience} years
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hourly Rate:</span>
                          <span className="font-medium text-green-600">
                            {vendor.hourlyRate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Order:</span>
                          <span className="font-medium text-green-600">
                            {vendor.minOrder}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Business Hours:</span>
                          <span className="font-medium">
                            {vendor.businessHours}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm"
                          >
                            <CheckCircle size={14} />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Services Offered
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.services.map((service, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.languages.map((language, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Listings Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Listings
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Showcase your products and services
                  </p>
                </div>
                {editMode && (
                  <button
                    onClick={handleAddListing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus size={18} />
                    Add Listing
                  </button>
                )}
              </div>

              {vendor.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendor.listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No listings yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first listing to showcase your products or services
                  </p>
                  {editMode ? (
                    <button
                      onClick={handleAddListing}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add First Listing
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Enable Edit Mode to Add Listings
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Customer Reviews
                  </h2>
                  <p className="text-gray-600 mt-1">
                    What clients say about your services ({vendor.totalReviews}{" "}
                    reviews)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(vendor.rating)}
                  <span className="font-semibold text-gray-900">
                    {vendor.rating}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendor.reviews.slice(0, 3).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {vendor.reviews.length > 3 && (
                <div className="text-center mt-6">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    View All Reviews ({vendor.totalReviews})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bookmark size={20} />
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">View Bookings</span>
                      <span className="text-sm text-gray-600">
                        Check upcoming appointments
                      </span>
                    </div>
                  </div>
                  <ArrowLeft size={18} className="rotate-180" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign size={20} />
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">Earnings</span>
                      <span className="text-sm text-gray-600">
                        View revenue & analytics
                      </span>
                    </div>
                  </div>
                  <ArrowLeft size={18} className="rotate-180" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings size={20} />
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">Settings</span>
                      <span className="text-sm text-gray-600">
                        Account preferences
                      </span>
                    </div>
                  </div>
                  <ArrowLeft size={18} className="rotate-180" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock size={20} />
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">Availability</span>
                      <span className="text-sm text-gray-600">
                        Set working hours
                      </span>
                    </div>
                  </div>
                  <ArrowLeft size={18} className="rotate-180" />
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Performance Stats
              </h2>
              <div className="space-y-4">
                <StatsCard
                  icon={Star}
                  value={vendor.rating}
                  label="Average Rating"
                  color="yellow"
                />
                <StatsCard
                  icon={Calendar}
                  value={vendor.completedProjects}
                  label="Projects Completed"
                  color="green"
                />
                <StatsCard
                  icon={Users}
                  value={vendor.repeatClients}
                  label="Repeat Clients"
                  color="purple"
                />
                <StatsCard
                  icon={Award}
                  value={`${vendor.satisfactionRate}%`}
                  label="Satisfaction Rate"
                  color="blue"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Business Details
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <Calendar size={16} />
                    <span className="font-medium">Member Since</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {vendor.memberSince}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <MapPin size={16} />
                    <span className="font-medium">Active Area</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {vendor.activeWithin}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <Clock size={16} />
                    <span className="font-medium">Response Time</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {vendor.responseTime}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-700 mb-1">
                    <CheckCircle size={16} />
                    <span className="font-medium">Status</span>
                  </div>
                  <p className="text-green-600 font-semibold">
                    {vendor.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Features */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-4">
                Business Features
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Online Bookings</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Delivery Service</span>
                  <span className="font-medium text-green-600">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Verified Vendor</span>
                  <span className="font-medium text-green-600">Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Insurance Covered</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCompleteProfile;
