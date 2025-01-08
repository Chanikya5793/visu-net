// src/components/TrainingMetrics.tsx
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface TrainingMetricsProps {
    iteration: number;
    epochs: number;
    loss: number;
    accuracy: number;
    isTraining: boolean;
}

export const TrainingMetrics: React.FC<TrainingMetricsProps> = ({
    iteration,
    epochs,
    loss,
    accuracy,
    isTraining
}) => (
    <>
    {(isTraining || iteration > 0) && (
      <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Training Progress</Typography>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <Box>
            <Typography color="textSecondary">Current Epoch</Typography>
            <Typography variant="h6">{iteration}/{epochs}</Typography>
          </Box>
          <Box>
            <Typography color="textSecondary">Progress</Typography>
            <Typography variant="h6">{((iteration/epochs) * 100).toFixed(1)}%</Typography>
          </Box>
          <Box>
            <Typography color="textSecondary">Loss</Typography>
            <Typography variant="h6">{loss.toFixed(6)}</Typography>
          </Box>
          <Box>
            <Typography color="textSecondary">Accuracy</Typography>
            <Typography variant="h6">{(accuracy * 100).toFixed(2)}%</Typography>
          </Box>
        </Box>
        {isTraining && (
          <LinearProgress 
            variant="determinate" 
            value={(iteration/epochs) * 100} 
            sx={{ mt: 2 }}
          />
        )}
      </Box>
    )}
  </>
);