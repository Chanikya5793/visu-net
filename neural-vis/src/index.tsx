/**
 * Application Entry Point
 * 
 * This is the main entry point for the Neural Network Visualization application.
 * It sets up the React root and renders the main App component.
 * 
 * Features:
 * - React 18 createRoot implementation
 * - Strict Mode enabled for development best practices
 * - Performance monitoring with reportWebVitals
 * 
 * Initialization:
 * - Creates root element for React rendering
 * - Wraps App component in StrictMode
 * - Initializes performance monitoring
 * 
 * @module index
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize performance monitoring
reportWebVitals();
