import axios from "axios";

class ApiService {
  constructor() {
    // Fix the process.env reference
    const apiUrl =
      import.meta.env?.VITE_API_URL ||
      (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
      "/api";

    this.axios = axios.create({
      baseURL: apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token if available
    this.axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async register(userData) {
    try {
      const response = await this.axios.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      // Don't handle the error here - let components handle it
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await this.axios.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await this.axios.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ApiService();
