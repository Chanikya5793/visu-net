/**
 * Network Settings Component
 * 
 * A React component that provides a comprehensive interface for configuring both visualization
 * and training settings of the neural network.
 * 
 * Features:
 * 
 * Visualization Settings:
 * - Neuron Size (8-20 units)
 * - Layer Spacing (100-300 units)
 * - Vertical Spacing (20-80 units)
 * - Connection Opacity (0.1-1.0)
 * - Animation Speed (0.1-2.0x)
 * - Toggle Activation Values
 * - Toggle Weight Values
 * 
 * Training Settings:
 * - Batch Size (1-512)
 * - Epochs (1-1000)
 * - Validation Split (10-50%)
 * - Early Stopping Patience (1-50 epochs)
 * 
 * State Management:
 * - Uses useSettingsStore for global state
 * - Implements temporary state for handling unsaved changes
 * - Provides reset to defaults functionality
 * 
 * Customization:
 * - All numerical inputs have configurable min/max values
 * - Slider steps can be adjusted for finer control
 * - Layout uses Material-UI Grid system for responsive design
 * 
 * @component
 */

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Box, Button, FormControlLabel, Grid, IconButton, Paper, Slider, Switch, TextField, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { settingDescriptions, useSettingsStore } from '../../../stores/settingsStore';

