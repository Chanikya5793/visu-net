import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { ITrainer } from '../../models/TrainerInterface';
import { TrainingAnalytics } from './analytics/TrainingAnalytics';
import { NetworkComparison } from './comparison/NetworkComparison';
import { ModelExplanation } from './explanation/ModelExplanation';
import { LearningPlayground } from './playground/LearningPlayground';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`network-tabpanel-${index}`}
      aria-labelledby={`network-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface AdvancedNetworkFeaturesProps {
  trainer: ITrainer | null;
  dataset: string;
  createTrainer: (dataset: string) => ITrainer | null;
  epochs: number;
  weights: number[][][];
  activations: number[][];
  gradients: number[][];
  metrics: {
    epoch: number;
    loss: number;
    accuracy: number;
  }[];
}

export const AdvancedNetworkFeatures: React.FC<AdvancedNetworkFeaturesProps> = ({
  trainer,
  dataset,
  createTrainer,
  epochs,
  weights,
  activations,
  gradients,
  metrics
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="network features tabs"
        >
          <Tab label="Architecture Comparison" />
          <Tab label="Training Analytics" />
          <Tab label="Learning Playground" />
          <Tab label="Model Explanation" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <NetworkComparison
          dataset={dataset}
          createTrainer={createTrainer}
          epochs={epochs}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TrainingAnalytics
          weights={weights}
          activations={activations}
          gradients={gradients}
          metrics={metrics}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <LearningPlayground
          trainer={trainer}
          dataset={dataset}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ModelExplanation
          trainer={trainer}
          dataset={dataset}
          weights={weights}
          activations={activations}
        />
      </TabPanel>
    </Box>
  );
}; 