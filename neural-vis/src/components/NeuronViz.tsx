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
import React, { useState } from 'react';
import { NeuronInfo, NeuronVizProps } from '../types/neuron-viz.types';
import { GradientLegend } from './network/controls/GradientLegend';
import { ImportDialog } from './network/dialogs/ImportDialog';
import { PerformanceMetrics } from './network/metrics/PerformanceMetrics';
import { NetworkControls } from './network/NetworkControls';
import { ErrorSurfaceViz } from './network/visualization/ErrorSurfaceViz';
import { LayerComparison } from './network/visualization/LayerComparison';
import { NetworkVisualization } from './network/visualization/NetworkVisualization';
import { TensorFlowPlaygroundViz } from './network/visualization/TensorFlowPlaygroundViz';

export const NeuronViz: React.FC<NeuronVizProps> = (props) => {
  // State management
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronInfo | null>(null);
  const [showBackprop, setShowBackprop] = useState(false);
  const [showGradients, setShowGradients] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const [editedLayers, setEditedLayers] = useState(props.layers);

  // Handlers
  const handleImport = () => {
    if (importData && props.onImportNetwork) {
      try {
        props.onImportNetwork(importData);
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
          {...props}
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
        {...props}
        showBackprop={showBackprop}
        showGradients={showGradients}
        selectedNeuron={selectedNeuron}
        setSelectedNeuron={setSelectedNeuron}
      />

      <TensorFlowPlaygroundViz
        {...props}
        showGradients={showGradients}
      />

      {/* Layer Statistics and Performance Metrics */}
      <Box sx={{ mt: 4 }}>
        {/* Remove outer heading and description */}
        {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Performance Metrics</Typography>
          <InfoTooltip
            title="Performance Metrics"
            description={
              <Box>
                <Typography variant="body2" gutterBottom>
                  Key metrics showing network performance:
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                  <li>Accuracy: Percentage of correct predictions overall</li>
                  <li>Precision: True positives / (True + False positives)</li>
                  <li>Recall: True positives / (True positives + False negatives)</li>
                  <li>F1 Score: Harmonic mean of precision and recall</li>
                </Typography>
              </Box>
            }
          />
        </Box> */}
        <PerformanceMetrics metrics={props.performanceMetrics} />

        {props.activations && (
          <LayerComparison
            layers={props.layers}
            activations={props.activations}
          />
        )}
      </Box>

      {/* Error Surface */}
      {props.weights && (
        <ErrorSurfaceViz
          weights={props.weights}
          error={props.performanceMetrics?.accuracy || 0}
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
};