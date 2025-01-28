/**
 * Settings Component
 * 
 * A React component that provides a user interface for managing global application settings.
 * 
 * Features:
 * - Dark Mode toggle
 * - Animation Speed control
 * - Label visibility toggle
 * 
 * State Management:
 * - Uses useSettingsStore for global state management
 * - Implements a temporary state pattern for handling unsaved changes
 * 
 * @component
 */

import { Box, Button, FormControlLabel, Grid, Paper, Slider, Switch, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

const Settings: React.FC = () => {
  // Get settings and setter functions from the global store
  const {
    darkMode,
    animationSpeed,
    showLabels,
    setDarkMode,
    setAnimationSpeed,
    setShowLabels,
    resetToDefaults,
  } = useSettingsStore();

  // Temporary state for handling unsaved changes
  const [tempSettings, setTempSettings] = useState({
    darkMode,
    animationSpeed,
    showLabels
  });

  // Sync temporary settings with global settings when they change
  useEffect(() => {
    setTempSettings({
      darkMode,
      animationSpeed,
      showLabels
    });
  }, [darkMode, animationSpeed, showLabels]);

  // Apply temporary settings to global state
  const applyChanges = () => {
    setDarkMode(tempSettings.darkMode);
    setAnimationSpeed(tempSettings.animationSpeed);
    setShowLabels(tempSettings.showLabels);
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
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Dark Mode Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={tempSettings.darkMode}
                    onChange={(e) => setTempSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                  />
                }
                label="Dark Mode"
              />

              {/* Animation Speed Slider */}
              <Box>
                <Typography gutterBottom>Animation Speed</Typography>
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

              {/* Show Labels Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={tempSettings.showLabels}
                    onChange={(e) => setTempSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                  />
                }
                label="Show Labels"
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
