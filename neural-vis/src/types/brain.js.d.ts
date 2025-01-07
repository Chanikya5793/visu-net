declare module 'brain.js' {
  export interface INeuralNetworkOptions {
    hiddenLayers?: number[];
    activation?: string;
    iterations?: number;
    errorThresh?: number;
    log?: boolean;
    logPeriod?: number;
    learningRate?: number;
    timeout?: number;
  }

  export interface ITrainingStatus {
    iterations: number;
    error: number;
  }

  export interface ITrainingOptions extends INeuralNetworkOptions {
    callback?: (status: ITrainingStatus) => boolean;
  }

  export class NeuralNetwork {
    constructor(options?: INeuralNetworkOptions);
    train(data: any[], options?: ITrainingOptions): void;
    trainAsync(data: any[], options?: ITrainingOptions): Promise<void>;
    run(input: number[]): number[];
    toJSON(): any;
    fromJSON(json: any): void;
  }
}