import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 mt-16">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Notifications</h1>
          <p className="text-gray-600 mb-8">
            Stay updated with your bookings and important alerts
          </p>
          
          <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
            <p>No notifications yet</p>
            <p className="mt-4">You'll see booking confirmations, reminders, and updates here.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotificationsPage;