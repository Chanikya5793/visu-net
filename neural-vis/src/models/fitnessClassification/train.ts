import * as brain from 'brain.js';
import { fitnessData } from './data';

interface TrainingOptions {
  epochs: number;
  onIteration?: (iteration: number, error: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
  onStop?: (reason?: string) => void;
}

export class FitnessTrainer {
  private network!: brain.NeuralNetwork;
  private isTraining: boolean = false;
  private currentEpoch: number = 0;
  private totalEpochs: number = 0;
  private lastError: number = 1;
  
  constructor() {
    this.initNetwork();
  }

  private initNetwork(): void {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [4, 4],
      activation: 'sigmoid'
    });
  }

  async train(options: TrainingOptions): Promise<void> {
    try {
      this.totalEpochs = options.epochs;
      this.currentEpoch = 0;
      this.lastError = 1;
      this.isTraining = true;

      await this.network.trainAsync(fitnessData.training, {
        iterations: this.totalEpochs,
        errorThresh: 0.0000000001,
        log: true,
        logPeriod: 1,
        callback: (stats: { iterations: number, error: number }) => {
          this.currentEpoch = stats.iterations;
          this.lastError = stats.error;

          if (!this.isTraining) {
            options.onStop?.();
            return true;
          }

          options.onIteration?.(this.currentEpoch, stats.error);
          
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

  stop(): void {
    this.isTraining = false;
  }

  reset(): void {
    this.stop();
    this.currentEpoch = 0;
    this.totalEpochs = 0;
    this.lastError = 1;
    this.initNetwork();
  }

  predict(input: number[]): number[] {
    return this.network.run(input);
  }

  getProgress(): {
    currentEpoch: number;
    totalEpochs: number;
    lastError: number;
    isTraining: boolean;
  } {
    return {
      currentEpoch: this.currentEpoch,
      totalEpochs: this.totalEpochs,
      lastError: this.lastError,
      isTraining: this.isTraining
    };
  }
}