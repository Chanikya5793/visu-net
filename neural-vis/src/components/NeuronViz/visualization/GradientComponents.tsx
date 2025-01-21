import React from 'react';
import { GradientFlowProps, GradientOverlayProps } from '../types';

export const GradientOverlay: React.FC<GradientOverlayProps> = ({ gradient }) => (
  <circle
    r={18}
    fill="none"
    stroke={`rgba(255, 0, 0, ${Math.abs(gradient)})`}
    strokeWidth={2}
    strokeDasharray="4,4"
  >
    <animate
      attributeName="r"
      values="18;20;18"
      dur="1.5s"
      repeatCount="indefinite"
    />
  </circle>
);

export const GradientFlow: React.FC<GradientFlowProps> = ({ 
  fromX, 
  fromY, 
  toX, 
  toY, 
  gradient 
}) => (
  <g>
    <defs>
      <linearGradient id={`grad-${fromX}-${fromY}-${toX}-${toY}`}>
        <stop offset="0%" stopColor={`rgba(255,0,0,${Math.abs(gradient)})`} />
        <stop offset="100%" stopColor={`rgba(0,0,255,${Math.abs(gradient)})`} />
      </linearGradient>
    </defs>
    <path
      d={`M ${fromX} ${fromY} C ${(fromX + toX)/2} ${fromY}, ${(fromX + toX)/2} ${toY}, ${toX} ${toY}`}
      stroke={`url(#grad-${fromX}-${fromY}-${toX}-${toY})`}
      fill="none"
      strokeWidth={2}
      strokeDasharray="4,4"
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
); 