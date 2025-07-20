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

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const response = await this.axios.post("/auth/resend-verification", { email });
      return response.data;
    } catch (error) {
      console.error("resendVerificationEmail error details:", {
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
      console.log('🔐 getAllOrders - Making request with auth:', {
        url: `/orders/all?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        hasToken: !!localStorage.getItem('token'),
        tokenPreview: localStorage.getItem('token')?.substring(0, 20) + '...',
        headers: this.axios.defaults.headers
      });
      
      const response = await this.axios.get(`/orders/all?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      
      console.log('✅ getAllOrders - Success:', {
        status: response.status,
        hasData: !!response.data,
        success: response.data?.success
      });
      
      return response.data;
    } catch (error) {
      console.error("❌ getAllOrders error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
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
      // Return a proper error response instead of undefined
      return {
        success: false,
        message: "Failed to fetch analytics data",
        error: error.message
      };
    }
  }

  // Fallback method to calculate analytics from all orders
  async getAnalyticsFromOrders() {
    try {
      console.log("🔄 Using fallback analytics method - calculating from orders...");
      
      // Get all orders with a large limit to get all orders
      const response = await this.axios.get("/orders/all?page=1&limit=1000&sortBy=createdAt&sortOrder=desc");
      
      if (response.data.success && response.data.data?.results) {
        const orders = response.data.data.results;
        console.log(`📊 Processing ${orders.length} orders for analytics...`);
        
        const totalRevenue = orders.reduce((sum, order) => {
          const orderTotal = order.total || order.totalAmount || 0;
          return sum + orderTotal;
        }, 0);
        
        const pendingOrders = orders.filter(order => {
          const status = order.status || order.orderStatus;
          return status === 'pending';
        }).length;
        
        const result = {
          success: true,
          data: {
            totalRevenue,
            pendingOrders,
            totalOrders: orders.length
          }
        };
        
        console.log("✅ Fallback analytics calculated:", result.data);
        return result;
      }
      
      console.warn("⚠️ No orders data available for fallback analytics");
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
      console.error("❌ getAnalyticsFromOrders error:", error);
      return {
        success: false,
        message: "Failed to calculate analytics from orders",
        error: error.message,
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

  // Create order from orderRef using backend endpoint (Option 1 Fix Integration)
  async createOrderFromRef(orderData) {
    try {
      console.log("🚀 Creating order from orderRef:", orderData.orderRef);
      console.log("📦 Request data:", orderData);
      
      // Prepare the request data with Option 1 fix structure
      const requestData = {
        orderRef: orderData.orderRef, // Frontend generated reference (PointBoardA...)
        orderNumber: orderData.orderNumber, // Backend's official order number
        totalAmount: orderData.totalAmount,
        transactionStatus: orderData.transactionStatus || 'pending',
        paymentMethod: orderData.paymentMethod || 'bank_transfer',
        customerInfo: orderData.customerInfo || {},
        address: orderData.address || {},
        items: orderData.items || [],
        notes: orderData.notes || ''
      };
      
      console.log("📤 Sending to backend with Option 1 structure:", requestData);
      
      const response = await this.axios.post("/orders/create-from-ref", requestData);
      
      console.log("✅ Backend response:", response.data);
      
      // Return structured response that matches your frontend expectations
      return {
        success: response.data.success,
        data: response.data.data,
        message: response.data.message,
        // Use backend's official order number for consistency
        orderRef: response.data.data?.orderNumber || response.data.data?.paymentCode || orderData.orderNumber,
        paymentStatus: response.data.data?.paymentStatus,
        orderStatus: response.data.data?.orderStatus,
        orderId: response.data.data?._id,
        // Additional fields for debugging
        frontendOrderRef: orderData.orderRef,
        backendOrderNumber: response.data.data?.orderNumber || response.data.data?.paymentCode
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

  // Enhanced order creation with Option 1 fix integration
  async createOrderWithRefSync(orderData, frontendOrderRef) {
    try {
      console.log("🔄 Creating order with reference synchronization");
      console.log("📋 Frontend OrderRef:", frontendOrderRef);
      console.log("📦 Order Data:", orderData);
      
      // Step 1: Create the main order (your existing flow)
      let orderResponse;
      if (orderData.guestEmail) {
        orderResponse = await this.createGuestOrder(orderData);
      } else {
        orderResponse = await this.createOrder(orderData);
      }
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create main order');
      }
      
      // Step 2: Extract backend's official order number
      const backendOrderNumber = orderResponse.data?.orderNumber || 
                                orderResponse.data?.orderRef || 
                                orderResponse.data?.orderId || 
                                orderResponse.data?._id;
      
      console.log("✅ Main order created with backend number:", backendOrderNumber);
      
      // Step 3: Create from reference using the same backend order number
      const refOrderData = {
        orderRef: frontendOrderRef, // Your PointBoardA reference
        orderNumber: backendOrderNumber, // Backend's official number
        totalAmount: orderData.totalAmount,
        transactionStatus: 'pending',
        paymentMethod: orderData.paymentMethod,
        customerInfo: {
          fullName: orderData.shippingAddress?.fullName || 'Guest User',
          phone: orderData.shippingAddress?.phone || '',
          email: orderData.guestEmail || ''
        },
        address: orderData.shippingAddress || {},
        items: orderData.items || [],
        notes: `Order created with frontend ref: ${frontendOrderRef}, backend number: ${backendOrderNumber}`
      };
      
      const refResponse = await this.createOrderFromRef(refOrderData);
      
      console.log("✅ Reference order created:", refResponse);
      
      // Step 4: Return consolidated response
      return {
        success: true,
        data: {
          mainOrder: orderResponse.data,
          refOrder: refResponse.data,
          // Use backend's official order number for consistency
          orderNumber: backendOrderNumber,
          frontendOrderRef: frontendOrderRef,
          // Verify consistency
          isConsistent: refResponse.data?.orderNumber === backendOrderNumber
        },
        message: 'Order created successfully with consistent order numbers',
        orderRef: backendOrderNumber,
        paymentStatus: refResponse.data?.paymentStatus,
        orderStatus: refResponse.data?.orderStatus,
        orderId: refResponse.data?._id
      };
      
    } catch (error) {
      console.error("❌ Error in createOrderWithRefSync:", error);
      throw error;
    }
  }



  // Review API methods
  async getReviews(params = {}) {
    // params: { product, order, user, ... }
    try {
      console.log('getReviews called with params:', params);
      // Use the public endpoint for product reviews
      const publicAxios = axios.create({
        baseURL: '/api',
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Add auth token if available
      const token = localStorage.getItem("token");
      if (token) {
        publicAxios.defaults.headers.Authorization = `Bearer ${token}`;
      }
      
      const url = '/reviews?' + new URLSearchParams(params).toString();
      console.log('Making request to:', url);
      const response = await publicAxios.get('/reviews', { params });
      console.log('getReviews response:', response.data);
      
      // Normalize the response format for admin dashboard compatibility
      // Backend returns { success: true, reviews: [...] }
      // Admin dashboard expects { success: true, data: [...] }
      if (response.data && response.data.success && response.data.reviews) {
        return {
          ...response.data,
          data: response.data.reviews // Map reviews to data for admin dashboard
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('getReviews error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
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
      console.log('createReview called with data:', reviewData);
      const response = await this.axios.post('/reviews', reviewData);
      console.log('createReview response:', response.data);
      return response.data;
    } catch (error) {
      console.error('createReview error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      throw error;
    }
  }

  async updateReview(id, reviewData) {
    try {
      console.log('updateReview called with id:', id, 'data:', reviewData);
      
      // Try the public endpoint first
      try {
        const publicAxios = axios.create({
          baseURL: '/api',
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        // Add auth token if available
        const token = localStorage.getItem("token");
        if (token) {
          publicAxios.defaults.headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await publicAxios.patch(`/reviews/${id}`, reviewData);
        console.log('updateReview response from public API:', response.data);
        return response.data;
      } catch (publicError) {
        console.log('Public API update failed, trying authenticated API:', publicError.message);
        
        // Fallback to authenticated API
        const response = await this.axios.patch(`/reviews/${id}`, reviewData);
        console.log('updateReview response from authenticated API:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('updateReview error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      throw error;
    }
  }

  async deleteReview(id) {
    try {
      console.log('deleteReview called with id:', id);
      
      // Try the public endpoint first
      try {
        const publicAxios = axios.create({
          baseURL: '/api',
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        // Add auth token if available
        const token = localStorage.getItem("token");
        if (token) {
          publicAxios.defaults.headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await publicAxios.delete(`/reviews/${id}`);
        console.log('deleteReview response from public API:', response.data);
        return response.data;
      } catch (publicError) {
        console.log('Public API delete failed, trying authenticated API:', publicError.message);
        
        // Fallback to authenticated API
        const response = await this.axios.delete(`/reviews/${id}`);
        console.log('deleteReview response from authenticated API:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('deleteReview error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
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

  // Cleanup expired orders
  async cleanupExpiredOrders() {
    try {
      const response = await this.axios.post('/orders/cleanup-expired');
      return response.data;
    } catch (error) {
      console.error('cleanupExpiredOrders error details:', {
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
