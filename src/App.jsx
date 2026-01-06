import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";
import Header from "./components/Header";

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
const AddBusinessPage = lazy(() => import("./pages/AddBusinessPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));

/* =======================
   NEW COMPONENTS - Replaced ChatPopupAd with ComingSoonModal
======================= */
const ComingSoonModal = lazy(() => import("./components/ComingSoonModal"));

/* =======================
   PROFILE PAGES
======================= */
const BuyerProfilePage = lazy(() => import("./pages/BuyerProfilePage"));
const VendorProfilePage = lazy(() => import("./pages/VendorProfilePage"));

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

/* =======================
   VENDOR PAGES
======================= */
const VendorRegistration = lazy(() => import("./pages/auth/registration/VendorRegistration"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorCompleteProfile = lazy(() => import("./pages/auth/registration/VendorCompleteProfile"));

/* =======================
   PROTECTED PAGES
======================= */
const SavedListingsPage = lazy(() => import("./pages/SavedListingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

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

const BuyerRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  console.log("BuyerRoute - Check:", { isAuthenticated, isVerified });

  if (!isAuthenticated) {
    console.log("BuyerRoute - Not authenticated, redirecting to login");
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    console.log("BuyerRoute - Not verified, redirecting to OTP");
    return <Navigate to="/verify-otp" replace />;
  }

  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    console.log("BuyerRoute - Profile role:", profile.role);
    
    // Check if user is a buyer (role is "user" or "buyer" or undefined for backward compatibility)
    const isBuyer = !profile.role || profile.role === "user" || profile.role === "buyer";
    
    if (!isBuyer) {
      console.log("BuyerRoute - Not a buyer, redirecting to vendor profile");
      return <Navigate to="/vendor/profile" replace />;
    }
  } catch (error) {
    console.error("BuyerRoute - Error checking role:", error);
    return <Navigate to="/" replace />;
  }

  console.log("BuyerRoute - Access granted");
  return children;
};

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
      console.log("VendorRoute - Not a vendor, redirecting to buyer profile");
      return <Navigate to="/buyer/profile" replace />;
    }
  } catch (error) {
    console.error("VendorRoute - Error checking role:", error);
    return <Navigate to="/" replace />;
  }

  console.log("VendorRoute - Access granted");
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
   LAYOUT COMPONENT
======================= */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      {/* Removed ChatPopupAd - ComingSoonModal will show globally */}
    </div>
  );
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
                {/* ComingSoonModal shows globally on ALL pages */}
                <ComingSoonModal />
                
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route path="/" element={<Layout><HomePage /></Layout>} />
                  <Route path="/about" element={<Layout><AboutAjani /></Layout>} />
                  <Route path="/help-center" element={<Layout><HelpCenterPage /></Layout>} />
                  <Route path="/privacypage" element={<Layout><PrivacyPage /></Layout>} />
                  <Route path="/termspage" element={<Layout><TermsPage /></Layout>} />
                  <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                  <Route path="/contact-us" element={<Layout><ContactPage /></Layout>} />
                  <Route path="/vendors" element={<Layout><VendorsPage /></Layout>} />

                  {/* DYNAMIC ROUTES */}
                  <Route path="/vendor-detail/:id" element={<Layout><VendorDetail /></Layout>} />
                  <Route path="/category/:category" element={<Layout><CategoryResults /></Layout>} />
                  <Route path="/search-results" element={<Layout><SearchResults /></Layout>} />

                  {/* BOOKING ROUTES */}
                  <Route path="/booking/:id" element={<Layout><BookingPage /></Layout>} />
                  <Route path="/booking-confirmation/:id" element={<Layout><BookingConfirmation /></Layout>} />
                  <Route path="/booking-failed/:id" element={<Layout><BookingFailed /></Layout>} />

                  {/* AUTH ROUTES */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Layout><LoginPage /></Layout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicRoute>
                        <Layout><ResetPasswordPage /></Layout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Layout><RegisterChoicePage /></Layout>
                      </PublicRoute>
                    }
                  />

                  {/* OTP VERIFICATION */}
                  <Route
                    path="/verify-otp"
                    element={
                      <OTPRoute>
                        <Layout><VerifyOTPPage /></Layout>
                      </OTPRoute>
                    }
                  />

                  {/* USER REGISTRATION */}
                  <Route
                    path="/register/user"
                    element={
                      <PublicRoute>
                        <Layout><UserRegistration /></Layout>
                      </PublicRoute>
                    }
                  />

                  {/* VENDOR REGISTRATION */}
                  <Route
                    path="/register/vendor"
                    element={
                      <PublicRoute>
                        <Layout><VendorRegistration /></Layout>
                      </PublicRoute>
                    }
                  />

                  {/* PROFILE ROUTES */}
                  <Route
                    path="/buyer/profile"
                    element={
                      <BuyerRoute>
                        <Layout><BuyerProfilePage /></Layout>
                      </BuyerRoute>
                    }
                  />
                  <Route
                    path="/vendor/profile"
                    element={
                      <VendorRoute>
                        <Layout><VendorProfilePage /></Layout>
                      </VendorRoute>
                    }
                  />

                  {/* VENDOR ROUTES */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <VendorRoute>
                        <Layout><VendorDashboard /></Layout>
                      </VendorRoute>
                    }
                  />
                  <Route
                    path="/vendor/complete-profile"
                    element={
                      <VendorRoute>
                        <Layout><VendorCompleteProfile /></Layout>
                      </VendorRoute>
                    }
                  />

                  {/* PROTECTED ROUTES */}
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <Layout><SavedListingsPage /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Layout><NotificationsPage /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <div className="min-h-screen bg-white">
                          <Header />
                          <main className="pt-16">
                            <ChatPage />
                          </main>
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-business"
                    element={
                      <ProtectedRoute>
                        <Layout><AddBusinessPage /></Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 ROUTE */}
                  <Route
                    path="*"
                    element={
                      <Layout>
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
                      </Layout>
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