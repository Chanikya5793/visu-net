import { Box, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import { NeuronInfo } from '../../types/neuron-viz.types';
import { GradientFlow } from './visualization/GradientFlow';
import { GradientOverlay } from './visualization/GradientOverlay';

interface NetworkVisualizationProps {
  layers: number[];
  activations?: number[][];
  weights?: number[][][];
  biases?: number[][];
  showBackprop: boolean;
  showGradients: boolean;
  selectedNeuron: NeuronInfo | null;
  setSelectedNeuron: React.Dispatch<React.SetStateAction<NeuronInfo | null>>;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  layers,
  activations,
  weights,
  biases,
  showBackprop,
  showGradients,
  selectedNeuron,
  setSelectedNeuron,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);

  // Visual constants
  const width = 800;
  const height = 400;
  const neuronRadius = 15;
  const layerSpacing = width / (layers.length + 1);
  const maxNeuronsInLayer = Math.max(...layers);
  const verticalSpacing = height / (maxNeuronsInLayer + 1);

  const renderConnections = () => {
    return layers.map((neuronsCount, layerIndex) => {
      if (layerIndex === 0) return null;
      const prevLayerNeurons = layers[layerIndex - 1];

      return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
        Array.from({ length: neuronsCount }).map((_, toIdx) => {
          const weight = weights?.[layerIndex - 1]?.[toIdx]?.[fromIdx] || 0;
          return (
            <path
              key={`connection-${layerIndex}-${fromIdx}-${toIdx}`}
              d={`M ${layerIndex * layerSpacing} ${(fromIdx + 1) * verticalSpacing} 
                 L ${(layerIndex + 1) * layerSpacing} ${(toIdx + 1) * verticalSpacing}`}
              stroke={theme.palette.grey[300]}
              strokeWidth={Math.abs(weight) * 2 || 1}
              opacity={0.6}
            />
          );
        })
      );
    });
  };

  const renderNeurons = () => {
    return layers.map((neuronsCount, layerIndex) => (
      <g key={`layer-${layerIndex}`}>
        {Array.from({ length: neuronsCount }).map((_, neuronIndex) => {
          const activation = activations?.[layerIndex]?.[neuronIndex] || 0;
          const bias = biases?.[layerIndex]?.[neuronIndex] || 0;
          const gradient = activation * bias;

          return (
            <g key={`neuron-${layerIndex}-${neuronIndex}`}>
              <circle
                cx={(layerIndex + 1) * layerSpacing}
                cy={(neuronIndex + 1) * verticalSpacing}
                r={neuronRadius}
                fill={`rgba(100, 149, 237, ${0.3 + activation * 0.7})`}
                stroke={theme.palette.grey[300]}
                onClick={() => setSelectedNeuron({ layer: layerIndex, index: neuronIndex, value: activation })}
                style={{ cursor: 'pointer' }}
              />
              {showGradients && (
                <GradientOverlay 
                  gradient={gradient}
                  radius={neuronRadius + 2}
                />
              )}
            </g>
          );
        })}
      </g>
    ));
  };

  const renderGradientFlows = () => {
    if (!weights || !activations) return null;

    return layers.map((neuronsCount, layerIndex) => {
      if (layerIndex === 0) return null;
      const prevLayerNeurons = layers[layerIndex - 1];

      return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
        Array.from({ length: neuronsCount }).map((_, toIdx) => {
          const fromActivation = activations[layerIndex - 1]?.[fromIdx] || 0;
          const toActivation = activations[layerIndex]?.[toIdx] || 0;
          const weight = weights[layerIndex - 1]?.[toIdx]?.[fromIdx] || 0;
          const gradient = fromActivation * toActivation * weight;

          return (
            <GradientFlow
              key={`gradient-${layerIndex}-${fromIdx}-${toIdx}`}
              fromX={layerIndex * layerSpacing}
              fromY={(fromIdx + 1) * verticalSpacing}
              toX={(layerIndex + 1) * layerSpacing}
              toY={(toIdx + 1) * verticalSpacing}
              gradient={gradient}
            />
          );
        })
      );
    });
  };

  return (
    <Box sx={{ flex: 2 }}>
      <svg ref={svgRef} width={width} height={height}>
        {renderConnections()}
        {renderNeurons()}
        {showGradients && renderGradientFlows()}
      </svg>
    </Box>
  );
};