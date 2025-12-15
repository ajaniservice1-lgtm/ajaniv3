import React from "react";
import { useNavigate } from "react-router-dom";

const UserCompleteProfile = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Here you would save the profile data
    navigate("/"); // Redirect to home
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full w-full"></div>
        </div>

        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Profile Complete!
            </h2>
            <p className="mt-2 text-gray-600">Your client account is ready</p>
            {user && (
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {user.email}
              </p>
            )}
          </div>

          <div className="space-y-4 text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900">What's next?</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Post your first project
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Browse available professionals
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Set up payment methods
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleComplete}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Explore Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCompleteProfile;
