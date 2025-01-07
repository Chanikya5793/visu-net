// src/components/DatasetSelector.tsx
import React from 'react';
import { 
  Box, Typography, FormControl, InputLabel, 
  Select, MenuItem, SelectChangeEvent 
} from '@mui/material';

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