"use client";

import { useState } from 'react';

interface UserManagementProps {
  users: string[];
  setUsers: (users: string[]) => void;
  onStartGame: () => void; // Callback to start the game
}

export default function UserManagement({ users, setUsers, onStartGame }: UserManagementProps) {
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
    <div className="text-black p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <div>
        <h3 className="text-lg font-semibold mb-2">Add Users</h3>
        <ul className="space-y-2 mb-4">
          {users.map((user, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{user}</span>
              <button
                onClick={() => removeUser(index)}
                className="bg-red-500 text-black px-2 py-1 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {users.length < 5 && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter user name"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <button
              onClick={addUser}
              className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600"
            >
              Add User
            </button>
          </div>
        )}
      </div>
      <button
        onClick={onStartGame} // Call the onStartGame callback
        className="w-full bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 mt-4"
      >
        Start Game
      </button>
    </div>
  );
}