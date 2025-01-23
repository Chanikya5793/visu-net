import AddIcon from '@mui/icons-material/Add';
import CompareIcon from '@mui/icons-material/Compare';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ITrainer } from '../../../models/TrainerInterface';
import { MetricsGraph } from '../../MetricsGraph';

interface NetworkConfig {
  id: string;
  architecture: number[];
  trainer: ITrainer | null;
  metrics: {
    epoch: number;
    loss: number;
    accuracy: number;
  }[];
  isTraining: boolean;
}

interface NetworkComparisonProps {
  dataset: string;
  createTrainer: (dataset: string) => ITrainer | null;
  epochs: number;
}

export const NetworkComparison: React.FC<NetworkComparisonProps> = ({
  dataset,
  createTrainer,
  epochs
}) => {
  const [networks, setNetworks] = useState<NetworkConfig[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const addNetwork = () => {
    const newNetwork: NetworkConfig = {
      id: `network-${networks.length + 1}`,
      architecture: getDefaultArchitecture(),
      trainer: null,
      metrics: [],
      isTraining: false
    };
    setNetworks([...networks, newNetwork]);
  };

  const removeNetwork = (id: string) => {
    setNetworks(networks.filter(n => n.id !== id));
  };

  const getDefaultArchitecture = () => {
    switch(dataset) {
      case 'logicGates':
        return [7, 3, 2];
      case 'fitnessClassification':
        return [3, 4, 4, 3];
      case 'weatherPrediction':
        return [3, 6, 4, 1];
      default:
        return [];
    }
  };

  const startComparison = async () => {
    setIsComparing(true);
    
    // Initialize trainers for all networks
    const updatedNetworks = networks.map(network => {
      const trainer = createTrainer(dataset);
      if (trainer) {
        trainer.initNetwork(network.architecture);
      }
      return {
        ...network,
        trainer,
        metrics: [],
        isTraining: true
      };
    });
    setNetworks(updatedNetworks);

    // Train all networks in parallel
    await Promise.all(
      updatedNetworks.map(network => 
        trainNetwork(network.id, network.trainer!)
      )
    );

    setIsComparing(false);
  };

  const trainNetwork = async (networkId: string, trainer: ITrainer) => {
    await trainer.train({
      epochs,
      onIteration: (iter: number, err: number) => {
        setNetworks(prev => prev.map(n => {
          if (n.id === networkId) {
            return {
              ...n,
              metrics: [...n.metrics, { epoch: iter, loss: err, accuracy: 1 - err }]
            };
          }
          return n;
        }));
      },
      onComplete: () => {
        setNetworks(prev => prev.map(n => {
          if (n.id === networkId) {
            return { ...n, isTraining: false };
          }
          return n;
        }));
      }
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Network Architecture Comparison</Typography>
        <Box>
          <Tooltip title="Add Network">
            <IconButton 
              onClick={addNetwork}
              disabled={isComparing}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Start Comparison">
            <IconButton 
              onClick={startComparison}
              disabled={isComparing || networks.length === 0}
              color="primary"
            >
              <CompareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
        {networks.map((network) => (
          <Paper key={network.id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1">{network.id}</Typography>
              <IconButton 
                onClick={() => removeNetwork(network.id)}
                disabled={isComparing}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 1 }}>
              Architecture: {network.architecture.join(' → ')}
            </Typography>

            {network.metrics.length > 0 && (
              <Box sx={{ height: 200 }}>
                <MetricsGraph 
                  data={network.metrics}
                  title={`Training Progress - ${network.id}`}
                />
              </Box>
            )}

            {network.isTraining && (
              <Typography color="primary">Training in progress...</Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
}; 