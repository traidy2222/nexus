import { BaseAgent } from '../agents/BaseAgent';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ToolOptions {
  agent: BaseAgent;
  [key: string]: any;
}

export abstract class Tool {
  protected agent: BaseAgent;
  protected name: string;
  protected description: string;

  constructor(options: ToolOptions) {
    this.agent = options.agent;
  }

  abstract execute(params: Record<string, any>): Promise<ToolResult>;

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  protected validateParams(params: Record<string, any>, required: string[]): boolean {
    for (const param of required) {
      if (!(param in params)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
    return true;
  }

  protected createResult(
    success: boolean,
    data?: any,
    error?: string,
    metadata?: Record<string, any>
  ): ToolResult {
    return {
      success,
      data,
      error,
      metadata: {
        ...metadata,
        toolName: this.name,
        timestamp: new Date().toISOString()
      }
    };
  }
} 