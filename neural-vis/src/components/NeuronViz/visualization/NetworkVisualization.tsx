import { useTheme } from '@mui/material';
import React from 'react';
import { NeuronInfo } from '../types';
import { GradientFlow, GradientOverlay } from './GradientComponents';

interface NetworkVisualizationProps {
  layers: number[];
  activations?: number[][];
  weights?: number[][][];
  biases?: number[][];
  gradients?: number[][];
  width: number;
  height: number;
  selectedNeuron: NeuronInfo | null;
  highlightedConnections: Set<string>;
  showGradients: boolean;
  onNeuronClick: (layer: number, index: number) => void;
  onWeightClick?: (layerIndex: number, fromNeuron: number, toNeuron: number, currentWeight: number) => void;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  layers,
  activations,
  weights,
  biases,
  gradients,
  width = 1200,
  height = 500,
  selectedNeuron,
  highlightedConnections = new Set(),
  showGradients,
  onNeuronClick,
  onWeightClick
}) => {
  const theme = useTheme();
  const neuronRadius = 15;

  // Enhanced padding system
  const paddingLeft = 100;    // More space from left edge
  const paddingRight = 100;   // More space from right edge
  const paddingTop = 10;      // Minimal top space
  const paddingBottom = 70;   // More space for labels

  // Improved spacing calculations
  const usableWidth = width - (paddingLeft + paddingRight);
  const usableHeight = height - (paddingTop + paddingBottom - 0.9);
  const maxNeuronsInLayer = Math.max(...layers);
  const layerSpacing = usableWidth / (layers.length - 0.5);
  const verticalSpacing = usableHeight / (maxNeuronsInLayer + 0.1);

  // Enhanced position calculations
  const getNeuronPosition = (layerIndex: number, neuronIndex: number) => ({
    x: paddingLeft + layerIndex * layerSpacing,
    y: paddingTop + (neuronIndex + 1) * verticalSpacing
  });

  const getLayerLabelPosition = (layerIndex: number) => ({
    x: paddingLeft + layerIndex * layerSpacing,
    y: height - paddingBottom / 2
  });

  // Improved layer colors
  const getLayerColor = (layerIndex: number, totalLayers: number) => {
    const colors = {
      input: '#ff9800',    // Orange
      hidden1: '#2196f3',  // Blue
      hidden2: '#4caf50',  // Green
      hidden3: '#9c27b0',  // Purple
      output: '#f44336'    // Red
    };

    if (layerIndex === 0) return colors.input;
    if (layerIndex === totalLayers - 1) return colors.output;

    switch(layerIndex) {
      case 1: return colors.hidden1;
      case 2: return colors.hidden2;
      case 3: return colors.hidden3;
      default: return colors.hidden1;
    }
  };

  // Enhanced neuron color calculation
  const getNeuronColor = (layerIndex: number, neuronIndex: number) => {
    const baseColor = getLayerColor(layerIndex, layers.length);
    const activation = activations?.[layerIndex]?.[neuronIndex] || 0;
    
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    const minOpacity = 0.35;
    const maxOpacity = 0.9;
    const opacity = minOpacity + (maxOpacity - minOpacity) * Math.abs(activation);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Improved connection strength calculation
  const getConnectionStrength = (
    layerIndex: number,
    fromActivation: number,
    toActivation: number,
    weight: number
  ) => {
    const isInputLayer = layerIndex === 1;
    return isInputLayer ? 
      Math.abs(weight) : 
      Math.abs(weight * fromActivation);
  };

  // Layer-specific connection opacity
  const getConnectionOpacity = (
    layerIndex: number,
    connectionStrength: number
  ) => {
    // Keep all connections highly visible
    const isInputLayer = layerIndex === 1;
    const baseOpacity = isInputLayer ? 1 : 0.85;
    return baseOpacity + Math.min(connectionStrength, 0.15) * 0.15;
  };

  // Dynamic connection width - keeping it constant and minimal
  const getConnectionWidth = (
    layerIndex: number,
    weight: number
  ) => {
    return 1; // Constant minimal width for all connections
  };

  // Layer-specific activity thresholds
  const getActivityThreshold = (layerIndex: number) => {
    if (layerIndex === 0) return 0.1;  // Input layer
    if (layerIndex === layers.length - 1) return 0.3;  // Output layer
    return 0.2;  // Hidden layers
  };

  // Enhanced connection color calculation with stronger contrast and special input layer colors
  const getConnectionColor = (weight: number, fromActivation: number, isHighlighted: boolean, layerIndex: number) => {
    if (isHighlighted) return theme.palette.primary.main;
    
    // Special colors for input layer with enhanced visibility
    if (layerIndex === 1) {
      if (weight > 0) {
        return `rgba(255, 140, 0, 1)`; // Brighter orange for positive input connections
      } else {
        return `rgba(141, 110, 99, 1)`; // Brighter brown for negative input connections
      }
    }
    
    // Enhanced colors for other layers
    if (weight > 0) {
      return `rgba(76, 220, 76, 1)`; // Brighter green
    } else {
      return `rgba(255, 88, 88, 1)`; // Brighter red
    }
  };

  // Helper to get deterministic offset for label positioning
  const getLabelOffset = (layerIndex: number, fromIdx: number, toIdx: number, dx: number, dy: number) => {
    // Use connection indices to generate a stable angle
    const angleBase = ((fromIdx * 7 + toIdx * 13) % 12) / 12;  // Creates 12 different angles
    const angle = angleBase * Math.PI * 2;
    
    // Use layer index to vary the distance slightly
    const distanceBase = ((layerIndex * 11 + fromIdx * 5 + toIdx * 7) % 3);  // Creates 3 distance rings
    const distance = 15 + distanceBase * 8;  // Distances: 15, 23, or 31 pixels
    
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  };

  // Helper to get wiggle offset for connection curves
  const getWiggleOffset = (fromIdx: number, toIdx: number, t: number) => {
    const wiggleAmount = 5; // Adjust this to control wiggle intensity
    const frequency = 2; // Adjust this to control wiggle frequency
    const phase = (fromIdx * 7 + toIdx * 13) % (2 * Math.PI); // Unique phase for each connection
    return Math.sin(t * frequency + phase) * wiggleAmount;
  };

  // Enhanced connection rendering with curves and wiggle animation
  const renderConnections = () => (
    <g className="connections">
      {layers.map((neuronsCount, layerIndex) => {
        if (layerIndex === 0) return null;
        const prevLayerNeurons = layers[layerIndex - 1];

        return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
          Array.from({ length: neuronsCount }).map((_, toIdx) => {
            const weight = weights?.[layerIndex - 1]?.[fromIdx]?.[toIdx] || 0;
            const fromActivation = activations?.[layerIndex - 1]?.[fromIdx] || 0;
            const toActivation = activations?.[layerIndex]?.[toIdx] || 0;
            const connectionKey = `${layerIndex - 1}-${fromIdx}-${layerIndex}-${toIdx}`;
            const isHighlighted = highlightedConnections.has(connectionKey);
            const isActive = Math.abs(fromActivation) > 0.1 || Math.abs(toActivation) > 0.1;
            
            const fromPos = getNeuronPosition(layerIndex - 1, fromIdx);
            const toPos = getNeuronPosition(layerIndex, toIdx);
            
            const connectionStrength = getConnectionStrength(layerIndex, fromActivation, toActivation, weight);
            const opacity = getConnectionOpacity(layerIndex, connectionStrength);
            const strokeWidth = getConnectionWidth(layerIndex, weight);
            const connectionColor = getConnectionColor(weight, fromActivation, isHighlighted, layerIndex);
            
            // Enhanced curve control points with wiggle
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const isOverlapping = Math.abs(dy) < verticalSpacing / 2;
            const baseOffset = isOverlapping ? ((fromIdx * 7 + toIdx * 13) % 100 - 50) * (verticalSpacing / 400) : 0;
            
            // Calculate stable label position
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            const labelOffset = getLabelOffset(layerIndex, fromIdx, toIdx, dx, dy);
            
            return (
              <g 
                key={`weight-${layerIndex}-${fromIdx}-${toIdx}`}
                onClick={() => onWeightClick?.(layerIndex, fromIdx, toIdx, weight)}
                style={{ cursor: 'pointer' }}
              >
                <defs>
                  <linearGradient id={`grad-${layerIndex}-${fromIdx}-${toIdx}`} gradientUnits="userSpaceOnUse"
                    x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y}>
                    <stop offset="0%" stopColor={connectionColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={connectionColor} stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <path
                  d={`M ${fromPos.x} ${fromPos.y} 
                     C ${fromPos.x + dx * 0.4} ${fromPos.y + dy * 0.1 + baseOffset} 
                       ${fromPos.x + dx * 0.6} ${toPos.y - dy * 0.1 - baseOffset} 
                       ${toPos.x} ${toPos.y}`}
                  stroke={`url(#grad-${layerIndex}-${fromIdx}-${toIdx})`}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                  fill="none"
                >
                  {isActive && (
                    <>
                      <animate
                        attributeName="d"
                        dur="0.5s"
                        repeatCount="indefinite"
                        values={`
                          M ${fromPos.x} ${fromPos.y} 
                          C ${fromPos.x + dx * 0.4} ${fromPos.y + dy * 0.1 + baseOffset - 2} 
                            ${fromPos.x + dx * 0.6} ${toPos.y - dy * 0.1 - baseOffset + 2} 
                            ${toPos.x} ${toPos.y};
                          M ${fromPos.x} ${fromPos.y} 
                          C ${fromPos.x + dx * 0.4} ${fromPos.y + dy * 0.1 + baseOffset + 2} 
                            ${fromPos.x + dx * 0.6} ${toPos.y - dy * 0.1 - baseOffset - 2} 
                            ${toPos.x} ${toPos.y};
                          M ${fromPos.x} ${fromPos.y} 
                          C ${fromPos.x + dx * 0.4} ${fromPos.y + dy * 0.1 + baseOffset - 2} 
                            ${fromPos.x + dx * 0.6} ${toPos.y - dy * 0.1 - baseOffset + 2} 
                            ${toPos.x} ${toPos.y}
                        `}
                      />
                    </>
                  )}
                </path>
                <g>
                  <circle 
                    cx={midX + labelOffset.x} 
                    cy={midY + labelOffset.y} 
                    r={8} 
                    fill="white" 
                    opacity="1"
                    stroke={theme.palette.grey[300]}
                    strokeWidth={1}
                  />
                  <text
                    x={midX + labelOffset.x}
                    y={midY + labelOffset.y}
                    fontSize="10"
                    fill={theme.palette.text.primary}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                  >
                    {weight.toFixed(2)}
                  </text>
                </g>
              </g>
            );
          })
        );
      })}
    </g>
  );

  // Enhanced neuron rendering with improved labels
  const renderNeurons = () => (
    <g className="neurons">
      {layers.map((neuronsCount, layerIndex) => (
        <g key={`layer-${layerIndex}`}>
          {Array.from({ length: neuronsCount }).map((_, neuronIndex) => {
            const bias = biases?.[layerIndex]?.[neuronIndex] || 0;
            const gradient = gradients?.[layerIndex]?.[neuronIndex];
            const isSelected = selectedNeuron?.layer === layerIndex && selectedNeuron?.index === neuronIndex;
            const pos = getNeuronPosition(layerIndex, neuronIndex);
            
            return (
              <g 
                key={`neuron-${layerIndex}-${neuronIndex}`}
                onClick={() => onNeuronClick(layerIndex, neuronIndex)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={neuronRadius}
                  fill={getNeuronColor(layerIndex, neuronIndex)}
                  stroke={isSelected ? theme.palette.primary.main : theme.palette.grey[400]}
                  strokeWidth={isSelected ? 2 : 1}
                />
                {gradient !== undefined && showGradients && (
                  <GradientOverlay gradient={gradient} />
                )}
                {Math.abs(bias) > getActivityThreshold(layerIndex) && (
                  <text
                    x={pos.x}
                    y={pos.y + neuronRadius * 2}
                    fontSize="10"
                    textAnchor="middle"
                    fill={theme.palette.text.secondary}
                  >
                    {bias.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })}
          {/* Improved layer labels */}
          <text
            x={getLayerLabelPosition(layerIndex).x}
            y={getLayerLabelPosition(layerIndex).y}
            textAnchor="middle"
            fill={theme.palette.text.primary}
            fontSize={12}
            fontWeight="bold"
          >
            {`${layerIndex === 0 ? 'Input' : 
               layerIndex === layers.length - 1 ? 'Output' : 
               `Hidden ${layerIndex}`} Layer (${neuronsCount})`}
          </text>
        </g>
      ))}
    </g>
  );

  // Enhanced gradient flows with smoother animations
  const renderGradientFlows = () => {
    if (!weights || !activations || !showGradients) return null;

    return (
      <g className="gradient-flows">
        {layers.map((neuronsCount, layerIndex) => {
          if (layerIndex === 0) return null;
          const prevLayerNeurons = layers[layerIndex - 1];

          return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
            Array.from({ length: neuronsCount }).map((_, toIdx) => {
              const fromPos = getNeuronPosition(layerIndex - 1, fromIdx);
              const toPos = getNeuronPosition(layerIndex, toIdx);
              const fromActivation = activations[layerIndex - 1]?.[fromIdx] || 0;
              const toActivation = activations[layerIndex]?.[toIdx] || 0;
              const weight = weights[layerIndex - 1]?.[fromIdx]?.[toIdx] || 0;
              const gradient = fromActivation * toActivation * weight;

              return (
                <GradientFlow
                  key={`gradient-${layerIndex}-${fromIdx}-${toIdx}`}
                  fromX={fromPos.x}
                  fromY={fromPos.y}
                  toX={toPos.x}
                  toY={toPos.y}
                  gradient={gradient}
                />
              );
            })
          );
        })}
      </g>
    );
  };

  return (
    <svg width={width} height={height}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {renderConnections()}
      {renderNeurons()}
      {renderGradientFlows()}
    </svg>
  );
}; 