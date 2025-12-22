import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../../lib/axios";

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
  role: yup.string().default("user"),
});

// Toast Notification Component
const ToastNotification = ({ message, onClose, subMessage = null }) => {
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
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "animate-slideInRight" : "animate-slideOutRight"
      }`}
    >
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-green-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-800">{message}</p>
            {subMessage && (
              <p className="text-sm text-green-600 mt-1">{subMessage}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-green-400 hover:text-green-600 transition-colors ml-2"
            aria-label="Close notification"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className="mt-2 w-full bg-green-200 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 animate-progressBar"></div>
        </div>
      </div>
    </div>
  );
};

// Error Toast Notification Component
const ErrorToastNotification = ({ message, onClose }) => {
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

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "animate-slideInRight" : "animate-slideOutRight"
      }`}
    >
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-red-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-800">{message}</p>
            <p className="text-sm text-red-600 mt-1">Please try again</p>
          </div>
          <button
            onClick={handleClose}
            className="text-red-400 hover:text-red-600 transition-colors ml-2"
            aria-label="Close notification"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className="mt-2 w-full bg-red-200 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 animate-progressBar"></div>
        </div>
      </div>
    </div>
  );
};

// Server Error Toast Notification Component
const ServerErrorToastNotification = ({ message, onClose }) => {
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
    }, 7000); // Longer duration for server errors

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "animate-slideInRight" : "animate-slideOutRight"
      }`}
    >
      <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-orange-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-orange-800">{message}</p>
            <p className="text-sm text-orange-600 mt-1">
              Our servers are currently experiencing issues
            </p>
            <p className="text-xs text-orange-500 mt-2">
              Please try again in a few minutes or contact support
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-orange-400 hover:text-orange-600 transition-colors ml-2"
            aria-label="Close notification"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className="mt-2 w-full bg-orange-200 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 animate-progressBar"></div>
        </div>
      </div>
    </div>
  );
};

// Verification Toast Notification Component
const VerificationToastNotification = ({ email, onClose }) => {
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

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "animate-slideInRight" : "animate-slideOutRight"
      }`}
    >
      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-blue-800">
              Registration Successful!
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Please check <span className="font-medium">{email}</span> for
              verification link
            </p>
            <p className="text-xs text-blue-500 mt-2">
              Verify your email to complete registration and login
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-blue-400 hover:text-blue-600 transition-colors ml-2"
            aria-label="Close notification"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className="mt-2 w-full bg-blue-200 h-1 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-progressBar"></div>
        </div>
      </div>
    </div>
  );
};

