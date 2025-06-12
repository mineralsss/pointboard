import * as React from "react";
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
import { useAuth } from "./contexts/AuthContext";
import { Avatar } from "@mui/material";

// Global styles
const GlobalStyles = styled("style")({
  [`@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Jersey+10&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');`]:
    {},
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
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

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
          <MenuItem key="account" onClick={handleMenuClose}>
            Tài khoản của tôi
          </MenuItem>,
          <MenuItem key="balance" onClick={handleMenuClose}>
            Số dư: {user?.balance?.toLocaleString("vi-VN")} VND
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Đăng xuất
          </MenuItem>,
        ]
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
      <MenuItem>
        <IconButton size="large" aria-label="shopping cart" color="inherit">
          <Badge badgeContent={3} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>Giỏ hàng</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show notifications"
          color="inherit"
        >
          <Badge badgeContent={5} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Thông báo</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          {isAuthenticated && user?.avatar ? (
            <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
        <p>{isAuthenticated ? user?.firstName : "Tài khoản"}</p>
      </MenuItem>
      {!isAuthenticated && (
        <MenuItem onClick={handleLoginClick}>
          <IconButton size="large" color="inherit">
            <AccountCircle />
          </IconButton>
          <p>Đăng nhập</p>
        </MenuItem>
      )}
    </Menu>
  );

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
              justifyContent: "space-between", // This helps with spacing in desktop view
            }}
          >
            {/* Logo Container - give it consistent width */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                width: { xs: "100%", sm: "25%" }, // Fixed width in desktop mode
                mb: { xs: 1, sm: 0 },
                alignItems: "center",
              }}
            >
              <img
                src="src\assets\Logo.svg"
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
                PointBoardGame.com
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

            {/* Search bar - perfectly centered */}
            <Box
              sx={{
                width: { xs: "100%", sm: "50%" }, // Takes 50% of space on desktop
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

            {/* Desktop icons - fixed width to balance the layout */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                width: { sm: "25%" }, // Fixed width to balance with logo section
                gap: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <IconButton
                size="large"
                aria-label="shopping cart"
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
                <Badge badgeContent={3} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

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

              {/* Only show account icon when user is authenticated */}
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
                      fontSize: "24px",
                    },
                  }}
                >
                  {user?.avatar ? (
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              )}

              {/* User info or Login Button */}
              {isAuthenticated ? (
                <Box
                  sx={{
                    ml: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#FFF",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#E0D2EE",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      fontSize: "0.75rem",
                    }}
                  >
                    {user?.balance?.toLocaleString("vi-VN")} VND
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ ml: 1 }}>
                  <Typography
                    component="button"
                    onClick={handleLoginClick}
                    sx={{
                      color: "#FFF",
                      textDecoration: "none",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      backgroundColor: "#39095D",
                      padding: "8px 16px",
                      borderRadius: "24px",
                      border: "2px solid #FFF",
                      transition: "all 0.3s ease",
                      display: "inline-block",
                      cursor: "pointer",
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
