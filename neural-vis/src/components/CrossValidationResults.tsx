// src/components/CrossValidationResults.tsx
import { Box, Paper, Typography } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface CrossValidationResultsProps {
  results: Array<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>;
}

export const CrossValidationResults: React.FC<CrossValidationResultsProps> = ({ results }) => {
  const averageMetrics = {
    accuracy: results.reduce((acc, r) => acc + r.accuracy, 0) / results.length,
    precision: results.reduce((acc, r) => acc + r.precision, 0) / results.length,
    recall: results.reduce((acc, r) => acc + r.recall, 0) / results.length,
    f1Score: results.reduce((acc, r) => acc + r.f1Score, 0) / results.length,
  };

  const chartData = results.map((result, idx) => ({
    fold: `Fold ${idx + 1}`,
    ...result
  }));

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Cross-Validation Results</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
        {Object.entries(averageMetrics).map(([metric, value]) => (
          <Box key={metric} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Average {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </Typography>
            <Typography variant="h6">
              {(value * 100).toFixed(2)}%
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="fold" />
            <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#2196f3" />
            <Line type="monotone" dataKey="precision" stroke="#4caf50" />
            <Line type="monotone" dataKey="recall" stroke="#ff9800" />
            <Line type="monotone" dataKey="f1Score" stroke="#f44336" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};