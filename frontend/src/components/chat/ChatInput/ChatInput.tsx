import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  onStop,
  isGenerating,
  disabled,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max height ~150px
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isGenerating) {
      onStop();
      return;
    }

    if (!input.trim()) return;

    onSubmit(input);
    setInput('');
    // Reset textarea height after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={disabled || isGenerating}
          rows={1}
          className={cn(
            "flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-2xl resize-none",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:border-primary transition-all duration-200",
            "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
            "overflow-y-auto"
          )}
          style={{
            minHeight: '48px',
          }}
        />

        <button
          type="submit"
          disabled={!isGenerating && (!input.trim() || disabled)}
          className={cn(
            "px-6 py-3 rounded-2xl font-semibold transition-all duration-200",
            "hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50",
            "disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
            "flex-shrink-0",
            isGenerating
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-primary to-primary-gradient text-white"
          )}
        >
          {isGenerating ? '⏹ Stop' : 'Send'}
        </button>
      </form>
    </div>
  );
};
