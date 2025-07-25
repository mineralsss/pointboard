import React, { useState, useEffect } from 'react';
import {react} from "react";
import "./base.css";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import CssBaseline from "@mui/material/CssBaseline";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import Badge from "@mui/material/Badge";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';
import { useCartUpdate } from "./contexts/CartUpdateContext";
import { Avatar, Drawer, List, Card, Button, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

// Global styles
const GlobalStyles = styled("style")({
  [`body`]: {
    margin: 0,
    padding: 0,
    backgroundColor: "#39095D",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif", // Set Inter as the default font
  },
  [`h1, h2, h3, h4, h5, h6`]: {
    fontFamily: "'Raleway', sans-serif", // Use Raleway for headings
  },
  [`.jersey-font`]: {
    fontFamily: "'Jersey 10', sans-serif", // Class for Jersey font
  },
});

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "24px", // Slightly smaller radius for a more balanced look
  backgroundColor: "#FFF",
  "&:hover": {
    backgroundColor: "#f8f8f8",
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "480px", // More standard width
  height: "48px", // More standard height
  display: "flex",
  alignItems: "center",
  [theme.breakpoints.down("lg")]: {
    width: "400px",
  },
  [theme.breakpoints.down("md")]: {
    width: "320px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

// Adjust search button size to match new search bar height
const SearchButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 4,
  height: "40px",
  width: "40px",
  backgroundColor: "#39095D",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: "#4c1275",
  },
}));

// Update input styling for the new size
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#333",
  width: "100%",
  height: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 2), // Adjusted padding for smaller height
    paddingRight: "50px", // Adjust for smaller search button
    transition: theme.transitions.create("width"),
    width: "100%",
    fontSize: "1rem", // Standard font size
  },
}));

