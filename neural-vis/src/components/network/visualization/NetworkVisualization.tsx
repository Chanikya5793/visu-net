/**
 * NetworkVisualization Component
 * 
 * Core visualization component for neural network architecture and dynamics.
 * Provides an interactive visualization of the network structure, connections,
 * and real-time updates during training.
 * 
 * Features:
 * - Interactive network graph visualization
 * - Real-time weight and activation updates
 * - Gradient flow visualization
 * - Neuron selection and inspection
 * - Layer-wise statistics display
 * 
 * Props:
 * @extends {NeuronVizProps}
 * @param {boolean} showBackprop - Toggle backpropagation visualization
 * @param {boolean} showGradients - Toggle gradient visualization
 * @param {NeuronInfo | null} selectedNeuron - Currently selected neuron for inspection
 * @param {function} setSelectedNeuron - Callback to update selected neuron
 * @param {number[][][]} [weights] - Optional 3D array of network weights
 * @param {number[][]} [activations] - Optional 2D array of neuron activations
 * @param {number[][]} [biases] - Optional 2D array of neuron biases
 * @param {number[][][]} [gradients] - Optional 3D array of weight gradients
 * @param {number} [learningRate] - Optional current learning rate
 * 
 * Visual Components:
 * - Network Graph - Interactive visualization of neurons and connections
 * - NetworkStats - Statistics about weights, biases, and learning rate
 * - ActivationPatterns - Visualization of neuron activations per layer
 * - WeightDistribution - Distribution chart of network weights
 * 
 * Implementation:
 * - SVG-based network visualization
 * - Material-UI components for layout and controls
 * - Dynamic updates during training
 * - Responsive design with automatic scaling
 * 
 * @component
 */

import { Box, Paper, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import { NeuronInfo, NeuronVizProps } from '../../../types/neuron-viz.types';
import { LayerAnalysisContainer } from '../analytics/LayerAnalysisContainer';
import { InfoTooltip } from '../controls/InfoTooltip';
import { EnhancedNeuronDetailDialog } from '../dialogs/EnhancedNeuronDetailDialog';
import { NetworkStats } from '../metrics/NetworkStats';
import { ActivationPatterns } from './ActivationPatterns';
import { ConnectionLabel } from './ConnectionLabel';
import { GradientFlow } from './GradientFlow';
import { GradientOverlay } from './GradientOverlay';
import { WeightDistribution } from './WeightDistribution';

interface NetworkVisualizationProps extends NeuronVizProps {
  showBackprop: boolean;
  showGradients: boolean;
  selectedNeuron: NeuronInfo | null;
  setSelectedNeuron: React.Dispatch<React.SetStateAction<NeuronInfo | null>>;
  weights?: number[][][];
  activations?: number[][];
  biases?: number[][];
  gradients?: number[][][];
  learningRate?: number;
  performanceMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
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
  gradients,
  learningRate,
  performanceMetrics
}) => {
// Remove unused theme import since it's not being used
  const svgRef = useRef<SVGSVGElement>(null);
  const [showNeuronDetail, setShowNeuronDetail] = useState(false);

  // Get visualization settings from store
  const {
    neuronRadius: settingsNeuronRadius,
    layerSpacing: settingsLayerSpacing,
    verticalSpacing: settingsVerticalSpacing,
    connectionOpacity,
    showActivationValues,
    showWeightValues
  } = useSettingsStore();

  // Helper function to calculate point on bezier curve
  const bezierPoint = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
    const oneMinusT = 1 - t;
    return Math.pow(oneMinusT, 3) * p0 +
           3 * Math.pow(oneMinusT, 2) * t * p1 +
           3 * oneMinusT * Math.pow(t, 2) * p2 +
           Math.pow(t, 3) * p3;
  };

  // =============================================
  // Visual Constants - Adjust these to change network layout
  // =============================================
  
  // Overall SVG dimensions
  // Reduced width from 1200 to 900 to minimize blank space while maintaining readability
  const width = 900;   // Total width of the visualization
  const height = 600;   // Total height of the visualization
  
  // Neuron appearance - Use settings value
  const neuronRadius = settingsNeuronRadius;  // Size of each neuron circle
  
  // =============================================
  // Padding Configuration - Adjust these to control exact spacing from edges
  // =============================================
  //************************* */
 // const paddingLeft = 100;    // Space from left edge
  //const paddingRight = 100;   // Space from right edge
 // const paddingTop = 10;      // Space from top edge
  //************************ */
  // Individual padding for each side (in pixels)
  // Reduced left padding from 100 to 60 to minimize blank space
  const paddingLeft = 40;    // Space from left edge - Reduced to minimize blank space
  // Removed paddingRight since it's not being used
  // const paddingTop = 10;      // Space from top edge - Commented out since not used
  const paddingBottom = -420;  // Space from bottom edge (more space for labels)
  
  // =============================================
  // Spacing Calculations - Derived from padding values
  // =============================================
  
