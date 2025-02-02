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
  dataset?: string; // NEW optional prop to distinguish weather prediction
}

export const EnhancedNeuronDetailDialog: React.FC<EnhancedNeuronDetailDialogProps> = ({
  open,
  onClose,
  neuron,
  weights,
  biases,
  activations,
  gradients,
  dataset
}) => {
  // State for interactive features - moved before conditional return
  const [selectedTab, setSelectedTab] = useState('overview');
  const [testInput, setTestInput] = useState(0);

  if (!neuron) return null;

  const { layer, index } = neuron;
  const totalLayers = (weights?.length || 0) + 1;

  // Override activation: for weatherPrediction output neuron, force index 0.
  const activation =
    dataset === 'weatherPrediction' && layer === totalLayers - 1
      ? activations?.[layer]?.[0] ?? 0
      : activations?.[layer]?.[index] ?? 0;
  const bias = biases?.[layer]?.[index] ?? 0;

  let incomingWeights: number[] = [];
  let outgoingWeights: number[] = [];
  let incomingGradients: number[] = [];
  let outgoingGradients: number[] = [];

  if (dataset === 'weatherPrediction') {
    if (layer === 0) { // Input Layer (3 neurons)
      incomingWeights = [];
      // FIX: Outgoing weights should be extracted by mapping over weights[0]
      outgoingWeights = weights?.[0]?.map(row => row[index]) || [];
      incomingGradients = [];
      outgoingGradients = gradients?.[0]?.map(row => row[index]) || [];
    } else if (layer === 1) { // Hidden Layer 1 (3 neurons)
      // Ensure incoming weights/gradients come from input layer
      incomingWeights = weights?.[0]?.map(row => row[index]) || [];
      outgoingWeights = weights?.[1]?.map(row => row[index]) || [];
      incomingGradients = gradients?.[0]?.map(row => row[index]) || [];
      outgoingGradients = gradients?.[1]?.map(row => row[index]) || [];
    } else if (layer === 2) { // Hidden Layer 2 (4 neurons)
      incomingWeights = weights?.[1]?.[index] || [];
      outgoingWeights = weights?.[2]?.map(row => row[index]) || [];
      incomingGradients = gradients?.[1]?.[index] || [];
      outgoingGradients = gradients?.[2]?.map(row => row[index]) || [];
    } else if (layer === (weights?.length || 0)) { // Output Layer (Layer 3: 1 neuron)
      incomingWeights = weights?.[2]?.[0] || [];
      outgoingWeights = [];
      incomingGradients = gradients?.[2]?.[0] || [];
      outgoingGradients = [];
    }
  } else {
    incomingWeights = layer === 0 ? [] : (weights?.[layer - 1]?.[index] || []);
    outgoingWeights =
      layer === (weights?.length || 0) ? [] : (weights?.[layer]?.map(n => n[index]) || []);
    incomingGradients = layer === 0 ? [] : (gradients?.[layer - 1]?.[index] || []);
    outgoingGradients = layer === (weights?.length || 0) ? [] : (gradients?.[layer]?.map(n => n[index]) || []);
  }

  const isInputLayer = layer === 0;
  const isOutputLayer = layer === totalLayers - 1;
  const layerLabel = isInputLayer 
    ? 'Input Layer' 
    : isOutputLayer 
      ? 'Output Layer' 
      : `Hidden Layer ${layer}`;

  // Update layer position description
  const layerPosition = `This neuron is in the ${layerLabel.toLowerCase()}, processing information from ${isInputLayer ? 'the input data' : `${incomingWeights.length} previous neurons`} and sending signals to ${isOutputLayer ? 'the final output' : `${outgoingWeights.length} neurons in the next layer`}.`;
  
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
            {layerLabel} Neuron {index + 1}
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
                    // Increase minimum opacity for weatherPrediction hidden layer 1 neurons
                    const baseOpacity = dataset === 'weatherPrediction' && neuron.layer === 1 ? 0.5 : 0.3;
                    return (
                      <Tooltip key={idx} title={`Weight from neuron ${idx}: ${weightValue.toFixed(4)}`}>
                        <Box
                          sx={{
                            width: 20,
                            height: 60,
                            bgcolor: weightValue > 0 ? 'rgba(35, 197, 102, 0.9)' : 'rgba(255, 64, 129, 0.9)',
                            opacity: baseOpacity + 0.7 * Math.abs(normalizedWeight),
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