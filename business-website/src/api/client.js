import axios from "axios";

// Uses the env variable in production, falls back to localhost for local dev
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default client;
