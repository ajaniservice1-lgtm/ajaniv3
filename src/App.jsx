// src/App.js
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatProvider } from "./context/ChatContext";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import { ModalProvider } from "./context/ModalContext";
import MainLayout from "./components/MainLayout";

/* =======================
   CREATE QUERY CLIENT
======================= */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Set to true if you want auto-refresh
      retry: 1,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

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
   PROFILE PAGES
======================= */
const BuyerProfilePage = lazy(() => import("./pages/BuyerProfilePage"));
const VendorProfilePage = lazy(() => import("./pages/VendorProfilePage"));

/* =======================
   BOOKING PAGES
======================= */
const BookingRouter = lazy(() => import("./pages/Booking/BookingRouter"));
const HotelBooking = lazy(() => import("./pages/Booking/HotelBooking"));
const RestaurantBooking = lazy(() => import("./pages/Booking/RestaurantBooking"));
const ShortletBooking = lazy(() => import("./pages/Booking/ShortletBooking"));
const PaymentPage = lazy(() => import("./pages/Booking/PaymentPage"));
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
   ADMIN PAGES
======================= */
const Overview = lazy(() => import("./pages/admin/Overview"));

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
  
  if (token && userEmail) {
    return true;
  }
  
  if (userProfile) {
    try {
      const parsed = JSON.parse(userProfile);
      return !!parsed.email;
    } catch (error) {
      return false;
    }
  }
  
  const hasAnyAuthData = token || userEmail || userProfile;
  return hasAnyAuthData;
};

const isUserVerified = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    return profile?.isVerified || false;
  } catch (error) {
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
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  if (requireVerification && !isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  return children;
};

const BuyerRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  if (!isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const isBuyer = !profile.role || profile.role === "user" || profile.role === "buyer";
    
    if (!isBuyer) {
      return <Navigate to="/vendor/profile" replace />;
    }
  } catch (error) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const VendorRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  if (!isAuthenticated) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    
    if (profile.role !== "vendor") {
      return <Navigate to="/buyer/profile" replace />;
    }
  } catch (error) {
    return <Navigate to="/" replace />;
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

  if (isAuthenticated && isVerified) {
    return <Navigate to="/" replace />;
  }

  if (!hasPendingEmail && !isAuthenticated) {
    return <Navigate to="/register" />;
  }

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

      if (token && userProfile) {
        try {
          const profile = JSON.parse(userProfile);
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
          // Silent error handling
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LocalBusinessSchema />
      <ModalProvider>
        <ChatProvider>
          <BrowserRouter>
            <TrackingWrapper>
              <Suspense fallback={<LoadingDots />}>
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                  <Route path="/about" element={<MainLayout><AboutAjani /></MainLayout>} />
                  <Route path="/help-center" element={<MainLayout><HelpCenterPage /></MainLayout>} />
                  <Route path="/privacypage" element={<MainLayout><PrivacyPage /></MainLayout>} />
                  <Route path="/termspage" element={<MainLayout><TermsPage /></MainLayout>} />
                  <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
                  <Route path="/contact-us" element={<MainLayout><ContactPage /></MainLayout>} />
                  <Route path="/vendors" element={<MainLayout><VendorsPage /></MainLayout>} />

                  {/* DYNAMIC ROUTES */}
                  <Route path="/vendor-detail/:id" element={<MainLayout><VendorDetail /></MainLayout>} />
                  <Route path="/category/:category" element={<MainLayout><CategoryResults /></MainLayout>} />
                  <Route path="/search-results" element={<MainLayout><SearchResults /></MainLayout>} />

                  {/* BOOKING ROUTES */}
                  <Route 
                    path="/booking" 
                    element={
                      <ProtectedRoute>
                        <MainLayout><BookingRouter /></MainLayout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/booking/payment" 
                    element={
                      <ProtectedRoute>
                        <MainLayout><PaymentPage /></MainLayout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/booking-confirmation/:type?" 
                    element={
                      <ProtectedRoute>
                        <MainLayout><BookingConfirmation /></MainLayout>
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/booking-failed" 
                    element={
                      <ProtectedRoute>
                        <MainLayout><BookingFailed /></MainLayout>
                      </ProtectedRoute>
                    } 
                  />

                  {/* AUTH ROUTES */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <MainLayout><LoginPage /></MainLayout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PublicRoute>
                        <MainLayout><ResetPasswordPage /></MainLayout>
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <MainLayout><RegisterChoicePage /></MainLayout>
                      </PublicRoute>
                    }
                  />

                  {/* OTP VERIFICATION */}
                  <Route
                    path="/verify-otp"
                    element={
                      <OTPRoute>
                        <MainLayout><VerifyOTPPage /></MainLayout>
                      </OTPRoute>
                    }
                  />

                  {/* USER REGISTRATION */}
                  <Route
                    path="/register/user"
                    element={
                      <PublicRoute>
                        <MainLayout><UserRegistration /></MainLayout>
                      </PublicRoute>
                    }
                  />

                  {/* VENDOR REGISTRATION */}
                  <Route
                    path="/register/vendor"
                    element={
                      <PublicRoute>
                        <MainLayout><VendorRegistration /></MainLayout>
                      </PublicRoute>
                    }
                  />

                  {/* PROFILE ROUTES */}
                  <Route
                    path="/buyer/profile"
                    element={
                      <BuyerRoute>
                        <MainLayout><BuyerProfilePage /></MainLayout>
                      </BuyerRoute>
                    }
                  />
                  <Route
                    path="/vendor/profile"
                    element={
                      <VendorRoute>
                        <MainLayout><VendorProfilePage /></MainLayout>
                      </VendorRoute>
                    }
                  />

                  {/* VENDOR ROUTES */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <VendorRoute>
                        <MainLayout><VendorDashboard /></MainLayout>
                      </VendorRoute>
                    }
                  />
                  <Route
                    path="/vendor/complete-profile"
                    element={
                      <VendorRoute>
                        <MainLayout><VendorCompleteProfile /></MainLayout>
                      </VendorRoute>
                    }
                  />

                  {/* PROTECTED ROUTES */}
                  <Route
                    path="/saved"
                    element={
                      <ProtectedRoute>
                        <MainLayout><SavedListingsPage /></MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <MainLayout><NotificationsPage /></MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <MainLayout><ChatPage /></MainLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-business"
                    element={
                      <ProtectedRoute>
                        <MainLayout><AddBusinessPage /></MainLayout>
                      </ProtectedRoute>
                    }
                  />

                  {/* ADMIN ROUTES */}
                  <Route
                    path="/admincpanel"
                    element={
                      <Overview />
                    }
                  />

                  {/* 404 ROUTE */}
                  <Route
                    path="*"
                    element={
                      <MainLayout>
                        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
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
                      </MainLayout>
                    }
                  />
                </Routes>
              </Suspense>
            </TrackingWrapper>
          </BrowserRouter>
        </ChatProvider>
      </ModalProvider>
    </QueryClientProvider>
  );
}

export default App;