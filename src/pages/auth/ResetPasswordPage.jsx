// src/pages/auth/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTimes, FaCheck } from "react-icons/fa";
import Logo from "../../assets/Logos/logo5.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
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

        // Simulate API call to send OTP
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setOtpSent(true);
        setSuccess(`OTP sent to ${form.email}`);
        setStep(2);
        startCountdown(120); // 2 minutes countdown
      } else if (step === 2) {
        // Verify OTP
        if (!form.otp || form.otp.length !== 6) {
          setError("Please enter the 6-digit OTP");
          setIsLoading(false);
          return;
        }

        // Simulate OTP verification
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo purposes, accept any 6-digit OTP
        if (form.otp.length === 6) {
          setSuccess("OTP verified successfully!");
          setStep(3);
        } else {
          setError("Invalid OTP. Please try again.");
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

        // Simulate password reset
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSuccess("Password reset successfully! Redirecting to login...");

        // Redirect to login after delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
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

  const resendOTP = () => {
    if (countdown > 0) return;

    setError("");
    setSuccess("OTP resent to your email");
    startCountdown(120);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  required
                  value={form.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors"
                  placeholder="000000"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={countdown > 0}
                    className={`font-medium ${
                      countdown > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#6cff] hover:text-[#06EAFC]"
                    }`}
                  >
                    {countdown > 0
                      ? `Resend in ${formatTime(countdown)}`
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
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
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
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d37f] focus:border-[#00d37f] transition-colors"
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
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full hover:bg-[#06EAFC] bg-[#6cff] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Processing..."
              : step === 1
              ? "Send OTP"
              : step === 2
              ? "Verify OTP"
              : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center text-sm text-gray-600 pt-4">
          <p>
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#6cff] hover:text-[#06EAFC] font-medium"
            >
              Back to Login
            </button>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1
                  ? "bg-[#6cff] text-white"
                  : "bg-gray-200 text-gray-400"
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
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2
                  ? "bg-[#6cff] text-white"
                  : "bg-gray-200 text-gray-400"
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
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3
                  ? "bg-[#6cff] text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              3
            </div>
          </div>
          <span className="text-sm text-gray-500">Step {step} of 3</span>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
