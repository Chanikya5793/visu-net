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