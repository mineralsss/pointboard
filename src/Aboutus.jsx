import {React, useState} from 'react';
import { AppBar, Box, Typography, Tabs, Tab } from '@mui/material';
import image43 from '/images/image43.png';
import cardsImage from '/images/cards.png';
import backgroundImg from '/images/backgroundImg.png';
import questionmarkdeck from '/images/questionmarkdeck.png';
import Guide from './Guide';

function Aboutus() {
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const renderTabContent = () => {
    switch (tabValue) {
      case 1:
        return (
          <Box sx={{
            backgroundColor: '#686178',
            width: '125%',
            padding: '20px',
            borderRadius: '10px',
            transform: 'translateX(-12.5%)',
          }}>
          {/* Changed from column to row layout */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'flex-start',
            gap: '24px' // Add spacing between image and content
          }}>
            {/* Image on the left */}
            <Box sx={{ flex: '0 0 40%' }}> {/* Fixed width container */}
              <img
                src={questionmarkdeck}
                alt="Question Mark Deck"
                style={{
                  width: '100%',
                  display: 'flex',
                  maxWidth: '300px',
                  height: 'auto',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(10%)',
                }}
              />
            </Box>
            
            {/* Typography on the right */}
            <Box sx={{ flex: '1 1 60%' }}> {/* Flexible width container */}
              <Typography variant="h4" sx={{ 
                mb: 2,
                textAlign: 'left',
                fontWeight: 'bold',
                color: '#fff'
              }}>
                Một biến thể hỗn loạn của Point???
              </Typography>
              
              <Typography variant="body1" sx={{
                textAlign: 'left',
                color: '#fff',
                fontSize: '1rem',
                lineHeight: 1.6,
              }}>
                Point là một loại Boardgame dạng thẻ bài với luật chơi đa dạng, phong cách hiện đại bằng hệ thống tích điểm năng lượng. Tính năng mới mẻ này có thể sẽ gây bối rối và khó gần cho những người chơi mới hoặc người chơi "casual". Hãy cùng chúng tớ điểm qua những nét cơ bản của Point và luật chơi nhé!
              </Typography>
            </Box>
          </Box>

        </Box>

        );
      case 0:
        return (
          <Typography variant="body1">
            Nội dung cho tab "Mới ra mắt" sẽ được cập nhật sớm.
          </Typography>
        );
      default:
        return null;
    }

  }


  return (
    <Box sx={{ 
      position: 'relative',
      paddingTop: '40px',
      marginLeft: '0',
      overflow: 'visible',
      minHeight: '800px',
    }}>
      {/* Top section - Hero area with images and text */}
      <Box sx={{ position: 'relative', marginBottom: '80px' }}>
        {/* Container for positioning both images */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          {/* Base image that overflows */}
          <img
            src={image43}
            alt="image43"
            style={{
              width: '541px',
              maxHeight: '500px',
              borderRadius: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              display: 'block',
              objectFit: 'cover',
              marginLeft: '0',
              zIndex: 1,
              transform: 'translateX(-35%)',
            }}
          />
          
          {/* Cards image positioned on top */}
          <img
            src={cardsImage}
            alt="Cards"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-10px',
              width: '500px',
              zIndex: 2,
              borderRadius: '12px',
            }}
          />
        </Box>
        
        {/* Typography content on the right */}
        <Box sx={{ 
          position: 'absolute',
          top: '40px',
          right: '20%',
          width: '50%',
          maxWidth: '600px',
          zIndex: 3
        }}>
          <Typography variant="h2" component="h1" sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            color: '#FFF'
          }}>
            Boardgame: Point
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Point là một boardgame chiến thuật nhanh gọn, nơi người chơi cạnh tranh để giành điểm bằng cách sử dụng tư duy 
            logic và khả năng tính toán. Với luật chơi đơn giản nhưng đầy thử thách, Point mang đến những màn đấu trí căng thẳng, 
            đòi hỏi người chơi phải suy nghĩ chiến lược và tận dụng cơ hội để vượt lên đối thủ.
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Đây là trò chơi lý tưởng cho những ai yêu thích sự cạnh tranh và muốn rèn luyện tư duy sắc bén!
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="button" 
              component="a" 
              href="#learn-more" 
              sx={{ 
                color: '#fff',
                backgroundColor: '#6200ea',
                padding: '10px 20px',
                borderRadius: '5px',
                textDecoration: 'none',
                display: 'inline-block',
                '&:hover': {
                  backgroundColor: '#3700b3'
                }
              }}
            >
              Ấn để xem {'>>>'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Bottom section - Tab area with proper spacing */}
      <Box sx={{ 
        width: '100%', 
        marginTop: '20px',
        marginBottom: '60px', // Added margin bottom for spacing
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <AppBar position="static" sx={{
          width: '30%',
          backgroundColor: '#39095D',
          boxShadow: 'none',
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            centered
            variant="standard"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '16px',
                fontWeight: 500,
                minWidth: '120px',
                '&.Mui-selected': {
                  color: '#fff',
                  fontWeight: 600,
                }
              }
            }}
          >
            <Tab label="Mới ra mắt" />
            <Tab label="Sắp ra mắt" />
          </Tabs>
        </AppBar>
        
        {/* Tab content always below the AppBar */}
        <Box sx={{ 
          mt: 2, 
          textAlign: 'center', 
          width: '100%',
          maxWidth: '600px'
        }}>
          {renderTabContent(
            tabValue
          )}
        </Box>
      </Box>

      {/* Guide section with spacing */}
      <Box sx={{ mt: 8 }}> {/* Added a Box with significant top margin (8 = 64px) */}
        <Guide/>
      </Box>
    </Box>
  );
}

export default Aboutus;