const Settings: React.FC = () => {
  // Get settings and setter functions from the global store
  const {
    neuronRadius,
    layerSpacing,
    verticalSpacing,
    connectionOpacity,
    showActivationValues,
    showWeightValues,
    animationSpeed,
    setNeuronRadius,
    setLayerSpacing,
    setVerticalSpacing,
    setConnectionOpacity,
    setShowActivationValues,
    setShowWeightValues,
    setAnimationSpeed,
    batchSize,
    epochs,
    validationSplit,
    earlyStoppingPatience,
    setBatchSize,
    setEpochs,
    setValidationSplit,
    setEarlyStoppingPatience,
    resetToDefaults
  } = useSettingsStore();

  // Temporary state for handling unsaved changes
  const [tempSettings, setTempSettings] = useState({
    neuronRadius,
    layerSpacing,
    verticalSpacing,
    connectionOpacity,
    showActivationValues,
    showWeightValues,
    animationSpeed,
    batchSize,
    epochs,
    validationSplit,
    earlyStoppingPatience
  });

  // Sync temporary settings with global settings when they change
  useEffect(() => {
    setTempSettings({
      neuronRadius,
      layerSpacing,
      verticalSpacing,
      connectionOpacity,
      showActivationValues,
      showWeightValues,
      animationSpeed,
      batchSize,
      epochs,
      validationSplit,
      earlyStoppingPatience
    });
  }, [neuronRadius, layerSpacing, verticalSpacing, connectionOpacity, showActivationValues,
      showWeightValues, animationSpeed, batchSize, epochs, validationSplit, earlyStoppingPatience]);

  // Apply temporary settings to global state
  const applyChanges = () => {
    setNeuronRadius(tempSettings.neuronRadius);
    setLayerSpacing(tempSettings.layerSpacing);
    setVerticalSpacing(tempSettings.verticalSpacing);
    setConnectionOpacity(tempSettings.connectionOpacity);
    setShowActivationValues(tempSettings.showActivationValues);
    setShowWeightValues(tempSettings.showWeightValues);
    setAnimationSpeed(tempSettings.animationSpeed);
    setBatchSize(tempSettings.batchSize);
    setEpochs(tempSettings.epochs);
    setValidationSplit(tempSettings.validationSplit);
    setEarlyStoppingPatience(tempSettings.earlyStoppingPatience);
  };

  // Reset all settings to their default values
  const handleReset = () => {
    resetToDefaults();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Visualization Settings Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Visualization Settings
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Neuron Size Control */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography gutterBottom>Neuron Size</Typography>
                <Tooltip title={settingDescriptions.neuronRadius} componentsProps={{ tooltip: { sx: { fontSize: '1.2rem' } } }}>
                  <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
                <Slider
                  value={tempSettings.neuronRadius}
                  onChange={(_, value) => setTempSettings(prev => ({ ...prev, neuronRadius: value as number }))}
                  min={8}
                  max={30}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Layer Spacing Control */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography gutterBottom>Layer Spacing</Typography>
                <Tooltip title={settingDescriptions.layerSpacing} componentsProps={{ tooltip: { sx: { fontSize: '1.2rem' } } }}>
                  <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
                <Slider
                  value={tempSettings.layerSpacing}
                  onChange={(_, value) => setTempSettings(prev => ({ ...prev, layerSpacing: value as number }))}
                  min={100}
                  max={400}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Vertical Spacing Control */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography gutterBottom>Vertical Spacing</Typography>
                <Tooltip title={settingDescriptions.verticalSpacing} componentsProps={{ tooltip: { sx: { fontSize: '1.2rem' } } }}>
                  <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
                <Slider
                  value={tempSettings.verticalSpacing}
                  onChange={(_, value) => setTempSettings(prev => ({ ...prev, verticalSpacing: value as number }))}
                  min={20}
                  max={100}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Connection Opacity Control */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography gutterBottom>Connection Opacity</Typography>
                <Tooltip title={settingDescriptions.connectionOpacity} componentsProps={{ tooltip: { sx: { fontSize: '1.2rem' } } }}>
                  <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
                <Slider
                  value={tempSettings.connectionOpacity}
                  onChange={(_, value) => setTempSettings(prev => ({ ...prev, connectionOpacity: value as number }))}
                  min={0.1}
                  max={1}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Animation Speed Control */}
              <Box sx={{ borderRadius: '19px', padding: '1px', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography gutterBottom>Animation Speed</Typography>
                <Tooltip title={settingDescriptions.animationSpeed} componentsProps={{ tooltip: { sx: { fontSize: '1.2rem' } } }}>
                  <IconButton size="small"><HelpOutlineIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Box>
                <Slider
                  value={tempSettings.animationSpeed}
                  onChange={(_, value) => setTempSettings(prev => ({ ...prev, animationSpeed: value as number }))}
                  min={0.1}
                  max={2}
                  step={0.1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Activation Values Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={tempSettings.showActivationValues}
                    onChange={(e) => setTempSettings(prev => ({ ...prev, showActivationValues: e.target.checked }))}
                  />
                }
                label="Show Activation Values"
              />

              {/* Weight Values Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={tempSettings.showWeightValues}
                    onChange={(e) => setTempSettings(prev => ({ ...prev, showWeightValues: e.target.checked }))}
                  />
                }
                label="Show Weight Values"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Training Settings Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Training Settings
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Batch Size Input */}
              <TextField
                label="Batch Size"
                type="number"
                value={tempSettings.batchSize}
                onChange={(e) => setTempSettings(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 512 }}
                helperText="Number of samples per gradient update"
              />

              {/* Epochs Input */}
              <TextField
                label="Epochs"
                type="number"
                value={tempSettings.epochs}
                onChange={(e) => setTempSettings(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 1000 }}
                helperText="Number of complete passes through the training dataset"
              />

              {/* Validation Split Control */}
              <Box>
                <Typography gutterBottom>Validation Split</Typography>
                <Slider
                  value={tempSettings.validationSplit}
                  onChange={(_, value) => setTempSettings(prev => ({ ...prev, validationSplit: value as number }))}
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value * 100}%`}
                />
              </Box>

              {/* Early Stopping Patience Input */}
              <TextField
                label="Early Stopping Patience"
                type="number"
                value={tempSettings.earlyStoppingPatience}
                onChange={(e) => setTempSettings(prev => ({ ...prev, earlyStoppingPatience: parseInt(e.target.value) }))}
                inputProps={{ min: 1, max: 50 }}
                helperText="Number of epochs to wait before early stopping"
              />

              {/* Action Buttons */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleReset}>Reset to Defaults</Button>
                <Button variant="contained" onClick={applyChanges}>Apply Changes</Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;