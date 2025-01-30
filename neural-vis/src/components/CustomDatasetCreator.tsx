/**
 * CustomDatasetCreator Component
 * 
 * A React component that provides an interface for creating custom datasets for neural network training.
 * Allows users to manually input data points for different types of datasets with validation and preview.
 * 
 * Features:
 * - Dynamic form fields based on dataset type
 * - Real-time validation of input data
 * - Support for multiple dataset types:
 *   - Logic Gates (AND, OR, XOR, etc.)
 *   - Fitness Classification
 *   - Weather Prediction
 * - Row-based data entry with add/delete functionality
 * - Minimum row requirement enforcement
 * - Scrollable dialog for large datasets
 * 
 * Props:
 * @param {string} dataset - Type of dataset being created ('logicGates', 'fitnessClassification', 'weatherPrediction')
 * @param {function} onSaveDataset - Callback function to handle saving the created dataset
 * @param {number} minimumRows - Minimum number of rows required for the dataset
 * 
 * State Management:
 * - Manages custom data array
 * - Tracks dialog open/close state
 * - Handles row addition/deletion
 * 
 * @component
 */

// src/components/CustomDatasetCreator.tsx
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { mapBMI, mapHeartRate, mapStamina } from '../models/fitnessClassification/data';
import { mapGateType } from '../models/logicGates/data';

interface CustomDatasetCreatorProps {
  dataset: string;
  onSaveDataset: (data: any[]) => void;
  minimumRows: number;
}

