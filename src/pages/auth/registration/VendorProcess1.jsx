import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Process1 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get name from the previous form
  const firstName = location?.state?.firstName || "User";

  return (
    <div className="min-h-screen w-full bg-[#d9d9e8] flex flex-col items-center p-8 font-manrope">
      {/* Logo */}
      <div className="mt-6">
        <img
          src="/assets/Logos/logo5.png"
          alt="Ajani Logo"
          className="h-16 object-contain"
        />
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-900 mt-10">
        Tell us more about you
      </h2>

      {/* Divider */}
      <div className="w-80 border-t-2 border-[#00d1ff] mt-3 mb-8"></div>

      {/* Welcome Text */}
      <div className="text-center max-w-xl px-4">
        <p className="font-semibold text-gray-800 text-lg mb-3">
          Welcome {firstName}, Let’s get started!
        </p>

        <p className="text-gray-700 text-sm leading-relaxed">
          We want to get to know you better so we can connect you with vendors
          in your area that match your choice.
          <br />
          <br />
          In this step we ask you about the work you do, your professional
          status and your location.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-between w-full max-w-xl mt-10 px-4">
        {/* Previous Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <FaArrowLeft size={12} /> Previous
        </button>

        {/* Next Button */}
        <button
          onClick={() =>
            navigate("/register/vendor/process2", {
              state: { firstName },
            })
          }
          className="flex items-center gap-2 px-6 py-2 bg-[#00d37f] text-white rounded-lg shadow hover:bg-[#02be72] transition"
        >
          Next <FaArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Process1;
