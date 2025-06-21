import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../contexts/CartContext';

function CartDisplay() {
  const { 
    cartItems, 
    getTotalItems, 
    getTotalPrice, 
    updateQuantity, 
    removeFromCart,
    clearCart 
  } = useCart();
  
  const [isOpen, setIsOpen] = React.useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Cart Icon Button */}
      <IconButton 
        onClick={toggleDrawer}
        sx={{ 
          color: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <Badge 
          badgeContent={getTotalItems()} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#FFD700',
              color: '#491E6C',
              fontWeight: 'bold'
            }
          }}
        >
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            backgroundColor: '#491E6C',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFD700' }}>
              Giỏ hàng ({getTotalItems()})
            </Typography>
            {cartItems.length > 0 && (
              <Button
                onClick={clearCart}
                size="small"
                sx={{
                  color: '#FF6B6B',
                  borderColor: '#FF6B6B',
                  '&:hover': {
                    borderColor: '#FF5252',
                    backgroundColor: 'rgba(255, 82, 82, 0.1)'
                  }
                }}
                variant="outlined"
              >
                Xóa tất cả
              </Button>
            )}
          </Box>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />

          {/* Cart Items */}
          {cartItems.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              opacity: 0.7
            }}>
              <ShoppingCartIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">Giỏ hàng trống</Typography>
              <Typography variant="body2">Thêm sản phẩm để bắt đầu mua sắm</Typography>
            </Box>
          ) : (
            <>
              {/* Items List */}
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <List>
                  {cartItems.map((item) => (
                    <Card key={item._id} sx={{ 
                      mb: 2, 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {/* Product Image */}
                          <Avatar
                            src={item.image}
                            sx={{ 
                              width: 60, 
                              height: 60,
                              backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            {item.name.charAt(0)}
                          </Avatar>

                          {/* Product Info */}
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                fontWeight: 'bold',
                                color: 'white',
                                mb: 0.5
                              }}
                            >
                              {item.name}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#FFD700',
                                fontWeight: 'bold',
                                mb: 1
                              }}
                            >
                              {formatPrice(item.price)}
                            </Typography>

                            {/* Quantity Controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                sx={{
                                  backgroundColor: '#FF6B6B',
                                  color: 'white',
                                  '&:hover': { backgroundColor: '#FF5252' },
                                  width: 30,
                                  height: 30
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>

                              <Typography 
                                sx={{ 
                                  mx: 1,
                                  fontWeight: 'bold',
                                  minWidth: '30px',
                                  textAlign: 'center',
                                  color: 'white'
                                }}
                              >
                                {item.quantity}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                sx={{
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  '&:hover': { backgroundColor: '#45A049' },
                                  width: 30,
                                  height: 30
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>

                              <IconButton
                                size="small"
                                onClick={() => removeFromCart(item._id)}
                                sx={{
                                  ml: 1,
                                  color: '#FF6B6B',
                                  '&:hover': { 
                                    backgroundColor: 'rgba(255, 107, 107, 0.1)' 
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Subtotal */}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 1,
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontStyle: 'italic'
                              }}
                            >
                              Tổng: {formatPrice(item.price * item.quantity)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>
              </Box>

              {/* Total and Checkout */}
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
                
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 215, 0, 0.2)',
                  borderRadius: '12px',
                  p: 2,
                  mb: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#FFD700',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    Tổng cộng: {formatPrice(getTotalPrice())}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    backgroundColor: '#FFD700',
                    color: '#491E6C',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#FFC107',
                      transform: 'scale(1.02)'
                    }
                  }}
                  onClick={() => {
                    // Handle checkout logic here
                    console.log('Proceeding to checkout...');
                    toggleDrawer();
                  }}
                >
                  Thanh toán
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default CartDisplay;