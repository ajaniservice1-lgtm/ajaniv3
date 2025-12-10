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

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [isMenuOpen]);

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
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#F7F7FA] border-b-2 font-manrope border-[#00d1ff] h-16 cursor-default">
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
                {/* Main header logo - h-7 w-20 */}
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
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-1001 border border-gray-200 cursor-default">
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

              {/* Fixed Login | Register UI - Original design, hidden on mobile */}
              {!user && (
                <div className="hidden lg:flex items-center gap-1.5">
                  {/* Log in button - Blue pill */}
                  <button
                    onClick={() => navigate("/login")}
                    className="py-2.5 px-5 text-sm font-normal bg-[#06EAFC] hover:bg-[#6cf5ff] duration-300 rounded-full transition-colors shadow-sm cursor-pointer"
                  >
                    Log in
                  </button>

                  {/* Divider */}
                  <div className="w-px h-5 bg-gray-400 font-bold"></div>

                  {/* Register button - Outline */}
                  <button
                    onClick={() => navigate("/register")}
                    className="py-2.5 px-4 text-sm font-normal border-3 border-[#06EAFC] rounded-full transition-colors shadow-sm cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile menu button - Changes to close button when menu is open */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-900 text-2xl p-1 ml-2 cursor-pointer hover:text-[#00d1ff] transition-colors"
              >
                {isMenuOpen ? (
                  // Close icon (X)
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
                ) : (
                  // Hamburger menu icon
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
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* MOBILE MENU - Ultra high z-index to ensure it covers everything */}
      <div
        className={`fixed inset-0 z-[100000] md:hidden ${
          isMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        {/* Backdrop with highest z-index */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[100000] ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile menu content with ultra high z-index */}
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col transform transition-transform z-[100001] ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-lg shadow-sm mt-1 mx-2 cursor-default">
            <div className="flex items-center gap-2 cursor-pointer">
              {/* Mobile slide menu logo - NOW SAME SIZE as main header logo: h-7 w-20 */}
              <img
                src={Logo}
                alt="Ajani Logo"
                className="h-7 w-20 object-contain cursor-pointer"
              />
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <span className="text-xs text-slate-600 hover:text-gray-900 whitespace-nowrap cursor-pointer">
                The Ibadan Smart Guide
              </span>
            </div>
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

            {/* Divider - Only show if user is logged in */}
            {user && <div className="h-px bg-gray-200 my-2"></div>}

            {/* Authentication buttons for mobile - Only show if NOT logged in */}
            {!user && (
              <>
                {/* Divider before authentication buttons */}
                <div className="h-px bg-gray-200 my-2"></div>

                {/* Log In button */}
                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-colors font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Log In
                </button>

                {/* Register button */}
                <button
                  onClick={() => handleMobileNavigate("/register")}
                  className="block w-full text-left py-3 px-4 hover:bg-blue-50 text-black rounded-lg font-normal whitespace-nowrap text-sm cursor-pointer transition-colors"
                >
                  Register
                </button>
              </>
            )}

            {/* User info and sign out for logged-in users */}
            {user && (
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

                {/* Divider before sign out */}
                <div className="h-px bg-gray-200 my-2"></div>

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
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
