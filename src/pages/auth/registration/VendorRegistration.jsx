import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo6.png";

const VendorRegistration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleNext = (e) => {
  e.preventDefault();
  navigate("/register/vendor/process1", {
    state: { firstName: form.firstName },
  });
};

  return (
    <div className="min-h-screen w-full bg-[#e8e8f8] flex items-center justify-center p-6 font-manrope">
      <div className="w-full max-w-2xl p-12 rounded-xl shadow-md ">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Ajani Logo" className="h-14 object-contain" />
        </div>

        {/* Title + Subtitle */}
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Create account
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm">
          Connect with verified vendors, and discover Ibadan through <br />
          AI and Local stories
        </p>

        {/* Middle Divider */}
        <div className="w-full border-t border-[#00d1ff] mt-6 mb-4"></div>

        {/* Form */}
        <form onSubmit={handleNext} className="space-y-6">
          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Phone/Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number/Email
            </label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
              placeholder="+23469955399 or email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
              placeholder="************"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
              placeholder="************"
            />
          </div>

          {/* Password Note */}
          <p className="text-xs text-gray-500 -mt-3">
            Password must be at least 8 characters long
          </p>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline hover:text-blue-600"
            >
              Sign In Here
            </button>
          </p>

          {/* Next Button (bottom right) */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#00d37f] text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:bg-[#02be72] transition focus:outline-none focus:ring-2 focus:ring-[#00d37f] focus:ring-offset-2"
            >
              Next <FaArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
