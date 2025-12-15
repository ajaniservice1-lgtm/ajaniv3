// src/pages/auth/registration/UserRegistration.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";

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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Create complete user profile with password
      const userProfile = {
        id: Date.now().toString(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password, // Save password (in real app, this would be hashed)
        registrationDate: new Date().toISOString(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        about:
          "Welcome to Ajani! Start exploring verified vendors and share your experiences.",
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          form.firstName + " " + form.lastName
        )}&background=random`,
        stats: {
          vendorsSaved: 0,
          reviewsWritten: 0,
          bookingsMade: 0,
        },
      };

      // Save user profile to localStorage
      localStorage.setItem("userProfile", JSON.stringify(userProfile));

      // Also save to a users list for future login checks
      const users = JSON.parse(localStorage.getItem("ajani_users") || "[]");
      users.push({
        email: form.email,
        password: form.password,
        profileId: userProfile.id,
      });
      localStorage.setItem("ajani_users", JSON.stringify(users));

      // Auto-login after registration
      localStorage.setItem("ajani_dummy_login", "true");
      localStorage.setItem("ajani_dummy_email", form.email);

      // Navigate to next step
      navigate("/register/user/process1", { state: userProfile });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-2 sm:p-4 font-manrope">
      <div className="w-full max-w-lg p-4 sm:p-8 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Ajani Logo" className="md:w-48 w-10 h-auto" />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-center text-gray-900">
          Create account
        </h2>

        <p className="text-center text-gray-600 mt-2 text-base leading-tight">
          Connect with verified vendors, and discover Ibadan through{" "}
          <br className="hidden sm:block" />
          AI and Local stories
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#00d1ff] mt-6 mb-6"></div>

        {/* Form */}
        <form onSubmit={handleNext} className="space-y-5 text-base">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-base font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Adeyemi"
                className={`w-full mt-1 px-3 py-3 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff]`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="text-base font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Daniels"
                className={`w-full mt-1 px-3 py-3 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff]`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-base font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+23469955399"
                className={`w-full mt-1 px-3 py-3 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff]`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="text-base font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className={`w-full mt-1 px-3 py-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff]`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-base font-medium text-gray-700">
              Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="***********"
              className={`w-full mt-1 px-3 py-3 pr-10 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-base font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="***********"
              className={`w-full mt-1 px-3 py-3 pr-10 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff]`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Sign In */}
          <p className="text-center text-base text-gray-600 mt-1">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline"
            >
              Sign In Here
            </button>
          </p>

          {/* Button */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-[#00d37f] text-white flex items-center gap-2 px-6 py-3 rounded-lg shadow-md hover:bg-[#02be72] transition"
            >
              Continue <FaArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistration;
