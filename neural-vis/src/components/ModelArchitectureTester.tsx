// src/components/ModelArchitectureTester.tsx
import { Box, Button, LinearProgress, Typography, TextField, IconButton } from '@mui/material';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { createTrainer } from '../utils/trainer';
import { ArchitectureTestResult } from '../types/architecture';
import { ITrainer } from '../models/TrainerInterface';

interface ModelArchitectureTesterProps {
  dataset: string;
  onComplete: (results: ArchitectureTestResult[]) => void;
}

export const ModelArchitectureTester: React.FC<ModelArchitectureTesterProps> = ({
  dataset,
  onComplete
}) => {
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customArchitecture, setCustomArchitecture] = useState<number[]>([]);
  const [currentTest, setCurrentTest] = useState(0);

  const architectureTemplates = {
    shallow: [3, 4, 3],
    deep: [3, 8, 6, 4, 3],
    wide: [3, 16, 12, 3],
    veryDeep: [3, 6, 6, 6, 6, 3],
    bottleneck: [3, 8, 4, 8, 3],
  };
  
  const totalTests = Object.keys(architectureTemplates).length + 1;

  const testArchitecture = async (layers: number[]): Promise<ArchitectureTestResult | null> => {
    const trainer = createTrainer(dataset);
    if (!trainer) return null;

    const startTime = Date.now();
    
    await trainer.train({
      epochs: 100,
      onIteration: () => {
        // Update progress within this architecture test
      }
    });

    const metrics = await trainer.getPerformanceMetrics();
    
    return {
      layers,
      metrics,
      trainTime: Date.now() - startTime
    };
  };

  const runTests = async (architectures: number[][]) => {
    setTesting(true);
    const results: ArchitectureTestResult[] = [];

    // Fix for the entries() iteration issue
    for (let i = 0; i < architectures.length; i++) {
      setCurrentTest(i);
      const result = await testArchitecture(architectures[i]);
      if (result) {
        results.push(result);
      }
      setProgress(((i + 1) / architectures.length) * 100);
    }

    onComplete(results);
    setTesting(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Architecture Testing</Typography>
      
      {/* Quick Test Templates */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {Object.entries(architectureTemplates).map(([name, architecture]) => (
          <Button
            key={name}
            variant="outlined"
            size="small"
            onClick={() => setCustomArchitecture(architecture)}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
        ))}
      </Box>

      {/* Custom Architecture Builder */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>Custom Architecture</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {customArchitecture.map((neurons, idx) => (
            <TextField
              key={idx}
              type="number"
              label={`Layer ${idx + 1}`}
              value={neurons}
              onChange={(e) => {
                const newArch = [...customArchitecture];
                newArch[idx] = parseInt(e.target.value) || 1;
                setCustomArchitecture(newArch);
              }}
              size="small"
              sx={{ width: 100 }}
            />
          ))}
          <IconButton onClick={() => setCustomArchitecture([...customArchitecture, 4])}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Test Controls */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => runTests([customArchitecture])}
          disabled={testing}
        >
          Test Custom Architecture
        </Button>
        <Button
          variant="outlined"
          onClick={() => runTests(Object.values(architectureTemplates))}
          disabled={testing}
        >
          Test All Templates
        </Button>
      </Box>

      {/* Progress Indicator */}
      {testing && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Testing architecture {currentTest + 1} of {totalTests}
          </Typography>
        </Box>
      )}
    </Box>
  );
};