import { Tooltip } from '@mui/material';
import React from 'react';

interface GradientFlowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  gradient: number;
}

export const GradientFlow: React.FC<GradientFlowProps> = ({ fromX, fromY, toX, toY, gradient }) => {
  // Determine color based on gradient sign
  const gradientColor = gradient > 0 
    ? `rgba(76, 175, 80, ${Math.abs(gradient)})` // Green for positive
    : `rgba(244, 67, 54, ${Math.abs(gradient)})`; // Red for negative

  // Create unique IDs for gradient and marker
  const gradientId = `grad-${fromX}-${fromY}-${toX}-${toY}`;
  const markerId = `arrow-${fromX}-${fromY}-${toX}-${toY}`;

  return (
    <Tooltip title={`Gradient: ${gradient.toFixed(4)}`} placement="top">
      <g>
        <defs>
          {/* Define arrow marker */}
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
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
          strokeWidth={2}
          strokeDasharray="4,4"
          markerEnd={`url(#${markerId})`}
        >
          <animate
            attributeName="strokeDashoffset"
            from="0"
            to="8"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </Tooltip>
  );
}; 