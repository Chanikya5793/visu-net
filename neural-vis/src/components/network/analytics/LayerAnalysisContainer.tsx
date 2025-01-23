import { Box, Typography } from '@mui/material';
import React from 'react';
import { InfoTooltip } from '../controls/InfoTooltip';
import { LayerAnalysis } from './LayerAnalysis';

interface LayerAnalysisContainerProps {
  layers: number[];
  activations?: number[][];
  weights?: number[][][];
  gradients?: number[][][];
  biases?: number[][];
}

export const LayerAnalysisContainer: React.FC<LayerAnalysisContainerProps> = ({
  layers,
  activations,
  weights,
  gradients,
  biases
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Layer-wise Analysis</Typography>
        <InfoTooltip
          title="Layer-wise Analysis"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Comprehensive analysis of each layer in the neural network:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Detailed statistics for each layer</li>
                <li>Weight and gradient distributions</li>
                <li>Activation patterns and ranges</li>
                <li>Layer-specific topology information</li>
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Layer Analysis Components */}
      {layers.map((_, index) => (
        <LayerAnalysis
          key={index}
          layer={index}
          layers={layers}
          activations={activations}
          weights={weights}
          gradients={gradients}
          biases={biases}
        />
      ))}
    </Box>
  );
}; 