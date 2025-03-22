"use client";

import React from 'react';

interface ErrorDialogProps {
  error: string | null;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="error-dialog">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-black">Notice</h2>
        <p className="text-base text-gray-700" data-testid="error-message">{error}</p>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
            data-testid="close-error-button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDialog;
