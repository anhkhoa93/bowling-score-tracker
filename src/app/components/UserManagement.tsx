"use client";

import { useState } from 'react';

interface UserManagementProps {
  users: string[];
  setUsers: (users: string[]) => void;
  setError: (error: string | null) => void;
  onStartGame: () => void; 
}

export default function UserManagement({ users, setUsers, setError, onStartGame }: UserManagementProps) {
  const [newUser, setNewUser] = useState('');

  const addUser = () => {
    if (users.length < 5 && newUser.trim()) {
      setUsers([...users, newUser.trim()]);
      setNewUser('');
    }
  };

  const removeUser = (index: number) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
  };

  return (
    <div className="text-black p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 font-mono">User Profiles</h2>

      <div className="max-h-90 overflow-auto">
        <ul className="space-y-3 mb-6">
          {users.map((user, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm">
              <span className="flex-1 text-gray-700 truncate">{user}</span>
              <button
                onClick={() => removeUser(index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {users.length < 5 && (
        <div className="flex items-center space-x-3">
          <input
            name="username"
            type="text"
            placeholder="Enter user name"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            className="flex-1 p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="username-input"
          />
          <button
            onClick={addUser}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="add-user-button"
          >
            Add User
          </button>
        </div>
      )}

      <button
        onClick={() => {
          if (users.length === 0) {
            setError("Please add at least one user to start the game.");
            return;
          }
          onStartGame();
        }}
        className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mt-6"
        data-testid="start-game-button"
      >
        Start Game
      </button>
    </div>
  )
}
