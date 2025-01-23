import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainingOptions } from '../TrainerInterface';
import { logicGateData } from './data';

export class LogicGateTrainer implements ITrainer {
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
  private gradients: number[][][] = [];
  private learningRate: number = 0.01;
  private trainingData: any[];

  constructor(customDataset?: any[]) {
    this.trainingData = customDataset || logicGateData.training;
    this.initNetwork();
    // Initialize with valid training options and higher learning rate
    this.network.train(this.trainingData, {
      iterations: 1,
      errorThresh: 0.01,
      log: false,
      learningRate: 0.03  // Increased learning rate
    });
    this.normalizeWeights();  // Initialize weights properly
  }

  getNetwork(): brain.NeuralNetwork {
    return this.network;
  }

  initNetwork(layers?: number[]): void {
    const inputSize = this.trainingData[0].input.length;
    const outputSize = this.trainingData[0].output.length;
    const layerSize = layers?.[0] || 3;
    
    this.network = new brain.NeuralNetwork({
      hiddenLayers: layers || [3],
      activation: 'leaky-relu',
      learningRate: this.learningRate
    });

    // Initialize the network with a single pass
    const dummyData = {
      input: Array(inputSize).fill(0),
      output: Array(outputSize).fill(0)
    };
    this.network.train([dummyData], {
      iterations: 1,
      errorThresh: 0.01,
      log: false
    });

    // Apply Xavier/Glorot initialization
    const networkState = this.network.toJSON();
    networkState.layers.forEach((layer: any, idx: number) => {
      if (!layer.weights) return;

      // Calculate fan in/out safely
      const fanIn = idx === 0 ? inputSize : 
        (networkState.layers[idx - 1]?.weights?.[0]?.length || inputSize);
      const fanOut = layer.weights[0]?.length || outputSize;
      const scale = Math.sqrt(2.0 / (fanIn + fanOut));  // Xavier/Glorot initialization

      // Initialize weights with proper scaling
      layer.weights = layer.weights.map((neuronWeights: number[]) => 
        neuronWeights.map(() => 
          (Math.random() * 2 - 1) * scale
        )
      );

      // Initialize biases to small positive values
      if (layer.biases) {
        layer.biases = layer.biases.map(() => 0.01);
      }
    });

    this.network.fromJSON(networkState);
    this.updateNetworkState();
  }

  // Add weight normalization method
  normalizeWeights(): void {
    const networkState = this.network.toJSON();
    
    networkState.layers.forEach((layer: any) => {
      if (layer.weights) {
        // Calculate layer statistics
        let meanSum = 0;
        let stdSum = 0;
        let count = 0;
        
        // First pass: calculate mean
        layer.weights.forEach((neuronWeights: number[]) => {
          neuronWeights.forEach(w => {
            meanSum += w;
            count++;
          });
        });
        const mean = meanSum / count;
        
        // Second pass: calculate standard deviation
        layer.weights.forEach((neuronWeights: number[]) => {
          neuronWeights.forEach(w => {
            stdSum += (w - mean) ** 2;
          });
        });
        const std = Math.sqrt(stdSum / count);
        
        // Normalize weights while preserving distribution
        layer.weights = layer.weights.map((neuronWeights: number[]) =>
          neuronWeights.map(w => (w - mean) / (std + 1e-8))
        );
      }
    });

    this.network.fromJSON(networkState);
    this.updateNetworkState();
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
    this.network.train(logicGateData.training, {
      iterations: 1,
      errorThresh: 0.01, // Changed from 1 to a valid value
      log: false
    });
  }

  predict(input: number[]): number[] {
    const output = this.network.run(input);
    // Return raw output array since we now have multiple output neurons
    return output;
  }

