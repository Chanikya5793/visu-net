import { Box, Paper, Typography } from '@mui/material';
import { LinearProgress } from '@mui/material';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar 
} from 'recharts';
interface ProbabilityDistributionProps {
  prediction: number[];
  dataset: string;
}

export const ProbabilityDistribution: React.FC<ProbabilityDistributionProps> = ({ prediction, dataset }) => {
  const getLabels = (): string[] => {
    switch(dataset) {
      case 'logicGates':
        return ['True (1)', 'False (0)'];
      case 'fitnessClassification':
        return ['Fit', 'Average', 'Unfit'];
      case 'weatherPrediction':
        return ['Rain Probability'];
      default:
        return [];
    }
  };

  const getChartData = (prediction: number[], dataset: string) => {
    const labels = getLabels();
    return prediction.map((prob, idx) => ({
      class: labels[idx],
      probability: prob
    }));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Prediction Distribution</Typography>
      
      {/* Radar Chart for multi-class predictions */}
      {dataset !== 'weatherPrediction' && (
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer>
            <RadarChart data={getChartData(prediction, dataset)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="class" />
              <PolarRadiusAxis domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <Radar dataKey="probability" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Bar chart for single-value predictions */}
      {dataset === 'weatherPrediction' && (
        <Box sx={{ height: 100 }}>
          <LinearProgress
            variant="determinate"
            value={prediction[0] * 100}
            sx={{
              height: 20,
              borderRadius: 1,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #2196f3, #21CBF3)'
              }
            }}
          />
          <Typography align="center" sx={{ mt: 1 }}>
            {(prediction[0] * 100).toFixed(1)}% chance of rain
          </Typography>
        </Box>
      )}
    </Box>
  );
};