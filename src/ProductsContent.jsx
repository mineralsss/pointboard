import React, { useState, useEffect, useReducer } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Divider
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import Rating from '@mui/material/Rating';
import { useCart } from './contexts/CartContext';
import { useCartUpdate } from './contexts/CartUpdateContext';
import apiService from './services/api';
import { useAuth } from './contexts/AuthContext';

function ProductsContent() {
  const { addToCart, removeFromCart, cartItems, updateQuantity } = useCart();
  const { forceUpdate: forceBaseUpdate } = useCartUpdate(); // Get base update function
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Modal state for image popup
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use useReducer for local component re-render
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Add state for new review
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Add state for modal reviews and rating
  const [modalReviews, setModalReviews] = useState([]);
  const [modalRating, setModalRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();

  // Fetch products from backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const res = await apiService.getProducts();
        let productsArr = [];
        if (Array.isArray(res)) {
          productsArr = res;
        } else if (Array.isArray(res.data?.results)) {
          productsArr = res.data.results;
        } else if (Array.isArray(res.data?.docs)) {
          productsArr = res.data.docs;
        } else if (Array.isArray(res.data)) {
          productsArr = res.data;
        } else if (Array.isArray(res.products)) {
          productsArr = res.products;
        } else if (res && typeof res === 'object') {
          const arr = Object.values(res).find(v => Array.isArray(v));
          if (arr) productsArr = arr;
        }
        productsArr = productsArr.map(p => ({ ...p, _id: p._id || p.id }));

        // Fetch reviews for each product and add avgRating/reviewCount
        const productsWithReviews = await Promise.all(productsArr.map(async (product) => {
          try {
            const reviewsRes = await apiService.getReviews({ product: product._id });
            const reviews = reviewsRes.data || [];
            const reviewCount = reviews.length;
            const avgRating = reviewCount > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) : 0;
            return { ...product, avgRating, reviewCount };
          } catch (e) {
            return { ...product, avgRating: 0, reviewCount: 0 };
          }
        }));
        setProducts(productsWithReviews);
      } catch (err) {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // When modal opens, fetch reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedProduct) return;
      setReviewsLoading(true);
      try {
        const reviewsRes1 = await apiService.getReviews({ product: selectedProduct._id });
        const productReviews = reviewsRes1.data || [];
        setModalReviews(productReviews);
        if (productReviews.length > 0) {
          const avg = (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1) * 1;
          setModalRating(avg);
        } else {
          setModalRating(0);
        }
      } catch (err) {
        setModalReviews([]);
        setModalRating(0);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [selectedProduct]);

  // Force re-render when cartItems change
  useEffect(() => {
    forceUpdate();
    forceBaseUpdate(); // Also update Base component
  }, [cartItems, forceBaseUpdate]);

  // Get quantity of item in cart
  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã hết hàng',
        severity: 'error'
      });
      return;
    }

    addToCart(product, quantity);
    forceUpdate(); // Force local re-render
    forceBaseUpdate(); // Force Base component re-render
    setSnackbar({
      open: true,
      message: `Đã thêm ${product.name} vào giỏ hàng`,
      severity: 'success'
    });
  };

  const handleRemoveFromCart = (product) => {
    const currentQuantity = getCartQuantity(product._id);
    if (currentQuantity > 1) {
      updateQuantity(product._id, currentQuantity - 1);
    } else {
      removeFromCart(product._id);
    }
    
    forceUpdate(); // Force local re-render
    forceBaseUpdate(); // Force Base component re-render
    setSnackbar({
      open: true,
      message: `Đã cập nhật ${product.name}`,
      severity: 'info'
    });
  };

  const handleFullRemove = (productId) => {
    removeFromCart(productId);
    forceUpdate(); // Force local re-render
    forceBaseUpdate(); // Force Base component re-render
    setSnackbar({
      open: true,
      message: `Đã xóa sản phẩm khỏi giỏ hàng`,
      severity: 'warning'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Modal functions
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Review component functions
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} sx={{ color: '#FFD700', fontSize: '1rem' }} />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" sx={{ color: '#FFD700', fontSize: '1rem' }} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} sx={{ color: '#FFD700', fontSize: '1rem' }} />);
    }

    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

  // Submit review to backend and refresh reviews
  const handleAddReview = async () => {
    if (!selectedProduct || !newReviewComment.trim() || !newReviewRating) return;
    if (!isAuthenticated || !user || !user._id) {
      // Optionally show a message: must be logged in
      setSnackbar({
        open: true,
        message: 'Bạn phải đăng nhập để đánh giá sản phẩm.',
        severity: 'warning'
      });
      return;
    }
    setSubmittingReview(true);
    try {
      // Submit review with user ObjectId
      await apiService.createReview({
        product: selectedProduct._id,
        user: user._id, // Use database user
        rating: newReviewRating,
        comment: newReviewComment
      });
      // Refresh reviews
      const reviewsRes2 = await apiService.getReviews({ product: selectedProduct._id });
      const productReviews = reviewsRes2.data || [];
      setModalReviews(productReviews);
      if (productReviews.length > 0) {
        const avg = (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1) * 1;
        setModalRating(avg);
      } else {
        setModalRating(0);
      }
      setNewReviewRating(0);
      setNewReviewComment('');
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Gửi đánh giá thất bại. Vui lòng thử lại.',
        severity: 'error'
      });
    } finally {
      setSubmittingReview(false);
      setTimeout(() => {
        const reviewList = document.getElementById('review-list');
        if (reviewList) reviewList.scrollTop = 0;
      }, 600);
    }
  };


  return (
    <Box sx={{ p: 4, backgroundColor: '#491E6C', borderRadius: '16px', color: 'white' }}>
      <Typography variant="h4" sx={{ mb: 3, fontFamily: "'Raleway', sans-serif" }}>
        Sản phẩm
      </Typography>
      
      {productsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>Đang tải sản phẩm...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => {
            const cartQuantity = getCartQuantity(product._id);
            const isInCart = cartQuantity > 0;
            
            return (
              <Grid xs={12} sm={6} md={4} key={product._id} sx={{ overflow: 'visible' }}>
                <Card 
                  sx={{ 
                    backgroundColor: isInCart 
                      ? 'rgba(255, 215, 0, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: isInCart ? '2px solid #FFD700' : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  {/* Cart quantity badge */}
                  {isInCart && (
                    <Badge
                      badgeContent={cartQuantity}
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        '& .MuiBadge-badge': {
                          backgroundColor: '#FFD700',
                          color: '#491E6C',
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      <AddShoppingCartIcon sx={{ color: '#FFD700' }} />
                    </Badge>
                  )}

                  {(() => {
                    const imageUrl =
                      product.image ||
                      (typeof product.thumbnail === 'string' && product.thumbnail.startsWith('http') ? product.thumbnail : null) ||
                      (Array.isArray(product.images) && product.images[0]) ||
                      '/images/fallback.png';
                    return (
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          height: '200px',
                          overflow: 'visible',
                          borderRadius: '8px 8px 0 0',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleOpenModal(product)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={imageUrl}
                          alt={product.name}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.2)',
                              zIndex: 10
                            }
                          }}
                        />
                        {Array.isArray(product.images) && product.images.length > 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              color: 'white',
                              borderRadius: '12px',
                              px: 1,
                              py: 0.5,
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {product.images.length} ảnh
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                  
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 2
                      }}
                    >
                      {product.description}
                    </Typography>

                    {/* Rating and Reviews */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {renderStars(product.avgRating || 0)}
                      </Box>
                      {/* Defensive: show review count if available */}
                      {typeof product.reviewCount === 'number' && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.8rem'
                          }}
                        >
                          ({product.reviewCount} đánh giá)
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#FFD700',
                          fontWeight: 'bold'
                        }}
                      >
                        {formatPrice(product.price)}
                      </Typography>
                      
                      <Chip 
                        label={`Còn: ${product.stock}`}
                        size="small"
                        sx={{
                          backgroundColor: product.stock > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                          color: product.stock > 0 ? '#4CAF50' : '#F44336'
                        }}
                      />
                    </Box>

                    {/* Cart controls */}
                    {isInCart ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          onClick={() => {
                            handleRemoveFromCart(product);
                            setTimeout(() => {
                              forceUpdate();
                              forceBaseUpdate();
                            }, 10);
                          }}
                          sx={{
                            backgroundColor: '#FF6B6B',
                            color: 'white',
                            '&:hover': { backgroundColor: '#FF5252' },
                            width: 36,
                            height: 36
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>

                        <Typography 
                          sx={{ 
                            mx: 2, 
                            fontWeight: 'bold', 
                            fontSize: '18px',
                            minWidth: '30px',
                            textAlign: 'center'
                          }}
                        >
                          {cartQuantity}
                        </Typography>

                        <IconButton
                          onClick={() => {
                            handleAddToCart(product, 1);
                            setTimeout(() => {
                              forceUpdate();
                              forceBaseUpdate();
                            }, 10);
                          }}
                          disabled={product.stock <= 0}
                          sx={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            '&:hover': { backgroundColor: '#45A049' },
                            '&:disabled': { backgroundColor: 'rgba(255,255,255,0.2)' },
                            width: 36,
                            height: 36
                          }}
                        >
                          <AddIcon />
                        </IconButton>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            handleFullRemove(product._id);
                            setTimeout(() => {
                              forceUpdate();
                              forceBaseUpdate();
                            }, 10);
                          }}
                          sx={{
                            ml: 1,
                            borderColor: '#FF6B6B',
                            color: '#FF6B6B',
                            '&:hover': {
                              borderColor: '#FF5252',
                              backgroundColor: 'rgba(255, 82, 82, 0.1)'
                            }
                          }}
                        >
                          Xóa
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          handleAddToCart(product);
                          setTimeout(() => {
                            forceUpdate();
                            forceBaseUpdate();
                          }, 10);
                        }}
                        disabled={product.stock <= 0}
                        startIcon={<AddShoppingCartIcon />}
                        sx={{
                          backgroundColor: '#FFD700',
                          color: '#491E6C',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: '#FFC107',
                            transform: 'scale(1.02)'
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      >
                        {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Enhanced Image Modal */}
      <Dialog
        open={selectedProduct !== null}
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '95vh',
            height: '95vh',
            maxWidth: '900px',
            width: '100%',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {selectedProduct && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '95vh', maxHeight: '95vh' }}>
            <DialogTitle sx={{ 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(90deg, rgba(73, 30, 108, 0.8) 0%, rgba(255, 215, 0, 0.1) 100%)',
              py: 2
            }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {selectedProduct.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {formatPrice(selectedProduct.price)}
                </Typography>
              </Box>
              <IconButton 
                onClick={handleCloseModal} 
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <Box sx={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Image Area */}
              <Box sx={{
                width: { xs: '100%', md: 300 },
                minWidth: { md: 260 },
                maxWidth: { md: 350 },
                height: { xs: 250, md: 350 },
                background: 'linear-gradient(45deg, #000 0%, #1a1a1a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                borderRight: { md: '1px solid rgba(255,255,255,0.08)' },
                borderBottom: { xs: '1px solid rgba(255,255,255,0.08)', md: 'none' }
              }}>
                <img
                  src={selectedProduct.images && selectedProduct.images.length > 0 
                    ? selectedProduct.images[currentImageIndex] 
                    : selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'opacity 0.3s ease',
                    maxHeight: '100%',
                    maxWidth: '100%'
                  }}
                />
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        width: 36,
                        height: 36,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 215, 0, 0.2)',
                          borderColor: '#FFD700',
                          transform: 'translateY(-50%) scale(1.1)'
                        },
                        transition: 'all 0.2s ease',
                        zIndex: 2
                      }}
                    >
                      <ChevronLeftIcon sx={{ fontSize: '1.5rem' }} />
                    </IconButton>
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        width: 36,
                        height: 36,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 215, 0, 0.2)',
                          borderColor: '#FFD700',
                          transform: 'translateY(-50%) scale(1.1)'
                        },
                        transition: 'all 0.2s ease',
                        zIndex: 2
                      }}
                    >
                      <ChevronRightIcon sx={{ fontSize: '1.5rem' }} />
                    </IconButton>
                    {/* Dot navigation */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 1,
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      px: 1,
                      py: 0.5,
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      {selectedProduct.images.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: index === currentImageIndex ? '#FFD700' : 'rgba(255, 255, 255, 0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: index === currentImageIndex ? '#FFD700' : 'rgba(255, 255, 255, 0.8)',
                              transform: 'scale(1.2)'
                            }
                          }}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
              {/* Vertical Divider */}
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 0 }} />
              {/* Review Area */}
              <Box sx={{ flexGrow: 1, minWidth: 0, p: { xs: 0, md: 0 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)',
                  p: { xs: 2, md: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Section Indicator */}
                  <Typography variant="overline" sx={{ color: '#FFD700', fontWeight: 'bold', letterSpacing: 1, mb: 1, fontSize: '1.1rem', display: 'block', textAlign: 'left' }}>
                    Viết đánh giá
                  </Typography>
                  {/* Reviews Header and Average Rating */}
                  <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: '#FFD700' }} />
                    Đánh giá ({modalReviews.length})
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      {renderStars(modalRating)}
                    </Box>
                    <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      {modalRating}/5
                    </Typography>
                  </Box>
                  {/* Review Input Area */}
                  <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.10)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 1, fontWeight: 'bold' }}>
                      Viết đánh giá của bạn
                    </Typography>
                    <Rating
                      name="new-review-rating"
                      value={newReviewRating}
                      onChange={(event, newValue) => setNewReviewRating(newValue)}
                      precision={1}
                      size="large"
                      sx={{ mb: 1, color: '#FFD700',
                        '& .MuiRating-iconEmpty': {
                          color: '#bbb',
                          filter: 'drop-shadow(0 0 2px #222)'
                        },
                        '& .MuiRating-iconHover': {
                          color: '#FFD700',
                          transform: 'scale(1.15)'
                        }
                      }}
                      icon={<StarIcon fontSize="inherit" />}
                      emptyIcon={<StarIcon fontSize="inherit" />}
                    />
                    <TextField
                      value={newReviewComment}
                      onChange={e => setNewReviewComment(e.target.value)}
                      multiline
                      minRows={2}
                      maxRows={4}
                      fullWidth
                      variant="filled"
                      color="warning"
                      placeholder="Nhập nhận xét của bạn..."
                      sx={{
                        mb: 2,
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 1,
                        input: { color: 'white' },
                        textarea: { color: 'white' },
                        label: { color: 'rgba(255,255,255,0.7)' }
                      }}
                      aria-label="Nhập nhận xét của bạn"
                    />
                    <Button
                      variant="contained"
                      sx={{ background: '#FFD700', color: '#491E6C', fontWeight: 'bold', px: 4, py: 1, fontSize: 16 }}
                      disabled={!newReviewRating || !newReviewComment.trim() || submittingReview}
                      onClick={() => {
                        handleAddReview();
                        setTimeout(() => {
                          const reviewList = document.getElementById('review-list');
                          if (reviewList) reviewList.scrollTop = 0;
                        }, 600);
                      }}
                      aria-label="Gửi đánh giá"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </Button>
                  </Box>
                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)' }}>
                      Đang tải đánh giá...
                    </Box>
                  ) : modalReviews.length > 0 ? (
                    <Box
                      sx={{
                        flexGrow: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        pr: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                      id="review-list"
                    >
                      {modalReviews.map((review) => {
                        // Defensive: handle user as object or string
                        let userDisplay = '';
                        if (typeof review.user === 'object' && review.user !== null) {
                          userDisplay = review.user.firstName || review.user.lastName
                            ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim()
                            : review.user.email || review.user.id || review.user._id || 'Người dùng';
                        } else if (typeof review.user === 'string') {
                          userDisplay = review.user;
                        } else {
                          userDisplay = 'Người dùng';
                        }
                        return (
                          <Box 
                            key={review._id || review.id}
                            sx={{ 
                              px: 4, py: 4, 
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '14px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              fontSize: '1.1rem',
                              minHeight: 120,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center'
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {userDisplay}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.05rem' }}>
                                {formatDate(review.date || review.createdAt)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {renderStars(review.rating)}
                            </Box>
                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.97)', fontSize: '1.25rem', lineHeight: 1.7 }}>
                              {review.comment}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        flexGrow: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        pr: 1,
                        color: 'rgba(255,255,255,0.7)',
                        textAlign: 'center',
                        mt: 4,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      id="review-list"
                    >
                      Chưa có đánh giá nào
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* Enhanced Snackbar with auto-hide */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            fontWeight: 'bold'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ProductsContent;