import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 mt-16">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Assistant</h1>
          <p className="text-gray-600 mb-8">
            AI-powered chat assistant to help you find the perfect listings
          </p>
          
          <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
            <p>Chat feature coming soon!</p>
            <p className="mt-4">Our AI assistant will help you discover properties, restaurants, and events in Ibadan.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatPage;