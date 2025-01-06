import React, { useState, useRef } from 'react';
import { 
  Button, 
  Container, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Box,
  Slider,
  LinearProgress
} from '@mui/material';
import { LogicGateTrainer } from './models/logicGates/train';
import { FitnessTrainer } from './models/fitnessClassification/train';
import { WeatherTrainer } from './models/weatherPrediction/train';
import './App.css';

function App() {
  const [dataset, setDataset] = useState<string>('');
  const [epochs, setEpochs] = useState<number>(1000);
  const [error, setError] = useState<number>(0);
  const [iteration, setIteration] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const trainerRef = useRef<LogicGateTrainer | FitnessTrainer | WeatherTrainer | null>(null);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setDataset(event.target.value as string);
    // You can add additional logic here based on the selected dataset
    console.log(`Selected Dataset: ${event.target.value}`);
  };

  const handleEpochChange = (_event: Event, newValue: number | number[]) => {
    setEpochs(newValue as number);
  };

  const handleStartTraining = async () => {
    if (!dataset || !trainerRef.current) return;
    
    if (!trainerRef.current) {
      switch(dataset) {
        case 'logicGates':
          trainerRef.current = new LogicGateTrainer();
          break;
        case 'fitnessClassification':
          trainerRef.current = new FitnessTrainer();
          break;
        case 'weatherPrediction':
          trainerRef.current = new WeatherTrainer();
          break;
      }
    }

    setIsTraining(true);
    await trainerRef.current.train({
      epochs,
      onIteration: (iter, err) => {
        setIteration(iter);
        setError(err);
      },
      onComplete: () => {
        setIsTraining(false);
      }
    });
  };

  const handlePause = () => {
    trainerRef.current?.pause();
    setIsTraining(false);
  };

  const handleReset = () => {
    trainerRef.current?.reset();
    setIteration(0);
    setError(0);
  };

  return (
    <Container className="App">
      <Typography variant="h4" gutterBottom>
        Neural Network Visualization
      </Typography>
      <Typography variant="body1" gutterBottom>
        See how Neural Networks are trained in real time.
      </Typography>
      
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
            onChange={handleChange}
            label="Select Your Dataset"
            sx={{
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 2,
              }
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="logicGates">Logic Gates Truth Tables</MenuItem>
            <MenuItem value="fitnessClassification">Fitness Classification</MenuItem>
            <MenuItem value="weatherPrediction">Weather Prediction</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Optionally, you can conditionally render content based on the selected dataset */}
      {dataset && (
        <Typography variant="body2" color="textSecondary" style={{ marginTop: '1rem' }}>
          You have selected: <strong>{dataset.replace(/([A-Z])/g, ' $1').trim()}</strong>
        </Typography>
      )}

      {dataset && (
        <Box sx={{ mt: 4 }}>
          <Typography gutterBottom>Number of Epochs</Typography>
          <Slider
            value={epochs}
            onChange={handleEpochChange}
            min={100}
            max={5000}
            step={100}
            valueLabelDisplay="auto"
            disabled={isTraining}
          />
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleStartTraining}
              disabled={isTraining}
              sx={{ mr: 1 }}
            >
              Start Training
            </Button>
            <Button 
              variant="outlined" 
              onClick={handlePause}
              disabled={!isTraining}
              sx={{ mr: 1 }}
            >
              Pause
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleReset}
              disabled={isTraining}
            >
              Reset
            </Button>
          </Box>

          {iteration > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography>Epoch: {iteration}/{epochs}</Typography>
              <Typography>Error: {error.toFixed(6)}</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(iteration/epochs) * 100} 
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default App;