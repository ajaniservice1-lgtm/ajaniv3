import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import Icon from "../../assets/Logos/logo5.png";
import Ilu1 from "../../assets/Illustration/undraw_online-groceries_n03y.png";
import Ilu2 from "../../assets/Illustration/undraw_shopping-app_b80f.png";

const RegisterChoicePage = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const handleCancel = () => {
    const hasPreviousPage = window.history.length > 1;
    if (hasPreviousPage) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Close Button - Top Right */}
      <div className="w-full flex justify-end p-4 sm:p-6">
        <button
          onClick={handleCancel}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col items-center px-4 pb-8 flex-grow">
        {/* Logo */}
        <div className="mb-6">
          <img
            src={Icon}
            alt="Ajani Logo"
            className="h-12 w-auto object-contain"
          />
        </div>


        {/* Subheading */}
        <p className="text-gray-600 text-center text-base sm:text-lg mb-10 max-w-md">
          Choose how you want to experience Ajani
        </p>

        {/* Choices Container with exact dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl px-4">
          {/* Buyer/Explorer Card */}
          <div
            onClick={() => setSelected("client")}
            className={`relative bg-white cursor-pointer transition-all duration-200 mx-auto
              ${
                selected === "client"
                  ? "border-green-500 border-4"
                  : "border-gray-200"
              }
              /* Mobile dimensions */
              w-[233.7px] h-[311.82px] rounded-[22.41px] border-[3px]
              /* LG dimensions */
              lg:w-[397.98px] lg:h-[531px] lg:rounded-[38.16px] lg:border-2
              ${selected === "client" ? "shadow-lg" : "hover:shadow-md"}`}
          >
            {/* Illustration */}
            <div className="flex justify-center mt-6 lg:mt-12 mb-4 lg:mb-8 px-4">
              <img
                src={Ilu1}
                alt="Buyer Illustration"
                className="h-32 lg:h-56 w-auto object-contain"
              />
            </div>

            {/* Content Container */}
            <div className="px-5 lg:px-8 space-y-3 lg:space-y-6">
              <h2 className="text-xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Buyer / Explorer
              </h2>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                Discover hotels, restaurants, local vendors, events and price
                insight across Ibadan
              </p>
            </div>

            {/* Next Arrow - Positioned at bottom */}
            <div className="absolute bottom-5 lg:bottom-8 left-5 lg:left-8 right-5 lg:right-8 pt-4 lg:pt-6 border-t border-gray-200">
              <span className="text-green-600 font-semibold text-sm lg:text-lg">
                Next →
              </span>
            </div>
          </div>

          {/* Vendor/Business Owner Card */}
          <div
            onClick={() => setSelected("vendor")}
            className={`relative bg-white cursor-pointer transition-all duration-200 mx-auto
              ${
                selected === "vendor"
                  ? "border-green-500 border-4"
                  : "border-gray-200"
              }
              /* Mobile dimensions */
              w-[233.7px] h-[311.82px] rounded-[22.41px] border-[3px]
              /* LG dimensions */
              lg:w-[397.98px] lg:h-[531px] lg:rounded-[38.16px] lg:border-2
              ${selected === "vendor" ? "shadow-lg" : "hover:shadow-md"}`}
          >
            {/* Illustration */}
            <div className="flex justify-center mt-6 lg:mt-12 mb-4 lg:mb-8 px-4">
              <img
                src={Ilu2}
                alt="Vendor Illustration"
                className="h-32 lg:h-56 w-auto object-contain"
              />
            </div>

            {/* Content Container */}
            <div className="px-5 lg:px-8 space-y-3 lg:space-y-6">
              <h2 className="text-xl lg:text-3xl font-bold text-gray-900 leading-tight">
                Vendor / Business Owner
              </h2>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                List my business receive booking, chat with customer, and grow
                your visibility on Ajani
              </p>
            </div>

            {/* Next Arrow - Positioned at bottom */}
            <div className="absolute bottom-5 lg:bottom-8 left-5 lg:left-8 right-5 lg:right-8 pt-4 lg:pt-6 border-t border-gray-200">
              <span className="text-green-600 font-semibold text-sm lg:text-lg">
                Next →
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Continue Button */}
        <div className="mt-8 lg:mt-12 w-full max-w-md px-4">
          <button
            disabled={!selected}
            onClick={() =>
              navigate(
                selected === "client" ? "/register/user" : "/register/vendor"
              )
            }
            className={`w-full py-3 lg:py-4 px-6 rounded-xl font-semibold text-base lg:text-lg transition-all duration-200
              ${
                selected === "client"
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                  : selected === "vendor"
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {!selected && "Create Account"}
            {selected === "client" && "Join as Buyer"}
            {selected === "vendor" && "Apply as Vendor"}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600 text-sm lg:text-base">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-green-600 hover:text-green-700 font-semibold underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoicePage;
