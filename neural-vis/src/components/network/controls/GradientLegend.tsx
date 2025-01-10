import { Box, Paper, Typography } from '@mui/material';
import React from 'react';

export const GradientLegend: React.FC = () => (
  <Paper sx={{ p: 2, mt: 2 }}>
    <Typography variant="h6" gutterBottom>Gradient Visualization Guide</Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Connection Gradients */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>Connection Gradients</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
            <Box sx={{ 
              width: 40, 
              height: 4, 
              bgcolor: 'rgba(76, 175, 80, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>
              <Box sx={{ 
                width: 0, 
                height: 0, 
                borderLeft: '6px solid rgba(76, 175, 80, 0.8)',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent'
              }} />
            </Box>
            <Typography variant="body2">Positive Gradient (Strengthening)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
            <Box sx={{ 
              width: 40, 
              height: 4, 
              bgcolor: 'rgba(244, 67, 54, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>
              <Box sx={{ 
                width: 0, 
                height: 0, 
                borderLeft: '6px solid rgba(244, 67, 54, 0.8)',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent'
              }} />
            </Box>
            <Typography variant="body2">Negative Gradient (Weakening)</Typography>
          </Box>
        </Box>
      </Box>

      {/* Neuron Gradients */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>Neuron Gradients</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%',
              border: '2px dashed rgba(76, 175, 80, 0.8)'
            }} />
            <Typography variant="body2">Positive Impact on Learning</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
            <Box sx={{ 
              width: 24, 
              height: 24, 
              borderRadius: '50%',
              border: '2px dashed rgba(244, 67, 54, 0.8)'
            }} />
            <Typography variant="body2">Negative Impact on Learning</Typography>
          </Box>
        </Box>
      </Box>

      {/* Gradient Strength */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>Gradient Strength</Typography>
        <Typography variant="body2">
          The opacity of the colors indicates the strength of the gradient. 
          Darker colors mean stronger gradients, lighter colors mean weaker gradients.
        </Typography>
      </Box>
    </Box>
  </Paper>
); 