  // Add helper method to interpret output
  interpretOutput(output: number[]): number {
    // Find index of highest activation
    const maxIndex = output.indexOf(Math.max(...output));
    return maxIndex === 0 ? 1 : 0;
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
      lastError: Number.isFinite(this.lastError) ? this.lastError : 0,
      isPaused: this.isPaused,
      isTraining: this.isTraining
    };
  }

  private updateActivations(): void {
    const networkState = this.network.toJSON();
    
    // Calculate layer statistics with numerical stability checks
    const layerStats = networkState.layers.map((layer: any) => {
      if (!layer.weights) return null;
      const weights = layer.weights.flat().filter((w: number) => Number.isFinite(w));
      if (weights.length === 0) return { mean: 0, stdDev: 1 };
      
      const mean = weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length;
      const variance = weights.reduce((sum: number, w: number) => sum + Math.pow(w - mean, 2), 0) / weights.length;
      const stdDev = Math.sqrt(Math.max(variance, 1e-7));
      return { mean, stdDev };
    });

    this.activations = networkState.layers.map((layer: any, layerIndex: number) => {
      if (layer.biases) {
        const stats = layerStats[layerIndex] || { mean: 0, stdDev: 1 };
        const scaleFactor = 1.0 / Math.max(stats.stdDev, 1e-7);
        
        return layer.biases.map((_: any, i: number) => {
          const weights = layer.weights[i] || [];
          const weightedSum = weights.reduce((sum: number, w: number) => {
            return Number.isFinite(w) ? sum + w * scaleFactor : sum;
          }, 0) + (Number.isFinite(layer.biases[i]) ? layer.biases[i] : 0);
          
          // Safe leaky ReLU with bounds checking
          const slope = weightedSum > 0 ? 1 : 0.02;
          return Number.isFinite(weightedSum) ? slope * weightedSum : 0;
        });
      }
      return [];
    });
  }

  private updateNetworkState(): void {
    const networkState = this.network.toJSON();
    
    // Calculate layer-wise statistics with safety checks
    const layerStats = this.calculateLayerStatistics(networkState);
    
    this.activations = [
      (networkState.layers[0].weights[0] || []).map((w: number) => 
        Number.isFinite(w) ? w : 0
      ),
      ...networkState.layers.map((layer: any, layerIndex: number) => {
        if (layer.biases) {
          const stats = layerStats[layerIndex] || { mean: 0, stdDev: 1 };
          const scaleFactor = 1.0 / Math.max(stats.stdDev, 1e-7);
          
          return layer.biases.map((_: any, i: number) => {
            const weights = layer.weights[i] || [];
            const weightedSum = weights.reduce((sum: number, w: number) => 
              Number.isFinite(w) ? sum + w * scaleFactor : sum, 0) + 
              (Number.isFinite(layer.biases[i]) ? layer.biases[i] : 0);
            
            const slope = weightedSum > 0 ? 1 : 0.02;
            return Number.isFinite(weightedSum) ? slope * weightedSum : 0;
          });
        }
        return [];
      })
    ];

    this.weights = networkState.layers.map((layer: any) => layer.weights || []);
    this.biases = networkState.layers.map((layer: any) => layer.biases || []);
    
    this.calculateGradients(layerStats);
  }

  private calculateGradients(layerStats: Array<{ mean: number; stdDev: number } | null>): void {
    const networkState = this.network.toJSON();
    this.gradients = [];
    let totalGradientSquared = 0;

    // Calculate scaled gradients using layer statistics
    for (let layerIndex = 1; layerIndex < networkState.layers.length; layerIndex++) {
      const layer = networkState.layers[layerIndex];
      const prevLayer = networkState.layers[layerIndex - 1];
      const stats = layerStats[layerIndex];
      const scaleFactor = stats ? 1.0 / (stats.stdDev || 1.0) : 1.0;

      const layerGradients: number[][] = [];

      if (layer.weights && prevLayer) {
        // For each neuron in current layer
        layer.weights.forEach((neuronWeights: number[], toNeuron: number) => {
          const neuronGradients: number[] = [];
          const toActivation = this.activations[layerIndex][toNeuron];
          
          // For each connection from previous layer
          neuronWeights.forEach((weight: number, fromNeuron: number) => {
            const fromActivation = this.activations[layerIndex - 1][fromNeuron];
            
            // Calculate gradient components
            const activationGradient = toActivation > 0 ? 1 : 0.01;  // Derivative of leaky ReLU
            const weightGradient = fromActivation * activationGradient;
            
            // Store gradient
            neuronGradients.push(weightGradient);
            totalGradientSquared += weightGradient * weightGradient;
          });
          
          layerGradients.push(neuronGradients);
        });
      }
      
      this.gradients.push(layerGradients);
    }
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

  getGradients(): number[][][] {
    return this.gradients;
  }

  adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void {
    const networkState = this.network.toJSON();
    
    if (networkState.layers[layerIndex] && 
        networkState.layers[layerIndex].weights[toNeuron]) {
      networkState.layers[layerIndex].weights[toNeuron][fromNeuron] = newWeight;
      this.network.fromJSON(networkState);
      this.updateNetworkState();
      this.normalizeWeights();  // Normalize after weight adjustment
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
      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;

      this.trainingData.forEach(data => {
        const prediction = this.predict(data.input);
        const predictedClass = prediction.indexOf(Math.max(...prediction));
        const expectedClass = data.output.indexOf(1);

        if (predictedClass === expectedClass) {
          correct++;
        }
        if (predictedClass === 0 && expectedClass === 0) truePositives++;
        if (predictedClass === 0 && expectedClass === 1) falsePositives++;
        if (predictedClass === 1 && expectedClass === 0) falseNegatives++;
      });

      const total = this.trainingData.length;
      const accuracy = correct / total;
      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

      return { accuracy, precision, recall, f1Score };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return { accuracy: 0, precision: 0, recall: 0, f1Score: 0 };
    }
  }

  private calculateLayerStatistics(networkState: any): Array<{ mean: number; stdDev: number } | null> {
    return networkState.layers.map((layer: any) => {
      if (!layer.weights) return null;
      const weights = layer.weights.flat();
      const mean = weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length;
      const variance = weights.reduce((sum: number, w: number) => sum + (w - mean) ** 2, 0) / weights.length;
      return { mean, stdDev: Math.sqrt(variance) };
    });
  }
}