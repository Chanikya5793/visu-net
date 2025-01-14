// src/models/logicGates/train.ts
import { NeuralNetwork } from 'brain.js';
import { ITrainer, TrainingOptions, TrainerProgress, PerformanceMetrics } from '../TrainerInterface';
import { logicGateConfig as config } from './config';
import { logicGateData } from './data';

export class LogicGateTrainer implements ITrainer {
  private network!: NeuralNetwork;
  private customDataset?: any[];
  private isTraining: boolean = false;
  private currentEpoch: number = 0;
  private lastError: number = 1;

  constructor(customDataset?: any[]) {
    this.customDataset = customDataset || logicGateData.training;
    this.initNetwork();
  }

  initNetwork(layers?: number[]) {
    this.network = new NeuralNetwork({
      hiddenLayers: layers ? layers.slice(1, -1) : [10, 6],
      activation: 'sigmoid',
      learningRate: 0.05
    });
  }

  private preprocessInput(data: any) {
    // Initialize array for one-hot encoding
    const input = new Array(13).fill(0);
    
    // Set binary inputs
    input[0] = Number(data.input1);
    input[1] = Number(data.input2 || 0);
    input[2] = data.input2 !== undefined && data.input2 !== '-' ? 1 : 0; // input2Present flag

    // Gate type one-hot encoding
    const gateTypes = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR", "IMPLIES", "NIMPLIES", "NOT", "BUFFER"];
    const gateIndex = gateTypes.indexOf(data.gateType);
    if (gateIndex >= 0) {
      input[3 + gateIndex] = 1;
    }

    return input;
  }

  private preprocessOutput(data: any): number[] {
    // Binary classification: [1,0] for 0, [0,1] for 1
    return [Number(data.output === 0), Number(data.output === 1)];
  }

  async train(options: TrainingOptions): Promise<void> {
    this.isTraining = true;
    
    // Map training data to proper format
    const trainingData = this.customDataset?.map(item => {
      console.log('Processing training item:', item); // Debug log
      return {
        input: this.preprocessInput({
          input1: item.input[0],
          input2: item.input[1],
          gateType: this.getGateType(item.input.slice(2))
        }),
        output: this.preprocessOutput({ output: item.output[0] })
      };
    });

    if (!trainingData || trainingData.length === 0) {
      console.error('No training data available');
      return;
    }

    console.log('Training data sample:', trainingData[0]);

    for (let epoch = 0; epoch < options.epochs && this.isTraining; epoch++) {
      try {
        const status = await this.network.trainAsync(trainingData, {
          iterations: 1,
          errorThresh: 0.005
        });
        
        this.currentEpoch = epoch;
        this.lastError = status.error || 0;

        if (options.onIteration) {
          console.log(`Epoch ${epoch + 1}/${options.epochs}, Error: ${this.lastError}`);
          options.onIteration(epoch, this.lastError);
        }
      } catch (error) {
        console.error('Training error:', error);
        break;
      }
    }

    if (options.onComplete && this.isTraining) {
      options.onComplete();
    }
  }

  // Helper method to convert gate type encoding back to string
  private getGateType(encoding: number[]): string {
    const gateTypes = ["AND", "OR", "XOR", "NAND", "NOR", "XNOR", "IMPLIES", "NIMPLIES", "NOT", "BUFFER"];
    const index = encoding.indexOf(1);
    return index >= 0 ? gateTypes[index] : "AND";
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
    console.log('Predicting for input:', input);
    const processedInput = this.preprocessInput(input);
    console.log('Processed input:', processedInput);
    const output = this.network.run(processedInput);
    console.log('Raw prediction:', output);
    return output;
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