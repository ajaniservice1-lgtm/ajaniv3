// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logos/logo5.png";
import * as LucideIcons from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const headerRef = useRef(null);

  // Enhanced auth check function
  const checkLoginStatus = () => {
    const token =
      localStorage.getItem("auth_token") ||
      JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
    const userEmail = localStorage.getItem("user_email");
    const profile = localStorage.getItem("userProfile");

    console.log("Header auth check:", { token, userEmail, profile });

    if (token && userEmail) {
      setIsLoggedIn(true);
      setUserEmail(userEmail);

      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          setUserProfile(parsedProfile);

          if (!parsedProfile.isVerified) {
            console.warn("User profile found but not verified");
          }
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      
      if (position > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Enhanced glass effect with more noticeable transparency
  const getGlassEffect = () => {
    return {
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: isScrolled ? 'blur(16px) saturate(200%)' : 'blur(8px) saturate(180%)',
      WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(200%)' : 'blur(8px) saturate(180%)',
      borderBottom: isScrolled ? '1px solid rgba(0, 209, 255, 0.3)' : '2px solid #00d1ff',
      boxShadow: isScrolled 
        ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)' 
        : '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
      transition: 'all 0.3s ease-in-out',
    };
  };

  // Check login status on mount and when window gains focus
  useEffect(() => {
    checkLoginStatus();

    const handleStorageChange = () => {
      console.log("Storage changed, checking auth status");
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);
    window.addEventListener("loginSuccess", handleStorageChange);

    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener("focus", handleFocus);

    const authCheckInterval = setInterval(() => {
      const token = localStorage.getItem("auth_token");
      if (token && !isLoggedIn) {
        console.log("Token found via polling, updating login state");
        checkLoginStatus();
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
      window.removeEventListener("loginSuccess", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(authCheckInterval);
    };
  }, [isLoggedIn]);

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

  // Enhanced sign out function
  const handleSignOut = () => {
    console.log("Signing out...");

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("redirectAfterLogin");

    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user_email");

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("logout"));

    setIsLoggedIn(false);
    setUserEmail("");
    setUserProfile(null);
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);

    navigate("/");
    window.location.reload();
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

  // Base navigation items
  const baseNavItems = [
    { 
      label: "Hotel", 
      id: "hotel", 
      action: () => navigate("/category/hotel")
    },
    { 
      label: "Restaurant", 
      id: "restaurant", 
      action: () => navigate("/category/restaurant")
    },
    { 
      label: "Shortlet", 
      id: "shortlet", 
      action: () => navigate("/category/shortlet")
    },
    { 
      label: "Vendors", 
      id: "vendors", 
      action: () => navigate("/vendors")
    },
    { 
      label: "Events", 
      id: "events", 
      action: () => navigate("/category/events")
    },
  ];

  // Additional navigation items for logged in users
  const loggedInNavItems = [
    { label: "Chat with Assistant", onClick: () => navigate("/chat") },
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

  // Get verification status text
  const getVerificationStatusText = () => {
    if (!userProfile?.isVerified) return "Not Verified";
    
    if (userProfile?.role === "vendor") {
      return "Verified Vendor";
    } else {
      return "Verified Buyer";
    }
  };

  // Get saved listings count
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const saved = JSON.parse(
        localStorage.getItem("userSavedListings") || "[]"
      );
      setSavedCount(saved.length);

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
    } else {
      setSavedCount(0);
    }
  }, [isLoggedIn]);

  // Handle profile navigation based on user role
  const handleProfileNavigation = () => {
    if (userProfile?.role === "vendor") {
      navigate("/vendor/profile");
    } else {
      navigate("/buyer/profile");
    }
    setIsProfileDropdownOpen(false);
  };

  // Handle mobile profile navigation
  const handleMobileProfileNavigation = () => {
    if (userProfile?.role === "vendor") {
      handleMobileNavigate("/vendor/profile");
    } else {
      handleMobileNavigate("/buyer/profile");
    }
  };

  // Debug: Log current auth state
  useEffect(() => {
    console.log("Current Header State:", {
      isLoggedIn,
      userEmail,
      userProfile,
      authToken: localStorage.getItem("auth_token"),
      userProfileStorage: localStorage.getItem("userProfile"),
    });
  }, [isLoggedIn, userEmail, userProfile]);

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[1000] h-16 cursor-default transition-all duration-300 ease-in-out"
        style={getGlassEffect()}
      >
        {/* Enhanced glass effect background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white/60 -z-10" />
        
        <div className="w-full px-4 h-full relative">
          <nav className="flex items-center justify-between h-full">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-7 w-20 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                />
              </button>
            </div>

            {/* Center: Navigation Items */}
            <div className="hidden lg:flex items-center gap-6 text-sm h-full">
              {baseNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer px-3 py-1 rounded-md hover:bg-white/30 backdrop-blur-sm"
                >
                  {item.label}
                </button>
              ))}

              {isLoggedIn &&
                loggedInNavItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer px-3 py-1 rounded-md hover:bg-white/30 backdrop-blur-sm"
                  >
                    {item.label}
                  </button>
                ))}
            </div>

            {/* Right: Auth/Profile Section */}
            <div className="flex items-center gap-2 lg:gap-4 h-full">
              {isLoggedIn ? (
                <>
                  {/* Saved Listings button */}
                  <button
                    onClick={() => navigate("/saved")}
                    className="relative hover:text-[#00d1ff] transition-colors p-1.5 cursor-pointer hover:bg-white/30 rounded-lg backdrop-blur-sm group"
                    title="Saved Listings"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="group-hover:scale-110 transition-transform duration-200"
                    >
                      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                    </svg>
                    {savedCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm border border-white/20">
                        {savedCount > 9 ? "9+" : savedCount}
                      </span>
                    )}
                  </button>

                  {/* Chat button */}
                  <button
                    onClick={() => navigate("/chat")}
                    className="hover:text-[#00d1ff] transition-colors p-1.5 cursor-pointer hover:bg-white/30 rounded-lg backdrop-blur-sm group"
                    title="Chat"
                  >
                    <LucideIcons.MessageSquareText 
                      size={20} 
                      strokeWidth={1.5} 
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>

                  {/* Notifications button */}
                  <button
                    onClick={() => navigate("/notifications")}
                    className="hover:text-[#00d1ff] transition-colors p-1.5 cursor-pointer hover:bg-white/30 rounded-lg backdrop-blur-sm group"
                    title="Notifications"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="group-hover:scale-110 transition-transform duration-200"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
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
                      className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/30 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:scale-105 group"
                      title="Profile"
                    >
                      {userProfile?.profilePicture ? (
                        <img
                          src={userProfile.profilePicture}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border border-gray-200/50 backdrop-blur-sm group-hover:ring-2 group-hover:ring-[#00d1ff]/30 transition-all"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `
                              <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm group-hover:ring-2 group-hover:ring-[#00d1ff]/30 transition-all">
                                ${getUserInitials()}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm group-hover:ring-2 group-hover:ring-[#00d1ff]/30 transition-all">
                          {getUserInitials()}
                        </div>
                      )}
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl py-2 z-[1002] border border-gray-200/30 cursor-default transition-all duration-300 animate-in fade-in-50 slide-in-from-top-1">
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100/50 cursor-default">
                          <p className="text-sm font-medium text-gray-900 cursor-default">
                            {userProfile?.firstName
                              ? `${userProfile.firstName} ${userProfile.lastName}`
                              : userEmail}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 cursor-default">
                            {userEmail}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <div className={`w-2 h-2 rounded-full ${userProfile?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className={`text-xs ${userProfile?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                              {getVerificationStatusText()}
                            </span>
                          </div>
                        </div>

                        {/* Profile link */}
                        <button
                          onClick={handleProfileNavigation}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span className="cursor-pointer">My Profile</span>
                        </button>

                        {/* Dashboard link for vendors ONLY */}
                        {userProfile?.role === "vendor" && (
                          <button
                            onClick={() => {
                              navigate("/vendor/dashboard");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="7" height="7"/>
                              <rect x="14" y="3" width="7" height="7"/>
                              <rect x="3" y="14" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/>
                            </svg>
                            <span className="cursor-pointer">Vendor Dashboard</span>
                          </button>
                        )}

                        {/* List Your Business link - ONLY for vendors in dropdown */}
                        {userProfile?.role === "vendor" && (
                          <button
                            onClick={() => {
                              navigate("/add-business");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                            <span className="cursor-pointer">List Your Business</span>
                          </button>
                        )}

                        {/* Saved listings link */}
                        <button
                          onClick={() => {
                            navigate("/saved");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                          </svg>
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
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                        >
                          <LucideIcons.MessageSquareText size={16} strokeWidth={1.5} />
                          <span className="cursor-pointer">Chat Assistant</span>
                        </button>

                        {/* Notifications link */}
                        <button
                          onClick={() => {
                            navigate("/notifications");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                          </svg>
                          <span className="cursor-pointer">Notifications</span>
                        </button>

                        {/* Settings link */}
                        <button
                          onClick={() => {
                            alert("Settings feature coming soon!");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                          </svg>
                          <span className="cursor-pointer">Settings</span>
                        </button>

                        <div className="h-px bg-gray-100/50 my-1"></div>

                        {/* Sign out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 cursor-pointer group/item"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                          </svg>
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
                    className="py-2.5 px-5 text-sm font-normal bg-[#06EAFC]/90 hover:bg-[#6cf5ff] duration-300 rounded-full transition-all shadow-sm cursor-pointer hover:scale-105 backdrop-blur-sm group"
                  >
                    <span className="group-hover:tracking-wide transition-all">Log in</span>
                  </button>

                  <div className="w-px h-5 bg-gray-400/50 font-bold backdrop-blur-sm"></div>

                  <button
                    onClick={() => navigate("/register")}
                    className="py-2.5 px-4 text-sm font-normal border-2 border-[#06EAFC] rounded-full transition-all shadow-sm cursor-pointer hover:scale-105 hover:bg-white/30 backdrop-blur-sm group"
                  >
                    <span className="group-hover:tracking-wide transition-all">Register</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-900 p-1 ml-2 cursor-pointer hover:text-[#00d1ff] transition-all duration-300 hover:bg-white/30 rounded-lg group"
              >
                {isMenuOpen ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="group-hover:rotate-90 transition-transform duration-300"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="group-hover:scale-110 transition-transform duration-300"
                  >
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
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
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff]/95 backdrop-blur-lg flex flex-col z-[100001] transform transition-all duration-500 ease-out ${
            isMenuOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          <div className="p-4 border-b border-gray-200/50 flex justify-between items-center bg-[#f2f9ff]/95 backdrop-blur-lg rounded-lg shadow-sm mt-1 mx-2 cursor-default transition-all duration-300 delay-100">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={Logo}
                alt="Ajani Logo"
                className="h-7 w-20 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
              />
              <div className="w-px h-4 bg-gray-300/50 mx-1 transition-all duration-300"></div>
              <span className="text-xs text-slate-600 hover:text-gray-900 whitespace-nowrap cursor-pointer transition-colors duration-300">
                The Ibadan Smart Guide
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-900 hover:text-gray-600 cursor-pointer transition-colors duration-300 hover:bg-white/20 rounded-lg p-1 group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:rotate-90"
              >
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 text-sm overflow-y-auto">
            {/* Base navigation items */}
            {baseNavItems.map((item, index) => (
              <button
                key={item.id}
                className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
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
                <span className="group-hover/item:pl-1 transition-all">{item.label}</span>
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
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
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
                  <span className="group-hover/item:pl-1 transition-all">{item.label}</span>
                </button>
              ))}

            {/* Divider */}
            {isLoggedIn && (
              <div
                className="h-px bg-gray-200/50 my-2 transition-all duration-300"
                style={{
                  transitionDelay: isMenuOpen
                    ? `${
                        (baseNavItems.length + loggedInNavItems.length + 2) * 50
                      }ms`
                    : "0ms",
                  opacity: isMenuOpen ? 1 : 0,
                }}
              ></div>
            )}

            {/* Authentication buttons */}
            {isLoggedIn ? (
              <>
                {/* Mobile user info */}
                <div
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-lg mb-4 cursor-default transition-all duration-300"
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
                  <p className="text-sm font-medium text-gray-900 cursor-default">
                    {userProfile?.firstName
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : userEmail}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 cursor-default">
                    {userEmail}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${userProfile?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={`text-xs ${userProfile?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {getVerificationStatusText()}
                    </span>
                  </div>
                </div>

                {/* Mobile navigation for logged-in users */}
                <button
                  onClick={handleMobileProfileNavigation}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
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
                  <div className="flex items-center gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>My Profile</span>
                  </div>
                </button>

                {/* Vendor Dashboard for vendors only in mobile */}
                {userProfile?.role === "vendor" && (
                  <button
                    onClick={() => handleMobileNavigate("/vendor/dashboard")}
                    className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
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
                    <div className="flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                      </svg>
                      <span>Vendor Dashboard</span>
                    </div>
                  </button>
                )}

                {/* List Your Business for vendors only in mobile */}
                {userProfile?.role === "vendor" && (
                  <button
                    onClick={() => handleMobileNavigate("/add-business")}
                    className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
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
                    <div className="flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <span>List Your Business</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => handleMobileNavigate("/saved")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 7) *
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
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                    </svg>
                    <span>
                      Saved Listings {savedCount > 0 && `(${savedCount})`}
                    </span>
                  </div>
                </button>

                {/* Sign Out button */}
                <button
                  onClick={() => {
                    handleSignOut();
                  }}
                  className="block w-full text-left py-3 px-4 text-gray-700 hover:text-red-700 hover:bg-red-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${
                          (baseNavItems.length + loggedInNavItems.length + 8) *
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
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Sign Out</span>
                  </div>
                </button>
              </>
            ) : (
              <>
                <div
                  className="h-px bg-gray-200/50 my-2 transition-all duration-300"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${(baseNavItems.length + 1) * 50}ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                  }}
                ></div>

                <button
                  onClick={() => handleMobileNavigate("/login")}
                  className="block w-full text-left py-3 px-4 text-gray-900 hover:text-[#06EAFC] hover:bg-blue-50/50 backdrop-blur-sm rounded-lg transition-all duration-300 font-normal whitespace-nowrap text-sm cursor-pointer transform hover:translate-x-1 group/item"
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
                  <span className="group-hover/item:pl-1 transition-all">Log In</span>
                </button>

                <button
                  onClick={() => handleMobileNavigate("/register")}
                  className="block w-full text-left py-3 px-4 hover:bg-blue-50/50 backdrop-blur-sm text-black rounded-lg font-normal whitespace-nowrap text-sm cursor-pointer transition-all duration-300 transform hover:translate-x-1 group/item"
                  style={{
                    transitionDelay: isMenuOpen
                      ? `${(baseNavItems.length + 3) * 50}ms`
                      : "0ms",
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen
                      ? "translateX(0)"
                      : "translateX(-20px)",
                  }}
                >
                  <span className="group-hover/item:pl-1 transition-all">Register</span>
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