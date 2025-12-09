import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../assets/Logos/logo6.png";

const UserRegistration = () => {
  const navigate = useNavigate();

  // FORM STATE
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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/register/user/process1");
  };

  return (
    <div className="min-h-screen w-full bg-[#d9d9e8] flex flex-col items-center py-10 font-manrope">
      {/* Logo */}
      <img src={Logo} alt="Ajani Logo" className="h-16 object-contain mt-4" />

      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-900 mt-6">
        Create account
      </h2>

      {/* Subtitle */}
      <p className="text-center text-gray-600 text-sm mt-2 leading-relaxed">
        Connect with verified vendors, and discover local stories through <br />
        <span className="font-semibold">AI and local stories</span>
      </p>

      {/* Divider */}
      <div className="w-72 border-t-2 border-[#00d1ff] mt-4 mb-6"></div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md px-6 space-y-4">
        {/* First + Last Name */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md "
            />
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-md "
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
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-md "
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-md "
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
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border rounded-md "
          />
          <p className="text-xs text-gray-500 mt-1">
            Password must be at least 6 characters long
          </p>
        </div>

        {/* Already Have Account */}
        <p className="text-center text-sm mt-2 text-gray-700">
          Already have an account?{" "}
          <span
            className="text-[#00a2ff] font-semibold cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Sign Up Here
          </span>
        </p>

        {/* Done Button */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="bg-[#00d37f] text-white px-6 py-2 rounded-lg shadow hover:bg-[#02be72] transition"
          >
            Done
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegistration;
