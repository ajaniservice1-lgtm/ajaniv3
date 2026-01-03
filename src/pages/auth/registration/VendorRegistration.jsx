import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../../lib/axios";

// Toast Notification Components
const ToastNotification = ({ message, onClose, subMessage = null, type = "success" }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const bgColor = type === "success" ? "bg-green-50" : 
                  type === "error" ? "bg-red-50" : 
                  type === "warning" ? "bg-yellow-50" : 
                  "bg-blue-50";
  const borderColor = type === "success" ? "border-green-200" : 
                     type === "error" ? "border-red-200" : 
                     type === "warning" ? "border-yellow-200" : 
                     "border-blue-200";
  const textColor = type === "success" ? "text-green-800" : 
                   type === "error" ? "text-red-800" : 
                   type === "warning" ? "text-yellow-800" : 
                   "text-blue-800";
  const iconColor = type === "success" ? "text-green-600" : 
                   type === "error" ? "text-red-600" : 
                   type === "warning" ? "text-yellow-600" : 
                   "text-blue-600";

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "animate-slideInRight" : "animate-slideOutRight"
      }`}
    >
      <div className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 max-w-sm`}>
        <div className="flex items-start gap-3">
          <div className={`${iconColor} mt-0.5`}>
            {type === "success" ? <FaCheckCircle size={20} /> : 
             type === "error" ? <FaExclamationTriangle size={20} /> : 
             <FaInfoCircle size={20} />}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${textColor}`}>{message}</p>
            {subMessage && (
              <p className={`text-sm ${textColor} opacity-90 mt-1`}>{subMessage}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`${iconColor} hover:opacity-70 transition-opacity ml-2`}
            aria-label="Close notification"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className={`mt-2 w-full ${borderColor} bg-opacity-50 h-1 rounded-full overflow-hidden`}>
          <div className={`h-full ${iconColor} animate-progressBar`}></div>
        </div>
      </div>
    </div>
  );
};

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: "",
    subMessage: "",
    type: "success"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [vendorCategory, setVendorCategory] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const schema = yup.object().shape({
    firstName: yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: yup.string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
    email: yup.string()
      .email("Enter a valid email address")
      .required("Email is required")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
    phone: yup.string()
      .required("Phone number is required")
      .matches(/^\+?[\d\s\-\(\)]{10,}$/, "Enter a valid phone number"),
    password: yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number"),
    confirmPassword: yup.string()
      .required("Confirm password is required")
      .oneOf([yup.ref("password")], "Passwords must match"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordValue = watch("password", "");

  const handleCancel = () => {
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const showNotification = (message, subMessage = "", type = "success") => {
    setToastConfig({ message, subMessage, type });
    setShowToast(true);
  };

  const testBackendConnection = async () => {
    try {
      console.log("Testing backend connection...");
      const response = await axiosInstance.get("/health");
      console.log("Backend health check:", response.data);
      return response.data;
    } catch (error) {
      console.error("Backend connection test failed:", error);
      return null;
    }
  };

  const handleRegistration = async (data) => {
    try {
      setIsSubmitting(true);
      setDebugInfo("");

      // Validate vendor category
      if (!vendorCategory) {
        showNotification(
          "Category Required",
          "Please select a vendor category",
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      // Create payload exactly matching API documentation
      const payload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        password: data.password,
        role: "vendor",
        vendor: {
          category: vendorCategory,
          ...(businessName && { businessName: businessName.trim() }),
          ...(businessAddress && { businessAddress: businessAddress.trim() })
        }
      };

      // Log payload for debugging
      console.log("Sending registration payload:", JSON.stringify(payload, null, 2));
      setDebugInfo(`Payload: ${JSON.stringify(payload, null, 2)}`);

      // Test backend first
      const healthCheck = await testBackendConnection();
      if (!healthCheck) {
        showNotification(
          "Backend Unavailable",
          "Unable to connect to server. Please try again later.",
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      // Send registration request
      console.log("Making POST request to /auth/register...");
      const response = await axiosInstance.post("/auth/register", payload);
      
      console.log("Registration response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (response.data && response.data.message) {
        setRegisteredEmail(data.email);

        // Store email for OTP verification
        localStorage.setItem("pendingVerificationEmail", data.email);
        localStorage.setItem("pendingVerificationRole", "vendor");
        
        // Store user data temporarily for verification
        localStorage.setItem("pendingVendorData", JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: "vendor",
          vendor: payload.vendor
        }));

        showNotification(
          "Registration Successful!",
          "Please check your email for the verification OTP",
          "success"
        );

        // Clear form
        reset();
        setVendorCategory("");
        setBusinessName("");
        setBusinessAddress("");

        // Redirect to OTP verification page
        setTimeout(() => {
          navigate("/verify-otp", {
            state: {
              email: data.email,
              fromRegistration: true,
              userType: "vendor",
            },
          });
        }, 2000);

      } else {
        showNotification(
          "Registration Failed",
          "Unexpected response from server",
          "error"
        );
        setDebugInfo(`Unexpected response: ${JSON.stringify(response.data)}`);
      }

    } catch (error) {
      console.error("Registration error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      let errorMessage = "Registration failed. Please try again.";
      let errorDetails = "";

      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            if (data.message === "Category is required for vendor accounts") {
              errorMessage = "Vendor category is required";
            } else if (data.message === "Please provide a valid email") {
              errorMessage = "Invalid email format";
            } else if (data.message === "Please provide a valid phone number") {
              errorMessage = "Invalid phone number";
            } else if (data.message) {
              errorMessage = data.message;
            } else if (data.errors) {
              errorMessage = data.errors.map(err => err.msg || err.message).join(', ');
            } else {
              errorMessage = "Invalid registration data";
            }
            break;
          
          case 409:
            errorMessage = "Email already registered";
            errorDetails = "Please use a different email or login to your existing account";
            break;
          
          case 422:
            errorMessage = "Validation error";
            errorDetails = "Please check all required fields";
            break;
          
          case 500:
            errorMessage = "Server error (500)";
            errorDetails = "Our servers are experiencing issues. Please try again later.";
            break;
          
          default:
            errorMessage = `Server error: ${status}`;
            errorDetails = data?.message || "Please try again";
        }
        
        setDebugInfo(`Server Response (${status}): ${JSON.stringify(data)}`);
        
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Network error";
        errorDetails = "Please check your internet connection and try again";
        setDebugInfo("No response received from server");
      } else {
        // Request setup error
        errorMessage = "Request error";
        errorDetails = error.message;
        setDebugInfo(`Request setup error: ${error.message}`);
      }

      showNotification(errorMessage, errorDetails, "error");

    } finally {
      setIsSubmitting(false);
    }
  };

  const vendorCategories = [
    { value: "hotel", label: "Hotel" },
    { value: "restaurant", label: "Restaurant" },
    { value: "shortlet", label: "Shortlet/Apartment" },
    { value: "service provider", label: "Service Provider" },
    { value: "accommodation", label: "Accommodation" }
  ];

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 font-manrope relative">
      {/* Toast Notification */}
      {showToast && (
        <ToastNotification
          message={toastConfig.message}
          subMessage={toastConfig.subMessage}
          type={toastConfig.type}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Debug Panel (remove in production) */}
      {debugInfo && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-gray-900 text-white p-3 rounded-lg text-xs opacity-80 z-40">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Debug Info:</span>
            <button 
              onClick={() => setDebugInfo("")}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes size={12} />
            </button>
          </div>
          <pre className="overflow-auto max-h-32 text-xs">
            {debugInfo}
          </pre>
        </div>
      )}

      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white relative">
        {/* Cancel/Close Button */}
        <button
          onClick={handleCancel}
          className="absolute -top-2 -right-2 sm:top-2 sm:right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          Create Vendor Account
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base leading-tight">
          Join our platform as a verified vendor and grow your business
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#00d1ff] mt-4 mb-6"></div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4" noValidate>
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                {...register("firstName")}
                id="firstName"
                placeholder="Enter first name"
                className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors ${
                  errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-[#00d1ff]"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FaExclamationTriangle size={10} />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                {...register("lastName")}
                id="lastName"
                placeholder="Enter last name"
                className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors ${
                  errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-[#00d1ff]"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FaExclamationTriangle size={10} />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              {...register("email")}
              id="email"
              placeholder="example@domain.com"
              className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors ${
                errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-[#00d1ff]"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={10} />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              {...register("phone")}
              id="phone"
              placeholder="+234 801 234 5678"
              className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors ${
                errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-[#00d1ff]"
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={10} />
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Vendor Category - REQUIRED */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Vendor Category *
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={vendorCategory}
              onChange={(e) => setVendorCategory(e.target.value)}
              className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors ${
                !vendorCategory ? "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-200" : "border-gray-300 focus:border-[#00d1ff]"
              }`}
              required
            >
              <option value="">Select a category</option>
              {vendorCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {!vendorCategory && (
              <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                <FaInfoCircle size={10} />
                Please select a vendor category
              </p>
            )}
          </div>

          {/* Business Name (Optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Business Name (Optional)
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] text-sm transition-colors"
            />
            <p className="text-gray-500 text-xs mt-1">
              Leave blank if you don't have a business name
            </p>
          </div>

          {/* Business Address (Optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Business Address (Optional)
            </label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="Enter your business address"
              className="w-full mt-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] focus:border-[#00d1ff] text-sm transition-colors"
            />
            <p className="text-gray-500 text-xs mt-1">
              Provide address for customers to find you
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                id="password"
                placeholder="Create a strong password"
                className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors pr-10 ${
                  errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-[#00d1ff]"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={10} />
                {errors.password.message}
              </p>
            )}
            
            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`h-1 flex-1 rounded-full ${
                    passwordValue.length >= 8 ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full ${
                    /[a-z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full ${
                    /[A-Z]/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-1 flex-1 rounded-full ${
                    /\d/.test(passwordValue) ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                </div>
                <p className="text-gray-500 text-xs">
                  Must contain: 8+ characters, uppercase, lowercase, number
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                id="confirmPassword"
                placeholder="Re-enter your password"
                className={`w-full mt-1 px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm transition-colors pr-10 ${
                  errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-[#00d1ff]"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <FaExclamationTriangle size={10} />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 mt-6">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 rounded border-gray-300 text-[#00d37f] focus:ring-[#00d37f] focus:ring-2"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => navigate("/termspage")}
                className="text-black font-medium underline hover:text-[#00d1ff] transition-colors"
              >
                Terms and Conditions
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => navigate("/privacypage")}
                className="text-black font-medium underline hover:text-[#00d1ff] transition-colors"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline hover:text-[#00d1ff] transition-colors"
            >
              Sign In Here
            </button>
          </p>

          {/* Registration Button */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={isSubmitting || !vendorCategory}
              className="bg-[#00d37f] text-white flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md hover:bg-[#02be72] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#00d37f]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Register as Vendor <FaArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-in forwards;
        }
        
        .animate-progressBar {
          animation: progressBar 5s linear forwards;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VendorRegistration;