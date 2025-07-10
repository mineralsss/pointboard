import React, { createContext, useState, useEffect, useContext } from "react";
import apiService from "../services/api";
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single useEffect to handle user loading
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        // Clean up any old/invalid user data
        if (userData === 'user' || userData === '"user"') {
          console.log("Removing invalid user data from localStorage");
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            // Validate that parsed user has required fields
            if (parsedUser && typeof parsedUser === 'object' && (parsedUser.email || parsedUser._id)) {
              setUser(parsedUser);
            } else {
              console.error("Invalid user data structure:", parsedUser);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } catch (error) {
            console.error("AuthContext: Error parsing user data:", error);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          setUser(null);
        }

        // Try to fetch fresh data from API if we have a token
        if (token && user !== null) {
          try {
            if (typeof apiService.getUserProfile === "function") {
              const data = await apiService.getUserProfile();
              if (data && data.success !== false && data.error !== "SERVER_ERROR") {  // Check if API call was successful
                setUser(data);
                localStorage.setItem("user", JSON.stringify(data));
              } else if (data?.error === "SERVER_ERROR") {
                // Server error - don't change auth state, just log
                console.warn("Server error when fetching user profile, keeping existing auth data");
              }
            }
          } catch (apiError) {
            console.error("AuthContext: Failed to fetch fresh user data from API:", apiError);
            // If it's a 500 error, the token might be invalid from a password reset
            if (apiError.response?.status === 500) {
              console.error("Server error (500) - possible invalid token after password reset");
              // Clear auth data to force re-login
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
            // For other errors, don't clear existing user data
          }
        }
      } catch (err) {
        console.error("AuthContext: Failed to load user data:", err);
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
      
      console.log('🔐 Login response:', {
        success: response.success,
        hasData: !!response.data,
        tokenFields: response.data ? Object.keys(response.data) : [],
        userFields: response.data?.userData ? Object.keys(response.data.userData) : []
      });
      
      if (response.success) {
        // Try different possible token field names
        const token = response.data?.accessToken || 
                     response.data?.token || 
                     response.data?.jwt || 
                     response.data?.authToken;
        
        const user = response.data?.userData || 
                    response.data?.user || 
                    response.data;
        
        console.log('🔐 Token extraction:', {
          accessToken: response.data?.accessToken,
          token: response.data?.token,
          jwt: response.data?.jwt,
          authToken: response.data?.authToken,
          selectedToken: token,
          tokenLength: token?.length
        });
        
        console.log('👤 User extraction:', {
          userData: response.data?.userData,
          user: response.data?.user,
          selectedUser: user
        });
        
        if (token && user) {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          console.log("✅ User data set:", user);
          console.log("✅ Token stored:", token.substring(0, 20) + '...');
        } else {
          console.error("❌ Missing token or user data:", { token: !!token, user: !!user });
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
    localStorage.removeItem("user");  // Also remove user data
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
