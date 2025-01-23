import { Box, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TrainingAnalyticsProps {
  weights: number[][][];
  activations: number[][];
  gradients: number[][];
  metrics: {
    epoch: number;
    loss: number;
    accuracy: number;
  }[];
}

export const TrainingAnalytics: React.FC<TrainingAnalyticsProps> = ({
  weights,
  activations,
  gradients,
  metrics
}) => {
  const theme = useTheme();

  // Calculate weight distribution data
  const getWeightDistributionData = () => {
    const flatWeights = weights.flat(2);
    const bins = 20;
    const min = Math.min(...flatWeights);
    const max = Math.max(...flatWeights);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    flatWeights.forEach(w => {
      const binIndex = Math.min(bins - 1, Math.floor((w - min) / binSize));
      histogram[binIndex]++;
    });

    return histogram.map((count, idx) => ({
      weight: (min + (idx + 0.5) * binSize).toFixed(2),
      count
    }));
  };

  // Calculate gradient magnitude data
  const getGradientData = () => {
    return gradients.map((layerGradients, idx) => ({
      layer: `Layer ${idx + 1}`,
      magnitude: Math.sqrt(layerGradients.reduce((sum, g) => sum + g * g, 0))
    }));
  };

  // Find critical neurons (neurons with highest activation variance)
  const getCriticalNeurons = () => {
    return activations.map((layerActivations, layerIdx) => {
      const mean = layerActivations.reduce((sum, a) => sum + a, 0) / layerActivations.length;
      const variance = layerActivations.map(a => Math.pow(a - mean, 2))
        .reduce((sum, v) => sum + v, 0) / layerActivations.length;
      
      return {
        layer: `Layer ${layerIdx + 1}`,
        variance,
        meanActivation: mean
      };
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Advanced Training Analytics</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        {/* Weight Distribution */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Weight Distribution</Typography>
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getWeightDistributionData()}>
                <XAxis dataKey="weight" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Gradient Magnitudes */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Gradient Magnitudes</Typography>
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getGradientData()}>
                <XAxis dataKey="layer" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="magnitude" 
                  stroke={theme.palette.secondary.main}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Critical Neurons */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Critical Neurons Analysis</Typography>
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCriticalNeurons()}>
                <XAxis dataKey="layer" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="variance" 
                  name="Activation Variance"
                  stroke={theme.palette.error.main}
                  dot={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="meanActivation" 
                  name="Mean Activation"
                  stroke={theme.palette.success.main}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}; 