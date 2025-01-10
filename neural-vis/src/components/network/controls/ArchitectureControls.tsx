import { Box, Button, Slider, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ArchitectureControlsProps {
  layers: number[];
  onArchitectureChange: (newLayers: number[]) => void;
  isTraining: boolean;
}

export const ArchitectureControls: React.FC<ArchitectureControlsProps> = ({
  layers,
  onArchitectureChange,
  isTraining
}) => {
  const [editedLayers, setEditedLayers] = useState(layers);

  useEffect(() => {
    setEditedLayers(layers);
  }, [layers]);

  const handleLayerChange = (index: number, value: number) => {
    const newLayers = [...editedLayers];
    newLayers[index] = value;
    setEditedLayers(newLayers);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Layer Architecture</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Modify neurons in hidden layers. Changes will reset training. Cannot be modified during training.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {layers.map((neurons, idx) => (
          <Box key={idx} sx={{ minWidth: 120 }}>
            <Typography variant="caption">
              {idx === 0 ? 'Input Layer' : 
               idx === layers.length - 1 ? 'Output Layer' : 
               `Hidden Layer ${idx}`}
            </Typography>
            <Slider
              value={editedLayers[idx]}
              onChange={(_, value) => handleLayerChange(idx, value as number)}
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
        >
          Apply Changes
        </Button>
      </Box>
    </Box>
  );
}; 