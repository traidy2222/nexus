import { ChatMessage } from '../types/chat';
import { Tool, ToolResult } from '../tools/Tool';

export interface AgentAction {
  type: string;
  payload: Record<string, any>;
}

export interface AgentObservation {
  type: string;
  data: Record<string, any>;
}

export interface AgentState {
  messages: ChatMessage[];
  memory: Record<string, any>;
  context?: string;
}

export interface StepResult {
  type: 'thought' | 'action' | 'observation' | 'reflection' | 'final';
  content: string;
}

export abstract class BaseAgent {
  protected state: AgentState;
  protected tools: Map<string, Tool>;

  constructor(initialState?: Partial<AgentState>) {
    this.state = {
      messages: [],
      memory: {},
      ...initialState
    };
    this.tools = new Map();
  }

  addTool(tool: Tool): void {
    this.tools.set(tool.getName(), tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async useTool(name: string, params: Record<string, any>): Promise<ToolResult> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(params);
  }

  abstract think(input: string): Promise<string>;
  abstract act(thought: string): Promise<AgentAction>;
  abstract observe(action: AgentAction): Promise<AgentObservation>;
  abstract reflect(observation: AgentObservation): Promise<string>;

  public getMemoryState(): Record<string, any> {
    return this.state.memory;
  }

  protected addToMemory(key: string, value: any): void {
    console.log('BaseAgent.addToMemory - Adding to memory:', { key, value });
    this.state.memory[key] = value;
    console.log('BaseAgent.addToMemory - Current memory state:', this.state.memory);
  }

  protected getFromMemory(key: string): any {
    console.log('BaseAgent.getFromMemory - Retrieving from memory:', { key, value: this.state.memory[key] });
    return this.state.memory[key];
  }

  protected clearMemory(): void {
    console.log('BaseAgent.clearMemory - Clearing memory');
    this.state.memory = {};
  }

  protected addMessage(message: ChatMessage): void {
    if (this.state.messages.some(m => m.content === message.content)) {
      return;
    }
    this.state.messages.push(message);
  }

  public getMessages(): ChatMessage[] {
    return this.state.messages.filter(m => 
      m.metadata?.currentStep !== 'processing'
    );
  }

  protected getContext(): string | undefined {
    return this.state.context;
  }

  protected setContext(context: string): void {
    this.state.context = context;
  }

  public abstract process(
    input: string,
    onStep?: (step: StepResult) => void
  ): Promise<string>;

  public getState(): AgentState {
    return {
      messages: this.state.messages,
      memory: this.state.memory,
      context: this.state.context
    };
  }
} 