// src/components/MetricsGraph.tsx
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface MetricPoint {
  epoch: number;
  loss: number;
  accuracy: number;
}

interface MetricsGraphProps {
  metricsHistory: MetricPoint[];
}

export const MetricsGraph: React.FC<MetricsGraphProps> = ({ metricsHistory }) => (
  <Box sx={{ mt: 4, height: 400 }}>
    <Typography variant="h6" gutterBottom>Training Metrics</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
      {/* Loss Graph */}
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart
            data={metricsHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epoch" label={{ value: 'Epochs', position: 'bottom' }} />
            <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="loss" stroke="#8884d8" name="Loss" />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Accuracy Graph */}
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart
            data={metricsHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epoch" label={{ value: 'Epochs', position: 'bottom' }} />
            <YAxis 
              label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
              domain={[0, 1]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" name="Accuracy" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  </Box>
);