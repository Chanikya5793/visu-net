import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Paper, Slider, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { NeuronInfo } from '../../../types/neuron-viz.types';

interface EnhancedNeuronDetailDialogProps {
  open: boolean;
  onClose: () => void;
  neuron: NeuronInfo | null;
  weights?: number[][][];
  biases?: number[][];
  activations?: number[][];
  gradients?: number[][][];
}

export const EnhancedNeuronDetailDialog: React.FC<EnhancedNeuronDetailDialogProps> = ({
  open,
  onClose,
  neuron,
  weights,
  biases,
  activations,
  gradients
}) => {
  // State for interactive features - moved before conditional return
  const [selectedTab, setSelectedTab] = useState('overview');
  const [testInput, setTestInput] = useState(0);

  if (!neuron) return null;

  const { layer, index, value } = neuron;
  const bias = biases?.[layer]?.[index] || 0;
  const activation = value;
  
  // Fix layer labeling and connection logic
  const layerLabel = layer === 0 ? 'Input Layer' : 
                    layer === (weights?.length || 0) - 1 ? 'Output Layer' : 
                    `Hidden Layer ${layer}`;

  // Calculate incoming and outgoing connections correctly
  const incomingWeights = layer === 0 ? [] : weights?.[layer - 1]?.[index] || [];
  const outgoingWeights = weights?.[layer]?.map(n => n[index]) || [];
  
  // Calculate gradients with proper layer indexing
  const incomingGradients = layer === 0 ? [] : gradients?.[layer - 1]?.[index] || [];
  const outgoingGradients = layer === (weights?.length || 0) - 1 ? [] : gradients?.[layer]?.map(n => n[index]) || [];

  // Update layer position description
  const layerPosition = `This neuron is in the ${layerLabel.toLowerCase()}, processing information from ${layer === 0 ? 'the input data' : `${incomingWeights.length} previous neurons`} and sending signals to ${layer === (weights?.length || 0) - 1 ? 'the final output' : `${outgoingWeights.length} neurons in the next layer`}.`;
  
  // Calculate neuron's response to test input
  const calculateResponse = (input: number) => {
    return 1 / (1 + Math.exp(-(input * (incomingWeights[0] || 1) + bias)));
  };

  // Educational content
  const educationalContent = {
    activation: {
      title: 'Activation Function',
      content: 'The activation function determines the output of a neuron based on its inputs. We use the sigmoid function here, which squashes values between 0 and 1.'
    },
    weights: {
      title: 'Weights & Connections',
      content: 'Weights represent the strength of connections between neurons. Positive weights amplify signals, while negative weights inhibit them.'
    },
    gradients: {
      title: 'Gradients & Learning',
      content: 'Gradients show how much each weight should change to reduce the network\'s error. Larger gradients mean bigger updates during training.'
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {layer === 0 ? 'Input Layer' : 
             layer === (weights?.length || 0) ? 'Output Layer' : 
             `Hidden Layer ${layer}`} Neuron ${index + 1}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: '1fr 1fr', p: 2 }}>
          {/* Interactive Neuron Response Section */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Neuron Response</Typography>
              <Tooltip title={educationalContent.activation.content}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>Test Input</Typography>
              <Slider
                value={testInput}
                onChange={(_, value) => setTestInput(value as number)}
                min={-2}
                max={2}
                step={0.1}
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="primary">
                Output: {calculateResponse(testInput).toFixed(4)}
              </Typography>
            </Box>
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {educationalContent.activation.content}
              </Typography>
            </Box>
          </Paper>

          {/* Weight Distribution Section */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Weight Distribution</Typography>
              <Tooltip title={educationalContent.weights.content}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>Incoming Weights</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {incomingWeights.map((weight, idx) => {
                    const weightValue = weight || 0;
                    const normalizedWeight = Math.tanh(weightValue); // Normalize to -1 to 1 range
                    return (
                      <Tooltip key={idx} title={`Weight from neuron ${idx}: ${weightValue.toFixed(4)}`}>
                        <Box
                          sx={{
                            width: 20,
                            height: 60,
                            bgcolor: weightValue > 0 ? 'rgba(35, 197, 102, 0.9)' : 'rgba(255, 64, 129, 0.9)',
                            opacity: 0.3 + 0.7 * Math.abs(normalizedWeight),
                            borderRadius: 1
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>Outgoing Weights</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {outgoingWeights.map((weight, idx) => {
                    const weightValue = weight || 0;
                    const normalizedWeight = Math.tanh(weightValue); // Normalize to -1 to 1 range
                    return (
                      <Tooltip key={idx} title={`Weight to neuron ${idx}: ${weightValue.toFixed(4)}`}>
                        <Box
                          sx={{
                            width: 20,
                            height: 60,
                            bgcolor: weightValue > 0 ? 'rgba(35, 197, 102, 0.9)' : 'rgba(255, 64, 129, 0.9)',
                            opacity: 0.3 + 0.7 * Math.abs(normalizedWeight),
                            borderRadius: 1
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Gradient Information Section */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Learning Dynamics</Typography>
              <Tooltip title={educationalContent.gradients.content}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>Current State</Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">
                    Activation: {activation.toFixed(4)}
                  </Typography>
                  <Typography variant="body2">
                    Bias: {bias.toFixed(4)}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>Gradient Information</Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">
                    Average Incoming Gradient: {incomingGradients.length > 0 
                      ? (incomingGradients.reduce((a, b) => a + b, 0) / incomingGradients.length).toFixed(4)
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Average Outgoing Gradient: {outgoingGradients.length > 0
                      ? (outgoingGradients.reduce((a, b) => a + b, 0) / outgoingGradients.length).toFixed(4)
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Network Impact Section */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Network Impact</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>Connection Summary</Typography>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">
                    Total Connections: {incomingWeights.length + outgoingWeights.length}
                  </Typography>
                  <Typography variant="body2">
                    Strongest Incoming: {incomingWeights.length > 0 
                      ? Math.max(...incomingWeights.map(Math.abs)).toFixed(4)
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Strongest Outgoing: {outgoingWeights.length > 0
                      ? Math.max(...outgoingWeights.map(Math.abs)).toFixed(4)
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>Layer Position</Typography>
                <Typography variant="body2">
                  This neuron is in the {layer === 0 ? 'input' : 
                    layer === (weights?.length || 0) ? 'output' : 
                    `hidden layer ${layer}`}, processing information from 
                    {layer === 0 ? ' the input data' : 
                     ` ${incomingWeights.length} previous neurons`} and sending signals to
                    {layer === (weights?.length || 0) ? ' the final output' : 
                     ` ${outgoingWeights.length} neurons in the next layer`}.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};