declare module 'react-konva' {
  import * as Konva from 'konva';
  import * as React from 'react';

  export interface KonvaNodeEvents {
    onClick?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseDown?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseUp?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseMove?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseEnter?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onMouseLeave?: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
    onDragStart?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
    onDragEnd?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
    onDragMove?: (evt: Konva.KonvaEventObject<DragEvent>) => void;
  }

  export interface StageProps extends KonvaNodeEvents {
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export interface LayerProps {
    children?: React.ReactNode;
  }

  export interface CircleProps extends KonvaNodeEvents {
    x?: number;
    y?: number;
    radius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    draggable?: boolean;
  }

  export interface LineProps extends KonvaNodeEvents {
    points: number[];
    stroke?: string;
    strokeWidth?: number;
    tension?: number;
    lineCap?: string;
    lineJoin?: string;
  }

  export interface TextProps extends KonvaNodeEvents {
    x?: number;
    y?: number;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    align?: string;
  }

  export const Stage: React.FC<StageProps>;
  export const Layer: React.FC<LayerProps>;
  export const Circle: React.FC<CircleProps>;
  export const Line: React.FC<LineProps>;
  export const Text: React.FC<TextProps>;
} 