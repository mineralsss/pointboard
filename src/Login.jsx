import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import {react} from "react";
import MainMenu from "./MainMenu";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
} from "@mui/icons-material";
import Base from "./base";
import { useAuth } from "./contexts/AuthContext";

const Login = () => {
  console.log('🔵 Login component rendered');

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Console log component mount and state changes
  useEffect(() => {
    console.log('🔵 Login component mounted');
    console.log('🔵 Initial auth state:', { isAuthenticated, user });
    
    return () => {
      console.log('🔵 Login component unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('🔵 Form data changed:', formData);
  }, [formData]);

  useEffect(() => {
    console.log('🔵 Auth state changed:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log('🔵 Loading state changed:', isLoading);
  }, [isLoading]);

  useEffect(() => {
    console.log('🔵 Errors changed:', errors);
  }, [errors]);

  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;
    console.log(`🔵 Input changed - ${name}:`, name === "rememberMe" ? checked : value);
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rememberMe" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      console.log(`🔵 Clearing error for field: ${name}`);
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    console.log('🔵 Validating form with data:', formData);
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    console.log('🔵 Validation errors:', newErrors);
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('🔵 Form submission started');
    console.log('🔵 Form data at submission:', formData);
    
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      console.log('🔴 Form validation failed:', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('🔵 Form validation passed, proceeding with login');
    setIsLoading(true);
    setErrors({});
    setGeneralError(""); // Reset general error

    try {
      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
      };

      console.log('🔵 Calling login function with data:', { ...loginData, password: '***' });
      const result = await login(loginData);
      console.log("🟢 Login function returned:", result);
      
      // Don't check isAuthenticated/user here - they haven't updated yet
      // Just check if the login was successful from the result
      if (result.success) {
        console.log('🟢 Login successful');
        // Extract user data from the correct location
        const userData = result.data?.userData; // Fix: use userData instead of user
        
        if (userData) {
          // Display logged in user info
          const userName = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.email;
          
          console.log(`🟢 Logged in as: ${userName}`);
          console.log('🟢 User data:', userData);
          setGeneralError(""); // Clear any previous errors
        }
        
        console.log('🔵 Navigating to /mainmenu');
        navigate("/mainmenu", { replace: true });
      } else {
        console.log("🔴 Login failed:", result.message);
        setErrors({ submit: result.message || "Login failed" });
        setGeneralError(result.message || "Login failed");
      }
      
    } catch (error) {
      console.log("🔴 Login error caught:", error);
      console.log("🔴 Error message:", error.message);
      console.log("🔴 Error stack:", error.stack);
      setErrors({ submit: error.message || "Login failed" });
      setGeneralError(error.message || "Login failed"); // Set general error
    } finally {
      console.log('🔵 Login process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("🔵 Google login clicked");
    // Implement Google login here
  };

  const handleFacebookLogin = () => {
    console.log("🔵 Facebook login clicked");
    // Implement Facebook login here
  };

  const handlePasswordVisibilityToggle = () => {
    console.log('🔵 Password visibility toggled:', !showPassword);
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = () => {
    console.log('🔵 Forgot password link clicked');
    console.log('🔵 Current email for reset:', formData.email);
  };

  const handleRegisterClick = () => {
    console.log('🔵 Register link clicked');
  };

  // Log render
  console.log('🔵 Login component rendering with state:', {
    formData: { ...formData, password: '***' },
    errors,
    isLoading,
    generalError,
    showPassword,
    isAuthenticated,
    user: user ? { ...user, password: undefined } : null
  });

  return (
    <Base>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            marginBottom: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Raleway', sans-serif",
                  fontWeight: 700,
                  color: "#39095D",
                  mb: 1,
                }}
              >
                Đăng Nhập
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Chào mừng bạn trở lại PointBoard!
              </Typography>
            </Box>

            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.submit}
              </Alert>
            )}
            {generalError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {generalError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ mb: 2 }}
                variant="outlined"
                disabled={isLoading}
              />

              <TextField
                fullWidth
                name="password"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                sx={{ mb: 2 }}
                variant="outlined"
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handlePasswordVisibilityToggle}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      sx={{
                        color: "#39095D",
                        "&.Mui-checked": {
                          color: "#39095D",
                        },
                      }}
                    />
                  }
                  label="Ghi nhớ đăng nhập"
                  sx={{ fontFamily: "'Inter', sans-serif" }}
                />
                <Link
                  to="/reset-password"
                  state={{ email: formData.email }}
                  style={{
                    color: '#491E6C',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                  onClick={handleForgotPasswordClick}
                >
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#491E6C',
                  '&:hover': {
                    backgroundColor: '#5D2E7A',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Đăng Nhập'
                )}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" sx={{ color: "#666", px: 2 }}>
                  Hoặc
                </Typography>
              </Divider>

              <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderColor: "#ddd",
                    color: "#666",
                    fontFamily: "'Inter', sans-serif",
                    "&:hover": {
                      borderColor: "#39095D",
                      backgroundColor: "rgba(57, 9, 93, 0.04)",
                    },
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Facebook />}
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderColor: "#ddd",
                    color: "#666",
                    fontFamily: "'Inter', sans-serif",
                    "&:hover": {
                      borderColor: "#39095D",
                      backgroundColor: "rgba(57, 9, 93, 0.04)",
                    },
                  }}
                >
                  Facebook
                </Button>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#666", fontFamily: "'Inter', sans-serif" }}
                >
                  Chưa có tài khoản?{" "}
                  <Link
                    to="/register"
                    style={{
                      color: "#39095D",
                      textDecoration: "none",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={handleRegisterClick}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = "none";
                    }}
                  >
                    Đăng ký ngay
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Base>
  );
}

export default Login;
