import { Box, Grid, Paper, Typography } from '@mui/material';
import React from 'react';

const Documentation: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Neural Network Visualization Documentation
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to the Neural Network Visualization tool! This interactive platform helps you understand and visualize neural networks in real-time.
            </Typography>
            <Typography variant="body1" paragraph>
              The visualization shows neurons as circles and connections as lines. The opacity of connections indicates their strength, while colors show positive (green) or negative (red) weights.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <Typography variant="body1" component="div">
              <ul>
                <li>Real-time visualization of neural network architecture</li>
                <li>Interactive neuron inspection</li>
                <li>Weight and activation visualization</li>
                <li>Gradient flow display during training</li>
                <li>Performance metrics tracking</li>
                <li>Network architecture customization</li>
              </ul>
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Using the Visualization
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Network View:</strong> The main visualization shows your neural network's structure. Each circle represents a neuron, and lines between them represent weights.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Interactivity:</strong> Hover over neurons to see their connections and values. Click on neurons for detailed information about their weights and activations.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Training:</strong> During training, you can observe how weights and activations change in real-time. The gradient flow option shows how errors propagate through the network.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Features
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Custom Datasets:</strong> Upload your own datasets for training and testing.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Architecture Modification:</strong> Adjust the number of layers and neurons to experiment with different network structures.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Export/Import:</strong> Save and load network configurations to share or continue your work later.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Documentation;