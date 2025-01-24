import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainingOptions } from '../TrainerInterface';
import { fitnessData } from './data';

// Add at the top of the file after imports
interface LayerStats {
  mean: number;
  std: number;
  size: number;
}
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
  private gradients: number[][][] = [];  // Store gradients for each weight
  private learningRate: number = 0.01;
  private trainingData: any[];
  private gradientNorm: number = 0;  // Track overall gradient magnitude

  constructor(customDataset?: any[]) {
    this.trainingData = customDataset || fitnessData.training;
    this.initNetwork();
    // Initialize with valid training options and higher learning rate
    this.network.train(this.trainingData, {
      iterations: 1,
      errorThresh: 0.0000000000000000000001,
      log: false,
      learningRate: 0.01  // Increased learning rate
    });
    this.normalizeWeights();  // Initialize weights properly
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
      const positionScale = 0.9 + 0.2 * Math.sin(layerPosition * Math.PI); // Reduced variation (0.9 to 1.1)
      
      // Initialize weights with position-dependent scaling
      layer.weights = layer.weights.map((neuronWeights: number[], neuronIdx: number) => {
        const neuronPosition = neuronIdx / layer.weights.length;
        const neuronScale = scale * positionScale * (0.95 + 0.1 * Math.cos(neuronPosition * Math.PI)); // Reduced variation
        
        return neuronWeights.map((_, inputIdx: number) => {
          const inputPosition = inputIdx / neuronWeights.length;
          const connectionStrength = 0.9 + 0.2 * Math.sin((inputPosition + neuronPosition) * Math.PI); // Increased base strength
          const weight = (Math.random() * 2 - 1) * neuronScale * connectionStrength;
          return weight === 0 ? 0.01 : weight; // Ensure no zero weights
        });
      });
      
      // Initialize biases with improved position-dependent values
      if (layer.biases) {
        layer.biases = layer.biases.map((_: any, i: number) => {
          const position = i / layer.biases.length;
          // Use a combination of sine and cosine for more varied initialization
          const baseBias = 0.2 * (Math.sin(position * Math.PI) + Math.cos(position * Math.PI * 0.5));
          // Add small random variation
          return baseBias + (Math.random() * 0.1 - 0.05); // Base bias + random noise
        });
      }
    });

    this.network.fromJSON(networkState);
    this.updateNetworkState();
  }

  // Enhanced weight normalization method
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
      const initialLearningRate = this.learningRate;
      let consecutiveNaNCount = 0;
      const maxConsecutiveNaN = 3;

      await this.network.trainAsync(this.trainingData, {
        iterations: this.totalEpochs,
        errorThresh: 0.0000000000000000000001,
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

          // Enhanced loss explosion detection and handling
          if (isNaN(stats.error) || stats.error > 1e6) {
            consecutiveNaNCount++;
            if (consecutiveNaNCount >= maxConsecutiveNaN) {
              // Reset to last known good state and significantly reduce learning rate
              this.network.fromJSON(this.trainingState || networkState);
              this.setLearningRate(initialLearningRate * 0.1);
              consecutiveNaNCount = 0;
              console.warn('Loss explosion detected. Resetting network state and reducing learning rate.');
            } else {
              // Temporary recovery attempt with reduced learning rate
              this.setLearningRate(this.learningRate * 0.5);
            }
            return false;
          }

          // Learning rate adaptation based on error trends
          if (this.currentEpoch > 1 && stats.error < this.lastError * 0.95) {
            // Gradual learning rate increase if error is consistently decreasing
            this.setLearningRate(Math.min(this.learningRate * 1.05, 0.9));
          } else if (stats.error > this.lastError * 1.1) {
            // Quick learning rate reduction if error increases significantly
            this.setLearningRate(this.learningRate * 0.5);
          }

          consecutiveNaNCount = 0; // Reset counter on successful iteration
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
      errorThresh: 0.0000000000000000000001, // Changed from 1 to a valid value
      log: false
    });
  }

  predict(input: number[]): number[] {
    const output = this.network.run(input);
    // Normalize outputs to ensure they sum to 1 for proper probability distribution
    const sum = output.reduce((a, b) => a + b, 0);
    return output.map(value => value / (sum || 1));
  }

  getProgress(): {
    currentEpoch: number;
    totalEpochs: number;
    lastError: number;
    isPaused: boolean;
    isTraining: boolean;
    gradientNorm: number;
  } {
    return {
      currentEpoch: this.currentEpoch,
      totalEpochs: this.totalEpochs,
      lastError: this.lastError,
      isPaused: this.isPaused,
      isTraining: this.isTraining,
      gradientNorm: this.gradientNorm
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
    
    // Calculate layer-wise statistics with safeguards against NaN
    const layerStats = networkState.layers.map((layer: any) => {
      if (!layer.weights || !layer.weights.length) return {
        mean: 0,
        std: 1,
        size: 0
      };
      
      const weights = layer.weights.flat();
      if (!weights.length) return {
        mean: 0,
        std: 1,
        size: 0
      };

      // Calculate mean with numerical stability
      const mean = weights.reduce((sum: number, w: number) => {
        return sum + (Number.isFinite(w) ? w : 0);
      }, 0) / weights.length;

      // Calculate variance with numerical stability
      const variance = weights.reduce((sum: number, w: number) => {
        const diff = Number.isFinite(w) ? w - mean : 0;
        return sum + diff * diff;
      }, 0) / weights.length;

      return {
        mean: Number.isFinite(mean) ? mean : 0,
        std: Math.sqrt(Number.isFinite(variance) ? variance + 1e-10 : 1),
        size: layer.weights[0]?.length || 0
      };
    });

    // Initialize activations with improved numerical stability
    this.activations = [
      // Input layer with safe scaling
      networkState.layers[0].weights[0]?.map((w: number) => {
        const stats = layerStats[0];
        if (!stats || !isFinite(w)) return 0;
        const scaledValue = (w - stats.mean) / stats.std;
        return isFinite(scaledValue) ? scaledValue * 0.1 : 0;
      }) || [],
      
      // Hidden and output layers with safe scaling
      ...networkState.layers.map((layer: any, idx: number) => {
        if (!layer.biases) return [];

        const stats = layerStats[idx];
        const prevStats = layerStats[Math.max(0, idx - 1)];
        
        return layer.biases.map((_: any, i: number) => {
          const weights = layer.weights[i] || [];
          
          // Calculate weighted sum with numerical stability
          const weightedSum = weights.reduce((sum: number, w: number, weightIdx: number) => {
            const prevActivation = this.activations[this.activations.length - 1]?.[weightIdx] || 0;
            if (!isFinite(w) || !isFinite(prevActivation)) return sum;
            
            const scaledWeight = stats ? (w - stats.mean) / stats.std : w;
            return sum + (isFinite(scaledWeight) ? scaledWeight * prevActivation : 0);
          }, 0) + (isFinite(layer.biases[i]) ? layer.biases[i] : 0);

          // Apply scaled leaky ReLU with safety checks
          const scale = Math.sqrt(1.0 / (prevStats?.size || 1));
          const scaledOutput = weightedSum * scale;
          return isFinite(scaledOutput) ? 
            (scaledOutput > 0 ? scaledOutput : 0.02 * scaledOutput) : 0;
        });
      })
    ];

    // Store weights and biases with safety checks
    this.weights = networkState.layers.map((layer: any) => 
      (layer.weights || []).map((row: number[]) => 
        row.map((w: number) => isFinite(w) ? w : 0)
      )
    );
    this.biases = networkState.layers.map((layer: any) => 
      (layer.biases || []).map((b: number) => isFinite(b) ? b : 0)
    );
    
    // Calculate gradients
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
    // Implement more conservative learning rate bounds
    const minRate = 0.0001;
    const maxRate = 0.9;
    const clampedRate = Math.min(Math.max(rate, minRate), maxRate);
    
    // Smooth learning rate changes
    const currentRate = this.learningRate;
    const smoothingFactor = 0.9;
    this.learningRate = currentRate * smoothingFactor + clampedRate * (1 - smoothingFactor);

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