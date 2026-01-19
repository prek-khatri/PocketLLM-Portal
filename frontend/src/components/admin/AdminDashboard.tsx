import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminService, AdminUser, SystemStats } from '../../services/adminService';
import { cn } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    if (!user?.is_admin) {
      navigate('/chat');
      return;
    }

    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getSystemStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      setError('');
      await adminService.updateUser(userId, { is_active: !currentStatus });
      await loadData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update user status';
      setError(errorMsg);
      console.error('Error toggling user active status:', err);
    }
  };

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    try {
      setError('');
      await adminService.updateUser(userId, { is_admin: !currentStatus });
      await loadData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update user role';
      setError(errorMsg);
      console.error('Error toggling admin status:', err);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Back to Chat
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-4 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {stats && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total_users}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active_users}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.inactive_users}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Admin Users</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.admin_users}</div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Chats</div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.total_chat_sessions}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Management</h2>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{u.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{u.session_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-full",
                            u.is_active
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          )}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleAdmin(u.id, u.is_admin)}
                          className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-full",
                            u.is_admin
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                          )}
                        >
                          {u.is_admin ? 'Admin' : 'User'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={u.id === user?.id}
                          className={cn(
                            "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300",
                            u.id === user?.id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
