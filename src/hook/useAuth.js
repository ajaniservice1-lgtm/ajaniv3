import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const storedProfile = localStorage.getItem("userProfile");
    
    if (token && storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        setIsAuthenticated(true);
        setUserProfile(profile);
        return { isAuthenticated: true, profile };
      } catch (error) {
        setIsAuthenticated(false);
        setUserProfile(null);
        return { isAuthenticated: false, profile: null };
      }
    } else {
      setIsAuthenticated(false);
      setUserProfile(null);
      return { isAuthenticated: false, profile: null };
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("loginSuccess", handleAuthChange);
    window.addEventListener("logout", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("loginSuccess", handleAuthChange);
      window.removeEventListener("logout", handleAuthChange);
    };
  }, [checkAuth]);

  return {
    isAuthenticated,
    userProfile,
    checkAuth,
  };
};