import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";

const VendorProcess1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendorData, setVendorData] = useState(null);
  const [businessType, setBusinessType] = useState("restaurant");
  const [workType, setWorkType] = useState("");
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    // Get vendor data from location state or localStorage
    const data =
      location.state ||
      JSON.parse(localStorage.getItem("tempVendorData") || "null");

    if (data) {
      setVendorData(data);
      // Initialize with saved data if exists
      const saved = localStorage.getItem("vendorProcess1Data");
      if (saved) {
        const parsed = JSON.parse(saved);
        setBusinessType(parsed.businessType || "restaurant");
        setWorkType(parsed.workType || "");
        setLocationInput(parsed.location || "");
      }
    } else {
      // Redirect back if no data
      navigate("/register/vendor");
    }
  }, [location, navigate]);

  const handleNext = () => {
    if (!workType.trim() || !locationInput.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const processData = {
      ...vendorData,
      businessType,
      workType,
      location: locationInput,
      step: 1,
    };

    // Save to localStorage
    localStorage.setItem("vendorProcess1Data", JSON.stringify(processData));
    localStorage.setItem("tempVendorData", JSON.stringify(processData));

    navigate("/register/vendor/process2", {
      state: processData,
    });
  };

  const handlePrevious = () => {
    navigate("/register/vendor");
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f]"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const businessTypes = [
    { value: "restaurant", label: "Restaurant/Catering" },
    { value: "event", label: "Event Planning" },
    { value: "retail", label: "Retail Shop" },
    { value: "service", label: "Service Provider" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-4 sm:p-6 md:p-8 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          Tell us about your business
        </h2>

        {/* Divider */}
        <div className="w-16 border-t-2 border-[#00d1ff] mt-2 mb-4 mx-auto"></div>

        {/* Welcome Text */}
        <div className="text-center mb-6">
          <p className="font-semibold text-gray-800 mb-2">
            Welcome {vendorData.firstName}, let's get started!
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Tell us about your business so we can connect you with the right
            customers.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Business Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Business Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {businessTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setBusinessType(type.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    businessType === type.value
                      ? "bg-[#00d37f] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* What do you do? */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              What do you do? *
            </label>
            <input
              type="text"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              placeholder="e.g., Catering services, Event planning, Retail sales"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Business Location *
            </label>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter your business address or city"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm"
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full h-1.5 bg-gray-200 rounded-full">
              <div className="h-1.5 bg-[#00d1ff] rounded-full w-1/4"></div>
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">Step 1 of 4</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
            >
              <FaArrowLeft size={12} /> Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00d37f] text-white rounded-lg shadow hover:bg-[#02be72] transition text-sm font-medium"
            >
              Next <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProcess1;
