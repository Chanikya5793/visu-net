import * as brain from 'brain.js';
import { BrainJsTrainingOptions, ITrainer, PerformanceMetrics, TrainingData, TrainingOptions } from '../TrainerInterface';
import { weatherData } from './data';

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
  private trainingData: TrainingData[];
  private gradientNorm: number = 0;
  private stoppedTriggered: boolean = false; // NEW flag

  constructor(customDataset?: any[]) {
    this.trainingData = customDataset || weatherData.training;
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

  private updateActivations(): void {
    const networkState = this.network.toJSON();
    const currentInput = this.trainingData[this.currentEpoch % this.trainingData.length]?.input || [];

    this.activations = networkState.layers.map((layer: any, layerIndex: number) => {
      if (layerIndex === 0) {
        return currentInput;
      }

      if (layer.biases) {
        return layer.biases.map((_: any, i: number) => {
          const weights = layer.weights[i] || [];
          const prevActivations = this.activations[layerIndex - 1] || [];
          
          const weightedSum = weights.reduce((sum: number, w: number, idx: number) => {
            const input = prevActivations[idx] || 0;
            return sum + w * input;
          }, 0) + layer.biases[i];
          
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
    
    this.weights = networkState.layers.map((layer: any) => 
      (layer.weights || []).map((row: number[]) => [...row])
    );
  
    this.biases = networkState.layers.map((layer: any) => 
      (layer.biases || []).map((b: number) => b)
    );
    
    this.calculateGradients();
  }

  private validateOnSet(data: TrainingData[]): number {
    let totalError = 0;
    for (const item of data) {
      const output = this.network.run(item.input);
      const error = output.reduce((sum: number, val: number, idx: number) => {
        return sum + Math.pow(val - item.output[idx], 2);
      }, 0);
      totalError += error;
    }
    return totalError / data.length;
  }

  getProgress(): { currentEpoch: number; totalEpochs: number; lastError: number; isTraining: boolean; gradientNorm?: number } {
    return {
      currentEpoch: this.currentEpoch,
      totalEpochs: this.totalEpochs,
      lastError: this.lastError,
      isTraining: this.isTraining,
      gradientNorm: this.gradientNorm
    };
  }

  predict(input: number[]): number[] {
    const output = this.network.run(input);
    return Array.isArray(output) ? output : [output];
  }

  stop(): void {
    this.isTraining = false;
    this.isPaused = false;
    this.trainingState = null;
    this.stoppedTriggered = true; // mark that stop has been triggered
  }

  reset(): void {
    this.stop();
    this.currentEpoch = 0;
    this.totalEpochs = 0;
    this.lastError = 1;
    this.isTraining = false;
    this.isPaused = false;
    this.stoppedTriggered = false; // reset flag
    this.initNetwork();
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

      // Handle validation split
      const validationSplit = options.validationSplit || 0.2;
      const splitIndex = Math.floor(this.trainingData.length * (1 - validationSplit));
      const trainingSet = this.trainingData.slice(0, splitIndex);
      const validationSet = this.trainingData.slice(splitIndex);

      // Early stopping setup
      let bestError = Infinity;
      let patienceCounter = 0;
      const patience = options.earlyStoppingPatience || 10;

      this.isTraining = true;
      const networkState = this.network.toJSON();
      const initialLearningRate = this.learningRate;
      let consecutiveNaNCount = 0;
      const maxConsecutiveNaN = 3;

      const brainJsOptions: BrainJsTrainingOptions = {
        iterations: this.totalEpochs,
        errorThresh: 0.0000000000000000000001,
        log: true,
        logPeriod: 1,
        learningRate: this.learningRate,
        batchSize: options.batchSize,
        callback: (stats: { iterations: number; error: number }) => {
          if (this.stoppedTriggered) return true; // if stop already triggered, exit

          this.currentEpoch = stats.iterations;
          this.lastError = stats.error;

          if (!this.isTraining) {
            if (!this.stoppedTriggered) { 
              options.onStop?.();
              this.stoppedTriggered = true;
            }
            return true;
          }

          if (this.isPaused) {
            this.trainingState = this.network.toJSON();
            options.onPause?.();
            return true;
          }

          if (isNaN(stats.error) || stats.error > 1e6) {
            consecutiveNaNCount++;
            if (consecutiveNaNCount >= maxConsecutiveNaN) {
              this.network.fromJSON(this.trainingState || networkState);
              this.setLearningRate(initialLearningRate * 0.1);
              consecutiveNaNCount = 0;
            } else {
              this.setLearningRate(this.learningRate * 0.5);
            }
            return false;
          }

          this.updateActivations();
          this.updateNetworkState();
          options.onIteration?.(this.currentEpoch, stats.error);
          
          // Validate on validation set
          const validationError = this.validateOnSet(validationSet);
          
          // Early stopping check — only stop if the best error isn’t already nearly 0
          if (validationError < bestError) {
            bestError = validationError;
            patienceCounter = 0;
            this.trainingState = this.network.toJSON(); // Save best model
          } else {
            patienceCounter++;
            // Only trigger early stopping if the best error is significantly above 0
            if (patienceCounter >= patience && bestError > 1e-10) {
              if (!this.stoppedTriggered) {
                options.onStop?.('Early stopping triggered: No improvement in validation error');
                this.stoppedTriggered = true;
              }
              return true;
            }
          }

          if (this.currentEpoch >= this.totalEpochs) {
            this.isTraining = false;
            options.onComplete?.();
            return true;
          }
          
          return false;
        }
      };

      await this.network.trainAsync(trainingSet, brainJsOptions);
    } catch (error) {
      this.isTraining = false;
      if (error instanceof Error) {
        console.error('Training error:', error);
        options.onStop?.(error.message);
      }
    }
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

    const dummyData = {
      input: Array(inputSize).fill(0).map(() => (Math.random() * 2 - 1) * 0.1),
      output: Array(outputSize).fill(0).map(() => Math.random() * 0.1)
    };

    this.network.train([dummyData], {
      iterations: 1,
      errorThresh: 0.000000000000000000001,
      log: false
    });

    const networkState = this.network.toJSON();
    this.updateNetworkState();
  }

  normalizeWeights(): void {
    const networkState = this.network.toJSON();
    
    networkState.layers.forEach((layer: any, layerIdx: number) => {
      if (!layer.weights || !layer.weights[0]) return;

      const allWeights = layer.weights.flat();
      const mean = allWeights.reduce((sum: number, w: number) => sum + w, 0) / allWeights.length;
      const variance = allWeights.reduce((sum: number, w: number) => sum + Math.pow(w - mean, 2), 0) / allWeights.length;
      const std = Math.sqrt(variance + 1e-10);

      const layerScale = Math.sqrt(2.0 / (layer.weights.length + layer.weights[0].length));
      const depthScale = 1.0 / Math.sqrt(networkState.layers.length - layerIdx);

      layer.weights.forEach((neuronWeights: number[], neuronIdx: number) => {
        const neuronMean = neuronWeights.reduce((sum: number, w: number) => sum + w, 0) / neuronWeights.length;
        const neuronStd = Math.sqrt(
          neuronWeights.reduce((sum: number, w: number) => sum + Math.pow(w - neuronMean, 2), 0) / neuronWeights.length + 1e-10
        );

        layer.weights[neuronIdx] = neuronWeights.map((w: number) => {
          const normalized = (w - neuronMean) / neuronStd;
          return normalized * layerScale * depthScale;
        });
      });

      if (layer.biases) {
        layer.biases = layer.biases.map(() => 0.01 * depthScale);
      }
    });

    this.network.fromJSON(networkState);
    this.updateNetworkState();
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
      this.normalizeWeights();
    }
  }

  setLearningRate(rate: number): void {
    this.learningRate = Math.min(Math.max(rate, 0.001), 1.0);
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
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0
      };
    }

    try {
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