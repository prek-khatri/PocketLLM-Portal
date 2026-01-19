import React from 'react';
import { cn } from '../../../lib/utils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  email?: string;
  onEditClick: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, username, email, onEditClick }) => {
  if (!isOpen) return null;

  return (
    <>
      {}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-md p-6 animate-fade-in"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "text-gray-500 dark:text-gray-400"
              )}
            >
              ✕
            </button>
          </div>

          {}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-primary-gradient flex items-center justify-center text-white text-4xl font-bold mb-4">
              {username.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {username}
            </h3>
          </div>

          {}
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg",
              "bg-gray-50 dark:bg-gray-700/50"
            )}>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Username
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {username}
              </p>
            </div>

            {email && (
              <div className={cn(
                "p-4 rounded-lg",
                "bg-gray-50 dark:bg-gray-700/50"
              )}>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {email}
                </p>
              </div>
            )}

            <div className={cn(
              "p-4 rounded-lg",
              "bg-gray-50 dark:bg-gray-700/50"
            )}>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Account Type
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                Free User
              </p>
            </div>
          </div>

          {}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onEditClick}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-semibold",
                "bg-gray-200 dark:bg-gray-700",
                "text-gray-800 dark:text-gray-200",
                "hover:bg-gray-300 dark:hover:bg-gray-600",
                "transition-colors"
              )}
            >
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className={cn(
                "flex-1 py-3 px-4 rounded-lg font-semibold",
                "bg-gradient-to-r from-primary to-primary-gradient",
                "text-white transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
