import React from 'react';
import { ChatMessage as ChatMessageType, StepType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const getMessageStyle = () => {
    if (message.role === 'user') {
      return 'bg-blue-500 text-white';
    }

    const type = message.metadata?.type;
    const status = message.metadata?.currentStep;
    
    if (status === 'thinking') {
      return 'bg-purple-600 text-white animate-pulse';
    }

    if (type === 'thought' || type === 'reflection' || type === 'final') {
      return 'bg-indigo-600 text-white';
    }

    if (type === 'action' || type === 'observation') {
      return 'bg-gray-700 text-white font-mono text-sm';
    }

    if (status === 'error') {
      return 'bg-red-600 text-white';
    }

    return 'bg-gray-700 text-white';
  };

  const getMessageIcon = () => {
    if (message.role === 'user') {
      return '👤';
    }

    const status = message.metadata?.currentStep;
    if (status === 'thinking') {
      return '🤔';
    }
    if (status === 'error') {
      return '❌';
    }

    const type = message.metadata?.type as StepType;
    switch (type) {
      case 'thought':
        return '💭';
      case 'action':
        return '⚡';
      case 'observation':
        return '👁️';
      case 'reflection':
        return '🤔';
      case 'final':
        return '🎯';
      default:
        return '🤖';
    }
  };

  const getMessageLabel = () => {
    const status = message.metadata?.currentStep;
    const type = message.metadata?.type;

    if (status === 'thinking') return 'Thinking...';
    if (status === 'error') return 'Error';
    if (type) return type.charAt(0).toUpperCase() + type.slice(1);
    return '';
  };

  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${getMessageStyle()}`}>
        <div className="flex flex-col gap-1">
          {message.role !== 'user' && (
            <div className="text-xs opacity-75">{getMessageLabel()}</div>
          )}
          <div className="flex items-center gap-2">
            <span>{getMessageIcon()}</span>
            <span>{message.content}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 