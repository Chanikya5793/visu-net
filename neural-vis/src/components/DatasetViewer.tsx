// src/components/DatasetViewer.tsx
import React from 'react';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { logicGateData } from '../models/logicGates/data';
import { fitnessData } from '../models/fitnessClassification/data';
import { weatherData } from '../models/weatherPrediction/data';

interface DatasetViewerProps {
  dataset: string;
}

export const DatasetViewer: React.FC<DatasetViewerProps> = ({ dataset }) => {
    const [open, setOpen] = React.useState(false);

const getDataset = () => {
    switch(dataset) {
      case 'logicGates':
        return logicGateData.training;
      case 'fitnessClassification':
        return fitnessData.training;
      case 'weatherPrediction':
        return weatherData.training;
      default:
        return [];
    }
  };

  const getHeaders = () => {
    if (dataset === 'logicGates') {
      return ['Input 1', 'Input 2', 'Gate Type', 'Output'];
    } else if (dataset === 'fitnessClassification') {
      return ['Heart Rate', 'Stamina Level', 'BMI', 'Fitness Classification'];
    } else {
      return ['Temperature', 'Humidity', 'Cloud Cover', 'Rain Probability'];
    }
  };

  const formatData = (data: any) => {
    if (dataset === 'logicGates') {
      return {
        input1: data.input[0],
        input2: data.input[1],
        gateType: getGateType(data.input.slice(2)),
        output: data.output[0]
      };
    } else if (dataset === 'fitnessClassification') {
      const fitnessLevel = data.output[0] >= 0.66 ? 'Fit' : 
                          data.output[0] >= 0.33 ? 'Average' : 'Unfit';
      return {
        heartRate: getHeartRateRange(data.input[0]),
        staminaLevel: getStaminaLevel(data.input[2]),
        bmi: getBMICategory(data.input[1]),
        fitnessLevel: fitnessLevel
      };
    } else {
      return {
        temperature: (data.input[0] * 50).toFixed(1),
        humidity: (data.input[1] * 100).toFixed(1),
        cloudCover: (data.input[2] * 100).toFixed(1),
        rainProbability: (data.output[0] * 100).toFixed(1) + '%'
      };
    }
  };

  const getGateType = (gateArray: number[]) => {
    const index = gateArray.findIndex(v => v === 1);
    const gates = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'IMPLIES', 'NIMPLIES', 'NOT', 'BUFFER'];
    // When all values are 0, it's a BUFFER gate
    if (gateArray.every(v => v === 0)) return 'BUFFER';
    return gates[index] || 'Unknown';
  };

  const getHeartRateRange = (normalized: number): string => {
    const hr = normalized * 200;
    if (hr < 75) return '60-75';
    if (hr < 90) return '76-90';
    if (hr < 110) return '91-110';
    if (hr < 130) return '111-130';
    return '131+';
  };

  const getStaminaLevel = (normalized: number): string => {
    if (normalized >= 0.66) return 'High';
    if (normalized >= 0.33) return 'Medium';
    return 'Low';
  };

  const getBMICategory = (normalized: number): string => {
    if (normalized <= -0.5) return 'Underweight';
    if (normalized <= 0.5) return 'Normal';
    if (normalized <= 1.5) return 'Overweight';
    return 'Obese';
  };

  return (
    <Box>
      <Button 
        variant="outlined" 
        onClick={() => setOpen(true)}
        sx={{ mt: 2 }}
      >
        View Dataset
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dataset.charAt(0).toUpperCase() + dataset.slice(1)} Dataset
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {getHeaders().map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {getDataset().slice(0, 100).map((row: any, index: number) => {
                  const formattedData = formatData(row);
                  return (
                    <TableRow key={index}>
                      {Object.values(formattedData).map((value: any, cellIndex: number) => (
                        <TableCell key={cellIndex}>
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};