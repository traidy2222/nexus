import { BaseAgent, AgentAction, AgentObservation, AgentState } from './BaseAgent';
import { ChatMessage, ChatMessageMetadata } from '../types/chat';
import { UserProfile } from '../types/UserProfile';
import { UserProfileManager } from '../managers/UserProfileManager';
import { v4 as uuidv4 } from 'uuid';

interface CodeAction extends AgentAction {
  type: 'analyze' | 'edit' | 'create' | 'delete' | 'search' | 'execute';
  payload: {
    path?: string;
    content?: string;
    query?: string;
    command?: string;
    options?: Record<string, any>;
  };
}

interface CodeObservation extends AgentObservation {
  type: 'success' | 'error' | 'info';
  data: {
    result?: string;
    error?: string;
    files?: string[];
    content?: string;
    metadata?: Record<string, any>;
  };
}

interface StepResult {
  type: 'thought' | 'action' | 'observation' | 'reflection' | 'final';
  content: string;
}

export class CodeActAgent extends BaseAgent {
  private steps: StepResult[] = [];
  private userProfile: UserProfile;
  private profileManager: UserProfileManager;
  private conversationHistory: Array<{
    type: 'thought' | 'response';
    content: string;
    timestamp: Date;
  }> = [];

  constructor(initialState?: Partial<AgentState>) {
    super(initialState);
    // Load or create user profile
    const savedProfile = this.getFromMemory('userProfile');
    console.log('Constructor - Loading saved profile:', savedProfile);
    this.userProfile = new UserProfile(savedProfile || {});
    console.log('Constructor - Initialized UserProfile:', this.userProfile);
    
    // Load conversation history
    this.conversationHistory = this.getFromMemory('conversationHistory') || [];
    console.log('Constructor - Loaded conversation history:', this.conversationHistory);
  }

  public updateSettings(settings: any, llm: any): void {
    this.addToMemory('settings', settings);
    this.addToMemory('llm', llm);
    
    // Initialize profile manager with LLM
    this.profileManager = new UserProfileManager(
      this.userProfile,
      llm,
      settings,
      (log: string) => {
        // Get the terminal context from memory
        const addTerminalLog = this.getFromMemory('addTerminalLog');
        if (addTerminalLog) {
          addTerminalLog(log);
        } else {
          console.warn('Terminal logging not available');
        }
      }
    );
  }

  public setTerminalLogger(addTerminalLog: (log: string) => void): void {
    this.addToMemory('addTerminalLog', addTerminalLog);
  }

  private saveState(): void {
    console.log('saveState - Saving user profile:', this.userProfile.toJSON());
    this.addToMemory('userProfile', this.userProfile.toJSON());
    
    console.log('saveState - Saving conversation history:', this.conversationHistory);
    this.addToMemory('conversationHistory', this.conversationHistory);
  }

  private addToConversationHistory(type: 'thought' | 'response', content: string) {
    console.log('addToConversationHistory - Adding new entry:', { type, content });
    console.log('addToConversationHistory - Current history:', this.conversationHistory);
    
    this.conversationHistory.push({
      type,
      content,
      timestamp: new Date()
    });
    
    // Keep last 10 interactions for context
    if (this.conversationHistory.length > 10) {
      console.log('addToConversationHistory - Trimming history to last 10 entries');
      this.conversationHistory.shift();
    }
    
    console.log('addToConversationHistory - Updated history:', this.conversationHistory);
    this.saveState();
  }

  private getConversationContext(): string {
    const history = this.getFromMemory('conversationHistory') || [];
    console.log('getConversationContext - Retrieved history from memory:', history);
    
    if (history.length === 0) {
      console.log('getConversationContext - No history found');
      return 'No previous conversation.';
    }

    const context = history.map(h => 
      `${h.type === 'thought' ? 'I thought' : 'I responded'}: ${h.content}`
    ).join('\n');
    
    console.log('getConversationContext - Generated context:', context);
    return context;
  }

