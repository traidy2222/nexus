import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../contexts/TerminalContext';
import ChatMessage from './Chat/ChatMessage';
import ChatInput from './Chat/ChatInput';
import { CodeActAgent } from '../agents/CodeActAgent';
import { ChatMessage as ChatMessageType, StepResult } from '../types/chat';
import { Settings } from '../types/settings';

interface ChatProps {
  agent: CodeActAgent;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const Chat: React.FC<ChatProps> = ({ agent, settings, onSettingsChange }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addLog } = useTerminal();

  useEffect(() => {
    // Connect terminal logger to agent
    agent.setTerminalLogger(addLog);
  }, [agent, addLog]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Process with agent
      await agent.process(message, (step: StepResult) => {
        // Add step message
        const stepMessage: ChatMessageType = {
          id: Date.now().toString(),
          role: 'assistant',
          content: step.content,
          metadata: { type: step.type },
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, stepMessage]);
      });
    } catch (error) {
      console.error('Error processing message:', error);
      // Add error message
      const errorMessage: ChatMessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        metadata: { type: 'error' },
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isProcessing}
      />
    </div>
  );
};

export default Chat; 