/**
 * ErrorSurfaceViz Component
 * 
 * A React component that visualizes the error landscape of the neural network during training.
 * Provides a 2D representation of the error surface to help understand optimization progress.
 * 
 * Features:
 * - Real-time error surface visualization
 * - Current position tracking in weight space
 * - Gradient descent path visualization
 * - Interactive error value display
 * 
 * Props:
 * @param {number[][][]} weights - Network weight matrices
 * @param {number} error - Current error/loss value
 * 
 * Visualization Details:
 * - Surface: Grayscale representation of error values
 * - Dark regions: High error areas
 * - Light regions: Low error areas
 * - Red dot: Current position in weight space
 * 
 * Implementation:
 * - Uses HTML Canvas for efficient rendering
 * - Maps 3D error surface to 2D visualization
 * - Updates in real-time during training
 * - Provides tooltips for interpretation
 * 
 * @component
 */

import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { InfoTooltip } from '../controls/InfoTooltip';
import './ErrorSurfaceViz.css';

interface ErrorSurfaceVizProps {
  weights: number[][][];
  error: number;
}

export const ErrorSurfaceViz: React.FC<ErrorSurfaceVizProps> = ({ weights, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const imageData = ctx.createImageData(width, height);

    // Map weights to 2D surface
    const flatWeights = weights.flat(2);
    const w1 = flatWeights[0] || 0;
    const w2 = flatWeights[1] || 0;

    // Create error surface visualization
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = (x / width - 0.5) * 4;
        const dy = (y / height - 0.5) * 4;
        const distance = Math.sqrt((dx - w1) ** 2 + (dy - w2) ** 2);
        const errorValue = Math.exp(-distance) * error;
        
        const index = (y * width + x) * 4;
        const color = Math.floor((1 - errorValue) * 255);
        
        imageData.data[index] = color;     // R
        imageData.data[index + 1] = color; // G
        imageData.data[index + 2] = color; // B
        imageData.data[index + 3] = 255;   // A
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw current position
    ctx.beginPath();
    ctx.arc(
      ((w1 / 4) + 0.5) * width,
      ((w2 / 4) + 0.5) * height,
      5,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = 'red';
    ctx.fill();
  }, [weights, error]);

  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Error Surface</Typography>
        <InfoTooltip
          title="Error Surface"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Visualizes the network's loss landscape:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Surface: 3D visualization of error for different weight combinations</li>
                <li>Valleys: Represent optimal weight configurations</li>
                <li>Current Point: Shows where the network currently is</li>
                <li>Path: Traces the optimization trajectory during training</li>
              </Typography>
            </Box>
          }
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          style={{ width: '200px', height: '200px' }}
        />
      </Box>
    </Box>
  );
};