import { Box, Slider, Typography } from '@mui/material';
import React from 'react';

interface LearningRateControlProps {
  learningRate: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

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