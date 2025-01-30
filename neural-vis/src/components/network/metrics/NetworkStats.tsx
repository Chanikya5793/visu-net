/**
 * NetworkStats Component
 * 
 * A React component that displays statistical information about the neural network's
 * current state, including weights, biases, and learning rate metrics.
 * 
 * Features:
 * - Real-time weight statistics display
 * - Bias distribution visualization
 * - Learning rate monitoring
 * - Statistical calculations (mean, standard deviation)
 * 
 * Props:
 * @param {number[][][]} weights - 3D array of network weights [layer][toNeuron][fromNeuron]
 * @param {number[][]} biases - 2D array of network biases [layer][neuron]
 * @param {number} learningRate - Current learning rate of the network
 * 
 * Statistics Displayed:
 * - Weight mean and standard deviation
 * - Bias mean and standard deviation
 * - Current learning rate
 * - Total number of parameters
 * 
 * Layout:
 * - Material-UI Paper container with consistent padding
 * - Grid layout for statistics with responsive design
 * - Clear typography hierarchy for readability
 * 
 * @component
 */

import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

interface NetworkStatsProps {
  weights: number[][][];
  biases: number[][];
  learningRate: number;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  weights,
  biases,
  learningRate
}) => {
  // Calculate statistics from weights and biases
  const flatWeights = weights.flat(2);
  const flatBiases = biases.flat();

  const weightMean = flatWeights.reduce((sum, w) => sum + w, 0) / flatWeights.length;
  const biasMean = flatBiases.reduce((sum, b) => sum + b, 0) / flatBiases.length;

  const weightStdDev = Math.sqrt(
    flatWeights.reduce((sum, w) => sum + Math.pow(w - weightMean, 2), 0) / flatWeights.length
  );
  const biasStdDev = Math.sqrt(
    flatBiases.reduce((sum, b) => sum + Math.pow(b - biasMean, 2), 0) / flatBiases.length
  );

  return (
    <Paper 
      sx={{ 
        p: 3,  // Increased padding for better spacing
        height: '100%', // Take full height of grid cell
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" gutterBottom>Network Statistics</Typography>
      
      {/* Weights Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
          Weights Distribution
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Mean</Typography>
            <Typography variant="body1">{weightMean.toFixed(4)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Std Dev</Typography>
            <Typography variant="body1">{weightStdDev.toFixed(4)}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Biases Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
          Biases Distribution
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Mean</Typography>
            <Typography variant="body1">{biasMean.toFixed(4)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Std Dev</Typography>
            <Typography variant="body1">{biasStdDev.toFixed(4)}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Learning Rate Section */}
      <Box sx={{ mt: 'auto' }}> {/* Push to bottom if space available */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
          Training Parameters
        </Typography>
        <Box>
          <Typography variant="caption" color="text.secondary">Learning Rate</Typography>
          <Typography variant="body1">{learningRate}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};