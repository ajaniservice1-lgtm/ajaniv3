import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const UserRegistration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    navigate("/register/user/process1", { state: { ...form } });
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-2 sm:p-4 font-manrope">
      <div className="w-full max-w-lg p-4 sm:p-8 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/ajani-logo.png" alt="Ajani Logo" className="h-14" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
          Create account
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base leading-tight">
          Connect with verified vendors, and discover Ibadan through{" "}
          <br className="hidden sm:block" />
          AI and Local stories
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#00d1ff] mt-6 mb-6"></div>

        {/* Form */}
        <form onSubmit={handleNext} className="space-y-5">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Adeyemi"
                className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
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
                placeholder="Daniels"
                className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+23469955399"
                className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
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
              placeholder="***********"
              className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
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
              placeholder="***********"
              className="w-full mt-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* Sign In */}
          <p className="text-center text-sm text-gray-600 mt-1">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline"
            >
              Sign Up Here
            </button>
          </p>

          {/* Button */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-[#00d37f] text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:bg-[#02be72] transition"
            >
              Done <FaArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
