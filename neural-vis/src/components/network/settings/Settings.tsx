import { Box, FormControlLabel, Grid, Paper, Slider, Switch, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

interface VisualizationSettings {
  neuronRadius: number;
  layerSpacing: number;
  verticalSpacing: number;
  connectionOpacity: number;
  showActivationValues: boolean;
  showWeightValues: boolean;
  animationSpeed: number;
}

interface TrainingSettings {
  batchSize: number;
  epochs: number;
  validationSplit: number;
  earlyStoppingPatience: number;
}

const Settings: React.FC = () => {
  const [vizSettings, setVizSettings] = useState<VisualizationSettings>({
    neuronRadius: 12,
    layerSpacing: 150,
    verticalSpacing: 40,
    connectionOpacity: 0.7,
    showActivationValues: true,
    showWeightValues: true,
    animationSpeed: 1.0
  });

  const [trainSettings, setTrainSettings] = useState<TrainingSettings>({
    batchSize: 32,
    epochs: 100,
    validationSplit: 0.2,
    earlyStoppingPatience: 10
  });

  const handleVizSettingChange = (field: keyof VisualizationSettings, value: any) => {
    setVizSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTrainSettingChange = (field: keyof TrainingSettings, value: any) => {
    setTrainSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Visualization Settings
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography gutterBottom>Neuron Size</Typography>
                <Slider
                  value={vizSettings.neuronRadius}
                  onChange={(_, value) => handleVizSettingChange('neuronRadius', value)}
                  min={8}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography gutterBottom>Layer Spacing</Typography>
                <Slider
                  value={vizSettings.layerSpacing}
                  onChange={(_, value) => handleVizSettingChange('layerSpacing', value)}
                  min={100}
                  max={300}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography gutterBottom>Vertical Spacing</Typography>
                <Slider
                  value={vizSettings.verticalSpacing}
                  onChange={(_, value) => handleVizSettingChange('verticalSpacing', value)}
                  min={20}
                  max={80}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography gutterBottom>Connection Opacity</Typography>
                <Slider
                  value={vizSettings.connectionOpacity}
                  onChange={(_, value) => handleVizSettingChange('connectionOpacity', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography gutterBottom>Animation Speed</Typography>
                <Slider
                  value={vizSettings.animationSpeed}
                  onChange={(_, value) => handleVizSettingChange('animationSpeed', value)}
                  min={0.1}
                  max={2}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={vizSettings.showActivationValues}
                    onChange={(e) => handleVizSettingChange('showActivationValues', e.target.checked)}
                  />
                }
                label="Show Activation Values"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={vizSettings.showWeightValues}
                    onChange={(e) => handleVizSettingChange('showWeightValues', e.target.checked)}
                  />
                }
                label="Show Weight Values"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Training Settings
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Batch Size"
                type="number"
                value={trainSettings.batchSize}
                onChange={(e) => handleTrainSettingChange('batchSize', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 512 }}
                helperText="Number of samples per gradient update"
              />

              <TextField
                label="Epochs"
                type="number"
                value={trainSettings.epochs}
                onChange={(e) => handleTrainSettingChange('epochs', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 1000 }}
                helperText="Number of complete passes through the training dataset"
              />

              <Box>
                <Typography gutterBottom>Validation Split</Typography>
                <Slider
                  value={trainSettings.validationSplit}
                  onChange={(_, value) => handleTrainSettingChange('validationSplit', value)}
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value * 100}%`}
                />
              </Box>

              <TextField
                label="Early Stopping Patience"
                type="number"
                value={trainSettings.earlyStoppingPatience}
                onChange={(e) => handleTrainSettingChange('earlyStoppingPatience', parseInt(e.target.value))}
                inputProps={{ min: 1, max: 50 }}
                helperText="Number of epochs to wait before early stopping"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;