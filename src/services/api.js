import axios from "axios";

class ApiService {
  constructor() {
    // Fix the process.env reference
    const apiUrl =
      import.meta.env?.VITE_API_URL ||
      (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
      "/api/v1";

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
      // CORRECT - Let axios handle JSON conversion
      const response = await this.axios.post("/auth/register", userData, {
        headers: {
          "Content-Type": "application/json",
          "X-HTTP-Method-Override": "POST",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials) {
    try {
      console.log("Sending login credentials:", credentials);

      const response = await this.axios.post("/auth/login", credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.log("Login error response:", error.response?.data);
      console.log("Login error status:", error.response?.status);
      throw error;
    }
  }

  async getUserProfile() {
    try {
      const response = await this.axios.get("/users/me");
      return response.data;
    } catch (error) {
      console.error("getUserProfile error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // If it's a 500 error, it's likely a server issue
      if (error.response?.status === 500) {
        console.warn("Server error (500) when fetching user profile. This may be a temporary server issue.");
      }
      
      throw error;
    }
  }

  // Check if user is authenticated locally (without API call)
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  // Get user data from localStorage (without API call)
  getLocalUser() {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing local user data:", error);
      return null;
    }
  }
}

export default new ApiService();
