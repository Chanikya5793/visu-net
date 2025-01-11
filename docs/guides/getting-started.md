# Getting Started with Visu-Net

This guide will help you get started with Visu-Net, from installation to creating your first neural network visualization.

## Quick Start

### Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm (v8 or higher)
- A modern web browser
- Basic understanding of React and TypeScript

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/visu-net.git
cd visu-net/neural-vis
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Your First Visualization

### 1. Create a Basic Network

```typescript
import React from 'react';
import { NetworkVisualization } from 'components/network/visualization';

const MyFirstNetwork = () => {
  const layers = [
    { id: 'input', type: 'input', neurons: 3 },
    { id: 'hidden', type: 'hidden', neurons: 4, activation: 'relu' },
    { id: 'output', type: 'output', neurons: 2, activation: 'softmax' }
  ];

  return (
    <div style={{ width: '800px', height: '600px' }}>
      <NetworkVisualization layers={layers} />
    </div>
  );
};

export default MyFirstNetwork;
```

### 2. Add Interactivity

```typescript
const InteractiveNetwork = () => {
  const handleLayerClick = (layer: Layer) => {
    console.log(`Clicked layer: ${layer.id}`);
  };

  const handleNeuronHover = (neuron: Neuron) => {
    console.log(`Neuron activation: ${neuron.activation}`);
  };

  return (
    <NetworkVisualization
      layers={layers}
      onLayerClick={handleLayerClick}
      onNeuronHover={handleNeuronHover}
    />
  );
};
```

### 3. Customize Appearance

```typescript
const theme: NetworkTheme = {
  colors: {
    background: '#ffffff',
    neuron: '#2196f3',
    connection: '#757575',
    highlight: '#ff4081'
  },
  sizes: {
    neuronRadius: 8,
    connectionWidth: 1
  }
};

const StyledNetwork = () => (
  <NetworkVisualization
    layers={layers}
    theme={theme}
  />
);
```

## Training Visualization

### 1. Set Up Training

```typescript
import { useNetwork } from 'components/network/hooks';

const TrainingVisualization = () => {
  const { network, startTraining } = useNetwork({
    inputSize: 3,
    hiddenLayers: [4],
    outputSize: 2
  });

  const handleStartTraining = async () => {
    const trainingData = {
      inputs: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
      outputs: [[0, 1], [1, 0], [1, 0], [0, 1]]
    };

    await startTraining(trainingData);
  };

  return (
    <div>
      <NetworkVisualization network={network} />
      <button onClick={handleStartTraining}>Start Training</button>
    </div>
  );
};
```

### 2. Add Performance Metrics

```typescript
import { PerformanceMetrics } from 'components/network/metrics';

const NetworkWithMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    loss: 0,
    accuracy: 0
  });

  const handleTrainingStep = (stepMetrics: Metrics) => {
    setMetrics(stepMetrics);
  };

  return (
    <div>
      <NetworkVisualization
        network={network}
        onTrainingStep={handleTrainingStep}
      />
      <PerformanceMetrics metrics={metrics} />
    </div>
  );
};
```

## Next Steps

1. Explore more complex network architectures in the [Architecture Guide](architecture.md)
2. Learn about advanced visualization features in the [Visualization Guide](visualization.md)
3. Understand training options in the [Training Guide](training.md)
4. Check out the [API Reference](../api/README.md) for detailed documentation

## Common Issues

### Performance

- For large networks, consider reducing the visualization update frequency
- Use `React.memo` for components that don't need frequent updates
- Enable hardware acceleration in your browser

### Browser Compatibility

- Ensure you're using a modern browser
- Check console for any WebGL-related warnings
- Verify that JavaScript is enabled

## Getting Help

- Check the [FAQ](faq.md) for common questions
- Visit our [GitHub Issues](https://github.com/yourusername/visu-net/issues) page
- Join our [Discord community](https://discord.gg/visu-net)

Remember to replace placeholder values (like repository URLs and community links) with your actual project information. 