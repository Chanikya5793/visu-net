import { Container, Typography, Button } from '@mui/material';
import { useRef, useState } from 'react';
import './App.css';
import { NeuronViz } from './components/NeuronVizEX'; // Changed from NeuronVizEX
import { FitnessTrainer } from './models/fitnessClassification/FitnessTrainer';
import { ITrainer } from './models/TrainerInterface';
import { TrainingControls } from './components/TrainingControls';
import { TestingInterface } from './components/TestingInterface'; // Add this import

function App() {
  const [epochs, setEpochs] = useState<number>(1000);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [iteration, setIteration] = useState<number>(0);
  const [networkActivations, setNetworkActivations] = useState<number[][]>([]);
  const [networkWeights, setNetworkWeights] = useState<number[][][]>([]);
  const [networkBiases, setNetworkBiases] = useState<number[][]>([]);
  const [learningRate, setLearningRate] = useState<number>(0.01);

  // Add new state for testing
  const [testInputs, setTestInputs] = useState<any>({});
  const [prediction, setPrediction] = useState<number[]>([]);

  const trainerRef = useRef<ITrainer | null>(null);

  const handleStartTraining = async () => {
    if (isTraining) return;
    
    trainerRef.current = new FitnessTrainer();
    if (!trainerRef.current) return;

    setIsTraining(true);
    
    try {
      await trainerRef.current.train({
        epochs,
        onIteration: (iter: number, err: number) => {
          console.log(`Epoch ${iter}, Error: ${err.toFixed(6)}`); // Add detailed logging
          setIteration(iter);
          if (trainerRef.current) {
            const activations = trainerRef.current.getActivations();
            const weights = trainerRef.current.getWeights();
            const biases = trainerRef.current.getBiases();
            
            console.log(`Layer Activations:`, activations.map(layer => 
              layer.map(n => n.toFixed(3))
            )); // Log activations
            
            setNetworkActivations(activations);
            setNetworkWeights(weights);
            setNetworkBiases(biases);
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

  // Add testing handlers
  const handleTestInputChange = (key: string, value: any) => {
    setTestInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTest = () => {
    if (!trainerRef.current) return;
    
    const result = trainerRef.current.predict({
      "Heart Rate (bpm)": testInputs.heartRate,
      "BMI": testInputs.bmi,
      "Stamina Level": testInputs.stamina
    });
    setPrediction(result);
  };

  const handleResetTest = () => {
    setTestInputs({});
    setPrediction([]);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Neural Network Training Visualization
      </Typography>
      
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
        currentDataset="fitnessClassification"
      />

      <NeuronViz 
        layers={[12, 8, 6, 3]}
        activations={networkActivations}
        weights={networkWeights}
        biases={networkBiases}
        dataset="fitnessClassification"
        isTraining={isTraining}
        learningRate={learningRate}
        onLearningRateChange={setLearningRate}
      />

      <TestingInterface 
        dataset="fitnessClassification"
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