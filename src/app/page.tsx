"use client";

import { useState } from 'react';
import UserManagement from './components/UserManagement';
import ScoreTracker from './components/ScoreTracker';

export default function Home() {
  const [users, setUsers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
  const [showError, setShowError] = useState(false);

  const handleStartGame = () => {
    if (users.length > 0) {
      setGameStarted(true); // Set gameStarted to true
    } else {
      setShowError(true); // Open error dialog
    }
  };

  return (

    <div className="flex justify-center items-start h-screen bg-gradient-to-r from-gray-900 to-gray-700 p-6">
      <div className="w-full max-w-6xl space-y-8">
        {/* Title */}
        <div className="flex justify-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 shadow-lg leading-tight">
            Bowling Score Tracker
          </h1>
        </div>
        {/* Dialog Box for Error Message */}
        {showError && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md text-black">
              <p>Please add at least one user to start the game.</p>
              <button data-testid="show-error-button"
                onClick={() => setShowError(false)}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
              >
                Ok
              </button>
            </div>
          </div>
        )}

        {/* UserManagement or ScoreTracker */}
        <div>
          {!gameStarted ? (
            <UserManagement
              users={users}
              setUsers={setUsers}
              onStartGame={handleStartGame} // Pass the start game handler
            />
          ) : (
            <ScoreTracker users={users} />
          )}
        </div>
      </div>
    </div>

  );
}