import axios from "axios";

const API_BASE_URL = "https://pointboard-fj2c.vercel.app/api/v1";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

class ApiService {
  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      // Store tokens in localStorage
      if (data.success) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("userData", JSON.stringify(data.data.userData));

        // Navigate to main menu after successful login
        window.location.href = "/mainmenu"; // Replace with your main menu route
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      throw new Error(errorMessage);
    }
  }

  async register(userData) {
    try {
      // Add default role as student
      const registrationData = {
        ...userData,
        role: "student",
      };

      const response = await apiClient.post("/auth/register", registrationData);
      const data = response.data;

      // Auto login after successful registration
      if (data.success && data.data?.accessToken) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
        localStorage.setItem("userData", JSON.stringify(data.data.userData));

        // Show message about confirmation email (could use a toast notification)
        alert(
          "Registration successful! A confirmation email has been sent to your email address."
        );

        // Optional: redirect to main menu
        window.location.href = "/mainmenu";
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
  }

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  }

  getUserData() {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  }

  getAccessToken() {
    return localStorage.getItem("accessToken");
  }
}

export const apiService = new ApiService();
