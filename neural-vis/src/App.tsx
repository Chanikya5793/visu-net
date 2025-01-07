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
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { LogicGateTrainer } from './models/logicGates/train';
import { FitnessTrainer } from './models/fitnessClassification/train';
import { WeatherTrainer } from './models/weatherPrediction/train';
import './App.css';

interface MetricPoint {
  epoch: number;
  loss: number;
  accuracy: number;
}

function App() {
  const [dataset, setDataset] = useState<string>('');
  const [epochs, setEpochs] = useState<number>(1000);
  const [error, setError] = useState<number>(0);
  const [iteration, setIteration] = useState<number>(0);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const trainerRef = useRef<LogicGateTrainer | FitnessTrainer | WeatherTrainer | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [loss, setLoss] = useState<number>(0);
  const [metricsHistory, setMetricsHistory] = useState<MetricPoint[]>([]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setDataset(event.target.value as string);
    // You can add additional logic here based on the selected dataset
    console.log(`Selected Dataset: ${event.target.value}`);
  };

  const handleEpochChange = (_event: Event, newValue: number | number[]) => {
    setEpochs(newValue as number);
  };

  const handleStartTraining = async () => {
    if (!dataset) return;
    
    // Create new trainer instance
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

    setIsTraining(true);
    setIteration(0);
    setError(0);
    setAccuracy(0);
    setLoss(1);

    await trainerRef.current?.train({
      epochs,
      onIteration: (iter, err) => {
        setIteration(iter);
        setError(err);
        setLoss(err);
        const accuracy = 1 - err;
        setAccuracy(accuracy);
        
        // Add metrics to history
        setMetricsHistory(prev => [...prev, {
          epoch: iter,
          loss: err,
          accuracy: accuracy
        }]);
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
    setMetricsHistory([]); // Clear metrics history
    setLoss(0);
    setAccuracy(0);
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

          {isTraining && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>Training Progress</Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <Box>
                  <Typography color="textSecondary">Current Epoch</Typography>
                  <Typography variant="h6">{iteration}/{epochs}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Progress</Typography>
                  <Typography variant="h6">{((iteration/epochs) * 100).toFixed(1)}%</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Loss</Typography>
                  <Typography variant="h6">{loss.toFixed(6)}</Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Accuracy</Typography>
                  <Typography variant="h6">{(accuracy * 100).toFixed(2)}%</Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(iteration/epochs) * 100} 
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {!isTraining && iteration > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography color="success.main" variant="h6">
                Training Complete!
              </Typography>
              <Typography>
                Final Loss: {loss.toFixed(6)}
              </Typography>
              <Typography>
                Final Accuracy: {(accuracy * 100).toFixed(2)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {dataset && (
        <Box sx={{ mt: 4, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Training Metrics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Loss Graph */}
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={metricsHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="epoch" 
                    label={{ value: 'Epochs', position: 'bottom' }} 
                  />
                  <YAxis 
                    label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="#8884d8" 
                    name="Loss"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* Accuracy Graph */}
            <Box sx={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart
                  data={metricsHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="epoch" 
                    label={{ value: 'Epochs', position: 'bottom' }} 
                  />
                  <YAxis 
                    label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip 
                    formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#82ca9d" 
                    name="Accuracy"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default App;