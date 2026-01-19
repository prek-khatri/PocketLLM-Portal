import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-6 animate-fade-in">
      <div className="max-w-[75%] rounded-2xl shadow-sm bg-message-assistant dark:bg-gray-800">
        {}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gradient-to-r from-primary to-primary-gradient text-white">
            🤖
          </div>
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
            Assistant
          </span>
        </div>

        {}
        <div className="px-4 pb-4 flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce-dots"></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce-dots" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce-dots" style={{ animationDelay: '0.4s' }}></span>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Assistant is typing...</span>
        </div>
      </div>
    </div>
  );
};
