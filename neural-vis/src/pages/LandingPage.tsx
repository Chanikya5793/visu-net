/**
 * LandingPage Component
 * 
 * The main entry point of the Neural Network Visualization application.
 * Provides an engaging introduction and overview of the application's features.
 * 
 * Features:
 * - Animated hero section with gradient background
 * - Call-to-action button for quick navigation
 * - Feature cards with interactive animations
 * - Responsive grid layout
 * - Material-UI integration
 * 
 * Visual Elements:
 * - Gradient background header
 * - Animated feature cards
 * - Interactive hover effects
 * - Smooth transitions and animations
 * 
 * Navigation:
 * - Direct link to network visualization
 * - Feature section navigation
 * 
 * Animation:
 * - Uses Framer Motion for card animations
 * - Material-UI Fade transitions
 * - Hover effect animations
 * 
 * @component
 */

import { ArrowForward } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    Fade,
    Grid,
    Typography,
    useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      <Fade in timeout={1000}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
            backgroundImage: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            color: 'white',
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Neural Network Visualization
            </Typography>
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              An interactive platform for visualizing and experimenting with neural networks.
              Learn, explore, and understand deep learning concepts through hands-on experimentation.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/network')}
              >
                Get Started
              </Button>
            </Box>
          </Container>
        </Box>
      </Fade>

      <Container sx={{ py: 8 }} maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={feature.title} xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      transition: 'all 0.3s ease-in-out',
                    },
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      pt: '56.25%',
                      background: theme.palette.primary.light,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                    }}
                  >
                    {feature.icon}
                  </CardMedia>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {feature.title}
                    </Typography>
                    <Typography>{feature.description}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

const features = [
  {
    title: 'Interactive Visualization',
    description: 'See your neural network in action with real-time visualizations.',
    icon: '🎯'
  },
  {
    title: 'Custom Datasets',
    description: 'Create and experiment with your own datasets.',
    icon: '📊'
  },
  {
    title: 'Multiple Models',
    description: 'Try different neural network architectures and configurations.',
    icon: '🧠'
  },
  {
    title: 'Real-time Updates',
    description: 'Watch your neural network learn and adapt in real-time.',
    icon: '📊'
  },
  {
    title: 'Customizable Architecture',
    description: 'Design and modify neural network architectures with ease.',
    icon: '🔧'
  },
  {
    title: 'Export & Share',
    description: 'Export your trained models and share them with others.',
    icon: '📤'
  }
];
