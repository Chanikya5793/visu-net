# Utilities API Reference

## Math Utilities

### Matrix Operations

```typescript
interface MatrixOperations {
  multiply(a: number[][], b: number[][]): number[][];
  transpose(matrix: number[][]): number[][];
  add(a: number[][], b: number[][]): number[][];
  subtract(a: number[][], b: number[][]): number[][];
  hadamard(a: number[][], b: number[][]): number[][];
}

// Example usage
const matrixOps = {
  multiply: (a, b) => {
    // Matrix multiplication implementation
  },
  transpose: (matrix) => {
    return matrix[0].map((_, i) => matrix.map(row => row[i]));
  }
  // ... other implementations
};
```

### Activation Functions

```typescript
interface ActivationFunction {
  forward: (x: number) => number;
  backward: (x: number) => number;
}

const activations: Record<string, ActivationFunction> = {
  relu: {
    forward: (x) => Math.max(0, x),
    backward: (x) => x > 0 ? 1 : 0
  },
  sigmoid: {
    forward: (x) => 1 / (1 + Math.exp(-x)),
    backward: (x) => {
      const s = 1 / (1 + Math.exp(-x));
      return s * (1 - s);
    }
  },
  tanh: {
    forward: (x) => Math.tanh(x),
    backward: (x) => 1 - Math.pow(Math.tanh(x), 2)
  }
};
```

## Data Utilities

### Data Processing

```typescript
interface DataProcessor {
  normalize(data: number[]): number[];
  standardize(data: number[]): number[];
  oneHotEncode(labels: number[], numClasses: number): number[][];
  shuffle<T>(array: T[]): T[];
}

const dataUtils: DataProcessor = {
  normalize: (data) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    return data.map(x => (x - min) / (max - min));
  },
  standardize: (data) => {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const std = Math.sqrt(
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length
    );
    return data.map(x => (x - mean) / std);
  },
  // ... other implementations
};
```

### Data Validation

```typescript
interface DataValidator {
  validateShape(data: any[][], expectedShape: number[]): boolean;
  validateRange(data: number[], min: number, max: number): boolean;
  validateTypes(data: any[], expectedType: string): boolean;
}

const validateTrainingData = (
  data: TrainingData,
  config: ValidationConfig
): ValidationResult => {
  // Implementation
};
```

## File Utilities

### Model Serialization

```typescript
interface ModelSerializer {
  saveModel(model: NeuralNetwork, path: string): Promise<void>;
  loadModel(path: string): Promise<NeuralNetwork>;
  exportWeights(model: NeuralNetwork): string;
  importWeights(weights: string, model: NeuralNetwork): void;
}

const modelIO: ModelSerializer = {
  saveModel: async (model, path) => {
    const serialized = JSON.stringify(model.toJSON());
    // Save implementation
  },
  // ... other implementations
};
```

### Data Import/Export

```typescript
interface DataIO {
  loadCSV(path: string): Promise<number[][]>;
  saveCSV(data: number[][], path: string): Promise<void>;
  loadJSON(path: string): Promise<any>;
  saveJSON(data: any, path: string): Promise<void>;
}
```

## Performance Utilities

### Memory Management

```typescript
interface MemoryManager {
  clearCache(): void;
  getMemoryUsage(): number;
  optimizeMemory(data: any[]): any[];
}

const memoryUtils: MemoryManager = {
  clearCache: () => {
    // Implementation
  },
  // ... other implementations
};
```

### Performance Monitoring

```typescript
interface PerformanceMonitor {
  startTimer(label: string): void;
  endTimer(label: string): number;
  getMetrics(): PerformanceMetrics;
  resetMetrics(): void;
}

const monitor: PerformanceMonitor = {
  startTimer: (label) => {
    performance.mark(`${label}-start`);
  },
  endTimer: (label) => {
    performance.mark(`${label}-end`);
    const measure = performance.measure(
      label,
      `${label}-start`,
      `${label}-end`
    );
    return measure.duration;
  }
};
```

## Visualization Utilities

### Color Utilities

```typescript
interface ColorUtils {
  interpolateColor(color1: string, color2: string, factor: number): string;
  generateColorScale(colors: string[], steps: number): string[];
  rgbToHex(r: number, g: number, b: number): string;
  hexToRgb(hex: string): { r: number; g: number; b: number };
}
```

### SVG Utilities

```typescript
interface SVGUtils {
  createPath(points: Point[]): string;
  calculateBezierCurve(start: Point, end: Point, control1: Point, control2: Point): string;
  generateArrow(from: Point, to: Point, size: number): string;
}

interface Point {
  x: number;
  y: number;
}
```

## Examples

### Using Matrix Operations

```typescript
const weights = matrixOps.multiply(
  layerOutputs,
  matrixOps.transpose(nextLayerWeights)
);
```

### Data Processing Pipeline

```typescript
const preprocessPipeline = async (data: number[][]) => {
  // Normalize the data
  const normalizedData = data.map(row => dataUtils.normalize(row));
  
  // Shuffle the dataset
  const shuffledData = dataUtils.shuffle(normalizedData);
  
  // Split into training and validation
  const splitIndex = Math.floor(data.length * 0.8);
  return {
    training: shuffledData.slice(0, splitIndex),
    validation: shuffledData.slice(splitIndex)
  };
};
```

### Performance Monitoring

```typescript
const trainWithMonitoring = async () => {
  monitor.startTimer('training');
  
  await network.train(data);
  
  const trainingTime = monitor.endTimer('training');
  console.log(`Training completed in ${trainingTime}ms`);
};
``` 