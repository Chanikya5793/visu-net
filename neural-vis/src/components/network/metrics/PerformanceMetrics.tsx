/**
 * PerformanceMetrics Component
 * 
 * Displays key performance metrics for the neural network including accuracy,
 * precision, recall, and F1 score in a well-organized grid layout.
 * 
 * Props:
 * - metrics: Object containing performance metrics (accuracy, precision, recall, f1Score)
 * 
 * Layout Configuration:
 * - Container: Uses Material-UI Paper with elevation and spacing
 * - Grid: 4-column layout for metric display
 * - Spacing: Consistent padding and margins (adjust values below)
 * 
 * To adjust spacing:
 * - Overall padding: Modify 'p' in the Paper sx prop (currently 3)
 * - Top margin: Modify 'mt' in the Paper sx prop (currently 3)
 * - Grid gap: Modify 'gap' in the grid Box sx prop (currently 3)
 * - Bottom margin: Modify 'mb' in the Paper sx prop (currently 3)
 */

import { Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { NeuronVizProps } from '../../../types/neuron-viz.types';
import { InfoTooltip } from '../controls/InfoTooltip';

interface PerformanceMetricsProps {
  metrics: NeuronVizProps['performanceMetrics'];
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics }) => {
  if (!metrics) return null;
  
  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3,          // Padding around content
        mt: 3,         // Top margin
        mb: 3,         // Bottom margin
        borderRadius: 2 // Rounded corners
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Performance Metrics</Typography>
        <InfoTooltip
          title="Performance Metrics"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Key metrics showing network performance:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Accuracy: Percentage of correct predictions overall</li>
                <li>Precision: True positives / (True + False positives)</li>
                <li>Recall: True positives / (True positives + False negatives)</li>
                <li>F1 Score: Harmonic mean of precision and recall</li>
              </Typography>
            </Box>
          }
        />
      </Box>
      
      {/* Metrics Grid - 4 columns with equal spacing */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: 3,        // Gap between grid items
        mt: 2          // Space after heading
      }}>
        {/* Accuracy */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Accuracy
          </Typography>
          <Typography variant="h6">
            {(metrics.accuracy * 100).toFixed(1)}%
          </Typography>
        </Box>

        {/* Precision */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Precision
          </Typography>
          <Typography variant="h6">
            {(metrics.precision * 100).toFixed(1)}%
          </Typography>
        </Box>

        {/* Recall */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Recall
          </Typography>
          <Typography variant="h6">
            {(metrics.recall * 100).toFixed(1)}%
          </Typography>
        </Box>

        {/* F1 Score */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            F1 Score
          </Typography>
          <Typography variant="h6">
            {(metrics.f1Score * 100).toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}; 