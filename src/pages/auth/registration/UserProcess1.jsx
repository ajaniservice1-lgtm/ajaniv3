import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import Lottie from "lottie-react";
import Logo from "../../../assets/Logos/logo5.png";

// Success animation JSON
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
    {
      ddd: 0,
      ind: 3,
      ty: 1,
      nm: "Background Fade",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 15, s: [50] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: "rc",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [500, 500] },
          r: { a: 0, k: 10 },
          nm: "Rectangle Path",
        },
        {
          ty: "fl",
          c: { a: 0, k: [1, 1, 1, 1] },
          o: { a: 0, k: 30 },
          nm: "Fill",
        },
      ],
      ip: 0,
      op: 75,
      st: 0,
      bm: 0,
    },
  ],
};

const UserProcess1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Get user data from location state or localStorage
    const data =
      location.state ||
      JSON.parse(localStorage.getItem("tempUserData") || "null");

    if (data) {
      setUserData(data);

      // Create user profile in localStorage
      const userProfile = {
        id: Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName || `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        email: data.email,
        registrationDate: data.registrationDate || new Date().toISOString(),
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        about:
          "Welcome to Ajani! Start exploring verified vendors and share your experiences.",
        stats: {
          vendorsSaved: 0,
          reviewsWritten: 0,
          bookingsMade: 0,
        },
      };

      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      localStorage.setItem("currentUser", JSON.stringify(userProfile));

      // Remove temporary data
      localStorage.removeItem("tempUserData");

      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    } else {
      // Redirect back if no data
      navigate("/register");
    }
  }, [location, navigate]);

  const handleViewProfile = () => {
    if (userData) {
      navigate("/register/user/process2", {
        state: {
          ...userData,
          fromRegistration: true,
        },
      });
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d37f]"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white font-manrope">
      {/* Logo */}
       <img
                               src={Logo}
                               alt="Ajani Logo"
                               className="md:w-48 w-10 h-auto"
                             />

      {/* Personalized Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900">
        {greeting}, {userData.firstName}!
      </h1>
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mt-2">
        Thanks for registering
      </h2>

      {/* Personalized Subtitle */}
      <p className="text-gray-600 text-sm text-center mt-4 max-w-md">
        Your account with email{" "}
        <span className="font-semibold">{userData.email}</span> has been created
        successfully.
        <br />
        We will notify you about new vendor recommendations and updates.
      </p>

      {/* Lottie Illustration */}
      <div className="w-48 h-48 mt-6 mb-6">
        <Lottie animationData={successAnimation} loop={false} autoplay={true} />
      </div>

      {/* Account Details Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md w-full">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          Account Created
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">
              {userData.firstName} {userData.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{userData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{userData.phone}</span>
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

      {/* Button */}
      <button
        onClick={handleViewProfile}
        className="bg-[#00d37f] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#02be72] transition shadow-md"
      >
        View your profile <FaArrowRight size={14} />
      </button>
    </div>
  );
};

export default UserProcess1;
