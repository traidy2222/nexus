import React from 'react';
import { ChatMessage as MessageType } from '../../types/chat';
import ChatMessage from './ChatMessage';

interface ChatHistoryProps {
  messages: MessageType[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
    </div>
  );
};

export default ChatHistory; 