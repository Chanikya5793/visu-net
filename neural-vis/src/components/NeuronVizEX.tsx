// src/components/NeuronViz.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, useTheme, Paper, Typography, Button, Slider,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  TooltipProps
} from 'recharts';

// At the top of NeuronViz.tsx after imports
const styles = {
  tooltipContainer: {
    backgroundColor: '#fff',
    padding: '10px',
    border: '1px solid #ccc'
  },
  networkDiagram: {
    transition: 'all 0.3s ease-in-out'
  },
  textarea: {
    width: '100%',
    minHeight: '200px'
  }
};

// Add new props for enhanced features
interface NeuronVizProps {
  layers: number[];
  activations?: number[][];
  weights?: number[][][]; // [layerIndex][neuronIndex][connectionIndex]
  biases?: number[][]; // [layerIndex][neuronIndex]
  dataset: string;
  isTraining: boolean;
  onWeightAdjust?: (layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number) => void;
  gradients?: number[][];
  learningRate?: number;
  onLearningRateChange?: (newRate: number) => void;
  onExportNetwork?: () => void;
  onImportNetwork?: (data: string) => void;
  performanceMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainingSpeed?: number;
  onTrainingSpeedChange?: (speed: number) => void;
  onArchitectureChange?: (newLayers: number[]) => void;
}

interface NeuronInfo {
  layer: number;
  index: number;
  value: number;
  weights?: number[];
}

