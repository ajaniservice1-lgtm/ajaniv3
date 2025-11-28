// src/components/FeaturedBanner.jsx
import React from "react";

const FeaturedBanner = () => {
  return (
    <section className="w-full bg-white py-20 font-sans">
      <div className="lg:max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* ---------- LEFT SECTION ---------- */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Talk to Our <span className="text-green-500">Chatbot</span>
          </h1>

          {/* Ask Ajani Button */}
          <button
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full font-medium text-gray-800 mb-10 transition-all duration-300"
            style={{
              background:
                "linear-gradient(180deg, rgba(6, 234, 252, 0.35) 0%, rgba(6, 244, 159, 0.35) 100%)",
              backdropFilter: "blur(100px)",
            }}
          >
            <span className="text-blue-600 font-semibold">+</span>
            Ask Ajani, your smart city assistant.
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Need something quick?
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed max-w-md">
            Get instant answers, Ajani helps you find places, prices, vendors,
            and anything around Ibadan.
          </p>
        </div>

        {/* ---------- RIGHT CHAT CARD ---------- */}
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 w-full max-w-sm mx-auto">
          {/* Chat Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="font-semibold text-gray-900">Ajani</p>
              <p className="text-xs text-gray-500">Always</p>
            </div>
          </div>

          {/* Chat Bubbles */}
          <div className="space-y-6">
            {/* Emily Chat */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Emily</p>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-700">
                Welcome to Wonderball! How can I help you today?
              </div>

              {/* User Reply */}
              <div className="bg-blue-600 text-white rounded-xl p-3 mt-3 w-fit ml-auto text-sm shadow-md">
                Hi can you help me to track my order?
              </div>
            </div>

            {/* Emily follow-up */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Emily</p>
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-700">
                Sure, please hold on for a second. <br />
                <span className="text-gray-500 text-sm">
                  Retrieving account details...
                </span>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="mt-6 p-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-400 text-sm">
            Message...
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
