// src/utils/exportUtils.ts
/**
 * Export Utilities Module
 * 
 * A collection of utility functions for exporting neural network models and datasets
 * in various formats (JSON, CSV, ZIP). Provides standardized export functionality
 * with proper file type handling and data formatting.
 * 
 * Features:
 * - Model export to multiple formats
 * - Dataset export to CSV
 * - ZIP archive creation for complete model packages
 * - Blob handling and file downloads
 * 
 * Export Formats:
 * - JSON: Complete model configuration
 * - CSV: Dataset in tabular format
 * - ZIP: Combined package with model, dataset, and metadata
 * 
 * @module exportUtils
 */

import JSZip from 'jszip';

/**
 * Downloads a file with the specified data, filename, and type
 * 
 * @param {any} data - The data to be downloaded
 * @param {string} filename - Name of the file to be created
 * @param {string} type - MIME type of the file
 */
export const downloadFile = (data: any, filename: string, type: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Converts array data to CSV format
 * 
 * @param {any[]} data - Array of objects to be converted to CSV
 * @returns {string} CSV formatted string
 */
export const exportToCSV = (data: any[]) => {
  if (!data.length) return '';
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return `${headers}\n${rows.join('\n')}`;
};

/**
 * Creates a ZIP archive containing model data in multiple formats
 * 
 * @param {any} modelData - Neural network model configuration
 * @param {any[]} dataset - Training dataset
 * @param {any} trainingInfo - Training parameters and metrics
 * @param {string} modelName - Name of the model for file naming
 * @returns {Promise<Blob>} ZIP file as a Blob
 * 
 * Archive Contents:
 * - model-complete.json: Full model configuration
 * - dataset.csv: Training data in CSV format
 * - model-ml.json: ML-specific format with weights and architecture
 */
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