const UserRegistration = () => {
  const navigate = useNavigate();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showVerificationToast, setShowVerificationToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showServerErrorToast, setShowServerErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [serverErrorMessage, setServerErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: "user",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug API connection on component mount
  React.useEffect(() => {
    console.log("UserRegistration component mounted");
    console.log("Axios base URL:", axiosInstance.defaults.baseURL);

    // Check if we can access localStorage
    console.log("LocalStorage available:", typeof localStorage !== "undefined");

    // Check environment
    console.log("Current environment:", import.meta.env.MODE);
    console.log("API Base URL from env:", import.meta.env.VITE_API_BASE_URL);
  }, []);

  const handleCancel = () => {
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleRegistration = async (data) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setServerErrorMessage("");
      setRegisteredEmail("");

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;

      console.log("Registration data being sent:", registrationData);
      console.log("Sending to URL:", "/auth/register");

      // Send registration request
      const res = await axiosInstance.post("/auth/register", registrationData);

      console.log("Registration response:", {
        status: res.status,
        statusText: res.statusText,
        data: res.data,
      });

      if (res.data && res.data.success) {
        const { token, user } = res.data;
        setRegisteredEmail(data.email);

        // ✅ SCENARIO 1: Backend returns token and user (Auto-login)
        if (token && user) {
          // ✅ Store authentication data EXACTLY LIKE LOGIN
          localStorage.setItem("auth_token", token);
          localStorage.setItem("user_email", user.email);
          localStorage.setItem("userProfile", JSON.stringify(user));

          // ✅ Notify Header immediately
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("authChange"));

          // ✅ Show success toast
          setShowSuccessToast(true);

          // ✅ Clear form
          reset();

          // ✅ Redirect to home after toast
          setTimeout(() => {
            setShowSuccessToast(false);
            navigate("/");
          }, 2500);
        }
        // ✅ SCENARIO 2: Registration successful but needs email verification
        else {
          // Store email for verification reference
          localStorage.setItem("pendingVerificationEmail", data.email);

          // Show verification toast
          setShowVerificationToast(true);

          // Clear form
          reset();

          // Redirect to login page after toast
          setTimeout(() => {
            setShowVerificationToast(false);
            navigate("/login");
          }, 4000);
        }
      } else {
        // Handle unexpected response format
        const errorMsg =
          res.data?.message ||
          "Registration completed but received unexpected response.";
        setErrorMessage(errorMsg);
        setShowErrorToast(true);
      }
    } catch (error) {
      console.error("Registration error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });

      let errorMessage = "Registration failed. Please try again.";
      let isServerError = false;

      if (error.response) {
        // Server responded with error status
        if (error.response.status === 500) {
          isServerError = true;
          errorMessage =
            "Server Error (500): Our servers are experiencing issues.";

          // Log additional details for debugging
          console.error("Server 500 Error Details:", {
            data: error.response.data,
            headers: error.response.headers,
          });

          // Check if there's a specific error message from server
          if (error.response.data) {
            if (typeof error.response.data === "string") {
              errorMessage = `Server Error: ${error.response.data.substring(
                0,
                100
              )}`;
            } else if (error.response.data.message) {
              errorMessage = `Server Error: ${error.response.data.message}`;
            } else if (error.response.data.error) {
              errorMessage = `Server Error: ${error.response.data.error}`;
            }
          }
        } else if (error.response.status === 409) {
          errorMessage =
            "This email is already registered. Please use a different email or login.";
        } else if (error.response.status === 400) {
          errorMessage =
            "Invalid registration data. Please check your information.";
        } else if (error.response.status === 422) {
          errorMessage = "Validation error. Please check all required fields.";
        } else if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please try again.";
        } else if (error.response.status === 403) {
          errorMessage = "Registration not allowed. Please contact support.";
        } else if (error.response.status === 404) {
          errorMessage =
            "Registration endpoint not found. Please contact support.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          // Handle validation errors from backend
          const errors = error.response.data.errors;
          errorMessage = errors
            .map((err) => err.msg || err.message || err)
            .join(", ");
        } else if (error.response.data) {
          // Try to stringify whatever data we got
          try {
            const dataStr = JSON.stringify(error.response.data);
            errorMessage = `Server returned: ${dataStr.substring(0, 100)}${
              dataStr.length > 100 ? "..." : ""
            }`;
          } catch (e) {
            errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
          }
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        isServerError = true;
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else {
        // Something else happened
        errorMessage = `Error: ${
          error.message || "An unexpected error occurred"
        }`;
      }

      // Show appropriate toast
      if (isServerError) {
        setServerErrorMessage(errorMessage);
        setShowServerErrorToast(true);
      } else {
        setErrorMessage(errorMessage);
        setShowErrorToast(true);
      }

      // If it's a server error, log additional info
      if (error.response?.status === 500) {
        console.warn(
          "Server is experiencing issues. Please contact support if this continues."
        );
        console.warn("Error response data:", error.response?.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // For testing only - simulate successful registration
  const handleTestRegistration = async (data) => {
    console.log("TEST MODE: Simulating registration for:", data.email);

    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create test user data
    const testUser = {
      id: "test_" + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: "user",
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    const testToken = "test_token_" + Date.now();

    // Store authentication data
    localStorage.setItem("auth_token", testToken);
    localStorage.setItem("user_email", testUser.email);
    localStorage.setItem("userProfile", JSON.stringify(testUser));

    // Notify Header
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("authChange"));

    setShowSuccessToast(true);
    reset();

    setTimeout(() => {
      setShowSuccessToast(false);
      navigate("/");
    }, 2500);

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 font-manrope">
      {/* Auto-Login Success Toast Notification */}
      {showSuccessToast && (
        <ToastNotification
          message="Registration Successful!"
          subMessage="You have been automatically logged in"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {/* Email Verification Toast Notification */}
      {showVerificationToast && registeredEmail && (
        <VerificationToastNotification
          email={registeredEmail}
          onClose={() => setShowVerificationToast(false)}
        />
      )}

      {/* Server Error Toast Notification */}
      {showServerErrorToast && (
        <ServerErrorToastNotification
          message={serverErrorMessage}
          onClose={() => setShowServerErrorToast(false)}
        />
      )}

      {/* Regular Error Toast Notification */}
      {showErrorToast && (
        <ErrorToastNotification
          message={errorMessage}
          onClose={() => setShowErrorToast(false)}
        />
      )}

      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white relative">
        {/* Cancel/Close Button - Top Right */}
        <button
          onClick={handleCancel}
          className="absolute -top-2 -right-2 sm:top-2 sm:right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <p className="font-medium">Debug Info:</p>
            <p>API Base: {axiosInstance.defaults.baseURL || "Not set"}</p>
            <p>Environment: {import.meta.env.MODE}</p>
            <button
              onClick={() => {
                const testData = {
                  firstName: "Test",
                  lastName: "User",
                  email: `test${Date.now()}@test.com`,
                  phone: "1234567890",
                  password: "password123",
                  confirmPassword: "password123",
                  role: "user",
                };
                handleTestRegistration(testData);
              }}
              className="mt-1 px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
            >
              Test Registration
            </button>
          </div>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          Create User Account
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base leading-tight">
          Connect with verified vendors, and discover Ibadan through AI and
          Local stories
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#00d1ff] mt-4 mb-6"></div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleRegistration)} className="space-y-4">
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
                className={`w-full mt-1 px-3 py-2.5 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
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
                className={`w-full mt-1 px-3 py-2.5 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
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
              placeholder="Email Address"
              className={`w-full mt-1 px-3 py-2.5 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
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
              placeholder="Phone Number"
              className={`w-full mt-1 px-3 py-2.5 border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
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
                placeholder="********"
                className={`w-full mt-1 px-3 py-2.5 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm pr-10`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
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
                placeholder="********"
                className={`w-full mt-1 px-3 py-2.5 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm pr-10`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Hidden role field */}
          <input type="hidden" {...register("role")} />

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 mt-4">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 rounded border-gray-300 text-[#00d37f] focus:ring-[#00d37f]"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => navigate("/privacypage")}
                className="text-black font-medium underline hover:text-[#00d1ff]"
              >
                Terms and Conditions and Privacy Policy
              </button>
            </label>
          </div>

          {/* Sign In */}
          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline hover:text-[#00d1ff]"
            >
              Sign In Here
            </button>
          </p>

          {/* Registration Button */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00d37f] text-white flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md hover:bg-[#02be72] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Register <FaArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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

export default UserRegistration;
