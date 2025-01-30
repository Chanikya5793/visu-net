/**
 * Type definitions for brain.js library
 * 
 * This module provides TypeScript type definitions for the brain.js neural network library.
 * It enables type safety and autocompletion when working with brain.js in TypeScript projects.
 * 
 * @module brain.js
 */

declare module 'brain.js' {
  /**
   * Configuration options for neural network initialization
   * 
   * @interface INeuralNetworkOptions
   */
  export interface INeuralNetworkOptions {
    /** Array specifying the number of neurons in each hidden layer */
    hiddenLayers?: number[];
    /** Activation function to use ('sigmoid', 'relu', 'leaky-relu', etc.) */
    activation?: string;
    /** Maximum number of training iterations */
    iterations?: number;
    /** Error threshold for stopping training */
    errorThresh?: number;
    /** Whether to log training progress */
    log?: boolean;
    /** Number of iterations between logging */
    logPeriod?: number;
    /** Learning rate for training */
    learningRate?: number;
    /** Maximum time (ms) to train for */
    timeout?: number;
  }

  /**
   * Training status information
   * 
   * @interface ITrainingStatus
   */
  export interface ITrainingStatus {
    /** Current iteration count */
    iterations: number;
    /** Current error value */
    error: number;
  }

  /**
   * Training options extending network options
   * 
   * @interface ITrainingOptions
   * @extends INeuralNetworkOptions
   */
  export interface ITrainingOptions extends INeuralNetworkOptions {
    /** Callback function for monitoring training progress */
    callback?: (status: ITrainingStatus) => boolean;
  }

  /**
   * Neural Network class for creating and training networks
   * 
   * @class NeuralNetwork
   */
  export class NeuralNetwork {
    /** Create a new neural network with specified options */
    constructor(options?: INeuralNetworkOptions);
    /** Train the network with provided data and options */
    train(data: any[], options?: ITrainingOptions): void;
    /** Train the network asynchronously */
    trainAsync(data: any[], options?: ITrainingOptions): Promise<void>;
    /** Run input through the trained network */
    run(input: number[]): number[];
    /** Export the network to JSON format */
    toJSON(): any;
    /** Import network from JSON format */
    fromJSON(json: any): void;
  }
}