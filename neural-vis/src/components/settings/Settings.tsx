import {
  Box,
  Card,
  CardContent,
  Switch,
  Slider,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { useSettingsStore } from '../../stores/settingsStore';

export default function Settings() {
  const {
    darkMode,
    animationSpeed,
    nodeSize,
    showLabels,
    setDarkMode,
    setAnimationSpeed,
    setNodeSize,
    setShowLabels,
    resetToDefaults,
  } = useSettingsStore();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography gutterBottom>Dark Mode</Typography>
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            </Box>

            <Box>
              <Typography gutterBottom>Animation Speed</Typography>
              <Slider
                value={animationSpeed}
                min={0.1}
                max={2}
                step={0.1}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setAnimationSpeed(value as number)}
              />
            </Box>

            <Box>
              <Typography gutterBottom>Node Size</Typography>
              <Slider
                value={nodeSize}
                min={10}
                max={50}
                marks
                valueLabelDisplay="auto"
                onChange={(_, value) => setNodeSize(value as number)}
              />
            </Box>

            <Box>
              <Typography gutterBottom>Show Labels</Typography>
              <Switch
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
              />
            </Box>

            <Button
              variant="contained"
              color="warning"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
