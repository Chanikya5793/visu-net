import * as brain from 'brain.js';
import { weatherData } from './data';

interface TrainingOptions {
  epochs: number;
  onIteration?: (iteration: number, error: number) => void;
  onComplete?: () => void;
  onPause?: () => void;
}

export class WeatherTrainer {
  private network: brain.NeuralNetwork;
  private isTraining: boolean = false;
  
  constructor() {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [6, 4], // More complex network for weather prediction
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
        if (!this.isTraining) return true;
        options.onIteration?.(stats.iterations, stats.error);
      }
    };

    try {
      await this.network.trainAsync(weatherData.training, trainingConfig);
      options.onComplete?.();
    } catch (error) {
      console.error('Training error:', error);
    }
  }

  pause() {
    this.isTraining = false;
  }

  reset() {
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [6, 4],
      activation: 'sigmoid'
    });
  }

  predict(input: number[]) {
    return this.network.run(input);
  }
}