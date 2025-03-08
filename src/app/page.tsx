"use client";

import { useState } from 'react';
import UserManagement from './components/UserManagement';
import ScoreTracker from './components/ScoreTracker';

export default function Home() {
  const [users, setUsers] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false); // Track if the game has started

  const handleStartGame = () => {
    if (users.length > 0) {
      setGameStarted(true); // Set gameStarted to true
    } else {
      alert('Please add at least one user to start the game.');
    }
  };

  return (
    <div className="text-black min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Bowling Score Tracker</h1>
      <div className="max-w-4xl mx-auto space-y-6">
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
  );
}