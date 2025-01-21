import { LogicGateTrainer } from '../models/logicGates/train';
import { FitnessTrainer } from '../models/fitnessClassification/train';
import { WeatherTrainer } from '../models/weatherPrediction/train';
import { ITrainer } from '../models/TrainerInterface';

export const createTrainer = (dataset: string): ITrainer | null => {
  switch(dataset) {
    case 'logicGates':
      return new LogicGateTrainer();
    case 'fitnessClassification':
      return new FitnessTrainer();
    case 'weatherPrediction':
      return new WeatherTrainer();
    default:
      return null;
  }
};