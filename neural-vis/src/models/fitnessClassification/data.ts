import fitnessClassificationJson from './fitnessClassification.json';

interface FitnessData {
  "Heart Rate (bpm)": string;
  "Stamina Level": string;
  "BMI": string;
  "Fitness Classification": string;
  "": string; // Consider removing if not needed
}

interface TrainingData {
  input: number[];  // [hr60_75, hr76_90, hr91_110, hr111_130, hr131plus, stamHigh, stamMed, stamLow, bmiUnder, bmiNorm, bmiOver, bmiObese]
  output: number[]; // [fit, average, unfit]
}

// Helper functions to map categorical data to numerical values
export function mapHeartRate(hr: string): number[] {
  const ranges = ['60-75', '76-90', '91-110', '111-130', '131+'];
  return ranges.map(range => hr === range ? 1 : 0);
}

export function mapStamina(stamina: string): number[] {
  const levels = ['High', 'Medium', 'Low'];
  return levels.map(level => stamina === level ? 1 : 0);
}

export function mapBMI(bmi: string): number[] {
  const types = ['Underweight', 'Normal', 'Overweight', 'Obese'];
  return types.map(type => bmi === type ? 1 : 0);
}

export function mapFitness(fitness: string): number[] {
  const levels = ['Fit', 'Average', 'Unfit'];
  return levels.map(level => fitness === level ? 1 : 0);
}

export const fitnessData = {
  training: fitnessClassificationJson.map((entry: any) => ({
    input: [
      ...mapHeartRate(entry["Heart Rate (bpm)"]),
      ...mapStamina(entry["Stamina Level"]),
      ...mapBMI(entry["BMI"])
    ],
    output: mapFitness(entry["Fitness Classification"])
  }))
};