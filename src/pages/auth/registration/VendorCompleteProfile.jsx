import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

const DEFAULT_PROFILE_IMAGE =
  "https://randomuser.me/api/portraits/women/68.jpg";
const DEFAULT_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop";
const DEFAULT_REVIEW_IMAGES = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/47.jpg",
  "https://randomuser.me/api/portraits/men/58.jpg",
  "https://randomuser.me/api/portraits/women/75.jpg",
  "https://randomuser.me/api/portraits/men/77.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
];

const REVIEW_DATA = [
  {
    id: 1,
    name: "John Doe",
    text: "Amazing experience! The vendor was professional and delivered beyond expectations. Highly recommend their services!",
    image: DEFAULT_REVIEW_IMAGES[0],
    rating: 5,
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    text: "Great service and friendly staff. The attention to detail was exceptional. Will definitely work with them again!",
    image: DEFAULT_REVIEW_IMAGES[1],
    rating: 4,
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Mike Johnson",
    text: "Clean and professional work. They completed the project on time and within budget. Very satisfied!",
    image: DEFAULT_REVIEW_IMAGES[2],
    rating: 5,
    date: "2 weeks ago",
  },
  {
    id: 4,
    name: "Sara Williams",
    text: "Exceptional quality and communication throughout the process. A pleasure to work with!",
    image: DEFAULT_REVIEW_IMAGES[3],
    rating: 4,
    date: "3 weeks ago",
  },
  {
    id: 5,
    name: "Tom Brown",
    text: "Best vendor I have dealt with so far! They went above and beyond to ensure customer satisfaction.",
    image: DEFAULT_REVIEW_IMAGES[4],
    rating: 5,
    date: "1 month ago",
  },
  {
    id: 6,
    name: "Lisa Chen",
    text: "Professional, reliable, and high-quality work. Exceeded all my expectations. Thank you!",
    image: DEFAULT_REVIEW_IMAGES[5],
    rating: 4,
    date: "2 months ago",
  },
];

const VendorCompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get ALL registration data from location.state
  const formData = location.state || {};

  console.log("Received form data:", formData);

  // Helper function to extract email and phone
  const extractContactInfo = (contact) => {
    if (!contact) return { email: "", phone: "" };

    const isEmail = contact.includes("@");
    return {
      email: isEmail ? contact : "",
      phone: isEmail ? "" : contact,
    };
  };

  // Default vendor data with form data
  const defaultVendorData = () => {
    const { email, phone } = extractContactInfo(formData.contact);

    return {
      // Registration data
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      fullName:
        `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
        "Vendor Name",
      contact: formData.contact || "",
      email: email,
      phone: phone,
      password: formData.password || "",
      description: formData.description || "",

      // Profile data
      address: "123 George Street, Akure Lane, Ondo State",
      rating: 4.8,
      totalReviews: 128,
      status: "Currently taking urgent orders",
      availability: "Available now",
      avatar: DEFAULT_PROFILE_IMAGE,
      coverImage:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h-400&fit=crop",
      languages: [
        "English (Native)",
        "Yoruba (Fluent)",
        "Pidgin (Conversational)",
      ],
      memberSince: "January 2020",
      joinedDate: "2020-01-15",
      activeWithin: "Within 14 km of Ibadan",
      responseTime: "Within 2 hours",
      about:
        formData.description ||
        "Experienced vendor with over 5 years in the industry. Committed to providing exceptional service quality and customer satisfaction. Specializing in restaurant services and catering with attention to detail and timely delivery.",
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

      // Business info
      businessName: `${formData.firstName || "Vendor"}'s Kitchen`,
      businessType: "Restaurant & Catering",
      yearsExperience: 5,
      hourlyRate: "₦5,000 - ₦10,000",
      minOrder: "₦15,000",

      // Listings (initially empty, will be added by user)
      listings: [],

      // Reviews
      reviews: REVIEW_DATA,

      // Stats
      completedProjects: 247,
      repeatClients: 89,
      satisfactionRate: 98,
    };
  };

  // Initialize state
  const [vendor, setVendor] = useState(() => {
    const stored = localStorage.getItem("vendorCompleteProfile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const { email, phone } = extractContactInfo(
          formData.contact || parsed.contact
        );

        return {
          ...defaultVendorData(),
          ...parsed,
          // Update with latest form data
          firstName: formData.firstName || parsed.firstName,
          lastName: formData.lastName || parsed.lastName,
          fullName:
            formData.firstName && formData.lastName
              ? `${formData.firstName} ${formData.lastName}`
              : parsed.fullName,
          contact: formData.contact || parsed.contact,
          email: email || parsed.email,
          phone: phone || parsed.phone,
          description: formData.description || parsed.description,
          about:
            formData.description || parsed.about || defaultVendorData().about,
          listings: Array.isArray(parsed.listings) ? parsed.listings : [],
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : REVIEW_DATA,
        };
      } catch (error) {
        console.error("Error parsing stored data:", error);
        return defaultVendorData();
      }
    }
    return defaultVendorData();
  });

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    fullName: vendor.fullName,
    contact: vendor.contact,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    about: vendor.about,
    description: vendor.description,
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    hourlyRate: vendor.hourlyRate,
    minOrder: vendor.minOrder,
    services: vendor.services.join(", "),
    specialties: vendor.specialties.join(", "),
  });

  // Refs for file inputs
  const avatarInputRef = useRef(null);
  const listingInputRef = useRef(null);
  const reviewInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Save to localStorage whenever vendor changes
  useEffect(() => {
    localStorage.setItem("vendorCompleteProfile", JSON.stringify(vendor));
    console.log("Saved to localStorage:", vendor);
  }, [vendor]);

  // Update form when vendor changes
  useEffect(() => {
    setForm({
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      fullName: vendor.fullName,
      contact: vendor.contact,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      about: vendor.about,
      description: vendor.description,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      hourlyRate: vendor.hourlyRate,
      minOrder: vendor.minOrder,
      services: vendor.services.join(", "),
      specialties: vendor.specialties.join(", "),
    });
  }, [vendor]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Update fullName when first or last name changes
      ...(name === "firstName" || name === "lastName"
        ? {
            fullName: `${name === "firstName" ? value : prev.firstName} ${
              name === "lastName" ? value : prev.lastName
            }`.trim(),
          }
        : {}),
    }));
  };

  // Save profile changes
  const saveProfileChanges = () => {
    setVendor((prev) => ({
      ...prev,
      firstName: form.firstName,
      lastName: form.lastName,
      fullName: form.fullName,
      contact: form.contact,
      email: form.email,
      phone: form.phone,
      address: form.address,
      about: form.about,
      description: form.description,
      businessName: form.businessName,
      businessType: form.businessType,
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
    }));
    setEditMode(false);
    alert("Profile changes saved!");
  };

  // Avatar upload
  const handleAvatarClick = () => {
    if (editMode) avatarInputRef.current?.click();
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

  // Cover image upload
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

  // Listing image upload (6 images with add button)
  const handleAddListingImage = () => {
    if (editMode && vendor.listings.length < 6) {
      listingInputRef.current?.click();
    }
  };

  const handleListingImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newListing = {
        id: Date.now(),
        title: `Listing ${vendor.listings.length + 1}`,
        description: "New listing added by vendor",
        price: "₦0",
        rating: 0,
        location: "Ibadan, Nigeria",
        image: event.target.result,
        category: "Restaurant",
        featured: false,
      };
      setVendor((prev) => ({
        ...prev,
        listings: [...prev.listings, newListing].slice(0, 6),
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove listing image
  const removeListingImage = (id) => {
    if (window.confirm("Are you sure you want to remove this listing?")) {
      setVendor((prev) => ({
        ...prev,
        listings: prev.listings.filter((listing) => listing.id !== id),
      }));
    }
  };

  // Add review with image (6th card)
  const handleAddReviewImage = () => {
    if (editMode) reviewInputRef.current?.click();
  };

  const handleReviewImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newReview = {
        id: Date.now(),
        name: "New Customer",
        text: "Great experience with this vendor!",
        image: event.target.result,
        rating: 5,
        date: "Just now",
      };
      setVendor((prev) => ({
        ...prev,
        reviews: [...prev.reviews, newReview],
      }));
    };
    reader.readAsDataURL(file);
  };

  // Remove review
  const removeReview = (id) => {
    if (window.confirm("Are you sure you want to remove this review?")) {
      setVendor((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((review) => review.id !== id),
      }));
    }
  };

  // Navigate back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Render stars for ratings
  const renderStars = (rating) => {
    return (
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
  };

  // Display contact information properly
  const displayContactInfo = () => {
    if (vendor.email && vendor.phone) {
      return `${vendor.email} | ${vendor.phone}`;
    }
    return vendor.email || vendor.phone || vendor.contact || "No contact info";
  };

  // Listing Card Component
  const ListingCard = ({ listing, index }) => (
    <div className="relative group w-full max-w-[240px] shrink-0">
      <div className="w-full h-[180px] rounded-xl overflow-hidden bg-gray-200 relative">
        <img
          src={listing.image || DEFAULT_LISTING_IMAGE}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {editMode && (
          <>
            <button
              onClick={() => removeListingImage(listing.id)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
              title="Remove listing"
              aria-label="Remove listing"
            >
              <X size={16} />
            </button>
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="text-white" size={24} />
            </div>
          </>
        )}
        {index === 5 && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            6th Image
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
          {listing.title}
        </h4>
        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
          {listing.description}
        </p>
        <p className="text-sm font-medium text-green-600 mt-1">
          {listing.price}
        </p>
        <div className="flex items-center justify-between mt-2">
          {renderStars(listing.rating)}
          <span className="text-xs text-gray-500">{listing.location}</span>
        </div>
      </div>
    </div>
  );

  // Review Card Component
  const ReviewCard = ({ review }) => (
    <div className="relative group w-full max-w-[200px] shrink-0">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition h-full">
        <div className="relative">
          <img
            src={review.image}
            alt={review.name}
            className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-blue-100"
          />
          {editMode && (
            <button
              onClick={() => removeReview(review.id)}
              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition opacity-0 group-hover:opacity-100"
              title="Remove review"
              aria-label="Remove review"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <h5 className="font-semibold text-gray-900 text-sm">{review.name}</h5>
        <div className="my-2">{renderStars(review.rating)}</div>
        <p className="text-xs text-gray-600 line-clamp-3 flex-grow">
          {review.text}
        </p>
        <span className="text-xs text-gray-500 mt-2">{review.date}</span>
      </div>
    </div>
  );

  // Stats Card Component
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

  // Reset all data
  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all profile data? This cannot be undone."
      )
    ) {
      localStorage.removeItem("vendorCompleteProfile");
      setVendor(defaultVendorData());
      alert("Profile data has been reset!");
    }
  };

  // Load sample listings
  const loadSampleListings = () => {
    const sampleListings = [
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
      {
        id: 4,
        title: "Traditional Kitchen",
        description: "Authentic Nigerian dishes delivery",
        price: "₦3,500 per meal",
        rating: 4.9,
        location: "UI Area, Ibadan",
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        category: "Delivery",
        featured: true,
      },
      {
        id: 5,
        title: "Corporate Lunch Packages",
        description: "Office catering and meal plans",
        price: "₦25,000 per month",
        rating: 4.6,
        location: "Ring Road, Ibadan",
        image:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
        category: "Corporate",
        featured: false,
      },
    ];

    setVendor((prev) => ({
      ...prev,
      listings: sampleListings,
    }));
    alert("Sample listings loaded!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-manrope">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                src="/assets/Logos/logo5.png"
                alt="Ajani Logo"
                className="h-10 cursor-pointer"
                onClick={() => window.location.reload()}
              />
              <h1 className="text-xl font-bold text-gray-900 hidden md:block">
                Vendor Profile
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGoBack}
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
                        contact: vendor.contact,
                        email: vendor.email,
                        phone: vendor.phone,
                        address: vendor.address,
                        about: vendor.about,
                        description: vendor.description,
                        businessName: vendor.businessName,
                        businessType: vendor.businessType,
                        hourlyRate: vendor.hourlyRate,
                        minOrder: vendor.minOrder,
                        services: vendor.services.join(", "),
                        specialties: vendor.specialties.join(", "),
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

      {/* Data Summary Banner */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Welcome,</span>
                <span className="font-semibold text-blue-800 ml-2">
                  {vendor.fullName}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm">
                {vendor.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    <span className="text-gray-700">{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-gray-700">{vendor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500" />
                  <span className="text-gray-700">
                    Member since {vendor.memberSince}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadSampleListings}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
              >
                Load Sample Listings
              </button>
              <button
                onClick={handleResetData}
                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Photo Section */}
        <div className="relative mb-8">
          <div className="h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-teal-400 relative">
            {vendor.coverImage ? (
              <img
                src={vendor.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Camera size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Add a cover photo</p>
                </div>
              </div>
            )}
            {editMode && (
              <>
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Camera size={16} />
                  {vendor.coverImage ? "Change Cover" : "Add Cover"}
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
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar with camera icon */}
                <div className="relative">
                  <div
                    className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${
                      editMode
                        ? "border-blue-200 cursor-pointer hover:border-blue-300"
                        : "border-gray-200"
                    }`}
                    onClick={handleAvatarClick}
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
                            placeholder="First Name"
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
                            placeholder="Last Name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact (Email or Phone)
                        </label>
                        <input
                          type="text"
                          name="contact"
                          value={form.contact}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                          placeholder="Email or Phone Number"
                        />
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
                          placeholder="Business Address"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          About You
                        </label>
                        <textarea
                          name="about"
                          value={form.about}
                          onChange={handleInputChange}
                          className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                          placeholder="Tell us about your business and experience..."
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
                          <span>{vendor.address}</span>
                        </div>
                        {vendor.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={18} />
                            <span>{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={18} />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">
                        {vendor.about}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                          <Star
                            size={18}
                            className="text-yellow-500"
                            fill="#F59E0B"
                          />
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
                      placeholder="Business Name"
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
                      placeholder="Business Type"
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
                      placeholder="e.g., ₦5,000 - ₦10,000"
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
                      placeholder="e.g., ₦15,000"
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
                      placeholder="e.g., Catering, Event Planning, Delivery"
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
                          <span className="text-gray-600">
                            Years Experience:
                          </span>
                          <span className="font-medium">
                            {vendor.yearsExperience}+ years
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
                            className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                          >
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
                  </div>
                </div>
              )}
            </div>

            {/* Listings Section - 6 Images */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Listings
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Showcase your work with up to 6 images
                  </p>
                </div>
                {editMode && (
                  <button
                    onClick={handleAddListingImage}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    disabled={vendor.listings.length >= 6}
                  >
                    <Plus size={18} />
                    Add Listing {vendor.listings.length}/6
                  </button>
                )}
              </div>

              {vendor.listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendor.listings.map((listing, index) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      index={index}
                    />
                  ))}

                  {/* Add button for remaining slots */}
                  {editMode &&
                    vendor.listings.length < 6 &&
                    Array.from({ length: 6 - vendor.listings.length }).map(
                      (_, index) => (
                        <button
                          key={`add-${index}`}
                          onClick={handleAddListingImage}
                          className="w-full h-[300px] border-3 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
                        >
                          <Plus size={48} className="mb-2" />
                          <span className="text-sm font-medium">
                            Add Listing Image
                          </span>
                          <span className="text-xs mt-1">
                            ({vendor.listings.length + index + 1}/6)
                          </span>
                        </button>
                      )
                    )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera size={64} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No listings yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first listing to showcase your work
                  </p>
                  {editMode ? (
                    <button
                      onClick={handleAddListingImage}
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
              <input
                type="file"
                accept="image/*"
                ref={listingInputRef}
                onChange={handleListingImageChange}
                className="hidden"
              />
            </div>

            {/* Reviews Section - 6 Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Customer Reviews
                  </h2>
                  <p className="text-gray-600 mt-1">
                    What clients say about your services
                  </p>
                </div>
                {editMode && (
                  <button
                    onClick={handleAddReviewImage}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add Review
                  </button>
                )}
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 px-2">
                {vendor.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}

                {/* Add Review Card (6th card) */}
                {editMode && (
                  <button
                    onClick={handleAddReviewImage}
                    className="w-[200px] h-[280px] border-3 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition shrink-0"
                  >
                    <Plus size={48} className="mb-2" />
                    <span className="text-sm font-medium">Add Review</span>
                    <span className="text-xs mt-1">
                      Click to add new review
                    </span>
                  </button>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={reviewInputRef}
                onChange={handleReviewImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Right Column - Stats & Info */}
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

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  <span className="font-medium">
                    {editMode ? "Exit Edit Mode" : "Edit Profile"}
                  </span>
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  <span className="font-medium">Go to Dashboard</span>
                  <ArrowLeft size={18} className="rotate-180" />
                </button>
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center justify-between p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                >
                  <span className="font-medium">Reset All Data</span>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Languages
              </h2>
              <div className="space-y-3">
                {vendor.languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{language}</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
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

            {/* Local Storage Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-3">
                Local Storage Status
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Profile Data:</span>
                  <span className="font-medium text-green-600">Saved</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Listings:</span>
                  <span className="font-medium">
                    {vendor.listings.length}/6
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Reviews:</span>
                  <span className="font-medium">{vendor.reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Last Updated:</span>
                  <span className="font-medium">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  All data is automatically saved to your browser's local
                  storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <p>Vendor Profile • All data stored locally in your browser</p>
              <p className="mt-1">
                Registration data from: {vendor.firstName} {vendor.lastName} •{" "}
                {displayContactInfo()}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Print Profile
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(vendor, null, 2);
                  const dataUri =
                    "data:application/json;charset=utf-8," +
                    encodeURIComponent(dataStr);
                  const link = document.createElement("a");
                  link.setAttribute("href", dataUri);
                  link.setAttribute("download", "vendor-profile.json");
                  link.click();
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCompleteProfile;
