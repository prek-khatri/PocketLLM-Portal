import React from 'react';
import { SessionItem } from './SessionItem';
import { SessionItemSkeleton } from './SessionItemSkeleton';
import { UserFooter } from './UserFooter';
import { useTheme } from '../../../hooks/useTheme';

interface Session {
  id: number;
  title: string;
  message_count: number;
}

interface SidebarProps {
  sessions: Session[];
  currentSessionId?: number;
  username: string;
  email?: string;
  isAdmin?: boolean;
  isLoading: boolean;
  onNewChat: () => void;
  onSelectSession: (id: number) => void;
  onDeleteSession: (id: number, e: React.MouseEvent) => void;
  onRenameSession: (id: number, title: string) => void;
  onSearch: (query: string) => void;
  onExportSession: (id: number, format: 'json' | 'txt' | 'md') => void;
  onLogout: () => void;
  onProfileUpdate: (data: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  username,
  email,
  isAdmin,
  isLoading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onSearch,
  onExportSession,
  onLogout,
  onProfileUpdate,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="w-64 bg-sidebar-bg dark:bg-gray-900 text-white flex flex-col border-r border-gray-700 dark:border-gray-800 h-screen">
      {}
      <div className="p-5 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">PocketLLM Portal</h2>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-sidebar-hover dark:bg-gray-800 hover:bg-sidebar-active dark:hover:bg-gray-700 transition-colors duration-200"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + New Chat
        </button>

        {}
        <div className="mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search chats..."
            className="w-full px-3 py-2 bg-sidebar-hover dark:bg-gray-800 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {}
        {isAdmin && (
          <div className="mt-3">
            <a
              href="/admin"
              className="block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg font-semibold transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              🛠️ Admin Dashboard
            </a>
          </div>
        )}
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {isLoading ? (
          <>
            <SessionItemSkeleton />
            <SessionItemSkeleton />
            <SessionItemSkeleton />
          </>
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <SessionItem
              key={session.id}
              id={session.id}
              title={session.title}
              messageCount={session.message_count}
              isActive={currentSessionId === session.id}
              onClick={() => onSelectSession(session.id)}
              onDelete={(e) => onDeleteSession(session.id, e)}
              onRename={(newTitle) => onRenameSession(session.id, newTitle)}
              onExport={(e, format) => {
                e.stopPropagation();
                onExportSession(session.id, format);
              }}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8 text-sm">
            No chats yet. Create one to get started!
          </div>
        )}
      </div>

      {}
      <UserFooter username={username} email={email} onLogout={onLogout} onProfileUpdate={onProfileUpdate} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
};
