import { Box, Typography } from '@mui/material';
import React from 'react';
import { ActivationPatternsProps } from '../types';

export const ActivationPatterns: React.FC<ActivationPatternsProps> = ({
  activations,
  layer
}) => {
  const layerActivations = activations[layer] || [];
  
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2">Layer {layer} Activation Pattern</Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        height: 50,
        alignItems: 'flex-end'
      }}>
        {layerActivations.map((value, idx) => (
          <Box
            key={idx}
            sx={{
              width: 10,
              height: `${value * 100}%`,
              bgcolor: `rgba(33, 150, 243, ${value})`,
              transition: 'all 0.3s'
            }}
          />
        ))}
      </Box>
    </Box>
  );
}; 