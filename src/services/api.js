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
      const response = await this.axios.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ApiService();
