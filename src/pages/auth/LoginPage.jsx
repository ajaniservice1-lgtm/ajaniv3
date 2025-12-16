// src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import Logo from "../../assets/Logos/logo5.png";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleCancel = () => {
    // Navigate back or to home if no history
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg relative">
        {/* Cancel/Close Button - Top Right */}
        <button
          onClick={handleCancel}
          className="absolute -top-2 -right-2 sm:top-2 sm:right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        {/* Logo */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
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
              placeholder="Email Address"
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
            className="w-full hover:bg-[#06EAFC] bg-[#6cff] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 pt-4">
          <p>
            Forgot your password?{" "}
            <button
              onClick={handleResetPassword}
              className="text-[#6cff] hover:text-[#06EAFC] font-medium"
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
