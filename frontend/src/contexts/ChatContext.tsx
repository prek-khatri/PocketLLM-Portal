import React, { createContext, useState, useRef, ReactNode } from 'react';
import { ChatSession, ChatSessionList, ChatMessage, InferenceRequest } from '../types/api';
import { chatService } from '../services/chatService';

interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSessionList[];
  isLoading: boolean;
  isGenerating: boolean;
  generatingSessionId: number | null;
  error: string | null;
  loadSessions: () => Promise<void>;
  loadSession: (sessionId: number) => Promise<void>;
  createNewSession: (title?: string) => Promise<void>;
  deleteSession: (sessionId: number) => Promise<void>;
  renameSession: (sessionId: number, title: string) => Promise<void>;
  searchSessions: (query: string) => Promise<void>;
  sendMessage: (request: InferenceRequest) => Promise<void>;
  stopGeneration: () => void;
  setCurrentSession: (session: ChatSession | null) => void;
  clearChatState: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSessionList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSessionId, setGeneratingSessionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const partialDataRef = useRef<{ sessionId: number | null; userMessageId: number | null; partialResponse: string }>({
    sessionId: null,
    userMessageId: null,
    partialResponse: ''
  });

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sessions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.getSession(sessionId);
      setCurrentSession(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async (title?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await chatService.createSession({ title: title || 'New Chat' });
      setCurrentSession(data);
      await loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await chatService.deleteSession(sessionId);
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
      await loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const renameSession = async (sessionId: number, title: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await chatService.renameSession(sessionId, title);
      if (currentSession?.id === sessionId) {
        setCurrentSession({ ...currentSession, title });
      }
      await loadSessions();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to rename session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const searchSessions = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      if (query.trim() === '') {
        await loadSessions();
      } else {
        const data = await chatService.searchSessions(query);
        setSessions(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search sessions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const stopGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      setGeneratingSessionId(null);

      const { sessionId, userMessageId, partialResponse } = partialDataRef.current;
      if (sessionId && userMessageId && partialResponse) {
        try {
          const result = await chatService.savePartialResponse({
            session_id: sessionId,
            user_message_id: userMessageId,
            partial_response: partialResponse
          });

          if (currentSession && currentSession.id === sessionId) {
            setCurrentSession((prev) => {
              if (!prev) return prev;
              const messages = [...prev.messages];

              if (messages.length >= 1) {
                messages[messages.length - 1] = {
                  ...messages[messages.length - 1],
                  id: result.assistant_message_id
                };
              }

              return { ...prev, messages };
            });
          }

          setTimeout(() => {
            loadSessions();
          }, 500);
        } catch (err) {
          console.error('Error saving partial response:', err);
        }
      }

      partialDataRef.current = { sessionId: null, userMessageId: null, partialResponse: '' };
    }
  };

  const clearChatState = () => {
    setCurrentSession(null);
    setSessions([]);
    setIsLoading(false);
    setIsGenerating(false);
    setGeneratingSessionId(null);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    partialDataRef.current = { sessionId: null, userMessageId: null, partialResponse: '' };
  };

  const sendMessage = async (request: InferenceRequest) => {
    try {
      setIsLoading(true);
      setIsGenerating(true);
      setError(null);

      const targetSessionId = request.session_id || currentSession?.id || null;
      setGeneratingSessionId(targetSessionId);

      abortControllerRef.current = new AbortController();

      let sessionId: number | null = null;
      let streamingContent = "";

      partialDataRef.current = {
        sessionId: targetSessionId,
        userMessageId: null,
        partialResponse: ''
      };

      const tempUserMessageId = Date.now();
      const tempUserMessage: ChatMessage = {
        id: tempUserMessageId,
        role: "user",
        content: request.prompt,
        created_at: new Date().toISOString()
      };

      const streamingMessageId = -(Date.now());

      // Use functional form to get latest state (important for edit functionality)
      setCurrentSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            tempUserMessage
          ]
        };
      });

      await chatService.inferenceStream(
        request,

        (token: string) => {
          streamingContent += token;

          partialDataRef.current.partialResponse = streamingContent;

          setCurrentSession((prev) => {
            if (!prev) return prev;
            const messages = [...prev.messages];

            const lastMsg = messages[messages.length - 1];
            const isStreamingMessage = lastMsg && lastMsg.id === streamingMessageId;

            if (!isStreamingMessage) {

              messages.push({
                id: streamingMessageId,
                role: "assistant",
                content: streamingContent,
                created_at: new Date().toISOString()
              });
            } else {

              messages[messages.length - 1] = {
                ...lastMsg,
                content: streamingContent
              };
            }

            return { ...prev, messages };
          });
        },

        (data) => {
          sessionId = data.session_id;

          partialDataRef.current.sessionId = sessionId;
          partialDataRef.current.userMessageId = data.user_message_id;

          // Update temp user message ID with real ID from backend
          setCurrentSession((prev) => {
            if (!prev) return prev;
            const messages = prev.messages.map(msg =>
              msg.id === tempUserMessageId
                ? { ...msg, id: data.user_message_id }
                : msg
            );
            return { ...prev, messages };
          });
        },

        (data) => {
          if (sessionId) {

            setIsGenerating(false);
            setGeneratingSessionId(null);

            setCurrentSession((prev) => {
              if (!prev) return prev;
              const messages = [...prev.messages];

              // Only update assistant message ID (user message ID already updated in onStart)
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                id: data.assistant_message_id,
                content: data.full_response
              };
              return { ...prev, messages };
            });

            partialDataRef.current = { sessionId: null, userMessageId: null, partialResponse: '' };

            setTimeout(() => {
              loadSessions();
            }, 1000);
          }
        },

        (errorMsg) => {
          setError(errorMsg);
        },

        abortControllerRef.current.signal
      );

    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      setGeneratingSessionId(null);
      abortControllerRef.current = null;
    }
  };

  const value: ChatContextType = {
    currentSession,
    sessions,
    isLoading,
    isGenerating,
    generatingSessionId,
    error,
    loadSessions,
    loadSession,
    createNewSession,
    deleteSession,
    renameSession,
    searchSessions,
    sendMessage,
    stopGeneration,
    setCurrentSession,
    clearChatState
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
