# Training API Reference

## Core Training Components

### TrainingController

The main component for managing neural network training.

```typescript
import { TrainingController } from 'components/network/training';

interface TrainingControllerProps {
  network: NeuralNetwork;
  data: TrainingData;
  config: TrainingConfig;
  onEpochEnd?: (metrics: Metrics) => void;
  onBatchEnd?: (metrics: Metrics) => void;
  onTrainingComplete?: (finalMetrics: Metrics) => void;
}

// Example usage
const Training = () => {
  return (
    <TrainingController
      network={network}
      data={trainingData}
      config={{
        epochs: 100,
        batchSize: 32,
        learningRate: 0.01,
        validationSplit: 0.2
      }}
      onEpochEnd={handleEpochEnd}
    />
  );
};
```

## Training Configuration

### Basic Configuration

```typescript
interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit?: number;
  shuffle?: boolean;
  momentum?: number;
  optimizer?: OptimizerType;
  lossFunction?: LossFunctionType;
}

type OptimizerType = 'sgd' | 'adam' | 'rmsprop';
type LossFunctionType = 'mse' | 'crossEntropy' | 'binaryCrossEntropy';
```

### Advanced Configuration

```typescript
interface AdvancedTrainingConfig extends TrainingConfig {
  regularization?: {
    l1?: number;
    l2?: number;
    dropoutRate?: number;
  };
  learningRateSchedule?: {
    type: 'step' | 'exponential' | 'cosine';
    initialRate: number;
    decay: number;
    steps?: number;
  };
  earlyStopping?: {
    monitor: 'loss' | 'accuracy' | 'val_loss' | 'val_accuracy';
    patience: number;
    minDelta: number;
  };
}
```

## Training Hooks

### useTraining

Custom hook for managing training state and operations.

```typescript
const useTraining = (config: TrainingConfig) => {
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({
    loss: 0,
    accuracy: 0
  });

  const startTraining = async (data: TrainingData) => {
    setIsTraining(true);
    // Training implementation
  };

  const pauseTraining = () => {
    setIsTraining(false);
  };

  const resumeTraining = () => {
    setIsTraining(true);
  };

  return {
    isTraining,
    epoch,
    metrics,
    startTraining,
    pauseTraining,
    resumeTraining
  };
};
```

## Data Management

### Data Preprocessing

```typescript
interface PreprocessingConfig {
  normalization?: 'minmax' | 'zscore';
  augmentation?: {
    rotation?: number;
    flip?: boolean;
    noise?: number;
  };
  encoding?: {
    oneHot?: boolean;
    labelEncoding?: boolean;
  };
}

const preprocessData = (
  data: RawTrainingData,
  config: PreprocessingConfig
): ProcessedTrainingData => {
  // Implementation
};
```

### Batch Generation

```typescript
interface BatchGenerator {
  next(): TrainingBatch;
  reset(): void;
  hasNext(): boolean;
}

const createBatchGenerator = (
  data: TrainingData,
  batchSize: number,
  shuffle: boolean
): BatchGenerator => {
  // Implementation
};
```

## Metrics and Monitoring

### Performance Metrics

```typescript
interface TrainingMetrics {
  loss: number;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  validationMetrics?: {
    loss: number;
    accuracy: number;
  };
  learningRate: number;
  epoch: number;
  batchesProcessed: number;
}
```

### Training Callbacks

```typescript
interface TrainingCallbacks {
  onBatchBegin?: (batch: number) => void;
  onBatchEnd?: (batch: number, metrics: TrainingMetrics) => void;
  onEpochBegin?: (epoch: number) => void;
  onEpochEnd?: (epoch: number, metrics: TrainingMetrics) => void;
  onTrainingBegin?: () => void;
  onTrainingEnd?: (finalMetrics: TrainingMetrics) => void;
}
```

## Examples

### Basic Training Setup

```typescript
const BasicTraining = () => {
  const { startTraining, metrics } = useTraining({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.01
  });

  return (
    <div>
      <TrainingController
        onStart={() => startTraining(data)}
        metrics={metrics}
      />
      <MetricsDisplay metrics={metrics} />
    </div>
  );
};
```

### Advanced Training Configuration

```typescript
const advancedConfig: AdvancedTrainingConfig = {
  epochs: 200,
  batchSize: 64,
  learningRate: 0.001,
  optimizer: 'adam',
  lossFunction: 'crossEntropy',
  regularization: {
    l2: 0.01,
    dropoutRate: 0.5
  },
  learningRateSchedule: {
    type: 'cosine',
    initialRate: 0.001,
    decay: 0.1
  },
  earlyStopping: {
    monitor: 'val_loss',
    patience: 10,
    minDelta: 0.001
  }
};
```

### Custom Training Loop

```typescript
const CustomTraining = () => {
  const train = async () => {
    const batchGen = createBatchGenerator(data, 32, true);
    
    while (batchGen.hasNext()) {
      const batch = batchGen.next();
      const metrics = await network.trainOnBatch(batch);
      
      if (metrics.loss < targetLoss) {
        break;
      }
    }
  };

  return <TrainingController onCustomTrain={train} />;
};
``` 