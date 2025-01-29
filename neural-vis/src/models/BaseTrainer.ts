import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainerProgress, TrainingOptions } from './TrainerInterface';

export abstract class BaseTrainer implements ITrainer {
  protected network: brain.NeuralNetwork;
  protected progress: TrainerProgress;
  protected isTraining: boolean;
  protected shouldStop: boolean;
  protected validationData: { input: number[]; output: number[]; }[];
  protected trainingData: { input: number[]; output: number[]; }[];
  protected bestValidationError: number;
  protected patienceCounter: number;

  constructor() {
    this.network = new brain.NeuralNetwork();
    this.progress = {
      currentEpoch: 0,
      totalEpochs: 0,
      lastError: 1,
      isTraining: false
    };
    this.isTraining = false;
    this.shouldStop = false;
    this.validationData = [];
    this.trainingData = [];
    this.bestValidationError = Infinity;
    this.patienceCounter = 0;
  }

  protected splitDataset(data: { input: number[]; output: number[]; }[], validationSplit: number) {
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    this.trainingData = data.slice(0, splitIndex);
    this.validationData = data.slice(splitIndex);
  }

  protected calculateValidationError(): number {
    let totalError = 0;
    for (const sample of this.validationData) {
      const output = this.network.run(sample.input);
      const error = output.reduce((sum, val, i) => 
        sum + Math.pow(val - sample.output[i], 2), 0);
      totalError += error;
    }
    return totalError / this.validationData.length;
  }

  protected checkEarlyStopping(validationError: number, patience: number): boolean {
    if (validationError < this.bestValidationError) {
      this.bestValidationError = validationError;
      this.patienceCounter = 0;
    } else {
      this.patienceCounter++;
      if (this.patienceCounter >= patience) {
        return true;
      }
    }
    return false;
  }

  async train(options: TrainingOptions): Promise<void> {
    const {
      epochs,
      batchSize = 32,
      validationSplit = 0.2,
      earlyStoppingPatience = 10,
      onIteration,
      onComplete,
      onStop
    } = options;

    this.progress.totalEpochs = epochs;
    this.progress.currentEpoch = 0;
    this.isTraining = true;
    this.shouldStop = false;
    this.bestValidationError = Infinity;
    this.patienceCounter = 0;

    // Split dataset if validation is enabled
    if (validationSplit > 0) {
      this.splitDataset(this.trainingData, validationSplit);
    }

    try {
      for (let epoch = 0; epoch < epochs && !this.shouldStop; epoch++) {
        this.progress.currentEpoch = epoch + 1;

        // Train on batches
        for (let i = 0; i < this.trainingData.length; i += batchSize) {
          const batch = this.trainingData.slice(i, i + batchSize);
          const error = await this.trainOnBatch(batch);
          this.progress.lastError = error;

          if (onIteration) {
            onIteration(epoch, error);
          }

          // Check for stop signal
          if (this.shouldStop) {
            if (onStop) {
              onStop('Training stopped by user');
            }
            return;
          }
        }

        // Check early stopping if validation is enabled
        if (validationSplit > 0) {
          const validationError = this.calculateValidationError();
          if (this.checkEarlyStopping(validationError, earlyStoppingPatience)) {
            if (onStop) {
              onStop('Early stopping triggered: No improvement in validation error');
            }
            break;
          }
        }
      }

      if (onComplete && !this.shouldStop) {
        onComplete();
      }
    } finally {
      this.isTraining = false;
    }
  }

  protected abstract trainOnBatch(batch: { input: number[]; output: number[]; }[]): Promise<number>;

  stop(): void {
    this.shouldStop = true;
  }

  abstract reset(): void;
  abstract predict(input: number[]): number[];
  abstract getWeights(): number[][][];
  abstract getBiases(): number[][];
  abstract getActivations(): number[][];
  abstract getGradients(): number[][][];
  abstract adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void;
  abstract setLearningRate(rate: number): void;
  abstract exportNetwork(): string;
  abstract importNetwork(data: string): void;
  abstract getPerformanceMetrics(): PerformanceMetrics;
  abstract initNetwork(layers?: number[]): void;
  abstract getNetwork(): brain.NeuralNetwork;

  getProgress(): TrainerProgress {
    return this.progress;
  }
}