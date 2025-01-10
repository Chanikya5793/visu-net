// src/components/TrainingControls.tsx
import { Box, Button, Slider, Tooltip, Typography } from '@mui/material';
import React from 'react';

interface TrainingControlsProps {
  epochs: number;
  isTraining: boolean;
  isPaused: boolean;
  onEpochChange: (event: Event, newValue: number | number[]) => void;
  onStart: () => void;
  onPause: () => void;
  onContinue: () => void;
  onStop: () => void;
  onReset: () => void;
  currentDataset: 'custom' | 'default';
}

export const TrainingControls: React.FC<TrainingControlsProps> = ({
  epochs,
  isTraining,
  isPaused,
  onEpochChange,
  onStart,
  onPause,
  onContinue,
  onStop,
  onReset,
  currentDataset
}) => (
  <Box sx={{ mt: 2 }}>
    <Typography gutterBottom>Number of Epochs</Typography>
    <Slider
      value={epochs}
      onChange={onEpochChange}
      min={100}
      max={5000}
      step={100}
      valueLabelDisplay="auto"
      disabled={isTraining}
    />
    <Box sx={{ mt: 2 }}>
      <Tooltip title={`Using ${currentDataset} dataset for training`}>
        <Button 
          variant="contained" 
          onClick={onStart}
          disabled={isTraining}
          sx={{ mr: 1 }}
        >
          Start Training
        </Button>
      </Tooltip>
      <Tooltip title="Feature under development" placement="top">
        <span>
          <Button 
            variant="outlined" 
            disabled={true}
            sx={{ mr: 1, opacity: 0.6 }}
          >
            Pause
          </Button>
        </span>
      </Tooltip>
      <Button 
        variant="outlined" 
        onClick={onStop}
        disabled={!isTraining}
        sx={{ mr: 1 }}
      >
        Stop
      </Button>
      <Button 
        variant="outlined" 
        onClick={onReset}
        disabled={isTraining}
      >
        Reset
      </Button>
    </Box>
  </Box>
);