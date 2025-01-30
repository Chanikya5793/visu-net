/**
 * CustomDatasetUploader Component
 * 
 * A React component that provides an interface for uploading custom datasets in JSON format.
 * Handles file validation and data processing for different types of neural network training datasets.
 * 
 * Features:
 * - File upload dialog with drag-and-drop support
 * - JSON format validation
 * - Dataset structure validation based on type:
 *   - Logic Gates: 7 inputs (2 inputs + 5 gate type bits), 1 output
 *   - Fitness Classification: 3 inputs (heart rate, BMI, stamina), 1 output
 *   - Weather Prediction: 3 inputs (temperature, humidity, cloud cover), 1 output
 * - Error handling and user feedback
 * 
 * Props:
 * @param {string} dataset - Type of dataset being uploaded ('logicGates', 'fitnessClassification', 'weatherPrediction')
 * @param {function} onUploadDataset - Callback function to handle the validated dataset
 * 
 * State Management:
 * - Tracks error state for validation feedback
 * - Manages dialog visibility
 * 
 * @component
 */

import UploadIcon from '@mui/icons-material/Upload';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';

interface CustomDatasetUploaderProps {
  dataset: string;
  onUploadDataset: (data: any[]) => void;
}

export const CustomDatasetUploader: React.FC<CustomDatasetUploaderProps> = ({
  dataset,
  onUploadDataset
}) => {
  const [error, setError] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateDataset = (data: any[]): boolean => {
    if (!Array.isArray(data)) {
      setError('Invalid file format. Dataset must be an array.');
      return false;
    }

    if (data.length === 0) {
      setError('Dataset cannot be empty.');
      return false;
    }

    // Validate structure based on dataset type
    const isValid = data.every(item => {
      switch(dataset) {
        case 'logicGates':
          return Array.isArray(item.input) && 
                 item.input.length === 7 && // 2 inputs + 5 gate type bits
                 Array.isArray(item.output) &&
                 item.output.length === 1;

        case 'fitnessClassification':
          return Array.isArray(item.input) && 
                 item.input.length === 3 && // heart rate, BMI, stamina
                 Array.isArray(item.output) &&
                 item.output.length === 1;

        case 'weatherPrediction':
          return Array.isArray(item.input) && 
                 item.input.length === 3 && // temperature, humidity, cloud cover
                 Array.isArray(item.output) &&
                 item.output.length === 1;

        default:
          return false;
      }
    });

    if (!isValid) {
      setError(`Invalid dataset structure for ${dataset} model.`);
      return false;
    }

    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (validateDataset(data)) {
          onUploadDataset(data);
          setShowDialog(false);
          setError('');
        }
      } catch (err) {
        setError('Failed to parse JSON file. Please ensure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={() => setShowDialog(true)}
        startIcon={<UploadIcon />}
        sx={{ mt: 2, ml: 2 }}
      >
        Upload Custom Dataset
      </Button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Upload Custom Dataset</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a JSON file containing your custom dataset. The structure must match the {dataset} model requirements.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="input"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            ref={fileInputRef}
            sx={{ display: 'none' }}
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};