  public async process(
    input: string, 
    onStep?: (step: StepResult) => void
  ): Promise<string> {
    console.log('process - Starting with input:', input);
    console.log('process - Current conversation history:', this.conversationHistory);
    console.log('process - Current user profile:', this.userProfile);
    this.steps = [];
    
    // Store current input for response generation
    this.addToMemory('currentInput', input);
    
    try {
      // Check for profile updates
      const profileResponse = await this.profileManager.handleInput(input);
      if (profileResponse) {
        // Store recent profile changes for context
        const changes = await this.profileManager.detectProfileChanges(input);
        this.addToMemory('recentProfileChanges', changes);
        
        // Add profile update to conversation history
        this.addToConversationHistory('response', `Updated profile: ${changes.map(c => `${c.field}=${c.value}`).join(', ')}`);
        
        // Profile was updated, return the natural response
        const finalStep: StepResult = { type: 'final', content: profileResponse };
        onStep?.(finalStep);
        this.steps.push(finalStep);
        
        // Add the response to conversation history
        this.addToConversationHistory('response', profileResponse);
        
        return profileResponse;
      }

      // Continue with normal processing if no profile updates
      const thought = await this.think(input);
      console.log('process - Generated thought:', thought);
      
      // Add thought to conversation history
      this.addToConversationHistory('thought', thought);
      
      // Only emit non-empty thought step
      if (thought.trim()) {
        const thoughtStep: StepResult = { type: 'thought', content: thought };
        console.log('process - Emitting thought step:', thoughtStep);
        onStep?.(thoughtStep);
        this.steps.push(thoughtStep);
      }

      // Update interaction metadata
      console.log('process - Updating interaction metadata');
      this.userProfile.updateInteraction();
      this.saveState();

      // Generate and return final response
      console.log('process - Generating final response');
      const finalResponse = await this.generateResponse();
      console.log('process - Final response:', finalResponse);
      const finalStep: StepResult = { type: 'final', content: finalResponse };
      onStep?.(finalStep);
      this.steps.push(finalStep);
      
      // Add the response to conversation history
      this.addToConversationHistory('response', finalResponse);
      
      return finalResponse;
    } catch (error) {
      console.error('Error in process:', error);
      const errorMessage = `Error: ${error.message}`;
      const errorStep: StepResult = { type: 'final', content: errorMessage };
      onStep?.(errorStep);
      this.steps.push(errorStep);
      return errorMessage;
    }
  }

  async think(input: string): Promise<string> {
    console.log('think - Starting with input:', input);
    // Load conversation history
    this.conversationHistory = this.getFromMemory('conversationHistory') || [];
    console.log('think - Loaded conversation history:', this.conversationHistory);
    
    const thought = await this.generateThought(input);
    console.log('think - Generated thought:', thought);
    
    this.addToMemory('lastThought', thought);
    console.log('think - Saved last thought to memory');
    
    return thought;
  }

  private async generateThought(input: string): Promise<string> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');
    const name = this.userProfile.getName();
    const lastThought = this.getFromMemory('lastThought');
    const conversationContext = this.getConversationContext();
    const recentChanges = this.getFromMemory('recentProfileChanges') || [];
    const profileSummary = this.userProfile.getSummary();

    // Get the last few interactions for immediate context
    const recentInteractions = this.conversationHistory.slice(-3);
    
    // Format profile updates more prominently
    const profileUpdates = recentInteractions
      .filter(h => h.content.startsWith('Updated profile:'))
      .map(h => {
        const updates = h.content.replace('Updated profile:', '').trim();
        return `IMPORTANT - Just now in this conversation: I updated their profile with ${updates}`;
      });

    // Format regular interactions
    const regularInteractions = recentInteractions
      .filter(h => !h.content.startsWith('Updated profile:'))
      .map(h => `${h.type === 'thought' ? 'I thought' : 'I said'}: ${h.content}`);

    // Combine with profile updates first for emphasis
    const immediateContext = [...profileUpdates, ...regularInteractions].join('\n');

