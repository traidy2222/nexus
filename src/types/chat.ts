export type Role = 'user' | 'assistant' | 'system';

export type StepType = 'thought' | 'action' | 'observation' | 'reflection' | 'final' | 'error';
export type StepStatus = 'thinking' | 'processing' | 'complete' | 'error';

export interface ChatMessageMetadata {
  currentStep?: StepStatus;
  type?: StepType;
  thought?: string;
  action?: string;
  observation?: string;
  reflection?: string;
  summary?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: ChatMessageMetadata;
  timestamp?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface StepResult {
  type: 'thought' | 'action' | 'observation' | 'reflection' | 'final';
  content: string;
} 