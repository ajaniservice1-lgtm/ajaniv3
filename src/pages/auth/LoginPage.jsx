import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsEmailSubmitted(true);
      // Dummy login - set a flag in localStorage to simulate being logged in
      localStorage.setItem("ajani_dummy_login", "true");
      localStorage.setItem("ajani_dummy_email", email);

      // Redirect to home after 2 seconds to simulate email verification delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
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
            {isEmailSubmitted ? "Welcome to Ajani" : "Log in to Ajani"}
          </h2>
          {isEmailSubmitted ? (
            <p className="mt-2 text-sm text-gray-600">
              Logging you in as <strong>{email}</strong>
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
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                You're now logged in! Redirecting you to the homepage...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-12 h-1 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
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
              Continue with Email
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Other options coming soon
                </span>
              </div>
            </div>

            {/* Simple Alternative Options */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("ajani_dummy_login", "true");
                  localStorage.setItem(
                    "ajani_dummy_email",
                    "guest@example.com"
                  );
                  navigate("/");
                }}
                className="w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Continue as Guest
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Create New Account
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
          <p className="text-xs">
            This is a demo login. No actual authentication is implemented yet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
