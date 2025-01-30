// src/components/TestModelButton.tsx

/**
 * TestModelButton Component
 * 
 * A React component that provides a button interface for testing trained neural network models.
 * The button becomes enabled only after model training is completed.
 * 
 * Features:
 * - Conditional button enabling based on training status
 * - Visual feedback for training requirement
 * - Material-UI styling integration
 * 
 * Props:
 * @param {boolean} trainingCompleted - Flag indicating if model training has been completed
 * @param {boolean} isTestingEnabled - Flag indicating if testing mode is currently enabled
 * @param {function} onEnableTesting - Callback function to handle enabling test mode
 * 
 * Visual States:
 * - Disabled: Shows helper text when training is not completed
 * - Enabled: Allows model testing after training completion
 * 
 * @component
 */

import { Box, Button, Typography } from '@mui/material';
import React from 'react';

interface TestModelButtonProps {
  trainingCompleted: boolean;
  isTestingEnabled: boolean;
  onEnableTesting: () => void;
}

export const TestModelButton: React.FC<TestModelButtonProps> = ({
  trainingCompleted,
  isTestingEnabled,
  onEnableTesting
}) => (
  <Box sx={{ mt: 2, textAlign: 'center' }}>
    <Button
      variant="contained"
      onClick={onEnableTesting}
      disabled={!trainingCompleted}
      color="secondary"
      sx={{ mt: 2 }}
    >
      Test Model
    </Button>
    {!trainingCompleted && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Complete training to test the model
      </Typography>
    )}
  </Box>
);