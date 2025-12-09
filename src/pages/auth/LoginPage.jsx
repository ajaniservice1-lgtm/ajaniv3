import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsEmailSubmitted(true);
      // Here you would typically send verification email
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="/assets/Logos/logo5.png"
              alt="Ajani Logo"
              className="h-10 w-40 object-contain"
            />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isEmailSubmitted ? "Check your email" : "Log in to Ajani"}
          </h2>
          {isEmailSubmitted ? (
            <p className="mt-2 text-sm text-gray-600">
              We sent a login link to <strong>{email}</strong>
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to get started
            </p>
          )}
        </div>

        {isEmailSubmitted ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Check your inbox for the login link. Click it to access your
                account.
              </p>
            </div>
            <button
              onClick={() => setIsEmailSubmitted(false)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-4">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FaApple className="w-5 h-5" />
                Continue with Apple
              </button>
            </div>
          </form>
        )}

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </button>
          </p>
          <p>
            By clicking "Continue" above, you agree to our{" "}
            <button className="text-blue-600 hover:text-blue-800">Terms</button>{" "}
            and{" "}
            <button className="text-blue-600 hover:text-blue-800">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
