import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import { ShoppingBag, AccessTime, CheckCircle, LocalShipping, AttachMoney } from '@mui/icons-material';
import Base from '../base';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getMyOrders();
      
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <AccessTime sx={{ fontSize: 16 }} />;
      case 'confirmed':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'shipped':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      default:
        return <ShoppingBag sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Base>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your orders...
          </Typography>
        </Container>
      </Base>
    );
  }

  return (
    <Base>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#39095D', fontWeight: 'bold' }}>
          My Orders
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={fetchOrders} sx={{ ml: 1 }}>
              Retry
            </Button>
          </Alert>
        )}

        {orders.length === 0 && !error ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
              You haven't placed any orders yet.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/mainmenu')}
              sx={{ 
                backgroundColor: '#39095D',
                '&:hover': { backgroundColor: '#4c1275' }
              }}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Order #{order.orderRef}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Placed on {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <br />
                        <Chip
                          icon={<AttachMoney sx={{ fontSize: 16 }} />}
                          label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          color={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" gutterBottom>
                          Items ({order.items.length})
                        </Typography>
                        {order.items.slice(0, 3).map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            {item.image && (
                              <Box
                                component="img"
                                src={item.image}
                                alt={item.name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  mr: 2
                                }}
                              />
                            )}
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2">
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                        {order.items.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{order.items.length - 3} more items
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Order Total
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#39095D', fontWeight: 'bold' }}>
                            {formatPrice(order.total)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Payment: {order.paymentMethod === 'vietqr' ? 'VietQR' : 'Cash on Delivery'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Shipping to:</strong> {order.shippingInfo.firstName} {order.shippingInfo.lastName}, {order.shippingInfo.address}, {order.shippingInfo.city}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Base>
  );
};

export default Orders; 