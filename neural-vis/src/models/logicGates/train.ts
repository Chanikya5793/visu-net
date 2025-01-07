import * as brain from 'brain.js';
import { logicGateData } from './data'; // or fitnessData for FitnessTrainer

interface TrainingOptions {
  epochs: number;
  onIteration?: (iteration: number, error: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
  onStop?: (reason?: string) => void;
}

export class LogicGateTrainer { // or FitnessTrainer
  private network: brain.NeuralNetwork;
  private isTraining: boolean = false;
  private isPaused: boolean = false;
  private currentEpoch: number = 0;
  private totalEpochs: number = 0;
  private lastError: number = 1;
  private trainingState: any = null;
  private trainingPromise: Promise<void> | null = null;
  
  constructor() {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [3], // Use [4, 4] for FitnessTrainer
      activation: 'sigmoid'
    });
  }

  async train(options: TrainingOptions) {
    // If continuing from pause, use saved state
    if (this.isPaused && this.trainingState) {
      this.network.fromJSON(this.trainingState);
    } else {
      // New training session
      this.totalEpochs = options.epochs;
      this.currentEpoch = 0;
      this.lastError = 1;
    }
    
    this.isTraining = true;
    this.isPaused = false;

    try {
      this.trainingPromise = this.network.trainAsync(logicGateData.training, { // or logicGateData/fitnessData
        iterations: this.totalEpochs,  // Don't subtract currentEpoch
        errorThresh: 0.0000000001,    // Practically zero
        log: true,
        logPeriod: 1,
        learningRate: 0.01, // Add learning rate to control training speed
        timeout: Infinity, // Prevent timeout
        callback: (stats: { iterations: number, error: number }) => {
          if (this.isPaused) {
            this.lastError = stats.error;
            this.trainingState = this.network.toJSON();
            options.onPause?.();
            return true; // Stop training
          }

          if (!this.isTraining) {
            options.onStop?.('Training manually stopped');
            return true; // Stop training
          }

          // Change this part - stats.iterations starts from 1
          this.currentEpoch = stats.iterations; // Don't increment, use the actual iteration number
          this.lastError = stats.error;

          // Update UI synchronously to match console output
          options.onIteration?.(this.currentEpoch, stats.error);

          // Only stop when we reach or exceed total epochs
          const shouldStop = this.currentEpoch >= this.totalEpochs;
          if (shouldStop) {
            options.onComplete?.();
          }
          return shouldStop;
        }
      });

      await this.trainingPromise;

    } catch (error) {
      console.error('Training error:', error);
      options.onStop?.('Training failed: ' + error);
    } finally {
      if (!this.isPaused) {
        this.isTraining = false;
        this.trainingPromise = null;
      }
    }
  }

  pause() {
    if (this.isTraining && !this.isPaused) {
      this.isPaused = true;
      // State will be saved in the callback
    }
  }

  continue(options: TrainingOptions) {
    if (this.isPaused && this.trainingState) {
      // Resume from saved state
      this.train(options);
    }
  }

  stop() {
    // Complete stop and reset
    this.isTraining = false;
    this.isPaused = false;
    this.currentEpoch = 0;
    this.totalEpochs = 0;
    this.lastError = 1;
    this.trainingState = null;
    this.trainingPromise = null;
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [3], // Use [4, 4] for FitnessTrainer
      activation: 'sigmoid'
    });
  }

  reset() {
    this.stop();
  }

  predict(input: number[]) {
    return this.network.run(input);
  }

  getProgress() {
    return {
      currentEpoch: this.currentEpoch,
      totalEpochs: this.totalEpochs,
      lastError: this.lastError,
      isPaused: this.isPaused,
      isTraining: this.isTraining
    };
  }
}