import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

interface ExperimentConfig {
  name: string;
  layers: number[];
  learningRate: number;
  activationFunction: string;
  optimizer: string;
  dataset: string;
}

const Experiments: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<ExperimentConfig>({
    name: '',
    layers: [2, 4, 1],
    learningRate: 0.01,
    activationFunction: 'sigmoid',
    optimizer: 'sgd',
    dataset: 'xor'
  });

  const handleConfigChange = (field: keyof ExperimentConfig, value: any) => {
    setCurrentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleLayersChange = (value: string) => {
    const layers = value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    handleConfigChange('layers', layers);
  };

  const addExperiment = () => {
    setExperiments(prev => [...prev, { ...currentConfig, name: `Experiment ${prev.length + 1}` }]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Neural Network Experiments
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Experiment
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Layer Configuration"
                value={currentConfig.layers.join(', ')}
                onChange={(e) => handleLayersChange(e.target.value)}
                helperText="Enter numbers separated by commas (e.g., 2, 4, 1)"
              />

              <TextField
                label="Learning Rate"
                type="number"
                value={currentConfig.learningRate}
                onChange={(e) => handleConfigChange('learningRate', parseFloat(e.target.value))}
                inputProps={{ step: 0.001, min: 0.001, max: 1 }}
              />

              <FormControl fullWidth>
                <InputLabel>Activation Function</InputLabel>
                <Select
                  value={currentConfig.activationFunction}
                  onChange={(e) => handleConfigChange('activationFunction', e.target.value)}
                >
                  <MenuItem value="sigmoid">Sigmoid</MenuItem>
                  <MenuItem value="relu">ReLU</MenuItem>
                  <MenuItem value="tanh">Tanh</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Optimizer</InputLabel>
                <Select
                  value={currentConfig.optimizer}
                  onChange={(e) => handleConfigChange('optimizer', e.target.value)}
                >
                  <MenuItem value="sgd">SGD</MenuItem>
                  <MenuItem value="adam">Adam</MenuItem>
                  <MenuItem value="rmsprop">RMSprop</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={currentConfig.dataset}
                  onChange={(e) => handleConfigChange('dataset', e.target.value)}
                >
                  <MenuItem value="xor">XOR</MenuItem>
                  <MenuItem value="mnist">MNIST</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={addExperiment}
                sx={{ mt: 2 }}
              >
                Create Experiment
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Experiment History
            </Typography>
            
            {experiments.length === 0 ? (
              <Typography variant="body1" color="textSecondary">
                No experiments created yet. Create one to get started!
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {experiments.map((exp, index) => (
                  <Paper key={index} elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {exp.name}
                    </Typography>
                    <Typography variant="body2">
                      Layers: {exp.layers.join(' → ')}
                    </Typography>
                    <Typography variant="body2">
                      Learning Rate: {exp.learningRate}
                    </Typography>
                    <Typography variant="body2">
                      Activation: {exp.activationFunction}
                    </Typography>
                    <Typography variant="body2">
                      Optimizer: {exp.optimizer}
                    </Typography>
                    <Typography variant="body2">
                      Dataset: {exp.dataset}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Experiments;