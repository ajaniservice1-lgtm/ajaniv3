import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../lib/axios";

const VendorCompleteProfile = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    description: "",
    yearsExperience: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Get user profile from localStorage
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
      
      // Note: This endpoint doesn't exist yet in your API
      // You need to create it in your backend
      // For now, just update localStorage and show success
      
      // Update user profile in localStorage
      const updatedProfile = {
        ...userProfile,
        vendor: {
          ...userProfile.vendor,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
        },
        description: formData.description,
        yearsExperience: formData.yearsExperience,
      };
      
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
      // If you had a real API endpoint, you would use:
      // const response = await axiosInstance.put(`/vendors/profile`, formData);
      
      alert("Profile updated successfully!");
      navigate("/vendor/dashboard");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Complete Your Vendor Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Add more details to make your business stand out
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="Enter your business name"
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) => setFormData({...formData, businessAddress: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="Enter your business address"
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="Describe your business, services, and what makes you unique..."
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <select
              value={formData.yearsExperience}
              onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            >
              <option value="">Select experience</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/vendor/dashboard")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorCompleteProfile;