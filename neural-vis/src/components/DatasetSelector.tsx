// src/components/DatasetSelector.tsx
/**
 * DatasetSelector Component
 * 
 * A React component that provides a dropdown interface for selecting training datasets.
 * 
 * Features:
 * - Centrally aligned dropdown menu
 * - Pre-configured dataset options
 * - Custom styling with Material-UI
 * 
 * Available Datasets:
 * - Logic Gates Truth Tables
 * - Fitness Classification
 * - Weather Prediction
 * 
 * Props:
 * @param {string} dataset - Currently selected dataset value
 * @param {function} onChange - Callback function triggered when dataset selection changes
 * 
 * Customization:
 * - To add new datasets, add new MenuItem components with appropriate values
 * - Styling can be modified through the sx prop on Box and Select components
 * 
 * Usage:
 * ```tsx
 * <DatasetSelector
 *   dataset="logicGates"
 *   onChange={handleDatasetChange}
 * />
 * ```
 */

import {
    Box,
    FormControl, InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography
} from '@mui/material';
import React from 'react';

interface DatasetSelectorProps {
  dataset: string;
  onChange: (event: SelectChangeEvent<string>) => void;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({ 
  dataset, 
  onChange 
}) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2
  }}>
    <Typography variant="body1" sx={{ mb: 1 }}>
      Please select a dataset to continue
    </Typography>
    <FormControl sx={{ minWidth: 200, maxWidth: 300 }}>
      <InputLabel id="dataset-select-label">Select Your Dataset</InputLabel>
      <Select
        labelId="dataset-select-label"
        id="dataset-select"
        value={dataset}
        onChange={onChange}
        label="Select Your Dataset"
        sx={{
          borderRadius: 2,
          '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: 2,
          }
        }}
      >
        <MenuItem value=""><em>None</em></MenuItem>
        <MenuItem value="logicGates">Logic Gates Truth Tables</MenuItem>
        <MenuItem value="fitnessClassification">Fitness Classification</MenuItem>
        <MenuItem value="weatherPrediction">Weather Prediction</MenuItem>
      </Select>
    </FormControl>
  </Box>
);