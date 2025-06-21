import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Base from "./base";
import Login from "./Login";
import MainMenu from "./MainMenu";
import Register from "./Register";
import Checkout from "./Checkout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Check } from "@mui/icons-material";

// Home component - you can replace this with your actual home page
function Home() {
  return (
    <Base>
      <div>
        <h1>Chào mừng đến với PointBoard!</h1>
        <p>Đăng nhập hoặc Đăng ký để tiếp tục.</p>
      </div>
    </Base>
  );
}

// Authentication check and navigation wrapper
function AuthRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If user is logged in and tries to access public pages, redirect to main menu
    if (!isLoading && isAuthenticated) {
      const publicRoutes = ['/', '/login', '/register'];
      if (publicRoutes.includes(location.pathname)) {
        navigate('/mainmenu');
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Optional: Handle redirects for protected routes
  useEffect(() => {
    // If user is not logged in and tries to access protected pages, redirect to login
    if (!isLoading && !isAuthenticated) {
      const protectedRoutes = ['/mainmenu'];
      if (protectedRoutes.includes(location.pathname)) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // If still loading, show loading indicator
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/mainmenu" 
        element={<MainMenu />} 
      />
      <Route path="/checkout" element={<Checkout />} />
      {/* Add other routes as needed */}
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
