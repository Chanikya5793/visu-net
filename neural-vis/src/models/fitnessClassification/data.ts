export interface FitnessData {
  age: number;
  weight: number;
  height: number;
  activity: number; // 1-5 scale
}

// Normalize data to 0-1 range
export function normalizeData(data: FitnessData) {
  return {
    input: [
      data.age / 100, // Assuming max age 100
      data.weight / 200, // Assuming max weight 200kg
      data.height / 250, // Assuming max height 250cm
      data.activity / 5  // Activity is 1-5 scale
    ],
    output: [0] // Will be set based on classification
  };
}

// Sample training data
export const fitnessData = {
  training: [
    // Add your fitness data here from text document
    // Example:
    { input: [0.25, 0.35, 0.68, 0.8], output: [1] }, // Fit
    { input: [0.45, 0.85, 0.65, 0.2], output: [0] }  // Unfit
  ]
};