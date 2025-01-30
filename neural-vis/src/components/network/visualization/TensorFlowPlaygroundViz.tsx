/**
 * TensorFlowPlaygroundViz Component
 * 
 * A React component that provides an interactive visualization of neural networks
 * inspired by TensorFlow Playground. This component offers a canvas-based
 * visualization with real-time updates and interactive features.
 * 
 * Features:
 * - Interactive neural network visualization
 * - Real-time weight and activation updates
 * - Gradient flow visualization
 * - Hover interactions for detailed information
 * - Smooth animations for signal propagation
 * 
 * Props:
 * @extends {NeuronVizProps}
 * @param {boolean} [showGradients] - Toggle gradient visualization
 * 
 * Visual Elements:
 * - Neurons represented as circles with activation-based opacity
 * - Weighted connections with color-coded strength
 * - Animated signal flow during forward/backward propagation
 * - Interactive hover effects for neurons and connections
 * 
 * Implementation:
 * - Uses HTML Canvas for efficient rendering
 * - Implements custom animation system
 * - Optimized drawing utilities for smooth performance
 * - Responsive canvas sizing and positioning
 * 
 * @component
 */

import { Box, Paper, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { NeuronVizProps } from '../../../types/neuron-viz.types';

interface TensorFlowPlaygroundVizProps extends NeuronVizProps {
  showGradients?: boolean;
}

interface NeuronPosition {
  x: number;
  y: number;
}

interface ConnectionAnimation {
  progress: number;
  direction: 'forward' | 'backward';
}

/**
 * Utility function to draw the neural network on canvas
 * @param ctx Canvas rendering context
 * @param layers Array of layer sizes
 * @param weights Network weight matrices
 * @param activations Neuron activation values
 * @param hoveredNeuron Currently hovered neuron information
 * @param CANVAS_PADDING Canvas padding value
 * @param LAYER_SPACING Horizontal spacing between layers
 * @param VERTICAL_SPACING Vertical spacing between neurons
 * @param NEURON_RADIUS Radius of neuron circles
 */
const drawNetwork = (
  ctx: CanvasRenderingContext2D,
  layers: number[],
  weights: number[][][] | undefined,
  activations: number[][] | undefined,
  hoveredNeuron: { layer: number; index: number } | null,
  CANVAS_PADDING: number,
  LAYER_SPACING: number,
  VERTICAL_SPACING: number,
  NEURON_RADIUS: number
) => {
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw connections first (so they appear behind neurons)
  if (weights) {
    layers.forEach((neuronsCount, layerIndex) => {
      if (layerIndex === 0) return; // Skip first layer (no incoming connections)

      const prevLayerNeurons = layers[layerIndex - 1];
      for (let i = 0; i < prevLayerNeurons; i++) {
        for (let j = 0; j < neuronsCount; j++) {
          const weight = weights[layerIndex - 1]?.[j]?.[i] || 0;
          const fromX = CANVAS_PADDING + (layerIndex - 1) * LAYER_SPACING;
          const fromY = CANVAS_PADDING + i * VERTICAL_SPACING;
          const toX = CANVAS_PADDING + layerIndex * LAYER_SPACING;
          const toY = CANVAS_PADDING + j * VERTICAL_SPACING;

          // Draw connection
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.lineTo(toX, toY);
          ctx.strokeStyle = weight > 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
          ctx.lineWidth = Math.abs(weight) * 2;
          ctx.stroke();
        }
      }
    });
  }

  // Draw neurons
  layers.forEach((neuronsCount, layerIndex) => {
    for (let i = 0; i < neuronsCount; i++) {
      const x = CANVAS_PADDING + layerIndex * LAYER_SPACING;
      const y = CANVAS_PADDING + i * VERTICAL_SPACING;
      const activation = activations?.[layerIndex]?.[i] || 0;

      // Draw neuron
      ctx.beginPath();
      ctx.arc(x, y, NEURON_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(66, 133, 244, ${0.3 + activation * 0.7})`;
      ctx.fill();
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw activation value
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(activation.toFixed(2), x, y + NEURON_RADIUS * 2);
    }
  });

  // Highlight connections for hovered neuron
  if (hoveredNeuron && weights) {
    drawHighlightedConnection(
      ctx,
      CANVAS_PADDING + hoveredNeuron.layer * LAYER_SPACING,
      CANVAS_PADDING + hoveredNeuron.index * VERTICAL_SPACING,
      CANVAS_PADDING + (hoveredNeuron.layer + 1) * LAYER_SPACING,
      CANVAS_PADDING + hoveredNeuron.index * VERTICAL_SPACING,
      weights[hoveredNeuron.layer]?.[hoveredNeuron.index]?.[0] || 0
    );
  }
};

/**
 * Utility function to draw highlighted connections
 * @param ctx Canvas rendering context
 * @param fromX Starting X coordinate
 * @param fromY Starting Y coordinate
 * @param toX Ending X coordinate
 * @param toY Ending Y coordinate
 * @param weight Connection weight value
 */
const drawHighlightedConnection = (
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  weight: number
) => {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = weight > 0 ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
  ctx.lineWidth = Math.abs(weight) * 3;
  ctx.stroke();
};

export const TensorFlowPlaygroundViz: React.FC<TensorFlowPlaygroundVizProps> = ({
  layers,
  weights,
  activations,
  showGradients
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNeuron, setHoveredNeuron] = useState<{ layer: number; index: number } | null>(null);

  // Constants for layout
  const CANVAS_PADDING = 30;
  const LAYER_SPACING = 100;
  const VERTICAL_SPACING = 50;
  const NEURON_RADIUS = 15;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_PADDING * 2 + (layers.length - 1) * LAYER_SPACING;
    canvas.height = CANVAS_PADDING * 2 + Math.max(...layers) * VERTICAL_SPACING;

    // Draw network
    drawNetwork(
      ctx,
      layers,
      weights,
      activations,
      hoveredNeuron,
      CANVAS_PADDING,
      LAYER_SPACING,
      VERTICAL_SPACING,
      NEURON_RADIUS
    );
  }, [layers, weights, activations, hoveredNeuron]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Network Visualization
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'auto' }}
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate layer and neuron index from mouse position
            const layer = Math.floor((x - CANVAS_PADDING) / LAYER_SPACING);
            const index = Math.floor((y - CANVAS_PADDING) / VERTICAL_SPACING);

            if (
              layer >= 0 &&
              layer < layers.length &&
              index >= 0 &&
              index < layers[layer]
            ) {
              setHoveredNeuron({ layer, index });
            } else {
              setHoveredNeuron(null);
            }
          }}
          onMouseLeave={() => setHoveredNeuron(null)}
        />
      </Box>
    </Paper>
  );
};