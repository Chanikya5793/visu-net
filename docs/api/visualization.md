# Visualization API Reference

## Components

### ErrorSurfaceViz

Visualizes the error surface of the neural network during training.

```typescript
import { ErrorSurfaceViz } from 'components/network/visualization/ErrorSurfaceViz';

interface ErrorSurfaceProps {
  data: ErrorSurfaceData;
  width?: number;
  height?: number;
  colorScale?: string[];
  interactive?: boolean;
}

// Example usage
const ErrorSurface = () => {
  return (
    <ErrorSurfaceViz
      data={errorData}
      width={600}
      height={400}
      colorScale={['#0000ff', '#ff0000']}
      interactive={true}
    />
  );
};
```

### WeightDistribution

Visualizes the distribution of weights in the network.

```typescript
import { WeightDistribution } from 'components/network/visualization/WeightDistribution';

interface WeightDistributionProps {
  weights: number[][];
  layerId: string;
  showHistogram?: boolean;
  binCount?: number;
}
```

### ActivationPatterns

Displays neuron activation patterns during inference.

```typescript
import { ActivationPatterns } from 'components/network/visualization/ActivationPatterns';

interface ActivationPatternsProps {
  layer: Layer;
  activations: number[][];
  highlightThreshold?: number;
  animate?: boolean;
}
```

## Hooks

### useVisualization

Custom hook for managing visualization state and updates.

```typescript
const useVisualization = (config: VisualizationConfig) => {
  const [viewState, setViewState] = useState<ViewState>();
  const [metrics, setMetrics] = useState<VisualizationMetrics>();

  // Update methods
  const updateView = (newState: Partial<ViewState>) => {
    setViewState(prev => ({ ...prev, ...newState }));
  };

  return { viewState, metrics, updateView };
};
```

## Utilities

### Color Scales

```typescript
const generateColorScale = (
  startColor: string,
  endColor: string,
  steps: number
): string[] => {
  // Implementation
};

const getActivationColor = (value: number): string => {
  return `rgb(
    ${Math.floor(255 * value)},
    ${Math.floor(255 * (1 - value))},
    0
  )`;
};
```

### Layout Calculations

```typescript
const calculateNetworkLayout = (
  layers: Layer[],
  width: number,
  height: number
): LayoutData => {
  const layerSpacing = width / (layers.length + 1);
  const maxNeurons = Math.max(...layers.map(l => l.neurons));
  const neuronSpacing = height / (maxNeurons + 1);

  return {
    layerSpacing,
    neuronSpacing,
    neuronRadius: Math.min(layerSpacing, neuronSpacing) * 0.3
  };
};
```

## Animation

### Transition Effects

```typescript
interface TransitionConfig {
  duration: number;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  delay?: number;
}

const animateWeightChanges = (
  oldWeights: number[][],
  newWeights: number[][],
  config: TransitionConfig,
  onFrame: (weights: number[][]) => void
) => {
  // Implementation
};
```

## Examples

### Basic Error Surface Plot

```typescript
const ErrorSurfacePlot = () => {
  const [data, setData] = useState<ErrorSurfaceData>();

  useEffect(() => {
    // Update error surface data during training
    const updateInterval = setInterval(() => {
      const newData = calculateErrorSurface(network);
      setData(newData);
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [network]);

  return (
    <ErrorSurfaceViz
      data={data}
      width={800}
      height={600}
      interactive={true}
    />
  );
};
```

### Animated Weight Updates

```typescript
const WeightViz = () => {
  const { weights, updateWeights } = useNetwork();

  return (
    <WeightDistribution
      weights={weights}
      layerId="hidden1"
      showHistogram={true}
      binCount={50}
      animate={{
        duration: 500,
        easing: 'easeInOut'
      }}
    />
  );
};
```

### Custom Visualization Theme

```typescript
const theme: VisualizationTheme = {
  colors: {
    background: '#ffffff',
    neuron: '#2196f3',
    connection: '#757575',
    activation: ['#ff0000', '#00ff00'],
    text: '#000000'
  },
  sizes: {
    neuronRadius: 8,
    connectionWidth: 1,
    fontSize: 12
  },
  animation: {
    duration: 300,
    easing: 'easeInOut'
  }
};
``` 