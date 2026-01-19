import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../../lib/utils';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] rounded-t-lg border-b border-gray-700">
        {language && (
          <span className="text-xs font-semibold text-gray-400 uppercase">
            {language}
          </span>
        )}
        <button
          onClick={handleCopy}
          className={cn(
            "ml-auto px-3 py-1 text-xs font-medium rounded transition-all duration-200",
            copied
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          )}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
        }}
        showLineNumbers
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};
