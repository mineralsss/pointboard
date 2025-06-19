import {Box, Button, Card, CardContent, CardMedia, Grid, Typography} from '@mui/material';
import cardImage from '/images/cards.png'; // Adjust the path as necessary

export default function Products(){
    return (
        <Box sx={{ p: 2, backgroundColor: '#FFF', borderRadius: '10px' }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ 
  maxWidth: 280, // Smaller card width
  height: 'auto',
  m: 1,  // Margin around the card
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 2
}}>
  {/* Image container with fixed height */}
  <Box sx={{ 
    height: 180, // Fixed height for image area
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    p: 2,
    bgcolor: '#f9f9f9' // Light background to see image boundaries
  }}>
    <img
      src={cardImage}
      alt="Image of Product 1"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  </Box>
  
  {/* Content with centered text */}
  <CardContent sx={{ 
    textAlign: 'center',
    p: 1.5,
    pb: 2,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    <Box>
      <Typography variant="h6" component="div" sx={{ fontSize: '1rem', mb: 1 }}>
        Sản phẩm 1
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Mô tả sản phẩm 1.
      </Typography>
    </Box>
    
    <Button 
      variant="contained" 
      color="primary" 
      size="small"
      sx={{ mt: 1, alignSelf: 'center' }}
    >
      Mua ngay
    </Button>
  </CardContent>
</Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ 
  maxWidth: 280, // Smaller card width
  height: 'auto',
  m: 1,  // Margin around the card
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 2
}}>
  {/* Image container with fixed height */}
  <Box sx={{ 
    height: 180, // Fixed height for image area
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    p: 2,
    bgcolor: '#f9f9f9' // Light background to see image boundaries
  }}>
    <img
      src="./images/cards.png"
      alt="Product image"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain'
      }}
    />
  </Box>
  
  {/* Content with centered text */}
  <CardContent sx={{ 
    textAlign: 'center',
    p: 1.5,
    pb: 2,
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    <Box>
      <Typography variant="h6" component="div" sx={{ fontSize: '1rem', mb: 1 }}>
        Sản phẩm 2
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Mô tả sản phẩm 2.
      </Typography>
    </Box>
    
    <Button 
      variant="contained" 
      color="primary" 
      size="small"
      sx={{ mt: 1, alignSelf: 'center' }}
    >
      Mua ngay
    </Button>
  </CardContent>
</Card>
                </Grid>
                {/* Add more products here */}
            </Grid>
        </Box>
    );
}