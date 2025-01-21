// src/models/TrainerInterface.ts
import * as brain from 'brain.js';

export interface ITrainer {
  train(options: TrainingOptions): Promise<void>;
  stop(): void;
  reset(): void;
  predict(input: number[]): number[];
  getProgress(): TrainerProgress;
  getWeights(): number[][][];
  getBiases(): number[][];
  getActivations(): number[][];
  adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void;
  setLearningRate(rate: number): void;
  exportNetwork(): string;
  importNetwork(data: string): void;
  // Update return type to Promise
  getPerformanceMetrics(): Promise<PerformanceMetrics>;
  initNetwork(layers?: number[]): void;
  getNetwork(): brain.NeuralNetwork;

  // Add caching methods
  clearCache(): void;
  getCachedMetrics(): PerformanceMetrics | null;
  setCachedMetrics(metrics: PerformanceMetrics): void;
}

export interface TrainingOptions {
  epochs: number;
  onIteration?: (iteration: number, error: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
  onStop?: (reason?: string) => void;
}

export interface TrainerProgress {
  currentEpoch: number;
  totalEpochs: number;
  lastError: number;
  isTraining: boolean;
}

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface CacheConfig {
  metricsTimeout: number;
  weightsTimeout: number;
  maxCacheSize: number;
}