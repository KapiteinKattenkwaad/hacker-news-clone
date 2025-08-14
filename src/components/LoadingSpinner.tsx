import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
      <span className="ml-4 text-gray-600 dark:text-gray-300">Loading stories...</span>
    </div>
  );
}