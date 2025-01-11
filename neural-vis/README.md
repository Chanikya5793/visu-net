# Neural-Vis

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/MUI-5.0.0-blue.svg)](https://mui.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An interactive neural network visualization tool that provides real-time insights into neural architectures, training processes, and network behavior. Perfect for education, research, and deep learning exploration.

<div align="center">
  <img src="docs/assets/demo.gif" alt="Neural-Vis Demo" width="600"/>
</div>

## ✨ Features

### 🧠 Neural Network Visualization
- **Interactive Visualization**: Real-time visualization of neural network architecture using `NeuronViz`
- **Extended Features**: Advanced visualization capabilities with `NeuronVizEX`
- **Layer Inspection**: Detailed view of neuron activations and weights
- **Dynamic Updates**: Real-time updates during training

### 🎯 Training & Testing
- **Interactive Controls**: Start, pause, and adjust training parameters
- **Real-time Metrics**: Live visualization of:
  - Loss curves
  - Accuracy metrics
  - Weight distributions
  - Activation patterns
- **Testing Interface**: Comprehensive model evaluation tools

### 📊 Data Management
- **Custom Datasets**: Create and manage training datasets
- **Data Visualization**: Interactive data exploration tools
- **Import/Export**: Flexible data and model management

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/neural-vis.git

# Navigate to project directory
cd neural-vis

# Install dependencies
npm install

# Start development server
npm start
```

## 💻 Core Components

### Basic Network Visualization
The standard visualization component for simple networks:
```typescript
import { NeuronViz } from './components/NeuronViz';

const SimpleNetwork = () => (
  <NeuronViz
    networkConfig={{
      layers: [
        { type: 'input', size: 784 },
        { type: 'hidden', size: 128, activation: 'relu' },
        { type: 'output', size: 10, activation: 'softmax' }
      ],
      learningRate: 0.01
    }}
    visualizationOptions={{
      showWeights: true,
      animateActivations: true,
      theme: 'light'
    }}
    onLayerClick={handleLayerClick}
    onNeuronHover={handleNeuronHover}
  />
);
```

### Advanced Visualization (NeuronVizEX)
Extended visualization with advanced features:
```typescript
import { NeuronVizEX } from './components/NeuronVizEX';

const AdvancedNetwork = () => (
  <NeuronVizEX
    networkConfig={{
      layers: [
        { type: 'input', size: 784 },
        { type: 'conv2d', filters: 32, kernelSize: 3, activation: 'relu' },
        { type: 'maxpool2d', poolSize: 2 },
        { type: 'flatten' },
        { type: 'dense', size: 128, activation: 'relu' },
        { type: 'output', size: 10, activation: 'softmax' }
      ],
      optimizer: 'adam',
      learningRate: 0.001
    }}
    visualizationOptions={{
      showFeatureMaps: true,
      show3DView: true,
      showGradients: true,
      animationSpeed: 1.0
    }}
    customTheme={{
      neuronColor: '#4a90e2',
      connectionColor: '#2c3e50',
      activationColor: '#27ae60'
    }}
  />
);
```

### Training Controls with Metrics
Complete training interface with real-time metrics:
```typescript
import { TrainingControls, TrainingMetrics, MetricsGraph } from './components';

const TrainingInterface = () => (
  <div>
    <TrainingControls
      onStart={handleTrainingStart}
      onPause={handleTrainingPause}
      onReset={handleReset}
      config={{
        batchSize: 32,
        epochs: 100,
        validationSplit: 0.2,
        optimizer: {
          type: 'adam',
          learningRate: 0.001,
          beta1: 0.9,
          beta2: 0.999
        }
      }}
    />
    <TrainingMetrics
      metrics={currentMetrics}
      showLossGraph={true}
      showAccuracyGraph={true}
      updateInterval={100}
    />
    <MetricsGraph
      data={trainingHistory}
      metrics={['loss', 'accuracy', 'val_loss', 'val_accuracy']}
      layout={{
        width: 800,
        height: 400,
        title: 'Training Progress'
      }}
    />
  </div>
);
```

### Dataset Management and Testing
Comprehensive data handling and model testing:
```typescript
import { 
  CustomDatasetCreator, 
  DatasetViewer,
  DatasetSelector,
  TestingInterface,
  TestModelButton 
} from './components';

const DataManagement = () => (
  <div>
    <CustomDatasetCreator
      onDatasetCreate={handleNewDataset}
      supportedFormats={['csv', 'json', 'images']}
      validationOptions={{
        splitRatio: 0.2,
        shuffle: true,
        stratify: true
      }}
      preprocessing={{
        normalize: true,
        augmentation: {
          rotation: true,
          flip: true,
          zoom: true
        }
      }}
    />
    <DatasetSelector
      datasets={availableDatasets}
      onSelect={handleDatasetSelect}
      showPreview={true}
    />
    <DatasetViewer
      dataset={currentDataset}
      visualization="scatter"
      dimensions={2}
      interactive={true}
      colorBy="label"
    />
    <TestingInterface
      model={trainedModel}
      testData={testDataset}
      metrics={['accuracy', 'precision', 'recall', 'f1']}
      batchSize={32}
    />
    <TestModelButton
      onClick={handleModelTest}
      disabled={!modelTrained}
    />
  </div>
);
```

## 🔧 Troubleshooting

### Common Issues

#### Performance Issues
1. **Slow Visualization**
   - Reduce network size or layer visibility
   - Disable real-time weight updates
   - Use `showWeights: false` for large networks
   - Consider using WebGL acceleration

2. **Memory Leaks**
   - Properly dispose of WebGL contexts
   - Use `React.memo()` for heavy components
   - Implement cleanup in `useEffect` hooks

3. **Training Performance**
   - Adjust batch size
   - Use appropriate optimizer settings
   - Enable GPU acceleration if available

#### Visualization Issues
1. **Network Not Rendering**
   - Check browser WebGL support
   - Verify network configuration
   - Clear browser cache

2. **Incorrect Layer Display**
   - Validate layer configurations
   - Check activation functions
   - Verify tensor shapes

3. **UI Responsiveness**
   - Implement virtualization for large networks
   - Use worker threads for computations
   - Enable progressive rendering

## 📈 Performance Benchmarks

### Network Visualization
| Network Size | Render Time | Memory Usage | FPS |
|--------------|-------------|--------------|-----|
| Small (< 1K neurons) | < 50ms | < 100MB | 60 |
| Medium (1K-10K) | < 100ms | < 500MB | 45-60 |
| Large (10K-100K) | < 200ms | < 1GB | 30-45 |
| Very Large (>100K) | < 500ms | < 2GB | 20-30 |

### Training Performance
| Dataset Size | Batch Size | Training Step | Memory Peak |
|--------------|------------|---------------|-------------|
| Small (<1000) | 32 | < 20ms | < 200MB |
| Medium (<10000) | 64 | < 50ms | < 500MB |
| Large (<100000) | 128 | < 100ms | < 1GB |
| Very Large (>100000) | 256 | < 200ms | < 2GB |

## 🛠️ Development

### Available Scripts
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Key Technologies
- **React 18.2.0**: UI framework
- **TypeScript 5.0.2**: Type safety
- **Material-UI 5.0.0**: UI components
- **Brain.js**: Neural network computations
- **WebGL**: Hardware-accelerated rendering

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [API Reference](./docs/api/README.md)
- [Architecture Guide](./docs/guides/architecture.md)
- [Examples](./docs/examples/README.md)
- [Contributing Guidelines](./docs/contributing/CONTRIBUTING.md)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Brain.js team for neural network implementation
- React and Material-UI teams
- All contributors and testers

---

<div align="center">
  Made with ❤️ by the Neural-Vis Team
</div>
