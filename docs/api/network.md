# Network API Reference

## Components

### NetworkVisualization

The main component for visualizing neural networks.

```typescript
import { NetworkVisualization } from 'components/network/visualization';

interface NetworkVisualizationProps {
  layers: Layer[];
  onLayerClick?: (layer: Layer) => void;
  onNeuronHover?: (neuron: Neuron) => void;
  theme?: NetworkTheme;
  width?: number;
  height?: number;
}

// Example usage
const MyNetwork = () => {
  return (
    <NetworkVisualization
      layers={[
        { id: 'input', type: 'input', neurons: 784 },
        { id: 'hidden1', type: 'hidden', neurons: 128, activation: 'relu' },
        { id: 'output', type: 'output', neurons: 10, activation: 'softmax' }
      ]}
      width={800}
      height={600}
      onLayerClick={(layer) => console.log('Layer clicked:', layer)}
    />
  );
};
```

### Layer Configuration

```typescript
interface Layer {
  id: string;
  type: 'input' | 'hidden' | 'output' | 'conv2d' | 'maxpool2d';
  neurons: number;
  activation?: 'relu' | 'sigmoid' | 'tanh' | 'softmax';
  kernelSize?: number;  // For conv layers
  filters?: number;     // For conv layers
  poolSize?: number;    // For pooling layers
}
```

## Hooks

### useNetwork

Custom hook for managing network state and training.

```typescript
const useNetwork = (config: NetworkConfig) => {
  const [network, setNetwork] = useState<NeuralNetwork>();
  const [training, setTraining] = useState(false);
  
  // Network initialization
  useEffect(() => {
    const net = new NeuralNetwork(config);
    setNetwork(net);
  }, [config]);

  // Training methods
  const startTraining = async (data: TrainingData) => {
    setTraining(true);
    await network.train(data);
    setTraining(false);
  };

  return { network, training, startTraining };
};
```

## Utilities

### Network Creation

```typescript
const createNetwork = (config: NetworkConfig): NeuralNetwork => {
  return new NeuralNetwork({
    inputSize: config.inputSize,
    hiddenLayers: config.hiddenLayers,
    outputSize: config.outputSize,
    learningRate: config.learningRate || 0.01,
    momentum: config.momentum || 0.9,
    activation: config.activation || 'sigmoid'
  });
};
```

### Weight Initialization

```typescript
const initializeWeights = (layer: Layer): number[][] => {
  const weights = [];
  for (let i = 0; i < layer.neurons; i++) {
    weights[i] = new Array(layer.inputSize).fill(0).map(() => 
      Math.random() * 2 - 1
    );
  }
  return weights;
};
```

## Events

### Training Events

```typescript
interface TrainingEvents {
  onEpochStart?: (epoch: number) => void;
  onBatchEnd?: (metrics: Metrics) => void;
  onEpochEnd?: (epoch: number, metrics: Metrics) => void;
  onTrainingEnd?: (finalMetrics: Metrics) => void;
}

interface Metrics {
  loss: number;
  accuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
}
```

## Examples

### Basic Network Creation

```typescript
const network = createNetwork({
  inputSize: 784,
  hiddenLayers: [128, 64],
  outputSize: 10,
  learningRate: 0.01
});
```

### Custom Layer Configuration

```typescript
const customLayer: Layer = {
  id: 'custom1',
  type: 'hidden',
  neurons: 64,
  activation: 'relu',
  dropout: 0.5,
  batchNorm: true
};
```

### Training Configuration

```typescript
const trainingConfig = {
  epochs: 100,
  batchSize: 32,
  validationSplit: 0.2,
  shuffle: true,
  callbacks: {
    onEpochEnd: (epoch, metrics) => {
      console.log(`Epoch ${epoch}: loss = ${metrics.loss}`);
    }
  }
};
``` 