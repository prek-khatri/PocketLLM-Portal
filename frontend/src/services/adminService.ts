import apiClient from './apiClient';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  session_count: number;
}

export interface SystemStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_users: number;
  total_chat_sessions: number;
}

export interface AdminUserUpdate {
  is_active?: boolean;
  is_admin?: boolean;
}

export const adminService = {

  async getAllUsers(limit: number = 100, offset: number = 0): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>('/admin/users', {
      params: { limit, offset }
    });
    return response.data;
  },

  async getUserById(userId: number): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUser(userId: number, data: AdminUserUpdate): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser>(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/users/${userId}`);
    return response.data;
  },

  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<SystemStats>('/admin/stats');
    return response.data;
  }
};
