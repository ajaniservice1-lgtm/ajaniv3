// services/axios.ts
import axios  from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default axiosInstance;

const TOKEN_KEY = "auth-storage";

// helper function to get the token from the local storage
export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null;
    console.log(
      JSON.parse(localStorage.getItem(TOKEN_KEY))?.state?.token ||
        JSON.parse(sessionStorage.getItem(TOKEN_KEY))?.state?.token
    );

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

// check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true; // if we cant decode consider it expire
  }
};

// request interceptor to add authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();

    // Check if token exists and is not expired
    if (token) {
      if (isTokenExpired(token)) {
        // whn token expire cancel request and redirect to login
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

// response interceptor yto handle token expiration
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // handle 401 unauthorised when token expired or invalid
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      //clear token from storage
      tokenStorage.remove();

      //redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

