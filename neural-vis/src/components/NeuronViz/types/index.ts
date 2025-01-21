export interface NeuronVizProps {
  layers: number[];
  activations?: number[][];
  weights?: number[][][]; // [layerIndex][neuronIndex][connectionIndex]
  biases?: number[][]; // [layerIndex][neuronIndex]
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

export interface NetworkStatsProps {
  weights: number[][][];
  biases: number[][];
  learningRate: number;
}

export interface ActivationPatternsProps {
  activations: number[][];
  layer: number;
}

export interface WeightDistributionProps {
  weights: number[][][];
}

export interface ChartData {
  weight: string;
  count: number;
}

export interface ErrorSurfaceProps {
  weights: number[][][];
  error: number;
}

export interface LayerComparisonProps {
  layers: number[];
  activations: number[][];
}

export interface ArchitectureEditorProps {
  layers: number[];
  onChange: (newLayers: number[]) => void;
  isTraining: boolean;
}

export interface LearningRateControlProps {
  learningRate: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

export interface TrainingSpeedControlProps {
  speed: number;
  onChange: (speed: number) => void;
  disabled: boolean;
}

export interface NeuronColorLegendProps {
  dataset: string;
  layers: number[];
}

export interface PerformanceMetricsProps {
  metrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface GradientOverlayProps {
  gradient: number;
}

export interface GradientFlowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  gradient: number;
} 