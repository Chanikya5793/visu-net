import * as brain from 'brain.js';
import { weatherData } from './data';
import { ITrainer, TrainingOptions, TrainerProgress, PerformanceMetrics } from '../TrainerInterface';

export class WeatherTrainer implements ITrainer {
  protected network!: brain.NeuralNetwork;
  private isTraining: boolean = false;
  private isPaused: boolean = false;
  private currentEpoch: number = 0;
  private totalEpochs: number = 0;
  private lastError: number = 1;
  private trainingState: any = null;
  private activations: number[][] = [];
  private weights: number[][][] = [];
  private biases: number[][] = [];
  private gradients: number[][] = [];
  private learningRate: number = 0.01;
  private trainingData: any[];

  constructor(customDataset?: any[]) {
    this.trainingData = customDataset || weatherData.training;
    this.initNetwork();
    // Initialize with valid training options
    this.network.train(this.trainingData, {
      iterations: 1,
      errorThresh: 0.01,
      log: false,
      learningRate: 0.01
    });
  }

  getNetwork(): brain.NeuralNetwork {
    return this.network;
  }

  initNetwork(layers?: number[]): void {
    this.network = new brain.NeuralNetwork({
        // Input: 10 neurons (4 temp + 3 humidity + 3 cloud cover)
        // Output: 4 neurons (rain probability ranges)
        hiddenLayers: layers || [8, 6],
        activation: 'sigmoid',
        learningRate: this.learningRate
    });
  }

  async train(options: TrainingOptions): Promise<void> {
    try {
      // Handle training state
      if (this.isPaused && this.trainingState) {
        this.network.fromJSON(this.trainingState);
        this.isPaused = false;
      } else {
        this.totalEpochs = options.epochs;
        this.currentEpoch = 0;
        this.lastError = 1;
        this.trainingState = null;
      }

      this.isTraining = true;

      await this.network.trainAsync(this.trainingData, {
        iterations: this.totalEpochs, // Train for all epochs at once
        errorThresh: 0.0000000000000000000000000000000000000000000001,
        log: true,
        logPeriod: 1,
        callback: (stats: { iterations: number, error: number }) => {
          // Update current epoch
          this.currentEpoch = stats.iterations;
          this.lastError = stats.error;

          // Check if we should stop
          if (!this.isTraining) {
            options.onStop?.();
            return true;
          }

          // Check if we should pause
          if (this.isPaused) {
            this.trainingState = this.network.toJSON();
            options.onPause?.();
            return true;
          }

          // Get current activations
          this.updateActivations();

          // Update network state in each iteration
          this.updateNetworkState();

          // Update UI with current progress
          options.onIteration?.(this.currentEpoch, stats.error);
          
          // Continue training unless we've reached total epochs
          if (this.currentEpoch >= this.totalEpochs) {
            options.onComplete?.();
            return true;
          }
          
          return false;
        }
      });

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Training error:', error);
        options.onStop?.(error.message);
      }
    }
  }

  pause(): void {
    if (this.isTraining) {
      this.trainingState = this.network.toJSON(); // Save state first
      this.isPaused = true;
      this.isTraining = false; // Stop training like stop()
    }
  }
  continue(options: TrainingOptions): void {
    if (this.isPaused && this.trainingState) {
      this.train(options);
    }
  }

  stop(): void {
    this.isTraining = false;
    this.isPaused = false;
    this.trainingState = null;
  }

  reset(): void {
    this.stop();
    this.currentEpoch = 0;
    this.totalEpochs = 0;
    this.lastError = 1;
    this.isTraining = false;
    this.isPaused = false;
    this.initNetwork();
    // Initialize with valid training options
    this.network.train(this.trainingData, {
      iterations: 1,
      errorThresh: 0.01, // Changed from 1 to a valid value
      log: false
    });
  }

  predict(input: number[]): number[] {
    return this.network.run(input);
  }

  getProgress(): {
    currentEpoch: number;
    totalEpochs: number;
    lastError: number;
    isPaused: boolean;
    isTraining: boolean;
  } {
    return {
      currentEpoch: this.currentEpoch,
      totalEpochs: this.totalEpochs,
      lastError: this.lastError,
      isPaused: this.isPaused,
      isTraining: this.isTraining
    };
  }

  private updateActivations(): void {
    const networkState = this.network.toJSON();
    this.activations = networkState.layers.map((layer: any) => {
      if (layer.biases) {
        return layer.biases.map((_: any, i: number) => {
          const weights = layer.weights[i] || [];
          return Math.tanh(weights.reduce((sum: number, w: number) => sum + w, 0) + layer.biases[i]);
        });
      }
      return [];
    });
  }

  private updateNetworkState(): void {
    const networkState = this.network.toJSON();
    
    // Include input layer activations
    this.activations = [
      // Add input layer activations
      networkState.layers[0].weights[0] || [], // Input layer
      // Add hidden and output layer activations
      ...networkState.layers.map((layer: any) => {
        if (layer.biases) {
          return layer.biases.map((_: any, i: number) => {
            const weights = layer.weights[i] || [];
            return Math.tanh(weights.reduce((sum: number, w: number) => sum + w, 0) + layer.biases[i]);
          });
        }
        return [];
      })
    ];

    // Store weights and biases
    this.weights = networkState.layers.map((layer: any) => layer.weights || []);
    this.biases = networkState.layers.map((layer: any) => layer.biases || []);
  }

  getWeights(): number[][][] {
    return this.weights;
  }

  getBiases(): number[][] {
    return this.biases;
  }

  getActivations(): number[][] {
    return this.activations;
  }

  adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void {
    const networkState = this.network.toJSON();
    
    if (networkState.layers[layerIndex] && 
        networkState.layers[layerIndex].weights[toNeuron]) {
      networkState.layers[layerIndex].weights[toNeuron][fromNeuron] = newWeight;
      this.network.fromJSON(networkState);
      this.updateNetworkState();
    }
  }

  setLearningRate(rate: number): void {
    this.learningRate = rate;
    const networkState = this.network.toJSON();
    networkState.trainOpts = {
      ...networkState.trainOpts,
      learningRate: rate
    };
    this.network.fromJSON(networkState);
  }

  exportNetwork(): string {
    return JSON.stringify(this.network.toJSON(), null, 2);
  }

  importNetwork(data: string): void {
    try {
      const networkState = JSON.parse(data);
      this.network.fromJSON(networkState);
      this.updateNetworkState();
    } catch (error) {
      console.error('Failed to import network:', error);
      throw new Error('Invalid network configuration');
    }
  }

  getPerformanceMetrics(): PerformanceMetrics {
    // Check if network is initialized
    if (!this.network || !this.isTraining && this.currentEpoch === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      };
    }

    try {
      // Calculate metrics using test data
      let correct = 0;
      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;

      this.trainingData.forEach(data => {
        try {
          const prediction = this.predict(data.input);
          const expected = data.output[0];
          const predicted = prediction[0] > 0.5 ? 1 : 0;

          if (predicted === expected) correct++;
          if (predicted === 1 && expected === 1) truePositives++;
          if (predicted === 1 && expected === 0) falsePositives++;
          if (predicted === 0 && expected === 1) falseNegatives++;
        } catch (error) {
          console.error('Error predicting:', error);
        }
      });

      const total = this.trainingData.length;
      const accuracy = correct / total;
      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

      return { accuracy, precision, recall, f1Score };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      };
    }
  }
}