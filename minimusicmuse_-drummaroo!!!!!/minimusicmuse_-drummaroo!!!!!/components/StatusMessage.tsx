
import React from 'react';
import type { Status } from '../types';
import { LoadingIcon } from './icons';

interface StatusMessageProps {
  status: Status;
}

const colorClasses = {
  info: 'bg-blue-900/50 text-blue-300 border-blue-500',
  success: 'bg-green-900/50 text-green-300 border-green-500',
  error: 'bg-red-900/50 text-red-300 border-red-500',
  loading: 'bg-yellow-900/50 text-yellow-300 border-yellow-500',
};

export const StatusMessage: React.FC<StatusMessageProps> = ({ status }) => {
  if (!status.message) return null;

  return (
    <div className={`fixed bottom-5 right-5 max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 ${colorClasses[status.type]}`}>
      <div className="flex items-center">
        {status.type === 'loading' && <LoadingIcon className="w-5 h-5 mr-3 animate-spin" />}
        <p className="text-sm font-medium">{status.message}</p>
      </div>
    </div>
  );
};
