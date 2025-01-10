import React from 'react';

interface AnimationLayerProps {
  width: number;
  height: number;
  animationState: {
    signal: number[];
    currentLayer: number;
  };
}

export const AnimationLayer: React.FC<AnimationLayerProps> = ({
  width,
  height,
  animationState
}) => {
  return (
    <g className="animation-layer">
      {animationState.currentLayer >= 0 && animationState.signal.map((value, index) => (
        <circle
          key={`animation-${index}`}
          cx={width / 2}
          cy={height / 2}
          r={10}
          fill={`rgba(0, 255, 0, ${Math.abs(value)})`}
        >
          <animate
            attributeName="r"
            values="10;15;10"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}; 