import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TrackingWrapper from "./components/TrackingWrapper";
import LocalBusinessSchema from "./components/LocalBusinessSchema";
import MainLayout from "./components/MainLayout";

// Import storage patch
import { initUserStorage, patchLocalStorage } from "./utils/storagePatch";

// Import Global Logout Toast
import GlobalLogoutToast from "./components/GlobalLogoutToast";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardOverView from "./pages/admin/DashboardOverView";

/* =======================
   CREATE QUERY CLIENT
======================= */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
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
const RestaurantBooking = lazy(
  () => import("./pages/Booking/RestaurantBooking"),
);
const ShortletBooking = lazy(() => import("./pages/Booking/ShortletBooking"));
const EventBooking = lazy(() => import("./pages/Booking/EventBooking"));
const ServiceBooking = lazy(() => import("./pages/Booking/ServiceBooking"));
const PaymentPage = lazy(() => import("./pages/Booking/PaymentPage"));
const BookingConfirmation = lazy(
  () => import("./pages/Booking/BookingConfirmation"),
);
const BookingFailed = lazy(() => import("./pages/Booking/BookingFailed"));

/* =======================
   BOOKING MANAGEMENT PAGES
======================= */
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const BookingDetailsPage = lazy(() => import("./pages/BookingDetailsPage"));

/* =======================
   AUTH PAGES
======================= */
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const RegisterChoicePage = lazy(
  () => import("./pages/auth/RegisterChoicePage"),
);
const VerifyOTPPage = lazy(() => import("./pages/auth/VerifyOTPPage"));

/* =======================
   USER REGISTRATION FLOW
======================= */
const UserRegistration = lazy(
  () => import("./pages/auth/registration/UserRegistration"),
);

/* =======================
   VENDOR PAGES
======================= */
const VendorRegistration = lazy(
  () => import("./pages/auth/registration/VendorRegistration"),
);
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorCompleteProfile = lazy(
  () => import("./pages/auth/registration/VendorCompleteProfile"),
);

