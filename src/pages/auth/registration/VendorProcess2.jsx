import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo6.png";

const Process2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Access firstName if passed from previous page
  const firstName = location?.state?.firstName || "";

  const [description, setDescription] = useState("");
  const maxChars = 1000;

  return (
    <div className="min-h-screen bg-[#d9d9e8] flex flex-col items-center p-10 font-manrope">
      {/* Logo */}
      <img src={Logo} alt="Ajani Logo" className="h-16 mt-4" />

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-900 text-center mt-10">
        Tell us more about you
      </h2>

      {/* Progress bar */}
      <div className="w-full max-w-2xl mt-3">
        <div className="w-full h-1 bg-gray-300 rounded-full">
          <div className="h-1 bg-[#00d1ff] rounded-full w-1/2"></div>
        </div>
      </div>

      {/* Description Box */}
      <div className="w-full max-w-2xl mt-10">
        <p className="text-center text-gray-800 font-medium mb-4">
          Write a description about yourself
        </p>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={maxChars}
          placeholder="Write your text"
          className="w-full h-40 border border-gray-300 rounded-md p-4 
                     focus:outline-none focus:ring-2 focus:ring-[#00d1ff]"
        ></textarea>

        <p className="text-gray-600 text-sm mt-2">
          {maxChars - description.length} characters remaining
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-2xl flex justify-between mt-12 px-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2 border border-gray-400 
                     rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <FaArrowLeft size={12} /> Previous
        </button>

        <button
          onClick={() =>
            navigate("/register/vendor/process3", {
              state: { firstName, description },
            })
          }
          className="flex items-center gap-2 px-6 py-2 bg-[#00d37f] text-white rounded-lg 
                     shadow hover:bg-[#02be72] transition"
        >
          Next <FaArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Process2;
