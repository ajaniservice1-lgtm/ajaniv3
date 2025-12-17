import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/Logos/fotterimage.png";

const Footer = () => {
  const year = new Date().getFullYear();

  // Framer Motion variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  // Categories that match your Directory component
  const directoryCategories = [
    { name: "Hotels", path: "/category/hotel" },
    { name: "Restaurants", path: "/category/restaurant" },
    { name: "Shortlets", path: "/category/shortlet" },
    { name: "Tourist Centers", path: "/category/tourist-center" },
  ];

  return (
    <motion.footer
      className="bg-[#ffffff] text-black py-8 font-rubik border-t border-gray-200"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto px-5 font-manrope">
        {/* Main Content Grid - 4 columns to accommodate the large logo */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8"
          variants={staggerContainer}
        >
          {/* Column 1: Large Logo */}
          <motion.div variants={fadeUp} className="flex flex-col">
            <div className="flex items-center mb-4">
              <img
                src={Logo}
                alt="Ajani Logo"
                className="md:w-48 w-24 h-auto"
              />
            </div>
          </motion.div>

          {/* Column 2: About Section */}
          <motion.div variants={fadeUp}>
            <h3 className="font-bold text-black mb-4 text-base">About</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about-ajani-ai"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  About Ajani ai
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Categories Section - Updated to match Directory */}
          <motion.div variants={fadeUp}>
            <h3 className="font-bold text-black mb-4 text-base">Categories</h3>
            <ul className="space-y-2">
              {directoryCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Support Section */}
          <motion.div variants={fadeUp}>
            <h3 className="font-bold text-black mb-4 text-base">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/help-centre"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  Help Centre
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor-registration"
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  Vendor Registration
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 text-lg justify-center">
          <a
            href="https://www.facebook.com/profile.php?id=61580295532814#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook-f"></i>
          </a>

          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram"></i>
          </a>

          <a
            href="mailto:ajaniservice1@gmail.com"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Email"
          >
            <i className="fas fa-envelope"></i>
          </a>
          <a
            href="https://www.tiktok.com/@ajanismartguide?lang=en-GB"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            aria-label="Follow us on TikTok"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-tiktok"></i>
          </a>
        </div>

        {/* Bottom Copyright Line */}
        <motion.div variants={fadeUp} className="pt-6 text-center">
          <p className="text-gray-600 text-sm">
            © Copy right is Ajani Smart Guide Services
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
