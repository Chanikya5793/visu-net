// Language: TypeScript
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface TrainingStoppedDialogProps {
  open: boolean;
  reason: string;
  onClose: () => void;
}

export const TrainingStoppedDialog: React.FC<TrainingStoppedDialogProps> = ({ open, reason, onClose }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Training Stopped</DialogTitle>
    <DialogContent>
      <Typography variant="body1">
        Training has been stopped because: {reason}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);