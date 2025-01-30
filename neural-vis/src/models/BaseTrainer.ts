/**
 * BaseTrainer Abstract Class
 * 
 * Abstract base class implementing core neural network training functionality.
 * Provides common training operations and state management for all trainer implementations.
 * 
 * Features:
 * - Neural network initialization and configuration
 * - Training data management and validation splitting
 * - Early stopping implementation
 * - Progress tracking and metrics calculation
 * - Batch training support
 * 
 * State Management:
 * - Network state (weights, biases, activations)
 * - Training progress and metrics
 * - Validation performance tracking
 * - Early stopping state
 * 
 * Training Process:
 * - Supports both batch and full dataset training
 * - Implements early stopping with patience
 * - Tracks and validates training progress
 * - Provides hooks for progress monitoring
 * 
 * Implementation:
 * - Uses brain.js for neural network operations
 * - Implements ITrainer interface
 * - Provides abstract methods for specific trainer implementations
 * - Manages training state and configuration
 * 
 * @abstract
 * @class BaseTrainer
 * @implements {ITrainer}
 */

import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainerProgress, TrainingOptions } from './TrainerInterface';

export abstract class BaseTrainer implements ITrainer {
  protected network: brain.NeuralNetwork;
  protected progress: TrainerProgress;
  protected isTraining: boolean;
  protected shouldStop: boolean;
  protected validationData: { input: number[]; output: number[]; }[];
  protected trainingData: { input: number[]; output: number[]; }[];
  protected bestValidationError: number;
  protected patienceCounter: number;

  constructor() {
    this.network = new brain.NeuralNetwork();
    this.progress = {
      currentEpoch: 0,
      totalEpochs: 0,
      lastError: 1,
      isTraining: false
    };
    this.isTraining = false;
    this.shouldStop = false;
    this.validationData = [];
    this.trainingData = [];
    this.bestValidationError = Infinity;
    this.patienceCounter = 0;
  }

  /**
   * Splits the dataset into training and validation sets
   * @param data Complete dataset
   * @param validationSplit Fraction of data to use for validation (0-1)
   */
  protected splitDataset(data: { input: number[]; output: number[]; }[], validationSplit: number) {
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    this.trainingData = data.slice(0, splitIndex);
    this.validationData = data.slice(splitIndex);
  }

  /**
   * Calculates the current validation error
   * @returns Average error on validation set
   */
  protected calculateValidationError(): number {
    let totalError = 0;
    for (const sample of this.validationData) {
      const output = this.network.run(sample.input);
      const error = output.reduce((sum, val, i) => 
        sum + Math.pow(val - sample.output[i], 2), 0);
      totalError += error;
    }
    return totalError / this.validationData.length;
  }

  /**
   * Checks if training should stop based on validation performance
   * @param validationError Current validation error
   * @param patience Number of epochs to wait for improvement
   * @returns Whether to stop training
   */
  protected checkEarlyStopping(validationError: number, patience: number): boolean {
    if (validationError < this.bestValidationError) {
      this.bestValidationError = validationError;
      this.patienceCounter = 0;
    } else {
      this.patienceCounter++;
      if (this.patienceCounter >= patience) {
        return true;
      }
    }
    return false;
  }

  /**
   * * Main training method implementing the training loop
   * @param options Training configuration options
   * Calculates performance metrics for the current network state
   * @returns Object containing various performance metrics
   */
  async train(options: TrainingOptions): Promise<void> {
    const {
      epochs,
      batchSize = 32,
      validationSplit = 0.2,
      earlyStoppingPatience = 10,
      onIteration,
      onComplete,
      onStop
    } = options;

    this.progress.totalEpochs = epochs;
    this.progress.currentEpoch = 0;
    this.isTraining = true;
    this.shouldStop = false;
    this.bestValidationError = Infinity;
    this.patienceCounter = 0;

    // Split dataset if validation is enabled
    if (validationSplit > 0) {
      this.splitDataset(this.trainingData, validationSplit);
    }

    try {
      for (let epoch = 0; epoch < epochs && !this.shouldStop; epoch++) {
        this.progress.currentEpoch = epoch + 1;

        // Train on batches
        for (let i = 0; i < this.trainingData.length; i += batchSize) {
          const batch = this.trainingData.slice(i, i + batchSize);
          const error = await this.trainOnBatch(batch);
          this.progress.lastError = error;

          if (onIteration) {
            onIteration(epoch, error);
          }

          // Check for stop signal
          if (this.shouldStop) {
            if (onStop) {
              onStop('Training stopped by user');
            }
            return;
          }
        }

        // Validate and check early stopping
        if (validationSplit > 0) {
          const validationError = this.calculateValidationError();
          if (this.checkEarlyStopping(validationError, earlyStoppingPatience)) {
            if (onStop) {
              onStop('Early stopping triggered: No improvement in validation error');
            }
            break;
          }
        }
      }

      if (onComplete && !this.shouldStop) {
        onComplete();
      }
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Abstract method for training on a single batch
   * Must be implemented by concrete trainer classes
   * @param batch Array of training samples
   * @returns Training error for the batch
   */
  protected abstract trainOnBatch(batch: { input: number[]; output: number[]; }[]): Promise<number>;

  stop(): void {
    this.shouldStop = true;
  }

  abstract reset(): void;
  abstract predict(input: number[]): number[];
  abstract getWeights(): number[][][];
  abstract getBiases(): number[][];
  abstract getActivations(): number[][];
  abstract getGradients(): number[][][];
  abstract adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void;
  abstract setLearningRate(rate: number): void;
  abstract exportNetwork(): string;
  abstract importNetwork(data: string): void;
  abstract getPerformanceMetrics(): PerformanceMetrics;
  abstract initNetwork(layers?: number[]): void;
  abstract getNetwork(): brain.NeuralNetwork;

  getProgress(): TrainerProgress {
    return this.progress;
  }
}