// src/components/TestingInterface.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  Slider
} from '@mui/material';

interface TestingInterfaceProps {
  dataset: string;
  testInputs: any;
  prediction: number[];
  onTestInputChange: (key: string, value: any) => void;
  onTest: () => void;
  onReset: () => void;
}

export const TestingInterface: React.FC<TestingInterfaceProps> = ({
  dataset,
  testInputs,
  prediction,
  onTestInputChange,
  onTest,
  onReset
}) => {
  const interpretPrediction = (pred: number[]) => {
    switch(dataset) {
      case 'logicGates':
        // Get index of highest activation
        return pred[0] > pred[1] ? 'True (1)' : 'False (0)';
      
      case 'fitnessClassification':
        const maxIdx = pred.indexOf(Math.max(...pred));
        return ['Fit', 'Average', 'Unfit'][maxIdx];
      
      case 'weatherPrediction':
        // Single output representing probability
        return `${(pred[0] * 100).toFixed(1)}% chance of rain`;
        
      default:
        return JSON.stringify(pred);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Test Trained Model
      </Typography>

      <Box sx={{ mt: 2 }}>
        {/* Logic Gates Interface */}
        {dataset === 'logicGates' && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Gate Type</InputLabel>
              <Select
                value={testInputs.gateType || ''}
                onChange={(e) => onTestInputChange('gateType', e.target.value)}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
                <MenuItem value="XOR">XOR</MenuItem>
                <MenuItem value="NAND">NAND</MenuItem>
                <MenuItem value="NOR">NOR</MenuItem>
                <MenuItem value="XNOR">XNOR</MenuItem>
                <MenuItem value="IMPLIES">IMPLIES</MenuItem>
                <MenuItem value="NIMPLIES">NIMPLIES</MenuItem>
                <MenuItem value="NOT">NOT</MenuItem>
                <MenuItem value="BUFFER">BUFFER</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Input 1</InputLabel>
              <Select
                value={testInputs.input1 ?? ''}
                onChange={(e) => onTestInputChange('input1', Number(e.target.value))}
              >
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={1}>1</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Input 2</InputLabel>
              <Select
                value={testInputs.input2 ?? ''}
                onChange={(e) => onTestInputChange('input2', Number(e.target.value))}
              >
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={1}>1</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Weather Prediction Interface */}
        {dataset === 'weatherPrediction' && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Typography gutterBottom>Temperature (°C)</Typography>
              <Slider
                value={testInputs.temperature ?? 20}
                onChange={(_, value) => onTestInputChange('temperature', value)}
                min={-20}
                max={50}
                valueLabelDisplay="auto"
              />
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <Typography gutterBottom>Humidity (%)</Typography>
              <Slider
                value={testInputs.humidity ?? 50}
                onChange={(_, value) => onTestInputChange('humidity', value)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <Typography gutterBottom>Cloud Cover (%)</Typography>
              <Slider
                value={testInputs.cloudCover ?? 50}
                onChange={(_, value) => onTestInputChange('cloudCover', value)}
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </FormControl>
          </Box>
        )}

        {/* Fitness Classification Interface */}
        {dataset === 'fitnessClassification' && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Heart Rate Range</InputLabel>
              <Select
                value={testInputs.heartRate || ''}
                onChange={(e) => onTestInputChange('heartRate', e.target.value)}
              >
                <MenuItem value="60-75">60-75 bpm</MenuItem>
                <MenuItem value="76-90">76-90 bpm</MenuItem>
                <MenuItem value="91-110">91-110 bpm</MenuItem>
                <MenuItem value="111-130">111-130 bpm</MenuItem>
                <MenuItem value="131+">131+ bpm</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>BMI Category</InputLabel>
              <Select
                value={testInputs.bmi || ''}
                onChange={(e) => onTestInputChange('bmi', e.target.value)}
              >
                <MenuItem value="Underweight">Underweight</MenuItem>
                <MenuItem value="Normal">Normal</MenuItem>
                <MenuItem value="Overweight">Overweight</MenuItem>
                <MenuItem value="Obese">Obese</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Stamina Level</InputLabel>
              <Select
                value={testInputs.stamina || ''}
                onChange={(e) => onTestInputChange('stamina', e.target.value)}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Control Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={onTest}
            disabled={!testInputs || Object.keys(testInputs).length === 0}
          >
            Test Model
          </Button>
          <Button 
            variant="outlined" 
            onClick={onReset}
          >
            Reset Test
          </Button>
        </Box>

        {/* Prediction Results */}
        {prediction.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6">Prediction Results:</Typography>
            {dataset === 'logicGates' && (
              <>
                <Typography>
                  Probability of Output 0: {((1 - prediction[0]) * 100).toFixed(2)}%
                </Typography>
                <Typography>
                  Probability of Output 1: {(prediction[0] * 100).toFixed(2)}%
                </Typography>
              </>
            )}
            {dataset === 'weatherPrediction' && (
              <Typography>
                Rain Probability: {(prediction[0] * 100).toFixed(2)}%
              </Typography>
            )}
            {dataset === 'fitnessClassification' && (
              <>
                <Typography>
                  Fitness Level: {prediction[0] >= 0.66 ? 'Fit' : 
                                prediction[0] >= 0.33 ? 'Average' : 'Unfit'}
                </Typography>
                <Typography>
                  Confidence: {(prediction[0] * 100).toFixed(2)}%
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        <Typography variant="h6">Prediction: {interpretPrediction(prediction)}</Typography>
        <Typography variant="body2" color="text.secondary">
          Raw outputs: [{prediction.map(p => p.toFixed(4)).join(', ')}]
        </Typography>
      </Box>
    </Box>
  );
};