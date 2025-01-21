import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { styles } from './styles';
import { NeuronInfo, NeuronVizProps } from './types';

// Import base components
import {
    ArchitectureEditor,
    ErrorSurface,
    LayerComparison,
    LearningRateControl,
    NetworkVisualization,
    NeuronColorLegend,
    TrainingSpeedControl,
    WeightDistribution
} from './';

// Import enhanced components from network folder
import {
    EnhancedActivationPatterns as ActivationPatterns,
    AnimationLayer,
    BackpropagationViz,
    ExperimentArchitecture,
    GradientLegend,
    InfoTooltip,
    EnhancedNetworkStats as NetworkStats,
    EnhancedPerformanceMetrics as PerformanceMetrics
} from './network-imports';

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
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronInfo | null>(null);
  const [highlightedConnections, setHighlightedConnections] = useState<Set<string>>(new Set());
  const [showBackprop, setShowBackprop] = useState(false);
  const [showGradients, setShowGradients] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [editedLayers, setEditedLayers] = useState(layers);
  const [backpropState, setBackpropState] = useState({
    currentLayer: -1,
    signal: [] as number[]
  });

  useEffect(() => {
    setEditedLayers(layers);
  }, [layers]);

  const handleNeuronClick = (layer: number, index: number) => {
    const neuronInfo: NeuronInfo = {
      layer,
      index,
      value: activations?.[layer]?.[index] || 0,
    };

    setSelectedNeuron(prev => prev?.layer === layer && prev?.index === index ? null : neuronInfo);
    highlightConnections(layer, index);
  };

  const highlightConnections = (layer: number, index: number) => {
    const connections = new Set<string>();
    
    // Highlight connections to previous layer
    if (layer > 0) {
      for (let i = 0; i < layers[layer - 1]; i++) {
        connections.add(`${layer - 1}-${i}-${layer}-${index}`);
      }
    }
    
    // Highlight connections to next layer
    if (layer < layers.length - 1) {
      for (let i = 0; i < layers[layer + 1]; i++) {
        connections.add(`${layer}-${index}-${layer + 1}-${i}`);
      }
    }

    setHighlightedConnections(connections);
  };

  const handleWeightClick = (layerIndex: number, fromNeuron: number, toNeuron: number, currentWeight: number) => {
    const newWeight = prompt(
      `Adjust weight (current: ${currentWeight.toFixed(4)})`,
      currentWeight.toString()
    );
    
    if (newWeight && !isNaN(+newWeight)) {
      onWeightAdjust?.(layerIndex, fromNeuron, toNeuron, +newWeight);
    }
  };

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

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Network Architecture
        <InfoTooltip 
          title="Network Architecture" 
          description="Visualize and modify your neural network architecture" 
        />
      </Typography>
      
      {/* Network Controls Panel */}
      <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Backpropagation Visualization */}
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowBackprop(!showBackprop)}
            >
              {showBackprop ? 'Hide' : 'Show'} Backpropagation
            </Button>
            {showBackprop && (
              <BackpropagationViz
                layers={layers}
                currentLayer={backpropState.currentLayer}
                signal={backpropState.signal}
              />
            )}
          </Box>
          
          {/* Gradients Button with Legend */}
          <Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowGradients(!showGradients)}
            >
              {showGradients ? 'Hide' : 'Show'} Gradients
            </Button>
            {showGradients && <GradientLegend />}
          </Box>

          {/* Learning Rate Control */}
          {onLearningRateChange && (
            <LearningRateControl
              learningRate={learningRate}
              onChange={onLearningRateChange}
              disabled={!isTraining}
            />
          )}
          
          {/* Training Speed Control */}
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

          {/* Color Legend */}
          <NeuronColorLegend 
            dataset={dataset}
            layers={layers}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Main Network View */}
        <Box sx={{ flex: 2, position: 'relative' }}>
          <NetworkVisualization
            layers={layers}
            activations={activations}
            weights={weights}
            biases={biases}
            gradients={gradients}
            width={800}
            height={400}
            selectedNeuron={selectedNeuron}
            highlightedConnections={highlightedConnections}
            showGradients={showGradients}
            onNeuronClick={handleNeuronClick}
            onWeightClick={handleWeightClick}
          />
          <AnimationLayer
            width={800}
            height={400}
            animationState={{
              signal: activations?.[backpropState.currentLayer] || [],
              currentLayer: backpropState.currentLayer
            }}
          />
        </Box>

        {/* Side Panel */}
        <Box sx={{ flex: 1 }}>
          {weights && biases && (
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

          {weights && <WeightDistribution weights={weights} />}
        </Box>
      </Box>

      {/* Layer Comparison */}
      {activations && (
        <LayerComparison
          layers={layers}
          activations={activations}
        />
      )}

      {/* Architecture Controls */}
      {onArchitectureChange && (
        <>
          <ArchitectureEditor
            layers={layers}
            onChange={onArchitectureChange}
            isTraining={isTraining}
          />
          <ExperimentArchitecture
            layers={layers}
            onArchitectureChange={onArchitectureChange}
            isTraining={isTraining}
          />
        </>
      )}

      {/* Error Surface */}
      {weights && (
        <ErrorSurface
          weights={weights}
          error={performanceMetrics?.accuracy || 0}
        />
      )}

      {/* Performance Metrics */}
      <PerformanceMetrics metrics={performanceMetrics} />

      {/* Selected Neuron Details */}
      {selectedNeuron && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, maxWidth: 400, mx: 'auto' }}>
          <Typography variant="h6">Neuron Details</Typography>
          <Typography>Layer: {selectedNeuron.layer}</Typography>
          <Typography>Index: {selectedNeuron.index}</Typography>
          <Typography>Activation Value: {selectedNeuron.value.toFixed(4)}</Typography>
          {selectedNeuron.weights && selectedNeuron.weights.length > 0 && (
            <Typography>
              Weights: {selectedNeuron.weights.map(w => w.toFixed(4)).join(', ')}
            </Typography>
          )}
        </Box>
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