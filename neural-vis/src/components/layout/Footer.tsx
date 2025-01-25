import { Box, Container, Grid, Link, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A neural network visualization tool for educational purposes.
              Built with React and TypeScript.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/docs" color="text.secondary" display="block">Documentation</Link>
            <Link href="/examples" color="text.secondary" display="block">Examples</Link>
            <Link href="/tutorials" color="text.secondary" display="block">Tutorials</Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Link href="https://github.com/yourusername/neural-vis" color="text.secondary" display="block">
              GitHub Repository
            </Link>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Neural Network Visualization
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
