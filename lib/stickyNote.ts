export interface StickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StickyNotesProps {
  projectId?: string;
  readonly?: boolean;
}

export const STICKY_NOTE_COLORS = [
  '#FFE066', // Yellow
  '#FF9999', // Pink
  '#99CCFF', // Blue
  '#99FF99', // Green
  '#FFCC99', // Orange
  '#CC99FF', // Purple
] as const;

export type StickyNoteColor = typeof STICKY_NOTE_COLORS[number];