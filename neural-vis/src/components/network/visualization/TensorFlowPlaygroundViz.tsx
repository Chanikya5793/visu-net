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

// Drawing utility functions
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

// Drawing utility functions
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
  ctx.lineWidth = Math.abs(weight) * 4;
  ctx.stroke();
};

const drawNeuronHighlight = (
  ctx: CanvasRenderingContext2D,
  neuron: { layer: number; index: number },
  weights: number[][][] | undefined,
  CANVAS_PADDING: number,
  LAYER_SPACING: number,
  VERTICAL_SPACING: number,
  NEURON_RADIUS: number
) => {
  const x = CANVAS_PADDING + neuron.layer * LAYER_SPACING;
  const y = CANVAS_PADDING + neuron.index * VERTICAL_SPACING;

  // Draw highlight effect
  ctx.beginPath();
  ctx.arc(x, y, NEURON_RADIUS * 1.8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
  ctx.fill();

  // Draw connections to/from highlighted neuron
  if (weights) {
    if (neuron.layer > 0) {
      // Draw incoming connections
      const incomingWeights = weights[neuron.layer - 1]?.[neuron.index] || [];
      incomingWeights.forEach((weight, fromIndex) => {
        const fromX = CANVAS_PADDING + (neuron.layer - 1) * LAYER_SPACING;
        const fromY = CANVAS_PADDING + fromIndex * VERTICAL_SPACING;
        drawHighlightedConnection(ctx, fromX, fromY, x, y, weight);
      });
    }

    if (neuron.layer < weights.length) {
      // Draw outgoing connections
      const outgoingWeights = weights[neuron.layer]?.map(n => n[neuron.index]) || [];
      outgoingWeights.forEach((weight, toIndex) => {
        const toX = CANVAS_PADDING + (neuron.layer + 1) * LAYER_SPACING;
        const toY = CANVAS_PADDING + toIndex * VERTICAL_SPACING;
        drawHighlightedConnection(ctx, x, y, toX, toY, weight);
      });
    }
  }
};

export const TensorFlowPlaygroundViz: React.FC<TensorFlowPlaygroundVizProps> = ({
  layers,
  activations,
  weights,
  biases,
  gradients,
  showGradients = false,
}): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNeuron, setHoveredNeuron] = useState<{ layer: number; index: number } | null>(null);
  const [animations, setAnimations] = useState<ConnectionAnimation[]>([]);
  const animationFrameRef = useRef<number>();

  // Constants for visualization
  const NEURON_RADIUS = 12;
  const LAYER_SPACING = 150;
  const VERTICAL_SPACING = 80;  // Increased from 40 to 80
  const CANVAS_PADDING = 50;
  const CONNECTION_ANIMATION_SPEED = 0.02;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size based on network architecture
    const maxNeuronsInLayer = Math.max(...layers);
    canvas.width = LAYER_SPACING * (layers.length + 1) + 2 * CANVAS_PADDING;
    canvas.height = VERTICAL_SPACING * maxNeuronsInLayer + 2 * CANVAS_PADDING - 0.9;  // Adjusted height calculation

    // Set up mouse event handlers
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const scaledX = x * (canvas.width / rect.width);
      const scaledY = y * (canvas.height / rect.height);

      // Check if mouse is over any neuron
      let found = false;
      layers.forEach((neuronsCount, layerIndex) => {
        for (let i = 0; i < neuronsCount; i++) {
          const neuronX = CANVAS_PADDING + layerIndex * LAYER_SPACING;
          const neuronY = CANVAS_PADDING + i * VERTICAL_SPACING;
          const distance = Math.sqrt(
            Math.pow(scaledX - neuronX, 2) + Math.pow(scaledY - neuronY, 2)
          );

          if (distance <= NEURON_RADIUS) {
            setHoveredNeuron({ layer: layerIndex, index: i });
            found = true;
            return;
          }
        }
      });

      if (!found) setHoveredNeuron(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [layers, weights, activations, hoveredNeuron]);

  return (
    <Box sx={{ mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          TensorFlow Playground Style Visualization
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          overflow: 'auto',
          maxWidth: '100%'
        }}>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};