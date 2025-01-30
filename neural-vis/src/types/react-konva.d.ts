/**
 * Type definitions for react-konva library
 * 
 * This module provides TypeScript type definitions for the react-konva library,
 * which enables React components to work with HTML5 Canvas through KonvaJS.
 * 
 * Features:
 * - Type definitions for Stage, Layer, and basic shapes
 * - Event handling interfaces for mouse and drag events
 * - Props interfaces for all Konva components
 * 
 * @module react-konva
 */

declare module 'react-konva' {
  import * as Konva from 'konva';
    import * as React from 'react';

  /**
   * Interface for common Konva node events
   * Provides type definitions for mouse and drag event handlers
   */
  export interface KonvaNodeEvents {
    /** Click event handler */
    onClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    /** Mouse down event handler */
    onMouseDown?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    /** Mouse up event handler */
    onMouseUp?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    /** Mouse move event handler */
    onMouseMove?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    /** Mouse enter event handler */
    onMouseEnter?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    /** Mouse leave event handler */
    onMouseLeave?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    /** Drag start event handler */
    onDragStart?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
    /** Drag end event handler */
    onDragEnd?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
    /** Drag move event handler */
    onDragMove?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
  }

  /**
   * Props interface for Stage component
   * Stage is the root container for all Konva nodes
   */
  export interface StageProps extends KonvaNodeEvents {
    /** Width of the stage in pixels */
    width?: number;
    /** Height of the stage in pixels */
    height?: number;
    /** CSS styles for the stage container */
    style?: React.CSSProperties;
    /** Child nodes to render within the stage */
    children?: React.ReactNode;
  }

  /**
   * Props interface for Layer component
   * Layer is a container for shapes and groups
   */
  export interface LayerProps {
    /** Child nodes to render within the layer */
    children?: React.ReactNode;
  }

  /**
   * Props interface for Circle component
   * Circle is a basic shape component
   */
  export interface CircleProps extends KonvaNodeEvents {
    /** X coordinate of the circle's center */
    x?: number;
    /** Y coordinate of the circle's center */
    y?: number;
    /** Radius of the circle */
    radius?: number;
    /** Fill color of the circle */
    fill?: string;
    /** Stroke color of the circle's outline */
    stroke?: string;
    /** Width of the circle's stroke */
    strokeWidth?: number;
    /** Whether the circle can be dragged */
    draggable?: boolean;
  }

  /**
   * Props interface for Line component
   * Line is a component for drawing lines and curves
   */
  export interface LineProps extends KonvaNodeEvents {
    /** Array of points defining the line [x1, y1, x2, y2, ...] */
    points: number[];
    /** Stroke color of the line */
    stroke?: string;
    /** Width of the line */
    strokeWidth?: number;
    /** Amount of curve tension (0 = straight, 1 = maximum curve) */
    tension?: number;
    /** Style of line endings ('butt', 'round', 'square') */
    lineCap?: string;
    /** Style of line joins ('miter', 'round', 'bevel') */
    lineJoin?: string;
  }

  /**
   * Props interface for Text component
   * Text is a component for rendering text on canvas
   */
  export interface TextProps extends KonvaNodeEvents {
    /** X coordinate of the text */
    x?: number;
    /** Y coordinate of the text */
    y?: number;
    /** Text content to display */
    text?: string;
    /** Font size in pixels */
    fontSize?: number;
    /** Font family name */
    fontFamily?: string;
    /** Fill color of the text */
    fill?: string;
    /** Text alignment ('left', 'center', 'right') */
    align?: string;
  }

  /** Stage component for creating the canvas container */
  export const Stage: React.FC<StageProps>;
  /** Layer component for grouping shapes */
  export const Layer: React.FC<LayerProps>;
  /** Circle component for drawing circles */
  export const Circle: React.FC<CircleProps>;
  /** Line component for drawing lines */
  export const Line: React.FC<LineProps>;
  /** Text component for rendering text */
  export const Text: React.FC<TextProps>;
}