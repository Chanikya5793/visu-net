import { Tooltip } from '@mui/material';
import React from 'react';

interface GradientOverlayProps {
  gradient: number;
  radius?: number;
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({ gradient, radius = 18 }) => {
  // Determine color based on gradient sign
  const gradientColor = gradient > 0 
    ? `rgba(76, 175, 80, ${Math.abs(gradient)})` // Green for positive
    : `rgba(244, 67, 54, ${Math.abs(gradient)})`; // Red for negative

  return (
    <Tooltip 
      title={`Gradient Strength: ${gradient.toFixed(4)} (${gradient > 0 ? 'Positive' : 'Negative'})`}
      placement="top"
    >
      <g>
        {/* Outer pulsing circle */}
        <circle
          r={radius}
          fill="none"
          stroke={gradientColor}
          strokeWidth={2}
          strokeDasharray="4,4"
        >
          <animate
            attributeName="r"
            values={`${radius};${radius + 2};${radius}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="0.8;0.4;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Inner direction indicator */}
        <path
          d={gradient > 0 
            ? `M -5 0 L 5 0 M 2 -3 L 5 0 L 2 3` // Arrow pointing right for positive
            : `M 5 0 L -5 0 M -2 -3 L -5 0 L -2 3` // Arrow pointing left for negative
          }
          stroke={gradientColor}
          strokeWidth={1.5}
          fill="none"
        />
      </g>
    </Tooltip>
  );
}; 