// src/components/TestModelButton.tsx
import React from 'react';
import { Box, Button, Typography } from '@mui/material';

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