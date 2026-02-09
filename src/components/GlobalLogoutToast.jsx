import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, CheckCircle, AlertCircle, Info } from "lucide-react";
import { FaTimes } from "react-icons/fa";

/**
 * Global Logout Toast Component
 * Shows automatic logout notifications when system detects logout
 */
const GlobalLogoutToast = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [autoLogoutReason, setAutoLogoutReason] = useState("");

  useEffect(() => {
    // Handle system-triggered logout events
    const handleSystemLogout = (event) => {
      const reason = event.detail?.reason || "session expired";
      const message = event.detail?.message || 
        `You have been logged out${reason === "session expired" ? " due to inactivity" : ""}.`;
      
      setAutoLogoutReason(reason);
      setMessage(message);
      setToastType("warning");
      setIsVisible(true);
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 8000);
    };

    // Handle manual logout
    const handleManualLogout = () => {
      setMessage("You have been successfully logged out");
      setToastType("success");
      setAutoLogoutReason("manual");
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // Handle authentication errors
    const handleAuthError = (event) => {
      const errorType = event.detail?.type || "auth_error";
      const errorMessage = event.detail?.message || "Authentication failed. Please login again.";
      
      setMessage(errorMessage);
      setToastType("error");
      setAutoLogoutReason(errorType);
      setIsVisible(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Listen for logout events
    window.addEventListener("system-logout", handleSystemLogout);
    window.addEventListener("manual-logout", handleManualLogout);
    window.addEventListener("auth-error", handleAuthError);

    return () => {
      window.removeEventListener("system-logout", handleSystemLogout);
      window.removeEventListener("manual-logout", handleManualLogout);
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, []);

  // Handle toast close
  const handleClose = () => {
    setIsVisible(false);
  };

  // Get icon based on toast type
  const getIcon = () => {
    switch (toastType) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Get icon color based on type
  const getIconColor = () => {
    switch (toastType) {
      case "success":
        return "#34C759";
      case "error":
        return "#FF3B30";
      case "warning":
        return "#FF9500";
      default:
        return "#007AFF";
    }
  };

  // Get action button text
  const getActionText = () => {
    if (autoLogoutReason === "session expired") {
      return "Login Again";
    }
    if (toastType === "error") {
      return "Retry";
    }
    return "Login";
  };

  // Handle action button click
  const handleAction = () => {
    setIsVisible(false);
    window.location.href = "/login";
  };

  // Only render in browser
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute top-4 right-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-xl shadow-lg max-w-sm w-full overflow-hidden border border-gray-200"
              style={{
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                minWidth: "240px"
              }}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm text-[#1C1C1E] font-['-apple-system', 'BlinkMacSystemFont', 'Segoe_UI', 'Roboto', 'sans-serif']">
                        {toastType === "success" ? "Logged Out" : 
                         toastType === "warning" ? "Session Ended" : 
                         "Authentication Error"}
                      </h3>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-sm p-1"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                    <p className="text-[#1C1C1E] text-sm mb-3 font-['-apple-system', 'BlinkMacSystemFont', 'Segoe_UI', 'Roboto', 'sans-serif']">
                      {message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {autoLogoutReason && (
                          <span className="capitalize">Reason: {autoLogoutReason.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAction}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 font-['-apple-system', 'BlinkMacSystemFont', 'Segoe_UI', 'Roboto', 'sans-serif']"
                        >
                          {getActionText()}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className="h-1 bg-gray-300"
              />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GlobalLogoutToast;