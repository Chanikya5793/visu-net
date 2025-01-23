import { Box, Paper, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { ITrainer } from '../../../models/TrainerInterface';

interface ModelExplanationProps {
  trainer: ITrainer | null;
  dataset: string;
  weights: number[][][];
  activations: number[][];
}

interface FeatureImportance {
  feature: string;
  importance: number;
}

export const ModelExplanation: React.FC<ModelExplanationProps> = ({
  trainer,
  dataset,
  weights,
  activations
}) => {
  const theme = useTheme();
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);
  const [decisionBoundary, setDecisionBoundary] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>('');

  // Calculate feature importance based on weight magnitudes
  useEffect(() => {
    if (!weights.length) return;

    const importance = calculateFeatureImportance();
    setFeatureImportance(importance);
  }, [weights]);

  const calculateFeatureImportance = (): FeatureImportance[] => {
    const inputWeights = weights[0];
    if (!inputWeights) return [];

    const getFeatureName = (index: number) => {
      switch(dataset) {
        case 'logicGates':
          return `Input ${index + 1}`;
        case 'weatherPrediction':
          return ['Temperature', 'Humidity', 'Cloud Cover'][index] || `Feature ${index + 1}`;
        case 'fitnessClassification':
          return ['Heart Rate', 'BMI', 'Stamina'][index] || `Feature ${index + 1}`;
        default:
          return `Feature ${index + 1}`;
      }
    };

    return inputWeights[0].map((_, featureIndex) => {
      const totalImpact = inputWeights.reduce((sum, neuronWeights) => 
        sum + Math.abs(neuronWeights[featureIndex]), 0);
      
      return {
        feature: getFeatureName(featureIndex),
        importance: totalImpact
      };
    }).sort((a, b) => b.importance - a.importance);
  };

  // Generate decision boundary visualization data
  useEffect(() => {
    if (!trainer) return;

    const boundaryData = generateDecisionBoundaryData();
    setDecisionBoundary(boundaryData);
  }, [trainer]);

  const generateDecisionBoundaryData = () => {
    if (!trainer) return [];

    const points: any[] = [];
    const resolution = 20;

    switch(dataset) {
      case 'logicGates':
        // Generate grid of points for binary inputs
        for (let x = 0; x <= 1; x += 1/resolution) {
          for (let y = 0; y <= 1; y += 1/resolution) {
            const input = [x, y];
            const output = trainer.predict(input)[0];
            points.push({ x, y, z: output });
          }
        }
        break;

      case 'weatherPrediction':
        // Sample points in temperature-humidity space
        for (let temp = -20; temp <= 50; temp += 70/resolution) {
          for (let humidity = 0; humidity <= 100; humidity += 100/resolution) {
            const input = [temp/50, humidity/100, 0.5]; // Fixed cloud cover
            const output = trainer.predict(input)[0];
            points.push({ x: temp, y: humidity, z: output });
          }
        }
        break;

      default:
        break;
    }

    return points;
  };

  // Generate natural language explanation
  useEffect(() => {
    if (!featureImportance.length) return;

    const explanation = generateExplanation();
    setExplanation(explanation);
  }, [featureImportance, dataset]);

  const generateExplanation = () => {
    const mostImportant = featureImportance[0];
    const secondMostImportant = featureImportance[1];

    switch(dataset) {
      case 'logicGates':
        return `This network implements a logic gate where ${mostImportant.feature} has the strongest influence on the output. The relationship appears to be ${getLogicDescription()}.`;
      
      case 'weatherPrediction':
        return `The model primarily bases its precipitation predictions on ${mostImportant.feature}, followed by ${secondMostImportant.feature}. ${getWeatherDescription()}`;
      
      case 'fitnessClassification':
        return `When classifying fitness levels, the model gives the most weight to ${mostImportant.feature}, with ${secondMostImportant.feature} being the second most important factor. ${getFitnessDescription()}`;
      
      default:
        return '';
    }
  };

  const getLogicDescription = () => {
    const weights = featureImportance.map(f => f.importance);
    const isBalanced = Math.abs(weights[0] - weights[1]) < 0.1;
    return isBalanced ? 'balanced between both inputs' : 'dominated by one input';
  };

  const getWeatherDescription = () => {
    const highTemp = decisionBoundary.some(p => p.z > 0.7 && p.x > 30);
    const highHumidity = decisionBoundary.some(p => p.z > 0.7 && p.y > 80);
    
    if (highTemp && highHumidity) {
      return 'High temperatures combined with high humidity strongly indicate precipitation.';
    } else if (highTemp) {
      return 'High temperatures are the strongest indicator of precipitation.';
    } else if (highHumidity) {
      return 'High humidity levels are the strongest indicator of precipitation.';
    }
    return 'The relationship between conditions and precipitation is complex.';
  };

  const getFitnessDescription = () => {
    const heartRateImportant = featureImportance.find(f => f.feature === 'Heart Rate')?.importance || 0;
    const staminaImportant = featureImportance.find(f => f.feature === 'Stamina')?.importance || 0;
    
    if (heartRateImportant > staminaImportant) {
      return 'Heart rate measurements appear to be particularly crucial for accurate classification.';
    } else {
      return 'Stamina levels seem to be the most reliable indicator of overall fitness.';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Model Explanation Dashboard</Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        {/* Feature Importance */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Feature Importance</Typography>
          <Box sx={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis 
                  dataKey="importance" 
                  type="number"
                  domain={[0, 'dataMax']}
                />
                <YAxis 
                  dataKey="feature" 
                  type="category"
                  width={100}
                />
                <Tooltip />
                <Scatter data={featureImportance} fill={theme.palette.primary.main} />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Decision Boundary */}
        {decisionBoundary.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Decision Boundary</Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <XAxis 
                    dataKey="x"
                    name={dataset === 'weatherPrediction' ? 'Temperature (°C)' : 'Input 1'}
                  />
                  <YAxis 
                    dataKey="y"
                    name={dataset === 'weatherPrediction' ? 'Humidity (%)' : 'Input 2'}
                  />
                  <ZAxis 
                    dataKey="z" 
                    range={[16, 100]} 
                    name="Output"
                  />
                  <Tooltip />
                  <Scatter data={decisionBoundary}>
                    {decisionBoundary.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`rgb(${Math.floor(255 * entry.z)}, ${Math.floor(255 * (1-entry.z))}, 0)`}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        )}

        {/* Natural Language Explanation */}
        <Paper sx={{ p: 2, gridColumn: '1 / -1' }}>
          <Typography variant="subtitle1" gutterBottom>Model Behavior Explanation</Typography>
          <Typography variant="body1" color="text.secondary">
            {explanation}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}; 