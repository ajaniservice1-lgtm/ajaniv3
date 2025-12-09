// src/components/FullPageAuthModal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  FiUserPlus,
  FiEye,
  FiEyeOff,
  FiX,
  FiArrowLeft,
  FiHome,
  FiBriefcase,
} from "react-icons/fi";
import { CiLogin, CiMail, CiLock, CiUser } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function FullPageAuthModal({
  isOpen,
  onClose,
  onAuthToast,
  initialTab = "login",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(initialTab); // "login" or "signup"
  const [userType, setUserType] = useState(null); // "user" or "vendor"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // For multi-step registration

  // Update current page based on route
  useEffect(() => {
    if (location.pathname === "/login") {
      setCurrentPage("login");
      resetForm();
      setStep(1);
    } else if (location.pathname === "/register") {
      setCurrentPage("signup");
      resetForm();
      setStep(1);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Reset form when closing
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAgreeToTerms(false);
    setError("");
    setSuccess("");
    setStep(1);
    setUserType(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateSignupForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your first and last name");
      return false;
    }
    if (!formData.email) {
      setError("Please enter your email");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!agreeToTerms) {
      setError("You must agree to Terms & Conditions");
      return false;
    }
    return true;
  };

  // Handle cancel button - go to home page
  const handleCancel = () => {
    onClose();
    navigate("/");
  };

  // Handle back button - go to previous step or switch tabs
  const handleBack = () => {
    if (currentPage === "signup" && step > 1) {
      setStep(step - 1);
    } else {
      handleCancel();
    }
  };

  // STEP 1: Choose user type
  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(2); // Move to account creation form
  };

  // STEP 2: Create account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateSignupForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            user_type: userType,
          },
        },
      });

      if (error) {
        if (error.status === 429) {
          setError("Too many emails sent. Please wait a few minutes.");
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess("Account created successfully! Check your email to confirm.");
      onAuthToast?.("Signup successful!");

      // After account creation, continue with profile setup
      setStep(3);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setError("Your email is not confirmed yet. Please check your inbox.");
        } else if (
          error.status === 429 ||
          error.message.includes("rate limit")
        ) {
          setError("Too many login attempts. Please try again later.");
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess("Logged in successfully!");
      onAuthToast?.("Welcome back!");
      setTimeout(() => {
        onClose();
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) setError("Google sign-in failed. " + error.message);
  };

  const switchToLogin = () => {
    navigate("/login");
  };

  const switchToSignup = () => {
    navigate("/register");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Full Page Modal */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
            >
              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 bg-white/80 backdrop-blur-sm rounded-full p-2"
                aria-label="Close modal"
              >
                <FiX className="text-xl" />
              </button>

              {/* Left Side - Brand/Info */}
              <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-[rgb(0,6,90)] to-[#0e1f45] text-white p-8 flex-col justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Connect with verified vendors
                  </h1>
                  <p className="text-white/80 text-sm">
                    Discover Ibadan through AI and Local stories
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <CiUser className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personalized Experience</h3>
                      <p className="text-xs text-white/70">
                        Get recommendations based on your preferences
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <FiUserPlus className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Verified Vendors</h3>
                      <p className="text-xs text-white/70">
                        Connect with trusted local businesses
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-white/60">
                  © {new Date().getFullYear()} Ibadan Connect. All rights
                  reserved.
                </div>
              </div>

              {/* Right Side - Auth Forms */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {/* Back Button for Mobile */}
                <button
                  onClick={handleBack}
                  className="md:hidden flex items-center gap-2 text-gray-600 mb-6"
                >
                  <FiArrowLeft /> Back
                </button>

                {/* Tabs - Only show if not in multi-step flow */}
                {step === 1 && (
                  <div className="flex border-b mb-6">
                    <button
                      onClick={switchToLogin}
                      className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
                        currentPage === "login"
                          ? "text-[rgb(0,6,90)] border-b-2 border-[rgb(0,6,90)]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <CiLogin className="inline mr-2 text-lg" />
                      Login
                    </button>
                    <button
                      onClick={switchToSignup}
                      className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
                        currentPage === "signup"
                          ? "text-[rgb(0,6,90)] border-b-2 border-[rgb(0,6,90)]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <FiUserPlus className="inline mr-2 text-lg" />
                      Sign Up
                    </button>
                  </div>
                )}

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                    {success}
                  </div>
                )}

                {/* ========== LOGIN PAGE ========== */}
                {currentPage === "login" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome back
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Sign in to your existing account
                      </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <CiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                            placeholder="johndoe@gmail.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="block text-sm text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <CiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-gray-300 text-[rgb(0,6,90)] focus:ring-2 focus:ring-[rgb(0,6,90)]"
                          />
                          <label
                            htmlFor="remember"
                            className="text-sm text-gray-700"
                          >
                            Remember me
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Handle forgot password
                          }}
                          className="text-sm text-[rgb(0,6,90)] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[rgb(0,6,90)] text-white py-3 rounded-lg font-medium hover:bg-[#0e1f45] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Logging in...
                          </>
                        ) : (
                          <>
                            <CiLogin /> Log In
                          </>
                        )}
                      </button>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FaGoogle className="text-red-500" />
                        <span>Continue with Google</span>
                      </button>
                    </form>

                    <div className="text-center text-sm text-gray-600 mt-6">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={switchToSignup}
                        className="text-[rgb(0,6,90)] hover:underline font-medium"
                      >
                        Registration
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========== SIGNUP STEP 1: CHOOSE USER TYPE ========== */}
                {currentPage === "signup" && step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Join Ajani Directory
                      </h2>
                      <p className="text-gray-600">
                        Connect with verified vendors, and discover Ibadan
                        through AI and Local stories
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        I want to join as:
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* User Option */}
                        <button
                          onClick={() => handleUserTypeSelect("user")}
                          className={`p-6 border-2 rounded-xl transition-all text-left group cursor-pointer ${
                            userType === "user"
                              ? "border-[rgb(0,6,90)] bg-blue-50"
                              : "border-gray-200 hover:border-[rgb(0,6,90)] hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                                userType === "user"
                                  ? "bg-blue-200"
                                  : "bg-blue-100 group-hover:bg-blue-200"
                              }`}
                            >
                              <FiHome className="text-2xl text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Local User
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Discover vendors, save favorites, get
                                recommendations
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* Vendor Option */}
                        <button
                          onClick={() => handleUserTypeSelect("vendor")}
                          className={`p-6 border-2 rounded-xl transition-all text-left group cursor-pointer ${
                            userType === "vendor"
                              ? "border-[rgb(0,6,90)] bg-green-50"
                              : "border-gray-200 hover:border-[rgb(0,6,90)] hover:bg-green-50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                                userType === "vendor"
                                  ? "bg-green-200"
                                  : "bg-green-100 group-hover:bg-green-200"
                              }`}
                            >
                              <FiBriefcase className="text-2xl text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Business Vendor
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                List your business, reach customers, manage
                                listings
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Dynamic Create Account Button */}
                      {userType && (
                        <div className="mt-6">
                          <button
                            onClick={() => setStep(2)}
                            className="w-full bg-[rgb(0,6,90)] text-white py-3 rounded-lg font-medium hover:bg-[#0e1f45] transition-colors flex items-center justify-center gap-2"
                          >
                            {userType === "user"
                              ? "Join as Local User"
                              : "Join as Vendor"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-sm text-gray-600 pt-4">
                      Already have an account?{" "}
                      <button
                        onClick={switchToLogin}
                        className="text-[rgb(0,6,90)] hover:underline font-medium"
                      >
                        Sign In
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========== SIGNUP STEP 2: CREATE ACCOUNT FORM ========== */}
                {currentPage === "signup" && step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Create your account
                      </h2>
                      <p className="text-gray-600 text-sm mb-6">
                        {userType === "user"
                          ? "Join as a local user to discover Ibadan"
                          : "Register your business to reach customers"}
                      </p>
                    </div>

                    <form onSubmit={handleCreateAccount} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                            placeholder="Morayo"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                            placeholder="Daniels"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                          placeholder="+234 801 234 5678"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <CiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                            placeholder="johndoe@gmail.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="block text-sm text-gray-700 mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <CiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block text-sm text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <CiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(0,6,90)] focus:border-transparent"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>

                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[rgb(0,6,90)] focus:ring-2 focus:ring-[rgb(0,6,90)]"
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm text-gray-700"
                        >
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-[rgb(0,6,90)] hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate("/termspage");
                            }}
                          >
                            Terms & Conditions
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="text-[rgb(0,6,90)] hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              navigate("/privacypage");
                            }}
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-[rgb(0,6,90)] text-white py-3 rounded-lg font-medium hover:bg-[#0e1f45] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <FiUserPlus />{" "}
                              {userType === "user"
                                ? "Join as Local User"
                                : "Join as Vendor"}
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="text-center text-sm text-gray-600 mt-6">
                      Already have an account?{" "}
                      <button
                        onClick={switchToLogin}
                        className="text-[rgb(0,6,90)] hover:underline font-medium"
                      >
                        Sign In
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========== SIGNUP STEP 3: CONTINUE TO PROFILE SETUP ========== */}
                {currentPage === "signup" && step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Account Created Successfully!
                      </h2>
                      <p className="text-gray-600 mb-6">
                        {userType === "user"
                          ? "Your local user account has been created. Let's continue with your profile setup."
                          : "Your vendor account has been created. Let's continue with your business setup."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userType === "user"
                          ? "Continue to Profile Setup"
                          : "Continue to Business Setup"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {userType === "user"
                          ? "Complete your profile to get personalized recommendations and connect with vendors."
                          : "Set up your business listing to start reaching customers in Ibadan."}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-[rgb(0,6,90)] text-white py-3 rounded-lg font-medium hover:bg-[#0e1f45] transition-colors"
                      >
                        {userType === "user"
                          ? "Setup Profile Later"
                          : "Setup Business Later"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          // Navigate to appropriate setup page based on user type
                          if (userType === "user") {
                            navigate("/profile-setup");
                            onAuthToast?.("Profile setup started!");
                          } else {
                            navigate("/business-setup");
                            onAuthToast?.("Business setup started!");
                          }
                        }}
                        className="flex-1 bg-[#06EAFC] text-white py-3 rounded-lg font-medium hover:bg-[#05d9eb] transition-colors"
                      >
                        {userType === "user"
                          ? "Continue to Profile"
                          : "Continue to Business Setup"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
