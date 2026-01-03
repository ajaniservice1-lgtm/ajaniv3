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
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Close Button - Top Right for Mobile */}
      <div className="w-full flex justify-end p-3 sm:p-4 lg:absolute lg:right-0 lg:top-0 lg:p-6">
        <button
          onClick={handleCancel}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col items-center justify-center px-3 py-2 lg:py-4 flex-grow">
        {/* Logo - Centered for Mobile */}
        <div className="mb-2 lg:mb-3 flex justify-center">
          <img
            src={Icon}
            alt="Ajani Logo"
            className="h-8 lg:h-10 w-auto object-contain"
          />
        </div>

        {/* Subheading */}
        <p className="text-gray-600 text-center text-sm sm:text-base mb-4 lg:mb-6 max-w-md">
          Choose how you want to experience Ajani
        </p>

        {/* Choices Container - Different layouts for mobile vs desktop */}
        <div className="w-full max-w-md lg:max-w-2xl px-3">
          {/* Mobile Layout - Stacked Cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Buyer/Explorer Card - Mobile */}
            <div
              onClick={() => setSelected("client")}
              className={`relative bg-white cursor-pointer transition-all duration-200
                ${
                  selected === "client"
                    ? "border-green-500 border-2"
                    : "border-gray-200 border"
                }
                w-full h-[150px] rounded-xl flex items-center`}
            >
              {/* Illustration */}
              <div className="w-1/3 flex items-center justify-center p-2">
                <img
                  src={Ilu1}
                  alt="Buyer Illustration"
                  className="h-20 w-auto object-contain"
                />
              </div>

              {/* Content Container */}
              <div className="w-2/3 p-3">
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  Buyer / Explorer
                </h2>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Discover hotels, restaurants, local vendors, events, services and price
                  insight across Ibadan
                </p>
              </div>
            </div>

            {/* Vendor/Business Owner Card - Mobile */}
            <div
              onClick={() => setSelected("vendor")}
              className={`relative bg-white cursor-pointer transition-all duration-200
                ${
                  selected === "vendor"
                    ? "border-green-500 border-2"
                    : "border-gray-200 border"
                }
                w-full h-[150px] rounded-xl flex items-center`}
            >
              {/* Illustration */}
              <div className="w-1/3 flex items-center justify-center p-2">
                <img
                  src={Ilu2}
                  alt="Vendor Illustration"
                  className="h-20 w-auto object-contain"
                />
              </div>

              {/* Content Container */}
              <div className="w-2/3 p-3">
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  Vendor / Business Owner
                </h2>
                <p className="text-gray-600 text-xs leading-relaxed">
                  List my business receive booking, chat with customer, and grow
                  your visibility on Ajani
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Original Design */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-5">
            {/* Buyer/Explorer Card - Desktop */}
            <div
              onClick={() => setSelected("client")}
              className={`relative bg-white cursor-pointer transition-all duration-200 mx-auto
                ${
                  selected === "client"
                    ? "border-green-500 border-3"
                    : "border-gray-200"
                }
                w-[280px] h-[340px] rounded-xl border-2
                ${selected === "client" ? "shadow-md" : "hover:shadow-sm"}`}
            >
              {/* Illustration */}
              <div className="flex justify-center mt-3 mb-10 px-3">
                <img
                  src={Ilu1}
                  alt="Buyer Illustration"
                  className="h-28 w-auto object-contain"
                />
              </div>

              {/* Content Container */}
              <div className="px-4 space-y-1.5">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Buyer / Explorer
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Discover hotels, restaurants, local vendors, events, services and price
                  insight across Ibadan
                </p>
              </div>
            </div>

            {/* Vendor/Business Owner Card - Desktop */}
            <div
              onClick={() => setSelected("vendor")}
              className={`relative bg-white cursor-pointer transition-all duration-200 mx-auto
                ${
                  selected === "vendor"
                    ? "border-green-500 border-3"
                    : "border-gray-200"
                }
                w-[280px] h-[340px] rounded-xl border-2
                ${selected === "vendor" ? "shadow-md" : "hover:shadow-sm"}`}
            >
              {/* Illustration */}
              <div className="flex justify-center mt-3 mb-10 px-3">
                <img
                  src={Ilu2}
                  alt="Vendor Illustration"
                  className="h-28 w-auto object-contain"
                />
              </div>

              {/* Content Container */}
              <div className="px-4 space-y-1.5">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Vendor / Business Owner
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  List my business receive booking, chat with customer, and grow
                  your visibility on Ajani
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Continue Button */}
        <div className="mt-3 lg:mt-5 w-full max-w-sm px-3">
          <button
            disabled={!selected}
            onClick={() =>
              navigate(
                selected === "client" ? "/register/user" : "/register/vendor"
              )
            }
            className={`w-full py-2 lg:py-2.5 px-5 rounded-lg font-semibold text-sm lg:text-base transition-all duration-200
              ${
                selected === "client"
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow"
                  : selected === "vendor"
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {!selected && "Create Account"}
            {selected === "client" && "Join as Buyer"}
            {selected === "vendor" && "Apply as Vendor"}
          </button>

          {/* Login Link */}
          <p className="mt-2 lg:mt-3 text-center text-gray-600 text-xs lg:text-sm">
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