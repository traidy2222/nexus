export interface LLMServer {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  type: 'openai' | 'custom' | 'lmstudio';
}

export interface Settings {
  selectedServer: string;
  servers: LLMServer[];
  theme: 'dark' | 'light';
} 