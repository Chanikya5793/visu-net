import { ITrainer, PerformanceMetrics, TrainingOptions } from './TrainerInterface';

export class CrossValidator {
  private kFolds: number;
  private data: any[];
  
  constructor(data: any[], kFolds: number = 5) {
    this.data = data;
    this.kFolds = kFolds;
  }

  public async runKFoldValidation(
    trainer: ITrainer,
    onFoldComplete?: (metrics: PerformanceMetrics, fold: number) => void
  ): Promise<PerformanceMetrics[]> {
    const results: PerformanceMetrics[] = [];
    const foldSize = Math.floor(this.data.length / this.kFolds);

    for (let i = 0; i < this.kFolds; i++) {
      const testStart = i * foldSize;
      const testEnd = testStart + foldSize;
      
      const testData = this.data.slice(testStart, testEnd);
      const trainData = [
        ...this.data.slice(0, testStart),
        ...this.data.slice(testEnd)
      ];

      await trainer.train({
        epochs: 100,
        onComplete: async () => {
          const metrics = await trainer.getPerformanceMetrics();
          results.push(metrics);
          onFoldComplete?.(metrics, i + 1);
        }
      });
    }

    return results;
  }
}