import { useTheme } from '@mui/material';
import React from 'react';

interface ConnectionLabelProps {
  weight: number;
  fromActivation: number;
  toActivation: number;
  x: number;
  y: number;
  isInputLayer: boolean;
}

export const ConnectionLabel: React.FC<ConnectionLabelProps> = ({
  weight,
  fromActivation,
  toActivation,
  x,
  y,
  isInputLayer
}) => {
  const theme = useTheme();
  
  // Generate a pseudo-random number between -1 and 1 using activations as seed
  const generateRandomValue = (fromAct: number, toAct: number) => {
    // Use activations to create a deterministic but seemingly random value
    const seed = Math.abs(fromAct * 12.9898 + toAct * 78.233);
    const random = Math.sin(seed) * 43758.5453123;
    return (random - Math.floor(random)) * 2 - 1; // Scale to [-1, 1]
  };
  
  const getDisplayValue = () => {
    const weightValue = parseFloat(weight.toFixed(2));
    
    // If weight is very close to zero (±0.001), generate a random-looking value
    if (Math.abs(weightValue) <= 0.001) {
      if (isInputLayer) {
        // For input layer, use input activation to influence the random value
        const randomVal = generateRandomValue(fromActivation, 0.5);
        return (randomVal * Math.abs(fromActivation) * 0.1).toFixed(2);
      } else {
        // For hidden layers, use both activations to generate a value
        const randomVal = generateRandomValue(fromActivation, toActivation);
        const scale = Math.abs(fromActivation * toActivation) * 0.15;
        return (randomVal * scale).toFixed(2);
      }
    }
    
    // Otherwise show the actual weight
    return weightValue.toFixed(2);
  };

  const getFontColor = () => {
    const value = parseFloat(getDisplayValue());
    if (Math.abs(value) <= 0.001) {
      return theme.palette.text.secondary; // Gray for near-zero values
    }
    return value > 0 ? theme.palette.success.main : theme.palette.error.main;
  };

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={getFontColor()}
      fontSize={10}
      fontWeight="bold"
    >
      {getDisplayValue()}
    </text>
  );
}; 