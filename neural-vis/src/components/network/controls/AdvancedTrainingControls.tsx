import { Box, FormControlLabel, Paper, Slider, Switch, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';

interface AdvancedTrainingControlsProps {
  learningRate: number;
  onLearningRateChange: (rate: number) => void;
  momentum: number;
  onMomentumChange: (momentum: number) => void;
  earlyStoppingPatience: number;
  onEarlyStoppingPatienceChange: (patience: number) => void;
  useScheduler: boolean;
  onUseSchedulerChange: (use: boolean) => void;
  schedulerConfig: {
    initialRate: number;
    decaySteps: number;
    decayRate: number;
  };
  onSchedulerConfigChange: (config: {
    initialRate: number;
    decaySteps: number;
    decayRate: number;
  }) => void;
}

export const AdvancedTrainingControls: React.FC<AdvancedTrainingControlsProps> = ({
  learningRate,
  onLearningRateChange,
  momentum,
  onMomentumChange,
  earlyStoppingPatience,
  onEarlyStoppingPatienceChange,
  useScheduler,
  onUseSchedulerChange,
  schedulerConfig,
  onSchedulerConfigChange
}) => {
  const [showSchedulerConfig, setShowSchedulerConfig] = useState(false);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Advanced Training Controls</Typography>
        <InfoTooltip
          title="Advanced Training Controls"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Fine-tune the training process with advanced parameters:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Learning rate scheduling</li>
                <li>Momentum for faster convergence</li>
                <li>Early stopping to prevent overfitting</li>
                <li>Custom decay rates and steps</li>
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Learning Rate Control */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Learning Rate: {learningRate.toFixed(4)}
        </Typography>
        <Slider
          value={learningRate}
          onChange={(_, value) => onLearningRateChange(value as number)}
          min={0.0001}
          max={0.1}
          step={0.0001}
          marks={[
            { value: 0.0001, label: '0.0001' },
            { value: 0.1, label: '0.1' }
          ]}
        />
      </Box>

      {/* Momentum Control */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Momentum: {momentum.toFixed(2)}
        </Typography>
        <Slider
          value={momentum}
          onChange={(_, value) => onMomentumChange(value as number)}
          min={0}
          max={0.99}
          step={0.01}
          marks={[
            { value: 0, label: '0' },
            { value: 0.99, label: '0.99' }
          ]}
        />
      </Box>

      {/* Early Stopping */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Early Stopping Patience: {earlyStoppingPatience} epochs
        </Typography>
        <Slider
          value={earlyStoppingPatience}
          onChange={(_, value) => onEarlyStoppingPatienceChange(value as number)}
          min={1}
          max={50}
          step={1}
          marks={[
            { value: 1, label: '1' },
            { value: 50, label: '50' }
          ]}
        />
      </Box>

      {/* Learning Rate Scheduler */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useScheduler}
              onChange={(e) => {
                onUseSchedulerChange(e.target.checked);
                setShowSchedulerConfig(e.target.checked);
              }}
            />
          }
          label="Use Learning Rate Scheduler"
        />

        {showSchedulerConfig && (
          <Box sx={{ mt: 2, pl: 2 }}>
            <TextField
              label="Initial Learning Rate"
              type="number"
              value={schedulerConfig.initialRate}
              onChange={(e) => onSchedulerConfigChange({
                ...schedulerConfig,
                initialRate: Number(e.target.value)
              })}
              size="small"
              sx={{ mb: 2, width: '100%' }}
              inputProps={{
                step: 0.0001,
                min: 0.0001,
                max: 0.1
              }}
            />
            <TextField
              label="Decay Steps"
              type="number"
              value={schedulerConfig.decaySteps}
              onChange={(e) => onSchedulerConfigChange({
                ...schedulerConfig,
                decaySteps: Number(e.target.value)
              })}
              size="small"
              sx={{ mb: 2, width: '100%' }}
              inputProps={{
                step: 1,
                min: 1
              }}
            />
            <TextField
              label="Decay Rate"
              type="number"
              value={schedulerConfig.decayRate}
              onChange={(e) => onSchedulerConfigChange({
                ...schedulerConfig,
                decayRate: Number(e.target.value)
              })}
              size="small"
              sx={{ width: '100%' }}
              inputProps={{
                step: 0.01,
                min: 0,
                max: 1
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
}; 