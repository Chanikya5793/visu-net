import InfoIcon from '@mui/icons-material/Info';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import React from 'react';

interface InfoTooltipProps {
  title: string;
  description: string | React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, description }) => {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2">
            {description}
          </Typography>
        </Box>
      }
      arrow
    >
      <IconButton size="small" sx={{ ml: 1, p: 0 }}>
        <InfoIcon sx={{ fontSize: '1rem' }} />
      </IconButton>
    </Tooltip>
  );
}; 