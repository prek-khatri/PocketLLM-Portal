import React from 'react';
import { cn } from '../../../lib/utils';

interface SessionItemProps {
  id: number;
  title: string;
  messageCount: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent, format: 'json' | 'txt' | 'md') => void;
  onRename: (newTitle: string) => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({
  id,
  title,
  messageCount,
  isActive,
  onClick,
  onDelete,
  onExport,
  onRename,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(title);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewTitle(title);
  };

  const handleRenameSave = () => {
    if (newTitle.trim() && newTitle !== title) {
      onRename(newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setNewTitle(title);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSave();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200",
        "flex items-center justify-between gap-2 group",
        isActive
          ? "bg-primary text-white shadow-md"
          : "bg-sidebar-hover hover:bg-sidebar-active text-white"
      )}
    >
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded border-2 border-primary focus:outline-none"
            autoFocus
          />
        ) : (
          <div className="font-semibold text-sm truncate mb-1">
            {title}
          </div>
        )}
        <div className={cn(
          "text-xs",
          isActive ? "text-white/80" : "text-gray-400"
        )}>
          {messageCount} {messageCount === 1 ? 'message' : 'messages'}
        </div>
      </div>

      <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100">
        {}
        <button
          onClick={handleRenameClick}
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded flex items-center justify-center",
            "text-sm transition-all duration-200",
            isActive
              ? "hover:bg-white/20 text-white"
              : "hover:bg-blue-500/20 text-gray-400 hover:text-blue-400"
          )}
          title="Rename chat"
        >
          ✏️
        </button>

        {}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowExportMenu(!showExportMenu);
            }}
            className={cn(
              "flex-shrink-0 w-7 h-7 rounded flex items-center justify-center",
              "text-sm transition-all duration-200",
              isActive
                ? "hover:bg-white/20 text-white"
                : "hover:bg-blue-500/20 text-gray-400 hover:text-blue-400"
            )}
            title="Export chat"
          >
            ↓
          </button>

          {}
          {showExportMenu && (
            <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 min-w-[100px] border border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  onExport(e, 'json');
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                JSON
              </button>
              <button
                onClick={(e) => {
                  onExport(e, 'txt');
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                TXT
              </button>
              <button
                onClick={(e) => {
                  onExport(e, 'md');
                  setShowExportMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              >
                Markdown
              </button>
            </div>
          )}
        </div>

        {}
        <button
          onClick={onDelete}
          className={cn(
            "flex-shrink-0 w-7 h-7 rounded flex items-center justify-center",
            "text-lg leading-none transition-all duration-200",
            isActive
              ? "hover:bg-white/20 text-white"
              : "hover:bg-red-500/20 text-gray-400 hover:text-red-400"
          )}
          title="Delete chat"
        >
          ×
        </button>
      </div>
    </div>
  );
};
