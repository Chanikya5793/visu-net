import { Box, Grid } from '@mui/material';
import React, { useState } from 'react';
import { AdvancedTrainingControls } from './AdvancedTrainingControls';
import { CheckpointManager } from './CheckpointManager';
import { NetworkTemplate, NetworkTemplates } from './NetworkTemplates';

interface Checkpoint {
  id: string;
  timestamp: number;
  epoch: number;
  accuracy: number;
  networkState: string;
  description: string;
}

interface TrainingControlsContainerProps {
  currentEpoch: number;
  accuracy: number;
  learningRate: number;
  onLearningRateChange: (rate: number) => void;
  onSaveCheckpoint: (checkpoint: Omit<Checkpoint, 'id' | 'timestamp'>) => void;
  onLoadCheckpoint: (networkState: string) => void;
  onDeleteCheckpoint: (id: string) => void;
  checkpoints: Checkpoint[];
  layers: number[];
  onArchitectureChange: (layers: number[]) => void;
}

export const TrainingControlsContainer: React.FC<TrainingControlsContainerProps> = ({
  currentEpoch,
  accuracy,
  learningRate,
  onLearningRateChange,
  onSaveCheckpoint,
  onLoadCheckpoint,
  onDeleteCheckpoint,
  checkpoints,
  layers,
  onArchitectureChange
}) => {
  // Advanced training control state
  const [momentum, setMomentum] = useState(0.9);
  const [earlyStoppingPatience, setEarlyStoppingPatience] = useState(10);
  const [useScheduler, setUseScheduler] = useState(false);
  const [schedulerConfig, setSchedulerConfig] = useState({
    initialRate: learningRate,
    decaySteps: 100,
    decayRate: 0.1
  });

  // Handle template selection
  const handleTemplateSelect = (template: NetworkTemplate) => {
    onArchitectureChange(template.layers);
    onLearningRateChange(template.recommendedLearningRate);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* Checkpoints */}
        <Grid item xs={12}>
          <CheckpointManager
            currentEpoch={currentEpoch}
            accuracy={accuracy}
            onSaveCheckpoint={onSaveCheckpoint}
            onLoadCheckpoint={onLoadCheckpoint}
            onDeleteCheckpoint={onDeleteCheckpoint}
            checkpoints={checkpoints}
          />
        </Grid>

        {/* Advanced Training Controls */}
        <Grid item xs={12} md={6}>
          <AdvancedTrainingControls
            learningRate={learningRate}
            onLearningRateChange={onLearningRateChange}
            momentum={momentum}
            onMomentumChange={setMomentum}
            earlyStoppingPatience={earlyStoppingPatience}
            onEarlyStoppingPatienceChange={setEarlyStoppingPatience}
            useScheduler={useScheduler}
            onUseSchedulerChange={setUseScheduler}
            schedulerConfig={schedulerConfig}
            onSchedulerConfigChange={setSchedulerConfig}
          />
        </Grid>

        {/* Network Templates */}
        <Grid item xs={12} md={6}>
          <NetworkTemplates
            onSelectTemplate={handleTemplateSelect}
            currentLayers={layers}
          />
        </Grid>
      </Grid>
    </Box>
  );
}; 