import { NotebookCell } from '../types/notebook';

class JupyterRuntime {
  private static instance: JupyterRuntime;
  private kernelStatus: 'idle' | 'busy' = 'idle';
  private executionCount = 0;

  private constructor() {}

  static getInstance(): JupyterRuntime {
    if (!JupyterRuntime.instance) {
      JupyterRuntime.instance = new JupyterRuntime();
    }
    return JupyterRuntime.instance;
  }

  async executeCell(cell: NotebookCell): Promise<NotebookCell> {
    if (this.kernelStatus === 'busy') {
      throw new Error('Kernel is busy');
    }

    this.kernelStatus = 'busy';
    const updatedCell = { ...cell, status: 'running' as const };

    try {
      // Send to your LLM service with special formatting for code execution
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cell.content,
          cellType: cell.type,
        }),
      });

      const result = await response.json();

      this.executionCount++;
      
      return {
        ...updatedCell,
        output: result.output,
        status: 'success' as const,
        executionCount: this.executionCount,
      };
    } catch (error) {
      return {
        ...updatedCell,
        output: error.message,
        status: 'error' as const,
      };
    } finally {
      this.kernelStatus = 'idle';
    }
  }

  getKernelStatus() {
    return this.kernelStatus;
  }

  resetKernel() {
    this.kernelStatus = 'idle';
    this.executionCount = 0;
  }
}

export default JupyterRuntime; 