function Base({ children }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  // Get auth context
  const { isAuthenticated, user, logout } = useAuth();
  
  // Get cart context
  const { 
    cartItems,
    getTotalItems, 
    getTotalPrice,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  // Debug: Add console log to check user data
  useEffect(() => {
    console.log('Base component - User data:', user);
    console.log('Base component - Is authenticated:', isAuthenticated);
  }, [user, isAuthenticated]);

  const navigate = useNavigate();
  const location = useLocation();
  
  const { forceUpdate } = useCartUpdate();

  // Force update when cart items change
  React.useEffect(() => {
    forceUpdate();
  }, [cartItems, forceUpdate]);

  // Add this debug function to test
  const handleQuantityChange = (itemId, newQuantity) => {
    console.log('Changing quantity for item:', itemId, 'to:', newQuantity);
    updateQuantity(itemId, newQuantity);
  };

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const toggleCartDrawer = () => {
    setIsCartOpen(!isCartOpen);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {isAuthenticated ? (
        [
          <MenuItem key="profile" onClick={handleMenuClose}>
            Hồ sơ cá nhân
          </MenuItem>,
          <MenuItem key="orders" onClick={() => { handleMenuClose(); navigate('/orders'); }}>
            Đơn hàng của tôi
          </MenuItem>,
          user?.role === 'admin' && (
            <MenuItem key="admin" onClick={() => { handleMenuClose(); navigate('/admin-dashboard'); }}>
              Quản trị viên
            </MenuItem>
          ),
          <MenuItem key="account" onClick={handleMenuClose}>
            Tài khoản của tôi
          </MenuItem>,
          <MenuItem key="balance" onClick={handleMenuClose}>
            Số dư: {user?.balance?.toLocaleString("vi-VN")} VND
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Đăng xuất
          </MenuItem>,
        ].filter(Boolean)
      ) : (
        <MenuItem onClick={handleLoginClick}>Đăng nhập</MenuItem>
      )}
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={toggleCartDrawer}>
        <IconButton size="large" aria-label="shopping cart" color="inherit">
          <Badge badgeContent={getTotalItems()} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>Giỏ hàng</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label={`show ${getTotalItems()} new notifications`}
          color="inherit"
        >
          <Badge badgeContent={getTotalItems()} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const shouldShowBase = ![
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
  ].some((path) => location.pathname.startsWith(path));

  // Regular expression to match reset password routes with tokens
  const resetPasswordRegex = /^\/reset-password\/.+/;
  if (resetPasswordRegex.test(location.pathname)) {
    return <>{children}</>;
  }

  // Regular expression to match verify email routes with tokens
  const verifyEmailRegex = /^\/verify-email\/.+/;
  if (verifyEmailRegex.test(location.pathname)) {
    return <>{children}</>;
  }
  
  // Do not render Base for checkout
  if (location.pathname === "/checkout") {
    return <>{children}</>;
  }

  if (!shouldShowBase) {
    return <>{children}</>;
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <GlobalStyles />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <AppBar position="static" sx={{ backgroundColor: "#74499E" }}>
          <Toolbar
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              padding: { xs: "8px", sm: "0 16px" },
              justifyContent: "space-between",
            }}
          >
            {/* Logo Container - give it consistent width */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                width: { xs: "100%", sm: "25%" }, // Reduce back to 25%
                mb: { xs: 1, sm: 0 },
                alignItems: "center",
              }}
            >
              <img
                src="/images/Logo.svg"
                alt="PointBoard Logo"
                style={{
                  height: "40px",
                  width: "auto",
                  marginRight: "8px",
                }}
              />

              <Typography
                noWrap
                component="div"
                sx={{
                  color: "#FFF",
                  fontFamily: "'Jersey 10', sans-serif",
                  fontSize: { xs: "18px", sm: "28px" },
                  fontWeight: 400,
                }}
                className="jersey-font"
              >
                PointBoardGame
              </Typography>

              {/* Mobile menu icon */}
              <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-controls={mobileMenuId}
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                  sx={{
                    backgroundColor: "#39095D",
                    width: "40px",
                    height: "40px",
                    "&:hover": {
                      backgroundColor: "#4c1275",
                    },
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Search Container */}
            <Box
              sx={{
                width: { xs: "100%", sm: "50%" }, // Increase back to 50%
                mb: { xs: 1, sm: 0 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Search
                sx={{
                  width: "100%",
                  maxWidth: { xs: "100%", sm: "480px" },
                }}
              >
                <StyledInputBase
                  placeholder="Bạn muốn tìm gì?"
                  inputProps={{ "aria-label": "search" }}
                  fullWidth
                />
                <SearchButton color="inherit" aria-label="search">
                  <SearchIcon sx={{ color: "#FFF" }} />
                </SearchButton>
              </Search>
            </Box>

            {/* Desktop Icons Container - Give more space for user info */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                width: { sm: "25%" }, // Keep at 25% but ensure content doesn't shrink
                gap: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                minWidth: "300px", // Add minimum width to prevent shrinking
              }}
            >
              {/* Cart Icon */}
              <IconButton
                size="large"
                aria-label="shopping cart"
                color="inherit"
                onClick={toggleCartDrawer}
                sx={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#39095D",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "#4c1275",
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: "24px",
                  },
                }}
              >
                <Badge 
                  badgeContent={getTotalItems()} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#FFD700',
                      color: '#39095D',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* Notifications Icon */}
              <IconButton
                size="large"
                aria-label="show notifications"
                color="inherit"
                sx={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#39095D",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: "#4c1275",
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: "24px",
                  },
                }}
              >
                <Badge badgeContent={5} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* User Avatar (only when authenticated) */}
              {isAuthenticated && (
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls={menuId}
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                  sx={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#39095D",
                    borderRadius: "50%",
                    "&:hover": {
                      backgroundColor: "#4c1275",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: "28px",
                    },
                  }}
                >
                  {user?.avatar ? (
                    <Avatar 
                      src={user.avatar} 
                      sx={{ 
                        width: 36,
                        height: 36
                      }} 
                    />
                  ) : (
                    <AccountCircle sx={{ fontSize: "28px" }} />
                  )}
                </IconButton>
              )}

              {/* User Info or Login Button - Fixed styling */}
              {isAuthenticated ? (
                <Box
                  sx={{
                    ml: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    minWidth: "140px", // Increase minimum width
                    maxWidth: "200px", // Add maximum width
                    flexShrink: 0, // Prevent shrinking
                  }}
                >
                  <Typography
                    sx={{
                      color: "#FFF",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {user?.firstName || 'User'} {user?.lastName || ''}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#E0D2EE",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {user?.balance?.toLocaleString("vi-VN") || '0'} VND
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ ml: 2, flexShrink: 0 }}>
                  <Typography
                    component="button"
                    onClick={handleLoginClick}
                    sx={{
                      color: "#FFF",
                      textDecoration: "none",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem",
                      backgroundColor: "#39095D",
                      padding: "10px 18px",
                      borderRadius: "24px",
                      border: "2px solid #FFF",
                      transition: "all 0.3s ease",
                      display: "inline-block",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        backgroundColor: "#FFF",
                        color: "#39095D",
                      },
                    }}
                  >
                    Đăng Nhập
                  </Typography>
                </Box>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Cart Drawer */}
        <Drawer
          anchor="right"
          open={isCartOpen}
          onClose={toggleCartDrawer}
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
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2 }}>
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
                                onClick={() => {
                                  console.log('Decrease button clicked for:', item._id);
                                  const newQuantity = item.quantity - 1;
                                  if (newQuantity > 0) {
                                    handleQuantityChange(item._id, newQuantity);
                                  } else {
                                    removeFromCart(item._id);
                                  }
                                }}
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
                                onClick={() => {
                                  console.log('Increase button clicked for:', item._id);
                                  handleQuantityChange(item._id, item.quantity + 1);
                                }}
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
                                onClick={() => {
                                  console.log('Remove button clicked for:', item._id);
                                  removeFromCart(item._id);
                                }}
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
                      navigate('/checkout');
                      toggleCartDrawer();
                    }}
                  >
                    Thanh toán
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Drawer>

        {/* Update mobile menu to include all icons */}
        {renderMobileMenu}
        {renderMenu}

        <main
          style={{
            padding: "24px",
            color: "#fff",
            flexGrow: 1,
          }}
        >
          {children}
        </main>

        <footer>
          {/* Contact Us Section with light purple background */}
          <Box
            sx={{
              padding: "40px 16px",
              backgroundColor: "#e0d2ee",
              color: "#39095D", // Dark purple text for better contrast on light background
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 4,
                textAlign: "center",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Contact Us
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                maxWidth: "1200px",
                mx: "auto",
                mb: 3,
              }}
            >
              {/* Left side - Contact Information */}
              <Box
                sx={{
                  textAlign: { xs: "center", md: "left" },
                  mb: { xs: 4, md: 0 },
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    pointcontact@gmail.vn
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Hotline
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    0969 6699 6969
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Address
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Đường D1, Khu Công Nghệ Cao, Quận Thủ Đức, TP.Hồ Chí Minh
                  </Typography>
                </Box>
              </Box>

              {/* Right side - Social Media Icons */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", md: "flex-end" },
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontFamily: "'Inter', sans-serif",
                    textAlign: { xs: "center", md: "right" },
                  }}
                >
                  Follow us
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)", // 2x2 grid layout
                    gridTemplateRows: "repeat(2, 1fr)",
                    gap: 2,
                    justifyContent: { xs: "center", md: "flex-end" },
                  }}
                >
                  <IconButton
                    sx={{
                      color: "#39095D",
                      backgroundColor: "transparent", // Remove background
                      "&:hover": { backgroundColor: "rgba(57, 9, 93, 0.1)" },
                      padding: "8px",
                    }}
                  >
                    <img
                      src="/images/facebook.png"
                      onClick ={() => window.open("https://www.facebook.com/profile.php?id=61576712376909", "_blank")}
                      alt="Facebook"
                      width="36px" // Increase size
                      height="36px" // Increase size
                      style={{ display: "block" }}
                    />
                  </IconButton>

                  <IconButton
                    sx={{
                      color: "#39095D",
                      backgroundColor: "transparent", // Remove background
                      "&:hover": { backgroundColor: "rgba(57, 9, 93, 0.1)" },
                      padding: "8px",
                    }}
                  >
                    <img
                      src="/images/instagram.png"
                      onClick ={() => window.open("https://www.instagram.com/pointgroup89thugs/", "_blank")}
                      alt="Instagram"
                      width="36px" // Increase size
                      height="36px" // Increase size
                      style={{ display: "block" }}
                    />
                  </IconButton>

                  <IconButton
                    sx={{
                      color: "#39095D",
                      backgroundColor: "transparent", // Remove background
                      "&:hover": { backgroundColor: "rgba(57, 9, 93, 0.1)" },
                      padding: "8px",
                    }}
                  >
                    <img
                      src="/images/youtube.png"
                      alt="YouTube"
                      width="36px" // Increase size
                      height="36px" // Increase size
                      style={{ display: "block" }}
                    />
                  </IconButton>

                  <IconButton
                    sx={{
                      color: "#39095D",
                      backgroundColor: "transparent", // Remove background
                      "&:hover": { backgroundColor: "rgba(57, 9, 93, 0.1)" },
                      padding: "8px",
                    }}
                  >
                    <img
                      src="/images/tiktok.png"
                      alt="TikTok"
                      width="36px" // Increase size
                      height="36px" // Increase size
                      style={{ display: "block" }}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Copyright Footer */}
          <Box
            sx={{
              padding: "24px 16px",
              backgroundColor: "#74499E",
              textAlign: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#fff" }}>
              © {new Date().getFullYear()} PointBoard
            </Typography>
          </Box>
        </footer>
      </div>
    </React.Fragment>
  );
}

export default Base;