/* =======================
   PROTECTED PAGES
======================= */
const SavedListingsPage = lazy(() => import("./pages/SavedListingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));

/* =======================
   ADMIN PAGES
======================= */
const Overview = lazy(() => import("./pages/admin/Overview"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const VendorControl = lazy(() => import("./pages/admin/VendorControl"));
const ListingsControl = lazy(() => import("./pages/admin/ListingsControl"));
const BookingControl = lazy(() => import("./pages/admin/BookingControl"));
const MessagesControl = lazy(() => import("./pages/admin/MessagesControl"));
const ReviewsControl = lazy(() => import("./pages/admin/ReviewsControl"));
const AIControl = lazy(() => import("./pages/admin/AIControl"));
const SystemControl = lazy(() => import("./pages/admin/SystemControl"));
const SecurityControl = lazy(() => import("./pages/admin/SecurityControl"));
const AutomationControl = lazy(() => import("./pages/admin/AutomationControl"));
const DataControl = lazy(() => import("./pages/admin/DataControl"));

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
   LOGOUT DETECTION SYSTEM
======================= */
const initLogoutDetection = () => {
  const checkAuthStatus = () => {
    const token = localStorage.getItem("auth_token");
    const userProfile = localStorage.getItem("userProfile");
    const userEmail = localStorage.getItem("user_email");

    return !!(token && userEmail) || !!userProfile;
  };

  let lastAuthStatus = checkAuthStatus();
  let activityTimer = null;

  const resetActivityTimer = () => {
    if (activityTimer) clearTimeout(activityTimer);

    activityTimer = setTimeout(
      () => {
        if (lastAuthStatus) {
          window.dispatchEvent(
            new CustomEvent("system-logout", {
              detail: {
                reason: "session expired",
                message:
                  "Your session has expired due to inactivity. Please login again.",
                timestamp: new Date().toISOString(),
              },
            }),
          );

          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_email");
          localStorage.removeItem("userProfile");

          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("logout"));
        }
      },
      30 * 60 * 1000,
    );
  };

  const handleUserActivity = () => {
    if (lastAuthStatus) {
      resetActivityTimer();
    }
  };

  const monitorAuthChanges = () => {
    const currentAuthStatus = checkAuthStatus();

    if (lastAuthStatus && !currentAuthStatus) {
      setTimeout(() => {
        const wasManual = localStorage.getItem("logout_manual") === "true";

        if (wasManual) {
          window.dispatchEvent(new Event("manual-logout"));
          localStorage.removeItem("logout_manual");
        } else {
          window.dispatchEvent(
            new CustomEvent("system-logout", {
              detail: {
                reason: "token_expired",
                message: "Your session has ended. Please login again.",
                timestamp: new Date().toISOString(),
              },
            }),
          );
        }
      }, 100);
    }

    lastAuthStatus = currentAuthStatus;

    if (currentAuthStatus) {
      resetActivityTimer();
    } else {
      if (activityTimer) clearTimeout(activityTimer);
    }
  };

  const storageChangeCheck = setInterval(monitorAuthChanges, 1000);

  const handleStorageChange = (e) => {
    if (
      e.key === "auth_token" ||
      e.key === "userProfile" ||
      e.key === "user_email"
    ) {
      monitorAuthChanges();
    }
  };

  window.addEventListener("storage", handleStorageChange);

  ["mousedown", "keydown", "scroll", "touchstart", "click"].forEach((event) => {
    window.addEventListener(event, handleUserActivity, { passive: true });
  });

  monitorAuthChanges();
  resetActivityTimer();

  return () => {
    clearInterval(storageChangeCheck);
    if (activityTimer) clearTimeout(activityTimer);
    window.removeEventListener("storage", handleStorageChange);
    ["mousedown", "keydown", "scroll", "touchstart", "click"].forEach(
      (event) => {
        window.removeEventListener(event, handleUserActivity);
      },
    );
  };
};

/* =======================
   API ERROR DETECTION
======================= */
const initApiErrorDetection = () => {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);

      if (response.status === 401) {
        const url = args[0]?.url || args[0] || "";

        if (
          !url.includes("/login") &&
          !url.includes("/register") &&
          !url.includes("/verify")
        ) {
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("auth-error", {
                detail: {
                  type: "api_unauthorized",
                  message: "Your session has expired. Please login again.",
                  url: url,
                  timestamp: new Date().toISOString(),
                },
              }),
            );
          }, 500);
        }
      }

      if (response.status === 403) {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("auth-error", {
              detail: {
                type: "api_forbidden",
                message: "Access denied. Your session may have expired.",
                timestamp: new Date().toISOString(),
              },
            }),
          );
        }, 500);
      }

      return response;
    } catch (error) {
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        window.dispatchEvent(
          new CustomEvent("auth-error", {
            detail: {
              type: "network_error",
              message: "Network error. Please check your connection.",
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }

      throw error;
    }
  };

  const OriginalXMLHttpRequest = window.XMLHttpRequest;

  if (OriginalXMLHttpRequest) {
    window.XMLHttpRequest = class extends OriginalXMLHttpRequest {
      open(method, url, async, user, password) {
        this._url = url;
        super.open(method, url, async, user, password);
      }

      set onreadystatechange(handler) {
        super.onreadystatechange = (event) => {
          if (this.readyState === 4) {
            if (this.status === 401 || this.status === 403) {
              if (
                !this._url?.includes("/login") &&
                !this._url?.includes("/register")
              ) {
                setTimeout(() => {
                  window.dispatchEvent(
                    new CustomEvent("auth-error", {
                      detail: {
                        type:
                          this.status === 401
                            ? "xhr_unauthorized"
                            : "xhr_forbidden",
                        message: "Session expired. Please login again.",
                        timestamp: new Date().toISOString(),
                      },
                    }),
                  );
                }, 500);
              }
            }
          }

          if (handler) handler(event);
        };
      }
    };
  }
};

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
    } catch {
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
    localStorage.setItem(
      "redirectAfterLogin",
      window.location.pathname + window.location.search,
    );
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
    localStorage.setItem(
      "redirectAfterLogin",
      window.location.pathname + window.location.search,
    );
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  try {
    const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const isBuyer =
      !profile.role || profile.role === "user" || profile.role === "buyer";

    if (!isBuyer) {
      return <Navigate to="/vendor/profile" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }

  return children;
};

const VendorRoute = ({ children }) => {
  const isAuthenticated = checkAuthStatus();
  const isVerified = isUserVerified();

  if (!isAuthenticated) {
    localStorage.setItem(
      "redirectAfterLogin",
      window.location.pathname + window.location.search,
    );
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
  } catch {
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
    // 1. Initialize user storage system
    patchLocalStorage();
    initUserStorage();

    // 2. Initialize logout detection system
    const cleanupLogoutDetection = initLogoutDetection();

    // 3. Initialize API error detection in production
    if (process.env.NODE_ENV === "production") {
      initApiErrorDetection();
    }

    // 4. Initialize auth
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
                detail: {
                  email: profile.email,
                  name: profile.firstName,
                  role: profile.role,
                  timestamp: new Date().toISOString(),
                },
              }),
            );
          }, 100);
        } catch {
          // Silent error handling
        }
      }
    };

    initializeAuth();

    // 5. Listen for beforeunload
    const handleBeforeUnload = () => {};

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 6. Global error handler
    const handleGlobalError = (event) => {
      if (
        event.error &&
        event.error.message &&
        event.error.message.includes("auth")
      ) {
        window.dispatchEvent(
          new CustomEvent("auth-error", {
            detail: {
              type: "global_error",
              message:
                "An authentication error occurred. Please try logging in again.",
              error: event.error.message,
              timestamp: new Date().toISOString(),
            },
          }),
        );
      }
    };

    window.addEventListener("error", handleGlobalError);

    return () => {
      cleanupLogoutDetection();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LocalBusinessSchema />

      <GlobalLogoutToast />

      <BrowserRouter>
        <TrackingWrapper>
          <Suspense fallback={<LoadingDots />}>
            <Routes>
              <Route
                path="/"
                element={
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <MainLayout>
                    <AboutAjani />
                  </MainLayout>
                }
              />
              <Route
                path="/help-center"
                element={
                  <MainLayout>
                    <HelpCenterPage />
                  </MainLayout>
                }
              />
              <Route
                path="/privacy"
                element={
                  <MainLayout>
                    <PrivacyPage />
                  </MainLayout>
                }
              />
              <Route
                path="/terms-service"
                element={
                  <MainLayout>
                    <TermsPage />
                  </MainLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <MainLayout>
                    <ContactPage />
                  </MainLayout>
                }
              />
              <Route
                path="/contact-us"
                element={
                  <MainLayout>
                    <ContactPage />
                  </MainLayout>
                }
              />

              <Route
                path="/hotel"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />
              <Route
                path="/restaurant"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />
              <Route
                path="/shortlet"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />
              <Route
                path="/event"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />
              <Route
                path="/service"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />
              <Route
                path="/services"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />

              <Route
                path="/vendor"
                element={
                  <MainLayout>
                    <VendorsPage />
                  </MainLayout>
                }
              />

              <Route
                path="/category/:category"
                element={
                  <MainLayout>
                    <CategoryResults />
                  </MainLayout>
                }
              />

              <Route
                path="/vendor-detail/:id"
                element={
                  <MainLayout>
                    <VendorDetail />
                  </MainLayout>
                }
              />

              <Route
                path="/search-results"
                element={
                  <MainLayout>
                    <SearchResults />
                  </MainLayout>
                }
              />

              <Route
                path="/:seoSlug"
                element={
                  <MainLayout>
                    <SearchResults />
                  </MainLayout>
                }
              />

              <Route
                path="/booking"
                element={
                  <MainLayout>
                    <BookingRouter />
                  </MainLayout>
                }
              />

              <Route
                path="/booking/hotel"
                element={
                  <MainLayout>
                    <HotelBooking />
                  </MainLayout>
                }
              />
              <Route
                path="/booking/restaurant"
                element={
                  <MainLayout>
                    <RestaurantBooking />
                  </MainLayout>
                }
              />
              <Route
                path="/booking/shortlet"
                element={
                  <MainLayout>
                    <ShortletBooking />
                  </MainLayout>
                }
              />
              <Route
                path="/booking/event"
                element={
                  <MainLayout>
                    <EventBooking />
                  </MainLayout>
                }
              />
              <Route
                path="/booking/service"
                element={
                  <MainLayout>
                    <ServiceBooking />
                  </MainLayout>
                }
              />

              <Route
                path="/booking/payment"
                element={
                  <MainLayout>
                    <PaymentPage />
                  </MainLayout>
                }
              />

              <Route
                path="/booking-confirmation/:type?"
                element={
                  <MainLayout>
                    <BookingConfirmation />
                  </MainLayout>
                }
              />

              <Route
                path="/booking-failed"
                element={
                  <MainLayout>
                    <BookingFailed />
                  </MainLayout>
                }
              />

              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BookingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-details/:reference"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <BookingDetailsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <MainLayout>
                      <LoginPage />
                    </MainLayout>
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <MainLayout>
                      <ResetPasswordPage />
                    </MainLayout>
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <MainLayout>
                      <RegisterChoicePage />
                    </MainLayout>
                  </PublicRoute>
                }
              />

              <Route
                path="/verify-otp"
                element={
                  <OTPRoute>
                    <MainLayout>
                      <VerifyOTPPage />
                    </MainLayout>
                  </OTPRoute>
                }
              />

              <Route
                path="/register/user"
                element={
                  <PublicRoute>
                    <MainLayout>
                      <UserRegistration />
                    </MainLayout>
                  </PublicRoute>
                }
              />

              <Route
                path="/register/vendor"
                element={
                  <PublicRoute>
                    <MainLayout>
                      <VendorRegistration />
                    </MainLayout>
                  </PublicRoute>
                }
              />

              <Route
                path="/buyer/profile"
                element={
                  <BuyerRoute>
                    <MainLayout>
                      <BuyerProfilePage />
                    </MainLayout>
                  </BuyerRoute>
                }
              />
              <Route
                path="/vendor/profile"
                element={
                  <VendorRoute>
                    <MainLayout>
                      <VendorProfilePage />
                    </MainLayout>
                  </VendorRoute>
                }
              />

              <Route
                path="/vendor/dashboard"
                element={
                  <VendorRoute>
                    <VendorDashboard />
                  </VendorRoute>
                }
              />
              <Route
                path="/vendor/complete-profile"
                element={
                  <VendorRoute>
                    <MainLayout>
                      <VendorCompleteProfile />
                    </MainLayout>
                  </VendorRoute>
                }
              />

              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SavedListingsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <NotificationsPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ChatPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-business"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AddBusinessPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="/admincpanel" element={<AdminLayout />}>
                <Route index element={<DashboardOverView />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="vendors" element={<VendorControl />} />
                <Route path="listings" element={<ListingsControl />} />
                <Route path="bookings" element={<BookingControl />} />
                <Route path="messages" element={<MessagesControl />} />
                <Route path="reviews" element={<ReviewsControl />} />
                <Route path="ai-control" element={<AIControl />} />
                <Route path="system-control" element={<SystemControl />} />
                <Route path="security" element={<SecurityControl />} />
                <Route path="automation" element={<AutomationControl />} />
                <Route path="data-control" element={<DataControl />} />
              </Route>
              <Route path="/admincpanel/login" element={<AdminLogin />} />

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
    </QueryClientProvider>
  );
}

export default App;
