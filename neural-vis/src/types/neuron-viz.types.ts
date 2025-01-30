/**
 * Neural Network Visualization Types
 * 
 * This module defines the core TypeScript interfaces used throughout the neural network
 * visualization application. These types ensure type safety and provide clear documentation
 * for component props and data structures.
 * 
 * @module neuron-viz.types
 */

/**
 * Props interface for the main NeuronViz component.
 * Controls the visualization and interaction with the neural network.
 * 
 * @interface NeuronVizProps
 */
export interface NeuronVizProps {
  /** Array defining the number of neurons in each layer */
  layers: number[];
  /** 2D array of neuron activation values [layer][neuron] */
  activations?: number[][];
  /** 3D array of connection weights [layer][toNeuron][fromNeuron] */
  weights?: number[][][];
  /** 2D array of neuron bias values [layer][neuron] */
  biases?: number[][];
  /** Current dataset being used for training */
  dataset: string;
  /** Flag indicating if network is currently training */
  isTraining: boolean;
  /** Callback for adjusting connection weights */
  onWeightAdjust?: (layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number) => void;
  /** 3D array of gradient values for connections */
  gradients?: number[][][];
  /** Current learning rate */
  learningRate?: number;
  /** Callback for changing learning rate */
  onLearningRateChange?: (newRate: number) => void;
  /** Callback for exporting network state */
  onExportNetwork?: () => void;
  /** Callback for importing network state */
  onImportNetwork?: (data: string) => void;
  /** Current performance metrics of the network */
  performanceMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  /** Current training animation speed */
  trainingSpeed?: number;
  /** Callback for changing training animation speed */
  onTrainingSpeedChange?: (speed: number) => void;
  /** Callback for changing network architecture */
  onArchitectureChange?: (newLayers: number[]) => void;
}

/**
 * Interface representing detailed information about a single neuron.
 * Used for displaying neuron details and managing interactions.
 * 
 * @interface NeuronInfo
 */
export interface NeuronInfo {
  /** Layer index containing this neuron */
  layer: number;
  /** Neuron index within its layer */
  index: number;
  /** Current activation value */
  value: number;
  /** Array of connection weights from this neuron */
  weights?: number[];
  /** Bias value for this neuron */
  bias?: number;
  /** Current gradient value */
  gradient?: number;
  /** Connection information */
  connections?: {
    incoming: number[];
    outgoing: number[];
  };
}

/**
 * Interface for network-wide statistical information.
 * Used for analyzing and displaying network state.
 * 
 * @interface NetworkStatsType
 */
export interface NetworkStatsType {
  /** Mean of all weights in the network */
  weightMean: number;
  /** Standard deviation of weights */
  weightStd: number;
  /** Mean of all bias values */
  biasMean: number;
  /** Standard deviation of biases */
  biasStd: number;
}