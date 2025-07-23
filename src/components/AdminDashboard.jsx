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
  Refresh,
  BarChart,
  PieChart,
  ShowChart,
  MonetizationOn,
  AccountBalance
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import Base from '../base';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
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
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [chartData, setChartData] = useState({
    orderStatus: {},
    paymentStatus: {},
    revenueTrend: {},
    ordersOverTime: {}
  });
  
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

  // Review management states
  const [reviews, setReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewSearchInput, setReviewSearchInput] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  // Refs to maintain focus
  const orderSearchRef = useRef(null);
  const userSearchRef = useRef(null);
  const reviewSearchRef = useRef(null);

  // Debounce search
  const orderSearchTimeout = useRef(null);
  const userSearchTimeout = useRef(null);
  const reviewSearchTimeout = useRef(null);

  // Add after chartData state
  const [reviewChartData, setReviewChartData] = useState({
    ratingDistribution: {},
    reviewsOverTime: {},
    topProducts: {}
  });

  // Add state for product filter
  const [reviewProductFilter, setReviewProductFilter] = useState('all');

  useEffect(() => {
    console.log('🔐 AdminDashboard Auth Check:', {
      isAuthenticated,
      user: user ? { ...user, role: user.role } : null,
      hasToken: !!localStorage.getItem('token'),
      token: localStorage.getItem('token')?.substring(0, 20) + '...'
    });
    
    // Check if user is admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
      console.log('❌ Admin access denied:', {
        isAuthenticated,
        hasUser: !!user,
        userRole: user?.role,
        expectedRole: 'admin'
      });
      navigate('/login');
      return;
    }
    
    console.log('✅ Admin access granted, loading dashboard data...');
    loadDashboardData();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        loadOrders(1), // Always start with page 1 (newest orders)
        loadUsers(),
        loadReviews(),
        loadAnalytics() // Load analytics data for accurate totals
      ]);
      // Reset to page 1 when loading dashboard data
      setOrderPage(1);
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (page = 1) => {
    try {
      console.log('📋 Loading orders for admin dashboard...', {
        page,
        ordersPerPage,
        hasToken: !!localStorage.getItem('token'),
        tokenPreview: localStorage.getItem('token')?.substring(0, 20) + '...'
      });
      
      // Request orders sorted by creation date (newest first)
      const response = await apiService.getAllOrders(page, ordersPerPage, 'createdAt', 'desc');
      
      console.log('✅ Orders loaded successfully:', {
        success: response.success,
        hasData: !!response.data,
        hasResults: !!response.data?.results,
        resultsCount: response.data?.results?.length || 0
      });
      
      if (response.success && response.data?.results && Array.isArray(response.data.results)) {
        // Trust server-side sorting and pagination - do not sort client-side
        // Server already returns orders sorted by createdAt desc (newest first)
        
        setOrders(response.data.results);
        const { results, ...paginationData } = response.data;
        setOrderPagination(paginationData);
        
        setError(''); // Clear previous errors
      } else {
        setOrders([]);
        setError(response.message || 'Không thể tải danh sách đơn hàng hoặc dữ liệu không hợp lệ.');
      }
    } catch (error) {
      console.error('❌ Error loading orders:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setOrders([]);
      setError('Lỗi khi tải danh sách đơn hàng: ' + (error.message || 'Vui lòng thử lại sau.'));
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      // Fix: extract users from response.data.users
      if (response.success && Array.isArray(response.data?.users)) {
        setUsers(response.data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
    }
  };

  const loadReviews = async () => {
    try {
      // Get reviews
      const response = await apiService.getReviews();
      if (response.success && Array.isArray(response.data)) {
        // Check if user and product data are already populated in reviews
        const firstReview = response.data[0];
        const isUserPopulated = firstReview && typeof firstReview.user === 'object' && firstReview.user !== null;
        const isProductPopulated = firstReview && typeof firstReview.product === 'object' && firstReview.product !== null && !!firstReview.product.name;
        // Only fetch users if they're not already populated
        const userIds = isUserPopulated ? [] : [...new Set(response.data.map(review => review.user).filter(Boolean))];
        // Only fetch products if they're not already populated
        const productIds = isProductPopulated ? [] : [...new Set(response.data.map(review => review.product).filter(Boolean))];
        // Fetch product details for all products
        const productsMap = new Map();
        if (productIds.length > 0) {
          try {
            const productsResponse = await apiService.getProducts();
            if (productsResponse.success && Array.isArray(productsResponse.data)) {
              let productsArray = [];
              if (Array.isArray(productsResponse.data)) {
                productsArray = productsResponse.data;
              } else if (productsResponse.data && Array.isArray(productsResponse.data.results)) {
                productsArray = productsResponse.data.results;
              }
              productsArray.forEach(product => {
                if (product._id) productsMap.set(String(product._id), product);
                if (product.id) productsMap.set(String(product.id), product);
              });
            }
          } catch (productError) {
            // Handle error
          }
        }
        // Fetch user details for all users (only if not already populated)
        const usersMap = new Map();
        if (userIds.length > 0) {
          try {
            const usersResponse = await apiService.getAllUsers();
            if (usersResponse.success && Array.isArray(usersResponse.users)) {
              usersResponse.users.forEach(user => {
                usersMap.set(user._id, user);
              });
            }
          } catch (userError) {
            // Handle error
          }
        }
        // Enhance reviews with product and user information
        const enhancedReviews = response.data.map(review => {
          // Handle user data (already populated or needs matching)
          let matchedUser;
          if (isUserPopulated && typeof review.user === 'object' && review.user !== null) {
            matchedUser = review.user;
          } else {
            matchedUser = usersMap.get(review.user);
            if (!matchedUser) {
              matchedUser = usersMap.get(String(review.user));
            }
            if (!matchedUser) {
              matchedUser = Array.from(usersMap.values()).find(user => 
                user._id === review.user || 
                String(user._id) === String(review.user) ||
                user.id === review.user
              );
            }
          }
          // Handle product data (already populated or needs matching)
          let matchedProduct;
          if (isProductPopulated && typeof review.product === 'object' && review.product !== null) {
            matchedProduct = review.product;
          } else {
            matchedProduct = productsMap.get(String(review.product));
            if (!matchedProduct) {
              matchedProduct = Array.from(productsMap.values()).find(product => 
                String(product._id) === String(review.product) ||
                String(product.id) === String(review.product)
              );
            }
          }
          return {
            ...review,
            product: matchedProduct || { name: `Product ID: ${review.product}`, _id: review.product },
            user: matchedUser || { firstName: 'Unknown', lastName: 'User', email: `User ID: ${review.user}`, _id: review.user }
          };
        });
        setReviews(enhancedReviews);
        setTotalReviews(enhancedReviews.length);
      } else {
        setReviews([]);
        setTotalReviews(0);
      }
    } catch (error) {
      setReviews([]);
    }
  };

  const prepareChartData = (analyticsData) => {
    console.log('📊 Preparing chart data with:', analyticsData);
    
    // Generate last 7 days labels and initialize daily data
    const days = [];
    const dailyRevenue = Array(7).fill(0);
    const dailyOrders = Array(7).fill(0);
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }

    // Calculate distributions from actual orders data
    const orderStatusCounts = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    const paymentStatusCounts = {
      pending: 0,
      completed: 0,
      failed: 0,
      processing: 0,
      refunded: 0
    };

    // Use allOrders if available, fallback to current orders
    const ordersToAnalyze = analyticsData.allOrders || orders || [];
    console.log('📋 Analyzing orders for charts:', ordersToAnalyze.length, 'orders');

    ordersToAnalyze.forEach(order => {
      // Count order statuses
      const orderStatus = (order.status || order.orderStatus || 'pending').toLowerCase();
      if (orderStatusCounts.hasOwnProperty(orderStatus)) {
        orderStatusCounts[orderStatus]++;
      } else {
        orderStatusCounts.pending++; // Default to pending for unknown statuses
      }

      // Count payment statuses
      const paymentMethod = (order.paymentMethod || order.payment_method || '').toLowerCase();
      let paymentStatus = (order.paymentStatus || order.payment_status || 'pending').toLowerCase();
      
      // Handle cash payments - they're always considered completed
      if (paymentMethod === 'cash' || paymentMethod === 'cod') {
        paymentStatus = 'completed';
      }
      
      // Map various payment statuses to our categories
      if (paymentStatus === 'paid' || paymentStatus === 'success' || paymentStatus === 'verified') {
        paymentStatusCounts.completed++;
      } else if (paymentStatus === 'completed') {
        paymentStatusCounts.completed++;
      } else if (paymentStatus === 'failed' || paymentStatus === 'error') {
        paymentStatusCounts.failed++;
      } else if (paymentStatus === 'processing') {
        paymentStatusCounts.processing++;
      } else if (paymentStatus === 'refunded') {
        paymentStatusCounts.refunded++;
      } else {
        paymentStatusCounts.pending++; // Default to pending
      }

      // Aggregate daily data for revenue and order trends
      if (order.createdAt) {
        const orderDate = new Date(order.createdAt);
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          if (
            orderDate.getFullYear() === d.getFullYear() &&
            orderDate.getMonth() === d.getMonth() &&
            orderDate.getDate() === d.getDate()
          ) {
            dailyRevenue[i] += order.total || order.totalAmount || 0;
            dailyOrders[i] += 1;
            break;
          }
        }
      }
    });

    console.log('📊 Order status distribution:', orderStatusCounts);
    console.log('💳 Payment status distribution:', paymentStatusCounts);

    // Revenue Trend Chart (last 7 days)
    const revenueTrendData = {
      labels: days,
      datasets: [{
        label: 'Revenue',
        data: dailyRevenue,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    // Orders Over Time Chart (last 7 days)
    const ordersOverTimeData = {
      labels: days,
      datasets: [{
        label: 'Orders',
        data: dailyOrders.map(v => Math.round(v)), // Ensure integer values
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 2
      }]
    };
    
    // Order Status Distribution Chart
    const orderStatusData = {
      labels: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [{
        data: [
          orderStatusCounts.pending,
          orderStatusCounts.confirmed,
          orderStatusCounts.shipped,
          orderStatusCounts.delivered,
          orderStatusCounts.cancelled
        ],
        backgroundColor: [
          '#FF9800', // Orange for pending
          '#2196F3', // Blue for confirmed
          '#9C27B0', // Purple for shipped
          '#4CAF50', // Green for delivered
          '#F44336'  // Red for cancelled
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
    
    // Payment Status Distribution Chart
    const paymentStatusData = {
      labels: ['Pending', 'Completed', 'Failed', 'Processing', 'Refunded'],
      datasets: [{
        data: [
          paymentStatusCounts.pending,
          paymentStatusCounts.completed,
          paymentStatusCounts.failed,
          paymentStatusCounts.processing,
          paymentStatusCounts.refunded
        ],
        backgroundColor: [
          '#FF9800', // Orange for pending
          '#4CAF50', // Green for completed
          '#F44336', // Red for failed
          '#2196F3', // Blue for processing
          '#9C27B0'  // Purple for refunded
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
    
    setChartData({
      orderStatus: orderStatusData,
      paymentStatus: paymentStatusData,
      revenueTrend: revenueTrendData,
      ordersOverTime: ordersOverTimeData
    });
  };

  const loadAnalytics = async () => {
    try {
      console.log("📊 Loading analytics data...");
      const response = await apiService.getAnalytics();
      let allOrders = [];
      
      if (response.success && response.data) {
        console.log("✅ Primary analytics API response:", response.data);
        
        // Use the correct data structure from the analytics response
        const summary = response.data.summary || response.data;
        const orders = response.data.orders || {};
        
        // Handle the data structure you provided: { totalRevenue, pendingOrders, totalOrders }
        const totalRevenue = summary.totalRevenue || response.data.totalRevenue || 0;
        const pendingOrders = summary.pendingOrders || orders.pending || response.data.pendingOrders || 0;
        const totalOrders = summary.totalOrders || orders.total || response.data.totalOrders || 0;
        
        console.log("📈 Setting analytics values:", { totalRevenue, pendingOrders, totalOrders });
        
        setTotalRevenue(totalRevenue);
        setTotalPendingOrders(pendingOrders);
        setTotalOrderCount(totalOrders);
        
        // Fetch all orders for daily aggregation
        const allOrdersResp = await apiService.getAllOrders(1, 1000, 'createdAt', 'desc');
        if (allOrdersResp.success && allOrdersResp.data?.results) {
          allOrders = allOrdersResp.data.results;
        }
        
        // Prepare chart data with allOrders
        prepareChartData({ ...response.data, allOrders });
      } else {
        // If analytics API failed, try fallback method
        console.log("⚠️ Analytics API failed, trying fallback method...");
        const fallbackResponse = await apiService.getAnalyticsFromOrders();
        
        if (fallbackResponse.success && fallbackResponse.data) {
          console.log("✅ Fallback analytics data:", fallbackResponse.data);
          
          const { totalRevenue, pendingOrders, totalOrders } = fallbackResponse.data;
          setTotalRevenue(totalRevenue || 0);
          setTotalPendingOrders(pendingOrders || 0);
          setTotalOrderCount(totalOrders || 0);
          
          // Also try to get all orders for chart data
          try {
            const allOrdersResp = await apiService.getAllOrders(1, 1000, 'createdAt', 'desc');
            if (allOrdersResp.success && allOrdersResp.data?.results) {
              allOrders = allOrdersResp.data.results;
              prepareChartData({ ...fallbackResponse.data, allOrders });
            }
          } catch (orderError) {
            console.warn("Could not fetch orders for chart data:", orderError);
            // Use current orders as fallback
            prepareChartData({ allOrders: orders });
          }
        } else {
          console.error("❌ Both primary and fallback analytics failed");
          // Set default values and prepare charts with current orders
          setTotalRevenue(0);
          setTotalPendingOrders(0);
          setTotalOrderCount(0);
          prepareChartData({ allOrders: orders });
        }
      }
    } catch (error) {
      console.error("❌ Failed to load analytics:", error);
      // Set default values on complete failure but still try to prepare charts
      setTotalRevenue(0);
      setTotalPendingOrders(0);
      setTotalOrderCount(0);
      // Use current orders for chart data as last resort
      prepareChartData({ allOrders: orders });
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
        
        // Refresh analytics to update totals
        await loadAnalytics();
        
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

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      if (!orderId) {
        setError('Không thể cập nhật: Order ID không hợp lệ');
        return;
      }
      
      // Call API to update payment status
      const response = await apiService.updatePaymentStatus(orderId, newPaymentStatus);
      if (response.success) {
        // Update local state immediately for better UX
        setOrders(orders.map(order => 
          (order._id === orderId || order.id === orderId) ? { 
            ...order, 
            paymentStatus: newPaymentStatus,
            payment_status: newPaymentStatus 
          } : order
        ));
        
        // Update selected order in 
        setSelectedOrder(prev => ({
          ...prev,
          paymentStatus: newPaymentStatus,
          payment_status: newPaymentStatus
        }));
        
        setError(''); // Clear any previous errors
        
        // Show success message
        setSuccessMessage('Cập nhật trạng thái thanh toán thành công!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
        
        // Refresh orders data from server to ensure consistency
        await loadOrders(orderPage);
        
        // Refresh analytics to update totals
        await loadAnalytics();
      } else {
        setError('Cập nhật trạng thái thanh toán thất bại');
      }
    } catch (error) {
      setError('Lỗi khi cập nhật trạng thái thanh toán: ' + (error.message || 'Vui lòng thử lại'));
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

  // Helper function to get the correct order reference
  const getOrderReference = (order) => {
    // Priority: orderRef > orderNumber > _id
    const ref = order.orderRef || order.orderNumber || order._id || order.id;
    
    // Debug log if there's a mismatch
    if (order.orderRef && order.orderNumber && order.orderRef !== order.orderNumber) {
      console.warn('OrderRef mismatch detected in admin:', {
        orderRef: order.orderRef,
        orderNumber: order.orderNumber,
        using: order.orderRef
      });
    }
    
    return ref;
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
      'completed': 'success',
      'success': 'success',
      'verified': 'success',
      'pending': 'warning',
      'processing': 'info',
      'failed': 'error',
      'cancelled': 'error',
      'refunded': 'info',
      'cash': 'success' // Cash payments are considered successful
    };
    return colors[status] || 'default';
  };

  // Helper function to format payment method and status
  const formatPaymentInfo = (order) => {
    const paymentMethod = order.paymentMethod || order.payment_method || 'Unknown';
    const paymentStatus = order.paymentStatus || order.payment_status || 'pending';
    
    // Special handling for different payment methods
    if (paymentMethod.toLowerCase() === 'cash' || paymentMethod.toLowerCase() === 'cod') {
      return 'Cash';
    }
    
    if (paymentMethod.toLowerCase().includes('vietqr') || paymentMethod.toLowerCase().includes('qr')) {
      return paymentStatus === 'pending' ? 'VietQR (Pending)' : 'VietQR (Paid)';
    }
    
    if (paymentMethod.toLowerCase().includes('bank')) {
      return `Bank Transfer (${paymentStatus})`;
    }
    
    // Default format: Method (Status)
    if (paymentMethod !== 'Unknown') {
      return `${paymentMethod} (${paymentStatus})`;
    }
    
    return paymentStatus || 'Pending';
  };

  // Helper function to get payment status for color coding
  const getPaymentStatusForColor = (order) => {
    const paymentMethod = order.paymentMethod || order.payment_method || '';
    const paymentStatus = order.paymentStatus || order.payment_status || 'pending';
    
    // Cash payments are always successful
    if (paymentMethod.toLowerCase() === 'cash' || paymentMethod.toLowerCase() === 'cod') {
      return 'cash';
    }
    
    return paymentStatus;
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
      const orderReference = getOrderReference(order);
      const matchesSearch = orderReference?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
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

  // Update filteredReviews to include product filter
  const filteredReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return reviews.filter(review => {
      const matchesProduct =
        reviewProductFilter === 'all' ||
        (typeof review.product === 'object'
          ? review.product?.name === reviewProductFilter
          : review.product === reviewProductFilter);
      const matchesFilter = reviewFilter === 'all' || review.rating === parseInt(reviewFilter);
      if (!reviewSearchTerm.trim()) return matchesProduct && matchesFilter;
      const matchesSearch =
        (review.comment || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        (review.user?.firstName || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        (review.user?.lastName || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
        (typeof review.product === 'object' && review.product?.name
          ? review.product.name
          : '').toLowerCase().includes(reviewSearchTerm.toLowerCase());
      return matchesProduct && matchesFilter && matchesSearch;
    });
  }, [reviews, reviewFilter, reviewSearchTerm, reviewProductFilter]);

  const paginatedReviews = useMemo(() => {
    return filteredReviews.slice(
      (reviewPage - 1) * reviewsPerPage,
      reviewPage * reviewsPerPage
    );
  }, [filteredReviews, reviewPage, reviewsPerPage]);

  // Calculate analytics from orders (for current page only)
  const currentPageRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
  }, [orders]);
  
  const currentPagePendingOrders = useMemo(() => {
    return orders.filter(order => (order.status || order.orderStatus) === 'pending').length;
  }, [orders]);

  const handleOrderPageChange = (event, newPage) => {
    setOrderPage(newPage);
    // Load orders for the new page - server will handle sorting (newest first)
    loadOrders(newPage);
  };

  const handleCleanupExpiredOrders = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const response = await apiService.cleanupExpiredOrders();
      
      if (response.success) {
        setSuccessMessage(`Successfully cleaned up ${response.cleanedCount || 0} expired orders`);
        // Reload orders to reflect the changes
        await loadOrders(orderPage);
      } else {
        setError(response.message || 'Failed to cleanup expired orders');
      }
    } catch (error) {
      console.error('Error cleaning up expired orders:', error);
      setError('Error cleaning up expired orders: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
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

  // Review search handlers
  const handleReviewSearch = (searchTerm) => {
    setReviewSearchTerm(searchTerm);
    setReviewPage(1);
  };

  const handleReviewSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (reviewSearchTimeout.current) {
        clearTimeout(reviewSearchTimeout.current);
      }
      handleReviewSearch(reviewSearchInput);
    }
  };

  const handleReviewSearchInputChange = (e) => {
    const value = e.target.value;
    setReviewSearchInput(value);
    
    if (reviewSearchTimeout.current) {
      clearTimeout(reviewSearchTimeout.current);
    }
  };

  // Prepare review chart data
  const prepareReviewChartData = useCallback(() => {
    // 1. Rating Distribution
    const ratingCounts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 stars
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++;
    });

    // 2. Reviews Over Time (by month)
    const reviewsByMonth = {};
    reviews.forEach(r => {
      const date = new Date(r.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      reviewsByMonth[key] = (reviewsByMonth[key] || 0) + 1;
    });

    // 3. Top Reviewed Products
    const productCounts = {};
    reviews.forEach(r => {
      const name = typeof r.product === 'object' && r.product?.name ? r.product.name : r.product;
      if (name) productCounts[name] = (productCounts[name] || 0) + 1;
    });
    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      ratingDistribution: {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
          data: ratingCounts,
          backgroundColor: ['#F44336', '#FF9800', '#FFEB3B', '#4CAF50', '#2196F3'],
        }]
      },
      reviewsOverTime: {
        labels: Object.keys(reviewsByMonth),
        datasets: [{
          label: 'Reviews',
          data: Object.values(reviewsByMonth),
          backgroundColor: '#2196F3'
        }]
      },
      topProducts: {
        labels: topProducts.map(([name]) => name),
        datasets: [{
          label: 'Reviews',
          data: topProducts.map(([, count]) => count),
          backgroundColor: '#4CAF50'
        }]
      }
    };
  }, [reviews]);

  useEffect(() => {
    setReviewChartData(prepareReviewChartData());
  }, [reviews, prepareReviewChartData]);

  // Update charts when orders data changes
  useEffect(() => {
    if (orders.length > 0) {
      console.log('🔄 Orders data changed, updating charts with', orders.length, 'orders');
      prepareChartData({ allOrders: orders });
    }
  }, [orders]);

  const AnalyticsCards = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <ShoppingCart sx={{ fontSize: 40, color: '#39095D', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalOrderCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Orders
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <AccountBalance sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
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
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalPendingOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Orders
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center">
              <BarChart sx={{ fontSize: 40, color: '#9C27B0', mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {totalReviews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reviews
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const AnalyticsTab = () => (
    <Box>
      {/* Key Metrics Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {totalOrderCount > 0 ? Math.round((totalOrderCount / users.length) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orders per User
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                {totalOrderCount > 0 ? formatPrice(totalRevenue / totalOrderCount) : formatPrice(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue per Order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pending Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                {totalOrderCount > 0 ? Math.round((totalPendingOrders / totalOrderCount) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orders Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Completion Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                {totalOrderCount > 0 ? Math.round(((totalOrderCount - totalPendingOrders) / totalOrderCount) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Orders Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PieChart sx={{ mr: 1 }} />
              Order Status Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {chartData.orderStatus.labels ? (
                <Pie 
                  data={chartData.orderStatus}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              ) : (
                <CircularProgress />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PieChart sx={{ mr: 1 }} />
              Payment Status Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {chartData.paymentStatus.labels ? (
                <Doughnut 
                  data={chartData.paymentStatus}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              ) : (
                <CircularProgress />
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ShowChart sx={{ mr: 1 }} />
              Revenue Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.revenueTrend.labels ? (
                <Line 
                  data={chartData.revenueTrend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 2000000, // Set max to 6 million
                        ticks: {
                          callback: function(value) {
                            return formatPrice(value);
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <BarChart sx={{ mr: 1 }} />
              Orders Over Time
            </Typography>
            <Box sx={{ height: 300 }}>
              {chartData.ordersOverTime.labels ? (
                <Bar 
                  data={chartData.ordersOverTime}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          callback: function(value) {
                            if (Number.isInteger(value)) {
                              return value;
                            }
                            return null;
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </Box>
  );

  const OrdersTab = () => (
    <Box>
      {/* AnalyticsTab content at the top of OrdersTab */}
      <AnalyticsTab />
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
          onClick={() => loadOrders(orderPage)}
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
        
        <Button
          startIcon={<Delete />}
          onClick={handleCleanupExpiredOrders}
          variant="contained"
          size="small"
          color="warning"
          sx={{ ml: 'auto' }}
        >
          Cleanup Expired Orders
        </Button>
      </Box>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Orders Table */}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Ref</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
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
                  <TableCell>{getOrderReference(order)}</TableCell>
                  <TableCell>{`${order.shippingInfo?.firstName || order.shippingAddress?.firstName || order.user?.firstName || 'N/A'} ${order.shippingInfo?.lastName || order.shippingAddress?.lastName || order.user?.lastName || ''}`}</TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 200 }}>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                            {item.name || item.title || 'Product'} x{item.quantity || 1}
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          No items
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
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
                      label={formatPaymentInfo(order)}
                      color={getPaymentStatusColor(getPaymentStatusForColor(order))}
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
                <TableCell colSpan={8} align="center">
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

  const ReviewsTab = () => (
    <Box>
      {/* Review Analytics Graphs */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Rating Distribution</Typography>
                {reviewChartData.ratingDistribution.labels ? (
                  <Pie data={reviewChartData.ratingDistribution} />
                ) : (
                  <CircularProgress />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Reviews Over Time</Typography>
                {reviewChartData.reviewsOverTime.labels ? (
                  <Bar data={reviewChartData.reviewsOverTime} />
                ) : (
                  <CircularProgress />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Reviewed Products</Typography>
                {reviewChartData.topProducts.labels ? (
                  <Bar data={reviewChartData.topProducts} />
                ) : (
                  <CircularProgress />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      {/* Review Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          ref={reviewSearchRef}
          placeholder="Tìm kiếm đánh giá... (Nhấn Enter để tìm)"
          value={reviewSearchInput}
          onChange={handleReviewSearchInputChange}
          onKeyPress={handleReviewSearchKeyPress}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          size="small"
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Product</InputLabel>
          <Select
            value={reviewProductFilter}
            onChange={(e) => setReviewProductFilter(e.target.value)}
            label="Product"
          >
            <MenuItem value="all">All Products</MenuItem>
            {Array.from(new Set(reviews.map(r =>
              typeof r.product === 'object' && r.product?.name
                ? r.product.name
                : r.product
            ))).map((name, idx) => (
              <MenuItem key={idx} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Rating</InputLabel>
          <Select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value)}
            label="Rating"
          >
            <MenuItem value="all">All Ratings</MenuItem>
            <MenuItem value="5">5 Stars</MenuItem>
            <MenuItem value="4">4 Stars</MenuItem>
            <MenuItem value="3">3 Stars</MenuItem>
            <MenuItem value="2">2 Stars</MenuItem>
            <MenuItem value="1">1 Star</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          startIcon={<Refresh />}
          onClick={() => loadReviews()}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
        
        {reviewSearchTerm && (
          <Button
            onClick={() => {
              setReviewSearchTerm('');
              setReviewSearchInput('');
              setReviewPage(1);
            }}
            variant="outlined"
            size="small"
            color="secondary"
          >
            Clear Search
          </Button>
        )}
      </Box>

      {/* Reviews Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <TableRow key={review._id} hover>
                  <TableCell>
                    {`${review.user?.firstName || ''} ${review.user?.lastName || ''}`}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {review.user?.email || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {typeof review.product === 'object' && review.product?.name 
                        ? review.product.name 
                        : `Product ID: ${typeof review.product === 'object' ? review.product?._id || review.product?.id : review.product || 'Unknown'}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, index) => (
                        <Box
                          key={index}
                          component="span"
                          sx={{
                            color: index < review.rating ? '#FFD700' : '#ddd',
                            fontSize: '1rem'
                          }}
                        >
                          ★
                        </Box>
                      ))}
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({review.rating}/5)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {review.comment || 'No comment'}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(review.createdAt)}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setSelectedReview(review);
                        setReviewDialogOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this review?')) {
                          try {
                            await apiService.deleteReview(review._id);
                            setSuccessMessage('Review deleted successfully!');
                            setTimeout(() => setSuccessMessage(''), 3000);
                            loadReviews();
                          } catch (error) {
                            setError('Failed to delete review');
                          }
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No reviews found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredReviews.length / reviewsPerPage)}
          page={reviewPage}
          onChange={(e, page) => setReviewPage(page)}
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
        <Typography variant="h4" gutterBottom sx={{ color: '#FFF', fontWeight: 'bold' }}>
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
            <Tab label="Reviews" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <OrdersTab />}
            {activeTab === 1 && <UsersTab />}
            {activeTab === 2 && <ReviewsTab />}
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
            Order Details - #{selectedOrder ? getOrderReference(selectedOrder) : 'N/A'}
          </DialogTitle>
                    <DialogContent>
            {selectedOrder && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Order Information</Typography>
                    <Typography><strong>Status:</strong> {selectedOrder.status || selectedOrder.orderStatus || 'N/A'}</Typography>
                    <Typography><strong>Payment Method:</strong> {selectedOrder.paymentMethod || selectedOrder.payment_method || 'N/A'}</Typography>
                    <Typography><strong>Payment Status:</strong> {selectedOrder.paymentStatus || selectedOrder.payment_status || 'N/A'}</Typography>
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
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {item.name || item.title || item.productName || 'Unknown Product'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity || 1} × {formatPrice(item.price || 0)}
                            </Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="medium">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No items found in this order
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Update Order Status</InputLabel>
                      <Select
                        value={selectedOrder.status || selectedOrder.orderStatus || 'pending'}
                        onChange={(e) => {
                          const orderId = selectedOrder._id || selectedOrder.id;
                          handleOrderStatusUpdate(orderId, e.target.value);
                        }}
                        label="Update Order Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Update Payment Status</InputLabel>
                      <Select
                        value={selectedOrder.paymentStatus || selectedOrder.payment_status || 'pending'}
                        onChange={(e) => {
                          const orderId = selectedOrder._id || selectedOrder.id;
                          handlePaymentStatusUpdate(orderId, e.target.value);
                        }}
                        label="Update Payment Status"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="verified">Verified</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="refunded">Refunded</MenuItem>
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

        {/* Review Detail Dialog */}
        <Dialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Review Details
          </DialogTitle>
          <DialogContent>
            {selectedReview && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>User Information</Typography>
                    <Typography><strong>Name:</strong> {`${selectedReview.user?.firstName || ''} ${selectedReview.user?.lastName || ''}`}</Typography>
                    <Typography><strong>Email:</strong> {selectedReview.user?.email || 'N/A'}</Typography>
                    <Typography><strong>Phone:</strong> {selectedReview.user?.phoneNumber || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>Product Information</Typography>
                    <Typography><strong>Product:</strong> {typeof selectedReview.product === 'object' && selectedReview.product?.name 
                      ? selectedReview.product.name 
                      : `Product ID: ${typeof selectedReview.product === 'object' ? selectedReview.product?._id || selectedReview.product?.id : selectedReview.product || 'Unknown'}`}</Typography>
                    <Typography><strong>Price:</strong> {selectedReview.product?.price ? formatPrice(selectedReview.product.price) : 'N/A'}</Typography>
                    <Typography><strong>Category:</strong> {selectedReview.product?.category || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Review Details</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" sx={{ mr: 2 }}><strong>Rating:</strong></Typography>
                      {[...Array(5)].map((_, index) => (
                        <Box
                          key={index}
                          component="span"
                          sx={{
                            color: index < selectedReview.rating ? '#FFD700' : '#ddd',
                            fontSize: '1.5rem'
                          }}
                        >
                          ★
                        </Box>
                      ))}
                      <Typography variant="body1" sx={{ ml: 1 }}>
                        ({selectedReview.rating}/5)
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Comment:</strong>
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                      <Typography variant="body1">
                        {selectedReview.comment || 'No comment provided'}
                      </Typography>
                    </Box>
                    <Typography><strong>Date:</strong> {formatDate(selectedReview.createdAt)}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Base>
  );
};

export default AdminDashboard; 