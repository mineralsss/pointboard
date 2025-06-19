import React, { useState, useEffect } from 'react';
import Base from './base';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

// Reordered steps as requested
const steps = ['Review your order', 'Shipping information', 'Payment details'];

// Add these constants at the top of your file
const MAX_PAYMENT_VERIFICATION_ATTEMPTS = 10;
const VERIFICATION_RETRY_DELAY_MS = 2000; // 2 seconds between attempts

export default function Checkout() {
  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  
  // Sample cart items - replace with your actual cart data
  const cartItems = [
    { id: 1, name: 'Product 1', price: 1000, quantity: 1, image: './images/cards.png' },
    { id: 2, name: 'Product 2', price: 1000, quantity: 1, image: './images/cards.png' }
  ];
  
  const handleNext = () => {
    // For VietQR payment, don't proceed if payment is not verified
    if (activeStep === 2 && paymentMethod === 'vietqr' && !isPaymentVerified) {
      setPaymentError('Please complete payment before continuing');
      return;
    }
    
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    // Reset payment error when going back
    setPaymentError('');
  };
  
  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
    // Reset payment verification when method changes
    setIsPaymentVerified(false);
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 3000;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;
  
  // Generate order reference for payment description
  const orderRef = orderId || `ORDER${Date.now().toString().slice(-6)}`;
  
  // Set order ID once when component mounts
  useEffect(() => {
    if (!orderId) {
      setOrderId(`ORDER${Date.now().toString().slice(-6)}`);
    }
  }, [orderId]);
  
  // Generate VietQR URL with dynamic values
  const generateVietQRUrl = () => {
    // Format the amount without decimals or separators 
    const amount = Math.round(total).toString();
    
    // Create a payment description
    const description = `PointBoard-${orderRef}`;
    
    // Encode the description for URL
    const encodedDescription = encodeURIComponent(description);
    
    // Create the full QR URL
    return `https://qr.sepay.vn/img?acc=119771978&bank=mbbank&amount=${amount}&des=${encodedDescription}`;
  };
  
  function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
  
  // Helper function for delay
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Verify payment by checking if transaction exists in MongoDB
  const verifyPayment = async () => {
    setIsCheckingPayment(true);
    setPaymentError('');
    
    try {
      const result = await checkTransactionStatus(orderRef);
      
      if (result.verified) {
        setIsPaymentVerified(true);
        setIsCheckingPayment(false);
        return result;
      }
      
      if (result.error) {
        setPaymentError(result.error);
        setIsCheckingPayment(false);
        return result;
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentError('An error occurred while verifying payment. Please try again.');
      setIsCheckingPayment(false);
    }
  };
  
  /**
 * Check with the backend if a transaction has been completed
 * @param {string} transactionId - The ID of the transaction to verify
 * @returns {Promise<Object>} - Result of the transaction verification
 */
async function checkTransactionStatus(transactionId) {
  const MAX_VERIFICATION_ATTEMPTS = 10;
  const RETRY_DELAY_MS = 2000; // 2 seconds between attempts
  let attempts = 0;
  
  while (attempts < MAX_VERIFICATION_ATTEMPTS) {
    try {
      // Update UI to show current attempt
      attempts++;
      
      const response = await fetch(`/api/transactions/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // If transaction exists and is completed/successful
      if (data.exists && (data.status === 'completed' || data.status === 'success')) {
        console.log(`Transaction ${transactionId} verified successfully`);
        return { verified: true, data: data };
      }
      
      // If transaction exists but failed
      if (data.exists && (data.status === 'failed' || data.status === 'rejected')) {
        console.log(`Transaction ${transactionId} found but has failed status`);
        return { verified: false, data: data };
      }
      
      // If transaction exists but is in received state
      if (data.exists && data.status === 'received') {
        console.log(`Transaction ${transactionId} is in received state, waiting for processing`);
      } else {
        console.log(`Transaction ${transactionId} not found or still pending, waiting to retry...`);
      }
      
      // Show current attempt in UI
      setPaymentError(`Verifying payment... Attempt ${attempts}/${MAX_VERIFICATION_ATTEMPTS}`);
      
      // Not found or still pending, wait before retrying
      if (attempts < MAX_VERIFICATION_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    } catch (error) {
      console.error(`Verification attempt ${attempts} failed:`, error);
      
      // Wait before retrying
      if (attempts < MAX_VERIFICATION_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }
  
  // After MAX_VERIFICATION_ATTEMPTS, conclude transaction couldn't be verified
  console.error(`Could not verify transaction ${transactionId} after ${MAX_VERIFICATION_ATTEMPTS} attempts`);
  return { 
    verified: false, 
    error: "Could not verify payment after maximum retry attempts. It may still be processing, or you may need to complete the payment." 
  };
}
  
  // Clean up polling interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  const renderOrderReview = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>
        {cartItems.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <Box 
              component="img" 
              src={item.image || "/placeholder-product.png"} 
              alt={item.name} 
              sx={{ 
                width: 60, 
                height: 60, 
                objectFit: 'contain',
                mr: 2,
                border: '1px solid #eee'
              }} 
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {item.quantity}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {formatPrice(item.price * item.quantity)}
              </Typography>
            </Box>
          </Box>
        ))}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Subtotal</Typography>
          <Typography variant="body1">{formatPrice(subtotal)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Shipping</Typography>
          <Typography variant="body1">{formatPrice(shipping)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Tax</Typography>
          <Typography variant="body1">{formatPrice(tax)}</Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {formatPrice(total)}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );

  const renderShippingForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="firstName"
          name="firstName"
          label="First name"
          fullWidth
          autoComplete="given-name"
          value={shippingInfo.firstName}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="lastName"
          name="lastName"
          label="Last name"
          fullWidth
          autoComplete="family-name"
          value={shippingInfo.lastName}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          id="address"
          name="address"
          label="Address"
          fullWidth
          autoComplete="shipping address-line1"
          value={shippingInfo.address}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="city"
          name="city"
          label="City"
          fullWidth
          autoComplete="shipping address-level2"
          value={shippingInfo.city}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          id="state"
          name="state"
          label="State/Province/Region"
          fullWidth
          value={shippingInfo.state}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="zip"
          name="zip"
          label="Zip / Postal code"
          fullWidth
          autoComplete="shipping postal-code"
          value={shippingInfo.zip}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="country"
          name="country"
          label="Country"
          fullWidth
          autoComplete="shipping country"
          value={shippingInfo.country}
          onChange={handleShippingChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          id="phone"
          name="phone"
          label="Phone Number"
          fullWidth
          autoComplete="tel"
          value={shippingInfo.phone}
          onChange={handleShippingChange}
        />
      </Grid>
    </Grid>
  );
  
  const renderPaymentForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Payment Method</FormLabel>
          <RadioGroup
            aria-label="payment method"
            name="paymentMethod"
            value={paymentMethod}
            onChange={handlePaymentChange}
          >
            <FormControlLabel value="vietqr" control={<Radio />} label="VietQR (MBBank)" />
            <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      {/* VietQR payment section */}
      {paymentMethod === 'vietqr' && (
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Scan QR Code to Pay
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Amount: {formatPrice(total)} • Reference: {orderRef}
            </Typography>
            
            <Box sx={{ 
              maxWidth: 300, 
              margin: '0 auto', 
              p: 2, 
              bgcolor: 'white',
              borderRadius: 1
            }}>
              <img 
                src={generateVietQRUrl()} 
                alt="VietQR Payment Code"
                style={{ width: '100%', height: 'auto' }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please scan this code using your banking app and complete the payment.
              <br />Your order will be processed once payment is confirmed.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              onClick={verifyPayment}
              disabled={isCheckingPayment || isPaymentVerified}
              sx={{ mt: 2 }}
            >
              {isCheckingPayment ? (
                <CircularProgress size={24} color="inherit" />
              ) : isPaymentVerified ? (
                'Payment Verified ✓'
              ) : (
                'Verify Payment'
              )}
            </Button>
            
            {isPaymentVerified && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Payment verified successfully! You can now complete your order.
              </Alert>
            )}
            
            {paymentError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {paymentError}
              </Alert>
            )}
          </Paper>
        </Grid>
      )}
      
      {/* Cash on delivery section */}
      {paymentMethod === 'cash' && (
        <Grid item xs={12}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            <Typography variant="body1">
              You will pay {formatPrice(total)} when your order is delivered.
            </Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
  
  const getStepContent = (step) => {
    switch (step) {
      case 0: // First step is now Review Order
        return renderOrderReview();
      case 1: // Second step is Shipping Info
        return renderShippingForm();
      case 2: // Third step is Payment Details
        return renderPaymentForm();
      default:
        throw new Error('Unknown step');
    }
  };
  
  const handlePlaceOrder = () => {
    // Submit order to backend
    console.log('Order placed!', {
      shippingInfo,
      paymentMethod,
      cartItems,
      total
    });
    
    // Navigate to order confirmation or show success message
    setActiveStep(activeStep + 1);
  };
  
  return (
    <Base>
    <Container maxWidth="lg" sx={{ mb: 8 }}>
      <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, mt: 4 }}>
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 5, color:'#FFFFFF'}}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {activeStep === steps.length ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Thank you for your order.
          </Typography>
          <Typography variant="subtitle1">
            Your order number is #12345. We will send you an email confirmation,
            and will notify you when your order has shipped.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 3 }}
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePlaceOrder}
              >
                Place order
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Order Summary Card - always visible */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})</Typography>
            <Typography>{formatPrice(subtotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Shipping</Typography>
            <Typography>{formatPrice(shipping)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax</Typography>
            <Typography>{formatPrice(tax)}</Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6" color="primary">
              {formatPrice(total)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
    </Base>
  );

}