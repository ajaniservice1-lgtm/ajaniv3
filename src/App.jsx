// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";

// Lazy-load pages for performance
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const VendorPage = lazy(() => import("./pages/VendorPage"));

// Loading component with animated dots
const LoadingDots = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/privacypage" element={<PrivacyPage />} />
                  <Route path="/termspage" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* Dynamic vendor page */}
                  <Route path="/vendor/:slug" element={<VendorPage />} />
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