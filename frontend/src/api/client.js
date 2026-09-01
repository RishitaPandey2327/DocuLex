import axios from "axios";

// Backend ka base URL - .env file me VITE_API_URL set kar sakte ho agar backend
// kisi aur port/domain par host ho. Default local dev backend hai.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Har request ke saath agar token localStorage me hai to automatically attach kar do,
// taaki har jagah manually header likhne ki zaroorat na pade
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("doculex_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
