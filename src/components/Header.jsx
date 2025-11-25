// FULL UPDATED Header.jsx — Only Layout Adjusted, NO logic/functions touched
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logos/logo5.png";
import LoginButton from "../components/ui/LoginButton";
import { IoPerson } from "react-icons/io5";

const Header = ({ onAuthToast }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isMenuOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* FIXED HEADER WITH BOTTOM BLUE LINE (Image 1 style) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F7FA] border-b-2 border-[#00d1ff] h-20 font-rubik">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <nav className="flex items-center justify-between px-6 py-1 w-full">
            {/* LEFT — LOGO */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  closeMenu();
                  navigate("/");
                  setTimeout(
                    () => window.scrollTo({ top: 0, behavior: "smooth" }),
                    150
                  );
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <img
                  src={Logo}
                  alt="Ajani Logo"
                  className="h-8 w-24 object-contain"
                />
              </button>
            </div>

            {/* CENTER — NAVIGATION (Centered like Image 1) */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-10 text-sm">
              {[
                { label: "Home", id: "Home" },
                { label: "Categories", id: "Categories" },
                { label: "Price Insights", id: "Price Insights" },
                { label: "Blog", id: "Blog" },
                { label: "Vendor", id: "Vendor" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="hover:text-[#00d1ff] transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* RIGHT — Profile + Login + Hamburger */}
            <div className="flex items-center gap-4 text-sm">
              <div className="hidden lg:flex items-center gap-2">
                <IoPerson />
                <span>My Profile</span>
              </div>

              <LoginButton onAuthToast={onAuthToast} />

              {/* MOBILE HAMBURGER */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden text-gray-900 focus:outline-none"
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
        {/* OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
          onClick={closeMenu}
          aria-hidden="true"
        ></div>

        {/* SLIDING PANEL */}
        <div
          className={`fixed left-0 top-0 w-full h-screen bg-[#e6f2ff] flex flex-col transform transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#f2f9ff] rounded-full shadow-md px-6 py-3 mt-1.5">
            <button
              onClick={closeMenu}
              className="flex flex-col items-start focus:outline-none"
            >
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Ajani Logo" className="h-8 w-24" />
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <span className="md:text-sm text-[12.5px] text-slate-600 hover:text-gray-900">
                  The Ibadan Smart Guide
                </span>
              </div>
            </button>
            <button
              onClick={closeMenu}
              className="text-gray-900 hover:text-gray-600"
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

          {/* NAVIGATION LINKS */}
          <nav className="flex-1 p-5 space-y-1 font-normal font-rubik">
            {[
              { label: "Categories", id: "Categories" },
              { label: "Price Insights", id: "Price Insights" },
              { label: "Blog", id: "Blog" },
              { label: "My Profile", id: "My Profile" },
              { label: "Log In", id: "Log In" },
              { label: "Register", id: "Register" },
            ].map((item) => (
              <button
                key={item.id}
                className="block w-full text-left py-2 text-gray-900 hover:text-[#06EAFC] font-medium"
                onClick={() => {
                  scrollToSection(item.id);
                  setTimeout(() => closeMenu(), 400);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
