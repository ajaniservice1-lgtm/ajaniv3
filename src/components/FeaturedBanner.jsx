// src/components/FeaturedBanner.jsx
import { FaGreaterThan } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { IoArrowUpSharp } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
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

  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const inputRef = useRef(null);

  // Always blinking cursor effect in placeholder
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

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

  const comingSoonVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsTyping(true);
    // Clear the placeholder text when focused
    if (inputRef.current) {
      if (inputRef.current.textContent === "Message...") {
        inputRef.current.textContent = "";
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTyping(false);
    // Restore placeholder if empty
    if (inputRef.current && !inputRef.current.textContent.trim()) {
      inputRef.current.textContent = "Message...";
    }
  };

  const handleSend = () => {
    if (
      inputRef.current &&
      inputRef.current.textContent.trim() &&
      inputRef.current.textContent !== "Message..."
    ) {
      // Show "Coming Soon" message
      setShowComingSoon(true);

      // Reset message
      inputRef.current.textContent = "Message...";

      // Hide "Coming Soon" after 3 seconds
      setTimeout(() => {
        setShowComingSoon(false);
      }, 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="w-full bg-white py-20 font-manrope overflow-x-hidden">
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
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium text-gray-800 mb-10 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
              style={{
                backdropFilter: "blur(100px)",
              }}
              onClick={() => {
                inputRef.current?.focus();
              }}
            >
              <span className="text-blue-600 md:text-2xl text-xs font-semibold animate-pulse">
                +
              </span>
              Ask Ajani, your smart city assistant.
              <span className="text-[8px] ml-3.5 animate-bounce">
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

            {/* Typing hint */}
            <div className="mt-8 p-4 bg-gradient-to-r from-cyan-50 to-green-50 rounded-xl border border-cyan-100">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span className="text-cyan-500 font-semibold animate-pulse">
                  💡 Click the message area below
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">Watch the blinking cursor</span>
              </p>
            </div>
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
              {/* Outer container box with pulsing animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-green-400 rounded-2xl transform rotate-2 scale-105 opacity-20 animate-pulse"></div>

              {/* Chat card */}
              <div className="relative bg-white border border-gray-200 shadow-xl rounded-2xl p-6 w-full max-w-sm mx-auto hover:shadow-2xl transition-shadow duration-300">
                {/* Chat Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center text-white font-bold relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-ping opacity-20"></div>
                    <img
                      src={Avater}
                      alt="Ajani Logo"
                      className="w-full h-full object-cover rounded-full relative z-10"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ajani</p>
                    <p className="text-xs text-gray-500">Ai Agent</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-6">
                  {/* Ajani Chat */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ajani ai</p>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3 text-gray-700">
                      Welcome to Wonderball! How can I help you today?
                    </div>

                    {/* User Reply */}
                    <div className="bg-gradient-to-r from-[#0e2043] to-[#1a3b6d] text-white rounded-xl p-3 mt-3 w-fit ml-auto text-sm shadow-lg">
                      Hi can you help me to track my order?
                    </div>
                  </div>

                  {/* Ajani follow-up */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ajani ai</p>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3 text-gray-700">
                      Sure, please hold on for a second. <br />
                      <span className="text-gray-500 text-sm">
                        Retrieving account details...
                      </span>
                    </div>
                  </div>

                  {/* "Coming Soon" Response */}
                  {showComingSoon && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={comingSoonVariants}
                      className="mt-4"
                    >
                      <p className="text-sm text-gray-500 mb-2">Ajani ai</p>
                      <div className="bg-gradient-to-r from-cyan-50 to-green-50 border border-cyan-200 rounded-xl p-3 text-gray-700">
                        <span className="font-semibold text-cyan-600">
                          🚀 Feature Coming Soon!
                        </span>
                        <br />
                        <span className="text-gray-600 text-sm">
                          Chat functionality will be available soon! In the
                          meantime, you can try typing and seeing the
                          interactive preview.
                        </span>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Message Input - Always showing blinking cursor */}
                <div
                  className={`mt-6 p-3 border-2 ${
                    isFocused
                      ? "border-cyan-400 shadow-cyan-100 shadow-inner"
                      : "border-gray-300 hover:border-cyan-300"
                  } bg-gradient-to-r from-gray-50 to-white rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-lg cursor-text`}
                  onClick={() => inputRef.current?.focus()}
                >
                  <div className="flex-1 relative">
                    {/* Placeholder text with blinking cursor */}
                    <div
                      ref={inputRef}
                      contentEditable
                      className="text-gray-400 text-sm outline-none min-h-[20px] w-full bg-transparent relative"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      suppressContentEditableWarning={true}
                    >
                      Message...
                    </div>

                    {/* Always visible blinking cursor in placeholder */}
                    {!isFocused &&
                      showCursor &&
                      inputRef.current?.textContent === "Message..." && (
                        <div className="absolute left-[72px] top-1/2 transform -translate-y-1/2">
                          <span className="w-0.5 h-4 bg-cyan-500 animate-pulse"></span>
                        </div>
                      )}

                    {/* Blinking cursor when typing */}
                    {isFocused && showCursor && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                        <span
                          className="w-0.5 h-4 bg-cyan-500 animate-pulse"
                          style={{
                            left: inputRef.current?.textContent.length * 7 || 0,
                          }}
                        ></span>
                      </div>
                    )}
                  </div>

                  <button
                    className={`ml-3 ${
                      isFocused &&
                      inputRef.current?.textContent.trim() &&
                      inputRef.current?.textContent !== "Message..."
                        ? "bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 animate-bounce"
                        : "bg-gray-300"
                    } text-white p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95`}
                    onClick={handleSend}
                    disabled={
                      !isFocused ||
                      !inputRef.current?.textContent.trim() ||
                      inputRef.current?.textContent === "Message..."
                    }
                  >
                    <IoArrowUpSharp />
                  </button>
                </div>

                {/* Interactive hints */}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-cyan-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                      Click here to type
                    </span>
                  </div>
                  <div className="text-gray-400 flex items-center gap-1">
                    <span className="animate-pulse">⌨️</span>
                    <span>Start typing now</span>
                  </div>
                </div>

                {/* Arrow pointing to input */}
                <div className="absolute -right-6 bottom-16 flex flex-col items-center">
                  <div className="text-cyan-500 text-2xl animate-bounce">
                    👇
                  </div>
                  <div className="text-xs text-cyan-600 font-semibold mt-1 whitespace-nowrap">
                    Type here!
                  </div>
                </div>

                {/* Pulse effect around the entire chat */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-green-400/0 animate-pulse pointer-events-none"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom note about feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-50 to-green-50 rounded-full border border-cyan-200">
            <span className="text-cyan-600 font-semibold animate-pulse">
              ⚡
            </span>
            <span className="text-gray-700">
              See the blinking cursor? Click and start typing!
            </span>
            <span className="text-gray-400 text-xs bg-white px-2 py-1 rounded-full">
              Interactive
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
