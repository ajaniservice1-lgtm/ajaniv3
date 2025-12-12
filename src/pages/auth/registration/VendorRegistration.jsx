import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";

const VendorRegistration = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[+]?[\d\s\-()]+$/.test(form.phone.replace(/\s/g, "")))
      newErrors.phone = "Phone number is invalid";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      newErrors.password =
        "Password must contain uppercase, lowercase and number";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleNext = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Store vendor data temporarily
      const vendorData = {
        ...form,
        fullName: `${form.firstName} ${form.lastName}`,
        registrationDate: new Date().toISOString(),
        vendorType: "business", // Default vendor type
      };

      localStorage.setItem("tempVendorData", JSON.stringify(vendorData));
      navigate("/register/vendor/process1", { state: vendorData });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 font-manrope">
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          Create Vendor Account
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm sm:text-base leading-tight">
          Join our platform as a verified vendor and grow your business
        </p>

        {/* Divider */}
        <div className="w-full border-t border-[#00d1ff] mt-4 mb-6"></div>

        {/* Form */}
        <form onSubmit={handleNext} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur("firstName")}
                placeholder="Enter first name"
                className={`w-full mt-1 px-3 py-2.5 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur("lastName")}
                placeholder="Enter last name"
                className={`w-full mt-1 px-3 py-2.5 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              placeholder="example@business.com"
              className={`w-full mt-1 px-3 py-2.5 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              onBlur={() => handleBlur("phone")}
              placeholder="+234 812 345 6789"
              className={`w-full mt-1 px-3 py-2.5 border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={() => handleBlur("password")}
              placeholder="********"
              className={`w-full mt-1 px-3 py-2.5 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters with uppercase, lowercase and number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="********"
              className={`w-full mt-1 px-3 py-2.5 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d1ff] text-sm`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 mt-4">
            <input type="checkbox" id="terms" required className="mt-1" />
            <label htmlFor="terms" className="text-xs text-gray-600">
              I agree to the Terms and Conditions and Privacy Policy
            </label>
          </div>

          {/* Sign In */}
          <p className="text-center text-sm text-gray-600 mt-3">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-black font-medium underline hover:text-[#00d1ff]"
            >
              Sign In Here
            </button>
          </p>

          {/* Button */}
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-[#00d37f] text-white flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-md hover:bg-[#02be72] transition text-sm font-medium"
            >
              Next <FaArrowRight size={12} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegistration;
