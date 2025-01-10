import InfoIcon from '@mui/icons-material/Info';
import {
    Box,
    Button, Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import React, { useState } from 'react';

interface NeuronColorLegendProps {
  dataset: string;
  layers: number[];
}

export const NeuronColorLegend: React.FC<NeuronColorLegendProps> = ({ 
  dataset, 
  layers 
}) => {
  const [open, setOpen] = useState(false);

  const getLayerColor = (layerIndex: number, totalLayers: number) => {
    const colors = {
      input: '#ff9800',
      hidden1: '#2196f3',
      hidden2: '#4caf50',
      hidden3: '#9c27b0',
      output: '#f44336'
    };

    if (layerIndex === 0) return colors.input;
    if (layerIndex === totalLayers - 1) return colors.output;

    switch(layerIndex) {
      case 1: return colors.hidden1;
      case 2: return colors.hidden2;
      case 3: return colors.hidden3;
      default: return colors.hidden1;
    }
  };

  const getActivationLabel = (value: number) => {
    switch(dataset) {
      case 'logicGates':
        return value === 1 ? 'True/1' : value === 0 ? 'False/0' : `${value.toFixed(1)}`;
      case 'weatherPrediction':
        return `${(value * 100).toFixed(0)}% Rain Probability`;
      case 'fitnessClassification':
        if (value >= 0.66) return 'Fit';
        if (value >= 0.33) return 'Average';
        return 'Unfit';
      default:
        return `${value.toFixed(1)}`;
    }
  };

  const steps = Array.from({ length: 11 }, (_, i) => i / 10);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<InfoIcon />}
      >
        Neuron Color Guide
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Neuron Color Guide</DialogTitle>
        <DialogContent>
          {layers.map((_, layerIndex) => {
            const baseColor = getLayerColor(layerIndex, layers.length);
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            return (
              <Box key={layerIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {layerIndex === 0 ? 'Input Layer' : 
                   layerIndex === layers.length - 1 ? 'Output Layer' : 
                   `Hidden Layer ${layerIndex}`}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {steps.map(value => (
                    <Box 
                      key={value} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        minWidth: '150px'
                      }}
                    >
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        background: `rgba(${r}, ${g}, ${b}, ${0.3 + value * 0.7})`
                      }} />
                      <Typography variant="caption">
                        {getActivationLabel(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 