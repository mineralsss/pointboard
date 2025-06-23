import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Pagination
} from '@mui/material';
import {
  Dashboard,
  ShoppingCart,
  People,
  AttachMoney,
  TrendingUp,
  Edit,
  Visibility,
  Delete,
  Search,
  Refresh
} from '@mui/icons-material';
import Base from '../base';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Order management states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [ordersPerPage] = useState(10);
  
  // User management states
  const [userFilter, setUserFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    loadDashboardData();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        loadOrders(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await apiService.getAllOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to user orders if admin endpoint fails
      try {
        const userOrdersResponse = await apiService.getMyOrders();
        if (userOrdersResponse.success) {
          setOrders(userOrdersResponse.data || []);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Set empty users array if endpoint fails
      setUsers([]);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        setOrderDialogOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
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

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'confirmed': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'paid': 'success',
      'pending': 'warning',
      'failed': 'error'
    };
    return colors[status] || 'default';
  };

  // Filter and search functions
  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = order.orderRef?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                         `${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || ''}`.toLowerCase().includes(orderSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredUsers = users.filter(user => {
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    const matchesSearch = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Pagination
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage
  );

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage
  );

  // Calculate analytics from orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  const AnalyticsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <ShoppingCart sx={{ fontSize: 40, color: '#39095D', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {orders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <AttachMoney sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <People sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {pendingOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Orders
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const OrdersTab = () => (
    <Box>
      {/* Order Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search orders..."
          value={orderSearchTerm}
          onChange={(e) => setOrderSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          size="small"
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          startIcon={<Refresh />}
          onClick={loadOrders}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>#{order.orderRef}</TableCell>
                <TableCell>
                  {order.shippingInfo ? 
                    `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}` : 
                    'Guest User'
                  }
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{formatPrice(order.total)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                    color={getPaymentStatusColor(order.paymentStatus)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedOrder(order);
                      setOrderDialogOpen(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredOrders.length / ordersPerPage)}
          page={orderPage}
          onChange={(e, page) => setOrderPage(page)}
          color="primary"
        />
      </Box>
    </Box>
  );

  const UsersTab = () => (
    <Box>
      {/* User Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          size="small"
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            label="Role"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          startIcon={<Refresh />}
          onClick={loadUsers}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isVerified ? 'Verified' : 'Unverified'}
                    color={user.isVerified ? 'success' : 'warning'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredUsers.length / usersPerPage)}
          page={userPage}
          onChange={(e, page) => setUserPage(page)}
          color="primary"
        />
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Base>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading admin dashboard...
          </Typography>
        </Container>
      </Base>
    );
  }

  return (
    <Base>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#39095D', fontWeight: 'bold' }}>
          <Dashboard sx={{ mr: 2, verticalAlign: 'bottom' }} />
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={loadDashboardData} sx={{ ml: 1 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Analytics Cards */}
        <AnalyticsCards />

        {/* Tabs */}
        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Orders" />
            <Tab label="Users" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <OrdersTab />}
            {activeTab === 1 && <UsersTab />}
          </Box>
        </Paper>

        {/* Order Detail Dialog */}
        <Dialog
          open={orderDialogOpen}
          onClose={() => setOrderDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Order Details - #{selectedOrder?.orderRef}
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
                    <Typography><strong>Payment:</strong> {selectedOrder.paymentStatus}</Typography>
                    <Typography><strong>Total:</strong> {formatPrice(selectedOrder.total)}</Typography>
                    <Typography><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Shipping Information</Typography>
                    <Typography><strong>Name:</strong> {selectedOrder.shippingInfo?.firstName} {selectedOrder.shippingInfo?.lastName}</Typography>
                    <Typography><strong>Address:</strong> {selectedOrder.shippingInfo?.address}</Typography>
                    <Typography><strong>City:</strong> {selectedOrder.shippingInfo?.city}</Typography>
                    <Typography><strong>Phone:</strong> {selectedOrder.shippingInfo?.phone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Items</Typography>
                    {selectedOrder.items?.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>{item.name} x {item.quantity}</Typography>
                        <Typography>{formatPrice(item.price * item.quantity)}</Typography>
                      </Box>
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Update Status</InputLabel>
                      <Select
                        value={selectedOrder.status}
                        onChange={(e) => handleOrderStatusUpdate(selectedOrder._id, e.target.value)}
                        label="Update Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOrderDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Base>
  );
};

export default AdminDashboard; 