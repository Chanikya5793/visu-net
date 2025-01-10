export interface NeuronVizProps {
  layers: number[];
  activations?: number[][];
  weights?: number[][][];
  biases?: number[][];
  dataset: string;
  isTraining: boolean;
  onWeightAdjust?: (layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number) => void;
  gradients?: number[][];
  learningRate?: number;
  onLearningRateChange?: (newRate: number) => void;
  onExportNetwork?: () => void;
  onImportNetwork?: (data: string) => void;
  performanceMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainingSpeed?: number;
  onTrainingSpeedChange?: (speed: number) => void;
  onArchitectureChange?: (newLayers: number[]) => void;
}

export interface NeuronInfo {
  layer: number;
  index: number;
  value: number;
  weights?: number[];
}

export interface NetworkStatsType {
  weightMean: number;
  weightStd: number;
  biasMean: number;
  biasStd: number;
} 