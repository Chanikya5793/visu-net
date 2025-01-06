import { Button, Container, Typography } from '@mui/material';
import React from 'react';
import './App.css';

function App() {
  return (
    <Container className="App">
      <Typography variant="h4" gutterBottom>
        Neural Network Visualization
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is a basic front end for our app.
      </Typography>
      <Button variant="contained" color="primary">
        Get Started
      </Button>
    </Container>
  );
}

export default App;