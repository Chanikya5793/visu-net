declare module 'brain.js' {
  export interface INeuralNetworkOptions {
    hiddenLayers?: number[];
    activation?: string;
    iterations?: number;
    errorThresh?: number;
    log?: boolean;
    logPeriod?: number;
  }

  export interface ITrainingData {
    input: number[];
    output: number[];
  }

  export interface ITrainingStatus {
    iterations: number;
    error: number;
  }

  export class NeuralNetwork {
    constructor(options?: INeuralNetworkOptions);
    train(data: ITrainingData[], options?: INeuralNetworkOptions): void;
    trainAsync(data: ITrainingData[], options?: INeuralNetworkOptions): Promise<void>;
    run(input: number[]): number[];
  }
}