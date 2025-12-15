// src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Get user data from localStorage
    const userData = localStorage.getItem("userProfile");

    if (!form.email || !form.password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    if (userData) {
      try {
        const user = JSON.parse(userData);

        // Check if email matches
        if (user.email !== form.email) {
          setError("Email not found. Please register first.");
          setIsLoading(false);
          return;
        }

        // For demo purposes, accept any password if user exists
        // In real app, you'd verify password hash here

        // Set login status
        localStorage.setItem("ajani_dummy_login", "true");
        localStorage.setItem("ajani_dummy_email", form.email);

        // Get redirect URL or default to home
        const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
        localStorage.removeItem("redirectAfterLogin");

        setIsLoading(false);

        // Check for pending save item
        const pendingSave = localStorage.getItem("pendingSaveItem");
        if (pendingSave) {
          try {
            const pendingItem = JSON.parse(pendingSave);
            const saved = JSON.parse(
              localStorage.getItem("userSavedListings") || "[]"
            );

            // Check if already saved
            const isAlreadySaved = saved.some(
              (item) => item.id === pendingItem.id
            );

            if (!isAlreadySaved) {
              const updatedSaved = [
                ...saved,
                {
                  ...pendingItem,
                  savedDate: new Date().toISOString().split("T")[0],
                },
              ];
              localStorage.setItem(
                "userSavedListings",
                JSON.stringify(updatedSaved)
              );

              // Dispatch event for other components
              window.dispatchEvent(
                new CustomEvent("savedListingsUpdated", {
                  detail: { action: "added", item: pendingItem },
                })
              );
            }

            localStorage.removeItem("pendingSaveItem");
          } catch (err) {
            console.error("Error processing pending save:", err);
          }
        }

        // Redirect after short delay
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1000);
      } catch (err) {
        setError("Error loading user data. Please try again.");
        setIsLoading(false);
      }
    } else {
      // No user found, check if we should allow guest login
      setError("No account found. Please register first.");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    // Set as guest user
    localStorage.setItem("ajani_dummy_login", "true");
    localStorage.setItem("ajani_dummy_email", "guest@example.com");

    const guestProfile = {
      id: "guest_" + Date.now(),
      firstName: "Guest",
      lastName: "User",
      fullName: "Guest User",
      email: "guest@example.com",
      phone: "",
      memberSince: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      about: "Guest user exploring Ajani",
      image: "https://ui-avatars.com/api/?name=Guest+User&background=random",
      stats: {
        vendorsSaved: 0,
        reviewsWritten: 0,
        bookingsMade: 0,
      },
    };

    localStorage.setItem("userProfile", JSON.stringify(guestProfile));

    const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
    localStorage.removeItem("redirectAfterLogin");

    navigate(redirectUrl);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/assets/Logos/logo5.png"
              alt="Ajani Logo"
              className="h-10 w-40 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Log in to Ajani</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00d37f] hover:bg-[#02be72] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Continue as Guest
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full border-2 border-[#00d37f] text-[#00d37f] hover:bg-[#00d37f]/5 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Create New Account
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-600 pt-4 border-t">
          <p>
            Forgot your password?{" "}
            <button
              onClick={() => alert("Password reset feature coming soon!")}
              className="text-[#00d37f] hover:text-[#02be72] font-medium"
            >
              Reset here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
