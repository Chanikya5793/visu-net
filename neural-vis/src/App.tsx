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
import { NeuronViz } from './components/NeuronViz';
import { ITrainer } from './models/TrainerInterface';

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
  const [networkActivations, setNetworkActivations] = useState<number[][]>([]);
  const [networkWeights, setNetworkWeights] = useState<number[][][]>([]);
  const [networkBiases, setNetworkBiases] = useState<number[][]>([]);
  const [learningRate, setLearningRate] = useState(0.01);
  const [trainingSpeed, setTrainingSpeed] = useState(1);

  const trainerRef = useRef<ITrainer | null>(null);

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
    
    // Update network state
    if (trainerRef.current) {
      setNetworkActivations(trainerRef.current.getActivations());
      setNetworkWeights(trainerRef.current.getWeights());
      setNetworkBiases(trainerRef.current.getBiases());
    }
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
    // Reset trainer and basic metrics
    trainerRef.current?.reset();
    
    // Reset training parameters
    setEpochs(1000);
    setLearningRate(0.01);
    setTrainingSpeed(1);
    
    // Reset states
    setIsTraining(false);
    setIsPaused(false);
    setIteration(0);
    setLoss(0);
    setAccuracy(0);
    setMetricsHistory([]);
    
    // Reset testing interface
    setTestInputs({});
    setPrediction([]);
    setTrainingCompleted(false);
    setShowTestingInterface(false);
  
    // Reset network visualization states
    setNetworkActivations([]);
    setNetworkWeights([]);
    setNetworkBiases([]);
  
    // Reset network architecture to default based on dataset
    if (trainerRef.current && dataset) {
      const defaultArchitecture = getNetworkArchitecture(dataset);
      trainerRef.current.initNetwork(defaultArchitecture);
      // Update visualizations after resetting architecture
      setNetworkActivations(trainerRef.current.getActivations());
      setNetworkWeights(trainerRef.current.getWeights());
      setNetworkBiases(trainerRef.current.getBiases());
    }
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

  const getNetworkArchitecture = (selectedDataset: string): number[] => {
    switch(selectedDataset) {
      case 'logicGates':
        return [7, 3, 1]; // Input(2 + 5 for gate type), Hidden(3), Output(1)
      case 'fitnessClassification':
        return [3, 4, 4, 1]; // Input(3), Hidden(4,4), Output(1)
      case 'weatherPrediction':
        return [3, 6, 4, 1]; // Input(3), Hidden(6,4), Output(1)
      default:
        return [];
    }
  };

  const handleWeightAdjust = (layerIndex: number, fromNeuron: number, toNeuron: number, newWeight: number) => {
    if (trainerRef.current) {
      trainerRef.current.adjustWeight(layerIndex, fromNeuron, toNeuron, newWeight);
      // Update visualizations
      setNetworkWeights(trainerRef.current.getWeights());
      setNetworkActivations(trainerRef.current.getActivations());
    }
  };

  const handleLearningRateChange = (newRate: number) => {
    if (trainerRef.current) {
      trainerRef.current.setLearningRate(newRate);
      setLearningRate(newRate);
    }
  };

  const handleExportNetwork = () => {
    if (trainerRef.current) {
      const networkConfig = trainerRef.current.exportNetwork();
      const blob = new Blob([networkConfig], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `network-config-${dataset}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportNetwork = (data: string) => {
    if (trainerRef.current) {
      trainerRef.current.importNetwork(data);
      // Update visualizations
      setNetworkWeights(trainerRef.current.getWeights());
      setNetworkActivations(trainerRef.current.getActivations());
      setNetworkBiases(trainerRef.current.getBiases());
    }
  };

  const handleTrainingSpeedChange = (speed: number) => {
    setTrainingSpeed(speed);
    if (trainerRef.current) {
      const network = trainerRef.current.getNetwork();
      const networkState = network.toJSON();
      networkState.trainOpts = {
        ...networkState.trainOpts,
        iterations: Math.floor(epochs * speed)
      };
      network.fromJSON(networkState);
    }
  };

  const handleArchitectureChange = (newLayers: number[]) => {
    if (trainerRef.current) {
      trainerRef.current.reset();
      trainerRef.current.initNetwork(newLayers);
      setNetworkWeights(trainerRef.current.getWeights());
      setNetworkActivations(trainerRef.current.getActivations());
      setNetworkBiases(trainerRef.current.getBiases());
    }
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

          <NeuronViz 
            layers={getNetworkArchitecture(dataset)}
            activations={networkActivations}
            weights={networkWeights}
            biases={networkBiases}
            dataset={dataset}
            isTraining={isTraining}
            onWeightAdjust={handleWeightAdjust}
            learningRate={learningRate}
            onLearningRateChange={handleLearningRateChange}
            onExportNetwork={handleExportNetwork}
            onImportNetwork={handleImportNetwork}
            performanceMetrics={trainerRef.current?.getPerformanceMetrics()}
            trainingSpeed={trainingSpeed}
            onTrainingSpeedChange={handleTrainingSpeedChange}
            onArchitectureChange={handleArchitectureChange}
          />
          
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