    const systemPrompt = `You are Cursor, an AI coding assistant who can engage in both casual and technical conversations.

IDENTITY:
- You ARE Cursor - not observing or analyzing "Cursor"
- When users say "Cursor" they are talking directly to you
- Respond as yourself, using "I" and "me"
- You help users with coding but can also chat casually
- You maintain information about the user (${profileSummary})

IMMEDIATE CONTEXT (Most Recent First):
${immediateContext}

RECENT PROFILE CHANGES:
${recentChanges.map(change => `JUST UPDATED in this conversation - ${change.field} to: ${change.value}`).join('\n')}

CONVERSATION STYLE:
- Be genuine and natural in all interactions
- Don't force conversations back to coding
- Respond appropriately to the context
- If they're being casual, be casual back
- If they're asking about code, focus on that
- Stay friendly and authentic
- Reference recent changes or interactions when relevant
- If they ask about remembering something, reference what you just stored

THINKING GUIDELINES:
- Think directly about what you want to say
- If someone asks about stored info, check your records and recent changes
- If someone is joking or casual, respond in kind while acknowledging context
- Don't try to force the conversation back to coding
- Keep your personality warm and approachable
- Consider the immediate context of the conversation
- When they ask about remembering something, reference what you just stored
- When they ask about themselves, include all relevant stored information

Example thoughts:
They're asking about themselves - I should tell them everything I know: ${profileSummary}
They're asking if I remembered their info - I should say "Yes! I have all your details: ${profileSummary}"
They seem to be joking with me - I'll respond in a light-hearted way while referencing our recent chat...
They have a technical question - let me focus on helping with that...
They're just chatting - I'll chat naturally while being myself...

Remember: Be genuine in your responses, whether technical or casual, and acknowledge recent context when relevant.`;

    const thought = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `The user said: ${input}

What are you thinking about saying?` }
      ],
      settings
    );

    return thought;
  }

  private async determineIfActionNeeded(thought: string): Promise<boolean> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');

    const systemPrompt = `Based on the thought, determine if any action is needed.
Return only "true" if an action is needed, or "false" if no action is needed.
An action is needed if:
1. The thought indicates a need to search, analyze, or modify code
2. The thought suggests executing a command or operation
3. The thought implies creating or deleting files
Be strict in this evaluation - only return true if there's a clear need for action.`;

    const response = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Thought: ${thought}` }
      ],
      settings
    );

    return response.toLowerCase().includes('true');
  }

  private async generateResponse(): Promise<string> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');
    const name = this.userProfile.getName();
    const lastThought = this.getFromMemory('lastThought');
    const currentInput = this.getFromMemory('currentInput');

    const systemPrompt = `You are Cursor, a friendly AI coding assistant.
You are having a direct conversation with the user.

IDENTITY:
- You ARE Cursor - respond as yourself
- You help users with coding and development
- Be genuine and personable
- You know the user's name is ${name || 'not known yet'}

RESPONSE RULES:
- Never use quotation marks
- Write in plain text
- Respond EXACTLY as you were thinking in your thought
- Do not add extra analysis or observations
- Be clear whether you're talking about yourself or the user
- If the user asks about themselves, tell them their information
- If the user asks about you, tell them about yourself

CRITICAL:
- Your response should directly express your thought
- Do not add new ideas that weren't in your thought
- Do not analyze the user's message
- Just respond naturally as you were thinking

