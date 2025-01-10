import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { NeuronInfo } from '../../../types/neuron-viz.types';

interface NeuronDetailsProps {
  neuron: NeuronInfo;
}

export const NeuronDetails: React.FC<NeuronDetailsProps> = ({ neuron }) => {
  return (
    <Paper sx={{ mt: 2, p: 2, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h6">Neuron Details</Typography>
      <Box sx={{ mt: 1 }}>
        <Typography>Layer: {neuron.layer}</Typography>
        <Typography>Index: {neuron.index}</Typography>
        <Typography>Activation Value: {neuron.value.toFixed(4)}</Typography>
        {neuron.weights && neuron.weights.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Weights:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {neuron.weights.map((w, i) => (
                <Typography key={i} variant="body2">
                  W{i}: {w.toFixed(4)}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}; 