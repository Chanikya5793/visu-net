# MNIST Digit Classifier Example

This example demonstrates how to create and train a neural network for classifying MNIST digits using Visu-Net.

## Complete Code

```typescript
import React, { useState, useEffect } from 'react';
import {
  NetworkVisualization,
  TrainingController,
  PerformanceMetrics,
  WeightDistribution
} from 'components/network';
import { useNetwork } from 'components/network/hooks';
import { loadMNISTData } from 'utils/data';

const MNISTClassifier: React.FC = () => {
  const [data, setData] = useState<TrainingData | null>(null);
  const { network, startTraining, metrics } = useNetwork({
    inputSize: 784,  // 28x28 pixels
    hiddenLayers: [128, 64],
    outputSize: 10,  // 10 digits
    learningRate: 0.01
  });

  // Load MNIST data
  useEffect(() => {
    const loadData = async () => {
      const mnistData = await loadMNISTData();
      setData(mnistData);
    };
    loadData();
  }, []);

  // Training configuration
  const trainingConfig = {
    epochs: 10,
    batchSize: 32,
    validationSplit: 0.1,
    callbacks: {
      onEpochEnd: (epoch: number, metrics: Metrics) => {
        console.log(`Epoch ${epoch}: loss = ${metrics.loss}, accuracy = ${metrics.accuracy}`);
      }
    }
  };

  return (
    <div className="mnist-classifier">
      <h1>MNIST Digit Classifier</h1>
      
      {/* Network Visualization */}
      <div className="network-viz">
        <NetworkVisualization
          network={network}
          width={800}
          height={600}
          theme={{
            colors: {
              background: '#ffffff',
              neuron: '#2196f3',
              connection: '#757575',
              activation: ['#ff0000', '#00ff00']
            }
          }}
        />
      </div>

      {/* Training Controls */}
      <div className="training-controls">
        <TrainingController
          network={network}
          data={data}
          config={trainingConfig}
          onStart={() => startTraining(data)}
        />
      </div>

      {/* Performance Metrics */}
      <div className="metrics">
        <PerformanceMetrics metrics={metrics} />
      </div>

      {/* Weight Distribution */}
      <div className="weight-distribution">
        <WeightDistribution
          network={network}
          layerId="hidden1"
          showHistogram={true}
        />
      </div>
    </div>
  );
};

export default MNISTClassifier;
```

## Step-by-Step Explanation

### 1. Setup and Data Loading

```typescript
const [data, setData] = useState<TrainingData | null>(null);
const { network, startTraining, metrics } = useNetwork({
  inputSize: 784,  // 28x28 pixels
  hiddenLayers: [128, 64],
  outputSize: 10,  // 10 digits
  learningRate: 0.01
});

useEffect(() => {
  const loadData = async () => {
    const mnistData = await loadMNISTData();
    setData(mnistData);
  };
  loadData();
}, []);
```

### 2. Training Configuration

```typescript
const trainingConfig = {
  epochs: 10,
  batchSize: 32,
  validationSplit: 0.1,
  callbacks: {
    onEpochEnd: (epoch: number, metrics: Metrics) => {
      console.log(`Epoch ${epoch}: loss = ${metrics.loss}, accuracy = ${metrics.accuracy}`);
    }
  }
};
```

### 3. Network Visualization

```typescript
<NetworkVisualization
  network={network}
  width={800}
  height={600}
  theme={{
    colors: {
      background: '#ffffff',
      neuron: '#2196f3',
      connection: '#757575',
      activation: ['#ff0000', '#00ff00']
    }
  }}
/>
```

### 4. Training Controls and Metrics

```typescript
<TrainingController
  network={network}
  data={data}
  config={trainingConfig}
  onStart={() => startTraining(data)}
/>

<PerformanceMetrics metrics={metrics} />
```

## Styling

```css
.mnist-classifier {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.network-viz {
  margin: 20px 0;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.training-controls {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.weight-distribution {
  margin: 20px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}
```

## Expected Results

After training for 10 epochs, you should see:
- Training accuracy: ~98%
- Validation accuracy: ~96%
- Clear separation in the weight distribution
- Activation patterns showing digit recognition features

## Common Issues and Solutions

1. **Memory Issues**
   ```typescript
   // Reduce memory usage by processing in smaller batches
   const trainingConfig = {
     batchSize: 16,  // Reduce from 32
     validationSplit: 0.05  // Reduce validation set
   };
   ```

2. **Performance Issues**
   ```typescript
   // Optimize rendering performance
   const MNISTClassifier = React.memo(() => {
     // Component code
   });
   ```

3. **Visualization Lag**
   ```typescript
   // Reduce update frequency
   const visualizationConfig = {
     updateFrequency: 100  // Update every 100ms
   };
   ```

## Next Steps

1. Try modifying the network architecture:
   ```typescript
   const networkConfig = {
     hiddenLayers: [256, 128, 64],  // Deeper network
     learningRate: 0.005,  // Adjusted learning rate
     dropout: 0.3  // Add dropout for regularization
   };
   ```

2. Add data augmentation:
   ```typescript
   const augmentationConfig = {
     rotation: 15,  // Rotate ±15 degrees
     noise: 0.1,    // Add random noise
     flip: false    // No flipping for digits
   };
   ```

3. Implement early stopping:
   ```typescript
   const trainingConfig = {
     // ... other config
     earlyStopping: {
       monitor: 'val_accuracy',
       patience: 3,
       minDelta: 0.001
     }
   };
   ```
</code_block_to_apply_changes_from> 