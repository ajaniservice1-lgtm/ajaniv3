// src/pages/auth/registration/UserProcess3.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const UserProcess3 = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    { id: 1, name: "Hotels", icon: "🏨" },
    { id: 2, name: "Restaurants", icon: "🍽️" },
    { id: 3, name: "Shortlets", icon: "🏠" },
    { id: 4, name: "Tourist Centers", icon: "🗺️" },
    { id: 5, name: "Events", icon: "🎉" },
    { id: 6, name: "Cafes", icon: "☕" },
    { id: 7, name: "Bars & Clubs", icon: "🍸" },
    { id: 8, name: "Shopping", icon: "🛍️" },
  ];

  const toggleCategory = (categoryName) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(
        selectedCategories.filter((c) => c !== categoryName)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const handleContinue = () => {
    // Save preferences to user profile
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    userProfile.preferences = selectedCategories;
    localStorage.setItem("userProfile", JSON.stringify(userProfile));

    navigate("/register/user/process4");
  };

  const handleSkip = () => {
    navigate("/register/user/process4");
  };

  return (
    <div className="min-h-screen bg-white font-manrope flex flex-col p-4">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Step 3 of 5</span>
          <span className="text-sm font-medium text-[#00d1ff]">
            Personalization
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[#00d1ff] h-2 rounded-full w-3/5"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-grow flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <div className="self-start mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-10 w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            What are you interested in?
          </h1>
          <p className="text-gray-600 text-lg">
            Select your favorite categories to get personalized recommendations
          </p>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.name)}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                selectedCategories.includes(category.name)
                  ? "border-[#00d1ff] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className="text-3xl mb-3">{category.icon}</span>
              <span className="font-medium text-gray-900">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <button
            onClick={handleSkip}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-[#00d1ff] text-white rounded-xl hover:bg-[#00c2eb] transition font-medium"
          >
            Continue to Step 4
          </button>
        </div>

        {/* Note */}
        <p className="text-center text-gray-500 text-sm mt-8">
          You can always update your preferences later in your profile settings
        </p>
      </div>
    </div>
  );
};

export default UserProcess3;
