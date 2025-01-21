import { PerformanceMetrics } from "../models/TrainerInterface";

// Declaration for self
declare const self: Worker;

// Helper function to compute metrics
function computeMetrics(predictions: number[][], actual: number[][]): PerformanceMetrics {
  let correct = 0;
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  predictions.forEach((pred, i) => {
    const predictedClass = pred.indexOf(Math.max(...pred));
    const actualClass = actual[i].indexOf(Math.max(...actual[i]));
    
    if (predictedClass === actualClass) correct++;
    if (predictedClass === 1 && actualClass === 1) truePositives++;
    if (predictedClass === 1 && actualClass === 0) falsePositives++;
    if (predictedClass === 0 && actualClass === 1) falseNegatives++;
  });

  const total = predictions.length;
  const accuracy = correct / total;
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

  return { accuracy, precision, recall, f1Score };
}

// Worker implementation
const worker = () => {
  self.onmessage = async (e: MessageEvent) => {
    const { type, data } = e.data;
    
    switch(type) {
      case 'TRAIN':
        const { network, trainingData, options } = data;
        await network.trainAsync(trainingData, {
          ...options,
          callback: (stats: any) => {
            self.postMessage({ type: 'PROGRESS', data: stats });
          }
        });
        self.postMessage({ type: 'COMPLETE', data: network.toJSON() });
        break;
        
      case 'COMPUTE_METRICS':
        const { predictions, actual } = data;
        const metrics = computeMetrics(predictions, actual);
        self.postMessage({ type: 'METRICS', data: metrics });
        break;
    }
  };
};

export default worker;