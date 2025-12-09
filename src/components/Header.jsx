import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logos/logo5.png";
import { MdOutlineChat } from "react-icons/md";
import { RiNotification2Fill } from "react-icons/ri";
import { PiUserCircleFill } from "react-icons/pi";
import { useAuth } from "../hook/useAuth";
import { supabase } from "../lib/supabase";

// Main Header Component
const Header = ({ onAuthToast }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const profileDropdownRef = useRef(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onAuthToast?.("Successfully signed out");
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
      onAuthToast?.("Error signing out", "error");
    }
  };

  // Handle click outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Base navigation items - always visible
  const baseNavItems = [
    { label: "Home", id: "Home" },
    { label: "Categories", id: "Categories" },
    { label: "Price Insights", id: "Price Insights" },
    { label: user ? "Our Blog" : "Blog", id: "Blog" },
  ];

  // Additional items for logged-in users (text only, no icons)
  const loggedInNavItems = [
    { label: "Chat with Assistant", onClick: () => navigate("/chat") },
    { label: "List Your Business", onClick: () => navigate("/add-business") },
  ];

  // Handle mobile navigate
  const handleMobileNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7FA] border-b-2 font-manrope border-[#00d1ff] h-16 cursor-default">
        <div className="max-w-7xl mx-auto px-4 h-full">
          <nav className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigate("/");
                  setTimeout(() => window.scrollTo({ top: 0 }), 150);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-7 w-20 object-contain cursor-pointer"
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-10 text-sm lg:ml-20 h-full">
              {baseNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

              {user &&
                loggedInNavItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 lg:gap-6 h-full">
              {user && (
                <>
                  <button
                    onClick={() => navigate("/chat")}
                    className="text-2xl hover:text-[#00d1ff] transition-colors p-1 cursor-pointer"
                  >
                    <MdOutlineChat />
                  </button>

                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-2xl hover:text-[#00d1ff] transition-colors p-1 cursor-pointer"
                  >
                    <RiNotification2Fill />
                  </button>

                  {/* Profile dropdown */}
                  <div
                    className="relative cursor-pointer"
                    ref={profileDropdownRef}
                  >
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="text-2xl hover:text-[#00d1ff] transition-colors p-1 cursor-pointer"
                    >
                      <PiUserCircleFill />
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200 cursor-default">
                        <div className="px-4 py-3 border-b border-gray-100 cursor-default">
                          <p className="text-sm font-medium text-gray-900 cursor-default">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          <span className="cursor-pointer">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Fixed Login | Register UI */}
              {!user && (
                <div className="hidden lg:flex items-center gap-1.5">
                  {/* Log in button - Blue pill */}
                  <button
                    onClick={() => navigate("/login")}
                    className="py-2.5 px-5 text-sm font-normal bg-[#06EAFC] hover:bg-[#6cf5ff] duration-300 rounded-full  transition-colors shadow-sm"
                  >
                    Log in
                  </button>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-400 font-bold"></div>

                  {/* Register button - Outline */}
                  <button
                    onClick={() => navigate("/register")}
                    className="py-2.5 px-4 text-sm font-normal border-3 border-[#06EAFC]  rounded-full transition-colors shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden text-gray-900 text-2xl p-1 ml-2 cursor-pointer hover:text-[#00d1ff] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col transform transition-transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-lg shadow-sm mt-1 mx-2 cursor-default">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-start cursor-pointer"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-6 w-16 cursor-pointer"
                />
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <span className="text-xs text-slate-600 hover:text-gray-900 whitespace-nowrap cursor-pointer">
                  The Ibadan Smart Guide
                </span>
              </div>
            </button>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-900 hover:text-gray-600 text-xl cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
            {/* Base navigation items */}
            {baseNavItems.map((item) => (
              <button
                key={item.id}
                className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                onClick={() => {
                  scrollToSection(item.id);
                  setTimeout(() => setIsMenuOpen(false), 400);
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Additional items for logged-in users */}
            {user &&
              loggedInNavItems.map((item, index) => (
                <button
                  key={`logged-in-${index}`}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

            {/* Divider */}
            <div className="h-px bg-gray-200 my-4"></div>

            {/* Authentication buttons for mobile */}
            {user ? (
              <>
                {/* Mobile user info */}
                <div className="px-4 py-3 bg-white rounded-lg mb-4 cursor-default">
                  <p className="text-sm font-medium text-gray-900 cursor-default">
                    {user.email}
                  </p>
                </div>

                {/* Mobile navigation for logged-in users */}
                <button
                  onClick={() => handleMobileNavigate("/chat")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Chat Assistant
                </button>
                <button
                  onClick={() => handleMobileNavigate("/notifications")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Notifications
                </button>
                <button
                  onClick={() => handleMobileNavigate("/add-business")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  List Your Business
                </button>

                {/* Sign Out button */}
                <button
                  onClick={() => {
                    handleSignOut();
                  }}
                  className="block w-full text-left py-3 px-4 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                {/* Authentication buttons for non-logged-in users in mobile */}
                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleMobileNavigate("/register")}
                  className="block w-full text-left py-3 px-4 bg-[#00e6ff] hover:bg-[#00d1ff] text-black rounded-full font-medium whitespace-nowrap text-sm cursor-pointer transition-colors"
                >
                  Register
                </button>

                {/* Divider */}
                <div className="h-px bg-gray-200 my-4"></div>

                {/* Registration options in mobile */}
                <div className="px-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Join as:
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleMobileNavigate("/register/user")}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Client</p>
                          <p className="text-xs text-gray-600">
                            Looking to hire
                          </p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleMobileNavigate("/register/vendor")}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Vendor</p>
                          <p className="text-xs text-gray-600">
                            Offering services
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                By using Ajani, you agree to our{" "}
                <button
                  onClick={() => handleMobileNavigate("/termspage")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Terms
                </button>{" "}
                and{" "}
                <button
                  onClick={() => handleMobileNavigate("/privacypage")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Privacy Policy
                </button>
              </p>
              <p className="text-gray-400">
                © {new Date().getFullYear()} Ajani. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
