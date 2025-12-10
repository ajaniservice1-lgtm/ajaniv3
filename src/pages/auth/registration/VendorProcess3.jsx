import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Process3 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get ALL collected data
  const formData = location.state || {};

  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-center p-4 sm:p-6 md:p-12 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl p-8 sm:p-10 md:p-12 rounded-xl shadow-lg bg-white text-center">
        {/* Welcome Text */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          Welcome, thanks for registering!
        </h1>
        <p className="text-gray-700 text-sm sm:text-base">
          We will notify you when your account is activated.
        </p>

        {/* Button - PASS ALL DATA TO COMPLETE PROFILE */}
        <button
          onClick={() =>
            navigate("/register/vendor/complete-profile", {
              state: { ...formData }, // Pass all collected data
            })
          }
          className="mt-8 bg-[#00d37f] hover:bg-[#02be72] text-white font-medium py-3 px-6 rounded-lg shadow flex items-center justify-center gap-2 transition"
        >
          View your profile →
        </button>
      </div>
    </div>
  );
};

export default Process3;
