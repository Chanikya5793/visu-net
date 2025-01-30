/**
 * NetworkContent Component
 * 
 * A comprehensive interface for neural network visualization and interaction.
 * Provides tabs for visualization, documentation, experiments, and settings.
 * 
 * Features:
 * - Interactive neural network visualization
 * - Real-time training controls and metrics
 * - Dataset selection and configuration
 * - Detailed documentation and usage guides
 * - Experiment management interface
 * - Customizable settings
 */

import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { DatasetSelector } from './DatasetSelector';
import { NeuronViz } from './NeuronViz';
import { TrainingControls } from './TrainingControls';
import { TrainingMetrics } from './TrainingMetrics';

/**
 * Props interface for TabPanel component
 * @interface TabPanelProps
 * @property {React.ReactNode} children - Content to be displayed in the tab panel
 * @property {number} index - Index of the tab panel
 * @property {number} value - Current active tab value
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * TabPanel Component
 * 
 * A container component that handles the display of tab content based on the active tab.
 * Implements accessibility features for better user experience.
 * 
 * @param {TabPanelProps} props - The props for the TabPanel component
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Generate accessibility props for tabs
 * 
 * @param {number} index - The index of the tab
 * @returns {Object} Object containing aria-label and aria-controls properties
 */
function a11yProps(index: number) {
  return {
    id: `network-tab-${index}`,
    'aria-controls': `network-tabpanel-${index}`,
  };
}

/**
 * NetworkContent Component
 * 
 * Main component for the neural network visualization interface.
 * Manages the state and interaction between various subcomponents.
 * 
 * State:
 * - tabValue: Current active tab index
 * - layers: Neural network architecture configuration
 * - dataset: Selected dataset for training
 * - isTraining: Training status flag
 * - learningRate: Network learning rate
 * - trainingSpeed: Speed of training visualization
 */
export function NetworkContent() {
  const [tabValue, setTabValue] = useState(0);
  const [layers, setLayers] = useState([4, 6, 6, 2]);
  const [dataset, setDataset] = useState('XOR');
  const [isTraining, setIsTraining] = useState(false);
  const [learningRate, setLearningRate] = useState(0.03);
  const [trainingSpeed, setTrainingSpeed] = useState(1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="network tabs">
          <Tab label="Visualization" {...a11yProps(0)} />
          <Tab label="Documentation" {...a11yProps(1)} />
          <Tab label="Experiments" {...a11yProps(2)} />
          <Tab label="Settings" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DatasetSelector
            dataset={dataset}
            onChange={(e) => setDataset(e.target.value)}
          />
          <TrainingControls
            epochs={1000}
            isTraining={isTraining}
            isPaused={false}
            onEpochChange={() => {}}
            onStart={() => setIsTraining(true)}
            onPause={() => {}}
            onContinue={() => {}}
            onStop={() => setIsTraining(false)}
            onReset={() => {}}
            currentDataset="default"
          />
          <NeuronViz
            layers={layers}
            dataset={dataset}
            isTraining={isTraining}
            learningRate={learningRate}
            trainingSpeed={trainingSpeed}
            onArchitectureChange={setLayers}
          />
          <TrainingMetrics
            iteration={0}
            epochs={1000}
            loss={0}
            accuracy={0}
            isTraining={isTraining}
          />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>Documentation</Typography>
          
          <Typography variant="h6" sx={{ mt: 3 }}>Getting Started</Typography>
          <Typography paragraph>
            Welcome to the Neural Network Visualization tool! This interactive platform helps you understand
            how neural networks work through real-time visualization of network architecture, training process,
            and data flow.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Features</Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Interactive neural network visualization</li>
            <li>Real-time training visualization</li>
            <li>Multiple dataset options</li>
            <li>Customizable network architecture</li>
            <li>Adjustable learning parameters</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Usage Guide</Typography>
          <Typography paragraph>
            1. Select a dataset from the Dataset Selector
            2. Adjust the network architecture using the layer controls
            3. Set the learning rate and training speed
            4. Click 'Start Training' to begin the training process
            5. Observe the network's behavior and performance metrics
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>Experiments</Typography>
          
          <Typography variant="h6" sx={{ mt: 3 }}>Experiment Configurations</Typography>
          <Typography paragraph>
            Create and manage different neural network experiments. Compare various architectures
            and hyperparameters to understand their impact on network performance.
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Available Experiments</Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>XOR Problem Classification</li>
            <li>Binary Classification</li>
            <li>Pattern Recognition</li>
            <li>Function Approximation</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Results Comparison</Typography>
          <Typography paragraph>
            Compare results across different experiments to understand the effects of:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Network depth and width</li>
            <li>Learning rate variations</li>
            <li>Activation functions</li>
            <li>Training duration</li>
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h5" gutterBottom>Settings</Typography>
          
          <Typography variant="h6" sx={{ mt: 3 }}>Visualization Settings</Typography>
          <Typography paragraph>
            Customize the appearance and behavior of the network visualization:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Animation speed and effects</li>
            <li>Color schemes and themes</li>
            <li>Connection visualization style</li>
            <li>Node size and spacing</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Training Parameters</Typography>
          <Typography paragraph>
            Configure default training parameters:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Default learning rate</li>
            <li>Batch size</li>
            <li>Training iterations</li>
            <li>Error threshold</li>
          </Typography>

          <Typography variant="h6" sx={{ mt: 3 }}>Data Management</Typography>
          <Typography paragraph>
            Manage data and model settings:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <li>Import/Export network configurations</li>
            <li>Save/Load trained models</li>
            <li>Dataset preprocessing options</li>
            <li>Backup and restore settings</li>
          </Typography>
        </Box>
      </TabPanel>
    </Box>
  );
}
