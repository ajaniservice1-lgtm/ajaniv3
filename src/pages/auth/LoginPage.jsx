import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaSync,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import Logo from "../../assets/Logos/logo5.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../lib/axios";

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

// Toast Notification Component for Login
const LoginToastNotification = ({ message, onClose, type = "success" }) => {
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
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
  const borderColor =
    type === "success" ? "border-green-200" : "border-red-200";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const progressColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const iconColor = type === "success" ? "text-green-600" : "text-red-600";

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "animate-slideInRight" : "animate-slideOutRight"
      }`}
    >
      <div
        className={`${bgColor} border ${borderColor} rounded-lg shadow-lg p-4 max-w-sm`}
      >
        <div className="flex items-start gap-3">
          <div className={`${iconColor} mt-0.5`}>
            {type === "success" ? (
              <FaCheck size={16} />
            ) : (
              <FaExclamationTriangle size={16} />
            )}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${textColor}`}>{message}</p>
          </div>
          <button
            onClick={handleClose}
            className={`${iconColor} hover:${
              type === "success" ? "text-green-600" : "text-red-600"
            } transition-colors ml-2`}
            aria-label="Close notification"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div
          className={`mt-2 w-full ${progressColor} bg-opacity-30 h-1 rounded-full overflow-hidden`}
        >
          <div
            className={`h-full ${progressColor} animate-progressBar`}
            style={{ animationDuration: "4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingSaveConfirm, setPendingSaveConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [retryCount, setRetryCount] = useState(0);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const email = watch("email");

  // Check for email verification success message and pre-fill email
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const verified = searchParams.get("verified");

    if (verified === "true") {
      setSuccessMessage("🎉 Email verified successfully! You can now login.");
      setToastMessage("🎉 Email verified successfully! You can now login.");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
        setSuccessMessage("");
        setShowToast(false);
      }, 5000);
    }

    const fromOTP = location.state?.fromOTP;
    const verifiedEmail = location.state?.verifiedEmail;

    if (fromOTP && verifiedEmail) {
      setSuccessMessage("✅ OTP verification successful! Please login.");
      setToastMessage("✅ OTP verification successful! Please login.");
      setToastType("success");
      setShowToast(true);

      setValue("email", verifiedEmail);

      setTimeout(() => {
        document.getElementById("password")?.focus();
      }, 100);

      setTimeout(() => {
        setSuccessMessage("");
        setShowToast(false);
      }, 4000);
    }

    const registeredEmail = localStorage.getItem("pendingVerificationEmail");
    if (registeredEmail && !location.search.includes("verified=true")) {
      setSuccessMessage(
        `📧 Registration successful! Please check ${registeredEmail} for verification.`
      );
      setValue("email", registeredEmail);
      localStorage.removeItem("pendingVerificationEmail");

      setTimeout(() => {
        setSuccessMessage("");
      }, 8000);
    }

    const resetSuccess = location.state?.resetSuccess;
    if (resetSuccess) {
      setSuccessMessage(
        "✅ Password reset successful! You can now login with your new password."
      );
      setToastMessage("✅ Password reset successful!");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        setSuccessMessage("");
        setShowToast(false);
      }, 4000);
    }
  }, [location, navigate, setValue]);

  const onSubmit = async (data) => {
    try {
      setError("");
      setSuccessMessage("");
      setIsLoading(true);
      setIsRedirecting(false);
      setShowTroubleshoot(false);

      // Clear any existing auth data before attempting new login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth-storage");

      // Make API call to login
      const response = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      // Handle different response formats
      let loginData;
      if (
        response.data &&
        response.data.message &&
        response.data.message.includes("Login successful")
      ) {
        loginData = response.data;
      } else if (response.data && response.data.success) {
        loginData = response.data;
      } else {
        throw new Error("Invalid login response format");
      }

      const { token, data: userData } = loginData;

      // Check if user is verified
      if (!userData.isVerified) {
        setError(
          `⚠️ Please verify your email before logging in. 
            
            Check your inbox (${userData.email}) for the verification link. 
            
            If you didn't receive it, check your spam folder or request a new verification link.`
        );
        setIsLoading(false);
        setRetryCount(0);
        return;
      }

      // Store authentication data
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_email", userData.email);
      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          id: userData._id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          role: userData.role,
          isVerified: userData.isVerified,
          isActive: userData.isActive,
          profilePicture: userData.profilePicture,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        })
      );

      // Also store in auth-storage for compatibility
      const authStorage = {
        state: { token: token },
        version: 0,
      };
      localStorage.setItem("auth-storage", JSON.stringify(authStorage));

      // Check for pending save item
      const pendingSave = localStorage.getItem("pendingSaveItem");
      if (pendingSave) {
        try {
          const pendingItem = JSON.parse(pendingSave);
          setPendingSaveConfirm({
            item: pendingItem,
            redirectUrl: "/",
          });
          setIsLoading(false);
          return;
        } catch (err) {
          localStorage.removeItem("pendingSaveItem");
        }
      }

      // Dispatch login event for header component
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(
        new CustomEvent("loginSuccess", {
          detail: {
            email: userData.email,
            token: token,
            userProfile: userData,
          },
        })
      );

      // Get redirect URL or default to home
      const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
      localStorage.removeItem("redirectAfterLogin");

      setIsLoading(false);
      setRetryCount(0);
      setIsRedirecting(true);

      // Show success toast
      setToastMessage("✅ Login successful! Redirecting...");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        try {
          navigate(redirectUrl, {
            replace: true,
            state: { fromLogin: true },
          });
        } catch (navError) {
          console.error("Navigation failed:", navError);
        }

        // Fallback to window.location after delay
        setTimeout(() => {
          if (window.location.pathname === "/login") {
            window.location.href = redirectUrl;
          }
        }, 500);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setIsRedirecting(false);
      setRetryCount((prev) => prev + 1);

      let errorMessage = "Login failed. Please try again.";
      let showTroubleshootBtn = false;
      let showErrorToast = false;
      let toastErrorType = "error";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage =
            "❌ Invalid email or password. Please check your credentials.";
          showErrorToast = true;
          toastErrorType = "error";
        } else if (error.response.status === 403) {
          errorMessage =
            "🔒 Please verify your email before logging in. Check your inbox for the verification link.";
        } else if (error.response.status === 400) {
          errorMessage = "⚠️ Invalid request. Please check your input.";
          showErrorToast = true;
          toastErrorType = "error";
        } else if (error.response.status === 500) {
          const serverError =
            error.response.data?.message || "Internal server error";
          errorMessage = `🚨 Server Error: ${serverError}
          
          This often happens after OTP verification. Try these steps:
          
          1. Wait 2-3 minutes for the server to update
          2. Try logging in again
          3. If it persists, try resetting your password`;
          showTroubleshootBtn = true;
        } else if (error.response.data?.message) {
          errorMessage = `⚠️ ${error.response.data.message}`;
          showErrorToast = true;
          toastErrorType = "error";
        }
      } else if (error.request) {
        errorMessage =
          "🌐 Network error. Please check your internet connection.";
      } else if (error.message === "Invalid login response format") {
        errorMessage = "⚠️ Unexpected response from server. Please try again.";
        showErrorToast = true;
        toastErrorType = "error";
      }

      setError(errorMessage);
      setShowTroubleshoot(showTroubleshootBtn);

      // Show toast for specific errors
      if (showErrorToast) {
        setToastMessage(errorMessage);
        setToastType(toastErrorType);
        setShowToast(true);
      }

      // Clear auth data on login failure
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth-storage");

      // If multiple retries, suggest password reset
      if (retryCount >= 2) {
        setError(
          (prev) =>
            prev +
            "\n\n🔧 Multiple login attempts failed. Consider resetting your password."
        );
        setShowTroubleshoot(true);
      }
    }
  };

  // Manual redirect function
  const handleManualRedirect = () => {
    const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";

    // Clear any pending save
    localStorage.removeItem("pendingSaveItem");

    navigate(redirectUrl, { replace: true });

    setTimeout(() => {
      if (window.location.pathname === "/login") {
        window.location.href = redirectUrl;
      }
    }, 100);
  };

  const handleCancel = () => {
    localStorage.removeItem("pendingSaveItem");

    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleResetPassword = () => {
    const email = document.getElementById("email")?.value;

    localStorage.removeItem("pendingSaveItem");

    if (email) {
      navigate("/reset-password", {
        state: { email },
      });
    } else {
      navigate("/reset-password");
    }
  };

  const handleResendVerification = async () => {
    const email = document.getElementById("email")?.value;
    if (email) {
      try {
        const response = await axiosInstance.post("/auth/resend-verification", {
          email,
        });

        if (response.data.success || response.data.message?.includes("sent")) {
          setSuccessMessage(
            `📧 Verification email resent to ${email}. Please check your inbox.`
          );
          setToastMessage(`📧 Verification email sent to ${email}`);
          setToastType("success");
          setShowToast(true);
        } else {
          setError("Failed to resend verification email. Please try again.");
        }
      } catch (error) {
        setError("Failed to resend verification email. Please try again.");
      }
    } else {
      setError("Please enter your email address first.");
    }
  };

  const handleSkipSave = () => {
    localStorage.removeItem("pendingSaveItem");
    setPendingSaveConfirm(null);

    const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
    localStorage.removeItem("redirectAfterLogin");
    navigate(redirectUrl, { replace: true });
  };

  const handleConfirmSave = () => {
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

        window.dispatchEvent(
          new CustomEvent("savedListingsUpdated", {
            detail: { action: "added", item: pendingSaveConfirm.item },
          })
        );
      }
    }

    localStorage.removeItem("pendingSaveItem");
    setPendingSaveConfirm(null);

    const redirectUrl = localStorage.getItem("redirectAfterLogin") || "/";
    localStorage.removeItem("redirectAfterLogin");
    navigate(redirectUrl, { replace: true });
  };

  // Retry login function
  const handleRetryLogin = () => {
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;

    if (email && password) {
      onSubmit({ email, password });
    } else {
      setError("Please enter both email and password first.");
    }
  };

  // Clear cache and retry
  const handleClearCacheAndRetry = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    setError("Cache cleared. Please try logging in again.");
    setRetryCount(0);
    setShowTroubleshoot(false);

    setValue("password", "");
    document.getElementById("password")?.focus();
  };

  // Show troubleshooting options
  const toggleTroubleshoot = () => {
    setShowTroubleshoot(!showTroubleshoot);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Toast Notification */}
      {showToast && (
        <LoginToastNotification
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

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
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">Log in to Ajani</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* Redirecting indicator */}
        {isRedirecting && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            Redirecting to home page...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
            {error}

            {/* Manual redirect button */}
            {!error.includes("Invalid") && !error.includes("verify") && (
              <div className="mt-3">
                <button
                  onClick={handleManualRedirect}
                  className="w-full py-2 px-4 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  Click here if not redirected automatically
                </button>
              </div>
            )}

            {/* Retry button */}
            {error.includes("Server Error") && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={handleRetryLogin}
                  disabled={isLoading}
                  className="w-full py-2 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FaSync className={isLoading ? "animate-spin" : ""} />
                  {isLoading ? "Retrying..." : "Retry Login"}
                </button>

                {/* Troubleshoot button */}
                <button
                  onClick={toggleTroubleshoot}
                  className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800"
                >
                  {showTroubleshoot ? "Hide Options" : "Show More Options"}
                </button>
              </div>
            )}

            {/* Troubleshoot options */}
            {showTroubleshoot && (
              <div className="mt-3 space-y-2 border-t border-red-100 pt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Troubleshooting Options:
                </p>

                <button
                  onClick={handleResetPassword}
                  className="w-full py-2 px-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                >
                  Reset Password
                </button>

                <button
                  onClick={handleResendVerification}
                  className="w-full py-2 px-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                >
                  Resend Verification Email
                </button>

                <button
                  onClick={handleClearCacheAndRetry}
                  className="w-full py-2 px-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Clear Cache & Retry
                </button>
              </div>
            )}

            {/* Add resend verification button if user is not verified */}
            {error.includes("verify your email") &&
              !error.includes("Server Error") && (
                <div className="mt-3">
                  <button
                    onClick={handleResendVerification}
                    className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              type="email"
              {...register("email")}
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors`}
              placeholder="Email Address"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
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
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full px-4 py-3 pr-10 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || isRedirecting}
            className="w-full hover:bg-[#06EAFC] bg-[#6cff] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : isRedirecting ? (
              "Redirecting..."
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 pt-4">
          <div className="mb-3 space-y-2">
            <p>
              Forgot your password?{" "}
              <button
                onClick={handleResetPassword}
                className="text-[#6cff] hover:text-[#06EAFC] font-medium"
              >
                Reset here
              </button>
            </p>

            {/* Help text for unverified users */}
            <p className="text-xs text-gray-500">
              Need help with email verification?{" "}
              <button
                onClick={() => {
                  const email = document.getElementById("email")?.value;
                  if (email) {
                    setError(
                      `Check ${email} for verification link. Didn't receive it? Check spam folder.`
                    );
                  } else {
                    setError("Please enter your email above and try again.");
                  }
                }}
                className="text-gray-600 hover:text-gray-800 underline"
              >
                Click here
              </button>
            </p>
          </div>

          {/* Don't have an account? Register here */}
          <div className="pt-3 border-t border-gray-200">
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-[#6cff] hover:text-[#06EAFC] font-medium"
              >
                Register here
              </button>
            </p>
          </div>
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

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

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        .animate-progressBar {
          animation: progressBar linear forwards;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;