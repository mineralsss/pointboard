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
      const response = await this.axios.post("/orders", orderData);
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

  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const response = await this.axios.patch(`/orders/${orderId}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error) {
      console.error("updatePaymentStatus error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Admin Methods
  async getAllOrders(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') {
    try {
      const response = await this.axios.get(`/orders/all?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
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
      const response = await this.axios.get("/analytics");
      return response.data;
    } catch (error) {
      console.error("getAnalytics error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      // Return a fallback response instead of throwing
    }
  }

  // Fallback method to calculate analytics from all orders
  async getAnalyticsFromOrders() {
    try {
      // Get all orders with a large limit to get all orders
      const response = await this.axios.get("/orders/all?page=1&limit=1000&sortBy=createdAt&sortOrder=desc");
      if (response.data.success && response.data.data?.results) {
        const orders = response.data.data.results;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
        const pendingOrders = orders.filter(order => (order.status || order.orderStatus) === 'pending').length;
        
        return {
          success: true,
          data: {
            totalRevenue,
            pendingOrders,
            totalOrders: orders.length
          }
        };
      }
      return {
        success: false,
        message: "Could not fetch orders for analytics",
        data: {
          totalRevenue: 0,
          pendingOrders: 0,
          totalOrders: 0
        }
      };
    } catch (error) {
      console.error("getAnalyticsFromOrders error:", error);
      return {
        success: false,
        message: "Failed to calculate analytics from orders",
        data: {
          totalRevenue: 0,
          pendingOrders: 0,
          totalOrders: 0
        }
      };
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

  // Create order from orderRef using backend endpoint
  async createOrderFromRef(orderData) {
    try {
      console.log("🚀 Creating order from orderRef:", orderData.orderRef);
      console.log("📦 Request data:", orderData);
      
      const response = await this.axios.post("/orders/create-from-ref", orderData);
      
      console.log("✅ Backend response:", response.data);
      
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        orderRef: response.data.data?.orderNumber || orderData.orderRef,
        paymentStatus: response.data.data?.paymentStatus,
        orderStatus: response.data.data?.orderStatus,
        orderId: response.data.data?._id
      };
    } catch (error) {
      console.error("createOrderFromRef error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Test function to create order with specific orderRef using backend endpoint
  async testCreateOrderFromRef(customOrderRef = null, transactionStatus = 'pending') {
    const orderRef = customOrderRef || `POINTBOARDA${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    const orderData = {
      orderRef: orderRef,
      transactionStatus: transactionStatus,
      paymentMethod: 'bank_transfer',
      address: {
        fullName: "Test User",
        phone: "0123456789",
        address: "123 Test Street",
        city: "Ho Chi Minh City",
        district: "District 1",
        ward: "Ward 1",
        notes: "Test order address"
      },
      items: [
        {
          productId: "test-product-1",
          productName: "Test Product 1",
          quantity: 2,
          price: 50000
        },
        {
          productId: "test-product-2", 
          productName: "Test Product 2",
          quantity: 1,
          price: 30000
        }
      ],
      totalAmount: 130000,
      customerInfo: {
        fullName: "Test Customer",
        phone: "0123456789",
        email: "test@example.com"
      },
      notes: `Test order created via API with orderRef: ${orderRef} and status: ${transactionStatus}`
    };

    try {
      console.log("🧪 Testing order creation from orderRef");
      console.log("📋 OrderRef:", orderRef);
      console.log("🔄 Transaction Status:", transactionStatus);
      
      const result = await this.createOrderFromRef(orderData);
      
      console.log("🎯 Final result:", {
        success: result.success,
        orderRef: result.orderRef,
        paymentStatus: result.paymentStatus,
        orderStatus: result.orderStatus,
        orderId: result.orderId,
        message: result.message
      });
      
      return result;
      
    } catch (error) {
      console.error("❌ Test failed:", error);
      throw error;
    }
  }

  // Review API methods
  async getReviews(params = {}) {
    // params: { product, order, user, ... }
    try {
      const response = await this.axios.get('/reviews', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getReviewById(id) {
    try {
      const response = await this.axios.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createReview(reviewData) {
    try {
      const response = await this.axios.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateReview(id, reviewData) {
    try {
      const response = await this.axios.patch(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(id) {
    try {
      const response = await this.axios.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Product API methods
  async createProduct(productData) {
    try {
      const response = await this.axios.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProducts(params = {}) {
    try {
      const response = await this.axios.get('/products', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ApiService();
