import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import {
  Bar,
  BarChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  TooltipProps,
  XAxis,
  YAxis
} from 'recharts';
import { styles } from '../styles';
import { WeightDistributionProps } from '../types';

export const WeightDistribution: React.FC<WeightDistributionProps> = ({ weights }) => {
  const allWeights = weights.flat(2);
  const bins = 20;
  const min = Math.min(...allWeights);
  const max = Math.max(...allWeights);
  const binSize = (max - min) / bins;
  
  const histogram = new Array(bins).fill(0);
  allWeights.forEach(w => {
    const binIndex = Math.min(bins - 1, Math.floor((w - min) / binSize));
    histogram[binIndex]++;
  });

  return (
    <Paper sx={{ p: 2, mt: 2, width: '100%' }}>
      <Typography variant="h6">Weight Distribution</Typography>
      <Box sx={{ height: 200, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={histogram.map((count, idx) => ({
              weight: (min + (idx + 0.5) * binSize).toFixed(2),
              count
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="weight" 
              label={{ value: 'Weight Value', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip<number, string>
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={({ active, payload, label }: TooltipProps<number, string>) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={styles.tooltipContainer}>
                      <p>{`Weight: ${label}`}</p>
                      <p>{`Frequency: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}; 