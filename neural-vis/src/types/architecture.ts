import { PerformanceMetrics } from '../models/TrainerInterface';

export interface ArchitectureTestResult {
  layers: number[];
  metrics: PerformanceMetrics;
  trainTime: number;
}