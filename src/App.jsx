import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";
import VendorDetail from "./pages/VendorDetail";

// Lazy-load pages for performance
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CategoryResults = lazy(() => import("./pages/CategoryResults"));
const SearchResults = lazy(() => import("./components/SearchResults"));

// Authentication Pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterChoicePage = lazy(() =>
  import("./pages/auth/RegisterChoicePage")
);

// User Registration Flow
const UserRegistration = lazy(() =>
  import("./pages/auth/registration/UserRegistration")
);
const UserProcess1 = lazy(() =>
  import("./pages/auth/registration/UserProcess1")
);
const UserProcess2 = lazy(() =>
  import("./pages/auth/registration/UserProcess2")
);
const UserProcess3 = lazy(() =>
  import("./pages/auth/registration/UserProcess3")
);
const UserProcess4 = lazy(() =>
  import("./pages/auth/registration/UserProcess4")
);
const UserCompleteProfile = lazy(() =>
  import("./pages/auth/registration/UserCompleteProfile")
);

// Vendor Registration Flow
const VendorRegistration = lazy(() =>
  import("./pages/auth/registration/VendorRegistration")
);
const VendorProcess1 = lazy(() =>
  import("./pages/auth/registration/VendorProcess1")
);
const VendorProcess2 = lazy(() =>
  import("./pages/auth/registration/VendorProcess2")
);
const VendorProcess3 = lazy(() =>
  import("./pages/auth/registration/VendorProcess3")
);
const VendorCompleteProfile = lazy(() =>
  import("./pages/auth/registration/VendorCompleteProfile")
);

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
                  <Route path="/vendor-detail/:id" element={<VendorDetail />} />

                  {/* Category pages */}
                  <Route
                    path="/category/:category"
                    element={<CategoryResults />}
                  />

                  {/* Search Results Page */}
                  <Route path="/search-results" element={<SearchResults />} />

                  {/* ========== AUTHENTICATION ROUTES ========== */}

                  {/* Login Page */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Registration Choice Page */}
                  <Route path="/register" element={<RegisterChoicePage />} />

                  {/* ========== USER REGISTRATION FLOW ========== */}

                  {/* User Registration Entry */}
                  <Route path="/register/user" element={<UserRegistration />} />

                  {/* User Process Steps */}
                  <Route
                    path="/register/user/process1"
                    element={<UserProcess1 />}
                  />
                  <Route
                    path="/register/user/process2"
                    element={<UserProcess2 />}
                  />
                  <Route
                    path="/register/user/process3"
                    element={<UserProcess3 />}
                  />
                  <Route
                    path="/register/user/process4"
                    element={<UserProcess4 />}
                  />
                  {/* User Complete Profile */}
                  <Route
                    path="/register/user/complete-profile"
                    element={<UserCompleteProfile />}
                  />

                  {/* ========== VENDOR REGISTRATION FLOW ========== */}

                  {/* Vendor Registration Entry */}
                  <Route
                    path="/register/vendor"
                    element={<VendorRegistration />}
                  />

                  {/* Vendor Process Steps */}
                  <Route
                    path="/register/vendor/process1"
                    element={<VendorProcess1 />}
                  />
                  <Route
                    path="/register/vendor/process2"
                    element={<VendorProcess2 />}
                  />
                  <Route
                    path="/register/vendor/process3"
                    element={<VendorProcess3 />}
                  />

                  {/* Vendor Complete Profile */}
                  <Route
                    path="/register/vendor/complete-profile"
                    element={<VendorCompleteProfile />}
                  />

                  {/* ========== 404 PAGE ========== */}
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
