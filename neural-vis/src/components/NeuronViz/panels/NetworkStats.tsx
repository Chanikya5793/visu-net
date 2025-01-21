import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { NetworkStatsProps, NetworkStatsType } from '../types';

export const NetworkStats: React.FC<NetworkStatsProps> = ({ 
  weights, 
  biases, 
  learningRate 
}) => {
  const calculateStats = (): NetworkStatsType => {
    const allWeights = weights.flat(2);
    const allBiases = biases.flat();
    const weightMean = allWeights.reduce((a, b) => a + b, 0) / allWeights.length;
    const biasMean = allBiases.reduce((a, b) => a + b, 0) / allBiases.length;
    
    return {
      weightMean,
      weightStd: Math.sqrt(allWeights.reduce((a, b) => a + (b - weightMean) ** 2, 0) / allWeights.length),
      biasMean,
      biasStd: Math.sqrt(allBiases.reduce((a, b) => a + (b - biasMean) ** 2, 0) / allBiases.length),
    };
  };

  const { weightMean, weightStd, biasMean, biasStd } = calculateStats();

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Network Statistics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2">Weights</Typography>
          <Typography>Mean: {weightMean.toFixed(4)}</Typography>
          <Typography>Std Dev: {weightStd.toFixed(4)}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Biases</Typography>
          <Typography>Mean: {biasMean.toFixed(4)}</Typography>
          <Typography>Std Dev: {biasStd.toFixed(4)}</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        Learning Rate: {learningRate}
      </Typography>
    </Paper>
  );
}; 