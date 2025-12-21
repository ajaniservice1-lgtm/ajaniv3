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
  const [isSending, setIsSending] = useState(false);
  const [showTryItArrow, setShowTryItArrow] = useState(true);
  const [messageHistory, setMessageHistory] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Welcome to Wonderball! How can I help you today?",
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      id: 2,
      sender: "user",
      text: "Hi can you help me to track my order?",
      timestamp: new Date(Date.now() - 180000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      id: 3,
      sender: "bot",
      text: "Sure, please hold on for a second. Retrieving account details...",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Always blinking cursor effect in placeholder
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messageHistory, showComingSoon]);

  // Clear placeholder on mount and show arrow
  useEffect(() => {
    if (inputRef.current && inputRef.current.textContent === "Message...") {
      inputRef.current.textContent = "";
    }
    setShowTryItArrow(true);
  }, []);

  // Check input content to show/hide arrow
  useEffect(() => {
    const checkInputContent = () => {
      if (inputRef.current) {
        const hasContent =
          inputRef.current.textContent.trim() !== "" &&
          inputRef.current.textContent !== "Message...";
        setShowTryItArrow(!hasContent && !isFocused);
      }
    };

    // Check initially
    checkInputContent();

    // Set up interval to check input content
    const interval = setInterval(checkInputContent, 100);

    return () => clearInterval(interval);
  }, [isFocused]);

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
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsTyping(true);
    // Clear placeholder text when focused
    if (inputRef.current && inputRef.current.textContent === "Message...") {
      inputRef.current.textContent = "";
    }
    // Hide arrow when focused (user starts typing)
    setShowTryItArrow(false);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTyping(false);
    // Restore placeholder if empty
    if (inputRef.current && !inputRef.current.textContent.trim()) {
      inputRef.current.textContent = "Message...";
      // Show arrow again if input is empty
      setShowTryItArrow(true);
    }
  };

  const handleSend = () => {
    const message = inputRef.current?.textContent?.trim();

    if (message && message !== "Message...") {
      // Add user message to history
      const newUserMessage = {
        id: messageHistory.length + 1,
        sender: "user",
        text: message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessageHistory((prev) => [...prev, newUserMessage]);
      setIsSending(true);
      // Hide arrow when sending
      setShowTryItArrow(false);

      // Simulate AI typing delay
      setTimeout(() => {
        // Show "Coming Soon" as bot response
        setShowComingSoon(true);
        setIsSending(false);

        // Add coming soon message to history after a delay
        setTimeout(() => {
          const comingSoonMessage = {
            id: messageHistory.length + 2,
            sender: "bot",
            text: "🚀 Feature Coming Soon! Chat functionality will be available soon!",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          setMessageHistory((prev) => [...prev, comingSoonMessage]);
          setShowComingSoon(false);
        }, 1000);

        // Clear input
        inputRef.current.textContent = "Message...";
        setIsFocused(false);
        // Show arrow again after clearing input
        setShowTryItArrow(true);
      }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessageHistory([
      {
        id: 1,
        sender: "bot",
        text: "Welcome to Wonderball! How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    // Show arrow when clearing chat
    setShowTryItArrow(true);
  };

  const handleExampleQuestion = (question) => {
    if (inputRef.current) {
      inputRef.current.textContent = question;
      inputRef.current.focus();
      setIsFocused(true);
      setIsTyping(true);
      // Hide arrow when example question is inserted
      setShowTryItArrow(false);
    }
  };

  const exampleQuestions = [
    "Where can I find the best restaurants?",
    "How do I track my package?",
    "What events are happening this weekend?",
    "Find electronics stores near me",
  ];

  return (
    <section
      className="w-full bg-white py-20 font-manrope overflow-x-hidden"
      id="chatbot"
    >
      <div className="lg:max-w-6xl mx-auto px-6">
        {/* Standalone H1 - Separate Animation */}
        <motion.div
          ref={h1Ref}
          initial="hidden"
          animate={h1InView ? "visible" : "hidden"}
          variants={h1Variants}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 drop-shadow-md">
            Talk to Our <span className="text-[#06F49F]">AI Assistant</span>
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Get instant answers about places, prices, vendors, and anything
            around Ibadan.
          </p>
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
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium text-gray-800 mb-10 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95 group"
              style={{
                backdropFilter: "blur(100px)",
              }}
              onClick={() => {
                inputRef.current?.focus();
                window.scrollTo({
                  top: document.getElementById("chatbot").offsetTop + 300,
                  behavior: "smooth",
                });
              }}
            >
              <span className="text-blue-600 md:text-2xl text-xs font-semibold animate-pulse group-hover:animate-spin">
                +
              </span>
              Ask Ajani, your smart city assistant.
              <span className="text-[8px] ml-3.5 group-hover:translate-x-1 transition-transform">
                <FaGreaterThan />
              </span>
            </button>

            <h2 className="md:text-2xl text-xl font-semibold text-gray-900 md:mb-4">
              Need something quick?
            </h2>

            <p className="text-gray-600 md:text-lg text-[14px] leading-relaxed max-w-md mb-8">
              Get instant answers, Ajani helps you find places, prices, vendors,
              and anything around Ibadan.
            </p>

            {/* Example Questions */}
            <div className="w-full max-w-md">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                Try asking:
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestion(question)}
                    className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-cyan-50 hover:to-green-50 border border-gray-200 hover:border-cyan-300 rounded-full text-sm text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-100 to-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 text-xs">✓</span>
                </div>
                <p className="text-gray-600 text-sm">24/7 instant responses</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-100 to-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 text-xs">✓</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Local business recommendations
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-100 to-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 text-xs">✓</span>
                </div>
                <p className="text-gray-600 text-sm">Real-time event updates</p>
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="mt-12 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-blue-600 font-bold animate-pulse">
                  🚀
                </span>
                <h4 className="font-semibold text-blue-900">Coming Soon</h4>
              </div>
              <p className="text-blue-700 text-sm">
                Full chat functionality with AI integration, voice commands, and
                personalized recommendations will be available soon!
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
            <div className="relative w-full max-w-md">
              {/* Outer container box with pulsing animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-green-400 rounded-2xl transform rotate-2 scale-105 opacity-20 animate-pulse"></div>

              {/* Chat card */}
              <div className="relative bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 w-full hover:shadow-2xl transition-shadow duration-300">
                {/* Chat Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center text-white font-bold relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-ping opacity-20"></div>
                    <img
                      src={Avater}
                      alt="Ajani Logo"
                      className="w-full h-full object-cover rounded-full relative z-10 border-2 border-white"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Ajani AI Assistant
                        </p>
                        <p className="text-xs text-gray-500">
                          Smart City Helper
                        </p>
                      </div>
                      <button
                        onClick={handleClearChat}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                      >
                        Clear Chat
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                </div>

                {/* Chat Messages Container */}
                <div
                  ref={chatContainerRef}
                  className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                >
                  {messageHistory.map((message) => (
                    <motion.div
                      key={message.id}
                      initial="hidden"
                      animate="visible"
                      variants={messageVariants}
                    >
                      <div
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="flex flex-col max-w-[80%]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              {message.sender === "bot" ? "Ajani AI" : "You"}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {message.timestamp}
                            </span>
                          </div>
                          <div
                            className={`rounded-xl p-3 ${
                              message.sender === "bot"
                                ? "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-gray-700"
                                : "bg-gradient-to-r from-[#0e2043] to-[#1a3b6d] text-white"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex flex-col max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">
                            Ajani AI
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            typing...
                          </span>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* "Coming Soon" Response */}
                  {showComingSoon && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={comingSoonVariants}
                    >
                      <div className="flex justify-start">
                        <div className="flex flex-col max-w-[80%]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">
                              Ajani AI
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">Now</span>
                          </div>
                          <div className="bg-gradient-to-r from-cyan-50 to-green-50 border border-cyan-200 rounded-xl p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-cyan-600 text-lg mt-0.5">
                                🚀
                              </span>
                              <div>
                                <p className="font-semibold text-cyan-700">
                                  Feature Coming Soon!
                                </p>
                                <p className="text-gray-600 text-sm mt-1">
                                  Chat functionality will be available soon! In
                                  the meantime, you can explore our demo
                                  features.
                                </p>
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Message Input */}
                <div className="relative">
                  {/* Interactive Arrow - Positioned directly on the input box */}
                  {showTryItArrow && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-7 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10"
                    >
                      <div className="text-cyan-500 text-xl animate-bounce">
                        👇
                      </div>
                      <div className="text-xs text-cyan-600 font-semibold mt-0.5 whitespace-nowrap bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-cyan-200 shadow-sm">
                        Try it now!
                      </div>
                    </motion.div>
                  )}

                  <div
                    className={`p-3 border-2 ${
                      isFocused
                        ? "border-cyan-400 shadow-cyan-100 shadow-inner"
                        : "border-gray-300 hover:border-cyan-300"
                    } bg-gradient-to-r from-gray-50 to-white rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-lg cursor-text`}
                    onClick={() => {
                      inputRef.current?.focus();
                      if (
                        inputRef.current &&
                        inputRef.current.textContent === "Message..."
                      ) {
                        inputRef.current.textContent = "";
                      }
                    }}
                  >
                    <div className="flex-1 relative min-h-[24px]">
                      <div
                        ref={inputRef}
                        contentEditable
                        className="text-gray-800 text-sm outline-none w-full bg-transparent relative z-10 placeholder-gray-400"
                        data-placeholder="Message..."
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        suppressContentEditableWarning={true}
                      />

                      {/* Placeholder */}
                      {!isFocused && inputRef.current?.textContent === "" && (
                        <div className="absolute top-0 left-0 text-gray-400 text-sm pointer-events-none z-0">
                          Message...
                          {showCursor && (
                            <span className="ml-0.5 w-0.5 h-4 bg-cyan-500 animate-pulse inline-block align-middle"></span>
                          )}
                        </div>
                      )}

                      {/* Typing cursor */}
                      {isFocused && showCursor && (
                        <span
                          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan-500 animate-pulse"
                          style={{
                            left: `${Math.min(
                              (inputRef.current?.textContent?.length || 0) *
                                8.5,
                              280
                            )}px`,
                          }}
                        ></span>
                      )}
                    </div>

                    <button
                      className={`ml-3 p-2.5 rounded-full transition-all duration-300 ${
                        inputRef.current?.textContent?.trim() &&
                        inputRef.current?.textContent !== "Message..."
                          ? "bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 shadow-lg hover:shadow-cyan-200 hover:scale-110 active:scale-95"
                          : "bg-gray-300 cursor-not-allowed"
                      } ${isSending ? "animate-pulse" : ""}`}
                      onClick={handleSend}
                      disabled={
                        !inputRef.current?.textContent?.trim() ||
                        inputRef.current?.textContent === "Message..." ||
                        isSending
                      }
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <IoArrowUpSharp className="text-white text-lg" />
                      )}
                    </button>
                  </div>

                  {/* Input Hints */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-cyan-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        Click to type your question
                      </span>
                    </div>
                    <div className="text-gray-400 flex items-center gap-1.5">
                      <span className="text-xs">Press</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs border border-gray-300">
                        Enter
                      </kbd>
                      <span className="text-xs">to send</span>
                    </div>
                  </div>
                </div>

                {/* Features Preview */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Preview Features:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-blue-600 text-lg mb-1">🤖</div>
                      <p className="text-xs font-medium text-blue-800">
                        AI Responses
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div className="text-green-600 text-lg mb-1">📍</div>
                      <p className="text-xs font-medium text-green-800">
                        Local Search
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-purple-600 text-lg mb-1">🎯</div>
                      <p className="text-xs font-medium text-purple-800">
                        Smart Suggestions
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                      <div className="text-orange-600 text-lg mb-1">⚡</div>
                      <p className="text-xs font-medium text-orange-800">
                        Instant Help
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom note about feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-50 via-white to-green-50 rounded-2xl border border-cyan-200 shadow-lg max-w-2xl mx-auto">
            <span className="text-cyan-600 font-semibold animate-pulse text-xl">
              ⚡
            </span>
            <div className="text-left">
              <p className="text-gray-800 font-semibold">
                Interactive AI Chat Demo
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Experience the preview of our upcoming AI assistant. Full
                functionality coming soon!
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live Preview</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
