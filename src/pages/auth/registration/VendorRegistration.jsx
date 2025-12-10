import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

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

    // Pass entire form to next step (or next page)
    navigate("/register/vendor/process1", {
      state: { ...form },
    });
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-12 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-8 sm:p-10 md:p-12 rounded-xl shadow-lg bg-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base">
          Connect with verified vendors and discover Ibadan through AI and local
          stories
        </p>

        <div className="w-full border-t border-[#00d1ff] mt-6 mb-6"></div>

        <form onSubmit={handleNext} className="space-y-5 sm:space-y-6">
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
                placeholder="First name"
                className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
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
                placeholder="Last name"
                className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number / Email
            </label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="+23469955399 or email@example.com"
              className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="************"
              className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="************"
              className="w-full mt-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00d1ff] focus:outline-none"
            />
          </div>

          <p className="text-xs text-gray-500 -mt-2">
            Password must be at least 8 characters long
          </p>

          <p className="text-center text-sm text-gray-600 mt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline hover:text-blue-600"
            >
              Sign In Here
            </button>
          </p>

          <div className="flex justify-end mt-4">
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
