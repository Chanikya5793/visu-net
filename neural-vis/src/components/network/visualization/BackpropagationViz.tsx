import React from 'react';

interface BackpropagationVizProps {
  layers: number[];
  currentLayer: number;
  signal: number[];
}

/**
 * BackpropagationViz Component
 * 
 * A React component that visualizes the backpropagation process in a neural network,
 * showing how errors propagate backwards through the network during training.
 * 
 * Features:
 * - Real-time visualization of error propagation
 * - Layer-wise error signal display
 * - Animated signal flow visualization
 * - Color-coded error magnitude
 * 
 * Props:
 * @param {number[]} layers - Array defining the number of neurons in each layer
 * @param {number} currentLayer - Index of the current layer being updated
 * @param {number[]} signal - Array of error signals for the current layer
 * 
 * Visual Elements:
 * - Animated circles representing error signals
 * - Color intensity indicating error magnitude
 * - Pulsing animations for active signals
 * - Layer-wise propagation visualization
 * 
 * Implementation:
 * - SVG-based visualization
 * - Dynamic positioning based on network architecture
 * - Smooth animations using SVG animations
 * - Efficient rendering with React components
 * 
 * @component
 */

export const BackpropagationViz: React.FC<BackpropagationVizProps> = ({
  layers,
  currentLayer,
  signal
}) => {
  const width = 800;
  const height = 400;
  const neuronRadius = 15;
  const layerSpacing = width / (layers.length + 1);
  const maxNeuronsInLayer = Math.max(...layers);
  const verticalSpacing = height / (maxNeuronsInLayer + 1);

  return (
    <g className="backpropagation">
      {currentLayer >= 0 && signal.map((value, index) => {
        const x = (currentLayer + 1) * layerSpacing;
        const y = (index + 1) * verticalSpacing;

        return (
          <g key={`backprop-${currentLayer}-${index}`}>
            <circle
              cx={x}
              cy={y}
              r={neuronRadius + 5}
              fill="none"
              stroke={`rgba(255, 0, 0, ${Math.abs(value)})`}
              strokeWidth={2}
              strokeDasharray="4,4"
            >
              <animate
                attributeName="r"
                values={`${neuronRadius + 5};${neuronRadius + 8};${neuronRadius + 5}`}
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
    </g>
  );
};