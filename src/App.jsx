import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Base from "./base";
import Login from "./Login";
import MainMenu from "./MainMenu";
import Register from "./Register";
import Checkout from "./Checkout";
import VerifyEmail from "./VerifyEmail";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from './contexts/CartContext';
import { CartUpdateProvider } from './contexts/CartUpdateContext';
import ResetPassword from "./components/ResetPassword";

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
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If user is logged in and tries to access public pages, redirect to main menu
    if (!loading && isAuthenticated) {
      const publicRoutes = ['/', '/login', '/register'];
      if (publicRoutes.includes(location.pathname)) {
        navigate('/mainmenu');
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // Optional: Handle redirects for protected routes
  useEffect(() => {
    // If user is not logged in and tries to access protected pages, redirect to login
    if (!loading && !isAuthenticated) {
      const protectedRoutes = ['/mainmenu'];
      if (protectedRoutes.includes(location.pathname)) {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  // If still loading, show loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="reset-password" element={<ResetPassword/>} />
      <Route 
        path="/mainmenu" 
        element={<MainMenu />} 
      />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      {/* Add other routes as needed */}
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CartUpdateProvider>
            <AuthRoutes />
          </CartUpdateProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
