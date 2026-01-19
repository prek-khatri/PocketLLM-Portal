import apiClient from './apiClient';
import { UserRegister, UserLogin, TokenResponse, User } from '../types/api';

export const authService = {
  async register(data: UserRegister): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/register', data);

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  async login(data: UserLogin): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(data: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }): Promise<User> {
    const response = await apiClient.put<User>('/auth/me', data);

    localStorage.setItem('user', JSON.stringify(response.data));

    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
};
