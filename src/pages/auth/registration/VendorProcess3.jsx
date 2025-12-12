import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Logo from "../../../assets/Logos/logo5.png";
import Lottie from "lottie-react";

// Success animation
const successAnimation = {
  v: "5.9.1",
  fr: 30,
  ip: 0,
  op: 75,
  w: 500,
  h: 500,
  nm: "success",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Circle Outline",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 15, s: [100] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [0, 0, 100] },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [300, 300] },
          nm: "Ellipse Path",
        },
        {
          ty: "st",
          c: { a: 0, k: [0.0, 0.8, 0.5, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 14 },
          lc: 2,
          lj: 2,
          nm: "Stroke",
        },
      ],
      ip: 0,
      op: 75,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Checkmark",
      sr: 1,
      ks: {
        o: { a: 0, k: 0 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 22, s: [0] },
            { t: 45, s: [360] },
          ],
        },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: "shape",
          nm: "Check Path",
          ks: {
            a: 0,
            k: {
              i: [],
              o: [],
              v: [
                [-65, 15],
                [-15, 65],
                [65, -45],
              ],
              c: false,
            },
          },
          st: {
            c: { a: 0, k: [0.0, 0.8, 0.5, 1] },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 18 },
          },
        },
      ],
      ip: 0,
      op: 75,
      st: 15,
      bm: 0,
    },
  ],
};

const VendorProcess3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vendorData, setVendorData] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Get ALL collected data
    const data =
      location.state ||
      JSON.parse(localStorage.getItem("tempVendorData") || "null");

    if (data) {
      setVendorData(data);

      // Create final vendor profile
      const vendorProfile = {
        // Basic Info
        id: Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,

        // Business Info
        businessType: data.businessType,
        workType: data.workType,
        location: data.location,
        yearsExperience: data.yearsExperience,
        description: data.description,

        // Profile Info
        registrationDate: new Date().toISOString(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        coverImage:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=400&fit=crop",
        status: "Currently taking orders",
        availability: "Available now",
        rating: 4.8,
        totalReviews: 0,
        completedProjects: 0,
        repeatClients: 0,
        satisfactionRate: 0,

        // Additional Info
        address: data.location,
        responseTime: "Within 2 hours",
        activeWithin: `Within 15 km of ${
          data.location.split(",")[0] || "your location"
        }`,
        languages: ["English", "Yoruba"],
        services: [data.workType],
        specialties: [],
        certifications: [],

        // Business Details
        businessName: `${data.firstName}'s ${
          data.workType.split(" ")[0] || "Business"
        }`,
        hourlyRate: "₦0 - ₦0",
        minOrder: "₦0",

        // Empty arrays to be filled
        listings: [],
        reviews: [],
      };

      // Save final profile
      localStorage.setItem(
        "vendorCompleteProfile",
        JSON.stringify(vendorProfile)
      );
      localStorage.setItem("currentVendor", JSON.stringify(vendorProfile));

      // Clean up temporary data
      localStorage.removeItem("tempVendorData");
      localStorage.removeItem("vendorProcess1Data");
      localStorage.removeItem("vendorProcess2Data");

      // Set greeting
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    } else {
      navigate("/register/vendor/process2");
    }
  }, [location, navigate]);

  const handleViewProfile = () => {
    navigate("/register/vendor/complete-profile");
  };

  const handlePrevious = () => {
    navigate("/register/vendor/process2", { state: vendorData });
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-white font-manrope">
      <div className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-lg bg-white">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Ajani Logo" className="h-auto w-30" />
        </div>

        {/* Success Message */}
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
          {greeting}, {vendorData.firstName}!
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mt-2">
          Registration Complete! 🎉
        </h2>

        {/* Lottie Animation */}
        <div className="w-32 h-32 mx-auto mt-6 mb-6">
          <Lottie
            animationData={successAnimation}
            loop={false}
            autoplay={true}
          />
        </div>

        {/* Success Message */}
        <p className="text-gray-600 text-sm text-center mt-4 mb-8 leading-relaxed">
          Your vendor account has been created successfully. You can now set up
          your complete business profile and start receiving customer inquiries.
        </p>

        {/* Registration Summary */}
        <div className="bg-gray-50 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Registration Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Business Name:</span>
              <span className="font-medium">{`${vendorData.firstName}'s ${
                vendorData.workType?.split(" ")[0] || "Business"
              }`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact Email:</span>
              <span className="font-medium">{vendorData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Business Type:</span>
              <span className="font-medium">{vendorData.businessType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{vendorData.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-6 mb-6">
          <div className="w-full h-1.5 bg-gray-200 rounded-full">
            <div className="h-1.5 bg-[#00d1ff] rounded-full w-full"></div>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">
            Step 4 of 4 • Complete
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
          >
            <FaArrowLeft size={12} /> Previous
          </button>

          <button
            onClick={handleViewProfile}
            className="px-6 py-2.5 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition shadow font-medium"
          >
            Complete Your Profile →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProcess3;
