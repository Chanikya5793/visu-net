import { Box, Paper, Slider, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import { ITrainer } from '../../../models/TrainerInterface';

interface LearningPlaygroundProps {
  trainer: ITrainer | null;
  dataset: string;
}

export const LearningPlayground: React.FC<LearningPlaygroundProps> = ({
  trainer,
  dataset
}) => {
  const theme = useTheme();
  const [drawing, setDrawing] = useState<number[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState<number[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, number>>({});

  const canvasWidth = 300;
  const canvasHeight = 300;

  // Handle drawing on canvas
  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setDrawing([[pos.x, pos.y]]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    const pos = e.target.getStage().getPointerPosition();
    setDrawing([...drawing, [pos.x, pos.y]]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (trainer) {
      const input = processDrawing();
      const result = trainer.predict(input);
      setPrediction(result);
    }
  };

  // Process drawing into network input
  const processDrawing = () => {
    // Convert drawing to input format based on dataset type
    switch(dataset) {
      case 'logicGates':
        return [inputValues.input1 || 0, inputValues.input2 || 0];
      case 'weatherPrediction':
        return [
          (inputValues.temperature || 0) / 50,
          (inputValues.humidity || 0) / 100,
          (inputValues.cloudCover || 0) / 100
        ];
      default:
        return [];
    }
  };

  // Handle slider changes
  const handleSliderChange = (name: string) => (_: Event, value: number | number[]) => {
    setInputValues(prev => ({
      ...prev,
      [name]: value as number
    }));
  };

  // Update prediction when input values change
  useEffect(() => {
    if (trainer) {
      const input = processDrawing();
      const result = trainer.predict(input);
      setPrediction(result);
    }
  }, [inputValues]);

  const renderInputControls = () => {
    switch(dataset) {
      case 'logicGates':
        return (
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography gutterBottom>Input 1</Typography>
            <Slider
              value={inputValues.input1 || 0}
              onChange={handleSliderChange('input1')}
              min={0}
              max={1}
              step={0.1}
            />
            <Typography gutterBottom>Input 2</Typography>
            <Slider
              value={inputValues.input2 || 0}
              onChange={handleSliderChange('input2')}
              min={0}
              max={1}
              step={0.1}
            />
          </Box>
        );
      case 'weatherPrediction':
        return (
          <Box sx={{ width: '100%', mb: 2 }}>
            <Typography gutterBottom>Temperature (°C)</Typography>
            <Slider
              value={inputValues.temperature || 0}
              onChange={handleSliderChange('temperature')}
              min={-20}
              max={50}
            />
            <Typography gutterBottom>Humidity (%)</Typography>
            <Slider
              value={inputValues.humidity || 0}
              onChange={handleSliderChange('humidity')}
              min={0}
              max={100}
            />
            <Typography gutterBottom>Cloud Cover (%)</Typography>
            <Slider
              value={inputValues.cloudCover || 0}
              onChange={handleSliderChange('cloudCover')}
              min={0}
              max={100}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  const renderPrediction = () => {
    if (!prediction.length) return null;

    switch(dataset) {
      case 'logicGates':
        return (
          <Typography variant="h6" color="primary">
            Output: {prediction[0].toFixed(4)}
          </Typography>
        );
      case 'weatherPrediction':
        return (
          <Typography variant="h6" color="primary">
            Precipitation Probability: {(prediction[0] * 100).toFixed(1)}%
          </Typography>
        );
      case 'fitnessClassification':
        const categories = ['Unfit', 'Average', 'Fit'];
        const maxIndex = prediction.indexOf(Math.max(...prediction));
        return (
          <Typography variant="h6" color="primary">
            Classification: {categories[maxIndex]} ({(prediction[maxIndex] * 100).toFixed(1)}%)
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Interactive Learning Playground</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
          {renderInputControls()}
          
          {dataset === 'drawing' && (
            <Stage
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ border: '1px solid #ccc' }}
            >
              <Layer>
                <Line
                  points={drawing.flat()}
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              </Layer>
            </Stage>
          )}
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 300 }}>
          <Typography variant="subtitle1" gutterBottom>Network Response</Typography>
          {renderPrediction()}
        </Paper>
      </Box>
    </Box>
  );
}; 