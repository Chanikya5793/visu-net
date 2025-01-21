/**
 * NeuronViz Component
 * 
 * Main container component for neural network visualization.
 * This component is responsible for managing the overall state and layout of the visualization.
 * It serves as the single source of truth for shared components like PerformanceMetrics and ErrorSurfaceViz.
 * 
 * Components included:
 * 1. NetworkControls - Controls for training, learning rate, gradients, etc.
 *    - Manages network training parameters and visualization settings
 *    - Handles import/export functionality
 * 
 * 2. GradientLegend - Legend explaining gradient colors and meanings
 *    - Provides visual guide for interpreting gradient overlays
 * 
 * 3. NetworkVisualization - Core visualization of neural network architecture
 *    - Renders network structure, neurons, and connections
 *    - Handles neuron selection and interaction
 *    - Shows layer statistics and activation patterns
 * 
 * 4. PerformanceMetrics - Shows accuracy, precision, recall, F1 score
 *    - Displays key performance indicators
 *    - Updates in real-time during training
 * 
 * 5. LayerComparison - Visualizes and compares layer activations
 *    - Shows activation patterns across different layers
 *    - Helps understand information flow through the network
 * 
 * 6. ErrorSurfaceViz - Shows error landscape visualization
 *    - Visualizes the error surface in weight space
 *    - Helps understand optimization landscape
 * 
 * 7. ImportDialog - Dialog for importing network configurations
 *    - Handles network architecture import
 *    - Validates import data
 */

import { Box, Typography } from '@mui/material';
import React, { useState, useEffect, memo, useMemo } from 'react';
import { NeuronInfo, NeuronVizProps } from '../types/neuron-viz.types';
import { GradientLegend } from './network/controls/GradientLegend';
import { ImportDialog } from './network/dialogs/ImportDialog';
import { PerformanceMetrics } from './network/metrics/PerformanceMetrics';
import { NetworkControls } from './network/NetworkControls';
import { ErrorSurfaceViz } from './network/visualization/ErrorSurfaceViz';
import { LayerComparison } from './network/visualization/LayerComparison';
import { NetworkVisualization } from './network/visualization/NetworkVisualization';
import { computeNetworkStructure, updateVisuals } from '../utils/networkUtils';
import { useVirtualization } from '../hooks/useVirtualization';

export const NeuronViz: React.FC<NeuronVizProps> = memo(({ 
  layers,
  activations,
  weights,
  biases,
  dataset,
  isTraining,
  onWeightAdjust,
  learningRate,
  onLearningRateChange,
  onExportNetwork,
  onImportNetwork,
  performanceMetrics,
  trainingSpeed,
  onTrainingSpeedChange,
  onArchitectureChange
}) => {
  // State management
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronInfo | null>(null);
  const [showBackprop, setShowBackprop] = useState(false);
  const [showGradients, setShowGradients] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [editedLayers, setEditedLayers] = useState(layers);

  // Memoize expensive computations
  const networkStructure = useMemo(() => {
    return computeNetworkStructure(layers, weights);
  }, [layers, weights]);

  // Use requestAnimationFrame for smooth animations
  useEffect(() => {
    if (isTraining) {
      let frame: number;
      const animate = () => {
        updateVisuals();
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }
  }, [isTraining]);

  // Virtual scrolling for large networks
  const virtualizedLayers = useVirtualization({
    items: layers,
    height: 600,
    itemHeight: 100
  });

  // Handlers
  const handleImport = () => {
    if (importData && onImportNetwork) {
      try {
        onImportNetwork(importData);
        setShowImportDialog(false);
        setImportData('');
      } catch (error) {
        console.error('Failed to import network:', error);
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Network Architecture</Typography>
      
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <NetworkControls 
          layers={layers}
          activations={activations}
          weights={weights}
          dataset={dataset}
          isTraining={isTraining}
          onWeightAdjust={onWeightAdjust}
          learningRate={learningRate}
          onLearningRateChange={onLearningRateChange}
          onExportNetwork={onExportNetwork}
          onImportNetwork={(data) => onImportNetwork?.(data)}
          performanceMetrics={performanceMetrics}
          trainingSpeed={trainingSpeed}
          onTrainingSpeedChange={onTrainingSpeedChange}
          onArchitectureChange={onArchitectureChange}
          showBackprop={showBackprop}
          setShowBackprop={setShowBackprop}
          showGradients={showGradients}
          setShowGradients={setShowGradients}
          handleImportDialog={() => setShowImportDialog(true)}
          editedLayers={editedLayers}
          setEditedLayers={setEditedLayers}
        />
      </Box>

      {showGradients && <GradientLegend />}

      <NetworkVisualization 
        layers={layers}
        activations={activations}
        weights={weights}
        biases={biases}
        dataset={dataset}
        isTraining={isTraining}
        showBackprop={showBackprop}
        showGradients={showGradients}
        selectedNeuron={selectedNeuron}
        setSelectedNeuron={setSelectedNeuron}
        onWeightAdjust={onWeightAdjust}
        learningRate={learningRate}
        performanceMetrics={performanceMetrics}
      />

      {/* Layer Statistics and Performance Metrics */}
      <Box sx={{ mt: 4 }}>
        <PerformanceMetrics metrics={performanceMetrics} />

        {activations && (
          <LayerComparison
            layers={layers}
            activations={activations}
          />
        )}
      </Box>

      {/* Error Surface */}
      {weights && (
        <ErrorSurfaceViz
          weights={weights}
          error={performanceMetrics?.accuracy || 0}
        />
      )}

      <ImportDialog 
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        importData={importData}
        setImportData={setImportData}
        onImport={handleImport}
      />
    </Box>
  );
});