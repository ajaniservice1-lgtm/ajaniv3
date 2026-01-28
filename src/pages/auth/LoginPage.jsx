import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheck,
  FaUserAlt,
  FaExclamationTriangle,
  FaSpinner
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

// Helper functions for session management
const SESSION_KEYS = {
  GUEST_SESSION: "guestSession",
  BOOKING_SESSION: "bookingSession",
  PENDING_BOOKING: (type) => `pending${type.charAt(0).toUpperCase() + type.slice(1)}Booking`,
  ACTIVE_BOOKING: (type) => `active${type.charAt(0).toUpperCase() + type.slice(1)}Booking`
};

// Create a booking-specific guest session (LASTS UNTIL BOOKING IS COMPLETED)
const createBookingGuestSession = (bookingType, email = null) => {
  const sessionId = `booking_guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    isGuest: true,
    sessionId: sessionId,
    createdAt: new Date().toISOString(),
    // Extended expiry for booking sessions (24 hours or until booking completion)
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    email: email || `guest_${Date.now()}@temp.com`,
    bookingType: bookingType,
    isBookingSession: true,
    lastActive: new Date().toISOString(),
    // Store booking intent
    bookingIntent: bookingType
  };
};

// Check if session is still valid
const isSessionValid = (session) => {
  if (!session) return false;
  
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  // For booking sessions, also check if it's been inactive for too long (1 hour)
  if (session.isBookingSession) {
    const lastActive = new Date(session.lastActive);
    const inactiveTime = now - lastActive;
    
    // Session expires if: 1) past expiry time OR 2) inactive for 1 hour
    return expiresAt > now && inactiveTime < (60 * 60 * 1000);
  }
  
  // Regular sessions only check expiry
  return expiresAt > now;
};

// Update session activity
const updateSessionActivity = (session) => {
  if (!session) return session;
  
  return {
    ...session,
    lastActive: new Date().toISOString()
  };
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFromBooking, setIsFromBooking] = useState(false);
  const [bookingType, setBookingType] = useState(null);
  const [showGuestOption, setShowGuestOption] = useState(true);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
    
    const handleRouteChange = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });
    };

    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [location.pathname]);

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

  // Check for existing valid booking session
  const checkExistingBookingSession = () => {
    try {
      const guestSession = localStorage.getItem(SESSION_KEYS.GUEST_SESSION);
      
      if (guestSession) {
        const sessionData = JSON.parse(guestSession);
        
        // Check if it's a booking session and still valid
        if (sessionData.isBookingSession && isSessionValid(sessionData)) {
          console.log("✅ Valid booking guest session found");
          
          // Update last activity
          const updatedSession = updateSessionActivity(sessionData);
          localStorage.setItem(SESSION_KEYS.GUEST_SESSION, JSON.stringify(updatedSession));
          
          // Check for pending booking
          const bookingType = sessionData.bookingType || "hotel";
          const pendingBookingKey = SESSION_KEYS.PENDING_BOOKING(bookingType);
          const pendingBooking = localStorage.getItem(pendingBookingKey);
          
          if (pendingBooking) {
            console.log("✅ Pending booking found, redirecting to payment");
            navigate(`/booking/payment`, {
              state: {
                bookingType: bookingType,
                isGuestBooking: true,
                sessionId: sessionData.sessionId
              }
            });
            return true;
          }
        } else {
          // Clear invalid or expired session
          localStorage.removeItem(SESSION_KEYS.GUEST_SESSION);
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking booking session:", error);
      localStorage.removeItem(SESSION_KEYS.GUEST_SESSION);
      return false;
    }
  };

  // Check for existing session
  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // First, check if there's a valid booking guest session
      const hasValidBookingSession = checkExistingBookingSession();
      if (hasValidBookingSession) {
        setIsCheckingSession(false);
        return;
      }
      
      if (!token) {
        setIsCheckingSession(false);
        return;
      }

      // Validate the token with backend
      console.log("🔍 Checking existing session...");
      const response = await axiosInstance.get("/auth/validate-session", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.valid) {
        console.log("✅ Valid session found, redirecting...");
        
        // Update user profile
        if (response.data.user) {
          localStorage.setItem("userProfile", JSON.stringify(response.data.user));
          localStorage.setItem("user_email", response.data.user.email);
          
          // Dispatch events
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("authChange"));
        }
        
        // Check for pending booking
        if (location.state?.fromBooking) {
          const bookingType = location.state?.intent?.replace('_booking', '') || "hotel";
          
          // Check for pending booking
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
            // Create complete booking for logged in user
            const completeBooking = {
              ...pendingBooking.bookingData,
              paymentMethod: pendingBooking.selectedPayment || (bookingType === "hotel" ? "hotel" : "restaurant"),
              bookingType: bookingType,
              bookingDate: new Date().toISOString(),
              bookingId: pendingBooking.bookingId || `USER-${Date.now()}`,
              status: "pending",
              totalAmount: pendingBooking.totalAmount || 0,
              timestamp: Date.now(),
              userId: response.data.user._id,
              userEmail: response.data.user.email,
              userName: `${response.data.user.firstName} ${response.data.user.lastName}`
            };
            
            // Add type-specific data
            if (bookingType === "hotel") {
              completeBooking.roomData = pendingBooking.roomData;
              completeBooking.hotelData = pendingBooking.hotelData;
              completeBooking.guests = pendingBooking.guests;
              completeBooking.checkInDate = pendingBooking.checkInDate;
              completeBooking.checkOutDate = pendingBooking.checkOutDate;
            } else if (bookingType === "restaurant" || bookingType === "shortlet") {
              completeBooking.vendorData = pendingBooking.vendorData;
            }
            
            // Save the completed booking
            localStorage.setItem(`pendingLoggedIn${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`, JSON.stringify(completeBooking));
            
            // Clear pending data
            localStorage.removeItem(`pending${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
            
            navigate(`/booking/payment`, {
              state: {
                bookingData: completeBooking,
                bookingType: bookingType
              }
            });
          } else {
            navigate(`/booking/payment`);
          }
        } else {
          // Regular redirect to previous page or home
          const returnTo = location.state?.returnTo || location.state?.from || "/";
          navigate(returnTo);
        }
      } else {
        // Invalid session, clear tokens
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("userProfile");
        localStorage.removeItem("auth-storage");
        setIsCheckingSession(false);
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      // Clear invalid tokens
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("auth-storage");
      setIsCheckingSession(false);
    }
  };

  useEffect(() => {
    // Check for existing session on component mount
    checkExistingSession();

    // Check if user came from booking
    const fromBooking = location.state?.fromBooking;
    const intent = location.state?.intent;
    const returnTo = location.state?.returnTo;

    if (fromBooking && intent) {
      setIsFromBooking(true);
      const type = intent.replace('_booking', '');
      setBookingType(type);
      
      // Check for pending booking
      const pendingBookingKey = SESSION_KEYS.PENDING_BOOKING(type);
      const pendingBooking = localStorage.getItem(pendingBookingKey);
      
      if (pendingBooking) {
        setHasPendingBooking(true);
        console.log("Pending booking found:", type);
        
        // Show toast message
        setToastMessage("Continue with your booking");
        setToastType("info");
        setShowToast(true);
      }
      
      // Pre-fill email if available from pending booking
      if (pendingBooking) {
        try {
          const bookingData = JSON.parse(pendingBooking);
          if (bookingData.bookingData?.email) {
            setValue("email", bookingData.bookingData.email);
          } else if (bookingData.bookingData?.contactInfo?.email) {
            setValue("email", bookingData.bookingData.contactInfo.email);
          }
        } catch (error) {
          console.error("Error parsing pending booking:", error);
        }
      }
    } else {
      // User clicked login from header
      setIsFromBooking(false);
      setBookingType(null);
    }

    // Show guest option only if user came from booking or is on homepage
    setShowGuestOption(fromBooking || location.pathname === "/");
  }, [location.state, setValue, location.pathname]);

  // Function to handle "Continue as Guest" - BOOKING SPECIFIC
  const handleContinueAsGuest = () => {
    console.log("Continuing as guest for booking session...");
    
    // Determine booking type
    const bookingType = location.state?.intent?.replace('_booking', '') || "hotel";
    console.log("Booking type:", bookingType);
    
    // Check for pending booking
    const pendingBookingKey = SESSION_KEYS.PENDING_BOOKING(bookingType);
    const pendingBooking = localStorage.getItem(pendingBookingKey);
    
    if (pendingBooking && hasPendingBooking) {
      console.log(`Found pending ${bookingType} booking, creating booking guest session...`);
      
      try {
        const bookingData = JSON.parse(pendingBooking);
        
        // Create booking-specific guest session (LASTS UNTIL BOOKING COMPLETION)
        const sessionData = createBookingGuestSession(bookingType, email || bookingData.bookingData?.email);
        
        // Save guest session
        localStorage.setItem(SESSION_KEYS.GUEST_SESSION, JSON.stringify(sessionData));
        
        // Update the booking data with session info
        const updatedBooking = {
          ...bookingData,
          isGuestBooking: true,
          guestSessionId: sessionData.sessionId,
          guestEmail: sessionData.email,
          sessionCreatedAt: sessionData.createdAt
        };
        
        localStorage.setItem(pendingBookingKey, JSON.stringify(updatedBooking));
        
        // Show success message
        setToastMessage(`✅ Guest session created! You can close and return anytime.`);
        setToastType("success");
        setShowToast(true);
        
        // Navigate to PAYMENT PAGE
        setTimeout(() => {
          navigate(`/booking/payment`, {
            state: {
              bookingData: updatedBooking,
              bookingType: bookingType,
              isGuestBooking: true,
              guestSessionId: sessionData.sessionId
            }
          });
        }, 1000);
        
      } catch (error) {
        console.error("Error processing guest booking:", error);
        setToastMessage("❌ Error processing booking. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
      
    } else {
      // No pending booking found
      console.log("No pending booking found");
      
      // Create basic guest session for browsing
      const sessionData = {
        isGuest: true,
        sessionId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour for browsing
        email: email || `guest_${Date.now()}@temp.com`,
        isBrowsingOnly: true,
        lastActive: new Date().toISOString()
      };
      
      localStorage.setItem(SESSION_KEYS.GUEST_SESSION, JSON.stringify(sessionData));
      
      setToastMessage("✅ Continuing as guest - Enjoy browsing!");
      setToastType("success");
      setShowToast(true);
      
      setTimeout(() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/");
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
            status: "pending", // Set to pending initially
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
            completeBooking.guests = pendingBooking.guests;
            completeBooking.checkInDate = pendingBooking.checkInDate;
            completeBooking.checkOutDate = pendingBooking.checkOutDate;
          } else if (bookingType === "restaurant" || bookingType === "shortlet") {
            completeBooking.vendorData = pendingBooking.vendorData;
          }
          
          // Save the completed booking TEMPORARILY
          localStorage.setItem(`pendingLoggedIn${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`, JSON.stringify(completeBooking));
          
          // Clear pending data
          localStorage.removeItem(`pending${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}Booking`);
          localStorage.removeItem("pendingBooking");
          
          setToastMessage("✅ Login successful! Redirecting to payment...");
          setToastType("success");
          setShowToast(true);
          
          // Navigate to PAYMENT PAGE, not confirmation
          setTimeout(() => {
            navigate(`/booking/payment`, {
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

  // Add cleanup for browsing-only sessions on unmount
  useEffect(() => {
    return () => {
      // Only clear browsing sessions, not booking sessions
      const guestSession = localStorage.getItem(SESSION_KEYS.GUEST_SESSION);
      if (guestSession) {
        try {
          const sessionData = JSON.parse(guestSession);
          if (sessionData.isBrowsingOnly && !sessionData.isBookingSession) {
            // Optionally clear browsing sessions when login page unmounts
            // Or keep them for 1 hour as set above
          }
        } catch (error) {
          console.error("Error parsing session on unmount:", error);
        }
      }
    };
  }, []);

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <FaSpinner className="animate-spin text-[#6cff] text-3xl mb-4" />
            <p className="text-gray-600">Checking your session...</p>
            {hasPendingBooking && (
              <p className="text-sm text-green-600 mt-2">
                We found your pending booking. Redirecting...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            
            {hasPendingBooking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-blue-700 text-center">
                  <FaExclamationTriangle className="inline mr-1" />
                  Your booking will be saved. You can close this page and return anytime.
                </p>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleContinueAsGuest}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all hover:from-gray-100 hover:to-gray-200 hover:border-gray-400 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaUserAlt className="text-gray-500" />
              <span>Continue as Guest {hasPendingBooking ? "(Booking Session)" : ""}</span>
            </button>
            
            {hasPendingBooking && (
              <p className="text-xs text-gray-500 text-center">
                Your session will be saved until booking completion
              </p>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-600 pt-2">
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

          <div className="pt-1 border-t border-gray-200">
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
                Get Started
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