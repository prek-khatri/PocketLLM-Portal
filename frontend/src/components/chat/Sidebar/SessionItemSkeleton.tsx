import React from 'react';

export const SessionItemSkeleton: React.FC = () => {
  return (
    <div className="p-3 mb-2 bg-sidebar-hover rounded-lg animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-5 h-5 bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};
