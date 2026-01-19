import apiClient from './apiClient';
import {
  InferenceRequest,
  InferenceResponse,
  ChatSession,
  ChatSessionList,
  ChatSessionCreate,
  ChatMessage,
  MessageResponse
} from '../types/api';

export const chatService = {

  async inference(request: InferenceRequest): Promise<InferenceResponse> {
    const response = await apiClient.post<InferenceResponse>('/chat/inference', request);
    return response.data;
  },

  async inferenceStream(
    request: InferenceRequest,
    onToken: (token: string) => void,
    onStart?: (data: { session_id: number; user_message_id: number }) => void,
    onDone?: (data: { assistant_message_id: number; full_response: string }) => void,
    onError?: (error: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const token = localStorage.getItem('access_token');
    const url = `/api/chat/inference/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request),
        signal: abortSignal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'start':
                onStart?.(data);
                break;
              case 'token':
                onToken(data.content);
                break;
              case 'done':
                onDone?.(data);
                return;
              case 'error':
                onError?.(data.message);
                throw new Error(data.message);
            }
          }
        }
      }
    } catch (error) {

      if (error instanceof Error && error.name === 'AbortError') {
        onError?.('Generation stopped by user');
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(errorMessage);
      throw error;
    }
  },

  async createSession(data: ChatSessionCreate): Promise<ChatSession> {
    const response = await apiClient.post<ChatSession>('/chat/sessions', data);
    return response.data;
  },

  async getSessions(limit: number = 100): Promise<ChatSessionList[]> {
    const response = await apiClient.get<ChatSessionList[]>('/chat/sessions', {
      params: { limit }
    });
    return response.data;
  },

  async getSession(sessionId: number): Promise<ChatSession> {
    const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  async deleteSession(sessionId: number): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  async renameSession(sessionId: number, title: string): Promise<ChatSession> {
    const response = await apiClient.patch<ChatSession>(`/chat/sessions/${sessionId}`, { title });
    return response.data;
  },

  async searchSessions(query: string, limit: number = 50): Promise<ChatSessionList[]> {
    const response = await apiClient.get<ChatSessionList[]>('/chat/search', {
      params: { q: query, limit }
    });
    return response.data;
  },

  async getSessionMessages(sessionId: number): Promise<ChatMessage[]> {
    const response = await apiClient.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  async savePartialResponse(data: {
    session_id: number;
    user_message_id: number;
    partial_response: string;
  }): Promise<{ user_message_id: number | null; assistant_message_id: number; session_id: number }> {
    const response = await apiClient.post('/chat/inference/save-partial', data);
    return response.data;
  },

  async deleteMessagesFrom(sessionId: number, messageId: number): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(`/chat/sessions/${sessionId}/messages/${messageId}`);
    return response.data;
  }
};
