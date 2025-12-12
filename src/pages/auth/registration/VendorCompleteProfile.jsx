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
} from "lucide-react";
// import Logo from "../../assets/Logos/logo5.png";

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
        totalReviews: 0,
        completedProjects: 0,
        repeatClients: 0,
        satisfactionRate: 0,

        // Additional Info
        address: locationData.location,
        responseTime: "Within 2 hours",
        activeWithin: `Within 15 km of ${
          locationData.location?.split(",")[0] || "your location"
        }`,
        languages: ["English", "Yoruba"],
        services: [locationData.workType || "Your service"],
        specialties: [],
        certifications: [],

        // Business Details
        businessName: `${locationData.firstName}'s ${
          (locationData.workType || "").split(" ")[0] || "Business"
        }`,
        hourlyRate: "₦0 - ₦0",
        minOrder: "₦0",

        // Empty arrays
        listings: [],
        reviews: [],
      };
    }

    // Default fallback
    return {
      firstName: "Vendor",
      lastName: "Name",
      fullName: "Vendor Name",
      email: "",
      phone: "",
      businessType: "restaurant",
      workType: "Catering services",
      location: "Ibadan, Nigeria",
      description: "",
      yearsExperience: "",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      coverImage:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=400&fit=crop",
      status: "Currently taking orders",
      availability: "Available now",
      rating: 4.8,
      totalReviews: 0,
      address: "",
      responseTime: "Within 2 hours",
      activeWithin: "Within 15 km",
      languages: ["English", "Yoruba"],
      services: [],
      specialties: [],
      certifications: [],
      businessName: "",
      hourlyRate: "₦0 - ₦0",
      minOrder: "₦0",
      listings: [],
      reviews: [],
      completedProjects: 0,
      repeatClients: 0,
      satisfactionRate: 0,
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
    </div>
  );

  const StatsCard = ({ icon: Icon, value, label, color = "blue" }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-50`}>
          <Icon className={`text-${color}-600`} size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
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
              <h1 className="text-xl font-bold text-gray-900">
                Vendor Profile
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition"
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
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
                            First Name
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
                            Last Name
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
                            Email
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
                            Phone
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
                          Address
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
                          Business Description
                        </label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleInputChange}
                          className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Business Information
              </h2>

              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
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
                      Business Type
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
                      Work Type
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
                      Years Experience
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
                      Hourly Rate
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
                      Minimum Order
                    </label>
                    <input
                      type="text"
                      name="minOrder"
                      value={form.minOrder}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services (comma separated)
                    </label>
                    <input
                      type="text"
                      name="services"
                      value={form.services}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties (comma separated)
                    </label>
                    <input
                      type="text"
                      name="specialties"
                      value={form.specialties}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
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
                            {vendor.yearsExperience}
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
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
                  icon={Phone}
                  value={vendor.repeatClients}
                  label="Repeat Clients"
                  color="purple"
                />
                <StatsCard
                  icon={Star}
                  value={`${vendor.satisfactionRate}%`}
                  label="Satisfaction Rate"
                  color="blue"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Additional Info
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Member Since
                  </h3>
                  <p className="text-gray-900 font-semibold">
                    {vendor.memberSince}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Active Area
                  </h3>
                  <p className="text-gray-900 font-semibold">
                    {vendor.activeWithin}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Response Time
                  </h3>
                  <p className="text-gray-900 font-semibold">
                    {vendor.responseTime}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Status</h3>
                  <p className="text-green-600 font-semibold">
                    {vendor.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Summary */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-3">
                Registration Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Name:</span>
                  <span className="font-medium">{vendor.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Email:</span>
                  <span className="font-medium">{vendor.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Phone:</span>
                  <span className="font-medium">{vendor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Business Type:</span>
                  <span className="font-medium">{vendor.businessType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Member Since:</span>
                  <span className="font-medium">{vendor.memberSince}</span>
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
