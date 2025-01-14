import { Container, Typography, SelectChangeEvent } from '@mui/material';
import { useRef, useState } from 'react';
import './App.css';
import { NeuronViz } from './components/NeuronVizEX';
import { FitnessTrainer } from './models/fitnessClassification/FitnessTrainer';
import { LogicGateTrainer } from './models/logicGates/train';
import { logicGateData } from './models/logicGates/data'; // Add this import
import { ITrainer } from './models/TrainerInterface';
import { TrainingControls } from './components/TrainingControls';
import { TestingInterface } from './components/TestingInterface';
import { DatasetSelector } from './components/DatasetSelector';

function App() {
  const [epochs, setEpochs] = useState<number>(1000);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [networkActivations, setNetworkActivations] = useState<number[][]>([]);
  const [networkWeights, setNetworkWeights] = useState<number[][][]>([]);
  const [networkBiases, setNetworkBiases] = useState<number[][]>([]);
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [dataset, setDataset] = useState<string>('fitnessClassification');
  const [testInputs, setTestInputs] = useState<any>({});
  const [prediction, setPrediction] = useState<number[]>([]);

  const trainerRef = useRef<ITrainer | null>(null);

  const handleDatasetChange = (event: SelectChangeEvent<string>) => {
    setDataset(event.target.value);
    // Reset states when changing dataset
    setIsTraining(false);
    setIteration(0);
    setNetworkActivations([]);
    setNetworkWeights([]);
    setNetworkBiases([]);
    setTestInputs({});
    setPrediction([]);
  };

  const handleStartTraining = async () => {
    if (isTraining) return;
    
    switch(dataset) {
      case 'logicGates':
        console.log('Initializing Logic Gates trainer...');
        trainerRef.current = new LogicGateTrainer();
        break;
      case 'fitnessClassification':
        trainerRef.current = new FitnessTrainer();
        break;
      default:
        console.error('Invalid dataset selected');
        return;
    }

    if (!trainerRef.current) return;

    setIsTraining(true);
    
    try {
      await trainerRef.current.train({
        epochs,
        onIteration: (iter: number, err: number) => {
          console.log(`Epoch ${iter + 1}/${epochs}, Error: ${err.toFixed(6)}`);
          setIteration(iter);
          if (trainerRef.current) {
            setNetworkActivations(trainerRef.current.getActivations());
            setNetworkWeights(trainerRef.current.getWeights());
            setNetworkBiases(trainerRef.current.getBiases());
          }
        },
        onComplete: () => {
          console.log('Training completed!');
          setIsTraining(false);
        }
      });
    } catch (error) {
      console.error('Training error:', error);
      setIsTraining(false);
    }
  };

  const handleStop = () => {
    if (trainerRef.current) {
      trainerRef.current.stop();
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    if (trainerRef.current) {
      trainerRef.current.reset();
      setIsTraining(false);
      setIteration(0);
      setNetworkActivations([]);
      setNetworkWeights([]);
      setNetworkBiases([]);
    }
  };

  const handleTestInputChange = (key: string, value: any) => {
    setTestInputs((prev: Record<string, any>) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTest = () => {
    if (!trainerRef.current) return;
    
    if (dataset === 'logicGates') {
      console.log('Testing logic gate:', testInputs);
      const result = trainerRef.current.predict({
        input1: Number(testInputs.input1),
        input2: Number(testInputs.input2),
        gateType: testInputs.gateType
      });
      console.log('Test result:', result);
      setPrediction(result);
    } else {
      // Fitness classification
      const result = trainerRef.current.predict({
        "Heart Rate (bpm)": testInputs.heartRate,
        "BMI": testInputs.bmi,
        "Stamina Level": testInputs.stamina
      });
      setPrediction(result);
    }
  };

  const handleResetTest = () => {
    setTestInputs({});
    setPrediction([]);
  };

  const getNetworkArchitecture = (selectedDataset: string): number[] => {
    switch(selectedDataset) {
      case 'logicGates':
        return [13, 10, 6, 2]; // Logic gate architecture
      case 'fitnessClassification':
        return [12, 8, 6, 3]; // Fitness classification architecture
      default:
        return [12, 8, 6, 3];
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Neural Network Training Visualization
      </Typography>
      
      <DatasetSelector 
        dataset={dataset}
        onChange={handleDatasetChange}
      />

      <TrainingControls
        epochs={epochs}
        isTraining={isTraining}
        isPaused={false}
        onEpochChange={(_, value) => setEpochs(value as number)}
        onStart={handleStartTraining}
        onStop={handleStop}
        onReset={handleReset}
        onPause={() => {}}
        onContinue={() => {}}
        currentDataset="default"
      />

      <NeuronViz 
        layers={getNetworkArchitecture(dataset)}
        activations={networkActivations}
        weights={networkWeights}
        biases={networkBiases}
        dataset={dataset}
        isTraining={isTraining}
        learningRate={learningRate}
        onLearningRateChange={setLearningRate}
      />

      <TestingInterface 
        dataset={dataset}
        testInputs={testInputs}
        prediction={prediction}
        onTestInputChange={handleTestInputChange}
        onTest={handleTest}
        onReset={handleResetTest}
      />
    </Container>
  );
}

export default App;