// src/components/FeaturedBanner.jsx
import { FaGreaterThan } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { IoArrowUpSharp } from "react-icons/io5";
import Avater from "../assets/Logos/logo8.png";

const FeaturedBanner = () => {
  const [h1Ref, h1InView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const [leftRef, leftInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [rightRef, rightInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  // Animation variants
  const h1Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const leftContentVariants = {
    hidden: { opacity: 0, x: -80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const rightContentVariants = {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  return (
    <section className="w-full bg-white py-20 font-manrope">
      <div className="lg:max-w-4xl mx-auto px-6">
        {/* Standalone H1 - Separate Animation */}
        <motion.div
          ref={h1Ref}
          initial="hidden"
          animate={h1InView ? "visible" : "hidden"}
          variants={h1Variants}
          className="text-center mb-16"
        >
          <h1 className="text-xl md:text-center text-start md:text-xl font-bold text-gray-900 drop-shadow-md">
            Talk to Our <span className="text-[#06F49F]">Chatbot</span>
          </h1>
        </motion.div>

        {/* Content Section - Left and Right aligned with separate animations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* ---------- LEFT SECTION ---------- */}
          <motion.div
            ref={leftRef}
            initial="hidden"
            animate={leftInView ? "visible" : "hidden"}
            variants={leftContentVariants}
            className="flex flex-col items-start"
          >
            {/* Ask Ajani Button */}
            <button
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium text-gray-800 mb-10 transition-all duration-300 hover:scale-105"
              style={{
                backdropFilter: "blur(100px)",
              }}
            >
              <span className="text-blue-600 md:text-2xl text-xs font-semibold">+</span>
              Ask Ajani, your smart city assistant.
              <span className="text-[8px] ml-3.5">
                <FaGreaterThan />
              </span>
            </button>

            <h2 className="md:text-2xl text-xl font-semibold text-gray-900 md:mb-4">
              Need something quick?
            </h2>

            <p className="text-gray-600 md:text-lg text-[14px] leading-relaxed max-w-md">
              Get instant answers, Ajani helps you find places, prices, vendors,
              and anything around Ibadan.
            </p>
          </motion.div>

          {/* ---------- RIGHT CHAT CARD WITH CONTAINER BOX ---------- */}
          <motion.div
            ref={rightRef}
            initial="hidden"
            animate={rightInView ? "visible" : "hidden"}
            variants={rightContentVariants}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              {/* Outer container box */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-green-400 rounded-2xl transform rotate-2 scale-105 opacity-20"></div>

              {/* Chat card */}
              <div className="relative bg-white border border-gray-200 shadow-lg rounded-2xl p-6 w-full max-w-sm mx-auto">
                {/* Chat Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center text-white font-bold">
                    <img
                      src={Avater}
                      alt="Ajani Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ajani</p>
                    <p className="text-xs text-gray-500">Ai Agent</p>
                  </div>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-6">
                  {/* Emily Chat */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ajani ai</p>
                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-700">
                      Welcome to Wonderball! How can I help you today?
                    </div>

                    {/* User Reply */}
                    <div className="bg-[#0e2043] text-white rounded-xl p-3 mt-3 w-fit ml-auto text-sm shadow-md">
                      Hi can you help me to track my order?
                    </div>
                  </div>

                  {/* Emily follow-up */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ajani ai</p>
                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-700">
                      Sure, please hold on for a second. <br />
                      <span className="text-gray-500 text-sm">
                        Retrieving account details...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="mt-6 p-3 border border-gray-200 bg-gray-50 rounded-xl flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Message...</span>
                  <span className="bg-[#0e2043] text-white p-1.5 rounded-full">
                    <IoArrowUpSharp />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
