import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { cn } from '../../../lib/utils';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  onEdit?: (newContent: string) => void;
  isGenerating?: boolean;
}

export const Message: React.FC<MessageProps> = ({ role, content, createdAt, onEdit, isGenerating }) => {
  const isUser = role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && onEdit) {
      onEdit(editedContent.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={cn(
        "flex mb-6 animate-fade-in animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl shadow-sm",
          isUser
            ? "bg-gradient-to-r from-primary to-primary-gradient text-white"
            : "bg-message-assistant dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        )}
      >
        {}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                isUser
                  ? "bg-white/20"
                  : "bg-gradient-to-r from-primary to-primary-gradient text-white"
              )}
            >
              {isUser ? '👤' : '🤖'}
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-semibold text-sm",
                isUser ? "text-white" : "text-gray-700 dark:text-gray-200"
              )}>
                {isUser ? 'You' : 'Assistant'}
              </span>
              {createdAt && (
                <span className={cn(
                  "text-xs",
                  isUser ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                )}>
                  {formatTime(createdAt)}
                </span>
              )}
            </div>
          </div>

          {}
          <div className="flex gap-2">
            {}
            {!isUser && !isEditing && !isGenerating && (
              <button
                onClick={handleCopy}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-all duration-200",
                  "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600",
                  "text-gray-700 dark:text-gray-200"
                )}
                title="Copy message"
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            )}

            {}
            {isUser && onEdit && !isGenerating && !isEditing && (
              <button
                onClick={handleEditClick}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-all duration-200",
                  "bg-white/20 hover:bg-white/30 text-white"
                )}
                title="Edit message"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>

        {}
        {isEditing ? (
          <div className="px-4 pb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full px-3 py-2 rounded-lg resize-none",
                "border-2 focus:outline-none focus:border-white/40",
                "bg-white/10 text-white placeholder-white/50",
                "min-h-[60px]"
              )}
              placeholder="Edit your message..."
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editedContent.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  "bg-white text-primary hover:bg-white/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Send
              </button>
              <button
                onClick={handleCancelEdit}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  "bg-white/20 text-white hover:bg-white/30"
                )}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (

          <div className={cn(
            "px-4 pb-4 prose prose-sm max-w-none",
            isUser ? "prose-invert" : "dark:prose-invert"
          )}>
            <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const inline = !match;

                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={codeString}
                  />
                ) : (
                  <code
                    className={cn(
                      "px-1.5 py-0.5 rounded text-sm font-mono",
                      isUser
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-800"
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="mb-3 ml-6 list-disc space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="mb-3 ml-6 list-decimal space-y-1">{children}</ol>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className={cn(
                    "border-l-4 pl-4 py-2 my-3 italic",
                    isUser ? "border-white/40" : "border-primary"
                  )}>
                    {children}
                  </blockquote>
                );
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "underline hover:no-underline",
                      isUser ? "text-white" : "text-primary"
                    )}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
