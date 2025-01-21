import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainingOptions, TrainerProgress } from './TrainerInterface';

export abstract class OptimizedTrainerBase implements ITrainer {
  protected worker: Worker | null = null;
  private metricsCache: PerformanceMetrics | null = null;
  private lastCacheUpdate: number = 0;
  private readonly cacheTimeout: number = 1000;

  // Abstract methods that child classes must implement
  abstract train(options: TrainingOptions): Promise<void>;
  abstract stop(): void;
  abstract reset(): void;
  abstract predict(input: number[]): number[];
  abstract getProgress(): TrainerProgress;
  abstract getWeights(): number[][][];
  abstract getBiases(): number[][];
  abstract getActivations(): number[][];
  abstract adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void;
  abstract setLearningRate(rate: number): void;
  abstract exportNetwork(): string;
  abstract importNetwork(data: string): void;
  abstract initNetwork(layers?: number[]): void;
  abstract getNetwork(): brain.NeuralNetwork;
  
  // Add new methods for predictions and actual values
  protected abstract getPredictions(): number[][];
  protected abstract getActualValues(): number[][];

  // Implement caching methods
  clearCache(): void {
    this.metricsCache = null;
  }

  getCachedMetrics(): PerformanceMetrics | null {
    return this.metricsCache;
  }

  setCachedMetrics(metrics: PerformanceMetrics): void {
    this.metricsCache = metrics;
    this.lastCacheUpdate = Date.now();
  }

  // Optimized performance metrics calculation
  getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const now = Date.now();
    if (this.metricsCache && now - this.lastCacheUpdate < this.cacheTimeout) {
      return Promise.resolve(this.metricsCache);
    }

    return this.computeMetrics();
  }

  private async computeMetrics(): Promise<PerformanceMetrics> {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../workers/TrainingWorker.ts', import.meta.url)
      );
    }

    return new Promise((resolve) => {
      this.worker!.postMessage({
        type: 'COMPUTE_METRICS',
        data: {
          predictions: this.getPredictions(),
          actual: this.getActualValues()
        }
      });

      this.worker!.onmessage = (e) => {
        if (e.data.type === 'METRICS') {
          this.setCachedMetrics(e.data.data);
          resolve(e.data.data);
        }
      };
    });
  }
}