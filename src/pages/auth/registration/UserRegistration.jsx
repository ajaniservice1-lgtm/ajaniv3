import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../../lib/axios";

const schema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email("enter a valid email").required("enter your email"),
  phone: yup.string().required(),
  password: yup.string().required().min(8, "must be 8 characters long"),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref("password")], "password must match"),
  role: yup.string().required().default("user"),
});

// Toast Notification Component
const ToastNotification = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
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
            <p className="text-sm text-green-600 mt-1">
              Check your email for confirmation link
            </p>
          </div>
          <button
            onClick={onClose}
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

const UserRegistration = () => {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Add CSS for animations
  React.useEffect(() => {
    // Add custom styles for animations
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      
      @keyframes progressBar {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
      
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
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
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleCancel = () => {
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleNext = async (data) => {
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/auth/register", data);

      // Show success toast
      setShowToast(true);

      // Reset form
      reset();

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch (error) {
      console.log(error);

      // Show error message
      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 font-manrope">
      {/* Toast Notification */}
      {showToast && (
        <ToastNotification
          message="Registration Successful!"
          onClose={() => setShowToast(false)}
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
        <form onSubmit={handleSubmit(handleNext)} className="space-y-4">
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
                name="firstName"
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
                name="lastName"
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
              name="email"
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
              name="phone"
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
                name="password"
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
                name="confirmPassword"
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

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 mt-4">
            <input type="checkbox" id="terms" required className="mt-1" />
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

          {/* Button */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="bg-[#00d37f] text-white flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md hover:bg-[#02be72] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Next <FaArrowRight size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
