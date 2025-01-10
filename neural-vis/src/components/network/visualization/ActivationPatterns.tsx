/**
 * ActivationPatterns Component
 * 
 * Visualizes the activation patterns of neurons in a specific layer using a bar chart visualization.
 * Each bar represents a neuron's activation value, with height and color intensity indicating strength.
 * 
 * Props:
 * - activations: 2D array of activation values [layer][neuron]
 * - layer: Index of the current layer being visualized
 * 
 * Layout Configuration:
 * - Container: Uses Material-UI Paper with elevation and spacing
 * - Bar Chart: Responsive visualization with hover tooltips
 * - Spacing: Consistent padding and margins (adjust values below)
 * 
 * To adjust spacing:
 * - Overall padding: Modify 'p' in the Paper sx prop (currently 3)
 * - Top margin: Modify 'mt' in the Paper sx prop (currently 3)
 * - Bottom margin: Modify 'mb' in the Paper sx prop (currently 3)
 * - Chart padding: Modify 'p' in the chart container Box (currently 2)
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
        bgcolor: 'background.paper'
      }}>
        {layerActivations.map((value, idx) => (
          <Box
            key={idx}
            sx={{
              flex: 1,
              minWidth: '8px',
              height: `${Math.max(value * 100, 1)}%`,
              bgcolor: `rgba(33, 150, 243, ${Math.max(value, 0.1)})`,
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
        ))}
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