import { Delete, Restore, Save } from '@mui/icons-material';
import { Box, Button, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { InfoTooltip } from './InfoTooltip';

interface Checkpoint {
  id: string;
  timestamp: number;
  epoch: number;
  accuracy: number;
  networkState: string;
  description: string;
}

interface CheckpointManagerProps {
  currentEpoch: number;
  accuracy: number;
  onSaveCheckpoint: (checkpoint: Omit<Checkpoint, 'id' | 'timestamp'>) => void;
  onLoadCheckpoint: (networkState: string) => void;
  onDeleteCheckpoint: (id: string) => void;
  checkpoints: Checkpoint[];
}

export const CheckpointManager: React.FC<CheckpointManagerProps> = ({
  currentEpoch,
  accuracy,
  onSaveCheckpoint,
  onLoadCheckpoint,
  onDeleteCheckpoint,
  checkpoints
}) => {
  const [description, setDescription] = useState('');

  const handleSave = () => {
    onSaveCheckpoint({
      epoch: currentEpoch,
      accuracy,
      networkState: '', // This will be filled by the parent component
      description: description || `Checkpoint at epoch ${currentEpoch}`
    });
    setDescription('');
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Training Checkpoints</Typography>
        <InfoTooltip
          title="Training Checkpoints"
          description={
            <Box>
              <Typography variant="body2" gutterBottom>
                Save and restore network states during training:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                <li>Save current network state</li>
                <li>Restore previous checkpoints</li>
                <li>Compare performance across checkpoints</li>
                <li>Track training progress</li>
              </Typography>
            </Box>
          }
        />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{ flexGrow: 1 }}
        >
          Save Checkpoint
        </Button>
      </Box>

      <List>
        {checkpoints.map((checkpoint) => (
          <ListItem
            key={checkpoint.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1
            }}
          >
            <ListItemText
              primary={checkpoint.description}
              secondary={
                <React.Fragment>
                  <Typography variant="body2" component="span">
                    Epoch: {checkpoint.epoch} | 
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    Accuracy: {(checkpoint.accuracy * 100).toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" component="div" color="textSecondary">
                    {new Date(checkpoint.timestamp).toLocaleString()}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => onLoadCheckpoint(checkpoint.networkState)}
                title="Restore checkpoint"
              >
                <Restore />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => onDeleteCheckpoint(checkpoint.id)}
                title="Delete checkpoint"
                sx={{ ml: 1 }}
              >
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 