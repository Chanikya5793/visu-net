import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import React from 'react';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  importData: string;
  setImportData: (data: string) => void;
  onImport: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  importData,
  setImportData,
  onImport
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Import Network Configuration</DialogTitle>
    <DialogContent>
      <TextField
        multiline
        rows={8}
        fullWidth
        value={importData}
        onChange={(e) => setImportData(e.target.value)}
        placeholder="Paste network configuration JSON here..."
        sx={{ mt: 1 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onImport} variant="contained">Import</Button>
    </DialogActions>
  </Dialog>
); 