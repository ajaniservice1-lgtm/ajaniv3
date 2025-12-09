import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../assets/Logos/logo6.png";

const Process3 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#d6d7e1] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <img src={Logo} alt="Ajani Logo" className="w-40 mb-10" />

      {/* Text */}
      <h1 className="text-2xl font-semibold text-black text-center">
        Welcome, thanks for registration
      </h1>
      <p className="mt-2 text-gray-600 text-center">
        We will notify you when your account is activated
      </p>

      {/* Button - FIXED PATH */}
      <button
        onClick={() => navigate("/register/vendor/complete-profile")} // Fixed: added hyphen
        className="mt-8 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-5 rounded-lg flex items-center gap-2 transition"
      >
        View your profile →
      </button>
    </div>
  );
};

export default Process3;
