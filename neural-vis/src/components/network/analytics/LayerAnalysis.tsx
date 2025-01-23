import { Box, Paper, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { InfoTooltip } from '../controls/InfoTooltip';

interface LayerAnalysisProps {
  layer: number;
  layers: number[];
  activations?: number[][];
  weights?: number[][][];
  gradients?: number[][][];
  biases?: number[][];
}

export const LayerAnalysis: React.FC<LayerAnalysisProps> = ({
  layer,
  layers,
  activations,
  weights,
  gradients,
  biases
}) => {
  const theme = useTheme();

  // Calculate layer statistics
  const getLayerStats = () => {
    if (!activations?.[layer]) return null;

    const layerActivations = activations[layer];
    const mean = layerActivations.reduce((sum, val) => sum + val, 0) / layerActivations.length;
    const variance = layerActivations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / layerActivations.length;
    const stdDev = Math.sqrt(variance);
    const max = Math.max(...layerActivations);
    const min = Math.min(...layerActivations);

    return { mean, stdDev, max, min };
  };

  // Get weight distribution data for visualization
  const getWeightDistribution = () => {
    if (!weights || layer === 0 || !weights[layer - 1]) return [];

    const layerWeights = weights[layer - 1].flat();
    if (layerWeights.length === 0) return [];

    const bins = 20;
    const min = Math.min(...layerWeights);
    const max = Math.max(...layerWeights);
    const binSize = (max - min) / bins;

    const distribution = Array(bins).fill(0);
    layerWeights.forEach(weight => {
      const binIndex = Math.min(Math.floor((weight - min) / binSize), bins - 1);
      distribution[binIndex]++;
    });

    return distribution.map((count, i) => ({
      weight: (min + (i + 0.5) * binSize).toFixed(2),
      count
    }));
  };

  // Get gradient information
  const getGradientStats = () => {
    if (!gradients || layer === 0) return null;

    const layerGradients = gradients[layer - 1].flat();
    const mean = layerGradients.reduce((sum, val) => sum + val, 0) / layerGradients.length;
    const max = Math.max(...layerGradients);
    const min = Math.min(...layerGradients);
    const magnitude = Math.sqrt(layerGradients.reduce((sum, val) => sum + val * val, 0));

    return { mean, max, min, magnitude };
  };

  const stats = getLayerStats();
  const gradientStats = getGradientStats();

  return (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {layer === 0 ? 'Input Layer' : 
           layer === layers.length - 1 ? 'Output Layer' : 
           `Hidden Layer ${layer}`} Analysis
        </Typography>
        <InfoTooltip
          title="Layer Analysis"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Detailed analysis of layer characteristics:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Activation Statistics: Distribution of neuron activations</li>
                <li>Weight Distribution: Pattern of connection strengths</li>
                <li>Gradient Information: Learning dynamics</li>
                <li>Layer Topology: Structural information</li>
              </Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
        {/* Activation Statistics */}
        {stats && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Activation Statistics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">Mean: {stats.mean.toFixed(4)}</Typography>
              <Typography variant="body2">Std Dev: {stats.stdDev.toFixed(4)}</Typography>
              <Typography variant="body2">Max: {stats.max.toFixed(4)}</Typography>
              <Typography variant="body2">Min: {stats.min.toFixed(4)}</Typography>
            </Box>
          </Box>
        )}

        {/* Weight Distribution Chart */}
        {layer > 0 && weights && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Weight Distribution</Typography>
            <Box sx={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeightDistribution()}>
                  <XAxis dataKey="weight" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Gradient Information */}
        {gradientStats && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Gradient Information</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">Mean Gradient: {gradientStats.mean.toFixed(4)}</Typography>
              <Typography variant="body2">Max Gradient: {gradientStats.max.toFixed(4)}</Typography>
              <Typography variant="body2">Min Gradient: {gradientStats.min.toFixed(4)}</Typography>
              <Typography variant="body2">Gradient Magnitude: {gradientStats.magnitude.toFixed(4)}</Typography>
            </Box>
          </Box>
        )}

        {/* Layer Topology */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>Layer Topology</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">Neurons: {layers[layer]}</Typography>
            {layer > 0 && (
              <Typography variant="body2">
                Input Connections: {layers[layer - 1] * layers[layer]}
              </Typography>
            )}
            {layer < layers.length - 1 && (
              <Typography variant="body2">
                Output Connections: {layers[layer] * layers[layer + 1]}
              </Typography>
            )}
            {biases && (
              <Typography variant="body2">
                Average Bias: {(biases[layer]?.reduce((sum, b) => sum + b, 0) / layers[layer] || 0).toFixed(4)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}; 