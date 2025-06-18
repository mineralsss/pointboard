import React, { useState } from 'react';
import { Tab, Tabs, Box, Typography, Paper, Popper, Grow, AppBar, Grid, Card, CardContent } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import styled from '@emotion/styled';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Base from './base';
import Aboutus from './Aboutus';
import Guide from './Guide';
import ProductsContent from './ProductsContent';
import instagramIconSrc from '/images/instagram.png';  // You'll need to add this image to your project
import facebookIconSrc from '/images/facebook.png';

// Top part of the dropdown using SVG path
const DropdownTop = styled('div')(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '30px', // Match height to SVG
  clipPath: 'path("M0.5 29.77C0.5 26.86 2.30 24.25 5.03 23.22L64.27 0.93C65.86 0.33 67.61 0.33 69.20 0.93L128.44 23.22C131.16 24.25 132.97 26.86 132.97 29.77V29.77Z")',
  background: 'linear-gradient(180deg, #39095D 0%, #4A127A 100%)',
  
  // Top highlight/decoration
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40%',
    height: '4px',
    zIndex: 1,
  }
}));

// Bottom part of dropdown as rounded rectangle
const DropdownBottom = styled('div')(({ theme }) => ({
  background: 'linear-gradient(180deg, #4A127A 0%, #39095D 100%)',
  marginTop: '-1px', // Slight overlap to ensure no gap
  width: '150%',
  padding: '16px 0 12px',
  transform: 'translateX(-30%)',
  borderRadius: '12px',
}));

// Combined container
const DropdownContainer = styled(Paper)(({ theme }) => ({
  overflow: 'visible',
  position: 'relative',
  minWidth: 220,
  marginTop: 10,
  backgroundColor: 'transparent', // Let the parts define their own backgrounds
  boxShadow: 'none', // Remove default shadow
  
  // Custom shadow and animation
  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
  animation: 'glow 1.5s infinite alternate',
  '@keyframes glow': {
    '0%': { filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' },
    '100%': { filter: 'drop-shadow(0 8px 25px rgba(186, 175, 213, 0.5))' }
  }
}));

// Fixed SocialButton component to properly accept the bgcolor prop
const SocialButton = styled(Box)(({}) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  backgroundColor:'#491E6C', // Use the bgcolor prop or default to #491E6C
  color: '#FFF',
  alignItems: 'center',
  padding: '14px 8px 8px',
  borderRadius: '14px', // Increased roundness
  width: '80px',
  height: '80px',
  fontFamily: "'Inter', sans-serif",
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  position: 'relative', // Added to make the hover::after work correctly
  
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 10px rgba(0,0,0,0.3)',
  }
}));

