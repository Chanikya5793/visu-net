import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { LayerComparisonProps } from '../types';

export const LayerComparison: React.FC<LayerComparisonProps> = ({ 
  layers, 
  activations 
}) => (
  <Paper sx={{ p: 2, mt: 2 }}>
    <Typography variant="h6" gutterBottom>Layer Comparison</Typography>
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
      {layers.map((neurons, idx) => (
        <Box key={idx} sx={{ minWidth: 150 }}>
          <Typography variant="subtitle2">{`Layer ${idx}`}</Typography>
          <Box sx={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            {activations[idx]?.map((value, neuronIdx) => (
              <Box
                key={neuronIdx}
                sx={{
                  width: '8px',
                  height: `${value * 100}%`,
                  bgcolor: `rgba(33, 150, 243, ${value})`,
                  transition: 'height 0.3s'
                }}
                title={`Neuron ${neuronIdx}: ${value.toFixed(4)}`}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
); 