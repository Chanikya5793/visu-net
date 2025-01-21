// src/components/ArchitectureComparisonChart.tsx
import { Box, Typography } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ArchitectureTestResult } from '../types/architecture';

export const ArchitectureComparisonChart: React.FC<{
  results: ArchitectureTestResult[];
}> = ({ results }) => {
  return (
    <Box sx={{ mt: 2, height: 400 }}>
      <Typography variant="h6">Architecture Comparison</Typography>
      <ResponsiveContainer>
        <BarChart data={results}>
          <XAxis 
            dataKey="layers" 
            tickFormatter={(layers) => `${layers.length} layers`}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="metrics.accuracy" name="Accuracy" fill="#2196f3" />
          <Bar dataKey="metrics.f1Score" name="F1 Score" fill="#4caf50" />
          <Bar 
            dataKey="trainTime" 
            name="Training Time (ms)" 
            fill="#ff9800" 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};