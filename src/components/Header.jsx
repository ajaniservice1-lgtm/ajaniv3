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
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const categoriesDropdownRef = useRef(null);
  const mobileCategoriesRef = useRef(null);

  // Enhanced auth check function
  const checkLoginStatus = () => {
    const token =
      localStorage.getItem("auth_token") ||
      JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
    const userEmail = localStorage.getItem("user_email");
    const profile = localStorage.getItem("userProfile");

    if (token && userEmail) {
      setIsLoggedIn(true);
      setUserEmail(userEmail);

      if (profile) {
        try {
          const parsedProfile = JSON.parse(profile);
          setUserProfile(parsedProfile);
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

  // Enhanced glass effect
  const getGlassEffect = () => {
    return {
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: isScrolled ? 'blur(12px) saturate(180%)' : 'blur(8px) saturate(180%)',
      WebkitBackdropFilter: isScrolled ? 'blur(12px) saturate(180%)' : 'blur(8px) saturate(180%)',
      borderBottom: isScrolled ? '1px solid rgba(0, 209, 255, 0.2)' : '1px solid rgba(0, 209, 255, 0.3)',
      boxShadow: isScrolled 
        ? '0 4px 20px 0 rgba(31, 38, 135, 0.1)' 
        : '0 2px 10px 0 rgba(31, 38, 135, 0.05)',
      transition: 'all 0.3s ease-in-out',
    };
  };

  // Check login status
  useEffect(() => {
    checkLoginStatus();

    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);
    window.addEventListener("loginSuccess", handleStorageChange);

    const handleFocus = () => {
      checkLoginStatus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
      window.removeEventListener("loginSuccess", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Enhanced sign out function
  const handleSignOut = () => {
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
      
      // Handle click outside categories dropdown (desktop)
      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(event.target)
      ) {
        setIsCategoriesOpen(false);
      }
      
      // Handle click outside categories dropdown (mobile)
      if (
        mobileCategoriesRef.current &&
        !mobileCategoriesRef.current.contains(event.target) &&
        event.target.closest('button')?.textContent !== 'Categories'
      ) {
        // Only close if clicking outside AND not on the categories button
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Categories items - UPDATED: All categories as separate items
  const categoriesItems = [
    { 
      label: "Hotel", 
      id: "hotel", 
      action: () => navigate("/hotel")
    },
    { 
      label: "Restaurant", 
      id: "restaurant", 
      action: () => navigate("/restaurant")
    },
    { 
      label: "Shortlet", 
      id: "shortlet", 
      action: () => navigate("/shortlet")
    },
    { 
      label: "Services", 
      id: "vendors", 
      action: () => navigate("/vendor")
    },
    { 
      label: "Events", 
      id: "events", 
      action: () => navigate("/event")
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

  // Get user initials for avatar - STANDARD APPLE-STYLE AVATAR
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

  // Toggle categories dropdown for desktop
  const toggleCategoriesDropdown = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  // Toggle categories dropdown for mobile
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  const toggleMobileCategories = () => {
    setIsMobileCategoriesOpen(!isMobileCategoriesOpen);
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-[1000] h-16 cursor-default transition-all duration-300 ease-in-out"
        style={getGlassEffect()}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white/60 -z-10" />
        
        <div className="w-full px-4 h-full max-w-7xl mx-auto">
          <nav className="flex items-center justify-between h-full">
            {/* Left: Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
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

            {/* Center: Navigation Items - UPDATED: All categories directly on navbar for LG */}
            <div className="hidden lg:flex items-center justify-center flex-1 text-sm h-full">
              <div className="flex items-center justify-center gap-6 h-full">
                {/* Categories as individual items - FIXED: All categories shown directly */}
                {categoriesItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setIsCategoriesOpen(false);
                    }}
                    className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer px-2.5 py-1 rounded-md hover:bg-white/30 backdrop-blur-sm"
                  >
                    {item.label}
                  </button>
                ))}

                {/* Additional items for logged in users */}
                {isLoggedIn &&
                  loggedInNavItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="hover:text-[#00d1ff] transition-all whitespace-nowrap text-sm font-normal cursor-pointer px-2.5 py-1 rounded-md hover:bg-white/30 backdrop-blur-sm"
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Right: Auth/Profile Section */}
            <div className="flex items-center gap-2 h-full flex-shrink-0">
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

                  {/* Profile dropdown - MODERNIZED */}
                  <div
                    className="relative cursor-pointer"
                    ref={profileDropdownRef}
                  >
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-all duration-300 cursor-pointer hover:scale-105 group relative"
                      title="Profile"
                    >
                      {/* Green dot for online status */}
                      {isLoggedIn && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10 animate-pulse"></div>
                      )}
                      
                      {userProfile?.profilePicture ? (
                        <img
                          src={userProfile.profilePicture}
                          alt="Profile"
                          className="w-9 h-9 rounded-full object-cover border-2 border-gray-300 shadow-sm group-hover:ring-2 group-hover:ring-gray-300 transition-all"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `
                              <div class="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm group-hover:ring-2 group-hover:ring-gray-300 transition-all border-2 border-white">
                                ${getUserInitials()}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        // STANDARD APPLE-STYLE AVATAR with green dot
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm group-hover:ring-2 group-hover:ring-gray-300 transition-all border-2 border-white">
                          {getUserInitials()}
                        </div>
                      )}
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl py-3 z-[1002] border border-gray-200 cursor-default transition-all duration-300 animate-in fade-in-50 slide-in-from-top-1">
                        {/* User info section - MODERNIZED */}
                        <div className="px-4 py-4 border-b border-gray-100 cursor-default bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-base shadow-sm border-2 border-white">
                                {getUserInitials()}
                              </div>
                              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white z-10 animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900 cursor-default truncate">
                                  {userProfile?.firstName && userProfile?.lastName
                                    ? `${userProfile.firstName} ${userProfile.lastName}`
                                    : userEmail?.split('@')[0]}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${userProfile?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {getVerificationStatusText()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 truncate cursor-default">
                                {userEmail}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-xs text-gray-600 cursor-default">Online</span>
                                </div>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 cursor-default">
                                  {userProfile?.role === "vendor" ? "Vendor" : "Buyer"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Section */}
                        <div className="py-2">
                          <div className="px-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1.5 cursor-default">Account</p>
                          </div>
                          
                          <button
                            onClick={handleProfileNavigation}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item rounded-lg mx-2"
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded-lg group-hover/item:bg-blue-100 transition-colors">
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
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">My Profile</span>
                              <p className="text-xs text-gray-500">View and edit your profile</p>
                            </div>
                          </button>

                          {/* Dashboard link for vendors ONLY */}
                          {userProfile?.role === "vendor" && (
                            <button
                              onClick={() => {
                                navigate("/vendor/dashboard");
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item rounded-lg mx-2"
                            >
                              <div className="w-8 h-8 flex items-center justify-center bg-purple-50 rounded-lg group-hover/item:bg-purple-100 transition-colors">
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
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-medium">Vendor Dashboard</span>
                                <p className="text-xs text-gray-500">Manage your business</p>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Categories Section */}
                        <div className="py-2 border-t border-gray-100">
                          <div className="px-2">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1.5 cursor-default">Categories</p>
                          </div>
                          <div className="grid grid-cols-2 gap-1 px-2">
                            {categoriesItems.slice(0, 4).map((item) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  item.action();
                                  setIsProfileDropdownOpen(false);
                                }}
                                className="flex flex-col items-center p-3 text-xs text-gray-700 hover:bg-gray-100 hover:text-blue-700 rounded-lg transition-all duration-200 cursor-pointer group/category"
                              >
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full group-hover/category:bg-blue-50 mb-1.5">
                                  <span className="font-medium text-gray-600 group-hover/category:text-blue-600">{item.label.charAt(0)}</span>
                                </div>
                                <span className="font-medium truncate w-full text-center">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions Section */}
                        <div className="py-2 border-t border-gray-100">
                          <button
                            onClick={() => {
                              navigate("/saved");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item rounded-lg mx-2"
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg group-hover/item:bg-red-100 transition-colors relative">
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
                              {savedCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium text-[10px] border border-white">
                                  {savedCount > 9 ? "9+" : savedCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">Saved Listings</span>
                              <p className="text-xs text-gray-500">Your favorite places</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              navigate("/chat");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item rounded-lg mx-2"
                          >
                            <div className="w-8 h-8 flex items-center justify-center bg-green-50 rounded-lg group-hover/item:bg-green-100 transition-colors">
                              <LucideIcons.MessageSquareText size={16} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">Chat Assistant</span>
                              <p className="text-xs text-gray-500">Get help instantly</p>
                            </div>
                          </button>

                          {/* List Your Business for vendors */}
                          {userProfile?.role === "vendor" && (
                            <button
                              onClick={() => {
                                navigate("/add-business");
                                setIsProfileDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 cursor-pointer group/item rounded-lg mx-2"
                            >
                              <div className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg group-hover/item:bg-amber-100 transition-colors">
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
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-medium">List Your Business</span>
                                <p className="text-xs text-gray-500">Add new listing</p>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Sign out section */}
                        <div className="pt-2 border-t border-gray-100 px-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer group/item rounded-lg"
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
                            <span className="font-medium">Sign Out</span>
                          </button>
                          <p className="text-xs text-gray-400 text-center mt-2 cursor-default">© {new Date().getFullYear()} Ajani</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Show Login/Register buttons when NOT logged in */
                <div className="hidden lg:flex items-center gap-1.5">
                  <button
                    onClick={() => navigate("/login")}
                    className="py-2 px-4 text-sm font-normal bg-[#06EAFC]/90 hover:bg-[#6cf5ff] duration-300 rounded-full transition-all shadow-sm cursor-pointer hover:scale-105 backdrop-blur-sm group"
                  >
                    <span className="group-hover:tracking-wide transition-all">Log in</span>
                  </button>

                  <div className="w-px h-4 bg-gray-400/50 font-bold backdrop-blur-sm"></div>

                  <button
                    onClick={() => navigate("/register")}
                    className="py-2 px-4 text-sm font-normal border-2 border-[#06EAFC] rounded-full transition-all shadow-sm cursor-pointer hover:scale-105 hover:bg-white/30 backdrop-blur-sm group"
                  >
                    <span className="group-hover:tracking-wide transition-all">Get Started</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-gray-900 p-1 ml-1 cursor-pointer hover:text-[#00d1ff] transition-all duration-300 hover:bg-white/30 rounded-lg group"
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

      {/* MOBILE MENU - MODERNIZED */}
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
          className={`fixed left-0 top-0 w-full h-screen bg-white flex flex-col z-[100001] transform transition-all duration-500 ease-out ${
            isMenuOpen
              ? "translate-x-0 opacity-100"
              : "-translate-x-full opacity-0"
          }`}
        >
          {/* Mobile Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={Logo}
                alt="Ajani Logo"
                className="h-7 w-20 object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => navigate("/")}
              />
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-900 hover:text-gray-600 cursor-pointer transition-colors duration-300 hover:bg-gray-100 rounded-lg p-2 group"
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

          {/* Mobile Navigation Content - MODERNIZED */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto bg-white" ref={mobileCategoriesRef}>
            {/* User info for logged in users - MODERN */}
            {isLoggedIn && (
              <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm border-3 border-white">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white z-10 animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {userProfile?.firstName && userProfile?.lastName
                          ? `${userProfile.firstName} ${userProfile.lastName}`
                          : userEmail?.split('@')[0]}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${userProfile?.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {getVerificationStatusText()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 truncate">
                      {userEmail}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-600">Online</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">
                        {userProfile?.role === "vendor" ? "Vendor Account" : "Buyer Account"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categories Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-sm font-semibold text-gray-900">Categories</p>
                <span className="text-xs text-gray-500">{categoriesItems.length} options</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoriesItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavigate(item.action)}
                    className="flex flex-col items-center p-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 cursor-pointer group/category border border-gray-100"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full group-hover/category:bg-blue-100 mb-2 transition-colors">
                      <span className="font-semibold text-gray-700 group-hover/category:text-blue-700">
                        {item.label.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-gray-900 px-2 mb-2">Quick Actions</p>
              
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleMobileProfileNavigation}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 cursor-pointer group/item"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
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
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">My Profile</span>
                      <span className="text-xs text-gray-500">Edit profile & settings</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileNavigate("/saved")}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 cursor-pointer group/item"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-lg group-hover/item:bg-red-100 transition-colors relative">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
                      </svg>
                      {savedCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium border border-white">
                          {savedCount > 9 ? "9+" : savedCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">Saved Listings</span>
                      <span className="text-xs text-gray-500">Your favorite places</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileNavigate("/chat")}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 cursor-pointer group/item"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-lg group-hover/item:bg-green-100 transition-colors">
                      <LucideIcons.MessageSquareText size={18} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">Chat Assistant</span>
                      <span className="text-xs text-gray-500">Get instant help</span>
                    </div>
                  </button>

                  {/* Vendor specific options */}
                  {userProfile?.role === "vendor" && (
                    <>
                      <button
                        onClick={() => handleMobileNavigate("/vendor/dashboard")}
                        className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 cursor-pointer group/item"
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-purple-50 rounded-lg group-hover/item:bg-purple-100 transition-colors">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
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
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium block">Vendor Dashboard</span>
                          <span className="text-xs text-gray-500">Manage your business</span>
                        </div>
                      </button>

                      <button
                        onClick={() => handleMobileNavigate("/add-business")}
                        className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 cursor-pointer group/item"
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-amber-50 rounded-lg group-hover/item:bg-amber-100 transition-colors">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="18" 
                            height="18" 
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
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium block">List Your Business</span>
                          <span className="text-xs text-gray-500">Add new listing</span>
                        </div>
                      </button>
                    </>
                  )}
                </>
              ) : (
                /* Authentication options for non-logged in */
                <>
                  <button
                    onClick={() => handleMobileNavigate("/login")}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200 cursor-pointer group/item"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg group-hover/item:bg-blue-100 transition-colors">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">Log In</span>
                      <span className="text-xs text-gray-500">Access your account</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMobileNavigate("/register")}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-all duration-200 cursor-pointer group/item"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-lg group-hover/item:bg-green-100 transition-colors">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M19 8v6"/>
                        <path d="M22 11h-6"/>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block">Get Started</span>
                      <span className="text-xs text-gray-500">Create new account</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Sign Out Button for logged in users */}
            {isLoggedIn && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => {
                    handleSignOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 cursor-pointer group/item"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" 
                    height="18" 
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
                  <span className="font-medium">Sign Out</span>
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  © {new Date().getFullYear()} Ajani. All rights reserved.
                </p>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;