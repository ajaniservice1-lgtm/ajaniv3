import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";
import VendorDetail from "./pages/VendorDetail";
import { AdminLayout } from "./components/AdminLayout";
import Overview from "./pages/admin/Overview";

/* =======================
   LAZY-LOADED PAGES
======================= */
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AboutAjani = lazy(() => import("./pages/AboutAjani"));
const CategoryResults = lazy(() => import("./pages/CategoryResults"));
const SearchResults = lazy(() => import("./components/SearchResults"));

/* =======================
   AUTH PAGES
======================= */
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const RegisterChoicePage = lazy(() =>
  import("./pages/auth/RegisterChoicePage")
);
const VerifyOTPPage = lazy(() => import("./pages/auth/VerifyOTPPage"));

/* =======================
   USER REGISTRATION FLOW
======================= */
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

/* =======================
   VENDOR REGISTRATION FLOW
======================= */
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

/* =======================
   PROTECTED PAGES
======================= */
const SavedListingsPage = lazy(() => import("./pages/SavedListingsPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));

/* =======================
   LOADING UI
======================= */
const LoadingDots = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="flex space-x-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-600" />
      <span
        className="h-2 w-2 animate-bounce rounded-full bg-gray-600"
        style={{ animationDelay: "0.1s" }}
      />
      <span
        className="h-2 w-2 animate-bounce rounded-full bg-gray-600"
        style={{ animationDelay: "0.2s" }}
      />
    </div>
  </div>
);

/* =======================
   AUTH UTILITIES
======================= */
const checkAuthStatus = () => {
  const token = localStorage.getItem("auth_token");
  const userProfile = localStorage.getItem("userProfile");

  return !!token && !!userProfile;
};

const getUserEmail = () => localStorage.getItem("user_email");

const isUserVerified = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    return profile?.isVerified || false;
  } catch {
    return false;
  }
};

/* =======================
   ROUTE GUARDS
======================= */
const ProtectedRoute = ({ children, requireVerification = true }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  if (!isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  if (requireVerification && !isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  if (isAuthenticated && isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const OTPRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();
  const hasPendingEmail = localStorage.getItem("pendingVerificationEmail");

  // If user is already verified, redirect to home
  if (isAuthenticated && isVerified) {
    return <Navigate to="/" replace />;
  }

  // If no pending email and not authenticated, redirect to register
  if (!hasPendingEmail && !isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  return children;
};

/* =======================
   INITIAL AUTH SETUP
======================= */
const initializeAuth = () => {
  const token = localStorage.getItem("auth_token");
  const userProfile = localStorage.getItem("userProfile");

  if (token && userProfile) {
    try {
      const profile = JSON.parse(userProfile);

      // Dispatch initial auth event
      setTimeout(() => {
        window.dispatchEvent(new Event("authChange"));
        window.dispatchEvent(
          new CustomEvent("loginSuccess", {
            detail: { email: profile.email },
          })
        );
      }, 100);
    } catch (error) {
      // Silent error handling for profile parsing
    }
  }
};

/* =======================
   APP
======================= */
function App() {
  useEffect(() => {
    // Initialize auth state on app load
    initializeAuth();

    // Listen for auth changes from OTP verification, login, etc.
    const handleAuthChange = () => {
      // Auth change handler - no logging needed
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("loginSuccess", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("loginSuccess", handleAuthChange);
    };
  }, []);

  return (
    <>
      {/* SEO Schema */}
      <LocalBusinessSchema />

      <ModalProvider>
        <ChatProvider>
          <BrowserRouter>
            <TrackingWrapper>
              <Suspense fallback={<LoadingDots />}>
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutAjani />} />
                  <Route path="/privacypage" element={<PrivacyPage />} />
                  <Route path="/termspage" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />

                  {/* DYNAMIC ROUTES */}
                  <Route path="/vendor-detail/:id" element={<VendorDetail />} />
                  <Route
                    path="/category/:category"
                    element={<CategoryResults />}
                  />
                  <Route path="/search-results" element={<SearchResults />} />

                  {/* VENDOR PROFILE ROUTE */}
                  <Route
                    path="/vendor-profile"
                    element={<VendorCompleteProfile />}
                  />

                  {/* AUTH ROUTES */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicRoute>
                        <ResetPasswordPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <RegisterChoicePage />
                      </PublicRoute>
                    }
                  />

                  {/* OTP VERIFICATION ROUTE */}
                  <Route
                    path="/verify-otp"
                    element={
                      <OTPRoute>
                        <VerifyOTPPage />
                      </OTPRoute>
                    }
                  />

                  {/* USER REGISTRATION FLOW */}
                  <Route
                    path="/register/user"
                    element={
                      <PublicRoute>
                        <UserRegistration />
                      </PublicRoute>
                    }
                  />
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
                  <Route
                    path="/register/user/complete-profile"
                    element={
                      <PublicRoute>
                        <UserCompleteProfile />
                      </PublicRoute>
                    }
                  />

                  {/* VENDOR REGISTRATION FLOW */}
                  <Route
                    path="/register/vendor"
                    element={
                      <PublicRoute>
                        <VendorRegistration />
                      </PublicRoute>
                    }
                  />
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
                  <Route
                    path="/register/vendor/complete-profile"
                    element={
                      <PublicRoute>
                        <VendorCompleteProfile />
                      </PublicRoute>
                    }
                  />

                  {/* PROTECTED ROUTES */}
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <SavedListingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* ADMIN ROUTES */}
                  <Route path="/admincpanel" element={<AdminLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="customers" element={<p>Customers</p>} />
                    <Route path="vendors" element={<p>Vendors</p>} />
                  </Route>

                  {/* 404 ROUTE */}
                  <Route
                    path="*"
                    element={
                      <div className="flex min-h-screen items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <h1 className="mb-4 text-4xl font-bold">404</h1>
                          <p className="mb-6 text-gray-600">Page not found</p>
                          <a
                            href="/"
                            className="font-medium text-cyan-500 hover:text-cyan-400"
                          >
                            Return Home
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
