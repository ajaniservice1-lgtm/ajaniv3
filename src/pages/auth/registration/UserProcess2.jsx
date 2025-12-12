import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Bookmark, Star, Clock, Settings } from "lucide-react";
import Logo from "../../../assets/Logos/logo5.png";

const UserProcess2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Default profile images for variety
  const defaultProfileImages = [
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  ];

  // Initialize user from localStorage or registration data
  const getInitialUser = () => {
    const savedProfile = localStorage.getItem("userProfile");
    const tempData = JSON.parse(localStorage.getItem("tempUserData") || "null");
    const locationData = location.state;

    if (locationData && locationData.fromRegistration) {
      // Use registration data
      return {
        firstName: locationData.firstName,
        lastName: locationData.lastName,
        fullName:
          locationData.fullName ||
          `${locationData.firstName} ${locationData.lastName}`,
        phone: locationData.phone,
        email: locationData.email,
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        about:
          "Welcome to Ajani! Start exploring verified vendors and share your experiences.",
        image:
          defaultProfileImages[
            Math.floor(Math.random() * defaultProfileImages.length)
          ],
        stats: {
          vendorsSaved: 0,
          reviewsWritten: 0,
          bookingsMade: 0,
        },
      };
    } else if (savedProfile) {
      // Use saved profile
      const parsed = JSON.parse(savedProfile);
      return {
        ...parsed,
        image:
          parsed.image ||
          defaultProfileImages[
            Math.floor(Math.random() * defaultProfileImages.length)
          ],
      };
    } else if (tempData) {
      // Use temporary registration data
      return {
        firstName: tempData.firstName,
        lastName: tempData.lastName,
        fullName:
          tempData.fullName || `${tempData.firstName} ${tempData.lastName}`,
        phone: tempData.phone,
        email: tempData.email,
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        about:
          "Welcome to Ajani! Start exploring verified vendors and share your experiences.",
        image:
          defaultProfileImages[
            Math.floor(Math.random() * defaultProfileImages.length)
          ],
        stats: {
          vendorsSaved: 0,
          reviewsWritten: 0,
          bookingsMade: 0,
        },
      };
    }

    // Default fallback
    return {
      firstName: "User",
      lastName: "Profile",
      fullName: "User Profile",
      phone: "",
      email: "",
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      about:
        "Welcome to Ajani! Start exploring verified vendors and share your experiences.",
      image:
        defaultProfileImages[
          Math.floor(Math.random() * defaultProfileImages.length)
        ],
      stats: {
        vendorsSaved: 0,
        reviewsWritten: 0,
        bookingsMade: 0,
      },
    };
  };

  const [user, setUser] = useState(getInitialUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    about: user.about,
    image: user.image,
  });

  // Update form when user changes
  useEffect(() => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      about: user.about,
      image: user.image,
    });
  }, [user]);

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm({ ...form, image: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
      about: form.about.trim(),
      image: form.image,
    };

    setUser(updatedUser);
    setEditMode(false);

    // Update in localStorage
    localStorage.setItem("userProfile", JSON.stringify(updatedUser));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    // Show success message
    alert("Profile updated successfully!");
  };

  const handleRandomImage = () => {
    const randomImage =
      defaultProfileImages[
        Math.floor(Math.random() * defaultProfileImages.length)
      ];
    setForm({ ...form, image: randomImage });
  };

  // Handler for Saved Listings button
  const handleSavedListingsClick = () => {
    navigate("/register/user/process3");
  };

  // Handler for My Reviews button
  const handleMyReviewsClick = () => {
    navigate("/register/user/reviews");
  };

  // Handler for Booking History button
  const handleBookingHistoryClick = () => {
    navigate("/register/user/bookings");
  };

  // Handler for Settings button
  const handleSettingsClick = () => {
    navigate("/register/user/settings");
  };

  // Load user stats
  const loadUserStats = () => {
    const savedListings = JSON.parse(
      localStorage.getItem("userSavedListings") || "[]"
    );
    const reviews = JSON.parse(localStorage.getItem("userReviews") || "[]");
    const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");

    return {
      vendorsSaved: savedListings.length,
      reviewsWritten: reviews.length,
      bookingsMade: bookings.length,
    };
  };

  const [stats, setStats] = useState(loadUserStats());

  // Update stats when component mounts
  useEffect(() => {
    setStats(loadUserStats());

    // Update user stats
    setUser((prev) => ({
      ...prev,
      stats: loadUserStats(),
    }));
  }, []);

  return (
    <div className="min-h-screen bg-white font-manrope flex flex-col">
      {/* Header with Logo */}
      <header className="w-full py-4 px-4 sm:px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Ajani Logo" className="h-10" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ajani</h1>
              <p className="text-xs text-gray-600">
                Verified Vendors & Local Stories
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome back,</p>
            <p className="font-semibold text-gray-900">{user.firstName}</p>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        {/* Edit Button */}
        <div className="flex justify-end mb-6 md:mb-8">
          {editMode ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    about: user.about,
                    image: user.image,
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#00d37f] text-white px-5 py-2 rounded-md shadow hover:bg-[#02be72] transition font-medium"
              >
                Save Profile
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-[#00d37f] text-white px-5 py-2 rounded-md shadow hover:bg-[#02be72] transition font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* TOP SECTION: PROFILE */}
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 items-center sm:items-start mb-8 md:mb-12">
          {/* Profile Image Container */}
          <div className="relative">
            <div className="w-[226px] h-[226px] rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
              <img
                src={form.image}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultProfileImages[0];
                }}
              />
            </div>

            {editMode && (
              <div className="absolute bottom-2 right-2 flex gap-2">
                <label className="cursor-pointer bg-[#00d37f] text-white p-2 rounded-full shadow-lg hover:bg-[#02be72] transition">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleRandomImage}
                  className="bg-[#00d1ff] text-white p-2 rounded-full shadow-lg hover:bg-[#00b8e6] transition"
                  title="Try random image"
                >
                  <span className="text-sm font-bold">⟳</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex-1 mt-2 sm:mt-0">
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] outline-none transition"
                      placeholder="Enter first name"
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
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] outline-none transition"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About You
                  </label>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] outline-none transition"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {form.about.length}/500 characters
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {user.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Member since:</span>{" "}
                    {user.memberSince}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Profile image size: 226px × 226px
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {user.fullName}
                </h2>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                  Member since: {user.memberSince}
                </p>
                <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    About
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{user.about}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {user.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BUTTON GRID - Only show when not in edit mode */}
        {!editMode && (
          <div className="mt-8 md:mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
              <button
                onClick={handleSavedListingsClick}
                className="bg-gradient-to-r from-[#00d37f] to-[#02be72] text-white flex flex-col items-center justify-center p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
              >
                <Bookmark size={32} className="mb-3" />
                <span className="font-medium">Saved Listings</span>
                <span className="text-xs mt-1 text-white/80">
                  View saved vendors
                </span>
              </button>

              <button
                onClick={handleMyReviewsClick}
                className="bg-gradient-to-r from-[#00d1ff] to-[#00b8e6] text-white flex flex-col items-center justify-center p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
              >
                <Star size={32} className="mb-3" />
                <span className="font-medium">My Reviews</span>
                <span className="text-xs mt-1 text-white/80">
                  Rate & review
                </span>
              </button>

              <button
                onClick={handleBookingHistoryClick}
                className="bg-gradient-to-r from-[#9b5de5] to-[#7b3fe4] text-white flex flex-col items-center justify-center p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
              >
                <Clock size={32} className="mb-3" />
                <span className="font-medium">Booking History</span>
                <span className="text-xs mt-1 text-white/80">
                  Past & upcoming
                </span>
              </button>

              <button
                onClick={handleSettingsClick}
                className="bg-gradient-to-r from-[#f15bb5] to-[#de00aa] text-white flex flex-col items-center justify-center p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
              >
                <Settings size={32} className="mb-3" />
                <span className="font-medium">Settings</span>
                <span className="text-xs mt-1 text-white/80">
                  Account preferences
                </span>
              </button>
            </div>

            {/* Additional Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.vendorsSaved}
                </div>
                <p className="text-sm text-gray-600">Vendors Saved</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.reviewsWritten}
                </div>
                <p className="text-sm text-gray-600">Reviews Written</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stats.bookingsMade}
                </div>
                <p className="text-sm text-gray-600">Bookings Made</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Image Instructions */}
        {editMode && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 max-w-4xl">
            <h4 className="font-medium text-blue-900 mb-3">
              Profile Image Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Image should be square (226px × 226px)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                File size should be less than 5MB
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Supported formats: JPG, PNG, GIF
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Click the camera icon to upload your own image
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">•</span>
                Click the refresh icon to try a random profile image
              </li>
            </ul>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 px-4 sm:px-6 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <img src={Logo} alt="Ajani Logo" className="h-8 mx-auto mb-4" />
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Ajani. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Connect with verified vendors and discover Ibadan through AI and
            Local stories
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserProcess2;
