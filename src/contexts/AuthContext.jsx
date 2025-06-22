import React, { createContext, useState, useEffect, useContext } from "react";
import apiService from "../services/api";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // This is correct
  const [error, setError] = useState(null);

  // Fix the useEffect - use setLoading instead of setIsLoading
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("User data loaded from localStorage:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // Fix: use setLoading instead of setIsLoading
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          return;
        }

        // First try to get user from localStorage for immediate response
        const localUser = apiService.getLocalUser();
        if (localUser) {
          setUser(localUser);
          console.log("User data loaded from localStorage:", localUser);
        }

        // Then try to fetch fresh data from API (but don't block UI)
        try {
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
              // Update localStorage with fresh data
              localStorage.setItem("user", JSON.stringify(data));
            }
          } else {
            console.error("No user data method available in apiService");
          }
        } catch (apiError) {
          console.error("Failed to fetch fresh user data from API:", apiError);
          // Don't clear existing user data, just log the error
          // The user can still use the app with cached data
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError(err);
        // Don't clear user data on error, just log it
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const token = response.data?.accessToken; // Fix: use accessToken
        const user = response.data?.userData;
        
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          console.log("User data set:", user);
        }
      } else {
        throw new Error(response.message || "Login failed");
      }
      
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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
