/**
 * LayerComparison Component
 * 
 * A React component that visualizes and compares activation patterns across different layers
 * of the neural network. Helps understand how information flows and transforms through the network.
 * 
 * Features:
 * - Visual comparison of neuron activations across layers
 * - Interactive bar chart visualization
 * - Hover tooltips with precise activation values
 * - Responsive design with horizontal scrolling
 * - Color-coded activation strength
 * 
 * Props:
 * @param {number[]} layers - Array containing the number of neurons in each layer
 * @param {number[][]} [activations] - Optional 2D array of activation values for each neuron
 * 
 * Visual Elements:
 * - Bar charts representing neuron activations
 * - Layer labels and titles
 * - Tooltips showing exact activation values
 * - Color intensity indicating activation strength
 * 
 * Implementation:
 * - Uses Material-UI for styling and layout
 * - Dynamic bar height calculation based on activation values
 * - Smooth transitions for value changes
 * - Informative tooltips for data interpretation
 * 
 * @component
 */

import { Box, Typography } from '@mui/material';
import React from 'react';
import { InfoTooltip } from '../controls/InfoTooltip';

interface LayerComparisonProps {
  layers: number[];
  activations?: number[][];
}

export const LayerComparison: React.FC<LayerComparisonProps> = ({
  layers,
  activations
}) => {
  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Layer Comparison</Typography>
        <InfoTooltip
          title="Layer Comparison"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Compares activation patterns across different layers:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Bar Height: Relative activation strength in each layer</li>
                <li>Pattern: Shows how information transforms between layers</li>
                <li>Comparison: Helps understand feature extraction process</li>
                <li>Flow: Visualizes information flow through the network</li>
              </Typography>
            </Box>
          }
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {layers.map((neurons, idx) => (
          <Box key={idx} sx={{ minWidth: 150 }}>
            <Typography variant="subtitle2">{`Layer ${idx}`}</Typography>
            <Box 
              sx={{ 
                height: 150, 
                display: 'flex', 
                alignItems: 'flex-end', 
                gap: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                bgcolor: 'background.paper',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {activations?.[idx]?.map((value, neuronIdx) => {
                // Ensure value is between 0 and 1
                const normalizedValue = Math.min(Math.max(value, 0), 1);
                return (
                  <Box
                    key={neuronIdx}
                    sx={{
                      flex: 1,
                      minWidth: '8px',
                      height: `${normalizedValue * 90}%`, // Use 90% to leave some padding
                      bgcolor: `rgba(33, 150, 243, ${Math.max(normalizedValue, 0.1)})`,
                      transition: 'height 0.3s',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      '&:hover::after': {
                        content: `'${value.toFixed(3)}'`,
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        fontSize: '0.75rem',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        boxShadow: 1,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                        opacity: 0.9,
                        textAlign: 'center',
                        minWidth: '40px',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordWrap: 'break-word',
                        zIndex: 1
                      }
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};