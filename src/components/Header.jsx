import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logos/logo5.png";
import { MdOutlineChat } from "react-icons/md";
import { RiNotification2Fill } from "react-icons/ri";
import { FiUser, FiHeart, FiSettings, FiLogOut } from "react-icons/fi";

// Main Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const dummyLogin = localStorage.getItem("ajani_dummy_login");
      const dummyEmail = localStorage.getItem("ajani_dummy_email");
      const profile = localStorage.getItem("userProfile");

      if (dummyLogin === "true") {
        setIsLoggedIn(true);
        setUserEmail(dummyEmail || "Guest User");

        if (profile) {
          try {
            setUserProfile(JSON.parse(profile));
          } catch (error) {
            console.error("Error parsing user profile:", error);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail("");
        setUserProfile(null);
      }
    };

    checkLoginStatus();

    // Listen for login/logout events
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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

  // Handle external blog link
  const handleBlogClick = () => {
    window.open("https://blog.ajani.ai", "_blank", "noopener,noreferrer");
  };

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem("ajani_dummy_login");
    localStorage.removeItem("ajani_dummy_email");
    setIsLoggedIn(false);
    setUserEmail("");
    setUserProfile(null);
    navigate("/");
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
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
    { label: "Home", id: "Home", action: () => scrollToSection("Home") },
    {
      label: "Categories",
      id: "Categories",
      action: () => scrollToSection("Categories"),
    },
    // {
    //   label: "Price Insights",
    //   id: "Price Insights",
    //   action: () => scrollToSection("Price Insights"),
    // },
    { label: "Blog", id: "Blog", action: handleBlogClick },
  ];

  // Additional navigation items for logged in users
  const loggedInNavItems = [
    { label: "Chat with Assistant", onClick: () => navigate("/chat") },
    { label: "List Your Business", onClick: () => navigate("/add-business") },
  ];

  // Handle mobile navigate
  const handleMobileNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get saved listings count
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );
      setSavedCount(saved.length);

      // Listen for updates to saved listings
      const handleSavedListingsUpdate = () => {
        const updated = JSON.parse(
          localStorage.getItem("userSavedListings") || "[]"
        );
        setSavedCount(updated.length);
      };

      window.addEventListener(
        "savedListingsUpdated",
        handleSavedListingsUpdate
      );

      return () => {
        window.removeEventListener(
          "savedListingsUpdated",
          handleSavedListingsUpdate
        );
      };
    }
  }, [isLoggedIn]);

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
                  onClick={item.action}
                  className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

              {isLoggedIn &&
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
              {isLoggedIn ? (
                <>
                  {/* Saved Listings button */}
                  <button
                    onClick={() => navigate("/saved")}
                    className="relative text-2xl hover:text-[#00d1ff] transition-colors p-1.5 cursor-pointer"
                    title="Saved Listings"
                  >
                    <FiHeart />
                    {savedCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {savedCount > 9 ? "9+" : savedCount}
                      </span>
                    )}
                  </button>

                  {/* Chat button */}
                  <button
                    onClick={() => navigate("/chat")}
                    className="text-2xl hover:text-[#00d1ff] transition-colors p-1.5 cursor-pointer"
                    title="Chat"
                  >
                    <MdOutlineChat />
                  </button>

                  {/* Notifications button */}
                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-2xl hover:text-[#00d1ff] transition-colors p-1.5 cursor-pointer"
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
                      className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Profile"
                    >
                      {userProfile?.image ? (
                        <img
                          src={userProfile.image}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `
                              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                ${getUserInitials()}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getUserInitials()}
                        </div>
                      )}
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-1001 border border-gray-200 cursor-default">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100 cursor-default">
                          <p className="text-sm font-medium text-gray-900 cursor-default">
                            {userProfile?.fullName || userEmail}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 cursor-default">
                            {userEmail}
                          </p>
                        </div>

                        {/* Profile link */}
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          <FiUser className="w-4 h-4" />
                          <span className="cursor-pointer">My Profile</span>
                        </button>

                        {/* Saved listings link */}
                        <button
                          onClick={() => {
                            navigate("/saved");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          <FiHeart className="w-4 h-4" />
                          <span className="cursor-pointer">
                            Saved Listings {savedCount > 0 && `(${savedCount})`}
                          </span>
                        </button>

                        {/* Chat link */}
                        <button
                          onClick={() => {
                            navigate("/chat");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          <MdOutlineChat className="w-4 h-4" />
                          <span className="cursor-pointer">Chat Assistant</span>
                        </button>

                        {/* Notifications link */}
                        <button
                          onClick={() => {
                            navigate("/notifications");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          <RiNotification2Fill className="w-4 h-4" />
                          <span className="cursor-pointer">Notifications</span>
                        </button>

                        {/* List business link */}
                        <button
                          onClick={() => {
                            navigate("/add-business");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="cursor-pointer">List Business</span>
                        </button>

                        {/* Settings link */}
                        <button
                          onClick={() => {
                            alert("Settings feature coming soon!");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                        >
                          <FiSettings className="w-4 h-4" />
                          <span className="cursor-pointer">Settings</span>
                        </button>

                        <div className="h-px bg-gray-100 my-1"></div>

                        {/* Sign out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span className="cursor-pointer">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Show Login/Register buttons when NOT logged in */
                <div className="hidden lg:flex items-center gap-1.5">
                  <button
                    onClick={() => navigate("/login")}
                    className="py-2.5 px-5 text-sm font-normal bg-[#06EAFC] hover:bg-[#6cf5ff] duration-300 rounded-full transition-colors shadow-sm cursor-pointer"
                  >
                    Log in
                  </button>

                  <div className="w-px h-5 bg-gray-400 font-bold"></div>

                  <button
                    onClick={() => navigate("/register")}
                    className="py-2.5 px-4 text-sm font-normal border-3 border-[#06EAFC] rounded-full transition-colors shadow-sm cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-900 text-2xl p-1 ml-2 cursor-pointer hover:text-[#00d1ff] transition-colors"
              >
                {isMenuOpen ? (
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

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-[100000] md:hidden ${
          isMenuOpen ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100000] transition-all duration-500 ease-out ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col z-[100001] transform transition-all duration-500 ease-out ${
            isMenuOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-lg shadow-sm mt-1 mx-2 cursor-default transition-all duration-300 delay-100">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={Logo}
                alt="Ajani Logo"
                className="h-7 w-20 object-contain cursor-pointer transition-transform duration-300"
              />
              <div className="w-px h-4 bg-gray-300 mx-1 transition-all duration-300"></div>
              <span className="text-xs text-slate-600 hover:text-gray-900 whitespace-nowrap cursor-pointer transition-colors duration-300">
                The Ibadan Smart Guide
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-900 hover:text-gray-600 text-xl cursor-pointer transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 transition-transform duration-300 hover:rotate-90"
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
            {baseNavItems.map((item, index) => (
              <button
                key={item.id}
                className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                onClick={() => {
                  item.action();
                  if (item.id !== "Blog") {
                    setTimeout(() => setIsMenuOpen(false), 400);
                  }
                }}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? "translateX(0)" : "translateX(-20px)",
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Additional items for logged-in users */}
            {isLoggedIn &&
              loggedInNavItems.map((item, index) => (
                <button
                  key={`logged-in-${index}`}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${(baseNavItems.length + index) * 50}ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  {item.label}
                </button>
              ))}

            {/* Divider - Only show if user is logged in */}
            {isLoggedIn && (
              <div
                className="h-px bg-gray-200 my-2 transition-all duration-300"
                style={{
                  transitionDelay: isMenuOpen
                    ? `${
                        (baseNavItems.length + loggedInNavItems.length) * 50
                      }ms`
                    : "0ms",
                  opacity: isMenuOpen ? 1 : 0,
                }}
              ></div>
            )}

            {/* Authentication buttons - Show based on login status */}
            {isLoggedIn ? (
              <>
                {/* Mobile user info */}
                <div
                  className="px-4 py-3 bg-white rounded-lg mb-4 cursor-default transition-all duration-300"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 1) *
                          50
                        }ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  <p className="text-sm font-medium text-gray-900 cursor-default">
                    {userProfile?.fullName || userEmail}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 cursor-default">
                    {userEmail}
                  </p>
                </div>

                {/* Mobile navigation for logged-in users */}
                <button
                  onClick={() => handleMobileNavigate("/profile")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 2) *
                          50
                        }ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4" />
                    <span>My Profile</span>
                  </div>
                </button>

                <button
                  onClick={() => handleMobileNavigate("/saved")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 3) *
                          50
                        }ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiHeart className="w-4 h-4" />
                    <span>
                      Saved Listings {savedCount > 0 && `(${savedCount})`}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleMobileNavigate("/chat")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 4) *
                          50
                        }ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  Chat Assistant
                </button>
                <button
                  onClick={() => handleMobileNavigate("/notifications")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 5) *
                          50
                        }ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  Notifications
                </button>

                {/* Sign Out button */}
                <button
                  onClick={() => {
                    handleSignOut();
                  }}
                  className="block w-full text-left py-3 px-4 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 6) *
                          50
                        }ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div
                  className="h-px bg-gray-200 my-2 transition-all duration-300"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${baseNavItems.length * 50}ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                  }}
                ></div>

                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50 rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${(baseNavItems.length + 1) * 50}ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  Log In
                </button>

                <button
                  onClick={() => handleMobileNavigate("/register")}
                  className="block w-full text-left py-3 px-4 hover:bg-blue-50 text-black rounded-lg font-normal whitespace-nowrap text-sm cursor-pointer transition-all duration-300 transform hover:translate-x-1"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${(baseNavItems.length + 2) * 50}ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
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
