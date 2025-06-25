import * as React from "react";
import { useState } from "react";
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
  Grid,
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

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dob: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState(""); // New state for general errors

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    
    // Clear general error when user starts typing in any field
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vui lòng nhập họ";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Vui lòng nhập tên";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    } else {
      // Remove all non-digit characters to count actual digits
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        newErrors.phone = "Số điện thoại phải có đúng 10 số";
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!formData.dob) {
      newErrors.dob = "Vui lòng nhập ngày sinh";
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dob = "Bạn phải từ 13 tuổi trở lên";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGeneralError("");

    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;

      // Ensure phone has no spaces and remove any extra "+"
      registerData.phone = registerData.phone.replace(/\D+/g, "");

      // Convert DOB to match backend format: 2000-12-03T00:00:00.000+00:00
      if (registerData.dob) {
        const date = new Date(registerData.dob);
        registerData.dob = date.toISOString().replace('Z', '+00:00');
      }

      await register(registerData);
      navigate("/login", { state: { message: "Registration successful!" } });
    } catch (error) {
      setGeneralError("Registration failed. Please try again.");
      console.error("Registration error in handleSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    console.log("Google register clicked");
    // Implement Google registration here
  };

  const handleFacebookRegister = () => {
    console.log("Facebook register clicked");
    // Implement Facebook registration here
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
            maxWidth: 600,
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
              Đăng Ký
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Tạo tài khoản mới tại PointBoard!
            </Typography>
          </Box>

          {generalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {generalError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="Họ"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  variant="outlined"
                  disabled={isLoading}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lastName"
                  label="Tên"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  variant="outlined"
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mt: 2 }}
              variant="outlined"
              disabled={isLoading}
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
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
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  variant="outlined"
                  disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              name="phone"
              label="Số điện thoại"
              value={formData.phone}
              onChange={handleInputChange}
              error={!!errors.phone}
              helperText={errors.phone}
              sx={{ mt: 2 }}
              variant="outlined"
              disabled={isLoading}
              placeholder="Nhập đúng 11 số (VD: 0xxxxxxxxxx)"
            />

            <TextField
              fullWidth
              name="address"
              label="Địa chỉ"
              value={formData.address}
              onChange={handleInputChange}
              error={!!errors.address}
              helperText={errors.address}
              sx={{ mt: 2 }}
              variant="outlined"
              disabled={isLoading}
              multiline
              rows={2}
            />

            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="dob"
                  label="Ngày sinh"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  error={!!errors.dob}
                  helperText={errors.dob}
                  variant="outlined"
                  disabled={isLoading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
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
                  Đang đăng ký...
                </Box>
              ) : (
                "Đăng Ký"
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
                onClick={handleGoogleRegister}
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
                onClick={handleFacebookRegister}
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
                Đã có tài khoản?{" "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate("/login")}
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
                  Đăng nhập ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Base>
  );
}

export default Register;
