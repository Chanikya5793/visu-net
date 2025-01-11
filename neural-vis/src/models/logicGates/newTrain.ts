import * as brain from 'brain.js';
import { ITrainer, PerformanceMetrics, TrainingOptions } from '../TrainerInterface';
import { logicGateData } from './newData';

export class NewLogicGateTrainer implements ITrainer {
    protected network!: brain.NeuralNetwork;
    private isTraining: boolean = false;
    private isPaused: boolean = false;
    private currentEpoch: number = 0;
    private totalEpochs: number = 0;
    private lastError: number = 1;
    private trainingState: any = null;
    private activations: number[][] = [];
    private weights: number[][][] = [];
    private biases: number[][] = [];
    private learningRate: number = 0.1;
    private trainingData: any[];

    constructor(customDataset?: any[]) {
        this.trainingData = customDataset || logicGateData.training;
        this.initNetwork();
    }

    getNetwork(): brain.NeuralNetwork {
        return this.network;
    }

    initNetwork(layers?: number[]): void {
        this.network = new brain.NeuralNetwork({
            // Input: 13 neurons (1 for input1, 1 for input2, 1 for input2Present, 10 for gate type)
            // Hidden: Two layers with decreasing size
            // Output: 2 neurons (probability of 0 and 1)
            hiddenLayers: layers || [10, 6],
            activation: 'sigmoid',
            learningRate: this.learningRate,
            binaryThresh: 0.5
        });
    }

    async train(options: TrainingOptions): Promise<void> {
        try {
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

            await this.network.trainAsync(this.trainingData, {
                iterations: this.totalEpochs,
                errorThresh: 0.005,
                log: true,
                logPeriod: 1,
                callback: (stats: { iterations: number, error: number }) => {
                    this.currentEpoch = stats.iterations;
                    this.lastError = stats.error;

                    if (!this.isTraining) {
                        options.onStop?.();
                        return true;
                    }

                    if (this.isPaused) {
                        this.trainingState = this.network.toJSON();
                        options.onPause?.();
                        return true;
                    }

                    this.updateNetworkState();
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

    predict(input: number[]): number[] {
        const output = this.network.run(input);
        // Return probabilities for both classes
        return [output[0], output[1]];
    }

    private updateNetworkState(): void {
        const networkState = this.network.toJSON();
        
        // Update weights, biases, and activations
        this.weights = networkState.layers.map((layer: any) => layer.weights || []);
        this.biases = networkState.layers.map((layer: any) => layer.biases || []);
        
        // Calculate activations for visualization
        this.activations = [
            networkState.layers[0].weights[0] || [],
            ...networkState.layers.map((layer: any) => {
                if (layer.biases) {
                    return layer.biases.map((_: any, i: number) => {
                        const weights = layer.weights[i] || [];
                        return Math.tanh(weights.reduce((sum: number, w: number) => sum + w, 0) + layer.biases[i]);
                    });
                }
                return [];
            })
        ];
    }

    // Implementation of other required methods
    pause(): void {
        if (this.isTraining) {
            this.trainingState = this.network.toJSON();
            this.isPaused = true;
            this.isTraining = false;
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
        this.initNetwork();
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

    getWeights(): number[][][] {
        return this.weights;
    }

    getBiases(): number[][] {
        return this.biases;
    }

    getActivations(): number[][] {
        return this.activations;
    }

    getPerformanceMetrics(): PerformanceMetrics {
        if (!this.network || !this.isTraining && this.currentEpoch === 0) {
            return {
                accuracy: 0,
                precision: 0,
                recall: 0,
                f1Score: 0
            };
        }

        let truePositives = 0;
        let falsePositives = 0;
        let trueNegatives = 0;
        let falseNegatives = 0;

        this.trainingData.forEach((data: any) => {
            const prediction = this.predict(data.input);
            const actual = data.output;

            // Get the predicted class (index of max probability)
            const predictedClass = prediction[0] > prediction[1] ? 0 : 1;
            const actualClass = actual[0] > actual[1] ? 0 : 1;

            if (predictedClass === 1 && actualClass === 1) truePositives++;
            if (predictedClass === 1 && actualClass === 0) falsePositives++;
            if (predictedClass === 0 && actualClass === 0) trueNegatives++;
            if (predictedClass === 0 && actualClass === 1) falseNegatives++;
        });

        const accuracy = (truePositives + trueNegatives) / this.trainingData.length;
        const precision = truePositives / (truePositives + falsePositives) || 0;
        const recall = truePositives / (truePositives + falseNegatives) || 0;
        const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

        return {
            accuracy,
            precision,
            recall,
            f1Score
        };
    }

    adjustWeight(layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number): void {
        const networkState = this.network.toJSON();
        if (networkState.layers[layerIndex] && 
            networkState.layers[layerIndex].weights[toNeuron]) {
            networkState.layers[layerIndex].weights[toNeuron][fromNeuron] = newWeight;
            this.network.fromJSON(networkState);
            this.updateNetworkState();
        }
    }

    setLearningRate(rate: number): void {
        this.learningRate = rate;
        const networkState = this.network.toJSON();
        networkState.trainOpts = {
            ...networkState.trainOpts,
            learningRate: rate
        };
        this.network.fromJSON(networkState);
    }

    exportNetwork(): string {
        return JSON.stringify(this.network.toJSON(), null, 2);
    }

    importNetwork(data: string): void {
        try {
            const networkState = JSON.parse(data);
            this.network.fromJSON(networkState);
            this.updateNetworkState();
        } catch (error) {
            console.error('Failed to import network:', error);
            throw new Error('Invalid network configuration');
        }
    }
}