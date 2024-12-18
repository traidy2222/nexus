import { CodeActAgent } from '../agents/CodeActAgent';
import { ChatMessage, ChatMessageMetadata } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';
import { StepResult } from '../agents/BaseAgent';

// Singleton instance of the agent
let agentInstance: CodeActAgent | null = null;

// Load agent state from localStorage
const loadAgentState = () => {
  try {
    const savedState = localStorage.getItem('agentState');
    if (savedState) {
      console.log('Loading agent state from localStorage');
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading agent state:', error);
  }
  return null;
};

// Save agent state to localStorage
const saveAgentState = (state: any) => {
  try {
    console.log('Saving agent state to localStorage:', state);
    localStorage.setItem('agentState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving agent state:', error);
  }
};

export const initializeAgent = (settings: any, llm: any) => {
  console.log('Initializing agent with settings:', settings);
  
  if (!agentInstance) {
    // Try to load saved state
    const savedState = loadAgentState();
    console.log('Loaded saved state:', savedState);

    // Create new agent with saved state or initial state
    agentInstance = new CodeActAgent({
      memory: {
        settings,
        llm,
        ...(savedState?.memory || {})
      },
      ...(savedState || {})
    });
    console.log('Created new agent instance');
  } else {
    // Update existing agent's settings
    agentInstance.updateSettings(settings, llm);
    console.log('Updated existing agent instance');
  }

  // Save initial state
  saveAgentState(agentInstance.getState());
  return agentInstance;
};

export const processMessage = async (
  content: string,
  onStep?: (message: ChatMessage) => void
): Promise<ChatMessage[]> => {
  console.log('Processing message:', content);
  
  if (!agentInstance) {
    throw new Error('Agent not initialized');
  }

  const messages: ChatMessage[] = [];

  const handleStep = (step: StepResult) => {
    console.log('Processing step:', step.type, step.content);
    const message = createMessage(step.content, {
      currentStep: 'complete',
      type: step.type
    });
    messages.push(message);
    onStep?.(message);

    // Save state after each step
    saveAgentState(agentInstance?.getState());
  };

  try {
    await agentInstance.process(content, handleStep);
    // Save final state
    saveAgentState(agentInstance.getState());
    return messages;
  } catch (error) {
    console.error('Error processing message:', error);
    const errorMessage = createMessage(`Error: ${error.message}`, {
      currentStep: 'error',
      type: 'error'
    });
    messages.push(errorMessage);
    onStep?.(errorMessage);
    return messages;
  }
};

const createMessage = (
  content: string,
  metadata: ChatMessageMetadata = {}
): ChatMessage => ({
  id: uuidv4(),
  role: 'assistant',
  content,
  metadata,
  timestamp: new Date().toISOString()
});

// Add a function to get the current agent state for debugging
export const getAgentState = () => {
  if (!agentInstance) {
    return null;
  }
  return agentInstance.getState();
}; 