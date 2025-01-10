import { Box, Button, Divider, FormControlLabel, Switch, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { NeuronVizProps } from '../../types/neuron-viz.types';
import { LearningRateControl } from '../network/controls/LearningRateControl';
import { NeuronColorLegend } from '../network/controls/NeuronColorLegend';
import { TrainingSpeedControl } from '../network/controls/TrainingSpeedControl';
import { ExperimentArchitecture } from './controls/ExperimentArchitecture';

interface NetworkControlsProps extends NeuronVizProps {
  showBackprop: boolean;
  setShowBackprop: (show: boolean) => void;
  showGradients: boolean;
  setShowGradients: (show: boolean) => void;
  handleImportDialog: () => void;
  editedLayers: number[];
  setEditedLayers: (layers: number[]) => void;
}

export const NetworkControls: React.FC<NetworkControlsProps> = ({
  layers,
  isTraining,
  dataset,
  learningRate,
  trainingSpeed,
  onLearningRateChange,
  onTrainingSpeedChange,
  onExportNetwork,
  onArchitectureChange,
  //showBackprop,
  //setShowBackprop,
  showGradients,
  setShowGradients,
  handleImportDialog,
  //editedLayers,
  //setEditedLayers
}) => {
  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      {onArchitectureChange && (
        <>
          <ExperimentArchitecture 
            layers={layers}
            onArchitectureChange={onArchitectureChange}
            isTraining={isTraining}
          />
          <Divider sx={{ my: 2 }} />
        </>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
     {/*}   <Tooltip title="Visualize how errors propagate backward through the network during training">
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowBackprop(!showBackprop)}
          >
            {showBackprop ? 'Hide' : 'Show'} Backpropagation
          </Button>
        </Tooltip>
*/}
        <Tooltip title={
          <Box sx={{ p: 1 }}>
            <Typography variant="body2" gutterBottom>
              Visualizes the flow of information and learning in the network:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Green connections: Positive impact (strengthening)</li>
              <li>Red connections: Negative impact (weakening)</li>
              <li>Connection thickness: Strength of the weight</li>
              <li>Connection opacity: Current activity level</li>
              <li>Pulsing animation: Active information flow</li>
              <li>Numbers: Weight values between neurons</li>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This helps understand how neurons influence each other and visualize the backpropagation process during training.
            </Typography>
          </Box>
        }>
          <FormControlLabel
            control={
              <Switch
                checked={showGradients}
                onChange={() => setShowGradients(!showGradients)}
                color="primary"
              />
            }
            label="Show Gradient Flow"
          />
        </Tooltip>

        {onLearningRateChange && (
          <LearningRateControl
            learningRate={learningRate || 0.01}
            onChange={onLearningRateChange}
            disabled={!isTraining}
          />
        )}

        {onTrainingSpeedChange && (
          <TrainingSpeedControl
            speed={trainingSpeed || 1}
            onChange={onTrainingSpeedChange}
            disabled={!isTraining}
          />
        )}

        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={onExportNetwork}
            sx={{ mr: 1 }}
          >
            Export Network
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleImportDialog}
          >
            Import Network
          </Button>
        </Box>

        <NeuronColorLegend 
          dataset={dataset}
          layers={layers}
        />
      </Box>
    </Box>
  );
}; 