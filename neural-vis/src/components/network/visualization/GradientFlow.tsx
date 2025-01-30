import { Box, Tooltip, useTheme } from '@mui/material';
import React from 'react';

interface GradientFlowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  gradient: number;
  weight: number;
  fromActivation: number;
  toActivation: number;
}

/**
 * GradientFlow Component
 * 
 * A React component that visualizes the flow of gradients through neural network connections
 * during the training process. Shows how weight updates propagate through the network.
 * 
 * Features:
 * - Real-time gradient visualization
 * - Color-coded gradient direction and magnitude
 * - Animated gradient flow effects
 * - Interactive tooltips with detailed information
 * 
 * Props:
 * @param {number} fromX - Starting X coordinate of the gradient flow
 * @param {number} fromY - Starting Y coordinate of the gradient flow
 * @param {number} toX - Ending X coordinate of the gradient flow
 * @param {number} toY - Ending Y coordinate of the gradient flow
 * @param {number} gradient - Current gradient value for the connection
 * @param {number} weight - Current weight value of the connection
 * @param {number} fromActivation - Activation value of the source neuron
 * @param {number} toActivation - Activation value of the target neuron
 * 
 * Visual Elements:
 * - Animated gradient paths
 * - Color-coded gradient magnitude
 * - Direction indicators
 * - Interactive tooltips
 * 
 * Implementation:
 * - SVG-based visualization
 * - Material-UI integration for tooltips
 * - Dynamic color scaling
 * - Smooth animations for flow effects
 * 
 * @component
 */

export const GradientFlow: React.FC<GradientFlowProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  gradient,
  weight,
  fromActivation,
  toActivation
}) => {
  const theme = useTheme();
  
  // Calculate gradient magnitude and direction
  const gradientMagnitude = Math.abs(gradient);
  const isPositive = gradient > 0;
  
  // Determine color based on gradient direction and magnitude
  const gradientColor = isPositive
    ? `rgba(76, 175, 80, ${Math.min(0.9, gradientMagnitude)})`  // Green for positive
    : `rgba(244, 67, 54, ${Math.min(0.9, gradientMagnitude)})`; // Red for negative

  // Create unique IDs for gradient and marker
  const gradientId = `grad-${fromX}-${fromY}-${toX}-${toY}`;
  const markerId = `arrow-${fromX}-${fromY}-${toX}-${toY}`;

  // Calculate animation speed based on gradient magnitude
  const animationDuration = Math.max(0.5, 2 - gradientMagnitude);

  return (
    <Tooltip 
      title={
        <Box>
          <div>Gradient: {gradient.toFixed(4)}</div>
          <div>Weight: {weight.toFixed(4)}</div>
          <div>From Activation: {fromActivation.toFixed(4)}</div>
          <div>To Activation: {toActivation.toFixed(4)}</div>
        </Box>
      }
      placement="top"
    >
      <g>
        <defs>
          {/* Define arrow marker */}
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth={6 + gradientMagnitude * 2}  // Size varies with gradient
            markerHeight={6 + gradientMagnitude * 2}
            orient="auto"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              fill={gradientColor}
            />
          </marker>
          {/* Define gradient */}
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={gradientColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={gradientColor} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d={`M ${fromX} ${fromY} C ${(fromX + toX)/2} ${fromY}, ${(fromX + toX)/2} ${toY}, ${toX} ${toY}`}
          stroke={`url(#${gradientId})`}
          fill="none"
          strokeWidth={1 + gradientMagnitude}  // Width varies with gradient
          strokeDasharray="4,4"
          markerEnd={`url(#${markerId})`}
        >
          <animate
            attributeName="strokeDashoffset"
            from="0"
            to="8"
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
          />
        </path>
        {/* Add pulse effect for strong gradients */}
        {gradientMagnitude > 0.5 && (
          <circle
            cx={(fromX + toX) / 2}
            cy={(fromY + toY) / 2}
            r={3 + gradientMagnitude * 2}
            fill="none"
            stroke={gradientColor}
            strokeWidth="1"
          >
            <animate
              attributeName="r"
              values={`${3 + gradientMagnitude * 2};${6 + gradientMagnitude * 3};${3 + gradientMagnitude * 2}`}
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0.2;0.6"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </g>
    </Tooltip>
  );
};