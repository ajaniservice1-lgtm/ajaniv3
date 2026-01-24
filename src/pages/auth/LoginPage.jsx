import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheck,
  FaUserAlt,
  FaExclamationTriangle
} from "react-icons/fa";
import Logo from "../../assets/Logos/logo5.png";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../../lib/axios";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

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

  const bgColor = type === "success" ? "bg-green-50" : "bg-blue-50";
  const borderColor =
    type === "success" ? "border-green-200" : "border-blue-200";
  const textColor = type === "success" ? "text-green-800" : "text-gray-500";
  const progressColor = type === "success" ? "bg-green-500" : "bg-blue-100";
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
              <FaTimes size={16} />
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
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFromBooking, setIsFromBooking] = useState(false);
  const [bookingType, setBookingType] = useState(null);
  const [showGuestOption, setShowGuestOption] = useState(true);

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

  useEffect(() => {
    // Check if user came from booking
    const fromBooking = location.state?.fromBooking;
    const intent = location.state?.intent;
    const returnTo = location.state?.returnTo;

    if (fromBooking && intent) {
      setIsFromBooking(true);
      const type = intent.replace('_booking', '');
      setBookingType(type);
      
      console.log("User came from booking:", intent);
      console.log("Return to:", returnTo);
      
      // Show toast message instead of displaying in the UI
      setToastMessage("Please login or continue as guest to complete your booking");
      setToastType("info");
      setShowToast(true);
    } else {
      // User clicked login from header
      setIsFromBooking(false);
      setBookingType(null);
    }

    // Show guest option only if user came from booking or is on homepage
    setShowGuestOption(fromBooking || location.pathname === "/");

    // Pre-fill email if available from pending booking
    if (fromBooking) {
      const bookingType = intent?.replace('_booking', '') || "hotel";
      let pendingBooking = null;
      
      if (bookingType === "hotel") {
        const pendingHotelBooking = localStorage.getItem("pendingHotelBooking");
        if (pendingHotelBooking) pendingBooking = JSON.parse(pendingHotelBooking);
      } else if (bookingType === "restaurant") {
        const pendingRestaurantBooking = localStorage.getItem("pendingRestaurantBooking");
        if (pendingRestaurantBooking) pendingBooking = JSON.parse(pendingRestaurantBooking);
      } else if (bookingType === "shortlet") {
        const pendingShortletBooking = localStorage.getItem("pendingShortletBooking");
        if (pendingShortletBooking) pendingBooking = JSON.parse(pendingShortletBooking);
      }
      
      if (pendingBooking?.bookingData?.email) {
        setValue("email", pendingBooking.bookingData.email);
      } else if (pendingBooking?.bookingData?.contactInfo?.email) {
        setValue("email", pendingBooking.bookingData.contactInfo.email);
      }
    }
  }, [location.state, setValue, location.pathname]);

  // Helper function to create new guest session
  const createNewGuestSession = () => {
    return {
      isGuest: true,
      sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      email: email || `guest_${Date.now()}@temp.com`,
      bookings: []
    };
  };

  // Helper function to create complete booking
  const createCompleteBooking = (pendingBooking, bookingType, sessionData) => {
    const baseBooking = {
      ...pendingBooking.bookingData,
      paymentMethod: pendingBooking.selectedPayment || (bookingType === "hotel" ? "hotel" : "restaurant"),
      bookingType: bookingType,
      bookingDate: new Date().toISOString(),
      bookingId: pendingBooking.bookingId || `GB-${Date.now()}`,
      status: "confirmed",
      totalAmount: pendingBooking.totalAmount || 0,
      timestamp: Date.now(),
      isGuestBooking: true,
      guestSessionId: sessionData.sessionId,
      guestEmail: sessionData.email
    };
    
    // Add type-specific data
    if (bookingType === "hotel") {
      return {
        ...baseBooking,
        roomData: pendingBooking.roomData,
        hotelData: pendingBooking.hotelData || { 
          id: pendingBooking.hotelId, 
          name: pendingBooking.hotelName,
          image: pendingBooking.hotelImage
        }
      };
    } else if (bookingType === "restaurant") {
      return {
        ...baseBooking,
        vendorData: pendingBooking.vendorData
      };
    } else if (bookingType === "shortlet") {
      return {
        ...baseBooking,
        vendorData: pendingBooking.vendorData
      };
    }
    
    return baseBooking;
  };

  // Function to handle "Continue as Guest" - UPDATED for multi-booking
  const handleContinueAsGuest = () => {
    console.log("Continuing as guest...");
    
    // Check what type of booking user came from
    const bookingType = location.state?.intent?.replace('_booking', '') || "hotel";
    console.log("Booking type from intent:", bookingType);
    
    // Check for pending booking for this specific type
    let pendingBooking = null;
    
    if (bookingType === "hotel") {
      const pendingHotelBooking = localStorage.getItem("pendingHotelBooking");
      if (pendingHotelBooking) {
        pendingBooking = JSON.parse(pendingHotelBooking);
      }
    } else if (bookingType === "restaurant") {
      const pendingRestaurantBooking = localStorage.getItem("pendingRestaurantBooking");
      if (pendingRestaurantBooking) {
        pendingBooking = JSON.parse(pendingRestaurantBooking);
      }
    } else if (bookingType === "shortlet") {
      const pendingShortletBooking = localStorage.getItem("pendingShortletBooking");
      if (pendingShortletBooking) {
        pendingBooking = JSON.parse(pendingShortletBooking);
      }
    }
    
    if (pendingBooking) {
      console.log(`Found pending ${bookingType} booking, creating guest booking...`);
      
      // Check if guest session already exists
      let guestSession = localStorage.getItem("guestSession");
      let sessionData;
      
      if (guestSession) {
        // Use existing guest session
        try {
          sessionData = JSON.parse(guestSession);
          console.log("Using existing guest session:", sessionData);
          
          // Update expiration time
          sessionData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          
          // Add this booking to guest's booking history
          if (!sessionData.bookings) sessionData.bookings = [];
          sessionData.bookings.push({
            type: bookingType,
            bookingId: pendingBooking.bookingId,
            date: new Date().toISOString(),
            vendorName: pendingBooking.vendorData?.name || pendingBooking.hotelName
          });
        } catch (error) {
          console.error("Failed to parse existing guest session:", error);
          // Create new session if existing one is corrupted
          sessionData = createNewGuestSession();
        }
      } else {
        // Create new guest session
        sessionData = createNewGuestSession();
        sessionData.bookings = [{
          type: bookingType,
          bookingId: pendingBooking.bookingId,
          date: new Date().toISOString(),
          vendorName: pendingBooking.vendorData?.name || pendingBooking.hotelName
        }];
      }
      
      // Save/update guest session
      localStorage.setItem("guestSession", JSON.stringify(sessionData));
      
      // Create the complete booking from pending data
      const completeBooking = createCompleteBooking(pendingBooking, bookingType, sessionData);
      
      // Save the completed booking
      localStorage.setItem(`${bookingType}Booking`, JSON.stringify(completeBooking));
      localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
      
      // Clear pending data for this specific type
      localStorage.removeItem(`pending${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
      
      // Also clear any old generic pendingBooking if exists
      localStorage.removeItem("pendingBooking");
      
      // Show success message
      setToastMessage(`✅ Guest booking completed successfully!`);
      setToastType("success");
      setShowToast(true);
      
      // Navigate to confirmation page
      setTimeout(() => {
        navigate(`/booking-confirmation/${bookingType}`, {
          state: {
            bookingData: completeBooking,
            bookingType: bookingType,
            isGuestBooking: true
          }
        });
      }, 1000);
      
    } else {
      // No pending booking found (user clicked login from header, not from booking)
      console.log("No pending booking found, creating basic guest session");
      
      // Create basic guest session for browsing
      const sessionData = {
        isGuest: true,
        sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours for browsing
        email: email || `guest_${Date.now()}@temp.com`,
        isBrowsingOnly: true
      };
      
      localStorage.setItem("guestSession", JSON.stringify(sessionData));
      
      // Show success message
      setToastMessage("✅ Continuing as guest - Enjoy browsing!");
      setToastType("success");
      setShowToast(true);
      
      // Simply close the login modal/page and go back
      setTimeout(() => {
        if (window.history.length > 1) {
          navigate(-1); // Go back to previous page
        } else {
          navigate("/"); // Go to homepage if no history
        }
      }, 1000);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError("");
      setSuccessMessage("");
      setIsLoading(true);

      // Clear any guest session when logging in properly
      localStorage.removeItem("guestSession");

      const response = await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

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
        setToastMessage("⚠️ Please verify your email before logging in.");
        setToastType("error");
        setShowToast(true);
        
        setError(
          `Please verify your email before logging in. Check your inbox (${userData.email}) for the verification link.`
        );
        setIsLoading(false);
        return;
      }

      // Store authentication data
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_email", userData.email);
      
      // Create complete user profile
      const completeUserProfile = {
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
        vendor: userData.vendor || null
      };
      
      localStorage.setItem("userProfile", JSON.stringify(completeUserProfile));

      // Also store in auth-storage for compatibility
      const authStorage = {
        state: { token: token, user: completeUserProfile },
        version: 0,
      };
      localStorage.setItem("auth-storage", JSON.stringify(authStorage));

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

      // Check if user came from booking
      if (isFromBooking) {
        console.log("User logged in from booking, restoring booking...");
        
        // Check for pending booking based on type
        const bookingType = location.state?.intent?.replace('_booking', '') || "hotel";
        let pendingBooking = null;
        
        if (bookingType === "hotel") {
          const pendingHotelBooking = localStorage.getItem("pendingHotelBooking");
          if (pendingHotelBooking) pendingBooking = JSON.parse(pendingHotelBooking);
        } else if (bookingType === "restaurant") {
          const pendingRestaurantBooking = localStorage.getItem("pendingRestaurantBooking");
          if (pendingRestaurantBooking) pendingBooking = JSON.parse(pendingRestaurantBooking);
        } else if (bookingType === "shortlet") {
          const pendingShortletBooking = localStorage.getItem("pendingShortletBooking");
          if (pendingShortletBooking) pendingBooking = JSON.parse(pendingShortletBooking);
        }
        
        if (pendingBooking) {
          console.log("Found pending booking, completing as logged in user...");
          
          // Create the complete booking from pending data
          const completeBooking = {
            ...pendingBooking.bookingData,
            paymentMethod: pendingBooking.selectedPayment || (bookingType === "hotel" ? "hotel" : "restaurant"),
            bookingType: bookingType,
            bookingDate: new Date().toISOString(),
            bookingId: pendingBooking.bookingId || `USER-${Date.now()}`,
            status: "confirmed",
            totalAmount: pendingBooking.totalAmount || 0,
            timestamp: Date.now(),
            userId: userData._id,
            userEmail: userData.email,
            userName: `${userData.firstName} ${userData.lastName}`
          };
          
          // Add type-specific data
          if (bookingType === "hotel") {
            completeBooking.roomData = pendingBooking.roomData;
            completeBooking.hotelData = pendingBooking.hotelData;
          } else if (bookingType === "restaurant" || bookingType === "shortlet") {
            completeBooking.vendorData = pendingBooking.vendorData;
          }
          
          // Save the completed booking
          localStorage.setItem(`${bookingType}Booking`, JSON.stringify(completeBooking));
          localStorage.setItem('completeBooking', JSON.stringify(completeBooking));
          
          // Clear pending data
          localStorage.removeItem(`pending${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
          localStorage.removeItem("pendingBooking");
          
          setToastMessage("✅ Login successful! Completing your booking...");
          setToastType("success");
          setShowToast(true);
          
          // Navigate to confirmation page
          setTimeout(() => {
            navigate(`/booking-confirmation/${bookingType}`, {
              state: {
                bookingData: completeBooking,
                bookingType: bookingType
              }
            });
          }, 1000);
          return;
        }
      }

      // Regular login (not from booking)
      setIsLoading(false);
      setToastMessage("✅ Login successful! Redirecting...");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        navigate(location.state?.from || "/");
      }, 1000);

    } catch (error) {
      setIsLoading(false);

      let errorMessage = "";
      let showErrorToast = false;

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 400) {
          errorMessage = "Incorrect email or password. Please check and try again.";
          showErrorToast = true;
        } else if (error.response.status === 403) {
          errorMessage = "Please verify your email before logging in.";
          showErrorToast = true;
        } else if (error.response.status === 500) {
          errorMessage = "Incorrect email or password. Please check and try again.";
          showErrorToast = true;
        } else if (error.response.data?.message) {
          errorMessage = "Incorrect email or password. Please check and try again.";
          showErrorToast = true;
        }
      } else if (error.request) {
        errorMessage = "Incorrect email or password. Please check and try again.";
        showErrorToast = true;
      } else if (error.message === "Invalid login response format") {
        errorMessage = "Incorrect email or password. Please check and try again.";
        showErrorToast = true;
      } else {
        errorMessage = "Incorrect email or password. Please check and try again.";
        showErrorToast = true;
      }

      if (showErrorToast) {
        setToastMessage(`❌ ${errorMessage}`);
        setToastType("error");
        setShowToast(true);
      }

      if (errorMessage.includes("verify your email")) {
        setError(errorMessage);
      } else {
        setError("");
      }

      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth-storage");
    }
  };

  const handleCancel = () => {
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleResetPassword = () => {
    const email = document.getElementById("email")?.value;
    
    if (email) {
      navigate("/reset-password", {
        state: { email },
      });
    } else {
      navigate("/reset-password");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {showToast && (
        <LoginToastNotification
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg relative">
        <button
          onClick={handleCancel}
          className="absolute -top-2 -right-2 sm:top-2 sm:right-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">Log in to Ajani</h2>
          <p className="text-gray-600 mt-2 text-sm">
            {isFromBooking 
              ? "Complete your booking or continue as guest" 
              : "Enter your credentials to access your account"
            }
          </p>

          {location.state?.message && !isFromBooking && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">{location.state.message}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full hover:bg-[#06EAFC] bg-[#6cff] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Continue as Guest Section */}
        {showGuestOption && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue as</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaUserAlt className="text-gray-500" />
              <span>Continue as Guest</span>
            </button>
            
            {isFromBooking && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-yellow-700">Guest Booking</p>
                    <p className="text-xs text-yellow-600 mt-0.5">
                      As a guest, your booking will be completed immediately. You can create an account later to track your bookings.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-600 pt-4">
          <div className="mb-3">
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

          <div className="pt-3 border-t border-gray-200">
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register", {
                  state: {
                    ...location.state,
                    fromBooking: isFromBooking
                  }
                })}
                className="text-[#6cff] hover:text-[#06EAFC] font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>

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