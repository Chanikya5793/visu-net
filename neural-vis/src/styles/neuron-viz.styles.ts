/**
 * Neural Network Visualization Styles
 * 
 * This module defines the core styles used throughout the neural network visualization
 * components. It provides consistent styling for tooltips, network diagrams, and form elements.
 * 
 * Features:
 * - Tooltip styling with consistent background and borders
 * - Smooth transitions for network diagram animations
 * - Form element styling for consistent user input
 * 
 * Usage:
 * ```tsx
 * import { styles } from './neuron-viz.styles';
 * 
 * <div style={styles.tooltipContainer}>
 *   // Tooltip content
 * </div>
 * ```
 */

export const styles = {
  /** Container style for tooltips with consistent background and border */
  tooltipContainer: {
    backgroundColor: '#fff',
    padding: '10px',
    border: '1px solid #ccc'
  },

  /** Network diagram container with smooth transitions */
  networkDiagram: {
    transition: 'all 0.3s ease-in-out'
  },

  /** Consistent styling for textarea form elements */
  textarea: {
    width: '100%',
    minHeight: '200px'
  }
};