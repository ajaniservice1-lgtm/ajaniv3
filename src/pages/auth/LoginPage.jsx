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
  const [pendingSaveConfirm, setPendingSaveConfirm] = useState(null);

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

        // Check for pending save item
        const pendingSave = localStorage.getItem("pendingSaveItem");
        if (pendingSave) {
          try {
            const pendingItem = JSON.parse(pendingSave);
            // Show confirmation dialog instead of auto-saving
            setPendingSaveConfirm({
              item: pendingItem,
              redirectUrl: redirectUrl,
            });
            setIsLoading(false);
            return;
          } catch (err) {
            console.error("Error processing pending save:", err);
            localStorage.removeItem("pendingSaveItem");
          }
        }

        setIsLoading(false);

        // Redirect after short delay
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1000);
      } catch (err) {
        setError("Error loading user data. Please try again.");
        setIsLoading(false);
      }
    } else {
      // No user found
      setError("No account found. Please register first.");
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleCancel = () => {
    // Clear any pending save when user cancels
    localStorage.removeItem("pendingSaveItem");

    // Navigate back or to home if no history
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleResetPassword = () => {
    // Clear pending save when navigating to reset password
    localStorage.removeItem("pendingSaveItem");
    navigate("/reset-password");
  };

  const handleSkipSave = () => {
    // User doesn't want to save the listing
    localStorage.removeItem("pendingSaveItem");
    setPendingSaveConfirm(null);

    if (pendingSaveConfirm?.redirectUrl) {
      navigate(pendingSaveConfirm.redirectUrl);
    } else {
      navigate("/");
    }
  };

  const handleConfirmSave = () => {
    // User wants to save the listing
    if (pendingSaveConfirm?.item) {
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );
      const isAlreadySaved = saved.some(
        (item) => item.id === pendingSaveConfirm.item.id
      );

      if (!isAlreadySaved) {
        const updatedSaved = [
          ...saved,
          {
            ...pendingSaveConfirm.item,
            savedDate: new Date().toISOString().split("T")[0],
          },
        ];
        localStorage.setItem("userSavedListings", JSON.stringify(updatedSaved));

        // Dispatch event for other components
        window.dispatchEvent(
          new CustomEvent("savedListingsUpdated", {
            detail: { action: "added", item: pendingSaveConfirm.item },
          })
        );
      }
    }

    localStorage.removeItem("pendingSaveItem");
    setPendingSaveConfirm(null);

    if (pendingSaveConfirm?.redirectUrl) {
      navigate(pendingSaveConfirm.redirectUrl);
    } else {
      navigate("/");
    }
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

      {/* Pending Save Confirmation Modal */}
      {pendingSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Save this listing?
            </h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <img
                src={pendingSaveConfirm.item.image}
                alt={pendingSaveConfirm.item.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
                  e.currentTarget.onerror = null;
                }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {pendingSaveConfirm.item.name}
                </p>
                <p className="text-sm text-gray-600">
                  {pendingSaveConfirm.item.location}
                </p>
                <p className="text-xs text-gray-500">
                  {pendingSaveConfirm.item.price}{" "}
                  {pendingSaveConfirm.item.perText}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Would you like to save this listing to your favorites?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSkipSave}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 px-4 py-3 bg-[#06EAFC] text-white rounded-lg hover:bg-[#05d9eb] transition-colors font-medium"
              >
                Save Listing
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
