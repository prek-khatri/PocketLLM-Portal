import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';
import { Sidebar } from './Sidebar/Sidebar';
import { MessageList } from './MessageArea/MessageList';
import { ChatInput } from './ChatInput/ChatInput';

export const ChatPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const {
    currentSession,
    sessions,
    isLoading,
    isGenerating,
    generatingSessionId,
    loadSessions,
    createNewSession,
    sendMessage,
    stopGeneration,
    loadSession,
    deleteSession,
    renameSession,
    searchSessions,
    clearChatState,
    setCurrentSession,
  } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      clearChatState();
      loadSessions();
    } else {
      clearChatState();
    }
  }, [user?.id]);

  const handleNewChat = async () => {
    try {
      await createNewSession();
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleLogout = () => {
    clearChatState();
    logout();
    navigate('/login');
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage({
        prompt: message,
        session_id: currentSession?.id,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      if (!currentSession) return;

      // Find the index of the message being edited
      const messageIndex = currentSession.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) return;

      // Delete messages from the backend first
      await chatService.deleteMessagesFrom(currentSession.id, messageId);

      // Update UI - remove the edited message and all messages after it
      const updatedMessages = currentSession.messages.slice(0, messageIndex);
      setCurrentSession({
        ...currentSession,
        messages: updatedMessages,
      });

      // Send the edited message as a new message
      await sendMessage({
        prompt: newContent,
        session_id: currentSession.id,
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleRenameSession = async (sessionId: number, newTitle: string) => {
    try {
      await renameSession(sessionId, newTitle);
    } catch (error) {
      console.error('Error renaming session:', error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      await searchSessions(query);
    } catch (error) {
      console.error('Error searching sessions:', error);
    }
  };

  const handleExportSession = async (sessionId: number, format: 'json' | 'txt' | 'md') => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/chat/sessions/${sessionId}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_${sessionId}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting session:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSession?.id}
        username={user?.username || 'User'}
        email={user?.email}
        isAdmin={user?.is_admin}
        isLoading={isLoading && sessions.length === 0}
        onNewChat={handleNewChat}
        onSelectSession={loadSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onSearch={handleSearch}
        onExportSession={handleExportSession}
        onLogout={handleLogout}
        onProfileUpdate={updateProfile}
      />

      {}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <MessageList
          messages={currentSession?.messages || []}
          isGenerating={isGenerating}
          sessionId={currentSession?.id}
          generatingSessionId={generatingSessionId}
          hasSession={!!currentSession}
          onNewChat={handleNewChat}
          onEditMessage={handleEditMessage}
        />

        {currentSession && (
          <ChatInput
            onSubmit={handleSendMessage}
            onStop={stopGeneration}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
};
