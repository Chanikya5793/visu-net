// src/components/TrainingControls.tsx
/**
 * TrainingControls Component
 * 
 * A React component that provides controls for managing neural network training.
 * 
 * Features:
 * - Epoch control slider (100-5000 epochs)
 * - Training control buttons (Start, Pause, Stop, Reset)
 * - Dataset indicator tooltip
 * 
 * Props:
 * @param {number} epochs - Current number of training epochs
 * @param {boolean} isTraining - Flag indicating if training is in progress
 * @param {boolean} isPaused - Flag indicating if training is paused
 * @param {function} onEpochChange - Callback for epoch slider changes
 * @param {function} onStart - Callback for starting training
 * @param {function} onPause - Callback for pausing training (currently disabled)
 * @param {function} onContinue - Callback for continuing paused training
 * @param {function} onStop - Callback for stopping training
 * @param {function} onReset - Callback for resetting training
 * @param {'custom' | 'default'} currentDataset - Type of dataset being used
 * 
 * Usage:
 * ```tsx
 * <TrainingControls
 *   epochs={1000}
 *   isTraining={false}
 *   isPaused={false}
 *   onEpochChange={handleEpochChange}
 *   onStart={handleStart}
 *   onStop={handleStop}
 *   onReset={handleReset}
 *   currentDataset="default"
 * />
 * ```
 */

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
    {/* Epoch Control Slider */}
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
      {/* Start Training Button */}
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
      {/* Pause Button (Currently Disabled) */}
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
      {/* Stop Button */}
      <Button 
        variant="outlined" 
        onClick={onStop}
        disabled={!isTraining}
        sx={{ mr: 1 }}
      >
        Stop
      </Button>
      {/* Reset Button */}
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