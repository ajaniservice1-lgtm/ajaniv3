import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AddBusinessPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 mt-16">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Add Your Business</h1>
          <p className="text-gray-600 mb-8">
            List your business on Ajani and reach thousands of customers
          </p>
          
          <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="text-left space-y-4">
              <p>This feature is currently under development.</p>
              <p>Vendors can add their businesses through the vendor dashboard.</p>
              <p>Regular users can upgrade to vendor accounts to list businesses.</p>
              
              <div className="mt-8">
                <a
                  href="/register/vendor"
                  className="inline-block px-6 py-3 bg-[#00d37f] text-white rounded-lg hover:bg-[#02be72] transition font-medium"
                >
                  Register as Vendor
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddBusinessPage;