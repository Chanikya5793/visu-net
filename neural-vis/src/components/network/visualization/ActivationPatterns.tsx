/**
 * ActivationPatterns Component
 * 
 * A React component that visualizes the activation patterns of neurons in each layer
 * of the neural network. Provides insights into how neurons respond to input data.
 * 
 * Features:
 * - Real-time activation visualization
 * - Layer-wise neuron activity display
 * - Interactive tooltips with activation values
 * - Color-coded activation strength
 * - Responsive bar chart visualization
 * 
 * Props:
 * @param {number[][]} activations - 2D array of activation values [layer][neuron]
 * @param {number} layer - Current layer index being visualized
 * @param {number[]} layers - Array containing number of neurons in each layer
 * 
 * Visual Elements:
 * - Bar chart showing neuron activations
 * - Color intensity indicating activation strength
 * - Tooltips displaying exact activation values
 * - Layer information and statistics
 * 
 * Implementation:
 * - Uses Material-UI for layout and styling
 * - Dynamic color scaling based on activation values
 * - Responsive design with automatic resizing
 * - Optimized rendering for performance
 * 
 * @component
 */

import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { InfoTooltip } from '../controls/InfoTooltip';

interface ActivationPatternsProps {
  activations: number[][];
  layer: number;
  layers: number[];
}

export const ActivationPatterns: React.FC<ActivationPatternsProps> = ({
  activations,
  layer,
  layers
}) => {
  // Get activations for the current layer
  const layerActivations = activations[layer] || [];
  
  // Get the actual number of neurons in this layer
  const totalNeurons = layers[layer] || 0;
  
  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1
      }}
    >
      {/* Header with title and info tooltip */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Layer {layer} Activation Pattern</Typography>
        <InfoTooltip
          title="Layer Activation Pattern"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Shows how neurons in this layer respond to input:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Bar Height: Represents neuron activation strength (0 to 1)</li>
                <li>Pattern: Shows which neurons are most active for current input</li>
                <li>Distribution: Indicates how information flows through the layer</li>
                <li>Updates: Changes in real-time as input or weights change</li>
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Activation bars visualization */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'flex-end',
        height: '150px',
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {layerActivations.map((value, idx) => {
          // Ensure value is between 0 and 1
          const normalizedValue = Math.min(Math.max(value, 0), 1);
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                minWidth: '8px',
                height: `${normalizedValue * 90}%`, // Use 90% to leave some padding
                bgcolor: `rgba(33, 150, 243, ${Math.max(normalizedValue, 0.1)})`,
                transition: 'height 0.3s ease-in-out',
                borderRadius: '4px 4px 0 0',
                position: 'relative',
                '&:hover::after': {
                  content: `'${value.toFixed(4)}'`,
                  position: 'absolute',
                  top: '-24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  p: '4px 8px',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                  boxShadow: 1,
                  zIndex: 1
                }
              }}
            />
          );
        })}
      </Box>

      {/* Layer information */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
        Active Neurons: {layerActivations.filter(v => v > 0).length} {/* of {totalNeurons} */}
        {/* Neurons: {layerActivations.length} */}
          <p>Total Neurons: {totalNeurons}</p>
        </Typography>
      </Box>
    </Paper>
  );
};