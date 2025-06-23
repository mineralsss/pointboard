import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, CheckCircle, Error } from '@mui/icons-material';
import Base from '../base';
import apiService from '../services/api';

const ResetPasswordWithToken = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid

  useEffect(() => {
    // Validate token on component mount
    if (!token) {
      setTokenValid(false);
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.newPassword) {
      setError('Please enter a new password');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your new password');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.resetPasswordWithToken(token, formData.newPassword);
      
      if (response.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully. Please login with your new password.'
            }
          });
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.status === 400) {
        setError('Invalid or expired reset link. Please request a new password reset.');
        setTokenValid(false);
      } else if (error.response?.status === 404) {
        setError('Reset link not found. Please request a new password reset.');
        setTokenValid(false);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleRequestNewReset = () => {
    navigate('/reset-password');
  };

  if (tokenValid === false) {
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
                textAlign: 'center'
              }}
            >
              <Error sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ color: '#39095D' }}>
                Invalid Reset Link
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
                This password reset link is invalid or has expired. Please request a new password reset.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleRequestNewReset}
                  sx={{
                    backgroundColor: '#39095D',
                    '&:hover': {
                      backgroundColor: '#4c1275',
                    },
                  }}
                >
                  Request New Reset
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleBackToLogin}
                  sx={{
                    borderColor: '#39095D',
                    color: '#39095D',
                    '&:hover': {
                      borderColor: '#4c1275',
                      backgroundColor: 'rgba(57, 9, 93, 0.04)',
                    },
                  }}
                >
                  Back to Login
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Base>
    );
  }

  if (success) {
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
                textAlign: 'center'
              }}
            >
              <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ color: '#39095D' }}>
                Password Reset Successful!
              </Typography>
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            </Paper>
          </Box>
        </Container>
      </Base>
    );
  }

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
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Lock sx={{ fontSize: 60, color: '#39095D', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom sx={{ color: '#39095D' }}>
                Reset Your Password
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Enter your new password below
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type={showPassword ? "text" : "password"}
                id="newPassword"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#39095D',
                  '&:hover': {
                    backgroundColor: '#4c1275',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Reset Password'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={handleBackToLogin}
                  sx={{ color: '#39095D' }}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Base>
  );
};

export default ResetPasswordWithToken; 