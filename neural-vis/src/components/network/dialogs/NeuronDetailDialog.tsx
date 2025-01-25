import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import React from 'react';
import { NeuronInfo } from '../../../types/neuron-viz.types';

interface NeuronDetailDialogProps {
  open: boolean;
  onClose: () => void;
  neuron: NeuronInfo | null;
  weights?: number[][][];
  biases?: number[][];
  activations?: number[][];
  gradients?: number[][][];
}

export const NeuronDetailDialog: React.FC<NeuronDetailDialogProps> = ({
  open,
  onClose,
  neuron,
  weights,
  biases,
  activations,
  gradients
}) => {
  if (!neuron) return null;

  const { layer, index, value } = neuron;
  const bias = biases?.[layer]?.[index] || 0;
  const activation = value;
  
  // Calculate incoming and outgoing connections
  const incomingWeights = layer > 0 ? weights?.[layer - 1]?.[index] || [] : [];
  const outgoingWeights = weights?.[layer]?.map(n => n[index]) || [];
  
  // Calculate gradients if available
  const incomingGradients = layer > 0 ? gradients?.[layer - 1]?.[index] || [] : [];
  const outgoingGradients = gradients?.[layer]?.map(n => n[index]) || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {layer === 0 ? 'Input' : 
             layer === (weights?.length || 0) ? 'Output' : 
             'Hidden'} Neuron {index + 1}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr' }}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Basic Information</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">
                Layer: {layer + 1} ({layer === 0 ? 'Input' : 
                                   layer === (weights?.length || 0) ? 'Output' : 
                                   'Hidden'})
              </Typography>
              <Typography variant="body2">Position: {index + 1}</Typography>
              <Typography variant="body2">Current Activation: {activation.toFixed(4)}</Typography>
              <Typography variant="body2">Bias: {bias.toFixed(4)}</Typography>
            </Box>
          </Box>

          {/* Connection Statistics */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>Connection Statistics</Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography variant="body2">
                Incoming Connections: {incomingWeights.length}
              </Typography>
              <Typography variant="body2">
                Outgoing Connections: {outgoingWeights.length}
              </Typography>
              <Typography variant="body2">
                Average Incoming Weight: {
                  incomingWeights.length > 0 
                    ? (incomingWeights.reduce((a, b) => a + b, 0) / incomingWeights.length).toFixed(4)
                    : 'N/A'
                }
              </Typography>
              <Typography variant="body2">
                Average Outgoing Weight: {
                  outgoingWeights.length > 0
                    ? (outgoingWeights.reduce((a, b) => a + b, 0) / outgoingWeights.length).toFixed(4)
                    : 'N/A'
                }
              </Typography>
            </Box>
          </Box>

          {/* Gradient Information */}
          {gradients && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="subtitle1" gutterBottom>Gradient Information</Typography>
              <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: '1fr 1fr' }}>
                <Box>
                  <Typography variant="body2" gutterBottom>Incoming Gradients</Typography>
                  {incomingGradients.map((gradient, idx) => (
                    <Typography key={idx} variant="body2" color={gradient > 0 ? 'success.main' : 'error.main'}>
                      Connection {idx + 1}: {gradient.toFixed(4)}
                    </Typography>
                  ))}
                </Box>
                <Box>
                  <Typography variant="body2" gutterBottom>Outgoing Gradients</Typography>
                  {outgoingGradients.map((gradient, idx) => (
                    <Typography key={idx} variant="body2" color={gradient > 0 ? 'success.main' : 'error.main'}>
                      Connection {idx + 1}: {gradient.toFixed(4)}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};