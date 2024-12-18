import { Settings } from '../types/settings';

interface StreamResponse {
  id: string;
  content: string;
  done: boolean;
}

export const initializeLLM = (settings: Settings) => {
  return (
    messages: { role: string; content: string }[],
    customSettings?: Partial<Settings>,
    onChunk?: (chunk: string) => void
  ) => {
    return callLLM(
      messages, 
      customSettings ? { ...settings, ...customSettings } : settings,
      onChunk
    );
  };
};

export const callLLM = async (
  messages: { role: string; content: string }[],
  settings: Settings,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const selectedServer = settings.servers.find(s => s.id === settings.selectedServer);

  if (!selectedServer) {
    throw new Error('No LLM server selected');
  }

  const isLMStudio = selectedServer.type === 'lmstudio';

  try {
    const response = await fetch(`${selectedServer.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${isLMStudio ? 'lm-studio' : selectedServer.apiKey || ''}`
      },
      body: JSON.stringify({
        model: isLMStudio ? "lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF" : "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullMessage = '';

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');

        for (const line of lines) {
          try {
            const jsonLine = line.replace(/^data: /, '');
            if (!jsonLine) continue;

            const json = JSON.parse(jsonLine);
            const content = json.choices[0]?.delta?.content || '';
            
            if (content) {
              fullMessage += content;
              onChunk?.(content);
            }
          } catch (e) {
            console.warn('Error parsing chunk:', e);
          }
        }
      }
    }

    return fullMessage;
  } catch (error) {
    console.error('Error calling LLM:', error);
    throw error;
  }
}; 