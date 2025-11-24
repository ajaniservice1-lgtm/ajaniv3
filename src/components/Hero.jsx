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
    <section id="hero" className="bg-[#F7F7FA] font-rubik overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div ref={heroRef} className="grid lg:grid-cols-2 gap-12 items-center">
          {/* ================= LEFT SIDE ================= */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px", once: false }}
            className="flex flex-col justify-start -mt-6 lg:-mt-20 space-y-6 text-center lg:text-left"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-[#101828] leading-tight">
              Discover Ibadan through AI & Local Stories
            </h1>

            <p className="text-slate-600 text-xs md:text-lg leading-relaxed">
              Your all-in-one local guide for hotels, food, events, vendors, and
              market prices.
            </p>

            {/* Search Bar */}
            <div class="flex items-center bg-gray-200 rounded-full shadow-sm max-w-md">
              <div class="pl-4 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search locations, Upcoming Events...."
                className="flex-1 bg-transparent py-2.5 px-2 text-sm text-gray-800 outline-none placeholder:text-gray-600"
              />
              <button className="bg-[#06EAFC] hover:bg-[#00b8e6] text-white font-semibold rounded-r-full py-2.5 px-5 text-sm transition-colors duration-200 whitespace-nowrap">
                Search
              </button>
            </div>

            {/* Dummy Categories */}
            <div className="flex justify-center lg:justify-start gap-6 mt-6">
              <div className="w-20 text-center">
                <div className="bg-gray-300 w-20 h-16 rounded-lg"></div>
                <p className="mt-2 text-sm font-medium">Hotel</p>
              </div>

              <div className="w-20 text-center">
                <div className="bg-gray-300 w-20 h-16 rounded-lg"></div>
                <p className="mt-2 text-sm font-medium">Restaurant</p>
              </div>

              <div className="w-20 text-center">
                <div className="bg-gray-300 w-20 h-16 rounded-lg"></div>
                <p className="mt-2 text-sm font-medium">Events</p>
              </div>

              <div className="w-20 text-center">
                <div className="bg-gray-300 w-20 h-16 rounded-lg"></div>
                <p className="mt-2 text-sm font-medium">Tourism</p>
              </div>
            </div>
          </motion.div>

          {/* ================= RIGHT SIDE IMAGE ================= */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ margin: "-100px", once: false }}
            className="flex justify-center lg:justify-end w-full"
          >
            <img src={HeroImage} alt="Bower's Tower" className="w-[607px]" />
          </motion.div>
        </div>
      </div>

      <hr className="w-full h-[3px] bg-[#06EAFC] border-0 mt-10" />
    </section>
  );
};

export default Hero;
