import React, { useState } from 'react';
import { ProfileModal } from './ProfileModal';
import { EditProfileModal } from './EditProfileModal';

interface UserFooterProps {
  username: string;
  email?: string;
  onLogout: () => void;
  onProfileUpdate: (data: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) => Promise<void>;
}

export const UserFooter: React.FC<UserFooterProps> = ({ username, email, onLogout, onProfileUpdate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="p-5 border-t border-gray-700 dark:border-gray-800">
        <button
          onClick={() => setIsProfileOpen(true)}
          className="mb-3 flex items-center gap-2 w-full hover:bg-gray-700/50 dark:hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-colors duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-gradient flex items-center justify-center text-white font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-white">{username}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-transparent text-white border border-gray-600 dark:border-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
        >
          Logout
        </button>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username={username}
        email={email}
        onEditClick={() => {
          setIsProfileOpen(false);
          setIsEditOpen(true);
        }}
      />

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        username={username}
        email={email || ''}
        onUpdate={onProfileUpdate}
      />
    </>
  );
};
