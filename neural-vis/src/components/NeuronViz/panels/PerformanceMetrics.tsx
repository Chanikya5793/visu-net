import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { PerformanceMetricsProps } from '../types';

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="textSecondary">Accuracy</Typography>
          <Typography variant="h6">{(metrics.accuracy * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Precision</Typography>
          <Typography variant="h6">{(metrics.precision * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Recall</Typography>
          <Typography variant="h6">{(metrics.recall * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">F1 Score</Typography>
          <Typography variant="h6">{(metrics.f1Score * 100).toFixed(1)}%</Typography>
        </Box>
      </Box>
    </Paper>
  );
}; 