// src/components/TrainingControls.tsx
import React from 'react';
import { Box, Button, Slider, Typography } from '@mui/material';

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
  onReset
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
      <Button 
        variant="contained" 
        onClick={onStart}
        disabled={isTraining || isPaused}
        sx={{ mr: 1 }}
      >
        Start Training
      </Button>
      {!isPaused ? (
        <Button 
          variant="outlined" 
          onClick={onPause}
          disabled={!isTraining}
          sx={{ mr: 1 }}
        >
          Pause
        </Button>
      ) : (
        <Button 
          variant="outlined" 
          onClick={onContinue}
          sx={{ mr: 1 }}
        >
          Continue
        </Button>
      )}
      <Button 
        variant="outlined" 
        onClick={onStop}
        disabled={!isTraining && !isPaused}
        sx={{ mr: 1 }}
      >
        Stop
      </Button>
      <Button 
        variant="outlined" 
        onClick={onReset}
        disabled={isTraining || isPaused}
      >
        Reset
      </Button>
    </Box>
  </Box>
);