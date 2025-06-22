import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Container
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import Base from './base';
import apiService from './services/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setVerificationStatus('error');
          setErrorMessage('Verification token is missing. Please check your email for the correct verification link.');
          setIsLoading(false);
          return;
        }

        // Call the backend to verify the email
        const response = await apiService.verifyEmail(token);
        
        if (response.success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.message || 'Email verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('Email verification failed. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleResendVerification = () => {
    // TODO: Implement resend verification functionality
    console.log('Resend verification clicked');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={60} sx={{ color: '#39095D', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#39095D', mb: 1 }}>
            Verifying your email...
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Please wait while we verify your email address.
          </Typography>
        </Box>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#39095D', mb: 2, fontWeight: 'bold' }}>
            Email Verified Successfully!
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            Your email address has been verified. You can now log in to your account.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleLoginClick}
            sx={{
              backgroundColor: '#39095D',
              '&:hover': {
                backgroundColor: '#4c1275',
              },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Continue to Login
          </Button>
        </Box>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Error sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
          <Typography variant="h4" sx={{ color: '#39095D', mb: 2, fontWeight: 'bold' }}>
            Verification Failed
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
            {errorMessage}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleLoginClick}
              sx={{
                backgroundColor: '#39095D',
                '&:hover': {
                  backgroundColor: '#4c1275',
                }
              }}
            >
              Go to Login
            </Button>
            <Button
              variant="outlined"
              onClick={handleResendVerification}
              sx={{
                borderColor: '#39095D',
                color: '#39095D',
                '&:hover': {
                  borderColor: '#4c1275',
                  backgroundColor: 'rgba(57, 9, 93, 0.04)',
                }
              }}
            >
              Resend Verification
            </Button>
          </Box>
        </Box>
      );
    }

    return null;
  };

  return (
    <Base>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
            padding: 2,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              padding: 4,
              width: '100%',
              borderRadius: 3,
              backgroundColor: '#fff',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Email sx={{ fontSize: 60, color: '#39095D', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Raleway', sans-serif",
                  fontWeight: 700,
                  color: '#39095D',
                  mb: 1,
                }}
              >
                Email Verification
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#666',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Verifying your email address
              </Typography>
            </Box>

            {renderContent()}
          </Paper>
        </Box>
      </Container>
    </Base>
  );
}

export default VerifyEmail; 