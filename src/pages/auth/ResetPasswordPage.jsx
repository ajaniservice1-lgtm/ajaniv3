import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTimes, FaCheck } from "react-icons/fa";
import Logo from "../../assets/Logos/logo5.png";
import axiosInstance from "../../lib/axios";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Pre-fill email from location state if available
  React.useEffect(() => {
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (step === 1) {
        // Send OTP to email
        if (!form.email || !form.email.includes("@")) {
          setError("Please enter a valid email address");
          setIsLoading(false);
          return;
        }

        console.log("Requesting password reset OTP for:", form.email);

        // API call to request password reset OTP
        const response = await axiosInstance.post("/auth/forgot-password", {
          email: form.email,
        });

        console.log("Password reset OTP response:", response.data);

        if (
          response.data.success ||
          response.data.message === "OTP sent successfully"
        ) {
          setOtpSent(true);
          setSuccess(`OTP sent to ${form.email}`);
          setStep(2);
          startCountdown(120); // 2 minutes countdown
        } else {
          setError(
            response.data.message || "Failed to send OTP. Please try again."
          );
        }
      } else if (step === 2) {
        // Verify OTP
        if (!form.otp || form.otp.length !== 6) {
          setError("Please enter the 6-digit OTP");
          setIsLoading(false);
          return;
        }

        console.log("Verifying password reset OTP:", {
          email: form.email,
          otp: form.otp,
        });

        // API call to verify password reset OTP
        const response = await axiosInstance.post("/auth/verify-reset-otp", {
          email: form.email,
          otp: form.otp,
        });

        console.log("OTP verification response:", response.data);

        if (
          response.data.success ||
          response.data.message === "OTP verified successfully"
        ) {
          setSuccess("OTP verified successfully!");
          setStep(3);
        } else {
          setError(response.data.message || "Invalid OTP. Please try again.");
        }
      } else if (step === 3) {
        // Set new password
        if (!form.password || form.password.length < 8) {
          setError("Password must be at least 8 characters long");
          setIsLoading(false);
          return;
        }

        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        console.log("Resetting password for:", form.email);

        // API call to reset password
        const response = await axiosInstance.post("/auth/reset-password", {
          email: form.email,
          otp: form.otp,
          newPassword: form.password,
        });

        console.log("Password reset response:", response.data);

        if (
          response.data.success ||
          response.data.message === "Password reset successfully"
        ) {
          setSuccess("Password reset successfully! Redirecting to login...");

          // Clear any existing auth data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_email");
          localStorage.removeItem("userProfile");
          localStorage.removeItem("auth-storage");

          // Redirect to login after delay
          setTimeout(() => {
            navigate("/login", {
              state: {
                resetSuccess: true,
                email: form.email,
              },
            });
          }, 2000);
        } else {
          setError(
            response.data.message ||
              "Failed to reset password. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);

      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);

        if (error.response.status === 400) {
          errorMessage =
            error.response.data?.message ||
            "Invalid request. Please check your input.";
        } else if (error.response.status === 404) {
          errorMessage = "Email not found. Please check and try again.";
        } else if (error.response.status === 429) {
          errorMessage = "Too many attempts. Please try again later.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = (seconds) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOTP = async () => {
    if (countdown > 0 || !form.email) return;

    setError("");
    setIsLoading(true);

    try {
      console.log("Resending OTP to:", form.email);

      const response = await axiosInstance.post("/auth/resend-otp", {
        email: form.email,
        type: "password-reset", // Specify this is for password reset
      });

      if (
        response.data.success ||
        response.data.message === "OTP resent successfully"
      ) {
        setSuccess("OTP resent to your email");
        startCountdown(120);
      } else {
        setError(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For OTP input, only allow numbers and limit to 6 digits
    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }

    if (error) setError("");
  };

  const handleCancel = () => {
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/login");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengths = [
      { text: "Very Weak", color: "bg-red-500" },
      { text: "Weak", color: "bg-orange-500" },
      { text: "Fair", color: "bg-yellow-500" },
      { text: "Good", color: "bg-blue-500" },
      { text: "Strong", color: "bg-green-500" },
    ];

    return strengths[strength];
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
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 && "Reset Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Set New Password"}
          </h2>

          <p className="text-gray-600 mt-2 text-sm">
            {step === 1 && "Enter your email to receive a verification code"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create a new password for your account"}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <FaCheck className="text-green-600" />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Email Input */}
          {step === 1 && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
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
                placeholder="Enter your email address"
              />
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter 6-digit OTP *
                </label>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="1"
                      value={form.otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value || e.target.value === "") {
                          const newOtp = form.otp.split("");
                          newOtp[index] = value;
                          const otpString = newOtp.join("");
                          setForm({ ...form, otp: otpString });

                          // Auto-focus next input
                          if (value && index < 5) {
                            document
                              .getElementById(`otp-${index + 1}`)
                              ?.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !form.otp[index] &&
                          index > 0
                        ) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      id={`otp-${index}`}
                      className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#00d37f] focus:ring-2 focus:ring-[#00d37f] focus:outline-none transition-colors"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Enter the 6-digit code received in your email
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={countdown > 0 || isLoading}
                    className={`font-medium ${
                      countdown > 0 || isLoading
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#6cff] hover:text-[#06EAFC]"
                    }`}
                  >
                    {countdown > 0
                      ? `Resend in ${formatTime(countdown)}`
                      : isLoading
                      ? "Sending..."
                      : "Resend OTP"}
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  OTP sent to: <span className="font-medium">{form.email}</span>
                </p>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors"
                    placeholder="Enter new password"
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>

                {/* Password strength indicator */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getPasswordStrength(form.password).color
                          } transition-all duration-300`}
                          style={{
                            width: `${
                              (getPasswordStrength(form.password).strength +
                                1) *
                              20
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {getPasswordStrength(form.password).text}
                      </span>
                    </div>
                    <ul className="text-xs text-gray-500 space-y-1 mt-2">
                      <li
                        className={`${
                          form.password.length >= 8 ? "text-green-600" : ""
                        }`}
                      >
                        • At least 8 characters
                      </li>
                      <li
                        className={`${
                          /[A-Z]/.test(form.password) ? "text-green-600" : ""
                        }`}
                      >
                        • At least one uppercase letter
                      </li>
                      <li
                        className={`${
                          /[0-9]/.test(form.password) ? "text-green-600" : ""
                        }`}
                      >
                        • At least one number
                      </li>
                      <li
                        className={`${
                          /[^A-Za-z0-9]/.test(form.password)
                            ? "text-green-600"
                            : ""
                        }`}
                      >
                        • At least one special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors ${
                      form.confirmPassword &&
                      form.password !== form.confirmPassword
                        ? "border-red-500"
                        : form.password &&
                          form.password === form.confirmPassword
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm new password"
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
                {form.confirmPassword &&
                  form.password !== form.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
                {form.confirmPassword &&
                  form.password === form.confirmPassword && (
                    <p className="text-green-500 text-xs mt-1">
                      Passwords match ✓
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full hover:bg-[#06EAFC] bg-[#6cff] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {step === 1
                  ? "Sending OTP..."
                  : step === 2
                  ? "Verifying..."
                  : "Resetting Password..."}
              </>
            ) : step === 1 ? (
              "Send OTP"
            ) : step === 2 ? (
              "Verify OTP"
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center text-sm text-gray-600 pt-4">
          <p>
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#6cff] hover:text-[#06EAFC] font-medium"
              disabled={isLoading}
            >
              Back to Login
            </button>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1
                  ? "bg-[#6cff] border-[#6cff] text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 mx-2 ${
                step >= 2 ? "bg-[#6cff]" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2
                  ? "bg-[#6cff] border-[#6cff] text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              2
            </div>
            <div
              className={`w-16 h-1 mx-2 ${
                step >= 3 ? "bg-[#6cff]" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 3
                  ? "bg-[#6cff] border-[#6cff] text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              3
            </div>
          </div>
          <span className="text-sm text-gray-500">Step {step} of 3</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
