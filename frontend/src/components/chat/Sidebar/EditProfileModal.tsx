import React, { useState } from 'react';
import { cn } from '../../../lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  email: string;
  onUpdate: (data: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  username,
  email,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    username: username || '',
    email: email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        username: username || '',
        email: email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError('');
    }
  }, [isOpen, username, email]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password required to set new password');
      return;
    }

    try {
      setLoading(true);
      const updateData: any = {};

      if (formData.username && formData.username !== username && formData.username.trim()) {
        updateData.username = formData.username.trim();
      }

      if (formData.email && formData.email !== email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }

      if (formData.newPassword && formData.newPassword.trim()) {
        if (!formData.currentPassword || !formData.currentPassword.trim()) {
          setError('Current password required to set new password');
          setLoading(false);
          return;
        }
        updateData.current_password = formData.currentPassword.trim();
        updateData.new_password = formData.newPassword.trim();
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      await onUpdate(updateData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
            'w-full max-w-md p-6 animate-fade-in'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'text-gray-500 dark:text-gray-400'
              )}
            >
              ✕
            </button>
          </div>

          {}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {}
          <form onSubmit={handleSubmit} className="space-y-4">
            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-700',
                  'border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'focus:outline-none focus:border-primary'
                )}
                required
                minLength={3}
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-700',
                  'border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'focus:outline-none focus:border-primary'
                )}
                required
              />
            </div>

            {}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Change Password (Optional)
              </h3>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-700',
                  'border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'focus:outline-none focus:border-primary'
                )}
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-700',
                  'border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'focus:outline-none focus:border-primary'
                )}
                minLength={6}
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-2 rounded-lg border-2',
                  'bg-white dark:bg-gray-700',
                  'border-gray-300 dark:border-gray-600',
                  'text-gray-900 dark:text-white',
                  'focus:outline-none focus:border-primary'
                )}
              />
            </div>

            {}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg font-semibold',
                  'bg-gray-200 dark:bg-gray-700',
                  'text-gray-800 dark:text-gray-200',
                  'hover:bg-gray-300 dark:hover:bg-gray-600',
                  'transition-colors'
                )}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(
                  'flex-1 py-3 px-4 rounded-lg font-semibold',
                  'bg-gradient-to-r from-primary to-primary-gradient',
                  'text-white transition-all duration-200',
                  'hover:shadow-lg hover:-translate-y-0.5',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                )}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
