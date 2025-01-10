import React from 'react';

interface BackpropagationVizProps {
  layers: number[];
  currentLayer: number;
  signal: number[];
}

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