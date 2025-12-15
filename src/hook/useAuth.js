// Create a useAuth hook (create a new file: src/hooks/useAuth.js)
import { useState, useEffect } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    checkAuthStatus();

    // Listen for auth changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const checkAuthStatus = () => {
    const loggedIn = localStorage.getItem("ajani_dummy_login") === "true";
    const email = localStorage.getItem("ajani_dummy_email");
    setIsAuthenticated(loggedIn);
    setUserEmail(email);
  };

  const login = (email) => {
    localStorage.setItem("ajani_dummy_login", "true");
    localStorage.setItem("ajani_dummy_email", email);
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("ajani_dummy_login");
    localStorage.removeItem("ajani_dummy_email");
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return {
    isAuthenticated,
    userEmail,
    login,
    logout,
    checkAuthStatus,
  };
};