export const CustomDatasetCreator: React.FC<CustomDatasetCreatorProps> = ({
  dataset,
  onSaveDataset,
  minimumRows
}) => {
  const [open, setOpen] = useState(false);
  const [customData, setCustomData] = useState<any[]>([]);
  const addRowButtonRef = useRef<HTMLButtonElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const getHeaders = () => {
    switch(dataset) {
      case 'logicGates':
        return ['Input 1', 'Input 2', 'Gate Type', 'Output'];
      case 'fitnessClassification':
        return ['Heart Rate', 'BMI', 'Stamina Level', 'Fitness Level'];
      case 'weatherPrediction':
        return ['Temperature', 'Humidity', 'Cloud Cover', 'Rain Probability'];
      default:
        return [];
    }
  };

  const getDefaultRowData = () => {
    switch(dataset) {
      case 'logicGates':
        return { input1: 0, input2: 0, gateType: 'AND', output: 0 };
      case 'fitnessClassification':
        return { 
          heartRate: '60-75', 
          bmi: 'Normal', 
          stamina: 'Medium', 
          fitnessLevel: 'Average' 
        };
      case 'weatherPrediction':
        return { 
          temperature: 20, 
          humidity: 50, 
          cloudCover: 50, 
          rainProbability: 50 
        };
      default:
        return {};
    }
  };

  const addNewRow = () => {
    setCustomData(prevData => {
      const newData = [...prevData, getDefaultRowData()];
      // Wait for the next frame to ensure DOM update
      requestAnimationFrame(() => {
        if (dialogContentRef.current && addRowButtonRef.current) {
          const buttonBottom = addRowButtonRef.current.offsetTop + addRowButtonRef.current.offsetHeight;
          const scrollHeight = dialogContentRef.current.scrollHeight;
          
          dialogContentRef.current.scrollTo({
            top: Math.max(0, buttonBottom - dialogContentRef.current.clientHeight + 20),
            behavior: 'smooth'
          });
        }
      });
      return newData;
    });
  };

  const deleteRow = (index: number) => {
    const newData = customData.filter((_, idx) => idx !== index);
    setCustomData(newData);
  };

  const handleCellChange = (rowIndex: number, column: string, value: any) => {
    const newData = [...customData];
    newData[rowIndex] = { ...newData[rowIndex], [column]: value };
    setCustomData(newData);
  };

  const renderCell = (rowIndex: number, column: string, value: any) => {
    switch(dataset) {
      case 'logicGates':
        if (column === 'gateType') {
          return (
            <Select
              value={value}
              onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
              size="small"
            >
              {['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 'IMPLIES', 'NIMPLIES', 'NOT', 'BUFFER'].map(gate => (
                <MenuItem key={gate} value={gate}>{gate}</MenuItem>
              ))}
            </Select>
          );
        }
        return (
          <Select
            value={value}
            onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
            size="small"
          >
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={1}>1</MenuItem>
          </Select>
        );

      case 'fitnessClassification':
        switch(column) {
          case 'heartRate':
            return (
              <Select
                value={value}
                onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                size="small"
              >
                {['60-75', '76-90', '91-110', '111-130', '131+'].map(hr => (
                  <MenuItem key={hr} value={hr}>{hr}</MenuItem>
                ))}
              </Select>
            );
          case 'bmi':
            return (
              <Select
                value={value}
                onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                size="small"
              >
                {['Underweight', 'Normal', 'Overweight', 'Obese'].map(bmi => (
                  <MenuItem key={bmi} value={bmi}>{bmi}</MenuItem>
                ))}
              </Select>
            );
          default:
            return (
              <Select
                value={value}
                onChange={(e) => handleCellChange(rowIndex, column, e.target.value)}
                size="small"
              >
                {['Low', 'Medium', 'High'].map(level => (
                  <MenuItem key={level} value={level}>{level}</MenuItem>
                ))}
              </Select>
            );
        }

      case 'weatherPrediction':
        return (
          <TextField 
            type="number"
            value={value}
            onChange={(e) => handleCellChange(rowIndex, column, Number(e.target.value))}
            size="small"
            InputProps={{
              inputProps: { 
                min: column === 'temperature' ? -20 : 0,
                max: column === 'temperature' ? 50 : 100
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  const handleSave = () => {
    const formattedData = customData.map(row => {
      if (dataset === 'logicGates') {
        // Format for logic gates
        const gateArray = mapGateType(row.gateType);
        return {
          input: [row.input1, row.input2, ...gateArray],
          output: [row.output]
        };
      } else if (dataset === 'fitnessClassification') {
        // Format for fitness classification
        return {
          input: [
            mapHeartRate(row.heartRate),
            mapBMI(row.bmi),
            mapStamina(row.stamina)
          ],
          output: [
            row.fitnessLevel === 'Fit' ? 1 : 
            row.fitnessLevel === 'Average' ? 0.5 : 0
          ]
        };
      } else {
        // Format for weather prediction
        return {
          input: [
            row.temperature / 50,
            row.humidity / 100,
            row.cloudCover / 100
          ],
          output: [row.rainProbability / 100]
        };
      }
    });

    onSaveDataset(formattedData);
    setOpen(false);
  };

  const getDatasetRequirements = () => {
    switch(dataset) {
      case 'logicGates':
        return `Minimum ${minimumRows} rows recommended. Include all possible combinations for better training.`;
      case 'fitnessClassification':
        return `Minimum ${minimumRows} rows recommended. Include varied combinations of heart rate, BMI, and stamina levels.`;
      case 'weatherPrediction':
        return `Minimum ${minimumRows} rows recommended. Include various weather conditions for better predictions.`;
      default:
        return '';
    }
  };

  return (
    <Box>
      <Button 
        variant="outlined" 
        onClick={() => setOpen(true)}
        sx={{ mt: 2, ml: 2 }}
      >
        Add Custom Dataset
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create Custom {dataset.charAt(0).toUpperCase() + dataset.slice(1)} Dataset
        </DialogTitle>
        <DialogContent 
          ref={dialogContentRef}
          sx={{ 
            maxHeight: '80vh',
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
              '&:hover': {
                background: '#555'
              }
            }
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {getDatasetRequirements()}
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {getHeaders().map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.entries(row).map(([column, value], cellIndex) => (
                      <TableCell key={cellIndex}>
                        {renderCell(rowIndex, column, value)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton onClick={() => deleteRow(rowIndex)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              ref={addRowButtonRef}
              startIcon={<AddIcon />}
              onClick={addNewRow}
            >
              Add Row
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => setCustomData([])}
              color="error"
              disabled={customData.length === 0}
            >
              Reset Dataset
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={customData.length < minimumRows}
          >
            Save Dataset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};