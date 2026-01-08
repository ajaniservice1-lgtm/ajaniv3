// services/axios.ts
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default axiosInstance;

const TOKEN_KEY = "auth-storage";

export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null;
    return (
      JSON.parse(localStorage.getItem(TOKEN_KEY))?.state?.token ||
      JSON.parse(sessionStorage.getItem(TOKEN_KEY))?.state?.token
    );
  },
  set: (token, persist = true) => {
    if (typeof window === "undefined") return;
    if (persist) {
      return (
        JSON.parse(localStorage.getItem(TOKEN_KEY)) ||
        JSON.parse(sessionStorage.getItem(TOKEN_KEY))
      );
    } else {
      return (
        JSON.parse(sessionStorage.getItem(TOKEN_KEY)) ||
        JSON.parse(sessionStorage.getItem(TOKEN_KEY))
      );
    }
  },
  remove: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    if (token) {
      if (isTokenExpired(token)) {
        tokenStorage.remove();
        window.location.href = "/login";
        return Promise.reject(new Error("Token has expired"));
      }

      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (err) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      tokenStorage.remove();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);