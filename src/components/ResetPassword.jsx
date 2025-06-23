import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import Base from '../base';
import apiService from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Email input, 2: Reset code + new password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get email from location state (if coming from login page)
  React.useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Step 1: Send reset email
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.forgotPassword(formData.email);
      
      if (response.success) {
        setSuccess('Reset instructions sent to your email. Please check your inbox for both a reset code and a secure reset link.');
        setStep(2);
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response?.status === 404) {
        setError('Email address not found');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.resetPasswordWithCode(
        formData.email,
        formData.resetCode,
        formData.newPassword
      );

      if (response.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successfully. Please login with your new password.',
              email: formData.email 
            }
          });
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response?.status === 400) {
        setError('Invalid reset code or the code has expired');
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

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.forgotPassword(formData.email);

      if (response.success) {
        setSuccess('New reset code sent to your email.');
      } else {
        setError(response.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Reset Password
            </Typography>

            {step === 1 ? (
              // Step 1: Email input
              <Box component="form" onSubmit={handleSendResetEmail} sx={{ mt: 1 }}>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                  Enter your email address and we'll send you reset instructions. You'll receive both a reset code (for this page) and a secure reset link.
                </Typography>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
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
                    backgroundColor: '#491E6C',
                    '&:hover': {
                      backgroundColor: '#5D2E7A',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    onClick={handleBackToLogin}
                    sx={{ color: '#491E6C' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            ) : (
              // Step 2: Reset code and new password
              <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1 }}>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                  Enter the reset code sent to <strong>{formData.email}</strong> and your new password.
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Alternative:</strong> You can also use the secure reset link sent to your email for a simpler one-click reset process.
                  </Typography>
                </Alert>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="resetCode"
                  label="Reset Code"
                  name="resetCode"
                  autoFocus
                  value={formData.resetCode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit code"
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
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
                    backgroundColor: '#491E6C',
                    '&:hover': {
                      backgroundColor: '#5D2E7A',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    onClick={() => setStep(1)}
                    sx={{ color: '#491E6C' }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleResendCode}
                    disabled={loading}
                    sx={{ color: '#491E6C' }}
                  >
                    Resend Code
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Base>
  );
};

export default ResetPassword;