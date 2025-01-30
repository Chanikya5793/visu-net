/**
 * MetricsGraph Component
 * 
 * A React component that visualizes training metrics (loss and accuracy) over epochs
 * using a responsive line chart from Recharts library.
 * 
 * Features:
 * - Real-time visualization of training metrics
 * - Dual-axis display of loss and accuracy
 * - Interactive tooltips for detailed values
 * - Responsive design that adapts to container size
 * - Color-coded lines for easy metric differentiation
 * - Optional title display
 * 
 * Props:
 * @param {Object[]} data - Array of metric data points
 * @param {number} data[].epoch - Training epoch number
 * @param {number} data[].loss - Loss value for the epoch
 * @param {number} data[].accuracy - Accuracy value for the epoch
 * @param {string} [title] - Optional title for the graph
 * 
 * Styling:
 * - Loss line: Red (#f44336)
 * - Accuracy line: Green (#4caf50)
 * - Responsive container with 200px height
 * 
 * @component
 */

// src/components/MetricsGraph.tsx
import { Box, Typography } from '@mui/material';
import React from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface MetricsGraphProps {
  data: {
    epoch: number;
    loss: number;
    accuracy: number;
  }[];
  title?: string;
}

export const MetricsGraph: React.FC<MetricsGraphProps> = ({ data, title }) => {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="epoch" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="loss" 
            stroke="#f44336" 
            name="Loss"
          />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="#4caf50" 
            name="Accuracy"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};