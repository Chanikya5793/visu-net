import DownloadIcon from '@mui/icons-material/Download';
import { Box, Button, Container, SelectChangeEvent, Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import './App.css';
import { CustomDatasetCreator } from './components/CustomDatasetCreator';
import { CustomDatasetUploader } from './components/CustomDatasetUploader';
import { DatasetSelector } from './components/DatasetSelector';
import { DatasetViewer } from './components/DatasetViewer';
import { MetricsGraph } from './components/MetricsGraph';
import { ModelUploader } from './components/ModelUploader';
import { NeuronViz } from './components/NeuronViz';
import { TestingInterface } from './components/TestingInterface';
import { TestModelButton } from './components/TestModelButton';
import { TrainingControls } from './components/TrainingControls';
import { TrainingMetrics } from './components/TrainingMetrics';
import { fitnessData, mapBMI, mapHeartRate, mapStamina } from './models/fitnessClassification/data';
import { FitnessTrainer } from './models/fitnessClassification/train';
import { logicGateData, mapGateType } from './models/logicGates/data';
import { LogicGateTrainer } from './models/logicGates/train';
import { ITrainer } from './models/TrainerInterface';
import { weatherData } from './models/weatherPrediction/data';
import { WeatherTrainer } from './models/weatherPrediction/train';
import { createModelExport } from './utils/exportUtils';

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
  const [customDataset, setCustomDataset] = useState<any[]>([]);
  const [isUsingCustomDataset, setIsUsingCustomDataset] = useState(false);

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
      case 'logicGates': 
        return new LogicGateTrainer(isUsingCustomDataset && customDataset.length > 0 ? customDataset : undefined);
      case 'fitnessClassification':
        return new FitnessTrainer(isUsingCustomDataset && customDataset.length > 0 ? customDataset : undefined);
      case 'weatherPrediction':
        return new WeatherTrainer(isUsingCustomDataset && customDataset.length > 0 ? customDataset : undefined);
      default:
        return null;
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
    
    // For fitness classification, result will be [fit_prob, avg_prob, unfit_prob]
    setPrediction(result);
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
        return [7, 3, 2]; // Input(2 + 5 for gate type), Hidden(3), Output(1)
      case 'fitnessClassification':
        return [3, 4, 4, 3]; // Input(3), Hidden(4,4), Output(1)
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
    if (isTraining) return; // Extra safety check
    
    if (trainerRef.current) {
      // Stop any ongoing training
      handleStop();
      
      // Reset the trainer with new architecture
      trainerRef.current.reset();
      trainerRef.current.initNetwork(newLayers);
      
      // Reset all states
      setNetworkActivations([]);
      setNetworkWeights([]);
      setNetworkBiases([]);
      setMetricsHistory([]);
      setIteration(0);
      setLoss(0);
      setAccuracy(0);
      setTrainingCompleted(false);
      
      // Update visualization after architecture change
      if (trainerRef.current) {
        setNetworkActivations(trainerRef.current.getActivations());
        setNetworkWeights(trainerRef.current.getWeights());
        setNetworkBiases(trainerRef.current.getBiases());
      }
    }
  };

  const handleSaveCustomDataset = (data: any[]) => {
    setCustomDataset(data);
    setIsUsingCustomDataset(true);  // Automatically set to use custom dataset
    handleReset();
  };

  const handleUseDefaultDataset = () => {
    setIsUsingCustomDataset(false);
    handleReset();
  };

  const handleUseCustomDataset = () => {
    if (customDataset.length === 0) {
      alert('No custom dataset available. Please create one first.');
      return;
    }
    setIsUsingCustomDataset(true);
    handleReset();
  };

  const handleDownloadCustomDataset = () => {
    if (customDataset.length === 0) {
      alert('No custom dataset available to download.');
      return;
    }

    const dataStr = JSON.stringify(customDataset, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-${dataset}-dataset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTrainedModel = async () => {
    if (!trainerRef.current) return;
  
    const modelData = JSON.parse(trainerRef.current.exportNetwork());
    const datasetToExport = isUsingCustomDataset ? customDataset : getDefaultDataset();
    const trainingInfo = {
      learningRate,
      epochs,
      architecture: getNetworkArchitecture(dataset),
      datasetType: dataset,
      isCustomDataset: isUsingCustomDataset,
      metrics: trainerRef.current.getPerformanceMetrics()
    };
  
    try {
      const zipBlob = await createModelExport(
        modelData,
        datasetToExport,
        trainingInfo,
        dataset
      );
  
      // Download ZIP file
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset}-model-export.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating export:', error);
      // Add error handling UI feedback here
    }
  };

  const getDefaultDataset = () => {
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

  const handleModelUpload = (modelData: any) => {
    // Update network architecture
    const architecture = modelData.trainingInfo.architecture;
    setDataset(modelData.trainingInfo.datasetType);
    
    // Import the model into the trainer
    if (trainerRef.current) {
      trainerRef.current.importNetwork(JSON.stringify(modelData.model));
    }
    
    // Set custom dataset from the model
    setCustomDataset(modelData.dataset);
    setIsUsingCustomDataset(true);
    
    // Update other training parameters
    setLearningRate(modelData.trainingInfo.learningRate);
    setEpochs(modelData.trainingInfo.epochs);
    
    // Reset states
    handleReset();
    setTrainingCompleted(true); // Enable testing immediately
  };

  return (
    <Container className="App">
      <Typography variant="h4" gutterBottom>Neural Network Visualization</Typography>
      
      <DatasetSelector dataset={dataset} onChange={handleChange} />
      
      {dataset && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <DatasetViewer 
              dataset={dataset} 
              title="Default Dataset"
            />
            <DatasetViewer 
              dataset={dataset}
              data={customDataset}
              title="Custom Dataset"
            />
            <Button
              variant="outlined"
              onClick={handleDownloadCustomDataset}
              disabled={customDataset.length === 0}
            >
              Download Custom Dataset
            </Button>
            
            <CustomDatasetUploader
              dataset={dataset}
              onUploadDataset={handleSaveCustomDataset}
            />
            <CustomDatasetCreator
              dataset={dataset}
              onSaveDataset={handleSaveCustomDataset}
              minimumRows={10}
            />
          </Box>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={!isUsingCustomDataset ? "contained" : "outlined"}
                onClick={handleUseDefaultDataset}
                disabled={isTraining}  // Disable during training
              >
                Use Default Dataset
              </Button>
              <Button
                variant={isUsingCustomDataset ? "contained" : "outlined"}
                onClick={handleUseCustomDataset}
                disabled={customDataset.length === 0 || isTraining}  // Disable if no custom dataset or during training
              >
                Use Custom Dataset
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {isUsingCustomDataset 
                ? `Currently using custom dataset with ${customDataset.length} samples`
                : `Currently using default dataset for ${dataset}`
              }
            </Typography>
          </Box>

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
            currentDataset={isUsingCustomDataset ? 'custom' : 'default'}  // Add this prop
          />
          
          <TrainingMetrics 
            iteration={iteration}
            epochs={epochs}
            loss={loss}
            accuracy={accuracy}
            isTraining={isTraining}
          />
          
          <MetricsGraph data={metricsHistory} />

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

          <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
            <Tooltip title="Download the trained model configuration and dataset in JSON and CSV formats">
              <span>
                <Button
                  variant="contained"
                  onClick={handleExportTrainedModel}
                  startIcon={<DownloadIcon />}
                  disabled={!trainingCompleted}
                >
                  Export Trained Model & Dataset
                </Button>
              </span>
            </Tooltip>
            <ModelUploader onModelUpload={handleModelUpload} />
          </Box>
        </>
      )}
    </Container>
  );
}

export default App;