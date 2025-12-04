// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";
import VendorDetail from "./pages/VendorDetail"; // Add this import

// Lazy-load pages for performance
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const VendorPage = lazy(() => import("./pages/VendorPage"));
const CategoryResults = lazy(() => import("./pages/CategoryResults"));
const SearchResults = lazy(() => import("./components/SearchResults")); // NEW: Add SearchResults import

// Loading component with animated dots
const LoadingDots = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      {/* Inject JSON-LD schema for SEO */}
      <LocalBusinessSchema />

      {/* Provide chat context globally */}
      <ModalProvider>
        <ChatProvider>
          <BrowserRouter>
            <TrackingWrapper>
              <Suspense fallback={<LoadingDots />}>
                <Routes>
                  {/* Home Page */}
                  <Route path="/" element={<HomePage />} />

                  {/* Static Pages */}
                  <Route path="/privacypage" element={<PrivacyPage />} />
                  <Route path="/termspage" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Dynamic vendor pages */}
                  <Route path="/vendor/:slug" element={<VendorPage />} />
                  <Route path="/vendor-detail/:id" element={<VendorDetail />} />

                  {/* Category pages */}
                  <Route
                    path="/category/:category"
                    element={<CategoryResults />}
                  />

                  {/* NEW: Search Results Page */}
                  <Route path="/search-results" element={<SearchResults />} />

                  {/* Optional: You can add a 404 page */}
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            404
                          </h1>
                          <p className="text-gray-600 mb-6">Page not found</p>
                          <a
                            href="/"
                            className="text-[#06EAFC] hover:text-[#05d9eb] font-medium"
                          >
                            Return to Home
                          </a>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            </TrackingWrapper>
          </BrowserRouter>
        </ChatProvider>
      </ModalProvider>
    </>
  );
}

export default App;
