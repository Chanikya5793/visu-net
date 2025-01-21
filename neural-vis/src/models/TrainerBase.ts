import * as brain from 'brain.js';
import { ITrainer, TrainingOptions, TrainerProgress, PerformanceMetrics } from './TrainerInterface';

export abstract class TrainerBase implements ITrainer {
  protected network!: brain.NeuralNetwork;
  protected trainingData: any[] = [];
  protected batchSize: number = 32;
  protected worker: Worker | null = null;

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
  abstract getPerformanceMetrics(): Promise<PerformanceMetrics>;
  abstract clearCache(): void;
  abstract getCachedMetrics(): PerformanceMetrics | null;
  abstract setCachedMetrics(metrics: PerformanceMetrics): void;

  protected async trainBatch(batch: any[]): Promise<void> {
    return new Promise((resolve) => {
      if (!this.worker) {
        this.worker = new Worker(new URL('../workers/TrainingWorker.ts', import.meta.url));
      }

      this.worker.postMessage({
        type: 'TRAIN',
        data: {
          network: this.network.toJSON(),
          trainingData: batch,
          options: {
            iterations: 1,
            errorThresh: 0.01
          }
        }
      });

      this.worker.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === 'COMPLETE') {
          this.network.fromJSON(data);
          resolve();
        }
      };
    });
  }

  protected getBatches(): any[][] {
    const batches: any[][] = [];
    for (let i = 0; i < this.trainingData.length; i += this.batchSize) {
      batches.push(this.trainingData.slice(i, i + this.batchSize));
    }
    return batches;
  }
}