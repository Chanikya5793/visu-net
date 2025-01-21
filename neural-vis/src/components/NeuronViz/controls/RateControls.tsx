import { Box, Slider, Typography } from '@mui/material';
import React from 'react';
import { LearningRateControlProps, TrainingSpeedControlProps } from '../types';

export const LearningRateControl: React.FC<LearningRateControlProps> = ({ 
  learningRate, 
  onChange, 
  disabled 
}) => (
  <Box sx={{ width: 200, mx: 2 }}>
    <Typography gutterBottom>Learning Rate</Typography>
    <Slider
      value={learningRate}
      onChange={(_, value) => onChange(value as number)}
      min={0.001}
      max={0.5}
      step={0.001}
      disabled={disabled}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => value.toFixed(3)}
    />
  </Box>
);

export const TrainingSpeedControl: React.FC<TrainingSpeedControlProps> = ({ 
  speed, 
  onChange, 
  disabled 
}) => (
  <Box sx={{ width: 200, mx: 2 }}>
    <Typography gutterBottom>Training Speed</Typography>
    <Slider
      value={speed}
      onChange={(_, value) => onChange(value as number)}
      min={0.5}
      max={2}
      step={0.1}
      disabled={disabled}
      marks={[
        { value: 0.5, label: 'Slow' },
        { value: 1, label: 'Normal' },
        { value: 2, label: 'Fast' }
      ]}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => `${value}x`}
    />
  </Box>
); 