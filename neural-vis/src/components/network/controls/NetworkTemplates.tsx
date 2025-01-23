import { Box, Button, Card, CardActions, CardContent, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { InfoTooltip } from './InfoTooltip';

export interface NetworkTemplate {
  id: string;
  name: string;
  description: string;
  layers: number[];
  recommendedLearningRate: number;
  suitableFor: string[];
}

const PREDEFINED_TEMPLATES: NetworkTemplate[] = [
  {
    id: 'simple',
    name: 'Simple Network',
    description: 'Basic network with one hidden layer. Good for simple classification tasks.',
    layers: [4, 8, 3],
    recommendedLearningRate: 0.01,
    suitableFor: ['Binary Classification', 'Simple Pattern Recognition']
  },
  {
    id: 'deep',
    name: 'Deep Network',
    description: 'Deep architecture with multiple hidden layers for complex feature extraction.',
    layers: [4, 16, 8, 4, 3],
    recommendedLearningRate: 0.001,
    suitableFor: ['Complex Pattern Recognition', 'Feature Extraction']
  },
  {
    id: 'wide',
    name: 'Wide Network',
    description: 'Wide architecture with large hidden layers for capturing diverse patterns.',
    layers: [4, 32, 32, 3],
    recommendedLearningRate: 0.005,
    suitableFor: ['Multi-class Classification', 'Pattern Recognition']
  },
  {
    id: 'balanced',
    name: 'Balanced Network',
    description: 'Balanced architecture with gradually decreasing layer sizes.',
    layers: [4, 16, 12, 8, 3],
    recommendedLearningRate: 0.008,
    suitableFor: ['General Purpose', 'Balanced Learning']
  }
];

interface NetworkTemplatesProps {
  onSelectTemplate: (template: NetworkTemplate) => void;
  currentLayers: number[];
}

export const NetworkTemplates: React.FC<NetworkTemplatesProps> = ({
  onSelectTemplate,
  currentLayers
}) => {
  const isCurrentTemplate = (templateLayers: number[]) => {
    if (templateLayers.length !== currentLayers.length) return false;
    return templateLayers.every((layer, index) => layer === currentLayers[index]);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Network Architecture Templates</Typography>
        <InfoTooltip
          title="Network Templates"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Predefined network architectures optimized for different tasks:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Simple networks for basic tasks</li>
                <li>Deep networks for complex feature extraction</li>
                <li>Wide networks for diverse pattern recognition</li>
                <li>Balanced architectures for general purposes</li>
              </Typography>
            </Box>
          }
        />
      </Box>

      <Grid container spacing={2}>
        {PREDEFINED_TEMPLATES.map((template) => (
          <Grid item xs={12} sm={6} key={template.id}>
            <Card 
              variant="outlined"
              sx={{
                borderColor: isCurrentTemplate(template.layers) ? 'primary.main' : 'divider',
                bgcolor: isCurrentTemplate(template.layers) ? 'action.selected' : 'background.paper'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {template.description}
                </Typography>
                <Typography variant="body2">
                  Architecture: {template.layers.join(' → ')}
                </Typography>
                <Typography variant="body2">
                  Learning Rate: {template.recommendedLearningRate}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Suitable for:
                  </Typography>
                  <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                    {template.suitableFor.map((use, index) => (
                      <li key={index}>
                        <Typography variant="body2">{use}</Typography>
                      </li>
                    ))}
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => onSelectTemplate(template)}
                  disabled={isCurrentTemplate(template.layers)}
                >
                  {isCurrentTemplate(template.layers) ? 'Current Template' : 'Use Template'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 