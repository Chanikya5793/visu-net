import fitnessClassificationJson from './fitnessClassification.json';

interface FitnessData {
  "Heart Rate (bpm)": string;
  "Stamina Level": string;
  "BMI": string;
  "Fitness Classification": string;
  "": string; // Consider removing if not needed
}

interface TrainingData {
  input: number[];
  output: number[];
}

// Helper functions to map categorical data to numerical values
export function mapHeartRate(hr: string): number {
  // Convert range to average
  const range = hr.split('-');
  if (range.length === 2) {
    const min = parseInt(range[0], 10);
    const max = parseInt(range[1], 10);
    return ((min + max) / 2) / 200; // Normalized (adjust denominator as needed)
  } else {
    // Handle cases like '131+'
    const value = parseInt(hr.replace('+', ''), 10);
    return value / 200; // Normalize based on expected max
  }
}

export function mapStamina(stamina: string): number {
  switch (stamina.toLowerCase()) {
    case 'high':
      return 1;
    case 'medium':
      return 0.5;
    case 'low':
      return 0;
    default:
      return 0;
  }
}

export function mapBMI(bmi: string): number {
  switch (bmi.toLowerCase()) {
    case 'underweight':
      return -1;
    case 'normal':
      return 0;
    case 'overweight':
      return 1;
    case 'obese':
      return 2;
    default:
      return 0;
  }
}

export function mapClassification(classification: string): number[] {
  switch (classification.toLowerCase()) {
    case 'fit': return [1, 0, 0];
    case 'average': return [0, 1, 0];
    case 'unfit': return [0, 0, 1];
    default: return [0, 0, 0];
  }
}

// Export function for interpreting predictions
export function interpretClassification(output: number[]): string {
  const maxIdx = output.indexOf(Math.max(...output));
  switch(maxIdx) {
    case 0: return 'Fit';
    case 1: return 'Average';
    case 2: return 'Unfit';
    default: return 'Unknown';
  }
}

export const fitnessData = {
  training: fitnessClassificationJson.map((entry: FitnessData) => {
    const heartRate = mapHeartRate(entry["Heart Rate (bpm)"]);
    const stamina = mapStamina(entry["Stamina Level"]);
    const bmi = mapBMI(entry["BMI"]);
    const classification = mapClassification(entry["Fitness Classification"]);

    return {
      input: [heartRate, bmi, stamina],
      output: classification  // Now outputs [1,0,0], [0,1,0], or [0,0,1]
    };
  })
};