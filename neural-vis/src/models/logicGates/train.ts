import * as brain from 'brain.js';
import { logicGateData } from './data';

interface TrainingOptions {
  epochs: number;
  onIteration?: (iteration: number, error: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
  onStop?: (reason?: string) => void;
}

export class LogicGateTrainer {
  private network!: brain.NeuralNetwork;
  private isTraining: boolean = false;
  private isPaused: boolean = false;
  private currentEpoch: number = 0;
  private totalEpochs: number = 0;
  private lastError: number = 1;
  private trainingState: any = null;
  
  constructor() {
    this.initNetwork();
  }

  private initNetwork(): void {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [3],
      activation: 'sigmoid'
    });
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

      await this.network.trainAsync(logicGateData.training, {
        iterations: this.totalEpochs, // Train for all epochs at once
        errorThresh: 0.0000000001,
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
  }

  predict(input: number[]): number[] {
    return this.network.run(input);
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
}