// Add gradient visualization support
const GradientOverlay: React.FC<{ gradient: number }> = ({ gradient }) => (
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

// Add new gradient visualization components
const GradientFlow: React.FC<{
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  gradient: number;
}> = ({ fromX, fromY, toX, toY, gradient }) => (
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

// Add learning rate control
const LearningRateControl: React.FC<{
  learningRate: number;
  onChange: (value: number) => void;
  disabled: boolean // Add disabled prop
}> = ({ learningRate, onChange, disabled }) => (
  <Box sx={{ width: 200, mx: 2 }}>
    <Typography gutterBottom>Learning Rate</Typography>
    <Slider
      value={learningRate}
      onChange={(_, value) => onChange(value as number)}
      min={0.001}
      max={0.5}
      step={0.001}
      disabled={disabled} // Add disabled state
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => value.toFixed(3)}
    />
  </Box>
);

// Add performance metrics display
const PerformanceMetrics: React.FC<{
  metrics: NeuronVizProps['performanceMetrics'];
}> = ({ metrics }) => {
  if (!metrics) return null;
  
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="textSecondary">Accuracy</Typography>
          <Typography variant="h6">{(metrics.accuracy * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Precision</Typography>
          <Typography variant="h6">{(metrics.precision * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">Recall</Typography>
          <Typography variant="h6">{(metrics.recall * 100).toFixed(1)}%</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">F1 Score</Typography>
          <Typography variant="h6">{(metrics.f1Score * 100).toFixed(1)}%</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Add network statistics panel
interface NetworkStatsType {
  weightMean: number;
  weightStd: number;
  biasMean: number;
  biasStd: number;
}

interface NetworkStatsProps {
  weights: number[][][];
  biases: number[][];
  learningRate: number;
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ weights, biases, learningRate }) => {
  const calculateStats = (): NetworkStatsType => {
    if (!weights || !biases) {
      return {
        weightMean: 0,
        weightStd: 0,
        biasMean: 0,
        biasStd: 0
      };
    }

    // Safely flatten and filter weights
    const allWeights = weights.flat(2).filter(w => w !== undefined && !isNaN(w));
    const allBiases = biases.flat().filter(b => b !== undefined && !isNaN(b));
    
    const weightMean = allWeights.length > 0 
      ? allWeights.reduce((a, b) => a + b, 0) / allWeights.length 
      : 0;
      
    const biasMean = allBiases.length > 0 
      ? allBiases.reduce((a, b) => a + b, 0) / allBiases.length 
      : 0;
    
    return {
      weightMean,
      weightStd: allWeights.length > 0 
        ? Math.sqrt(allWeights.reduce((a, b) => a + (b - weightMean) ** 2, 0) / allWeights.length)
        : 0,
      biasMean,
      biasStd: allBiases.length > 0 
        ? Math.sqrt(allBiases.reduce((a, b) => a + (b - biasMean) ** 2, 0) / allBiases.length)
        : 0,
    };
  };

  // Only render if we have valid data
  if (!weights || !biases) {
    return null;
  }

  const stats = calculateStats();

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6">Network Statistics</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2">Weights</Typography>
          <Typography>Mean: {stats.weightMean.toFixed(4)}</Typography>
          <Typography>Std Dev: {stats.weightStd.toFixed(4)}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">Biases</Typography>
          <Typography>Mean: {stats.biasMean.toFixed(4)}</Typography>
          <Typography>Std Dev: {stats.biasStd.toFixed(4)}</Typography>
        </Box>
      </Box>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        Learning Rate: {learningRate}
      </Typography>
    </Paper>
  );
};

// Add layer-wise activation patterns
interface ActivationPatternsProps {
  activations: number[][];
  layer: number;
}

const ActivationPatterns: React.FC<ActivationPatternsProps> = ({
  activations,
  layer
}) => {
  const layerActivations = activations[layer] || [];
  
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2">Layer {layer} Activation Pattern</Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        height: 50,
        alignItems: 'flex-end'
      }}>
        {layerActivations.map((value, idx) => (
          <Box
            key={idx}
            sx={{
              width: 10,
              height: `${value * 100}%`,
              bgcolor: `rgba(33, 150, 243, ${value})`,
              transition: 'all 0.3s'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

interface WeightDistributionProps {
  weights: number[][][];
}

// Create a type for our chart data
interface ChartData {
  weight: string;
  count: number;
}

// Update WeightDistribution component with proper typing
const WeightDistribution: React.FC<WeightDistributionProps> = ({ weights }) => {
  const allWeights = weights.flat(2);
  const bins = 20;
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  const binSize = (max - min) / bins;
  
  const histogram = new Array(bins).fill(0);
  allWeights.forEach(w => {
    const binIndex = Math.min(bins - 1, Math.floor((w - min) / binSize));
    histogram[binIndex]++;
  });

  return (
    <Paper sx={{ p: 2, mt: 2, width: '100%' }}>
      <Typography variant="h6">Weight Distribution</Typography>
      <Box sx={{ height: 200, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={histogram.map((count, idx) => ({
              weight: (min + (idx + 0.5) * binSize).toFixed(2),
              count
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="weight" 
              label={{ value: 'Weight Value', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip<number, string>
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={({ active, payload, label }: TooltipProps<number, string>) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={styles.tooltipContainer}>
                      <p>{`Weight: ${label}`}</p>
                      <p>{`Frequency: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

// Add new components for the enhancements
const TrainingSpeedControl: React.FC<{
  speed: number;
  onChange: (speed: number) => void;
  disabled: boolean // Add disabled prop
}> = ({ speed, onChange, disabled }) => (
  <Box sx={{ width: 200, mx: 2 }}>
    <Typography gutterBottom>Training Speed</Typography>
    <Slider
      value={speed}
      onChange={(_, value) => onChange(value as number)}
      min={0.5} // Changed from 0.1 to 0.5
      max={2}
      step={0.1}
      disabled={disabled} // Add disabled state
      marks={[
        { value: 0.5, label: 'Slow' },
        { value: 1, label: 'Normal' },
        { value: 2, label: 'Fast' }
      ]}
      valueLabelDisplay="auto"
      valueLabelFormat={(value) => `${value}x`}
    />
  </Box>
);

// Layer comparison visualization
const LayerComparison: React.FC<{
  layers: number[];
  activations: number[][];
}> = ({ layers, activations }) => (
  <Paper sx={{ p: 2, mt: 2 }}>
    <Typography variant="h6" gutterBottom>Layer Comparison</Typography>
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
      {layers.map((neurons, idx) => (
        <Box key={idx} sx={{ minWidth: 150 }}>
          <Typography variant="subtitle2">{`Layer ${idx}`}</Typography>
          <Box sx={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            {activations[idx]?.map((value, neuronIdx) => (
              <Box
                key={neuronIdx}
                sx={{
                  width: '8px',
                  height: `${value * 100}%`,
                  bgcolor: `rgba(33, 150, 243, ${value})`,
                  transition: 'height 0.3s'
                }}
                title={`Neuron ${neuronIdx}: ${value.toFixed(4)}`}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
);

// Network architecture modification
const ArchitectureEditor: React.FC<{
  layers: number[];
  onChange: (newLayers: number[]) => void;
  isTraining: boolean;  // Add this prop
}> = ({ layers, onChange, isTraining }) => {
  const [editedLayers, setEditedLayers] = useState(layers);

  const handleLayerChange = (index: number, value: number) => {
    const newLayers = [...editedLayers];
    newLayers[index] = value;
    setEditedLayers(newLayers);
  };

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Network Architecture</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Modify the number of neurons in each hidden layer. Changes will reset the network training.
        Cannot be modified during training.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {editedLayers.map((neurons, idx) => (
          <Box key={idx} sx={{ minWidth: 120 }}>
            <Typography variant="caption">
              {idx === 0 ? 'Input Layer' : 
               idx === layers.length - 1 ? 'Output Layer' : 
               `Hidden Layer ${idx}`}
            </Typography>
            <Slider
              value={neurons}
              onChange={(_, value) => handleLayerChange(idx, value as number)}
              min={1}
              max={10}
              step={1}
              marks
              disabled={isTraining || idx === 0 || idx === layers.length - 1}
              valueLabelDisplay="auto"
            />
          </Box>
        ))}
        <Button 
          variant="contained" 
          onClick={() => onChange(editedLayers)}
          disabled={isTraining}
          sx={{ mt: 2 }}
        >
          Apply Changes
        </Button>
      </Box>
    </Paper>
  );
};

// Error surface visualization
const ErrorSurfaceViz: React.FC<{
  weights: number[][][];
  error: number;
}> = ({ weights, error }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create error surface visualization
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const imageData = ctx.createImageData(width, height);

    // Map weights to 2D surface
    const flatWeights = weights.flat(2);
    const w1 = flatWeights[0] || 0;
    const w2 = flatWeights[1] || 0;

    // Create error surface
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = (x / width - 0.5) * 4;
        const dy = (y / height - 0.5) * 4;
        const distance = Math.sqrt((dx - w1) ** 2 + (dy - w2) ** 2);
        const errorValue = Math.exp(-distance) * error;
        
        const index = (y * width + x) * 4;
        const color = Math.floor((1 - errorValue) * 255);
        
        imageData.data[index] = color;
        imageData.data[index + 1] = color;
        imageData.data[index + 2] = color;
        imageData.data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [weights, error]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Error Surface</Typography>
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        style={{ border: '1px solid #ccc' }}
      />
    </Paper>
  );
};

// Update the NeuronColorLegend component
const NeuronColorLegend: React.FC<{ 
  dataset: string;
  layers: number[];  // Add layers prop
}> = ({ dataset, layers }) => {
  const [open, setOpen] = useState(false);

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

  const getActivationLabel = (value: number) => {
    switch(dataset) {
      case 'logicGates':
        return value === 1 ? 'True/1' : value === 0 ? 'False/0' : `${value.toFixed(1)}`;
      case 'weatherPrediction':
        return `${(value * 100).toFixed(0)}% Rain Probability`;
      case 'fitnessClassification':
        if (value >= 0.66) return 'Fit';
        if (value >= 0.33) return 'Average';
        return 'Unfit';
      default:
        return `${value.toFixed(1)}`;
    }
  };

  const steps = Array.from({ length: 11 }, (_, i) => i / 10);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<InfoIcon />}
      >
        Neuron Color Guide
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Neuron Color Guide</DialogTitle>
        <DialogContent>
          {layers.map((_, layerIndex) => {
            const baseColor = getLayerColor(layerIndex, layers.length);
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);

            return (
              <Box key={layerIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {layerIndex === 0 ? 'Input Layer' : 
                   layerIndex === layers.length - 1 ? 'Output Layer' : 
                   `Hidden Layer ${layerIndex}`}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {steps.map(value => (
                    <Box 
                      key={value} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        minWidth: '150px'
                      }}
                    >
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        borderRadius: '50%', 
                        background: `rgba(${r}, ${g}, ${b}, ${0.3 + value * 0.7})`
                      }} />
                      <Typography variant="caption">
                        {getActivationLabel(value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Update the main NeuronViz component to use the enhanced legend
export const NeuronViz: React.FC<NeuronVizProps> = ({
  layers,
  activations,
  weights,
  biases,
  dataset,
  isTraining,
  onWeightAdjust,
  gradients,
  learningRate = 0.01,
  onLearningRateChange,
  onExportNetwork,
  onImportNetwork,
  performanceMetrics,
  trainingSpeed = 1,
  onTrainingSpeedChange,
  onArchitectureChange,
}) => {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronInfo | null>(null);
  const [highlightedConnections, setHighlightedConnections] = useState<Set<string>>(new Set());
  const [animationState, setAnimationState] = useState<{
    signal: number[];
    currentLayer: number;
  }>({ signal: [], currentLayer: -1 });
  const [showBackprop, setShowBackprop] = useState(false);
  const [layerStats, setLayerStats] = useState<{
    mean: number;
    stdDev: number;
    activation: string;
  }[]>([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [showGradients, setShowGradients] = useState(false);
  const [editedLayers, setEditedLayers] = useState(layers);

  // Add useEffect to update editedLayers when layers prop changes
  useEffect(() => {
    setEditedLayers(layers);
  }, [layers]);

  // Visual constants
  const width = 800;
  const height = 400;
  const neuronRadius = 15;
  const layerSpacing = width / (layers.length + 1);
  const maxNeuronsInLayer = Math.max(...layers);
  const verticalSpacing = height / (maxNeuronsInLayer + 1);

  // Animation effects
  useEffect(() => {
    if (isTraining && activations) {
      animateForwardProp(activations);
    }
  }, [activations, isTraining]);

  const animateForwardProp = (newActivations: number[][]) => {
    let currentLayer = 0;
    const interval = setInterval(() => {
      if (currentLayer >= layers.length) {
        clearInterval(interval);
        return;
      }

      setAnimationState({
        signal: newActivations[currentLayer] || [],
        currentLayer
      });

      currentLayer++;
    }, 500); // Adjust timing as needed
  };

  const getLayerLabel = (index: number) => {
    if (index === 0) return 'Input Layer';
    if (index === layers.length - 1) return 'Output Layer';
    return `Hidden Layer ${index}`;
  };

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

    // For hidden layers
    switch(layerIndex) {
      case 1: return colors.hidden1;
      case 2: return colors.hidden2;
      case 3: return colors.hidden3;
      default: return colors.hidden1; // Fallback for additional hidden layers
    }
  };

  const getNeuronColor = (layerIndex: number, neuronIndex: number) => {
    const baseColor = getLayerColor(layerIndex, layers.length);
    const activation = activations?.[layerIndex]?.[neuronIndex] || 0;
    
    // Convert the hex color to RGB to apply activation
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Adjust opacity based on activation
    return `rgba(${r}, ${g}, ${b}, ${0.3 + activation * 0.7})`;
  };

  const getConnectionKey = (fromLayer: number, fromNeuron: number, toLayer: number, toNeuron: number) => {
    return `${fromLayer}-${fromNeuron}-${toLayer}-${toNeuron}`;
  };

  const handleNeuronClick = (layer: number, index: number) => {
    const neuronInfo: NeuronInfo = {
      layer,
      index,
      value: activations?.[layer]?.[index] || 0,
      weights: [] // Add actual weights here when available
    };

    setSelectedNeuron(prev => prev?.layer === layer && prev?.index === index ? null : neuronInfo);
    highlightConnections(layer, index);
  };

  const highlightConnections = (layer: number, index: number) => {
    const connections = new Set<string>();
    
    // Highlight connections to previous layer
    if (layer > 0) {
      for (let i = 0; i < layers[layer - 1]; i++) {
        connections.add(getConnectionKey(layer - 1, i, layer, index));
      }
    }
    
    // Highlight connections to next layer
    if (layer < layers.length - 1) {
      for (let i = 0; i < layers[layer + 1]; i++) {
        connections.add(getConnectionKey(layer, index, layer + 1, i));
      }
    }

    setHighlightedConnections(connections);
  };

  // Calculate layer statistics
  useEffect(() => {
    if (activations) {
      const stats = activations.map(layerActivations => {
        const values = layerActivations.filter(v => !isNaN(v));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
        );
        return {
          mean,
          stdDev,
          activation: 'sigmoid' // You can make this dynamic based on layer config
        };
      });
      setLayerStats(stats);
    }
  }, [activations]);

  // Add backward propagation visualization
  const renderBackpropSignals = () => {
    if (!showBackprop) return null;

    return (
      <g className="backprop-signals">
        {layers.map((neuronsCount, layerIndex) => {
          if (layerIndex === 0) return null;
          return Array.from({ length: neuronsCount }).map((_, neuronIndex) => {
            const gradient = activations?.[layerIndex]?.[neuronIndex] || 0;
            return (
              <circle
                key={`backprop-${layerIndex}-${neuronIndex}`}
                cx={(layerIndex + 1) * layerSpacing}
                cy={(neuronIndex + 1) * verticalSpacing}
                r={neuronRadius * 1.2}
                fill="none"
                stroke={`rgba(255, 0, 0, ${gradient})`}
                strokeWidth={2}
                strokeDasharray="5,5"
                className="backprop-signal"
              >
                <animate
                  attributeName="r"
                  values={`${neuronRadius * 1.2};${neuronRadius * 1.5};${neuronRadius * 1.2}`}
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            );
          });
        })}
      </g>
    );
  };

  // Add interactive weight adjustment
  const handleWeightClick = (layerIndex: number, fromNeuron: number, toNeuron: number, currentWeight: number) => {
    const newWeight = prompt(
      `Adjust weight (current: ${currentWeight.toFixed(4)})`,
      currentWeight.toString()
    );
    
    if (newWeight && !isNaN(+newWeight)) {
      onWeightAdjust?.(layerIndex, fromNeuron, toNeuron, +newWeight);
    }
  };

  // Add layer statistics panel
  const renderLayerStats = () => (
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
      {layerStats.map((stats, idx) => (
        <Paper key={`stats-${idx}`} sx={{ p: 1, m: 1, minWidth: 200 }}>
          <Typography variant="subtitle2">
            {getLayerLabel(idx)} Statistics
          </Typography>
          <Typography variant="body2">
            Mean Activation: {stats.mean.toFixed(4)}
          </Typography>
          <Typography variant="body2">
            Std Dev: {stats.stdDev.toFixed(4)}
          </Typography>
          <Typography variant="body2">
            Activation: {stats.activation}
          </Typography>
        </Paper>
      ))}
    </Box>
  );

  const renderConnections = () => (
    <g className="connections">
      {layers.map((neuronsCount, layerIndex) => {
        if (layerIndex === 0) return null;
        const prevLayerNeurons = layers[layerIndex - 1];
        
        return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
          Array.from({ length: neuronsCount }).map((_, toIdx) => {
            const weight = weights?.[layerIndex]?.[toIdx]?.[fromIdx] || 0;
            const isActive = animationState.currentLayer === layerIndex;
            const connectionKey = getConnectionKey(layerIndex - 1, fromIdx, layerIndex, toIdx);
            const isHighlighted = highlightedConnections.has(connectionKey);
            
            return (
              <g key={`weight-${layerIndex}-${fromIdx}-${toIdx}`}>
                <path
                  d={`M ${layerIndex * layerSpacing} ${(fromIdx + 1) * verticalSpacing} 
                     C ${(layerIndex * layerSpacing + (layerIndex + 1) * layerSpacing) / 2} ${(fromIdx + 1) * verticalSpacing},
                       ${(layerIndex * layerSpacing + (layerIndex + 1) * layerSpacing) / 2} ${(toIdx + 1) * verticalSpacing},
                       ${(layerIndex + 1) * layerSpacing} ${(toIdx + 1) * verticalSpacing}`}
                  stroke={isHighlighted ? theme.palette.primary.main : theme.palette.grey[400]}
                  strokeWidth={Math.max(0.5, Math.abs(weight) * 2)}
                  fill="none"
                  opacity={isActive ? 1 : 0.6}
                  strokeDasharray={isActive ? "4,4" : "none"}
                  className={isActive ? "animated-connection" : ""}
                >
                  {isActive && (
                    <animate
                      attributeName="strokeDashoffset"
                      values="0;8"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
                {Math.abs(weight) > 0.1 && (
                  <text
                    x={(layerIndex * layerSpacing + (layerIndex + 1) * layerSpacing) / 2}
                    y={((fromIdx + 1) * verticalSpacing + (toIdx + 1) * verticalSpacing) / 2}
                    fontSize="10"
                    fill={theme.palette.text.secondary}
                    textAnchor="middle"
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

  const renderNeurons = () => (
    <g className="neurons">
      {layers.map((neuronsCount, layerIndex) => (
        <g key={`layer-${layerIndex}`}>
          {Array.from({ length: neuronsCount }).map((_, neuronIndex) => {
            const bias = biases?.[layerIndex]?.[neuronIndex] || 0;
            const gradient = gradients?.[layerIndex]?.[neuronIndex];
            
            return (
              <g key={`neuron-${layerIndex}-${neuronIndex}`}>
                  <circle
                      cx={(layerIndex + 1) * layerSpacing}
                      cy={(neuronIndex + 1) * verticalSpacing}
                      r={neuronRadius}
                      fill={getNeuronColor(layerIndex, neuronIndex)}
                      stroke={theme.palette.grey[400]}
                      style={styles.networkDiagram}
                      onClick={() => handleNeuronClick(layerIndex, neuronIndex)}
                      cursor="pointer"
                    >
                  <title>
                    {`Layer ${layerIndex}, Neuron ${neuronIndex}
                    Activation: ${(activations?.[layerIndex]?.[neuronIndex] || 0).toFixed(3)}
                    Bias: ${bias.toFixed(3)}`}
                  </title>
                </circle>
                {gradient !== undefined && (
                  <GradientOverlay gradient={gradient} />
                )}
                <text
                  x={(layerIndex + 1) * layerSpacing}
                  y={(neuronIndex + 1) * verticalSpacing + neuronRadius * 2}
                  fontSize="10"
                  textAnchor="middle"
                  fill={theme.palette.text.secondary}
                >
                  {bias.toFixed(2)}
                </text>
              </g>
            );
          })}
          <text
            x={(layerIndex + 1) * layerSpacing}
            y={height - 20}
            textAnchor="middle"
            fill={theme.palette.text.primary}
            fontSize={12}
          >
            {`${getLayerLabel(layerIndex)} (${neuronsCount})`}
          </text>
        </g>
      ))}
    </g>
  );

  const renderGradientFlows = () => {
    if (!weights || !activations) return null;

    return (
      <g className="gradient-flows">
        {layers.map((neuronsCount, layerIndex) => {
          if (layerIndex === 0) return null;
          const prevLayerNeurons = layers[layerIndex - 1];

          return Array.from({ length: prevLayerNeurons }).map((_, fromIdx) =>
            Array.from({ length: neuronsCount }).map((_, toIdx) => {
              const fromActivation = activations[layerIndex - 1]?.[fromIdx] || 0;
              const toActivation = activations[layerIndex]?.[toIdx] || 0;
              const gradient = fromActivation * toActivation;

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
        })}
      </g>
    );
  };

  // Add network export/import handlers
  const handleExport = () => {
    onExportNetwork?.();
  };

  const handleImport = () => {
    if (importData) {
      try {
        onImportNetwork?.(importData);
        setShowImportDialog(false);
        setImportData('');
      } catch (error) {
        console.error('Failed to import network:', error);
      }
    }
  };

  const handleLayerChange = (index: number, value: number) => {
    const newLayers = [...editedLayers];
    newLayers[index] = value;
    setEditedLayers(newLayers);
  };

  const handleApplyArchitecture = () => {
    onArchitectureChange?.(editedLayers);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Network Architecture</Typography>
      
      {/* Network Controls Panel */}
      <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        {/* Architecture Controls */}
        {onArchitectureChange && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Layer Architecture</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Modify neurons in hidden layers.  Changes reset training.  Cannot be modified during training.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {layers.map((neurons, idx) => (
                <Box key={idx} sx={{ minWidth: 120 }}>
                  <Typography variant="caption">
                    {idx === 0 ? 'Input Layer' : 
                    idx === layers.length - 1 ? 'Output Layer' : 
                    `Hidden Layer ${idx}`}
                  </Typography>
                  <Slider
                    value={editedLayers[idx]}  // Use editedLayers instead of layers
                    onChange={(_, value) => {
                      const newLayers = [...editedLayers];
                      newLayers[idx] = value as number;
                      setEditedLayers(newLayers);
                    }}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    disabled={isTraining || idx === 0 || idx === layers.length - 1}
                    valueLabelDisplay="auto"
                  />
                </Box>
              ))}
              <Button 
                variant="contained" 
                onClick={() => {
                  onArchitectureChange(editedLayers);
                }}
                disabled={isTraining}
              >
                Apply Architecture
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Backpropagation Button with Tooltip */}
          <Tooltip 
            title="Visualize how errors propagate backward through the network during training"
            placement="top"
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowBackprop(!showBackprop)}
              sx={{ mr: 1 }}
            >
              {showBackprop ? 'Hide' : 'Show'} Backpropagation
            </Button>
          </Tooltip>
          
          {/* Gradients Button with Tooltip */}
          <Tooltip 
            title="Show the strength and direction of weight updates during training"
            placement="top"
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowGradients(!showGradients)}
              sx={{ mr: 1 }}
            >
              {showGradients ? 'Hide' : 'Show'} Gradients
            </Button>
          </Tooltip>

          {/* Rest of the controls... */}
          {onLearningRateChange && (
            <LearningRateControl
              learningRate={learningRate}
              onChange={onLearningRateChange}
              disabled={!isTraining}
            />
          )}
          
          {/* Rest of the controls... */}
          {onTrainingSpeedChange && (
            <TrainingSpeedControl
              speed={trainingSpeed}
              onChange={onTrainingSpeedChange}
              disabled={!isTraining}
            />
          )}

          {/* Export/Import Controls */}
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={handleExport}
              sx={{ mr: 1 }}
            >
              Export Network
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowImportDialog(true)}
            >
              Import Network
            </Button>
          </Box>

          {/* Add the single color guide button */}
          <NeuronColorLegend 
            dataset={dataset}
            layers={layers}
          />
        </Box>
      </Box>

      {/* Network Visualization */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Main Network View */}
        <Box sx={{ flex: 2 }}>
          <svg ref={svgRef} width={width} height={height}>
            {renderConnections()}
            {renderNeurons()}
            {renderBackpropSignals()}
            {showGradients && renderGradientFlows()}
          </svg>
        </Box>

        {/* Side Panel */}
        <Box sx={{ flex: 1 }}>
          {weights && weights.length > 0 && biases && biases.length > 0 && (
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
            />
          ))}

          {weights && <WeightDistribution weights={weights} />}
        </Box>
      </Box>

      {/* Layer Statistics */}
      {renderLayerStats()}

      {/* Performance Metrics */}
      <PerformanceMetrics metrics={performanceMetrics} />

      {/* Layer Comparison */}
      {activations && (
        <LayerComparison
          layers={layers}
          activations={activations}
        />
      )}

      {/* Architecture Editor */}
      {onArchitectureChange && (
        <ArchitectureEditor
          layers={layers}
          onChange={onArchitectureChange}
          isTraining={isTraining}
        />
      )}

      {/* Error Surface */}
      {weights && (
        <ErrorSurfaceViz
          weights={weights}
          error={performanceMetrics?.accuracy || 0}
        />
      )}

      {/* Selected Neuron Details */}
      {selectedNeuron && (
        <Paper sx={{ mt: 2, p: 2, maxWidth: 400, mx: 'auto' }}>
          <Typography variant="h6">Neuron Details</Typography>
          <Typography>Layer: {selectedNeuron.layer}</Typography>
          <Typography>Index: {selectedNeuron.index}</Typography>
          <Typography>Activation Value: {selectedNeuron.value.toFixed(4)}</Typography>
          {selectedNeuron.weights && selectedNeuron.weights.length > 0 && (
            <Typography>
              Weights: {selectedNeuron.weights.map(w => w.toFixed(4)).join(', ')}
            </Typography>
          )}
        </Paper>
      )}

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onClose={() => setShowImportDialog(false)}>
        <DialogTitle>Import Network Configuration</DialogTitle>
        <DialogContent>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            style={styles.textarea}
            placeholder="Paste network configuration JSON here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button onClick={handleImport} variant="contained">Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};