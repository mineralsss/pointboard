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
  Badge
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useCart } from './contexts/CartContext';
import { useCartUpdate } from './contexts/CartUpdateContext';

// Sample products data
const sampleProducts = [
  {
    _id: '1',
    name: 'Monopoly Classic',
    price: 299000,
    image: '/images/monopoly.jpg',
    description: 'Game board kinh điển cho gia đình',
    category: 'strategy',
    stock: 10
  },
  {
    _id: '2',
    name: 'Catan',
    price: 850000,
    description: 'Game xây dựng và giao thương',
    category: 'strategy',
    stock: 5
  },
  {
    _id: '3',
    name: 'UNO',
    price: 150000,
    image: '/images/uno.jpg',
    description: 'Game thẻ bài vui nhộn',
    category: 'card',
    stock: 20
  }
];

function ProductsContent() {
  const { addToCart, removeFromCart, cartItems, updateQuantity } = useCart();
  const { forceUpdate: forceBaseUpdate } = useCartUpdate(); // Get base update function
  const [products] = useState(sampleProducts);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Use useReducer for local component re-render
  const [, forceUpdate] = useReducer(x => x + 1, 0);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#491E6C', borderRadius: '16px', color: 'white' }}>
      <Typography variant="h4" sx={{ mb: 3, fontFamily: "'Raleway', sans-serif" }}>
        Sản phẩm
      </Typography>
      
      <Grid container spacing={3}>
        {products.map((product) => {
          const cartQuantity = getCartQuantity(product._id);
          const isInCart = cartQuantity > 0;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card 
                sx={{ 
                  backgroundColor: isInCart 
                    ? 'rgba(255, 215, 0, 0.2)' // Golden tint when in cart
                    : 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: isInCart ? '2px solid #FFD700' : 'none',
                  transition: 'all 0.3s ease',
                  position: 'relative',
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

                {product.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
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