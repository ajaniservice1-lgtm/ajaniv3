import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Lottie from "lottie-react";

// Import your high-quality Lottie JSON animation
import successAnimation from "../../../animations/success.json";
// Place your animation inside: src/animations/success.json

const UserProcess1 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white font-manrope">
      {/* Logo */}
      <img src="/ajani-logo.png" alt="Ajani Logo" className="h-16 mb-10" />

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
        Welcome, thanks for registration
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-sm text-center mt-1">
        We will notify you when your account is activated
      </p>

      {/* Lottie Illustration */}
      <div className="w-48 h-48 mt-6 mb-6">
        <Lottie animationData={successAnimation} loop={false} />
      </div>

      {/* Button */}
      <button
        onClick={() => navigate("/register/user/process2")}
        className="bg-[#00d37f] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#02be72] transition shadow-md"
      >
        View your profile <FaArrowRight size={14} />
      </button>
    </div>
  );
};

export default UserProcess1;
