// src/components/TrainingMetrics.tsx
import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';

interface TrainingMetricsProps {
    iteration: number;
    epochs: number;
    loss: number;
    accuracy: number;
    isTraining: boolean;
}

export const TrainingMetrics: React.FC<TrainingMetricsProps> = ({
    iteration,
    epochs,
    loss,
    accuracy,
    isTraining
}) => {
    const progress = (iteration/epochs) * 100;
    
    return (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>Training Progress</Typography>
            {isTraining ? (
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            Epoch {iteration} of {epochs}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {progress.toFixed(1)}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ mb: 2, height: 8, borderRadius: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 4, justifyContent: 'space-around' }}>
                        <Box>
                            <Typography color="textSecondary">Loss</Typography>
                            <Typography variant="h6">{Number(loss).toFixed(6)}</Typography>
                        </Box>
                        <Box>
                            <Typography color="textSecondary">Accuracy</Typography>
                            <Typography variant="h6">{Number(accuracy * 100).toFixed(2)}%</Typography>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Typography color="textSecondary">Training not in progress</Typography>
            )}
        </Box>
    );
};