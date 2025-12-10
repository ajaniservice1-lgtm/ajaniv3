import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Process2 = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get ALL previous form data
  const prevState = location.state || {};

  const [description, setDescription] = useState(prevState.description || "");
  const maxChars = 1000;

  return (
    <div className="min-h-screen w-full bg-white flex justify-center p-4 sm:p-6 md:p-12 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-8 sm:p-10 md:p-12 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
          Tell us more about you
        </h2>

        <div className="w-full mt-4 mb-6">
          <div className="w-full h-1 bg-gray-300 rounded-full">
            <div className="h-1 bg-[#00d1ff] rounded-full w-1/2"></div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-center text-gray-800 font-medium mb-4">
            Write a description about yourself
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={maxChars}
            placeholder="Write your text"
            className="w-full h-40 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#00d1ff]"
          />
          <p className="text-gray-600 text-sm mt-2 text-right">
            {maxChars - description.length} characters remaining
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <FaArrowLeft size={12} /> Previous
          </button>

          <button
            onClick={() =>
              navigate("/register/vendor/process3", {
                // Pass ALL previous data + new description
                state: {
                  ...prevState,
                  description,
                },
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

export default Process2;
