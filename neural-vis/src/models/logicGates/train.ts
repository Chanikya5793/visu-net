import * as brain from 'brain.js';
import { andGateData } from './data';

interface TrainingOptions {
  epochs: number;
  onIteration?: (iteration: number, error: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
}

export class LogicGateTrainer {
  private network: brain.NeuralNetwork;
  private isTraining: boolean = false;
  
  constructor() {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [3],
      activation: 'sigmoid'
    });
  }

  async train(options: TrainingOptions) {
    this.isTraining = true;
    
    const trainingConfig = {
      iterations: options.epochs,
      errorThresh: 0.005,
      log: true,
      logPeriod: 1,
      callback: (stats: { iterations: number, error: number }) => {
        if (!this.isTraining) return true; // Stop training if paused
        options.onIteration?.(stats.iterations, stats.error);
      }
    };

    try {
      await this.network.trainAsync(andGateData.training, trainingConfig);
      options.onComplete?.();
    } catch (error) {
      console.error('Training error:', error);
    }
  }

  pause() {
    this.isTraining = false;
    // Remove this.onPause?.(); as it's not defined
  }

  reset() {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [3],
      activation: 'sigmoid'
    });
  }

  predict(input: number[]) {
    return this.network.run(input);
  }
}