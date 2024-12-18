export type CellType = 'code' | 'markdown';
export type CellStatus = 'idle' | 'running' | 'success' | 'error';

export interface NotebookCell {
  id: string;
  type: CellType;
  content: string;
  output?: string;
  status: CellStatus;
  executionCount?: number;
}

export interface Notebook {
  id: string;
  name: string;
  cells: NotebookCell[];
} 