import { Box, Tooltip, Zoom } from '@mui/material';
import { useEffect, useState } from 'react';

interface OnboardingOverlayProps {
  anchorEl: HTMLElement | null;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ anchorEl }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasSeenOverlay, setHasSeenOverlay] = useState(() => {
    return localStorage.getItem('hasSeenSidebarOverlay') === 'true';
  });

  useEffect(() => {
    if (!hasSeenOverlay && anchorEl) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem('hasSeenSidebarOverlay', 'true');
        setHasSeenOverlay(true);
      }, 8000); // Hide after 8 seconds

      return () => clearTimeout(timer);
    }
  }, [hasSeenOverlay, anchorEl]);

  if (hasSeenOverlay || !anchorEl || !isVisible) return null;

  return (
    <Tooltip
      open
      title="Click here to access the sidebar menu for settings and navigation"
      placement="right"
      arrow
      TransitionComponent={Zoom}
    >
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1300,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: anchorEl?.offsetLeft,
            top: anchorEl?.offsetTop,
            width: anchorEl?.offsetWidth,
            height: anchorEl?.offsetHeight,
            border: '2px solid #2196f3',
            borderRadius: '50%',
            animation: 'ripple 1.5s infinite ease-out',
          },
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0.6,
            },
            '100%': {
              transform: 'scale(1.5)',
              opacity: 0,
            },
          },
        }}
      />
    </Tooltip>
  );
};

export default OnboardingOverlay;