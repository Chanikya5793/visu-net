import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainingOptions } from '../TrainerInterface';
import { fitnessData } from './data';

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

  // Enhanced weight normalization method
  normalizeWeights(): void {
    const networkState = this.network.toJSON();
    
    networkState.layers.forEach((layer: any, layerIdx: number) => {
      if (!layer.weights) return;

      // Calculate layer-wise statistics
      const allWeights = layer.weights.flat();
      const globalMean = allWeights.reduce((sum: number, w: number) => sum + w, 0) / allWeights.length;
      const globalStd = Math.sqrt(
        allWeights.reduce((sum: number, w: number) => sum + Math.pow(w - globalMean, 2), 0) / allWeights.length
      );

      layer.weights.forEach((neuronWeights: number[], neuronIdx: number) => {
        // Calculate neuron-specific statistics
        const mean = neuronWeights.reduce((sum: number, w: number) => sum + w, 0) / neuronWeights.length;
        const variance = neuronWeights.reduce((sum: number, w: number) => sum + Math.pow(w - mean, 2), 0) / neuronWeights.length;
        const localStd = Math.sqrt(variance);

        if (localStd > 0) {
          // Normalize weights while preserving relative importance
          const targetMean = globalMean * 0.1; // Reduce mean to prevent saturation
          const targetStd = globalStd * (0.8 + 0.4 * Math.sin(neuronIdx * Math.PI / layer.weights.length));
          
          layer.weights[neuronIdx] = neuronWeights.map((w: number, idx: number) => {
            const normalized = (w - mean) / localStd;
            const scaled = normalized * targetStd + targetMean;
            const position = idx / neuronWeights.length;
            return scaled * (0.9 + 0.2 * Math.sin(position * Math.PI));
          });
        } else {
          // Initialize with small random variations if all weights are the same
          const baseValue = mean * 0.1;
          layer.weights[neuronIdx] = neuronWeights.map((_: number, idx: number) => {
            const position = idx / neuronWeights.length;
            return baseValue + (Math.random() * 0.02 - 0.01) * Math.sin(position * Math.PI);
          });
        }
      });

      // Adjust biases to maintain activation distribution
      if (layer.biases) {
        const layerScale = 0.8 + 0.4 * Math.sin(layerIdx * Math.PI / networkState.layers.length);
        layer.biases = layer.biases.map((_: number, idx: number) => {
          const position = idx / layer.biases.length;
          return 0.01 * layerScale * Math.sin(position * Math.PI);
        });
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
    this.activations = networkState.layers.map((layer: any) => {
      if (layer.biases) {
        return layer.biases.map((_: any, i: number) => {
          const weights = layer.weights[i] || [];
          // Improved activation calculation with proper scaling
          const weightedSum = weights.reduce((sum: number, w: number, idx: number) => {
            const input = this.activations[this.activations.length - 1]?.[idx] || 0;
            return sum + w * input;
          }, 0) + layer.biases[i];
          
          // Leaky ReLU with slightly increased slope for negative values
          return weightedSum > 0 ? weightedSum : 0.02 * weightedSum;
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
        return sum + (isFinite(w) ? w : 0);
      }, 0) / weights.length;

      // Calculate variance with numerical stability
      const variance = weights.reduce((sum: number, w: number) => {
        const diff = isFinite(w) ? w - mean : 0;
        return sum + diff * diff;
      }, 0) / weights.length;

      return {
        mean: isFinite(mean) ? mean : 0,
        std: Math.sqrt(isFinite(variance) ? variance + 1e-10 : 1),
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

    // Calculate gradients with numerical stability
    for (let layerIndex = 1; layerIndex < networkState.layers.length; layerIndex++) {
      const layer = networkState.layers[layerIndex];
      const prevLayer = networkState.layers[layerIndex - 1];
      const layerGradients: number[][] = [];

      if (layer.weights && prevLayer) {
        // Calculate layer statistics with safety checks
        const weights = layer.weights.flat().filter((w: number) => isFinite(w));
        const mean = weights.length ? 
          weights.reduce((sum: number, w: number) => sum + w, 0) / weights.length : 0;
        const variance = weights.length ? 
          weights.reduce((sum: number, w: number) => sum + Math.pow(w - mean, 2), 0) / weights.length : 1;
        const std = Math.sqrt(variance + 1e-10);
        
        // For each neuron in current layer
        layer.weights.forEach((neuronWeights: number[], toNeuron: number) => {
          const neuronGradients: number[] = [];
          const toActivation = this.activations[layerIndex]?.[toNeuron] || 0;
          
          // For each connection from previous layer
          neuronWeights.forEach((weight: number, fromNeuron: number) => {
            if (!isFinite(weight)) {
              neuronGradients.push(0);
              return;
            }

            const fromActivation = this.activations[layerIndex - 1]?.[fromNeuron] || 0;
            
            // Calculate gradient components with safety checks
            const activationGradient = isFinite(toActivation) ? 
              (toActivation > 0 ? 1 : 0.02) : 0;
            const scaledWeight = (weight - mean) / std;
            const weightGradient = fromActivation * activationGradient * 
              (isFinite(scaledWeight) ? scaledWeight : 0);
            
            // Store gradient
            neuronGradients.push(isFinite(weightGradient) ? weightGradient : 0);
            totalGradientSquared += weightGradient * weightGradient;
          });
          
          layerGradients.push(neuronGradients);
        });
      }
      
      this.gradients.push(layerGradients);
    }

    // Calculate gradient norm with safety check
    this.gradientNorm = Math.sqrt(isFinite(totalGradientSquared) ? totalGradientSquared : 0);
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