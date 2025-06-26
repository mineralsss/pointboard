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
  const [step, setStep] = useState(1); // 1: Email input, 2: Success message
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
        setSuccess('Email has been sent! Please follow the instructions in your email to reset your password.');
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
                  Enter your email address and we'll send you instructions to reset your password.
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
                    'Send Reset Instructions'
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
              // Step 2: Success message
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ mb: 2, color: '#491E6C', fontWeight: 'bold' }}>
                    Email Sent Successfully!
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    We have sent password reset instructions to:
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 3, color: '#491E6C', fontWeight: 'bold' }}>
                    {formData.email}
                  </Typography>
                  
                  <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant="body2">
                      <strong>What's next?</strong><br/>
                      1. Check your email inbox (and spam folder)<br/>
                      2. Click the secure reset link in the email<br/>
                      3. Follow the instructions to set your new password
                    </Typography>
                  </Alert>

                  <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant="body2">
                      <strong>Didn't receive the email?</strong><br/>
                      • Check your spam/junk folder<br/>
                      • Make sure the email address is correct<br/>
                      • Wait a few minutes and try refreshing your inbox
                    </Typography>
                  </Alert>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    onClick={handleResendCode}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                      color: '#491E6C',
                      borderColor: '#491E6C',
                      '&:hover': {
                        backgroundColor: 'rgba(73, 30, 108, 0.04)',
                        borderColor: '#491E6C',
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Resend Email'
                    )}
                  </Button>

                  <Button
                    onClick={handleBackToLogin}
                    variant="contained"
                    sx={{
                      backgroundColor: '#491E6C',
                      '&:hover': {
                        backgroundColor: '#5D2E7A',
                      },
                    }}
                  >
                    Back to Login
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