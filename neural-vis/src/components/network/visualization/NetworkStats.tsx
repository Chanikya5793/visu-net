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
  const flatWeights = weights.flat(2);
  const flatBiases = biases.flat();

  const weightStats = {
    mean: flatWeights.reduce((a, b) => a + b, 0) / flatWeights.length,
    max: Math.max(...flatWeights),
    min: Math.min(...flatWeights)
  };

  const biasStats = {
    mean: flatBiases.reduce((a, b) => a + b, 0) / flatBiases.length,
    max: Math.max(...flatBiases),
    min: Math.min(...flatBiases)
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Network Statistics</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Weights</Typography>
        <Typography>Mean: {weightStats.mean.toFixed(4)}</Typography>
        <Typography>Max: {weightStats.max.toFixed(4)}</Typography>
        <Typography>Min: {weightStats.min.toFixed(4)}</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Biases</Typography>
        <Typography>Mean: {biasStats.mean.toFixed(4)}</Typography>
        <Typography>Max: {biasStats.max.toFixed(4)}</Typography>
        <Typography>Min: {biasStats.min.toFixed(4)}</Typography>
      </Box>

      <Typography variant="subtitle2">Learning Rate: {learningRate}</Typography>
    </Paper>
  );
}; 