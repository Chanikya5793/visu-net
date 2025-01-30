// src/models/TrainerInterface.ts

/**
 * Neural Network Trainer Interfaces
 * 
 * This module defines the core interfaces for neural network training functionality.
 * It provides type definitions for trainers, training options, and performance metrics.
 * 
 * Key Interfaces:
 * - ITrainer: Core trainer interface defining required methods for network training
 * - TrainingOptions: Configuration options for training process
 * - TrainingData: Structure for input/output training pairs
 * - TrainerProgress: Training progress tracking interface
 * - PerformanceMetrics: Network performance measurement interface
 * 
 * @module TrainerInterface
 */

import * as brain from 'brain.js';

/**
 * Core trainer interface that must be implemented by all neural network trainers
 * 
 * @interface ITrainer
 */
export interface ITrainer {
  /** Initiates the training process with given options */
  train(options: TrainingOptions): Promise<void>;
  /** Stops the current training process */
  stop(): void;
  /** Resets the network to initial state */
  reset(): void;
  /** Makes a prediction using the trained network */
  predict(input: number[]): number[];
  /** Returns current training progress */
  getProgress(): TrainerProgress;
  /** Returns network weight matrices */
  getWeights(): number[][][];
  /** Returns network bias vectors */
  getBiases(): number[][];
  /** Returns current neuron activations */
  getActivations(): number[][];
  /** Returns current weight gradients */
  getGradients(): number[][][];
  /** Modifies a specific weight in the network */
  adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void;
  /** Updates the network learning rate */
  setLearningRate(rate: number): void;
  /** Exports the network configuration as string */
  exportNetwork(): string;
  /** Imports a network configuration */
  importNetwork(data: string): void;
  /** Returns current performance metrics */
  getPerformanceMetrics(): PerformanceMetrics;
  /** Initializes network with given layer configuration */
  initNetwork(layers?: number[]): void;
  /** Returns the underlying brain.js network instance */
  getNetwork(): brain.NeuralNetwork;
  /** Optional method to normalize network weights */
  normalizeWeights?(): void;
}

/**
 * Training options interface for brain.js compatibility
 * @interface ITrainingOptions
 */
export interface ITrainingOptions {
  /** Number of training iterations */
  iterations: number;
  /** Error threshold for stopping */
  errorThresh: number;
  /** Whether to log training progress */
  log: boolean;
  /** How often to log progress */
  logPeriod?: number;
  /** Learning rate for training */
  learningRate: number;
  /** Size of training batches */
  batchSize?: number;
  /** Callback function for training iterations */
  callback?: (stats: { iterations: number; error: number }) => boolean;
}

/**
 * Brain.js specific training options
 * @interface BrainJsTrainingOptions
 */
export interface BrainJsTrainingOptions extends ITrainingOptions {}

/**
 * Enhanced training options for the visualization system
 * @interface TrainingOptions
 */
export interface TrainingOptions {
  /** Number of training epochs */
  epochs: number;
  /** Size of training batches */
  batchSize?: number;
  /** Fraction of data to use for validation */
  validationSplit?: number;
  /** Number of epochs to wait before early stopping */
  earlyStoppingPatience?: number;
  /** Callback for each iteration */
  onIteration?: (iteration: number, error: number) => void;
  /** Callback for training completion */
  onComplete?: () => void;
  /** Callback for training pause */
  onPause?: () => void;
  /** Callback for training stop */
  onStop?: (reason?: string) => void;
}

/**
 * Structure for training data pairs
 * @interface TrainingData
 */
export interface TrainingData {
  /** Input values for training */
  input: number[];
  /** Expected output values */
  output: number[];
}

/**
 * Training progress tracking interface
 * @interface TrainerProgress
 */
export interface TrainerProgress {
  /** Current training epoch */
  currentEpoch: number;
  /** Total number of epochs */
  totalEpochs: number;
  /** Last recorded error value */
  lastError: number;
  /** Whether training is in progress */
  isTraining: boolean;
  /** Optional gradient norm value */
  gradientNorm?: number;
}
export interface TrainingData {
  input: number[];
  output: number[];
}
/**
 * Performance metrics for model evaluation
 * @interface PerformanceMetrics
 */
export interface PerformanceMetrics {
  /** Overall accuracy of the model */
  accuracy: number;
  /** Precision score */
  precision: number;
  /** Recall score */
  recall: number;
  /** F1 score */
  f1Score: number;
  /** Mean squared error */
  mse?: number;
  /** Root mean squared error */
  rmse?: number;
  /** Mean absolute error */
  mae?: number;
}