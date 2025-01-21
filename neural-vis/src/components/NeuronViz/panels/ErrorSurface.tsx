import { Paper, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { ErrorSurfaceProps } from '../types';

export const ErrorSurface: React.FC<ErrorSurfaceProps> = ({ weights, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create error surface visualization
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const imageData = ctx.createImageData(width, height);

    // Map weights to 2D surface
    const flatWeights = weights.flat(2);
    const w1 = flatWeights[0] || 0;
    const w2 = flatWeights[1] || 0;

    // Create error surface
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = (x / width - 0.5) * 4;
        const dy = (y / height - 0.5) * 4;
        const distance = Math.sqrt((dx - w1) ** 2 + (dy - w2) ** 2);
        const errorValue = Math.exp(-distance) * error;
        
        const index = (y * width + x) * 4;
        const color = Math.floor((1 - errorValue) * 255);
        
        imageData.data[index] = color;
        imageData.data[index + 1] = color;
        imageData.data[index + 2] = color;
        imageData.data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [weights, error]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Error Surface</Typography>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{ border: '1px solid #ccc' }}
      />
    </Paper>
  );
}; 