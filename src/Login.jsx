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
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Error,
  Warning,
  Info,
} from "@mui/icons-material";
import Base from "./base";
import { useAuth } from "./contexts/AuthContext";
import apiService from "./services/api";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error', // 'error', 'warning', 'info', 'success'
  });
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Show registration success message if present in navigation state
  useEffect(() => {
    if (location.state && location.state.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: 'success',
      });
      // Optionally clear the message from state so it doesn't reappear
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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

  const getErrorMessage = (error) => {
    // Handle different types of login errors
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      
      // Check for specific error codes from backend
      if (errorData?.errorCode === 'INVALID_CREDENTIALS') {
        return {
          message: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.",
          severity: 'error'
        };
      }
      
      // Check for specific error messages from backend (fallback)
      if (errorData?.message) {
        const message = errorData.message.toLowerCase();
        
        if (message.includes('email not verified') || message.includes('unverified')) {
          return {
            message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
            severity: 'warning',
            action: 'resend'
          };
        }
        
        if (message.includes('invalid credentials') || message.includes('incorrect')) {
          return {
            message: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.",
            severity: 'error'
          };
        }
        
        if (message.includes('account not found') || message.includes('user not found')) {
          return {
            message: "Tài khoản không tồn tại. Vui lòng kiểm tra email hoặc đăng ký tài khoản mới.",
            severity: 'error'
          };
        }
        
        if (message.includes('account locked') || message.includes('suspended')) {
          return {
            message: "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ để được trợ giúp.",
            severity: 'error'
          };
        }
        
        if (message.includes('too many attempts')) {
          return {
            message: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút hoặc sử dụng chức năng quên mật khẩu.",
            severity: 'warning'
          };
        }
      }
      
      // Default 401 error
      return {
        message: "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập.",
        severity: 'error'
      };
    }
    
    if (error.response?.status === 403) {
      const errorData = error.response?.data;
      
      // Check for specific error codes from backend
      if (errorData?.errorCode === 'ACCOUNT_NOT_VERIFIED') {
        return {
          message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.",
          severity: 'warning',
          action: 'resend'
        };
      }
      
      return {
        message: "Tài khoản đã bị khóa hoặc không có quyền truy cập. Vui lòng liên hệ hỗ trợ.",
        severity: 'error'
      };
    }
    
    if (error.response?.status === 404) {
      return {
        message: "Tài khoản không tồn tại. Vui lòng kiểm tra email hoặc đăng ký tài khoản mới.",
        severity: 'error'
      };
    }
    
    if (error.response?.status === 429) {
      return {
        message: "Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau vài phút.",
        severity: 'warning'
      };
    }
    
    if (error.response?.status >= 500) {
      return {
        message: "Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.",
        severity: 'error'
      };
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.",
        severity: 'error'
      };
    }
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        message: "Kết nối bị gián đoạn. Vui lòng thử lại.",
        severity: 'warning'
      };
    }
    
    // Default error
    return {
      message: error.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      severity: 'error'
    };
  };

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleResendVerification = async () => {
    try {
      console.log('🔵 Resending verification email to:', formData.email);
      
      if (!formData.email) {
        showSnackbar('Vui lòng nhập email để gửi lại email xác thực.', 'warning');
        return;
      }

      setIsResendingVerification(true);
      const result = await apiService.resendVerificationEmail(formData.email);
      
      if (result.success) {
        showSnackbar('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.', 'success');
      } else {
        showSnackbar(result.message || 'Không thể gửi email xác thực. Vui lòng thử lại sau.', 'error');
      }
    } catch (error) {
      console.error('🔴 Error resending verification:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        showSnackbar('Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.', 'error');
      } else if (error.response?.status === 429) {
        showSnackbar('Quá nhiều yêu cầu gửi email. Vui lòng thử lại sau vài phút.', 'warning');
      } else if (error.response?.status >= 500) {
        showSnackbar('Lỗi máy chủ. Vui lòng thử lại sau.', 'error');
      } else {
        showSnackbar('Không thể gửi email xác thực. Vui lòng thử lại sau.', 'error');
      }
    } finally {
      setIsResendingVerification(false);
    }
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
          
          // Show success message
          showSnackbar(`Đăng nhập thành công! Chào mừng ${userName}`, 'success');
        }
        
        console.log('🔵 Navigating to /mainmenu');
        navigate("/mainmenu", { replace: true });
      } else {
        console.log("🔴 Login failed:", result.message);
        const errorInfo = getErrorMessage({ message: result.message });
        setErrors({ submit: errorInfo.message });
        setGeneralError(errorInfo.message);
        showSnackbar(errorInfo.message, errorInfo.severity);
      }
      
    } catch (error) {
      console.log("🔴 Login error caught:", error);
      console.log("🔴 Error message:", error.message);
      console.log("🔴 Error stack:", error.stack);
      
      const errorInfo = getErrorMessage(error);
      setErrors({ submit: errorInfo.message });
      setGeneralError(errorInfo.message);
      showSnackbar(errorInfo.message, errorInfo.severity);
      
      // Handle specific error types
      if (errorInfo.action === 'resend') {
        // Add a button or link to resend verification email
        console.log('🔵 User needs to verify email');
      }
    } finally {
      console.log('🔵 Login process completed, setting loading to false');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("🔵 Google login clicked");
    showSnackbar('Tính năng đăng nhập bằng Google sẽ sớm có mặt!', 'info');
  };

  const handleFacebookLogin = () => {
    console.log("🔵 Facebook login clicked");
    showSnackbar('Tính năng đăng nhập bằng Facebook sẽ sớm có mặt!', 'info');
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
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  generalError.includes('chưa được xác thực') && (
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      sx={{ textTransform: 'none' }}
                    >
                      {isResendingVerification ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        'Gửi lại email'
                      )}
                    </Button>
                  )
                }
              >
                {errors.submit}
              </Alert>
            )}
            {generalError && !errors.submit && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                action={
                  generalError.includes('chưa được xác thực') && (
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      sx={{ textTransform: 'none' }}
                    >
                      {isResendingVerification ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        'Gửi lại email'
                      )}
                    </Button>
                  )
                }
              >
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          icon={
            snackbar.severity === 'error' ? <Error /> :
            snackbar.severity === 'warning' ? <Warning /> :
            <Info />
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Base>
  );
}

export default Login;
