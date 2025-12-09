// Header.jsx - Updated with mouse pointer cursor on all elements
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logos/logo5.png";
import LoginButton from "../components/ui/LoginButton";
import { MdOutlineChat } from "react-icons/md";
import { RiNotification2Fill } from "react-icons/ri";
import { PiUserCircleFill } from "react-icons/pi";
import { useAuth } from "../hook/useAuth"; // Import auth hook
import { supabase } from "../lib/supabase"; // Import supabase for sign out

// Main Header Component
const Header = ({ onAuthToast }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get auth state
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

            {/* Desktop Navigation - Increased gap between labels, reduced left margin */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-10 text-sm lg:ml-20 h-full">
              {/* Base navigation items */}
              {baseNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

              {/* Additional items for logged-in users (text only) */}
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

            {/* Right section with icons - Increased gap for desktop, reduced for mobile */}
            <div className="flex items-center gap-2 lg:gap-6 h-full">
              {/* Right section: Chat icon (only when logged in), Notification, and Profile dropdown */}
              {user && (
                <>
                  <button
                    onClick={() => navigate("/chat")}
                    className="text-2xl hover:text-[#00d1ff] transition-colors p-1 cursor-pointer"
                    title="Chat Assistant"
                  >
                    <MdOutlineChat />
                  </button>

                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-2xl hover:text-[#00d1ff] transition-colors p-1 cursor-pointer"
                    title="Notifications"
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
                      title="Profile"
                    >
                      <PiUserCircleFill />
                    </button>

                    {/* Dropdown menu */}
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

              {/* Login button when not logged in */}
              {!user && <LoginButton onAuthToast={onAuthToast} />}

              {/* Mobile menu button with consistent sizing */}
              <button
                // onClick={() => setIsMenuOpen(true)}
                className="lg:hidden text-gray-900 text-2xl p-1 ml-2 cursor-pointer"
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

      {/* Mobile Menu - Updated with auth-aware items */}
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
          <nav className="flex-1 p-4 space-y-2 text-sm">
            {/* Base navigation items */}
            {baseNavItems.map((item) => (
              <button
                key={item.id}
                className="block w-full text-left py-3 text-gray-900 hover:text-[#06EAFC] font-normal whitespace-nowrap text-sm cursor-pointer"
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
                  className="block w-full text-left py-3 text-gray-900 hover:text-[#06EAFC] font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

            {/* Notifications for logged-in users */}
            {user && (
              <button
                onClick={() => {
                  navigate("/notifications");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-gray-900 hover:text-[#06EAFC] font-normal whitespace-nowrap text-sm cursor-pointer"
              >
                Notifications
              </button>
            )}

            {/* Auth-aware sign out/login items */}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-3 text-red-600 hover:text-red-800 font-normal whitespace-nowrap text-sm cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 text-gray-900 hover:text-[#06EAFC] font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 text-gray-900 hover:text-[#06EAFC] font-normal whitespace-nowrap text-sm cursor-pointer"
                >
                  Register
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
