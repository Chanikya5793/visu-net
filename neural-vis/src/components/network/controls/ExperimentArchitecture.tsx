import { Box, Button, Paper, Slider, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ExperimentArchitectureProps {
  layers: number[];
  onArchitectureChange: (newLayers: number[]) => void;
  isTraining: boolean;
}

export const ExperimentArchitecture: React.FC<ExperimentArchitectureProps> = ({
  layers,
  onArchitectureChange,
  isTraining
}) => {
  const [editedLayers, setEditedLayers] = useState(layers);

  useEffect(() => {
    setEditedLayers(layers);
  }, [layers]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Experiment With Architecture
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Modify neurons in hidden layers to experiment with different network architectures. 
        Note: Changes will reset training progress and cannot be modified during training.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {layers.map((neurons, idx) => (
          <Box key={idx} sx={{ minWidth: 120 }}>
            <Typography variant="caption">
              {idx === 0 ? 'Input Layer (fixed)' : 
               idx === layers.length - 1 ? 'Output Layer (fixed)' : 
               `Hidden Layer ${idx}`}
            </Typography>
            <Slider
              value={editedLayers[idx]}
              onChange={(_, value) => {
                const newLayers = [...editedLayers];
                newLayers[idx] = value as number;
                setEditedLayers(newLayers);
              }}
              min={1}
              max={10}
              step={1}
              marks
              disabled={isTraining || idx === 0 || idx === layers.length - 1}
              valueLabelDisplay="auto"
            />
          </Box>
        ))}
        <Button 
          variant="contained" 
          onClick={() => onArchitectureChange(editedLayers)}
          disabled={isTraining}
          sx={{ mt: 2 }}
        >
          Apply & Reset Network
        </Button>
      </Box>
    </Paper>
  );
}; 