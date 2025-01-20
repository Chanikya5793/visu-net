/**
 * NetworkVisualization Component
 * 
 * Core visualization component for neural network architecture and dynamics.
 * Focuses on rendering the network structure, connections, and layer statistics.
 * 
 * Note: Performance Metrics and Error Surface components are handled by the parent NeuronViz component
 * to avoid duplication and maintain a single source of truth for these visualizations.
 * 
 * Components included:
 * 1. Network Graph - Interactive visualization of neurons and connections
 * 2. NetworkStats - Statistics about weights, biases, and learning rate
 * 3. ActivationPatterns - Visualization of neuron activations per layer
 * 4. WeightDistribution - Distribution chart of network weights
 * 
 * Note: Performance Metrics and Error Surface components are commented out
 * as they are handled by the parent NeuronViz component.
 */

import React, { useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { NeuronInfo, NeuronVizProps } from '../../../types/neuron-viz.types';
import { GradientFlow } from './GradientFlow';
import { GradientOverlay } from './GradientOverlay';
import { ActivationPatterns } from './ActivationPatterns';
import { WeightDistribution } from './WeightDistribution';
import { InfoTooltip } from '../controls/InfoTooltip';
import { NetworkStats } from '../metrics/NetworkStats';

interface NetworkVisualizationProps extends NeuronVizProps {
  showBackprop: boolean;
  showGradients: boolean;
  selectedNeuron: NeuronInfo | null;
  setSelectedNeuron: React.Dispatch<React.SetStateAction<NeuronInfo | null>>;
  weights?: number[][][];
  activations?: number[][];
  biases?: number[][];
  gradients?: number[][];
  learningRate?: number;
  performanceMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  layers,
  activations,
  weights,
  biases,
  showBackprop,
  showGradients,
  selectedNeuron,
  setSelectedNeuron,
  gradients,
  learningRate,
  performanceMetrics
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);

  // =============================================
  // Visual Constants - Adjust these to change network layout
  // =============================================
  
  // Overall SVG dimensions
  const width = 1200;   // Total width of the visualization
  const height = 500;   // Total height of the visualization
  
  // Neuron appearance
  const neuronRadius = 15;  // Size of each neuron circle
  
  // =============================================
  // Padding Configuration - Adjust these to control exact spacing from edges
  // =============================================
  
  // Individual padding for each side (in pixels)
  const paddingLeft = 100;    // Space from left edge
  const paddingRight = 100;   // Space from right edge
  const paddingTop = 10;      // Space from top edge
  const paddingBottom = 70;  // Space from bottom edge (more space for labels)
  
  // =============================================
  // Spacing Calculations - Derived from padding values
  // =============================================
  
  // Horizontal spacing
  const usableWidth = width - (paddingLeft + paddingRight);  // Width available for layers
  const layerSpacing = usableWidth / (layers.length - 0.5);    // Distance between layers
  
  // Vertical spacing
  const usableHeight = height - (paddingTop + paddingBottom-0.9);  // Height available for neurons
  const maxNeuronsInLayer = Math.max(...layers);
  
  // Calculate space between neurons
  // Formula explanation:
  // - usableHeight: total vertical space available
  // - maxNeuronsInLayer: maximum number of neurons in any layer
  // - The +2 in denominator adds extra spacing between neurons
  // - Increase +2 for more spacing, decrease for less spacing
  const verticalSpacing = usableHeight / (maxNeuronsInLayer + 0.1);  // Space between neurons
  
  // =============================================
  // Position Calculation Helper - Uses the new padding system
  // =============================================
  
  const getNeuronPosition = (layerIndex: number, neuronIndex: number) => {
    return {
      x: paddingLeft + layerIndex * layerSpacing,
      y: paddingTop + (neuronIndex + 1) * verticalSpacing
    };
  };

  // Helper for layer labels position
  const getLayerLabelPosition = (layerIndex: number) => {
    return {
      x: paddingLeft + layerIndex * layerSpacing,
      y: height - paddingBottom / 2  // Position labels in bottom padding area
    };
  };

  // =============================================
  // Layer-specific Colors - Edit these to change the color scheme
  // =============================================
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

  // =============================================
  // Rendering Functions
  // =============================================
  
  const getNeuronColor = (layerIndex: number, neuronIndex: number) => {
    const baseColor = getLayerColor(layerIndex, layers.length);
    const activation = activations?.[layerIndex]?.[neuronIndex] || 0;
    
    // Convert hex to rgb for opacity
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Set minimum opacity to 0.35 and max to 0.9 for better visibility
    const minOpacity = 0.35;
    const maxOpacity = 0.9;
    const opacity = minOpacity + (maxOpacity - minOpacity) * Math.abs(activation);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

          // Get positions using the helper function
          const fromPos = getNeuronPosition(layerIndex - 1, fromIdx);
          const toPos = getNeuronPosition(layerIndex, toIdx);

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
    });
  };

  const getConnectionStrength = (
    layerIndex: number,
    fromActivation: number,
    toActivation: number,
    weight: number
  ) => {
    const isInputLayer = layerIndex === 1;
    return isInputLayer ? 
      Math.abs(weight * fromActivation) : 
      Math.abs(weight * fromActivation);
  };

  const getConnectionOpacity = (
    layerIndex: number, 
    connectionStrength: number
  ) => {
    const isInputLayer = layerIndex === 1;
    const baseOpacity = isInputLayer ? 0.8 : 0.5;
    return Math.min(baseOpacity + connectionStrength * 0.3, 1);
  };

  const getConnectionWidth = (
    layerIndex: number,
    weight: number
  ) => {
    const isInputLayer = layerIndex === 1;
    const baseWidth = isInputLayer ? 1.5 : 1;
    const weightScale = isInputLayer ? 4 : 3;
    return Math.max(baseWidth, Math.abs(weight) * weightScale);
  };

  const getActivityThreshold = (layerIndex: number) => {
    return layerIndex === 1 ? 0.1 : 0.3;
  };

  // Add interface for connection positions
  interface ConnectionPosition {
    fromPos: { x: number; y: number };
    toPos: { x: number; y: number };
  }

  // Update the renderConnections function
  const renderConnections = () => (
    <g className="connections">
      {layers.map((neuronsCount, layerIndex) => {
        if (layerIndex === 0) return null;
        const prevLayerNeurons = layers[layerIndex - 1];

        return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
          Array.from({ length: neuronsCount }).map((_, toIdx) => {
            // Critical fix: Proper weight indexing for input layer
            const weight = layerIndex === 1 
              ? weights?.[0]?.[fromIdx]?.[toIdx] ?? 0  // Input layer weights
              : weights?.[layerIndex - 1]?.[toIdx]?.[fromIdx] ?? 0; // Other layers
            
            const fromActivation = activations?.[layerIndex - 1]?.[fromIdx] ?? 0;
            const toActivation = activations?.[layerIndex]?.[toIdx] ?? 0;
            
            // Get neuron positions
            const fromPos = getNeuronPosition(layerIndex - 1, fromIdx);
            const toPos = getNeuronPosition(layerIndex, toIdx);

            // Calculate visual properties
            const isInputLayer = layerIndex === 1;
            const connectionStrength = getConnectionStrength(layerIndex, fromActivation, toActivation, weight);
            const connectionOpacity = getConnectionOpacity(layerIndex, connectionStrength);
            const strokeWidth = getConnectionWidth(layerIndex, weight);

            return (
              <g key={`connection-${layerIndex}-${fromIdx}-${toIdx}`}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  strokeWidth={strokeWidth}
                  opacity={connectionOpacity}
                  stroke={theme.palette.grey[800]}
                />
                {Math.abs(weight) > 0.05 && (
                  <text
                    x={(fromPos.x + toPos.x) / 2}
                    y={(fromPos.y + toPos.y) / 2}
                    textAnchor="middle"
                    fontSize={10}
                    fill={theme.palette.text.primary}
                  >
                    {weight.toFixed(2)}
                  </text>
                )}
              </g>
            );
          })
        );
      })}
    </g>
  );

  const renderLayerStats = () => (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>Layer Statistics</Typography>
        <InfoTooltip 
          title="Layer Statistics"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Shows statistical information for each layer in the network:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Mean Activation: Average activation value of neurons in the layer</li>
                <li>Std Dev: How spread out the activations are</li>
                <li>Neurons: Number of neurons in the layer</li>
                <li>Connections: Number of connections to the next layer</li>
              </Typography>
            </Box>
          }
        />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        {layers.map((neurons, idx) => {
          // Calculate activation statistics for the layer
          const layerActivations = activations?.[idx] || [];
          const meanActivation = layerActivations.length > 0
            ? layerActivations.reduce((sum, val) => sum + val, 0) / layerActivations.length
            : NaN;
          const stdDev = layerActivations.length > 0
            ? Math.sqrt(
                layerActivations.reduce((sum, val) => sum + Math.pow(val - meanActivation, 2), 0) / 
                layerActivations.length
              )
            : NaN;

          return (
            <Paper key={idx} sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {idx === 0 ? 'Input Layer' : 
                 idx === layers.length - 1 ? 'Output Layer' : 
                 `Hidden Layer ${idx}`} Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  Mean Activation: {isNaN(meanActivation) ? 'NaN' : meanActivation.toFixed(4)}
                </Typography>
                <Typography variant="body2">
                  Std Dev: {isNaN(stdDev) ? 'NaN' : stdDev.toFixed(4)}
                </Typography>
                <Typography variant="body2">
                  Activation: sigmoid
                </Typography>
                <Typography variant="body2">
                  Neurons: {neurons}
                </Typography>
                {idx > 0 && weights && (
                  <Typography variant="body2">
                    Connections: {layers[idx - 1] * neurons}
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );

  const renderNeurons = () => {
    return layers.map((neuronsCount, layerIndex) => (
      <g key={`layer-${layerIndex}`}>
        {/* Render neurons for this layer */}
        {Array.from({ length: neuronsCount }).map((_, neuronIndex) => {
          const activation = activations?.[layerIndex]?.[neuronIndex] || 0;
          const bias = biases?.[layerIndex]?.[neuronIndex] || 0;
          const gradient = activation * bias;
          const neuronColor = getNeuronColor(layerIndex, neuronIndex);
          const pos = getNeuronPosition(layerIndex, neuronIndex);

          return (
            <g 
              key={`neuron-${layerIndex}-${neuronIndex}`}
              transform={`translate(${pos.x}, ${pos.y})`}
            >
              {/* Neuron circle */}
              <circle
                r={neuronRadius}
                fill={neuronColor}
                stroke={theme.palette.grey[800]}
                strokeWidth={1.5}
                onClick={() => setSelectedNeuron({ layer: layerIndex, index: neuronIndex, value: activation })}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  Layer {layerIndex}, Neuron {neuronIndex}
                  Activation: {activation.toFixed(3)}
                  Bias: {bias.toFixed(3)}
                </title>
              </circle>

              {/* Gradient overlay for visualization */}
              {showGradients && (
                <GradientOverlay 
                  gradient={gradient}
                  radius={neuronRadius + 2}
                />
              )}

              {/* Bias value display */}
              <text
                y={neuronRadius * 2}
                fontSize={10}
                textAnchor="middle"
                fill={theme.palette.text.primary}
                fontWeight="bold"
              >
                {bias.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Layer label */}
        <text
          x={getLayerLabelPosition(layerIndex).x}
          y={getLayerLabelPosition(layerIndex).y}
          textAnchor="middle"
          fill={getLayerColor(layerIndex, layers.length)}
          fontSize={12}
          fontWeight="bold"
        >
          {layerIndex === 0 ? 'Input Layer' : 
          layerIndex === layers.length - 1 ? 'Output Layer' : 
            `Hidden Layer ${layerIndex}`}
        </text>
      </g>
    ));
  };

  // =============================================
  // Main Render
  // =============================================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Network Visualization Section */}
      <Box sx={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center',
        overflow: 'auto'
      }}>
        <svg ref={svgRef} width={width} height={height}>
          {renderConnections()}
          {renderNeurons()}
          {showGradients && renderGradientFlows()}
        </svg>
      </Box>

      {/* Layer Statistics Section */}
      {renderLayerStats()}

      {/* Rest of the components */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {weights && biases && learningRate !== undefined && (
          <NetworkStats 
            weights={weights} 
            biases={biases} 
            learningRate={learningRate} 
          />
        )}
        
        {activations && layers.map((_, layerIndex) => (
          <ActivationPatterns
            key={layerIndex}
            activations={activations}
            layer={layerIndex}
            layers={layers}
          />
        ))}

        {weights && (
          <WeightDistribution weights={weights} />
        )}
      </Box>
    </Box>
  );
};

// At the end of the file
// Change the export at the end of NetworkVisualization.tsx
export { NetworkVisualization };  // Change from 'export default'