//**************** */
    // Horizontal spacing - Use settings value
  //const usableWidth = width - (paddingLeft + paddingRight);  // Width available for layers
 // const layerSpacing = settingsLayerSpacing;    // Distance between layers
  //const layerSpacing = Math.min(settingsLayerSpacing, usableWidth / (layers.length - 1));
  // Vertical spacing - Use settings value and usableHeight for dynamic scaling
  //const usableHeight = height - (paddingTop + paddingBottom - 0.9);  // Height available for neurons
  //const maxNeuronsInLayer = Math.max(...layers);
 // const verticalSpacing = Math.min(settingsVerticalSpacing, usableHeight / (maxNeuronsInLayer - 1));

  // Use settings value for vertical spacing
  //************************************ */
  // Horizontal spacing - Use settings value but with dynamic adjustment
  // Calculate usable width to ensure proper spacing between layers
  const usableWidth = width - (paddingLeft * 2);  // Width available for layers
  // Adjust layer spacing based on available width and number of layers
  const layerSpacing = Math.min(settingsLayerSpacing, usableWidth / (layers.length - 1));
  
  // Use settings value for vertical spacing with dynamic adjustment
  const verticalSpacing = settingsVerticalSpacing;  // Space between neurons
  
  // =============================================
  // Position Calculation Helper - Uses the new padding system
  // =============================================
  
  const getNeuronPosition = (layerIndex: number, neuronIndex: number) => {
    const layerSize = layers[layerIndex];
    const totalHeight = (layerSize - 1) * verticalSpacing;
    const startY = (height - totalHeight) / 2;
    return {
      x: paddingLeft + layerIndex * layerSpacing,
      y: startY + neuronIndex * verticalSpacing
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
    if (!weights || !activations || !gradients) return null;

    return layers.map((neuronsCount, layerIndex) => {
      if (layerIndex === 0) return null;
      const prevLayerNeurons = layers[layerIndex - 1];

      return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
        Array.from({ length: neuronsCount }).map((_, toIdx) => {
          const fromActivation = activations[layerIndex - 1]?.[fromIdx] || 0;
          const toActivation = activations[layerIndex]?.[toIdx] || 0;
          const weight = weights[layerIndex - 1]?.[toIdx]?.[fromIdx] || 0;
          const gradient = (gradients[layerIndex - 1]?.[toIdx]?.[fromIdx] as number) || 0;

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
              weight={weight}
              fromActivation={fromActivation}
              toActivation={toActivation}
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
    // Enhanced connection strength calculation
    const baseStrength = Math.abs(weight);
    const activationFactor = isInputLayer ? 1 : Math.abs(fromActivation);
    return baseStrength * (0.3 + 0.7 * activationFactor); // Ensure minimum visibility
  };

  // Update connection opacity to use settings value
  const getConnectionOpacity = (
    layerIndex: number,
    connectionStrength: number
  ) => {
    const isInputLayer = layerIndex === 1;
    // Higher base opacity for input layer, modified by settings
    const baseOpacity = (isInputLayer ? 0.8 : 0.5) * connectionOpacity;
    return baseOpacity + Math.min(connectionStrength, 1) * 0.2;
  };

  const getConnectionWidth = (
    layerIndex: number,
    weight: number
  ) => {
    const isInputLayer = layerIndex === 1;
    // Simplified width calculation
    const baseWidth = isInputLayer ? 2 : 1;
    return Math.max(baseWidth, Math.abs(weight) * 3);
  };

  const getActivityThreshold = (layerIndex: number) => {
    return layerIndex === 1 ? 0.1 : 0.3;
  };

  // Position labels at different points along the curve with dynamic shuffling
  const getShuffledPosition = (layerIndex: number, fromIdx: number, toIdx: number) => {
    // Create a unique but consistent pattern based on indices
    const patternSeed = (fromIdx * 7 + toIdx * 13) % 5;  // Use prime numbers for better distribution
    
    if (layerIndex === 1) {
      // Input layer: Spread more evenly
      switch(patternSeed) {
        case 0: return 0.3;  // Near start
        case 1: return 0.4;  // Between start and middle
        case 2: return 0.5;  // Middle
        case 3: return 0.6;  // Between middle and end
        case 4: return 0.7;  // Near end
        default: return 0.5;
      }
    } else {
      // Hidden layers: Closer to source with more variation
      switch(patternSeed) {
        case 0: return 0.15;  // Very close to start
        case 1: return 0.25;  // Close to start
        case 2: return 0.30;  // Bit further
        case 3: return 0.60;  // Between very close and close
        case 4: return 0.85;  // Between close and bit further
        default: return 0.25;
      }
    }
  };

  const renderConnections = () => {
    return (
      <g className="connections">
        {layers.map((neuronsCount, layerIndex) => {
          if (layerIndex === 0) return null;
          const prevLayerNeurons = layers[layerIndex - 1];

          return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
            Array.from({ length: neuronsCount }).map((_, toIdx) => {
              const weight = weights?.[layerIndex - 1]?.[toIdx]?.[fromIdx] || 0;
              const fromActivation = activations?.[layerIndex - 1]?.[fromIdx] || 0;
              const toActivation = activations?.[layerIndex]?.[toIdx] || 0;
              
              const fromPos = getNeuronPosition(layerIndex - 1, fromIdx);
              const toPos = getNeuronPosition(layerIndex, toIdx);
              
              const isInputLayer = layerIndex === 1;
              const connectionStrength = getConnectionStrength(layerIndex, fromActivation, toActivation, weight);
              const isActive = connectionStrength > getActivityThreshold(layerIndex);
              const connectionOpacity = getConnectionOpacity(layerIndex, connectionStrength);
              const strokeWidth = getConnectionWidth(layerIndex, weight);
              
              let labelX: number, labelY: number, path: string;
              let controlPoint1X = 0, controlPoint1Y = 0, controlPoint2X = 0, controlPoint2Y = 0;
              
              if (isInputLayer) {
                const dx = toPos.x - fromPos.x;
                const dy = toPos.y - fromPos.y;
                const midX = (fromPos.x + toPos.x) / 2;
                const midY = (fromPos.y + toPos.y) / 2;
                
                // Enhanced S-curve for input layer connections
                const curveFactor = 0.3; // Increased for more pronounced curve
                const curveHeight = Math.min(Math.abs(dy) * 1.2, 60) * (dy > 0 ? 1 : -1);
                controlPoint1X = midX - dx * curveFactor;
                controlPoint1Y = midY - curveHeight;
                controlPoint2X = midX + dx * curveFactor;
                controlPoint2Y = midY - curveHeight;
                
                path = `M ${fromPos.x} ${fromPos.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${toPos.x} ${toPos.y}`;
                
                const t = getShuffledPosition(layerIndex, fromIdx, toIdx);
                labelX = bezierPoint(fromPos.x, controlPoint1X, controlPoint2X, toPos.x, t);
                labelY = bezierPoint(fromPos.y, controlPoint1Y, controlPoint2Y, toPos.y, t);
              } else {
                path = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
                const t = getShuffledPosition(layerIndex, fromIdx, toIdx);
                labelX = fromPos.x + (toPos.x - fromPos.x) * t;
                labelY = fromPos.y + (toPos.y - fromPos.y) * t;
              }
              
              // TensorFlow Playground-style colors
              const connectionColor = isInputLayer
                ? '#2196f3' // Consistent blue for input connections
                : weight > 0 ? '#23c566' : '#ff4081'; // Green for positive, pink for negative
              
              return (
                <g 
                  key={`connection-${layerIndex}-${fromIdx}-${toIdx}`}
                  onMouseEnter={() => {
                    // Highlight connected neurons
                    const fromNeuron = document.querySelector(`#neuron-${layerIndex-1}-${fromIdx}`);
                    const toNeuron = document.querySelector(`#neuron-${layerIndex}-${toIdx}`);
                    if (fromNeuron) fromNeuron.setAttribute('filter', 'url(#neuron-highlight)');
                    if (toNeuron) toNeuron.setAttribute('filter', 'url(#neuron-highlight)');
                  }}
                  onMouseLeave={() => {
                    // Remove highlight
                    const fromNeuron = document.querySelector(`#neuron-${layerIndex-1}-${fromIdx}`);
                    const toNeuron = document.querySelector(`#neuron-${layerIndex}-${toIdx}`);
                    if (fromNeuron) fromNeuron.removeAttribute('filter');
                    if (toNeuron) toNeuron.removeAttribute('filter');
                  }}
                >
                  <defs>
                    <filter id={`glow-${layerIndex}-${fromIdx}-${toIdx}`}>
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <linearGradient id={`gradient-${layerIndex}-${fromIdx}-${toIdx}`} gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={connectionColor} stopOpacity="0.3"/>
                      <stop offset="50%" stopColor={connectionColor} stopOpacity="0.6"/>
                      <stop offset="100%" stopColor={connectionColor} stopOpacity="0.3"/>
                    </linearGradient>
                    <filter id="neuron-highlight">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feFlood floodColor="#ffeb3b" floodOpacity="0.5"/>
                      <feComposite in2="blur" operator="in"/>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Base connection path */}
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#gradient-${layerIndex}-${fromIdx}-${toIdx})`}
                    strokeWidth={strokeWidth * 1.5}
                    opacity={connectionOpacity * 0.3}
                  />
                  
                  {/* Animated connection path */}
                  <path
                    d={path}
                    fill="none"
                    stroke={connectionColor}
                    strokeWidth={strokeWidth}
                    opacity={connectionOpacity}
                    filter={isActive ? `url(#glow-${layerIndex}-${fromIdx}-${toIdx})` : ''}
                  >
                    <animate
                      attributeName="strokeDashoffset"
                      values="0;30"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="strokeDasharray"
                      values="3,3;6,6"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </path>
                  
                  {/* Flowing particles */}
                  {isActive && (
                    <>
                      <circle r="3" fill={connectionColor}>
                        <animateMotion
                          dur="1.2s"
                          repeatCount="indefinite"
                          begin={`${(fromIdx + toIdx) * 0.1}s`}
                          path={path}
                        >
                          <mpath href={`#path-${layerIndex}-${fromIdx}-${toIdx}`} />
                        </animateMotion>
                        <animate
                          attributeName="opacity"
                          values="0.8;0.4;0.8"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      
                      <circle r="2" fill={connectionColor}>
                        <animateMotion
                          dur="1.2s"
                          repeatCount="indefinite"
                          begin={`${(fromIdx + toIdx) * 0.1 + 0.6}s`}
                          path={path}
                        />
                        <animate
                          attributeName="opacity"
                          values="0.6;0.3;0.6"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                  
                  {!isInputLayer && (
                    <ConnectionLabel
                      weight={Number(weight.toFixed(2))}
                      fromActivation={Number(fromActivation.toFixed(2))}
                      toActivation={Number(toActivation.toFixed(2))}
                      x={labelX}
                      y={labelY}
                      isInputLayer={isInputLayer}
                    />
                  )}
                </g>
              );
            })
          );
        })}
      </g>
    );
  };

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

      {/* Neuron Detail Dialog */}
      <EnhancedNeuronDetailDialog
        open={showNeuronDetail}
        onClose={() => setShowNeuronDetail(false)}
        neuron={selectedNeuron}
        weights={weights}
        biases={biases}
        activations={activations}
        gradients={gradients}
      />
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
          const isActive = Math.abs(activation) > 0.1;

          return (
            <g 
              key={`neuron-${layerIndex}-${neuronIndex}`}
              transform={`translate(${pos.x}, ${pos.y})`}
            >
              {/* Neuron glow effect */}
              <defs>
                <filter id={`neuron-glow-${layerIndex}-${neuronIndex}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <radialGradient id={`neuron-gradient-${layerIndex}-${neuronIndex}`}>
                  <stop offset="0%" stopColor={neuronColor} stopOpacity="1"/>
                  <stop offset="70%" stopColor={neuronColor} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={neuronColor} stopOpacity="0.2"/>
                </radialGradient>
              </defs>

              {/* Neuron background glow */}
              {isActive && (
                <circle
                  r={neuronRadius * 1.5}
                  fill={`url(#neuron-gradient-${layerIndex}-${neuronIndex})`}
                  opacity="0.3"
                >
                  <animate
                    attributeName="r"
                    values={`${neuronRadius * 1.5};${neuronRadius * 1.8};${neuronRadius * 1.5}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;0.1;0.3"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Main neuron circle */}
              <circle
                className="neuron-circle"
                r={neuronRadius}
                fill={neuronColor}
                stroke="#ffffff"
                strokeWidth={1.5}
                filter={isActive ? `url(#neuron-glow-${layerIndex}-${neuronIndex})` : ''}
                onClick={() => {
                  setSelectedNeuron({ 
                    layer: layerIndex, 
                    index: neuronIndex, 
                    value: activation,
                    weights: weights?.[layerIndex]?.[neuronIndex] || [],
                    bias: bias,
                    gradient: gradient,
                    connections: {
                      incoming: weights?.[layerIndex - 1]?.map(w => w[neuronIndex]) || [],
                      outgoing: weights?.[layerIndex]?.[neuronIndex] || []
                    }
                  });
                  setShowNeuronDetail(true);
                }}
                onMouseEnter={(e) => {
                  const tooltip = document.createElement('div');
                  tooltip.className = 'neuron-tooltip';
                  tooltip.style.position = 'absolute';
                  tooltip.style.left = `${e.clientX + 10}px`;
                  tooltip.style.top = `${e.clientY + 10}px`;
                  tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                  tooltip.style.color = 'white';
                  tooltip.style.padding = '8px';
                  tooltip.style.borderRadius = '4px';
                  tooltip.style.fontSize = '12px';
                  tooltip.style.zIndex = '1000';
                  tooltip.innerHTML = `
                    <div><strong>Layer ${layerIndex}</strong> (Neuron ${neuronIndex})</div>
                    <div>Activation: ${activation.toFixed(3)}</div>
                    <div>Bias: ${bias.toFixed(3)}</div>
                    ${gradient ? `<div>Gradient: ${gradient.toFixed(3)}</div>` : ''}
                    <div style="margin-top:4px;font-size:10px">Click for more details</div>
                  `;
                  document.body.appendChild(tooltip);
                }}
                onMouseLeave={() => {
                  const tooltip = document.querySelector('.neuron-tooltip');
                  if (tooltip) tooltip.remove();
                }}
                style={{ cursor: 'pointer' }}
              >
                <title>
                  Layer {layerIndex}, Neuron {neuronIndex}
                  Activation: {activation.toFixed(3)}
                  Bias: {bias.toFixed(3)}
                </title>
                {isActive && (
                  <animate
                    attributeName="r"
                    values={`${neuronRadius};${neuronRadius * 1.1};${neuronRadius}`}
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>

              {/* Gradient overlay for visualization */}
              {showGradients && (
                <GradientOverlay 
                  gradient={gradient}
                  radius={neuronRadius + 2}
                />
              )}

              {/* Activation value display */}
              {showActivationValues && (
                <text
                  y={-neuronRadius}
                  fontSize={10}
                  textAnchor="middle"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="0.5"
                  fontWeight="bold"
                  opacity={Math.abs(activation) < 0.001 ? 0.5 : 1}
                >
                  {Math.abs(activation) < 0.001 ? "0.00" : activation.toFixed(2)}
                </text>
              )}

              {/* Bias/Weight value display */}
              {showWeightValues && (
                <text
                  y={neuronRadius * 2}
                  fontSize={10}
                  textAnchor="middle"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="0.5"
                  fontWeight="bold"
                  opacity={Math.abs(bias) < 0.001 ? 0.5 : 1}
                >
                  {Math.abs(bias) < 0.001 ? "0.00" : bias.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}

        {/* Layer label */}
        <text
          x={getLayerLabelPosition(layerIndex).x}
          y={getLayerLabelPosition(layerIndex).y}
          textAnchor="middle"
          fill={getLayerColor(layerIndex, layers.length)}
          fontSize={14}
          fontWeight="bold"
          filter="url(#text-shadow)"
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
        width: '100%',                    // Take full width of parent
        maxWidth: '100%',                 // Prevent overflow beyond parent width
        display: 'flex', 
        justifyContent: 'center',
        overflow: 'hidden',               // Hide overflow instead of allowing scroll
        padding: { xs: 2, sm: 3 },        // Responsive padding (16px mobile, 24px desktop)
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        '& svg': {
          width: '100%',                  // Take full width of container
          maxWidth: '100%',               // Ensure SVG doesn't overflow
          height: 'auto',                 // Maintain aspect ratio
          minHeight: { xs: 400, sm: 500, md: 600 }, // Responsive min heights
          transform: 'scale(0.9)',        // Slight scale down for padding
          transformOrigin: 'center center'
        }
      }}>
        <svg 
          ref={svgRef} 
          width={width} 
          height={height} 
          preserveAspectRatio="xMidYMid meet" 
          viewBox={`0 0 ${width} ${height}`}
        >
          {renderConnections()}
          {renderNeurons()}
          {showGradients && renderGradientFlows()}
        </svg>
      </Box>

      {/* Layer Statistics Section */}
      {renderLayerStats()}

      {/* Layer Analysis Section */}
      <LayerAnalysisContainer
        layers={layers}
        activations={activations}
        weights={weights}
        gradients={gradients}
        biases={biases}
      />

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

      {/* Neuron Detail Dialog */}
      <EnhancedNeuronDetailDialog
        open={showNeuronDetail}
        onClose={() => setShowNeuronDetail(false)}
        neuron={selectedNeuron}
        weights={weights}
        biases={biases}
        activations={activations}
        gradients={gradients}
      />
    </Box>
  );
};