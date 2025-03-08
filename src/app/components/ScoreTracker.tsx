"use client";

import { useState, useEffect } from 'react';

interface ScoreTrackerProps {
  users: string[];
}

export default function ScoreTracker({ users }: ScoreTrackerProps) {
  // Initialize scores based on users
  const initializeScores = () => {
    return Array.from({ length: users.length }, () =>
      Array.from({ length: 10 }, () => [0, 0, 0]) // Third value for 10th frame bonus
    );
  };

  const [scores, setScores] = useState<number[][][]>(initializeScores());

  // Sync scores with users whenever users change
  useEffect(() => {
    setScores(initializeScores());
  }, [users]);

  const [currentFrame, setCurrentFrame] = useState(0); // Track the current frame (0-9)
  const [currentUser, setCurrentUser] = useState(0); // Track the current user (0 to users.length - 1)
  const [currentThrow, setCurrentThrow] = useState(0); // Track the current throw (0 or 1)
  const [customScore, setCustomScore] = useState<string>(''); // Track custom score input

  // Generate a random score between 1 and the remaining pins
  const generateRandomScore = (remainingPins: number) => {
    return Math.floor(Math.random() * remainingPins) + 1;
  };

  // Set a random score as the default value for the custom input
  useEffect(() => {
    const frame = scores[currentUser][currentFrame];
    const remainingPins = currentThrow === 0 ? 10 : 10 - frame[0];
    setCustomScore(generateRandomScore(remainingPins).toString());
  }, [currentUser, currentFrame, currentThrow, scores]);

  const handleScoreSubmit = (score: number) => {
    const newScores = [...scores];
    const frame = newScores[currentUser][currentFrame];

    if (currentFrame < 9) {
      // Frames 1-9
    if (currentThrow === 0) {
      frame[0] = score; // First throw
      if (score === 10) {
        // Strike: Skip the second throw
        setCurrentThrow(0); // Reset for the next user
        moveToNextUser();
      } else {
        setCurrentThrow(1); // Move to the second throw
      }
    } else {
        // Ensure the sum of two throws does not exceed 10
        if (frame[0] + score > 10) {
          alert('The sum of two throws cannot exceed 10.');
          return;
        }
      frame[1] = score; // Second throw
      setCurrentThrow(0); // Reset for the next user
      moveToNextUser();
    }
    } else {
      // Frame 10
      if (currentThrow === 0) {
        frame[0] = score; // First throw
        if (score === 10) {
          // Strike: Allow two more throws
          setCurrentThrow(1);
        } else {
          setCurrentThrow(1); // Move to the second throw
        }
      } else if (currentThrow === 1) {
        // Ensure the sum of two throws does not exceed 10 (unless it's a strike)
        if (frame[0] !== 10 && frame[0] + score > 10) {
          alert('The sum of two throws cannot exceed 10.');
          return;
        }
        frame[1] = score; // Second throw
        if (frame[0] + frame[1] >= 10) {
          // Spare or strike: Allow one more throw
          setCurrentThrow(2);
        } else {
          // End of frame
          setCurrentThrow(0);
          moveToNextUser();
        }
      } else if (currentThrow === 2) {
        frame[2] = score; // Third throw (bonus)
        setCurrentThrow(0);
        moveToNextUser();
      }
    }

    setScores(newScores);
  };

  const moveToNextUser = () => {
    if (currentUser < users.length - 1) {
      // Move to the next user
      setCurrentUser(currentUser + 1);
    } else {
      // Move to the next frame
      setCurrentUser(0);
      if (currentFrame < 9) {
        setCurrentFrame(currentFrame + 1);
      } else {
        alert('Game over!');
      }
    }
  };

  // Calculate the total score for a user
  const calculateTotal = (userIndex: number): number => {
    let total = 0;
    for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
      const frame = scores[userIndex][frameIndex];
      total += frame[0] + frame[1] + (frame[2] || 0); // Include bonus for frame 10
    }
    return total;
  };

  // Calculate the total score for all users (last row)
  const calculateTotalScore = (): number => {
    return users.reduce((total, _, userIndex) => total + calculateTotal(userIndex), 0);
  };

  // Get the display value for a frame
  const getFrameDisplay = (frame: number[], frameIndex: number): string[] => {
    if (frameIndex < 9) {
      // Frames 1-9
      if (frame[0] === 10) {
        return ['X', '']; // Strike
      } else if (frame[0] + frame[1] === 10) {
        return [frame[1].toString(), '/']; // Spare
      } else {
        return [frame[0].toString(), frame[1].toString()];
      }
    } else {
      // Frame 10
      const display = [];
      if (frame[0] === 10) {
        display.push('X'); // Strike
        if (frame[1] === 10) {
          display.push('X'); // Second strike
          if (frame[2] === 10) {
            display.push('X'); // Third strike
          } else {
            display.push(frame[2].toString());
          }
        } else if (frame[1] + frame[2] === 10) {
          display.push(frame[1].toString(), '/'); // Spare
        } else {
          display.push(frame[1].toString(), frame[2].toString());
        }
      } else if (frame[0] + frame[1] === 10) {
        display.push(frame[0].toString(), '/'); // Spare
        if (frame[2] === 10) {
          display.push('X'); // Strike
        } else {
          display.push(frame[2].toString());
        }
      } else {
        display.push(frame[0].toString(), frame[1].toString());
      }
      return display;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-black">Score Tracker</h2>

      {/* Score Input Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-black">Score Input</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-black">
              Current Frame: <span className="font-bold">{currentFrame + 1}</span>
            </p>
            <p className="text-sm font-medium text-black">
              Current User: <span className="font-bold">{users[currentUser]}</span>
            </p>
            <p className="text-sm font-medium text-black">
              Current Throw: <span className="font-bold">{currentThrow + 1}</span>
            </p>
          </div>
          <div className="flex space-x-2">
            {Array.from({ length: 10 }, (_, i) => {
              let maxScoreFrame = currentFrame === 9 ? 20 : 10;

              let remainingPins = currentThrow === 0 ? 10 : maxScoreFrame - scores[currentUser][currentFrame][0];

              const maxScore = Math.min(remainingPins, 10);
              return (
              <button
                key={i}
                onClick={() => handleScoreSubmit(i + 1)}
                  disabled={i + 1 > maxScore}
                  className={`flex-1 bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600 ${
                    i + 1 > maxScore ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {i + 1}
              </button>
              );
            })}
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max="10"
              placeholder=""
              value={customScore}
              onChange={(e) => setCustomScore(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded text-black"
            />
            <button
              onClick={() => {
                const score = parseInt(customScore, 10);
                if (score >= 1 && score <= 10) {
                  handleScoreSubmit(score);
                  setCustomScore(generateRandomScore().toString()); // Reset to a new random score
                }
              }}
              className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Scoreboard Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-black">Scoreboard</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border border-gray-300 text-black">User</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="p-2 border border-gray-300 text-black">
                  Frame {i + 1}
                </th>
              ))}
              <th className="p-2 border border-gray-300 text-black">Total</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, userIndex) => (
              <tr key={userIndex} className="hover:bg-gray-50">
                <td className="p-2 border border-gray-300 text-black">{user}</td>
                {scores[userIndex]?.map((frame, frameIndex) => (
                  <td key={frameIndex} className="p-2 border border-gray-300">
                    <div className="flex justify-between text-black">
                      {getFrameDisplay(frame, frameIndex).map((value, index) => (
                        <span key={index}>{value}</span>
                      ))}
                    </div>
                  </td>
                ))}
                <td className="p-2 border border-gray-300 font-semibold text-black">
                  {calculateTotal(userIndex)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}