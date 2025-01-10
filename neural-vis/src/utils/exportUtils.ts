// src/utils/exportUtils.ts
import JSZip from 'jszip';

export const downloadFile = (data: any, filename: string, type: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: any[]) => {
  if (!data.length) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return `${headers}\n${rows.join('\n')}`;
};

export const createModelExport = async (
  modelData: any, 
  dataset: any[], 
  trainingInfo: any,
  modelName: string
) => {
  const zip = new JSZip();

  // Add JSON format of complete data
  zip.file("model-complete.json", JSON.stringify({
    model: modelData,
    dataset: dataset,
    trainingInfo: trainingInfo
  }, null, 2));

  // Add CSV format of dataset
  zip.file("dataset.csv", exportToCSV(dataset));

  // Add ML specific format (weights and biases in standard format)
  const mlFormatted = {
    weights: modelData.layers.map((layer: any) => layer.weights),
    biases: modelData.layers.map((layer: any) => layer.biases),
    architecture: trainingInfo.architecture,
    activation: modelData.activation || 'sigmoid',
    metadata: {
      datasetType: trainingInfo.datasetType,
      epochs: trainingInfo.epochs,
      learningRate: trainingInfo.learningRate,
      performance: trainingInfo.metrics
    }
  };
  zip.file("model-ml.json", JSON.stringify(mlFormatted, null, 2));

  // Create and return ZIP file
  return await zip.generateAsync({ type: "blob" });
};