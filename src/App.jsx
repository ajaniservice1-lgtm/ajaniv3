import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";

/* =======================
   LAZY-LOADED PAGES
======================= */
const HomePage = lazy(() => import("./pages/HomePage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const ContactPage = lazy(() => import("./pages/ContactUs"));
const AboutAjani = lazy(() => import("./pages/AboutAjani"));
const CategoryResults = lazy(() => import("./pages/CategoryResults"));
const SearchResults = lazy(() => import("./components/SearchResults"));
const VendorDetail = lazy(() => import("./pages/VendorDetail"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const HelpCenterPage = lazy(() => import("./pages/HelpCenter"));

/* =======================
   BOOKING PAGES
======================= */
const BookingPage = lazy(() => import("./pages/Booking/BookingPage"));
const BookingConfirmation = lazy(() => import("./pages/Booking/BookingConfirmation"));
const BookingFailed = lazy(() => import("./pages/Booking/BookingFailed"));

/* =======================
   AUTH PAGES
======================= */
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const RegisterChoicePage = lazy(() => import("./pages/auth/RegisterChoicePage"));
const VerifyOTPPage = lazy(() => import("./pages/auth/VerifyOTPPage"));

/* =======================
   USER REGISTRATION FLOW
======================= */
const UserRegistration = lazy(() => import("./pages/auth/registration/UserRegistration"));
// REMOVE UserProcess1-4 as requested
// const UserProcess1 = lazy(() => import("./pages/auth/registration/UserProcess1"));
// const UserProcess2 = lazy(() => import("./pages/auth/registration/UserProcess2"));
// const UserProcess3 = lazy(() => import("./pages/auth/registration/UserProcess3"));
// const UserProcess4 = lazy(() => import("./pages/auth/registration/UserProcess4"));

/* =======================
   VENDOR PAGES
======================= */
const VendorRegistration = lazy(() => import("./pages/auth/registration/VendorRegistration"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));

/* =======================
   PROTECTED PAGES
======================= */
const SavedListingsPage = lazy(() => import("./pages/SavedListingsPage"));
// Make sure this is the CORRECT UserProfilePage
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
  const userEmail = localStorage.getItem("user_email");
  
  console.log("checkAuthStatus - Checking authentication:", {
    token: !!token,
    userProfile: !!userProfile,
    userEmail: !!userEmail
  });
  
  if (token && userEmail) {
    console.log("checkAuthStatus - Auth passed: token + email");
    return true;
  }
  
  if (userProfile) {
    try {
      const parsed = JSON.parse(userProfile);
      const hasEmail = !!parsed.email;
      console.log("checkAuthStatus - User profile check:", { hasEmail, email: parsed.email });
      return hasEmail;
    } catch (error) {
      console.error("checkAuthStatus - Error parsing userProfile:", error);
      return false;
    }
  }
  
  const hasAnyAuthData = token || userEmail || userProfile;
  console.log("checkAuthStatus - Fallback check:", { hasAnyAuthData });
  
  return hasAnyAuthData;
};

const isUserVerified = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const verified = profile?.isVerified || false;
    console.log("isUserVerified - Check:", { verified, profile });
    return verified;
  } catch (error) {
    console.error("isUserVerified - Error:", error);
    return false;
  }
};

/* =======================
   ROUTE GUARDS
======================= */
const ProtectedRoute = ({ children, requireVerification = true }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  console.log("ProtectedRoute - Auth check:", {
    isAuthenticated,
    isVerified,
    requireVerification,
    path: window.location.pathname
  });

  if (!isAuthenticated) {
    console.log("ProtectedRoute - Not authenticated, redirecting to login");
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  if (requireVerification && !isVerified) {
    console.log("ProtectedRoute - Not verified, redirecting to OTP");
    return <Navigate to="/verify-otp" replace />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  console.log("PublicRoute - Check:", { isAuthenticated, isVerified });

  if (isAuthenticated && isVerified) {
    console.log("PublicRoute - Already authenticated and verified, redirecting home");
    return <Navigate to="/" replace />;
  }

  return children;
};

const OTPRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();
  const hasPendingEmail = localStorage.getItem("pendingVerificationEmail");

  console.log("OTPRoute - Check:", { isAuthenticated, isVerified, hasPendingEmail });

  if (isAuthenticated && isVerified) {
    console.log("OTPRoute - Already verified, redirecting home");
    return <Navigate to="/" replace />;
  }

  if (!hasPendingEmail && !isAuthenticated) {
    console.log("OTPRoute - No pending email and not authenticated, redirecting to register");
    return <Navigate to="/register" />;
  }

  return children;
};

/* =======================
   VENDOR ROUTE GUARD
======================= */
const VendorRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  console.log("VendorRoute - Check:", { isAuthenticated, isVerified });

  if (!isAuthenticated) {
    console.log("VendorRoute - Not authenticated, redirecting to login");
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    console.log("VendorRoute - Not verified, redirecting to OTP");
    return <Navigate to="/verify-otp" replace />;
  }

  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    console.log("VendorRoute - Profile role:", profile.role);
    
    if (profile.role !== "vendor") {
      console.log("VendorRoute - Not a vendor, redirecting home");
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("VendorRoute - Error checking role:", error);
    return <Navigate to="/" replace />;
  }

  console.log("VendorRoute - Access granted");
  return children;
};

/* =======================
   APP
======================= */
function App() {
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("auth_token");
      const userProfile = localStorage.getItem("userProfile");

      console.log("App - Initializing auth:", { token: !!token, userProfile: !!userProfile });

      if (token && userProfile) {
        try {
          const profile = JSON.parse(userProfile);
          console.log("App - Dispatching auth events for:", profile.email);
          
          setTimeout(() => {
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("authChange"));
            window.dispatchEvent(
              new CustomEvent("loginSuccess", {
                detail: { email: profile.email },
              })
            );
          }, 100);
        } catch (error) {
          console.error("App - Error parsing user profile:", error);
        }
      } else {
        console.log("App - No auth data found on initialization");
      }
    };

    initializeAuth();
  }, []);

  return (
    <>
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
                  <Route path="/help-center" element={<HelpCenterPage />} />
                  <Route path="/privacypage" element={<PrivacyPage />} />
                  <Route path="/termspage" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/contact-us" element={<ContactPage />} />
                  <Route path="/vendors" element={<VendorsPage />} />

                  {/* DYNAMIC ROUTES */}
                  <Route path="/vendor-detail/:id" element={<VendorDetail />} />
                  <Route path="/category/:category" element={<CategoryResults />} />
                  <Route path="/search-results" element={<SearchResults />} />

                  {/* BOOKING ROUTES */}
                  <Route path="/booking/:id" element={<BookingPage />} />
                  <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
                  <Route path="/booking-failed/:id" element={<BookingFailed />} />

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

                  {/* OTP VERIFICATION */}
                  <Route
                    path="/verify-otp"
                    element={
                      <OTPRoute>
                        <VerifyOTPPage />
                      </OTPRoute>
                    }
                  />

                  {/* USER REGISTRATION */}
                  <Route
                    path="/register/user"
                    element={
                      <PublicRoute>
                        <UserRegistration />
                      </PublicRoute>
                    }
                  />
                  {/* REMOVED UserProcess routes as requested */}

                  {/* VENDOR REGISTRATION */}
                  <Route
                    path="/register/vendor"
                    element={
                      <PublicRoute>
                        <VendorRegistration />
                      </PublicRoute>
                    }
                  />

                  {/* VENDOR DASHBOARD ROUTES */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <VendorRoute>
                        <VendorDashboard />
                      </VendorRoute>
                    }
                  />

                  {/* PROTECTED ROUTES - CRITICAL: Make sure these point to correct components */}
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
                      <ProtectedRoute requireVerification={false}>
                        <UserProfilePage />
                      </ProtectedRoute>
                    }
                  />

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