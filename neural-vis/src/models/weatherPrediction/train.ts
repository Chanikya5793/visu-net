import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainingOptions } from '../TrainerInterface';
import { weatherData } from './data';

// Add at the top of the file after imports
interface LayerStats {
  mean: number;
  std: number;
  size: number;
}

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
  private gradients: number[][][] = [];
  private learningRate: number = 0.01;
  private trainingData: any[];
  private gradientNorm: number = 0;

  constructor(customDataset?: any[]) {
    this.trainingData = customDataset || weatherData.training;
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

  private calculateLayerStatistics(networkState: any): LayerStats[] {
    return networkState.layers.map((layer: any) => {
      if (!layer.weights || !layer.weights.length) return {
        mean: 0,
        std: 1,
        size: 0
      };
      
      const weights: number[] = layer.weights.flat().filter((w: number) => Number.isFinite(w));
      if (!weights.length) return {
        mean: 0,
        std: 1,
        size: 0
      };

      const mean = weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length;
      const variance = weights.reduce((sum: number, w: number) => 
        sum + Math.pow(w - mean, 2), 0) / weights.length;

      return {
        mean: Number.isFinite(mean) ? mean : 0,
        std: Math.sqrt(Number.isFinite(variance) ? variance + 1e-10 : 1),
        size: layer.weights[0]?.length || 0
      };
    });
  }
  
  getNetwork(): brain.NeuralNetwork {
    return this.network;
  }

  initNetwork(layers?: number[]): void {
    const inputSize = this.trainingData[0].input.length;
    const outputSize = this.trainingData[0].output.length;
    const layerSize = layers?.[0] || Math.max(4, Math.ceil((inputSize + outputSize) / 2));
    
    this.network = new brain.NeuralNetwork({
      hiddenLayers: layers || [layerSize],
      activation: 'leaky-relu',
      learningRate: this.learningRate
    });

    // Initialize with balanced data distribution
    const dummyData = {
      input: Array(inputSize).fill(0).map(() => Math.random() * 2 - 1),
      output: Array(outputSize).fill(0)
    };
    this.network.train([dummyData], {
      iterations: 1,
      errorThresh: 0.01,
      log: false
    });

    // Enhanced Xavier/Glorot initialization with layer-specific scaling
    const networkState = this.network.toJSON();
    networkState.layers.forEach((layer: any, idx: number) => {
      if (!layer.weights) return;

      // Calculate fan in/out with improved connectivity
      const fanIn = idx === 0 ? inputSize : 
        (networkState.layers[idx - 1]?.weights?.[0]?.length || inputSize);
      const fanOut = layer.weights[0]?.length || outputSize;
      
      // Layer-specific scaling factors
      const scale = Math.sqrt(2.0 / (fanIn + fanOut));
      const layerPosition = idx / (networkState.layers.length - 1); // 0 to 1
      const positionScale = 0.8 + 0.4 * Math.sin(layerPosition * Math.PI); // Varies between 0.8 and 1.2

      // Initialize weights with position-dependent scaling
      layer.weights = layer.weights.map((neuronWeights: number[], neuronIdx: number) => {
        const neuronPosition = neuronIdx / layer.weights.length;
        const neuronScale = scale * positionScale * (0.9 + 0.2 * Math.cos(neuronPosition * Math.PI));
        
        return neuronWeights.map((_, inputIdx: number) => {
          const inputPosition = inputIdx / neuronWeights.length;
          const connectionStrength = 0.8 + 0.4 * Math.sin((inputPosition + neuronPosition) * Math.PI);
          return (Math.random() * 2 - 1) * neuronScale * connectionStrength;
        });
      });

      // Initialize biases with position-dependent values
      if (layer.biases) {
        layer.biases = layer.biases.map((_: any, i: number) => {
          const position = i / layer.biases.length;
          return 0.01 * Math.sin(position * Math.PI);
        });
      }
    });

    this.network.fromJSON(networkState);
    this.updateNetworkState();
  }

  normalizeWeights(): void {
    const networkState = this.network.toJSON();
    
    networkState.layers.forEach((layer: any, layerIdx: number) => {
      if (!layer.weights || !layer.weights[0]) return;

      // Calculate layer-wise statistics with improved stability
      const allWeights = layer.weights.flat();
      const mean = allWeights.reduce((sum: number, w: number) => sum + w, 0) / allWeights.length;
      const variance = allWeights.reduce((sum: number, w: number) => sum + Math.pow(w - mean, 2), 0) / allWeights.length;
      const std = Math.sqrt(variance + 1e-10);

      // Adaptive scaling factor based on layer position
      const layerScale = Math.sqrt(2.0 / (layer.weights.length + layer.weights[0].length));
      const depthScale = 1.0 / Math.sqrt(networkState.layers.length - layerIdx);

      layer.weights.forEach((neuronWeights: number[], neuronIdx: number) => {
        // Calculate neuron-specific statistics
        const neuronMean = neuronWeights.reduce((sum: number, w: number) => sum + w, 0) / neuronWeights.length;
        const neuronStd = Math.sqrt(
          neuronWeights.reduce((sum: number, w: number) => sum + Math.pow(w - neuronMean, 2), 0) / neuronWeights.length + 1e-10
        );

        // Normalize weights with improved stability
        layer.weights[neuronIdx] = neuronWeights.map((w: number) => {
          const normalized = (w - neuronMean) / neuronStd;
          return normalized * layerScale * depthScale;
        });
      });

      // Initialize biases with small values scaled by layer depth
      if (layer.biases) {
        layer.biases = layer.biases.map(() => 0.01 * depthScale);
      }
    });

    this.network.fromJSON(networkState);
    this.updateNetworkState();
  }

  async train(options: TrainingOptions): Promise<void> {
    try {
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
      const networkState = this.network.toJSON();

      await this.network.trainAsync(this.trainingData, {
        iterations: this.totalEpochs,
        errorThresh: 0.001,
        log: true,
        logPeriod: 1,
        learningRate: this.learningRate,
        callback: (stats: { iterations: number, error: number }) => {
          this.currentEpoch = stats.iterations;
          this.lastError = stats.error;

          if (!this.isTraining) {
            this.isTraining = false;
            options.onStop?.();
            return true;
          }

          if (this.isPaused) {
            this.trainingState = this.network.toJSON();
            options.onPause?.();
            return true;
          }

          // Prevent NaN propagation
          if (isNaN(stats.error)) {
            this.network.fromJSON(this.trainingState || networkState);
            this.setLearningRate(this.learningRate * 0.5);
            return false;
          }

          this.updateActivations();
          this.updateNetworkState();
          options.onIteration?.(this.currentEpoch, stats.error);
          
          if (this.currentEpoch >= this.totalEpochs) {
            this.isTraining = false;
            options.onComplete?.();
            return true;
          }
          
          return false;
        }
      });

    } catch (error: unknown) {
      this.isTraining = false;
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
    const output = this.network.run(input);
    // First normalize the output to be between 0 and 1
    const normalizedOutput = output.map(value => Math.min(Math.max(value, 0), 1));
    // Then scale to percentage (0-100)
    return normalizedOutput.map(value => value * 100);
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
    this.activations = networkState.layers.map((layer: any, layerIndex: number) => {
      if (layer.biases) {
        return layer.biases.map((_: any, i: number) => {
          const weights = layer.weights[i] || [];
          const prevActivations = this.activations[this.activations.length - 1] || [];
          
          // Improved weighted sum calculation
          const weightedSum = weights.reduce((sum: number, w: number, idx: number) => {
            const input = prevActivations[idx] || 0;
            return sum + w * input;
          }, 0) + layer.biases[i];
          
          // Use sigmoid for output layer, leaky ReLU for hidden layers
          if (layerIndex === networkState.layers.length - 1) {
            return 1 / (1 + Math.exp(-weightedSum)); // sigmoid
          }
          return weightedSum > 0 ? weightedSum : 0.01 * weightedSum; // leaky ReLU
        });
      }
      return [];
    });
  }

  private updateNetworkState(): void {
    const networkState = this.network.toJSON();
    const layerStats = this.calculateLayerStatistics(networkState);
    
    this.activations = [
      (networkState.layers[0].weights[0] || []).map((w: number) => {
        const stats = layerStats[0];
        return Number.isFinite(w) ? w / (stats.std + 1e-6) : 0;
      }),
      ...networkState.layers.map((layer: any, idx: number) => {
        if (layer.biases) {
          const stats = layerStats[idx];
          return layer.biases.map((_: any, i: number) => {
            const weights = layer.weights[i] || [];
            const scaledSum = weights.reduce((sum: number, w: number) => {
              const scaled = Number.isFinite(w) ? w / (stats.std + 1e-6) : 0;
              return Number.isFinite(sum + scaled) ? sum + scaled : sum;
            }, 0);
            const weightedSum = Number.isFinite(scaledSum + layer.biases[i]) ? 
              scaledSum + layer.biases[i] : scaledSum;
            return weightedSum > 0 ? weightedSum : 0.02 * weightedSum;
          });
        }
        return [];
      })
    ];
  
    this.weights = networkState.layers.map((layer: any, idx: number) => 
      (layer.weights || []).map((row: number[]) => 
        row.map((w: number) => {
          const stats = layerStats[idx];
          return Number.isFinite(w) ? w / (stats.std + 1e-6) : 0;
        })
      )
    );
  
    this.biases = networkState.layers.map((layer: any) => 
      (layer.biases || []).map((b: number) => Number.isFinite(b) ? b : 0)
    );
    
    this.calculateGradients();
  }

  private calculateGradients(): void {
    const networkState = this.network.toJSON();
    this.gradients = [];
    let totalGradientSquared = 0;

    for (let layerIndex = 1; layerIndex < networkState.layers.length; layerIndex++) {
      const layer = networkState.layers[layerIndex];
      const prevLayer = networkState.layers[layerIndex - 1];
      const layerGradients: number[][] = [];

      if (layer.weights && prevLayer) {
        const isOutputLayer = layerIndex === networkState.layers.length - 1;
        const depthScale = 1.0 / Math.sqrt(networkState.layers.length - layerIndex);
        
        layer.weights.forEach((neuronWeights: number[], toNeuron: number) => {
          const neuronGradients: number[] = [];
          const toActivation = this.activations[layerIndex]?.[toNeuron] || 0;
          
          neuronWeights.forEach((weight: number, fromNeuron: number) => {
            const fromActivation = this.activations[layerIndex - 1]?.[fromNeuron] || 0;
            
            // Different gradient calculation for output layer
            let activationGradient;
            if (isOutputLayer) {
              activationGradient = toActivation * (1 - toActivation); // sigmoid derivative
            } else {
              activationGradient = toActivation > 0 ? 1 : 0.01; // leaky ReLU derivative
            }
            
            const weightGradient = fromActivation * activationGradient * depthScale;
            const clippedGradient = Math.max(Math.min(weightGradient, 1.0), -1.0);
            neuronGradients.push(clippedGradient);
            totalGradientSquared += clippedGradient * clippedGradient;
          });
          
          layerGradients.push(neuronGradients);
        });
      }
      this.gradients.push(layerGradients);
    }

    this.gradientNorm = Math.sqrt(totalGradientSquared + 1e-10);
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
    this.learningRate = Math.min(Math.max(rate, 0.001), 1.0); // Clamp between 0.001 and 1.0
    const networkState = this.network.toJSON();
    networkState.trainOpts = {
      ...networkState.trainOpts,
      learningRate: this.learningRate
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