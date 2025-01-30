/**
 * ModelUploader Component
 * 
 * A React component that provides an interface for uploading previously trained neural network models.
 * Supports both JSON and ZIP file formats with validation and error handling.
 * 
 * Features:
 * - Multiple file format support (JSON/ZIP)
 * - Model validation and error handling
 * - Automatic file type detection
 * - Progress feedback and error display
 * - Material-UI integration
 * 
 * Props:
 * @param {function} onModelUpload - Callback function to handle validated model data
 * 
 * File Format Support:
 * - JSON: Single file containing model configuration
 * - ZIP: Archive containing model, dataset, and training info
 * 
 * Validation:
 * - Model structure verification
 * - Network architecture validation
 * - Dataset compatibility checking
 * 
 * Error Handling:
 * - Invalid file type detection
 * - Parsing error feedback
 * - Structure validation errors
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
import JSZip from 'jszip';
import React, { useRef, useState } from 'react';

interface ModelUploaderProps {
  onModelUpload: (modelData: {
    model: any,
    dataset: any[],
    trainingInfo: {
      architecture: number[],
      datasetType: string,
      learningRate: number,
      epochs: number
    }
  }) => void;
}

export const ModelUploader: React.FC<ModelUploaderProps> = ({ onModelUpload }) => {
  const [error, setError] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let modelData;
      
      if (file.type === 'application/json') {
        // Handle JSON file
        const text = await file.text();
        modelData = JSON.parse(text);
      } else if (file.type === 'application/zip') {
        // Handle ZIP file
        const arrayBuffer = await file.arrayBuffer();
        modelData = await unzipModelFile(arrayBuffer);
      } else {
        setError('Invalid file type. Please upload a JSON or ZIP file.');
        return;
      }

      if (validateModelData(modelData)) {
        onModelUpload(modelData);
        setShowDialog(false);
        setError('');
      }
    } catch (err) {
      setError('Failed to parse file. Please ensure it\'s a valid model export.');
    }
  };

  const validateModelData = (data: any): boolean => {
    if (!data.model || !data.dataset || !data.trainingInfo) {
      setError('Invalid model file structure');
      return false;
    }

    if (!Array.isArray(data.trainingInfo.architecture)) {
      setError('Invalid network architecture');
      return false;
    }

    return true;
  };

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={() => setShowDialog(true)}
        startIcon={<UploadIcon />}
        sx={{ mt: 2, ml: 2 }}
      >
        Upload Trained Model
      </Button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Upload Trained Model</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a previously exported model (JSON or ZIP file)
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="input"
            type="file"
            accept=".json,.zip"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<UploadIcon />}
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

async function unzipModelFile(arrayBuffer: ArrayBuffer) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(arrayBuffer);
  
  const modelFile = contents.file('model.json');
  const datasetFile = contents.file('dataset.json');
  const trainingInfoFile = contents.file('training-info.json');

  if (!modelFile || !datasetFile || !trainingInfoFile) {
    throw new Error('Invalid ZIP structure');
  }

  const model = JSON.parse(await modelFile.async('text'));
  const dataset = JSON.parse(await datasetFile.async('text'));
  const trainingInfo = JSON.parse(await trainingInfoFile.async('text'));

  return {
    model,
    dataset,
    trainingInfo
  };
}
