import * as React from "react";
import { useState } from "react";
import MainMenu from "./MainMenu";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
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

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState(""); // Add this line

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rememberMe" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
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

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setGeneralError(""); // Reset general error

    try {
      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const result = await login(loginData);
      console.log("Login successful:", result);
      
      // Don't check isAuthenticated/user here - they haven't updated yet
      // Just check if the login was successful from the result
      if (result.success) {
        // Extract user data from the correct location
        const userData = result.data?.userData; // Fix: use userData instead of user
        
        if (userData) {
          // Display logged in user info
          const userName = userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : userData.email;
          
          console.log(`Logged in as: ${userName}`);
          setGeneralError(""); // Clear any previous errors
        }
        
        navigate("/mainmenu", { replace: true });
      } else {
        console.log("Login failed:", result.message);
        setErrors({ submit: result.message || "Login failed" });
        setGeneralError(result.message || "Login failed");
      }
      
    } catch (error) {
      console.log("Login failed:", error.message);
      setErrors({ submit: error.message || "Login failed" });
      setGeneralError(error.message || "Login failed"); // Set general error
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // Implement Google login here
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login clicked");
    // Implement Facebook login here
  };

  return (
    <Base>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 200px)",
          padding: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            maxWidth: 400,
            width: "100%",
            borderRadius: 3,
            backgroundColor: "#fff",
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
          {generalError && ( // Add this block
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
                      onClick={() => setShowPassword(!showPassword)}
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
                href="#"
                sx={{
                  color: "#39095D",
                  textDecoration: "none",
                  fontFamily: "'Inter', sans-serif",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
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
                mb: 2,
                py: 1.5,
                backgroundColor: "#39095D",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                "&:hover": {
                  backgroundColor: "#4c1275",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Đang đăng nhập...
                </Box>
              ) : (
                "Đăng Nhập"
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
                  component="button"
                  type="button"
                  onClick={() => navigate("/register")}
                  sx={{
                    color: "#39095D",
                    textDecoration: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Base>
  );
}

export default Login;