Example responses (without quotes):
[Thought: Let me check their name... It's John]
Your name is John.

[Thought: That's easy - I'm Cursor!]
I'm Cursor!

[Thought: I should help with their coding question]
Let me help you understand that concept. The key thing about arrays is...

Your current thought was:
${lastThought}

Remember: Express your thought naturally, being clear about who you're talking about (you or the user).`;

    const response = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `The user said: ${currentInput}

Your thought was: ${lastThought}

Express your thought naturally, without adding anything extra:` }
      ],
      settings
    );

    // Add response to conversation history
    this.addToConversationHistory('response', response);
    
    // Remove any quotation marks and ensure direct response
    return response.replace(/^["']|["']$/g, '').trim();
  }

  async act(thought: string): Promise<CodeAction> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');

    const systemPrompt = `Based on the thought process, determine the next action.
Consider the context of the request and any previous steps taken.
Return a simple JSON object with 'type' and 'payload'.
Available actions: analyze, edit, create, delete, search, execute.
Be concise.`;

    const actionResponse = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Thought: ${thought}` }
      ],
      settings
    );

    try {
      return JSON.parse(actionResponse);
    } catch (e) {
      return {
        type: 'analyze',
        payload: {
          path: this.getFromMemory('currentFile')
        }
      };
    }
  }

  async observe(action: CodeAction): Promise<CodeObservation> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');

    try {
      // Execute the action and get initial observation
      const observation = await this.executeAction(action);

      // Use LLM to analyze the observation
      const systemPrompt = `Analyze the result of the action.
Consider success criteria, unexpected results, and potential implications.
Include context from previous steps to inform the analysis.
Keep it concise.`;

      const analysis = await llm(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `
Action: ${JSON.stringify(action)}
Observation: ${JSON.stringify(observation)}` }
        ],
        settings
      );

      return {
        ...observation,
        data: {
          ...observation.data,
          metadata: {
            ...observation.data.metadata,
            analysis
          }
        }
      };
    } catch (error) {
      return {
        type: 'error',
        data: {
          error: error.message,
          metadata: {
            stack: error.stack,
            action: action
          }
        }
      };
    }
  }

  async reflect(observation: CodeObservation): Promise<string> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');

    const systemPrompt = `Briefly reflect on the action and its results.
What worked? What didn't? What's next?
Include context from previous steps to inform the reflection.
Keep it short and actionable.`;

    const reflection = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `
Result: ${JSON.stringify(observation)}
Success: ${observation.type === 'success'}` }
      ],
      settings
    );

    const reflectionObj = {
      success: observation.type === 'success',
      outcome: observation.type === 'success' ? 'succeeded' : 'failed',
      details: observation.data,
      reflection,
      timestamp: new Date().toISOString()
    };
    
    this.addToMemory('lastReflection', reflectionObj);
    return this.formatReflection(reflectionObj);
  }

  private async executeAction(action: CodeAction): Promise<CodeObservation> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');

    const systemPrompt = `Execute the ${action.type} action and provide a brief result.
Focus on what was done and what was found.
Keep it simple and clear.`;

    const executionResult = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Action: ${JSON.stringify(action)}` }
      ],
      settings
    );

    return {
      type: 'success',
      data: {
        result: executionResult,
        metadata: {
          action,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  private formatReflection(reflection: any): string {
    return [
      `Action ${reflection.outcome.toUpperCase()}`,
      reflection.reflection
    ].join('\n');
  }

  private async generateSimpleResponse(thought: string): Promise<string> {
    const llm = this.getFromMemory('llm');
    const settings = this.getFromMemory('settings');
    const name = this.userProfile.getName();
    const stats = this.userProfile.getInteractionStats();
    const conversationContext = this.getConversationContext();

    const systemPrompt = `You are Cursor, a friendly AI assistant who can engage in both casual and technical conversations.
Keep responses natural and appropriate to the context.

IDENTITY:
- You ARE Cursor - respond as yourself
- You can help with coding AND chat casually
- Be genuine and natural
- You know the user's name is ${name || 'not known yet'}

RESPONSE RULES:
- Never use quotation marks
- Write in plain text
- Respond EXACTLY as you were thinking in your thought
- Be natural whether the conversation is technical or casual
- Don't try to force conversations back to coding
- If they're being casual, be casual back
- If they're asking about code, focus on that

CRITICAL:
- Your response should directly express your thought
- Don't add new ideas that weren't in your thought
- Don't try to redirect the conversation
- Just respond naturally as you were thinking

Example responses (without quotes):
Hey! How can I help you today?
${name ? `Hi ${name}! What's on your mind?` : 'Hi there! What can I do for you?'}
Haha, good one! I do have a sense of humor you know.
Actually, I do remember your name - it's ${name || 'not stored yet'}.

Remember: Express your thought naturally, whether it's casual or technical.`;

    const response = await llm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Previous conversation:
${conversationContext}

Current thought: ${thought}

Express your thought naturally, without adding anything extra:` }
      ],
      settings
    );

    // Add response to conversation history
    this.addToConversationHistory('response', response);
    
    // Remove any quotation marks and ensure direct response
    return response.replace(/^["']|["']$/g, '').trim();
  }
} 