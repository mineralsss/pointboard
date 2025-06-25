import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [successMessage, setSuccessMessage] = useState('');
  
  // Order management states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderSearchInput, setOrderSearchInput] = useState(''); // Separate input state
  const [orderPage, setOrderPage] = useState(1);
  const [orderPagination, setOrderPagination] = useState({
    totalPages: 1,
  });
  const [ordersPerPage] = useState(10);
  
  // User management states
  const [userFilter, setUserFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchInput, setUserSearchInput] = useState(''); // Separate input state
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Refs to maintain focus
  const orderSearchRef = useRef(null);
  const userSearchRef = useRef(null);

  // Debounce search
  const orderSearchTimeout = useRef(null);
  const userSearchTimeout = useRef(null);

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    loadDashboardData();
  }, [isAuthenticated, user, navigate]);

  // Debug logging for selectedOrder


  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        loadOrders(orderPage), // Pass current page
        loadUsers()
      ]);
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (page = 1) => {
    try {
      const response = await apiService.getAllOrders(page, ordersPerPage);
      
      if (response.success && response.data?.results && Array.isArray(response.data.results)) {
        // Debug: Check if status field exists in the data
        // console.log('Orders from API:', response.data.results.map(order => ({
        //   id: order._id || order.id,
        //   status: order.status,
        //   orderRef: order.orderRef || order.orderNumber,
        //   allKeys: Object.keys(order)
        // })));
        
        setOrders(response.data.results);
        const { results, ...paginationData } = response.data;
        setOrderPagination(paginationData);
        setError(''); // Clear previous errors
      } else {
        setOrders([]);
        setError(response.message || 'Không thể tải danh sách đơn hàng hoặc dữ liệu không hợp lệ.');
      }
    } catch (error) {
      setOrders([]);
      setError('Lỗi khi tải danh sách đơn hàng: ' + (error.message || 'Vui lòng thử lại sau.'));
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      if (response.success && Array.isArray(response.users)) {
        setUsers(response.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      // Set empty users array if endpoint fails
      setUsers([]);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      
      if (!orderId) {
        setError('Không thể cập nhật: Order ID không hợp lệ');
        return;
      }
      
      // Check if new status is different from current status
      const currentStatus = selectedOrder?.status || selectedOrder?.orderStatus;
      if (selectedOrder && currentStatus === newStatus) {
        setError('Trạng thái mới phải khác với trạng thái hiện tại');
        return;
      }
      
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        // Update local state immediately for better UX
        setOrders(orders.map(order => 
          (order._id === orderId || order.id === orderId) ? { ...order, status: newStatus } : order
        ));
        
        // Close dialog and clear selection
        setOrderDialogOpen(false);
        setSelectedOrder(null);
        setError(''); // Clear any previous errors
        
        // Refresh orders data from server to ensure consistency
        await loadOrders(orderPage);
        
        // Show success message
        setSuccessMessage('Cập nhật trạng thái đơn hàng thành công!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
      } else {
        setError('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      setError('Lỗi khi cập nhật trạng thái đơn hàng');
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

  // Filter and search functions (client-side, will operate on the current page of data)
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    return orders.filter(order => {
      const orderStatus = order.status || order.orderStatus;
      const matchesFilter = orderFilter === 'all' || orderStatus === orderFilter;
      
      // Only apply search filter if there's actually a search term
      if (!orderSearchTerm.trim()) {
        return matchesFilter;
      }
      
      // Handle different possible data structures for customer info
      const customerName = `${order.shippingInfo?.firstName || order.shippingAddress?.firstName || order.user?.firstName || ''} ${order.shippingInfo?.lastName || order.shippingAddress?.lastName || order.user?.lastName || ''}`;
      const matchesSearch = order.orderRef?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                           order.orderNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                           customerName.toLowerCase().includes(orderSearchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, orderFilter, orderSearchTerm]);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    return users.filter(user => {
      const matchesFilter = userFilter === 'all' || user.role === userFilter;
      
      // Only apply search filter if there's actually a search term
      if (!userSearchTerm.trim()) {
        return matchesFilter;
      }
      
      const matchesSearch = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                           (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [users, userFilter, userSearchTerm]);

  // Pagination is now handled by server, so we don't slice the array
  const paginatedOrders = filteredOrders;

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (userPage - 1) * usersPerPage,
      userPage * usersPerPage
    );
  }, [filteredUsers, userPage, usersPerPage]);

  // Calculate analytics from orders
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
  }, [orders]);
  
  const pendingOrders = useMemo(() => {
    return orders.filter(order => (order.status || order.orderStatus) === 'pending').length;
  }, [orders]);

  const handleOrderPageChange = (event, newPage) => {
    setOrderPage(newPage);
    loadOrders(newPage);
  };

  // Search handlers
  const handleOrderSearch = (searchTerm) => {
    setOrderSearchTerm(searchTerm);
    setOrderPage(1); // Reset to first page when searching
  };

  const handleUserSearch = (searchTerm) => {
    setUserSearchTerm(searchTerm);
    setUserPage(1); // Reset to first page when searching
  };

  const handleOrderSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Clear any pending debounce
      if (orderSearchTimeout.current) {
        clearTimeout(orderSearchTimeout.current);
      }
      handleOrderSearch(orderSearchInput);
    }
  };

  const handleUserSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Clear any pending debounce
      if (userSearchTimeout.current) {
        clearTimeout(userSearchTimeout.current);
      }
      handleUserSearch(userSearchInput);
    }
  };

  // Optional: Auto search with debounce (alternative to Enter-only search)
  const handleOrderSearchInputChange = (e) => {
    const value = e.target.value;
    setOrderSearchInput(value);
    
    // Clear previous timeout
    if (orderSearchTimeout.current) {
      clearTimeout(orderSearchTimeout.current);
    }
    
    // Set new timeout for auto search (optional - commented out for now)
    // orderSearchTimeout.current = setTimeout(() => {
    //   handleOrderSearch(value);
    // }, 800);
  };

  const handleUserSearchInputChange = (e) => {
    const value = e.target.value;
    setUserSearchInput(value);
    
    // Clear previous timeout
    if (userSearchTimeout.current) {
      clearTimeout(userSearchTimeout.current);
    }
    
    // Set new timeout for auto search (optional - commented out for now)
    // userSearchTimeout.current = setTimeout(() => {
    //   handleUserSearch(value);
    // }, 800);
  };

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
          ref={orderSearchRef}
          placeholder="Tìm kiếm đơn hàng... (Nhấn Enter để tìm)"
          value={orderSearchInput}
          onChange={handleOrderSearchInputChange}
          onKeyPress={handleOrderSearchKeyPress}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          size="small"
          sx={{ minWidth: 250 }}
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
          onClick={() => loadOrders()}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
        
        {orderSearchTerm && (
          <Button
            onClick={() => {
              setOrderSearchTerm('');
              setOrderSearchInput('');
              setOrderPage(1);
            }}
            variant="outlined"
            size="small"
            color="secondary"
          >
            Clear Search
          </Button>
        )}
      </Box>

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Ref</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order._id || order.id} hover>
                  <TableCell>{order.orderRef || order.orderNumber}</TableCell>
                  <TableCell>{`${order.shippingInfo?.firstName || order.shippingAddress?.firstName || order.user?.firstName || 'N/A'} ${order.shippingInfo?.lastName || order.shippingAddress?.lastName || order.user?.lastName || ''}`}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatPrice(order.total || order.totalAmount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status || order.orderStatus || 'N/A'}
                      color={getStatusColor(order.status || order.orderStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus}
                      color={getPaymentStatusColor(order.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => { 
                      setSelectedOrder(order); 
                      setOrderDialogOpen(true);
                      setError(''); // Clear any previous errors
                      setSuccessMessage(''); // Clear any previous success messages
                    }}>
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {loading ? 'Đang tải dữ liệu...' : 'Không có đơn hàng nào để hiển thị'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center">
        <Pagination
          count={orderPagination.totalPages}
          page={orderPage}
          onChange={handleOrderPageChange}
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
          ref={userSearchRef}
          placeholder="Tìm kiếm người dùng... (Nhấn Enter để tìm)"
          value={userSearchInput}
          onChange={handleUserSearchInputChange}
          onKeyPress={handleUserSearchKeyPress}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          size="small"
          sx={{ minWidth: 250 }}
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
          onClick={() => loadUsers()}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
        
        {userSearchTerm && (
          <Button
            onClick={() => {
              setUserSearchTerm('');
              setUserSearchInput('');
              setUserPage(1);
            }}
            variant="outlined"
            size="small"
            color="secondary"
          >
            Clear Search
          </Button>
        )}
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
            {paginatedUsers.map((user, index) => (
              <TableRow key={user._id || user.id || index}>
                <TableCell>{`${user.firstName || ''} ${user.lastName || ''}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
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
            <Button onClick={() => loadDashboardData()} sx={{ ml: 1 }}>
              Retry
            </Button>
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
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
            Order Details - #{selectedOrder?.orderRef || selectedOrder?.orderNumber}
          </DialogTitle>
                    <DialogContent>
            {selectedOrder && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Typography><strong>Status:</strong> {selectedOrder.status || selectedOrder.orderStatus || 'N/A'}</Typography>
                    <Typography><strong>Payment:</strong> {selectedOrder.paymentStatus || 'N/A'}</Typography>
                    <Typography><strong>Total:</strong> {formatPrice(selectedOrder.total || selectedOrder.totalAmount || 0)}</Typography>
                    <Typography><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Shipping Information</Typography>
                    <Typography><strong>Name:</strong> {`${selectedOrder.shippingInfo?.firstName || selectedOrder.shippingAddress?.firstName || selectedOrder.user?.firstName || ''} ${selectedOrder.shippingInfo?.lastName || selectedOrder.shippingAddress?.lastName || selectedOrder.user?.lastName || ''}`}</Typography>
                    <Typography><strong>Address:</strong> {selectedOrder.shippingInfo?.address || selectedOrder.shippingAddress?.address || 'N/A'}</Typography>
                    <Typography><strong>City:</strong> {selectedOrder.shippingInfo?.city || selectedOrder.shippingAddress?.city || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {selectedOrder.shippingInfo?.phone || selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || 'N/A'}</Typography>
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
                        value={selectedOrder.status || selectedOrder.orderStatus || 'pending'}
                        onChange={(e) => {
                          const orderId = selectedOrder._id || selectedOrder.id;
                          handleOrderStatusUpdate(orderId, e.target.value);
                        }}
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