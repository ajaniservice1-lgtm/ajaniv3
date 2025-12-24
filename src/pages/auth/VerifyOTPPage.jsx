import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes, FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../../lib/axios";
import Logo from "../../assets/Logos/logo5.png";

// OTP Toast Notification Component
const OTPToastNotification = ({ message, onClose, type = "success" }) => {
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
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

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from location state or localStorage
    const stateEmail =
      location.state?.email || localStorage.getItem("pendingVerificationEmail");

    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      // No email found, check if user is already logged in
      const userProfile = localStorage.getItem("userProfile");
      if (userProfile) {
        try {
          const parsedProfile = JSON.parse(userProfile);
          if (parsedProfile.email && !parsedProfile.isVerified) {
            setEmail(parsedProfile.email);
            localStorage.setItem(
              "pendingVerificationEmail",
              parsedProfile.email
            );
          } else if (parsedProfile.isVerified) {
            // User is already verified, redirect to home
            navigate("/");
            return;
          }
        } catch (error) {
          console.error("Error parsing user profile:", error);
        }
      }

      // Still no email, redirect to registration
      if (!email) {
        navigate("/register");
      }
    }

    // Start 30-second countdown for resend
    setCountdown(30);
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      newOtp.forEach((digit, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = digit;
        }
      });
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      showToast("Please enter the complete 6-digit OTP", "error");
      return;
    }

    if (!email) {
      showToast("Email not found. Please register again.", "error");
      navigate("/register");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Verifying OTP for email:", email);

      const response = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });

      console.log("OTP verification response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        // Auto-login user after successful OTP verification
        localStorage.setItem("auth_token", token);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem(
          "userProfile",
          JSON.stringify({
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture,
          })
        );

        // Clear pending verification data
        localStorage.removeItem("pendingVerificationEmail");
        localStorage.removeItem("pendingUserData");

        // Notify header component
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("authChange"));

        showToast(
          "✅ OTP verified successfully! Auto-login completed.",
          "success"
        );

        // Redirect to home after toast
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        showToast(response.data.message || "OTP verification failed", "error");
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      let errorMessage = "OTP verification failed. Please try again.";

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage =
            error.response.data?.message || "Invalid OTP. Please try again.";
        } else if (error.response.status === 404) {
          errorMessage = "OTP expired or not found. Please request a new one.";
        } else if (error.response.status === 401) {
          errorMessage = "Invalid OTP. Please check and try again.";
        }
      }

      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email) return;

    setResendLoading(true);

    try {
      const response = await axiosInstance.post("/auth/resend-otp", {
        email,
      });

      if (response.data.success) {
        showToast("✅ New OTP sent to your email!", "success");
        setCountdown(30); // Reset countdown
        setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
        inputRefs.current[0]?.focus(); // Focus first input
      } else {
        showToast(response.data.message || "Failed to resend OTP", "error");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showToast("Failed to resend OTP. Please try again.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const handleBackToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-manrope">
      {/* Toast Notification */}
      {toast.show && (
        <OTPToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white relative">
        {/* Back Button */}
        <button
          onClick={handleBackToRegister}
          className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10 flex items-center gap-2"
          aria-label="Back to registration"
        >
          <FaArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </button>

        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          Verify Your Email
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
          Enter the 6-digit verification code sent to
        </p>
        <p className="text-center font-medium text-gray-800 mt-1">
          {email || "your email"}
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#00d1ff] my-4"></div>

        {/* OTP Input Fields */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Enter verification code:
          </label>
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00d1ff] focus:ring-2 focus:ring-[#00d1ff] focus:outline-none transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Enter the 6-digit code received in your email
          </p>
        </div>

        {/* Resend OTP */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Haven't received an OTP?{" "}
            {countdown > 0 ? (
              <span className="text-gray-500">
                Resend in <span className="font-medium">{countdown}s</span>
              </span>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-black font-medium underline hover:text-[#00d1ff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </p>
        </div>

        {/* Verify Button */}
        <div className="flex justify-center">
          <button
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.join("").length !== 6}
            className="bg-[#00d37f] text-white px-8 py-3 rounded-lg shadow-md hover:bg-[#02be72] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>
            After verification, you'll be automatically logged in and redirected
            to the home page.
          </p>
          <p className="mt-2">
            Having issues? Contact support at{" "}
            <a
              href="mailto:support@ajani.com"
              className="text-[#00d1ff] hover:underline"
            >
              support@ajani.com
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
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

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        .animate-progressBar {
          animation: progressBar linear forwards;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default VerifyOTPPage;
