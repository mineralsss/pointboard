import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Import your actual images when available
import videoThumbnail1 from '/images/video-thumbnail1.png';
import videoThumbnail2 from '/images/video-thumbnail2.png';

function Guide() {

  return (
    <Box sx={{ 
      width: '100%',
      margin: '0 auto',
      backgroundColor: '#FFF',
      p: 2,
      display: 'flex',
      borderRadius: '10px',
      flexDirection: 'column',
      gap: 3

    }}>
      {/* Header section in its own container */}
      <Box sx={{ 
        backgroundColor: '#8566A9',
        borderRadius: '10px',
        p: { xs: 2, md: 3 }
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          color: '#fff',
          textAlign: 'center'
        }}>
          Khám phá thêm về Boardgame: Point
        </Typography>
        
        <Typography variant="body1" sx={{ 
          color: '#fff',
          textAlign: 'center'
        }}>
          Point là một loại Boardgame dạng thẻ bài với luật chơi đa dạng, phong cách hiện đại bằng hệ thống tích điểm năng lượng. Tính năng mới mẻ này có thể sẽ gây bối rối và khó gần cho những người chơi mới hoặc người chơi "casual". Hãy cùng chúng tớ điểm qua những nét cơ bản của Point và luật chơi nhé!
        </Typography>
      </Box>

      {/* First video section in its own container */}
      <Box sx={{ 
        backgroundColor: '#FFF',
        borderRadius: '10px',
        p: { xs: 2, md: 3 }
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          color: '#39095D',
          textAlign: 'center'
        }}>
          Giới thiệu tổng quan về Point
        </Typography>
        
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{ flex: '1', textAlign: 'right', order: { xs: 2, md: 1 } }}>
            <Typography variant="body1" sx={{ color: '#39095D', mb: 2 }}>
              Tổng quan về tạo hình, thiết kế và số lượng bài của Boardgame: Point. Nếu bạn đã biết đến bộ bài này và có những trải nghiệm, hãy đến video bên dưới
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Button 
                variant="text" 
                sx={{ 
                  color: '#39095D',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                Ấn để xem {'>>>'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ 
            flex: '1', 
            position: 'relative',
            maxWidth: '400px',
            order: { xs: 1, md: 2 }
          }}>
            <Box 
              component="img"
              src={videoThumbnail1} 
              alt="Video thumbnail"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 1)'
              }
            }}>
              <PlayArrowIcon sx={{ color: '#fff', fontSize: 40 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Second video section in its own container */}
      <Box sx={{ 
        backgroundColor: '#8566A9',
        borderRadius: '10px',
        p: { xs: 2, md: 3 }
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold', 
          mb: 2,
          color: '#fff',
          textAlign: 'center'
        }}>
          Video hướng dẫn chơi Point
        </Typography>
        
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 3
        }}>
          <Box sx={{ 
            flex: '1', 
            position: 'relative',
            maxWidth: '400px',
            order: { xs: 1, md: 1 }
          }}>
            <Box 
              component="img"
              src={videoThumbnail2} 
              alt="Video tutorial thumbnail"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            />
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 1)'
              }
            }}>
              <PlayArrowIcon sx={{ color: '#fff', fontSize: 40 }} />
            </Box>
          </Box>

          <Box sx={{ flex: '1', textAlign: 'left', order: { xs: 2, md: 2 } }}>
            <Typography variant="body1" sx={{ color: '#fff', mb: 2 }}>
              Hướng dẫn tận tâm tất về hệ thống tính điểm, các con số trên bài, luật chơi, điều kiện thắng,... của Point. Bonus thêm một số kỹ thuật bạn có thể đạt ra khi chơi cùng người thân, bạn bè để nâng tầm thứ vị của game.
            </Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Button 
                variant="text" 
                sx={{ 
                  color: '#fff',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                Ấn để xem {'>>>'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>


    </Box>
  );
}

export default Guide;