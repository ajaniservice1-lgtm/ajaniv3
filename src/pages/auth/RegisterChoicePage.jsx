import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../assets/Logos/logo1.png";

const RegisterChoicePage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo Left */}
      <div className="p-6">
        <img
          src={Icon}
          alt="Ajani Logo"
          className="h-7 object-contain cursor-pointer"
        />
      </div>

      {/* Middle Content */}
      <div className="flex flex-col items-center px-4 mt-4">
        <h2 className="text-3xl font-semibold text-gray-900">
          Join Ajani as a client or freelancer
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Client Card */}
          <button
            onClick={() => setSelected("client")}
            className={`p-6 w-80 border rounded-xl text-left transition-all bg-white
              ${
                selected === "client"
                  ? "border-black shadow-sm"
                  : "border-gray-300 hover:border-black"
              }
            `}
          >
            <div className="flex justify-between items-start">
              {/* Icon */}
              <svg
                className="w-7 h-7 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>

              {/* Radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    selected === "client" ? "border-black" : "border-gray-400"
                  }`}
              >
                {selected === "client" && (
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                )}
              </div>
            </div>

            <h3 className="mt-6 text-lg font-medium text-gray-900">
              I'm a user to buy
            </h3>
          </button>

          {/* Freelancer Card */}
          <button
            onClick={() => setSelected("vendor")}
            className={`p-6 w-80 border rounded-xl text-left transition-all bg-white
              ${
                selected === "vendor"
                  ? "border-black shadow-sm"
                  : "border-gray-300 hover:border-black"
              }
            `}
          >
            <div className="flex justify-between items-start">
              {/* Icon */}
              <svg
                className="w-7 h-7 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              {/* Radio */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${
                    selected === "vendor" ? "border-black" : "border-gray-400"
                  }`}
              >
                {selected === "vendor" && (
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                )}
              </div>
            </div>

            <h3 className="mt-6 text-lg font-medium text-gray-900">
              I'm a vendor for listing
            </h3>
          </button>
        </div>

        {/* Dynamic Create Button */}
        <button
          disabled={!selected}
          onClick={() =>
            navigate(
              selected === "client" ? "/register/user" : "/register/vendor"
            )
          }
          className={`mt-10 w-80 py-3 rounded-lg font-medium transition-all
            ${
              selected
                ? "bg-black text-white hover:bg-gray-900"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {!selected && "Create Account"}
          {selected === "client" && "Join as user"}
          {selected === "vendor" && "Apply as vedor"}
        </button>

        {/* Login */}
        <p className="mt-4 text-sm text-gray-700">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-600 hover:underline font-medium"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterChoicePage;
