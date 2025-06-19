import React, { createContext, useState, useEffect, useContext } from "react";
import apiService from "../services/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        // Check which user data method exists and use it
        if (typeof apiService.getUserData === "function") {
          const data = await apiService.getUserData();
          if (data && data.user) {
            setUser(data.user);
          }
        } else if (typeof apiService.getUser === "function") {
          const data = await apiService.getUser();
          if (data) {
            setUser(data);
          }
        } else if (typeof apiService.getUserProfile === "function") {
          const data = await apiService.getUserProfile();
          if (data) {
            setUser(data);
          }
        } else {
          console.error("No user data method available in apiService");
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.token) {
        localStorage.setItem("token", response.token);
        if (response.user) {
          setUser(response.user);
        } else {
          // Try to fetch user data if not included in login response
          loadUser();
        }
        return { success: true };
      }
      return { success: false, message: "Login failed" };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      return { success: true, data: response };
    } catch (err) {
      console.error("Registration error:", err);
      throw err; // Rethrow to let component handle it
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
