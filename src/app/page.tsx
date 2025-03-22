"use client";

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ErrorDialog from './components/ErrorDialog';

// Dynamically import components for better performance
const UserManagement = dynamic(() => import('./components/UserManagement'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading user management...</div>,
  ssr: false
});

const ScoreTracker = dynamic(() => import('./components/ScoreTracker'), {
  loading: () => <div className="flex items-center justify-center p-4">Loading score tracker...</div>,
  ssr: false
});

export default function Home() {
  const [users, setUsers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = useCallback(() => {
    if (users.length === 0) {
      setError("Please add at least one user to start the game.");
      return;
    }
    setGameStarted(true);
  }, [users]);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  const handleResetGame = useCallback(() => {
    setGameStarted(false);
    setUsers([]);
  }, []);

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-r from-gray-900 to-gray-700 p-6">
      <div className="w-full max-w-6xl space-y-8">
        {/* Title */}
        <div className="flex justify-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 shadow-lg leading-tight">
            Bowling Score Tracker
          </h1>
        </div>
        <div className="flex justify-center">
          {!gameStarted ? (
            <UserManagement
              users={users}
              setUsers={setUsers}
              onStartGame={handleStartGame}
              setError={setError}
            />
          ) : (
            <ScoreTracker
              users={users}
              onResetGame={handleResetGame}
            />
          )}
        </div>
        
        {/* Error Dialog */}
        <ErrorDialog 
          error={error}
          onClose={handleCloseError}
        />
      </div>
    </div>
  );
}