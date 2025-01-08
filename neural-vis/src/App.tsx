import React, { useState, useRef } from 'react';
import { Container, Typography, SelectChangeEvent } from '@mui/material';
import { DatasetSelector } from './components/DatasetSelector';
import { TrainingControls } from './components/TrainingControls';
import { TrainingMetrics } from './components/TrainingMetrics';
import { TestingInterface } from './components/TestingInterface';
import { MetricsGraph } from './components/MetricsGraph';
import { LogicGateTrainer } from './models/logicGates/train';
import { FitnessTrainer } from './models/fitnessClassification/train';
import { WeatherTrainer } from './models/weatherPrediction/train';
import { mapGateType } from './models/logicGates/data';
import { mapHeartRate, mapBMI, mapStamina } from './models/fitnessClassification/data';
import './App.css';
import { TestModelButton } from './components/TestModelButton';

interface MetricPoint {
  epoch: number;
  loss: number;
  accuracy: number;
}

function App() {
  // Essential state
  const [dataset, setDataset] = useState<string>('');
  const [epochs, setEpochs] = useState<number>(1000);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [loss, setLoss] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [metricsHistory, setMetricsHistory] = useState<MetricPoint[]>([]);
  const [testInputs, setTestInputs] = useState<Record<string, any>>({});
  const [prediction, setPrediction] = useState<number[]>([]);
  const [trainingCompleted, setTrainingCompleted] = useState<boolean>(false);
  const [showTestingInterface, setShowTestingInterface] = useState<boolean>(false);

  const trainerRef = useRef<LogicGateTrainer | FitnessTrainer | WeatherTrainer | null>(null);

  // Handlers
  const handleChange = (event: SelectChangeEvent<string>) => {
    setDataset(event.target.value as string);
  };

  const handleEpochChange = (_event: Event, newValue: number | number[]) => {
    setEpochs(newValue as number);
  };

  // Training handlers
  const handleStartTraining = async () => {
    if (!dataset || isTraining) return;
    
    trainerRef.current = createTrainer(dataset);
    if (!trainerRef.current) return;

    resetTrainingState();
    await startTraining();
  };

  // Helper functions
  const createTrainer = (selectedDataset: string) => {
    switch(selectedDataset) {
      case 'logicGates': return new LogicGateTrainer();
      case 'fitnessClassification': return new FitnessTrainer();
      case 'weatherPrediction': return new WeatherTrainer();
      default: return null;
    }
  };

  const resetTrainingState = () => {
    setIsTraining(true);
    setIsPaused(false);
    setIteration(0);
    setLoss(1);
    setAccuracy(0);
    setMetricsHistory([]);
    setTrainingCompleted(false); // Reset completion state
  };

  const startTraining = async () => {
    await trainerRef.current?.train({
      epochs,
      onIteration: handleIteration,
      onComplete: handleComplete,
      onPause: handlePause,
      onStop: handleStop
    });
  };

  // Event handlers
  const handleIteration = (iter: number, err: number) => {
    setIteration(iter);
    setLoss(err);
    setAccuracy(1 - err);
    setMetricsHistory(prev => [...prev, { epoch: iter, loss: err, accuracy: 1 - err }]);
  };

  const handleComplete = () => {
    setIsTraining(false);
    setIsPaused(false);
    setTrainingCompleted(true); // Set to true only when training completes normally
  };

  const handlePause = () => {
    setIsPaused(true);
    setIsTraining(false);
  };

  const handleStop = () => {
    trainerRef.current?.stop();
    setIsTraining(false);
    setIsPaused(false);
    setTrainingCompleted(false); // Set to false when training is stopped
  };

  const handleReset = () => {
    trainerRef.current?.reset();
    setEpochs(1000); // Reset to default epochs
    setIsTraining(false);
    setIsPaused(false);
    setIteration(0);
    setLoss(0);
    setAccuracy(0);
    setMetricsHistory([]);
    setTestInputs({});
    setPrediction([]);
    setTrainingCompleted(false);
    setShowTestingInterface(false);
  };

  const handleTest = () => {
    if (!trainerRef.current) return;
    const input = prepareTestInput();
    const result = trainerRef.current.predict(input);
    setPrediction(Array.isArray(result) ? result : [result]);
  };

  const prepareTestInput = () => {
    switch(dataset) {
      case 'logicGates':
        return [
          testInputs.input1 || 0,
          testInputs.input2 || 0,
          ...mapGateType(testInputs.gateType || 'AND')
        ];
      case 'weatherPrediction':
        return [
          (testInputs.temperature || 0) / 50,
          (testInputs.humidity || 0) / 100,
          (testInputs.cloudCover || 0) / 100
        ];
      case 'fitnessClassification':
        return [
          mapHeartRate(testInputs.heartRate?.toString() || '60-75'),
          mapBMI(testInputs.bmi || 'Normal'),
          mapStamina(testInputs.stamina || 'Medium')
        ];
      default:
        return [];
    }
  };

  const handleResetTest = () => {
    setTestInputs({});
    setPrediction([]);
    setShowTestingInterface(false); // Hide testing interface on reset
  };

  const handleEnableTesting = () => {
    setShowTestingInterface(true);
  };

  return (
    <Container className="App">
      <Typography variant="h4" gutterBottom>Neural Network Visualization</Typography>
      
      <DatasetSelector dataset={dataset} onChange={handleChange} />
      
      {dataset && (
        <>
          <TrainingControls 
            epochs={epochs}
            isTraining={isTraining}
            isPaused={isPaused}
            onEpochChange={handleEpochChange}
            onStart={handleStartTraining}
            onPause={handlePause}
            onContinue={startTraining}
            onStop={handleStop}
            onReset={handleReset}
          />
          
          <TrainingMetrics 
            iteration={iteration}
            epochs={epochs}
            loss={loss}
            accuracy={accuracy}
            isTraining={isTraining}
          />
          
          <MetricsGraph metricsHistory={metricsHistory} />
          
          {!isTraining && iteration > 0 && (
            <>
              <TestModelButton 
                trainingCompleted={trainingCompleted}
                isTestingEnabled={showTestingInterface}
                onEnableTesting={handleEnableTesting}
              />
              
              {showTestingInterface && (
                <TestingInterface 
                  dataset={dataset}
                  testInputs={testInputs}
                  prediction={prediction}
                  onTestInputChange={(key, value) => 
                    setTestInputs(prev => ({ ...prev, [key]: value }))}
                  onTest={handleTest}
                  onReset={handleResetTest}
                />
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default App;