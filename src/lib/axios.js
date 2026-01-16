// lib/axios.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default axiosInstance;

const TOKEN_KEY = "auth-storage";

export const tokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null;
    const storage = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (!storage) return null;
    
    try {
      const parsed = JSON.parse(storage);
      return parsed?.state?.token || null;
    } catch {
      return null;
    }
  },
  set: (token, persist = true) => {
    if (typeof window === "undefined") return null;
    
    const storageData = persist ? localStorage : sessionStorage;
    const currentData = storageData.getItem(TOKEN_KEY);
    
    try {
      let data = currentData ? JSON.parse(currentData) : { state: {} };
      data.state.token = token;
      storageData.setItem(TOKEN_KEY, JSON.stringify(data));
      return data;
    } catch {
      return null;
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

    if (config.headers?.['Cache-Control']) {
      delete config.headers['Cache-Control'];
    }
    if (config.headers?.['cache-control']) {
      delete config.headers['cache-control'];
    }

    return config;
  },
  (err) => Promise.reject(err)
);

axiosInstance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      tokenStorage.remove();
      window.location.href = "/login";
    }

    if (err.code === 'ERR_NETWORK' || err.message?.includes('CORS')) {
      console.warn('CORS or network error detected. Check backend CORS configuration.');
    }

    return Promise.reject(err);
  }
);

export const apiRequest = async (method, url, data, config) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource.');
    } else if (error.response?.status === 404) {
      console.error('Not Found: The requested resource does not exist.');
    } else if (error.response?.status === 429) {
      console.error('Too Many Requests: Please slow down.');
    }
    
    throw error;
  }
};