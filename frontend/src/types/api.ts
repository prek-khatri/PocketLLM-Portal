
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface UserRegister {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatSessionList {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatSessionCreate {
  title?: string;
}

export interface InferenceRequest {
  prompt: string;
  session_id?: number;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface InferenceResponse {
  response: string;
  session_id: number;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  detail: string;
  success: boolean;
}
