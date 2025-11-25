// src/components/Hero.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import HeroImage from "../assets/Logos/towerr.jpeg";

const Hero = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView) setHasAnimated(true);
    else setHasAnimated(false);
  }, [isInView]);

  return (
    <section
      id="hero"
      className="bg-[#F7F7FA] font-rubik overflow-hidden min-h-[calc(100vh-80px)] flex items-start"
    >
      {/* Full mobile padding: more breathing room top/bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
        {/* Centered column with increased vertical spacing */}
        <div
          ref={heroRef}
          className="flex flex-col items-center text-center gap-6 sm:gap-8 pt-8 sm:pt-12 pb-8 sm:pb-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px", once: false }}
            className="flex flex-col justify-start space-y-6 sm:space-y-8 max-w-xl sm:max-w-2xl w-full"
          >
            {/* Headline - kept your style, just responsive */}
            <h1 className="text-4xl sm:text-3xl md:text-5xl font-bold text-[#101828] leading-tight mt-6">
              Discover Ibadan through AI & Local Stories
            </h1>

            {/* Subtitle - kept your style */}
            <p className="lg:text-lg text-[15px] md:text-xl leading-[1.5] text-slate-600 mb-10">
              Your all-in-one local guide for hotels, food, events, vendors, and
              market prices.
            </p>

            {/* Search Bar - your exact style, just scaled for mobile */}
            <div className="flex items-center bg-gray-200 rounded-full shadow-sm mx-auto w-full sm:max-w-md">
              <div className="pl-3 sm:pl-4 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 sm:h-5 w-4 sm:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search locations, Upcoming Events...."
                className="flex-1 bg-transparent py-3 sm:py-5 px-4 sm:px-3 text-xs sm:text-sm text-gray-800 outline-none placeholder:text-gray-600"
              />
              <button className="bg-[#06EAFC] hover:bg-[#00b8e6] font-semibold rounded-full py-3 sm:py-5 px-4 sm:px-8 text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap">
                Search
              </button>
            </div>

            {/* Categories - your exact style, just more spaced on mobile */}
            <div className="flex justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
              {["Hotel", "Restaurant", "Events", "Tourism"].map((item) => (
                <div key={item} className="w-16 sm:w-20 text-center">
                  <img
                    src={HeroImage}
                    alt={item}
                    className="w-16 h-14 sm:w-20 sm:h-16 rounded-lg object-cover"
                  />
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
