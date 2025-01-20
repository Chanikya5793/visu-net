import * as brain from 'brain.js';
import { fitnessData } from './data';
import { ITrainer, TrainingOptions, TrainerProgress, PerformanceMetrics } from '../TrainerInterface';

export class FitnessTrainer implements ITrainer {
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
    this.trainingData = customDataset || fitnessData.training;
    this.initNetwork();
    // Initialize with valid training options
    this.network.train(this.trainingData, {
      iterations: 1,
      errorThresh: 0.01, // Changed from 1 to a valid value
      log: false,
      learningRate: 0.01
    });
  }

  getNetwork(): brain.NeuralNetwork {
    return this.network;
  }

  initNetwork(layers?: number[]): void {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: layers || [3], // Adjust layers per trainer
      activation: 'sigmoid',
      learningRate: this.learningRate,
      //outputSize: 3  // Three possible classifications
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
    // Return raw output array (3 neurons)
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

// (Apply same fix to other trainer classes)

private updateNetworkState(): void {
  const networkState = this.network.toJSON();
  
  // Critical fix: Proper weight storage including input layer
  this.weights = [];
  
  // Handle input layer weights
  if (networkState.layers[0] && networkState.layers[0].weights) {
    this.weights.push(networkState.layers[0].weights);
  }
  
  // Handle other layers
  for (let i = 1; i < networkState.layers.length; i++) {
    const layer = networkState.layers[i];
    if (layer.weights) {
      this.weights.push(layer.weights);
    }
  }

  // Update activations
  this.activations = networkState.layers.map((layer: any) => {
    if (layer.biases) {
      return layer.biases.map((_: any, i: number) => {
        const weights = layer.weights[i] || [];
        return Math.tanh(weights.reduce((sum: number, w: number) => sum + w, 0) + layer.biases[i]);
      });
    }
    return [];
  });

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
    if (!this.network || !this.isTraining && this.currentEpoch === 0) {
      return { accuracy: 0, precision: 0, recall: 0, f1Score: 0 };
    }

    try {
      let correct = 0;
      const total = this.trainingData.length;
      const confusionMatrix = {
        fit: { tp: 0, fp: 0, fn: 0 },
        average: { tp: 0, fp: 0, fn: 0 },
        unfit: { tp: 0, fp: 0, fn: 0 }
      };
      
      this.trainingData.forEach(data => {
        const prediction = this.predict(data.input);
        const predictedClass = prediction.indexOf(Math.max(...prediction));
        const expectedClass = data.output.indexOf(1);
        
        if (predictedClass === expectedClass) {
          correct++;
          // Count true positives for each class
          switch(predictedClass) {
            case 0: confusionMatrix.fit.tp++; break;
            case 1: confusionMatrix.average.tp++; break;
            case 2: confusionMatrix.unfit.tp++; break;
          }
        } else {
          // Count false positives and negatives
          switch(predictedClass) {
            case 0: confusionMatrix.fit.fp++; break;
            case 1: confusionMatrix.average.fp++; break;
            case 2: confusionMatrix.unfit.fp++; break;
          }
          switch(expectedClass) {
            case 0: confusionMatrix.fit.fn++; break;
            case 1: confusionMatrix.average.fn++; break;
            case 2: confusionMatrix.unfit.fn++; break;
          }
        }
      });

      const accuracy = correct / total;

      // Calculate macro-averaged metrics
      const metrics = ['fit', 'average', 'unfit'].map(cls => {
        const tp = confusionMatrix[cls as keyof typeof confusionMatrix].tp;
        const fp = confusionMatrix[cls as keyof typeof confusionMatrix].fp;
        const fn = confusionMatrix[cls as keyof typeof confusionMatrix].fn;
        return {
          precision: tp / (tp + fp) || 0,
          recall: tp / (tp + fn) || 0
        };
      });

      const precision = metrics.reduce((sum, m) => sum + m.precision, 0) / 3;
      const recall = metrics.reduce((sum, m) => sum + m.recall, 0) / 3;
      const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

      return {
        accuracy,
        precision,
        recall,
        f1Score
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return { accuracy: 0, precision: 0, recall: 0, f1Score: 0 };
    }
  }
}