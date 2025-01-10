import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import {
    Bar,
    BarChart,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';
import { InfoTooltip } from '../controls/InfoTooltip';
import './WeightDistribution.css';

interface WeightDistributionProps {
  weights: number[][][];
}

interface ChartData {
  weight: string;
  count: number;
}

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

  const chartData: ChartData[] = histogram.map((count, idx) => ({
    weight: (min + (idx + 0.5) * binSize).toFixed(2),
    count
  }));

  return (
    <Paper sx={{ p: 2, mt: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Weight Distribution</Typography>
        <InfoTooltip
          title="Weight Distribution"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Visualizes the distribution of connection weights:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>X-axis: Weight values from negative to positive</li>
                <li>Y-axis: Number of connections with each weight value</li>
                <li>Shape: Bell curve indicates balanced learning</li>
                <li>Spread: Width shows the range of weight values</li>
              </Typography>
            </Box>
          }
        />
      </Box>
      <Box sx={{ height: 200, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis 
              dataKey="weight" 
              label={{ value: 'Weight Value', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="weight-tooltip">
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