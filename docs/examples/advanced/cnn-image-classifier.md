# CNN Image Classifier Example

This example demonstrates how to create and train a Convolutional Neural Network (CNN) for image classification using Visu-Net.

## Architecture Overview

```
Input Image (224x224x3)
    ↓
Conv2D (64 filters, 3x3 kernel) + ReLU
    ↓
MaxPool2D (2x2)
    ↓
Conv2D (128 filters, 3x3 kernel) + ReLU
    ↓
MaxPool2D (2x2)
    ↓
Conv2D (256 filters, 3x3 kernel) + ReLU
    ↓
Flatten
    ↓
Dense (512) + ReLU + Dropout(0.5)
    ↓
Dense (num_classes) + Softmax
```

## Complete Code

```typescript
import React, { useState, useEffect } from 'react';
import {
  NetworkVisualization,
  TrainingController,
  PerformanceMetrics,
  FeatureMapVisualization,
  ConvolutionVisualization
} from 'components/network';
import { useNetwork } from 'components/network/hooks';
import { loadImageData, augmentData } from 'utils/data';

const CNNClassifier: React.FC = () => {
  const [data, setData] = useState<ImageData | null>(null);
  
  // Initialize CNN
  const { network, startTraining, metrics } = useNetwork({
    architecture: [
      {
        type: 'input',
        shape: [224, 224, 3]
      },
      {
        type: 'conv2d',
        filters: 64,
        kernelSize: 3,
        activation: 'relu'
      },
      {
        type: 'maxpool2d',
        poolSize: 2
      },
      {
        type: 'conv2d',
        filters: 128,
        kernelSize: 3,
        activation: 'relu'
      },
      {
        type: 'maxpool2d',
        poolSize: 2
      },
      {
        type: 'conv2d',
        filters: 256,
        kernelSize: 3,
        activation: 'relu'
      },
      {
        type: 'flatten'
      },
      {
        type: 'dense',
        units: 512,
        activation: 'relu',
        dropout: 0.5
      },
      {
        type: 'dense',
        units: 10,
        activation: 'softmax'
      }
    ],
    optimizer: {
      type: 'adam',
      learningRate: 0.001
    }
  });

  // Load and preprocess data
  useEffect(() => {
    const loadData = async () => {
      const imageData = await loadImageData();
      const augmentedData = await augmentData(imageData, {
        rotation: 15,
        zoom: 0.1,
        horizontalFlip: true
      });
      setData(augmentedData);
    };
    loadData();
  }, []);

  // Training configuration
  const trainingConfig = {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch: number, metrics: Metrics) => {
        console.log(`Epoch ${epoch}:`, metrics);
      }
    }
  };

  return (
    <div className="cnn-classifier">
      <h1>CNN Image Classifier</h1>
      
      {/* Network Architecture Visualization */}
      <div className="network-architecture">
        <NetworkVisualization
          network={network}
          width={1000}
          height={600}
          showFeatureMaps={true}
        />
      </div>

      {/* Feature Map Visualization */}
      <div className="feature-maps">
        <FeatureMapVisualization
          network={network}
          layerIndex={1}  // First conv layer
          inputImage={data?.sampleImage}
        />
      </div>

      {/* Convolution Visualization */}
      <div className="convolution-viz">
        <ConvolutionVisualization
          kernel={network.layers[1].weights}
          inputImage={data?.sampleImage}
          animate={true}
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
      <div className="metrics-grid">
        <PerformanceMetrics 
          metrics={metrics}
          showConfusionMatrix={true}
        />
      </div>
    </div>
  );
};

export default CNNClassifier;
```

## Styling

```css
.cnn-classifier {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.network-architecture {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.feature-maps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.convolution-viz {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}
```

## Key Components

### 1. CNN Architecture Configuration

```typescript
const cnnConfig = {
  architecture: [
    {
      type: 'input',
      shape: [224, 224, 3]
    },
    {
      type: 'conv2d',
      filters: 64,
      kernelSize: 3,
      activation: 'relu'
    },
    // ... other layers
  ]
};
```

### 2. Data Augmentation

```typescript
const augmentationConfig = {
  rotation: 15,      // Rotate ±15 degrees
  zoom: 0.1,        // Zoom range
  horizontalFlip: true,
  brightness: 0.1,   // Brightness adjustment
  preprocessing: {
    rescale: 1/255,  // Normalize pixel values
    meanSubtraction: true
  }
};
```

### 3. Feature Map Visualization

```typescript
const FeatureMaps = () => {
  const [selectedLayer, setSelectedLayer] = useState(1);
  
  return (
    <FeatureMapVisualization
      network={network}
      layerIndex={selectedLayer}
      inputImage={data?.sampleImage}
      colormap="viridis"
      interactive={true}
      onLayerSelect={setSelectedLayer}
    />
  );
};
```

## Performance Optimization

### 1. Memory Management

```typescript
const optimizeMemory = () => {
  // Use streaming for large datasets
  const dataStream = createDataStream(data, {
    batchSize: 32,
    prefetchBuffers: 2
  });

  // Clear unused tensors
  network.clearGradients();
  gc();  // Garbage collection
};
```

### 2. Training Optimization

```typescript
const optimizeTraining = {
  batchSize: 32,
  prefetch: true,
  cacheData: true,
  useGPU: true,
  mixedPrecision: true,
  gradientClipping: {
    maxNorm: 1.0
  }
};
```

## Common Issues and Solutions

1. **Out of Memory**
```typescript
// Reduce batch size and image size
const config = {
  batchSize: 16,
  imageSize: [160, 160],
  prefetchBuffers: 1
};
```

2. **Slow Training**
```typescript
// Enable performance optimizations
const performanceConfig = {
  useGPU: true,
  enableXLA: true,
  batchParallelization: true
};
```

3. **Overfitting**
```typescript
// Add regularization
const regularization = {
  dropout: 0.5,
  l2: 0.01,
  augmentation: {
    enabled: true,
    intensity: 0.3
  }
};
```

## Next Steps

1. Experiment with different architectures:
   - Try ResNet-style skip connections
   - Add batch normalization layers
   - Implement depthwise separable convolutions

2. Enhance visualization:
   - Add gradient flow visualization
   - Implement attention maps
   - Show receptive field analysis

3. Improve performance:
   - Implement transfer learning
   - Add model quantization
   - Enable model pruning 