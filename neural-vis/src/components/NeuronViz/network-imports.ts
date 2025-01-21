// Import and re-export components from the network folder
export { ExperimentArchitecture } from '../network/controls/ExperimentArchitecture';
export { GradientLegend } from '../network/controls/GradientLegend';
export { InfoTooltip } from '../network/controls/InfoTooltip';
export { AnimationLayer } from '../network/visualization/AnimationLayer';
export { BackpropagationViz } from '../network/visualization/BackpropagationViz';

// Re-export enhanced components (to be used instead of our simpler versions when needed)
export { NetworkStats as EnhancedNetworkStats } from '../network/metrics/NetworkStats';
export { PerformanceMetrics as EnhancedPerformanceMetrics } from '../network/metrics/PerformanceMetrics';
export { ActivationPatterns as EnhancedActivationPatterns } from '../network/visualization/ActivationPatterns';

