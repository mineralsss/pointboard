import axios from "axios";

class ApiService {
  constructor() {
    // Fix the process.env reference
    const apiUrl = "http://localhost:3000/api/v1"
      // import.meta.env?.VITE_API_URL ||
      // (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
      // "/api/v1";

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
        // Return a graceful fallback instead of throwing
        return {
          success: false,
          message: "Server temporarily unavailable. Using cached user data.",
          error: "SERVER_ERROR"
        };
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

  async verifyEmail(token) {
    try {
      const response = await this.axios.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      console.error("verifyEmail error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Password Reset Methods
  async forgotPassword(email) {
    try {
      const response = await this.axios.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      console.error("forgotPassword error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Code-based password reset (existing functionality)
  async resetPasswordWithCode(email, resetCode, newPassword) {
    try {
      const response = await this.axios.post("/auth/reset-password", {
        email,
        resetCode,
        newPassword
      });
      
      // If backend returns auth data after reset, we should NOT store it
      // because the user should login manually with their new password
      if (response.data?.token || response.data?.accessToken) {
        console.log("Backend returned auth token after password reset, but we'll ignore it");
        // Remove any auth data to force proper login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      
      return response.data;
    } catch (error) {
      console.error("resetPasswordWithCode error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Link-based password reset (new functionality)
  async resetPasswordWithToken(token, newPassword) {
    try {
      const response = await this.axios.post(`/auth/reset-password/${token}`, {
        newPassword
      });
      
      // If backend returns auth data after reset, we should NOT store it
      // because the user should login manually with their new password
      if (response.data?.token || response.data?.accessToken) {
        console.log("Backend returned auth token after password reset, but we'll ignore it");
        // Remove any auth data to force proper login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      
      return response.data;
    } catch (error) {
      console.error("resetPasswordWithToken error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Order Management Methods
  async createOrder(orderData) {
    try {
      const response = await this.axios.post("/allorders", orderData);
      return response.data;
    } catch (error) {
      console.error("createOrder error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async createGuestOrder(orderData) {
    try {
      const response = await this.axios.post("/orders/guest", orderData);
      return response.data;
    } catch (error) {
      console.error("createGuestOrder error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async getMyOrders() {
    try {
      const response = await this.axios.get("/orders/my-orders");
      return response.data;
    } catch (error) {
      console.error("getMyOrders error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async getOrderByReference(orderRef) {
    try {
      const response = await this.axios.get(`/orders/ref/${orderRef}`);
      return response.data;
    } catch (error) {
      console.error("getOrderByReference error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.axios.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("updateOrderStatus error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Admin Methods
  async getAllOrders(page = 1, limit = 10) {
    try {
      const response = await this.axios.get(`/orders/all?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("getAllOrders error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const response = await this.axios.get("/allusers");
      return response.data;
    } catch (error) {
      console.error("getAllUsers error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const response = await this.axios.get("/admin/analytics");
      return response.data;
    } catch (error) {
      console.error("getAnalytics error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.axios.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("deleteUser error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await this.axios.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error("updateUserRole error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
}

export default new ApiService();
