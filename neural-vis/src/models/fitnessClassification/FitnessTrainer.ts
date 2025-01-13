// src/models/fitnessModel/FitnessTrainer.ts

import { NeuralNetwork } from 'brain.js';
import { ITrainer, TrainingOptions, TrainerProgress, PerformanceMetrics } from '../TrainerInterface';
import { fitnessModelConfig as config } from './config';

export class FitnessTrainer implements ITrainer {
  private network!: NeuralNetwork;
  private customDataset?: any[];
  private isTraining: boolean = false;
  private currentEpoch: number = 0;
  private lastError: number = 1;

  constructor(customDataset?: any[]) {
    this.customDataset = customDataset;
    this.initNetwork();
  }

  initNetwork(layers?: number[]) {
    this.network = new NeuralNetwork({
      hiddenLayers: layers ? layers.slice(1, -1) : [8, 6],
      activation: 'sigmoid',
      learningRate: 0.01
    });
  }

  private preprocessInput(data: any): number[] {
    const input = new Array(12).fill(0);
    
    // Heart Rate encoding
    const hrIndex = config.input.heartRateCategories.indexOf(data["Heart Rate (bpm)"]);
    if (hrIndex >= 0) input[hrIndex] = 1;
    
    // BMI encoding
    const bmiIndex = config.input.bmiCategories.indexOf(data.BMI);
    if (bmiIndex >= 0) input[5 + bmiIndex] = 1;
    
    // Stamina encoding
    const staminaIndex = config.input.staminaCategories.indexOf(data["Stamina Level"]);
    if (staminaIndex >= 0) input[9 + staminaIndex] = 1;
    
    return input;
  }

  private preprocessOutput(data: any): number[] {
    const output = new Array(3).fill(0);
    const index = config.output.fitnessCategories.indexOf(data["Fitness Classification"]);
    if (index >= 0) output[index] = 1;
    return output;
  }

  async train(options: TrainingOptions): Promise<void> {
    this.isTraining = true;
    const data = this.customDataset || [];
    
    const trainingData = data.map(item => ({
      input: this.preprocessInput(item),
      output: this.preprocessOutput(item)
    }));

    try {
      const status = await this.network.trainAsync(trainingData, {
        iterations: 1,
        errorThresh: 0.005
      });
      
      this.currentEpoch++;
      this.lastError = status.error || 0;

      if (options.onIteration) {
        options.onIteration(this.currentEpoch, this.lastError);
      }
    } catch (error) {
      console.error('Training error:', error);
    }
  }

  stop(): void {
    this.isTraining = false;
  }

  reset(): void {
    this.initNetwork();
    this.currentEpoch = 0;
    this.lastError = 1;
    this.isTraining = false;
  }

  predict(input: any): number[] {
    const processedInput = this.preprocessInput(input);
    return this.network.run(processedInput);
  }

  getProgress(): TrainerProgress {
    return {
      currentEpoch: this.currentEpoch,
      totalEpochs: 0,
      lastError: this.lastError,
      isTraining: this.isTraining
    };
  }

  getWeights(): number[][][] {
    return this.network.toJSON().layers.map((l: any) => l.weights);
  }

  getBiases(): number[][] {
    return this.network.toJSON().layers.map((l: any) => l.biases);
  }

  getActivations(): number[][] {
    return this.network.toJSON().layers.map((l: any) => l.activations);
  }

  adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void {
    const networkState = this.network.toJSON();
    networkState.layers[layerIndex].weights[fromNeuron][toNeuron] = newWeight;
    this.network.fromJSON(networkState);
  }

  setLearningRate(rate: number): void {
    const networkState = this.network.toJSON();
    networkState.trainOpts.learningRate = rate;
    this.network.fromJSON(networkState);
  }

  exportNetwork(): string {
    return JSON.stringify(this.network.toJSON());
  }

  importNetwork(data: string): void {
    this.network.fromJSON(JSON.parse(data));
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return {
      accuracy: 1 - this.lastError,
      precision: 1 - this.lastError,
      recall: 1 - this.lastError,
      f1Score: 1 - this.lastError
    };
  }

  getNetwork(): NeuralNetwork {
    return this.network;
  }
}