import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Process1 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get ALL data from the previous form, not just firstName
  const formData = location?.state || {};

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-4 sm:p-6 md:p-12 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-8 sm:p-10 md:p-12 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/Logos/logo5.png"
            alt="Ajani Logo"
            className="h-12 md:h-16 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mt-4">
          Tell us more about you
        </h2>

        {/* Divider */}
        <div className="w-20 sm:w-32 border-t-2 border-[#00d1ff] mt-3 mb-6 mx-auto"></div>

        {/* Welcome Text */}
        <div className="text-center max-w-xl mx-auto px-2 sm:px-4">
          <p className="font-semibold text-gray-800 text-lg mb-3">
            Welcome {formData.firstName || "User"}, let's get started!
          </p>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            We want to get to know you better so we can connect you with vendors
            in your area that match your choice.
            <br />
            <br />
            In this step we ask you about the work you do, your professional
            status, and your location.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between w-full mt-8 px-2 sm:px-0">
          {/* Previous Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <FaArrowLeft size={12} /> Previous
          </button>

          {/* Next Button - PASS ALL DATA FORWARD */}
          <button
            onClick={() =>
              navigate("/register/vendor/process2", {
                state: { ...formData }, // Pass all data forward
              })
            }
            className="flex items-center gap-2 px-5 sm:px-6 py-2 bg-[#00d37f] text-white rounded-lg shadow hover:bg-[#02be72] transition"
          >
            Next <FaArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Process1;
