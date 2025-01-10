import { Box, Button, Paper, Slider, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface ArchitectureEditorProps {
  layers: number[];
  onChange: (newLayers: number[]) => void;
  isTraining: boolean;
}

export const ArchitectureEditor: React.FC<ArchitectureEditorProps> = ({
  layers,
  onChange,
  isTraining
}) => {
  const [editedLayers, setEditedLayers] = useState(layers);

  useEffect(() => {
    setEditedLayers(layers);
  }, [layers]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Network Architecture</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Modify the number of neurons in each hidden layer. Changes will reset the network training.
        Cannot be modified during training.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {editedLayers.map((neurons, idx) => (
          <Box key={idx} sx={{ minWidth: 120 }}>
            <Typography variant="caption">
              {idx === 0 ? 'Input Layer' : 
               idx === layers.length - 1 ? 'Output Layer' : 
               `Hidden Layer ${idx}`}
            </Typography>
            <Slider
              value={neurons}
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
          onClick={() => onChange(editedLayers)}
          disabled={isTraining}
          sx={{ mt: 2 }}
        >
          Apply Changes
        </Button>
      </Box>
    </Paper>
  );
}; 