function MainMenu() {
  // State to manage active tab
  const [value, setValue] = useState(0);
  
  // State for dropdown menu
  const [communityMenuAnchor, setCommunityMenuAnchor] = useState(null);
  const communityMenuOpen = Boolean(communityMenuAnchor);

  const handleChange = (event, newValue) => {
    // Don't change tab if clicking on community (index 3) - handle dropdown instead
    if (newValue !== 3) {
      setValue(newValue);
    }
  };

  // Handle dropdown open
  const handleCommunityClick = (event) => {
    setCommunityMenuAnchor(event.currentTarget);
    event.stopPropagation(); // Prevent tab selection
  };

  // Handle dropdown close
  const handleCommunityClose = () => {
    setCommunityMenuAnchor(null);
  };

  // Handle community menu item selection
  const handleCommunityItemClick = (option) => {
    switch (option) {
      case 'facebook':
        window.open('https://www.facebook.com/profile.php?id=61576712376909', '_blank');
        break;
      case 'instagram':
        window.open('https://www.instagram.com/pointgroup89thugs/', '_blank');
        break;
      // Remove the Discord case
      default:
        console.log(`Selected community option: ${option}`);
    }
    handleCommunityClose();
  };

  // Function to render content based on selected tab
  const renderContent = () => {
    switch (value) {
      case 0:
        return <ProductsContent />;
      case 1:
        return <Guide/>;
      case 2:
        return <PromotionsContent />;
      case 3:
        return <CommunityContent />;
      case 4:
        return <Aboutus />; 
      default:
        return <ProductsContent />;
    }
  };

  // Placeholder components for other tabs

  const PromotionsContent = () => (
    <Box sx={{ p: 3, backgroundColor: '#491E6C', borderRadius: '16px', color: 'white' }}>
      <Typography variant="h4" sx={{ mb: 3, fontFamily: "'Raleway', sans-serif" }}>
        Ưu đãi
      </Typography>
      <Typography paragraph>
        Các chương trình khuyến mãi đặc biệt dành cho bạn...
      </Typography>
    </Box>
  );

  const CommunityContent = () => (
    <Box sx={{ p: 3, backgroundColor: '#491E6C', borderRadius: '16px', color: 'white' }}>
      <Typography variant="h4" sx={{ mb: 3, fontFamily: "'Raleway', sans-serif" }}>
        Cộng đồng
      </Typography>
      <Typography paragraph>
        Tham gia cộng đồng yêu thích board game của chúng tôi...
      </Typography>
    </Box>
  );

  return (
    <Base>
      {/* Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: '#491E6C', 
          boxShadow: 'none',
          marginBottom: 2,
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={value} 
          onChange={handleChange} 
          centered
          textColor="inherit"
          sx={{
            '& .MuiTab-root': {
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '16px',
              textTransform: 'none',
              minWidth: 'unset',
              px: { xs: 1, sm: 2, md: 3 },
              '&.Mui-selected': {
                color: '#ffffff',
                fontWeight: 600
              },
            },
          }}
        >
          <Tab label="Sản phẩm" />
          <Tab label="Hướng dẫn" />
          <Tab label="Ưu đãi" />
          {/* Community tab with dropdown */}
          <Tab 
            label={
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#ffffff'
                }} 
                onClick={handleCommunityClick}
              >
                Cộng đồng
                <ArrowDropDownIcon sx={{ 
                  color: '#ffffff',
                  transform: communityMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  marginLeft: '4px'
                }} />
              </Box>
            }
            disableRipple
          />
          <Tab label="Về chúng tôi" />
        </Tabs>
      </AppBar>

      {/* Two-part shaped dropdown menu with ClickAwayListener */}
      <Popper
        open={communityMenuOpen}
        anchorEl={communityMenuAnchor}
        placement="bottom"
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'center top' }}
            timeout={250}
          >
            <div>
              <ClickAwayListener onClickAway={handleCommunityClose}>
                <DropdownContainer>
                  {/* Top curved part */}
                  <DropdownTop />
                  
                  {/* Bottom rounded rectangle part */}
                  <DropdownBottom>
                    {/* Title - Moved inside DropdownBottom to fix layout */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#ffffff', 
                        fontWeight: 'bold', 
                        textAlign: 'center',
                        marginBottom: 3,
                        textTransform: 'uppercase',
                      }}
                    >
                      Tham gia<br />
                      Cộng đồng của chúng tôi
                    </Typography>
                    
                    {/* Social buttons row */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', // Changed from 'space-between' to 'center'
                      gap: 4, // Add gap between the two buttons
                      paddingX: 3,
                    }}>
                      {/* Facebook */}
                      <SocialButton 
                        bgcolor="#1877F2"
                        onClick={() => handleCommunityItemClick('facebook')}
                      >
                        <Box
                          component="img"
                          src={facebookIconSrc}
                          alt="Facebook"
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            objectFit: 'contain'
                          }}
                        />
                        <Typography sx={{ 
                          fontSize: 12, 
                          marginTop: 1, 
                          fontWeight: 500 
                        }}>
                          Facebook
                        </Typography>
                      </SocialButton>
                      
                      {/* Instagram */}
                      <SocialButton 
                        bgcolor="#491E6C"  // Match the dark purple color
                        onClick={() => handleCommunityItemClick('instagram')}
                      >
                        <Box 
                          component="img"
                          src={instagramIconSrc}
                          alt="Instagram"
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            objectFit: 'contain'
                          }}
                        />
                        <Typography sx={{ 
                          fontSize: 12, 
                          marginTop: 1, 
                          fontWeight: 500 
                        }}>
                          Instagram
                        </Typography>
                      </SocialButton>
                    </Box>
                  </DropdownBottom>
                </DropdownContainer>
              </ClickAwayListener>
            </div>
          </Grow>
        )}
      </Popper>

      {/* Render content based on selected tab */}
      {renderContent()}
    </Base>
  );
}

export default MainMenu;

