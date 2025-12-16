import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage")); // ADDED
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
// FIXED: UserProcess3 should be the personalization step, not SavedListingsPage
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

// PROTECTED ROUTES (Require Login)
const SavedListingsPage = lazy(() => import("./pages/SavedListingsPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

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

// ========== AUTH UTILITY FUNCTIONS ==========
export const checkLoginStatus = () => {
  return localStorage.getItem("ajani_dummy_login") === "true";
};

export const getUserEmail = () => {
  return localStorage.getItem("ajani_dummy_email") || null;
};

export const logoutUser = () => {
  localStorage.removeItem("ajani_dummy_login");
  localStorage.removeItem("ajani_dummy_email");
  localStorage.removeItem("userSavedListings");
  localStorage.removeItem("pendingSaveItem");
  localStorage.removeItem("redirectAfterLogin");
};

export const loginUser = (email) => {
  localStorage.setItem("ajani_dummy_login", "true");
  localStorage.setItem("ajani_dummy_email", email);
};

// ========== PROTECTED ROUTE COMPONENT ==========
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = checkLoginStatus();

  if (!isAuthenticated) {
    // Store the current URL for redirect after login
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ========== PUBLIC ROUTE COMPONENT (Redirects if already logged in) ==========
const PublicRoute = ({ children }) => {
  const isAuthenticated = checkLoginStatus();

  if (isAuthenticated) {
    // If already logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
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
                  {/* ========== PUBLIC ROUTES ========== */}

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

                  {/* ========== AUTHENTICATION ROUTES (Public Only) ========== */}

                  {/* Login Page - Redirects if already logged in */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />

                  {/* Reset Password Page - ADDED */}
                  <Route
                    path="/reset-password"
                    element={
                      <PublicRoute>
                        <ResetPasswordPage />
                      </PublicRoute>
                    }
                  />

                  {/* Registration Choice Page */}
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterChoicePage />
                      </PublicRoute>
                    }
                  />

                  {/* ========== USER REGISTRATION FLOW ========== */}

                  {/* User Registration Entry */}
                  <Route
                    path="/register/user"
                    element={
                      <PublicRoute>
                        <UserRegistration />
                      </PublicRoute>
                    }
                  />

                  {/* User Process Steps */}
                  <Route
                    path="/register/user/process1"
                    element={
                      <PublicRoute>
                        <UserProcess1 />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register/user/process2"
                    element={
                      <PublicRoute>
                        <UserProcess2 />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register/user/process3"
                    element={
                      <PublicRoute>
                        <UserProcess3 />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register/user/process4"
                    element={
                      <PublicRoute>
                        <UserProcess4 />
                      </PublicRoute>
                    }
                  />
                  {/* User Complete Profile */}
                  <Route
                    path="/register/user/complete-profile"
                    element={
                      <PublicRoute>
                        <UserCompleteProfile />
                      </PublicRoute>
                    }
                  />

                  {/* ========== VENDOR REGISTRATION FLOW ========== */}

                  {/* Vendor Registration Entry */}
                  <Route
                    path="/register/vendor"
                    element={
                      <PublicRoute>
                        <VendorRegistration />
                      </PublicRoute>
                    }
                  />

                  {/* Vendor Process Steps */}
                  <Route
                    path="/register/vendor/process1"
                    element={
                      <PublicRoute>
                        <VendorProcess1 />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register/vendor/process2"
                    element={
                      <PublicRoute>
                        <VendorProcess2 />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register/vendor/process3"
                    element={
                      <PublicRoute>
                        <VendorProcess3 />
                      </PublicRoute>
                    }
                  />

                  {/* Vendor Complete Profile */}
                  <Route
                    path="/register/vendor/complete-profile"
                    element={
                      <PublicRoute>
                        <VendorCompleteProfile />
                      </PublicRoute>
                    }
                  />

                  {/* ========== PROTECTED ROUTES (Require Login) ========== */}

                  {/* Saved Listings Page - PROTECTED */}
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <SavedListingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* User Profile Page - PROTECTED */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
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
