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
            <Box sx={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              {activations?.[idx]?.map((value, neuronIdx) => (
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
    </Box>
  );
}; 