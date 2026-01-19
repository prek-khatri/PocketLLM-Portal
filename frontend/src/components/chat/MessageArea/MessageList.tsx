import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from './EmptyState';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  sessionId?: number;
  generatingSessionId?: number | null;
  hasSession: boolean;
  onNewChat?: () => void;
  onEditMessage?: (messageId: number, messageContent: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isGenerating,
  sessionId,
  generatingSessionId,
  hasSession,
  onNewChat,
  onEditMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!hasSession) {
    return <EmptyState onNewChat={onNewChat} hasSession={false} />;
  }

  if (messages.length === 0) {
    return <EmptyState hasSession={true} />;
  }

  const hasStreamingMessage = messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].id < 0;
  const showTypingIndicator = isGenerating && sessionId === generatingSessionId && !hasStreamingMessage;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 custom-scrollbar">
      {messages.map((message) => (
        <Message
          key={message.id}
          role={message.role}
          content={message.content}
          createdAt={message.created_at}
          onEdit={message.role === 'user' && onEditMessage
            ? (newContent: string) => onEditMessage(message.id, newContent)
            : undefined}
          isGenerating={isGenerating}
        />
      ))}

      {showTypingIndicator && <TypingIndicator />}

      <div ref={messagesEndRef} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
};
