import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Logo from "../../assets/Logos/logo5.png";

const VendorProcess2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendorData, setVendorData] = useState(null);
  const [description, setDescription] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const maxChars = 1000;

  useEffect(() => {
    // Get ALL previous form data
    const data =
      location.state ||
      JSON.parse(localStorage.getItem("tempVendorData") || "null");

    if (data) {
      setVendorData(data);
      // Initialize with saved data if exists
      const saved = localStorage.getItem("vendorProcess2Data");
      if (saved) {
        const parsed = JSON.parse(saved);
        setDescription(parsed.description || "");
        setYearsExperience(parsed.yearsExperience || "");
      } else if (data.description) {
        setDescription(data.description);
      }
    } else {
      navigate("/register/vendor/process1");
    }
  }, [location, navigate]);

  const handleNext = () => {
    if (!description.trim()) {
      alert("Please write a description about your business");
      return;
    }

    const processData = {
      ...vendorData,
      description,
      yearsExperience,
      step: 2,
    };

    // Save to localStorage
    localStorage.setItem("vendorProcess2Data", JSON.stringify(processData));
    localStorage.setItem("tempVendorData", JSON.stringify(processData));

    navigate("/register/vendor/process3", {
      state: processData,
    });
  };

  const handlePrevious = () => {
    navigate("/register/vendor/process1", { state: vendorData });
  };

  if (!vendorData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f]"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center p-4 sm:p-6 md:p-8 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Ajani Logo" className="h-12 sm:h-14" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          Tell us more about your business
        </h2>

        {/* Divider */}
        <div className="w-16 border-t-2 border-[#00d1ff] mt-2 mb-4 mx-auto"></div>

        {/* Progress Bar */}
        <div className="w-full mt-4 mb-6">
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div className="h-1.5 bg-[#00d1ff] rounded-full w-1/2"></div>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">Step 2 of 4</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Years of Experience */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Years of Experience
            </label>
            <select
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm"
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Business Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={maxChars}
              placeholder="Describe your business, services, unique selling points, etc."
              className="w-full h-40 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm resize-none"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                Describe what makes your business unique
              </p>
              <p className="text-xs text-gray-500">
                {description.length}/{maxChars}
              </p>
            </div>
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

export default VendorProcess2;
