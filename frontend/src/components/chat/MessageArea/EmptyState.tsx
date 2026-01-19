import React from 'react';

interface EmptyStateProps {
  onNewChat?: () => void;
  hasSession?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewChat, hasSession }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="max-w-md animate-fade-in">
        {}
        <div className="mb-6 text-6xl">
          💬
        </div>

        {}
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {hasSession ? 'Start a conversation' : 'Welcome to PocketLLM Portal'}
        </h3>

        {}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {hasSession
            ? 'Type a message below to begin chatting with the AI.'
            : 'Select a chat from the sidebar or create a new one to get started.'}
        </p>

        {}
        {!hasSession && onNewChat && (
          <button
            onClick={onNewChat}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-gradient text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Start New Chat
          </button>
        )}
      </div>
    </div>
  );
};
